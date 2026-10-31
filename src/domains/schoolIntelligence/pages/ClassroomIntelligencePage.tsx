import "./schoolIntelligence.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadSchoolIntelligence } from "../viewmodels/SchoolIntelligenceViewModel";
import type { SchoolIntelligenceSnapshot, SchoolTeacherDailyIntelligence } from "../types/SchoolIntelligenceModels";
import SchoolAnalyticsLoadingPopup from "../components/SchoolAnalyticsLoadingPopup";
import { downloadStudentHealthAnalysis, savePreparedStudentHealthAnalysisPdf } from "../services/StudentHealthAnalysisPdfService";
import type { PreparedStudentHealthAnalysisPdf } from "../services/StudentHealthAnalysisPdfService";

const tones=[
  ["#FFF7ED","#FFFBF5","#FED7AA","#C2410C"],
  ["#EFF6FF","#F8FBFF","#BFDBFE","#1D4ED8"],
  ["#ECFDF5","#F7FFFB","#BBF7D0","#15803D"],
  ["#F5F3FF","#FBFAFF","#DDD6FE","#7C3AED"],
];

function dateLabel(v:string){
  if(!v)return "Latest lecture";
  const d=new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime())?v:d.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
}

export default function ClassroomIntelligencePage(){
  const [data,setData]=useState<SchoolIntelligenceSnapshot|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [selected,setSelected]=useState<string[]>([]);
  const [open,setOpen]=useState(false);
  const [reportLoading,setReportLoading]=useState(false);
  const [reportProgress,setReportProgress]=useState(0);
  const [preparedReport,setPreparedReport]=useState<PreparedStudentHealthAnalysisPdf|null>(null);
  const [reportSaveBusy,setReportSaveBusy]=useState(false);
  const menuRef=useRef<HTMLDivElement|null>(null);

  useEffect(()=>{let dead=false;(async()=>{
    try{setLoading(true);setError("");const x=await loadSchoolIntelligence();if(!dead)setData(x);}
    catch(e:any){if(!dead)setError(e?.message??"Unable to load classroom intelligence.");}
    finally{if(!dead)setLoading(false);}
  })();return()=>{dead=true};},[]);

  useEffect(()=>{
    const close=(e:MouseEvent)=>{if(menuRef.current&&!menuRef.current.contains(e.target as Node))setOpen(false)};
    document.addEventListener("mousedown",close);return()=>document.removeEventListener("mousedown",close);
  },[]);

  const options=useMemo(()=>data?.dailyClassroomIntelligence??[],[data]);
  const visible=useMemo(()=>selected.length?options.filter(t=>selected.includes(t.teacherUuid)):options,[options,selected]);
  const classroomCount=visible.reduce((n,t)=>n+t.classrooms.length,0);
  const label=selected.length===0?"All Teachers":selected.length===1
    ?options.find(t=>t.teacherUuid===selected[0])?.teacherName??"1 Teacher"
    :`${selected.length} Teachers Selected`;

  const toggle=(id:string)=>setSelected(x=>x.includes(id)?x.filter(v=>v!==id):[...x,id]);

  if(loading&&!data)return <main className="school-page"><SchoolAnalyticsLoadingPopup active={loading} page="classroom" /><div className="school-section school-empty">Loading daily classroom intelligence…</div></main>;
  if(error)return <main className="school-page"><div className="school-section school-empty">{error}</div></main>;
  if(!data)return null;

  return <main className="school-page">
    <style>{`
/* =========================================================
   CONTENT ABOVE DECORATIVE CARD BACKGROUNDS
   Keep headings/body text above decorative circles/gradients.
   ========================================================= */
.school-hero,
.school-section,
.school-card {
  isolation: isolate;
}
.school-hero > *,
.school-section-head > *,
.school-card > * {
  position: relative;
  z-index: 2;
}
.school-hero::before,
.school-hero::after,
.school-section::before,
.school-section::after,
.school-card::before,
.school-card::after {
  pointer-events: none;
  z-index: 0 !important;
}

      .ci-hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#fff 0%,#fffcf8 72%,#fff7ed 100%)}
      .ci-hero:after{content:"";position:absolute;width:230px;height:230px;border-radius:50%;right:-70px;top:-120px;background:rgba(249,115,22,.06)}
      .ci-filter{margin-top:18px;padding:16px;border:1px solid #e2e8f0;border-radius:18px;background:linear-gradient(135deg,#fff,#f8fafc);box-shadow:0 8px 24px rgba(15,23,42,.04)}
      .ci-filter-row{display:flex;align-items:flex-end;justify-content:space-between;gap:16px}.ci-field{position:relative;width:min(390px,100%)}
      .ci-label{display:block;margin-bottom:6px;color:#64748b;font-size:10px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}
      .ci-button{width:100%;min-height:43px;display:flex;align-items:center;justify-content:space-between;border:1px solid #d8e0ea;border-radius:12px;background:#fff;color:#0f172a;padding:0 13px;font-size:12px;font-weight:800;cursor:pointer}
      .ci-menu{position:absolute;z-index:40;top:calc(100% + 7px);left:0;width:min(390px,88vw);max-height:330px;overflow:auto;padding:8px;border:1px solid #e2e8f0;border-radius:14px;background:#fff;box-shadow:0 20px 48px rgba(15,23,42,.17)}
      .ci-actions{display:flex;justify-content:space-between;padding:5px 6px 9px;border-bottom:1px solid #eef2f7}.ci-link{border:0;background:transparent;color:#2563eb;font-size:11px;font-weight:850;cursor:pointer}
      .ci-check{display:flex;align-items:center;gap:9px;padding:9px 7px;border-radius:9px;color:#334155;font-size:12px;font-weight:700;cursor:pointer}.ci-check:hover{background:#f8fafc}.ci-check input{accent-color:#2563eb}
      .ci-summary{color:#64748b;font-size:11px;font-weight:750;text-align:right}.ci-download-btn{flex:0 0 auto;min-height:38px;max-width:100%;border:0;border-radius:10px;padding:9px 12px;background:#f97316;color:#fff;font-size:12px;font-weight:800;line-height:1.25;cursor:pointer;white-space:normal;box-shadow:0 3px 8px rgba(249,115,22,.16)}.ci-download-btn:disabled{cursor:wait;opacity:.7}.ci-download-notice{margin-top:10px;padding:10px 12px;border:1px solid #fed7aa;border-radius:10px;background:#fff7ed;color:#9a3412;font-size:12px;font-weight:700;line-height:1.45}.ci-stack{display:grid;gap:20px;margin-top:20px}
      .ci-card{overflow:hidden;border:1px solid #e2e8f0;border-radius:24px;background:#fff;box-shadow:0 10px 30px rgba(15,23,42,.05)}
      .ci-head{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 20px;border-bottom:1px solid #e2e8f0}
      .ci-kicker{margin-bottom:4px;font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.ci-name{margin:0;color:#0f172a;font-size:19px;font-weight:850}
      .ci-meta{margin:5px 0 0;color:#64748b;font-size:11px;font-weight:650}.ci-badge{padding:7px 10px;border-radius:999px;font-size:10px;font-weight:850;white-space:nowrap}
      .ci-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}.ci-table{width:100%;min-width:1040px;border-collapse:separate;border-spacing:0}
      .ci-table th,.ci-table td{padding:12px 14px;border-bottom:1px solid #eef2f7;border-right:1px solid #eef2f7;vertical-align:top;font-size:11px;line-height:1.4}.ci-table th:last-child,.ci-table td:last-child{border-right:0}.ci-table tbody tr:last-child td{border-bottom:0}
      .ci-mh,.ci-metric{width:210px;min-width:210px;text-align:left}.ci-mh{color:#c2410c;background:linear-gradient(135deg,#fff7ed,#fffbf5);font-size:9px!important;font-weight:900;letter-spacing:.1em}
      .ci-ch{min-width:185px;text-align:left;font-size:11px!important;font-weight:900}.ci-sub{display:block;margin-top:3px;opacity:.72;font-size:9px;font-weight:750}
      .ci-metric{position:sticky;left:0;z-index:2;background:#fbfcfe;color:#334155;font-weight:800}.ci-v{color:#475569;font-weight:600}.ci-green{color:#16a34a;font-weight:850}.ci-yellow{color:#d97706;font-weight:850}.ci-red{color:#dc2626;font-weight:850}.ci-blue{color:#1d4ed8;font-weight:800}
      .ci-legend{display:flex;flex-wrap:wrap;gap:7px;padding:12px 18px;border-top:1px solid #eef2f7;background:#fcfdfe}.ci-legend span{padding:5px 8px;border-radius:999px;font-size:9px;font-weight:800}
      .ci-detail-trigger{border:0;background:transparent;padding:2px 5px;border-radius:7px;color:inherit;font:inherit;font-weight:850;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.ci-detail-trigger:disabled{cursor:default;text-decoration:none;opacity:.65}.ci-red .ci-detail-trigger{color:#dc2626}.ci-green .ci-detail-trigger{color:#16a34a}.ci-yellow .ci-detail-trigger{color:#d97706}.ci-popup-backdrop{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(15,23,42,.48);backdrop-filter:blur(3px)}.ci-popup{position:relative;width:min(620px,100%);max-height:min(82vh,760px);overflow:auto;padding:28px;border:1px solid #fed7aa;border-radius:24px;background:linear-gradient(145deg,#fff 0%,#fffaf5 100%);box-shadow:0 24px 70px rgba(15,23,42,.24);color:#0f172a}.ci-popup-close{position:absolute;right:18px;top:16px;width:42px;height:42px;border:1px solid #fed7aa;border-radius:12px;background:#fff7ed;color:#9a3412;font-size:27px;line-height:1;cursor:pointer}.ci-popup-kicker{padding-right:52px;color:#c2410c;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.ci-popup h3{margin:12px 52px 6px 0;font-size:clamp(19px,3vw,25px);line-height:1.25;font-weight:850}.ci-popup-count{margin:8px 0 14px;color:#64748b;font-size:14px;font-weight:750}.ci-popup-list{display:grid;gap:8px;margin:0 0 22px;padding:0 0 0 22px;color:#1e293b;font-size:15px;font-weight:650;line-height:1.45}.ci-popup-empty{color:#64748b;font-size:14px}.ci-popup-back{display:block;width:100%;min-height:48px;border:0;border-radius:12px;padding:12px 18px;background:#f97316;color:#fff;font-size:14px;font-weight:850;cursor:pointer;box-shadow:0 5px 14px rgba(249,115,22,.2)}@media(max-width:600px){.ci-popup{padding:24px 20px 20px;border-radius:20px}.ci-popup-list{font-size:14px}.ci-popup-back{font-size:13px}}
      @media(max-width:760px){.ci-filter-row{align-items:stretch;flex-direction:column}.ci-field{width:100%}.ci-download-btn{width:100%}.ci-summary{text-align:left}.ci-head{align-items:flex-start}.ci-name{font-size:16px}.ci-mh,.ci-metric{width:155px;min-width:155px}.ci-table{min-width:760px}.ci-table th,.ci-table td{padding:9px 10px;font-size:9px}}
    `}</style>
    <div className="school-stack">
      <section className="school-hero ci-hero">
        <p className="school-eyebrow">Daily Classroom Verification</p>
        <h1 className="school-title">Classroom Feedback Command Centre</h1>
        <p className="school-copy">Principal-level visibility into every teacher&apos;s latest taught classroom, student feedback participation, comprehension and learning gaps.</p>
      </section>

      <section className="school-section">
        <div className="school-section-head"><div>
          <p className="school-eyebrow">Live Teaching Evidence</p>
          <h2 className="school-section-title">Teacher-by-Teacher Daily Feedback Intelligence</h2>
          <p className="school-section-copy">The Below section shows teacher's latest-lecture feedback taught by them in their classes, this data include topics feedback given by that respective class students on their understanding level for that class and the doubt they had after the topic was taught.</p>
        </div><span className="school-pill">{visible.length} Teachers · {classroomCount} Classrooms</span></div>

        <div className="ci-filter"><div className="ci-filter-row">
          <div className="ci-field" ref={menuRef}>
            <label className="ci-label">Teacher Filter</label>
            <button type="button" className="ci-button" onClick={()=>setOpen(v=>!v)}><span>{label}</span><span>{open?"▲":"▼"}</span></button>
            {open&&<div className="ci-menu">
              <div className="ci-actions">
                <button className="ci-link" type="button" onClick={()=>setSelected(options.map(t=>t.teacherUuid))}>Select all</button>
                <button className="ci-link" type="button" onClick={()=>setSelected([])}>Clear</button>
              </div>
              {options.map(t=><label className="ci-check" key={t.teacherUuid}>
                <input type="checkbox" checked={selected.includes(t.teacherUuid)} onChange={()=>toggle(t.teacherUuid)}/><span>{t.teacherName}</span>
              </label>)}
            </div>}
          </div>
          <button
            type="button"
            className="ci-download-btn"
            disabled={reportLoading}
            onClick={async()=>{
              try{
                setReportLoading(true);
                setReportProgress(0);
                setPreparedReport(null);
                const prepared = await downloadStudentHealthAnalysis(setReportProgress);
                setPreparedReport(prepared);
              }catch(e:any){
                console.error("Student Health Analysis PDF generation failed",e);
              }finally{
                setReportLoading(false);
              }
            }}
          >
            {reportLoading?`Preparing PDF… ${reportProgress}%`:"Download Student Health Analysis PDF"}
          </button>
          {reportLoading&&<div className="ci-pdf-progress" role="progressbar" aria-label="Student Health Analysis PDF preparation" aria-valuemin={0} aria-valuemax={100} aria-valuenow={reportProgress}>
            <div className="ci-pdf-progress-track"><span style={{width:`${reportProgress}%`}} /></div>
            <span className="ci-pdf-progress-label">{reportProgress}%</span>
          </div>}
          {preparedReport&&<div className="ci-pdf-fallback" role="region" aria-label="PDF download fallback">If your browser did not save the PDF automatically, use one of these options. On iPhone or iPad, choose “Save to Files” in the share sheet.
            <div className="ci-pdf-fallback-actions">
              <button type="button" disabled={reportSaveBusy} onClick={async()=>{setReportSaveBusy(true);try{await savePreparedStudentHealthAnalysisPdf(preparedReport);}catch(e){console.error("Could not open PDF save/share action",e);}finally{setReportSaveBusy(false);}}}>{reportSaveBusy?"Opening save options…":"Save / Share PDF"}</button>
              <button type="button" onClick={()=>{const url=URL.createObjectURL(preparedReport.blob);const a=document.createElement("a");a.href=url;a.download=preparedReport.fileName;a.rel="noopener";a.click();window.setTimeout(()=>URL.revokeObjectURL(url),60000);}}>Try download again</button>
              <button type="button" onClick={()=>setPreparedReport(null)}>Dismiss</button>
            </div>
          </div>}
          <div className="ci-summary">{selected.length===0?"Showing every teacher with Daily Log evidence.":`Showing ${visible.length} selected teacher${visible.length===1?"":"s"} only.`}</div>
        </div>
        </div>

        {visible.length?<div className="ci-stack">{visible.map((t,i)=><TeacherCard key={t.teacherUuid} teacher={t} toneIndex={i}/>)}</div>
        :<div className="school-empty">No teacher Daily Log intelligence is available for this selection.</div>}
      </section>
    </div>
  </main>;
}

