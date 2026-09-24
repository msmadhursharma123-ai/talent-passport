import {
  aggregateLearningLectureMetrics,
  calculateLearningLectureMetrics,
} from "../../../utils/learningFeedbackAnalytics";
import {
  calculateDoubtClosureRate,
  calculateLearningDoubtRate,
  countResolvedDoubts,
} from "../../../utils/analyticsConsistency";
import { getSupabaseClient } from "../../../supabaseClient";
import {
  getLiveDoubtsForTeacherAssignments,
  mergeFeedbackUnderstandingLevels,
  mergePendingDoubtsWithLiveLedger,
} from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";

import {
getTeacherAssignmentsByTeacher,
filterTeacherAssignmentsToSchool,
}
from "./TeacherAssignmentRepository";


import {
getTeacherDailyLogsByAssignment,
}
from "./TeacherDailyLogRepository";


import {
getStudentsAtRisk,
}
from "./TeacherFeedbackAnalyticsRepository";


import {
getCurrentTeacher,
}
from "../../../services/identityService";

export async function getMonthlyComprehensionData(

dailyLogIds:string[],
teacherAssignmentIds:string[] = []

){

const supabase = getSupabaseClient();


if(dailyLogIds.length === 0){

return [];

}


const { data } =

await (supabase as any)

.from("student_daily_feedback")

.select("*")

.in(

"daily_log_uuid",

dailyLogIds

);


if (!teacherAssignmentIds.length) {
return data ?? [];
}

const liveRows = await getLiveDoubtsForTeacherAssignments(teacherAssignmentIds.map(String));
const logIds = new Set(dailyLogIds.map(String));
const scopedLiveRows = liveRows.filter((row:any) =>
logIds.has(String(row.daily_log_uuid ?? ""))
);

return mergeFeedbackUnderstandingLevels(data ?? [], scopedLiveRows);

}


/* ============================================================
   INTERNAL HELPERS
   ============================================================ */

function parseSelectedMonth(
  selectedMonth: string
) {
  const parsed =
    selectedMonth
      .trim()
      .split(/\s+/);

  const monthName =
    parsed[0];

  const selectedYear =
    Number(parsed[1]) ||
    new Date().getFullYear();

  const monthIndex = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ].indexOf(monthName);

  return {
    selectedYear,
    monthIndex,
  };
}

function groupAssignmentsByClassroom(
  assignments: any[]
) {
  const groups =
    new Map<
      string,
      any[]
    >();

  for (
    const assignment of assignments
  ) {

    if (
      assignment?.isActive === false
    ) {
      continue;
    }

    const classroom =
      `${assignment.className}-${assignment.sectionName}`;

    const group =
      groups.get(classroom) ?? [];

    group.push(assignment);

    groups.set(
      classroom,
      group
    );

  }

  return Array.from(
    groups.entries()
  );
}

function isDateInMonth(
  dateValue: unknown,
  selectedYear: number,
  monthIndex: number
) {

  const date =
    new Date(
      String(
        dateValue ?? ""
      )
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return false;
  }

  return (
    date.getFullYear() ===
      selectedYear &&
    date.getMonth() ===
      monthIndex
  );
}


/* ============================================================
   OVERALL CLASSROOM COMPARISON
   ============================================================ */

