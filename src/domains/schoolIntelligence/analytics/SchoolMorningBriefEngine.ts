import type {
  SchoolMorningBrief,
  SchoolMorningBriefClassroomMetric,
  SchoolMorningBriefTeacherDailyMetric,
} from "../types/SchoolMorningBriefModels";
import type { SchoolMorningBriefRawData } from "../repository/SchoolMorningBriefRepository";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

const pct = (part: number, total: number): number | null =>
  total === 0 ? null : Math.round((part / total) * 100);

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

function isResolved(doubt: any) {
  return (
    doubt?.doubt_resolved === true ||
    String(doubt?.status ?? "").trim().toUpperCase() === "RESOLVED"
  );
}

function latestDoubtForFeedback(doubts: any[], feedback: any) {
  const matches = doubts.filter(
    (doubt) =>
      String(doubt.daily_log_uuid ?? "") === String(feedback.daily_log_uuid ?? "") &&
      String(doubt.student_uuid ?? "") === String(feedback.student_uuid ?? ""),
  );

  if (!matches.length) return null;

  return [...matches].sort((a, b) => {
    const aTime = new Date(a.revision_checked_at ?? a.created_at ?? 0).getTime();
    const bTime = new Date(b.revision_checked_at ?? b.created_at ?? 0).getTime();
    return bTime - aTime;
  })[0];
}

function effectiveUnderstanding(feedback: any, doubts: any[]) {
  const original = String(feedback?.understanding_level ?? "").trim();
  if (original !== PARTIAL && original !== NONE) return original;

  const doubt = latestDoubtForFeedback(doubts, feedback);
  if (!doubt) return original;

  const response = String(doubt.student_response ?? "").trim().toUpperCase();
  if (response === "DISCUSSED" || isResolved(doubt)) return COMPLETE;
  return original;
}

function classroomStudentCount(raw: SchoolMorningBriefRawData, className: string, sectionName: string) {
  return new Set(
    raw.students
      .filter((student: any) => same(student.class_name, className) && same(student.section_name, sectionName))
      .map((student: any) => String(student.student_uuid ?? ""))
      .filter(Boolean),
  ).size;
}

function averageDailyResponseRate(
  raw: SchoolMorningBriefRawData,
  logs: any[],
  feedback: any[],
  className: string,
  sectionName: string,
) {
  const strength = classroomStudentCount(raw, className, sectionName);
  if (!logs.length || strength === 0) return 0;

  const dailyRates = logs.map((log) => {
    const responders = new Set(
      feedback
        .filter((row) => String(row.daily_log_uuid) === String(log.id))
        .map((row) => String(row.student_uuid ?? ""))
        .filter(Boolean),
    ).size;

    return Math.min(100, (responders / strength) * 100);
  });

  return Math.round(dailyRates.reduce((sum, value) => sum + value, 0) / dailyRates.length);
}

function teacherDailyMetrics(raw: SchoolMorningBriefRawData, yesterday: string) {
  const metrics: SchoolMorningBriefTeacherDailyMetric[] = [];

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
    const complete = feedback.filter((row: any) => effectiveUnderstanding(row, raw.doubts) === COMPLETE).length;
    const teacherDoubts = raw.doubts.filter(
      (doubt: any) =>
        teacherAssignmentIds.has(String(doubt.teacher_assignment_uuid ?? "")) &&
        String(doubt.log_date ?? "") === yesterday,
    );
    const resolved = teacherDoubts.filter(isResolved).length;

    metrics.push({
      teacherUuid,
      teacherName: String(teacher.full_name ?? "Teacher"),
      understandingRate: pct(complete, feedback.length),
      doubtClosureRate: pct(resolved, teacherDoubts.length),
      feedbackCount: feedback.length,
      doubtsAsked: teacherDoubts.length,
      doubtsResolved: resolved,
    });
  }

  return metrics.sort((a, b) => a.teacherName.localeCompare(b.teacherName));
}

