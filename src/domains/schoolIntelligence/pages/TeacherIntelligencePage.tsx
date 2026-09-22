import "./schoolIntelligence.css";
import { useEffect,useMemo,useState } from "react";
import jsPDF from "jspdf";
import { loadSchoolIntelligence } from "../viewmodels/SchoolIntelligenceViewModel";
import type { SchoolTeacherLiveStatus } from "../types/SchoolIntelligenceModels";
import { downloadOrSharePdfBlob } from "../../../services/platform/nativeDocumentService";
import SchoolAnalyticsLoadingPopup from "../components/SchoolAnalyticsLoadingPopup";
import {
  getTeacherTeachingHistory,
  type TeacherTeachingHistoryData,
  type TeacherTeachingHistoryLog,
} from "../repository/TeacherTeachingHistoryRepository";

const time=(v:string)=>{const d=new Date(v);return v&&Number.isFinite(d.getTime())?d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"—"};

function isoDate(date: Date) {
 const year=date.getFullYear();
 const month=String(date.getMonth()+1).padStart(2,"0");
 const day=String(date.getDate()).padStart(2,"0");
 return `${year}-${month}-${day}`;
}
function defaultHistoryStartDate(){const end=new Date();const start=new Date(end);start.setDate(end.getDate()-29);return isoDate(start)}
function todayDate(){return isoDate(new Date())}
function dateRange(start:string,end:string,excludedDates:Set<string>){const values:string[]=[];const cursor=new Date(`${start}T00:00:00`);const finish=new Date(`${end}T00:00:00`);if(!Number.isFinite(cursor.getTime())||!Number.isFinite(finish.getTime())||cursor>finish)return values;while(cursor<=finish){const key=isoDate(cursor);if(cursor.getDay()!==0&&!excludedDates.has(key))values.push(key);cursor.setDate(cursor.getDate()+1)}return values}
function formatDate(value:string){if(!value)return "—";const date=new Date(`${value}T00:00:00`);return Number.isFinite(date.getTime())?date.toLocaleDateString([],{day:"2-digit",month:"short",year:"numeric"}):value}
function escapePdfText(value:unknown){return String(value??"").replace(/\s+/g," ").trim()}
interface HistoryRow{key:string;date:string;teacherName:string;subjectName:string;className:string;sectionName:string;status:"SUBMITTED"|"MISSED";topics:string[];subtopics:string[]}
function buildHistoryRows(data:TeacherTeachingHistoryData|null,startDate:string,endDate:string,selectedTeacherUuid:string):HistoryRow[]{
 if(!data)return [];
 const teacherMap=new Map(data.teachers.map(teacher=>[teacher.teacherUuid,teacher]));
 const logsByAssignmentDate=new Map<string,TeacherTeachingHistoryLog[]>();
 for(const log of data.logs){const key=`${log.teacherAssignmentUuid}::${log.logDate}`;const current=logsByAssignmentDate.get(key)??[];current.push(log);logsByAssignmentDate.set(key,current)}
 const rows:HistoryRow[]=[];const dates=dateRange(startDate,endDate,new Set(data.excludedDates));const candidateAssignments=data.assignments.filter(assignment=>!selectedTeacherUuid||assignment.teacherUuid===selectedTeacherUuid);
 // Active assignments are the authoritative classroom roster for missed-log marking.
 // Historical inactive assignments are still shown when they contain a published log
 // inside the requested period, but they must never manufacture red MISSED rows after
 // the assignment was deactivated. This preserves historical teaching evidence without
 // treating old classroom assignments as currently expected daily submissions.
 const assignments=candidateAssignments.filter(assignment=>assignment.isActive!==false||dates.some(date=>(logsByAssignmentDate.get(`${assignment.id}::${date}`)??[]).length>0));
 for(const assignment of assignments){const teacher=teacherMap.get(assignment.teacherUuid);const assignmentStartDate=assignment.createdAt?assignment.createdAt.slice(0,10):"";for(const date of dates){const logs=logsByAssignmentDate.get(`${assignment.id}::${date}`)??[];if(!logs.length&&(assignment.isActive===false||teacher?.isActive===false))continue;if(!logs.length&&!assignmentStartDate)continue;if(!logs.length&&assignmentStartDate&&date<assignmentStartDate)continue;const topics=Array.from(new Set(logs.map(log=>log.topicName.trim()).filter(Boolean)));const subtopics=Array.from(new Set(logs.flatMap(log=>log.conceptsCovered).map(value=>value.trim()).filter(Boolean)));rows.push({key:`${assignment.id}::${date}`,date,teacherName:teacher?.teacherName??"Teacher",subjectName:assignment.subjectName||teacher?.subject||"—",className:assignment.className||"—",sectionName:assignment.sectionName||"—",status:logs.length?"SUBMITTED":"MISSED",topics,subtopics})}}
 return rows.sort((a,b)=>a.date!==b.date?b.date.localeCompare(a.date):a.teacherName.localeCompare(b.teacherName)||`${a.className}-${a.sectionName}-${a.subjectName}`.localeCompare(`${b.className}-${b.sectionName}-${b.subjectName}`));
}

