import "./schoolIntelligence.css";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { loadSchoolIntelligence } from "../viewmodels/SchoolIntelligenceViewModel";
import type { SchoolExamPreparationClassroom, SchoolExamPreparationStudent } from "../types/SchoolIntelligenceModels";

type Period="ALL"|"7"|"14"|"CUSTOM";
type FilterYear="ALL"|"2026"|"2027"|"2028";
type FilterMonth="ALL"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"11"|"12";

const palettes=[
{bg:"#FFF7ED",border:"#FED7AA",ink:"#C2410C"},{bg:"#EFF6FF",border:"#BFDBFE",ink:"#1D4ED8"},
{bg:"#F0FDF4",border:"#BBF7D0",ink:"#15803D"},{bg:"#FAF5FF",border:"#E9D5FF",ink:"#7E22CE"},
{bg:"#FFF1F2",border:"#FECDD3",ink:"#BE123C"},{bg:"#F0FDFA",border:"#99F6E4",ink:"#0F766E"}];

const monthOptions=[
 ["1","January"],["2","February"],["3","March"],["4","April"],["5","May"],["6","June"],
 ["7","July"],["8","August"],["9","September"],["10","October"],["11","November"],["12","December"]
] as const;

function dateKey(date:Date){
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date);
 return `${parts.find(p=>p.type==="year")?.value??""}-${parts.find(p=>p.type==="month")?.value??""}-${parts.find(p=>p.type==="day")?.value??""}`;
}

function filterRange(year:FilterYear,month:FilterMonth,period:Period,from:string,to:string){
 const today=new Date();
 let start:string|undefined;
 let end:string|undefined;

 if(period==="7"||period==="14"||period==="30"){
   const days=Number(period);
   const endDate=new Date(today);
   const startDate=new Date(today);
   startDate.setDate(startDate.getDate()-(days-1));
   start=dateKey(startDate);
   end=dateKey(endDate);
 }

 if(period==="CUSTOM"){
   if(!from||!to||from>to) return null;
   start=from; end=to;
 }

 if(year!=="ALL"){
   const y=Number(year);
   const yearStart=`${y}-01-01`;
   const yearEnd=`${y}-12-31`;
   start=start ? (start>yearStart?start:yearStart) : yearStart;
   end=end ? (end<yearEnd?end:yearEnd) : yearEnd;
 }
 if(month!=="ALL"){
   const y=year==="ALL"?today.getFullYear():Number(year);
   const m=Number(month);
   const monthStart=new Date(y,m-1,1);
   const monthEnd=new Date(y,m,0);
   const monthStartKey=dateKey(monthStart);
   const monthEndKey=dateKey(monthEnd);
   start=start ? (start>monthStartKey?start:monthStartKey) : monthStartKey;
   end=end ? (end<monthEndKey?end:monthEndKey) : monthEndKey;
 }

 if(start&&end&&start>end) return null;
 return {start,end};
}

