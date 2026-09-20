import { useEffect, useMemo, useState } from "react";
import { getCurrentSchool } from "../../../services/identityService";
import {
  parseStudentAccountAssignmentFile,
  downloadStudentAccountAssignmentTemplate,
  type AssignStudentAccountRow,
} from "../../../services/bulkStudentAccountFileParser";
import { assignStudentAccountsForSchoolAdmin } from "../../../data/schoolStudentAccountAssignmentRepository";
import { getSchoolStudentRosterForSchoolAdmin, type SchoolStudentAllowlistEntry } from "../../../data/schoolStudentAllowlistRepository";

interface Props { onBack: () => void; }

type FieldKey = keyof AssignStudentAccountRow;

const FIELDS: Array<{ key: FieldKey; label: string; placeholder: string; type?: string }> = [
  { key: "rollNumber", label: "Roll No.", placeholder: "101" },
  { key: "email", label: "Email ID", placeholder: "student@example.com", type: "email" },
  { key: "password", label: "Password", placeholder: "Password", type: "password" },
  { key: "confirmPassword", label: "Confirm Password", placeholder: "Confirm password", type: "password" },
  { key: "studentName", label: "Student Name", placeholder: "Full name" },
  { key: "studentMobile", label: "Student Mobile", placeholder: "10 digits", type: "tel" },
  { key: "parentMobile", label: "Parent Mobile", placeholder: "10 digits", type: "tel" },
  { key: "className", label: "Class", placeholder: "10" },
  { key: "section", label: "Section", placeholder: "A", },
  { key: "age", label: "Age", placeholder: "15", type: "number" },
  { key: "gender", label: "Gender", placeholder: "Gender" },
  { key: "favouriteActivity", label: "Favourite Activity", placeholder: "Debate" },
  { key: "residenceCity", label: "Residence City", placeholder: "Gurugram" },
  { key: "area", label: "Area", placeholder: "Sector" },
];

const blankRow = (): AssignStudentAccountRow => ({
  rollNumber: "", email: "", password: "", confirmPassword: "", studentName: "",
  studentMobile: "", parentMobile: "", className: "", section: "", age: "", gender: "",
  favouriteActivity: "", residenceCity: "", area: "",
});

function validateRow(row: AssignStudentAccountRow): string | null {
  if (!row.rollNumber.trim()) return "Roll number is required.";
  if (!row.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) return "Enter a valid email ID.";
  if (row.password.length < 6) return "Password must contain at least 6 characters.";
  if (row.password !== row.confirmPassword) return "Password and confirm password do not match.";
  if (!row.studentName.trim()) return "Student name is required.";
  if (!/^\d{10}$/.test(row.studentMobile)) return "Student mobile must contain exactly 10 digits.";
  if (!/^\d{10}$/.test(row.parentMobile)) return "Parent mobile must contain exactly 10 digits.";
  if (row.studentMobile === row.parentMobile) return "Student and parent mobile numbers cannot be the same.";
  if (!row.className.trim()) return "Class is required.";
  if (!/^[A-Ga-g]$/.test(row.section.trim())) return "Section must be a single letter from A to G.";
  if (!row.age.trim() || !/^\d+$/.test(row.age.trim())) return "Age must be numeric.";
  if (!row.gender.trim()) return "Gender is required.";
  if (!row.favouriteActivity.trim()) return "Favourite activity is required.";
  if (!row.residenceCity.trim()) return "Residence city is required.";
  return null;
}

