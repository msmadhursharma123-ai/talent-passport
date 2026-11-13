import {
  isDoubtResolved,
  aggregateLearningLectureMetrics,
  calculateLearningLectureMetrics,
  calculateDoubtClosureRate,
  calculateLearningDoubtRate,
  countResolvedDoubts,
  calculateUnweightedAveragePercentage,
  latestFeedbackByStudent,
  isAbsentFeedback,
} from "../../learningAnalytics/canonical/LearningAnalyticsCanonicalService";
import type {
  SchoolMorningBrief,
  SchoolMorningBriefClassroomMetric,
  SchoolMorningBriefTeacherDailyMetric,
  SchoolMorningBriefAssignmentDetail,
  SchoolMorningBriefClassroomDetail,
  SchoolMorningBriefStudentStatusDetail,
  SchoolMorningBriefDoubtDetail,
  SchoolMorningBriefWeeklyDayDetail,
} from "../types/SchoolMorningBriefModels";
import type { SchoolMorningBriefRawData } from "../repository/SchoolMorningBriefRepository";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

const same = (a: unknown, b: unknown) =>
  String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();

function dateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value ?? 0),
    month: Number(parts.find((part) => part.type === "month")?.value ?? 0),
    day: Number(parts.find((part) => part.type === "day")?.value ?? 0),
    weekday: parts.find((part) => part.type === "weekday")?.value ?? "",
  };
}

function indiaDateKey(date: Date) {
  const parts = dateParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function calendarDateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(key: string, amount: number) {
  const date = calendarDateFromKey(key);
  date.setUTCDate(date.getUTCDate() + amount);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function weekdayNumber(key: string) {
  return calendarDateFromKey(key).getUTCDay();
}

function displayDay(key: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
  }).format(calendarDateFromKey(key));
}

function displayDate(key: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(calendarDateFromKey(key));
}

export function getMorningBriefPeriod(todayKey: string) {
  const yesterday = addDays(todayKey, -1);
  const day = weekdayNumber(todayKey);

  // Monday: there is no completed current-week window yet, so use the
  // immediately preceding Monday-Sunday week. Tuesday-Sunday: use the
  // current Monday through yesterday.
  if (day === 1) {
    const previousMonday = addDays(todayKey, -7);
    const previousSunday = addDays(todayKey, -1);
    return {
      yesterday,
      start: previousMonday,
      end: previousSunday,
      label: `${displayDate(previousMonday)} – ${displayDate(previousSunday)}`,
    };
  }

  const mondayOffset = day === 0 ? -6 : -(day - 1);
  const currentMonday = addDays(todayKey, mondayOffset);
  return {
    yesterday,
    start: currentMonday,
    end: yesterday,
    label: `${displayDate(currentMonday)} – ${displayDate(yesterday)}`,
  };
}


