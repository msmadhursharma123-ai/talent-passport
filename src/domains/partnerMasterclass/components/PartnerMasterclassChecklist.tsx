import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  buildHistoryFilterOptions,
  filterPartnerMasterclassHistory,
  getPreviousCalendarMonthRange,
  loadPartnerMasterclassHistory,
  saveVerifiedStudent,
  verifyStudentForCurrentMasterclass,
} from "../services/PartnerMasterclassService";
import type {
  PartnerMasterclassHistoryFilters,
  PartnerMasterclassHistoryRow,
  PartnerMasterclassVerificationCandidate,
} from "../types/PartnerMasterclassModels";

const TODAY_KEY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

function formatVerifiedDate(value: string) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value).slice(0, 10);
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPeriodMonth(key: string) {
  if (!/^\d{4}-\d{2}$/.test(key)) return key;
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

const EMPTY_FILTERS: PartnerMasterclassHistoryFilters = {
  studentName: "",
  rollNumber: "",
  className: "ALL",
  schoolName: "ALL",
  month: "ALL",
  year: "ALL",
  timePeriod: "LAST_30_DAYS",
  customStart: TODAY_KEY,
  customEnd: TODAY_KEY,
};

export default function PartnerMasterclassChecklist() {
  const [open, setOpen] = useState(false);
  const [rollNumber, setRollNumber] = useState("");
  const [checking, setChecking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [candidates, setCandidates] = useState<PartnerMasterclassVerificationCandidate[]>([]);
  const [history, setHistory] = useState<PartnerMasterclassHistoryRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [filters, setFilters] = useState<PartnerMasterclassHistoryFilters>(EMPTY_FILTERS);
  const verificationRunRef = useRef(0);
  const historyRequestRef = useRef(0);

  const previousMonth = useMemo(() => getPreviousCalendarMonthRange(TODAY_KEY), []);

  const filterOptions = useMemo(
    () => buildHistoryFilterOptions(history),
    [history],
  );

  const visibleHistory = useMemo(
    () => filterPartnerMasterclassHistory(history, filters),
    [history, filters],
  );

  function closeChecklist() {
    verificationRunRef.current += 1;
    historyRequestRef.current += 1;
    setOpen(false);
    setRollNumber("");
    setChecking(false);
    setRecording(false);
    setVerificationMessage("");
    setVerificationError("");
    setCandidates([]);
  }

  async function loadHistory() {
    const requestId = ++historyRequestRef.current;
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const rows = await loadPartnerMasterclassHistory();
      if (requestId !== historyRequestRef.current) return;
      setHistory(rows);
    } catch (error: any) {
      if (requestId !== historyRequestRef.current) return;
      setHistoryError(error?.message ?? "Unable to load masterclass history.");
    } finally {
      if (requestId === historyRequestRef.current) setHistoryLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    void loadHistory();
  }, [open]);

  function resetVerification() {
    setVerificationMessage("");
    setVerificationError("");
    setCandidates([]);
  }

  async function verify() {
    const runId = ++verificationRunRef.current;
    setChecking(true);
    setRecording(false);
    setVerificationMessage("");
    setVerificationError("");
    setCandidates([]);

    try {
      const result = await verifyStudentForCurrentMasterclass(rollNumber);
      if (runId !== verificationRunRef.current) return;
      setCandidates(result.candidates);

      if (!result.verified) {
        setVerificationError(result.message);
        return;
      }

      if (result.candidates.length === 1) {
        setRecording(true);
        await saveVerifiedStudent(result.candidates[0]);
        if (runId !== verificationRunRef.current) return;
        setVerificationMessage(
          `${result.candidates[0].studentName} is verified and the masterclass entry has been recorded.`,
        );
        historyRequestRef.current += 1;
        await loadHistory();
        return;
      }

      setVerificationMessage(
        "This roll number is eligible, but it is used by more than one shortlisted student. Select the correct school below to record the visit.",
      );
    } catch (error: any) {
      if (runId !== verificationRunRef.current) return;
      setVerificationError(error?.message ?? "Unable to verify this roll number.");
    } finally {
      setChecking(false);
      setRecording(false);
    }
  }

  async function recordCandidate(candidate: PartnerMasterclassVerificationCandidate) {
    const runId = ++verificationRunRef.current;
    setRecording(true);
    setVerificationError("");
    try {
      await saveVerifiedStudent(candidate);
      if (runId !== verificationRunRef.current) return;
      setVerificationMessage(
        `${candidate.studentName} from ${candidate.schoolName} is verified and the masterclass entry has been recorded.`,
      );
      historyRequestRef.current += 1;
      await loadHistory();
    } catch (error: any) {
      if (runId !== verificationRunRef.current) return;
      setVerificationError(error?.message ?? "Unable to save the verification.");
    } finally {
      setRecording(false);
    }
  }

  function updateFilter<K extends keyof PartnerMasterclassHistoryFilters>(
    key: K,
    value: PartnerMasterclassHistoryFilters[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <button
        type="button"
        className="partner-masterclass-launch"
        onClick={() => setOpen(true)}
      >
        <span className="partner-masterclass-launch-icon">✓</span>
        <span>
          <strong>Masterclass Checklist</strong>
          <small>Verify eligible Star Performers & view attendance history</small>
        </span>
      </button>

      {open && createPortal(
        <div
          className="partner-masterclass-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeChecklist();
          }}
        >
          <section
            className="partner-masterclass-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-masterclass-title"
          >
            <div className="partner-masterclass-header">
              <div>
                <div className="partner-masterclass-eyebrow">MASTERCLASS ACCESS CONTROL</div>
                <h2 id="partner-masterclass-title">Student Masterclass Checklist</h2>
                <p>
                  Verify a student against the previous month's Student Star Performer top-five list before admitting them to the masterclass.
                </p>
              </div>
              <button
                type="button"
                className="partner-masterclass-close"
                onClick={closeChecklist}
                aria-label="Close checklist"
              >
                ×
              </button>
            </div>

            <div className="partner-masterclass-period">
              <span>Current eligibility period</span>
              <strong>{previousMonth.label}</strong>
              <small>{previousMonth.start} to {previousMonth.end}</small>
            </div>

            <div className="partner-masterclass-verify-card">
              <div className="partner-masterclass-card-heading">
                <div>
                  <span>01</span>
                  <div>
                    <h3>Verify Student</h3>
                    <p>Enter the roll number used when the student account was created.</p>
                  </div>
                </div>
              </div>

              <div className="partner-masterclass-verify-row">
                <label>
                  <span>Student Roll No.</span>
                  <input
                    value={rollNumber}
                    onChange={(event) => {
                      setRollNumber(event.target.value.toUpperCase());
                      resetVerification();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void verify();
                    }}
                    placeholder="Enter roll number"
                    autoComplete="off"
                  />
                </label>
                <button
                  type="button"
                  className="partner-masterclass-verify-button"
                  onClick={() => void verify()}
                  disabled={checking || recording || !rollNumber.trim()}
                >
                  {checking ? "VERIFYING…" : "VERIFY STUDENT"}
                </button>
              </div>

              {verificationError && (
                <div className="partner-masterclass-result danger">
                  <strong>Not verified</strong>
                  <span>{verificationError}</span>
                </div>
              )}

              {verificationMessage && !verificationError && (
                <div className="partner-masterclass-result success">
                  <strong>Verified</strong>
                  <span>{verificationMessage}</span>
                </div>
              )}

              {candidates.length > 1 && (
                <div className="partner-masterclass-candidate-list">
                  {candidates.map((candidate) => (
                    <div key={`${candidate.studentUuid}-${candidate.schoolUuid}`} className="partner-masterclass-candidate">
                      <div>
                        <strong>{candidate.studentName}</strong>
                        <span>
                          Roll {candidate.rollNumber} · {candidate.schoolName} · Class {candidate.className}{candidate.sectionName ? ` ${candidate.sectionName}` : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void recordCandidate(candidate)}
                        disabled={recording}
                      >
                        {recording ? "SAVING…" : "RECORD"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="partner-masterclass-history-card">
              <div className="partner-masterclass-history-heading">
                <div>
                  <span>02</span>
                  <div>
                    <h3>Masterclass Verification History</h3>
                    <p>Every successful checklist entry recorded by this partner.</p>
                  </div>
                </div>
                <div className="partner-masterclass-count">
                  {visibleHistory.length} record{visibleHistory.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="partner-masterclass-filters">
                <label>
                  <span>Student Name</span>
                  <input value={filters.studentName} onChange={(e) => updateFilter("studentName", e.target.value)} placeholder="Search student" />
                </label>
                <label>
                  <span>Roll No.</span>
                  <input value={filters.rollNumber} onChange={(e) => updateFilter("rollNumber", e.target.value.toUpperCase())} placeholder="Search roll no." />
                </label>
                <label>
                  <span>Class</span>
                  <select value={filters.className} onChange={(e) => updateFilter("className", e.target.value)}>
                    <option value="ALL">All classes</option>
                    {filterOptions.classes.map((item) => <option key={item} value={item}>Class {item}</option>)}
                  </select>
                </label>
                <label>
                  <span>School</span>
                  <select value={filters.schoolName} onChange={(e) => updateFilter("schoolName", e.target.value)}>
                    <option value="ALL">All schools</option>
                    {filterOptions.schools.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  <span>Month</span>
                  <select value={filters.month} onChange={(e) => updateFilter("month", e.target.value)}>
                    <option value="ALL">All months</option>
                    {filterOptions.months.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </label>
                <label>
                  <span>Academic Year</span>
                  <select value={filters.year} onChange={(e) => updateFilter("year", e.target.value)}>
                    <option value="ALL">All years</option>
                    {filterOptions.years.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  <span>Time Period</span>
                  <select value={filters.timePeriod} onChange={(e) => updateFilter("timePeriod", e.target.value as PartnerMasterclassHistoryFilters["timePeriod"]) }>
                    <option value="LAST_30_DAYS">Last 30 days</option>
                    <option value="LAST_60_DAYS">Last 60 days</option>
                    <option value="LAST_90_DAYS">Last 90 days</option>
                    <option value="CUSTOM">Custom selection</option>
                  </select>
                </label>
                {filters.timePeriod === "CUSTOM" && (
                  <>
                    <label>
                      <span>Start Date</span>
                      <input type="date" value={filters.customStart} onChange={(e) => updateFilter("customStart", e.target.value)} />
                    </label>
                    <label>
                      <span>End Date</span>
                      <input type="date" value={filters.customEnd} onChange={(e) => updateFilter("customEnd", e.target.value)} />
                    </label>
                  </>
                )}
              </div>

              <div className="partner-masterclass-table-note">
                <span>Verified entries</span>
                <span>{historyLoading ? "Loading…" : `${visibleHistory.length} shown`}</span>
              </div>

              {historyError && <div className="partner-masterclass-history-error">{historyError}</div>}

              <div className="partner-masterclass-table-wrap">
                <table className="partner-masterclass-table">
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Student Name</th>
                      <th>Verified Date</th>
                      <th>School</th>
                      <th>Parent Mobile</th>
                      <th>Parent Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading ? (
                      <tr><td colSpan={6} className="partner-masterclass-empty">Loading verification history…</td></tr>
                    ) : visibleHistory.length ? (
                      visibleHistory.map((row) => (
                        <tr key={row.id}>
                          <td><strong>{row.rollNumber || "—"}</strong></td>
                          <td>{row.studentName || "—"}</td>
                          <td>{formatVerifiedDate(row.verifiedAt)}</td>
                          <td>{row.schoolName || "—"}</td>
                          <td>{row.parentPhone || "—"}</td>
                          <td>{row.parentEmail || "—"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={6} className="partner-masterclass-empty">No masterclass verification records match the selected filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="partner-masterclass-footer">
              Eligibility is checked against the previous calendar month's Student Star Performer top five for the student's class + section. A successful verification is recorded once per partner, student and masterclass month.
            </div>
          </section>
        </div>,
        document.body,
      )}

      <style>{`
        .partner-masterclass-launch{display:inline-flex;align-items:center;gap:10px;border:1px solid #FED7AA;background:#FFFDF9;color:#0F172A;border-radius:12px;padding:10px 13px;cursor:pointer;box-shadow:0 4px 12px rgba(15,23,42,.05);text-align:left;}
        .partner-masterclass-launch:hover{border-color:#FDBA74;background:#FFF9F2;}
        .partner-masterclass-launch-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:#F97316;color:#fff;font-size:13px;font-weight:900;flex:0 0 auto;}
        .partner-masterclass-launch strong{display:block;font-size:10px;line-height:1.2;font-weight:900;letter-spacing:.2px;}
        .partner-masterclass-launch small{display:block;margin-top:3px;color:#64748B;font-size:8px;line-height:1.25;font-weight:700;}
        .partner-masterclass-backdrop{position:fixed;inset:0;z-index:2147483000;background:rgba(15,23,42,.48);display:flex;align-items:center;justify-content:center;padding:18px;}
        .partner-masterclass-modal{width:min(1280px,100%);max-height:94vh;overflow:auto;background:#F8FAFC;border:1px solid #CBD5E1;border-radius:20px;box-shadow:0 24px 70px rgba(15,23,42,.26);padding:16px;color:#0F172A;}
        .partner-masterclass-header{display:flex;justify-content:space-between;gap:16px;padding:17px 18px;background:#fff;border:1px solid #E2E8F0;border-radius:15px;}
        .partner-masterclass-eyebrow{color:#C2410C;font-size:8px;font-weight:900;letter-spacing:1.4px;}
        .partner-masterclass-header h2{margin:5px 0 0;font-size:22px;line-height:1.15;font-weight:900;letter-spacing:-.35px;}
        .partner-masterclass-header p{margin:6px 0 0;color:#64748B;font-size:10px;line-height:1.45;max-width:850px;}
        .partner-masterclass-close{width:32px;height:32px;flex:0 0 auto;border:1px solid #CBD5E1;border-radius:9px;background:#fff;color:#64748B;font-size:22px;line-height:1;cursor:pointer;}
        .partner-masterclass-period{display:flex;align-items:center;gap:8px;margin-top:9px;padding:9px 12px;border:1px solid #FED7AA;background:#FFF7ED;border-radius:11px;color:#9A3412;font-size:8px;font-weight:800;}
        .partner-masterclass-period strong{font-size:10px;}
        .partner-masterclass-period small{color:#C2410C;font-size:8px;}
        .partner-masterclass-verify-card,.partner-masterclass-history-card{margin-top:10px;background:#fff;border:1px solid #E2E8F0;border-radius:15px;padding:14px;}
        .partner-masterclass-card-heading,.partner-masterclass-history-heading{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:11px;}
        .partner-masterclass-card-heading>div:first-child,.partner-masterclass-history-heading>div:first-child{display:flex;align-items:center;gap:9px;}
        .partner-masterclass-card-heading>div:first-child>span,.partner-masterclass-history-heading>div:first-child>span{width:26px;height:26px;border-radius:8px;background:#FFF7ED;color:#C2410C;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:900;}
        .partner-masterclass-card-heading h3,.partner-masterclass-history-heading h3{margin:0;font-size:13px;font-weight:900;}
        .partner-masterclass-card-heading p,.partner-masterclass-history-heading p{margin:3px 0 0;color:#64748B;font-size:8.5px;line-height:1.35;}
        .partner-masterclass-verify-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px;align-items:end;}
        .partner-masterclass-verify-row label,.partner-masterclass-filters label{display:block;min-width:0;}
        .partner-masterclass-verify-row label>span,.partner-masterclass-filters label>span{display:block;margin:0 0 4px;color:#64748B;font-size:7px;font-weight:900;letter-spacing:.75px;text-transform:uppercase;}
        .partner-masterclass-verify-row input,.partner-masterclass-filters input,.partner-masterclass-filters select{width:100%;min-height:35px;box-sizing:border-box;border:1px solid #CBD5E1;border-radius:8px;background:#fff;color:#0F172A;padding:0 9px;font-size:10px;font-weight:750;outline:none;}
        .partner-masterclass-verify-row input:focus,.partner-masterclass-filters input:focus,.partner-masterclass-filters select:focus{border-color:#F97316;box-shadow:0 0 0 2px rgba(249,115,22,.08);}
        .partner-masterclass-verify-button{min-height:35px;border:0;border-radius:8px;background:#F97316;color:#fff;padding:0 14px;font-size:8px;font-weight:900;letter-spacing:.5px;cursor:pointer;}
        .partner-masterclass-verify-button:disabled{opacity:.5;cursor:not-allowed;}
        .partner-masterclass-result{display:flex;gap:7px;align-items:flex-start;margin-top:9px;padding:9px 10px;border-radius:9px;font-size:9px;line-height:1.35;}
        .partner-masterclass-result.success{background:#F0FDF4;border:1px solid #BBF7D0;color:#166534;}
        .partner-masterclass-result.danger{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;}
        .partner-masterclass-result strong{font-size:8px;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;}
        .partner-masterclass-candidate-list{display:grid;gap:6px;margin-top:9px;}
        .partner-masterclass-candidate{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 9px;border:1px solid #E2E8F0;border-radius:9px;background:#F8FAFC;}
        .partner-masterclass-candidate strong{display:block;font-size:9px;}
        .partner-masterclass-candidate span{display:block;margin-top:2px;color:#64748B;font-size:7.5px;}
        .partner-masterclass-candidate button{border:1px solid #FDBA74;border-radius:7px;background:#fff7ed;color:#C2410C;padding:6px 8px;font-size:7px;font-weight:900;cursor:pointer;}
        .partner-masterclass-history-heading{margin-bottom:10px;}
        .partner-masterclass-count{padding:5px 7px;border-radius:999px;background:#F1F5F9;color:#475569;font-size:7px;font-weight:900;white-space:nowrap;}
        .partner-masterclass-filters{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;padding:10px;border:1px solid #E2E8F0;border-radius:10px;background:#F8FAFC;}
        .partner-masterclass-table-note{display:flex;justify-content:space-between;margin:9px 2px 5px;color:#64748B;font-size:7.5px;font-weight:800;}
        .partner-masterclass-history-error{padding:8px 9px;margin-bottom:6px;border-radius:8px;background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;font-size:8px;}
        .partner-masterclass-table-wrap{width:100%;overflow-x:auto;border:1px solid #E2E8F0;border-radius:10px;-webkit-overflow-scrolling:touch;}
        .partner-masterclass-table{width:100%;min-width:820px;border-collapse:collapse;font-size:9px;background:#fff;}
        .partner-masterclass-table th{padding:8px 7px;text-align:left;background:#F8FAFC;border-bottom:1px solid #E2E8F0;color:#64748B;font-size:7px;font-weight:900;text-transform:uppercase;letter-spacing:.45px;white-space:nowrap;}
        .partner-masterclass-table td{padding:8px 7px;border-top:1px solid #F1F5F9;color:#334155;vertical-align:middle;white-space:nowrap;}
        .partner-masterclass-table tbody tr:first-child td{border-top:0;}
        .partner-masterclass-empty{padding:22px 10px!important;text-align:center;color:#64748B!important;font-size:8px!important;}
        .partner-masterclass-footer{margin-top:8px;padding:2px 2px 0;color:#64748B;font-size:7px;line-height:1.4;font-weight:700;}
        @media(max-width:1024px){
          .partner-masterclass-backdrop{padding:10px;}
          .partner-masterclass-modal{max-height:95vh;padding:10px;border-radius:15px;}
          .partner-masterclass-header{padding:12px;border-radius:12px;}
          .partner-masterclass-header h2{font-size:18px;}
          .partner-masterclass-filters{grid-template-columns:repeat(3,minmax(0,1fr));}
          .partner-masterclass-table{min-width:820px;}
        }
        @media(max-width:600px){
          .partner-masterclass-launch{width:100%;box-sizing:border-box;padding:8px 9px;border-radius:9px;}
          .partner-masterclass-launch-icon{width:24px;height:24px;font-size:11px;}
          .partner-masterclass-launch strong{font-size:8px;}
          .partner-masterclass-launch small{font-size:6.5px;}
          .partner-masterclass-backdrop{padding:0;align-items:stretch;}
          .partner-masterclass-modal{width:100%;max-height:100vh;border-radius:0;padding:7px;border:0;}
          .partner-masterclass-header{padding:9px;border-radius:10px;gap:8px;}
          .partner-masterclass-eyebrow{font-size:6px;letter-spacing:1px;}
          .partner-masterclass-header h2{font-size:15px;}
          .partner-masterclass-header p{font-size:7px;}
          .partner-masterclass-close{width:27px;height:27px;font-size:19px;}
          .partner-masterclass-period{padding:7px 8px;font-size:6.5px;flex-wrap:wrap;gap:5px;}
          .partner-masterclass-period strong{font-size:8px;}
          .partner-masterclass-period small{font-size:6.5px;}
          .partner-masterclass-verify-card,.partner-masterclass-history-card{padding:8px;border-radius:10px;}
          .partner-masterclass-card-heading,.partner-masterclass-history-heading{margin-bottom:8px;}
          .partner-masterclass-card-heading h3,.partner-masterclass-history-heading h3{font-size:10px;}
          .partner-masterclass-card-heading p,.partner-masterclass-history-heading p{font-size:6.5px;}
          .partner-masterclass-verify-row{grid-template-columns:1fr;gap:6px;}
          .partner-masterclass-verify-row label>span,.partner-masterclass-filters label>span{font-size:5.8px;}
          .partner-masterclass-verify-row input,.partner-masterclass-filters input,.partner-masterclass-filters select{min-height:30px;padding:0 6px;font-size:8px;border-radius:7px;}
          .partner-masterclass-verify-button{width:100%;min-height:30px;font-size:7px;}
          .partner-masterclass-result{font-size:7.5px;padding:7px 8px;}
          .partner-masterclass-filters{grid-template-columns:1fr 1fr;gap:5px;padding:7px;}
          .partner-masterclass-table{min-width:820px;font-size:7px;}
          .partner-masterclass-table th{padding:6px 5px;font-size:5.8px;}
          .partner-masterclass-table td{padding:6px 5px;}
          .partner-masterclass-footer{font-size:6px;}
        }
      `}</style>
    </>
  );
}
