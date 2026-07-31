import "./schoolIntelligence.css";
import { useEffect,useMemo,useState } from "react";
import { loadSchoolIntelligence } from "../viewmodels/SchoolIntelligenceViewModel";
import type { SchoolTeacherLiveStatus } from "../types/SchoolIntelligenceModels";

const time=(v:string)=>{const d=new Date(v);return v&&Number.isFinite(d.getTime())?d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"—"};

export default function TeacherIntelligencePage(){
 const [teachers,setTeachers]=useState<SchoolTeacherLiveStatus[]>([]),[selectedId,setSelectedId]=useState(""),[loading,setLoading]=useState(true);
 async function load(){setLoading(true);try{const x=await loadSchoolIntelligence();const next=x.teacherLiveStatus??[];setTeachers(next);setSelectedId(old=>next.some(t=>t.teacherUuid===old)?old:(next.find(t=>t.isPresentToday)?.teacherUuid??next[0]?.teacherUuid??""));}finally{setLoading(false)}}
 useEffect(()=>{void load();const id=window.setInterval(()=>void load(),60000);return()=>window.clearInterval(id)},[]);
 const selected=useMemo(()=>teachers.find(t=>t.teacherUuid===selectedId)??teachers[0],[teachers,selectedId]);
 const active=teachers.filter(t=>t.isPresentToday).length;
 return <main className="school-page ti-page"><style>{css}</style><div className="school-stack">
  <section className="school-hero"><p className="school-eyebrow">Live Teaching Intelligence</p><h1 className="school-title">Teacher Intelligence</h1><p className="school-copy">Today's teacher activity and classroom coverage, built directly from published Daily Logs in the authenticated school.</p></section>
  <section className="ti-audit">
   <div className="ti-head"><div><span>TEACHER ATTENDANCE & DAILY LOG ACTIVITY</span><h2>Principal's School Live Teaching Audit</h2><p>A Daily Log published today is verified evidence of today's teaching activity.</p></div><div className="ti-totals"><b>● {active} ACTIVE TODAY</b><b className="off">● {teachers.length-active} NO LOG TODAY</b></div></div>
   {loading&&!teachers.length?<div className="ti-empty-dark">Loading teacher activity…</div>:<>
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
 </div></main>
}
function M({l,v}:{l:string;v:string}){return <div><span>{l}</span><b>{v}</b></div>}
const css=`
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
`;
