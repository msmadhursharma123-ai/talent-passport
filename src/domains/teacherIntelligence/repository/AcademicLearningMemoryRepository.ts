import { getSupabaseClient } from "../../../supabaseClient";



export async function getRecurringConcepts(

className:string,
sectionName:string

){

const supabase = getSupabaseClient();

const { data } = await (supabase as any)

.from("student_daily_feedback")

.select(`
concepts_not_understood,
topic_name,
understanding_level
`)

.eq(
"class_name",
className
)

.eq(
"section_name",
sectionName
);


const conceptMap =

new Map<string,number>();


(data ?? []).forEach((item:any)=>{

const concepts =

item.concepts_not_understood ?? [];


concepts.forEach((concept:string)=>{

conceptMap.set(

concept,

(conceptMap.get(concept) ?? 0) + 1

);

});

});


return Array.from(

conceptMap.entries()

)

.sort(

(a,b)=>

b[1]-a[1]

)

.slice(0,5)

.map(

([concept,count])=>({

concept,
count,

})

);

}



export async function getRecurringTopics(

className:string,
sectionName:string

){

const supabase =

getSupabaseClient();


const { data } = await (supabase as any)

.from("student_daily_feedback")

.select(`
topic_name,
understanding_level
`)

.eq(
"class_name",
className
)

.eq(
"section_name",
sectionName
);


const topicMap =

new Map<string,number>();


(data ?? []).forEach((item:any)=>{

if(

item.understanding_level ===

"I completely understood."

){

return;

}


const topic =

item.topic_name;


if(topic){

topicMap.set(

topic,

(topicMap.get(topic) ?? 0) + 1

);

}

});


return Array.from(

topicMap.entries()

)

.sort(

(a,b)=>

b[1]-a[1]

)

.slice(0,5)

.map(

([topic,count])=>({

topic,
count,

})

);

}



export async function getRecurringStudents(

className:string,
sectionName:string

){

const supabase =

getSupabaseClient();


const { data } = await (supabase as any)

.from("student_daily_feedback")

.select(`
student_uuid,
understanding_level
`)

.eq(
"class_name",
className
)

.eq(
"section_name",
sectionName
);


const studentMap =

new Map<string,number>();


(data ?? []).forEach((item:any)=>{

if(

item.understanding_level ===

"I completely understood."

){

return;

}


studentMap.set(

item.student_uuid,

(studentMap.get(

item.student_uuid

) ?? 0)

+1

);

});


return Array.from(

studentMap.entries()

)

.sort(

(a,b)=>

b[1]-a[1]

)

.slice(0,10);


}