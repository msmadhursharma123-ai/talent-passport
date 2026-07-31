import { getSupabaseClient } from "../supabaseClient";
export interface PlatformAccount {
 profileUuid:string; profileName:string; email:string; phone:string; schoolName:string;
 role:"Student"|"Teacher"|"School Admin"|"Partner"; createdAt:string|null; accountStatus:string;
 sourceTable:"students_master"|"teachers_master"|"school_admins"|"partners_master";
}
export async function searchPlatformAccounts(search:string):Promise<PlatformAccount[]>{
 const supabase=getSupabaseClient(); const term=search.replace(/[%_,()]/g," ").trim(); if(!supabase||!term)return[];
 const [s,t,a,p]=await Promise.all([
  (supabase as any).from("students_master").select("student_uuid,student_name,student_email,phone,school_name,created_at,account_status").or(`student_name.ilike.%${term}%,student_email.ilike.%${term}%,phone.ilike.%${term}%`).limit(25),
  (supabase as any).from("teachers_master").select("teacher_uuid,full_name,email,phone,school_name,created_at,account_status").or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`).limit(25),
  (supabase as any).from("school_admins").select("school_admin_uuid,full_name,email,phone,school_name,created_at,account_status").or(`full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`).limit(25),
  (supabase as any).from("partners_master").select("partner_uuid,partner_name,email,phone,created_at,status").or(`partner_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`).limit(25)
 ]);
 return [
 ...(s.data??[]).map((x:any)=>({profileUuid:x.student_uuid,profileName:x.student_name??"",email:x.student_email??"",phone:x.phone??"",schoolName:x.school_name??"",role:"Student",createdAt:x.created_at,accountStatus:x.account_status??"active",sourceTable:"students_master"})),
 ...(t.data??[]).map((x:any)=>({profileUuid:x.teacher_uuid,profileName:x.full_name??"",email:x.email??"",phone:x.phone??"",schoolName:x.school_name??"",role:"Teacher",createdAt:x.created_at,accountStatus:x.account_status??"active",sourceTable:"teachers_master"})),
 ...(a.data??[]).map((x:any)=>({profileUuid:x.school_admin_uuid,profileName:x.full_name??"",email:x.email??"",phone:x.phone??"",schoolName:x.school_name??"",role:"School Admin",createdAt:x.created_at,accountStatus:x.account_status??"active",sourceTable:"school_admins"})),
 ...(p.data??[]).map((x:any)=>({profileUuid:x.partner_uuid,profileName:x.partner_name??"",email:x.email??"",phone:x.phone??"",schoolName:"",role:"Partner",createdAt:x.created_at,accountStatus:x.status??"active",sourceTable:"partners_master"}))
 ] as PlatformAccount[];
}
export async function setPlatformAccountSuspended(account:PlatformAccount,suspended:boolean):Promise<boolean>{
 const supabase=getSupabaseClient(); if(!supabase)return false;
 const statusColumn=account.sourceTable==="partners_master"?"status":"account_status";
 const uuidColumn=account.sourceTable==="students_master"?"student_uuid":account.sourceTable==="teachers_master"?"teacher_uuid":account.sourceTable==="school_admins"?"school_admin_uuid":"partner_uuid";
 const {error}=await (supabase as any).from(account.sourceTable).update({[statusColumn]:suspended?"suspended":"active"}).eq(uuidColumn,account.profileUuid);
 if(error){console.error(error);return false;} return true;
}
