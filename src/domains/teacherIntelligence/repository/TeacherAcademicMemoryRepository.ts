import { getSupabaseClient } from "../../../supabaseClient";

import {

TeacherAcademicMemory,

RecurringConcept,
RecurringStudent,
RecurringTopic,

}

from "../types/TeacherAcademicMemoryModels";


export async function getTeacherAcademicMemory(

className:string,
sectionName:string

):Promise<TeacherAcademicMemory>{

const supabase = getSupabaseClient();


const { data : feedback } =

await (supabase as any)

.from("student_daily_feedback")

.select("*")

.eq("class_name",className)

.eq("section_name",sectionName);


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