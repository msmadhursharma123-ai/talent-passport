import type {
  StarPerformerPeriod,
  StarPerformerRow,
  StarPerformerTeacherMetric,
} from "../types/StarPerformerModels";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

const pct = (part: number, total: number) =>
  total <= 0 ? 0 : Math.round((part / total) * 100);

function same(a: unknown, b: unknown) {
  return String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
}

function dateKey(value: unknown) {
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

  return `${parts.find(p => p.type === "year")?.value ?? ""}-${parts.find(p => p.type === "month")?.value ?? ""}-${parts.find(p => p.type === "day")?.value ?? ""}`;
}

function inInclusiveRange(value: unknown, start: string, end: string) {
  const key = dateKey(value);
  return Boolean(key) && key >= start && key <= end;
}

function getEffectiveUnderstandingLevel(feedback: any, doubts: any[]) {
  const original = feedback?.understanding_level;

  if (original !== PARTIAL && original !== NONE) {
    return original;
  }

  const matches = doubts.filter(
    doubt =>
      String(doubt?.daily_log_uuid ?? "") ===
        String(feedback?.daily_log_uuid ?? "") &&
      String(doubt?.student_uuid ?? "") ===
        String(feedback?.student_uuid ?? "")
  );

  if (matches.length === 0) return original;

  const latest = [...matches].sort((a, b) => {
    const aTime = new Date(
      a?.revision_checked_at ?? a?.created_at ?? 0
    ).getTime();
    const bTime = new Date(
      b?.revision_checked_at ?? b?.created_at ?? 0
    ).getTime();

    return bTime - aTime;
  })[0];

  const response = String(latest?.student_response ?? "")
    .trim()
    .toUpperCase();

  if (
    response === "DISCUSSED" ||
    latest?.doubt_resolved === true ||
    String(latest?.status ?? "").trim().toUpperCase() === "RESOLVED"
  ) {
    return COMPLETE;
  }

  return original;
}

function dailyStudentFeedbackRate(
  logs: any[],
  feedbackByLog: Map<string, any[]>,
  rosterSize: number
) {
  if (logs.length === 0 || rosterSize === 0) return 0;

  const dailyRates = logs.map(log => {
    const responders = new Set(
      (feedbackByLog.get(String(log.id ?? "")) ?? [])
        .map(row => String(row.student_uuid ?? ""))
        .filter(Boolean)
    ).size;

    return Math.min(100, (responders / rosterSize) * 100);
  });

  return dailyRates.length
    ? Math.round(dailyRates.reduce((sum, rate) => sum + rate, 0) / dailyRates.length)
    : 0;
}

function metricForClassroom(
  assignments: any[],
  logsByAssignment: Map<string, any[]>,
  feedbackByLog: Map<string, any[]>,
  doubtsByAssignment: Map<string, any[]>,
  rosterByClassroom: Map<string, number>,
  className: string,
  sectionName: string
): StarPerformerTeacherMetric["classMetrics"][number] {
  const classroomLogs = assignments.flatMap(
    assignment => logsByAssignment.get(String(assignment.id ?? "")) ?? []
  );

  const classroomFeedback = classroomLogs.flatMap(
    log => feedbackByLog.get(String(log.id ?? "")) ?? []
  );

  const classroomDoubts = assignments.flatMap(
    assignment => doubtsByAssignment.get(String(assignment.id ?? "")) ?? []
  );

  const effectiveFeedback = classroomFeedback.map(row => ({
    ...row,
    effectiveUnderstandingLevel: getEffectiveUnderstandingLevel(
      row,
      classroomDoubts
    ),
  }));

  const doubtsAsked = classroomDoubts.length;
  const doubtsResolved = classroomDoubts.filter(
    doubt =>
      doubt.doubt_resolved === true ||
      String(doubt.status ?? "").trim().toUpperCase() === "RESOLVED"
  ).length;

  const understandingPercentage = pct(
    effectiveFeedback.filter(row => row.effectiveUnderstandingLevel === COMPLETE).length,
    effectiveFeedback.length
  );

  let healthTotal = 0;
  let healthLectureCount = 0;

  for (const log of classroomLogs) {
    const lectureFeedback = effectiveFeedback.filter(
      row => String(row.daily_log_uuid ?? "") === String(log.id ?? "")
    );

    if (lectureFeedback.length === 0) continue;

    const completely = lectureFeedback.filter(
      row => row.effectiveUnderstandingLevel === COMPLETE
    ).length;

    const partial = lectureFeedback.filter(
      row => row.effectiveUnderstandingLevel === PARTIAL
    ).length;

    const lectureHealth = Math.round(
      ((completely + partial * 0.5) / lectureFeedback.length) * 100
    );

    healthTotal += lectureHealth;
    healthLectureCount += 1;
  }

  const classHealthPercentage =
    healthLectureCount === 0 ? 0 : Math.round(healthTotal / healthLectureCount);

  const studentFeedbackPercentage = dailyStudentFeedbackRate(
    classroomLogs,
    feedbackByLog,
    rosterByClassroom.get(`${className}|||${sectionName}`) ?? 0
  );

  const doubtClosurePercentage = pct(doubtsResolved, doubtsAsked);

  const combinedScore = Math.round(
    (
      understandingPercentage +
      doubtClosurePercentage +
      classHealthPercentage +
      studentFeedbackPercentage
    ) / 4
  );

  return {
    classroom: `Class ${className} · Section ${sectionName}`,
    understandingPercentage,
    doubtClosurePercentage,
    classHealthPercentage,
    studentFeedbackPercentage,
    combinedScore,
    topicsTaught: classroomLogs.length,
    responses: classroomFeedback.length,
    doubtsAsked,
    doubtsResolved,
  };
}

