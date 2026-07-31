import { getSupabaseClient } from "../supabaseClient";

export type PortalRole = "student" | "teacher";
export const STUDENT_FEATURES = [
  { key:"dna-radar", label:"User DNA Radar" }, { key:"homeboard", label:"Home Board" },
  { key:"timeline", label:"Timeline" }, { key:"portfolio", label:"Portfolio" },
  { key:"competitions", label:"Competitions" }, { key:"opportunities", label:"Opportunities" },
  { key:"mauke-pe-chauka", label:"Mauke Pe Chauka" }, { key:"my-analysis", label:"My Analysis" },
  { key:"growth-plan", label:"Growth Plan" }
] as const;
export const TEACHER_FEATURES = [
  { key:"dashboard", label:"Dashboard" }, { key:"daily-log", label:"Daily Log" },
  { key:"teaching-journal", label:"Teaching Journal" }, { key:"my-classroom", label:"My Classroom" },
  { key:"exam-preparation", label:"Exam Prep" }
] as const;

export async function getSchoolFeatureKeys(schoolUuid:string, role:PortalRole):Promise<string[]> {
  const supabase=getSupabaseClient(); if(!supabase||!schoolUuid) return [];
  const {data,error}=await (supabase as any).from("school_portal_features").select("feature_key")
    .eq("school_uuid",schoolUuid).eq("portal_role",role).eq("enabled",true);
  if(error){console.error(error);return [];} return (data??[]).map((x:any)=>x.feature_key);
}
export async function getSchoolFeatureConfiguration(schoolUuid:string) {
  const supabase=getSupabaseClient(); if(!supabase) return {student:[],teacher:[]};
  const {data,error}=await (supabase as any).from("school_portal_features").select("portal_role,feature_key,enabled").eq("school_uuid",schoolUuid);
  if(error){console.error(error);return {student:[],teacher:[]};}
  return {
    student:(data??[]).filter((x:any)=>x.portal_role==="student"&&x.enabled).map((x:any)=>x.feature_key),
    teacher:(data??[]).filter((x:any)=>x.portal_role==="teacher"&&x.enabled).map((x:any)=>x.feature_key)
  };
}
export async function saveSchoolFeatures(schoolUuid:string,studentKeys:string[],teacherKeys:string[]):Promise<boolean>{
  const supabase=getSupabaseClient(); if(!supabase) return false;
  const rows=[
    ...STUDENT_FEATURES.map(x=>({school_uuid:schoolUuid,portal_role:"student",feature_key:x.key,enabled:studentKeys.includes(x.key)})),
    ...TEACHER_FEATURES.map(x=>({school_uuid:schoolUuid,portal_role:"teacher",feature_key:x.key,enabled:teacherKeys.includes(x.key)}))
  ];
  const {error}=await (supabase as any).from("school_portal_features").upsert(rows,{onConflict:"school_uuid,portal_role,feature_key"});
  if(error){console.error(error);return false;} return true;
}
