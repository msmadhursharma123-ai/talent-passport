import { getSupabaseClient } from "../../../supabaseClient";

import {
  ClassroomFeedbackRadar,
  StudentFeedbackRow,
} from "../types/TeacherFeedbackModels";



export async function getClassroomFeedbackRadar(
  className: string,
  sectionName: string
): Promise<ClassroomFeedbackRadar> {
  const classroomFeedback =
    await getClassroomFeedbackRows(
      className,
      sectionName
    );

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

/****************************************

COMMON DIFFICULT CONCEPTS

****************************************/

const conceptMap =

new Map<string,number>();


for(

const row of classroomFeedback

){

const concepts =

row.concepts_not_understood ?? [];


for(

const concept of concepts

){

const count =

conceptMap.get(concept) ?? 0;


conceptMap.set(

concept,

count + 1

);

}

}


const commonConcepts =

Array.from(

conceptMap.entries()

)

.sort(

(a,b)=>

b[1] - a[1]

)

.slice(0,5)

.map(

([concept,count])=>({

concept,

count,

})

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


const { data : students } =

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


students?.forEach(

(student:any)=>{

studentNameMap.set(

student.student_uuid,

student.student_name

);

}

);


const studentsRequiringAttention =

attentionStudents.map(

(item)=>({

studentName:

studentNameMap.get(

item.student_uuid

) ?? "Student",

topicName:

item.topic_name,

understandingLevel:

item.understanding_level,

concepts:

item.concepts_not_understood,

})

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

`Spend the first few minutes revising ${

commonConcepts

.map(

(item)=>item.concept

)

.join(", ")

} before beginning tomorrow's lecture.`;
  
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