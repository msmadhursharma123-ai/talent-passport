import {getSupabaseClient} from "../supabaseClient";
import {getTableIdentity} from "./identityService";
import {

  getStudentPerformances,

  getStudentProjects,

  getStudentSkills,

} from "../data/studentRepository";



import {

  getStudentAchievements,

} from "../data/timelineRepository";
import {buildGrowthEngagementScore} from "../engines/growthEngagementEngine";
import {buildAchievementStrengthScore} from "../engines/achievementStrengthEngine";
import {buildProfileConfidenceScore} from "../engines/profileConfidenceEngine";

const hasProof=(r:any)=>["proof_url","certificate_url","image_url","evidence_url","media_url","document_url","attachment_url"].some(k=>typeof r?.[k]==="string"&&r[k].trim());
const isVerified=(r:any)=>r?.verified===true||r?.is_verified===true||String(r?.verification_status??r?.status??"").toLowerCase()==="verified";

export async function getStudentEvidenceSnapshot(){
 const supabase=getSupabaseClient(); if(!supabase)throw new Error("Supabase client not initialized");
 const [performances,projects,skills,achievements]=await Promise.all([getStudentPerformances(),getStudentProjects(),getStudentSkills(),getStudentAchievements()]);
 const submissionId=getTableIdentity("submissions"),creditId=getTableIdentity("credit_transactions"),walletId=getTableIdentity("student_wallets");
 const [subs,tx,wallet]=await Promise.all([
  (supabase as any).from("submissions").select("id").eq("student_id",submissionId),
  (supabase as any).from("credit_transactions").select("id").eq("student_id",creditId),
  (supabase as any).from("student_wallets").select("lifetime_earned").eq("student_id",walletId).maybeSingle()
 ]);
 if(subs.error)console.error("EVIDENCE SUBMISSIONS ERROR",subs.error);
 if(tx.error)console.error("EVIDENCE CREDIT ERROR",tx.error);
 if(wallet.error)console.error("EVIDENCE WALLET ERROR",wallet.error);
 const portfolioItems=performances.length+projects.length+skills.length;
 const verifiedAchievements=achievements.filter(isVerified).length,achievementsWithProof=achievements.filter(hasProof).length;
 const competitionSubmissions=subs.data?.length??0,creditTransactions=tx.data?.length??0,lifetimeCreditsEarned=Number(wallet.data?.lifetime_earned??0);
 const common={portfolioItems,achievements:achievements.length,verifiedAchievements,competitionSubmissions,creditTransactions};
 return{
  portfolio:{performances:performances.length,projects:projects.length,skills:skills.length,total:portfolioItems},
  timeline:{achievements:achievements.length,verified:verifiedAchievements,withProof:achievementsWithProof},
  competitions:{submissions:competitionSubmissions},
  credits:{transactions:creditTransactions,lifetimeEarned:lifetimeCreditsEarned},
  intelligence:{
   growthEngagement:buildGrowthEngagementScore({...common,lifetimeCreditsEarned}),
   achievementStrength:buildAchievementStrengthScore({totalAchievements:achievements.length,verifiedAchievements,achievementsWithProof}),
   profileConfidence:buildProfileConfidenceScore(common)
  }
 };
}
