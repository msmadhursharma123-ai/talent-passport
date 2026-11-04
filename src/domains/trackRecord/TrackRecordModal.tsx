
import { useEffect, useMemo, useState } from "react";
import { loadTrackRecordData, METRICS } from "./TrackRecordRepository";
import type {
  TrackRecordAudience, TrackRecordCell, TrackRecordData, TrackRecordMetricId,
  TrackRecordGroup, TrackRecordPeriod, TrackRecordView, TrackRecordMetric,
} from "./TrackRecordTypes";
import "./trackRecord.css";
import { printHtmlAsPdf } from "../../services/platform/nativeDocumentService";
import { canCompareTrackRecordMetricPeriods, getTrackRecordTrendTone } from "./TrackRecordCalculations";

type Props = { audience: TrackRecordAudience; onClose: () => void };

const PERIOD_LABEL = (view: TrackRecordView) => view === "monthly" ? "Month" : "Week";
const formatValue = (metric: TrackRecordMetric) => metric.display || "—";

function htmlEscape(value: unknown) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function buildPdfBody(groups: TrackRecordGroup[], view: TrackRecordView, focusPeriod: string, audience: TrackRecordAudience) {
  const sections = groups.map(group => {
    const cells = group.cells.filter(cell => cell.period.view === view &&
      (focusPeriod === "ALL" || cell.period.id === focusPeriod));
    const headers = cells.map(cell => `<th>${htmlEscape(cell.period.label)}</th>`).join("");
    const rows = METRICS.map(row => {
      const values = cells.map((cell, index) => {
        const current = cell.metrics[row.id];
        const previousCell = group.cells.filter(x => x.period.view === view)
          .findIndex(x => x.period.id === cell.period.id);
        const allCells = group.cells.filter(x => x.period.view === view);
        const previous = previousCell > 0 ? allCells[previousCell - 1].metrics[row.id] : undefined;
        const comparable = previousCell > 0 && canCompareTrackRecordMetricPeriods(
          cell.period, allCells[previousCell - 1].period, row.id,
        );
        const tone = comparable
          ? getTrackRecordTrendTone(row.id, current.trendValue ?? current.value, previous?.trendValue ?? previous?.value)
          : "neutral";
        return `<td class="${tone}">${htmlEscape(current.display)}</td>`;
      }).join("");
      return `<tr><th>${htmlEscape(row.label)}</th>${values}</tr>`;
    }).join("");
    return `<section class="group"><h2>${audience === "school" ? `${htmlEscape(group.teacherName)} · ` : ""}Class ${htmlEscape(group.className)} · Section ${htmlEscape(group.sectionName)} · ${htmlEscape(group.subjectName)}</h2><table><thead><tr><th>Performance parameter</th>${headers}</tr></thead><tbody>${rows}</tbody></table></section>`;
  }).join("");
  return `<main><h1>${audience === "school" ? "School Teaching Track Record" : "My Teaching Track Record"}</h1><p>${view === "monthly" ? "Monthly comparison" : "Weekly comparison"} · Generated ${htmlEscape(new Date().toLocaleString())}</p>${sections}</main>`;
}

function trendClass(metricId: TrackRecordMetricId, current: TrackRecordMetric, previous?: TrackRecordMetric, comparable = false) {
  return `tr-${comparable ? getTrackRecordTrendTone(metricId, current.trendValue ?? current.value, previous?.trendValue ?? previous?.value) : "neutral"}`;
}

