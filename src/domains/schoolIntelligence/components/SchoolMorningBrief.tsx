import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { requireSchoolIdentity } from "../../../services/identityService";
import { getSchoolMorningBriefRawData } from "../repository/SchoolMorningBriefRepository";
import {
  buildSchoolMorningBrief,
  buildDoubtClassroomDetail,
  buildWeeklyDailyDetails,
  buildYesterdayClassroomDetails,
  getMorningBriefPeriod,
  getTodayIndiaDateKey,
} from "../analytics/SchoolMorningBriefEngine";
import type {
  SchoolMorningBrief as SchoolMorningBriefModel,
  SchoolMorningBriefClassroomMetric,
  SchoolMorningBriefDoubtClassMetric,
  SchoolMorningBriefMissingDailyLog,
  SchoolMorningBriefDoubtDetail,
  SchoolMorningBriefAssignmentDetail,
  SchoolMorningBriefClassroomDetail,
  SchoolMorningBriefStudentStatusDetail,
  SchoolMorningBriefWeeklyDayDetail,
} from "../types/SchoolMorningBriefModels";
import { downloadOrSharePdfBlob } from "../../../services/platform/nativeDocumentService";
import type { SchoolMorningBriefRawData } from "../repository/SchoolMorningBriefRepository";

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

function scopePdfCss(cssText: string, scope: string) {
  let output = "";
  let cursor = 0;

  while (cursor < cssText.length) {
    const openBrace = cssText.indexOf("{", cursor);
    if (openBrace === -1) {
      output += cssText.slice(cursor);
      break;
    }

    const header = cssText.slice(cursor, openBrace);
    let depth = 1;
    let closeBrace = openBrace + 1;
    while (closeBrace < cssText.length && depth > 0) {
      if (cssText[closeBrace] === "{") depth += 1;
      else if (cssText[closeBrace] === "}") depth -= 1;
      closeBrace += 1;
    }

    const body = cssText.slice(openBrace + 1, closeBrace - 1);
    const trimmedHeader = header.trim();

    if (trimmedHeader.startsWith("@media") || trimmedHeader.startsWith("@supports") || trimmedHeader.startsWith("@container")) {
      output += `${header}{${scopePdfCss(body, scope)}}`;
    } else if (trimmedHeader.startsWith("@")) {
      output += `${header}{${body}}`;
    } else {
      const selectors = header.split(",").map((selector) => selector.trim()).filter(Boolean);
      output += `${selectors.map((selector) => `${scope} ${selector}`).join(",")}{${body}}`;
    }

    cursor = closeBrace;
  }

  return output;
}

function score(value: number | null) {
  return value === null ? "—" : `${value}%`;
}

function metricDetailValue(assignment: SchoolMorningBriefAssignmentDetail, metric: MorningBriefMetric) {
  if (metric === "health") return assignment.learningHealth;
  if (metric === "understanding") return assignment.understandingRate;
  if (metric === "partial") return assignment.partialRate;
  if (metric === "didntUnderstand") return assignment.didntUnderstandRate;
  if (metric === "doubt") return assignment.doubtRate;
  return assignment.doubtClosureRate;
}

function metricDetailStudentRows(assignment: SchoolMorningBriefAssignmentDetail, metric: MorningBriefMetric) {
  if (metric === "health") return [
    { title: "Full understanding — full contribution", rows: assignment.completeStudents },
    { title: "Partial understanding — 50% health contribution", rows: assignment.partialStudents },
  ];
  if (metric === "understanding") return [{ title: "Students counted as fully understanding", rows: assignment.completeStudents }];
  if (metric === "partial") return [{ title: "Students counted as partially understanding", rows: assignment.partialStudents }];
  if (metric === "didntUnderstand") return [{ title: "Students counted as did not understand", rows: assignment.didntUnderstandStudents }];
  if (metric === "doubt") return [{
    title: "Learning-doubt signal students",
    rows: learningSignalStudents(assignment.partialStudents, assignment.didntUnderstandStudents),
  }];
  return [];
}

function mergeStudentStatusRows(rows: SchoolMorningBriefStudentStatusDetail[]) {
  const merged = new Map<string, SchoolMorningBriefStudentStatusDetail>();
  for (const row of rows) {
    const studentUuid = String(row.studentUuid ?? "").trim();
    if (!studentUuid) continue;
    const current = merged.get(studentUuid);
    merged.set(studentUuid, {
      studentUuid,
      studentName: row.studentName,
      observationCount: (current?.observationCount ?? 0) + row.observationCount,
    });
  }
  return Array.from(merged.values()).sort((a, b) =>
    a.studentName.localeCompare(b.studentName) || a.studentUuid.localeCompare(b.studentUuid),
  );
}

function learningSignalStudents(
  partialStudents: SchoolMorningBriefStudentStatusDetail[],
  didntUnderstandStudents: SchoolMorningBriefStudentStatusDetail[],
) {
  return mergeStudentStatusRows([...partialStudents, ...didntUnderstandStudents]);
}

function learningSignalOnlyStudents(
  partialStudents: SchoolMorningBriefStudentStatusDetail[],
  didntUnderstandStudents: SchoolMorningBriefStudentStatusDetail[],
  doubtDetails: SchoolMorningBriefDoubtDetail[],
) {
  const signalStudents = learningSignalStudents(partialStudents, didntUnderstandStudents);
  const explicitDoubtStudentUuids = new Set(
    doubtDetails
      .map((row) => String(row.studentUuid ?? "").trim())
      .filter(Boolean),
  );
  return signalStudents.filter((row) => !explicitDoubtStudentUuids.has(row.studentUuid));
}

function printStudentNames(rows: SchoolMorningBriefStudentStatusDetail[]) {
  return rows.length
    ? rows.map((row) => escapeHtml(`${row.studentName}${row.observationCount > 1 ? ` (${row.observationCount})` : ""}`)).join(", ")
    : "None recorded";
}

function printLearningSignalOnlyBlock(
  partialStudents: SchoolMorningBriefStudentStatusDetail[],
  didntUnderstandStudents: SchoolMorningBriefStudentStatusDetail[],
  doubtDetails: SchoolMorningBriefDoubtDetail[],
) {
  const signalOnly = learningSignalOnlyStudents(partialStudents, didntUnderstandStudents, doubtDetails);
  if (!signalOnly.length) return "";
  return `<div class="student-block attention"><strong>Learning-doubt signals without an explicit doubt record</strong><span>${signalOnly.length} student${signalOnly.length === 1 ? "" : "s"}</span><p>${printStudentNames(signalOnly)}</p></div>`;
}

function printDoubtRows(rows: SchoolMorningBriefDoubtDetail[]) {
  if (!rows.length) return `<div class="detail-empty">No explicit doubt record was available for this classroom/date. Learning-doubt signals may still come from Partial / Did Not Understand feedback.</div>`;
  return rows.map((row) => `
    <div class="doubt-row">
      <div class="doubt-row-head"><strong>${escapeHtml(row.studentName)}</strong><span class="${row.resolved ? "resolved" : "open"}">${row.resolved ? "Resolved" : "Open"}</span></div>
      <div class="doubt-topic">${escapeHtml(row.topic)}</div>
      <div class="doubt-text">${escapeHtml(row.doubt)}</div>
      <div class="doubt-meta">${escapeHtml(row.teacherName)} · ${escapeHtml(row.date)} · ${escapeHtml(row.source)}</div>
    </div>
  `).join("");
}

function buildMetricPrintSections(
  metric: MorningBriefMetric,
  classrooms: SchoolMorningBriefClassroomDetail[],
  value: number | null,
) {
  const title = detailTitle(metric);
  const explanation = detailExplanation(metric);
  const classroomHtml = classrooms.map((classroom) => `
    <section class="classroom-detail">
      <div class="classroom-detail-head">
        <strong>${escapeHtml(classroom.classroom)}</strong>
        <span>${classroom.assignmentDetails.length} teacher assignment${classroom.assignmentDetails.length === 1 ? "" : "s"}</span>
      </div>
      ${classroom.assignmentDetails.map((assignment) => `
        <div class="assignment-detail">
          <div class="assignment-head">
            <div><strong>${escapeHtml(assignment.classroom)}</strong><span>Teacher: ${escapeHtml(assignment.teacherName)}</span></div>
            <b>${escapeHtml(score(metricDetailValue(assignment, metric)))}</b>
          </div>
          <div class="mini-grid"><span>Logs <b>${assignment.logsCount}</b></span><span>Eligible observations <b>${assignment.eligibleStudentObservations}</b></span></div>
          ${metricDetailStudentRows(assignment, metric).map((group) => `
            <div class="student-block"><strong>${escapeHtml(group.title)}</strong><span>${group.rows.length} student${group.rows.length === 1 ? "" : "s"}</span><p>${printStudentNames(group.rows)}</p></div>
          `).join("")}
          ${metric === "doubt" || metric === "closure" ? `${metric === "doubt" ? printLearningSignalOnlyBlock(assignment.partialStudents, assignment.didntUnderstandStudents, assignment.doubtDetails) : ""}<div class="subhead">${metric === "doubt" ? "Actual doubt records" : "Doubt resolution records"}</div>${printDoubtRows(assignment.doubtDetails)}${metric === "closure" ? `<div class="resolution-note">Resolved: ${assignment.doubtDetails.filter((row) => row.resolved).length} · Open: ${assignment.doubtDetails.filter((row) => !row.resolved).length}</div>` : ""}` : ""}
        </div>
      `).join("")}
    </section>
  `).join("");

  return `
    <section class="report-section">
      <div class="detail-title-row"><div><div class="kicker">VERIFY THE MORNING BRIEF</div><h2>${escapeHtml(title)}</h2></div><strong class="detail-total">${escapeHtml(score(value))}</strong></div>
      <div class="explanation"><strong>How this number is calculated</strong><p>${escapeHtml(explanation)}</p></div>
      ${classroomHtml || `<div class="detail-empty">No classroom detail was available.</div>`}
    </section>
  `;
}

