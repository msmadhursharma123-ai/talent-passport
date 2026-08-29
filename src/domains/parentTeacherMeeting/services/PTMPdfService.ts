import jsPDF from "jspdf";
import type { PTMReport } from "../types/PTMModels";

const NAVY = "#0F172A";
const BLUE = "#143B73";
const ORANGE = "#F97316";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const SOFT = "#F8FAFC";
const GREEN = "#15803D";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function addText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  color: string,
  weight: "normal" | "bold" = "normal"
): number {
  doc.setFont("helvetica", weight);
  doc.setFontSize(fontSize);
  const [r, g, b] = hexToRgb(color);
  doc.setTextColor(r, g, b);
  const lines = doc.splitTextToSize(text || "—", width);
  doc.text(lines, x, y);
  return y + lines.length * (fontSize * 0.48) + 4;
}

function ensureSpace(doc: jsPDF, y: number, required = 18): number {
  if (y + required <= 280) return y;
  doc.addPage();
  return 18;
}

function drawCard(doc: jsPDF, x: number, y: number, w: number, h: number, fill: string, border: string) {
  const [fr, fg, fb] = hexToRgb(fill);
  const [br, bg, bb] = hexToRgb(border);
  doc.setFillColor(fr, fg, fb);
  doc.setDrawColor(br, bg, bb);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");
}

