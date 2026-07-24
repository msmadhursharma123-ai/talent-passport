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

const result =

await createTeacherDailyLog(
dailyLog
);


/*
------------------------------------

SECOND FEEDBACK LOOP

------------------------------------
*/

const teacherAssignmentUuid =

String(
dailyLog.teacher_assignment_uuid
);


const conceptsCovered =

Array.isArray(

dailyLog["concepts_covered"]

)

? dailyLog["concepts_covered"]

: [];


console.log(
"RUNNING SECOND LOOP"
);

console.log(
teacherAssignmentUuid
);

console.table(
conceptsCovered
);


await processPendingDoubts(

teacherAssignmentUuid,

conceptsCovered

);


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