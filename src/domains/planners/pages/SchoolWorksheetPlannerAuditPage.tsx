import { useEffect, useMemo, useState } from "react";
import { getSchoolPlanners, reviewPlanner, updateSchoolPlanner } from "../repository/PlannerRepository";
import type { PlannerRecord, PlannerType, QuestionPaperPayload } from "../types/PlannerModels";
import { AuditGroups, PlannerAuditFilters, PlannerPageFrame, plannerStyles, type PlannerTimeFilter } from "../components/PlannerUI";
import { WorksheetPreview, worksheetStyles } from "./WorksheetMakerPage";

type WorksheetPayload = QuestionPaperPayload & { chapter?: string };
type WorksheetRecord = PlannerRecord & { plannerType: PlannerType };

export default function SchoolWorksheetPlannerAuditPage() {
  const [records, setRecords] = useState<WorksheetRecord[]>([]);
  const [preview, setPreview] = useState<WorksheetRecord | null>(null);
  const [editing, setEditing] = useState<WorksheetRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"ALL" | "SUBMITTED" | "APPROVED" | "REJECTED">("ALL");
  const [teacherName,setTeacherName]=useState("");
  const [className,setClassName]=useState("");
  const [sectionName,setSectionName]=useState("");
  const [timeFilter,setTimeFilter]=useState<PlannerTimeFilter>("ALL");
  const [customStart,setCustomStart]=useState("");
  const [customEnd,setCustomEnd]=useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const rows = await getSchoolPlanners("worksheet");
      setRecords(rows as WorksheetRecord[]);
    } catch (e: any) {
      setError(e?.message ?? "Unable to load worksheet submissions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => {
    const now=Date.now();
    const cutoffDays: Record<Exclude<PlannerTimeFilter,"ALL"|"CUSTOM">,number>={ "7D":7, "14D":14, "30D":30, "60D":60 };
    return records.filter(record=>{
      if(status!=="ALL" && record.status!==status) return false;
      if(teacherName && !record.teacherName.includes(teacherName)) return false;
      if(className && record.className!==className) return false;
      if(sectionName && record.sectionName!==sectionName) return false;
      const raw=record.submittedAt||record.createdAt;
      const recordTime=raw?new Date(raw).getTime():NaN;
      if(timeFilter!=="ALL" && timeFilter!=="CUSTOM"){
        if(Number.isNaN(recordTime) || recordTime < now-cutoffDays[timeFilter]*24*60*60*1000) return false;
      }
      if(timeFilter==="CUSTOM"){
        const recordDate=raw ? raw.slice(0,10) : "";
        if(customStart && (!recordDate || recordDate<customStart)) return false;
        if(customEnd && (!recordDate || recordDate>customEnd)) return false;
      }
      return true;
    });
  },[records,status,teacherName,className,sectionName,timeFilter,customStart,customEnd]);

  async function review(record: WorksheetRecord, next: "APPROVED" | "REJECTED") {
    setSaving(true);
    setError("");
    try {
      const updated = await reviewPlanner(record.id, next, "");
      const nextRecord = updated as WorksheetRecord;
      setRecords(current => current.map(item => item.id === nextRecord.id ? nextRecord : item));
      if (preview?.id === nextRecord.id) setPreview(nextRecord);
    } catch (e: any) {
      setError(e?.message ?? "Unable to update worksheet review status.");
    } finally {
      setSaving(false);
    }
  }

  async function saveEdited(payload: WorksheetPayload) {
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updateSchoolPlanner(editing.id, {
        title: editing.title,
        className: editing.className,
        sectionName: editing.sectionName,
        subjectName: editing.subjectName,
        startDate: editing.startDate,
        endDate: editing.endDate,
        payload: {
          ...payload,
          totalMarks: 0,
          timeAllowed: "",
          chapter: payload.chapter?.trim() || "Chapter 1",
        },
      });
      const nextRecord = updated as WorksheetRecord;
      setRecords(current => current.map(item => item.id === nextRecord.id ? nextRecord : item));
      setEditing(null);
      setPreview(nextRecord);
    } catch (e: any) {
      setError(e?.message ?? "Unable to save worksheet edits.");
    } finally {
      setSaving(false);
    }
  }

  return <PlannerPageFrame
    title="Worksheet Submissions"
    eyebrow="WORKSHEET AUDIT"
    copy="Review every worksheet submitted by teachers of the authenticated school. The worksheet preview, question structure and PDF use the same worksheet document and payload as the Teacher Portal."
  >
    <style>{worksheetStyles}</style>
    {error && <div className="planner-section" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C", fontSize: 10, fontWeight: 800 }}>{error}</div>}

    <section className="planner-section">
      <div className="planner-section-head">
        <div>
          <div className="planner-eyebrow">Teacher submission ledger</div>
          <h2 className="planner-section-title">Worksheets by teacher</h2>
          <p className="planner-section-copy">Each teacher remains a separate group, with the exact classroom, subject and worksheet document submitted from the Teacher Portal.</p>
        </div>
        <div className="planner-actions">
          {(["ALL", "SUBMITTED", "APPROVED", "REJECTED"] as const).map(item => (
            <button key={item} className={`planner-btn ${status === item ? "primary" : ""}`} onClick={() => setStatus(item)}>{item}</button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 10, color: "#94A3B8", fontSize: 9, fontWeight: 700 }}>
        {loading ? "Loading…" : `${visible.length} submission${visible.length === 1 ? "" : "s"} in this school`}
      </div>
      <PlannerAuditFilters records={records} teacherName={teacherName} className={className} sectionName={sectionName} timeFilter={timeFilter} customStart={customStart} customEnd={customEnd} onTeacherNameChange={setTeacherName} onClassChange={value=>{setClassName(value);setSectionName("");}} onSectionChange={setSectionName} onTimeFilterChange={value=>{setTimeFilter(value);if(value!=="CUSTOM"){setCustomStart("");setCustomEnd("");}}} onCustomStartChange={setCustomStart} onCustomEndChange={setCustomEnd}/>
    </section>

    <AuditGroups records={visible} onView={setPreview} onEdit={setEditing} onReview={review} />

    {saving && <div style={{ position: "fixed", right: 14, bottom: 14, zIndex: 200, padding: "8px 11px", border: "1px solid #FED7AA", borderRadius: 10, background: "#FFF7ED", color: "#C2410C", fontSize: 9, fontWeight: 800 }}>Saving…</div>}

    {preview && <WorksheetPreview record={preview} onClose={() => setPreview(null)} />}
    {editing && <WorksheetPreview record={editing} editable onClose={() => setEditing(null)} onSaveEdit={saveEdited} />}
  </PlannerPageFrame>;
}
