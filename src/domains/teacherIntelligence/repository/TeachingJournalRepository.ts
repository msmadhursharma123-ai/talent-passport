import { getSupabaseClient } from "../../../supabaseClient";

import {
getTeacherAssignmentsByTeacher,
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

dailyLogIds:string[]

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


return data ?? [];

}

export async function getOverallClassroomComparison(
  selectedMonth: string
) {
  const teacher = getCurrentTeacher();

  if (!teacher) {
    return [];
  }

  const assignments =
    await getTeacherAssignmentsByTeacher(
      teacher.teacherUuid
    );

  const parsed = selectedMonth.trim().split(/\s+/);
  const monthName = parsed[0];
  const selectedYear =
    Number(parsed[1]) || new Date().getFullYear();

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

  if (monthIndex < 0) {
    return [];
  }

  const monthStartDate =
    `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}-01`;

  const nextMonthDate =
    monthIndex === 11
      ? `${selectedYear + 1}-01-01`
      : `${selectedYear}-${String(monthIndex + 2).padStart(2, "0")}-01`;

  const isInSelectedMonth = (dateValue: unknown) => {
    const date = new Date(String(dateValue ?? ""));
    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return (
      date.getFullYear() === selectedYear &&
      date.getMonth() === monthIndex
    );
  };

  const supabase = getSupabaseClient();

  const comparisonData =
    await Promise.all(
      assignments.map(async (assignment: any) => {
        const dailyLogs =
          await getTeacherDailyLogsByAssignment(
            assignment.id
          );

        const monthlyLogs =
          dailyLogs.filter((log) =>
            isInSelectedMonth(log.logDate)
          );

        const dailyLogIds =
          monthlyLogs
            .map((log) => log.id)
            .filter(Boolean);

        const feedback =
          await getMonthlyComprehensionData(
            dailyLogIds
          );

        const { data: doubtRows, error: doubtError } =
          await (supabase as any)
            .from("pending_teacher_doubts")
            .select(
              "id,status,doubt_resolved,teacher_assignment_uuid,log_date,revision_checked_at"
            )
            .eq(
              "teacher_assignment_uuid",
              assignment.id
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

        const monthlyDoubts =
          doubtRows ?? [];

        const doubtsAsked =
          monthlyDoubts.length;

        const doubtsResolved =
          monthlyDoubts.filter(
            (doubt: any) =>
              doubt.doubt_resolved === true ||
              String(
                doubt.status ?? ""
              )
                .trim()
                .toUpperCase() === "RESOLVED"
          ).length;

        const doubtClosureRate =
          doubtsAsked === 0
            ? 0
            : Math.round(
                (doubtsResolved / doubtsAsked) *
                  100
              );

        let totalHealthScore = 0;
        let lectureCount = 0;
        let totalDoubtPercentage = 0;

        for (const log of monthlyLogs) {
          const logFeedback =
            feedback.filter(
              (item: any) =>
                item.daily_log_uuid === log.id
            );

          if (logFeedback.length === 0) {
            continue;
          }

          const completely =
            logFeedback.filter(
              (item: any) =>
                item.understanding_level ===
                "I completely understood."
            ).length;

          const partial =
            logFeedback.filter(
              (item: any) =>
                item.understanding_level ===
                "I partially understood."
            ).length;

          const difficult =
            logFeedback.filter(
              (item: any) =>
                item.understanding_level ===
                "I didn't understand."
            ).length;

          const healthScore =
            Math.round(
              (
                (
                  completely +
                  partial * 0.5
                ) /
                logFeedback.length
              ) *
                100
            );

          totalHealthScore +=
            healthScore;

          const doubtPercentage =
            Math.round(
              (
                (partial + difficult) /
                logFeedback.length
              ) *
                100
            );

          totalDoubtPercentage +=
            doubtPercentage;

          lectureCount++;
        }

        const averageHealthScore =
          lectureCount === 0
            ? 0
            : Math.round(
                totalHealthScore /
                  lectureCount
              );

        const averageDoubtPercentage =
          lectureCount === 0
            ? 0
            : Math.round(
                totalDoubtPercentage /
                  lectureCount
              );

        const averageFeedbackPercentage =
          monthlyLogs.length === 0
            ? 0
            : 100;

        const riskStudents =
          await getStudentsAtRisk(
            assignment.className,
            assignment.sectionName
          );

        const totalRiskStudents =
          riskStudents.veryCritical.length +
          riskStudents.critical.length +
          riskStudents.moderate.length;

        return {
          classroom:
            `Class ${assignment.className}-${assignment.sectionName}`,
          averageHealthScore,
          averageDoubtPercentage,
          averageFeedbackPercentage,
          studentsAtRisk:
            totalRiskStudents,

          // NEW: real doubt-closure metric.
          // Denominator = doubts generated by the
          // existing doubt-resolution loop.
          doubtsAsked,
          doubtsResolved,
          doubtClosureRate,
        };
      })
    );

  return comparisonData;
}

export interface CurrentMonthClassroomMetric {
  assignmentId: string;
  classroom: string;
  className: string;
  sectionName: string;

  // Kept for compatibility with the existing Teaching Journal.
  averageUnderstanding: number;
  feedbackDays: number;
  totalResponses: number;
  hasData: boolean;

  // NEW reward metric.
  doubtsAsked: number;
  doubtsResolved: number;
  doubtClosureRate: number;
  hasDoubtData: boolean;
}

/* ============================================================
   CURRENT-MONTH TEACHER REWARD DATA

   Teacher incentives are now based on DOUBT CLOSURE RATE.

   Formula:
       resolved doubts / total doubts raised * 100

   The doubts counted here are the records created by the
   existing pending-teacher-doubt loop. A doubt becomes resolved
   when the student confirms that it was discussed/resolved.

   The calculation uses the current calendar month only, so the
   incentive cycle naturally starts from zero when a new month
   begins.
   ============================================================ */
export async function getCurrentMonthClassroomMetrics(
  teacherAssignments?: any[]
): Promise<CurrentMonthClassroomMetric[]> {
  const teacher = getCurrentTeacher();

  if (!teacher) {
    return [];
  }

  const assignments =
    teacherAssignments &&
    teacherAssignments.length > 0
      ? teacherAssignments
      : await getTeacherAssignmentsByTeacher(
          teacher.teacherUuid
        );

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthStartDate =
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;

  const nextMonthDate =
    currentMonth === 11
      ? `${currentYear + 1}-01-01`
      : `${currentYear}-${String(currentMonth + 2).padStart(2, "0")}-01`;

  const supabase = getSupabaseClient();

  const metrics =
    await Promise.all(
      assignments.map(
        async (assignment: any) => {
          const dailyLogs =
            await getTeacherDailyLogsByAssignment(
              assignment.id
            );

          const monthlyLogs =
            dailyLogs.filter((log: any) => {
              const date = new Date(
                log.logDate
              );

              return (
                date.getFullYear() ===
                  currentYear &&
                date.getMonth() ===
                  currentMonth
              );
            });

          const dailyLogIds =
            monthlyLogs
              .map((log: any) => log.id)
              .filter(Boolean);

          const feedback =
            await getMonthlyComprehensionData(
              dailyLogIds
            );

          const {
            data: doubtRows,
            error: doubtError,
          } = await (supabase as any)
            .from(
              "pending_teacher_doubts"
            )
            .select(
              "id,status,doubt_resolved,teacher_assignment_uuid,log_date,revision_checked_at"
            )
            .eq(
              "teacher_assignment_uuid",
              assignment.id
            )
            .gte(
              "log_date",
              monthStart
                .toISOString()
                .slice(0, 10)
            )
            .lt(
              "log_date",
              nextMonthStart
                .toISOString()
                .slice(0, 10)
            );

          if (doubtError) {
            throw doubtError;
          }

          const monthlyDoubts =
            doubtRows ?? [];

          const doubtsAsked =
            monthlyDoubts.length;

          const doubtsResolved =
            monthlyDoubts.filter(
              (doubt: any) =>
                doubt.doubt_resolved ===
                  true ||
                String(
                  doubt.status ?? ""
                )
                  .trim()
                  .toUpperCase() ===
                  "RESOLVED"
            ).length;

          const doubtClosureRate =
            doubtsAsked === 0
              ? 0
              : Math.round(
                  (doubtsResolved /
                    doubtsAsked) *
                    100
                );

          let scoreTotal = 0;
          let feedbackDays = 0;
          let totalResponses = 0;

          // Existing comprehension data is retained for the
          // rest of the Teaching Journal; it is NOT used for
          // voucher qualification anymore.
          for (const log of monthlyLogs) {
            const logFeedback =
              feedback.filter(
                (item: any) =>
                  item.daily_log_uuid ===
                  log.id
              );

            if (
              logFeedback.length === 0
            ) {
              continue;
            }

            const completely =
              logFeedback.filter(
                (item: any) =>
                  item.understanding_level ===
                  "I completely understood."
              ).length;

            const partial =
              logFeedback.filter(
                (item: any) =>
                  item.understanding_level ===
                  "I partially understood."
              ).length;

            const dailyScore =
              Math.round(
                (
                  (
                    completely +
                    partial * 0.5
                  ) /
                  logFeedback.length
                ) *
                  100
              );

            scoreTotal +=
              dailyScore;
            feedbackDays += 1;
            totalResponses +=
              logFeedback.length;
          }

          const averageUnderstanding =
            feedbackDays === 0
              ? 0
              : Math.round(
                  scoreTotal /
                    feedbackDays
                );

          return {
            assignmentId: String(
              assignment.id
            ),
            classroom:
              `Class ${assignment.className}-${assignment.sectionName}`,
            className:
              assignment.className ??
              "",
            sectionName:
              assignment.sectionName ??
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
      )
    );

  return metrics;
}
