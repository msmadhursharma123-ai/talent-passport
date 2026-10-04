import { getSupabaseClient } from "../../../supabaseClient";

import { getCurrentTeacher }
from "../../../services/identityService";

import {
getTeacherAssignmentsByTeacher,
} from "./TeacherAssignmentRepository";


export interface PendingDoubtLedger {

classroom:string;

pendingCount:number;

previousTopic:string;

difficultConcept:string;

students:string;

logDate:string;

status:string;

}


export async function
getTeacherPendingDoubtLedger()

:Promise<PendingDoubtLedger[]> {

const teacher =
getCurrentTeacher();

if(!teacher){

return [];

}


const assignments =

await getTeacherAssignmentsByTeacher(
teacher.teacherUuid
);


const supabase =
getSupabaseClient();


const result:PendingDoubtLedger[] = [];


for(const assignment of assignments){

const { data } = await (supabase as any)

.from(
"pending_teacher_doubts"
)

.select("*")

.eq(
"teacher_assignment_uuid",
assignment.id
)

.eq(
"status",
"NOT DISCUSSED"
);


if(!data || data.length===0){

continue;

}


/*
----------------------------------
CLASSROOM INFORMATION
----------------------------------
*/

const classroom =

`${assignment.className}-${assignment.sectionName}`;


/*
----------------------------------
COUNT
----------------------------------
*/

/*
   A student can now legitimately have multiple Loop-2 rows for the
   same lecture when multiple Loop-1 subtopics were selected. Keep
   this teacher-facing metric semantic: count students, not subtopic
   rows.
*/
const pendingCount =
new Set(
  data
    .map((item:any) => String(item.student_uuid ?? "").trim())
    .filter(Boolean)
).size;


/*
----------------------------------
PREVIOUS TOPIC
----------------------------------
*/

const previousTopic =

data[0].previous_topic_name ?? "-";


/*
----------------------------------
MOST DIFFICULT CONCEPT
----------------------------------
*/

const difficultConcept =

data[0].previous_difficult_concept ?? "-";


/*
----------------------------------
STUDENTS
----------------------------------
*/

const students =
Array.from(
  new Set(
    data
      .map((item:any) => String(item.student_name ?? "").trim())
      .filter(Boolean)
  )
).join(", ");


/*
----------------------------------
DATE
----------------------------------
*/

const logDate =

data[0].log_date ?? "-";


/*
----------------------------------
STATUS
----------------------------------
*/

const status =

"Needs Revision";


result.push({

classroom,

pendingCount,

previousTopic,

difficultConcept,

students,

logDate,

status,

});

}


return result;

}