function buildDoubtPrintSection(
  row: SchoolMorningBriefDoubtClassMetric,
  detail: { doubtDetails: SchoolMorningBriefDoubtDetail[]; partialStudents: SchoolMorningBriefStudentStatusDetail[]; didntUnderstandStudents: SchoolMorningBriefStudentStatusDetail[] },
) {
  return `
    <section class="report-section">
      <div class="detail-title-row"><div><div class="kicker">YESTERDAY'S DOUBT DETAIL</div><h2>${escapeHtml(row.classroom)}</h2><p class="detail-subtitle">Teacher: ${escapeHtml(row.teacherNames.join(", ") || "Teacher unavailable")}</p></div><strong class="detail-total">${escapeHtml(`${row.doubtRate}% doubt`)}</strong></div>
      <div class="week-summary"><span>Partial <b>${row.partialRate}%</b></span><span>Didn't understand <b>${row.didntUnderstandRate}%</b></span><span>Eligible <b>${row.eligibleStudentObservations}</b></span></div>
      <div class="explanation"><strong>What the displayed doubt % means</strong><p>The card percentage is unchanged: Partial + Did Not Understand observations divided by eligible observations. The names below show the students behind those learning-doubt signals, followed by the actual doubt records available from the reconciled Loop 2 / Live evidence.</p></div>
      <div class="student-block"><strong>Partial understanding students</strong><span>${detail.partialStudents.length} student${detail.partialStudents.length === 1 ? "" : "s"}</span><p>${printStudentNames(detail.partialStudents)}</p></div>
      <div class="student-block attention"><strong>Did not understand students</strong><span>${detail.didntUnderstandStudents.length} student${detail.didntUnderstandStudents.length === 1 ? "" : "s"}</span><p>${printStudentNames(detail.didntUnderstandStudents)}</p></div>
      ${printLearningSignalOnlyBlock(detail.partialStudents, detail.didntUnderstandStudents, detail.doubtDetails)}
      <div class="subhead">Actual doubt records</div>
      ${printDoubtRows(detail.doubtDetails)}
    </section>
  `;
}

function buildWeeklyPrintSection(
  row: SchoolMorningBriefClassroomMetric,
  attention: boolean,
  dailyDetails: SchoolMorningBriefWeeklyDayDetail[],
) {
  return `
    <section class="report-section">
      <div class="detail-title-row"><div><div class="kicker">${attention ? "WEEKLY CLASSROOM DETAIL — REQUIRING ATTENTION" : "WEEKLY CLASSROOM DETAIL — GOING WELL"}</div><h2>${escapeHtml(row.classroom)}</h2><p class="detail-subtitle">Teacher: ${escapeHtml(row.teacherNames.join(", ") || "Teacher unavailable")}</p></div><strong class="detail-total">${row.combinedScore}% combined</strong></div>
      <div class="week-summary"><span>Feedback <b>${row.responseRate}%</b></span><span>Understanding <b>${row.understandingRate}%</b></span><span>Closure <b>${row.doubtClosureRate}%</b></span></div>
      <div class="explanation"><strong>Weekly detail</strong><p>The overall values above are the exact values already shown on the Morning Brief card. Each day below uses the same classroom assignment scope and canonical learning/live-reconciled evidence.</p></div>
      ${dailyDetails.map((day) => `
        <section class="week-day">
          <div class="week-day-head"><div><strong>${escapeHtml(day.day)}</strong><span>${escapeHtml(day.date)}</span></div><b>${day.logsCount} log${day.logsCount === 1 ? "" : "s"}</b></div>
          <div class="week-metrics"><span>Feedback <b>${day.feedbackRate}%</b></span><span>Understanding <b>${day.understandingRate}%</b></span><span>Closure <b>${day.doubtClosureRate}%</b></span></div>
          <div class="student-block"><strong>Feedback students</strong><span>${day.feedbackStudents.length}</span><p>${printStudentNames(day.feedbackStudents)}</p></div>
          <div class="student-block good"><strong>Understanding students</strong><span>${day.understandingStudents.length}</span><p>${printStudentNames(day.understandingStudents)}</p></div>
          <div class="student-block attention"><strong>Partial understanding</strong><span>${day.partialStudents.length}</span><p>${printStudentNames(day.partialStudents)}</p></div>
          <div class="student-block attention"><strong>Did not understand</strong><span>${day.didntUnderstandStudents.length}</span><p>${printStudentNames(day.didntUnderstandStudents)}</p></div>
          <div class="student-block good"><strong>Resolved doubts</strong><span>${day.resolvedDoubtStudents.length}</span><p>${printStudentNames(day.resolvedDoubtStudents)}</p></div>
          <div class="student-block attention"><strong>Open doubts</strong><span>${day.unresolvedDoubtStudents.length}</span><p>${printStudentNames(day.unresolvedDoubtStudents)}</p></div>
          ${printLearningSignalOnlyBlock(day.partialStudents, day.didntUnderstandStudents, day.doubtDetails)}
          <div class="subhead">Doubt / closure records</div>
          ${printDoubtRows(day.doubtDetails)}
        </section>
      `).join("")}
    </section>
  `;
}

