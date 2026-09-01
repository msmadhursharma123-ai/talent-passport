import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentTeacher, requireSchoolIdentity } from "../../../services/identityService";
import { calculateStudentStarPerformers } from "../services/StudentStarPerformerService";
import type {
  StudentStarPerformerResult,
  StudentStarPerformerTimeline,
} from "../types/StudentStarPerformerModels";

type PortalTheme = "school" | "teacher";

const TODAY_KEY = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(key: string) {
  if (!key) return "—";
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(key: string) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function subtractDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function toKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function monthBounds(monthKey: string, todayKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const today = parseDateKey(todayKey);
  const end = last > today ? today : last;
  return { start: toKey(start), end: toKey(end) };
}

function getSchoolUuid() {
  const teacher = getCurrentTeacher();
  if (teacher?.schoolUuid) return String(teacher.schoolUuid);
  const school = requireSchoolIdentity();
  return String(school?.schoolUuid ?? "").trim();
}

function todayMonthKey() {
  return TODAY_KEY().slice(0, 7);
}

function buildMonthOptions() {
  const today = parseDateKey(TODAY_KEY());
  const options: string[] = [];
  for (let offset = 0; offset < 24; offset += 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    options.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }
  return options;
}

function getRange(
  timeline: StudentStarPerformerTimeline,
  monthKey: string,
  customStart: string,
  customEnd: string,
) {
  const today = TODAY_KEY();

  if (timeline === "MONTH") {
    return monthBounds(monthKey, today);
  }

  if (timeline === "CUSTOM") {
    const start = customStart || today;
    const end = customEnd || today;
    return start <= end ? { start, end } : { start: end, end: start };
  }

  const days = timeline === "LAST_30_DAYS"
    ? 29
    : timeline === "LAST_60_DAYS"
      ? 59
      : timeline === "LAST_90_DAYS"
        ? 89
        : 119;

  return { start: toKey(subtractDays(parseDateKey(today), days)), end: today };
}

export default function StudentStarPerformersPanel({
  portalTheme,
}: {
  portalTheme: PortalTheme;
}) {
  const [open, setOpen] = useState(false);
  const [monthKey, setMonthKey] = useState(todayMonthKey());
  const [timeline, setTimeline] = useState<StudentStarPerformerTimeline>("MONTH");
  const [classroomFilter, setClassroomFilter] = useState("ALL");
  const [customStart, setCustomStart] = useState(TODAY_KEY());
  const [customEnd, setCustomEnd] = useState(TODAY_KEY());
  const [result, setResult] = useState<StudentStarPerformerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const months = useMemo(buildMonthOptions, []);
  const schoolUuid = useMemo(() => getSchoolUuid(), []);

  const load = useCallback(async () => {
    if (!open) return;
    const range = getRange(timeline, monthKey, customStart, customEnd);
    setLoading(true);
    setError("");

    try {
      const next = await calculateStudentStarPerformers({
        startDate: range.start,
        endDate: range.end,
        classroomFilter,
        asOfDate: TODAY_KEY(),
      });
      setResult(next);
    } catch (err: any) {
      setError(err?.message ?? "Unable to load Student Star Performer data.");
    } finally {
      setLoading(false);
    }
  }, [open, timeline, monthKey, customStart, customEnd, classroomFilter, refreshTick]);

  useEffect(() => {
    void load();
  }, [load]);

  // Recalculate frequently while the popup is open so a newly submitted
  // Daily Feedback response is reflected without touching the existing pages.
  useEffect(() => {
    if (!open) return;
    const interval = window.setInterval(() => setRefreshTick(value => value + 1), 8000);
    return () => window.clearInterval(interval);
  }, [open]);

  // Also react immediately to Supabase Daily Feedback INSERT/UPDATE/DELETE
  // events when Realtime is enabled for the table. Polling remains the safe
  // fallback and also covers the time-based missed-feedback transition.
  useEffect(() => {
    if (!open || !schoolUuid) return;
    const supabase = getSupabaseClient() as any;
    if (!supabase?.channel) return;

    const channel = supabase
      .channel(`student-star-performers-${schoolUuid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_daily_feedback", filter: `school_uuid=eq.${schoolUuid}` },
        () => setRefreshTick(value => value + 1),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [open, schoolUuid]);

  const rangeLabel = result
    ? `${formatDate(result.startDate)} – ${formatDate(result.endDate)}`
    : "";

  const theme = portalTheme === "school" ? {
    accent: "#ff6508",
    navy: "#0b1f3a",
    bg: "#f5f7fa",
    header: "#0b1f3a",
    buttonText: "#ffffff",
    soft: "#fff3e9",
    softText: "#e85400",
  } : {
    accent: "#F97316",
    navy: "#0F172A",
    bg: "#F6F6F3",
    header: "#FFF7ED",
    buttonText: "#FFFFFF",
    soft: "#FFF7ED",
    softText: "#C2410C",
  };

  return (
    <>
      <section className={`student-sp-launch ${portalTheme}`}>
        <div>
          <p className="student-sp-eyebrow">Academic Recognition</p>
          <h2 className="student-sp-launch-title">Student Star Performers</h2>
          <p className="student-sp-launch-copy">
            View the top two Daily Feedback credit holders in every class and section.
          </p>
        </div>
        <button
          type="button"
          className="student-sp-open"
          onClick={() => setOpen(true)}
        >
          Students Star Performer Data
        </button>
      </section>

      {open && (
        <div className="student-sp-modal-backdrop" role="presentation" onMouseDown={event => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <section
            className="student-sp-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-star-performer-title"
            style={{ "--student-sp-accent": theme.accent, "--student-sp-navy": theme.navy, "--student-sp-bg": theme.bg } as CSSProperties}
          >
            <div className="student-sp-modal-head">
              <div>
                <p className="student-sp-eyebrow">Daily Feedback · Live Academic Scorecard</p>
                <h2 id="student-star-performer-title">Student Star Performers</h2>
                <p>
                  Top two students per class + section, using Daily Feedback credits only.
                </p>
              </div>
              <button type="button" className="student-sp-close" onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>

            <div className="student-sp-filters">
              <label>
                <span>Month</span>
                <select value={monthKey} onChange={event => setMonthKey(event.target.value)} disabled={timeline !== "MONTH"}>
                  {months.map(key => <option key={key} value={key}>{formatMonth(key)}</option>)}
                </select>
              </label>

              <label>
                <span>Class + Section</span>
                <select value={classroomFilter} onChange={event => setClassroomFilter(event.target.value)}>
                  <option value="ALL">All classes + sections</option>
                  {(result?.classrooms ?? []).map(classroom => (
                    <option key={classroom.key} value={classroom.key}>{classroom.label}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Timeline</span>
                <select value={timeline} onChange={event => setTimeline(event.target.value as StudentStarPerformerTimeline)}>
                  <option value="MONTH">Selected calendar month</option>
                  <option value="LAST_30_DAYS">Last 30 days</option>
                  <option value="LAST_60_DAYS">Last 60 days</option>
                  <option value="LAST_90_DAYS">Last 90 days</option>
                  <option value="LAST_120_DAYS">Last 120 days</option>
                  <option value="CUSTOM">Custom date</option>
                </select>
              </label>

              {timeline === "CUSTOM" && (
                <>
                  <label>
                    <span>Start date</span>
                    <input type="date" value={customStart} onChange={event => setCustomStart(event.target.value)} />
                  </label>
                  <label>
                    <span>End date</span>
                    <input type="date" value={customEnd} onChange={event => setCustomEnd(event.target.value)} />
                  </label>
                </>
              )}
            </div>

            <div className="student-sp-livebar">
              <span>{rangeLabel || "Calculating selected period…"}</span>
              <span className="student-sp-live-pill">{loading ? "CALCULATING" : "LIVE"}</span>
            </div>

            <p className="student-sp-swipe">Swipe left or right to see the full scorecard</p>

            <div className="student-sp-table-wrap">
              <table className="student-sp-table">
                <thead>
                  <tr>
                    <th>Class + Section</th>
                    <th>Rank</th>
                    <th>Student</th>
                    <th>Daily Feedback Credits</th>
                    <th>Submitted</th>
                    <th>Missed</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !result ? (
                    <tr><td colSpan={6} className="student-sp-empty">Calculating live Daily Feedback scorecard…</td></tr>
                  ) : error ? (
                    <tr><td colSpan={6} className="student-sp-empty">{error}</td></tr>
                  ) : result?.rows.length ? (
                    result.rows.map(row => (
                      <tr key={`${row.className}-${row.sectionName}-${row.studentUuid}`}>
                        <td><strong>{row.className}</strong>{row.sectionName ? ` ${row.sectionName}` : ""}</td>
                        <td><span className={`student-sp-rank rank-${row.rank}`}>#{row.rank}</span></td>
                        <td><strong>{row.studentName}</strong></td>
                        <td><span className="student-sp-credit">{row.dailyFeedbackCredits}</span></td>
                        <td>{row.submittedFeedbackCount}</td>
                        <td>{row.missedFeedbackCount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="student-sp-empty">No Daily Feedback credit activity matches the selected filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="student-sp-footer">
              <span>
                Daily Feedback only: <b>+1</b> for each submitted teacher-log feedback and <b>-10</b> for each missed teacher-log feedback after the day is complete. No competition, portfolio, achievement, consultation or other wallet credits are included.
              </span>
              <span>{result ? `${result.studentCount} students evaluated` : ""}</span>
            </div>
          </section>
        </div>
      )}

      <style>{`
        .student-sp-launch { display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px;border:1px solid #E5E7EB;border-radius:16px;background:#fff;box-shadow:0 6px 18px rgba(15,23,42,.035);margin-top:12px;min-width:0; }
        .student-sp-launch.school { border-color:#dce4ee; }
        .student-sp-launch.teacher { border-color:#E5E7EB; }
        .student-sp-eyebrow { margin:0;color:var(--student-sp-accent,#F97316);font-size:9px;font-weight:900;letter-spacing:1px;text-transform:uppercase; }
        .student-sp-launch-title { margin:4px 0 0;color:var(--student-sp-navy,#0F172A);font-size:18px;font-weight:900;letter-spacing:-.2px; }
        .student-sp-launch-copy { margin:4px 0 0;color:#64748B;font-size:10.5px;line-height:1.4; }
        .student-sp-open { flex:0 0 auto;border:0;border-radius:10px;padding:9px 12px;background:${theme.accent};color:${theme.buttonText};font-size:10px;font-weight:900;cursor:pointer;box-shadow:0 5px 14px rgba(15,23,42,.09); }
        .student-sp-modal-backdrop { position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.48);display:flex;align-items:center;justify-content:center;padding:18px; }
        .student-sp-modal { width:min(1120px,100%);max-height:min(92vh,900px);overflow:auto;background:var(--student-sp-bg,#F6F6F3);border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 24px 70px rgba(15,23,42,.25);padding:16px; }
        .student-sp-modal-head { display:flex;justify-content:space-between;gap:12px;padding:16px;border:1px solid #E5E7EB;border-radius:16px;background:#fff; }
        .student-sp-modal-head h2 { margin:4px 0 0;color:var(--student-sp-navy,#0F172A);font-size:25px;line-height:1.1;font-weight:900; }
        .student-sp-modal-head p:last-child { margin:6px 0 0;color:#64748B;font-size:11px;line-height:1.4; }
        .student-sp-close { flex:0 0 auto;width:34px;height:34px;border:1px solid #E2E8F0;border-radius:10px;background:#fff;color:#64748B;font-size:24px;line-height:1;cursor:pointer; }
        .student-sp-filters { display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px;padding:11px;border:1px solid #E5E7EB;border-radius:15px;background:#fff; }
        .student-sp-filters label { min-width:0; }
        .student-sp-filters span { display:block;margin:0 0 4px;color:#94A3B8;font-size:8px;font-weight:900;letter-spacing:.8px;text-transform:uppercase; }
        .student-sp-filters select,.student-sp-filters input { width:100%;min-height:36px;border:1px solid #D8DEE8;border-radius:9px;background:#fff;color:#334155;padding:0 9px;font-size:10.5px;font-weight:800;outline:none; }
        .student-sp-livebar { display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:8px;padding:8px 10px;color:#64748B;font-size:9px;font-weight:800; }
        .student-sp-live-pill { padding:4px 7px;border-radius:999px;background:${theme.soft};color:${theme.softText};font-size:7.5px;font-weight:900;letter-spacing:.6px; }
        .student-sp-swipe { display:none;margin:0 0 5px;color:#64748B;font-size:8px;font-weight:750; }
        .student-sp-table-wrap { width:100%;overflow-x:auto;overflow-y:hidden;border:1px solid #E2E8F0;border-radius:13px;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y;background:#fff; }
        .student-sp-table { width:100%;min-width:760px;border-collapse:collapse;font-size:10.5px; }
        .student-sp-table th { background:${theme.header};color:${portalTheme === "school" ? "#fff" : theme.softText};padding:9px 8px;text-align:left;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.45px;white-space:nowrap; }
        .student-sp-table td { padding:9px 8px;border-top:1px solid #EEF2F7;color:#334155;vertical-align:middle; }
        .student-sp-table tbody tr:first-child td { border-top:0; }
        .student-sp-rank { display:inline-flex;min-width:32px;justify-content:center;padding:4px 6px;border-radius:8px;background:#F8FAFC;color:#64748B;font-size:9px;font-weight:950; }
        .student-sp-rank.rank-1 { background:#FFF7ED;color:#C2410C; }
        .student-sp-rank.rank-2 { background:#EFF6FF;color:#2563EB; }
        .student-sp-credit { display:inline-flex;min-width:52px;justify-content:center;padding:5px 7px;border-radius:8px;background:${theme.soft};color:${theme.softText};font-size:12px;font-weight:950;font-variant-numeric:tabular-nums; }
        .student-sp-empty { padding:24px 12px!important;text-align:center;color:#64748B;font-size:10px;font-weight:750; }
        .student-sp-footer { display:flex;justify-content:space-between;gap:12px;margin-top:8px;padding:8px 2px;color:#64748B;font-size:8px;line-height:1.45;font-weight:700; }
        @media(max-width:1024px){ .student-sp-launch { padding:11px 12px; }.student-sp-modal-backdrop{padding:10px}.student-sp-modal{padding:10px;border-radius:15px;max-height:95vh}.student-sp-modal-head{padding:12px}.student-sp-modal-head h2{font-size:21px}.student-sp-filters{grid-template-columns:repeat(3,minmax(0,1fr));padding:9px}.student-sp-swipe{display:block}.student-sp-table{min-width:760px} }
        @media(max-width:600px){ .student-sp-launch{align-items:flex-start;flex-direction:column;padding:9px 10px;border-radius:11px;margin-top:8px}.student-sp-launch-title{font-size:14px}.student-sp-launch-copy{font-size:8px}.student-sp-open{width:100%;padding:8px 9px;font-size:8px}.student-sp-modal-backdrop{padding:0;align-items:stretch}.student-sp-modal{width:100%;max-height:100vh;border-radius:0;padding:7px;border:0}.student-sp-modal-head{padding:9px;border-radius:11px}.student-sp-modal-head h2{font-size:16px}.student-sp-modal-head p:last-child{font-size:8px}.student-sp-close{width:28px;height:28px;font-size:20px}.student-sp-filters{grid-template-columns:1fr 1fr;padding:7px;border-radius:10px;gap:6px}.student-sp-filters span{font-size:6.5px;margin-bottom:3px}.student-sp-filters select,.student-sp-filters input{min-height:31px;padding:0 6px;font-size:8px;border-radius:7px}.student-sp-livebar{font-size:7.5px;padding:6px 2px}.student-sp-table{min-width:760px;font-size:8px}.student-sp-table th{padding:6px 5px;font-size:6.5px}.student-sp-table td{padding:6px 5px}.student-sp-rank{min-width:27px;padding:3px 5px;font-size:7.5px}.student-sp-credit{min-width:43px;padding:4px 5px;font-size:10px}.student-sp-empty{padding:18px 8px!important;font-size:8px}.student-sp-footer{font-size:6.8px;flex-direction:column;gap:3px}.student-sp-swipe{font-size:6.8px} }
      `}</style>
    </>
  );
}
