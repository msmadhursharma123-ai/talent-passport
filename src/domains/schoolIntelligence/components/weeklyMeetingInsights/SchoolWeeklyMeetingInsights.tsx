import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { requireSchoolIdentity } from "../../../../services/identityService";
import type {
  SchoolWeeklyMeetingInsights,
  SchoolWeeklyMeetingTeacherMetric,
} from "./SchoolWeeklyMeetingInsightsModels";
import {
  formatDate,
  getTodayIndiaDateKey,
  mondayOfWeek,
} from "./SchoolWeeklyMeetingInsightsEngine";
import {
  getPreviousCompletedWeek,
  loadSchoolWeeklyMeetingInsights,
} from "./SchoolWeeklyMeetingInsightsViewModel";
import "./SchoolWeeklyMeetingInsights.css";

const MORNING_BRIEF_KEY_PREFIX = "schoolAdminMorningBriefAcknowledgement";
const WEEKLY_CLOSE_KEY_PREFIX = "schoolAdminWeeklyMeetingInsightsClosedAt";
const TWO_HOURS = 2 * 60 * 60 * 1000;

function morningBriefKey(schoolUuid: string, dateKey: string) {
  return `${MORNING_BRIEF_KEY_PREFIX}:${schoolUuid}:${dateKey}`;
}

function weeklyCloseKey(schoolUuid: string, mondayKey: string) {
  return `${WEEKLY_CLOSE_KEY_PREFIX}:${schoolUuid}:${mondayKey}`;
}

function pct(value: number | null) {
  return value === null ? "—" : `${value}%`;
}

