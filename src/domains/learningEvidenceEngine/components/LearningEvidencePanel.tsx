import { useEffect, useState } from "react";
import { getSchoolLearningEvidenceReport } from "../repository/LearningEvidenceRepository";
import { getTeacherLearningEvidenceReport } from "../repository/TeacherLearningEvidenceRepository";
import type { LearningEvidenceReportWithStudentDetails } from "../types/LearningEvidenceTypes";
import "./learningEvidencePanel.css";

type Props = { mode: "school" | "teacher" };
const isoToday = () => {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
};
const isoStart = (end: string) => new Date(Date.parse(`${end}T00:00:00Z`) - 29 * 86400000).toISOString().slice(0, 10);

export default function LearningEvidencePanel({ mode }: Props) {
  const [end, setEnd] = useState(isoToday);
  const [start, setStart] = useState(() => isoStart(isoToday()));
  const [report, setReport] = useState<LearningEvidenceReportWithStudentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(""); setReport(null); setSelected(null);
    try {
      const result = mode === "school"
        ? await getSchoolLearningEvidenceReport({ windowStart: start, windowEnd: end })
        : await getTeacherLearningEvidenceReport({ windowStart: start, windowEnd: end });
      setReport(result as LearningEvidenceReportWithStudentDetails);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Learning evidence could not be loaded. Please try again.");
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); /* first load only; filters apply on button */ }, []);
  const title = mode === "school" ? "Learning Evidence" : "My Classroom Learning Evidence";
  const findings = report?.findings ?? [];
  const selectedFinding = findings.find((f) => f.key === selected) ?? null;
  const selectedStudents = selected && report ? report.studentDetailsByFinding?.[selected] ?? [] : [];
  return <section className={`tp-learning-evidence tp-learning-evidence--${mode}`} aria-labelledby={`tp-le-title-${mode}`}>
    <div className="tp-le-heading"><div><div className="tp-le-eyebrow">TALENT PASSPORT · EVIDENCE & INTELLIGENCE</div><h1 id={`tp-le-title-${mode}`}>{title}</h1><p>Loop 1 feedback evidence connected to daily logs and the canonical academic-year roster. Loop 2 and Live Layer are shown as not connected here. This is an evidence summary, not a score or diagnosis.</p></div><div className="tp-le-readonly">READ-ONLY REPORT</div></div>
    <div className="tp-le-layer-status" aria-label="Evidence layer status"><article><strong>Loop 1 · Student feedback</strong><span>Analysed from submitted daily feedback; individual responses are available in each finding drawer.</span></article><article><strong>Canonical academic year</strong><span>Current school year and active enrollment roster are checked before analysis.</span></article><article><strong>Loop 2 · Historical ledger</strong><span>Not connected in this report.</span></article><article><strong>Live Layer</strong><span>Not queried or changed by this report.</span></article></div>
    <div className="tp-le-filters"><label>From <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} /></label><label>To <input type="date" value={end} min={start} max={isoToday()} onChange={(e) => setEnd(e.target.value)} /></label><button onClick={() => void load()} disabled={loading}>{loading ? "Analysing…" : "Refresh evidence"}</button></div>
    {loading && <div className="tp-le-state" role="status">Checking the current academic year, authorised scope and available evidence…</div>}
    {error && <div className="tp-le-error" role="alert"><strong>Report unavailable</strong><p>{error}</p><span>No partial report is shown when a required safety check fails.</span><button onClick={() => void load()}>Retry</button></div>}
    {report && <>
      <div className="tp-le-metrics"><article><span>Evidence findings</span><strong>{findings.length}</strong></article><article><span>Daily logs reviewed</span><strong>{report.coverage.dailyLogs}</strong></article><article><span>Feedback records</span><strong>{report.coverage.feedbackRows}</strong></article><article><span>Students represented</span><strong>{report.coverage.distinctStudentsWithFeedback}</strong></article></div>
      <div className="tp-le-notice"><strong>How to read this report</strong><p><b>Students</b> = distinct eligible students who named this concept. <b>Logs</b> = distinct daily lessons linked to the finding. <b>Coverage</b> = eligible students who submitted feedback for the related class/section/subject during the window, as a percentage of that roster; it is not the percentage who named this concept. <b>Evidence status</b> describes the strength/completeness of this self-reported signal, not a student grade or diagnosis. Open a concept to see individual feedback dates. The date column below shows the first and last dates this concept was observed. Independent assessment evidence is not connected.</p></div>
      {findings.length === 0 ? <div className="tp-le-state">No named-concept findings were found in this reporting window. This does not prove that no learning difficulty exists.</div> : <div className="tp-le-table-wrap"><table className="tp-le-table"><thead><tr><th>Class / Section</th><th>Subject</th><th>Topic</th><th>Concept named</th><th>Observed dates</th><th>Students</th><th>Logs</th><th>Coverage</th><th>Evidence status</th></tr></thead><tbody>{findings.map((f) => <tr key={f.key}><td>{f.className} / {f.sectionName}</td><td>{f.subjectName}</td><td>{f.topicName || "—"}</td><td><button className="tp-le-link" onClick={() => setSelected(f.key)}>{f.concept}</button></td><td>{f.firstObservedDate && f.lastObservedDate ? (f.firstObservedDate === f.lastObservedDate ? f.firstObservedDate : `${f.firstObservedDate} – ${f.lastObservedDate}`) : "Date unavailable"}</td><td>{f.distinctStudentCount}</td><td>{f.distinctLectureCount}</td><td>{f.feedbackCoveragePercent == null ? "Unavailable" : `${f.feedbackCoveragePercent}%`}</td><td><span className={`tp-le-status tp-le-status--${f.status}`} title={f.status === "recurring_signal" ? "Observed across multiple feedback records/dates; still self-reported." : f.status === "limited_signal" ? "Some evidence exists, but recurrence or breadth is limited." : f.status === "insufficient_coverage" ? "Too little eligible feedback to interpret confidently." : "Data is incomplete or conflicting; interpret cautiously."}>{f.status.replaceAll("_", " ")}</span></td></tr>)}</tbody></table></div>}
      {selectedFinding && <div className="tp-le-drawer-backdrop" role="presentation" onClick={() => setSelected(null)}><aside className="tp-le-drawer" role="dialog" aria-modal="true" aria-label="Evidence details" onClick={(e) => e.stopPropagation()}><button className="tp-le-close" onClick={() => setSelected(null)} aria-label="Close evidence details">×</button><div className="tp-le-eyebrow">EVIDENCE DETAILS</div><h2>{selectedFinding.concept}</h2><p>{selectedFinding.className} / {selectedFinding.sectionName} · {selectedFinding.subjectName}</p><h3>Observed dates</h3><p>{selectedFinding.firstObservedDate ?? "Unknown"}{selectedFinding.lastObservedDate && selectedFinding.lastObservedDate !== selectedFinding.firstObservedDate ? ` to ${selectedFinding.lastObservedDate}` : ""}</p><h3>Observed evidence</h3><ul>{selectedFinding.evidence.map((item) => <li key={item}>{item}</li>)}</ul><h3>Student-level Loop 1 evidence</h3>{selectedStudents.length === 0 ? <p>No eligible student-level feedback rows matched this named concept in the selected window. This is not proof of no difficulty.</p> : <div className="tp-le-student-list">{selectedStudents.map((student) => <article key={student.feedbackId}><strong>{student.studentName}</strong><span>{student.date ?? "Date unavailable"} · {student.understandingLevel}</span><small>{student.hasDoubt === true ? "Doubt marked: Yes" : student.hasDoubt === false ? "Doubt marked: No" : "Doubt flag not recorded"}</small>{student.additionalNote && <small>Additional note: {student.additionalNote}</small>}<small>Feedback record: {student.feedbackId}</small></article>)}</div>}<h3>Limitations</h3><ul>{selectedFinding.limitations.map((item) => <li key={item}>{item}</li>)}</ul><p className="tp-le-drawer-foot">Names are resolved from school-scoped display profiles; enrollment eligibility comes only from the active, year-linked enrollment ledger. Feedback is student-reported, not independently verified. Independent assessment status: not connected.</p></aside></div>}
      <details className="tp-le-caveats"><summary>Data sources and limitations</summary><ul>{report.caveats.map((c) => <li key={c}>{c}</li>)}</ul><p>Window: {report.windowStart} to {report.windowEnd}. Generated: {new Date(report.generatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}.</p></details>
    </>}
  </section>;
}
