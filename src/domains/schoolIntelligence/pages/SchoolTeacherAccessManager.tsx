import { useEffect, useMemo, useState } from "react";
import { getCurrentSchool } from "../../../services/identityService";
import {
  getSchoolTeacherRosterForSchoolAdmin,
  replaceSchoolTeacherAllowlistForSchoolAdmin,
  type SchoolTeacherAllowlistEntry,
} from "../../../data/schoolTeacherAllowlistRepository";

interface Props {
  onClose: () => void;
}

export default function SchoolTeacherAccessManager({ onClose }: Props) {
  const [schoolUuid, setSchoolUuid] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [emails, setEmails] = useState<string[]>([""]);
  const [roster, setRoster] = useState<SchoolTeacherAllowlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const identity = getCurrentSchool();
      if (!identity?.schoolUuid) {
        throw new Error("School identity could not be resolved.");
      }

      setSchoolUuid(identity.schoolUuid);
      setSchoolName(identity.schoolName ?? "Your School");

      const rows = await getSchoolTeacherRosterForSchoolAdmin(identity.schoolUuid);
      setRoster(rows);
      setEmails(rows.length ? rows.map(row => row.email) : [""]);
    } catch (e: any) {
      setError(e?.message ?? "Unable to load teacher access.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const validEmails = useMemo(
    () =>
      Array.from(
        new Set(
          emails
            .map(email => email.trim().toLowerCase())
            .filter(Boolean)
        )
      ),
    [emails]
  );

  const invalidEmail = validEmails.find(
    email => !/^\S+@\S+\.\S+$/.test(email)
  );

  function updateEmail(index: number, value: string) {
    setEmails(current =>
      current.map((email, emailIndex) =>
        emailIndex === index ? value : email
      )
    );
  }

  function addRow() {
    setEmails(current => [...current, ""]);
  }

  function removeRow(index: number) {
    setEmails(current => {
      const next = current.filter((_, emailIndex) => emailIndex !== index);
      return next.length ? next : [""];
    });
  }

  async function save() {
    if (!schoolUuid) return;
    if (invalidEmail) {
      setError(`Please enter a valid teacher email: ${invalidEmail}`);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const ok = await replaceSchoolTeacherAllowlistForSchoolAdmin(
        schoolUuid,
        validEmails
      );

      if (!ok) {
        throw new Error("Unable to update the approved teacher list.");
      }

      await load();
    } catch (e: any) {
      setError(e?.message ?? "Unable to update teacher access.");
    } finally {
      setSaving(false);
    }
  }

  const registeredCount = roster.filter(row => row.registered).length;

  return (
    <div className="school-teacher-access-overlay">
      <style>{`
        .school-teacher-access-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          overflow-y: auto;
          background: rgba(7, 20, 45, .38);
          backdrop-filter: blur(4px);
          padding: 18px;
          box-sizing: border-box;
        }
        .school-teacher-access-panel {
          width: min(980px, 100%);
          margin: 0 auto;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 22px;
          box-shadow: 0 24px 70px rgba(15,23,42,.18);
          overflow: hidden;
        }
        .school-teacher-access-head {
          display:flex;
          justify-content:space-between;
          gap:16px;
          align-items:flex-start;
          padding:18px 20px;
          background:linear-gradient(135deg,#F8FAFC,#FFFFFF);
          border-bottom:1px solid #E2E8F0;
        }
        .school-teacher-access-eyebrow {
          margin:0 0 5px;
          color:#EA580C;
          font-size:9px;
          font-weight:900;
          letter-spacing:.16em;
          text-transform:uppercase;
        }
        .school-teacher-access-title {
          margin:0;
          color:#143B73;
          font-size:20px;
          font-weight:900;
          line-height:1.15;
        }
        .school-teacher-access-copy {
          margin:5px 0 0;
          color:#64748B;
          font-size:11px;
          line-height:1.45;
          max-width:640px;
        }
        .school-teacher-access-close {
          border:1px solid #CBD5E1;
          background:#fff;
          color:#334155;
          border-radius:10px;
          padding:8px 11px;
          font-size:11px;
          font-weight:900;
          cursor:pointer;
          flex-shrink:0;
        }
        .school-teacher-access-body { padding:18px 20px 22px; }
        .school-teacher-access-stats {
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:10px;
          margin-bottom:14px;
        }
        .school-teacher-access-stat {
          border:1px solid #E2E8F0;
          border-radius:14px;
          background:#F8FAFC;
          padding:11px 12px;
        }
        .school-teacher-access-stat-label { color:#64748B; font-size:9px; font-weight:900; text-transform:uppercase; letter-spacing:.08em; }
        .school-teacher-access-stat-value { margin-top:3px; color:#143B73; font-size:20px; font-weight:900; }
        .school-teacher-access-grid {
          display:grid;
          grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);
          gap:14px;
        }
        .school-teacher-access-card {
          border:1px solid #E2E8F0;
          border-radius:16px;
          background:#fff;
          padding:14px;
          min-width:0;
        }
        .school-teacher-access-card h3 { margin:0; color:#143B73; font-size:14px; font-weight:900; }
        .school-teacher-access-card p { margin:4px 0 12px; color:#64748B; font-size:10px; line-height:1.45; }
        .school-teacher-email-row { display:flex; gap:7px; align-items:center; margin-bottom:7px; }
        .school-teacher-email-number { width:22px; flex:0 0 22px; color:#94A3B8; font-size:9px; font-weight:900; text-align:right; }
        .school-teacher-email-input {
          width:100%; min-width:0; box-sizing:border-box;
          border:1px solid #CBD5E1; border-radius:9px; padding:9px 10px;
          font-size:11px; color:#0F172A; outline:none; background:#fff;
        }
        .school-teacher-email-remove { border:0; background:#FEF2F2; color:#DC2626; border-radius:8px; width:29px; height:29px; cursor:pointer; font-weight:900; }
        .school-teacher-add { border:1px dashed #FDBA74; background:#FFF7ED; color:#EA580C; border-radius:9px; padding:8px 10px; font-size:10px; font-weight:900; cursor:pointer; }
        .school-teacher-save { border:0; background:#143B73; color:#fff; border-radius:10px; padding:10px 14px; font-size:11px; font-weight:900; cursor:pointer; }
        .school-teacher-save:disabled { opacity:.55; cursor:not-allowed; }
        .school-teacher-access-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
        .school-teacher-roster-row { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:8px; padding:9px 0; border-bottom:1px solid #F1F5F9; align-items:center; }
        .school-teacher-roster-email { min-width:0; color:#334155; font-size:10px; font-weight:800; overflow-wrap:anywhere; }
        .school-teacher-roster-status { border-radius:999px; padding:4px 7px; font-size:8px; font-weight:900; white-space:nowrap; }
        .school-teacher-roster-status.registered { background:#ECFDF5; color:#047857; }
        .school-teacher-roster-status.pending { background:#FFF7ED; color:#C2410C; }
        .school-teacher-error { margin-bottom:12px; padding:9px 10px; border:1px solid #FECACA; border-radius:10px; background:#FEF2F2; color:#B91C1C; font-size:10px; font-weight:800; }
        .school-teacher-loading { padding:24px; text-align:center; color:#64748B; font-size:11px; font-weight:800; }
        @media (max-width: 720px) {
          .school-teacher-access-overlay { padding:10px; }
          .school-teacher-access-panel { border-radius:16px; }
          .school-teacher-access-head { padding:14px; }
          .school-teacher-access-title { font-size:17px; }
          .school-teacher-access-copy { font-size:9px; }
          .school-teacher-access-body { padding:12px; }
          .school-teacher-access-stats { gap:7px; }
          .school-teacher-access-stat { padding:9px; }
          .school-teacher-access-stat-value { font-size:17px; }
          .school-teacher-access-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="school-teacher-access-panel">
        <div className="school-teacher-access-head">
          <div>
            <p className="school-teacher-access-eyebrow">Teacher Access Control</p>
            <h2 className="school-teacher-access-title">Approve Teacher Accounts</h2>
            <p className="school-teacher-access-copy">
              {schoolName} controls which teacher email addresses may create a Teacher Portal account.
              Only approved emails can begin teacher onboarding for this school.
            </p>
          </div>
          <button className="school-teacher-access-close" type="button" onClick={onClose}>Close</button>
        </div>

        <div className="school-teacher-access-body">
          {error && <div className="school-teacher-error">{error}</div>}

          {loading ? (
            <div className="school-teacher-loading">Loading your approved teacher roster…</div>
          ) : (
            <>
              <div className="school-teacher-access-stats">
                <div className="school-teacher-access-stat">
                  <div className="school-teacher-access-stat-label">Approved Emails</div>
                  <div className="school-teacher-access-stat-value">{validEmails.length}</div>
                </div>
                <div className="school-teacher-access-stat">
                  <div className="school-teacher-access-stat-label">Registered</div>
                  <div className="school-teacher-access-stat-value">{registeredCount}</div>
                </div>
                <div className="school-teacher-access-stat">
                  <div className="school-teacher-access-stat-label">Pending</div>
                  <div className="school-teacher-access-stat-value">{Math.max(validEmails.length - registeredCount, 0)}</div>
                </div>
              </div>

              <div className="school-teacher-access-grid">
                <section className="school-teacher-access-card">
                  <h3>Approved Teacher Emails</h3>
                  <p>Add every teacher email that belongs to your school. Saving this list replaces the previous approval list.</p>

                  {emails.map((email, index) => (
                    <div className="school-teacher-email-row" key={`${index}-${email}`}>
                      <div className="school-teacher-email-number">{index + 1}</div>
                      <input
                        className="school-teacher-email-input"
                        type="email"
                        value={email}
                        placeholder="teacher@school.com"
                        onChange={event => updateEmail(index, event.target.value)}
                      />
                      <button className="school-teacher-email-remove" type="button" onClick={() => removeRow(index)} aria-label="Remove email">×</button>
                    </div>
                  ))}

                  <button className="school-teacher-add" type="button" onClick={addRow}>+ Add Teacher Email</button>
                  <div className="school-teacher-access-actions">
                    <button className="school-teacher-save" type="button" disabled={saving} onClick={() => void save()}>
                      {saving ? "Saving…" : "Save Approved Teachers"}
                    </button>
                  </div>
                </section>

                <section className="school-teacher-access-card">
                  <h3>Teacher Registration Status</h3>
                  <p>Registered teachers have completed the account/profile checkpoint. Pending teachers are approved but have not registered yet.</p>
                  {roster.length === 0 ? (
                    <div className="school-teacher-loading">No teacher emails approved yet.</div>
                  ) : (
                    roster.map(row => (
                      <div className="school-teacher-roster-row" key={row.id ?? row.email}>
                        <div className="school-teacher-roster-email">{row.email}</div>
                        <span className={`school-teacher-roster-status ${row.registered ? "registered" : "pending"}`}>
                          {row.registered ? "REGISTERED" : "PENDING"}
                        </span>
                      </div>
                    ))
                  )}
                </section>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
