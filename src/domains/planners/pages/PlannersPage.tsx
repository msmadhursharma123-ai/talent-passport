import { useEffect, useState } from "react";
import { getPlannerAssignments, getTeacherPlanners, savePlanner } from "../repository/PlannerRepository";
import type { LessonBlock, PlannerRecord, TeacherAssignmentOption } from "../types/PlannerModels";
import { AssignmentFields, LessonComposer, LessonPreview, PlannerHistoryTable, PlannerPageFrame, TemplatePicker, TEMPLATES, printPlannerRecord } from "../components/PlannerUI";

export default function PlannersPage() {
  const [assignments,setAssignments]=useState<TeacherAssignmentOption[]>([]);
  const [records,setRecords]=useState<PlannerRecord[]>([]);
  const [templateKey,setTemplateKey]=useState<string>(TEMPLATES[0].key);
  const [title,setTitle]=useState("Weekly Lesson Plan");
  const [className,setClassName]=useState(""); const [sectionName,setSectionName]=useState(""); const [subjectName,setSubjectName]=useState("");
  const [startDate,setStartDate]=useState(""); const [endDate,setEndDate]=useState("");
  const [blocks,setBlocks]=useState<LessonBlock[]>([]);
  const [preview,setPreview]=useState<PlannerRecord|null>(null);
  const [editing,setEditing]=useState<PlannerRecord|null>(null);
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [error,setError]=useState("");

  async function load(){setLoading(true);setError("");try{const [a,r]=await Promise.all([getPlannerAssignments(),getTeacherPlanners("lesson")]);setAssignments(a);setRecords(r);}catch(e:any){setError(e?.message??"Unable to load planners.")}finally{setLoading(false)}}
  useEffect(()=>{void load()},[]);
  function chooseAssignment(a:TeacherAssignmentOption){setClassName(a.className);setSectionName(a.sectionName);setSubjectName(a.subjectName);}
  function valid(){if(!templateKey||!className||!sectionName||!subjectName||!startDate||!endDate||blocks.length===0){setError("Select a template, assigned classroom, date range and at least one lesson section.");return false}if(startDate>endDate){setError("End date must be on or after start date.");return false}return true}
  async function submit(){if(!valid())return;setSaving(true);setError("");try{await savePlanner({plannerType:"lesson",title,templateKey,className,sectionName,subjectName,startDate,endDate,payload:{blocks},submit:true});setBlocks([]);setTitle("Weekly Lesson Plan");await load();}catch(e:any){setError(e?.message??"Unable to submit lesson plan.")}finally{setSaving(false)}}
  function download(r:PlannerRecord){printPlannerRecord(r)}
  async function saveEdited(payload:{blocks:LessonBlock[]}){if(!editing)return;setSaving(true);try{await savePlanner({id:editing.id,plannerType:"lesson",title:editing.title,templateKey:editing.templateKey,className:editing.className,sectionName:editing.sectionName,subjectName:editing.subjectName,startDate:editing.startDate,endDate:editing.endDate,payload,submit:true});setEditing(null);await load();}catch(e:any){setError(e?.message??"Unable to save edits.")}finally{setSaving(false)}}

  return <PlannerPageFrame title="Planners" eyebrow="ACADEMIC PLANNING WORKSPACE" copy="Build structured lesson plans from your assigned classrooms, preview them before submission, and keep a compact history of every published plan.">
    {error&&<div className="planner-section" style={{background:"#FEF2F2",borderColor:"#FECACA",color:"#B91C1C",fontSize:10,fontWeight:800}}>{error}</div>}
    <section className="planner-section"><div className="planner-section-head"><div><div className="planner-eyebrow">01 · Template</div><h2 className="planner-section-title">Choose a lesson planner style</h2><p className="planner-section-copy">Preview the professional layout first. Your selected template controls the final planner presentation.</p></div></div><TemplatePicker value={templateKey} onChange={setTemplateKey}/></section>
    <section className="planner-section"><div className="planner-section-head"><div><div className="planner-eyebrow">02 · Scope</div><h2 className="planner-section-title">Classroom & time period</h2><p className="planner-section-copy">Only classrooms already assigned to your teacher identity are available.</p></div></div><AssignmentFields assignments={assignments} className={className} sectionName={sectionName} subjectName={subjectName} onSelect={chooseAssignment}/><div className="planner-grid"><div className="planner-field"><label>Planner title</label><input value={title} onChange={(e: any)=>setTitle(e.target.value)} placeholder="Weekly Lesson Plan"/></div><div className="planner-field"><label>Start date</label><input type="date" value={startDate} onChange={(e: any)=>setStartDate(e.target.value)}/></div><div className="planner-field"><label>End date</label><input type="date" value={endDate} onChange={(e: any)=>setEndDate(e.target.value)}/></div></div></section>
    <section className="planner-section"><div className="planner-section-head"><div><div className="planner-eyebrow">03 · Build</div><h2 className="planner-section-title">Add lesson sections in any sequence</h2><p className="planner-section-copy">Date, day, chapter, topic, subtopics, notes and images can be repeated as often as needed.</p></div></div><LessonComposer blocks={blocks} onChange={setBlocks} startDate={startDate} endDate={endDate}/><div className="planner-actions" style={{marginTop:12}}><button className="planner-btn" disabled={loading||saving} onClick={()=>{if(!valid())return;setPreview({id:"preview",schoolUuid:"",teacherUuid:"",teacherName:"",plannerType:"lesson",title,templateKey,className,sectionName,subjectName,startDate,endDate,payload:{blocks},status:"DRAFT",reviewNote:"",submittedAt:null,reviewedAt:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})}}>Preview</button><button className="planner-btn primary" disabled={saving} onClick={submit}>{saving?"Submitting…":"Save & Submit"}</button></div></section>
    <section className="planner-section"><div className="planner-section-head"><div><div className="planner-eyebrow">04 · History</div><h2 className="planner-section-title">Published lesson planner history</h2><p className="planner-section-copy">Compact, horizontally scrollable on mobile and tablet, matching the existing school intelligence table pattern.</p></div></div><PlannerHistoryTable records={records} onView={setPreview} onEdit={setEditing} onDownload={download}/></section>
    {preview&&<LessonPreview record={preview} onClose={()=>setPreview(null)}/>} {editing&&<LessonPreview record={editing} editable onClose={()=>setEditing(null)} onSaveEdit={saveEdited}/>} 
  </PlannerPageFrame>;
}
