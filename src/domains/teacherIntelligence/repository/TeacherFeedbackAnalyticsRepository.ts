import { getSupabaseClient } from "../../../supabaseClient";

import {
  ClassroomFeedbackRadar,
  StudentFeedbackRow,
} from "../types/TeacherFeedbackModels";

function normalizeText(
text:string
){

return text
.trim()
.toLowerCase();

}

function getConceptKeywords(
concept:string
){

return normalizeText(concept)
.split(" ")
.filter(Boolean);

}

function buildConceptMatchingEngine(

teacherConcepts:string[],

studentResponses:string[]

){

const conceptMap =

new Map<string,number>();


for(

const teacherConcept of teacherConcepts

){

const normalizedTeacherConcept =

normalizeText(
teacherConcept
);


let count = 0;


for(

const response of studentResponses

){

const normalizedResponse =

normalizeText(
response
);


// LEVEL 1 + LEVEL 2

if(

normalizedResponse.includes(
normalizedTeacherConcept
)

){

count++;

continue;

}


// LEVEL 3

const keywords =

getConceptKeywords(
teacherConcept
);


const keywordMatched =

keywords.some(

(keyword)=>

normalizedResponse.includes(
keyword
)

);


if(

keywordMatched

){

count++;

}

}


if(count > 0){

conceptMap.set(

teacherConcept,

count

);

}


}

console.log(
"TEACHER CONCEPTS"
);

console.table(
teacherConcepts
);


console.log(
"STUDENT RESPONSES"
);

console.table(
studentResponses
);


console.log(
"CONCEPT MATCHES"
);

console.table(
Array.from(
conceptMap.entries()
)
);

return Array.from(

conceptMap.entries()

)

.sort(

(a,b)=>

b[1] - a[1]

)

.slice(0,2)

.map(

([concept,count])=>({

concept,
count,

})

);

}

async function buildFeedbackRadar(
  classroomFeedback: StudentFeedbackRow[]
): Promise<ClassroomFeedbackRadar> {

  // WE WILL BUILD THIS IN THE NEXT STEPS.

const supabase = getSupabaseClient();

    /****************************************

UNDERSTANDING BREAKDOWN

****************************************/

const completelyUnderstood =

classroomFeedback.filter(

(item)=>

item.understanding_level ===
"I completely understood."

).length;


const partiallyUnderstood =

classroomFeedback.filter(

(item)=>

item.understanding_level ===
"I partially understood."

).length;


const didNotUnderstand =

classroomFeedback.filter(

(item)=>

item.understanding_level ===
"I didn't understand."

).length;

const dailyLogUuid =

classroomFeedback[0]?.daily_log_uuid;



const teacherConcepts:string[] = [];

if(dailyLogUuid){

const { data: teacherLog } =

await (supabase as any)

.from(
"teacher_daily_logs"
)

.select(
"concepts_covered"
)

.eq(
"id",
dailyLogUuid
)

.single();

teacherConcepts.push(
...(teacherLog?.concepts_covered ?? [])
);

}

const studentResponses:string[] = [];

for(

const item of classroomFeedback

){

const concepts =

item.concepts_not_understood ?? [];


studentResponses.push(
...concepts
);


if(

item.additional_note?.trim()

){

studentResponses.push(
item.additional_note
);

}

}

/****************************************

COMMON DIFFICULT CONCEPTS

****************************************/
const commonConcepts =

buildConceptMatchingEngine(

teacherConcepts,

studentResponses

);

/****************************************

STUDENTS REQUIRING ATTENTION

****************************************/

const attentionStudents =

classroomFeedback.filter(

(item)=>

item.understanding_level !==

"I completely understood."

);


const studentUuids =

attentionStudents.map(

(item)=>item.student_uuid

);

const { data: students } =

await (supabase as any)
.from("students_master")
.select(
"student_uuid,student_name"
)
.in(
"student_uuid",
studentUuids
);

const studentNameMap =

new Map<string,string>();

students?.forEach((student:any)=>{

studentNameMap.set(
student.student_uuid,
student.student_name
);

});

console.log("STUDENT NAME MAP");

console.log(studentNameMap);

const groupedStudents = new Map();

for (const item of attentionStudents) {

const studentName =
studentNameMap.get(item.student_uuid) ??
"Student";


if (!groupedStudents.has(item.student_uuid)) {

groupedStudents.set(
item.student_uuid,
{
studentName,
understandingLevel:
item.understanding_level,
concepts: [],
}
);

}


const student =
groupedStudents.get(
item.student_uuid
);


const concepts =
item.concepts_not_understood ?? [];


student.concepts.push(
...concepts
);

}


const studentsRequiringAttention =
Array.from(
groupedStudents.values()
);

console.log(
"FINAL STUDENTS REQUIRING ATTENTION"
);

console.table(
studentsRequiringAttention
);

console.log(
"STUDENTS REQUIRING ATTENTION"
);

console.table(
studentsRequiringAttention
);

/****************************************

CLASSROOM HEALTH SCORE

****************************************/

const totalStudents =

classroomFeedback.length;


const healthScore =

totalStudents === 0

? 0

:

Math.round(

(

(

completelyUnderstood +

(partiallyUnderstood * 0.5)

)

/

totalStudents

)

* 100

);


let status =

"Excellent";


if(

healthScore < 80

){

status =

"Needs Attention";

}


if(

healthScore < 50

){

status =

"Critical";

}


const classroomHealthScore = {

score:

healthScore,

status,

};

/****************************************

TOMORROW'S TEACHING PLAN

****************************************/

const teachingRecommendation =

commonConcepts.length === 0

?

"No revision required."

:

commonConcepts.length === 1

?

`Most students struggled with ${
commonConcepts[0].concept
}. Please revise this concept before beginning tomorrow's lecture.`

:

`Most students struggled with ${
commonConcepts
.map((item)=>item.concept)
.join(" and ")
}. Please spend the first few minutes revising these concepts before beginning tomorrow's lecture.`;
  
  /*
      FINAL RESPONSE
  */

const radar = {

classroomHealthScore,

completelyUnderstood,

partiallyUnderstood,

didNotUnderstand,

commonConcepts,

studentsRequiringAttention,

teachingRecommendation,

};

  console.log(
    "CLASSROOM RADAR"
  );

  console.log(radar);

  return radar;
}


