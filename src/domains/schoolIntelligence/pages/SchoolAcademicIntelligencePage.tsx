import "./schoolIntelligence.css";
import { useEffect, useState } from "react";
import { loadSchoolIntelligence } from "../viewmodels/SchoolIntelligenceViewModel";
import type { SchoolAcademicTrendPoint, SchoolTrendRange } from "../types/SchoolIntelligenceModels";

export default function SchoolAcademicIntelligencePage() {
  const [range,setRange]=useState<SchoolTrendRange>(30);
  const [rows,setRows]=useState<SchoolAcademicTrendPoint[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{setLoading(true);loadSchoolIntelligence(range).then(x=>setRows(x.trends)).finally(()=>setLoading(false));},[range]);
  return <main className="school-page"><div className="school-stack">
    <section className="school-hero"><p className="school-eyebrow">Institutional Academic Intelligence</p><h1 className="school-title">School Academic Intelligence</h1><p className="school-copy">Long-range learning patterns across the authenticated institution.</p></section>
    <section className="school-section"><div className="school-section-head"><div><p className="school-eyebrow">Learning Trend</p><h2 className="school-section-title">Academic Signal History</h2><p className="school-section-copy">Response, understanding and doubt movement over time.</p></div><div className="school-range">{([30,60,90] as SchoolTrendRange[]).map(x=><button key={x} className={range===x?"active":""} onClick={()=>setRange(x)}>{x} Days</button>)}</div></div>
      {loading?<div className="school-empty">Loading academic trend…</div>:<div className="school-list">{rows.map(r=><article className="school-row-card" key={r.date}><div className="school-row-top"><div><h3 className="school-row-title">{r.date}</h3><p className="school-row-sub">Daily institutional learning signal</p></div><span className="school-pill">{r.responses} Responses</span></div><div className="school-row-metrics"><div className="school-mini"><span>Responses</span><b>{r.responses}</b></div><div className="school-mini"><span>Understanding</span><b>{r.understandingRate}%</b></div><div className="school-mini"><span>Doubt Rate</span><b>{r.doubtRate}%</b></div></div></article>)}</div>}
      {!loading&&rows.length===0&&<div className="school-empty">No academic trend data exists in this period.</div>}
    </section>
  </div></main>;
}
