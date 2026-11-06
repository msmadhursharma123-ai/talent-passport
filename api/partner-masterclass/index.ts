import { createClient } from "@supabase/supabase-js";
import { calculateStudentStarPerformersFromSource } from "../../src/domains/starPerformers/services/StudentStarPerformerCalculator.js";
import type { StudentStarPerformerSourceData } from "../../src/domains/starPerformers/types/StudentStarPerformerModels.js";

const PAGE_SIZE = 1000;
const CHUNK_SIZE = 100;

function normalizeRoll(value: unknown) { return String(value ?? "").trim().toUpperCase(); }
function indiaToday() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()); }
function previousMonth(today: string) {
  const [y,m] = today.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth()+1, 0);
  const fmt=(x:Date)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(x);
  return {start:fmt(start),end:fmt(end),month:fmt(start)};
}
function adminClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server Supabase configuration is missing.");
  return createClient(url, key, { auth: { autoRefreshToken:false, persistSession:false } });
}
function chunks<T>(values:T[], size=CHUNK_SIZE):T[][] {
  const result:T[][]=[];
  for(let i=0;i<values.length;i+=size) result.push(values.slice(i,i+size));
  return result;
}
async function fetchPaged(buildQuery:(from:number,to:number)=>any):Promise<any[]> {
  const result:any[]=[];
  for(let from=0;;from+=PAGE_SIZE){
    const {data,error}=await buildQuery(from,from+PAGE_SIZE-1);
    if(error) throw error;
    const page=data??[];
    result.push(...page);
    if(page.length<PAGE_SIZE) break;
  }
  return result;
}
async function partnerUuidForRequest(req: any, supabase:any) {
  const auth = String(req.headers.authorization ?? "");
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) throw new Error("Authentication required.");
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) throw new Error("Authentication required.");
  const { data: profile, error } = await supabase.from("partner_profiles").select("partner_uuid").eq("auth_user_id", userData.user.id).maybeSingle();
  if (error || !profile?.partner_uuid) throw new Error("Partner identity is not authorized.");
  return String(profile.partner_uuid);
}
async function fetchSource(supabase:any, schoolUuid:string, startDate:string, endDate:string):Promise<StudentStarPerformerSourceData> {
  const [students, assignments] = await Promise.all([
    fetchPaged((from,to)=>supabase.from("students_master").select("student_uuid,student_name,roll_number,school_uuid,class_name,section_name,created_at").eq("school_uuid",schoolUuid).range(from,to)),
    fetchPaged((from,to)=>supabase.from("teacher_classroom_assignments").select("id,teacher_uuid,school_uuid,class_name,section_name,subject_name").eq("school_uuid",schoolUuid).range(from,to)),
  ]);
  const ids=(assignments??[]).map((x:any)=>String(x.id)).filter(Boolean);
  const logs:any[]=[]; const loop2:any[]=[];
  const loop2DateFilter=[
    `and(created_at.gte.${startDate}T00:00:00+05:30,created_at.lte.${endDate}T23:59:59.999+05:30)`,
    `and(created_at.is.null,revision_checked_at.gte.${startDate}T00:00:00+05:30,revision_checked_at.lte.${endDate}T23:59:59.999+05:30)`,
    `and(created_at.is.null,revision_checked_at.is.null,log_date.gte.${startDate},log_date.lte.${endDate})`,
  ].join(",");
  for(const chunk of chunks(ids)){
    const assignmentLogs=await fetchPaged((from,to)=>supabase.from("teacher_daily_logs").select("id,teacher_assignment_uuid,log_date").in("teacher_assignment_uuid",chunk).gte("log_date",startDate).lte("log_date",endDate).order("log_date",{ascending:true}).range(from,to));
    logs.push(...assignmentLogs);
    const doubtRows=await fetchPaged((from,to)=>supabase.from("pending_teacher_doubts").select("id,student_uuid,student_response,status,created_at,revision_checked_at,log_date").in("teacher_assignment_uuid",chunk).or(loop2DateFilter).order("created_at",{ascending:true,nullsFirst:false}).order("id",{ascending:true}).range(from,to));
    loop2.push(...doubtRows);
  }
  const logIds=logs.map((x:any)=>String(x.id)).filter(Boolean);
  const feedback:any[]=[];
  for(const chunk of chunks(logIds)){
    const rows=await fetchPaged((from,to)=>supabase.from("student_daily_feedback").select("id,daily_log_uuid,student_uuid,understanding_level,submitted_at").eq("school_uuid",schoolUuid).in("daily_log_uuid",chunk).range(from,to));
    feedback.push(...rows);
  }
  const amap=new Map((assignments??[]).map((x:any)=>[String(x.id),x]));
  return {
    schoolUuid,
    students:(students??[]).map((x:any)=>({student_uuid:String(x.student_uuid??""),student_name:String(x.student_name??"Student"),roll_number:x.roll_number==null?null:String(x.roll_number).trim(),school_uuid:String(x.school_uuid??schoolUuid),class_name:x.class_name??null,section_name:x.section_name??null,created_at:x.created_at??null})),
    assignments:(assignments??[]).map((x:any)=>({id:String(x.id),teacher_uuid:x.teacher_uuid?String(x.teacher_uuid):null,school_uuid:String(x.school_uuid??schoolUuid),class_name:x.class_name??null,section_name:x.section_name??null,subject_name:x.subject_name??null})),
    logs:logs.map((x:any)=>{const a=amap.get(String(x.teacher_assignment_uuid));return {id:String(x.id),teacher_assignment_uuid:String(x.teacher_assignment_uuid),log_date:x.log_date??null,class_name:String(a?.class_name??"").trim(),section_name:String(a?.section_name??"").trim()};}).filter((x:any)=>x.class_name||x.section_name),
    feedback:feedback.map((x:any)=>({id:String(x.id),daily_log_uuid:String(x.daily_log_uuid??""),student_uuid:String(x.student_uuid??""),understanding_level:x.understanding_level??null,submitted_at:x.submitted_at??null})),
    loop2History:loop2.map((x:any)=>({id:String(x.id??""),student_uuid:String(x.student_uuid??""),student_response:x.student_response??null,status:x.status??null,created_at:x.created_at??null,revision_checked_at:x.revision_checked_at??null,log_date:x.log_date??null}))
  };
}

