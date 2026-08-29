import type {
  SchoolWeeklyMeetingHoliday,
  SchoolWeeklyMeetingInsights,
  SchoolWeeklyMeetingTeacherMetric,
} from "./SchoolWeeklyMeetingInsightsModels";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

const pct = (part: number, total: number): number | null =>
  total === 0 ? null : Math.round((part / total) * 100);

function dateKeyFromParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return `${parts.find(p => p.type === "year")?.value}-${parts.find(p => p.type === "month")?.value}-${parts.find(p => p.type === "day")?.value}`;
}

function keyDate(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(key: string, amount: number) {
  const d = keyDate(key);
  d.setUTCDate(d.getUTCDate() + amount);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function weekday(key: string) {
  return keyDate(key).getUTCDay();
}

export function mondayOfWeek(key: string) {
  const day = weekday(key);
  return addDays(key, day === 0 ? -6 : 1 - day);
}

export function sundayOfWeek(key: string) {
  return addDays(mondayOfWeek(key), 6);
}

export function getTodayIndiaDateKey() {
  return dateKeyFromParts(new Date());
}

export function formatDate(key: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(keyDate(key));
}

function fixedHoliday(year: number, month: number, day: number, name: string): SchoolWeeklyMeetingHoliday {
  return { date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, name, source: "GOVERNMENT" };
}

function builtInGovernmentHolidays(year: number): SchoolWeeklyMeetingHoliday[] {
  const common: SchoolWeeklyMeetingHoliday[] = [
    fixedHoliday(year, 1, 26, "Republic Day"),
    fixedHoliday(year, 5, 1, "Buddha Purnima / May Day reference"),
    fixedHoliday(year, 8, 15, "Independence Day"),
    fixedHoliday(year, 10, 2, "Mahatma Gandhi Jayanti"),
    fixedHoliday(year, 12, 25, "Christmas Day"),
  ];

  // Official Government of India holiday references for the current
  // implementation window. Moon-sighting dates are intentionally treated
  // as reference dates and can be overridden by school_calendar_holidays.
  const byYear: Record<number, Array<[number, number, string]>> = {
    2026: [
      [3, 4, "Holi"],
      [3, 21, "Id-ul-Fitr"],
      [3, 26, "Ram Navami"],
      [3, 31, "Mahavir Jayanti"],
      [4, 3, "Good Friday"],
      [5, 27, "Id-ul-Zuha (Bakrid)"],
      [6, 26, "Muharram"],
      [8, 26, "Milad-un-Nabi / Id-e-Milad"],
      [9, 4, "Janmashtami"],
      [10, 20, "Dussehra"],
      [11, 8, "Diwali"],
      [11, 24, "Guru Nanak's Birthday"],
    ],
    2027: [
      [1, 26, "Republic Day"],
      [3, 6, "Maha Shivratri"],
      [3, 10, "Id-ul-Fitr"],
      [3, 22, "Holi"],
      [3, 26, "Good Friday"],
      [4, 15, "Ram Navami"],
      [5, 17, "Id-ul-Zuha (Bakrid)"],
      [6, 16, "Muharram"],
      [8, 15, "Independence Day"],
      [8, 25, "Janmashtami"],
      [10, 2, "Mahatma Gandhi Jayanti"],
      [10, 9, "Dussehra"],
      [10, 29, "Diwali"],
      [11, 24, "Guru Tegh Bahadur's Martyrdom Day"],
      [12, 25, "Christmas Day"],
    ],
  };

  return common.concat(
    (byYear[year] ?? []).map(([month, day, name]) => fixedHoliday(year, month, day, name))
  );
}

function sundayHolidays(startDate: string, endDate: string): SchoolWeeklyMeetingHoliday[] {
  const out: SchoolWeeklyMeetingHoliday[] = [];
  for (let cursor = startDate; cursor <= endDate; cursor = addDays(cursor, 1)) {
    if (weekday(cursor) === 0) {
      out.push({ date: cursor, name: "Sunday", source: "SUNDAY" });
    }
  }
  return out;
}

function holidayMap(holidays: SchoolWeeklyMeetingHoliday[]) {
  return new Map(holidays.map(h => [h.date, h]));
}

function latestDoubtForFeedback(raw: any, feedback: any) {
  const matches = raw.doubts.filter(
    (d: any) =>
      String(d.daily_log_uuid ?? "") === String(feedback.daily_log_uuid ?? "") &&
      String(d.student_uuid ?? "") === String(feedback.student_uuid ?? "")
  );
  return [...matches].sort((a: any, b: any) =>
    new Date(b.revision_checked_at ?? b.created_at ?? 0).getTime() -
    new Date(a.revision_checked_at ?? a.created_at ?? 0).getTime()
  )[0] ?? null;
}

function effectiveUnderstanding(raw: any, feedback: any) {
  const original = feedback.understanding_level;
  if (original !== PARTIAL && original !== NONE) return original;
  const doubt = latestDoubtForFeedback(raw, feedback);
  if (!doubt) return original;
  const response = String(doubt.student_response ?? "").trim().toUpperCase();
  if (
    response === "DISCUSSED" ||
    doubt.doubt_resolved === true ||
    String(doubt.status ?? "").trim().toUpperCase() === "RESOLVED"
  ) {
    return COMPLETE;
  }
  return original;
}

function metricBase(
  teacher: any,
  assignments: any[],
  logs: any[],
  feedback: any[],
  doubts: any[],
  expectedLogs: number,
): SchoolWeeklyMeetingTeacherMetric {
  const assignmentById = new Map(
    assignments.map((assignment: any) => [String(assignment.id), assignment]),
  );
  const assignmentIds = new Set(assignmentById.keys());
  const teacherLogs = logs.filter(
    (log: any) => assignmentIds.has(String(log.teacher_assignment_uuid)),
  );
  const teacherLogIds = new Set(teacherLogs.map((log: any) => String(log.id)));

  const eligibleStudentForLog = (log: any, studentUuid: unknown) => {
    const assignment = assignmentById.get(String(log.teacher_assignment_uuid));
    if (!assignment) return false;
    return (assignment.__studentIds ?? []).some(
      (id: unknown) => String(id) === String(studentUuid),
    );
  };

  const teacherFeedback = feedback.filter((row: any) => {
    if (!teacherLogIds.has(String(row.daily_log_uuid))) return false;
    const log = teacherLogs.find(
      (candidate: any) => String(candidate.id) === String(row.daily_log_uuid),
    );
    return Boolean(log && eligibleStudentForLog(log, row.student_uuid));
  });

  const teacherDoubts = doubts.filter((doubt: any) =>
    assignmentIds.has(String(doubt.teacher_assignment_uuid)),
  );

  const eligible = teacherLogs.reduce((sum, log) => {
    const assignment = assignmentById.get(String(log.teacher_assignment_uuid));
    return sum + new Set(assignment?.__studentIds ?? []).size;
  }, 0);

  const responders = new Set(
    teacherFeedback
      .map((row: any) => `${row.daily_log_uuid}:${row.student_uuid}`)
      .filter(Boolean),
  ).size;

  const effective = teacherFeedback.map((row: any) =>
    effectiveUnderstanding({ doubts }, row),
  );
  const complete = effective.filter((value) => value === COMPLETE).length;
  const healthByLecture: number[] = [];
  for (const log of teacherLogs) {
    const rows = teacherFeedback.filter(
      (feedbackRow: any) => String(feedbackRow.daily_log_uuid) === String(log.id),
    );
    if (!rows.length) continue;
    const c = rows.filter(
      (feedbackRow: any) => effectiveUnderstanding({ doubts }, feedbackRow) === COMPLETE,
    ).length;
    const p = rows.filter(
      (feedbackRow: any) => effectiveUnderstanding({ doubts }, feedbackRow) === PARTIAL,
    ).length;
    healthByLecture.push(Math.round(((c + p * 0.5) / rows.length) * 100));
  }

  const resolved = teacherDoubts.filter(
    (doubt: any) =>
      doubt.doubt_resolved === true ||
      String(doubt.status ?? "").trim().toUpperCase() === "RESOLVED",
  ).length;

  return {
    teacherUuid: String(teacher.teacher_uuid ?? ""),
    teacherName: String(teacher.full_name ?? "Teacher"),
    subjects: Array.from(
      new Set(assignments.map((a: any) => String(a.subject_name ?? "").trim()).filter(Boolean)),
    ),
    classrooms: Array.from(
      new Set(
        assignments.map(
          (a: any) => `Class ${String(a.class_name ?? "").trim()} · ${String(a.section_name ?? "").trim()}`,
        ),
      ),
    ),
    expectedLogs,
    submittedLogs: new Set(
      teacherLogs.map(
        (log: any) => `${String(log.teacher_assignment_uuid)}:${String(log.log_date ?? "")}`,
      ),
    ).size,
    missedLogs: Math.max(
      0,
      expectedLogs -
        new Set(
          teacherLogs.map(
            (log: any) => `${String(log.teacher_assignment_uuid)}:${String(log.log_date ?? "")}`,
          ),
        ).size,
    ),
    feedbackEligible: eligible,
    feedbackResponses: responders,
    feedbackRate: pct(responders, eligible),
    understandingRate: pct(complete, teacherFeedback.length),
    doubtsAsked: teacherDoubts.length,
    doubtsResolved: resolved,
    doubtClosureRate: pct(resolved, teacherDoubts.length),
    classHealthPercentage:
      healthByLecture.length === 0
        ? null
        : Math.round(healthByLecture.reduce((a, b) => a + b, 0) / healthByLecture.length),
    latePlannerCount: 0,
    latestLatePlannerSubmittedAt: null,
    latestLatePlannerDelayMinutes: null,
  };
}

function sortTake(
  rows: SchoolWeeklyMeetingTeacherMetric[],
  score: (row: SchoolWeeklyMeetingTeacherMetric) => number,
  direction: "asc" | "desc",
) {
  return [...rows]
    .sort((a, b) => {
      const aScore = Number.isFinite(score(a)) ? score(a) : direction === "asc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      const bScore = Number.isFinite(score(b)) ? score(b) : direction === "asc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      const delta = aScore - bScore;
      return delta === 0 ? a.teacherName.localeCompare(b.teacherName) : direction === "asc" ? delta : -delta;
    })
    .slice(0, 5);
}

function plannerWeekStart(record: any) {
  const start = String(record.start_date ?? "");
  return /^\d{4}-\d{2}-\d{2}$/.test(start) ? start : "";
}

function mondayDeadlineFor(startDate: string) {
  return `${mondayOfWeek(startDate)}T09:00:00+05:30`;
}

export function buildSchoolWeeklyMeetingInsights(
  raw: any,
  startDate: string,
  endDate: string,
  schoolHolidays: SchoolWeeklyMeetingHoliday[] = []
): SchoolWeeklyMeetingInsights {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw new Error("Weekly meeting report dates must use YYYY-MM-DD.");
  }
  if (startDate > endDate) {
    throw new Error("Weekly meeting report start date cannot be after the end date.");
  }
  const todayKey = getTodayIndiaDateKey();
  if (endDate > todayKey) {
    throw new Error("Weekly meeting reports cannot include future dates.");
  }
  const government = Array.from(
    new Map(
      [new Date(startDate).getUTCFullYear(), new Date(endDate).getUTCFullYear()]
        .flatMap(year => builtInGovernmentHolidays(year))
        .map(h => [h.date, h])
    ).values()
  ).filter(h => h.date >= startDate && h.date <= endDate);

  const excluded = Array.from(
    new Map(
      [...sundayHolidays(startDate, endDate), ...government, ...schoolHolidays]
        .map(h => [h.date, h])
    ).values()
  ).sort((a, b) => a.date.localeCompare(b.date));

  const holidayDates = holidayMap(excluded);
  const workingDays: string[] = [];
  for (let cursor = startDate; cursor <= endDate; cursor = addDays(cursor, 1)) {
    if (!holidayDates.has(cursor)) workingDays.push(cursor);
  }

  // Use assignments that are currently active in the school roster. The source
  // schema does not expose assignment effective dates, so inventing historical
  // start/end dates would be less accurate than using the authoritative active flag.
  const assignments = raw.assignments.filter((a: any) => a.is_active !== false);
  const studentsByClass = new Map<string, string[]>();
  for (const student of raw.students) {
    const key = `${String(student.class_name ?? "").trim().toLowerCase()}|||${String(student.section_name ?? "").trim().toLowerCase()}`;
    const ids = studentsByClass.get(key) ?? [];
    if (student.student_uuid && !ids.includes(String(student.student_uuid))) ids.push(String(student.student_uuid));
    studentsByClass.set(key, ids);
  }

  const enrichedAssignments = assignments.map((a: any) => {
    const key = `${String(a.class_name ?? "").trim().toLowerCase()}|||${String(a.section_name ?? "").trim().toLowerCase()}`;
    return { ...a, __studentIds: studentsByClass.get(key) ?? [] };
  });

  const teachers = raw.teachers.filter((t: any) => t.is_active !== false);
  const rows = teachers
    .map((teacher: any) => {
      const teacherAssignments = enrichedAssignments.filter(
        (a: any) => String(a.teacher_uuid) === String(teacher.teacher_uuid),
      );
      if (teacherAssignments.length === 0) return null;
      const expectedLogs = teacherAssignments.length * workingDays.length;
      return metricBase(teacher, teacherAssignments, raw.logs, raw.feedback, raw.doubts, expectedLogs);
    })
    .filter((row: SchoolWeeklyMeetingTeacherMetric | null): row is SchoolWeeklyMeetingTeacherMetric => Boolean(row));

  const plannerByTeacher = new Map<string, { count: number; latestAt: string | null; latestDelay: number | null }>();
  for (const planner of raw.planners) {
    const start = plannerWeekStart(planner);
    if (!start || start < startDate || start > endDate) continue;
    const submittedAt = planner.submitted_at ? new Date(planner.submitted_at) : null;
    if (!submittedAt || Number.isNaN(submittedAt.getTime())) continue;
    const deadline = new Date(mondayDeadlineFor(start));
    if (submittedAt.getTime() <= deadline.getTime()) continue;

    const teacherUuid = String(planner.teacher_uuid ?? "");
    if (!teacherUuid) continue;
    const current = plannerByTeacher.get(teacherUuid) ?? { count: 0, latestAt: null, latestDelay: null };
    const delay = Math.max(0, Math.round((submittedAt.getTime() - deadline.getTime()) / 60000));
    current.count += 1;
    if (!current.latestAt || submittedAt.getTime() > new Date(current.latestAt).getTime()) {
      current.latestAt = submittedAt.toISOString();
      current.latestDelay = delay;
    }
    plannerByTeacher.set(teacherUuid, current);
  }

  const withPlanner: SchoolWeeklyMeetingTeacherMetric[] = rows.map((row: SchoolWeeklyMeetingTeacherMetric) => {
    const p = plannerByTeacher.get(row.teacherUuid);
    return p ? {
      ...row,
      latePlannerCount: p.count,
      latestLatePlannerSubmittedAt: p.latestAt,
      latestLatePlannerDelayMinutes: p.latestDelay,
    } : row;
  });

  const expectedLectureCount = withPlanner.reduce((sum: number, row: SchoolWeeklyMeetingTeacherMetric) => sum + row.expectedLogs, 0);
  const submittedLectureCount = withPlanner.reduce((sum: number, row: SchoolWeeklyMeetingTeacherMetric) => sum + row.submittedLogs, 0);

  const feedbackEligible = withPlanner.filter((r: SchoolWeeklyMeetingTeacherMetric) => r.feedbackEligible > 0);
  const understandingEligible = withPlanner.filter((r: SchoolWeeklyMeetingTeacherMetric) => r.understandingRate !== null);
  const doubtEligible = withPlanner.filter((r: SchoolWeeklyMeetingTeacherMetric) => r.doubtsAsked > 0);
  const healthEligible = withPlanner.filter((r: SchoolWeeklyMeetingTeacherMetric) => r.classHealthPercentage !== null);
  const plannerEligible = withPlanner.filter((r: SchoolWeeklyMeetingTeacherMetric) => r.latePlannerCount > 0);

  return {
    schoolUuid: String(raw.schoolUuid ?? ""),
    schoolName: String(raw.schoolName ?? "Your School"),
    startDate,
    endDate,
    periodLabel: `${formatDate(startDate)} – ${formatDate(endDate)}`,
    workingDays,
    excludedHolidays: excluded,
    teachersConsidered: withPlanner.length,
    expectedLectureCount,
    submittedLectureCount,
    missedLectureCount: Math.max(0, expectedLectureCount - submittedLectureCount),
    missingDailyLogTeachers: sortTake(withPlanner.filter((r: SchoolWeeklyMeetingTeacherMetric) => r.missedLogs > 0), (r: SchoolWeeklyMeetingTeacherMetric) => r.missedLogs, "desc"),
    leastFeedbackTeachers: sortTake(feedbackEligible, (r: SchoolWeeklyMeetingTeacherMetric) => r.feedbackRate ?? 0, "asc"),
    leastUnderstandingTeachers: sortTake(understandingEligible, (r: SchoolWeeklyMeetingTeacherMetric) => r.understandingRate ?? 0, "asc"),
    leastDoubtClosureTeachers: sortTake(doubtEligible, (r: SchoolWeeklyMeetingTeacherMetric) => r.doubtClosureRate ?? 0, "asc"),
    delayedLessonPlannerTeachers: sortTake(plannerEligible, (r: SchoolWeeklyMeetingTeacherMetric) => r.latePlannerCount * 1000000 + (r.latestLatePlannerDelayMinutes ?? 0), "desc"),
    highestClassHealthTeachers: sortTake(healthEligible, (r: SchoolWeeklyMeetingTeacherMetric) => r.classHealthPercentage ?? 0, "desc"),
    highestFeedbackTeachers: sortTake(feedbackEligible, (r: SchoolWeeklyMeetingTeacherMetric) => r.feedbackRate ?? 0, "desc"),
    highestDoubtClosureTeachers: sortTake(doubtEligible, (r: SchoolWeeklyMeetingTeacherMetric) => r.doubtClosureRate ?? 0, "desc"),
  };
}