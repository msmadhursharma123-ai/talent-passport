import {
  calculateDoubtClosureRate,
  calculateLearningDoubtRate,
  calculatePooledPercentage,
  calculateStudentLearningHealthPercentage,
  isDoubtUnresolved,
  isLearningUnderstandingLevel,
  COMPLETE_FEEDBACK_OPTION,
  DID_NOT_UNDERSTAND_FEEDBACK_OPTION,
  PARTIAL_FEEDBACK_OPTION,
} from "../../learningAnalytics/canonical/LearningAnalyticsCanonicalService";
import type {
  PTMDateRange,
  PTMFeedback,
  PTMLog,
  PTMPreparedDataset,
  PTMReport,
  PTMStudent,
  PTMTimePreset,
} from "../types/PTMModels";

function indiaDateKey(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);
  return `${parts.find((p) => p.type === "year")?.value ?? ""}-${parts.find((p) => p.type === "month")?.value ?? ""}-${parts.find((p) => p.type === "day")?.value ?? ""}`;
}

function todayIndia(): string {
  return indiaDateKey(new Date());
}

function shiftDays(base: string, amount: number): string {
  const date = new Date(`${base}T00:00:00+05:30`);
  date.setUTCDate(date.getUTCDate() + amount);
  return indiaDateKey(date);
}

function same(a: unknown, b: unknown): boolean {
  return String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
}

function inRange(value: string, startDate: string, endDate: string): boolean {
  return value >= startDate && value <= endDate;
}

function periodForPreset(preset: PTMTimePreset, customStart = "", customEnd = ""): PTMDateRange {
  const today = todayIndia();
  if (preset === "ALL") {
    return {
      startDate: "",
      endDate: today,
      label: "All Time",
    };
  }
  if (preset === "CUSTOM") {
    return {
      startDate: customStart,
      endDate: customEnd,
      label: `${customStart || "—"} to ${customEnd || "—"}`,
    };
  }

  const days = Number(preset);
  const startDate = shiftDays(today, -(days - 1));
  const label =
    preset === "7"
      ? "1 week"
      : preset === "14"
        ? "2 weeks"
        : preset === "21"
          ? "3 weeks"
          : `${preset} days`;

  return { startDate, endDate: today, label };
}

