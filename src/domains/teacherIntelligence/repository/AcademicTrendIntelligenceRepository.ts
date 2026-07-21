import { getSupabaseClient } from "../../../supabaseClient";



export async function getTopicTrendHistory(

className:string,
sectionName:string

){

const supabase =

getSupabaseClient();


const { data } = await (supabase as any)

.from("student_daily_feedback")

.select(`
topic_name,
submitted_at,
understanding_level
`)

.eq(
"class_name",
className
)

.eq(
"section_name",
sectionName
)

.order(
"submitted_at",
{
ascending:true
}
);


return data ?? [];

}



export async function getConceptTrendHistory(

className:string,
sectionName:string

){

const supabase =

getSupabaseClient();


const { data } = await (supabase as any)

.from("student_daily_feedback")

.select(`
concepts_not_understood,
submitted_at
`)

.eq(
"class_name",
className
)

.eq(
"section_name",
sectionName
)

.order(
"submitted_at",
{
ascending:true
}
);


return data ?? [];

}



export async function getClassroomTrendHistory(

className:string,
sectionName:string

){

const supabase =

getSupabaseClient();


const { data } = await (supabase as any)

.from("student_daily_feedback")

.select(`
understanding_level,
submitted_at
`)

.eq(
"class_name",
className
)

.eq(
"section_name",
sectionName
)

.order(
"submitted_at",
{
ascending:true
}
);


return data ?? [];

}