export async function getOverallClassroomComparison(
  selectedMonth: string
) {

  const teacher =
    getCurrentTeacher();

  if (!teacher) {
    return [];
  }

  const assignments = filterTeacherAssignmentsToSchool(
    await getTeacherAssignmentsByTeacher(teacher.teacherUuid),
    teacher.schoolUuid
  );

  const {
    selectedYear,
    monthIndex,
  } = parseSelectedMonth(
    selectedMonth
  );

  if (monthIndex < 0) {
    return [];
  }

  const monthStartDate =
    `${selectedYear}-${String(
      monthIndex + 1
    ).padStart(2, "0")}-01`;

  const nextMonthDate =
    monthIndex === 11
      ? `${selectedYear + 1}-01-01`
      : `${selectedYear}-${String(
          monthIndex + 2
        ).padStart(2, "0")}-01`;

  const classroomGroups =
    groupAssignmentsByClassroom(
      assignments
    );

  if (
    classroomGroups.length === 0
  ) {
    return [];
  }

  const assignmentIds =
    classroomGroups
      .flatMap(
        ([, group]) =>
          group.map(
            (assignment) =>
              assignment.id
          )
      )
      .filter(Boolean);

  const supabase =
    getSupabaseClient();

  /*
   One logs query for all classrooms.
  */
  const {
    data:allLogs,
    error:logsError,
  } = await (supabase as any)
    .from("teacher_daily_logs")
    .select("*")
    .in(
      "teacher_assignment_uuid",
      assignmentIds
    )
    .order(
      "log_date",
      { ascending:false }
    )
    .order(
      "created_at",
      { ascending:false }
    );

  if (logsError) {
    throw logsError;
  }

  const monthlyLogs =
    (allLogs ?? []).filter(
      (log:any) =>
        isDateInMonth(
          log.log_date,
          selectedYear,
          monthIndex
        )
    );

  const dailyLogIds =
    monthlyLogs
      .map(
        (log:any) => log.id
      )
      .filter(Boolean);

  /*
   One feedback query for the entire selected month.
  */
  const feedback =
    await getMonthlyComprehensionData(
      dailyLogIds
    );

  /*
   One doubt query for the entire selected month.
  */
  const {
    data:doubtRows,
    error:doubtError,
  } = await (supabase as any)
    .from(
      "pending_teacher_doubts"
    )
    .select(
      "id,student_uuid,student_name,teacher_assignment_uuid,daily_log_uuid,status,student_response,school_name,class_name,section_name,subject_name,previous_topic_name,previous_difficult_concept,log_date,doubt_resolved,revision_checked_at,created_at"
    )
    .in(
      "teacher_assignment_uuid",
      assignmentIds
    )
    .gte(
      "log_date",
      monthStartDate
    )
    .lt(
      "log_date",
      nextMonthDate
    );

  if (doubtError) {
    throw doubtError;
  }

  const liveRows = (
    await getLiveDoubtsForTeacherAssignments(
      assignmentIds
    )
  ).filter((row) => {
    const sourceDate = String(
      row.first_seen_at ??
        row.latest_source_submitted_at ??
        row.source_submitted_at ??
        row.last_seen_at ??
        ""
    ).slice(0, 10);
    return sourceDate >= monthStartDate && sourceDate < nextMonthDate;
  });

  const effectiveDoubtRows =
    mergePendingDoubtsWithLiveLedger(
      doubtRows ?? [],
      liveRows
    );

  const effectiveFeedback =
    mergeFeedbackUnderstandingLevels(
      feedback ?? [],
      liveRows
    );

  let teachingJournalStudentsQuery = supabase
    .from("students_master")
    .select("student_uuid,class_name,section_name,school_uuid");
  if (teacher.schoolUuid) {
    teachingJournalStudentsQuery = teachingJournalStudentsQuery.eq("school_uuid", teacher.schoolUuid);
  }
  const { data: teachingJournalStudents, error: teachingJournalStudentsError } = await teachingJournalStudentsQuery;
  if (teachingJournalStudentsError) throw teachingJournalStudentsError;
  const teachingJournalRosterByClassroom = new Map<string, Set<string>>();
  for (const student of teachingJournalStudents ?? []) {
    const key = `${String(student.class_name ?? "").trim()}-${String(student.section_name ?? "").trim()}`;
    const set = teachingJournalRosterByClassroom.get(key) ?? new Set<string>();
    if (student.student_uuid) set.add(String(student.student_uuid));
    teachingJournalRosterByClassroom.set(key, set);
  }

  const comparisonData =
    await Promise.all(
      classroomGroups.map(
        async (
          [classroom, group]
        ) => {

          const groupIds =
            group
              .map(
                (assignment) =>
                  assignment.id
              )
              .filter(Boolean);

          const classroomLogs =
            monthlyLogs.filter(
              (log:any) =>
                groupIds.includes(
                  log.teacher_assignment_uuid
                )
            );

          const classroomLogIds =
            new Set(
              classroomLogs.map(
                (log:any) => log.id
              )
            );

          const classroomFeedback =
            effectiveFeedback.filter(
              (item:any) =>
                classroomLogIds.has(
                  item.daily_log_uuid
                )
            );

          const classroomDoubts =
            effectiveDoubtRows.filter(
              (doubt:any) =>
                groupIds.includes(
                  doubt.teacher_assignment_uuid
                )
            );

          const doubtsAsked =
            classroomDoubts.length;

          const doubtsResolved = countResolvedDoubts(classroomDoubts);

          const doubtClosureRate = calculateDoubtClosureRate(classroomDoubts);

          const eligibleStudents =
            teachingJournalRosterByClassroom.get(classroom) ?? new Set<string>();

          const lectureMetrics = classroomLogs.map((log: any) =>
            calculateLearningLectureMetrics({
              studentUuids: eligibleStudents,
              feedback: classroomFeedback.filter(
                (item: any) => String(item.daily_log_uuid) === String(log.id),
              ),
              getUnderstandingLevel: (item: any) => item.understanding_level,
            }),
          );
          const aggregate = aggregateLearningLectureMetrics(lectureMetrics);

          const averageHealthScore = aggregate.classHealthPercentage;
          const averageUnderstandingPercentage = aggregate.understandingRate;
          const averagePartialPercentage = aggregate.partialRate;
          const averageDidntUnderstandPercentage = aggregate.didntUnderstandRate;
          const averageDoubtPercentage = calculateLearningDoubtRate(
            aggregate.partialStudentObservations,
            aggregate.didntUnderstandStudentObservations,
            aggregate.eligibleStudentObservations,
          );
          const averageFeedbackPercentage = aggregate.responseRate;

          let studentsAtRisk = 0;

          try {

            const riskStudents =
              await getStudentsAtRisk(
                group[0].className,
                group[0].sectionName
              );

            studentsAtRisk =
              riskStudents.veryCritical.length +
              riskStudents.critical.length +
              riskStudents.moderate.length;

          } catch (error) {

            console.error(
              "TEACHING JOURNAL RISK DATA FAILED",
              classroom,
              error
            );

          }

          return {
            classroom:
              `Class ${classroom}`,

            averageHealthScore,
            averageUnderstandingPercentage,
            averagePartialPercentage,
            averageDidntUnderstandPercentage,

            averageDoubtPercentage,

            averageFeedbackPercentage,

            studentsAtRisk,

            doubtsAsked,

            doubtsResolved,

            doubtClosureRate,
          };

        }
      )
    );

  return comparisonData;
}

