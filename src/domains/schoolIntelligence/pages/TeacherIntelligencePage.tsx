import "./schoolIntelligence.css";
import { useEffect, useState } from "react";
import { loadSchoolIntelligence } from "../viewmodels/SchoolIntelligenceViewModel";
import type { SchoolTeacherIntelligenceRow } from "../types/SchoolIntelligenceModels";

export default function TeacherIntelligencePage() {
  const [rows,setRows]=useState<SchoolTeacherIntelligenceRow[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{loadSchoolIntelligence().then(x=>setRows(x.teachers)).finally(()=>setLoading(false));},[]);
  return <main className="school-page"><div className="school-stack">
    <section className="school-hero"><p className="school-eyebrow">Accredited Teaching Intelligence</p><h1 className="school-title">Teacher Intelligence</h1><p className="school-copy">Observe teaching activity and classroom learning indicators without turning student telemetry into employment decisions.</p></section>
    <section className="school-section"><div className="school-section-head"><div><p className="school-eyebrow">Teaching Workforce</p><h2 className="school-section-title">Teacher Performance Comparison</h2><p className="school-section-copy">Topics, response coverage, understanding and doubt signals.</p></div><span className="school-pill">{rows.length} Teachers</span></div>
      {loading?<div className="school-empty">Loading teacher intelligence…</div>:<div className="school-list">{rows.map(r=><article className="school-row-card" key={r.teacherUuid}><div className="school-row-top"><div><h3 className="school-row-title">{r.teacherName}</h3><p className="school-row-sub">{r.subjects.join(", ")||"No subject assigned"} · {r.classrooms.join(", ")||"No active classroom"}</p></div><span className="school-pill">{r.understandingRate}% Understanding</span></div><div className="school-row-metrics"><div className="school-mini"><span>Topics</span><b>{r.topicsTaught}</b></div><div className="school-mini"><span>Responses</span><b>{r.responses}</b></div><div className="school-mini"><span>Understanding</span><b>{r.understandingRate}%</b></div><div className="school-mini"><span>Doubt Rate</span><b>{r.doubtRate}%</b></div></div></article>)}</div>}
      {!loading&&rows.length===0&&<div className="school-empty">No teacher intelligence data yet.</div>}
    </section>
  </div></main>;
}