function cleanTopic(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function subjectKey(value: unknown): string {
  return cleanTopic(value).toLowerCase();
}

function uniqueSorted(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function normalizedMetricKey(value: unknown): string {
  return cleanTopic(value).toLowerCase();
}

function countUniqueTopics(logs: PTMLog[]): number {
  const keys = new Set<string>();
  logs.forEach((log) => {
    const subject = normalizedMetricKey(log.subjectName);
    const topic = normalizedMetricKey(log.topicName);
    if (!subject || !topic) return;
    keys.add(`${subject}|||${topic}`);
  });
  return keys.size;
}

function countUniqueSubtopics(logs: PTMLog[]): number {
  const keys = new Set<string>();
  logs.forEach((log) => {
    const subject = normalizedMetricKey(log.subjectName);
    const topic = normalizedMetricKey(log.topicName);
    if (!subject || !topic) return;
    (log.conceptsCovered ?? []).forEach((concept) => {
      const subtopic = normalizedMetricKey(concept);
      if (!subtopic) return;
      keys.add(`${subject}|||${topic}|||${subtopic}`);
    });
  });
  return keys.size;
}

function responseRate(responses: number, logs: number): number {
  if (logs <= 0) return 0;
  return Math.round((responses / logs) * 100);
}

function learningFeedbackLevel(feedback: PTMFeedback): string {
  return String(feedback.understandingLevel ?? "").trim();
}

function isValidLearningFeedback(feedback: PTMFeedback): boolean {
  return isLearningUnderstandingLevel(learningFeedbackLevel(feedback));
}

function buildDiscussionPoints(report: Omit<PTMReport, "discussionPoints">): string[] {
  const points: string[] = [];

  points.push(
    `Overall understanding is ${report.combinedUnderstandingPercentage}%, based on ${report.totalFeedbackResponses} submitted feedback response${report.totalFeedbackResponses === 1 ? "" : "s"}.`
  );
  points.push(
    `Feedback was submitted on ${report.feedbackDays} day${report.feedbackDays === 1 ? "" : "s"} during the selected period, against ${report.totalLogs} published daily lecture log${report.totalLogs === 1 ? "" : "s"}.`
  );

  const lowest = [...report.subjects]
    .filter((subject) => subject.feedbackCount > 0)
    .sort((a, b) => a.understandingPercentage - b.understandingPercentage)[0];

  if (lowest) {
    points.push(
      `${lowest.subject} is the subject to discuss first on understanding (${lowest.understandingPercentage}%).`
    );
  }

  if (report.pendingDoubts.length > 0) {
    const total = report.pendingDoubts.reduce((sum, group) => sum + group.count, 0);
    points.push(
      `${total} unresolved doubt${total === 1 ? "" : "s"} remain in the selected period across ${report.pendingDoubts.length} subject${report.pendingDoubts.length === 1 ? "" : "s"}.`
    );
  } else {
    points.push("There are no unresolved doubts in the selected period for this student.");
  }

  return points;
}

export function buildPTMReport(
  dataset: PTMPreparedDataset,
  student: PTMStudent,
  period: PTMDateRange,
  logsOverride = dataset.logs,
  feedbackOverride = dataset.feedback,
  doubtLedgerOverride = dataset.doubtLedger
): PTMReport {
  const relevantAssignments = dataset.assignments.filter(
    (assignment) =>
      same(assignment.className, student.className) &&
      same(assignment.sectionName, student.sectionName)
  );
  const assignmentIds = new Set(relevantAssignments.map((assignment) => assignment.id));

  const relevantLogs = logsOverride.filter(
    (log) =>
      assignmentIds.has(log.teacherAssignmentUuid) &&
      inRange(log.logDate, period.startDate, period.endDate)
  );

  const logById = new Map(relevantLogs.map((log) => [log.id, log]));
  const relevantFeedback = feedbackOverride.filter(
    (feedback) =>
      same(feedback.studentUuid, student.studentUuid) &&
      logById.has(feedback.dailyLogUuid)
  );

  const validFeedback = relevantFeedback.filter(isValidLearningFeedback);
  const completeCount = validFeedback.filter(
    (feedback) => learningFeedbackLevel(feedback) === COMPLETE_FEEDBACK_OPTION
  ).length;
  const partialCount = validFeedback.filter(
    (feedback) => learningFeedbackLevel(feedback) === PARTIAL_FEEDBACK_OPTION
  ).length;
  const didntUnderstandCount = validFeedback.filter(
    (feedback) => learningFeedbackLevel(feedback) === DID_NOT_UNDERSTAND_FEEDBACK_OPTION
  ).length;
  const validFeedbackCount = validFeedback.length;
  const combinedUnderstandingPercentage = calculateStudentLearningHealthPercentage(
    validFeedback.map((feedback) => learningFeedbackLevel(feedback))
  );
  const combinedFullUnderstandingPercentage = calculatePooledPercentage(
    completeCount,
    validFeedbackCount
  );
  const combinedPartialUnderstandingPercentage = calculatePooledPercentage(
    partialCount,
    validFeedbackCount
  );
  const combinedDidntUnderstandPercentage = calculatePooledPercentage(
    didntUnderstandCount,
    validFeedbackCount
  );
  const combinedDoubtPercentage = calculateLearningDoubtRate(
    partialCount,
    didntUnderstandCount,
    validFeedbackCount
  );

  const relevantDoubtLedger = doubtLedgerOverride.filter(
    (doubt) =>
      same(doubt.studentUuid, student.studentUuid) &&
      assignmentIds.has(doubt.teacherAssignmentUuid) &&
      inRange(doubt.logDate, period.startDate, period.endDate)
  );

  // The canonical closure calculator intentionally consumes the canonical
  // snake_case resolution contract. PTM's repository model is camelCase, so
  // normalize only at this boundary rather than creating a second closure
  // formula or changing the shared canonical service.
  const canonicalDoubtLedger = relevantDoubtLedger
    .filter((doubt) => doubt.source !== "live")
    .map((doubt) => ({
    doubt_resolved: doubt.doubtResolved === true,
    status: doubt.status,
    student_response: doubt.studentResponse,
  }));

  const feedbackDays = new Set(
    relevantFeedback.map((feedback) =>
      indiaDateKey(feedback.submittedAt) || logById.get(feedback.dailyLogUuid)?.logDate || ""
    ).filter(Boolean)
  ).size;

  const unresolvedDoubtRows = relevantDoubtLedger.filter((doubt) =>
    isDoubtUnresolved({
      doubt_resolved: doubt.doubtResolved === true,
      status: doubt.status,
      student_response: doubt.studentResponse,
    })
  );

  const unresolvedDoubtsBySubject = new Map<
    string,
    Array<{ topic: string; concept: string }>
  >();

  unresolvedDoubtRows.forEach((row) => {
    const subject = cleanTopic(row.subjectName) || "Other";
    const keySubject = subjectKey(subject) || "other";
    const items = unresolvedDoubtsBySubject.get(keySubject) ?? [];
    const item = {
      topic: cleanTopic(row.topicName) || "—",
      concept: cleanTopic(row.concept) || "—",
    };
    const key = `${item.topic}|||${item.concept}`.toLowerCase();
    if (!items.some((current) => `${current.topic}|||${current.concept}`.toLowerCase() === key)) {
      items.push(item);
    }
    unresolvedDoubtsBySubject.set(keySubject, items);
  });

  const subjectLabelsByKey = new Map<string, string>();
  relevantAssignments.forEach((assignment) => {
    const label = cleanTopic(assignment.subjectName);
    const key = subjectKey(label);
    if (key && !subjectLabelsByKey.has(key)) subjectLabelsByKey.set(key, label);
  });

  const subjects = Array.from(subjectLabelsByKey.entries())
    .sort(([, a], [, b]) => a.localeCompare(b))
    .map(([subjectKeyValue, subject]) => {
      const subjectLogs = relevantLogs.filter(
        (log) => subjectKey(log.subjectName) === subjectKeyValue
      );
      const subjectFeedback = relevantFeedback.filter((feedback) => {
        const log = logById.get(feedback.dailyLogUuid);
        return subjectKey(log?.subjectName ?? feedback.subjectName) === subjectKeyValue;
      });
      const validSubjectFeedback = subjectFeedback.filter(isValidLearningFeedback);
      const complete = validSubjectFeedback.filter(
        (row) => learningFeedbackLevel(row) === COMPLETE_FEEDBACK_OPTION
      ).length;
      const partial = validSubjectFeedback.filter(
        (row) => learningFeedbackLevel(row) === PARTIAL_FEEDBACK_OPTION
      ).length;
      const didnt = validSubjectFeedback.filter(
        (row) => learningFeedbackLevel(row) === DID_NOT_UNDERSTAND_FEEDBACK_OPTION
      ).length;
      const understanding = calculateStudentLearningHealthPercentage(
        validSubjectFeedback.map((feedback) => learningFeedbackLevel(feedback))
      );
      const subjectDoubtLedger = relevantDoubtLedger.filter(
        (doubt) => subjectKey(doubt.subjectName) === subjectKeyValue
      );
      const unresolvedDoubts = unresolvedDoubtsBySubject.get(subjectKeyValue) ?? [];
      const subjectFeedbackCount = validSubjectFeedback.length;

      return {
        subject,
        logsCount: subjectLogs.length,
        feedbackCount: subjectFeedback.length,
        responseRate: responseRate(subjectFeedback.length, subjectLogs.length),
        fullyUnderstood: complete,
        partiallyUnderstood: partial,
        didntUnderstand: didnt,
        understandingPercentage: understanding,
        partialUnderstandingPercentage: calculatePooledPercentage(partial, subjectFeedbackCount),
        didntUnderstandPercentage: calculatePooledPercentage(didnt, subjectFeedbackCount),
        doubtPercentage: calculateLearningDoubtRate(
          partial,
          didnt,
          subjectFeedbackCount
        ),
        doubtClosurePercentage: calculateDoubtClosureRate(
          subjectDoubtLedger
            .filter((doubt) => doubt.source !== "live")
            .map((doubt) => ({
            doubt_resolved: doubt.doubtResolved === true,
            status: doubt.status,
            student_response: doubt.studentResponse,
          }))
        ),
        topics: uniqueSorted(subjectLogs.map((log) => cleanTopic(log.topicName))),
        unresolvedDoubtCount: unresolvedDoubts.length,
        unresolvedDoubts,
      };
    });

  const pendingDoubts = Array.from(unresolvedDoubtsBySubject.entries())
    .map(([subjectKeyValue, items]) => ({
      subject: relevantAssignments.find((assignment) => subjectKey(assignment.subjectName) === subjectKeyValue)?.subjectName ??
        unresolvedDoubtRows.find((row) => subjectKey(row.subjectName) === subjectKeyValue)?.subjectName ??
        "Other",
      count: items.length,
      items,
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject));

  const base: Omit<PTMReport, "discussionPoints"> = {
    student,
    teacherName: dataset.teacherName,
    schoolName: dataset.schoolName || student.schoolName,
    period,
    combinedUnderstandingPercentage,
    combinedFullUnderstandingPercentage,
    combinedPartialUnderstandingPercentage,
    combinedDidntUnderstandPercentage,
    totalTopicsTaught: countUniqueTopics(relevantLogs),
    totalSubtopicsTaught: countUniqueSubtopics(relevantLogs),
    combinedDoubtPercentage,
    unresolvedDoubtCount: Array.from(unresolvedDoubtsBySubject.values()).reduce(
      (sum, items) => sum + items.length,
      0
    ),
    doubtClosurePercentage: calculateDoubtClosureRate(canonicalDoubtLedger),
    totalLogs: relevantLogs.length,
    totalFeedbackResponses: relevantFeedback.length,
    overallResponseRate: responseRate(relevantFeedback.length, relevantLogs.length),
    feedbackDays,
    subjects,
    pendingDoubts,
    generatedAt: new Date().toISOString(),
  };

  return {
    ...base,
    discussionPoints: buildDiscussionPoints(base),
  };
}

export function getPTMPeriod(preset: PTMTimePreset, customStart = "", customEnd = "") {
  return periodForPreset(preset, customStart, customEnd);
}

export function getStandardPTMPeriods() {
  return (["7", "14", "21", "30", "60", "90"] as PTMTimePreset[]).map((preset) => ({
    preset,
    period: periodForPreset(preset),
  }));
}

export function prepareStandardPTMReports(dataset: PTMPreparedDataset) {
  const reports = new Map<string, Map<PTMTimePreset, PTMReport>>();
  for (const student of dataset.students) {
    const byPreset = new Map<PTMTimePreset, PTMReport>();
    for (const { preset, period } of getStandardPTMPeriods()) {
      byPreset.set(preset, buildPTMReport(dataset, student, period));
    }
    reports.set(student.studentUuid, byPreset);
  }
  return reports;
}
