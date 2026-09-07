import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentTeacher } from "../../../services/identityService";

import {

TeacherAcademicMemory,

RecurringConcept,
RecurringStudent,
RecurringTopic,

}

from "../types/TeacherAcademicMemoryModels";


export async function getTeacherAcademicMemory(

className:string,
sectionName:string,

subjectName?:string

):Promise<TeacherAcademicMemory>{

const supabase = getSupabaseClient();


let feedback: any[] = [];

if (subjectName) {
  const teacher = getCurrentTeacher();
  const assignments = teacher?.teacherUuid
    ? await (supabase as any)
        .from("teacher_classroom_assignments")
        .select("id")
        .eq("teacher_uuid", teacher.teacherUuid)
        .eq("class_name", className)
        .eq("section_name", sectionName)
        .eq("subject_name", subjectName)
    : { data: [] };

  const assignmentIds = (assignments.data ?? [])
    .map((row: any) => String(row.id ?? ""))
    .filter(Boolean);

  if (assignmentIds.length > 0) {
    const { data: logs } = await (supabase as any)
      .from("teacher_daily_logs")
      .select("id")
      .in("teacher_assignment_uuid", assignmentIds);

    const logIds = (logs ?? [])
      .map((row: any) => String(row.id ?? ""))
      .filter(Boolean);

    if (logIds.length > 0) {
      const { data } = await (supabase as any)
        .from("student_daily_feedback")
        .select("*")
        .in("daily_log_uuid", logIds)
        .eq("class_name", className)
        .eq("section_name", sectionName)
        .eq("subject_name", subjectName);
      feedback = data ?? [];
    }
  }
} else {
  const { data } = await (supabase as any)
    .from("student_daily_feedback")
    .select("*")
    .eq("class_name", className)
    .eq("section_name", sectionName);
  feedback = data ?? [];
}


if(!feedback){

return{

difficultConcepts:[],
difficultTopics:[],
difficultStudents:[],

};

}


/************************************************

DIFFICULT CONCEPTS

************************************************/


const conceptMap =

new Map<string,number>();


feedback.forEach((item:any)=>{

const concepts =

item.concepts_not_understood ?? [];


concepts.forEach((concept:string)=>{

conceptMap.set(

concept,

(conceptMap.get(concept) ?? 0)+1

);

});

});


const difficultConcepts:RecurringConcept[] =

Array.from(conceptMap.entries())

.sort((a,b)=>b[1]-a[1])

.slice(0,5)

.map(([concept,count])=>({

concept,
difficultyCount:count,

}));



/************************************************

DIFFICULT TOPICS

************************************************/


const topicMap =

new Map<string,number>();


feedback.forEach((item:any)=>{

const topic =

item.topic_name;


if(!topic){

return;

}


topicMap.set(

topic,

(topicMap.get(topic) ?? 0)+1

);

});


const difficultTopics:RecurringTopic[] =

Array.from(topicMap.entries())

.sort((a,b)=>b[1]-a[1])

.slice(0,5)

.map(([topic,count])=>({

topic,
difficultyCount:count,

}));



/************************************************

DIFFICULT STUDENTS

************************************************/


const studentMap =

new Map<string,number>();


feedback.forEach((item:any)=>{


if(

item.understanding_level !==

"I completely understood."

){

studentMap.set(

item.student_name,

(studentMap.get(item.student_name) ?? 0)+1

);

}

});


const difficultStudents:RecurringStudent[] =

Array.from(studentMap.entries())

.sort((a,b)=>b[1]-a[1])

.slice(0,5)

.map(([student,count])=>({

studentName:student,
difficultLectureCount:count,

}));



return{

difficultConcepts,
difficultTopics,
difficultStudents,

};


}