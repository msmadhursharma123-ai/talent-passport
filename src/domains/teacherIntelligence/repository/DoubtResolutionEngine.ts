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


if(

logs.length < 2

){

return;

}


/*
CURRENT LOG = logs[0]

PREVIOUS LOG = logs[1]

*/

const previousLog =

logs[1];


if(!previousLog.id){

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


if(

radar.commonConcepts.length === 0

){

return;

}


const mostDifficultConcept =

radar.commonConcepts[0].concept;


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


if(coveredToday){

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

.eq(
"understanding_level",
"I didn't understand."
);


if(!feedbacks){

return;

}


/*
-------------------------------------

CREATE PENDING DOUBTS

-------------------------------------
*/

const records =

feedbacks.map((item:any)=>({

/*
-------------------------------------
STUDENT DETAILS
-------------------------------------
*/

student_uuid:
item.student_uuid,

student_name: null,


/*
-------------------------------------
TEACHER DETAILS
-------------------------------------
*/

teacher_assignment_uuid:
teacherAssignmentUuid,

teacher_name: null,


/*
-------------------------------------
SCHOOL DETAILS
-------------------------------------
*/

school_name: null,

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

}));


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