export default function SchoolAcademicIntelligencePage(){
 const [all,setAll]=useState<SchoolExamPreparationClassroom[]>([]),[loading,setLoading]=useState(true);
 const [search,setSearch]=useState("");
 const [year,setYear]=useState<FilterYear>("ALL"),[month,setMonth]=useState<FilterMonth>("ALL");
 const [period,setPeriod]=useState<Period>("ALL"),[from,setFrom]=useState(""),[to,setTo]=useState("");

 useEffect(()=>{void load()},[year,month,period,from,to]);

 async function load(){
   const range=filterRange(year,month,period,from,to);
   if(!range)return;
   setLoading(true);
   try{
     const d=await loadSchoolIntelligence(undefined,range.start,range.end);
     setAll(d.examPreparation??[]);
   }finally{setLoading(false)}
 }

 const visible=useMemo(()=>{
   const q=search.trim().toLowerCase();
   return all.map(x=>({
     ...x,
     subjects:x.subjects.map(s=>({
       ...s,
       students:s.students.filter(st=>!q||st.studentName.toLowerCase().includes(q))
     }))
   })).map(x=>({
     ...x,
     subjects:x.subjects.filter(s=>s.students.length>0)
   })).filter(x=>x.subjects.length);
 },[all,search]);

 return <main className="school-page sa-page"><style>{css}</style><div className="school-stack sa-stack">
  <section className="school-hero"><p className="school-eyebrow">Institutional Academic Intelligence</p><h1 className="school-title">School Academic Intelligence</h1><p className="school-copy">Exam preparation visibility across every class, section, subject and teacher in the authenticated school, built from unresolved classroom doubts students confirmed were not discussed.</p></section>
  <section className="school-section"><div className="school-section-head"><div><p className="school-eyebrow">Exam Preparation Intelligence</p><h2 className="school-section-title">Unresolved Doubt Preparation Board</h2><p className="school-section-copy">The teacher Exam Preparation risk ledger, aggregated class and section wise for the principal.</p></div><span className="school-pill">Principal Academic Ledger</span></div>
   <div className="sa-filters sa-timeline-filters">
    <F label="Search Student"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Student name"/></F>
    <F label="Year"><select value={year} onChange={e=>{setYear(e.target.value as FilterYear);if(e.target.value==="ALL")setMonth("ALL")}}><option value="ALL">All years</option><option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option></select></F>
    <F label="Month"><select value={month} disabled={year==="ALL"} onChange={e=>setMonth(e.target.value as FilterMonth)}><option value="ALL">{year==="ALL"?"Select year first":"All months"}</option>{monthOptions.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></F>
    <F label="Time Period"><div className="sa-period-control"><select value={period} onChange={e=>setPeriod(e.target.value as Period)}><option value="ALL">All time</option><option value="7">Last 1 Week</option><option value="14">Last 2 Weeks</option><option value="30">Last 30 Days</option><option value="CUSTOM">Custom Date</option></select>{period==="CUSTOM"&&<div className="sa-custom-inline"><input aria-label="From date" type="date" value={from} onChange={e=>setFrom(e.target.value)}/><input aria-label="To date" type="date" value={to} onChange={e=>setTo(e.target.value)}/></div>}</div></F>
   </div>
   {loading?<div className="school-empty">Loading exam preparation intelligence…</div>:visible.length===0?<div className="school-empty">{search.trim()?"No student matching this name exists in the selected timeline.":"No unresolved not-discussed doubt data exists for the selected filters."}</div>:visible.map(c=><Board key={c.classroomKey} c={c}/>)}
  </section>
 </div></main>
}
function F({label,children}:{label:string;children:ReactNode}){return <div className="sa-filter"><label>{label}</label>{children}</div>}
function Board({c}:{c:SchoolExamPreparationClassroom}){
 const METRIC_WIDTH =
    typeof window !== "undefined" && window.innerWidth <= 1024 ? 110 : 220,
   MIN_SUBJECT_WIDTH=570;
 const subjectLayouts=c.subjects.map(s=>{
   const count=Math.max(1,s.students.length);
   const subjectWidth=Math.max(MIN_SUBJECT_WIDTH,count*190);
   return {subject:s,count,subjectWidth,studentWidth:subjectWidth/count};
 });
 const width=METRIC_WIDTH+subjectLayouts.reduce((n,x)=>n+x.subjectWidth,0);
 return <article className="sa-card"><div className="sa-head"><div><h3>{c.classroom}</h3><p>Students are grouped inside subject parent columns. Scroll horizontally while the metric column remains fixed.</p></div><span>{c.subjects.length} SUBJECTS</span></div><div className="sa-cue">← Scroll left or right to view every subject and student →</div><div className="sa-scroll">
 <div className="sa-wide" style={{width,minWidth:width}}>
 <table className="sa-table" style={{width,minWidth:width}}><colgroup><col style={{width:METRIC_WIDTH}}/>{subjectLayouts.flatMap(({subject,count,studentWidth})=>Array.from({length:count},(_,i)=><col key={subject.assignmentUuid+"-col-"+i} style={{width:studentWidth}}/>))}</colgroup><thead><tr><th className="sa-metric" rowSpan={2}>METRICS</th>{subjectLayouts.map(({subject:s,count},i)=>{const p=palettes[i%palettes.length];return <th key={s.assignmentUuid} colSpan={count} className="sa-parent" style={{background:p.bg,borderTop:`4px solid ${p.ink}`,color:p.ink}}><b>{s.subjectName}</b><small>{s.teacherName}</small></th>})}</tr><tr>{subjectLayouts.flatMap(({subject:s,count,studentWidth},i)=>{const p=palettes[i%palettes.length];return s.students.length?s.students.map(st=><th key={s.assignmentUuid+st.studentUuid} className="sa-student" style={{background:p.bg,width:studentWidth,minWidth:studentWidth,maxWidth:studentWidth}}><small>STUDENT</small><b>{st.studentName}</b></th>):[<th key={s.assignmentUuid+"empty"} className="sa-student" style={{background:p.bg,width:studentWidth,minWidth:studentWidth,maxWidth:studentWidth}}><small>STUDENT</small><b>No unresolved doubts</b></th>]})}</tr></thead>
 <tbody><R c={c} layouts={subjectLayouts} m="TOTAL"/><R c={c} layouts={subjectLayouts} m="TOPICS"/><R c={c} layouts={subjectLayouts} m="RISK"/><R c={c} layouts={subjectLayouts} m="ATTENTION"/></tbody></table>
 <div className="sa-summary" style={{width,minWidth:width}}><div className="sa-summary-label">SUBJECT SUMMARY</div>{subjectLayouts.map(({subject:s,subjectWidth},i)=>{const p=palettes[i%palettes.length];return <div key={s.assignmentUuid} className="sa-summary-group" style={{width:subjectWidth,minWidth:subjectWidth,maxWidth:subjectWidth,background:p.bg}}><div className="sa-summary-cards"><S l="Students With Unresolved Doubts" v={String(s.totalStudentsWithUnresolvedDoubts)}/><S l="Doubts Per Kid" v={String(s.doubtsPerKid)}/><S l="Most Common Doubts" v={s.commonDoubts.join(", ")||"-"}/></div></div>})}</div>
 </div></div></article>
}
function R({c,layouts,m}:{c:SchoolExamPreparationClassroom;layouts:{subject:any;count:number;subjectWidth:number;studentWidth:number}[];m:"TOTAL"|"TOPICS"|"RISK"|"ATTENTION"}){
 const labels={TOTAL:"Total Unresolved Not Discussed Doubts",TOPICS:"Topics With Unresolved Doubts",RISK:"Highest Risk Topic",ATTENTION:"Attention Level"};
 return <tr><td className="sa-metric">{labels[m]}</td>{layouts.flatMap(({subject:s,studentWidth})=>s.students.length?s.students.map((st:SchoolExamPreparationStudent)=><td key={s.assignmentUuid+st.studentUuid+m} className="sa-cell" style={{width:studentWidth,minWidth:studentWidth,maxWidth:studentWidth,color:m==="TOTAL"?"#EF4444":m==="RISK"?"#1E3A8A":m==="ATTENTION"?(st.attentionLevel==="HIGH"?"#DC2626":st.attentionLevel==="MEDIUM"?"#D97706":"#16A34A"):undefined}}>{value(st,m)}</td>):[<td key={s.assignmentUuid+m+"empty"} className="sa-cell" style={{width:studentWidth,minWidth:studentWidth,maxWidth:studentWidth}}>-</td>])}</tr>
}
function value(s:SchoolExamPreparationStudent,m:"TOTAL"|"TOPICS"|"RISK"|"ATTENTION"){return m==="TOTAL"?s.totalUnresolvedDoubts:m==="TOPICS"?(s.topics.join(", ")||"-"):m==="RISK"?s.highestRiskTopic:s.attentionLevel}
function S({l,v}:{l:string;v:string}){return <div className="sa-summary-card"><span>{l}</span><b>{v}</b></div>}
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

.sa-page{width:100%;max-width:100%;min-width:0;overflow-x:hidden;box-sizing:border-box}
.sa-stack{width:100%;max-width:100%;min-width:0;box-sizing:border-box}
.sa-page .school-section,.sa-page .school-hero{width:100%;max-width:100%;min-width:0;box-sizing:border-box}
.sa-filters{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(82px,.75fr) minmax(92px,.9fr) minmax(150px,1.25fr);gap:10px;margin-top:18px;width:100%;max-width:100%;min-width:0}
.sa-filter label{display:block;margin-bottom:6px;color:#64748B;font-size:10px;font-weight:850;letter-spacing:.08em;text-transform:uppercase}
.sa-filter select,.sa-filter input{width:100%;box-sizing:border-box;border:1px solid #E2E8F0;border-radius:11px;background:#FFF;padding:10px 11px;color:#0F172A;font-size:12px;font-weight:750}.sa-filter input::placeholder{color:#94A3B8}.sa-filter select:disabled{background:#F8FAFC;color:#94A3B8}.sa-period-control{min-width:0}.sa-custom-inline{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:5px}.sa-custom-inline input{padding:7px 6px;font-size:10px}
.sa-custom{display:grid;grid-template-columns:1fr 1fr;gap:8px;grid-column:1/-1}
.sa-card{display:block;width:100%;max-width:100%;min-width:0;margin-top:16px;border:1px solid #E2E8F0;border-radius:18px;background:#FFF;overflow:hidden;box-sizing:border-box;contain:inline-size}
.sa-head{display:flex;justify-content:space-between;gap:14px;padding:16px 18px;border-bottom:1px solid #E2E8F0}
.sa-head h3{margin:0;color:#0F172A;font-size:18px;font-weight:900}
.sa-head p{margin:4px 0 0;color:#64748B;font-size:11px;font-weight:650}
.sa-head span{height:max-content;padding:6px 9px;border:1px solid #FED7AA;border-radius:999px;background:#FFF7ED;color:#C2410C;font-size:10px;font-weight:850;white-space:nowrap}
.sa-cue{display:block;margin:9px 14px;color:#64748B;font-size:10px;font-weight:800}
.sa-scroll{display:block;width:100%;max-width:100%;min-width:0;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scrollbar-width:auto;position:relative}
.sa-scroll::-webkit-scrollbar{height:11px}
.sa-scroll::-webkit-scrollbar-track{background:#F1F5F9}
.sa-scroll::-webkit-scrollbar-thumb{background:#CBD5E1;border:3px solid #F1F5F9;border-radius:999px}
.sa-wide{display:block;max-width:none;flex:none}
.sa-table{border-collapse:separate;border-spacing:0;table-layout:fixed;background:#FFF;max-width:none}
.sa-table th,.sa-table td{box-sizing:border-box;border-right:1px solid #E2E8F0;border-bottom:1px solid #E2E8F0;vertical-align:top}
.sa-metric{position:sticky;left:0;z-index:6;width:220px;min-width:220px;max-width:220px;box-sizing:border-box;padding:14px;background:#F8FAFC;color:#334155;font-size:11px;font-weight:850;line-height:1.35;text-align:left;box-shadow:5px 0 8px rgba(15,23,42,.06)}
.sa-parent{padding:13px 12px;text-align:left}
.sa-parent b{display:block;font-size:14px;font-weight:900}
.sa-parent small{display:block;margin-top:4px;font-size:10px;font-weight:750;opacity:.78}
.sa-student{padding:12px;text-align:left}
.sa-student small{display:block;font-size:9px;font-weight:850;letter-spacing:.08em;opacity:.7}
.sa-student b{display:block;margin-top:4px;color:#0F172A;font-size:13px;font-weight:850}
.sa-cell{padding:14px 12px;color:#334155;font-size:11px;font-weight:700;line-height:1.45;overflow-wrap:anywhere}
.sa-summary{display:flex;align-items:stretch;border-top:10px solid #F8FAFC;box-sizing:border-box}
.sa-summary-label{position:sticky;left:0;z-index:7;width:220px;min-width:220px;max-width:220px;box-sizing:border-box;padding:14px;background:#F8FAFC;border-right:1px solid #E2E8F0;color:#334155;font-size:11px;font-weight:900;box-shadow:5px 0 8px rgba(15,23,42,.06)}
.sa-summary-group{display:flex;align-items:stretch;box-sizing:border-box;border-right:1px solid #E2E8F0;padding:10px}
.sa-summary-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;width:100%}
.sa-summary-card{width:100%;min-width:0;min-height:82px;box-sizing:border-box;border:1px solid #D8E1EC;border-radius:11px;background:#FFF;padding:11px}
.sa-summary-card span{display:block;color:#64748B;font-size:8px;font-weight:850;line-height:1.3;letter-spacing:.05em;text-transform:uppercase;word-break:normal;overflow-wrap:normal}
.sa-summary-card b{display:block;margin-top:7px;color:#0F172A;font-size:13px;font-weight:900;line-height:1.3;word-break:normal;overflow-wrap:anywhere}

@media(max-width:1024px){
 .sa-filters{grid-template-columns:minmax(0,1.5fr) minmax(70px,.72fr) minmax(80px,.85fr) minmax(125px,1.2fr);gap:7px}
 .sa-filter label{font-size:9px}
 .sa-filter select,.sa-filter input{padding:9px 10px;font-size:11px}
 .sa-card{border-radius:15px}
 .sa-head{padding:13px 14px}
 .sa-head h3{font-size:16px}
 .sa-head p{font-size:10px}
 .sa-head span{padding:5px 8px;font-size:9px}
 .sa-cue{margin:8px 12px;font-size:9px}
 .sa-parent{padding:10px}
 .sa-parent b{font-size:12px}
 .sa-parent small{font-size:9px}
 .sa-student{padding:10px}
 .sa-student small{font-size:8px}
 .sa-student b{font-size:11px}
 .sa-cell{padding:11px 10px;font-size:10px}
 .sa-summary-group{padding:8px}
 .sa-summary-card{min-height:74px;padding:9px}
 .sa-summary-card span{font-size:7px}
 .sa-summary-card b{font-size:11px}
}

@media(max-width:640px){
 .sa-filters{grid-template-columns:minmax(0,1.35fr) minmax(0,.72fr) minmax(0,.82fr) minmax(0,1.15fr);gap:5px;margin-top:12px}
 .sa-custom{grid-template-columns:1fr}
 .sa-filter label{margin-bottom:4px;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .sa-filter select,.sa-filter input{padding:7px 6px;border-radius:8px;font-size:9px;min-width:0}.sa-custom-inline{gap:3px;margin-top:4px}.sa-custom-inline input{padding:6px 4px;font-size:8px}
 .sa-card{margin-top:12px;border-radius:13px}
 .sa-head{flex-direction:column;gap:8px;padding:11px 12px}
 .sa-head h3{font-size:14px}
 .sa-head p{font-size:9px;line-height:1.4}
 .sa-head span{padding:4px 7px;font-size:8px}
 .sa-cue{margin:8px 10px;font-size:9px}
 .sa-parent{padding:8px}
 .sa-parent b{font-size:11px}
 .sa-parent small{margin-top:3px;font-size:8px}
 .sa-student{padding:8px}
 .sa-student small{font-size:7px}
 .sa-student b{font-size:10px;line-height:1.25}
 .sa-cell{padding:9px 8px;font-size:9px;line-height:1.35}
 .sa-summary{border-top-width:7px}
 .sa-summary-group{padding:7px}
 .sa-summary-cards{gap:7px}
 .sa-summary-card{min-height:68px;padding:8px;border-radius:8px}
 .sa-summary-card span{font-size:6.5px;line-height:1.25;letter-spacing:.035em}
 .sa-summary-card b{margin-top:5px;font-size:10px}

/* =========================================================
   TABLET + MOBILE: COMPACT FROZEN METRIC COLUMN
   Desktop remains unchanged at 220px.
   The first table column itself is reduced to 110px so
   subject/student columns become visible while scrolling.
   ========================================================= */
@media(max-width:1024px){
  .sa-filters{grid-template-columns:minmax(105px,1.45fr) minmax(62px,.8fr) minmax(72px,.9fr) minmax(105px,1.15fr);gap:6px;overflow:visible}
  .sa-filter label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sa-metric,
  .sa-summary-label{
    width:110px !important;
    min-width:110px !important;
    max-width:110px !important;
    padding:10px 8px !important;
    font-size:9px !important;
    line-height:1.3 !important;
  }

  .sa-table col:first-child{
    width:110px !important;
  }
}
}`;