import "./schoolIntelligence.css";
import { useEffect, useState } from "react";
import { loadSchoolIntelligence } from "../viewmodels/SchoolIntelligenceViewModel";
import type { SchoolIntelligenceSnapshot } from "../types/SchoolIntelligenceModels";

export default function SchoolOverviewPage() {
  const [data, setData] = useState<SchoolIntelligenceSnapshot | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { loadSchoolIntelligence().then(setData).catch(e => setError(e?.message ?? "Unable to load school intelligence.")); }, []);

  if (error) return <div className="school-page"><div className="school-section school-empty">{error}</div></div>;
  if (!data) return <div className="school-page"><div className="school-section school-empty">Loading school intelligence…</div></div>;

  const cards = [
    ["Understanding", `${data.stats.understandingRate}%`, "Completely understood", "orange"],
    ["Active Doubts", data.stats.activeDoubts, "Current learning gaps", "blue"],
    ["Doubt Resolution", `${data.stats.doubtResolutionRate}%`, "Resolved learning gaps", "green"],
    ["Responses", data.stats.responses, "Student feedback records", "purple"],
    ["Topics Taught", data.stats.topicsTaught, "Published lecture logs", "orange"],
    ["Active Teachers", data.stats.activeTeachers, "Teaching workforce", "blue"],
    ["Classes Reporting", data.stats.classesReporting, "Class / section coverage", "green"],
    ["Students", data.stats.totalStudents, "Students in this school", "purple"],
  ];

  return <main className="school-page"><div className="school-stack">
    <section className="school-hero">
      <p className="school-eyebrow">Accredited School Learning Intelligence</p>
      <h1 className="school-title">{data.schoolName}</h1>
      <p className="school-copy">Your institution-wide academic command centre across teachers, classrooms and student learning signals.</p>
    </section>
    <section className="school-section">
      <div className="school-section-head"><div><p className="school-eyebrow">School Intelligence</p><h2 className="school-section-title">Learning Intelligence Summary</h2><p className="school-section-copy">Live aggregation from teacher daily logs and student feedback.</p></div><span className="school-pill">School Learning Ledger</span></div>
      <div className="school-metric-grid">{cards.map(([label,value,note,tone])=><article key={String(label)} className={`school-card ${tone}`}><div className="school-card-label">{label}</div><div className="school-card-value">{value}</div><div className="school-card-note">{note}</div></article>)}</div>
    </section>
    <section className="school-section">
      <div className="school-section-head"><div><p className="school-eyebrow">Classroom Evidence</p><h2 className="school-section-title">Class & Section Diagnostic Health</h2><p className="school-section-copy">Compare classroom response, understanding and doubt signals.</p></div><span className="school-pill">{data.classrooms.length} Classrooms</span></div>
      <div className="school-table-wrap"><table className="school-table"><thead><tr><th>Classroom</th><th>Subject</th><th>Teacher</th><th>Topics</th><th>Responses</th><th>Understanding</th><th>Doubt Rate</th></tr></thead><tbody>
        {data.classrooms.map(row=><tr key={row.assignmentUuid}><td><b>{row.classroom}</b></td><td>{row.subjectName}</td><td>{row.teacherName}</td><td>{row.topicsTaught}</td><td>{row.responses}</td><td>{row.understandingRate}%</td><td>{row.doubtRate}%</td></tr>)}
      </tbody></table></div>
      {data.classrooms.length===0 && <div className="school-empty">No classroom reporting data yet.</div>}
    </section>
  </div></main>;
}