function TeacherCard({teacher,toneIndex}:{teacher:SchoolTeacherDailyIntelligence;toneIndex:number}){
  const tone=tones[toneIndex%tones.length];
  const [studentPopup,setStudentPopup]=useState<{title:string;students:string[];color:string}|null>(null);
  useEffect(()=>{
    if(!studentPopup)return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setStudentPopup(null);};
    document.addEventListener("keydown",onKey);
    return()=>document.removeEventListener("keydown",onKey);
  },[studentPopup]);
  const rows: Array<{icon:string;name:string;values:string[];cls:string;students?:string[][];color?:string;title?:string}>=[
    {icon:"📅",name:"Latest Lecture Date",values:teacher.classrooms.map(x=>dateLabel(x.latestLectureDate)),cls:"ci-v"},
    {icon:"📘",name:"Latest Topic",values:teacher.classrooms.map(x=>x.latestTopic),cls:"ci-v"},
    {icon:"📝",name:"Students Filled Feedback",values:teacher.classrooms.map(x=>`${x.feedbackSubmitted} / ${x.totalStudents}`),cls:"ci-blue"},
    {icon:"⏳",name:"Feedback Remaining",values:teacher.classrooms.map(x=>String(x.feedbackRemaining)),cls:"ci-red",students:teacher.classrooms.map(x=>x.pendingStudentNames??[]),color:"#DC2626",title:"Students with feedback remaining"},
    {icon:"😊",name:"Completely Understood",values:teacher.classrooms.map(x=>`${x.completelyUnderstood} (${x.completelyUnderstoodRate}%)`),cls:"ci-green",students:teacher.classrooms.map(x=>x.completelyUnderstoodStudents??[]),color:"#16A34A",title:"Students who completely understood"},
    {icon:"😐",name:"Partially Understood",values:teacher.classrooms.map(x=>`${x.partiallyUnderstood} (${x.partiallyUnderstoodRate}%)`),cls:"ci-yellow",students:teacher.classrooms.map(x=>x.partiallyUnderstoodStudents??[]),color:"#D97706",title:"Students who partially understood"},
    {icon:"☹️",name:"Didn't Understand",values:teacher.classrooms.map(x=>`${x.didntUnderstand} (${x.didntUnderstandRate}%)`),cls:"ci-red",students:teacher.classrooms.map(x=>x.didntUnderstandStudents??[]),color:"#DC2626",title:"Students who did not understand"},
    {icon:"🛡️",name:"Class Health Score",values:teacher.classrooms.map(x=>`${x.classHealthScore} /100 — ${x.classHealthStatus}`),cls:"ci-v"},
    {icon:"⚠️",name:"Most Difficult Concept",values:teacher.classrooms.map(x=>x.mostDifficultConcept),cls:"ci-blue"},
    {icon:"👤",name:"Students Requiring Attention",values:teacher.classrooms.map(x=>x.studentsRequiringAttention.length?x.studentsRequiringAttention.join(", "):"-"),cls:"ci-red"},
  ];
  return <article className="ci-card">
    <div className="ci-head" style={{background:`linear-gradient(135deg,${tone[0]},#fff 72%)`}}>
      <div><div className="ci-kicker" style={{color:tone[3]}}>Teacher Classroom Ledger</div><h3 className="ci-name">{teacher.teacherName}</h3>
      <p className="ci-meta">Latest lecture evidence across {teacher.classrooms.length} reporting classroom{teacher.classrooms.length===1?"":"s"}.</p></div>
      <span className="ci-badge" style={{background:tone[0],border:`1px solid ${tone[2]}`,color:tone[3]}}>{teacher.classrooms.length} Classroom{teacher.classrooms.length===1?"":"s"}</span>
    </div>
    <div className="ci-scroll"><table className="ci-table"><thead><tr><th className="ci-mh">METRICS</th>
      {teacher.classrooms.map((x,i)=>{const c=tones[i%tones.length];return <th className="ci-ch" key={x.assignmentUuid} style={{background:`linear-gradient(135deg,${c[0]},${c[1]})`,color:c[3]}}>{x.classroom}<span className="ci-sub">{x.subjectName||"Subject"} · Latest lecture</span></th>})}
    </tr></thead><tbody>
      {rows.map(row=><tr key={row.name}><td className="ci-metric">{row.icon} {row.name}</td>{row.values.map((value,i)=>{
        const students=row.students?.[i]??[];
        const clickable=Boolean(row.students);
        return <td className={row.cls} key={`${row.name}-${i}`}>
          {clickable
            ? <button type="button" className="ci-detail-trigger" aria-label={`View ${students.length} students: ${row.name} for ${teacher.classrooms[i].classroom}`} onClick={()=>setStudentPopup({title:row.title!,students,color:row.color!})}>{value||"0"}</button>
            : value||"-"}
        </td>;
      })}</tr>)}
    </tbody></table></div>
    <div className="ci-legend">
      <span style={{background:"#f0fdf4",border:"1px solid #bbf7d0",color:"#15803d"}}>● Completely Understood</span>
      <span style={{background:"#fffbeb",border:"1px solid #fde68a",color:"#b45309"}}>● Partially Understood</span>
      <span style={{background:"#fef2f2",border:"1px solid #fecaca",color:"#dc2626"}}>● Didn&apos;t Understand / Attention</span>
    </div>
    {studentPopup&&<div className="ci-popup-backdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setStudentPopup(null);}}>
      <section className="ci-popup" role="dialog" aria-modal="true" aria-labelledby="ci-popup-title">
        <button type="button" className="ci-popup-close" aria-label="Close student list" onClick={()=>setStudentPopup(null)}>×</button>
        <div className="ci-popup-kicker">Classroom Intelligence · {teacher.teacherName}</div>
        <h3 id="ci-popup-title" style={{color:studentPopup.color}}>{studentPopup.title}</h3>
        <p className="ci-popup-count">{studentPopup.students.length} student(s)</p>
        {studentPopup.students.length
          ? <ul className="ci-popup-list">{studentPopup.students.map((student,index)=><li key={`${index}-${student}`}>{student}</li>)}</ul>
          : <p className="ci-popup-empty">No students in this category.</p>}
        <button type="button" className="ci-popup-back" onClick={()=>setStudentPopup(null)}>← Back to Classroom Intelligence</button>
      </section>
    </div>}
  </article>;
}
