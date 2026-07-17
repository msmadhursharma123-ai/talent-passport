import type { TeacherDailyLog } from "../types/TeacherDailyLog";

import {
  getTeacherDailyLogs,
  getTeacherDailyLogsByAssignment,
  createTeacherDailyLog,
  updateTeacherDailyLog,
  deleteTeacherDailyLog,
} from "../repository/TeacherDailyLogRepository";



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
  return await createTeacherDailyLog(
    dailyLog
  );
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