export async function getClassroomFeedbackRadar(
  className: string,
  sectionName: string
): Promise<ClassroomFeedbackRadar> {

  const classroomFeedback =
    await getClassroomFeedbackRows(
      className,
      sectionName
    );

  return await buildFeedbackRadar(
    classroomFeedback
  );

}



export async function getClassroomFeedbackRows(
  className: string,
  sectionName: string
): Promise<StudentFeedbackRow[]> {
  const supabase =
    getSupabaseClient();

  const { data, error } =
    await (supabase as any)
      .from(
        "student_daily_feedback"
      )
      .select("*")
      .eq(
        "class_name",
        className
      )
      .eq(
        "section_name",
        sectionName
      );

  if (error) {
    console.error(error);

    return [];
  }

  console.log(
    "CLASSROOM FEEDBACK"
  );

  console.table(data);

  return data ?? [];
}

export async function getLectureFeedbackRows(
  dailyLogUuid: string
): Promise<StudentFeedbackRow[]> {

  const supabase = getSupabaseClient();

  const { data, error } = await (supabase as any)

    .from("student_daily_feedback")

    .select("*")

    .eq(
      "daily_log_uuid",
      dailyLogUuid
    );

  if (error) {
    throw error;
  }

console.log(
    "DAILY LOG UUID RECEIVED"
);

console.log(
    dailyLogUuid
);

console.log(
    "LECTURE FEEDBACK ROWS"
);

console.table(
    data
);

  return data ?? [];

}

export async function getLectureFeedbackRadar(
  dailyLogUuid: string
): Promise<ClassroomFeedbackRadar> {

  const lectureFeedback =

    await getLectureFeedbackRows(
      dailyLogUuid
    );

  console.log(
    "LECTURE FEEDBACK"
  );

  console.table(
    lectureFeedback
  );

  return await buildFeedbackRadar(
    lectureFeedback
  );

}
