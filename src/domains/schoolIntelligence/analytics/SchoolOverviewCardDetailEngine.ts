import {
  aggregateLearningLectureMetrics,
  calculateLearningLectureMetrics,
  calculateLearningDoubtRate,
  countResolvedDoubts,
  isAbsentFeedback,
  isDoubtResolved,
  latestFeedbackByStudent,
} from "../../learningAnalytics/canonical/LearningAnalyticsCanonicalService";
import type { SchoolOverviewCardDetailRawData } from "../repository/SchoolOverviewCardDetailRepository";
import type {
  SchoolOverviewAssignmentUnderstandingDetail,
  SchoolOverviewCardDetailSnapshot,
  SchoolOverviewDoubtDetailRow,
  SchoolOverviewResponseSubjectGroup,
  SchoolOverviewStudentContribution,
  SchoolOverviewTopicDayGroup,
  SchoolOverviewTeacherDetailRow,
} from "../types/SchoolOverviewCardDetailModels";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

function clean(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function same(a: unknown, b: unknown) {
  return clean(a).toLowerCase() === clean(b).toLowerCase();
}

function dayName(date: string) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
  }).format(parsed);
}

function addDays(date: string, amount: number) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  value.setUTCDate(value.getUTCDate() + amount);
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
}

function weekday(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function governmentHolidayDates(startDate: string, endDate: string) {
  const fixed: Array<[number, number, string]> = [
    [1, 26, "Republic Day"],
    [5, 1, "Buddha Purnima / May Day reference"],
    [8, 15, "Independence Day"],
    [10, 2, "Mahatma Gandhi Jayanti"],
    [12, 25, "Christmas Day"],
  ];
  const byYear: Record<number, Array<[number, number, string]>> = {
    2026: [
      [3, 4, "Holi"], [3, 21, "Id-ul-Fitr"], [3, 26, "Ram Navami"],
      [3, 31, "Mahavir Jayanti"], [4, 3, "Good Friday"], [5, 27, "Id-ul-Zuha (Bakrid)"],
      [6, 26, "Muharram"], [8, 26, "Milad-un-Nabi / Id-e-Milad"], [9, 4, "Janmashtami"],
      [10, 20, "Dussehra"], [11, 8, "Diwali"], [11, 24, "Guru Nanak's Birthday"],
    ],
    2027: [
      [3, 6, "Maha Shivratri"], [3, 10, "Id-ul-Fitr"], [3, 22, "Holi"], [3, 26, "Good Friday"],
      [4, 15, "Ram Navami"], [5, 17, "Id-ul-Zuha (Bakrid)"], [6, 16, "Muharram"],
      [8, 25, "Janmashtami"], [10, 9, "Dussehra"], [10, 29, "Diwali"],
      [11, 24, "Guru Tegh Bahadur's Martyrdom Day"],
    ],
  };

  const years = new Set<number>();
  for (let cursor = startDate; cursor <= endDate; cursor = addDays(cursor, 1)) {
    years.add(Number(cursor.slice(0, 4)));
  }

  const dates = new Set<string>();
  for (const year of years) {
    for (const [month, day] of fixed.concat(byYear[year] ?? [])) {
      const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      if (date >= startDate && date <= endDate) dates.add(date);
    }
  }
  return dates;
}

function workingDays(raw: SchoolOverviewCardDetailRawData, startDate: string, endDate: string) {
  const government = governmentHolidayDates(startDate, endDate);
  const school = new Set(raw.schoolHolidays.map(row => row.date));
  const days: string[] = [];
  for (let cursor = startDate; cursor <= endDate; cursor = addDays(cursor, 1)) {
    if (weekday(cursor) === 0 || government.has(cursor) || school.has(cursor)) continue;
    days.push(cursor);
  }
  return days;
}

function rosterForAssignment(raw: SchoolOverviewCardDetailRawData, assignment: any) {
  const ids = new Set<string>();
  for (const student of raw.students) {
    if (!same(student.class_name, assignment.class_name) || !same(student.section_name, assignment.section_name)) continue;
    const studentUuid = String(student.student_uuid ?? "").trim();
    if (studentUuid) ids.add(studentUuid);
  }
  return Array.from(ids);
}

function studentNameMap(raw: SchoolOverviewCardDetailRawData) {
  return new Map(
    raw.students.map(student => [
      String(student.student_uuid ?? "").trim(),
      clean(student.student_name, "Student"),
    ]),
  );
}

function effectiveFeedbackForLog(raw: SchoolOverviewCardDetailRawData, logId: string) {
  return latestFeedbackByStudent(
    raw.feedback
      .filter(row => String(row.daily_log_uuid ?? "") === logId)
      .map(row => ({ ...row, effective_understanding_level: effectiveUnderstanding(raw, row) })),
  );
}

function normalizeConcept(value: unknown) {
  return clean(value).toLowerCase().replace(/\s+/g, " ");
}

function effectiveUnderstanding(raw: SchoolOverviewCardDetailRawData, feedback: any) {
  const original = feedback?.understanding_level;
  if (feedback?._live_reconciled === true) return original;
  if (original !== PARTIAL && original !== NONE) return original;
  const concepts = Array.isArray(feedback?.concepts_not_understood)
    ? feedback.concepts_not_understood.filter(Boolean)
    : [];
  if (!concepts.length) return original;

  const matches = raw.doubts.filter((doubt: any) =>
    String(doubt.daily_log_uuid ?? "") === String(feedback.daily_log_uuid ?? "") &&
    String(doubt.student_uuid ?? "") === String(feedback.student_uuid ?? "") &&
    concepts.some((concept: string) =>
      normalizeConcept(doubt.previous_difficult_concept ?? doubt.doubt_concept ?? doubt.previous_topic_name) === normalizeConcept(concept),
    ),
  );
  if (!matches.length) return original;

  const unresolved = concepts.filter((concept: string) =>
    !matches.some((doubt: any) =>
      normalizeConcept(doubt.previous_difficult_concept ?? doubt.doubt_concept ?? doubt.previous_topic_name) === normalizeConcept(concept) &&
      !isDoubtResolved(doubt),
    ),
  );
  return unresolved.length === 0 ? COMPLETE : original;
}

function assignmentMetrics(
  raw: SchoolOverviewCardDetailRawData,
  assignment: any,
) {
  const studentUuids = rosterForAssignment(raw, assignment);
  const logs = raw.logs.filter(
    log => String(log.teacher_assignment_uuid ?? "") === String(assignment.id ?? ""),
  );
  const metrics = logs.map(log =>
    calculateLearningLectureMetrics({
      studentUuids,
      feedback: raw.feedback.filter(row => String(row.daily_log_uuid ?? "") === String(log.id ?? "")),
      getUnderstandingLevel: (row: any) => row?.effective_understanding_level ?? effectiveUnderstanding(raw, row),
    }),
  );
  return { logs, metrics, aggregate: aggregateLearningLectureMetrics(metrics) };
}

function buildStudentContributions(
  raw: SchoolOverviewCardDetailRawData,
  assignment: any,
  logs: any[],
): SchoolOverviewStudentContribution[] {
  const names = studentNameMap(raw);
  const byStudent = new Map<string, SchoolOverviewStudentContribution>();
  const roster = rosterForAssignment(raw, assignment);

  for (const studentUuid of roster) {
    byStudent.set(studentUuid, {
      studentUuid,
      studentName: names.get(studentUuid) ?? "Student",
      eligibleObservations: 0,
      responseObservations: 0,
      completeObservations: 0,
      partialObservations: 0,
      didntUnderstandObservations: 0,
      fullUnderstandingRate: 0,
      healthContributionRate: 0,
    });
  }

  for (const log of logs) {
    const rows = effectiveFeedbackForLog(raw, String(log.id ?? ""));
    const byId = new Map(rows.map(row => [clean(row.student_uuid), row]));

    for (const studentUuid of roster) {
      const current = byStudent.get(studentUuid)!;
      const row = byId.get(studentUuid);
      const level = clean(row?.effective_understanding_level ?? row?.understanding_level);
      if (isAbsentFeedback(level)) continue;

      // Canonical denominator: every roster student contributes one eligible
      // observation unless that student explicitly marked the lecture absent.
      current.eligibleObservations += 1;
      if (level === COMPLETE) {
        current.responseObservations += 1;
        current.completeObservations += 1;
      } else if (level === PARTIAL) {
        current.responseObservations += 1;
        current.partialObservations += 1;
      } else if (level === NONE) {
        current.responseObservations += 1;
        current.didntUnderstandObservations += 1;
      }
    }
  }

  return Array.from(byStudent.values())
    .map(row => ({
      ...row,
      fullUnderstandingRate: row.eligibleObservations === 0
        ? 0
        : Math.round((row.completeObservations / row.eligibleObservations) * 100),
      healthContributionRate: row.eligibleObservations === 0
        ? 0
        : Math.round(((row.completeObservations + row.partialObservations * 0.5) / row.eligibleObservations) * 100),
    }))
    .sort((a, b) => a.studentName.localeCompare(b.studentName));
}

function buildUnderstanding(raw: SchoolOverviewCardDetailRawData) {
  const activeAssignments = raw.assignments.filter(a => a.is_active !== false);
  const assignmentDetails: SchoolOverviewAssignmentUnderstandingDetail[] = activeAssignments
    .map(assignment => {
      const { logs, aggregate } = assignmentMetrics(raw, assignment);
      return {
        assignmentUuid: String(assignment.id ?? ""),
        className: clean(assignment.class_name),
        sectionName: clean(assignment.section_name),
        subjectName: clean(assignment.subject_name, "Subject"),
        teacherName: clean(raw.teachers.find(t => String(t.teacher_uuid) === String(assignment.teacher_uuid))?.full_name, "Teacher"),
        logsCount: logs.length,
        eligibleStudentObservations: aggregate.eligibleStudentObservations,
        completeStudentObservations: aggregate.completeStudentObservations,
        partialStudentObservations: aggregate.partialStudentObservations,
        didntUnderstandStudentObservations: aggregate.didntUnderstandStudentObservations,
        understandingRate: aggregate.understandingRate,
        healthPercentage: aggregate.classHealthPercentage,
        students: buildStudentContributions(raw, assignment, logs),
      };
    });

  const lectureMetrics = activeAssignments.flatMap(assignment => assignmentMetrics(raw, assignment).metrics);
  const aggregate = aggregateLearningLectureMetrics(lectureMetrics);

  return {
    cardValue: aggregate.understandingRate,
    eligibleStudentObservations: aggregate.eligibleStudentObservations,
    completeStudentObservations: aggregate.completeStudentObservations,
    partialStudentObservations: aggregate.partialStudentObservations,
    didntUnderstandStudentObservations: aggregate.didntUnderstandStudentObservations,
    assignments: assignmentDetails,
  };
}

function doubtRows(raw: SchoolOverviewCardDetailRawData): SchoolOverviewDoubtDetailRow[] {
  const names = studentNameMap(raw);
  const teacherMap = new Map(raw.teachers.map(t => [String(t.teacher_uuid), clean(t.full_name, "Teacher")]));
  const assignmentMap = new Map(raw.assignments.map(a => [String(a.id), a]));

  return raw.doubts.map((row: any) => {
    const assignment = assignmentMap.get(String(row.teacher_assignment_uuid ?? ""));
    const resolved = isDoubtResolved(row);
    return {
      id: clean(row.id, `${row.student_uuid ?? "student"}-${row.log_date ?? "date"}`),
      studentUuid: clean(row.student_uuid),
      studentName: names.get(clean(row.student_uuid)) ?? clean(row.student_name, "Student"),
      teacherName: teacherMap.get(String(assignment?.teacher_uuid ?? row.teacher_uuid ?? "")) ?? "Teacher",
      className: clean(assignment?.class_name ?? row.class_name, "—"),
      sectionName: clean(assignment?.section_name ?? row.section_name, "—"),
      subjectName: clean(assignment?.subject_name ?? row.subject_name, "—"),
      topic: clean(row.previous_topic_name ?? row.topic_name ?? row.previous_difficult_concept, "Topic not recorded"),
      subtopic: clean(row.previous_difficult_concept ?? row.doubt_concept, "Subtopic not recorded"),
      raisedDate: clean(row.log_date ?? row.created_at, "Date not recorded"),
      status: resolved ? "Resolved" : "Unresolved",
      studentResponse: clean(row.student_response, "No response recorded"),
      resolved,
    };
  }).sort((a, b) => `${a.raisedDate}|${a.className}|${a.subjectName}|${a.studentName}`.localeCompare(`${b.raisedDate}|${b.className}|${b.subjectName}|${b.studentName}`));
}

function buildResponses(raw: SchoolOverviewCardDetailRawData) {
  const names = studentNameMap(raw);
  const assignmentMap = new Map(raw.assignments.map(a => [String(a.id), a]));
  const teacherMap = new Map(raw.teachers.map(t => [String(t.teacher_uuid), clean(t.full_name, "Teacher")]));
  const days = new Map<string, Map<string, SchoolOverviewResponseSubjectGroup>>();

  for (const log of raw.logs) {
    const date = clean(log.log_date);
    if (!date) continue;
    const assignment = assignmentMap.get(String(log.teacher_assignment_uuid ?? ""));
    if (!assignment) continue;
    const rows = effectiveFeedbackForLog(raw, String(log.id ?? ""));
    const assignmentRoster = new Set(rosterForAssignment(raw, assignment));
    for (const row of rows) {
      const studentUuid = clean(row.student_uuid);
      if (!studentUuid || !assignmentRoster.has(studentUuid)) continue;
      const level = clean(row.effective_understanding_level ?? row.understanding_level);
      if (level !== COMPLETE && level !== PARTIAL && level !== NONE) continue;
      const groupKey = `${assignment.class_name}|${assignment.section_name}|${assignment.subject_name}|${assignment.id}`;
      const byGroup = days.get(date) ?? new Map<string, SchoolOverviewResponseSubjectGroup>();
      const group = byGroup.get(groupKey) ?? {
        assignmentUuid: String(assignment.id ?? ""),
        className: clean(assignment.class_name),
        sectionName: clean(assignment.section_name),
        subjectName: clean(assignment.subject_name, "Subject"),
        teacherNames: [teacherMap.get(String(assignment.teacher_uuid)) ?? "Teacher"],
        students: [],
      };
      group.students.push({
        studentUuid: clean(row.student_uuid),
        studentName: names.get(clean(row.student_uuid)) ?? "Student",
        response: level === COMPLETE ? "Completely understood" : level === PARTIAL ? "Partially understood" : "Didn't understand",
      });
      byGroup.set(groupKey, group);
      days.set(date, byGroup);
    }
  }

  const dayGroups = Array.from(days.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, groups]) => ({
    date,
    day: dayName(date),
    groups: Array.from(groups.values()).sort((a, b) => `${a.className}|${a.sectionName}|${a.subjectName}`.localeCompare(`${b.className}|${b.sectionName}|${b.subjectName}`)),
  }));

  const activeAssignments = raw.assignments.filter(a => a.is_active !== false);
  const lectureMetrics = activeAssignments.flatMap(assignment => assignmentMetrics(raw, assignment).metrics);
  const aggregate = aggregateLearningLectureMetrics(lectureMetrics);
  return {
    cardValue: aggregate.responseStudentObservations + aggregate.absentStudentObservations,
    submittedLearningResponses: aggregate.responseStudentObservations,
    absentFeedbackObservations: aggregate.absentStudentObservations,
    days: dayGroups,
  };
}