/* ============================================================
   CURRENT MONTH CLASSROOM REWARD DATA
   ============================================================ */

export interface CurrentMonthClassroomMetric {

  assignmentId: string;

  classroom: string;

  className: string;

  sectionName: string;

  averageUnderstanding: number;

  feedbackDays: number;

  totalResponses: number;

  hasData: boolean;

  doubtsAsked: number;

  doubtsResolved: number;

  doubtClosureRate: number;

  hasDoubtData: boolean;

}

/*
 ============================================================
 CURRENT-MONTH TEACHER REWARD DATA

 Teacher incentives are based on DOUBT CLOSURE RATE.

 Formula:
     resolved doubts / total doubts raised * 100

 The doubt ledger is the existing pending_teacher_doubts
 loop. A doubt is resolved when the student confirms that it
 was discussed/resolved, or when the teacher directly covered
 the common difficult concept in the next daily log.

 The metric is calculated per classroom, not per subject
 assignment. This prevents one class taught across multiple
 subjects from being counted multiple times for vouchers.
 ============================================================
 */

export async function getCurrentMonthClassroomMetrics(
  teacherAssignments?: any[]
): Promise<
  CurrentMonthClassroomMetric[]
> {

  const teacher =
    getCurrentTeacher();

  if (!teacher) {
    return [];
  }

  const assignments = filterTeacherAssignmentsToSchool(
    teacherAssignments && teacherAssignments.length > 0
      ? teacherAssignments
      : await getTeacherAssignmentsByTeacher(teacher.teacherUuid),
    teacher.schoolUuid
  );

  const classroomGroups =
    groupAssignmentsByClassroom(
      assignments
    );

  if (
    classroomGroups.length === 0
  ) {
    return [];
  }

  const now =
    new Date();

  const currentYear =
    now.getFullYear();

  const currentMonth =
    now.getMonth();

  const monthStartDate =
    `${currentYear}-${String(
      currentMonth + 1
    ).padStart(2, "0")}-01`;

  const nextMonthDate =
    currentMonth === 11
      ? `${currentYear + 1}-01-01`
      : `${currentYear}-${String(
          currentMonth + 2
        ).padStart(2, "0")}-01`;

  const assignmentIds =
    classroomGroups
      .flatMap(
        ([, group]) =>
          group.map(
            (assignment) =>
              assignment.id
          )
      )
      .filter(Boolean);

  const supabase =
    getSupabaseClient();

  /*
   One logs query for all classrooms.
  */
  const {
    data:allLogs,
    error:logsError,
  } = await (supabase as any)
    .from("teacher_daily_logs")
    .select("*")
    .in(
      "teacher_assignment_uuid",
      assignmentIds
    )
    .order(
      "log_date",
      { ascending:false }
    )
    .order(
      "created_at",
      { ascending:false }
    );

  if (logsError) {
    throw logsError;
  }

  const monthlyLogs =
    (allLogs ?? []).filter(
      (log:any) =>
        isDateInMonth(
          log.log_date,
          currentYear,
          currentMonth
        )
    );

  const dailyLogIds =
    monthlyLogs
      .map(
        (log:any) => log.id
      )
      .filter(Boolean);

  /*
   One feedback query for all monthly logs.
  */
  const feedback =
    await getMonthlyComprehensionData(
      dailyLogIds
    );

  /*
   One doubt query for all assignments.
  */
  const {
    data:doubtRows,
    error:doubtError,
  } = await (supabase as any)
    .from(
      "pending_teacher_doubts"
    )
    .select(
      "id,status,doubt_resolved,student_uuid,teacher_assignment_uuid,daily_log_uuid,previous_topic_name,previous_difficult_concept,log_date,revision_checked_at,student_response"
    )
    .in(
      "teacher_assignment_uuid",
      assignmentIds
    )
    .gte(
      "log_date",
      monthStartDate
    )
    .lt(
      "log_date",
      nextMonthDate
    );

  if (doubtError) {
    throw doubtError;
  }

  /*
     LIVE DOUBT RECONCILIATION OVERLAY
     ---------------------------------
     Keep pending_teacher_doubts as the authoritative Loop-2 ledger,
     but project the student's verified reconciliation state over it
     for the analytics layer. This is intentionally additive: the
     original query and classroom grouping remain unchanged.
  */
  const liveRows = (
    await getLiveDoubtsForTeacherAssignments(
      assignmentIds
    )
  ).filter((row) => {
    const sourceDate = String(
      row.first_seen_at ??
        row.latest_source_submitted_at ??
        row.source_submitted_at ??
        row.last_seen_at ??
        ""
    ).slice(0, 10);
    return sourceDate >= monthStartDate && sourceDate < nextMonthDate;
  });

  const effectiveDoubtRows =
    mergePendingDoubtsWithLiveLedger(
      doubtRows ?? [],
      liveRows
    );

  const effectiveFeedback =
    mergeFeedbackUnderstandingLevels(
      feedback ?? [],
      liveRows
    );

  const { data: rosterStudents, error: rosterError } = await (supabase as any)
    .from("students_master")
    .select("student_uuid,class_name,section_name,school_uuid")
    .eq("school_uuid", teacher.schoolUuid);

  if (rosterError) throw rosterError;

  const rosterByClassroom = new Map<string, Set<string>>();
  for (const student of rosterStudents ?? []) {
    const key = `${String(student.class_name ?? "").trim()}-${String(student.section_name ?? "").trim()}`;
    const set = rosterByClassroom.get(key) ?? new Set<string>();
    if (student.student_uuid) set.add(String(student.student_uuid));
    rosterByClassroom.set(key, set);
  }

  return classroomGroups.map(
    ([classroom, group]) => {

      const groupIds =
        group
          .map(
            (assignment) =>
              assignment.id
          )
          .filter(Boolean);

      const classroomLogs =
        monthlyLogs.filter(
          (log:any) =>
            groupIds.includes(
              log.teacher_assignment_uuid
            )
        );

      const classroomLogIds =
        new Set(
          classroomLogs.map(
            (log:any) => log.id
          )
        );

      const classroomFeedback =
        effectiveFeedback.filter(
          (item:any) =>
            classroomLogIds.has(
              item.daily_log_uuid
            )
        );

      const classroomDoubts =
        effectiveDoubtRows.filter(
          (doubt:any) =>
            groupIds.includes(
              doubt.teacher_assignment_uuid
            )
        );

      const doubtsAsked =
        classroomDoubts.length;

      const doubtsResolved = countResolvedDoubts(classroomDoubts);

      const doubtClosureRate = calculateDoubtClosureRate(classroomDoubts);

      const roster = rosterByClassroom.get(classroom) ?? new Set<string>();
      const lectureMetrics = classroomLogs.map((log: any) =>
        calculateLearningLectureMetrics({
          studentUuids: roster,
          feedback: classroomFeedback.filter(
            (item: any) => String(item.daily_log_uuid) === String(log.id),
          ),
          getUnderstandingLevel: (item: any) => item.understanding_level,
        }),
      );
      const aggregate = aggregateLearningLectureMetrics(lectureMetrics);
      const averageUnderstanding = aggregate.classHealthPercentage;
      const feedbackDays = aggregate.lectureCount;
      const totalResponses =
        aggregate.responseStudentObservations + aggregate.absentStudentObservations;

      return {

        assignmentId:
          String(
            group[0].id
          ),

        classroom:
          `Class ${group[0].className}-${group[0].sectionName}`,

        className:
          group[0].className ??
          "",

        sectionName:
          group[0].sectionName ??
          "",

        averageUnderstanding,

        feedbackDays,

        totalResponses,

        hasData:
          feedbackDays > 0,

        doubtsAsked,

        doubtsResolved,

        doubtClosureRate,

        hasDoubtData:
          doubtsAsked > 0,

      };

    }
  );

}