function fmtSubmitted(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function metricDetail(row: SchoolWeeklyMeetingTeacherMetric, kind: string) {
  if (kind === "logs") return `${row.missedLogs} missed of ${row.expectedLogs} expected`;
  if (kind === "feedback") return `${row.feedbackResponses} / ${row.feedbackEligible} feedback responses`;
  if (kind === "understanding") return `${row.understandingRate === null ? "No feedback" : `${row.understandingRate}% understood`}`;
  if (kind === "closure") return `${row.doubtsResolved} / ${row.doubtsAsked} doubts resolved`;
  if (kind === "planner") return `${row.latePlannerCount} late plan${row.latePlannerCount === 1 ? "" : "s"} · ${row.latestLatePlannerDelayMinutes ?? 0} min late`;
  if (kind === "health") return `${pct(row.classHealthPercentage)} class health`;
  return "";
}

function TeacherCompactCard({
  row,
  kind,
  appreciation = false,
}: {
  row: SchoolWeeklyMeetingTeacherMetric;
  kind: "logs" | "feedback" | "understanding" | "closure" | "planner" | "health";
  appreciation?: boolean;
}) {
  const value =
    kind === "logs"
      ? row.missedLogs
      : kind === "feedback"
        ? pct(row.feedbackRate)
        : kind === "understanding"
          ? pct(row.understandingRate)
          : kind === "closure"
            ? pct(row.doubtClosureRate)
            : kind === "planner"
              ? row.latePlannerCount
              : pct(row.classHealthPercentage);

  return (
    <article className={`swmi-teacher-card${appreciation ? " positive" : ""}`}>
      <div className="swmi-rank">{row.teacherName}</div>
      <div className="swmi-card-main">
        <strong>{value}</strong>
        <span>{metricDetail(row, kind)}</span>
      </div>
      <div className="swmi-card-meta">
        <span>{row.subjects.slice(0, 2).join(" · ") || "Assigned teaching"}</span>
        <span>{row.classrooms.length} class{row.classrooms.length === 1 ? "" : "es"}</span>
      </div>
      {kind === "planner" && (
        <div className="swmi-card-note">Latest late submission: {fmtSubmitted(row.latestLatePlannerSubmittedAt)}</div>
      )}
    </article>
  );
}

function RankingSection({
  title,
  subtitle,
  rows,
  kind,
  positive = false,
}: {
  title: string;
  subtitle: string;
  rows: SchoolWeeklyMeetingTeacherMetric[];
  kind: "logs" | "feedback" | "understanding" | "closure" | "planner" | "health";
  positive?: boolean;
}) {
  return (
    <section className={`swmi-section${positive ? " swmi-positive-section" : ""}`}>
      <div className="swmi-section-head">
        <div>
          <p>{positive ? "APPRECIATION" : "DISCUSS IN THE MEETING"}</p>
          <h3>{title}</h3>
        </div>
        <span>{subtitle}</span>
      </div>
      <div className="swmi-teacher-grid">
        {rows.length ? rows.map((row, index) => (
          <div className="swmi-ranked" key={`${kind}:${row.teacherUuid}:${index}`}>
            <span className="swmi-number">{index + 1}</span>
            <TeacherCompactCard row={row} kind={kind} appreciation={positive} />
          </div>
        )) : (
          <div className="swmi-empty">No qualifying teacher data was recorded for this period.</div>
        )}
      </div>
    </section>
  );
}

function ReportContent({
  report,
  reportRef,
}: {
  report: SchoolWeeklyMeetingInsights;
  reportRef?: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={reportRef ?? undefined} className="swmi-report">
      <header className="swmi-report-head">
        <div>
          <p className="swmi-kicker">WEEKLY MEETING INTELLIGENCE</p>
          <h2>Weekly School Meeting Analysis</h2>
          <p className="swmi-school">{report.schoolName}</p>
        </div>
        <div className="swmi-period">
          <span>REPORT PERIOD</span>
          <b>{report.periodLabel}</b>
        </div>
      </header>

      <div className="swmi-summary-grid">
        <article><small>Working days</small><strong>{report.workingDays.length}</strong><span>{report.excludedHolidays.length} holiday / non-working dates excluded</span></article>
        <article><small>Expected daily logs</small><strong>{report.expectedLectureCount}</strong><span>Based on assigned classes × working days</span></article>
        <article><small>Submitted logs</small><strong>{report.submittedLectureCount}</strong><span>Published Daily Logs in the selected period</span></article>
        <article className="alert"><small>Missed logs</small><strong>{report.missedLectureCount}</strong><span>Expected minus submitted</span></article>
      </div>

      <div className="swmi-note">
        <b>How this report reads the week:</b> expected Daily Logs are calculated per active teacher-classroom assignment for each working day. Sunday and configured school/public holidays are excluded. Student feedback is measured against the students belonging to each exact class/section. Existing effective-understanding and doubt-closure rules are preserved.
      </div>

      <RankingSection
        title="Teachers with the Most Missed Daily Logs"
        subtitle="Top 5 by missed lecture count"
        rows={report.missingDailyLogTeachers}
        kind="logs"
      />
      <RankingSection
        title="Teachers with the Lowest Student Feedback"
        subtitle="Lowest response percentage"
        rows={report.leastFeedbackTeachers}
        kind="feedback"
      />
      <RankingSection
        title="Teachers with the Lowest Understanding"
        subtitle="Lowest effective understanding percentage"
        rows={report.leastUnderstandingTeachers}
        kind="understanding"
      />
      <RankingSection
        title="Teachers with the Lowest Doubt Closure"
        subtitle="Lowest resolution percentage"
        rows={report.leastDoubtClosureTeachers}
        kind="closure"
      />
      <RankingSection
        title="Teachers with Delayed Lesson Planners"
        subtitle="Submitted after Monday 9:00 AM"
        rows={report.delayedLessonPlannerTeachers}
        kind="planner"
      />

      <div className="swmi-appreciation-head">
        <p>POSITIVE DISCUSSION</p>
        <h3>Teachers to Appreciate</h3>
        <span>Use these examples to identify practices worth sharing across the faculty.</span>
      </div>

      <RankingSection
        title="Highest Class Health"
        subtitle="Top 5 teacher averages"
        rows={report.highestClassHealthTeachers}
        kind="health"
        positive
      />
      <RankingSection
        title="Highest Student Feedback"
        subtitle="Top 5 response percentages"
        rows={report.highestFeedbackTeachers}
        kind="feedback"
        positive
      />
      <RankingSection
        title="Highest Doubt Closure"
        subtitle="Top 5 resolution percentages"
        rows={report.highestDoubtClosureTeachers}
        kind="closure"
        positive
      />

      <footer className="swmi-report-foot">
        <div>
          <b>Holiday exclusions</b>
          <span>
            {report.excludedHolidays.length
              ? report.excludedHolidays.map(h => `${formatDate(h.date)} · ${h.name}`).join("  |  ")
              : "No excluded holiday dates in this period."}
          </span>
        </div>
        <div>Talent Passport · School Intelligence</div>
      </footer>
    </div>
  );
}

export default function SchoolWeeklyMeetingInsights() {
  const [schoolUuid, setSchoolUuid] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [inlineReport, setInlineReport] = useState<SchoolWeeklyMeetingInsights | null>(null);
  const [popupReport, setPopupReport] = useState<SchoolWeeklyMeetingInsights | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popupLoading, setPopupLoading] = useState(false);
  const [error, setError] = useState("");
  const [popupError, setPopupError] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [inlinePdfBusy, setInlinePdfBusy] = useState(false);

  const popupReportRef = useRef<HTMLDivElement | null>(null);
  const inlineReportRef = useRef<HTMLDivElement | null>(null);

  const todayKey = getTodayIndiaDateKey();
  const previousWeek = useMemo(() => getPreviousCompletedWeek(todayKey), [todayKey]);

  useEffect(() => {
    try {
      const identity = requireSchoolIdentity();
      setSchoolUuid(String(identity.schoolUuid ?? ""));
      setStartDate(previousWeek.startDate);
      setEndDate(previousWeek.endDate);
    } catch (e) {
      console.warn("SCHOOL WEEKLY MEETING IDENTITY LOAD FAILED", e);
    }
  }, [previousWeek.startDate, previousWeek.endDate]);

  useEffect(() => {
    if (!schoolUuid || !isMonday(todayKey)) return;

    let cancelled = false;
    let timer: number | null = null;
    let interval: number | null = null;

    const maybeOpen = async () => {
      if (cancelled || popupOpen) return;
      const mondayKey = mondayOfWeek(todayKey);

      try {
        const closeRaw = localStorage.getItem(weeklyCloseKey(schoolUuid, mondayKey));
        const closedAt = closeRaw ? Number(closeRaw) : 0;
        if (closedAt && Date.now() - closedAt < TWO_HOURS) return;
      } catch {}

      const showAfterMorningBrief = () => {
        if (cancelled || popupOpen) return;
        setPopupLoading(true);
        setPopupError("");
        void loadSchoolWeeklyMeetingInsights(previousWeek.startDate, previousWeek.endDate)
          .then(report => {
            if (cancelled) return;
            setPopupReport(report);
            setAcknowledged(false);
            setPopupOpen(true);
          })
          .catch(error => {
            if (!cancelled) setPopupError(error?.message ?? "Unable to load weekly meeting analysis.");
          })
          .finally(() => {
            if (!cancelled) setPopupLoading(false);
          });
      };

      let morningDone = false;
      try {
        morningDone =
          localStorage.getItem(morningBriefKey(schoolUuid, todayKey)) === "completed";
      } catch {}

      if (morningDone) {
        showAfterMorningBrief();
        return;
      }

      const started = Date.now();
      const waitForMorning = () => {
        if (cancelled) return;
        let done = false;
        try {
          done = localStorage.getItem(morningBriefKey(schoolUuid, todayKey)) === "completed";
        } catch {}
        if (done) {
          // A short delay prevents the weekly layer from racing the Morning
          // Brief's first render when both effects mount together.
          timer = window.setTimeout(showAfterMorningBrief, 250);
          return;
        }
        if (Date.now() - started > 12000) {
          // Fail-open only if the Morning Brief itself never appeared. The
          // weekly report remains independent and must not block the Overview.
          timer = window.setTimeout(showAfterMorningBrief, 250);
          return;
        }
        timer = window.setTimeout(waitForMorning, 500);
      };
      waitForMorning();
    };

    void maybeOpen();

    interval = window.setInterval(() => void maybeOpen(), 60_000);
    return () => {
      cancelled = true;
      if (timer !== null) window.clearTimeout(timer);
      if (interval !== null) window.clearInterval(interval);
    };
  }, [schoolUuid, todayKey, previousWeek.startDate, previousWeek.endDate, popupOpen]);

  async function fetchInlineReport() {
    if (!startDate || !endDate || startDate > endDate) {
      setError("Select a valid start and end date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      setInlineReport(await loadSchoolWeeklyMeetingInsights(startDate, endDate));
    } catch (e: any) {
      setError(e?.message ?? "Unable to fetch the weekly meeting report.");
      setInlineReport(null);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf(
    sourceRef: RefObject<HTMLDivElement | null>,
    report: SchoolWeeklyMeetingInsights | null,
    setBusy: (value: boolean) => void,
  ) {
    if (!sourceRef.current || !report) return;
    setBusy(true);
    let clone: HTMLDivElement | null = null;
    try {
      const source = sourceRef.current;
      clone = source.cloneNode(true) as HTMLDivElement;
      clone.style.position = "absolute";
      clone.style.left = "-100000px";
      clone.style.top = "0";
      clone.style.width = `${Math.ceil(source.getBoundingClientRect().width)}px`;
      clone.style.maxHeight = "none";
      clone.style.height = "auto";
      clone.style.overflow = "visible";
      const clonedAck = clone.querySelector<HTMLElement>(".swmi-ack");
      if (clonedAck) clonedAck.style.display = "none";
      const clonedPopupScroll = clone.querySelector<HTMLElement>(".swmi-popup-scroll");
      if (clonedPopupScroll) {
        clonedPopupScroll.style.overflow = "visible";
        clonedPopupScroll.style.maxHeight = "none";
        clonedPopupScroll.style.height = "auto";
      }
      document.body.appendChild(clone);

      await document.fonts?.ready;

      const canvas = await html2canvas(clone, {
        backgroundColor: "#FFFFFF",
        scale: Math.min(2, Math.max(1, window.devicePixelRatio || 1)),
        useCORS: true,
        logging: false,
        imageTimeout: 15000,
        windowWidth: document.documentElement.clientWidth,
      });

      if (!canvas.width || !canvas.height) throw new Error("Weekly report PDF canvas was empty.");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
      const margin = 6;
      const contentWidth = 210 - margin * 2;
      const contentHeight = 297 - margin * 2;
      const sourcePageHeight = Math.floor((canvas.width * contentHeight) / contentWidth);

      let sourceY = 0;
      let page = 0;
      while (sourceY < canvas.height) {
        if (page > 0) pdf.addPage();
        const sliceHeight = Math.min(sourcePageHeight, canvas.height - sourceY);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;
        const context = pageCanvas.getContext("2d");
        if (!context) throw new Error("Unable to prepare weekly report PDF page.");
        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
        const image = pageCanvas.toDataURL("image/png", 1);
        const heightMm = (sliceHeight * contentWidth) / canvas.width;
        pdf.addImage(image, "PNG", margin, margin, contentWidth, heightMm, undefined, "FAST");
        sourceY += sliceHeight;
        page += 1;
      }

      const safeSchool = report.schoolName.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "") || "School";
      pdf.save(`Weekly-Meeting-Analysis-${safeSchool}-${report.startDate}-to-${report.endDate}.pdf`);
    } catch (e) {
      console.error("SCHOOL WEEKLY MEETING PDF DOWNLOAD FAILED", e);
    } finally {
      if (clone?.parentNode) clone.parentNode.removeChild(clone);
      setBusy(false);
    }
  }

  function closePopup() {
    if (!popupReport || !acknowledged) return;
    const mondayKey = mondayOfWeek(todayKey);
    try {
      localStorage.setItem(weeklyCloseKey(schoolUuid, mondayKey), String(Date.now()));
    } catch {}
    setPopupOpen(false);
  }

  const popup = popupOpen && popupReport;

  return (
    <>
      <section className="school-section swmi-generator">
        <div className="school-section-head swmi-generator-head">
          <div>
            <p className="school-eyebrow">Weekly Meeting Intelligence</p>
            <h2 className="school-section-title">Get Weekly Meeting Insights</h2>
            <p className="school-section-copy">
              Select any period and fetch the same detailed analysis used in the Monday management briefing.
            </p>
          </div>
          <span className="school-pill">Statement-style report</span>
        </div>

        <div className="swmi-controls">
          <label><span>START DATE</span><input type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} /></label>
          <label><span>END DATE</span><input type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} /></label>
          <button type="button" onClick={fetchInlineReport} disabled={loading}>
            {loading ? "FETCHING…" : "FETCH REPORT"}
          </button>
        </div>

        {error && <div className="swmi-error">{error}</div>}
        {!inlineReport && !loading && !error && (
          <div className="swmi-generator-empty">
            <b>Choose a period to generate the meeting report.</b>
            <span>Use Monday–Sunday for a normal weekly management meeting, or any custom date range when needed.</span>
          </div>
        )}

        {inlineReport && (
          <div className="swmi-inline-shell">
            <div className="swmi-inline-actions">
              <div>
                <b>{inlineReport.schoolName}</b>
                <span>{inlineReport.periodLabel}</span>
              </div>
              <button type="button" onClick={() => void downloadPdf(inlineReportRef, inlineReport, setInlinePdfBusy)} disabled={inlinePdfBusy}>
                {inlinePdfBusy ? "SAVING…" : "DOWNLOAD REPORT"}
              </button>
            </div>
            <ReportContent report={inlineReport} reportRef={inlineReportRef} />
          </div>
        )}
      </section>

      {popup && (
        <div className="swmi-overlay" role="dialog" aria-modal="true" aria-labelledby="swmi-popup-title">
          <div className="swmi-popup">
            <div className="swmi-popup-scroll">
              <div ref={popupReportRef} className="swmi-popup-export-surface">
                <div className="swmi-popup-titlebar">
                  <div>
                    <p className="swmi-kicker">MONDAY MANAGEMENT BRIEF</p>
                    <h2 id="swmi-popup-title">Weekly Meeting Analysis</h2>
                    <p>Last week · {popupReport.periodLabel}</p>
                  </div>
                  <span>1ST LOGIN · MONDAY</span>
                </div>

                <ReportContent report={popupReport} />

                <label className="swmi-ack">
                  <input type="checkbox" checked={acknowledged} onChange={(e: any) => setAcknowledged(e.target.checked)} />
                  I have reviewed this weekly meeting analysis.
                </label>
              </div>
            </div>

            <footer className="swmi-popup-foot">
              <span>{acknowledged ? "Acknowledged. You can close this report." : "Acknowledgement is required before closing."}</span>
              <div>
                <button
                  type="button"
                  className="swmi-download"
                  onClick={() => void downloadPdf(popupReportRef, popupReport, setPdfBusy)}
                  disabled={pdfBusy}
                >
                  {pdfBusy ? "SAVING…" : "SAVE PDF"}
                </button>
                <button type="button" className="swmi-close" onClick={closePopup} disabled={!acknowledged}>
                  CLOSE
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {popupLoading && !popupOpen && isMonday(todayKey) && (
        <div className="swmi-loading-chip">Preparing Monday weekly meeting analysis…</div>
      )}
      {popupError && <div className="swmi-background-error">{popupError}</div>}
    </>
  );
}

function isMonday(key: string) {
  return new Date(`${key}T00:00:00Z`).getUTCDay() === 1;
}