export default function TeacherIntelligencePage(){
 const [teachers,setTeachers]=useState<SchoolTeacherLiveStatus[]>([]),[selectedId,setSelectedId]=useState(""),[loading,setLoading]=useState(true);
 const [historyTeacherUuid,setHistoryTeacherUuid]=useState("");
 const [historyStartDate,setHistoryStartDate]=useState(defaultHistoryStartDate);
 const [historyEndDate,setHistoryEndDate]=useState(todayDate);
 const [historyData,setHistoryData]=useState<TeacherTeachingHistoryData|null>(null);
 const [historyLoading,setHistoryLoading]=useState(false);
 const [historyError,setHistoryError]=useState<string|null>(null);
 const [historyPdfLoading,setHistoryPdfLoading]=useState(false);
 async function load(forceRefresh=false){setLoading(true);try{const x=await loadSchoolIntelligence(undefined,undefined,undefined,{forceRefresh});const next=x.teacherLiveStatus??[];setTeachers(next);setSelectedId(old=>next.some(t=>t.teacherUuid===old)?old:(next.find(t=>t.isPresentToday)?.teacherUuid??next[0]?.teacherUuid??""));}finally{setLoading(false)}}
 useEffect(()=>{void load(false);const id=window.setInterval(()=>void load(true),60000);return()=>window.clearInterval(id)},[]);
 const selected=useMemo(()=>teachers.find(t=>t.teacherUuid===selectedId)??teachers[0],[teachers,selectedId]);
 const active=teachers.filter(t=>t.isPresentToday).length;
 const historyRows=useMemo(()=>buildHistoryRows(historyData,historyStartDate,historyEndDate,historyTeacherUuid),[historyData,historyStartDate,historyEndDate,historyTeacherUuid]);
 const historyTeacherOptions=useMemo(()=>{const map=new Map<string,string>();for(const teacher of historyData?.teachers??[])map.set(teacher.teacherUuid,teacher.teacherName);if(map.size)return Array.from(map.entries()).sort((a,b)=>a[1].localeCompare(b[1]));return teachers.map(teacher=>[teacher.teacherUuid,teacher.teacherName] as const).sort((a,b)=>a[1].localeCompare(b[1]))},[historyData,teachers]);
 async function fetchHistory(){setHistoryError(null);if(!historyStartDate||!historyEndDate){setHistoryError("Please select both a start date and an end date.");return}if(historyStartDate>historyEndDate){setHistoryError("Start date cannot be after end date.");return}if(historyEndDate>todayDate()){setHistoryError("End date cannot be in the future.");return}setHistoryLoading(true);try{const data=await getTeacherTeachingHistory(historyStartDate,historyEndDate,historyTeacherUuid||undefined);setHistoryData(data)}catch(error){console.error("TEACHER TEACHING HISTORY LOAD FAILED",error);setHistoryData(null);setHistoryError(error instanceof Error?error.message:"Unable to fetch teacher log history.")}finally{setHistoryLoading(false)}}
 async function downloadHistoryPdf(){if(!historyRows.length||historyPdfLoading)return;setHistoryPdfLoading(true);try{const teacherLabel=historyTeacherUuid?historyTeacherOptions.find(([id])=>id===historyTeacherUuid)?.[1]??"Selected Teacher":"All Teachers";const doc=new jsPDF({orientation:"landscape",unit:"mm",format:"a4",compress:true});const margin=10,pageWidth=297,pageHeight=210;const columns=[{title:"Date",width:24},{title:"Teacher",width:38},{title:"Subject",width:32},{title:"Class",width:24},{title:"Status",width:25},{title:"Topics",width:58},{title:"Subtopics / Concepts",width:76}];const lineHeight=4.2;let y=margin;const drawHeader=()=>{doc.setFont("helvetica","bold");doc.setFontSize(14);doc.text("Teacher Daily Log History",margin,y);y+=6;doc.setFont("helvetica","normal");doc.setFontSize(8);doc.text(`Teacher: ${escapePdfText(teacherLabel)}   |   Period: ${formatDate(historyStartDate)} to ${formatDate(historyEndDate)}`,margin,y);y+=6;let x=margin;doc.setFillColor(248,250,252);doc.setDrawColor(210,220,232);doc.rect(margin,y-4,pageWidth-margin*2,8,"FD");doc.setFont("helvetica","bold");doc.setFontSize(7);for(const column of columns){doc.text(column.title,x+1.5,y);x+=column.width}y+=5};drawHeader();const wrap=(text:string,width:number)=>doc.splitTextToSize(escapePdfText(text)||"—",width-3).slice(0,7);for(const row of historyRows){const values=[formatDate(row.date),row.teacherName,row.subjectName,`${row.className}${row.sectionName?` - ${row.sectionName}`:""}`,row.status==="SUBMITTED"?"Submitted":"MISSED",row.topics.length?row.topics.join(", "):"No log submitted",row.subtopics.length?row.subtopics.join(", "):row.status==="MISSED"?"No log submitted":"No subtopics recorded"];const wrapped=values.map((value,index)=>wrap(value,columns[index].width));const rowHeight=Math.max(7,...wrapped.map(lines=>lines.length*lineHeight+3));if(y+rowHeight>pageHeight-margin){doc.addPage();y=margin;drawHeader()}let x=margin;if(row.status==="MISSED"){doc.setFillColor(255,241,242);doc.setDrawColor(255,205,211);doc.rect(margin,y-3.5,pageWidth-margin*2,rowHeight,"FD")}doc.setFont("helvetica",row.status==="MISSED"?"bold":"normal");doc.setFontSize(6.7);wrapped.forEach((lines,index)=>{if(index===4&&row.status==="MISSED")doc.setTextColor(190,30,55);else doc.setTextColor(11,29,56);doc.text(lines,x+1.5,y);x+=columns[index].width});doc.setTextColor(11,29,56);y+=rowHeight}const blob=doc.output("blob");await downloadOrSharePdfBlob(blob,`Teacher-Daily-Log-History-${historyStartDate}-to-${historyEndDate}.pdf`,"Talent Passport — Teacher Daily Log History")}catch(error){console.error("TEACHER LOG HISTORY PDF FAILED",error);window.alert("Unable to generate the teacher log history report. Please try again.")}finally{setHistoryPdfLoading(false)}}
 return <main className="school-page ti-page"><style>{css}</style><div className="school-stack">
  <section className="school-hero"><p className="school-eyebrow">Live Teaching Intelligence</p><h1 className="school-title">Teacher Intelligence</h1><p className="school-copy">Today's teacher activity and classroom coverage, built directly from published Daily Logs in the authenticated school.</p></section>
  <section className="ti-audit">
   <div className="ti-head"><div><span>TEACHER ATTENDANCE & DAILY LOG ACTIVITY</span><h2>Principal's School Live Teaching Audit</h2><p>A Daily Log published today is verified evidence of today's teaching activity.</p></div><div className="ti-totals"><b>● {active} ACTIVE TODAY</b><b className="off">● {teachers.length-active} NO LOG TODAY</b></div></div>
   {loading&&!teachers.length?<><SchoolAnalyticsLoadingPopup active={loading} page="teacher" /><div className="ti-empty-dark">Loading teacher activity…</div></>:<>
    <div className="ti-cue">← Scroll left or right to view every teacher →</div>
    <div className="ti-scroll"><div className="ti-track">{teachers.map((t,i)=><button type="button" key={t.teacherUuid} onClick={()=>setSelectedId(t.teacherUuid)} className={`ti-card ${selected?.teacherUuid===t.teacherUuid?"selected":""}`}>
     <div className="ti-card-id"><span>ID: TCH{String(i+1).padStart(3,"0")}</span><i className={t.isPresentToday?"live":"offline"}/></div>
     <strong>{t.teacherName}</strong><small>{t.subjects.join(", ")||"No subject assigned"}</small>
     <div className={`ti-status ${t.isPresentToday?"live":"offline"}`}>● {t.isPresentToday?`${t.todayLogCount} LOG${t.todayLogCount===1?"":"S"} TODAY`:"NO LOG SUBMITTED TODAY"}</div>
     <em>{t.isPresentToday?`Last activity ${time(t.lastActivityAt)}`:"Awaiting today's activity"}</em>
    </button>)}</div></div>
   </>}
  </section>
  {selected&&<section className="school-section ti-feed-section">
   <div className="school-section-head"><div><p className="school-eyebrow">Today's Live Classroom Feed</p><h2 className="school-section-title">{selected.teacherName}</h2><p className="school-section-copy">{selected.classrooms.join(" · ")||"No active classroom assignment"}</p></div><div className="ti-badges"><span className={selected.isPresentToday?"present":"absent"}>{selected.isPresentToday?"● ACTIVE TODAY":"● NO LOG TODAY"}</span><span className="school-pill">{selected.todayLogCount} Today's Logs</span></div></div>
   {!selected.todayLectures.length?<div className="school-empty ti-feed-empty">No Daily Log has been published by this teacher today. This feed will populate when today's first lecture is submitted.</div>:
   <div className="ti-feed">{selected.todayLectures.map((l,i)=><article className="ti-lecture" key={l.logUuid}>
    <div className="ti-lecture-head"><div><span>LIVE LOG {String(i+1).padStart(2,"0")}</span><h3>{l.classroom} · {l.subjectName}</h3><p>{l.topicName}</p></div><b>{time(l.createdAt)}</b></div>
    <div className="ti-concepts"><label>Concepts Covered</label><div>{l.conceptsCovered.length?l.conceptsCovered.map((c,j)=><span key={j}>{c}</span>):<span>No concepts recorded</span>}</div></div>
    <div className="ti-metrics"><M l="Class" v={l.classroom||"-"}/><M l="Subject" v={l.subjectName||"-"}/><M l="Coursebook" v={l.pageFrom!==null||l.pageTo!==null?`Page ${l.pageFrom??"-"} → ${l.pageTo??"-"}`:"Not recorded"}/><M l="Homework" v={l.homeworkGiven?"Given":"Not given"}/><M l="Activity" v={l.activityConducted?"Conducted":"Not recorded"}/></div>
    {l.teacherNotes&&<div className="ti-notes"><label>Teacher Notes</label><p>{l.teacherNotes}</p></div>}
   </article>)}</div>}
  </section>}
  <section className="school-section ti-history-section">
   <div className="school-section-head ti-history-head"><div><p className="school-eyebrow">Teacher Teaching History</p><h2 className="school-section-title">Daily Log Submission Statement</h2><p className="school-section-copy">Fetch the published Daily Logs for every assigned classroom on working days in a selected period. Sundays and configured school holidays are excluded from missed-log marking.</p></div><div className="ti-history-summary"><span>{historyRows.length} classroom-days</span><span className="missed">{historyRows.filter(row=>row.status==="MISSED").length} missed</span></div></div>
   <div className="ti-history-controls">
    <label className="ti-history-field"><span>TEACHER</span><select value={historyTeacherUuid} onChange={event=>{setHistoryTeacherUuid(event.target.value);setHistoryData(null);setHistoryError(null)}}><option value="">All Teachers</option>{historyTeacherOptions.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
    <label className="ti-history-field"><span>START DATE</span><input type="date" value={historyStartDate} max={historyEndDate&&historyEndDate<todayDate()?historyEndDate:todayDate()} onChange={event=>{setHistoryStartDate(event.target.value);setHistoryData(null);setHistoryError(null)}} /></label>
    <label className="ti-history-field"><span>END DATE</span><input type="date" value={historyEndDate} min={historyStartDate||undefined} max={todayDate()} onChange={event=>{setHistoryEndDate(event.target.value);setHistoryData(null);setHistoryError(null)}} /></label>
    <button type="button" className="ti-history-fetch" onClick={()=>void fetchHistory()} disabled={historyLoading}>{historyLoading?"Fetching…":"Fetch Logs History"}</button>
    <button type="button" className="ti-history-pdf" onClick={()=>void downloadHistoryPdf()} disabled={!historyRows.length||historyPdfLoading}>{historyPdfLoading?"Preparing PDF…":"Download Report"}</button>
   </div>
   {historyError&&<div className="ti-history-error">{historyError}</div>}
   {historyLoading&&<div className="ti-history-loading">Loading teacher log history for the selected period…</div>}
   {!historyLoading&&!historyData&&<div className="ti-history-empty">Select a teacher or All Teachers, choose the date range, and click <strong>Fetch Logs History</strong>.</div>}
   {!historyLoading&&historyData&&historyRows.length===0&&<div className="ti-history-empty">No assigned classroom-days were found for the selected period.</div>}
   {!historyLoading&&historyRows.length>0&&<><div className="ti-history-note"><span>RED ROW = NO DAILY LOG SUBMITTED</span><span>SUBMITTED ROWS SHOW THE TOPIC AND SUBTOPICS / CONCEPTS RECORDED THAT DAY</span></div><div className="ti-history-scroll"><table className="ti-history-table"><thead><tr><th>Date</th><th>Teacher</th><th>Subject</th><th>Class / Section</th><th>Status</th><th>Topic(s) Taught</th><th>Subtopics / Concepts</th></tr></thead><tbody>{historyRows.map(row=><tr key={row.key} className={row.status==="MISSED"?"missed":"submitted"}><td>{formatDate(row.date)}</td><td><strong>{row.teacherName}</strong></td><td>{row.subjectName}</td><td>{row.className} - {row.sectionName}</td><td><span className={`ti-history-status ${row.status==="MISSED"?"missed":"submitted"}`}>{row.status==="MISSED"?"MISSED":"SUBMITTED"}</span></td><td>{row.topics.length?row.topics.map((topic,index)=><span className="ti-history-chip" key={`${row.key}-topic-${index}`}>{topic}</span>):<span className="ti-history-muted">No log submitted</span>}</td><td>{row.subtopics.length?row.subtopics.map((topic,index)=><span className="ti-history-chip ti-history-chip-blue" key={`${row.key}-subtopic-${index}`}>{topic}</span>):<span className="ti-history-muted">{row.status==="MISSED"?"No log submitted":"No subtopics recorded"}</span>}</td></tr>)}</tbody></table></div></>}
  </section>
 </div></main>
}
function M({l,v}:{l:string;v:string}){return <div><span>{l}</span><b>{v}</b></div>}
const css=`
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

.ti-page{width:100%;max-width:100%;min-width:0;overflow-x:hidden;box-sizing:border-box}
.ti-audit{width:100%;max-width:100%;min-width:0;box-sizing:border-box;margin-top:18px;padding:24px;border:1px solid #DCE4EF;border-radius:22px;background:#FFF;color:#0B1D38;overflow:hidden;box-shadow:0 4px 16px rgba(15,35,65,.035)}
.ti-head{display:flex;justify-content:space-between;gap:22px;padding-bottom:18px;border-bottom:1px solid #E5EAF1}
.ti-head>div:first-child>span{display:inline-block;color:#FF5B0A;font-size:10px;font-weight:900;letter-spacing:.14em}
.ti-head h2{margin:10px 0 0;font-size:21px;line-height:1.2;font-weight:900;color:#0B1D38}
.ti-head p{margin:7px 0 0;color:#5D7190;font-size:11px;font-weight:650}
.ti-totals{display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap}
.ti-totals b{padding:8px 11px;border:1px solid #AEE8C0;border-radius:999px;background:#F2FCF5;color:#168A43;font-size:9px;white-space:nowrap}
.ti-totals b.off{border-color:#FFD1D6;background:#FFF5F6;color:#D92D4F}
.ti-cue{display:flex;align-items:center;justify-content:space-between;margin:16px 0 9px;padding:10px 12px;border:1px solid #E0E6EF;border-radius:10px;background:#F8FAFD;color:#657896;font-size:9px;font-weight:800}
.ti-scroll{width:100%;max-width:100%;min-width:0;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;padding-bottom:8px}
.ti-scroll::-webkit-scrollbar{height:7px}.ti-scroll::-webkit-scrollbar-track{background:#EDF1F7;border-radius:99px}.ti-scroll::-webkit-scrollbar-thumb{background:#C7D1DF;border-radius:99px}
.ti-track{display:flex;width:max-content;min-width:100%;gap:12px}
.ti-card{position:relative;width:255px;min-width:255px;min-height:142px;padding:16px;box-sizing:border-box;text-align:left;border:1px solid #DCE4EF;border-radius:15px;background:#FFF;color:#0B1D38;cursor:pointer;box-shadow:0 3px 10px rgba(15,35,65,.035);transition:.15s ease}
.ti-card:before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:#E5EAF1;border-radius:15px 15px 0 0}
.ti-card:hover{transform:translateY(-1px);border-color:#FFC58F;box-shadow:0 7px 18px rgba(15,35,65,.07)}
.ti-card.selected{border-color:#FFB36F;background:#FFF9F3;box-shadow:0 7px 18px rgba(255,107,10,.09)}
.ti-card.selected:before{background:#FF6B0A}
.ti-card-id{display:flex;justify-content:space-between;color:#8A9AB1;font-size:8px;font-weight:850}
.ti-card-id i{width:7px;height:7px;border-radius:50%}.ti-card-id i.live{background:#21B457}.ti-card-id i.offline{background:#F05B76}
.ti-card strong{display:block;margin-top:11px;font-size:12px;font-weight:900;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ti-card small{display:block;margin-top:5px;color:#657896;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ti-status{margin-top:11px;width:max-content;padding:5px 7px;border-radius:999px;font-size:8px;font-weight:900}
.ti-status.live{border:1px solid #AEE8C0;background:#F2FCF5;color:#168A43}.ti-status.offline{border:1px solid #FFD1D6;background:#FFF5F6;color:#D92D4F}
.ti-card.selected .ti-status.live{background:#FFF;border-color:#AEE8C0}.ti-card.selected .ti-status.offline{background:#FFF;border-color:#FFD1D6}
.ti-card em{display:block;margin-top:8px;color:#8A9AB1;font-size:8px;font-style:normal}
.ti-empty-dark{padding:20px 0;color:#657896;font-size:11px}
.ti-feed-section{margin-top:18px}.ti-badges{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.ti-badges>span:first-child{padding:7px 10px;border-radius:999px;font-size:8px;font-weight:900}
.ti-badges .present{background:#F2FCF5;color:#168A43;border:1px solid #AEE8C0}.ti-badges .absent{background:#FFF5F6;color:#D92D4F;border:1px solid #FFD1D6}
.ti-feed{display:grid;gap:13px;margin-top:16px}
.ti-lecture{overflow:hidden;border:1px solid #DCE4EF;border-radius:16px;background:#FFF}
.ti-lecture-head{display:flex;justify-content:space-between;gap:14px;padding:16px 18px;background:linear-gradient(90deg,#FFF9F3 0%,#FFF 72%);border-bottom:1px solid #E8EDF4}
.ti-lecture-head span{display:inline-block;padding:5px 7px;border:1px solid #FFD1AE;border-radius:999px;background:#FFF7EF;color:#D95213;font-size:8px;font-weight:900}
.ti-lecture-head h3{margin:9px 0 0;color:#0B1D38;font-size:14px;font-weight:900}.ti-lecture-head p{margin:5px 0 0;color:#526987;font-size:11px;font-weight:750}
.ti-lecture-head>b{height:max-content;padding:6px 8px;border:1px solid #D7DFEA;border-radius:7px;background:#FFF;color:#60728F;font-size:8px;white-space:nowrap}
.ti-concepts{padding:14px 18px;border-bottom:1px solid #E8EDF4}.ti-concepts label,.ti-notes label{display:block;color:#60728F;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.07em}
.ti-concepts>div{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}.ti-concepts span{padding:6px 9px;border:1px solid #C9DAFF;border-radius:999px;background:#F4F7FF;color:#2456D8;font-size:8px;font-weight:800}
.ti-metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));background:#FFF}.ti-metrics>div{min-width:0;padding:13px 15px;border-right:1px solid #E8EDF4}.ti-metrics>div:last-child{border-right:0}
.ti-metrics span{display:block;color:#8292A9;font-size:7px;font-weight:900;text-transform:uppercase}.ti-metrics b{display:block;margin-top:5px;color:#0B1D38;font-size:9px;overflow-wrap:anywhere}
.ti-notes{padding:13px 18px;background:#F8FAFD;border-top:1px solid #E8EDF4}.ti-notes p{margin:6px 0 0;color:#526987;font-size:9px;line-height:1.5}
.ti-feed-empty{margin-top:15px}
@media(max-width:1024px){.ti-audit{padding:20px}.ti-card{width:225px;min-width:225px}.ti-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}.ti-metrics>div{border-bottom:1px solid #E8EDF4}}
@media(max-width:640px){.ti-audit{padding:14px;border-radius:15px}.ti-head{flex-direction:column}.ti-head h2{font-size:16px}.ti-head p{font-size:9px}.ti-card{width:200px;min-width:200px;min-height:132px;padding:12px}.ti-card strong{font-size:10px}.ti-card small,.ti-status{font-size:7.5px}.ti-lecture-head{flex-direction:column;padding:12px}.ti-lecture-head h3{font-size:11px}.ti-concepts{padding:11px 12px}.ti-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.ti-metrics>div{padding:10px}.ti-notes{padding:11px 12px}}

.ti-history-section{margin-top:18px;min-width:0;max-width:100%;overflow:hidden}.ti-history-head{align-items:flex-start;min-width:0}.ti-history-head>div:first-child{min-width:0}.ti-history-summary{min-width:0}.ti-history-summary{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.ti-history-summary span{padding:7px 10px;border:1px solid #D7DFEA;border-radius:999px;background:#F8FAFD;color:#526987;font-size:8px;font-weight:900;white-space:nowrap}.ti-history-summary .missed{border-color:#FFD1D6;background:#FFF5F6;color:#D92D4F}.ti-history-controls{display:grid;grid-template-columns:minmax(180px,1.35fr) minmax(150px,1fr) minmax(150px,1fr) auto auto;gap:10px;align-items:end;margin-top:18px;padding:14px;border:1px solid #E0E6EF;border-radius:15px;background:#F8FAFD}.ti-history-field{display:grid;gap:6px;min-width:0}.ti-history-field>span{color:#60728F;font-size:7px;font-weight:900;letter-spacing:.08em}.ti-history-field select,.ti-history-field input{width:100%;min-width:0;height:38px;box-sizing:border-box;padding:0 10px;border:1px solid #CBD5E1;border-radius:9px;background:#FFF;color:#0B1D38;font-size:9px;font-weight:750;outline:none}.ti-history-field select:focus,.ti-history-field input:focus{border-color:#FF9A5B;box-shadow:0 0 0 3px rgba(255,107,10,.08)}.ti-history-fetch,.ti-history-pdf{height:38px;padding:0 13px;border-radius:9px;border:1px solid #FFB36F;background:#FFF;color:#D95213;font-size:8px;font-weight:900;cursor:pointer;white-space:nowrap}.ti-history-fetch{background:#FF6B0A;color:#FFF;border-color:#FF6B0A}.ti-history-fetch:disabled,.ti-history-pdf:disabled{opacity:.5;cursor:not-allowed}.ti-history-pdf{border-color:#A9D9FF;color:#1D5EA8;background:#F4F9FF}.ti-history-error{margin-top:10px;padding:10px 12px;border:1px solid #FFD1D6;border-radius:10px;background:#FFF5F6;color:#B4233E;font-size:8px;font-weight:800}.ti-history-loading,.ti-history-empty{margin-top:14px;padding:18px;border:1px dashed #CBD5E1;border-radius:12px;background:#FFF;color:#657896;font-size:9px;text-align:center}.ti-history-note{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:14px 0 8px;color:#657896;font-size:7px;font-weight:900;letter-spacing:.05em}.ti-history-note span:first-child{color:#D92D4F}.ti-history-scroll{display:block;width:100%;max-width:100%;min-width:0;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;overscroll-behavior-y:auto;touch-action:pan-x pan-y;overflow-anchor:none;border:1px solid #DCE4EF;border-radius:13px;box-sizing:border-box}.ti-history-table{width:1180px;min-width:1180px;max-width:none;table-layout:fixed;border-collapse:separate;border-spacing:0;background:#FFF;color:#0B1D38;font-size:8px}.ti-history-table th{position:sticky;top:0;z-index:1;padding:10px 9px;background:#F1F5F9;border-bottom:1px solid #DCE4EF;color:#526987;text-align:left;font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}.ti-history-table td{padding:10px 9px;border-bottom:1px solid #E8EDF4;vertical-align:top;line-height:1.45;overflow-wrap:anywhere;word-break:break-word}.ti-history-table tr:last-child td{border-bottom:0}.ti-history-table tr.missed td{background:#FFF5F6;color:#8F263A;border-bottom-color:#FFDDE1}.ti-history-table tr.submitted:hover td{background:#FAFCFF}.ti-history-table th:nth-child(1),.ti-history-table td:nth-child(1){width:105px}.ti-history-table th:nth-child(2),.ti-history-table td:nth-child(2){width:150px}.ti-history-table th:nth-child(3),.ti-history-table td:nth-child(3){width:120px}.ti-history-table th:nth-child(4),.ti-history-table td:nth-child(4){width:145px}.ti-history-table th:nth-child(5),.ti-history-table td:nth-child(5){width:105px}.ti-history-table th:nth-child(6),.ti-history-table td:nth-child(6){width:220px}.ti-history-table th:nth-child(7),.ti-history-table td:nth-child(7){width:335px}.ti-history-table td:nth-child(1){white-space:nowrap;font-weight:850}.ti-history-status{display:inline-block;padding:5px 7px;border-radius:999px;font-size:7px;font-weight:900;letter-spacing:.04em}.ti-history-status.submitted{border:1px solid #AEE8C0;background:#F2FCF5;color:#168A43}.ti-history-status.missed{border:1px solid #FFD1D6;background:#FFF;color:#D92D4F}.ti-history-chip{display:inline-block;margin:0 4px 4px 0;padding:4px 6px;border:1px solid #FFD1AE;border-radius:999px;background:#FFF8F2;color:#A94213;font-size:7px;font-weight:800}.ti-history-chip-blue{border-color:#C9DAFF;background:#F4F7FF;color:#2456D8}.ti-history-muted{color:#A14A5B;font-size:7px;font-weight:750}
@media(max-width:1024px){.ti-history-controls{grid-template-columns:repeat(2,minmax(0,1fr))}.ti-history-fetch,.ti-history-pdf{width:100%}.ti-history-scroll{max-height:62vh;overflow-y:auto}.ti-history-table{min-width:1180px;width:1180px}.ti-history-table th{position:sticky;top:0}.ti-history-table td{overflow-wrap:anywhere;word-break:break-word}}
@media(max-width:640px){.ti-history-section{padding:14px!important}.ti-history-head{display:block}.ti-history-summary{justify-content:flex-start;margin-top:10px}.ti-history-controls{grid-template-columns:1fr;padding:11px;gap:8px}.ti-history-field select,.ti-history-field input,.ti-history-fetch,.ti-history-pdf{height:40px;font-size:9px}.ti-history-note{display:grid;gap:5px;line-height:1.4}.ti-history-scroll{max-height:58vh;border-radius:10px}.ti-history-table{min-width:1180px;width:1180px;font-size:7.5px}.ti-history-table th{padding:8px 7px;font-size:6.5px}.ti-history-table td{padding:8px 7px}.ti-history-chip{font-size:6.5px;padding:3px 5px}}
`;
