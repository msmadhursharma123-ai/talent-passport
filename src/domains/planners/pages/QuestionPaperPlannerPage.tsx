import { useEffect, useMemo, useRef, useState } from "react";
import { getPlannerAssignments, getPlannerRecommendations, getTeacherPlanners, savePlanner } from "../repository/PlannerRepository";
import type { PlannerRecord, PlannerType, PlannerRecommendation, QuestionItem, QuestionPaperPayload, TeacherAssignmentOption } from "../types/PlannerModels";
import { AssignmentFields, PaperPreview, PlannerHistoryTable, PlannerPageFrame, PlannerRecommendations, QuestionEditor, preparePlannerRecommendation, printPlannerRecord } from "../components/PlannerUI";

export default function QuestionPaperPlannerPage({plannerType}:{plannerType:PlannerType}){
  const isUnit=plannerType==="unit_test";
  const isWorksheet=plannerType==="worksheet";
  const [assignments,setAssignments]=useState<TeacherAssignmentOption[]>([]); const [records,setRecords]=useState<PlannerRecord[]>([]); const [preview,setPreview]=useState<PlannerRecord|null>(null); const [editing,setEditing]=useState<PlannerRecord|null>(null);
  const [schoolName,setSchoolName]=useState(""); const [title,setTitle]=useState(isUnit?"Unit Test":isWorksheet?"Worksheet":"Examination Paper"); const [totalMarks,setTotalMarks]=useState(40); const [timeAllowed,setTimeAllowed]=useState("60 minutes"); const [className,setClassName]=useState(""); const [sectionName,setSectionName]=useState(""); const [subjectName,setSubjectName]=useState(""); const [date,setDate]=useState(""); const [questions,setQuestions]=useState<QuestionItem[]>([]);
  const [chapterInput,setChapterInput]=useState(""); const [chapters,setChapters]=useState<string[]>([]);
  const [recommendations,setRecommendations]=useState<PlannerRecommendation[]>([]); const [recommendationLoading,setRecommendationLoading]=useState(false); const [recommendationError,setRecommendationError]=useState(""); const recommendationRequest=useRef(0);
  const [saving,setSaving]=useState(false); const [error,setError]=useState("");
  async function load(){try{const [a,r]=await Promise.all([getPlannerAssignments(),getTeacherPlanners(plannerType)]);setAssignments(a);setRecords(r);}catch(e:any){setError(e?.message??"Unable to load paper planners.")}}
  useEffect(()=>{void load()},[plannerType]);
  useEffect(()=>{
    if(isWorksheet) return;
    const requestId=++recommendationRequest.current;
    const timer=window.setTimeout(async()=>{
      if(!className || (isWorksheet ? !chapterInput.trim() : chapters.length===0)){setRecommendations([]);setRecommendationLoading(false);setRecommendationError("");return;}
      setRecommendationLoading(true);setRecommendationError("");
      try{
        const rows=await getPlannerRecommendations({plannerType,className,chapterName:isWorksheet?chapterInput.trim():undefined,chapterNames:isWorksheet?undefined:chapters});
        if(requestId===recommendationRequest.current)setRecommendations(rows);
      }catch(e:any){if(requestId===recommendationRequest.current){setRecommendations([]);setRecommendationError(e?.message??"Unable to load recommendations.");}}
      finally{if(requestId===recommendationRequest.current)setRecommendationLoading(false);}
    },180);
    return ()=>window.clearTimeout(timer);
  },[plannerType,isUnit,isWorksheet,className,chapterInput,chapters]);
  const computedTotal=useMemo(()=>questions.reduce((s,q)=>s+Number(q.marks||0),0),[questions]);
  function choose(a:TeacherAssignmentOption){setClassName(a.className);setSectionName(a.sectionName);setSubjectName(a.subjectName)}
  function addChapter(){const value=chapterInput.trim();if(!value)return;if(chapters.includes(value)){setError("That chapter has already been added.");return;}setChapters(current=>[...current,value]);setChapterInput("");setError("");}
  function removeChapter(value:string){setChapters(current=>current.filter(item=>item!==value));}
  function valid(){if(!schoolName||!className||!sectionName||!subjectName||!date||questions.length===0){setError("Complete school, assigned classroom, subject, date and at least one question.");return false}if(!isWorksheet && chapters.length===0){setError("Add at least one chapter for this paper.");return false}if(computedTotal!==Number(totalMarks)){setError(`Question marks total ${computedTotal}, but paper total is ${totalMarks}.`);return false}return true}
  async function submit(){if(!valid())return;setSaving(true);setError("");try{const payload:QuestionPaperPayload={schoolName,totalMarks:Number(totalMarks),timeAllowed,...(!isWorksheet?{chapters}:{}),questions};await savePlanner({plannerType,title,templateKey:"a4-paper",className,sectionName,subjectName,startDate:date,endDate:date,payload,...(!isWorksheet?{chapterNames:chapters}:{}),submit:true});setQuestions([]);if(!isWorksheet){setChapters([]);setChapterInput("");}await load()}catch(e:any){setError(e?.message??"Unable to submit paper.")}finally{setSaving(false)}}
  function newPreview(){if(!valid())return;setPreview({id:"preview",schoolUuid:"",teacherUuid:"",teacherName:"",plannerType,title,templateKey:"a4-paper",className,sectionName,subjectName,startDate:date,endDate:date,payload:{schoolName,totalMarks:Number(totalMarks),timeAllowed,...(!isWorksheet?{chapters}:{}),questions},status:"DRAFT",reviewNote:"",submittedAt:null,reviewedAt:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})}
  function previewRecommendation(r:PlannerRecommendation){setPreview(preparePlannerRecommendation(r));}
  function useRecommendation(r:PlannerRecommendation){const prepared=preparePlannerRecommendation(r);const payload=prepared.payload as QuestionPaperPayload;setEditing({...prepared,className:className||prepared.className,sectionName:sectionName||prepared.sectionName,subjectName:subjectName||prepared.subjectName,startDate:date||prepared.startDate,endDate:date||prepared.endDate,title:title||prepared.title,payload:{...payload,schoolName:"",chapters:isWorksheet?undefined:(chapters.length?chapters:(payload.chapters??[])),chapter:isWorksheet?(chapterInput.trim()||payload.chapter):undefined}});}
  async function saveEdited(payload:QuestionPaperPayload){if(!editing)return;setSaving(true);try{
    const isRecommendation=editing.id.startsWith("recommendation:");
    const normalizedChapters=!isWorksheet?(payload.chapters??[]).map(x=>x.trim()).filter(Boolean):[];
    const normalizedChapter=isWorksheet?(payload.chapter??"").trim():"";
    const nextPayload:QuestionPaperPayload={...payload,schoolName:payload.schoolName??"",chapters:!isWorksheet?normalizedChapters:undefined,chapter:isWorksheet?normalizedChapter:undefined,questions:payload.questions??[]};
    const input:any={plannerType,title:editing.title,templateKey:editing.templateKey,className:editing.className,sectionName:editing.sectionName,subjectName:editing.subjectName,startDate:editing.startDate,endDate:editing.endDate,payload:nextPayload,chapterName:isWorksheet?normalizedChapter:undefined,chapterNames:!isWorksheet?normalizedChapters:undefined,submit:true};
    if(!isRecommendation) input.id=editing.id;
    await savePlanner(input);setEditing(null);await load();
  }catch(e:any){setError(e?.message??"Unable to save edits.")}finally{setSaving(false)}}
  function download(r:PlannerRecord){printPlannerRecord(r)}
  return <PlannerPageFrame
    title={isUnit ? "Unit Test Planner" : isWorksheet ? "Worksheet Maker" : "Exam Paper Planner"}
    eyebrow={isUnit ? "UNIT TEST PLANNING WORKSPACE" : isWorksheet ? "WORKSHEET PLANNING WORKSPACE" : "EXAM PAPER PLANNING WORKSPACE"}
    copy="Prepare a structured A4-ready paper using prebuilt question types, mark allocation and a compact preview/edit workflow designed for teacher mobile and tablet use."
  >
    {error && <div className="planner-section" style={{background:"#FEF2F2",borderColor:"#FECACA",color:"#B91C1C",fontSize:10,fontWeight:800}}>{error}</div>}
    <section className="planner-section">
      <div className="planner-section-head">
        <div>
          <div className="planner-eyebrow">01 · {isWorksheet ? "Worksheet setup" : "Paper setup"}</div>
          <h2 className="planner-section-title">{isWorksheet ? "Save the worksheet details" : "Save the paper details"}</h2>
          <p className="planner-section-copy">The classroom dropdown uses your existing teacher assignment data.</p>
        </div>
      </div>
      <div className="planner-grid">
        <div className="planner-field"><label>School name</label><input value={schoolName} onChange={(e: any)=>setSchoolName(e.target.value)} placeholder="School name"/></div>
        <div className="planner-field"><label>{isWorksheet ? "Worksheet title" : "Paper title"}</label><input value={title} onChange={(e: any)=>setTitle(e.target.value)}/></div>
        <div className="planner-field"><label>Total marks</label><input type="number" min={1} value={totalMarks} onChange={(e: any)=>setTotalMarks(Number(e.target.value))}/></div>
        <div className="planner-field"><label>Time allotted</label><input value={timeAllowed} onChange={(e: any)=>setTimeAllowed(e.target.value)} placeholder="60 minutes"/></div>
      </div>
      <AssignmentFields assignments={assignments} className={className} sectionName={sectionName} subjectName={subjectName} onSelect={choose}/>
      {!isWorksheet && <div>
        <div className="planner-field" style={{marginTop:10}}>
          <label>Chapters</label>
          <div className="planner-chapter-entry">
            <div className="planner-field"><input value={chapterInput} onChange={e=>setChapterInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addChapter();}}} placeholder="Enter chapter name"/></div>
            <button type="button" className="planner-btn" onClick={addChapter}>+ Add</button>
          </div>
          <div className="planner-recommendations-copy" style={{marginTop:4}}>Add chapters one by one for which you want to make this {isUnit ? "unit test" : "exam paper"}.</div>
          {chapters.length > 0 && <div className="planner-chapter-list">{chapters.map(item => <span className="planner-chapter-chip" key={item}>{item}<button type="button" onClick={()=>removeChapter(item)} aria-label={`Remove ${item}`}>×</button></span>)}</div>}
        </div>
        <PlannerRecommendations recommendations={recommendations} loading={recommendationLoading} error={recommendationError} onPreview={previewRecommendation} onUse={useRecommendation}/>
      </div>}
      <div className="planner-grid">
        <div className="planner-field"><label>Date</label><input type="date" value={date} onChange={(e: any)=>setDate(e.target.value)}/></div>
        <div className="planner-field"><label>Day</label><input value={date ? new Date(date).toLocaleDateString("en-IN",{weekday:"long"}) : ""} readOnly placeholder="Auto from date"/></div>
      </div>
    </section>
    <section className="planner-section">
      <div className="planner-section-head">
        <div>
          <div className="planner-eyebrow">02 · Questions</div>
          <h2 className="planner-section-title">{isWorksheet ? "Build the worksheet" : "Build the paper"}</h2>
          <p className="planner-section-copy">MCQ, short answer, long answer, match columns, fill in the blanks, true/false, image-based questions and unseen passages. Add as many questions as needed.</p>
        </div>
        <span style={{fontSize:10,fontWeight:800,color:computedTotal===Number(totalMarks)?"#15803D":"#C2410C"}}>{computedTotal} / {totalMarks} marks</span>
      </div>
      <QuestionEditor questions={questions} onChange={setQuestions}/>
      <div className="planner-actions" style={{marginTop:12}}><button className="planner-btn" onClick={newPreview}>Preview A4</button><button className="planner-btn primary" disabled={saving} onClick={submit}>{saving ? "Submitting…" : "Save & Submit"}</button></div>
    </section>
    <section className="planner-section">
      <div className="planner-section-head">
        <div>
          <div className="planner-eyebrow">03 · History</div>
          <h2 className="planner-section-title">{isWorksheet ? "Published worksheet history" : "Published paper history"}</h2>
          <p className="planner-section-copy">View, edit and use the PDF print flow from the same compact scrollable table.</p>
        </div>
      </div>
      <PlannerHistoryTable records={records} onView={setPreview} onEdit={setEditing} onDownload={download}/>
    </section>
    {preview && <PaperPreview record={preview} onClose={()=>setPreview(null)}/>} 
    {editing && <PaperPreview record={editing} editable onClose={()=>setEditing(null)} onSaveEdit={saveEdited}/>} 
  </PlannerPageFrame>;
}
