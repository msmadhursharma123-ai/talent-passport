import { useEffect, useMemo, useState } from "react";
import { getCurrentSchool } from "../../../services/identityService";
import { parseAccessFile, downloadAccessTemplate } from "../../../services/bulkAccessFileParser";
import {
  getSchoolStudentRosterForSchoolAdmin,
  replaceSchoolStudentAllowlistForSchoolAdmin,
  revokeSchoolStudentAccessForAdmin,
  restoreSchoolStudentAccessForAdmin,
  type SchoolStudentAllowlistEntry,
} from "../../../data/schoolStudentAllowlistRepository";

interface Props { onClose: () => void; }

export default function SchoolStudentAccessManager({ onClose }: Props) {
  const [schoolUuid, setSchoolUuid] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [rolls, setRolls] = useState<string[]>([""]);
  const [roster, setRoster] = useState<SchoolStudentAllowlistEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      const identity = getCurrentSchool();
      if (!identity?.schoolUuid) throw new Error("School identity could not be resolved.");
      setSchoolUuid(identity.schoolUuid); setSchoolName(identity.schoolName ?? "Your School");
      const rows = await getSchoolStudentRosterForSchoolAdmin(identity.schoolUuid);
      setRoster(rows);
      setRolls(rows.filter(r => String(r.accessStatus ?? "ACTIVE").toUpperCase() === "ACTIVE").map(r => r.rollNumber).length ? rows.filter(r => String(r.accessStatus ?? "ACTIVE").toUpperCase() === "ACTIVE").map(r => r.rollNumber) : [""]);
    } catch (e: any) { setError(e?.message ?? "Unable to load student access."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const validRolls = useMemo(() => Array.from(new Set(rolls.map(x => x.trim().toUpperCase()).filter(Boolean))), [rolls]);
  const filteredRoster = useMemo(() => {
    const q = search.trim().toUpperCase();
    return q ? roster.filter(r => r.rollNumber.toUpperCase().includes(q)) : roster;
  }, [roster, search]);

  function updateRoll(index: number, value: string) { setRolls(current => current.map((x, i) => i === index ? value : x)); }
  function addRow() { setRolls(current => [...current, ""]); }
  function removeRow(index: number) { setRolls(current => { const n=current.filter((_,i)=>i!==index); return n.length?n:[""]; }); }
  async function save() {
    if (!schoolUuid) return; setSaving(true); setError("");
    try { if (!(await replaceSchoolStudentAllowlistForSchoolAdmin(schoolUuid, validRolls))) throw new Error("Unable to update the approved student roll-number list."); await load(); }
    catch(e:any){ setError(e?.message ?? "Unable to update student access."); } finally { setSaving(false); }
  }
  async function importFile(file: File) {
    try { const values = await parseAccessFile(file, "roll"); setRolls(current => Array.from(new Set([...current, ...values])).filter(Boolean)); }
    catch(e:any){ setError(e?.message ?? "Unable to read the access file."); }
  }
  async function toggle(row: SchoolStudentAllowlistEntry) {
    const active = String(row.accessStatus ?? "ACTIVE").toUpperCase() === "ACTIVE";
    const ok = active ? await revokeSchoolStudentAccessForAdmin(schoolUuid, row.rollNumber) : await restoreSchoolStudentAccessForAdmin(schoolUuid, row.rollNumber);
    if (!ok) { setError(`Unable to ${active ? "revoke" : "restore"} access for roll number ${row.rollNumber}.`); return; }
    await load();
  }
  const activeCount = roster.filter(r => String(r.accessStatus ?? "ACTIVE").toUpperCase() === "ACTIVE").length;
  const registeredCount = roster.filter(r => r.registered).length;

  return <div className="school-access-overlay"><style>{css}</style><div className="school-access-panel">
    <header className="school-access-head"><div><div className="school-access-eyebrow">Student Access Control</div><h2>Approve Student Accounts</h2><p>{schoolName} controls which roll numbers can create and use Student Portal accounts.</p></div><button className="access-close" onClick={onClose}>Close</button></header>
    <main className="school-access-body">
      {error && <div className="access-error">{error}</div>}
      {loading ? <div className="access-loading">Loading student access history…</div> : <>
        <div className="access-stats"><Stat label="Approved / Active" value={activeCount}/><Stat label="Registered" value={registeredCount}/><Stat label="Total History" value={roster.length}/></div>
        <div className="access-grid"><section className="access-card"><h3>Approved Roll Numbers</h3><p>Add one roll number per row, or import CSV/XLS/XLSX. Saving keeps old entries in history instead of deleting them.</p>
          {rolls.map((roll,index)=><div className="access-input-row" key={index}><span>{index+1}</span><input value={roll} onChange={e=>updateRoll(index,e.target.value)} placeholder="101"/><button onClick={()=>removeRow(index)} aria-label="Remove">×</button></div>)}
          <div className="access-toolbar"><button className="access-secondary" onClick={addRow}>+ Add Roll Number</button><label className="access-secondary file-label">Import CSV / Excel<input type="file" accept=".csv,.xls,.xlsx" onChange={e=>e.target.files?.[0]&&void importFile(e.target.files[0])}/></label><button className="access-secondary" onClick={()=>downloadAccessTemplate("roll")}>Template</button></div>
          <div className="access-actions"><button className="access-primary" disabled={saving} onClick={()=>void save()}>{saving?"Saving…":"Save Approved Students"}</button></div>
        </section>
        <section className="access-card"><h3>Student Account History</h3><p>Search by roll number. Revoke/deactivate access when a student leaves; restore later without losing history.</p><input className="access-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by roll number…"/>
          <div className="access-table-wrap"><table><thead><tr><th>Roll No.</th><th>Student</th><th>Registration</th><th>Access</th><th>Action</th></tr></thead><tbody>{filteredRoster.length?filteredRoster.map(row=>{const active=String(row.accessStatus??"ACTIVE").toUpperCase()==="ACTIVE";return <tr key={row.id??row.rollNumber}><td><b>{row.rollNumber}</b></td><td>{row.studentName||"—"}</td><td>{row.registered?"Registered":"Pending"}</td><td><span className={`status ${active?"active":"revoked"}`}>{active?"ACTIVE":"REVOKED"}</span></td><td><button className={`row-action ${active?"danger":"restore"}`} onClick={()=>void toggle(row)}>{active?"Revoke":"Restore"}</button></td></tr>}) : <tr><td colSpan={5}>No student access records found.</td></tr>}</tbody></table></div>
        </section></div>
      </>}
    </main></div></div>;
}
function Stat({label,value}:{label:string;value:number}){return <div className="access-stat"><span>{label}</span><b>{value}</b></div>}
const css=`
.school-access-overlay{position:fixed;inset:0;z-index:1000;overflow:auto;background:rgba(7,20,45,.38);backdrop-filter:blur(4px);padding:12px;box-sizing:border-box}.school-access-panel{width:min(1080px,100%);margin:auto;background:#fff;border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 24px 70px rgba(15,23,42,.18);overflow:hidden}.school-access-head{display:flex;justify-content:space-between;gap:14px;padding:16px 18px;border-bottom:1px solid #E2E8F0;background:linear-gradient(135deg,#F8FAFC,#fff)}.school-access-eyebrow{color:#EA580C;font-size:9px;font-weight:900;letter-spacing:.15em;text-transform:uppercase}.school-access-head h2{margin:4px 0;color:#143B73;font-size:20px}.school-access-head p{margin:0;color:#64748B;font-size:11px;line-height:1.45}.access-close,.access-primary,.access-secondary,.row-action{border-radius:9px;padding:8px 11px;font-size:10px;font-weight:900;cursor:pointer}.access-close{border:1px solid #CBD5E1;background:#fff;color:#334155;height:max-content}.school-access-body{padding:16px}.access-error{padding:9px 10px;border:1px solid #FECACA;background:#FEF2F2;color:#B91C1C;border-radius:9px;font-size:10px;font-weight:800;margin-bottom:10px}.access-loading{text-align:center;padding:30px;color:#64748B;font-size:11px;font-weight:800}.access-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:12px}.access-stat{border:1px solid #E2E8F0;border-radius:12px;padding:9px;background:#F8FAFC}.access-stat span{display:block;color:#64748B;font-size:8px;font-weight:900;text-transform:uppercase}.access-stat b{display:block;margin-top:3px;color:#143B73;font-size:19px}.access-grid{display:grid;grid-template-columns:1fr 1.25fr;gap:12px}.access-card{border:1px solid #E2E8F0;border-radius:14px;padding:12px;min-width:0}.access-card h3{margin:0;color:#143B73;font-size:13px}.access-card p{margin:4px 0 10px;color:#64748B;font-size:9px;line-height:1.45}.access-input-row{display:grid;grid-template-columns:22px 1fr 28px;gap:6px;align-items:center;margin-bottom:6px}.access-input-row span{font-size:9px;color:#94A3B8;text-align:right}.access-input-row input,.access-search{width:100%;box-sizing:border-box;border:1px solid #CBD5E1;border-radius:8px;padding:8px 9px;font-size:10px;outline:none}.access-input-row button{border:0;background:#FEF2F2;color:#DC2626;border-radius:7px;height:28px;cursor:pointer;font-weight:900}.access-toolbar{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.access-secondary{border:1px solid #FDBA74;background:#FFF7ED;color:#EA580C}.file-label{position:relative;overflow:hidden}.file-label input{position:absolute;inset:0;opacity:0;cursor:pointer}.access-actions{display:flex;justify-content:flex-end;margin-top:10px}.access-primary{border:0;background:#143B73;color:#fff}.access-primary:disabled{opacity:.55}.access-search{margin-bottom:8px}.access-table-wrap{overflow-x:auto;border:1px solid #E2E8F0;border-radius:9px}.access-table-wrap table{width:100%;min-width:610px;border-collapse:collapse;font-size:9px}.access-table-wrap th{background:#F8FAFC;color:#64748B;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.04em}.access-table-wrap th,.access-table-wrap td{padding:8px;border-bottom:1px solid #F1F5F9}.status{display:inline-block;border-radius:999px;padding:4px 7px;font-size:7px;font-weight:900}.status.active{background:#ECFDF5;color:#047857}.status.revoked{background:#FEF2F2;color:#B91C1C}.row-action{border:0}.row-action.danger{background:#FEF2F2;color:#B91C1C}.row-action.restore{background:#ECFDF5;color:#047857}@media(max-width:760px){.school-access-overlay{padding:8px}.school-access-head h2{font-size:17px}.school-access-head p{font-size:9px}.school-access-body{padding:10px}.access-grid{grid-template-columns:1fr}.access-stats{gap:6px}.access-stat{padding:8px}.access-stat b{font-size:16px}.access-card{padding:10px}.access-toolbar{display:grid;grid-template-columns:1fr 1fr}.access-table-wrap{overflow-x:auto}.access-table-wrap table{min-width:590px}}
`;
