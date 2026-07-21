import { getSupabaseClient } from "../../../supabaseClient";


export async function getMonthlyComprehensionData(

dailyLogIds:string[]

){

const supabase = getSupabaseClient();


if(dailyLogIds.length === 0){

return [];

}


const { data } =

await (supabase as any)

.from("student_daily_feedback")

.select("*")

.in(

"daily_log_uuid",

dailyLogIds

);


return data ?? [];

}