function buildDetailedPrintHtml(brief: SchoolMorningBriefModel, rawData: SchoolMorningBriefRawData) {
  const yesterdayClassrooms = buildYesterdayClassroomDetails(rawData, brief.periodEnd);
  const metricValues: Record<MorningBriefMetric, number | null> = {
    health: brief.yesterdayLearningHealth,
    understanding: brief.yesterdayUnderstandingRate,
    partial: brief.yesterdayPartialUnderstandingRate,
    didntUnderstand: brief.yesterdayDidntUnderstandRate,
    doubt: brief.yesterdayDoubtRate,
    closure: brief.yesterdayDoubtClosureRate,
  };
  const metrics: MorningBriefMetric[] = ["health", "understanding", "partial", "didntUnderstand", "doubt", "closure"];

  const doubtDetails = brief.yesterdayTopDoubtClasses.map((row) =>
    buildDoubtClassroomDetail(rawData, row, brief.periodEnd),
  );

  const weeklyRows = [...brief.topClassrooms, ...brief.attentionClassrooms].filter((row, index, rows) =>
    rows.findIndex((candidate) => candidate.classroomKey === row.classroomKey) === index,
  );
  const weeklyDetails = weeklyRows.map((row) => {
    const assignmentIds = new Set(
      rawData.assignments
        .filter((assignment: any) =>
          sameValue(assignment.class_name, row.className) &&
          sameValue(assignment.section_name, row.sectionName) &&
          sameValue(assignment.subject_name, row.subjectName),
        )
        .map((assignment: any) => String(assignment.id ?? "").trim())
        .filter(Boolean),
    );
    const scopedDoubts = rawData.doubts.filter((doubt: any) =>
      assignmentIds.has(String(doubt.teacher_assignment_uuid ?? "")),
    );
    return {
      row,
      attention: brief.attentionClassrooms.some((candidate) => candidate.classroomKey === row.classroomKey),
      dailyDetails: buildWeeklyDailyDetails(rawData, { assignmentIds }, brief.periodStart, brief.periodEnd, scopedDoubts),
    };
  });

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Morning Brief - ${escapeHtml(brief.schoolName)} - ${escapeHtml(brief.todayDate)}</title>
        <style>
          *{box-sizing:border-box}.school-morning-pdf-report-root{margin:0;padding:8mm;font-family:Arial,sans-serif;color:#0F172A;background:#fff;font-size:9px;line-height:1.4}
          h1{margin:0 0 2mm;font-size:21px;line-height:1.15}h2{margin:0;font-size:13px;line-height:1.25}.date{color:#64748B;font-size:9px;margin-bottom:5mm}.hero{padding:3mm;border:1px solid #FED7AA;background:#FFF7ED;border-radius:3mm;margin-bottom:4mm}.hero b{font-size:8px;color:#C2410C}.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}.metric{border:1px solid #E2E8F0;border-radius:3mm;padding:3mm;min-height:22mm}.metric small{display:block;color:#64748B;font-size:7px;font-weight:700;text-transform:uppercase}.metric strong{display:block;margin-top:1.5mm;font-size:16px}.metric span{display:block;margin-top:1mm;color:#64748B;font-size:7px}
          .metric-report-block{margin-top:5mm}.metric-report-block:first-of-type{margin-top:0}.report-section{margin-top:7mm;page-break-inside:auto}.detail-title-row{display:flex;justify-content:space-between;gap:5mm;align-items:flex-start;border-bottom:1px solid #E2E8F0;padding-bottom:2mm}.kicker{font-size:7px;font-weight:800;letter-spacing:.9px;color:#C2410C;text-transform:uppercase}.detail-subtitle{margin:1mm 0 0;color:#64748B;font-size:8px}.detail-total{font-size:15px;color:#C2410C;white-space:nowrap}.explanation{margin:3mm 0;padding:3mm;border:1px solid #E2E8F0;border-radius:2.5mm;background:#F8FAFC}.explanation strong{font-size:8px}.explanation p{margin:1mm 0 0;color:#475569;font-size:7.5px;line-height:1.45}
          .classroom-detail{margin-top:4mm;border:1px solid #CBD5E1;border-radius:3mm;padding:3mm;page-break-inside:auto}.classroom-detail-head{display:flex;justify-content:space-between;gap:4mm;align-items:center;border-bottom:1px solid #E2E8F0;padding-bottom:2mm}.classroom-detail-head strong{font-size:9px}.classroom-detail-head span{color:#64748B;font-size:7px}.assignment-detail{margin-top:3mm;border:1px solid #E2E8F0;border-radius:2.5mm;padding:2.5mm;page-break-inside:auto}.assignment-head{display:flex;justify-content:space-between;gap:4mm}.assignment-head strong{display:block;font-size:8px}.assignment-head span{display:block;color:#64748B;font-size:7px;margin-top:.7mm}.assignment-head>b{font-size:12px;color:#C2410C;white-space:nowrap}.mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:2mm;margin-top:2mm}.mini-grid span,.week-metrics span,.week-summary span{display:block;padding:1.5mm 2mm;border:1px solid #E2E8F0;border-radius:2mm;color:#475569;font-size:7px}.student-block{margin-top:2mm;padding:2mm;border:1px solid #E2E8F0;border-radius:2mm;background:#fff}.student-block.good{background:#F0FDF4;border-color:#BBF7D0}.student-block.attention{background:#FFF7ED;border-color:#FED7AA}.student-block>strong{font-size:7.5px}.student-block>span{float:right;color:#64748B;font-size:7px}.student-block p{clear:both;margin:1mm 0 0;color:#334155;font-size:7px;line-height:1.5}.subhead{margin:3mm 0 1.5mm;font-weight:800;font-size:8px}.doubt-row{margin-top:1.5mm;padding:2mm;border:1px solid #E2E8F0;border-radius:2mm}.doubt-row-head{display:flex;justify-content:space-between}.doubt-row-head strong{font-size:7.5px}.resolved,.open{font-size:6.5px;font-weight:800}.resolved{color:#15803D}.open{color:#C2410C}.doubt-topic{margin-top:1mm;font-weight:700;font-size:7px}.doubt-text{margin-top:.7mm;font-size:7px;color:#334155}.doubt-meta{margin-top:1mm;color:#64748B;font-size:6.5px}.resolution-note{margin-top:2mm;color:#475569;font-size:7px}.detail-empty{padding:3mm;border:1px dashed #CBD5E1;border-radius:2mm;color:#64748B;font-size:7px}.week-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:2mm;margin:3mm 0}.week-day{margin-top:3mm;border:1px solid #CBD5E1;border-radius:3mm;padding:3mm;page-break-inside:auto}.week-day-head{display:flex;justify-content:space-between;gap:4mm;border-bottom:1px solid #E2E8F0;padding-bottom:2mm}.week-day-head strong{font-size:8.5px}.week-day-head span{display:block;color:#64748B;font-size:7px}.week-day-head>b{font-size:7px;color:#64748B}.week-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:2mm;margin:2mm 0}.period-note{color:#64748B;font-size:7px}
          .page-break{page-break-before:always}.avoid-break{page-break-inside:avoid}
          @media print{.school-morning-pdf-report-root{padding:8mm}.report-section{page-break-before:auto}.classroom-detail,.assignment-detail,.week-day{break-inside:auto}.doubt-row,.student-block{break-inside:avoid}}
        </style>
      </head>
      <body>
        <h1>Morning Brief: Yesterday Stats of Your School</h1>
        <div class="date">${escapeHtml(brief.schoolName)} · ${escapeHtml(brief.todayDay)}, ${escapeHtml(brief.todayDate)}</div>
        <div class="hero"><b>THIS IS WHAT HAPPENED IN YOUR SCHOOL ON ${escapeHtml(brief.yesterdayDay.toUpperCase())}, ${escapeHtml(brief.yesterdayDate.toUpperCase())}</b></div>
        ${metrics.map((metric) => {
          const labels: Record<MorningBriefMetric, string> = {
            health: "School's Learning Health %",
            understanding: "Full Understanding %",
            partial: "Partial Understanding %",
            didntUnderstand: "Did Not Understand %",
            doubt: "Yesterday's Raised Doubt %",
            closure: "Yesterday's Doubt Closure",
          };
          const notes: Record<MorningBriefMetric, string> = {
            health: "Detailed class · section · subject student evidence appears below.",
            understanding: "Students counted as fully understanding appear below.",
            partial: "Students counted as partial appear below.",
            didntUnderstand: "Students counted as did not understand appear below.",
            doubt: "Learning-doubt signals and actual doubt records appear below.",
            closure: "Resolved and open doubt evidence appears below.",
          };
          return `<section class="metric-report-block"><div class="metrics"><div class="metric"><small>${escapeHtml(labels[metric])}</small><strong>${escapeHtml(score(metricValues[metric]))}</strong><span>${escapeHtml(notes[metric])}</span></div></div>${buildMetricPrintSections(metric, yesterdayClassrooms, metricValues[metric])}</section>`;
        }).join("")}
        <section class="report-section">
          <div class="detail-title-row"><div><div class="kicker">YESTERDAY'S CLASSES WITH MAXIMUM DOUBTS</div><h2>Top 3 class · section · subject by doubt %</h2></div></div>
          ${doubtDetails.map((detail, index) => buildDoubtPrintSection(brief.yesterdayTopDoubtClasses[index], detail)).join("") || `<div class="detail-empty">No yesterday classroom doubt signal was recorded.</div>`}
        </section>
        <section class="report-section">
          <div class="detail-title-row"><div><div class="kicker">DAILY LOG FOLLOW-UP</div><h2>Teachers Who Missed Yesterday's Daily Logs</h2></div></div>
          ${brief.missingDailyLogs.length ? brief.missingDailyLogs.map((row) => `<div class="assignment-detail"><div class="assignment-head"><div><strong>${escapeHtml(row.teacherName)}</strong><span>Missed ${row.missedLogs} Daily Log${row.missedLogs === 1 ? "" : "s"}</span></div></div><div class="student-block"><strong>Assignments</strong><p>${row.assignments.map((assignment) => escapeHtml(`${assignment.className} · ${assignment.sectionName} · ${assignment.subjectName}`)).join(", ")}</p></div></div>`).join("") : `<div class="detail-empty">No missed Daily Logs were identified for yesterday.</div>`}
        </section>
        <section class="report-section">
          <div class="detail-title-row"><div><div class="kicker">LAST 1 WEEK</div><h2>3 Things Going Well + 3 Things Requiring Attention</h2><p class="detail-subtitle">${escapeHtml(brief.periodLabel)}</p></div></div>
          ${weeklyDetails.map((item) => buildWeeklyPrintSection(item.row, item.attention, item.dailyDetails)).join("") || `<div class="detail-empty">No classroom activity was recorded in this period.</div>`}
        </section>
      </body>
    </html>
  `;
}

export default function SchoolMorningBrief() {
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState<SchoolMorningBriefModel | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [detail, setDetail] = useState<MorningBriefDetail | null>(null);
  const [rawData, setRawData] = useState<SchoolMorningBriefRawData | null>(null);
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
        setRawData(raw);
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
    setDetail(null);
    setOpen(false);
  }

  async function downloadPdf() {
    if (!brief || !modalRef.current || pdfBusy) return;

    setPdfBusy(true);
    let reportHost: HTMLDivElement | null = null;
    let summaryClone: HTMLDivElement | null = null;

    try {
      // The PDF contains two intentional layers:
      // 1) the existing Morning Brief summary view, cloned from the live popup
      //    so its current card layout stays visually identical;
      // 2) the existing V13 full-detail report immediately below it.
      // Both are rendered as a fixed desktop variant regardless of the device
      // viewport from which SAVE PDF is pressed.
      if (!rawData) return;

      reportHost = document.createElement("div");
      reportHost.className = "tp-school-morning-brief-pdf-host";
      reportHost.style.position = "fixed";
      reportHost.style.left = "-100000px";
      reportHost.style.top = "0";
      reportHost.style.width = "820px";
      reportHost.style.background = "#FFFFFF";
      reportHost.style.pointerEvents = "none";
      reportHost.style.zIndex = "-1";

      // Summary layer: use the actual on-screen summary DOM rather than
      // rebuilding it from a second data model. This preserves the original
      // summary layout/cards and prevents PDF-only drift from the UI.
      summaryClone = modalRef.current.cloneNode(true) as HTMLDivElement;
      summaryClone.removeAttribute("aria-hidden");
      summaryClone.style.position = "relative";
      summaryClone.style.left = "auto";
      summaryClone.style.top = "auto";
      summaryClone.style.width = "820px";
      summaryClone.style.maxWidth = "820px";
      summaryClone.style.maxHeight = "none";
      summaryClone.style.height = "auto";
      summaryClone.style.overflow = "visible";
      summaryClone.style.boxShadow = "0 18px 45px rgba(15,23,42,.16)";
      summaryClone.style.margin = "0 auto";
      summaryClone.style.flex = "none";

      // Force the desktop summary variant even when SAVE PDF is pressed from a
      // tablet/mobile viewport. The responsive rules remain untouched in the
      // real UI; these overrides exist only inside this detached PDF clone.
      const summaryDesktopStyle = document.createElement("style");
      summaryDesktopStyle.textContent = scopePdfCss(`
        .school-morning-brief-modal{width:820px !important;max-width:820px !important;max-height:none !important;height:auto !important;overflow:visible !important;border-radius:24px !important}
        .school-morning-brief-head{padding:20px 22px 14px !important}
        .school-morning-brief-kicker{font-size:10px !important;letter-spacing:1.6px !important}
        .school-morning-brief-title{font-size:24px !important}
        .school-morning-brief-date{font-size:11px !important}
        .school-morning-brief-copy{font-size:11px !important}
        .school-morning-brief-body{padding:14px 16px !important;overflow:visible !important;min-height:0 !important}
        .school-morning-brief-banner{padding:10px 12px !important;font-size:10px !important}
        .school-morning-brief-banner span{font-size:8px !important}
        .school-morning-brief-metrics{grid-template-columns:repeat(6,minmax(0,1fr)) !important;gap:9px !important;margin-top:10px !important}
        .school-morning-brief-metric{padding:11px !important;border-radius:13px !important}
        .school-morning-brief-metric small{font-size:8px !important}
        .school-morning-brief-metric strong{font-size:24px !important}
        .school-morning-brief-metric em{font-size:8px !important}
        .school-morning-brief-section{margin-top:11px !important}
        .school-morning-brief-section-head h3{font-size:11px !important}
        .school-morning-brief-section-head span{font-size:7px !important}
        .school-morning-brief-list,.school-morning-brief-doubt-list{grid-template-columns:repeat(3,minmax(0,1fr)) !important;gap:7px !important}
        .school-morning-brief-card,.school-morning-brief-doubt-card{padding:9px !important;border-radius:12px !important}
        .school-morning-brief-card h4,.school-morning-brief-doubt-card h4{font-size:10px !important}
        .school-morning-brief-score,.school-morning-brief-doubt-score{font-size:15px !important}
        .school-morning-brief-doubt-score{font-size:16px !important}
        .school-morning-brief-sub,.school-morning-brief-doubt-teacher{font-size:7.5px !important}
        .school-morning-brief-pill{font-size:6.5px !important;padding:3px 5px !important}
        .school-morning-brief-missed-row{grid-template-columns:minmax(120px,.8fr) auto minmax(220px,1.8fr) !important;gap:9px !important;padding:8px 10px !important}
        .school-morning-brief-missed-teacher{font-size:8.5px !important}
        .school-morning-brief-missed-count{font-size:7px !important;padding:3px 6px !important}
        .school-morning-brief-assignment{font-size:6.5px !important;padding:3px 5px !important}
        .school-morning-brief-empty{font-size:8px !important;padding:9px !important}
        .school-morning-brief-ack{margin-top:9px !important;padding-top:8px !important;font-size:9px !important}
        .school-morning-brief-ack input{width:14px !important;height:14px !important}
        .school-morning-brief-foot{gap:10px !important;padding:11px 16px !important}
        .school-morning-brief-note{font-size:8px !important}
        .school-morning-brief-actions{gap:6px !important}
        .school-morning-brief-download,.school-morning-brief-btn{padding:8px 11px !important;font-size:9px !important;border-radius:10px !important}
      `, ".tp-school-morning-brief-pdf-host");
      summaryClone.insertBefore(summaryDesktopStyle, summaryClone.firstChild);
      reportHost.appendChild(summaryClone);

      // Keep the V13 detailed report as a separate A4-width layer so its
      // existing typography, spacing, data presentation and bounded-slice
      // renderer remain unchanged. It is placed after the summary layer.
      const parsedReport = new DOMParser().parseFromString(
        buildDetailedPrintHtml(brief, rawData),
        "text/html",
      );
      parsedReport.head.querySelectorAll("style").forEach((style) => {
        const scopedStyle = document.createElement("style");
        scopedStyle.textContent = scopePdfCss(style.textContent, ".tp-school-morning-brief-pdf-host");
        reportHost?.appendChild(scopedStyle);
      });
      const detailSpacer = document.createElement("div");
      detailSpacer.style.height = "32px";
      detailSpacer.style.background = "#FFFFFF";
      reportHost.appendChild(detailSpacer);

      const detailRoot = document.createElement("div");
      detailRoot.className = "school-morning-pdf-report-root";
      detailRoot.style.width = "210mm";
      detailRoot.style.margin = "0 auto";
      detailRoot.innerHTML = parsedReport.body.innerHTML;
      reportHost.appendChild(detailRoot);

      document.body.appendChild(reportHost);

      if (document.fonts?.ready) await document.fonts.ready;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      // Summary: render the desktop summary clone in bounded A4-height slices.
      // This preserves the original summary layout while avoiding a giant
      // canvas even for schools with a long summary list.
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 7;
      const contentWidth = pageWidth - margin * 2;
      const contentHeight = pageHeight - margin * 2;
      const maxPixelsPerSlice = 6000000;
      let pageIndex = 0;

      const renderRootSlices = async (root: HTMLElement, rootWidth: number, startPageIndex: number) => {
        const baseWidth = Math.max(1, Math.ceil(rootWidth));
        const baseHeight = Math.max(1, Math.ceil(root.getBoundingClientRect().height));
        const pageCssHeight = Math.max(1, Math.floor((baseWidth * contentHeight) / contentWidth));
        const preferredScale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
        const sliceArea = Math.max(1, baseWidth * Math.min(pageCssHeight, baseHeight));
        const areaLimitedScale = Math.sqrt(maxPixelsPerSlice / sliceArea);
        const renderScale = Math.max(1, Math.min(preferredScale, areaLimitedScale));

        let sourceY = 0;
        let localPageIndex = startPageIndex;
        while (sourceY < baseHeight) {
          const sliceCssHeight = Math.min(pageCssHeight, baseHeight - sourceY);
          const pageCanvas = await html2canvas(root, {
            backgroundColor: "#FFFFFF",
            scale: renderScale,
            useCORS: true,
            logging: false,
            imageTimeout: 15000,
            windowWidth: baseWidth,
            windowHeight: sliceCssHeight,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: sourceY,
            width: baseWidth,
            height: sliceCssHeight,
          });

          if (!pageCanvas.width || !pageCanvas.height) {
            throw new Error("Unable to prepare Morning Brief PDF page");
          }

          if (localPageIndex > 0) pdf.addPage();

          const sliceData = pageCanvas.toDataURL("image/png", 1.0);
          const sliceHeightMm = (pageCanvas.height * contentWidth) / pageCanvas.width;
          pdf.addImage(
            sliceData,
            "PNG",
            margin,
            margin,
            contentWidth,
            sliceHeightMm,
            undefined,
            "FAST",
          );

          sourceY += sliceCssHeight;
          localPageIndex += 1;
        }
        return localPageIndex;
      };

      pageIndex = await renderRootSlices(summaryClone, 820, pageIndex);
      pageIndex = await renderRootSlices(detailRoot, Math.max(1, Math.ceil(detailRoot.getBoundingClientRect().width)), pageIndex);

      const safeSchool = brief.schoolName
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "") || "School";
      await downloadOrSharePdfBlob(
        pdf.output("blob"),
        `Morning-Brief-${safeSchool}-${getTodayIndiaDateKey()}.pdf`,
        "Talent Passport — School Morning Brief"
      );
    } catch (error) {
      console.error("SCHOOL MORNING BRIEF PDF DOWNLOAD FAILED", error);
    } finally {
      if (reportHost?.parentNode) reportHost.parentNode.removeChild(reportHost);
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
        .school-morning-brief-metrics{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:9px;margin-top:10px}.school-morning-brief-metric{border:1px solid #E2E8F0;border-radius:13px;padding:11px;background:#FCFCFB}.school-morning-brief-metric small{display:block;color:#64748B;font-size:8px;font-weight:900;letter-spacing:.06em;text-transform:uppercase}.school-morning-brief-metric strong{display:block;margin-top:5px;color:#0F172A;font-size:24px;line-height:1;font-weight:950}.school-morning-brief-metric em{display:block;margin-top:5px;color:#94A3B8;font-size:8px;line-height:1.3;font-style:normal;font-weight:700}
        .school-morning-brief-section{margin-top:11px}.school-morning-brief-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:8px;margin-bottom:6px}.school-morning-brief-section-head h3{margin:0;color:#0F172A;font-size:11px;font-weight:950}.school-morning-brief-section-head span{color:#94A3B8;font-size:7px;font-weight:800;text-align:right}
        .school-morning-brief-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.school-morning-brief-card{min-width:0;border:1px solid #BBF7D0;background:#F0FDF4;border-radius:12px;padding:9px}.school-morning-brief-card.attention{border-color:#FED7AA;background:#FFF7ED}.school-morning-brief-card h4{margin:0;color:#0F172A;font-size:10px;font-weight:950;overflow-wrap:anywhere}.school-morning-brief-score{margin-top:4px;color:#15803D;font-size:15px;font-weight:950}.attention .school-morning-brief-score{color:#C2410C}.school-morning-brief-sub{margin-top:3px;color:#64748B;font-size:7.5px;line-height:1.35;font-weight:700}.school-morning-brief-breakdown{display:flex;flex-wrap:wrap;gap:3px;margin-top:5px}.school-morning-brief-pill{padding:3px 5px;border-radius:999px;background:#FFF;border:1px solid #DDE5EA;color:#475569;font-size:6.5px;font-weight:850}
        .school-morning-brief-doubt-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.school-morning-brief-doubt-card{min-width:0;border:1px solid #FED7AA;background:#FFF7ED;border-radius:12px;padding:9px}.school-morning-brief-doubt-card h4{margin:0;color:#0F172A;font-size:10px;font-weight:950;overflow-wrap:anywhere}.school-morning-brief-doubt-score{margin-top:4px;color:#C2410C;font-size:16px;font-weight:950}.school-morning-brief-doubt-teacher{margin-top:3px;color:#475569;font-size:7.5px;line-height:1.35;font-weight:800}.school-morning-brief-doubt-breakdown{display:flex;flex-wrap:wrap;gap:3px;margin-top:5px}
        .school-morning-brief-missed{border:1px solid #FDE2E2;background:#FFFDFD;border-radius:12px;overflow:hidden}.school-morning-brief-missed-row{display:grid;grid-template-columns:minmax(120px,.8fr) auto minmax(220px,1.8fr);gap:9px;align-items:start;padding:8px 10px;border-bottom:1px solid #F1F5F9}.school-morning-brief-missed-row:last-child{border-bottom:0}.school-morning-brief-missed-teacher{color:#0F172A;font-size:8.5px;font-weight:950}.school-morning-brief-missed-count{justify-self:start;padding:3px 6px;border-radius:999px;background:#FFF1F2;border:1px solid #FECDD3;color:#BE123C;font-size:7px;font-weight:950;white-space:nowrap}.school-morning-brief-assignment-list{display:flex;flex-wrap:wrap;gap:3px}.school-morning-brief-assignment{padding:3px 5px;border:1px solid #E2E8F0;border-radius:999px;background:#FFF;color:#475569;font-size:6.5px;font-weight:800;line-height:1.2}
        .school-morning-brief-empty{border:1px solid #E2E8F0;background:#FCFCFB;border-radius:12px;padding:9px;color:#64748B;font-size:8px;font-weight:800}
        .school-morning-brief-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 16px;border-top:1px solid #EEF2F7;background:#FCFCFB}.school-morning-brief-note{color:#94A3B8;font-size:8px;line-height:1.3;font-weight:700}.school-morning-brief-actions{display:flex;align-items:center;gap:6px}.school-morning-brief-download,.school-morning-brief-btn{border-radius:10px;padding:8px 11px;font-size:9px;font-weight:900;cursor:pointer}.school-morning-brief-download{border:1px solid #FED7AA;background:#FFF7ED;color:#C2410C}.school-morning-brief-download:disabled{opacity:.65;cursor:wait}.school-morning-brief-btn{border:1px solid #F97316;background:#F97316;color:#FFF}.school-morning-brief-btn:disabled{opacity:.45;cursor:not-allowed}
        .school-morning-brief-ack{display:flex;align-items:center;gap:6px;margin-top:9px;padding-top:8px;border-top:1px solid rgba(251,146,60,.2);color:#334155;font-size:9px;font-weight:900;cursor:pointer}.school-morning-brief-ack input{width:14px;height:14px;margin:0;accent-color:#F97316}
        .school-morning-brief-metric,.school-morning-brief-card,.school-morning-brief-doubt-card{font-family:inherit;text-align:left;cursor:pointer;appearance:none;-webkit-appearance:none;width:100%;box-sizing:border-box}
        .school-morning-brief-metric:hover,.school-morning-brief-card:hover,.school-morning-brief-doubt-card:hover{box-shadow:0 5px 16px rgba(15,23,42,.07);transform:translateY(-1px)}
        .school-morning-brief-metric:focus-visible,.school-morning-brief-card:focus-visible,.school-morning-brief-doubt-card:focus-visible,.school-morning-detail-close:focus-visible{outline:2px solid #F97316;outline-offset:2px}
        .school-morning-detail-overlay{position:fixed;inset:0;z-index:10002;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.34);backdrop-filter:blur(2px)}
        .school-morning-detail-modal{width:min(410px,calc(100vw - 28px));max-height:min(78vh,620px);display:flex;flex-direction:column;overflow:hidden;background:#FFF;border:1px solid #E2E8F0;border-radius:18px;box-shadow:0 22px 60px rgba(15,23,42,.24)}
        .school-morning-detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:14px 15px 11px;border-bottom:1px solid #EEF2F7;background:#FFF}.school-morning-detail-kicker{margin:0 0 4px;color:#EA580C;font-size:7px;font-weight:950;letter-spacing:1.1px}.school-morning-detail-head h3{margin:0;color:#07142D;font-size:15px;line-height:1.18;font-weight:950}.school-morning-detail-head p{margin:4px 0 0;color:#64748B;font-size:7.5px;line-height:1.35;font-weight:750}.school-morning-detail-close{flex:0 0 auto;width:27px;height:27px;border:1px solid #E2E8F0;border-radius:50%;background:#FFF;color:#0F172A;font-size:20px;line-height:1;cursor:pointer}.school-morning-detail-body{min-height:0;overflow-y:auto;padding:10px}.school-morning-detail-explanation{padding:9px 10px;border:1px solid #FED7AA;background:#FFF7ED;border-radius:11px;margin-bottom:8px}.school-morning-detail-explanation strong{display:block;color:#9A3412;font-size:8px;font-weight:950}.school-morning-detail-explanation p{margin:4px 0 0;color:#64748B;font-size:7px;line-height:1.45;font-weight:650}.school-morning-detail-classroom{margin-top:8px}.school-morning-detail-classroom-head{display:flex;align-items:flex-end;justify-content:space-between;gap:7px;margin-bottom:5px}.school-morning-detail-classroom-head h4{margin:0;color:#0F172A;font-size:9px;line-height:1.25;font-weight:950}.school-morning-detail-classroom-head span{color:#94A3B8;font-size:6px;font-weight:800;text-align:right}.school-morning-detail-assignment{padding:8px;border:1px solid #E2E8F0;background:#FCFCFB;border-radius:11px;margin-bottom:6px}.school-morning-detail-assignment-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}.school-morning-detail-assignment-head strong{display:block;color:#0F172A;font-size:8px;line-height:1.3;font-weight:950}.school-morning-detail-assignment-head span{display:block;margin-top:2px;color:#64748B;font-size:6.5px;font-weight:750}.school-morning-detail-assignment-head>b{color:#0F172A;font-size:14px;font-weight:950;white-space:nowrap}.school-morning-detail-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:6px 0}.school-morning-detail-mini-grid span{padding:4px 5px;border:1px solid #E2E8F0;border-radius:7px;background:#FFF;color:#64748B;font-size:6px;font-weight:750}.school-morning-detail-mini-grid b{color:#0F172A}.school-morning-detail-student-block{margin-top:5px;padding:6px 7px;border:1px solid #E2E8F0;border-radius:8px;background:#FFF}.school-morning-detail-student-block.good{border-color:#BBF7D0;background:#F0FDF4}.school-morning-detail-student-block.attention{border-color:#FED7AA;background:#FFF7ED}.school-morning-detail-student-head{display:flex;align-items:center;justify-content:space-between;gap:6px}.school-morning-detail-student-head strong{color:#334155;font-size:6.5px;font-weight:950}.school-morning-detail-student-head span{color:#94A3B8;font-size:5.5px;font-weight:800}.school-morning-detail-student-block p{margin:4px 0 0;color:#475569;font-size:6px;line-height:1.45;font-weight:650;overflow-wrap:anywhere}.school-morning-detail-doubts{margin-top:6px}.school-morning-detail-doubt-row{padding:7px;border:1px solid #E2E8F0;border-radius:8px;background:#FFF;margin-top:4px}.school-morning-detail-doubt-top{display:flex;align-items:center;justify-content:space-between;gap:5px}.school-morning-detail-doubt-top strong{color:#0F172A;font-size:7px;font-weight:950}.school-morning-detail-doubt-top span{padding:2px 4px;border-radius:999px;font-size:5px;font-weight:900}.school-morning-detail-doubt-top span.resolved{color:#15803D;background:#DCFCE7;border:1px solid #BBF7D0}.school-morning-detail-doubt-top span.open{color:#C2410C;background:#FFEDD5;border:1px solid #FED7AA}.school-morning-detail-doubt-topic{margin-top:3px;color:#64748B;font-size:5.8px;font-weight:800}.school-morning-detail-doubt-text{margin-top:2px;color:#334155;font-size:6.5px;line-height:1.35;font-weight:750}.school-morning-detail-doubt-meta{margin-top:4px;color:#94A3B8;font-size:5.3px;font-weight:700}.school-morning-detail-empty{padding:7px;border:1px dashed #CBD5E1;border-radius:8px;color:#64748B;font-size:6px;line-height:1.4;font-weight:700;margin-top:6px}.school-morning-detail-resolution-note{margin-top:6px;color:#64748B;font-size:6px;font-weight:850}.school-morning-detail-week-summary,.school-morning-week-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}.school-morning-detail-week-summary span,.school-morning-week-metrics span{padding:6px;border:1px solid #E2E8F0;border-radius:8px;background:#FCFCFB;color:#64748B;font-size:6px;font-weight:800}.school-morning-detail-week-summary b,.school-morning-week-metrics b{display:block;margin-top:2px;color:#0F172A;font-size:9px}.school-morning-week-day{margin-top:8px;padding:8px;border:1px solid #E2E8F0;border-radius:11px;background:#FFF}.school-morning-week-day-head{display:flex;align-items:center;justify-content:space-between;gap:7px}.school-morning-week-day-head strong{display:block;color:#0F172A;font-size:8px;font-weight:950}.school-morning-week-day-head span{display:block;margin-top:2px;color:#94A3B8;font-size:6px;font-weight:750}.school-morning-week-day-head>b{color:#64748B;font-size:6px}.school-morning-week-metrics{margin-top:6px}.school-morning-week-metrics span{padding:5px}.school-morning-week-metrics b{font-size:8px}
        @media(max-width:1024px){.school-morning-detail-modal{width:min(325px,calc(100vw - 24px));max-height:82vh;border-radius:15px}.school-morning-detail-head{padding:12px}.school-morning-detail-body{padding:8px}.school-morning-detail-head h3{font-size:13px}.school-morning-brief-overlay{padding:10px}.school-morning-brief-modal{width:min(650px,100%);max-height:90vh;border-radius:18px}.school-morning-brief-head{padding:13px 14px 10px}.school-morning-brief-title{font-size:18px}.school-morning-brief-copy{font-size:9px}.school-morning-brief-body{padding:9px}.school-morning-brief-metrics{grid-template-columns:1fr 1fr;gap:5px}.school-morning-brief-metric{padding:9px}.school-morning-brief-metric strong{font-size:20px}.school-morning-brief-list,.school-morning-brief-doubt-list{gap:5px}.school-morning-brief-card,.school-morning-brief-doubt-card{padding:7px}.school-morning-brief-card h4,.school-morning-brief-doubt-card h4{font-size:9px}.school-morning-brief-foot{padding:8px 9px}.school-morning-brief-note{font-size:7px}}
        @media(max-width:600px){.school-morning-detail-overlay{padding:7px}.school-morning-detail-modal{width:50vw;max-width:360px;max-height:86vh;border-radius:13px}.school-morning-detail-head{padding:10px}.school-morning-detail-body{padding:7px}.school-morning-detail-head h3{font-size:12px}.school-morning-detail-kicker{font-size:6px}.school-morning-detail-head p{font-size:6.5px}.school-morning-detail-close{width:24px;height:24px;font-size:18px}.school-morning-detail-explanation p,.school-morning-detail-student-block p{font-size:6px}.school-morning-brief-overlay{padding:7px}.school-morning-brief-modal{max-height:93vh;border-radius:14px}.school-morning-brief-head{padding:10px 11px 8px}.school-morning-brief-kicker{font-size:6.5px;letter-spacing:.85px}.school-morning-brief-title{font-size:15px}.school-morning-brief-date{font-size:8px}.school-morning-brief-copy{font-size:7.5px}.school-morning-brief-body{padding:7px}.school-morning-brief-banner{padding:7px 8px;font-size:7.5px}.school-morning-brief-banner span{font-size:6.5px}.school-morning-brief-metrics{gap:5px;margin-top:6px}.school-morning-brief-metric{padding:7px;border-radius:10px}.school-morning-brief-metric small{font-size:6px}.school-morning-brief-metric strong{font-size:16px}.school-morning-brief-metric em{font-size:6px}.school-morning-brief-section{margin-top:7px}.school-morning-brief-section-head h3{font-size:8px}.school-morning-brief-section-head span{font-size:5.5px}.school-morning-brief-list,.school-morning-brief-doubt-list{grid-template-columns:1fr 1fr;gap:4px}.school-morning-brief-card,.school-morning-brief-doubt-card{padding:6px;border-radius:9px}.school-morning-brief-card h4,.school-morning-brief-doubt-card h4{font-size:7.5px}.school-morning-brief-score{font-size:12px}.school-morning-brief-doubt-score{font-size:12px}.school-morning-brief-sub,.school-morning-brief-doubt-teacher{font-size:6px}.school-morning-brief-pill{font-size:5.5px;padding:2px 4px}.school-morning-brief-missed-row{grid-template-columns:minmax(80px,1fr) auto;gap:5px;padding:7px}.school-morning-brief-assignment-list{grid-column:1/-1}.school-morning-brief-missed-teacher{font-size:7.5px}.school-morning-brief-missed-count{font-size:6px;padding:2px 5px}.school-morning-brief-assignment{font-size:5.5px;padding:2px 4px}.school-morning-brief-empty{font-size:6.5px;padding:7px}.school-morning-brief-ack{margin-top:5px;padding-top:5px;font-size:6.5px}.school-morning-brief-ack input{width:11px;height:11px}.school-morning-brief-foot{gap:5px;padding:6px 7px}.school-morning-brief-note{max-width:42%;font-size:6px}.school-morning-brief-actions{gap:4px}.school-morning-brief-download,.school-morning-brief-btn{padding:5px 6px;font-size:6px;border-radius:7px}}
        /* V11: enlarge only the existing V7 detail popup; no data, calculation, fetch, or PDF logic changes. */
        .school-morning-detail-overlay{padding:22px}
        .school-morning-detail-modal{width:min(820px,100%);max-height:min(88vh,760px);border-radius:24px}
        .school-morning-detail-head{padding:20px 22px 14px}.school-morning-detail-kicker{font-size:10px}.school-morning-detail-head h3{font-size:24px}.school-morning-detail-head p{font-size:11px}.school-morning-detail-close{width:34px;height:34px}
        .school-morning-detail-body{padding:14px 16px}.school-morning-detail-explanation{padding:10px 12px}.school-morning-detail-explanation strong{font-size:10px}.school-morning-detail-explanation p{font-size:9px}
        .school-morning-detail-classroom-head h4{font-size:11px}.school-morning-detail-classroom-head span{font-size:8px}.school-morning-detail-assignment{padding:10px}.school-morning-detail-assignment-head strong{font-size:10px}.school-morning-detail-assignment-head span{font-size:8px}.school-morning-detail-assignment-head>b{font-size:18px}
        .school-morning-detail-mini-grid{gap:6px;margin:8px 0}.school-morning-detail-mini-grid span{padding:6px 7px;font-size:8px}.school-morning-detail-student-block{padding:8px 9px}.school-morning-detail-student-head strong{font-size:8px}.school-morning-detail-student-head span{font-size:7px}.school-morning-detail-student-block p{font-size:8px}
        .school-morning-detail-doubt-row{padding:9px}.school-morning-detail-doubt-top strong{font-size:9px}.school-morning-detail-doubt-top span{padding:3px 6px;font-size:7px}.school-morning-detail-doubt-topic{font-size:7.5px}.school-morning-detail-doubt-text{font-size:8.5px}.school-morning-detail-doubt-meta{font-size:7px}.school-morning-detail-empty{padding:9px;font-size:8px}.school-morning-detail-resolution-note{font-size:8px}
        .school-morning-detail-week-summary,.school-morning-week-metrics{gap:6px}.school-morning-detail-week-summary span,.school-morning-week-metrics span{padding:8px;font-size:8px}.school-morning-detail-week-summary b,.school-morning-week-metrics b{font-size:12px}.school-morning-week-day{padding:10px}.school-morning-week-day-head strong{font-size:10px}.school-morning-week-day-head span,.school-morning-week-day-head>b{font-size:8px}.school-morning-week-metrics{margin-top:8px}.school-morning-week-metrics span{padding:7px}.school-morning-week-metrics b{font-size:11px}
        @media(max-width:1024px){.school-morning-detail-overlay{padding:10px}.school-morning-detail-modal{width:min(650px,100%);max-height:90vh;border-radius:18px}.school-morning-detail-head{padding:13px 14px 10px}.school-morning-detail-kicker{font-size:8px}.school-morning-detail-head h3{font-size:18px}.school-morning-detail-head p{font-size:9px}.school-morning-detail-body{padding:9px}.school-morning-detail-explanation strong{font-size:9px}.school-morning-detail-explanation p{font-size:8px}.school-morning-detail-classroom-head h4{font-size:10px}.school-morning-detail-classroom-head span{font-size:7px}.school-morning-detail-assignment{padding:8px}.school-morning-detail-assignment-head strong{font-size:9px}.school-morning-detail-assignment-head span{font-size:7px}.school-morning-detail-assignment-head>b{font-size:16px}.school-morning-detail-mini-grid span{font-size:7px}.school-morning-detail-student-block{padding:7px 8px}.school-morning-detail-student-head strong{font-size:7.5px}.school-morning-detail-student-head span{font-size:6.5px}.school-morning-detail-student-block p{font-size:7.5px}.school-morning-detail-doubt-top strong{font-size:8px}.school-morning-detail-doubt-top span{font-size:6.5px}.school-morning-detail-doubt-topic{font-size:7px}.school-morning-detail-doubt-text{font-size:8px}.school-morning-detail-doubt-meta{font-size:6.5px}.school-morning-detail-empty{font-size:7.5px}.school-morning-detail-resolution-note{font-size:7.5px}.school-morning-detail-week-summary span,.school-morning-week-metrics span{font-size:7px}.school-morning-detail-week-summary b,.school-morning-week-metrics b{font-size:11px}.school-morning-week-day{padding:9px}.school-morning-week-day-head strong{font-size:9px}.school-morning-week-day-head span,.school-morning-week-day-head>b{font-size:7px}.school-morning-week-metrics{margin-top:7px}.school-morning-week-metrics span{padding:6px}.school-morning-week-metrics b{font-size:10px}}
        @media(max-width:600px){.school-morning-detail-overlay{padding:7px}.school-morning-detail-modal{width:100%;max-width:none;max-height:93vh;border-radius:14px}.school-morning-detail-head{padding:10px 11px 8px}.school-morning-detail-kicker{font-size:6.5px;letter-spacing:.85px}.school-morning-detail-head h3{font-size:15px}.school-morning-detail-head p{font-size:7.5px}.school-morning-detail-close{width:27px;height:27px;font-size:18px}.school-morning-detail-body{padding:7px}.school-morning-detail-explanation{padding:7px 8px}.school-morning-detail-explanation strong{font-size:8px}.school-morning-detail-explanation p{font-size:7px}.school-morning-detail-classroom-head h4{font-size:8.5px}.school-morning-detail-classroom-head span{font-size:6px}.school-morning-detail-assignment{padding:7px}.school-morning-detail-assignment-head strong{font-size:8px}.school-morning-detail-assignment-head span{font-size:6.5px}.school-morning-detail-assignment-head>b{font-size:14px}.school-morning-detail-mini-grid{gap:4px;margin:6px 0}.school-morning-detail-mini-grid span{padding:5px;font-size:6.5px}.school-morning-detail-student-block{padding:6px 7px}.school-morning-detail-student-head strong{font-size:6.5px}.school-morning-detail-student-head span{font-size:5.5px}.school-morning-detail-student-block p{font-size:6.5px}.school-morning-detail-doubt-row{padding:7px}.school-morning-detail-doubt-top strong{font-size:7px}.school-morning-detail-doubt-top span{font-size:5.5px}.school-morning-detail-doubt-topic{font-size:6px}.school-morning-detail-doubt-text{font-size:6.8px}.school-morning-detail-doubt-meta{font-size:5.5px}.school-morning-detail-empty{font-size:6.5px}.school-morning-detail-resolution-note{font-size:6.5px}.school-morning-detail-week-summary span,.school-morning-week-metrics span{padding:6px;font-size:6.5px}.school-morning-detail-week-summary b,.school-morning-week-metrics b{font-size:10px}.school-morning-week-day{padding:7px}.school-morning-week-day-head strong{font-size:8px}.school-morning-week-day-head span,.school-morning-week-day-head>b{font-size:6px}.school-morning-week-metrics{margin-top:6px}.school-morning-week-metrics span{padding:6px}.school-morning-week-metrics b{font-size:9px}}
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
            <span></span>
          </div>

          <section className="school-morning-brief-metrics">
            <button type="button" className="school-morning-brief-metric" onClick={() => openMetricDetail(rawData, brief, "health", setDetail)}>
              <small>School's Learning Health %</small><strong>{score(brief.yesterdayLearningHealth)}</strong><em></em>
            </button>
            <button type="button" className="school-morning-brief-metric" onClick={() => openMetricDetail(rawData, brief, "understanding", setDetail)}>
              <small>Full Understanding %</small><strong>{score(brief.yesterdayUnderstandingRate)}</strong><em></em>
            </button>
            <button type="button" className="school-morning-brief-metric" onClick={() => openMetricDetail(rawData, brief, "partial", setDetail)}>
              <small>Partial Understanding %</small><strong>{score(brief.yesterdayPartialUnderstandingRate)}</strong><em></em>
            </button>
            <button type="button" className="school-morning-brief-metric" onClick={() => openMetricDetail(rawData, brief, "didntUnderstand", setDetail)}>
              <small>Did Not Understand %</small><strong>{score(brief.yesterdayDidntUnderstandRate)}</strong><em></em>
            </button>
            <button type="button" className="school-morning-brief-metric" onClick={() => openMetricDetail(rawData, brief, "doubt", setDetail)}>
              <small>Yesterday's Raised Doubt %</small><strong>{score(brief.yesterdayDoubtRate)}</strong><em></em>
            </button>
            <button type="button" className="school-morning-brief-metric" onClick={() => openMetricDetail(rawData, brief, "closure", setDetail)}>
              <small>Yesterday's Doubt Closure</small><strong>{score(brief.yesterdayDoubtClosureRate)}</strong><em></em>
            </button>
          </section>

          <section className="school-morning-brief-section">
            <div className="school-morning-brief-section-head"><h3>YESTERDAY'S CLASSES WITH MAXIMUM DOUBTS</h3><span>Top 3 class · section · subject by doubt %</span></div>
            <div className="school-morning-brief-doubt-list">
              {brief.yesterdayTopDoubtClasses.length ? brief.yesterdayTopDoubtClasses.map((row) => <DoubtClassCard key={row.key} row={row} onOpen={() => openDoubtDetail(rawData, brief, row, setDetail)} />) : <div className="school-morning-brief-empty">No yesterday classroom doubt signal was recorded.</div>}
            </div>
          </section>

          <section className="school-morning-brief-section">
            <div className="school-morning-brief-section-head"><h3>TEACHERS WHO MISSED YESTERDAY'S DAILY LOGS</h3><span>Active assignments · Sunday and school holidays excluded</span></div>
            {brief.missingDailyLogs.length ? (
              <div className="school-morning-brief-missed">
                {brief.missingDailyLogs.map((row) => <MissingLogRow key={row.teacherUuid} row={row} />)}
              </div>
            ) : <div className="school-morning-brief-empty">No missed Daily Logs were identified for yesterday.</div>}
          </section>

          <section className="school-morning-brief-section">
            <div className="school-morning-brief-section-head"><h3>3 THINGS GOING WELL — LAST 1 WEEK</h3><span>{brief.periodLabel}</span></div>
            <div className="school-morning-brief-list">
              {brief.topClassrooms.length ? brief.topClassrooms.map((row) => <ClassroomCard key={`good:${row.classroomKey}`} row={row} onOpen={() => openWeeklyDetail(rawData, brief, row, false, setDetail)} />) : <EmptyCard text="No classroom activity recorded in this period." />}
            </div>
          </section>

          <section className="school-morning-brief-section">
            <div className="school-morning-brief-section-head"><h3>3 THINGS REQUIRING ATTENTION</h3><span>Lowest combined scores</span></div>
            <div className="school-morning-brief-list">
              {brief.attentionClassrooms.length ? brief.attentionClassrooms.map((row) => <ClassroomCard key={`attention:${row.classroomKey}`} row={row} attention onOpen={() => openWeeklyDetail(rawData, brief, row, true, setDetail)} />) : <EmptyCard text="No classroom activity recorded in this period." />}
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

      {detail ? <MorningBriefDetailPopup detail={detail} brief={brief} onClose={() => setDetail(null)} /> : null}
    </div>
  );
}

function ClassroomCard({ row, attention = false, onOpen }: { row: SchoolMorningBriefClassroomMetric; attention?: boolean; onOpen: () => void }) {
  return (
    <button type="button" className={`school-morning-brief-card${attention ? " attention" : ""}`} onClick={onOpen}>
      <h4>{row.classroom}</h4>
      <div className="school-morning-brief-score">{row.combinedScore}% combined</div>
      <div className="school-morning-brief-sub">Teacher: {row.teacherNames.length ? row.teacherNames.join(", ") : "Teacher unavailable"}</div>
      <div className="school-morning-brief-breakdown">
        <span className="school-morning-brief-pill">Feedback {row.responseRate}%</span>
        <span className="school-morning-brief-pill">Understanding {row.understandingRate}%</span>
        <span className="school-morning-brief-pill">Closure {row.doubtClosureRate}%</span>
      </div>
    </button>
  );
}

function DoubtClassCard({ row, onOpen }: { row: SchoolMorningBriefDoubtClassMetric; onOpen: () => void }) {
  return (
    <button type="button" className="school-morning-brief-doubt-card" onClick={onOpen}>
      <h4>{row.classroom}</h4>
      <div className="school-morning-brief-doubt-score">{row.doubtRate}% doubt</div>
      <div className="school-morning-brief-doubt-teacher">Teacher: {row.teacherNames.length ? row.teacherNames.join(", ") : "Teacher unavailable"}</div>
      <div className="school-morning-brief-doubt-breakdown">
        <span className="school-morning-brief-pill">Partial {row.partialRate}%</span>
        <span className="school-morning-brief-pill">Didn't understand {row.didntUnderstandRate}%</span>
      </div>
    </button>
  );
}


type MorningBriefMetric = "health" | "understanding" | "partial" | "didntUnderstand" | "doubt" | "closure";
type MorningBriefDetail =
  | { kind: "metric"; metric: MorningBriefMetric; classrooms: SchoolMorningBriefClassroomDetail[] }
  | { kind: "doubt"; row: SchoolMorningBriefDoubtClassMetric; detail: { doubtDetails: SchoolMorningBriefDoubtDetail[]; partialStudents: SchoolMorningBriefStudentStatusDetail[]; didntUnderstandStudents: SchoolMorningBriefStudentStatusDetail[] } }
  | { kind: "weekly"; row: SchoolMorningBriefClassroomMetric; attention: boolean; dailyDetails: SchoolMorningBriefWeeklyDayDetail[] };

function openMetricDetail(
  rawData: SchoolMorningBriefRawData | null,
  brief: SchoolMorningBriefModel | null,
  metric: MorningBriefMetric,
  setDetail: (detail: MorningBriefDetail | null) => void,
) {
  if (!rawData || !brief) return;
  const classrooms = buildYesterdayClassroomDetails(rawData, brief.periodEnd);
  setDetail({ kind: "metric", metric, classrooms });
}

function openDoubtDetail(
  rawData: SchoolMorningBriefRawData | null,
  brief: SchoolMorningBriefModel | null,
  row: SchoolMorningBriefDoubtClassMetric,
  setDetail: (detail: MorningBriefDetail | null) => void,
) {
  if (!rawData || !brief) return;
  setDetail({
    kind: "doubt",
    row,
    detail: buildDoubtClassroomDetail(rawData, row, brief.periodEnd),
  });
}

function openWeeklyDetail(
  rawData: SchoolMorningBriefRawData | null,
  brief: SchoolMorningBriefModel | null,
  row: SchoolMorningBriefClassroomMetric,
  attention: boolean,
  setDetail: (detail: MorningBriefDetail | null) => void,
) {
  if (!rawData || !brief) return;
  const assignmentIds = new Set(
    rawData.assignments
      .filter((assignment: any) =>
        sameValue(assignment.class_name, row.className) &&
        sameValue(assignment.section_name, row.sectionName) &&
        sameValue(assignment.subject_name, row.subjectName),
      )
      .map((assignment: any) => String(assignment.id ?? "").trim())
      .filter(Boolean),
  );
  const scopedDoubts = rawData.doubts.filter((doubt: any) =>
    assignmentIds.has(String(doubt.teacher_assignment_uuid ?? "")),
  );
  const dailyDetails = buildWeeklyDailyDetails(
    rawData,
    { assignmentIds },
    brief.periodStart,
    brief.periodEnd,
    scopedDoubts,
  );
  setDetail({ kind: "weekly", row, attention, dailyDetails });
}

function sameValue(a: unknown, b: unknown) {
  return String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
}

function detailTitle(metric: MorningBriefMetric) {
  return {
    health: "School's Learning Health — Calculation Detail",
    understanding: "Full Understanding — Student Detail",
    partial: "Partial Understanding — Student Detail",
    didntUnderstand: "Did Not Understand — Student Detail",
    doubt: "Raised Doubt % — Student & Doubt Detail",
    closure: "Doubt Closure — Resolution Detail",
  }[metric];
}

function detailExplanation(metric: MorningBriefMetric) {
  return {
    health: "The percentage is kept exactly on the canonical learning calculation already used by the Morning Brief: each lecture calculates learning health from complete + half of partial responses over eligible students; lecture health is then averaged per assignment and the assignment percentages are averaged for the school.",
    understanding: "The percentage is the canonical full-understanding rate: complete understanding observations divided by eligible student observations for each assignment, followed by the same unweighted assignment average used by the existing card.",
    partial: "The percentage is the canonical partial-understanding rate: partial observations divided by eligible student observations for each assignment, followed by the same unweighted assignment average used by the existing card.",
    didntUnderstand: "The percentage is the canonical did-not-understand rate: did-not-understand observations divided by eligible student observations for each assignment, followed by the same unweighted assignment average used by the existing card.",
    doubt: "This card is the existing learning-doubt percentage. It is calculated from partial + did-not-understand observations over eligible observations. The detail also shows actual Loop 2 / Live-reconciled doubt records when they exist; these are evidence behind the classroom intelligence, not a replacement for the displayed percentage.",
    closure: "The displayed closure percentage remains the canonical doubt-closure calculation: resolved doubts divided by all doubts in the same assignment cohort. A zero-doubt cohort remains 0%, exactly as in the existing implementation.",
  }[metric];
}

function namesText(rows: SchoolMorningBriefStudentStatusDetail[]) {
  if (!rows.length) return "None recorded";
  return rows.map((row) => row.studentName).join(", ");
}

function StudentList({ title, rows, tone = "neutral" }: { title: string; rows: SchoolMorningBriefStudentStatusDetail[]; tone?: "neutral" | "good" | "attention" }) {
  return (
    <div className={`school-morning-detail-student-block ${tone}`}>
      <div className="school-morning-detail-student-head"><strong>{title}</strong><span>{rows.length} student{rows.length === 1 ? "" : "s"}</span></div>
      <p>{namesText(rows)}</p>
    </div>
  );
}

function LearningSignalOnlyStudentList({
  partialStudents,
  didntUnderstandStudents,
  doubtDetails,
}: {
  partialStudents: SchoolMorningBriefStudentStatusDetail[];
  didntUnderstandStudents: SchoolMorningBriefStudentStatusDetail[];
  doubtDetails: SchoolMorningBriefDoubtDetail[];
}) {
  const signalOnly = learningSignalOnlyStudents(partialStudents, didntUnderstandStudents, doubtDetails);
  if (!signalOnly.length) return null;
  return <StudentList title="Learning-doubt signals without an explicit doubt record" rows={signalOnly} tone="attention" />;
}

function DoubtRows({ rows }: { rows: SchoolMorningBriefDoubtDetail[] }) {
  if (!rows.length) return <div className="school-morning-detail-empty">No explicit doubt record was available for this classroom/date. The percentage may still contain learning-doubt signals from Partial / Did Not Understand feedback.</div>;
  return (
    <div className="school-morning-detail-doubts">
      {rows.map((row) => (
        <div key={`${row.id}-${row.studentUuid}`} className="school-morning-detail-doubt-row">
          <div className="school-morning-detail-doubt-top"><strong>{row.studentName}</strong><span className={row.resolved ? "resolved" : "open"}>{row.resolved ? "Resolved" : "Open"}</span></div>
          <div className="school-morning-detail-doubt-topic">{row.topic}</div>
          <div className="school-morning-detail-doubt-text">{row.doubt}</div>
          <div className="school-morning-detail-doubt-meta">{row.teacherName} · {row.date} · {row.source}</div>
        </div>
      ))}
    </div>
  );
}

function MetricAssignmentDetail({ assignment, metric }: { assignment: SchoolMorningBriefAssignmentDetail; metric: MorningBriefMetric }) {
  const signalStudents = assignment.partialStudents.length + assignment.didntUnderstandStudents.length;
  return (
    <div className="school-morning-detail-assignment">
      <div className="school-morning-detail-assignment-head">
        <div><strong>{assignment.classroom}</strong><span>Teacher: {assignment.teacherName}</span></div>
        <b>{metric === "health" ? `${assignment.learningHealth}%` : metric === "understanding" ? `${assignment.understandingRate}%` : metric === "partial" ? `${assignment.partialRate}%` : metric === "didntUnderstand" ? `${assignment.didntUnderstandRate}%` : metric === "doubt" ? `${assignment.doubtRate}%` : `${assignment.doubtClosureRate}%`}</b>
      </div>
      <div className="school-morning-detail-mini-grid">
        <span>Logs <b>{assignment.logsCount}</b></span>
        <span>Eligible observations <b>{assignment.eligibleStudentObservations}</b></span>
      </div>
      {metric === "health" ? <>
        <StudentList title="Full understanding — full contribution" rows={assignment.completeStudents} tone="good" />
        <StudentList title="Partial understanding — 50% health contribution" rows={assignment.partialStudents} tone="attention" />
      </> : null}
      {metric === "understanding" ? <StudentList title="Students counted as fully understanding" rows={assignment.completeStudents} tone="good" /> : null}
      {metric === "partial" ? <StudentList title="Students counted as partially understanding" rows={assignment.partialStudents} tone="attention" /> : null}
      {metric === "didntUnderstand" ? <StudentList title="Students counted as did not understand" rows={assignment.didntUnderstandStudents} tone="attention" /> : null}
      {metric === "doubt" ? <>
        <StudentList title={`Learning-doubt signal students (${learningSignalStudents(assignment.partialStudents, assignment.didntUnderstandStudents).length})`} rows={learningSignalStudents(assignment.partialStudents, assignment.didntUnderstandStudents)} tone="attention" />
        <LearningSignalOnlyStudentList partialStudents={assignment.partialStudents} didntUnderstandStudents={assignment.didntUnderstandStudents} doubtDetails={assignment.doubtDetails} />
        <DoubtRows rows={assignment.doubtDetails} />
      </> : null}
      {metric === "closure" ? <>
        <DoubtRows rows={assignment.doubtDetails} />
        <div className="school-morning-detail-resolution-note">Resolved: {assignment.doubtDetails.filter((row) => row.resolved).length} · Open: {assignment.doubtDetails.filter((row) => !row.resolved).length}</div>
      </> : null}
    </div>
  );
}

function MetricDetailPopup({ metric, classrooms, value, onClose }: { metric: MorningBriefMetric; classrooms: SchoolMorningBriefClassroomDetail[]; value: number | null; onClose: () => void }) {
  return (
    <div className="school-morning-detail-overlay" role="dialog" aria-modal="true" aria-labelledby="school-morning-detail-title">
      <div className="school-morning-detail-modal">
        <header className="school-morning-detail-head">
          <div><p className="school-morning-detail-kicker">VERIFY THE MORNING BRIEF</p><h3 id="school-morning-detail-title">{detailTitle(metric)}</h3><p>{score(value)} · {classrooms.length} class · section · subject groups</p></div>
          <button type="button" className="school-morning-detail-close" onClick={onClose} aria-label="Close detail popup">×</button>
        </header>
        <div className="school-morning-detail-body">
          <div className="school-morning-detail-explanation"><strong>How this number is calculated</strong><p>{detailExplanation(metric)}</p></div>
          {classrooms.map((classroom) => (
            <section key={classroom.classroomKey} className="school-morning-detail-classroom">
              <div className="school-morning-detail-classroom-head"><h4>{classroom.classroom}</h4><span>{classroom.assignmentDetails.length} teacher assignment{classroom.assignmentDetails.length === 1 ? "" : "s"}</span></div>
              {classroom.assignmentDetails.map((assignment) => <MetricAssignmentDetail key={assignment.assignmentId} assignment={assignment} metric={metric} />)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeeklyDetailPopup({ row, attention, dailyDetails, onClose }: { row: SchoolMorningBriefClassroomMetric; attention: boolean; dailyDetails: SchoolMorningBriefWeeklyDayDetail[]; onClose: () => void }) {
  return (
    <div className="school-morning-detail-overlay" role="dialog" aria-modal="true" aria-labelledby="school-morning-weekly-title">
      <div className="school-morning-detail-modal school-morning-weekly-detail-modal">
        <header className="school-morning-detail-head">
          <div><p className="school-morning-detail-kicker">WEEKLY CLASSROOM DETAIL</p><h3 id="school-morning-weekly-title">{row.classroom}</h3><p>{attention ? "Requiring attention" : "Going well"} · {row.combinedScore}% combined · {row.teacherNames.join(", ") || "Teacher unavailable"}</p></div>
          <button type="button" className="school-morning-detail-close" onClick={onClose} aria-label="Close detail popup">×</button>
        </header>
        <div className="school-morning-detail-body">
          <div className="school-morning-detail-week-summary">
            <span>Feedback <b>{row.responseRate}%</b></span><span>Understanding <b>{row.understandingRate}%</b></span><span>Closure <b>{row.doubtClosureRate}%</b></span>
          </div>
          <div className="school-morning-detail-explanation"><strong>How to read this report</strong><p>The overall values above are the exact values already shown on the Morning Brief card. The daily rows below use the same classroom assignment scope and canonical learning/live-reconciled evidence, so the principal can see which students contributed on each day without changing the card calculation.</p></div>
          {dailyDetails.map((day) => (
            <section key={day.date} className="school-morning-week-day">
              <div className="school-morning-week-day-head"><div><strong>{day.day}</strong><span>{day.date}</span></div><b>{day.logsCount} log{day.logsCount === 1 ? "" : "s"}</b></div>
              <div className="school-morning-week-metrics"><span>Feedback <b>{day.feedbackRate}%</b></span><span>Understanding <b>{day.understandingRate}%</b></span><span>Closure <b>{day.doubtClosureRate}%</b></span></div>
              <StudentList title={`Feedback students (${day.feedbackStudents.length})`} rows={day.feedbackStudents} />
              <StudentList title={`Understanding students (${day.understandingStudents.length})`} rows={day.understandingStudents} tone="good" />
              <StudentList title={`Partial understanding (${day.partialStudents.length})`} rows={day.partialStudents} tone="attention" />
              <StudentList title={`Did not understand (${day.didntUnderstandStudents.length})`} rows={day.didntUnderstandStudents} tone="attention" />
              <StudentList title={`Resolved doubts (${day.resolvedDoubtStudents.length})`} rows={day.resolvedDoubtStudents} tone="good" />
              <StudentList title={`Open doubts (${day.unresolvedDoubtStudents.length})`} rows={day.unresolvedDoubtStudents} tone="attention" />
              <LearningSignalOnlyStudentList partialStudents={day.partialStudents} didntUnderstandStudents={day.didntUnderstandStudents} doubtDetails={day.doubtDetails} />
              <div className="school-morning-detail-doubts"><DoubtRows rows={day.doubtDetails} /></div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function DoubtDetailPopup({ row, detail, onClose }: { row: SchoolMorningBriefDoubtClassMetric; detail: { doubtDetails: SchoolMorningBriefDoubtDetail[]; partialStudents: SchoolMorningBriefStudentStatusDetail[]; didntUnderstandStudents: SchoolMorningBriefStudentStatusDetail[] }; onClose: () => void }) {
  return (
    <div className="school-morning-detail-overlay" role="dialog" aria-modal="true" aria-labelledby="school-morning-doubt-title">
      <div className="school-morning-detail-modal">
        <header className="school-morning-detail-head">
          <div><p className="school-morning-detail-kicker">YESTERDAY'S DOUBT DETAIL</p><h3 id="school-morning-doubt-title">{row.classroom}</h3><p>{row.doubtRate}% doubt · {row.teacherNames.join(", ") || "Teacher unavailable"}</p></div>
          <button type="button" className="school-morning-detail-close" onClick={onClose} aria-label="Close detail popup">×</button>
        </header>
        <div className="school-morning-detail-body">
          <div className="school-morning-detail-week-summary"><span>Partial <b>{row.partialRate}%</b></span><span>Didn't understand <b>{row.didntUnderstandRate}%</b></span><span>Eligible <b>{row.eligibleStudentObservations}</b></span></div>
          <div className="school-morning-detail-explanation"><strong>What the displayed doubt % means</strong><p>The card's percentage is unchanged: Partial + Did Not Understand observations divided by eligible observations. The names below show the students behind those learning-doubt signals, followed by the actual doubt records available from the reconciled Loop 2 / Live evidence.</p></div>
          <StudentList title="Partial understanding students" rows={detail.partialStudents} tone="attention" />
          <StudentList title="Did not understand students" rows={detail.didntUnderstandStudents} tone="attention" />
          <LearningSignalOnlyStudentList partialStudents={detail.partialStudents} didntUnderstandStudents={detail.didntUnderstandStudents} doubtDetails={detail.doubtDetails} />
          <DoubtRows rows={detail.doubtDetails} />
        </div>
      </div>
    </div>
  );
}

function MorningBriefDetailPopup({ detail, brief, onClose }: { detail: MorningBriefDetail; brief: SchoolMorningBriefModel; onClose: () => void }) {
  if (detail.kind === "metric") {
    const value = detail.metric === "health" ? brief.yesterdayLearningHealth :
      detail.metric === "understanding" ? brief.yesterdayUnderstandingRate :
      detail.metric === "partial" ? brief.yesterdayPartialUnderstandingRate :
      detail.metric === "didntUnderstand" ? brief.yesterdayDidntUnderstandRate :
      detail.metric === "doubt" ? brief.yesterdayDoubtRate : brief.yesterdayDoubtClosureRate;
    return <MetricDetailPopup metric={detail.metric} classrooms={detail.classrooms} value={value} onClose={onClose} />;
  }
  if (detail.kind === "doubt") return <DoubtDetailPopup row={detail.row} detail={detail.detail} onClose={onClose} />;
  return <WeeklyDetailPopup row={detail.row} attention={detail.attention} dailyDetails={detail.dailyDetails} onClose={onClose} />;
}

function MissingLogRow({ row }: { row: SchoolMorningBriefMissingDailyLog }) {
  return (
    <div className="school-morning-brief-missed-row">
      <div className="school-morning-brief-missed-teacher">{row.teacherName}</div>
      <div className="school-morning-brief-missed-count">{row.missedLogs} log{row.missedLogs === 1 ? "" : "s"} missed</div>
      <div className="school-morning-brief-assignment-list">
        {row.assignments.map((assignment) => (
          <span key={`${assignment.className}|${assignment.sectionName}|${assignment.subjectName}`} className="school-morning-brief-assignment">
            {assignment.className} · {assignment.sectionName} · {assignment.subjectName}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyCard({ text }: { text: string }) {
  return <article className="school-morning-brief-card"><h4>{text}</h4></article>;
}
