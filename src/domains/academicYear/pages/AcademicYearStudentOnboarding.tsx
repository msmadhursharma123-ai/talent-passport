import React,{useEffect,useState} from "react";
import StudentProfileForm from "../../../pages/StudentProfileForm";
import QuestionWizard from "../../../pages/QuestionWizard";
import { studentQuestions } from "../../../data/studentData";
import type { SchoolAcademicYear } from "../models/AcademicYearModels";
import { finishStudentAcademicYearOnboarding, prepareStudentAcademicYearOnboarding } from "../services/AcademicYearOnboardingService";

interface Props {
  academicYear: SchoolAcademicYear;
  onCurrentYearComplete: () => void;
  onLogout?: () => void;
}

export default function AcademicYearStudentOnboarding({academicYear,onCurrentYearComplete,onLogout}:Props){
  const[phase,setPhase]=useState<"loading"|"profile"|"questionnaire"|"complete">("loading");
  const[error,setError]=useState("");

  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      try{
        await prepareStudentAcademicYearOnboarding(academicYear.id);
        if(!cancelled)setPhase("profile");
      }catch(e:any){
        console.error("ACADEMIC YEAR STUDENT ONBOARDING PREPARATION FAILED",e);
        if(!cancelled){setError(e?.message??"Unable to start academic-year onboarding.");setPhase("complete");}
      }
    })();
    return()=>{cancelled=true;};
  },[academicYear.id]);

  if(phase==="loading")return <OnboardingShell title="Preparing your new academic year" message={`Please wait while ${academicYear.academicYearName} is prepared. Your existing login and student identity remain unchanged.`}/>;
  if(error)return <OnboardingShell title="Academic year setup could not start" message={error} action={onLogout}/>;
  if(phase==="complete")return <OnboardingShell title={`${academicYear.academicYearName} onboarding completed`} message={academicYear.isCurrent?"Your new academic-year profile is ready. Opening your Student Portal.":"Your new academic-year profile is saved. Your school will make this year available when it activates the academic year."} action={academicYear.isCurrent?onCurrentYearComplete:onLogout}/>;

  if(phase==="profile")return <div><div style={{margin:"10px 12px",padding:"9px 11px",border:"1px solid #DBEAFE",borderRadius:10,background:"#EFF6FF",color:"#1E3A8A",fontSize:11,fontWeight:800,textAlign:"center"}}>Annual update for {academicYear.academicYearName}: review your student profile, update your new class, then complete the questionnaire again. Your authentication and identity stay the same.</div><StudentProfileForm lockedSchoolUuid={academicYear.schoolUuid} academicYearId={academicYear.id} academicYearReOnboarding onBack={()=>{}} onContinue={()=>setPhase("questionnaire")}/></div>;

  return <QuestionWizard
    questions={studentQuestions}
    title={`Student Questionnaire · ${academicYear.academicYearName}`}
    academicYearReOnboarding
    academicYearId={academicYear.id}
    academicYearIsCurrent={academicYear.isCurrent}
    onBack={()=>setPhase("profile")}
    onComplete={async()=>{
      try{
        await finishStudentAcademicYearOnboarding(academicYear.id);
        if(academicYear.isCurrent){
          onCurrentYearComplete();
          return;
        }
        setPhase("complete");
      }catch(e:any){
        console.error("ACADEMIC YEAR STUDENT ONBOARDING COMPLETION FAILED",e);
        alert(e?.message??"Your academic-year onboarding could not be completed. Please try again.");
      }
    }}
  />;
}

function OnboardingShell({title,message,action}:{title:string;message:string;action?:()=>void}){
  return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:18,boxSizing:"border-box",background:"linear-gradient(135deg,#F8F7F4 0%,#FCFAF7 38%,#FFF7EE 70%,#F3F6FB 100%)"}}>
    <div style={{width:"min(560px,100%)",boxSizing:"border-box",background:"#FFFFFF",borderRadius:20,padding:"28px 22px",border:"1px solid #E2E8F0",boxShadow:"0 12px 30px rgba(15,23,42,.08)",textAlign:"center"}}>
      <div style={{fontSize:22,fontWeight:900,color:"#143B73"}}>{title}</div>
      <p style={{margin:"10px 0 18px",fontSize:13,lineHeight:1.55,color:"#64748B"}}>{message}</p>
      {action?<button type="button" onClick={action} style={{border:0,borderRadius:10,padding:"10px 16px",background:"#143B73",color:"#fff",fontWeight:900,cursor:"pointer"}}>Continue</button>:null}
    </div>
  </div>;
}
