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
STUDENT NAME RESOLUTION
----------------------------------
Resolve display names from the canonical students_master table.
pending_teacher_doubts.student_name can contain an admission/code value
(e.g. glps025), so it must not be treated as the authoritative name.
*/

const studentUuids = Array.from(
  new Set(
    data
      .map((item: any) => String(item.student_uuid ?? "").trim())
      .filter(Boolean)
  )
);

const studentNamesByUuid = new Map<string, string>();

if (studentUuids.length > 0) {
  let studentQuery = (supabase as any)
    .from("students_master")
    .select("student_uuid,student_name")
    .in("student_uuid", studentUuids);

  const schoolUuid = String(assignment.schoolUuid ?? "").trim();
  if (schoolUuid) {
    studentQuery = studentQuery.eq("school_uuid", schoolUuid);
  }

  const { data: studentRows, error: studentNameError } = await studentQuery;

  if (studentNameError) {
    console.warn(
      "TEACHER PENDING DOUBT STUDENT NAME RESOLUTION FAILED — USING AVAILABLE STORED LABELS",
      studentNameError
    );
  } else {
    for (const studentRow of studentRows ?? []) {
      const uuid = String((studentRow as any).student_uuid ?? "").trim();
      const name = String((studentRow as any).student_name ?? "").trim();
      if (uuid && name && !studentNamesByUuid.has(uuid)) {
        studentNamesByUuid.set(uuid, name);
      }
    }
  }
}

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
      .map((item:any) => {
        const studentUuid = String(item.student_uuid ?? "").trim();
        const canonicalName = studentNamesByUuid.get(studentUuid) ?? "";
        const storedName = String(item.student_name ?? "").trim();

        // Prefer the canonical database name. Avoid displaying a student
        // code as though it were a person's name when lookup is unavailable.
        if (canonicalName) return canonicalName;
        if (storedName && !/^glps\d+$/i.test(storedName)) return storedName;
        return "";
      })
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