export default function SchoolStudentAccountAssignment({ onBack }: Props) {
  const [schoolUuid, setSchoolUuid] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [rows, setRows] = useState<AssignStudentAccountRow[]>([blankRow()]);
  const [roster, setRoster] = useState<SchoolStudentAllowlistEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const identity = getCurrentSchool();
      if (!identity?.schoolUuid) throw new Error("School identity could not be resolved.");
      setSchoolUuid(identity.schoolUuid);
      setSchoolName(identity.schoolName ?? "Your School");
      setRoster(await getSchoolStudentRosterForSchoolAdmin(identity.schoolUuid));
    } catch (e: any) {
      setError(e?.message ?? "Unable to load student account history.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const activeAccounts = useMemo(
    () => roster.filter(row => row.registered && String(row.accessStatus ?? "ACTIVE").toUpperCase() === "ACTIVE"),
    [roster],
  );

  const filteredAccounts = useMemo(() => {
    const q = search.trim().toUpperCase();
    return q ? activeAccounts.filter(row => row.rollNumber.toUpperCase().includes(q) || String(row.studentName ?? "").toUpperCase().includes(q)) : activeAccounts;
  }, [activeAccounts, search]);

  function updateRow(index: number, key: FieldKey, value: string) {
    setRows(current => current.map((row, i) => i === index ? { ...row, [key]: key === "section" ? value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1) : value } : row));
  }
  function addRow() { setRows(current => [...current, blankRow()]); }
  function removeRow(index: number) { setRows(current => { const next = current.filter((_, i) => i !== index); return next.length ? next : [blankRow()]; }); }

  async function importFile(file: File) {
    setError(""); setResultMessage("");
    try {
      const imported = await parseStudentAccountAssignmentFile(file);
      setRows(imported.length ? imported : [blankRow()]);
    } catch (e: any) { setError(e?.message ?? "Unable to read the student account file."); }
  }

  async function save() {
    setError(""); setResultMessage("");
    const nonEmpty = rows.filter(row => Object.values(row).some(value => String(value).trim()));
    if (!nonEmpty.length) { setError("Add at least one student row before saving."); return; }
    const firstError = nonEmpty.map((row, index) => ({ row, index: index + 1, error: validateRow(row) })).find(item => item.error);
    if (firstError?.error) { setError(`Row ${firstError.index}: ${firstError.error}`); return; }
    setSaving(true);
    try {
      const response = await assignStudentAccountsForSchoolAdmin(schoolUuid, nonEmpty.map(row => ({ ...row, section: row.section.toUpperCase() })));
      const failed = response.results.filter(result => !result.success);
      setResultMessage(`${response.createdCount} student account${response.createdCount === 1 ? "" : "s"} created${failed.length ? `; ${failed.length} row${failed.length === 1 ? " was" : "s were"} skipped.` : "."}`);
      if (failed.length) setError(failed.map(result => `Row ${result.rowNumber} (${result.rollNumber}): ${result.error ?? "Not created."}`).join("\n"));
      setRows([blankRow()]);
      await load();
    } catch (e: any) { setError(e?.message ?? "Unable to assign student accounts."); }
    finally { setSaving(false); }
  }

  return <div className="school-access-overlay"><style>{css}</style><div className="school-access-panel assign-panel">
    <header className="school-access-head"><div><div className="school-access-eyebrow">Student Account Assignment</div><h2>Assign Student Accounts</h2><p>{schoolName} can create multiple Student Portal accounts only for roll numbers already approved in Create Students.</p></div><button className="access-close" onClick={onBack}>← Back</button></header>
    <main className="school-access-body">
      {error && <div className="access-error assign-error">{error.split("\n").map((line, i) => <div key={i}>{line}</div>)}</div>}
      {resultMessage && <div className="assign-success">{resultMessage}</div>}
      {loading ? <div className="access-loading">Loading student account history…</div> : <>
        <div className="access-stats"><Stat label="Active Assigned Accounts" value={activeAccounts.length}/><Stat label="Approved Rolls" value={roster.filter(r => String(r.accessStatus ?? "ACTIVE").toUpperCase() === "ACTIVE").length}/><Stat label="Total Registered" value={roster.filter(r => r.registered).length}/></div>
        <section className="access-card assign-entry-card"><div className="assign-card-head"><div><h3>Student Account Details</h3><p>Enter rows manually or import CSV / Excel in this exact 14-column sequence.</p></div><div className="access-toolbar"><button className="access-secondary" onClick={addRow}>+ Add Student</button><label className="access-secondary file-label">Import CSV / Excel<input type="file" accept=".csv,.xls,.xlsx" onChange={e=>e.target.files?.[0]&&void importFile(e.target.files[0])}/></label><button className="access-secondary" onClick={()=>void downloadStudentAccountAssignmentTemplate()}>Template</button></div></div>
          <div className="assign-sequence"><b>Sequence:</b> Roll No. → Email → Password → Confirm Password → Student Name → Student Mobile → Parent Mobile → Class → Section → Age → Gender → Favourite Activity → Residence City → Area</div>
          <div className="assign-desktop-table"><div className="assign-table-scroll"><table><thead><tr>{FIELDS.map(field=><th key={field.key}>{field.label}</th>)}<th>Action</th></tr></thead><tbody>{rows.map((row,index)=><tr key={index}>{FIELDS.map(field=><td key={field.key}><input type={field.type ?? "text"} value={row[field.key]} onChange={e=>updateRow(index,field.key,e.target.value)} placeholder={field.placeholder} maxLength={field.key === "section" ? 1 : undefined}/></td>)}<td><button className="assign-remove" onClick={()=>removeRow(index)}>×</button></td></tr>)}</tbody></table></div></div>
          <div className="assign-mobile-list">{rows.map((row,index)=><div className="assign-mobile-row" key={index}><div className="assign-mobile-row-head"><b>Student {index+1}</b><button className="assign-remove" onClick={()=>removeRow(index)}>×</button></div><div className="assign-mobile-grid">{FIELDS.map(field=><label key={field.key}><span>{field.label}</span><input type={field.type ?? "text"} value={row[field.key]} onChange={e=>updateRow(index,field.key,e.target.value)} placeholder={field.placeholder} maxLength={field.key === "section" ? 1 : undefined}/></label>)}</div></div>)}</div>
          <div className="access-actions"><button className="access-primary" disabled={saving} onClick={()=>void save()}>{saving ? "Creating Accounts…" : "Save Approved Students"}</button></div>
        </section>
        <section className="access-card"><h3>Active Student Account History</h3><p>These are student accounts that have been created and whose approved roll-number access is currently active.</p><input className="access-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by roll number or student name…"/><div className="access-table-wrap"><table><thead><tr><th>Roll No.</th><th>Student</th><th>Registration</th><th>Access</th></tr></thead><tbody>{filteredAccounts.length ? filteredAccounts.map(row=><tr key={row.id ?? row.rollNumber}><td><b>{row.rollNumber}</b></td><td>{row.studentName || "—"}</td><td><span className="status active">CREATED</span></td><td><span className="status active">ACTIVE</span></td></tr>) : <tr><td colSpan={4}>No active assigned student accounts found.</td></tr>}</tbody></table></div></section>
      </>}
    </main>
  </div></div>;
}
function Stat({label,value}:{label:string;value:number}){return <div className="access-stat"><span>{label}</span><b>{value}</b></div>}

