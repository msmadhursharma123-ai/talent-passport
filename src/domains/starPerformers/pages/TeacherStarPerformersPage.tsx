import { useEffect, useMemo, useState } from "react";
import { loadStarPerformerViewModel } from "../viewmodels/StarPerformerViewModel";
import type { StarPerformerPeriod, StarPerformerRow } from "../types/StarPerformerModels";

import StudentStarPerformersPanel from "../components/StudentStarPerformersPanel";

const todayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function tone(score: number | null) {
  if (score == null) return "tp-sp-muted";
  if (score >= 90) return "tp-sp-green";
  if (score >= 75) return "tp-sp-blue";
  if (score >= 60) return "tp-sp-orange";
  return "tp-sp-red";
}

export default function TeacherStarPerformersPage() {
  const year = Number(todayKey.slice(0, 4));
  const [tab, setTab] = useState<"week" | "month">("week");
  const [periods, setPeriods] = useState<StarPerformerPeriod[]>([]);
  const [rows, setRows] = useState<StarPerformerRow[]>([]);
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [weekFilter, setWeekFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const viewModel = await loadStarPerformerViewModel(year);

        if (cancelled) return;
        setPeriods(viewModel.periods);
        setRows(viewModel.rows);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Unable to load Star Performers.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [year]);

  const months = useMemo(
    () => periods.filter(period => period.periodType === "month"),
    [periods]
  );

  const weeks = useMemo(
    () => periods.filter(period => period.periodType === "week"),
    [periods]
  );

  const visibleWeeks = useMemo(
    () =>
      monthFilter === "ALL"
        ? weeks
        : weeks.filter(week => {
          const month = periods.find(
            period => period.periodType === "month" && period.periodKey === monthFilter
          );
          return Boolean(
            month &&
            week.endDate >= month.startDate &&
            week.startDate <= month.endDate
          );
        }),
    [weeks, monthFilter]
  );

  const visibleRows = useMemo(() => {
    const rowMap = new Map(rows.map(row => [`${row.periodType}:${row.periodKey}`, row]));

    if (tab === "week") {
      const selected =
        weekFilter === "ALL"
          ? visibleWeeks.filter(week => week.isComplete)
          : visibleWeeks.filter(week => week.periodKey === weekFilter);

      return selected.map(period => ({
        period,
        row: rowMap.get(`week:${period.periodKey}`) ?? null,
      }));
    }

    const selected =
      monthFilter === "ALL"
        ? months.filter(month => month.isComplete)
        : months.filter(month => month.periodKey === monthFilter);

    return selected.map(period => ({
      period,
      row: rowMap.get(`month:${period.periodKey}`) ?? null,
    }));
  }, [rows, tab, weekFilter, visibleWeeks, months, monthFilter]);

  useEffect(() => {
    if (
      weekFilter !== "ALL" &&
      !visibleWeeks.some(week => week.periodKey === weekFilter)
    ) {
      setWeekFilter("ALL");
    }
  }, [visibleWeeks, weekFilter]);

  return (
    <div className="tp-star-page">
      <style>{`
        .tp-star-page {
          min-height:100%;
          padding:20px;
          background:#F6F6F3;
          color:#0F172A;
          box-sizing:border-box;
          overflow-x:hidden;
        }
        .tp-star-page * { box-sizing:border-box; }

        .tp-star-hero {
          position:relative;overflow:hidden;isolation:isolate;
          border:1px solid #E5E7EB;border-radius:20px;
          background:linear-gradient(135deg,#FFFFFF 0%,#FFFDF9 68%,#FFF7ED 100%);
          padding:24px 25px;margin-bottom:12px;
          box-shadow:0 8px 24px rgba(15,23,42,.045);
        }
        .tp-star-hero:before,.tp-star-hero:after {
          content:"";position:absolute;border-radius:999px;pointer-events:none;z-index:0;
        }
        .tp-star-hero:before { width:125px;height:125px;right:-35px;top:-45px;background:#FFF0E0; }
        .tp-star-hero:after { width:105px;height:105px;right:13%;bottom:-70px;background:#EFF6FF; }
        .tp-star-hero > * { position:relative;z-index:2; }
        .tp-star-eyebrow {
          margin:0;color:#F97316;font-size: 11.5px;font-weight:900;
          letter-spacing:1.45px;text-transform:uppercase;
        }
        .tp-star-title {
          margin:6px 0 0;color:#0F172A;font-size: 34.5px;line-height:1.06;
          font-weight:850;letter-spacing:-.55px;
        }
        .tp-star-copy {
          margin:8px 0 0;max-width:760px;color:#64748B;
          font-size: 13.8px;line-height:1.48;
        }
        .tp-star-pills { display:flex;gap:6px;flex-wrap:wrap;margin-top:10px; }
        .tp-star-pill {
          display:inline-flex;align-items:center;padding:5px 8px;border-radius:999px;
          font-size: 9.2px;font-weight:900;letter-spacing:.45px;
          background:#FFF7ED;color:#C2410C;border:1px solid #FED7AA;
        }
        .tp-star-pill.blue { background:#EFF6FF;color:#1D4ED8;border-color:#BFDBFE; }

        .tp-star-tabs {
          display:flex;gap:5px;padding:4px;border:1px solid #E5E7EB;
          border-radius:12px;background:#FFFFFF;width:max-content;max-width:100%;
          margin-bottom:10px;
        }
        .tp-star-tab {
          border:0;border-radius:9px;background:transparent;color:#64748B;
          padding:7px 14px;font-size: 10.35px;font-weight:900;cursor:pointer;
        }
        .tp-star-tab.active {
          background:linear-gradient(135deg,#FFF7ED 0%,#FFEDD5 100%);
          color:#EA580C;border:1px solid #FDBA74;
        }

        .tp-star-filter {
          display:grid;grid-template-columns:1fr 1fr;gap:9px;
          padding:12px;border:1px solid #E5E7EB;border-radius:15px;
          background:#FFFFFF;box-shadow:0 6px 18px rgba(15,23,42,.035);
          margin-bottom:10px;
        }
        .tp-star-label {
          display:block;margin:0 0 5px;color:#94A3B8;font-size: 9.2px;font-weight:900;
          letter-spacing:1px;text-transform:uppercase;
        }
        .tp-star-select {
          width:100%;min-height:38px;border:1px solid #D8DEE8;border-radius:10px;
          background:#fff;color:#334155;padding:0 10px;font-size: 11.5px;font-weight:800;outline:none;
        }
        .tp-star-filter-note {
          grid-column:1/-1;margin:0;color:#64748B;font-size: 9.2px;font-weight:700;line-height:1.4;
        }

        .tp-star-section {
          border:1px solid #E5E7EB;border-radius:18px;background:#FFFFFF;
          padding:15px;box-shadow:0 8px 24px rgba(15,23,42,.04);
          overflow:hidden;min-width:0;
        }
        .tp-star-section-head {
          display:flex;justify-content:space-between;align-items:flex-end;gap:10px;margin-bottom:9px;
        }
        .tp-star-section-title { margin:4px 0 0;color:#0F172A;font-size: 20.7px;font-weight:850;letter-spacing:-.25px; }
        .tp-star-section-copy { margin:4px 0 0;color:#64748B;font-size: 11.5px;line-height:1.4; }
        .tp-star-count {
          padding:5px 8px;border-radius:999px;background:#F8FAFC;color:#64748B;
          font-size: 9.2px;font-weight:900;white-space:nowrap;border:1px solid #E2E8F0;
        }

        .tp-star-swipe { display:none;margin:0 0 6px;color:#64748B;font-size: 9.2px;font-weight:750; }
        .tp-star-table-wrap {
          width:100%;overflow-x:auto;overflow-y:hidden;border:1px solid #E2E8F0;
          border-radius:12px;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y;
        }
        .tp-star-table { width:100%;min-width:900px;border-collapse:collapse;font-size: 11.5px; }
        .tp-star-table th {
          background:linear-gradient(135deg,#FFF7ED 0%,#FFFBF5 100%);
          color:#C2410C;padding:9px 8px;text-align:left;
          border-bottom:1px solid #E2E8F0;
          font-size: 9.2px;font-weight:900;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;
        }
        .tp-star-table td {
          padding:9px 8px;border-top:1px solid #EEF2F7;color:#334155;vertical-align:middle;
        }
        .tp-star-table tbody tr:first-child td { border-top:0; }
        .tp-star-period { color:#0F172A;font-weight:900; }
        .tp-star-date { display:block;margin-top:3px;color:#94A3B8;font-size: 8.05px;font-weight:700; }
        .tp-star-teacher { color:#0F172A;font-weight:900; }
        .tp-star-classes { max-width:315px;line-height:1.4; }
        .tp-star-score {
          display:inline-flex;align-items:center;justify-content:center;min-width:58px;
          padding:5px 7px;border-radius:8px;font-size: 13.8px;font-weight:950;font-variant-numeric:tabular-nums;
        }
        .tp-sp-green { background:#ECFDF5;color:#15803D; }
        .tp-sp-blue { background:#EFF6FF;color:#2563EB; }
        .tp-sp-orange { background:#FFF7ED;color:#C2410C; }
        .tp-sp-red { background:#FEF2F2;color:#B91C1C; }
        .tp-sp-muted { background:#F8FAFC;color:#94A3B8; }
        .tp-star-breakdown { display:block;margin-top:4px;color:#64748B;font-size: 8.05px;font-weight:750;white-space:nowrap; }
        .tp-star-breakdown b { font-weight:950; }
        .tp-star-empty { padding:20px;text-align:center;color:#64748B;font-size: 11.5px;font-weight:750; }
        .tp-star-status {
          display:inline-flex;margin-left:6px;border-radius:999px;padding:3px 6px;
          background:#ECFDF5;color:#15803D;font-size: 8.05px;font-weight:900;
        }
        .tp-star-upcoming { color:#94A3B8;font-weight:800; }
        .tp-star-note { margin-top:9px;color:#64748B;font-size: 9.2px;line-height:1.45;font-weight:700; }

        @media(max-width:1024px){
          .tp-star-page { padding:10px !important; }
          .tp-star-hero { padding:16px 18px;border-radius:18px; }
          .tp-star-title { font-size: 28.75px; }
          .tp-star-copy { font-size: 12.65px; }
          .tp-star-swipe { display:block; }
          .tp-star-table { min-width:900px; }
        }

        @media(max-width:600px){
          .tp-star-page { padding:7px !important; }
          .tp-star-hero { padding:12px 13px;border-radius:14px;margin-bottom:8px; }
          .tp-star-eyebrow { font-size: 8.05px;letter-spacing:.95px; }
          .tp-star-title { font-size: 20.7px;line-height:1.08;margin-top:4px; }
          .tp-star-copy { font-size: 10.35px;line-height:1.32;margin-top:5px; }
          .tp-star-pills { gap:4px;margin-top:7px; }
          .tp-star-pill { padding:4px 6px;font-size: 6.9px; }
          .tp-star-tabs { width:100%;gap:4px;margin-bottom:7px; }
          .tp-star-tab { flex:1;padding:6px 8px;font-size: 8.05px; }
          .tp-star-filter { padding:8px;border-radius:11px;gap:6px;margin-bottom:7px; }
          .tp-star-label { font-size: 6.9px;margin-bottom:3px;letter-spacing:.7px; }
          .tp-star-select { min-height:32px;padding:0 7px;font-size: 9.2px;border-radius:8px; }
          .tp-star-filter-note { font-size: 7.47px; }
          .tp-star-section { padding:8px;border-radius:11px; }
          .tp-star-section-head { gap:6px;margin-bottom:6px; }
          .tp-star-section-title { font-size: 14.95px; }
          .tp-star-section-copy { font-size: 8.62px; }
          .tp-star-count { font-size: 7.47px;padding:4px 6px; }
          .tp-star-swipe { font-size: 7.47px;margin-bottom:4px; }
          .tp-star-table { min-width:900px;font-size: 8.62px; }
          .tp-star-table th { padding:5px 5px;font-size: 6.9px; }
          .tp-star-table td { padding:5px; }
          .tp-star-period,.tp-star-teacher { font-size: 8.62px; }
          .tp-star-date { font-size: 6.9px; }
          .tp-star-classes { font-size: 8.05px;max-width:300px; }
          .tp-star-score { min-width:48px;padding:4px 6px;font-size: 11.5px; }
          .tp-star-breakdown { font-size: 6.9px; }
          .tp-star-status { font-size: 6.9px;padding:2px 5px; }
          .tp-star-note { font-size: 7.47px;margin-top:6px; }
        }
      `}</style>

      <section className="tp-star-hero">
        <p className="tp-star-eyebrow">Classroom Intelligence · Recognition</p>
        <h1 className="tp-star-title">Star Performers</h1>
        <p className="tp-star-copy">
          Weekly and monthly recognition based on the same classroom signals that power
          your Teacher Portal: understanding, doubt closure, class health and student feedback.
        </p>
        <div className="tp-star-pills">
          <span className="tp-star-pill">Live-layer aligned</span>
          <span className="tp-star-pill blue">Monday–Sunday weeks</span>
          <span className="tp-star-pill">All active classes counted</span>
        </div>
      </section>

      <div className="tp-star-tabs" role="tablist" aria-label="Star Performer period">
        <button
          type="button"
          className={`tp-star-tab ${tab === "week" ? "active" : ""}`}
          onClick={() => setTab("week")}
        >
          Weeks
        </button>
        <button
          type="button"
          className={`tp-star-tab ${tab === "month" ? "active" : ""}`}
          onClick={() => setTab("month")}
        >
          Month
        </button>
      </div>

      <section className="tp-star-filter">
        <div>
          <label className="tp-star-label">Month</label>
          <select
            className="tp-star-select"
            value={monthFilter}
            onChange={event => setMonthFilter(event.target.value)}
          >
            <option value="ALL">All months</option>
            {months.map(month => (
              <option key={month.periodKey} value={month.periodKey}>
                {month.periodLabel}
              </option>
            ))}
          </select>
        </div>

        {tab === "week" ? (
          <div>
            <label className="tp-star-label">Week</label>
            <select
              className="tp-star-select"
              value={weekFilter}
              onChange={event => setWeekFilter(event.target.value)}
            >
              <option value="ALL">All weeks</option>
              {visibleWeeks.map(week => (
                <option key={week.periodKey} value={week.periodKey}>
                  {week.periodLabel}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="tp-star-label">View</label>
            <select className="tp-star-select" value="MONTHLY" disabled>
              <option value="MONTHLY">Month-level calculation</option>
            </select>
          </div>
        )}

        <p className="tp-star-filter-note">
          {tab === "week"
            ? "Month narrows the week list. Leave Month on All months to keep every week available."
            : "Each month is calculated from its 1st through its last calendar date."}
        </p>
      </section>

      <section className="tp-star-section">
        <div className="tp-star-section-head">
          <div>
            <p className="tp-star-eyebrow">Recognition history</p>
            <h2 className="tp-star-section-title">
              {tab === "week" ? "Weekly Star Performers" : "Monthly Star Performers"}
            </h2>
            <p className="tp-star-section-copy">
              {tab === "week"
                ? "One highest-scoring teacher is recorded for every completed Monday–Sunday week."
                : "One highest-scoring teacher is recorded for every completed calendar month."}
            </p>
          </div>
          <span className="tp-star-count">
            {loading ? "Loading…" : `${visibleRows.length} periods`}
          </span>
        </div>

        <p className="tp-star-swipe">Swipe left or right to see full table</p>

        <div className="tp-star-table-wrap">
          <table className="tp-star-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>{tab === "week" ? "Week" : "Month"}</th>
                <th>Star Performer</th>
                <th>Classes + Sections</th>
                <th>Combined Score</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="tp-star-empty">Calculating recognition data…</td></tr>
              ) : error ? (
                <tr><td colSpan={5} className="tp-star-empty">{error}</td></tr>
              ) : visibleRows.length === 0 ? (
                <tr><td colSpan={5} className="tp-star-empty">No periods match the selected filters.</td></tr>
              ) : (
                visibleRows.map(({ period, row }, index) => (
                  <tr key={period.periodKey}>
                    <td>{index + 1}</td>
                    <td>
                      <span className="tp-star-period">
                        {period.periodLabel.split(" · ")[0]}
                      </span>
                      <span className="tp-star-date">
                        {formatDate(period.startDate)} – {formatDate(period.endDate)}
                      </span>
                    </td>
                    <td>
                      {row?.teacherName ? (
                        <>
                          <span className="tp-star-teacher">{row.teacherName}</span>
                          {period.isComplete && <span className="tp-star-status">Recorded</span>}
                        </>
                      ) : (
                        <span className="tp-star-upcoming">
                          {period.isComplete ? "No eligible teacher data" : "Not available yet"}
                        </span>
                      )}
                    </td>
                    <td className="tp-star-classes">
                      {row?.classrooms?.length ? row.classrooms.join(" · ") : "—"}
                    </td>
                    <td>
                      <span className={`tp-star-score ${tone(row?.combinedScore ?? null)}`}>
                        {row?.combinedScore == null ? "—" : `${row.combinedScore}%`}
                      </span>
                      {row?.combinedScore != null && (
                        <span className="tp-star-breakdown">
                          U <b>{row.understandingPercentage}%</b> · D <b>{row.doubtClosurePercentage}%</b> · H <b>{row.classHealthPercentage}%</b> · F <b>{row.studentFeedbackPercentage}%</b>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="tp-star-note">
          Combined Score = average of Understanding %, Doubt Closure %, Class Health %, and Student Feedback % of all classes taught by that teacher.

        </p>
      </section>

      <StudentStarPerformersPanel portalTheme="teacher" />
    </div>
  );
}