function buildTopics(raw: SchoolOverviewCardDetailRawData): SchoolOverviewTopicDayGroup[] {
  const assignmentMap = new Map(raw.assignments.map(a => [String(a.id), a]));
  const teacherMap = new Map(raw.teachers.map(t => [String(t.teacher_uuid), clean(t.full_name, "Teacher")]));
  const days = new Map<string, Map<string, SchoolOverviewTopicDayGroup["groups"][number]>>();

  for (const log of raw.logs) {
    const date = clean(log.log_date);
    const assignment = assignmentMap.get(String(log.teacher_assignment_uuid ?? ""));
    if (!date || !assignment) continue;
    const groupKey = `${assignment.class_name}|${assignment.section_name}|${assignment.subject_name}|${assignment.id}`;
    const byGroup = days.get(date) ?? new Map();
    const group = byGroup.get(groupKey) ?? {
      assignmentUuid: String(assignment.id ?? ""),
      className: clean(assignment.class_name),
      sectionName: clean(assignment.section_name),
      subjectName: clean(assignment.subject_name, "Subject"),
      teacherName: teacherMap.get(String(assignment.teacher_uuid)) ?? "Teacher",
      logs: [],
    };
    group.logs.push({
      logId: clean(log.id),
      teacherName: group.teacherName,
      className: group.className,
      sectionName: group.sectionName,
      subjectName: group.subjectName,
      topic: clean(log.topic_name, "Topic not recorded"),
      subtopics: Array.isArray(log.concepts_covered)
        ? log.concepts_covered.map((value: unknown) => clean(value)).filter(Boolean)
        : [],
    });
    byGroup.set(groupKey, group);
    days.set(date, byGroup);
  }

  const dayGroups = Array.from(days.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, groups]) => ({
    date,
    day: dayName(date),
    groups: Array.from(groups.values()).sort((a, b) => `${a.className}|${a.sectionName}|${a.subjectName}`.localeCompare(`${b.className}|${b.sectionName}|${b.subjectName}`)),
  }));

  return dayGroups;
}

