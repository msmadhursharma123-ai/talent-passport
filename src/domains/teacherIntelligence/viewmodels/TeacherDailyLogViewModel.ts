import type { TeacherDailyLog } from "../types/TeacherDailyLog";

import {
  getTeacherDailyLogs,
  getTeacherDailyLogsByAssignment,
  createTeacherDailyLog,
  updateTeacherDailyLog,
  deleteTeacherDailyLog,
  getTodaysTeacherDailyLogsByAssignment
} from "../repository/TeacherDailyLogRepository";

import {
processPendingDoubts,
}
from "../repository/DoubtResolutionEngine";

export async function loadTeacherDailyLogs() {
  return await getTeacherDailyLogs();
}



export async function loadTeacherLogsByAssignment(
  teacherAssignmentUuid: string
) {
  return await getTeacherDailyLogsByAssignment(
    teacherAssignmentUuid
  );
}



export async function saveTeacherDailyLog(
  dailyLog: Record<string, unknown>
) {
  /*
   * PRIMARY WRITE PATH
   * ------------------
   * teacher_daily_logs is the authoritative publication action.
   * A failure here means the teacher publication genuinely failed.
   *
   * The existing DoubtResolutionEngine is secondary intelligence and
   * is deliberately isolated so it cannot make a successful lecture
   * insert appear to the teacher as a failed save.
   */
  const result = await createTeacherDailyLog(dailyLog);

  const teacherAssignmentUuid = String(
    dailyLog.teacher_assignment_uuid ?? ""
  ).trim();

  const conceptsCovered = Array.isArray(
    dailyLog["concepts_covered"]
  )
    ? (dailyLog["concepts_covered"] as unknown[])
        .map((item) => String(item ?? "").trim())
        .filter(Boolean)
    : [];

  if (!teacherAssignmentUuid) {
    console.warn(
      "SECOND FEEDBACK LOOP SKIPPED: teacher_assignment_uuid is missing after a successful daily-log save."
    );
    return result;
  }

  try {
    console.log(
      "RUNNING SECOND LOOP AFTER SUCCESSFUL DAILY LOG SAVE"
    );
    console.log(
      "TEACHER ASSIGNMENT UUID:",
      teacherAssignmentUuid
    );
    console.table(conceptsCovered);

    await processPendingDoubts(
      teacherAssignmentUuid,
      conceptsCovered
    );
  } catch (error) {
    /* The row is already persisted. Never throw the secondary error. */
    console.error(
      "SECOND FEEDBACK LOOP FAILED AFTER DAILY LOG WAS SAVED",
      error
    );
  }

  return result;
}

export async function editTeacherDailyLog(
  id: string,
  dailyLog: Record<string, unknown>
) {
  return await updateTeacherDailyLog(
    id,
    dailyLog
  );
}



export async function removeTeacherDailyLog(
  id: string
) {
  return await deleteTeacherDailyLog(
    id
  );
}

export async function loadTodaysTeacherLogsByAssignment(
  teacherAssignmentUuid: string
) {

  return await getTodaysTeacherDailyLogsByAssignment(
    teacherAssignmentUuid
  );

}