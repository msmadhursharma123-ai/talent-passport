import {
  aggregateLearningLectureMetrics,
  calculateDoubtClosureRate,
  calculateLearningDoubtRate,
  calculateLearningLectureMetrics,
  calculateStudentLearningHealthPercentage,
  isDoubtResolved,
  latestFeedbackByStudent,
  isLearningUnderstandingLevel,
} from "../../learningAnalytics/canonical/LearningAnalyticsCanonicalService";
import type { SchoolIntelligenceRawData } from "../repository/SchoolIntelligenceRepository";
import type {
  SchoolOverviewTableRowDetailDay,
  SchoolOverviewTableRowDetailMetricSummary,
  SchoolOverviewTableRowDetailSnapshot,
  SchoolOverviewTableRowDetailStudent,
  SchoolOverviewTableRowDetailTopicLog,
} from "../types/SchoolOverviewTableRowDetailModels";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

function clean(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function sameValue(a: unknown, b: unknown) {
  return clean(a).toLowerCase() === clean(b).toLowerCase();
}

function dayName(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${date}T00:00:00Z`));
}

function normalizeConcept(value: unknown) {
  return clean(value).toLowerCase().replace(/\s+/g, " ");
}

function effectiveUnderstanding(raw: SchoolIntelligenceRawData, feedback: any) {
  const original = feedback?.understanding_level;
  if (feedback?._live_reconciled === true) return original;
  // Match the existing School Overview effective-understanding contract exactly.
  // The canonical lecture metric trims the returned level when evaluating it;
  // this guard must not introduce a new live-reconciliation interpretation.
  if (original !== PARTIAL && original !== NONE) return original;

  const concepts = Array.isArray(feedback?.concepts_not_understood)
    ? feedback.concepts_not_understood.filter(Boolean)
    : [];
  if (!concepts.length) return original;

  const matches = raw.doubts.filter((doubt: any) =>
    String(doubt.daily_log_uuid ?? "") === String(feedback.daily_log_uuid ?? "") &&
    String(doubt.student_uuid ?? "") === String(feedback.student_uuid ?? "") &&
    concepts.some(
      (concept: string) =>
        normalizeConcept(
          doubt.previous_difficult_concept ??
            doubt.doubt_concept ??
            doubt.previous_topic_name,
        ) === normalizeConcept(concept),
    ),
  );

  if (!matches.length) return original;

  const unresolved = concepts.filter(
    (concept: string) =>
      !matches.some(
        (doubt: any) =>
          normalizeConcept(
            doubt.previous_difficult_concept ??
              doubt.doubt_concept ??
              doubt.previous_topic_name,
          ) === normalizeConcept(concept) &&
          !isDoubtResolved(doubt),
      ),
  );

  return unresolved.length === 0 ? COMPLETE : original;
}

function lectureMetrics(
  raw: SchoolIntelligenceRawData,
  logs: any[],
  roster: string[],
) {
  return logs.map(log =>
    calculateLearningLectureMetrics({
      studentUuids: roster,
      feedback: raw.feedback.filter(
        row => String(row.daily_log_uuid ?? "") === String(log.id ?? ""),
      ),
      getUnderstandingLevel: row => effectiveUnderstanding(raw, row),
    }),
  );
}

function summaryFromLogs(
  raw: SchoolIntelligenceRawData,
  logs: any[],
  roster: string[],
  doubts: any[],
): SchoolOverviewTableRowDetailMetricSummary {
  const metrics = lectureMetrics(raw, logs, roster);
  const aggregate = aggregateLearningLectureMetrics(metrics);
  const doubtsRaised = doubts.length;
  const doubtsResolved = doubts.filter(isDoubtResolved).length;
  const totalStudents = new Set(roster.map(String).filter(Boolean)).size;
  const notRespondedObservations = Math.max(
    0,
    aggregate.eligibleStudentObservations - aggregate.responseStudentObservations,
  );
  const respondingStudents = new Set<string>();
  for (const log of logs) {
    const feedbackRows = latestFeedbackByStudent(
      raw.feedback.filter(
        row => String(row.daily_log_uuid ?? "") === String(log.id ?? ""),
      ),
    );
    for (const row of feedbackRows) {
      const studentUuid = clean(row.student_uuid);
      if (!studentUuid || !roster.includes(studentUuid)) continue;
      const level = clean(effectiveUnderstanding(raw, row));
      if (!isLearningUnderstandingLevel(level)) continue;
      respondingStudents.add(studentUuid);
    }
  }

  return {
    totalStudents,
    eligibleObservations: aggregate.eligibleStudentObservations,
    responseObservations: aggregate.responseStudentObservations,
    absentObservations: aggregate.absentStudentObservations,
    notRespondedObservations,
    completeObservations: aggregate.completeStudentObservations,
    partialObservations: aggregate.partialStudentObservations,
    didntUnderstandObservations: aggregate.didntUnderstandStudentObservations,
    responseRate: aggregate.responseRate,
    studentsResponded: respondingStudents.size,
    understandingRate: aggregate.understandingRate,
    partialRate: aggregate.partialRate,
    doubtRate: calculateLearningDoubtRate(
      aggregate.partialStudentObservations,
      aggregate.didntUnderstandStudentObservations,
      aggregate.eligibleStudentObservations,
    ),
    doubtClosureRate: calculateDoubtClosureRate(doubts),
    doubtsRaised,
    doubtsResolved,
    doubtsUnresolved: Math.max(0, doubtsRaised - doubtsResolved),
    classHealthPercentage: aggregate.classHealthPercentage,
    lectureCount: aggregate.lectureCount,
    doubtsUnavailable: raw.doubtsLoadFailed,
  };
}

function topicForLog(log: any, teacherName: string): SchoolOverviewTableRowDetailTopicLog {
  return {
    logId: clean(log.id),
    date: clean(log.log_date),
    day: dayName(clean(log.log_date)),
    teacherName,
    topic: clean(log.topic_name, "Topic not recorded"),
    subtopics: Array.isArray(log.concepts_covered)
      ? log.concepts_covered.map((value: unknown) => clean(value)).filter(Boolean)
      : [],
  };
}

function buildStudentDetails(
  raw: SchoolIntelligenceRawData,
  logs: any[],
  rosterStudents: any[],
  doubts: any[],
): SchoolOverviewTableRowDetailStudent[] {
  const rows = new Map<string, SchoolOverviewTableRowDetailStudent>();

  for (const student of rosterStudents) {
    const uuid = clean(student.student_uuid);
    if (!uuid || rows.has(uuid)) continue;
    rows.set(uuid, {
      studentUuid: uuid,
      studentName: clean(student.student_name, "Student name unavailable"),
      eligibleObservations: 0,
      responseObservations: 0,
      absentObservations: 0,
      notRespondedObservations: 0,
      completeObservations: 0,
      partialObservations: 0,
      didntUnderstandObservations: 0,
      responseRate: 0,
      understandingRate: 0,
      partialRate: 0,
      doubtRate: 0,
      learningHealthPercentage: 0,
      doubtsRaised: 0,
      doubtsResolved: 0,
      doubtClosureRate: 0,
    });
  }

  for (const log of logs) {
    const feedbackRows = latestFeedbackByStudent(
      raw.feedback.filter(
        row => String(row.daily_log_uuid ?? "") === String(log.id ?? ""),
      ),
    );
    const rosterSet = new Set(rows.keys());
    const byStudent = new Map(
      feedbackRows
        .filter(row => rosterSet.has(clean(row.student_uuid)))
        .map(row => [clean(row.student_uuid), row]),
    );

    for (const row of rows.values()) {
      const feedback = byStudent.get(row.studentUuid);
      if (!feedback) {
        row.notRespondedObservations += 1;
        row.eligibleObservations += 1;
        continue;
      }

      const level = clean(effectiveUnderstanding(raw, feedback));
      if (level === "I was absent.") {
        row.absentObservations += 1;
        continue;
      }

      row.eligibleObservations += 1;
      if (!isLearningUnderstandingLevel(level)) {
        // A feedback row that is not one of the canonical learning-response
        // levels is eligible but is not a response. Keep the student-level
        // evidence aligned with the canonical aggregate denominator.
        row.notRespondedObservations += 1;
        continue;
      }

      if (level === COMPLETE) {
        row.responseObservations += 1;
        row.completeObservations += 1;
      } else if (level === PARTIAL) {
        row.responseObservations += 1;
        row.partialObservations += 1;
      } else if (level === NONE) {
        row.responseObservations += 1;
        row.didntUnderstandObservations += 1;
      }
    }
  }

  const doubtByStudent = new Map<string, any[]>();
  doubts.forEach(doubt => {
    const uuid = clean(doubt.student_uuid);
    if (!uuid || !rows.has(uuid)) return;
    const list = doubtByStudent.get(uuid) ?? [];
    list.push(doubt);
    doubtByStudent.set(uuid, list);
  });

  return Array.from(rows.values())
    .map(row => {
      const studentDoubts = doubtByStudent.get(row.studentUuid) ?? [];
      row.responseRate = row.eligibleObservations > 0
        ? Math.round((row.responseObservations / row.eligibleObservations) * 100)
        : 0;
      row.understandingRate = row.eligibleObservations > 0
        ? Math.round((row.completeObservations / row.eligibleObservations) * 100)
        : 0;
      row.partialRate = row.eligibleObservations > 0
        ? Math.round((row.partialObservations / row.eligibleObservations) * 100)
        : 0;
      row.doubtRate = row.eligibleObservations > 0
        ? Math.round(((row.partialObservations + row.didntUnderstandObservations) / row.eligibleObservations) * 100)
        : 0;
      row.learningHealthPercentage = calculateStudentLearningHealthPercentage(
        [
          ...Array.from({ length: row.completeObservations }, () => COMPLETE),
          ...Array.from({ length: row.partialObservations }, () => PARTIAL),
          ...Array.from({ length: row.didntUnderstandObservations }, () => NONE),
        ],
      );
      row.doubtsRaised = studentDoubts.length;
      row.doubtsResolved = studentDoubts.filter(isDoubtResolved).length;
      row.doubtClosureRate = calculateDoubtClosureRate(studentDoubts);
      return row;
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName));
}

function uniqueRosterStudents(raw: SchoolIntelligenceRawData, assignment: any) {
  const seen = new Set<string>();
  return raw.students.filter(student => {
    if (!sameValue(student.class_name, assignment.class_name)) return false;
    if (!sameValue(student.section_name, assignment.section_name)) return false;
    const uuid = clean(student.student_uuid);
    if (!uuid || seen.has(uuid)) return false;
    seen.add(uuid);
    return true;
  });
}

export function buildSchoolOverviewTableRowDetail(
  raw: SchoolIntelligenceRawData,
  assignmentUuid: string,
  period: { startDate: string; endDate: string },
  tableRowTotalStudents?: number,
): SchoolOverviewTableRowDetailSnapshot {
  const assignment = raw.assignments.find(
    row => String(row.id ?? "") === String(assignmentUuid),
  );
  if (!assignment) {
    throw new Error("The selected classroom row is no longer available for this period.");
  }

  const teacher = raw.teachers.find(
    row => String(row.teacher_uuid ?? "") === String(assignment.teacher_uuid ?? ""),
  );
  const teacherName = clean(teacher?.full_name, "Teacher");
  const rosterStudents = uniqueRosterStudents(raw, assignment);
  const roster = rosterStudents.map(student => clean(student.student_uuid)).filter(Boolean);
  const logs = raw.logs
    .filter(log => String(log.teacher_assignment_uuid ?? "") === String(assignment.id ?? ""))
    .sort((a, b) => `${clean(a.log_date)}|${clean(a.id)}`.localeCompare(`${clean(b.log_date)}|${clean(b.id)}`));
  const doubts = raw.doubts.filter(
    doubt => String(doubt.teacher_assignment_uuid ?? "") === String(assignment.id ?? ""),
  );

  const daysMap = new Map<string, { logs: any[]; doubts: any[] }>();
  for (const log of logs) {
    const date = clean(log.log_date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const bucket = daysMap.get(date) ?? { logs: [], doubts: [] };
    bucket.logs.push(log);
    daysMap.set(date, bucket);
  }
  for (const doubt of doubts) {
    const date = clean(doubt.log_date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const bucket = daysMap.get(date) ?? { logs: [], doubts: [] };
    bucket.doubts.push(doubt);
    daysMap.set(date, bucket);
  }

  const topics = logs.map(log => topicForLog(log, teacherName));
  const dayDates: string[] = [];
  for (let cursor = period.startDate; cursor <= period.endDate;) {
    dayDates.push(cursor);
    const [year, month, day] = cursor.split("-").map(Number);
    const next = new Date(Date.UTC(year, month - 1, day + 1));
    cursor = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
  }

  const days: SchoolOverviewTableRowDetailDay[] = dayDates.map(date => {
    const bucket = daysMap.get(date) ?? { logs: [], doubts: [] };
    return {
      date,
      day: dayName(date),
      topics: bucket.logs.map(log => topicForLog(log, teacherName)),
      hasLessons: bucket.logs.length > 0,
      metrics: summaryFromLogs(raw, bucket.logs, roster, bucket.doubts),
    };
  });

  const overall = summaryFromLogs(raw, logs, roster, doubts);
  const resolvedTableRowTotalStudents = Number.isFinite(Number(tableRowTotalStudents))
    ? Number(tableRowTotalStudents)
    : overall.totalStudents;

  return {
    period,
    assignmentUuid: String(assignment.id ?? ""),
    classroom: `Class ${clean(assignment.class_name)} · Section ${clean(assignment.section_name)}`,
    className: clean(assignment.class_name),
    sectionName: clean(assignment.section_name),
    subjectName: clean(assignment.subject_name, "Subject"),
    teacherName,
    overall,
    tableRowTotalStudents: resolvedTableRowTotalStudents,
    topics,
    students: buildStudentDetails(raw, logs, rosterStudents, doubts),
    days,
    doubtsUnavailable: raw.doubtsLoadFailed,
  };
}