function buildTeachers(raw: SchoolOverviewCardDetailRawData, startDate: string, endDate: string): SchoolOverviewTeacherDetailRow[] {
  const activeAssignments = raw.assignments.filter(a => a.is_active !== false);
  const days = workingDays(raw, startDate, endDate);
  const byTeacher = new Map<string, SchoolOverviewTeacherDetailRow>();

  for (const teacher of raw.teachers.filter(t => t.is_active !== false)) {
    const teacherUuid = String(teacher.teacher_uuid ?? "");
    const assignments = activeAssignments.filter(a => String(a.teacher_uuid) === teacherUuid);
    const assignmentIds = new Set(assignments.map(a => String(a.id)));
    const submitted = new Set(
      raw.logs
        .filter(log => assignmentIds.has(String(log.teacher_assignment_uuid ?? "")))
        .map(log => `${log.teacher_assignment_uuid}|${clean(log.log_date)}`),
    ).size;

    const lectureMetrics = raw.logs
      .filter(log => assignmentIds.has(String(log.teacher_assignment_uuid ?? "")))
      .map(log => {
        const assignment = assignments.find(a => String(a.id) === String(log.teacher_assignment_uuid));
        return calculateLearningLectureMetrics({
          studentUuids: assignment ? rosterForAssignment(raw, assignment) : [],
          feedback: raw.feedback.filter(row => String(row.daily_log_uuid ?? "") === String(log.id ?? "")),
          getUnderstandingLevel: (row: any) => row?.effective_understanding_level ?? effectiveUnderstanding(raw, row),
        });
      });
    const aggregate = aggregateLearningLectureMetrics(lectureMetrics);

    byTeacher.set(teacherUuid, {
      teacherUuid,
      teacherName: clean(teacher.full_name, "Teacher"),
      assignments: assignments.map(a => ({
        assignmentUuid: String(a.id ?? ""),
        className: clean(a.class_name),
        sectionName: clean(a.section_name),
        subjectName: clean(a.subject_name, "Subject"),
      })).sort((a, b) => `${a.className}|${a.sectionName}|${a.subjectName}`.localeCompare(`${b.className}|${b.sectionName}|${b.subjectName}`)),
      expectedLogs: assignments.length * days.length,
      submittedLogs: submitted,
      missedLogs: Math.max(0, assignments.length * days.length - submitted),
      classHealthPercentage: aggregate.lectureCount === 0 ? null : aggregate.classHealthPercentage,
      rank: null,
    });
  }

  const ranked = Array.from(byTeacher.values())
    .filter(row => row.classHealthPercentage !== null)
    .sort((a, b) => (b.classHealthPercentage! - a.classHealthPercentage!) || a.teacherName.localeCompare(b.teacherName));
  ranked.forEach((row, index) => {
    row.rank = index + 1;
  });
  return Array.from(byTeacher.values()).sort((a, b) => a.teacherName.localeCompare(b.teacherName));
}

