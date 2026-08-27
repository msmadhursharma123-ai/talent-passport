import { useEffect, useMemo, useState } from "react";
import { getSchoolPlanners, reviewPlanner, updateSchoolPlanner } from "../repository/PlannerRepository";
import type { PlannerRecord, PlannerType, QuestionPaperPayload } from "../types/PlannerModels";
import { AuditGroups, PlannerPageFrame, plannerStyles } from "../components/PlannerUI";
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

  const visible = useMemo(
    () => status === "ALL" ? records : records.filter(record => record.status === status),
    [records, status],
  );

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
    </section>

    <AuditGroups records={visible} onView={setPreview} onEdit={setEditing} onReview={review} />

    {saving && <div style={{ position: "fixed", right: 14, bottom: 14, zIndex: 200, padding: "8px 11px", border: "1px solid #FED7AA", borderRadius: 10, background: "#FFF7ED", color: "#C2410C", fontSize: 9, fontWeight: 800 }}>Saving…</div>}

    {preview && <WorksheetPreview record={preview} onClose={() => setPreview(null)} />}
    {editing && <WorksheetPreview record={editing} editable onClose={() => setEditing(null)} onSaveEdit={saveEdited} />}
  </PlannerPageFrame>;
}
