import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentSchool } from "../../../services/identityService";
import { getSchoolTeacherRosterForSchoolAdmin, type SchoolTeacherAllowlistEntry } from "../../../data/schoolTeacherAllowlistRepository";
import {
  getTeacherAssignments,
  createTeacherClassroomAssignmentForAdmin,
  endTeacherClassroomAssignment,
  transferTeacherClassroomAssignment,
} from "../../teacherIntelligence/repository/TeacherAssignmentRepository";
import type { TeacherAssignment } from "../../teacherIntelligence/types/TeacherAssignment";
import { CLASSES, SECTIONS, SUBJECTS } from "../../teacherIntelligence/constants/TeacherMasterData";

type TeacherProfile = { teacherUuid: string; fullName: string; email: string; isActive?: boolean; accountStatus?: string };
type ActiveYear = { id: string; code: string; name: string };
type ActionState = { mode: "end" | "transfer"; assignment: TeacherAssignment } | null;
interface Props { onBack: () => void; }

/** School-admin assignment register. Assignment endings preserve the original row;
 * transfers use one database RPC so the old row and replacement are committed atomically. */
export default function SchoolTeacherAssignmentManager({ onBack }: Props) {
  const [schoolUuid, setSchoolUuid] = useState("");
  const [schoolName, setSchoolName] = useState("Your School");
  const [activeYear, setActiveYear] = useState<ActiveYear | null>(null);
  const [roster, setRoster] = useState<SchoolTeacherAllowlistEntry[]>([]);
  const [profiles, setProfiles] = useState<TeacherProfile[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<ActionState>(null);
  const [replacementTeacher, setReplacementTeacher] = useState("");
  const [reason, setReason] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [className, setClassName] = useState("");
  const [sectionName, setSectionName] = useState("A");
  const [subjectName, setSubjectName] = useState("");

  async function load(showSpinner = true) {
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const school = getCurrentSchool();
      if (!school?.schoolUuid) throw new Error("School identity could not be resolved.");
      setSchoolUuid(school.schoolUuid);
      setSchoolName(school.schoolName ?? "Your School");
      const supabase: any = getSupabaseClient();
      if (!supabase) throw new Error("Supabase is not configured.");
      const [yearResult, teacherResult, assignmentRows, accessRows] = await Promise.all([
        supabase.from("school_academic_years")
          .select("id,school_uuid,academic_year_code,academic_year_name,status,is_current")
          .eq("school_uuid", school.schoolUuid).eq("status", "ACTIVE").eq("is_current", true)
          .order("start_date", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("teachers_master")
          .select("teacher_uuid,full_name,email,school_uuid,is_active,account_status")
          .eq("school_uuid", school.schoolUuid),
        getTeacherAssignments(),
        getSchoolTeacherRosterForSchoolAdmin(school.schoolUuid),
      ]);
      if (yearResult.error) throw yearResult.error;
      if (teacherResult.error) throw teacherResult.error;
      if (yearResult.data) setActiveYear({
        id: String(yearResult.data.id),
        code: String(yearResult.data.academic_year_code ?? ""),
        name: String(yearResult.data.academic_year_name ?? yearResult.data.academic_year_code ?? ""),
      });
      else setActiveYear(null);
      setProfiles((teacherResult.data ?? []).map((r: any) => ({
        teacherUuid: String(r.teacher_uuid ?? ""),
        fullName: String(r.full_name ?? "Teacher"),
        email: String(r.email ?? "").trim().toLowerCase(),
        isActive: r.is_active !== false,
        accountStatus: String(r.account_status ?? "active").toLowerCase(),
      })).filter((p: TeacherProfile) => p.teacherUuid && p.isActive !== false && !["suspended", "inactive", "archived"].includes(p.accountStatus ?? "")));
      setAssignments(assignmentRows.filter(a => String(a.schoolUuid) === String(school.schoolUuid)));
      setRoster(accessRows);
    } catch (e: any) {
      setError(e?.message ?? "Unable to load teacher assignments.");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const profileById = useMemo(() => new Map(profiles.map(p => [p.teacherUuid, p])), [profiles]);
  const registeredAllowedTeachers = useMemo(() => {
    const allowed = new Set(roster
      .filter(r => String(r.accessStatus ?? "ACTIVE").toUpperCase() === "ACTIVE" && r.registered)
      .map(r => r.email.trim().toLowerCase()));
    return profiles.filter(p => p.email && allowed.has(p.email));
  }, [profiles, roster]);
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assignments.filter(a => {
      if (!q) return true;
      const teacher = profileById.get(a.teacherUuid);
      return [teacher?.email, teacher?.fullName, a.className, a.sectionName, a.subjectName, a.academicYear]
        .some(v => String(v ?? "").toLowerCase().includes(q));
    }).sort((a, b) => Number(b.isActive !== false) - Number(a.isActive !== false)
      || String(a.className).localeCompare(String(b.className), undefined, { numeric: true })
      || String(a.sectionName).localeCompare(String(b.sectionName))
      || String(a.subjectName).localeCompare(String(b.subjectName)));
  }, [assignments, search, profileById]);

  function isCurrentYear(a: TeacherAssignment) {
    return Boolean(activeYear && (String(a.academicYearId ?? "") === activeYear.id || (!a.academicYearId && String(a.academicYear ?? "").trim().toLowerCase() === activeYear.code.trim().toLowerCase())));
  }

  // Show the currently responsible teacher beside ended rows when the same slot
  // now has an active assignment in the same academic year. Original history stays intact.
  function getCurrentSlotTeacher(ended: TeacherAssignment): TeacherProfile | undefined {
    const successor = assignments.find(candidate => candidate.isActive !== false
      && candidate.id !== ended.id
      && candidate.schoolUuid === ended.schoolUuid
      && (candidate.academicYearId && ended.academicYearId
        ? candidate.academicYearId === ended.academicYearId
        : String(candidate.academicYear ?? "").trim().toLowerCase() === String(ended.academicYear ?? "").trim().toLowerCase())
      && candidate.className.trim().toLowerCase() === ended.className.trim().toLowerCase()
      && candidate.sectionName.trim().toLowerCase() === ended.sectionName.trim().toLowerCase()
      && candidate.subjectName.trim().toLowerCase() === ended.subjectName.trim().toLowerCase());
    return successor ? profileById.get(successor.teacherUuid) : undefined;
  }
  function beginAction(mode: "end" | "transfer", assignment: TeacherAssignment) {
    setAction({ mode, assignment });
    setReplacementTeacher("");
    setReason("");
    setError("");
    setNotice("");
  }

  async function submitAction() {
    if (!action?.assignment.id) return;
    if (!reason.trim()) { setError("Enter a factual reason for ending or transferring this assignment."); return; }
    if (reason.trim().length > 500) { setError("The reason must be 500 characters or fewer."); return; }
    if (action.mode === "transfer" && !replacementTeacher) { setError("Select a replacement teacher."); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      if (action.mode === "end") {
        await endTeacherClassroomAssignment(action.assignment.id, reason.trim());
        setNotice("Assignment ended. Its historical row and linked records were retained.");
      } else {
        await transferTeacherClassroomAssignment(action.assignment.id, replacementTeacher, reason.trim());
        setNotice("Teacher handover completed. The old assignment was retained as history and a new assignment was created.");
      }
      setAction(null); setReplacementTeacher(""); setReason("");
      await load(false);
    } catch (e: any) {
      setError(e?.message ?? "The assignment operation failed. No successful handover was confirmed.");
    } finally { setSaving(false); }
  }

  async function assignVacantSlot() {
    const teacher = registeredAllowedTeachers.find(p => p.teacherUuid === selectedTeacher);
    if (!activeYear) { setError("No active current academic year is configured for this school."); return; }
    if (!teacher || !schoolUuid || !className.trim() || !sectionName.trim() || !subjectName.trim()) {
      setError("Select a registered teacher and complete class, section, and subject."); return;
    }
    const duplicate = assignments.some(a => a.isActive !== false && a.schoolUuid === schoolUuid
      && (String(a.academicYearId ?? "") === activeYear.id || (!a.academicYearId && String(a.academicYear ?? "").trim().toLowerCase() === activeYear.code.trim().toLowerCase()))
      && a.className.trim().toLowerCase() === className.trim().toLowerCase()
      && a.sectionName.trim().toLowerCase() === sectionName.trim().toLowerCase()
      && a.subjectName.trim().toLowerCase() === subjectName.trim().toLowerCase());
    if (duplicate) { setError("An active assignment already exists for this slot. Use Transfer on that row instead."); return; }
    setSaving(true); setError(""); setNotice("");
    try {
      await createTeacherClassroomAssignmentForAdmin(schoolUuid, teacher.teacherUuid, className.trim(), sectionName.trim(), subjectName.trim());
      setSelectedTeacher(""); setClassName(""); setSubjectName("");
      setNotice("Assignment created for the active academic year.");
      await load(false);
    } catch (e: any) { setError(e?.message ?? "Unable to create the assignment. Check the active year and assignment constraints."); }
    finally { setSaving(false); }
  }

  return <div className="sta-page">
    <style>{styles}</style>
    <header className="sta-head">
      <button type="button" className="sta-back" onClick={onBack}>← Back to Create Teachers</button>
      <div><div className="sta-eyebrow">SCHOOL ADMINISTRATION · {schoolName}</div>
        <h2>Teacher Class & Subject Assignments</h2>
        <p>End or transfer an individual class/subject assignment without deleting its history. Other assignments held by the same teacher remain unchanged.</p>
        <div className="sta-year">Active academic year: <b>{activeYear?.name ?? "Not available"}</b></div>
      </div>
    </header>
    {error && <div className="sta-error" role="alert">{error}</div>}
    {notice && <div className="sta-notice" role="status">{notice}</div>}
    {!activeYear && !loading && <div className="sta-warning">No active current academic year was found. Assignment ending, transfer, and creation are disabled until the school has an active current year.</div>}
    {loading ? <div className="sta-state">Loading assignments and registered teacher accounts…</div> : <>
      {action && <section className="sta-card sta-action-card">
        <div className="sta-list-head"><div><h3>{action.mode === "transfer" ? "Transfer assignment to another teacher" : "End teacher assignment"}</h3>
          <p>Class {action.assignment.className}{action.assignment.sectionName ? ` · Section ${action.assignment.sectionName}` : ""} · {action.assignment.subjectName} · {action.assignment.academicYear}</p></div>
          <button type="button" className="sta-cancel" onClick={() => setAction(null)} disabled={saving}>Cancel</button>
        </div>
        {action.mode === "transfer" && <label className="sta-field">Replacement teacher
          <select value={replacementTeacher} onChange={e => setReplacementTeacher(e.target.value)}>
            <option value="">Select a registered teacher with active school access</option>
            {registeredAllowedTeachers.filter(t => t.teacherUuid !== action.assignment.teacherUuid).map(t =>
              <option key={t.teacherUuid} value={t.teacherUuid}>{t.fullName} · {t.email}</option>)}
          </select>
        </label>}
        <label className="sta-field">Reason (required)
          <textarea value={reason} onChange={e => setReason(e.target.value)} maxLength={500}
            placeholder="e.g. Previous teacher left the school; Science assignment handed over effective today." rows={3} />
        </label>
        <div className="sta-form-actions"><span>{reason.length}/500 characters</span>
          <button type="button" className="sta-primary" disabled={saving || !activeYear || !isCurrentYear(action.assignment)} onClick={() => void submitAction()}>
            {saving ? "Processing…" : action.mode === "transfer" ? "Confirm atomic handover" : "Confirm end assignment"}
          </button>
        </div>
        {!isCurrentYear(action.assignment) && <p className="sta-hint">This assignment does not belong to the active academic year and cannot be changed here.</p>}
      </section>}

      <section className="sta-card"><h3>Assign a teacher to a vacant slot</h3>
        <p>Use this only when no active assignment already occupies the slot. To replace a teacher, use <b>Transfer</b> in the register below.</p>
        <div className="sta-form">
          <label>Teacher account<select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}>
            <option value="">Select teacher</option>{registeredAllowedTeachers.map(t => <option key={t.teacherUuid} value={t.teacherUuid}>{t.fullName} · {t.email}</option>)}
          </select></label>
          <label>Class<select value={className} onChange={e => setClassName(e.target.value)}><option value="">Select class</option>{CLASSES.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <label>Section<select value={sectionName} onChange={e => setSectionName(e.target.value)}><option value="">Select section</option>{SECTIONS.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <label>Subject<select value={subjectName} onChange={e => setSubjectName(e.target.value)}><option value="">Select subject</option>{SUBJECTS.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
          <div className="sta-year-field"><span>Academic year</span><b>{activeYear?.code ?? "Unavailable"}</b></div>
          <button type="button" className="sta-primary" disabled={saving || !activeYear} onClick={() => void assignVacantSlot()}>{saving ? "Saving…" : "Create Assignment"}</button>
        </div>
        {!registeredAllowedTeachers.length && <p className="sta-hint">No registered teacher with active school access was found. Approve the teacher email and ensure the account is registered under this school.</p>}
      </section>

      <section className="sta-card"><div className="sta-list-head"><div><h3>Assignment register</h3><p>Active and ended assignments for this school. Historical rows are retained.</p></div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teacher, email, class, subject…" aria-label="Search assignments" />
      </div>
      <div className="sta-table-wrap"><table><thead><tr><th>Status</th><th>Teacher name</th><th>Email</th><th>Class</th><th>Section</th><th>Subject</th><th>Academic year</th><th>Current teacher / successor</th><th>Ended on</th><th>End reason</th><th>Action</th></tr></thead><tbody>
        {visible.length ? visible.map(a => { const t = profileById.get(a.teacherUuid); const active = a.isActive !== false; const current = isCurrentYear(a); return <tr key={a.id}>
          <td><span className={`sta-status ${active ? "is-active" : "is-ended"}`}>{active ? "ACTIVE" : "ENDED"}</span></td>
          <td>{t?.fullName ?? "Teacher profile unavailable"}</td><td>{t?.email || "Email unavailable"}</td><td>{a.className}</td><td>{a.sectionName}</td><td>{a.subjectName}</td><td>{a.academicYear || "—"}</td><td>{!active ? (getCurrentSlotTeacher(a)?.fullName ?? (getCurrentSlotTeacher(a) ? "Current assignment active" : "—")) : "—"}</td><td>{!active && a.endedAt ? new Date(a.endedAt).toLocaleString() : "—"}</td><td>{!active ? (a.endReason || "Reason not recorded") : "—"}</td>
          <td>{active ? <div className="sta-row-actions"><button type="button" className="sta-end" disabled={saving || !current} onClick={() => beginAction("end", a)}>End</button>
            <button type="button" className="sta-transfer" disabled={saving || !current} onClick={() => beginAction("transfer", a)}>Transfer</button></div> : <span className="sta-muted">Historical</span>}</td>
        </tr>; }) : <tr><td colSpan={11} className="sta-empty">No matching teacher assignments found.</td></tr>}
      </tbody></table></div>
      </section>
    </>}
  </div>;
}

const styles = `.sta-page{color:#0B1D38;display:flex;flex-direction:column;gap:14px;min-width:0}.sta-head{display:flex;flex-direction:column;gap:10px}.sta-back,.sta-cancel{align-self:flex-start;border:1px solid #CBD5E1;background:#fff;color:#334155;border-radius:9px;padding:8px 11px;font-weight:800;font-size:11px;cursor:pointer}.sta-eyebrow{font-size:9px;letter-spacing:.12em;color:#EA580C;font-weight:900}.sta-head h2{margin:4px 0;color:#143B73;font-size:20px}.sta-head p,.sta-card p{margin:4px 0 10px;color:#64748B;font-size:10px;line-height:1.5}.sta-year{font-size:10px;color:#475569;margin-top:8px}.sta-year b{color:#143B73}.sta-card{border:1px solid #E2E8F0;border-radius:14px;padding:13px;min-width:0;background:#fff}.sta-card h3{margin:0;color:#143B73;font-size:13px}.sta-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:end}.sta-form label,.sta-field{display:flex;flex-direction:column;gap:5px;color:#475569;font-size:9px;font-weight:800;min-width:0}.sta-form input,.sta-form select,.sta-field select,.sta-field textarea{box-sizing:border-box;width:100%;min-width:0;border:1px solid #CBD5E1;border-radius:8px;padding:9px;font:inherit;font-weight:500;color:#0F172A;background:#fff}.sta-field textarea{resize:vertical}.sta-year-field{display:flex;flex-direction:column;gap:5px;border:1px solid #E2E8F0;border-radius:8px;padding:8px 9px;font-size:9px;color:#64748B;min-height:33px}.sta-year-field b{color:#143B73;font-size:11px}.sta-primary{border:0;border-radius:9px;padding:10px 12px;background:#143B73;color:#fff;font-size:10px;font-weight:900;cursor:pointer;min-height:35px}.sta-primary:disabled,.sta-end:disabled,.sta-transfer:disabled{opacity:.45;cursor:not-allowed}.sta-hint{font-size:9px;color:#64748B;margin:9px 0 0}.sta-list-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:10px}.sta-list-head>input{width:min(340px,100%);box-sizing:border-box;border:1px solid #CBD5E1;border-radius:8px;padding:9px;font-size:10px}.sta-table-wrap{width:100%;overflow:auto;border:1px solid #E2E8F0;border-radius:9px}.sta-table-wrap table{width:100%;min-width:1050px;border-collapse:collapse;font-size:9px}.sta-table-wrap th{background:#F8FAFC;color:#64748B;text-align:left;font-size:8px;text-transform:uppercase;white-space:nowrap}.sta-table-wrap th,.sta-table-wrap td{padding:9px 8px;border-bottom:1px solid #F1F5F9;vertical-align:middle}.sta-status{display:inline-block;border-radius:999px;padding:4px 7px;font-size:7px;font-weight:900;white-space:nowrap}.sta-status.is-active{background:#ECFDF5;color:#047857}.sta-status.is-ended{background:#F1F5F9;color:#64748B}.sta-row-actions{display:flex;gap:5px}.sta-end,.sta-transfer{border:0;border-radius:7px;padding:6px 8px;font-size:8px;font-weight:900;cursor:pointer;white-space:nowrap}.sta-end{background:#FEF2F2;color:#B91C1C}.sta-transfer{background:#EFF6FF;color:#1D4ED8}.sta-muted{color:#94A3B8;font-size:8px}.sta-empty{text-align:center;color:#64748B;padding:18px!important}.sta-error,.sta-warning,.sta-notice,.sta-state{padding:10px 12px;border-radius:9px;font-size:10px;font-weight:700;line-height:1.45}.sta-error{border:1px solid #FECACA;background:#FEF2F2;color:#B91C1C}.sta-warning{border:1px solid #FDE68A;background:#FFFBEB;color:#92400E}.sta-notice{border:1px solid #A7F3D0;background:#ECFDF5;color:#065F46}.sta-state{text-align:center;padding:30px;color:#64748B}.sta-action-card{border-color:#BFDBFE;background:#F8FBFF}.sta-action-card .sta-list-head{align-items:flex-start}.sta-field{margin-top:10px}.sta-form-actions{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px;color:#64748B;font-size:9px}.sta-form-actions .sta-primary{margin-left:auto}@media(max-width:760px){.sta-head h2{font-size:17px}.sta-card{padding:10px}.sta-form{grid-template-columns:1fr 1fr}.sta-list-head{align-items:stretch;flex-direction:column}.sta-list-head>input{width:100%}.sta-table-wrap table{min-width:820px}.sta-form-actions{align-items:stretch;flex-direction:column}.sta-form-actions .sta-primary{width:100%;margin:0}.sta-year-field{grid-column:span 2}}@media(max-width:420px){.sta-form{grid-template-columns:1fr}.sta-year-field{grid-column:auto}.sta-head h2{font-size:16px}}`;
