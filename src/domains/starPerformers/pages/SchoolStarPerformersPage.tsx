import { useEffect, useMemo, useState } from "react";
import { loadStarPerformerViewModel } from "../viewmodels/StarPerformerViewModel";
import type {
  StarPerformerPeriod,
  StarPerformerRow,
} from "../types/StarPerformerModels";

const TODAY = new Intl.DateTimeFormat("en-CA", {
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

function scoreTone(score: number | null) {
  if (score == null) return "sp-muted";
  if (score >= 90) return "sp-excellent";
  if (score >= 75) return "sp-good";
  if (score >= 60) return "sp-watch";
  return "sp-low";
}

export default function SchoolStarPerformersPage() {
  const year = Number(TODAY.slice(0, 4));
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
    () =>
      periods
        .filter(period => period.periodType === "month")
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [periods]
  );

  const weeks = useMemo(
    () =>
      periods
        .filter(period => period.periodType === "week")
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [periods]
  );

  const visibleWeeks = useMemo(() => {
    let result = weeks;

    if (monthFilter !== "ALL") {
      const month = periods.find(
        period => period.periodType === "month" && period.periodKey === monthFilter
      );
      if (month) {
        result = result.filter(
          week =>
            week.endDate >= month.startDate &&
            week.startDate <= month.endDate
        );
      }
    }

    return result;
  }, [weeks, monthFilter]);

  const visibleRows = useMemo(() => {
    const rowMap = new Map(rows.map(row => [`${row.periodType}:${row.periodKey}`, row]));

    if (tab === "week") {
      const selectedPeriods =
        weekFilter === "ALL"
          ? visibleWeeks.filter(period => period.isComplete)
          : visibleWeeks.filter(period => period.periodKey === weekFilter);

      return selectedPeriods.map(period => ({
        period,
        row: rowMap.get(`week:${period.periodKey}`) ?? null,
      }));
    }

    const selectedMonths =
      monthFilter === "ALL"
        ? months.filter(month => month.isComplete)
        : months.filter(month => month.periodKey === monthFilter);

    return selectedMonths.map(period => ({
      period,
      row: rowMap.get(`month:${period.periodKey}`) ?? null,
    }));
  }, [tab, weekFilter, monthFilter, visibleWeeks, months, rows]);

  useEffect(() => {
    if (
      weekFilter !== "ALL" &&
      !visibleWeeks.some(week => week.periodKey === weekFilter)
    ) {
      setWeekFilter("ALL");
    }
  }, [visibleWeeks, weekFilter]);

  return (
    <main className="school-page sp-school-page">
      <style>{`
        .sp-school-page {
          --sp-navy: #0b1f3a;
          --sp-orange: #ff6508;
          --sp-bg: #f5f7fa;
          --sp-border: #dce4ee;
          --sp-muted: #5d708e;
          padding: 18px 20px 28px !important;
          background: var(--sp-bg);
        }

        .sp-school-stack { display:grid; gap:16px; min-width:0; }
        .sp-school-hero {
          position:relative; overflow:hidden; isolation:isolate;
          border:1px solid var(--sp-border); border-radius:22px;
          background:linear-gradient(110deg,#fff 0%,#fff 72%,#fff7ef 100%);
          padding:28px; box-shadow:0 8px 24px rgba(15,35,60,.05);
        }
        .sp-school-hero:before,.sp-school-hero:after {
          content:""; position:absolute; border-radius:999px; pointer-events:none; z-index:0;
        }
        .sp-school-hero:before { width:150px;height:150px;right:14%;bottom:-92px;background:#eef4ff; }
        .sp-school-hero:after { width:115px;height:115px;right:-32px;top:-35px;background:#fff0e4; }
        .sp-school-hero > * { position:relative;z-index:2; }
        .sp-eyebrow { margin:0;color:var(--sp-orange);font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase; }
        .sp-title { margin:8px 0 0;color:var(--sp-navy);font-size:32px;line-height:1.05;font-weight:900;letter-spacing:-.035em; }
        .sp-copy { margin:9px 0 0;color:var(--sp-muted);font-size:14px;line-height:1.55;max-width:820px; }

        .sp-tabs {
          display:flex; gap:7px; padding:5px; border:1px solid var(--sp-border);
          border-radius:14px; background:#f0f3f7; width:max-content; max-width:100%;
        }
        .sp-tab {
          border:0; border-radius:10px; background:transparent; color:#52647f;
          padding:8px 16px; font-size:11px; font-weight:900; cursor:pointer;
        }
        .sp-tab.active { background:var(--sp-orange); color:#fff; box-shadow:0 5px 14px rgba(255,101,8,.16); }

        .sp-filter {
          display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr);
          gap:12px; padding:16px; border:1px solid var(--sp-border);
          border-radius:18px; background:linear-gradient(135deg,#fff 0%,#f8fafc 100%);
          box-shadow:0 8px 24px rgba(15,23,42,.04);
        }
        .sp-filter-field { min-width:0; }
        .sp-filter-label {
          display:block;margin:0 0 6px;color:#64748b;font-size:10px;font-weight:800;
          letter-spacing:.08em;text-transform:uppercase;
        }
        .sp-select {
          width:100%; min-height:42px; border:1px solid #d8e0ea;border-radius:12px;
          background:#fff;color:#0f172a;padding:0 12px;font-size:12px;font-weight:700;outline:none;
        }
        .sp-filter-note { grid-column:1/-1;margin:0;color:#64748b;font-size:10px;font-weight:700;line-height:1.4; }

        .sp-section {
          border:1px solid var(--sp-border); border-radius:22px; background:#fff;
          padding:20px; box-shadow:0 8px 24px rgba(15,35,60,.045);
          min-width:0; overflow:hidden;
        }
        .sp-section-head { display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:14px; }
        .sp-section-title { margin:5px 0 0;color:var(--sp-navy);font-size:21px;font-weight:900; }
        .sp-section-copy { margin:5px 0 0;color:var(--sp-muted);font-size:13px; }
        .sp-count-pill { display:inline-flex;align-items:center;border-radius:999px;padding:5px 9px;background:#fff3e9;color:#e85400;font-size:10px;font-weight:900;white-space:nowrap; }

        .sp-swipe-note { display:none;margin:0 0 7px;color:#64748b;font-size:9px;line-height:1.35;font-weight:750; }
        .sp-table-wrap { width:100%;overflow-x:auto;overflow-y:hidden;border:1px solid #e2e8f0;border-radius:15px;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y; }
        .sp-table { width:100%;min-width:920px;border-collapse:collapse;font-size:12px; }
        .sp-table th { background:var(--sp-navy);color:#fff;padding:13px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap; }
        .sp-table td { padding:12px;border-top:1px solid #e7edf4;color:#263a56;vertical-align:middle; }
        .sp-table tbody tr:first-child td { border-top:0; }
        .sp-period { font-weight:850;color:var(--sp-navy); }
        .sp-subdate { display:block;margin-top:3px;color:#7b8ba3;font-size:9px;font-weight:650; }
        .sp-teacher { font-weight:900;color:var(--sp-navy); }
        .sp-classrooms { max-width:330px;line-height:1.45; }
        .sp-score {
          display:inline-flex;align-items:center;justify-content:center;min-width:64px;
          padding:6px 9px;border-radius:10px;font-size:14px;font-weight:950;
          font-variant-numeric:tabular-nums;
        }
        .sp-excellent { background:#ecfdf3;color:#15803d; }
        .sp-good { background:#eff6ff;color:#2563eb; }
        .sp-watch { background:#fff7ed;color:#c2410c; }
        .sp-low { background:#fef2f2;color:#b91c1c; }
        .sp-muted { background:#f8fafc;color:#94a3b8; }
        .sp-breakdown { display:block;margin-top:5px;color:#64748b;font-size:9px;font-weight:700;white-space:nowrap; }
        .sp-breakdown b { font-weight:900; }
        .sp-empty { padding:24px;text-align:center;color:#64748b;font-size:13px;font-weight:700; }
        .sp-future { color:#94a3b8;font-weight:800; }
        .sp-status { display:inline-flex;border-radius:999px;padding:4px 8px;background:#f1f5f9;color:#64748b;font-size:9px;font-weight:900; }
        .sp-status.complete { background:#ecfdf3;color:#15803d; }

        @media(max-width:1024px){
          .sp-school-page { padding:16px 0 22px !important; }
          .sp-school-hero,.sp-section { border-radius:18px; }
          .sp-school-hero { padding:20px 18px; }
          .sp-title { font-size:29px; }
          .sp-copy { font-size:13px; }
          .sp-section { padding:15px; }
          .sp-section-title { font-size:19px; }
          .sp-filter { padding:13px; gap:9px; }
          .sp-swipe-note { display:block; }
          .sp-table { min-width:920px; }
        }

        @media(max-width:600px){
          .sp-school-page { padding:0 !important; }
          .sp-school-stack { gap:10px; }
          .sp-school-hero { padding:16px 13px;border-radius:15px; }
          .sp-eyebrow { font-size:7px;letter-spacing:.95px; }
          .sp-title { font-size:21px;line-height:1.08;margin-top:5px; }
          .sp-copy { font-size:9px;line-height:1.35;margin-top:6px; }
          .sp-tabs { width:100%;gap:4px;padding:4px;border-radius:11px; }
          .sp-tab { flex:1;padding:7px 9px;border-radius:8px;font-size:8px; }
          .sp-filter { grid-template-columns:1fr 1fr; padding:9px;border-radius:12px;gap:7px; }
          .sp-filter-label { font-size:7px;margin-bottom:4px; }
          .sp-select { min-height:34px;padding:0 8px;font-size:9px;border-radius:9px; }
          .sp-filter-note { font-size:7px; }
          .sp-section { padding:9px;border-radius:13px; }
          .sp-section-head { gap:7px;margin-bottom:8px;align-items:flex-start; }
          .sp-section-title { font-size:14px;line-height:1.1; }
          .sp-section-copy { font-size:8px;line-height:1.35; }
          .sp-count-pill { font-size:7px;padding:4px 6px; }
          .sp-swipe-note { font-size:7px;margin-bottom:5px; }
          .sp-table { min-width:920px;font-size:8px; }
          .sp-table th { padding:7px 6px;font-size:7px; }
          .sp-table td { padding:7px 6px; }
          .sp-period { font-size:8px; }
          .sp-subdate { font-size:7px; }
          .sp-teacher { font-size:8px; }
          .sp-classrooms { max-width:300px;font-size:8px; }
          .sp-score { min-width:52px;padding:5px 7px;font-size:11px;border-radius:8px; }
          .sp-breakdown { font-size:7px; }
          .sp-status { font-size:7px;padding:3px 6px; }
          .sp-empty { padding:18px;font-size:9px; }
        }
      `}</style>

      <div className="sp-school-stack">
        <section className="sp-school-hero">
          <p className="sp-eyebrow">Teacher Recognition · School Intelligence</p>
          <h1 className="sp-title">Star Performers</h1>
          <p className="sp-copy">
            A transparent recognition layer for the teachers creating the strongest
            classroom outcomes across the school. Weekly and monthly scores use the
            same live-layer classroom intelligence already used by School Intelligence.
          </p>
        </section>

        <section className="sp-section" style={{ paddingBottom: 14 }}>
          <div className="sp-tabs" role="tablist" aria-label="Star Performer period">
            <button
              type="button"
              className={`sp-tab ${tab === "week" ? "active" : ""}`}
              onClick={() => setTab("week")}
            >
              Weeks
            </button>
            <button
              type="button"
              className={`sp-tab ${tab === "month" ? "active" : ""}`}
              onClick={() => setTab("month")}
            >
              Month
            </button>
          </div>
        </section>

        <section className="sp-filter">
          <div className="sp-filter-field">
            <label className="sp-filter-label">Month</label>
            <select
              className="sp-select"
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
            <div className="sp-filter-field">
              <label className="sp-filter-label">Week</label>
              <select
                className="sp-select"
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
            <div className="sp-filter-field">
              <label className="sp-filter-label">View</label>
              <select className="sp-select" value="MONTHLY" disabled>
                <option value="MONTHLY">Month-level calculation</option>
              </select>
            </div>
          )}

          <p className="sp-filter-note">
            {tab === "week"
              ? "Choose a month first to narrow the week list. If no month is selected, every week in the year remains available."
              : "Monthly scores are calculated from the 1st through the last date of each completed month."}
          </p>
        </section>

        <section className="sp-section">
          <div className="sp-section-head">
            <div>
              <p className="sp-eyebrow">Recognition history</p>
              <h2 className="sp-section-title">
                {tab === "week" ? "Weekly Star Performers" : "Monthly Star Performers"}
              </h2>
              <p className="sp-section-copy">
                {tab === "week"
                  ? "One highest-scoring teacher is recorded for each completed Monday–Sunday week."
                  : "One highest-scoring teacher is recorded for each completed calendar month."}
              </p>
            </div>
            <span className="sp-count-pill">
              {loading ? "Loading…" : `${visibleRows.length} periods`}
            </span>
          </div>

          <p className="sp-swipe-note">Swipe left or right to see full table</p>

          <div className="sp-table-wrap">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>{tab === "week" ? "Week" : "Month"}</th>
                  <th>Name of Star Performing Teacher</th>
                  <th>Classes + Sections</th>
                  <th>Average Combined Score</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="sp-empty">Calculating live-layer recognition data…</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="sp-empty">{error}</td></tr>
                ) : visibleRows.length === 0 ? (
                  <tr><td colSpan={5} className="sp-empty">No periods match the selected filters.</td></tr>
                ) : (
                  visibleRows.map(({ period, row }, index) => (
                    <tr key={period.periodKey}>
                      <td>{index + 1}</td>
                      <td>
                        <span className="sp-period">{period.periodLabel.split(" · ")[0]}</span>
                        <span className="sp-subdate">
                          {formatDate(period.startDate)} – {formatDate(period.endDate)}
                        </span>
                      </td>
                      <td>
                        {row?.teacherName ? (
                          <>
                            <span className="sp-teacher">{row.teacherName}</span>
                            <span className={`sp-status ${period.isComplete ? "complete" : ""}`}>
                              {period.isComplete ? "Recorded" : "Upcoming"}
                            </span>
                          </>
                        ) : (
                          <span className="sp-future">
                            {period.isComplete ? "No eligible teacher data" : "Not available yet"}
                          </span>
                        )}
                      </td>
                      <td className="sp-classrooms">
                        {row?.classrooms?.length
                          ? row.classrooms.join(" · ")
                          : "—"}
                      </td>
                      <td>
                        <span className={`sp-score ${scoreTone(row?.combinedScore ?? null)}`}>
                          {row?.combinedScore == null ? "—" : `${row.combinedScore}%`}
                        </span>
                        {row?.combinedScore != null && (
                          <span className="sp-breakdown">
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

          <div className="so-table-status" style={{ marginTop: 12 }}>
            Combined Score = average of the four classroom-level percentages:
            Understanding %, Doubt Closure %, Class Health %, and Student Feedback %.
            Each teacher's classroom scores are averaged across all active classes/sections
            that teacher teaches. Resolved live-layer doubts can move historical feedback
            into the understood bucket without rewriting the original feedback record.
          </div>
        </section>
      </div>
    </main>
  );
}