export default function TrackRecordModal({ audience, onClose }: Props) {
  const [data, setData] = useState<TrackRecordData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<TrackRecordView>("monthly");
  const [classFilter, setClassFilter] = useState("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [focusPeriod, setFocusPeriod] = useState("ALL");
  const [detail, setDetail] = useState<{ group: TrackRecordGroup; cell: TrackRecordCell; metricId: TrackRecordMetricId } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    loadTrackRecordData(audience)
      .then(result => { if (alive) setData(result); })
      .catch((e: any) => { if (alive) setError(e?.message || "Unable to load Track Record."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [audience]);

  const periods = useMemo(() => {
    const map = new Map<string, TrackRecordPeriod>();
    (data?.groups ?? []).forEach(group => group.cells
      .filter(cell => cell.period.view === view)
      .forEach(cell => map.set(cell.period.id, cell.period)));
    return Array.from(map.values()).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [data, view]);

  useEffect(() => {
    setFocusPeriod("ALL");
  }, [view]);

  const groups = useMemo(() => (data?.groups ?? []).filter(group =>
    (classFilter === "ALL" || group.className === classFilter) &&
    (sectionFilter === "ALL" || group.sectionName === sectionFilter) &&
    (subjectFilter === "ALL" || group.subjectName === subjectFilter) &&
    (audience !== "school" || !teacherSearch.trim() ||
      group.teacherName.toLowerCase().includes(teacherSearch.trim().toLowerCase()))
  ), [data, classFilter, sectionFilter, subjectFilter, teacherSearch, audience]);

  const title = audience === "teacher" ? "My Teaching Track Record" : "School Teaching Track Record";
  const theme = audience === "teacher" ? "tr-teacher" : "tr-school";

  async function savePdf() {
    if (pdfLoading || !data) return;
    setPdfLoading(true);
    setDetail(null);
    try {
      const bodyHtml = buildPdfBody(groups, view, focusPeriod, audience);
      const css = `
        body{font-family:Arial,sans-serif;color:#172033;margin:0;padding:16px}
        h1{font-size:22px;margin:0 0 5px}p{font-size:10px;color:#64748B;margin:0 0 18px}
        .group{margin:0 0 18px;break-inside:avoid}h2{font-size:12px;background:#F1F5F9;padding:8px;margin:0}
        table{width:100%;border-collapse:collapse;table-layout:auto;font-size:7px}
        th,td{border:1px solid #CBD5E1;padding:4px;text-align:center;white-space:normal}
        th:first-child{text-align:left;min-width:120px}thead th{background:#E2E8F0}
        td.up{background:#DCFCE7;color:#166534}td.down{background:#FEF3C7;color:#92400E}td.neutral{background:#F8FAFC;color:#475569}
      `;
      await printHtmlAsPdf({
        bodyHtml, css,
        fileName: `Talent-Passport-Track-Record-${audience}-${view}-${new Date().toISOString().slice(0,10)}.pdf`,
        title: audience === "school" ? "School Teaching Track Record" : "Teacher Track Record",
      });
    } catch (e: any) {
      window.alert(e?.message || "Unable to create the Track Record PDF.");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className={`tr-overlay ${theme}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="tr-modal">
        <header className="tr-header">
          <div className="tr-header-copy">
            <div className="tr-eyebrow">TALENT PASSPORT · PERFORMANCE LEDGER</div>
            <h2>{title}</h2>
            <p>{audience === "teacher"
              ? "A period-by-period view of your classroom and learning activity."
              : "A school-wide view of every teacher, grouped by class, section and subject."}</p>
          </div>
          <div className="tr-header-actions">
            <button type="button" className="tr-button tr-print" onClick={savePdf} disabled={pdfLoading}>{pdfLoading ? "Preparing PDF…" : "Save PDF"}</button>
            <button type="button" className="tr-close" onClick={onClose} aria-label="Back">× <span>Back</span></button>
          </div>
        </header>

        {loading && <div className="tr-state">Preparing period-wise Track Record…</div>}
        {error && <div className="tr-error" role="alert">{error}</div>}
        {!loading && !error && data && (
          <>
            <div className="tr-controls">
              {audience === "school" && (
                <label className="tr-field tr-search">
                  <span>Search teacher</span>
                  <input value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)} placeholder="Search by teacher name…" />
                </label>
              )}
              <label className="tr-field">
                <span>Class</span>
                <select value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                  <option value="ALL">All classes</option>
                  {data.classes.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                </select>
              </label>
              <label className="tr-field">
                <span>Section</span>
                <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
                  <option value="ALL">All sections</option>
                  {data.sections.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                </select>
              </label>
              <label className="tr-field">
                <span>Subject</span>
                <select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
                  <option value="ALL">All subjects</option>
                  {data.subjects.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                </select>
              </label>
              <label className="tr-field tr-focus">
                <span>Focus {PERIOD_LABEL(view).toLowerCase()}</span>
                <select value={focusPeriod} onChange={e => setFocusPeriod(e.target.value)}>
                  <option value="ALL">All periods</option>
                  {periods.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </label>
            </div>

            <div className="tr-tabs" role="tablist" aria-label="Comparison period">
              <button type="button" role="tab" aria-selected={view === "monthly"} className={view === "monthly" ? "active" : ""} onClick={() => setView("monthly")}>Monthly Comparison</button>
              <button type="button" role="tab" aria-selected={view === "weekly"} className={view === "weekly" ? "active" : ""} onClick={() => setView("weekly")}>Weekly Comparison</button>
            </div>

            <div className="tr-legend">
              <span><i className="tr-dot tr-green" /> Favourable change</span>
              <span><i className="tr-dot tr-amber" /> Unfavourable change</span>
              <span><i className="tr-dot tr-grey" /> Neutral, equal, unavailable or no previous period</span>
              <small>Tap any value to inspect its supporting records.</small>
            </div>


            {groups.length === 0 && <div className="tr-state">No teaching assignments match these filters.</div>}
            {groups.map(group => {
              const cells = group.cells.filter(c => c.period.view === view);
              const visibleCells = focusPeriod === "ALL" ? cells : cells.filter(c => c.period.id === focusPeriod);
              return (
                <section className="tr-group" key={group.id}>
                  <div className="tr-group-heading">
                    <div>
                      {audience === "school" && <span className="tr-teacher-name">{group.teacherName}</span>}
                      <h3>Class {group.className} · Section {group.sectionName}</h3>
                      <p>{group.subjectName}</p>
                    </div>
                    <span className="tr-group-count">{visibleCells.length} {view === "monthly" ? "months" : "weeks"}</span>
                  </div>
                  <div className="tr-table-scroll" tabIndex={0} aria-label={`${group.teacherName} ${group.className} ${group.sectionName} ${group.subjectName} comparison table`}>
                    <table className="tr-table">
                      <thead>
                        <tr>
                          <th className="tr-sticky-col">Performance parameter</th>
                          {visibleCells.map(cell => <th key={cell.period.id} className={focusPeriod === cell.period.id ? "tr-focused" : ""}>{cell.period.label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {METRICS.map(row => (
                          <tr key={row.id}>
                            <th className="tr-sticky-col">{row.label}</th>
                            {visibleCells.map(cell => {
                              const current = cell.metrics[row.id];
                              const fullIndex = cells.findIndex(item => item.period.id === cell.period.id);
                              const previous = fullIndex > 0 ? cells[fullIndex - 1].metrics[row.id] : undefined;
                              const comparable = fullIndex > 0 && canCompareTrackRecordMetricPeriods(
                                cell.period, cells[fullIndex - 1].period, row.id,
                              );
                              const grade = trendClass(row.id, current, previous, comparable);
                              return (
                                <td key={cell.period.id}>
                                  <button
                                    type="button"
                                    className={`tr-cell ${grade} ${current.value == null ? "tr-disabled-cell" : ""}`}
                                    title={current.note || `Open ${row.label} details for ${cell.period.label}`}
                                    onClick={() => setDetail({ group, cell, metricId: row.id })}
                                  >
                                    {formatValue(current)}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
            <footer className="tr-footer">
              <span>Reporting range: {data.startDate} to {data.endDate} · Generated {new Date(data.generatedAt).toLocaleString()}</span>
              <button type="button" className="tr-button tr-secondary" onClick={onClose}>Back to {audience === "teacher" ? "Teaching Journal" : "School Overview"}</button>
            </footer>
          </>
        )}
      </div>

      {detail && (
        <div className="tr-detail-overlay" role="dialog" aria-modal="true" aria-label="Metric details">
          <div className="tr-detail-modal">
            <header className="tr-detail-header">
              <div>
                <div className="tr-eyebrow">METRIC BREAKDOWN · {detail.cell.period.label}</div>
                <h3>{METRICS.find(x => x.id === detail.metricId)?.label}</h3>
                <p>{audience === "school" ? `${detail.group.teacherName} · ` : ""}Class {detail.group.className} · Section {detail.group.sectionName} · {detail.group.subjectName}</p>
              </div>
              <button type="button" className="tr-close tr-detail-x" onClick={() => setDetail(null)} aria-label="Close details">×</button>
            </header>
            <div className="tr-detail-summary">
              <strong>{detail.cell.metrics[detail.metricId].display}</strong>
              <span>{detail.cell.metrics[detail.metricId].note || "Supporting records for the selected reporting period."}</span>
            </div>
            <div className="tr-detail-list">
              {(detail.cell.details[detail.metricId] ?? []).length === 0
                ? <div className="tr-empty-detail">No supporting rows are available for this metric and period.</div>
                : (detail.cell.details[detail.metricId] ?? []).map((item, index) => (
                  <div className="tr-detail-row" key={`${item.label}-${index}`}>
                    <strong>{item.label}</strong>
                    {item.value !== undefined && <span>{item.value}</span>}
                    {item.secondary && <small>{item.secondary}</small>}
                  </div>
                ))}
            </div>
            <div className="tr-detail-actions">
              <button type="button" className="tr-button tr-secondary" onClick={() => setDetail(null)}>← Back to Track Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