function classroomMetrics(raw: SchoolMorningBriefRawData, start: string, end: string) {
  const classroomMap = new Map<string, { className: string; sectionName: string }>();

  raw.assignments
    .forEach((assignment: any) => {
      const className = String(assignment.class_name ?? "").trim();
      const sectionName = String(assignment.section_name ?? "").trim();
      if (!className || !sectionName) return;
      classroomMap.set(`${className}|||${sectionName}`, { className, sectionName });
    });

  const rows: SchoolMorningBriefClassroomMetric[] = [];

  for (const [classroomKey, classroom] of classroomMap) {
    const assignmentIds = new Set(
      raw.assignments
        .filter(
          (assignment: any) =>
            same(assignment.class_name, classroom.className) &&
            same(assignment.section_name, classroom.sectionName),
        )
        .map((assignment: any) => String(assignment.id ?? ""))
        .filter(Boolean),
    );

    const logs = raw.logs.filter((log: any) =>
      assignmentIds.has(String(log.teacher_assignment_uuid ?? "")) &&
      String(log.log_date ?? "") >= start &&
      String(log.log_date ?? "") <= end,
    );
    const logIds = new Set(logs.map((log: any) => String(log.id ?? "")));
    const feedback = raw.feedback.filter((row: any) => logIds.has(String(row.daily_log_uuid ?? "")));
    const doubts = raw.doubts.filter((doubt: any) => assignmentIds.has(String(doubt.teacher_assignment_uuid ?? "")));

    // Rank every distinct school classroom represented by an assignment,
    // including assignments that are no longer active, when it has teaching
    // activity in the selected historical period. Empty/inactive classrooms are
    // not ranked when they have no activity in the period.
    if (!logs.length) continue;

    const complete = feedback.filter((row: any) => effectiveUnderstanding(row, raw.doubts) === COMPLETE).length;
    const understandingRate = pct(complete, feedback.length) ?? 0;
    const responseRate = averageDailyResponseRate(raw, logs, feedback, classroom.className, classroom.sectionName);
    const resolved = doubts.filter(isResolved).length;
    // Zero doubts means there was no closure obligation. Treating that component
    // as 100% avoids incorrectly ranking a classroom with no doubt signal as a
    // bottom performer simply because 0/0 is undefined.
    const doubtClosureRate = doubts.length === 0 ? 100 : (pct(resolved, doubts.length) ?? 0);
    const combinedScore = Math.round((responseRate + understandingRate + doubtClosureRate) / 3);

    rows.push({
      classroomKey,
      classroom: `Class ${classroom.className} · Section ${classroom.sectionName}`,
      className: classroom.className,
      sectionName: classroom.sectionName,
      responseRate,
      understandingRate,
      doubtClosureRate,
      combinedScore,
      logsCount: logs.length,
      feedbackCount: feedback.length,
      doubtsAsked: doubts.length,
      doubtsResolved: resolved,
    });
  }

  return rows.sort((a, b) =>
    b.combinedScore - a.combinedScore ||
    a.className.localeCompare(b.className, undefined, { numeric: true }) ||
    a.sectionName.localeCompare(b.sectionName),
  );
}

export function buildSchoolMorningBrief(
  raw: SchoolMorningBriefRawData,
  today = new Date(),
): SchoolMorningBrief {
  const todayKey = indiaDateKey(today);
  const period = getMorningBriefPeriod(todayKey);
  const teacherMetrics = teacherDailyMetrics(raw, period.yesterday);

  const understandingValues = teacherMetrics
    .map((metric) => metric.understandingRate)
    .filter((value): value is number => value !== null);
  const closureValues = teacherMetrics
    .map((metric) => metric.doubtClosureRate)
    .filter((value): value is number => value !== null);

  const yesterdayLearningHealth = understandingValues.length
    ? Math.round(understandingValues.reduce((sum, value) => sum + value, 0) / understandingValues.length)
    : null;
  const yesterdayDoubtClosureRate = closureValues.length
    ? Math.round(closureValues.reduce((sum, value) => sum + value, 0) / closureValues.length)
    : null;

  const ranked = classroomMetrics(raw, period.start, period.end);

  return {
    schoolUuid: raw.schoolUuid,
    schoolName: raw.schoolName,
    todayDate: displayDate(todayKey),
    todayDay: displayDay(todayKey),
    yesterdayDate: displayDate(period.yesterday),
    yesterdayDay: displayDay(period.yesterday),
    yesterdayLearningHealth,
    yesterdayDoubtClosureRate,
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