function normalizeConcept(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function effectiveUnderstanding(feedback: any, doubts: any[]) {
  const original = String(feedback?.understanding_level ?? "").trim();
  if (feedback?._live_reconciled === true) return original;
  if (original !== PARTIAL && original !== NONE) return original;
  const concepts = Array.isArray(feedback?.concepts_not_understood) ? feedback.concepts_not_understood.filter(Boolean) : [];
  if (!concepts.length) return original;
  const matches = doubts.filter((doubt) =>
    String(doubt.daily_log_uuid ?? "") === String(feedback.daily_log_uuid ?? "") &&
    String(doubt.student_uuid ?? "") === String(feedback.student_uuid ?? "") &&
    concepts.some((concept: string) => normalizeConcept(doubt.previous_difficult_concept ?? doubt.doubt_concept ?? doubt.previous_topic_name) === normalizeConcept(concept))
  );
  if (!matches.length) return original;
  const unresolved = concepts.filter((concept: string) =>
    !matches.some((doubt: any) =>
      normalizeConcept(doubt.previous_difficult_concept ?? doubt.doubt_concept ?? doubt.previous_topic_name) === normalizeConcept(concept) &&
      !isDoubtResolved(doubt)
    )
  );
  return unresolved.length === 0 ? COMPLETE : original;
}

function rosterForAssignment(raw: SchoolMorningBriefRawData, assignment: any): string[] {
  return raw.students
    .filter(
      (student: any) =>
        same(student.class_name, assignment?.class_name) &&
        same(student.section_name, assignment?.section_name),
    )
    .map((student: any) => student.student_uuid)
    .filter(Boolean);
}


function studentNameMap(raw: SchoolMorningBriefRawData) {
  return new Map<string, string>(
    raw.students
      .map((student: any) => [
        String(student.student_uuid ?? "").trim(),
        String(student.student_name ?? "").trim(),
      ] as [string, string])
      .filter(([uuid, name]) => Boolean(uuid && name)),
  );
}

function teacherNameMap(raw: SchoolMorningBriefRawData) {
  return new Map<string, string>(
    raw.teachers
      .map((teacher: any) => [
        String(teacher.teacher_uuid ?? "").trim(),
        String(teacher.full_name ?? "").trim(),
      ] as [string, string])
      .filter(([uuid]) => Boolean(uuid)),
  );
}

function studentDetailsSorted(
  rows: Map<string, SchoolMorningBriefStudentStatusDetail>,
) {
  return Array.from(rows.values()).sort((a, b) =>
    a.studentName.localeCompare(b.studentName) || a.studentUuid.localeCompare(b.studentUuid),
  );
}

function collectStudentStatusDetails(
  raw: SchoolMorningBriefRawData,
  logs: any[],
  assignment: any,
  doubts: any[],
): {
  completeStudents: SchoolMorningBriefStudentStatusDetail[];
  partialStudents: SchoolMorningBriefStudentStatusDetail[];
  didntUnderstandStudents: SchoolMorningBriefStudentStatusDetail[];
  responseStudents: SchoolMorningBriefStudentStatusDetail[];
  absentStudents: SchoolMorningBriefStudentStatusDetail[];
  noResponseStudents: SchoolMorningBriefStudentStatusDetail[];
} {
  const roster = rosterForAssignment(raw, assignment);
  const rosterSet = new Set(roster);
  const names = studentNameMap(raw);
  const buckets: Record<string, Map<string, SchoolMorningBriefStudentStatusDetail>> = {
    complete: new Map(),
    partial: new Map(),
    didntUnderstand: new Map(),
    response: new Map(),
    absent: new Map(),
    noResponse: new Map(),
  };

  const add = (bucket: Map<string, SchoolMorningBriefStudentStatusDetail>, studentUuid: string) => {
    const studentName = names.get(studentUuid) || "Student";
    const current = bucket.get(studentUuid);
    bucket.set(studentUuid, {
      studentUuid,
      studentName,
      observationCount: (current?.observationCount ?? 0) + 1,
    });
  };

  for (const log of logs) {
    const feedbackForLog = raw.feedback.filter(
      (row: any) => String(row.daily_log_uuid ?? "") === String(log.id ?? ""),
    );
    const latest = latestFeedbackByStudent(feedbackForLog).filter((row: any) =>
      rosterSet.has(String(row.student_uuid ?? "").trim()),
    );
    const latestByStudent = new Map(
      latest.map((row: any) => [String(row.student_uuid ?? "").trim(), row]),
    );

    for (const studentUuid of roster) {
      const row = latestByStudent.get(studentUuid);
      const level = effectiveUnderstanding(row, doubts);

      if (!row || !level) {
        add(buckets.noResponse, studentUuid);
        continue;
      }
      if (isAbsentFeedback(level)) {
        add(buckets.absent, studentUuid);
        continue;
      }
      if (level === COMPLETE) {
        add(buckets.complete, studentUuid);
        add(buckets.response, studentUuid);
        continue;
      }
      if (level === PARTIAL) {
        add(buckets.partial, studentUuid);
        add(buckets.response, studentUuid);
        continue;
      }
      if (level === NONE) {
        add(buckets.didntUnderstand, studentUuid);
        add(buckets.response, studentUuid);
        continue;
      }
      add(buckets.noResponse, studentUuid);
    }
  }

  return {
    completeStudents: studentDetailsSorted(buckets.complete),
    partialStudents: studentDetailsSorted(buckets.partial),
    didntUnderstandStudents: studentDetailsSorted(buckets.didntUnderstand),
    responseStudents: studentDetailsSorted(buckets.response),
    absentStudents: studentDetailsSorted(buckets.absent),
    noResponseStudents: studentDetailsSorted(buckets.noResponse),
  };
}

function doubtDetailsForRows(
  raw: SchoolMorningBriefRawData,
  rows: any[],
  assignmentById: Map<string, any>,
): SchoolMorningBriefDoubtDetail[] {
  const names = studentNameMap(raw);
  const teachers = teacherNameMap(raw);

  return (rows ?? []).map((row: any) => {
    const assignment = assignmentById.get(String(row.teacher_assignment_uuid ?? ""));
    const studentUuid = String(row.student_uuid ?? "").trim();
    const assignmentTeacher = String(assignment?.teacher_uuid ?? "").trim();
    const isLiveOnly = row?._live_only === true;
    const isLiveReconciled = !isLiveOnly && (
      String(row?.status ?? "").trim().toUpperCase() === "RESOLVED" ||
      String(row?.status ?? "").trim().toUpperCase() === "NOT DISCUSSED"
    ) && Boolean(row?.revision_checked_at);

    return {
      id: String(row.id ?? `${studentUuid}-${row.teacher_assignment_uuid ?? ""}-${row.log_date ?? ""}`),
      studentUuid,
      studentName: names.get(studentUuid) || String(row.student_name ?? "").trim() || "Student",
      teacherName: teachers.get(assignmentTeacher) || "Teacher unavailable",
      topic: String(row.previous_topic_name ?? row.topic_name ?? "").trim() || "Topic not recorded",
      doubt: String(row.previous_difficult_concept ?? row.doubt_concept ?? "").trim() || "Doubt concept not recorded",
      date: String(row.log_date ?? row.created_at ?? "").slice(0, 10) || "—",
      resolved: isDoubtResolved(row),
      source: (isLiveOnly ? "Live" : (isLiveReconciled ? "Live reconciled" : "Loop 2")) as SchoolMorningBriefDoubtDetail["source"],
    };
  }).sort((a, b) =>
    a.date.localeCompare(b.date) ||
    a.studentName.localeCompare(b.studentName) ||
    a.doubt.localeCompare(b.doubt),
  );
}

function assignmentDetailForDay(
  raw: SchoolMorningBriefRawData,
  assignment: any,
  date: string,
): SchoolMorningBriefAssignmentDetail {
  const assignmentId = String(assignment.id ?? "").trim();
  const logs = raw.logs.filter((log: any) =>
    String(log.teacher_assignment_uuid ?? "") === assignmentId &&
    String(log.log_date ?? "") === date,
  );
  const logIds = new Set(logs.map((log: any) => String(log.id ?? "")));
  const feedback = raw.feedback.filter((row: any) => logIds.has(String(row.daily_log_uuid ?? "")));
  const doubts = raw.doubts.filter((row: any) =>
    String(row.teacher_assignment_uuid ?? "") === assignmentId &&
    String(row.log_date ?? "") === date,
  );
  const assignmentById = new Map([[assignmentId, assignment]]);
  const lectureMetrics = metricsForLogs(raw, logs, feedback, assignmentById, raw.doubts);
  const aggregate = aggregateLearningLectureMetrics(lectureMetrics);
  const studentDetails = collectStudentStatusDetails(raw, logs, assignment, raw.doubts);
  const teachers = teacherNameMap(raw);

  return {
    assignmentId,
    teacherName: teachers.get(String(assignment.teacher_uuid ?? "").trim()) || "Teacher unavailable",
    classroom: `Class ${assignment.class_name} · Section ${assignment.section_name} · ${assignment.subject_name}`,
    logsCount: logs.length,
    learningHealth: aggregate.classHealthPercentage,
    responseRate: aggregate.responseRate,
    understandingRate: aggregate.understandingRate,
    partialRate: aggregate.partialRate,
    didntUnderstandRate: aggregate.didntUnderstandRate,
    doubtRate: calculateLearningDoubtRate(
      aggregate.partialStudentObservations,
      aggregate.didntUnderstandStudentObservations,
      aggregate.eligibleStudentObservations,
    ),
    doubtClosureRate: calculateDoubtClosureRate(doubts),
    eligibleStudentObservations: aggregate.eligibleStudentObservations,
    ...studentDetails,
    doubtDetails: doubtDetailsForRows(raw, doubts, assignmentById),
  };
}

export function buildYesterdayClassroomDetails(
  raw: SchoolMorningBriefRawData,
  yesterday: string,
): SchoolMorningBriefClassroomDetail[] {
  const groups = new Map<string, { className: string; sectionName: string; subjectName: string; assignments: any[] }>();
  for (const assignment of raw.assignments) {
    const className = String(assignment.class_name ?? "").trim();
    const sectionName = String(assignment.section_name ?? "").trim();
    const subjectName = String(assignment.subject_name ?? "").trim();
    if (!className || !sectionName || !subjectName) continue;
    const key = `${className}|||${sectionName}|||${subjectName}`;
    const group = groups.get(key) ?? { className, sectionName, subjectName, assignments: [] };
    group.assignments.push(assignment);
    groups.set(key, group);
  }

  return Array.from(groups.entries()).map(([classroomKey, group]) => ({
    classroomKey,
    classroom: `Class ${group.className} · Section ${group.sectionName} · ${group.subjectName}`,
    className: group.className,
    sectionName: group.sectionName,
    subjectName: group.subjectName,
    assignmentDetails: group.assignments
      .map((assignment) => assignmentDetailForDay(raw, assignment, yesterday))
      .sort((a, b) => a.teacherName.localeCompare(b.teacherName) || a.assignmentId.localeCompare(b.assignmentId)),
  })).sort((a, b) =>
    a.className.localeCompare(b.className, undefined, { numeric: true }) ||
    a.sectionName.localeCompare(b.sectionName) ||
    a.subjectName.localeCompare(b.subjectName),
  );
}

export function buildWeeklyDailyDetails(
  raw: SchoolMorningBriefRawData,
  classroom: { assignmentIds: Set<string> },
  start: string,
  end: string,
  scopedDoubts: any[],
): SchoolMorningBriefWeeklyDayDetail[] {
  const assignmentById = new Map(
    raw.assignments.map((assignment: any) => [String(assignment.id ?? ""), assignment]),
  );
  const days: SchoolMorningBriefWeeklyDayDetail[] = [];
  let day = start;
  while (day <= end) {
    const logs = raw.logs.filter((log: any) =>
      classroom.assignmentIds.has(String(log.teacher_assignment_uuid ?? "")) &&
      String(log.log_date ?? "") === day,
    );
    const logIds = new Set(logs.map((log: any) => String(log.id ?? "")));
    const feedback = raw.feedback.filter((row: any) => logIds.has(String(row.daily_log_uuid ?? "")));
    const doubts = scopedDoubts.filter((row: any) =>
      String(row.log_date ?? "") === day,
    );
    const doubtDetails = doubtDetailsForRows(raw, doubts, assignmentById);
    const lectureMetrics = metricsForLogs(raw, logs, feedback, assignmentById, scopedDoubts);
    const aggregate = aggregateLearningLectureMetrics(lectureMetrics);
    // When a classroom has multiple assignments/teachers, the status detail
    // above must include all of their logs, not only the first assignment.
    const mergedStatuses = collectStudentStatusDetailsForAssignmentSet(raw, logs, classroom.assignmentIds, scopedDoubts);

    days.push({
      date: day,
      day: displayDay(day),
      logsCount: logs.length,
      feedbackRate: aggregate.responseRate,
      understandingRate: aggregate.understandingRate,
      doubtClosureRate: calculateDoubtClosureRate(doubts),
      feedbackStudents: mergedStatuses.responseStudents,
      understandingStudents: mergedStatuses.completeStudents,
      partialStudents: mergedStatuses.partialStudents,
      didntUnderstandStudents: mergedStatuses.didntUnderstandStudents,
      resolvedDoubtStudents: doubtStudentDetails(raw, doubts, true),
      unresolvedDoubtStudents: doubtStudentDetails(raw, doubts, false),
      doubtDetails,
    });

    day = addDays(day, 1);
  }
  return days;
}

function collectStudentStatusDetailsForAssignmentSet(
  raw: SchoolMorningBriefRawData,
  logs: any[],
  assignmentIds: Set<string>,
  doubts: any[],
) {
  const names = studentNameMap(raw);
  const buckets: Record<string, Map<string, SchoolMorningBriefStudentStatusDetail>> = {
    complete: new Map(), partial: new Map(), didntUnderstand: new Map(), response: new Map(),
  };
  const add = (bucket: Map<string, SchoolMorningBriefStudentStatusDetail>, studentUuid: string) => {
    const current = bucket.get(studentUuid);
    bucket.set(studentUuid, {
      studentUuid,
      studentName: names.get(studentUuid) || "Student",
      observationCount: (current?.observationCount ?? 0) + 1,
    });
  };

  for (const log of logs) {
    const assignment = raw.assignments.find((item: any) =>
      String(item.id ?? "") === String(log.teacher_assignment_uuid ?? "") &&
      assignmentIds.has(String(item.id ?? "")),
    );
    if (!assignment) continue;
    const roster = rosterForAssignment(raw, assignment);
    const rosterSet = new Set(roster);
    const latest = latestFeedbackByStudent(raw.feedback.filter((row: any) =>
      String(row.daily_log_uuid ?? "") === String(log.id ?? ""),
    )).filter((row: any) => rosterSet.has(String(row.student_uuid ?? "").trim()));
    for (const row of latest) {
      const studentUuid = String(row.student_uuid ?? "").trim();
      const level = effectiveUnderstanding(row, doubts);
      if (level === COMPLETE) { add(buckets.complete, studentUuid); add(buckets.response, studentUuid); }
      else if (level === PARTIAL) { add(buckets.partial, studentUuid); add(buckets.response, studentUuid); }
      else if (level === NONE) { add(buckets.didntUnderstand, studentUuid); add(buckets.response, studentUuid); }
    }
  }

  return {
    responseStudents: studentDetailsSorted(buckets.response),
    completeStudents: studentDetailsSorted(buckets.complete),
    partialStudents: studentDetailsSorted(buckets.partial),
    didntUnderstandStudents: studentDetailsSorted(buckets.didntUnderstand),
  };
}

function doubtStudentDetails(
  raw: SchoolMorningBriefRawData,
  doubts: any[],
  resolved: boolean,
): SchoolMorningBriefStudentStatusDetail[] {
  const names = studentNameMap(raw);
  const map = new Map<string, SchoolMorningBriefStudentStatusDetail>();
  for (const row of doubts.filter((item: any) => isDoubtResolved(item) === resolved)) {
    const studentUuid = String(row.student_uuid ?? "").trim();
    if (!studentUuid) continue;
    const current = map.get(studentUuid);
    map.set(studentUuid, {
      studentUuid,
      studentName: names.get(studentUuid) || String(row.student_name ?? "").trim() || "Student",
      observationCount: (current?.observationCount ?? 0) + 1,
    });
  }
  return studentDetailsSorted(map);
}

function metricsForLogs(
  raw: SchoolMorningBriefRawData,
  logs: any[],
  feedback: any[],
  assignmentById: Map<string, any>,
  doubts: any[],
) {
  return logs.map((log: any) => {
    const assignment = assignmentById.get(String(log.teacher_assignment_uuid ?? ""));
    const lectureFeedback = feedback.filter(
      (row: any) => String(row.daily_log_uuid ?? "") === String(log.id ?? ""),
    );
    return calculateLearningLectureMetrics({
      studentUuids: rosterForAssignment(raw, assignment),
      feedback: lectureFeedback,
      getUnderstandingLevel: (row: any) => effectiveUnderstanding(row, doubts),
    });
  });
}

function teacherDailyMetrics(raw: SchoolMorningBriefRawData, yesterday: string) {
  const metrics: SchoolMorningBriefTeacherDailyMetric[] = [];
  const assignmentById = new Map(
    raw.assignments.map((assignment: any) => [String(assignment.id ?? ""), assignment]),
  );

  for (const teacher of raw.teachers) {
    const teacherUuid = String(teacher.teacher_uuid ?? "");
    if (!teacherUuid) continue;

    const teacherAssignmentIds = new Set(
      raw.assignments
        .filter((assignment: any) => String(assignment.teacher_uuid ?? "") === teacherUuid)
        .map((assignment: any) => String(assignment.id ?? ""))
        .filter(Boolean),
    );

    const logs = raw.logs.filter(
      (log: any) => teacherAssignmentIds.has(String(log.teacher_assignment_uuid ?? "")) && String(log.log_date ?? "") === yesterday,
    );
    if (!logs.length) continue;

    const logIds = new Set(logs.map((log: any) => String(log.id ?? "")));
    const feedback = raw.feedback.filter((row: any) => logIds.has(String(row.daily_log_uuid ?? "")));
    const lectureMetrics = metricsForLogs(raw, logs, feedback, assignmentById, raw.doubts);
    const aggregate = aggregateLearningLectureMetrics(lectureMetrics);
    const teacherDoubts = raw.doubts.filter(
      (doubt: any) =>
        teacherAssignmentIds.has(String(doubt.teacher_assignment_uuid ?? "")) &&
        String(doubt.log_date ?? "") === yesterday,
    );
    const resolved = countResolvedDoubts(teacherDoubts);

    metrics.push({
      teacherUuid,
      teacherName: String(teacher.full_name ?? "Teacher"),
      understandingRate: aggregate.understandingRate,
      doubtClosureRate: calculateDoubtClosureRate(teacherDoubts),
      feedbackCount:
        aggregate.responseStudentObservations + aggregate.absentStudentObservations,
      doubtsAsked: teacherDoubts.length,
      doubtsResolved: resolved,
    });
  }

  return metrics.sort((a, b) => a.teacherName.localeCompare(b.teacherName));
}

function classroomMetrics(raw: SchoolMorningBriefRawData, start: string, end: string) {
  const groupMap = new Map<string, { className: string; sectionName: string; subjectName: string; assignmentIds: string[] }>();

  raw.assignments.forEach((assignment: any) => {
    const className = String(assignment.class_name ?? "").trim();
    const sectionName = String(assignment.section_name ?? "").trim();
    const subjectName = String(assignment.subject_name ?? "").trim();
    if (!className || !sectionName || !subjectName) return;
    const key = `${className}|||${sectionName}|||${subjectName}`;
    const current = groupMap.get(key) ?? { className, sectionName, subjectName, assignmentIds: [] };
    const id = String(assignment.id ?? "").trim();
    if (id && !current.assignmentIds.includes(id)) current.assignmentIds.push(id);
    groupMap.set(key, current);
  });

  const rows: SchoolMorningBriefClassroomMetric[] = [];
  const assignmentById = new Map(
    raw.assignments.map((assignment: any) => [String(assignment.id ?? ""), assignment]),
  );

  for (const [classroomKey, classroom] of groupMap) {
    const assignmentIds = new Set(classroom.assignmentIds);
    const logs = raw.logs.filter((log: any) =>
      assignmentIds.has(String(log.teacher_assignment_uuid ?? "")) &&
      String(log.log_date ?? "") >= start &&
      String(log.log_date ?? "") <= end,
    );
    const logIds = new Set(logs.map((log: any) => String(log.id ?? "")));
    const feedback = raw.feedback.filter((row: any) => logIds.has(String(row.daily_log_uuid ?? "")));
    const doubts = raw.doubts.filter((doubt: any) => assignmentIds.has(String(doubt.teacher_assignment_uuid ?? "")));

    if (!logs.length) continue;

    const lectureMetrics = metricsForLogs(raw, logs, feedback, assignmentById, doubts);
    const aggregate = aggregateLearningLectureMetrics(lectureMetrics);
    const resolved = countResolvedDoubts(doubts);
    const doubtClosureRate = calculateDoubtClosureRate(doubts);
    const combinedScore = Math.round(
      (aggregate.responseRate + aggregate.understandingRate + doubtClosureRate) / 3,
    );
    const teacherNames = Array.from(new Set(
      raw.assignments
        .filter((assignment: any) => assignmentIds.has(String(assignment.id ?? "")))
        .map((assignment: any) => raw.teachers.find((teacher: any) => String(teacher.teacher_uuid ?? "") === String(assignment.teacher_uuid ?? ""))?.full_name)
        .map((value: unknown) => String(value ?? "").trim())
        .filter(Boolean),
    )).sort((a, b) => a.localeCompare(b));

    rows.push({
      classroomKey,
      classroom: `Class ${classroom.className} · Section ${classroom.sectionName} · ${classroom.subjectName}`,
      className: classroom.className,
      sectionName: classroom.sectionName,
      subjectName: classroom.subjectName,
      teacherNames,
      responseRate: aggregate.responseRate,
      understandingRate: aggregate.understandingRate,
      doubtClosureRate,
      combinedScore,
      logsCount: logs.length,
      feedbackCount:
        aggregate.responseStudentObservations + aggregate.absentStudentObservations,
      doubtsAsked: doubts.length,
      doubtsResolved: resolved,
    });
  }

  return rows.sort((a, b) =>
    b.combinedScore - a.combinedScore ||
    a.className.localeCompare(b.className, undefined, { numeric: true }) ||
    a.sectionName.localeCompare(b.sectionName) ||
    a.subjectName.localeCompare(b.subjectName),
  );
}

function yesterdaySchoolLearningMetrics(raw: SchoolMorningBriefRawData, yesterday: string) {
  // Match School Overview's displayed classroom semantics: calculate the
  // canonical metrics per active assignment (Class + Section + Subject),
  // including assignments with no published lecture yesterday as 0%, then
  // take an unweighted average across those subject rows. This prevents a
  // missing Daily Log from disappearing from the school-level Morning Brief.
  const assignmentById = new Map(
    raw.assignments.map((assignment: any) => [String(assignment.id ?? ""), assignment]),
  );

  const assignmentMetrics = raw.assignments.map((assignment: any) => {
    const assignmentId = String(assignment.id ?? "").trim();
    const logs = raw.logs.filter(
      (log: any) =>
        String(log.teacher_assignment_uuid ?? "") === assignmentId &&
        String(log.log_date ?? "") === yesterday,
    );
    const logIds = new Set(logs.map((log: any) => String(log.id ?? "")));
    const feedback = raw.feedback.filter((row: any) =>
      logIds.has(String(row.daily_log_uuid ?? "")),
    );
    const doubts = raw.doubts.filter(
      (doubt: any) =>
        String(doubt.teacher_assignment_uuid ?? "") === assignmentId &&
        String(doubt.log_date ?? "") === yesterday,
    );

    const lectureMetrics = metricsForLogs(
      raw,
      logs,
      feedback,
      assignmentById,
      raw.doubts,
    );
    const aggregate = aggregateLearningLectureMetrics(lectureMetrics);

    return {
      learningHealth: aggregate.classHealthPercentage,
      understandingRate: aggregate.understandingRate,
      partialRate: aggregate.partialRate,
      didntUnderstandRate: aggregate.didntUnderstandRate,
      doubtRate: calculateLearningDoubtRate(
        aggregate.partialStudentObservations,
        aggregate.didntUnderstandStudentObservations,
        aggregate.eligibleStudentObservations,
      ),
      doubtClosureRate: calculateDoubtClosureRate(doubts),
    };
  });

  if (assignmentMetrics.length === 0) {
    return {
      learningHealth: null,
      understandingRate: null,
      partialRate: null,
      didntUnderstandRate: null,
      doubtRate: null,
      doubtClosureRate: null,
    };
  }

  return {
    learningHealth: calculateUnweightedAveragePercentage(
      assignmentMetrics.map((row) => row.learningHealth),
    ),
    understandingRate: calculateUnweightedAveragePercentage(
      assignmentMetrics.map((row) => row.understandingRate),
    ),
    partialRate: calculateUnweightedAveragePercentage(
      assignmentMetrics.map((row) => row.partialRate),
    ),
    didntUnderstandRate: calculateUnweightedAveragePercentage(
      assignmentMetrics.map((row) => row.didntUnderstandRate),
    ),
    doubtRate: calculateUnweightedAveragePercentage(
      assignmentMetrics.map((row) => row.doubtRate),
    ),
    doubtClosureRate: calculateUnweightedAveragePercentage(
      assignmentMetrics.map((row) => row.doubtClosureRate),
    ),
  };
}

function yesterdayDoubtClassMetrics(raw: SchoolMorningBriefRawData, yesterday: string) {
  const groups = new Map<string, { className: string; sectionName: string; subjectName: string; assignmentIds: Set<string> }>();
  raw.assignments.forEach((assignment: any) => {
    const className = String(assignment.class_name ?? "").trim();
    const sectionName = String(assignment.section_name ?? "").trim();
    const subjectName = String(assignment.subject_name ?? "").trim();
    const id = String(assignment.id ?? "").trim();
    if (!className || !sectionName || !subjectName || !id) return;
    const key = `${className}|||${sectionName}|||${subjectName}`;
    const current = groups.get(key) ?? { className, sectionName, subjectName, assignmentIds: new Set<string>() };
    current.assignmentIds.add(id);
    groups.set(key, current);
  });

  const assignmentById = new Map(
    raw.assignments.map((assignment: any) => [String(assignment.id ?? ""), assignment]),
  );
  const rows: import("../types/SchoolMorningBriefModels").SchoolMorningBriefDoubtClassMetric[] = [];

  for (const [key, group] of groups) {
    const assignmentIds = group.assignmentIds;
    const logs = raw.logs.filter((log: any) =>
      assignmentIds.has(String(log.teacher_assignment_uuid ?? "")) && String(log.log_date ?? "") === yesterday,
    );
    if (!logs.length) continue;
    const logIds = new Set(logs.map((log: any) => String(log.id ?? "")));
    const feedback = raw.feedback.filter((row: any) => logIds.has(String(row.daily_log_uuid ?? "")));
    const lectureMetrics = metricsForLogs(raw, logs, feedback, assignmentById, raw.doubts);
    const aggregate = aggregateLearningLectureMetrics(lectureMetrics);
    const teacherNames = Array.from(new Set(
      raw.assignments
        .filter((assignment: any) => assignmentIds.has(String(assignment.id ?? "")))
        .map((assignment: any) => raw.teachers.find((teacher: any) => String(teacher.teacher_uuid ?? "") === String(assignment.teacher_uuid ?? ""))?.full_name)
        .map((value: unknown) => String(value ?? "").trim())
        .filter(Boolean),
    )).sort((a, b) => a.localeCompare(b));
    const doubtSignals = aggregate.partialStudentObservations + aggregate.didntUnderstandStudentObservations;
    rows.push({
      key,
      className: group.className,
      sectionName: group.sectionName,
      subjectName: group.subjectName,
      classroom: `Class ${group.className} · Section ${group.sectionName} · ${group.subjectName}`,
      teacherNames,
      doubtRate: calculateLearningDoubtRate(
        aggregate.partialStudentObservations,
        aggregate.didntUnderstandStudentObservations,
        aggregate.eligibleStudentObservations,
      ),
      partialRate: aggregate.partialRate,
      didntUnderstandRate: aggregate.didntUnderstandRate,
      eligibleStudentObservations: aggregate.eligibleStudentObservations,
      doubtSignals,
      logsCount: logs.length,
    });
  }

  return rows.sort((a, b) =>
    b.doubtRate - a.doubtRate ||
    b.doubtSignals - a.doubtSignals ||
    a.className.localeCompare(b.className, undefined, { numeric: true }) ||
    a.sectionName.localeCompare(b.sectionName) ||
    a.subjectName.localeCompare(b.subjectName),
  ).slice(0, 3);
}

export function buildDoubtClassroomDetail(
  raw: SchoolMorningBriefRawData,
  row: { className: string; sectionName: string; subjectName: string },
  yesterday: string,
): {
  doubtDetails: SchoolMorningBriefDoubtDetail[];
  partialStudents: SchoolMorningBriefStudentStatusDetail[];
  didntUnderstandStudents: SchoolMorningBriefStudentStatusDetail[];
} {
  const assignmentIds = new Set(
    raw.assignments
      .filter((assignment: any) =>
        same(assignment.class_name, row.className) &&
        same(assignment.section_name, row.sectionName) &&
        same(assignment.subject_name, row.subjectName),
      )
      .map((assignment: any) => String(assignment.id ?? "").trim())
      .filter(Boolean),
  );
  const assignmentById = new Map(
    raw.assignments.map((assignment: any) => [String(assignment.id ?? ""), assignment]),
  );
  const logs = raw.logs.filter((log: any) =>
    assignmentIds.has(String(log.teacher_assignment_uuid ?? "")) &&
    String(log.log_date ?? "") === yesterday,
  );
  const details = collectStudentStatusDetailsForAssignmentSet(raw, logs, assignmentIds, raw.doubts);
  const doubts = raw.doubts.filter((doubt: any) =>
    assignmentIds.has(String(doubt.teacher_assignment_uuid ?? "")) &&
    String(doubt.log_date ?? "") === yesterday,
  );

  return {
    doubtDetails: doubtDetailsForRows(raw, doubts, assignmentById),
    partialStudents: details.partialStudents,
    didntUnderstandStudents: details.didntUnderstandStudents,
  };
}

function missingDailyLogs(raw: SchoolMorningBriefRawData, yesterday: string) {
  if (new Date(`${yesterday}T00:00:00Z`).getUTCDay() === 0 || raw.schoolHolidays.includes(yesterday)) return [];

  const activeTeachers = raw.teachers.filter((teacher: any) => teacher.is_active !== false);
  const rows: import("../types/SchoolMorningBriefModels").SchoolMorningBriefMissingDailyLog[] = [];

  for (const teacher of activeTeachers) {
    const teacherUuid = String(teacher.teacher_uuid ?? "").trim();
    if (!teacherUuid) continue;
    const assignments = raw.assignments.filter((assignment: any) =>
      assignment.is_active !== false &&
      String(assignment.teacher_uuid ?? "") === teacherUuid &&
      (!assignment.created_at || String(assignment.created_at).slice(0, 10) <= yesterday),
    );
    const missingAssignments = assignments.filter((assignment: any) =>
      !raw.logs.some((log: any) =>
        String(log.teacher_assignment_uuid ?? "") === String(assignment.id ?? "") &&
        String(log.log_date ?? "") === yesterday,
      ),
    );
    if (!missingAssignments.length) continue;

    rows.push({
      teacherUuid,
      teacherName: String(teacher.full_name ?? "Teacher"),
      missedLogs: missingAssignments.length,
      assignments: missingAssignments
        .map((assignment: any) => ({
          className: String(assignment.class_name ?? "—"),
          sectionName: String(assignment.section_name ?? "—"),
          subjectName: String(assignment.subject_name ?? "—"),
        }))
        .sort((a: any, b: any) => `${a.className}-${a.sectionName}-${a.subjectName}`.localeCompare(`${b.className}-${b.sectionName}-${b.subjectName}`)),
    });
  }

  return rows.sort((a, b) => b.missedLogs - a.missedLogs || a.teacherName.localeCompare(b.teacherName));
}

export function buildSchoolMorningBrief(
  raw: SchoolMorningBriefRawData,
  today = new Date(),
): SchoolMorningBrief {
  const todayKey = indiaDateKey(today);
  const period = getMorningBriefPeriod(todayKey);
  const teacherMetrics = teacherDailyMetrics(raw, period.yesterday);
  const yesterdayMetrics = yesterdaySchoolLearningMetrics(raw, period.yesterday);
  const yesterdayLearningHealth = yesterdayMetrics.learningHealth;
  const yesterdayUnderstandingRate = yesterdayMetrics.understandingRate;
  const yesterdayDoubtClosureRate = yesterdayMetrics.doubtClosureRate;
  const yesterdayPartialUnderstandingRate = yesterdayMetrics.partialRate;
  const yesterdayDidntUnderstandRate = yesterdayMetrics.didntUnderstandRate;
  const yesterdayDoubtRate = yesterdayMetrics.doubtRate;

  const ranked = classroomMetrics(raw, period.start, period.end);
  const yesterdayTopDoubtClasses = yesterdayDoubtClassMetrics(raw, period.yesterday);
  const missingLogs = missingDailyLogs(raw, period.yesterday);

  return {
    schoolUuid: raw.schoolUuid,
    schoolName: raw.schoolName,
    todayDate: displayDate(todayKey),
    todayDay: displayDay(todayKey),
    yesterdayDate: displayDate(period.yesterday),
    yesterdayDay: displayDay(period.yesterday),
    yesterdayLearningHealth,
    yesterdayUnderstandingRate,
    yesterdayDoubtClosureRate,
    yesterdayPartialUnderstandingRate,
    yesterdayDidntUnderstandRate,
    yesterdayDoubtRate,
    yesterdayTopDoubtClasses,
    missingDailyLogs: missingLogs,
    yesterdayTeacherCount: teacherMetrics.length,
    yesterdayTeachers: teacherMetrics,
    periodStart: period.start,
    periodEnd: period.end,
    periodLabel: period.label,
    topClassrooms: ranked.slice(0, 3),
    attentionClassrooms: [...ranked].sort((a, b) =>
      a.combinedScore - b.combinedScore ||
      a.className.localeCompare(b.className, undefined, { numeric: true }) ||
      a.sectionName.localeCompare(b.sectionName),
    ).slice(0, 3),
  };
}

export function getTodayIndiaDateKey() {
  return indiaDateKey(new Date());
}
