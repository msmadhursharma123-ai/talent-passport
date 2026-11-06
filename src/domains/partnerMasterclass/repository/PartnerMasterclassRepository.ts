import { getSupabaseClient } from "../../../supabaseClient";
import { requirePartnerIdentity } from "../../../services/identityService";
import type { PartnerMasterclassHistoryRow, PartnerMasterclassVerificationResult } from "../types/PartnerMasterclassModels";

function client(){ const supabase=getSupabaseClient(); if(!supabase) throw new Error("Supabase is not configured."); return supabase as any; }
function normalizeRollNumber(v:string){ return String(v??"").trim().toUpperCase(); }

export async function verifyPartnerMasterclassRoll(rollNumber:string):Promise<PartnerMasterclassVerificationResult>{
 const partner=requirePartnerIdentity(); const normalizedRoll=normalizeRollNumber(rollNumber);
 if(!normalizedRoll) return {verified:false,candidates:[],message:"Enter the student's roll number to verify."};
 const session=(await client().auth.getSession()).data?.session;
 const response=await fetch("/api/partner-masterclass",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session?.access_token??""}`},body:JSON.stringify({action:"verify",rollNumber:normalizedRoll,partnerUuid:partner.partnerUuid})});
 const payload=await response.json().catch(()=>({}));
 if(!response.ok) throw new Error(payload.message||"Unable to verify this student right now.");
 return payload as PartnerMasterclassVerificationResult;
}

export async function recordPartnerMasterclassCheckin(candidate:any):Promise<void>{
 const session=(await client().auth.getSession()).data?.session;
 const response=await fetch("/api/partner-masterclass",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session?.access_token??""}`},body:JSON.stringify({action:"record",candidate})});
 const payload=await response.json().catch(()=>({}));
 if(!response.ok) throw new Error(payload.message||"Unable to save the masterclass verification.");
}

export async function getPartnerMasterclassHistory():Promise<PartnerMasterclassHistoryRow[]>{
 const partner=requirePartnerIdentity();
 const session=(await client().auth.getSession()).data?.session;
 const response=await fetch("/api/partner-masterclass",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session?.access_token??""}`},body:JSON.stringify({action:"history",partnerUuid:partner.partnerUuid})});
 const payload=await response.json().catch(()=>({}));
 if(!response.ok) throw new Error(payload.message||"Unable to load masterclass history.");
 return Array.isArray(payload.rows)
  ? payload.rows.map((row: any): PartnerMasterclassHistoryRow => ({
      id: String(row.id ?? ""),
      partnerUuid: String(row.partner_uuid ?? ""),
      studentUuid: String(row.student_uuid ?? ""),
      rollNumber: String(row.roll_number ?? ""),
      studentName: String(row.student_name ?? ""),
      verifiedAt: String(row.verified_at ?? ""),
      schoolUuid: String(row.school_uuid ?? ""),
      schoolName: String(row.school_name ?? ""),
      className: String(row.class_name ?? ""),
      sectionName: String(row.section_name ?? ""),
      parentPhone: String(row.parent_phone ?? ""),
      parentEmail: String(row.parent_email ?? ""),
      masterclassMonth: String(row.masterclass_month ?? ""),
    }))
  : [];
}