export async function getTeachingJournalLectureMetrics(
  assignmentId: string,
  logs: any[],
  feedback: any[],
) {
  const supabase = getSupabaseClient();
  const teacher = getCurrentTeacher();
  if (!supabase || !teacher?.schoolUuid || !assignmentId) return new Map<string, any>();

  const { data: assignment, error: assignmentError } = await (supabase as any)
    .from("teacher_classroom_assignments")
    .select("id,class_name,section_name,school_uuid")
    .eq("id", assignmentId)
    .eq("school_uuid", teacher.schoolUuid)
    .maybeSingle();

  if (assignmentError) throw assignmentError;
  if (!assignment) return new Map<string, any>();

  const { data: students, error: studentError } = await (supabase as any)
    .from("students_master")
    .select("student_uuid,class_name,section_name,school_uuid")
    .eq("school_uuid", teacher.schoolUuid)
    .eq("class_name", assignment.class_name)
    .eq("section_name", assignment.section_name);

  if (studentError) throw studentError;

  const roster = new Set(
    (students ?? [])
      .map((student: any) => String(student.student_uuid ?? "").trim())
      .filter(Boolean),
  );

  const metrics = new Map<string, any>();
  for (const log of logs ?? []) {
    const lectureFeedback = (feedback ?? []).filter(
      (row: any) => String(row.daily_log_uuid ?? "") === String(log.id ?? ""),
    );
    metrics.set(
      String(log.id ?? ""),
      calculateLearningLectureMetrics({
        studentUuids: roster,
        feedback: lectureFeedback,
      }),
    );
  }

  return metrics;
}
