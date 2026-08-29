import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { requireSchoolIdentity } from "../../../services/identityService";
import { getSchoolMorningBriefRawData } from "../repository/SchoolMorningBriefRepository";
import { buildSchoolMorningBrief, getMorningBriefPeriod, getTodayIndiaDateKey } from "../analytics/SchoolMorningBriefEngine";
import type { SchoolMorningBrief as SchoolMorningBriefModel, SchoolMorningBriefClassroomMetric } from "../types/SchoolMorningBriefModels";

const STORAGE_PREFIX = "schoolAdminMorningBriefAcknowledgement";

function storageKey(schoolUuid: string, dateKey: string) {
  return `${STORAGE_PREFIX}:${schoolUuid}:${dateKey}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function score(value: number | null) {
  return value === null ? "—" : `${value}%`;
}

function metricLine(row: SchoolMorningBriefClassroomMetric) {
  return `${row.classroom}: ${row.combinedScore}% combined (feedback ${row.responseRate}%, understanding ${row.understandingRate}%, doubt closure ${row.doubtClosureRate}%).`;
}

function buildPrintHtml(brief: SchoolMorningBriefModel) {
  const good = brief.topClassrooms.map(metricLine).map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  const attention = brief.attentionClassrooms.map(metricLine).map((line) => `<li>${escapeHtml(line)}</li>`).join("");

  return `
    <!doctype html>
    <html>
      <head>
        <title>Morning Brief - ${escapeHtml(brief.schoolName)} - ${escapeHtml(brief.todayDate)}</title>
        <style>
          *{box-sizing:border-box}body{margin:0;padding:28px;font-family:Arial,sans-serif;color:#0F172A;background:#fff}
          h1{margin:0 0 5px;font-size:22px}h2{margin:22px 0 8px;font-size:15px}.date{color:#64748B;font-size:12px;margin-bottom:18px}
          .hero{padding:16px;border:1px solid #FED7AA;background:#FFF7ED;border-radius:14px;margin-bottom:12px}.hero b{font-size:11px;color:#C2410C}
          .metrics{display:grid;grid-template-columns:1fr 1fr;gap:10px}.metric{border:1px solid #E2E8F0;border-radius:12px;padding:12px}.metric small{display:block;color:#64748B;font-size:9px;font-weight:700;text-transform:uppercase}.metric strong{display:block;margin-top:5px;font-size:20px}
          .period{color:#64748B;font-size:10px}.list{margin:0;padding-left:18px}.list li{margin:7px 0;font-size:11px;line-height:1.4}.good{border:1px solid #BBF7D0;background:#F0FDF4;border-radius:12px;padding:12px}.attention{border:1px solid #FED7AA;background:#FFF7ED;border-radius:12px;padding:12px}
        </style>
      </head>
      <body>
        <h1>Morning Brief: Yesterday Stats of Your School</h1>
        <div class="date">${escapeHtml(brief.schoolName)} · ${escapeHtml(brief.todayDay)}, ${escapeHtml(brief.todayDate)}</div>
        <div class="hero"><b>THIS IS WHAT HAPPENED IN YOUR SCHOOL ON ${escapeHtml(brief.yesterdayDay.toUpperCase())}, ${escapeHtml(brief.yesterdayDate.toUpperCase())}</b></div>
        <div class="metrics">
          <div class="metric"><small>Yesterday School Learning Health</small><strong>${escapeHtml(score(brief.yesterdayLearningHealth))}</strong><div class="period">Average of yesterday's teacher understanding percentages.</div></div>
          <div class="metric"><small>Yesterday Doubt Resolution</small><strong>${escapeHtml(score(brief.yesterdayDoubtClosureRate))}</strong><div class="period">Average of yesterday's teacher doubt-closure percentages.</div></div>
        </div>
        <h2>3 Things Going Well — Last 1 Week</h2><div class="good"><div class="period">${escapeHtml(brief.periodLabel)}</div><ol class="list">${good || "<li>No classroom activity was recorded in this period.</li>"}</ol></div>
        <h2>3 Things Requiring Attention</h2><div class="attention"><div class="period">Lowest combined classroom scores for the same period.</div><ol class="list">${attention || "<li>No classroom activity was recorded in this period.</li>"}</ol></div>
      </body>
    </html>
  `;
}

export default function SchoolMorningBrief() {
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState<SchoolMorningBriefModel | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const dateKey = getTodayIndiaDateKey();
      try {
        // The popup is a secondary layer. Never block or replace School Overview
        // when its independent data read fails.
        const identity = requireSchoolIdentity();
        const schoolUuid = String(identity.schoolUuid ?? "").trim();
        if (!schoolUuid) return;

        try {
          if (localStorage.getItem(storageKey(schoolUuid, dateKey)) === "completed") return;
        } catch (storageError) {
          console.error("SCHOOL MORNING BRIEF STORAGE READ FAILED", storageError);
        }

        const todayKey = dateKey;
        const period = getMorningBriefPeriod(todayKey);
        const raw = await getSchoolMorningBriefRawData(period.start, period.end);
        const next = buildSchoolMorningBrief(raw);

        if (cancelled) return;
        setBrief(next);
        setAcknowledged(false);
        setOpen(true);
      } catch (error) {
        console.error("SCHOOL MORNING BRIEF LOAD FAILED", error);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const canContinue = useMemo(() => acknowledged && !!brief, [acknowledged, brief]);

  function complete() {
    if (!canContinue || !brief) return;
    try {
      localStorage.setItem(storageKey(brief.schoolUuid, getTodayIndiaDateKey()), "completed");
    } catch (error) {
      console.error("SCHOOL MORNING BRIEF STORAGE WRITE FAILED", error);
    }
    setOpen(false);
  }

  async function downloadPdf() {
    if (!brief || !modalRef.current || pdfBusy) return;

    setPdfBusy(true);
    let clone: HTMLDivElement | null = null;

    try {
      // Generate the PDF directly in the current page. This deliberately avoids
      // window.open()/window.print(), which browsers can block as a popup.
      // The rendered source is a clone of the actual Morning Brief modal so the
      // PDF preserves the same content, cards, typography, spacing and theme.
      const source = modalRef.current;
      const sourceWidth = Math.ceil(source.getBoundingClientRect().width);

      clone = source.cloneNode(true) as HTMLDivElement;
      clone.removeAttribute("aria-hidden");
      clone.style.position = "absolute";
      clone.style.left = "-100000px";
      clone.style.top = "0";
      clone.style.width = `${sourceWidth}px`;
      clone.style.maxHeight = "none";
      clone.style.height = "auto";
      clone.style.overflow = "visible";
      clone.style.boxShadow = "none";

      const clonedBody = clone.querySelector<HTMLElement>(".school-morning-brief-body");
      if (clonedBody) {
        clonedBody.style.overflow = "visible";
        clonedBody.style.maxHeight = "none";
        clonedBody.style.height = "auto";
      }

      const clonedActions = clone.querySelector<HTMLElement>(".school-morning-brief-actions");
      if (clonedActions) clonedActions.style.display = "none";

      document.body.appendChild(clone);

      if (document.fonts?.ready) await document.fonts.ready;

      const canvas = await html2canvas(clone, {
        backgroundColor: "#FFFFFF",
        scale: Math.min(2, Math.max(1, window.devicePixelRatio || 1)),
        useCORS: true,
        logging: false,
        imageTimeout: 15000,
        windowWidth: document.documentElement.clientWidth,
      });

      if (!canvas.width || !canvas.height) {
        throw new Error("Morning Brief PDF canvas was empty");
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 7;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      const imageHeight = (canvas.height * contentWidth) / canvas.width;
      const pageSourceHeight = Math.floor((canvas.width * contentHeight) / contentWidth);

      let sourceY = 0;
      let pageIndex = 0;

      while (sourceY < canvas.height) {
        if (pageIndex > 0) pdf.addPage();

        const sliceHeight = Math.min(pageSourceHeight, canvas.height - sourceY);
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        const context = pageCanvas.getContext("2d");
        if (!context) throw new Error("Unable to prepare Morning Brief PDF page");

        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        context.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          pageCanvas.width,
          sliceHeight,
        );

        const sliceData = pageCanvas.toDataURL("image/png", 1.0);
        const sliceHeightMm = (sliceHeight * contentWidth) / canvas.width;
        pdf.addImage(sliceData, "PNG", margin, margin, contentWidth, sliceHeightMm, undefined, "FAST");

        sourceY += sliceHeight;
        pageIndex += 1;
      }

      const safeSchool = brief.schoolName
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "") || "School";
      pdf.save(`Morning-Brief-${safeSchool}-${getTodayIndiaDateKey()}.pdf`);
    } catch (error) {
      console.error("SCHOOL MORNING BRIEF PDF DOWNLOAD FAILED", error);
    } finally {
      if (clone?.parentNode) clone.parentNode.removeChild(clone);
      setPdfBusy(false);
    }
  }

  if (!open || !brief) return null;

  return (
    <div className="school-morning-brief-overlay" role="dialog" aria-modal="true" aria-labelledby="school-morning-brief-title">
      <style>{`
        .school-morning-brief-overlay{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(15,23,42,.58);backdrop-filter:blur(5px)}
        .school-morning-brief-modal{width:min(820px,100%);max-height:min(88vh,760px);overflow:hidden;display:flex;flex-direction:column;background:#FFF;border:1px solid #E2E8F0;border-radius:24px;box-shadow:0 24px 70px rgba(15,23,42,.22)}
        .school-morning-brief-head{padding:20px 22px 14px;border-bottom:1px solid #EEF2F7}.school-morning-brief-kicker{margin:0;color:#EA580C;font-size:10px;font-weight:900;letter-spacing:1.6px}.school-morning-brief-title{margin:6px 0 3px;color:#07142D;font-size:24px;line-height:1.12;font-weight:900}.school-morning-brief-date{margin:0;color:#64748B;font-size:11px;font-weight:800}.school-morning-brief-copy{margin:7px 0 0;color:#64748B;font-size:11px;line-height:1.4;font-weight:600}
        .school-morning-brief-body{min-height:0;overflow-y:auto;padding:14px 16px}.school-morning-brief-banner{padding:10px 12px;border:1px solid #FED7AA;background:#FFF7ED;border-radius:13px;color:#9A3412;font-size:10px;line-height:1.35;font-weight:900}.school-morning-brief-banner span{display:block;margin-top:3px;color:#C2410C;font-size:8px;font-weight:800}
        .school-morning-brief-metrics{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:10px}.school-morning-brief-metric{border:1px solid #E2E8F0;border-radius:13px;padding:11px;background:#FCFCFB}.school-morning-brief-metric small{display:block;color:#64748B;font-size:8px;font-weight:900;letter-spacing:.06em;text-transform:uppercase}.school-morning-brief-metric strong{display:block;margin-top:5px;color:#0F172A;font-size:24px;line-height:1;font-weight:950}.school-morning-brief-metric em{display:block;margin-top:5px;color:#94A3B8;font-size:8px;line-height:1.3;font-style:normal;font-weight:700}
        .school-morning-brief-section{margin-top:11px}.school-morning-brief-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;margin-bottom:6px}.school-morning-brief-section-head h3{margin:0;color:#0F172A;font-size:11px;font-weight:950}.school-morning-brief-section-head span{color:#94A3B8;font-size:7px;font-weight:800;text-align:right}.school-morning-brief-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.school-morning-brief-card{min-width:0;border:1px solid #BBF7D0;background:#F0FDF4;border-radius:12px;padding:9px}.school-morning-brief-card.attention{border-color:#FED7AA;background:#FFF7ED}.school-morning-brief-card h4{margin:0;color:#0F172A;font-size:10px;font-weight:950;overflow-wrap:anywhere}.school-morning-brief-score{margin-top:4px;color:#15803D;font-size:15px;font-weight:950}.attention .school-morning-brief-score{color:#C2410C}.school-morning-brief-sub{margin-top:3px;color:#64748B;font-size:7.5px;line-height:1.35;font-weight:700}.school-morning-brief-breakdown{display:flex;flex-wrap:wrap;gap:3px;margin-top:5px}.school-morning-brief-pill{padding:3px 5px;border-radius:999px;background:#FFF;border:1px solid #DDE5EA;color:#475569;font-size:6.5px;font-weight:850}
        .school-morning-brief-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 16px;border-top:1px solid #EEF2F7;background:#FCFCFB}.school-morning-brief-note{color:#94A3B8;font-size:8px;line-height:1.3;font-weight:700}.school-morning-brief-actions{display:flex;align-items:center;gap:6px}.school-morning-brief-download,.school-morning-brief-btn{border-radius:10px;padding:8px 11px;font-size:9px;font-weight:900;cursor:pointer}.school-morning-brief-download{border:1px solid #FED7AA;background:#FFF7ED;color:#C2410C}.school-morning-brief-download:disabled{opacity:.65;cursor:wait}.school-morning-brief-btn{border:1px solid #F97316;background:#F97316;color:#FFF}.school-morning-brief-btn:disabled{opacity:.45;cursor:not-allowed}
        .school-morning-brief-ack{display:flex;align-items:center;gap:6px;margin-top:9px;padding-top:8px;border-top:1px solid rgba(251,146,60,.2);color:#334155;font-size:9px;font-weight:900;cursor:pointer}.school-morning-brief-ack input{width:14px;height:14px;margin:0;accent-color:#F97316}
        @media(max-width:1024px){.school-morning-brief-overlay{padding:10px}.school-morning-brief-modal{width:min(650px,100%);max-height:90vh;border-radius:18px}.school-morning-brief-head{padding:13px 14px 10px}.school-morning-brief-title{font-size:18px}.school-morning-brief-copy{font-size:9px}.school-morning-brief-body{padding:9px}.school-morning-brief-metric{padding:9px}.school-morning-brief-metric strong{font-size:20px}.school-morning-brief-list{gap:5px}.school-morning-brief-card{padding:7px}.school-morning-brief-card h4{font-size:9px}.school-morning-brief-foot{padding:8px 9px}.school-morning-brief-note{font-size:7px}.school-morning-brief-download,.school-morning-brief-btn{padding:6px 8px;font-size:7px}}
        @media(max-width:600px){.school-morning-brief-overlay{padding:7px}.school-morning-brief-modal{max-height:93vh;border-radius:14px}.school-morning-brief-head{padding:10px 11px 8px}.school-morning-brief-kicker{font-size:6.5px;letter-spacing:.85px}.school-morning-brief-title{font-size:15px}.school-morning-brief-date{font-size:8px}.school-morning-brief-copy{font-size:7.5px}.school-morning-brief-body{padding:7px}.school-morning-brief-banner{padding:7px 8px;font-size:7.5px}.school-morning-brief-banner span{font-size:6.5px}.school-morning-brief-metrics{gap:5px;margin-top:6px}.school-morning-brief-metric{padding:7px;border-radius:10px}.school-morning-brief-metric small{font-size:6px}.school-morning-brief-metric strong{font-size:16px}.school-morning-brief-metric em{font-size:6px}.school-morning-brief-section{margin-top:7px}.school-morning-brief-section-head h3{font-size:8px}.school-morning-brief-section-head span{font-size:5.5px}.school-morning-brief-list{grid-template-columns:1fr 1fr;gap:4px}.school-morning-brief-card{padding:6px;border-radius:9px}.school-morning-brief-card h4{font-size:7.5px}.school-morning-brief-score{font-size:12px}.school-morning-brief-sub{font-size:6px}.school-morning-brief-pill{font-size:5.5px;padding:2px 4px}.school-morning-brief-ack{margin-top:5px;padding-top:5px;font-size:6.5px}.school-morning-brief-ack input{width:11px;height:11px}.school-morning-brief-foot{gap:5px;padding:6px 7px}.school-morning-brief-note{max-width:42%;font-size:6px}.school-morning-brief-actions{gap:4px}.school-morning-brief-download,.school-morning-brief-btn{padding:5px 6px;font-size:6px;border-radius:7px}}
      `}</style>

      <div ref={modalRef} className="school-morning-brief-modal">
        <header className="school-morning-brief-head">
          <p className="school-morning-brief-kicker">MORNING SCHOOL INTELLIGENCE</p>
          <h2 id="school-morning-brief-title" className="school-morning-brief-title">Morning Brief: Yesterday Stats of Your School</h2>
          <p className="school-morning-brief-date">{brief.todayDay} · {brief.todayDate}</p>
          <p className="school-morning-brief-copy">A concise daily view of what happened yesterday and which class sections are strongest or need attention.</p>
        </header>

        <main className="school-morning-brief-body">
          <div className="school-morning-brief-banner">
            THIS IS WHAT HAPPENED IN YOUR SCHOOL ON {brief.yesterdayDay.toUpperCase()}, {brief.yesterdayDate.toUpperCase()}
            <span>Yesterday figures are calculated independently from the existing School Overview calculations.</span>
          </div>

          <section className="school-morning-brief-metrics">
            <article className="school-morning-brief-metric">
              <small>Yesterday School Learning Health</small>
              <strong>{score(brief.yesterdayLearningHealth)}</strong>
              <em>Average of the understanding percentages of teachers who taught yesterday.</em>
            </article>
            <article className="school-morning-brief-metric">
              <small>Yesterday Doubt Resolution</small>
              <strong>{score(brief.yesterdayDoubtClosureRate)}</strong>
              <em>Average of the doubt-closure percentages of teachers with doubts yesterday.</em>
            </article>
          </section>

          <section className="school-morning-brief-section">
            <div className="school-morning-brief-section-head"><h3>3 THINGS GOING WELL — LAST 1 WEEK</h3><span>{brief.periodLabel}</span></div>
            <div className="school-morning-brief-list">
              {brief.topClassrooms.length ? brief.topClassrooms.map((row) => <ClassroomCard key={`good:${row.classroomKey}`} row={row} />) : <EmptyCard text="No classroom activity recorded in this period." />}
            </div>
          </section>

          <section className="school-morning-brief-section">
            <div className="school-morning-brief-section-head"><h3>3 THINGS REQUIRING ATTENTION</h3><span>Lowest combined scores</span></div>
            <div className="school-morning-brief-list">
              {brief.attentionClassrooms.length ? brief.attentionClassrooms.map((row) => <ClassroomCard key={`attention:${row.classroomKey}`} row={row} attention />) : <EmptyCard text="No classroom activity recorded in this period." />}
            </div>
          </section>

          <label className="school-morning-brief-ack">
            <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />
            Acknowledge this morning brief
          </label>
        </main>

        <footer className="school-morning-brief-foot">
          <div className="school-morning-brief-note">{acknowledged ? "Brief acknowledged. You can continue." : "Acknowledge the brief before continuing."}</div>
          <div className="school-morning-brief-actions">
            <button type="button" className="school-morning-brief-download" onClick={downloadPdf} disabled={pdfBusy}>{pdfBusy ? "SAVING…" : "SAVE PDF"}</button>
            <button type="button" className="school-morning-brief-btn" disabled={!canContinue} onClick={complete}>CONTINUE</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function ClassroomCard({ row, attention = false }: { row: SchoolMorningBriefClassroomMetric; attention?: boolean }) {
  return (
    <article className={`school-morning-brief-card${attention ? " attention" : ""}`}>
      <h4>{row.classroom}</h4>
      <div className="school-morning-brief-score">{row.combinedScore}% combined</div>
      <div className="school-morning-brief-sub">Based on classroom performance across the selected week.</div>
      <div className="school-morning-brief-breakdown">
        <span className="school-morning-brief-pill">Feedback {row.responseRate}%</span>
        <span className="school-morning-brief-pill">Understanding {row.understandingRate}%</span>
        <span className="school-morning-brief-pill">Closure {row.doubtClosureRate}%</span>
      </div>
    </article>
  );
}

function EmptyCard({ text }: { text: string }) {
  return <article className="school-morning-brief-card"><h4>{text}</h4></article>;
}