function buildClasses(raw: SchoolOverviewCardDetailRawData) {
  const keys = new Map<string, { className: string; sectionName: string }>();
  for (const log of raw.logs) {
    const assignment = raw.assignments.find(a => String(a.id) === String(log.teacher_assignment_uuid));
    if (!assignment) continue;
    const key = `${clean(assignment.class_name)}|${clean(assignment.section_name)}`;
    keys.set(key, { className: clean(assignment.class_name), sectionName: clean(assignment.section_name) });
  }
  return Array.from(keys.values()).sort((a, b) => `${a.className}|${a.sectionName}`.localeCompare(`${b.className}|${b.sectionName}`));
}

function buildStudents(raw: SchoolOverviewCardDetailRawData) {
  const groups = new Map<string, { className: string; sectionName: string; students: Array<{ studentUuid: string; studentName: string }> }>();
  for (const student of raw.students) {
    const className = clean(student.class_name, "—");
    const sectionName = clean(student.section_name, "—");
    const key = `${className}|${sectionName}`;
    const group = groups.get(key) ?? { className, sectionName, students: [] };
    group.students.push({
      studentUuid: clean(student.student_uuid),
      studentName: clean(student.student_name, "Student"),
    });
    groups.set(key, group);
  }
  return Array.from(groups.values())
    .map(group => ({ ...group, students: group.students.sort((a, b) => a.studentName.localeCompare(b.studentName)) }))
    .sort((a, b) => `${a.className}|${a.sectionName}`.localeCompare(`${b.className}|${b.sectionName}`));
}

export function buildSchoolOverviewCardDetail(
  raw: SchoolOverviewCardDetailRawData,
  startDate: string,
  endDate: string,
): SchoolOverviewCardDetailSnapshot {
  const understanding = buildUnderstanding(raw);
  const allDoubts = doubtRows(raw);
  return {
    period: { startDate, endDate },
    understanding,
    activeDoubts: allDoubts.filter(row => !row.resolved),
    doubtClosure: allDoubts,
    responses: buildResponses(raw),
    topicsTaught: buildTopics(raw),
    activeTeachers: buildTeachers(raw, startDate, endDate),
    classesReporting: buildClasses(raw),
    students: buildStudents(raw),
    doubtsLoadFailed: raw.doubtsLoadFailed,
  };
}
