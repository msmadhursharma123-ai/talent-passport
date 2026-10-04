import { getSupabaseClient } from "../../../supabaseClient";

import {
getTeacherDailyLogsByAssignment,
} from "./TeacherDailyLogRepository";

import {
getLectureFeedbackRadar,
} from "./TeacherFeedbackAnalyticsRepository";


function normalizeText(
text:string
){

return text
.trim()
.toLowerCase();

}


function isConceptCovered(

mostDifficultConcept:string,

conceptsCovered:string[]

){

const difficultConcept =

normalizeText(
mostDifficultConcept
);


return conceptsCovered.some(

(concept)=>{

const normalizedConcept =

normalizeText(
concept
);

return(

normalizedConcept.includes(
difficultConcept
)

||

difficultConcept.includes(
normalizedConcept
)

);

}

);

}


export async function
processPendingDoubts(


    
teacherAssignmentUuid:string,

todayConceptsCovered:string[]

){

console.log(
"PROCESS PENDING DOUBTS HIT"
);

const supabase =
getSupabaseClient();


/*
-------------------------------------

FETCH PREVIOUS DAILY LOG

-------------------------------------
*/

const logs =

await getTeacherDailyLogsByAssignment(
teacherAssignmentUuid
);

console.log(
"ALL LOGS OF THIS TEACHER"
);

console.table(logs);

if(logs.length <2){

console.log(
"EXIT 1 : LESS THAN 2 LOGS"
);

return;

}


/*
CURRENT LOG = logs[0]

PREVIOUS LOG = logs[1]

*/

const previousLog =

logs[1];

console.log(
"PREVIOUS LOG"
);

console.log(
previousLog
);
console.log(previousLog);

if(!previousLog.id){

console.log(
"EXIT 2 : PREVIOUS LOG MISSING"
);

return;

}


/*
-------------------------------------

FETCH CLASSROOM RADAR

-------------------------------------
*/

const radar =

await getLectureFeedbackRadar(
previousLog.id
);

console.log(
"RADAR"
);

console.log(
radar
);

if(

radar.commonConcepts.length===0

){

console.log(
"EXIT 3 : NO COMMON CONCEPTS FOUND"
);

console.log(
radar
);

return;

}


const mostDifficultConcept =

radar.commonConcepts[0].concept;

console.log(
"MOST DIFFICULT CONCEPT"
);

console.log(
mostDifficultConcept
);

/*
-------------------------------------

CHECK IF TEACHER COVERED IT

-------------------------------------
*/

const coveredToday =

isConceptCovered(

mostDifficultConcept,

todayConceptsCovered

);


console.log(
"COVERED TODAY ?"
);

console.log(
coveredToday
);

if(coveredToday){

/*
-------------------------------------

STUDENT-SPECIFIC RESOLUTION

The classroom radar remains the gate that activates the existing
teacher-covered resolution path. It must NOT decide which concept
belongs to an individual student.

Loop-1 concepts_not_understood[] is the authoritative student-level
concept list. For each qualifying student:
- selected concepts covered today -> RESOLVED
- selected concepts not covered today -> PENDING
- no selected concepts -> no Loop-2 row

This preserves the existing radar eligibility signal while making
resolution student-specific and preventing one classroom concept
from resolving every student's doubt.
-------------------------------------
*/

const {
data:coveredFeedbacks
} = await (supabase as any)

.from("student_daily_feedback")

.select("*")

.eq(
"daily_log_uuid",
previousLog.id
)

.in(
"understanding_level",
[
"I partially understood.",
"I didn't understand."
]
);

if(
!coveredFeedbacks ||
coveredFeedbacks.length === 0
){

console.log(
"EXIT 4 : CONCEPT COVERED BUT NO DOUBT FEEDBACK"
);

return;

}

const resolvedRecords:any[] = [];
const pendingRecords:any[] = [];

for(
const item of coveredFeedbacks
){

const selectedConcepts: string[] = Array.isArray(item.concepts_not_understood)
? Array.from(
new Set<string>(
item.concepts_not_understood
.map((concept: unknown): string => String(concept ?? "").trim())
.filter((concept: string): boolean => Boolean(concept))
)
)
: [];

if(selectedConcepts.length === 0){
continue;
}

const { data: studentData } =
await (supabase as any)
.from("students_master")
.select("student_name,school_name")
.eq("student_uuid", item.student_uuid)
.single();

for(const loop2Concept of selectedConcepts){

const studentConceptCovered =
isConceptCovered(
loop2Concept,
todayConceptsCovered
);

const targetRecords =
studentConceptCovered
? resolvedRecords
: pendingRecords;

targetRecords.push({

student_uuid:
item.student_uuid,

student_name:
studentData?.student_name ?? "",

teacher_assignment_uuid:
teacherAssignmentUuid,

teacher_name:
"",

school_name:
studentData?.school_name ?? "",

class_name:
item.class_name ?? null,

section_name:
item.section_name ?? null,

subject_name:
item.subject_name ?? null,

daily_log_uuid:
previousLog.id,

previous_topic_name:
previousLog.topicName,

previous_difficult_concept:
loop2Concept,

log_date:
previousLog.logDate,

status:
studentConceptCovered
? "RESOLVED"
: "PENDING",

student_response:
studentConceptCovered
? "DISCUSSED"
: null,

doubt_resolved:
studentConceptCovered
? true
: false,

revision_checked_at:
studentConceptCovered
? new Date().toISOString()
: null,

created_at:
new Date().toISOString(),

});

}

}

const resolutionRecords = [
...resolvedRecords,
...pendingRecords,
];

if(resolutionRecords.length === 0){

return;

}

console.log(
"INSERTING STUDENT-SPECIFIC DOUBT RESULTS"
);

console.table(
resolutionRecords
);

const { error:resolutionInsertError } =
await (supabase as any)
.from("pending_teacher_doubts")
.insert(resolutionRecords);

if(resolutionInsertError){
throw resolutionInsertError;
}

console.log(
"STUDENT-SPECIFIC DOUBT RESULTS SAVED"
);

return;
}


/*
-------------------------------------

FETCH STUDENTS WHO DIDN'T
UNDERSTAND YESTERDAY

-------------------------------------
*/

const {

data:feedbacks

} = await (supabase as any)

.from("student_daily_feedback")

.select("*")

.eq(
"daily_log_uuid",
previousLog.id
)

.in(

"understanding_level",

[

"I partially understood.",

"I didn't understand."

]

)

console.log(
"STUDENTS TO BE PUSHED"
);

console.table(
feedbacks
);
console.log(feedbacks[0]);

if(!feedbacks){

console.log(
"EXIT 5 : FEEDBACKS NOT FOUND"
);

return;

}


/*
-------------------------------------

CREATE PENDING DOUBTS

-------------------------------------
*/
const records: any[] = [];

/*
-------------------------------------
IMPORTANT LOOP-2 MULTI-SUBTOPIC FIX
-------------------------------------

Loop-1 stores every checked difficult subtopic in
student_daily_feedback.concepts_not_understood[].

The old Loop-2 writer collapsed that array into the single
classroom-radar value `mostDifficultConcept`, which meant that a
student who selected two subtopics received only one Loop-2 row.

The gate above remains unchanged:
- Teacher Home still determines the classroom's most common doubt.
- If today's teacher log covers that doubt, the existing direct-
  resolution path above remains unchanged.
- If today's teacher log does NOT cover that doubt, Loop-2 is
  activated exactly as before.

Only the payload fan-out changes here: when Loop-2 is activated,
create one pending_teacher_doubts row for EACH selected Loop-1
subtopic belonging to that student. This preserves the existing
row-level Loop-2 response flow and lets the existing student UI
render one card/popup per subtopic.

If a feedback row has no concepts_not_understood[], it has no
authoritative student concept for Loop-2. Do NOT fall back to the
classroom-radar concept; skip that student for Loop-2 creation.
-------------------------------------
*/
for (const item of feedbacks) {

const { data: studentData } =
await (supabase as any)

.from("students_master")

.select(
"student_name,school_name"
)

.eq(
"student_uuid",
item.student_uuid
)

.single();

const selectedConcepts = Array.isArray(item.concepts_not_understood)
  ? Array.from(
      new Set(
        item.concepts_not_understood
          .map((concept: unknown) => String(concept ?? "").trim())
          .filter(Boolean)
      )
    )
  : [];

if (selectedConcepts.length === 0) {
  continue;
}

for (const loop2Concept of selectedConcepts) {

records.push({

/*
-------------------------------------
STUDENT DETAILS
-------------------------------------
*/

student_uuid:
item.student_uuid,

student_name:
studentData?.student_name ?? "",


/*
-------------------------------------
TEACHER DETAILS
-------------------------------------
*/

teacher_assignment_uuid:
teacherAssignmentUuid,

teacher_name:
"",


/*
-------------------------------------
SCHOOL DETAILS
-------------------------------------
*/

school_name:
studentData?.school_name ?? "",

class_name:
item.class_name ?? null,

section_name:
item.section_name ?? null,

subject_name:
item.subject_name ?? null,


/*
-------------------------------------
PREVIOUS LECTURE DETAILS
-------------------------------------
*/

daily_log_uuid:
previousLog.id,

previous_topic_name:
previousLog.topicName,

previous_difficult_concept:
loop2Concept,

log_date:
previousLog.logDate,


/*
-------------------------------------
DOUBT STATUS
-------------------------------------
*/

status:
"PENDING",

student_response:
null,

doubt_resolved:
false,

revision_checked_at:
null,


/*
-------------------------------------
TIMESTAMPS
-------------------------------------
*/

created_at:
new Date().toISOString(),

});

}

}

console.log(
"INSERTING INTO TABLE"
);

console.table(
records
);

if(records.length === 0){

return;

}


const { error } =

await (supabase as any)

.from(
"pending_teacher_doubts"
)

.insert(records);


if(error){

throw error;

}


console.log(

"PENDING DOUBTS CREATED"

);

console.table(records);

}


