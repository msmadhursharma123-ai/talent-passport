import React from "react";
import type { SchoolAcademicYear } from "../models/AcademicYearModels";

export default function AcademicYearOnboardingComplete({academicYear,role,onLogout}:{academicYear:SchoolAcademicYear;role:"student"|"teacher";onLogout:()=>void}){
  return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:18,boxSizing:"border-box",background:"linear-gradient(135deg,#F8F7F4 0%,#FCFAF7 38%,#FFF7EE 70%,#F3F6FB 100%)"}}>
    <div style={{width:"min(560px,100%)",boxSizing:"border-box",background:"#FFFFFF",borderRadius:20,padding:"28px 22px",border:"1px solid #E2E8F0",boxShadow:"0 12px 30px rgba(15,23,42,.08)",textAlign:"center"}}>
      <div style={{fontSize:22,fontWeight:900,color:"#143B73"}}>New academic year setup complete</div>
      <p style={{margin:"10px 0 8px",fontSize:13,lineHeight:1.55,color:"#64748B"}}>
        Your {role} profile and academic selections for <b>{academicYear.academicYearName}</b> are saved. Your existing authentication and identity were preserved.
      </p>
      <p style={{margin:"0 0 18px",fontSize:12,lineHeight:1.55,color:"#94A3B8"}}>
        This school year is not active yet. Your {role} portal will open with these assignments when the school activates the academic year.
      </p>
      <button type="button" onClick={onLogout} style={{border:0,borderRadius:10,padding:"10px 16px",background:"#143B73",color:"#fff",fontWeight:900,cursor:"pointer"}}>Logout</button>
    </div>
  </div>;
}
