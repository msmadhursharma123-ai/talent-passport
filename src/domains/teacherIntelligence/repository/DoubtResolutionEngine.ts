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

THE DOUBT WAS RESOLVED DIRECTLY
BY THE TEACHER

The existing second loop previously returned
without persisting anything when the teacher
covered the common doubt.

That made a genuine resolution invisible to
the doubt-closure metric.

We now persist the same doubt ledger records,
but mark them RESOLVED immediately because the
teacher's daily log proves the concept was
revised. Students are NOT shown a second-loop
question in this case.

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

for(
const item of coveredFeedbacks
){

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

resolvedRecords.push({

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
mostDifficultConcept,

log_date:
previousLog.logDate,

status:
"RESOLVED",

student_response:
"DISCUSSED",

doubt_resolved:
true,

revision_checked_at:
new Date().toISOString(),

created_at:
new Date().toISOString(),

});

}

console.log(
"INSERTING DIRECTLY RESOLVED DOUBTS"
);

console.table(
resolvedRecords
);

const { error: resolvedInsertError } =
await (supabase as any)

.from("pending_teacher_doubts")

.insert(resolvedRecords);

if(resolvedInsertError){

throw resolvedInsertError;

}

console.log(
"TEACHER-COVERED DOUBTS MARKED RESOLVED"
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
const records = [];

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
mostDifficultConcept,

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


