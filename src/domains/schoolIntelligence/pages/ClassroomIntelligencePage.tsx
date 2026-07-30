import "./schoolIntelligence.css";
import { useEffect, useState } from "react";
import { loadSchoolIntelligence } from "../viewmodels/SchoolIntelligenceViewModel";
import type { SchoolClassroomHealthRow } from "../types/SchoolIntelligenceModels";

export default function ClassroomIntelligencePage() {
  const [rows,setRows]=useState<SchoolClassroomHealthRow[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{loadSchoolIntelligence().then(x=>setRows(x.classrooms)).finally(()=>setLoading(false));},[]);
  return <main className="school-page"><div className="school-stack">
    <section className="school-hero"><p className="school-eyebrow">Classroom Learning Evidence</p><h1 className="school-title">Classroom Intelligence</h1><p className="school-copy">Institution-wide visibility into the learning signals already produced by teachers and students.</p></section>
    <section className="school-section"><div className="school-section-head"><div><p className="school-eyebrow">Class & Section Explorer</p><h2 className="school-section-title">Classroom Diagnostic Board</h2><p className="school-section-copy">Every active teacher assignment in the authenticated school.</p></div><span className="school-pill">{rows.length} Classrooms</span></div>
      {loading?<div className="school-empty">Loading classrooms…</div>:<div className="school-list">{rows.map(r=><article className="school-row-card" key={r.assignmentUuid}><div className="school-row-top"><div><h3 className="school-row-title">{r.classroom}</h3><p className="school-row-sub">{r.subjectName} · {r.teacherName}</p></div><span className="school-pill">{r.responses} Responses</span></div><div className="school-row-metrics"><div className="school-mini"><span>Topics</span><b>{r.topicsTaught}</b></div><div className="school-mini"><span>Fully Understood</span><b>{r.completelyUnderstood}</b></div><div className="school-mini"><span>Understanding</span><b>{r.understandingRate}%</b></div><div className="school-mini"><span>Doubt Rate</span><b>{r.doubtRate}%</b></div></div></article>)}</div>}
      {!loading&&rows.length===0&&<div className="school-empty">No classroom reporting data yet.</div>}
    </section>
  </div></main>;
}
