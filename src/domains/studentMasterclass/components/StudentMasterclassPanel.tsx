import { useEffect, useMemo, useRef, useState } from "react";
import { Award, CheckCircle2, CircleAlert, X } from "lucide-react";

import { loadStudentMasterclassHistory } from "../services/StudentMasterclassService";
import type { StudentMasterclassRecord } from "../types/StudentMasterclassModels";

function formatMonth(value: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return "—";

  const match = /^(\d{4})-(\d{2})/.exec(raw);
  if (!match) return raw;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, 1);
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDate(value: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return "—";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw.slice(0, 10);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function rankLabel(rank: number | null) {
  if (!rank) return "—";
  if (rank === 1) return "1st";
  if (rank === 2) return "2nd";
  if (rank === 3) return "3rd";
  return `${rank}th`;
}

export default function StudentMasterclassPanel() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<StudentMasterclassRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const historyRequestRef = useRef(0);

  const sortedRows = useMemo(
    () =>
      [...rows].sort((a, b) => {
        const dateCompare = String(b.masterclassDate).localeCompare(String(a.masterclassDate));
        if (dateCompare !== 0) return dateCompare;
        return String(a.partnerName).localeCompare(String(b.partnerName));
      }),
    [rows],
  );

  async function loadHistory() {
    const requestId = ++historyRequestRef.current;
    setLoading(true);
    setError("");

    try {
      const nextRows = await loadStudentMasterclassHistory();
      if (requestId !== historyRequestRef.current) return;
      setRows(nextRows);
    } catch (err: any) {
      if (requestId !== historyRequestRef.current) return;
      setError(err?.message || "Unable to load your masterclass history.");
    } finally {
      if (requestId === historyRequestRef.current) {
        setLoading(false);
      }
    }
  }

  function openPanel() {
    setOpen(true);
    // Refresh on every open so a partner verification made after a prior
    // visit is visible immediately without requiring a full page reload.
    void loadHistory();
  }

  function closePanel() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <>
      <style>{`
        .student-masterclass-trigger{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          min-height:44px;
          padding:0 16px;
          border:1px solid #fed7aa;
          border-radius:12px;
          background:linear-gradient(135deg,#fff7ed,#ffffff);
          color:#c2410c;
          font-size:12px;
          font-weight:800;
          letter-spacing:.02em;
          box-shadow:0 2px 8px rgba(15,23,42,.05);
          cursor:pointer;
          transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease;
        }
        .student-masterclass-trigger:hover{
          transform:translateY(-1px);
          border-color:#fdba74;
          box-shadow:0 6px 16px rgba(15,23,42,.08);
        }
        .student-masterclass-trigger svg{width:17px;height:17px}
        .student-masterclass-toolbar{
          display:flex;
          justify-content:flex-end;
          margin-top:14px;
        }
        .student-masterclass-backdrop{
          position:fixed;
          inset:0;
          z-index:100000;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:24px;
          background:rgba(15,23,42,.54);
          backdrop-filter:blur(3px);
        }
        .student-masterclass-modal{
          width:min(1080px,96vw);
          max-height:min(88vh,900px);
          overflow:hidden;
          border:1px solid #e2e8f0;
          border-radius:24px;
          background:#fff;
          box-shadow:0 28px 80px rgba(15,23,42,.25);
          display:flex;
          flex-direction:column;
        }
        .student-masterclass-header{
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:18px;
          padding:22px 24px 18px;
          border-bottom:1px solid #e2e8f0;
          background:linear-gradient(135deg,#fff,#fffaf5);
        }
        .student-masterclass-heading{
          display:flex;
          align-items:flex-start;
          gap:12px;
        }
        .student-masterclass-heading-icon{
          display:flex;
          flex:0 0 auto;
          align-items:center;
          justify-content:center;
          width:40px;
          height:40px;
          border:1px solid #fed7aa;
          border-radius:12px;
          background:#fff7ed;
          color:#ea580c;
        }
        .student-masterclass-heading-icon svg{width:20px;height:20px}
        .student-masterclass-eyebrow{
          margin:0 0 5px;
          color:#ea580c;
          font-size:9px;
          font-weight:900;
          letter-spacing:.18em;
          text-transform:uppercase;
        }
        .student-masterclass-header h2{
          margin:0;
          color:#0f172a;
          font-size:22px;
          line-height:1.15;
          font-weight:900;
        }
        .student-masterclass-header p{
          margin:6px 0 0;
          color:#64748b;
          font-size:11px;
          line-height:1.5;
        }
        .student-masterclass-close{
          display:flex;
          flex:0 0 auto;
          align-items:center;
          justify-content:center;
          width:36px;
          height:36px;
          border:1px solid #cbd5e1;
          border-radius:10px;
          background:#fff;
          color:#64748b;
          cursor:pointer;
        }
        .student-masterclass-close:hover{border-color:#94a3b8;color:#0f172a}
        .student-masterclass-summary{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:12px;
          padding:13px 24px;
          border-bottom:1px solid #f1f5f9;
          background:#fafafa;
        }
        .student-masterclass-summary strong{color:#0f172a;font-size:12px}
        .student-masterclass-summary span{color:#64748b;font-size:10px}
        .student-masterclass-body{
          overflow:auto;
          padding:18px 24px 22px;
        }
        .student-masterclass-table-wrap{
          width:100%;
          overflow-x:auto;
          border:1px solid #e2e8f0;
          border-radius:14px;
        }
        .student-masterclass-table{
          width:100%;
          min-width:760px;
          border-collapse:collapse;
          background:#fff;
        }
        .student-masterclass-table th{
          padding:11px 12px;
          border-bottom:1px solid #e2e8f0;
          background:#f8fafc;
          color:#64748b;
          font-size:9px;
          font-weight:900;
          letter-spacing:.08em;
          text-align:left;
          text-transform:uppercase;
          white-space:nowrap;
        }
        .student-masterclass-table td{
          padding:13px 12px;
          border-bottom:1px solid #f1f5f9;
          color:#334155;
          font-size:11px;
          font-weight:600;
          vertical-align:middle;
        }
        .student-masterclass-table tbody tr:last-child td{border-bottom:0}
        .student-masterclass-table tbody tr:hover{background:#fffaf5}
        .student-masterclass-roll{color:#0f172a;font-weight:900}
        .student-masterclass-credit{color:#c2410c;font-weight:900}
        .student-masterclass-rank{
          display:inline-flex;
          min-width:42px;
          justify-content:center;
          padding:5px 8px;
          border:1px solid #fed7aa;
          border-radius:8px;
          background:#fff7ed;
          color:#c2410c;
          font-size:10px;
          font-weight:900;
        }
        .student-masterclass-empty,
        .student-masterclass-error{
          display:flex;
          min-height:180px;
          align-items:center;
          justify-content:center;
          flex-direction:column;
          gap:9px;
          padding:28px;
          border:1px dashed #cbd5e1;
          border-radius:14px;
          background:#f8fafc;
          text-align:center;
        }
        .student-masterclass-empty svg{color:#94a3b8}
        .student-masterclass-empty strong{color:#334155;font-size:13px}
        .student-masterclass-empty span{max-width:460px;color:#64748b;font-size:10px;line-height:1.5}
        .student-masterclass-error{border-color:#fecaca;background:#fff7f7}
        .student-masterclass-error svg{color:#dc2626}
        .student-masterclass-error strong{color:#991b1b;font-size:12px}
        .student-masterclass-error span{color:#b91c1c;font-size:10px}
        .student-masterclass-loading{
          display:flex;
          min-height:180px;
          align-items:center;
          justify-content:center;
          color:#c2410c;
          font-size:11px;
          font-weight:800;
        }
        @media(max-width:1024px){
          .student-masterclass-toolbar{margin-top:12px}
          .student-masterclass-backdrop{padding:18px}
          .student-masterclass-modal{width:min(94vw,980px);max-height:90vh;border-radius:20px}
          .student-masterclass-header{padding:18px 20px 15px}
          .student-masterclass-summary{padding:11px 20px}
          .student-masterclass-body{padding:15px 20px 18px}
        }
        @media(max-width:767px){
          .student-masterclass-toolbar{width:100%;justify-content:stretch}
          .student-masterclass-trigger{width:100%;min-height:40px;font-size:10px;border-radius:10px}
          .student-masterclass-backdrop{padding:8px;align-items:flex-end}
          .student-masterclass-modal{width:100%;max-height:94vh;border-radius:18px 18px 10px 10px}
          .student-masterclass-header{padding:14px 14px 12px;gap:10px}
          .student-masterclass-heading{gap:9px}
          .student-masterclass-heading-icon{width:34px;height:34px;border-radius:10px}
          .student-masterclass-heading-icon svg{width:17px;height:17px}
          .student-masterclass-eyebrow{font-size:7px;letter-spacing:.14em}
          .student-masterclass-header h2{font-size:17px}
          .student-masterclass-header p{font-size:9px;line-height:1.4}
          .student-masterclass-close{width:32px;height:32px;border-radius:9px}
          .student-masterclass-summary{padding:9px 14px;align-items:flex-start;flex-direction:column;gap:3px}
          .student-masterclass-summary strong{font-size:10px}
          .student-masterclass-summary span{font-size:8px}
          .student-masterclass-body{padding:12px 14px 15px}
          .student-masterclass-table{min-width:700px}
          .student-masterclass-table th{padding:9px 8px;font-size:7px}
          .student-masterclass-table td{padding:10px 8px;font-size:9px}
          .student-masterclass-rank{min-width:36px;padding:4px 6px;font-size:8px}
        }
      `}</style>

      <div className="student-masterclass-toolbar">
        <button
          type="button"
          className="student-masterclass-trigger"
          onClick={openPanel}
          aria-label="Open Masterclass history"
        >
          <Award />
          Masterclass
        </button>
      </div>

      {open && (
        <div
          className="student-masterclass-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePanel();
          }}
        >
          <section
            className="student-masterclass-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-masterclass-title"
          >
            <header className="student-masterclass-header">
              <div className="student-masterclass-heading">
                <div className="student-masterclass-heading-icon">
                  <Award />
                </div>
                <div>
                  <p className="student-masterclass-eyebrow">Opportunity Record</p>
                  <h2 id="student-masterclass-title">Masterclass History</h2>
                  <p>
                    Your masterclass opportunities recorded by Talent Passport partners.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="student-masterclass-close"
                onClick={closePanel}
                aria-label="Close Masterclass history"
              >
                <X size={19} />
              </button>
            </header>

            <div className="student-masterclass-summary">
              <strong>{sortedRows.length} masterclass {sortedRows.length === 1 ? "record" : "records"}</strong>
              <span>Only partner-verified opportunities linked to your student account are shown.</span>
            </div>

            <div className="student-masterclass-body">
              {loading ? (
                <div className="student-masterclass-loading">Loading your masterclass record...</div>
              ) : error ? (
                <div className="student-masterclass-error">
                  <CircleAlert size={22} />
                  <strong>Unable to load the masterclass record</strong>
                  <span>{error}</span>
                  <button
                    type="button"
                    className="student-masterclass-trigger"
                    onClick={() => void loadHistory()}
                  >
                    Try Again
                  </button>
                </div>
              ) : sortedRows.length === 0 ? (
                <div className="student-masterclass-empty">
                  <CheckCircle2 size={25} />
                  <strong>No masterclass record yet</strong>
                  <span>
                    When a partner verifies your Roll No. as a Student Star Performer and records the masterclass, the opportunity will appear here automatically.
                  </span>
                </div>
              ) : (
                <div className="student-masterclass-table-wrap">
                  <table className="student-masterclass-table">
                    <thead>
                      <tr>
                        <th>Roll No.</th>
                        <th>Month</th>
                        <th>Date of Masterclass</th>
                        <th>Partner Name</th>
                        <th>Credits Won</th>
                        <th>Rank out of 5</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRows.map((row) => (
                        <tr key={row.id}>
                          <td className="student-masterclass-roll">{row.rollNumber || "—"}</td>
                          <td>{formatMonth(row.month)}</td>
                          <td>{formatDate(row.masterclassDate)}</td>
                          <td>{row.partnerName || "Talent Partner"}</td>
                          <td className="student-masterclass-credit">{row.creditsWon == null ? "—" : row.creditsWon}</td>
                          <td>
                            <span className="student-masterclass-rank">
                              {rankLabel(row.rank)} / 5
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
