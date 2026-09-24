import {
  aggregateLearningLectureMetrics,
  calculateLearningLectureMetrics,
} from "../../../utils/learningFeedbackAnalytics";
import {
  calculateDoubtClosureRate,
  calculateDoubtClosureRateFromCounts,
  countResolvedDoubts,
} from "../../../utils/analyticsConsistency";
import type {
  StarPerformerPeriod,
  StarPerformerRow,
  StarPerformerTeacherMetric,
} from "../types/StarPerformerModels";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

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

function normalizeConcept(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function getEffectiveUnderstandingLevel(feedback: any, doubts: any[]) {
  const original = feedback?.understanding_level;
  if (feedback?._live_reconciled === true) return original;
  if (original !== PARTIAL && original !== NONE) return original;
  const concepts = Array.isArray(feedback?.concepts_not_understood) ? feedback.concepts_not_understood.filter(Boolean) : [];
  if (!concepts.length) return original;
  const matches = doubts.filter((doubt) =>
    String(doubt?.daily_log_uuid ?? "") === String(feedback?.daily_log_uuid ?? "") &&
    String(doubt?.student_uuid ?? "") === String(feedback?.student_uuid ?? "") &&
    (!feedback?.subject_name || !doubt?.subject_name || normalizeConcept(doubt.subject_name) === normalizeConcept(feedback.subject_name)) &&
    concepts.some((concept: string) => normalizeConcept(doubt?.previous_difficult_concept ?? doubt?.doubt_concept ?? doubt?.previous_topic_name) === normalizeConcept(concept))
  );
  if (!matches.length) return original;
  const unresolved = concepts.filter((concept: string) =>
    !matches.some((doubt: any) =>
      normalizeConcept(doubt?.previous_difficult_concept ?? doubt?.doubt_concept ?? doubt?.previous_topic_name) === normalizeConcept(concept) &&
      !(doubt?.doubt_resolved === true || String(doubt?.status ?? "").trim().toUpperCase() === "RESOLVED" || String(doubt?.student_response ?? "").trim().toUpperCase() === "DISCUSSED")
    )
  );
  return unresolved.length === 0 ? COMPLETE : original;
}

function metricForClassroom(
  assignments: any[],
  logsByAssignment: Map<string, any[]>,
  feedbackByLog: Map<string, any[]>,
  doubtsByAssignment: Map<string, any[]>,
  rosterByClassroom: Map<string, Set<string>>,
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
  const doubtsResolved = countResolvedDoubts(classroomDoubts);

  const roster = rosterByClassroom.get(`${className}|||${sectionName}`) ?? new Set<string>();
  const lectureMetrics = classroomLogs.map(log =>
    calculateLearningLectureMetrics({
      studentUuids: roster,
      feedback: effectiveFeedback.filter(
        row => String(row.daily_log_uuid ?? "") === String(log.id ?? ""),
      ),
      getUnderstandingLevel: (row: any) => row.effectiveUnderstandingLevel,
    }),
  );
  const aggregate = aggregateLearningLectureMetrics(lectureMetrics);
  const understandingPercentage = aggregate.understandingRate;
  const classHealthPercentage = aggregate.classHealthPercentage;
  const studentFeedbackPercentage = aggregate.responseRate;

  const doubtClosurePercentage = calculateDoubtClosureRate(classroomDoubts);

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
    responses: aggregate.responseStudentObservations + aggregate.absentStudentObservations,
    doubtsAsked,
    doubtsResolved,
    eligibleStudentObservations: aggregate.eligibleStudentObservations,
    responseStudentObservations: aggregate.responseStudentObservations,
    completeStudentObservations: aggregate.completeStudentObservations,
    partialStudentObservations: aggregate.partialStudentObservations,
    didntUnderstandStudentObservations: aggregate.didntUnderstandStudentObservations,
    healthPercentageSum: aggregate.healthPercentageSum,
    healthLectureCount: aggregate.lectureCount,
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

  const rosterByClassroom = new Map<string, Set<string>>();
  const rosterSets = new Map<string, Set<string>>();

  for (const student of raw.students) {
    const key = `${String(student.class_name ?? "")}|||${String(student.section_name ?? "")}`;
    const set = rosterSets.get(key) ?? new Set<string>();
    const uuid = String(student.student_uuid ?? "");
    if (uuid) set.add(uuid);
    rosterSets.set(key, set);
  }

  for (const [key, set] of rosterSets.entries()) {
    rosterByClassroom.set(key, set);
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
        const eligible = classMetrics.reduce((sum, item) => sum + item.eligibleStudentObservations, 0);
        const responses = classMetrics.reduce((sum, item) => sum + item.responseStudentObservations, 0);
        const complete = classMetrics.reduce((sum, item) => sum + item.completeStudentObservations, 0);
        const healthLectureCount = classMetrics.reduce((sum, item) => sum + item.healthLectureCount, 0);
        const healthSum = classMetrics.reduce((sum, item) => sum + item.healthPercentageSum, 0);
        const doubtsAsked = classMetrics.reduce((sum, item) => sum + item.doubtsAsked, 0);
        const doubtsResolved = classMetrics.reduce((sum, item) => sum + item.doubtsResolved, 0);
        const understandingPercentage = eligible === 0 ? 0 : Math.round((complete / eligible) * 100);
        const studentFeedbackPercentage = eligible === 0 ? 0 : Math.round((responses / eligible) * 100);
        const classHealthPercentage = healthLectureCount === 0 ? 0 : Math.round(healthSum / healthLectureCount);
        const doubtClosurePercentage = calculateDoubtClosureRateFromCounts(doubtsAsked, doubtsResolved);
        const combinedScore = Math.round(
          (understandingPercentage + doubtClosurePercentage + classHealthPercentage + studentFeedbackPercentage) / 4,
        );

        return {
          teacherUuid: String(teacher.teacher_uuid ?? ""),
          teacherName: String(teacher.full_name ?? "Teacher"),
          classrooms: classMetrics.map(item => item.classroom),
          classroomCount: count,
          understandingPercentage,
          doubtClosurePercentage,
          classHealthPercentage,
          studentFeedbackPercentage,
          combinedScore,
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