export default async function handler(req:any,res:any){
  try{
    const supabase=adminClient();
    const partnerUuid=await partnerUuidForRequest(req,supabase);
    const action=String(req.body?.action??"verify");
    if(action==="history") {
      const rows:any[]=[];
      for(let from=0;;from+=PAGE_SIZE){
        const {data,error}=await supabase.from("partner_masterclass_checkins_v9").select("id,partner_uuid,student_uuid,roll_number,student_name,verified_at,school_uuid,school_name,class_name,section_name,parent_phone,parent_email,masterclass_month").eq("partner_uuid",partnerUuid).order("verified_at",{ascending:false}).range(from,from+PAGE_SIZE-1);
        if(error) throw error;
        const page=data??[]; rows.push(...page); if(page.length<PAGE_SIZE) break;
      }
      return res.status(200).json({rows});
    }
    if(action==="verify"){
      const roll=normalizeRoll(req.body?.rollNumber);
      if(!roll) return res.status(400).json({message:"Enter the student's roll number to verify."});
      const period=previousMonth(indiaToday());
      const safeRoll=roll.replace(/[\%_]/g,"\\$&");
      const {data:targets,error}=await supabase.from("students_master").select("student_uuid,roll_number,student_name,school_uuid,school_name,class_name,section_name,parent_phone,phone,student_email").ilike("roll_number",safeRoll);
      if(error) throw error;
      const candidates:any[]=[];
      for(const target of targets??[]){
        const source=await fetchSource(supabase,String(target.school_uuid),period.start,period.end);
        const result=calculateStudentStarPerformersFromSource(source,{startDate:period.start,endDate:period.end,asOfDate:indiaToday(),classroomFilter:`${String(target.class_name??"").trim()}::${String(target.section_name??"").trim()}`});
        const winner=result.rows.find(row=>row.studentUuid===String(target.student_uuid)&&normalizeRoll(row.rollNumber)===roll);
        if(winner) candidates.push({studentUuid:String(target.student_uuid),rollNumber:roll,studentName:String(target.student_name??winner.studentName),schoolUuid:String(target.school_uuid??""),schoolName:String(target.school_name??"School"),className:String(target.class_name??""),sectionName:String(target.section_name??""),parentPhone:String(target.parent_phone??target.phone??""),parentEmail:String(target.student_email??""),rank:Number(winner.rank),totalCredits:Number(winner.dailyFeedbackCredits),masterclassMonth:period.month});
      }
      return res.status(200).json({verified:candidates.length>0,candidates,message:candidates.length?"Student verified for the current masterclass eligibility period.":"You are not shortlisted for the master class."});
    }
    if(action==="record"){
      const c=req.body?.candidate;
      if(!c?.studentUuid||!c?.schoolUuid||!c?.rollNumber) return res.status(400).json({message:"Invalid verified student."});
      const period=previousMonth(indiaToday());
      const {data:identity,error:identityError}=await supabase.from("students_master").select("student_uuid,roll_number,student_name,school_uuid,school_name,class_name,section_name,parent_phone,phone,student_email").eq("student_uuid",String(c.studentUuid)).maybeSingle();
      if(identityError) throw identityError;
      if(!identity || normalizeRoll(identity.roll_number)!==normalizeRoll(c.rollNumber)) return res.status(403).json({message:"Student identity no longer matches the verified record."});
      const source=await fetchSource(supabase,String(identity.school_uuid),period.start,period.end);
      const result=calculateStudentStarPerformersFromSource(source,{startDate:period.start,endDate:period.end,asOfDate:indiaToday(),classroomFilter:`${String(identity.class_name??"").trim()}::${String(identity.section_name??"").trim()}`});
      const winner=result.rows.find(row=>row.studentUuid===String(identity.student_uuid)&&normalizeRoll(row.rollNumber)===normalizeRoll(identity.roll_number));
      if(!winner) return res.status(403).json({message:"You are not shortlisted for the master class."});
      const target=source.students.find(s=>s.student_uuid===winner.studentUuid&&normalizeRoll(s.roll_number)===normalizeRoll(winner.rollNumber));
      if(!target) return res.status(403).json({message:"Student identity no longer matches the verified record."});
      const {error}=await supabase.from("partner_masterclass_checkins_v9").insert({partner_uuid:partnerUuid,student_uuid:winner.studentUuid,roll_number:normalizeRoll(winner.rollNumber),student_name:target.student_name,school_uuid:target.school_uuid,school_name:String(identity.school_name??"School"),class_name:target.class_name,section_name:target.section_name,parent_phone:String(identity.parent_phone??identity.phone??""),parent_email:String(identity.student_email??""),masterclass_month:period.month});
      if(error && error.code!=="23505") throw error;
      return res.status(200).json({ok:true});
    }
    return res.status(400).json({message:"Unsupported action."});
  }catch(error:any){ return res.status(500).json({message:error?.message||"Unable to process the masterclass request."}); }
}