export function generateCalendarPeriods(
  year: number,
  today = dateKey(new Date()),
  onboardingDate?: string | null
): StarPerformerPeriod[] {
  const periods: StarPerformerPeriod[] = [];
  const lowerBound = onboardingDate && /^\d{4}-\d{2}-\d{2}$/.test(onboardingDate)
    ? onboardingDate
    : `${year}-01-01`;

  // Generate the normal ISO calendar, then clamp the first visible period
  // to the school onboarding date. This prevents pre-onboarding dates from
  // appearing in either School Admin or Teacher Portal history.
  // Monday of the first ISO week that intersects the calendar year.
  const jan1 = new Date(`${year}-01-01T12:00:00`);
  const firstMonday = new Date(jan1);
  const day = firstMonday.getDay();
  const daysFromMonday = (day + 6) % 7;
  firstMonday.setDate(firstMonday.getDate() - daysFromMonday);

  let cursor = new Date(firstMonday);

  while (cursor.getFullYear() <= year || dateKey(cursor) <= `${year}-12-31`) {
    const start = dateKey(cursor);
    const endDate = new Date(cursor);
    endDate.setDate(endDate.getDate() + 6);
    const end = dateKey(endDate);

    if (end >= lowerBound && start <= `${year}-12-31`) {
      const firstThursday = new Date(cursor);
      firstThursday.setDate(firstThursday.getDate() + 3);
      const weekYear = firstThursday.getFullYear();

      const jan4 = new Date(`${weekYear}-01-04T12:00:00`);
      const jan4Day = jan4.getDay();
      const mondayOfWeek1 = new Date(jan4);
      mondayOfWeek1.setDate(jan4.getDate() - ((jan4Day + 6) % 7));

      const weekNumber = Math.round(
        (cursor.getTime() - mondayOfWeek1.getTime()) / 604800000
      ) + 1;

      const visibleStart = start < lowerBound ? lowerBound : start;
      if (visibleStart <= end && end >= lowerBound) {
        periods.push({
          periodType: "week",
          periodKey: `${weekYear}-W${String(weekNumber).padStart(2, "0")}`,
          periodLabel: `Week ${weekNumber} · ${formatDate(visibleStart)} – ${formatDate(end)}`,
          startDate: visibleStart,
          endDate: end,
          isComplete: end <= today,
        });
      }
    }

    cursor.setDate(cursor.getDate() + 7);
    if (cursor.getTime() > new Date(`${year + 1}-01-15T12:00:00`).getTime()) break;
  }

  for (let month = 0; month < 12; month += 1) {
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const last = new Date(year, month + 1, 0);
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(last.getDate()).padStart(2, "0")}`;

    const visibleStart = start < lowerBound ? lowerBound : start;
    if (visibleStart <= end && end >= lowerBound) {
      const monthName = last.toLocaleString("en-IN", { month: "long" });
      const label = visibleStart === start
        ? `${monthName} ${year}`
        : `${monthName} ${year} · ${formatDate(visibleStart)} – ${formatDate(end)}`;

      periods.push({
        periodType: "month",
        periodKey: `${year}-${String(month + 1).padStart(2, "0")}`,
        periodLabel: label,
        startDate: visibleStart,
        endDate: end,
        isComplete: end <= today,
      });
    }
  }

  return periods;
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function buildStarPerformerRows(
  raw: {
    schoolUuid: string;
    teachers: any[];
    assignments: any[];
    logs: any[];
    feedback: any[];
    doubts: any[];
    students: any[];
  },
  periods: StarPerformerPeriod[],
  today = dateKey(new Date())
): StarPerformerRow[] {
  const completedPeriods = periods.filter(period => period.isComplete);

  const activeAssignments = raw.assignments.filter(
    assignment => assignment.is_active !== false
  );

  const rosterByClassroom = new Map<string, number>();
  const rosterSets = new Map<string, Set<string>>();

  for (const student of raw.students) {
    const key = `${String(student.class_name ?? "")}|||${String(student.section_name ?? "")}`;
    const set = rosterSets.get(key) ?? new Set<string>();
    const uuid = String(student.student_uuid ?? "");
    if (uuid) set.add(uuid);
    rosterSets.set(key, set);
  }

  for (const [key, set] of rosterSets.entries()) {
    rosterByClassroom.set(key, set.size);
  }

  const teacherAssignmentsByTeacher = new Map<string, any[]>();

  for (const assignment of activeAssignments) {
    const teacherUuid = String(assignment.teacher_uuid ?? "");
    const list = teacherAssignmentsByTeacher.get(teacherUuid) ?? [];
    list.push(assignment);
    teacherAssignmentsByTeacher.set(teacherUuid, list);
  }

  return completedPeriods.map(period => {
    const periodLogs = raw.logs.filter(log =>
      inInclusiveRange(log.log_date, period.startDate, period.endDate)
    );

    const periodLogIds = new Set(
      periodLogs.map(log => String(log.id ?? "")).filter(Boolean)
    );

    const periodFeedback = raw.feedback.filter(row =>
      periodLogIds.has(String(row.daily_log_uuid ?? ""))
    );

    const periodDoubts = raw.doubts.filter(doubt =>
      inInclusiveRange(
        doubt.log_date ??
          doubt.first_seen_at ??
          doubt.latest_source_submitted_at ??
          doubt.source_submitted_at ??
          doubt.last_seen_at ??
          doubt.created_at,
        period.startDate,
        period.endDate
      )
    );

    const logsByAssignment = new Map<string, any[]>();
    for (const log of periodLogs) {
      const key = String(log.teacher_assignment_uuid ?? "");
      const list = logsByAssignment.get(key) ?? [];
      list.push(log);
      logsByAssignment.set(key, list);
    }

    const feedbackByLog = new Map<string, any[]>();
    for (const feedback of periodFeedback) {
      const key = String(feedback.daily_log_uuid ?? "");
      const list = feedbackByLog.get(key) ?? [];
      list.push(feedback);
      feedbackByLog.set(key, list);
    }

    const doubtsByAssignment = new Map<string, any[]>();
    for (const doubt of periodDoubts) {
      const key = String(doubt.teacher_assignment_uuid ?? "");
      const list = doubtsByAssignment.get(key) ?? [];
      list.push(doubt);
      doubtsByAssignment.set(key, list);
    }

    const metrics: StarPerformerTeacherMetric[] = raw.teachers
      .filter(teacher => teacher.is_active !== false)
      .map(teacher => {
        const teacherAssignments =
          teacherAssignmentsByTeacher.get(String(teacher.teacher_uuid ?? "")) ?? [];

        const classroomMap = new Map<string, any[]>();

        for (const assignment of teacherAssignments) {
          const key =
            `${String(assignment.class_name ?? "")}|||${String(assignment.section_name ?? "")}`;
          const list = classroomMap.get(key) ?? [];
          list.push(assignment);
          classroomMap.set(key, list);
        }

        const classMetrics = Array.from(classroomMap.entries()).map(
          ([key, classroomAssignments]) => {
            const [className, sectionName] = key.split("|||");

            return metricForClassroom(
              classroomAssignments,
              logsByAssignment,
              feedbackByLog,
              doubtsByAssignment,
              rosterByClassroom,
              className,
              sectionName
            );
          }
        );

        const count = classMetrics.length;

        const average = (key: keyof typeof classMetrics[number]) =>
          count === 0
            ? 0
            : Math.round(
                classMetrics.reduce(
                  (sum, item) => sum + Number(item[key] ?? 0),
                  0
                ) / count
              );

        return {
          teacherUuid: String(teacher.teacher_uuid ?? ""),
          teacherName: String(teacher.full_name ?? "Teacher"),
          classrooms: classMetrics.map(item => item.classroom),
          classroomCount: count,
          understandingPercentage: average("understandingPercentage"),
          doubtClosurePercentage: average("doubtClosurePercentage"),
          classHealthPercentage: average("classHealthPercentage"),
          studentFeedbackPercentage: average("studentFeedbackPercentage"),
          combinedScore: average("combinedScore"),
          classMetrics,
        };
      })
      .filter(metric => metric.classroomCount > 0);

    metrics.sort(
      (a, b) =>
        b.combinedScore - a.combinedScore ||
        b.classHealthPercentage - a.classHealthPercentage ||
        b.studentFeedbackPercentage - a.studentFeedbackPercentage ||
        a.teacherName.localeCompare(b.teacherName)
    );

    // Never award a 0% teacher merely because an active assignment exists.
    // A completed period with no classroom evidence is not a recognition event.
    const hasPeriodEvidence =
      periodLogs.length > 0 ||
      periodFeedback.length > 0 ||
      periodDoubts.length > 0;

    const winner = hasPeriodEvidence ? metrics[0] : undefined;

    return {
      schoolUuid: raw.schoolUuid,
      periodType: period.periodType,
      periodKey: period.periodKey,
      periodLabel: period.periodLabel,
      periodStart: period.startDate,
      periodEnd: period.endDate,
      teacherUuid: winner?.teacherUuid ?? null,
      teacherName: winner?.teacherName ?? null,
      classrooms: winner?.classrooms ?? [],
      understandingPercentage: winner?.understandingPercentage ?? null,
      doubtClosurePercentage: winner?.doubtClosurePercentage ?? null,
      classHealthPercentage: winner?.classHealthPercentage ?? null,
      studentFeedbackPercentage: winner?.studentFeedbackPercentage ?? null,
      combinedScore: winner?.combinedScore ?? null,
      isComplete: period.endDate <= today,
    };
  });
}

