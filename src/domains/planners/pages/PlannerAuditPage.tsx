import { useEffect, useMemo, useState } from "react";
import type { LessonPlannerPayload, PlannerRecord, PlannerType, QuestionPaperPayload } from "../types/PlannerModels";
import { getSchoolPlanners, reviewPlanner, updateSchoolPlanner } from "../repository/PlannerRepository";
import { AuditGroups, LessonPreview, PaperPreview, PlannerAuditFilters, PlannerPageFrame, type PlannerTimeFilter } from "../components/PlannerUI";

export default function PlannerAuditPage({plannerType}:{plannerType:PlannerType}){
  const label=plannerType==="lesson"?"Lesson Plans":plannerType==="unit_test"?"Unit Test Papers":"Exam Papers";
  const [records,setRecords]=useState<PlannerRecord[]>([]);
  const [teacherName,setTeacherName]=useState("");
  const [className,setClassName]=useState("");
  const [sectionName,setSectionName]=useState("");
  const [timeFilter,setTimeFilter]=useState<PlannerTimeFilter>("ALL");
  const [customStart,setCustomStart]=useState("");
  const [customEnd,setCustomEnd]=useState("");
  const [preview,setPreview]=useState<PlannerRecord|null>(null); const [editing,setEditing]=useState<PlannerRecord|null>(null); const [error,setError]=useState(""); const [loading,setLoading]=useState(true); const [status,setStatus]=useState<"ALL"|"SUBMITTED"|"APPROVED"|"REJECTED">("ALL");
  async function load(){setLoading(true);setError("");try{setRecords(await getSchoolPlanners(plannerType))}catch(e:any){setError(e?.message??"Unable to load planner audit.")}finally{setLoading(false)}}
  useEffect(()=>{void load()},[plannerType]);
  const visible=useMemo(()=>{
    const now=Date.now();
    const cutoffDays: Record<Exclude<PlannerTimeFilter,"ALL"|"CUSTOM">,number>={ "7D":7, "14D":14, "30D":30, "60D":60 };
    return records.filter(r=>{
      if(status!=="ALL" && r.status!==status) return false;
      // Deliberately case-sensitive: JS includes() preserves exact teacher-name casing.
      if(teacherName && !r.teacherName.includes(teacherName)) return false;
      if(className && r.className!==className) return false;
      if(sectionName && r.sectionName!==sectionName) return false;
      const raw=r.submittedAt||r.createdAt;
      const recordTime=raw?new Date(raw).getTime():NaN;
      if(timeFilter!=="ALL" && timeFilter!=="CUSTOM"){
        if(Number.isNaN(recordTime) || recordTime < now-cutoffDays[timeFilter]*24*60*60*1000) return false;
      }
      if(timeFilter==="CUSTOM"){
        const recordDate=raw ? raw.slice(0,10) : "";
        if(customStart && (!recordDate || recordDate<customStart)) return false;
        if(customEnd && (!recordDate || recordDate>customEnd)) return false;
      }
      return true;
    });
  },[records,status,teacherName,className,sectionName,timeFilter,customStart,customEnd]);
  async function review(r:PlannerRecord,next:"APPROVED"|"REJECTED"){try{await reviewPlanner(r.id,next);await load()}catch(e:any){setError(e?.message??"Unable to update planner review status.")}}
  async function saveLesson(payload:LessonPlannerPayload){if(!editing)return;try{const r=await updateSchoolPlanner(editing.id,{payload});setEditing(null);setPreview(r);await load()}catch(e:any){setError(e?.message??"Unable to edit planner.")}}
  async function savePaper(payload:QuestionPaperPayload){if(!editing)return;try{const r=await updateSchoolPlanner(editing.id,{payload});setEditing(null);setPreview(r);await load()}catch(e:any){setError(e?.message??"Unable to edit paper.")}}
  return <PlannerPageFrame title={`${label} Audit`} eyebrow="SCHOOL ACADEMIC OVERSIGHT" copy={`Review every ${label.toLowerCase()} submitted by teachers of the authenticated school. Teacher submissions are grouped by teacher and retain their exact assigned class, section and subject metadata.`}>
    {error&&<div className="planner-section" style={{background:"#FEF2F2",borderColor:"#FECACA",color:"#B91C1C",fontSize:10,fontWeight:800}}>{error}</div>}
    <section className="planner-section"><div className="planner-section-head"><div><div className="planner-eyebrow">Teacher submission ledger</div><h2 className="planner-section-title">{label} by teacher</h2><p className="planner-section-copy">Each teacher is kept as a separate group, with all their classroom submissions underneath.</p></div><div className="planner-actions">{(["ALL","SUBMITTED","APPROVED","REJECTED"] as const).map(s=><button key={s} className={`planner-btn ${status===s?"primary":""}`} onClick={()=>setStatus(s)}>{s}</button>)}</div></div><div style={{marginTop:10,color:"#94A3B8",fontSize:9,fontWeight:700}}>{loading?"Loading…":`${visible.length} submission${visible.length===1?"":"s"} in this school`}</div><PlannerAuditFilters records={records} teacherName={teacherName} className={className} sectionName={sectionName} timeFilter={timeFilter} customStart={customStart} customEnd={customEnd} onTeacherNameChange={setTeacherName} onClassChange={v=>{setClassName(v);setSectionName("");}} onSectionChange={setSectionName} onTimeFilterChange={v=>{setTimeFilter(v);if(v!=="CUSTOM"){setCustomStart("");setCustomEnd("");}}} onCustomStartChange={setCustomStart} onCustomEndChange={setCustomEnd}/></section>
    <AuditGroups records={visible} onView={setPreview} onEdit={setEditing} onReview={review}/>
    {preview&&(preview.plannerType==="lesson"?<LessonPreview record={preview} onClose={()=>setPreview(null)}/>:<PaperPreview record={preview} onClose={()=>setPreview(null)}/>)}
    {editing&&(editing.plannerType==="lesson"?<LessonPreview record={editing} editable onClose={()=>setEditing(null)} onSaveEdit={saveLesson}/>:<PaperPreview record={editing} editable onClose={()=>setEditing(null)} onSaveEdit={savePaper}/>)}
  </PlannerPageFrame>;
}