const css = `
.school-access-overlay{position:fixed;inset:0;z-index:1000;overflow:auto;background:rgba(7,20,45,.38);backdrop-filter:blur(4px);padding:12px;box-sizing:border-box}.school-access-panel{width:min(1080px,100%);margin:auto;background:#fff;border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 24px 70px rgba(15,23,42,.18);overflow:hidden}.assign-panel{width:min(1320px,100%)}.school-access-head{display:flex;justify-content:space-between;gap:14px;padding:16px 18px;border-bottom:1px solid #E2E8F0;background:linear-gradient(135deg,#F8FAFC,#fff)}.school-access-eyebrow{color:#EA580C;font-size:9px;font-weight:900;letter-spacing:.15em;text-transform:uppercase}.school-access-head h2{margin:4px 0;color:#143B73;font-size:20px}.school-access-head p{margin:0;color:#64748B;font-size:11px;line-height:1.45}.access-close,.access-primary,.access-secondary{border-radius:9px;padding:8px 11px;font-size:10px;font-weight:900;cursor:pointer}.access-close{border:1px solid #CBD5E1;background:#fff;color:#334155;height:max-content}.school-access-body{padding:16px}.access-error{padding:9px 10px;border:1px solid #FECACA;background:#FEF2F2;color:#B91C1C;border-radius:9px;font-size:10px;font-weight:800;margin-bottom:10px;line-height:1.45}.assign-success{padding:9px 10px;border:1px solid #A7F3D0;background:#ECFDF5;color:#047857;border-radius:9px;font-size:10px;font-weight:800;margin-bottom:10px}.access-loading{text-align:center;padding:30px;color:#64748B;font-size:11px;font-weight:800}.access-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:12px}.access-stat{border:1px solid #E2E8F0;border-radius:12px;padding:9px;background:#F8FAFC}.access-stat span{display:block;color:#64748B;font-size:8px;font-weight:900;text-transform:uppercase}.access-stat b{display:block;margin-top:3px;color:#143B73;font-size:19px}.access-card{border:1px solid #E2E8F0;border-radius:14px;padding:12px;min-width:0;margin-bottom:12px}.access-card h3{margin:0;color:#143B73;font-size:13px}.access-card p{margin:4px 0 10px;color:#64748B;font-size:9px;line-height:1.45}.assign-card-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.access-toolbar{display:flex;gap:6px;flex-wrap:wrap}.access-secondary{border:1px solid #FDBA74;background:#FFF7ED;color:#EA580C}.file-label{position:relative;overflow:hidden}.file-label input{position:absolute;inset:0;opacity:0;cursor:pointer}.assign-sequence{margin:8px 0 10px;padding:8px 9px;border-radius:8px;background:#F8FAFC;border:1px solid #E2E8F0;color:#475569;font-size:8px;line-height:1.5}.assign-table-scroll{overflow:auto;border:1px solid #E2E8F0;border-radius:10px}.assign-desktop-table table{width:100%;min-width:1500px;border-collapse:collapse}.assign-desktop-table th{position:sticky;top:0;z-index:1;background:#F8FAFC;color:#64748B;text-align:left;font-size:8px;text-transform:uppercase;white-space:nowrap}.assign-desktop-table th,.assign-desktop-table td{padding:6px;border-bottom:1px solid #F1F5F9;vertical-align:middle}.assign-desktop-table input,.assign-mobile-grid input,.access-search{width:100%;box-sizing:border-box;border:1px solid #CBD5E1;border-radius:7px;padding:7px 8px;font-size:9px;outline:none;background:#fff}.assign-desktop-table td input{min-width:80px}.assign-remove{border:0;background:#FEF2F2;color:#DC2626;border-radius:7px;height:28px;min-width:28px;cursor:pointer;font-weight:900}.access-actions{display:flex;justify-content:flex-end;margin-top:10px}.access-primary{border:0;background:#143B73;color:#fff}.access-primary:disabled{opacity:.55}.access-table-wrap{overflow-x:auto;border:1px solid #E2E8F0;border-radius:9px}.access-table-wrap table{width:100%;min-width:590px;border-collapse:collapse;font-size:9px}.access-table-wrap th{background:#F8FAFC;color:#64748B;text-align:left;font-size:8px;text-transform:uppercase}.access-table-wrap th,.access-table-wrap td{padding:8px;border-bottom:1px solid #F1F5F9}.status{display:inline-block;border-radius:999px;padding:4px 7px;font-size:7px;font-weight:900}.status.active{background:#ECFDF5;color:#047857}.assign-mobile-list{display:none}
@media(max-width:760px){.school-access-overlay{padding:8px}.school-access-head h2{font-size:17px}.school-access-head p{font-size:9px}.school-access-body{padding:10px}.access-stats{gap:6px}.access-stat{padding:8px}.access-stat b{font-size:16px}.assign-card-head{display:block}.assign-card-head .access-toolbar{margin-top:8px;display:grid;grid-template-columns:1fr 1fr}.assign-desktop-table{display:none}.assign-mobile-list{display:block}.assign-mobile-row{border:1px solid #E2E8F0;border-radius:12px;padding:9px;margin-bottom:8px;background:#F8FAFC}.assign-mobile-row-head{display:flex;justify-content:space-between;align-items:center;color:#143B73;font-size:10px;margin-bottom:8px}.assign-mobile-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.assign-mobile-grid label{display:block}.assign-mobile-grid label span{display:block;color:#64748B;font-size:7px;font-weight:900;text-transform:uppercase;margin-bottom:3px}.assign-mobile-grid input{font-size:9px;background:#fff}.access-table-wrap table{min-width:590px}}
@media(min-width:761px) and (max-width:1100px){.assign-panel{width:100%}.assign-desktop-table table{min-width:1450px}}
`;