export function buildPTMPdf(report: PTMReport): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  /*
   * PDF header intentionally follows the Teacher Portal visual language:
   * white / warm-white surface, orange accent, dark navy typography.
   * School identity is the primary heading; Talent Passport sits in the
   * upper-right corner as the platform mark.
   */
  doc.setFillColor(...hexToRgb("#FFFFFF"));
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setDrawColor(...hexToRgb(BORDER));
  doc.line(margin, 43, pageWidth - margin, 43);

  const schoolHeaderEndY = addText(
    doc,
    report.schoolName || "School",
    margin,
    16,
    contentWidth - 48,
    17,
    NAVY,
    "bold"
  );
  addText(
    doc,
    `Parents Teacher Meeting · ${report.period.label}`,
    margin,
    Math.min(31, schoolHeaderEndY + 1),
    contentWidth - 48,
    8.5,
    MUTED,
    "bold"
  );
  addText(
    doc,
    "TALENT PASSPORT",
    pageWidth - margin - 42,
    11,
    42,
    7,
    ORANGE,
    "bold"
  );
  addText(
    doc,
    "Student Growth Intelligence",
    pageWidth - margin - 42,
    17,
    42,
    5.5,
    MUTED,
    "normal"
  );

  // Small warm accent line under the school identity.
  doc.setDrawColor(...hexToRgb(ORANGE));
  doc.setLineWidth(1.2);
  doc.line(margin, 35, margin + 26, 35);
  doc.setLineWidth(0.2);

  let y = 52;
  drawCard(doc, margin, y, contentWidth, 25, "#FFFFFF", BORDER);
  y = addText(doc, report.student.studentName, margin + 6, y + 9, contentWidth - 12, 14, NAVY, "bold");
  y = addText(
    doc,
    `Class ${report.student.className} · Section ${report.student.sectionName} · Teacher ${report.teacherName}`,
    margin + 6,
    y,
    contentWidth - 12,
    8,
    MUTED
  );
  y += 5;

  y = addText(doc, "01 · OVERALL SNAPSHOT", margin, y, contentWidth, 9, ORANGE, "bold");
  const gap = 4;
  const cardW = (contentWidth - gap * 3) / 4;
  const cards = [
    ["UNDERSTANDING", `${report.combinedUnderstandingPercentage}%`],
    ["RESPONSE RATE", `${report.overallResponseRate}%`],
    ["FEEDBACK DAYS", String(report.feedbackDays)],
    ["PENDING DOUBTS", String(report.pendingDoubts.reduce((sum, group) => sum + group.count, 0))],
  ];
  cards.forEach(([label, value], index) => {
    const x = margin + index * (cardW + gap);
    drawCard(doc, x, y, cardW, 23, SOFT, BORDER);
    addText(doc, label, x + 4, y + 7, cardW - 8, 6.5, MUTED, "bold");
    addText(doc, value, x + 4, y + 16, cardW - 8, 13, NAVY, "bold");
  });
  y += 31;

  y = ensureSpace(doc, y, 35);
  y = addText(doc, "02 · DAILY LOG & FEEDBACK COVERAGE", margin, y, contentWidth, 9, ORANGE, "bold");
  y = addText(
    doc,
    `${report.totalFeedbackResponses} feedback response${report.totalFeedbackResponses === 1 ? "" : "s"} were submitted against ${report.totalLogs} daily lecture log${report.totalLogs === 1 ? "" : "s"} published to this student's assigned classrooms during the selected period.`,
    margin,
    y + 2,
    contentWidth,
    8.5,
    NAVY
  );

  y = ensureSpace(doc, y, 50);
  y = addText(doc, "03 · SUBJECT-WISE UNDERSTANDING", margin, y, contentWidth, 9, ORANGE, "bold");
  report.subjects.forEach((subject) => {
    y = ensureSpace(doc, y, 34);
    drawCard(doc, margin, y, contentWidth, 29, "#FFFFFF", BORDER);
    y = addText(doc, subject.subject, margin + 6, y + 8, contentWidth - 12, 11, NAVY, "bold");
    y = addText(
      doc,
      `Understanding ${subject.understandingPercentage}% · ${subject.feedbackCount}/${subject.logsCount} feedback responses · Response rate ${subject.responseRate}%`,
      margin + 6,
      y,
      contentWidth - 12,
      7.5,
      MUTED
    );
    y = addText(
      doc,
      `Complete ${subject.fullyUnderstood} · Partial ${subject.partiallyUnderstood} · Didn't understand ${subject.didntUnderstand}`,
      margin + 6,
      y,
      contentWidth - 12,
      7.5,
      GREEN
    );
    y += 4;
  });

  y = ensureSpace(doc, y, 40);
  y = addText(doc, "04 · TOPICS COVERED", margin, y, contentWidth, 9, ORANGE, "bold");
  report.subjects.forEach((subject) => {
    y = ensureSpace(doc, y, 20);
    y = addText(doc, subject.subject, margin, y + 1, contentWidth, 8.5, NAVY, "bold");
    y = addText(doc, subject.topics.length ? subject.topics.join(" · ") : "No topic recorded in this period.", margin + 4, y, contentWidth - 4, 8, MUTED);
  });

  y = ensureSpace(doc, y, 45);
  y = addText(doc, "05 · CURRENT PENDING DOUBTS", margin, y, contentWidth, 9, ORANGE, "bold");
  if (report.pendingDoubts.length === 0) {
    y = addText(doc, "No current pending doubts are recorded for this student in the teacher's assigned classrooms.", margin, y + 2, contentWidth, 8.5, GREEN);
  } else {
    report.pendingDoubts.forEach((group) => {
      y = ensureSpace(doc, y, 28);
      y = addText(doc, `${group.subject} · ${group.count}`, margin, y + 2, contentWidth, 8.5, NAVY, "bold");
      group.items.forEach((item) => {
        y = addText(doc, `• ${item.topic} — ${item.concept}`, margin + 4, y, contentWidth - 4, 7.5, MUTED);
      });
    });
  }

  y = ensureSpace(doc, y, 55);
  y = addText(doc, "06 · READY TO DISCUSS", margin, y, contentWidth, 9, ORANGE, "bold");
  report.discussionPoints.forEach((point) => {
    y = ensureSpace(doc, y, 16);
    y = addText(doc, `• ${point}`, margin + 2, y + 1, contentWidth - 2, 8.2, NAVY);
  });

  y = ensureSpace(doc, y, 20);
  doc.setDrawColor(...hexToRgb(BORDER));
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  addText(
    doc,
    `Prepared by Talent Passport · Generated ${new Date(report.generatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`,
    margin,
    y,
    contentWidth,
    6.5,
    MUTED
  );

  return doc.output("blob");
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}
