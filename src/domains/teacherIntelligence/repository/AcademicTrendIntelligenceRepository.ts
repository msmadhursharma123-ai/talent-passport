import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentTeacher } from "../../../services/identityService";

async function getSubjectScopedLogIds(
  supabase: any,
  className: string,
  sectionName: string,
  subjectName: string
): Promise<string[]> {
  const teacher = getCurrentTeacher();
  if (!teacher?.teacherUuid) return [];

  const { data: assignments } = await supabase
    .from("teacher_classroom_assignments")
    .select("id")
    .eq("teacher_uuid", teacher.teacherUuid)
    .eq("class_name", className)
    .eq("section_name", sectionName)
    .eq("subject_name", subjectName);

  const assignmentIds = (assignments ?? [])
    .map((row: any) => String(row.id ?? ""))
    .filter(Boolean);
  if (!assignmentIds.length) return [];

  const { data: logs } = await supabase
    .from("teacher_daily_logs")
    .select("id")
    .in("teacher_assignment_uuid", assignmentIds);

  return (logs ?? [])
    .map((row: any) => String(row.id ?? ""))
    .filter(Boolean);
}



export async function getTopicTrendHistory(

className:string,
sectionName:string,

subjectName?:string

){

const supabase =

getSupabaseClient();


let query = (supabase as any)
  .from("student_daily_feedback")
  .select(`
topic_name,
submitted_at,
understanding_level
`)
  .eq("class_name", className)
  .eq("section_name", sectionName);

if (subjectName) {
  const logIds = await getSubjectScopedLogIds(supabase, className, sectionName, subjectName);
  if (!logIds.length) return [];
  query = query.in("daily_log_uuid", logIds).eq("subject_name", subjectName);
}

const { data } = await query.order("submitted_at", { ascending: true });


return data ?? [];

}



export async function getConceptTrendHistory(

className:string,
sectionName:string,

subjectName?:string

){

const supabase =

getSupabaseClient();


let query = (supabase as any)
  .from("student_daily_feedback")
  .select(`
concepts_not_understood,
submitted_at
`)
  .eq("class_name", className)
  .eq("section_name", sectionName);

if (subjectName) {
  const logIds = await getSubjectScopedLogIds(supabase, className, sectionName, subjectName);
  if (!logIds.length) return [];
  query = query.in("daily_log_uuid", logIds).eq("subject_name", subjectName);
}

const { data } = await query.order("submitted_at", { ascending: true });


return data ?? [];

}



export async function getClassroomTrendHistory(

className:string,
sectionName:string,

subjectName?:string

){

const supabase =

getSupabaseClient();


let query = (supabase as any)
  .from("student_daily_feedback")
  .select(`
understanding_level,
submitted_at
`)
  .eq("class_name", className)
  .eq("section_name", sectionName);

if (subjectName) {
  const logIds = await getSubjectScopedLogIds(supabase, className, sectionName, subjectName);
  if (!logIds.length) return [];
  query = query.in("daily_log_uuid", logIds).eq("subject_name", subjectName);
}

const { data } = await query.order("submitted_at", { ascending: true });


return data ?? [];

}