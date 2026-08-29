import { buildLearningIntelligence } from "../../../engines/learningIntelligenceEngine";
import type {
  PTMDateRange,
  PTMFeedback,
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

function uniqueSorted(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function responseRate(responses: number, logs: number): number {
  if (logs <= 0) return 0;
  return Math.round((responses / logs) * 100);
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
      `${total} current pending doubt${total === 1 ? "" : "s"} remain across ${report.pendingDoubts.length} subject${report.pendingDoubts.length === 1 ? "" : "s"}.`
    );
  } else {
    points.push("There are no current pending doubts in the teacher's assigned classrooms for this student.");
  }

  return points;
}

export function buildPTMReport(
  dataset: PTMPreparedDataset,
  student: PTMStudent,
  period: PTMDateRange,
  logsOverride = dataset.logs,
  feedbackOverride = dataset.feedback
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

  const validFeedback = relevantFeedback.filter(
    (feedback) =>
      feedback.understandingLevel === "I completely understood." ||
      feedback.understandingLevel === "I partially understood." ||
      feedback.understandingLevel === "I didn't understand."
  );

  const learning = buildLearningIntelligence(
    validFeedback.map((feedback) => ({
      understanding_level: feedback.understandingLevel,
      subject_name: logById.get(feedback.dailyLogUuid)?.subjectName ?? feedback.subjectName,
      topic_name: logById.get(feedback.dailyLogUuid)?.topicName ?? feedback.topicName,
      concepts_not_understood: feedback.conceptsNotUnderstood,
    })),
    0
  );

  const feedbackByLog = new Set(relevantFeedback.map((feedback) => feedback.dailyLogUuid));
  const feedbackDays = new Set(
    relevantFeedback.map((feedback) =>
      indiaDateKey(feedback.submittedAt) || logById.get(feedback.dailyLogUuid)?.logDate || ""
    ).filter(Boolean)
  ).size;

  const subjects = Array.from(
    new Set(relevantAssignments.map((assignment) => assignment.subjectName).filter(Boolean))
  )
    .sort((a, b) => a.localeCompare(b))
    .map((subject) => {
      const subjectLogs = relevantLogs.filter((log) => same(log.subjectName, subject));
      const subjectFeedback = relevantFeedback.filter((feedback) => {
        const log = logById.get(feedback.dailyLogUuid);
        return same(log?.subjectName ?? feedback.subjectName, subject);
      });
      const complete = subjectFeedback.filter((row) => row.understandingLevel === "I completely understood.").length;
      const partial = subjectFeedback.filter((row) => row.understandingLevel === "I partially understood.").length;
      const didnt = subjectFeedback.filter((row) => row.understandingLevel === "I didn't understand.").length;
      const understanding = buildLearningIntelligence(
        subjectFeedback.map((feedback) => ({ understanding_level: feedback.understandingLevel })),
        0
      ).understandingScore;

      return {
        subject,
        logsCount: subjectLogs.length,
        feedbackCount: subjectFeedback.length,
        responseRate: responseRate(subjectFeedback.length, subjectLogs.length),
        fullyUnderstood: complete,
        partiallyUnderstood: partial,
        didntUnderstand: didnt,
        understandingPercentage: understanding,
        topics: uniqueSorted(subjectLogs.map((log) => cleanTopic(log.topicName))),
      };
    });

  const pendingDoubts = dataset.pendingDoubts
    .filter(
      (doubt) =>
        same(doubt.studentUuid, student.studentUuid) &&
        assignmentIds.has(doubt.teacherAssignmentUuid) &&
        doubt.isUnresolved !== false
    )
    .reduce<PTMReport["pendingDoubts"]>((groups, doubt) => {
      const subject = cleanTopic(doubt.subjectName) || "Other";
      const existing = groups.find((group) => same(group.subject, subject));
      const item = {
        topic: cleanTopic(doubt.topicName) || "—",
        concept: cleanTopic(doubt.concept) || "—",
      };
      if (existing) {
        const key = `${item.topic}|||${item.concept}`.toLowerCase();
        if (!existing.items.some((current) => `${current.topic}|||${current.concept}`.toLowerCase() === key)) {
          existing.items.push(item);
        }
        existing.count = existing.items.length;
      } else {
        groups.push({ subject, count: 1, items: [item] });
      }
      return groups;
    }, [])
    .sort((a, b) => a.subject.localeCompare(b.subject));

  const base: Omit<PTMReport, "discussionPoints"> = {
    student,
    teacherName: dataset.teacherName,
    schoolName: dataset.schoolName || student.schoolName,
    period,
    combinedUnderstandingPercentage: learning.understandingScore,
    totalLogs: relevantLogs.length,
    totalFeedbackResponses: relevantFeedback.length,
    overallResponseRate: responseRate(relevantFeedback.length, relevantLogs.length),
    feedbackDays,
    subjects,
    pendingDoubts,
    generatedAt: new Date().toISOString(),
  };

  void feedbackByLog;
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
