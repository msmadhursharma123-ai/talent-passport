import jsPDF from "jspdf";
import type { PTMReport, PTMSubjectMetric } from "../types/PTMModels";
import { NOTO_SANS_DEVANAGARI_REGULAR_BASE64 } from "../fonts/NotoSansDevanagariRegularBase64";

const NAVY = "#0F172A";
const BLUE = "#1D4ED8";
const ORANGE = "#F97316";
const MUTED = "#64748B";
const LIGHT_MUTED = "#94A3B8";
const BORDER = "#E2E8F0";
const SOFT = "#F8FAFC";
const BLUE_SOFT = "#EFF6FF";
const BLUE_BORDER = "#BFDBFE";
const ORANGE_SOFT = "#FFF7ED";
const ORANGE_BORDER = "#FED7AA";
const RED = "#991B1B";
const RED_SOFT = "#FEF2F2";
const RED_BORDER = "#FEE2E2";

const DEVANAGARI_FONT_FILE = "NotoSansDevanagari-Regular.ttf";
const DEVANAGARI_FONT_NAME = "NotoSansDevanagari";

function containsDevanagari(value: string): boolean {
  return /[\u0900-\u097F]/.test(value);
}

function setPdfFont(doc: jsPDF, text: string, weight: "normal" | "bold" = "normal") {
  // jsPDF's built-in Helvetica does not contain Devanagari glyphs. Use the
  // bundled Unicode font whenever submitted content contains Hindi text.
  // The same helper is used for measurement and rendering so wrapping stays
  // inside the visual container.
  if (containsDevanagari(text)) {
    doc.setFont(DEVANAGARI_FONT_NAME, "normal");
    return;
  }
  doc.setFont("helvetica", weight);
}

function registerPdfFonts(doc: jsPDF) {
  doc.addFileToVFS(DEVANAGARI_FONT_FILE, NOTO_SANS_DEVANAGARI_REGULAR_BASE64);
  doc.addFont(DEVANAGARI_FONT_FILE, DEVANAGARI_FONT_NAME, "normal");
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function setFill(doc: jsPDF, color: string) {
  doc.setFillColor(...hexToRgb(color));
}

function setStroke(doc: jsPDF, color: string) {
  doc.setDrawColor(...hexToRgb(color));
}

function setText(doc: jsPDF, color: string) {
  doc.setTextColor(...hexToRgb(color));
}

function drawRoundedCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  fill = "#FFFFFF",
  border = BORDER,
  radius = 3.2
) {
  setFill(doc, fill);
  setStroke(doc, border);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, width, height, radius, radius, "FD");
}

function drawText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  width: number,
  fontSize: number,
  color: string,
  weight: "normal" | "bold" = "normal",
  lineHeight = 1.25
): number {
  doc.setFont("helvetica", weight);
  doc.setFontSize(fontSize);
  setText(doc, color);
  const lines = doc.splitTextToSize(String(text || "—"), Math.max(1, width));
  doc.text(lines, x, y);
  return y + lines.length * fontSize * 0.3528 * lineHeight;
}

function ensureSpace(doc: jsPDF, y: number, required: number, top = 16): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + required <= pageHeight - 14) return y;
  doc.addPage();
  return top;
}

function drawMetricCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string
) {
  drawRoundedCard(doc, x, y, width, 20, SOFT, BORDER, 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.8);
  setText(doc, MUTED);
  doc.text(label.toUpperCase(), x + 3.3, y + 5.7);
  doc.setFontSize(13.6);
  setText(doc, NAVY);
  doc.text(value, x + 3.3, y + 14.2);
}

function drawMiniCard(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string
) {
  drawRoundedCard(doc, x, y, width, 12.5, SOFT, "#EEF2F7", 2.2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.65);
  setText(doc, LIGHT_MUTED);
  doc.text(label.toUpperCase(), x + 2.2, y + 4.1);
  doc.setFontSize(8.1);
  setText(doc, NAVY);
  doc.text(value, x + 2.2, y + 9.5);
}

function getTopicChipMetrics(doc: jsPDF, text: string, maxWidth: number) {
  const safeText = text || "—";
  setPdfFont(doc, safeText, "bold");
  doc.setFontSize(5.8);
  const chipWidth = Math.min(62, Math.max(10, doc.getTextWidth(safeText) + 6), maxWidth);
  const lines = doc.splitTextToSize(safeText, Math.max(1, chipWidth - 6));
  const height = Math.max(8, lines.length * 2.7 + 4);
  return { width: chipWidth, height, lines };
}

function drawChip(doc: jsPDF, text: string, x: number, y: number, maxWidth = 62): { width: number; height: number } {
  const metrics = getTopicChipMetrics(doc, text, maxWidth);
  drawRoundedCard(doc, x, y, metrics.width, metrics.height, ORANGE_SOFT, ORANGE_BORDER, 2);
  setPdfFont(doc, text || "—", "bold");
  doc.setFontSize(5.8);
  setText(doc, "#9A3412");
  doc.text(metrics.lines, x + 3, y + 5.25);
  return { width: metrics.width, height: metrics.height };
}

const DOUBT_FONT_SIZE = 5.35;
const DOUBT_LINE_HEIGHT = 2.55;
const DOUBT_HORIZONTAL_PADDING = 6;
const DOUBT_MAX_LINES_PER_SEGMENT = 6;

function wrapDoubtText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const safeText = text.trim() || "—";
  const paragraphs = safeText.split(/\r?\n/);
  const lines: string[] = [];

  const wrapParagraph = (paragraph: string) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let current = "";

    const pushCurrent = () => {
      if (current) {
        lines.push(current);
        current = "";
      }
    };

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (doc.getTextWidth(candidate) <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) pushCurrent();

      if (doc.getTextWidth(word) <= maxWidth) {
        current = word;
        continue;
      }

      let fragment = "";
      for (const character of Array.from(word)) {
        const candidateFragment = fragment + character;
        if (fragment && doc.getTextWidth(candidateFragment) > maxWidth) {
          lines.push(fragment);
          fragment = character;
        } else {
          fragment = candidateFragment;
        }
      }
      current = fragment;
    }
    pushCurrent();
  };

  paragraphs.forEach((paragraph) => wrapParagraph(paragraph));
  return lines.length ? lines : ["—"];
}
function getDoubtLines(
  doc: jsPDF,
  topic: string,
  concept: string,
  width: number
): string[] {
  const topicText = topic || "Untitled topic";
  const conceptText = concept || "Concept not specified";
  const combined = `${topicText}  →  ${conceptText}`;
  setPdfFont(doc, combined, "bold");
  doc.setFontSize(DOUBT_FONT_SIZE);
  return wrapDoubtText(doc, combined, Math.max(1, width - DOUBT_HORIZONTAL_PADDING));
}

function drawDoubtSegment(
  doc: jsPDF,
  lines: string[],
  x: number,
  y: number,
  width: number
): number {
  const boundedLines = lines.length ? lines : ["—"];
  const height = Math.max(8.5, boundedLines.length * DOUBT_LINE_HEIGHT + 4);
  drawRoundedCard(doc, x, y, width, height, RED_SOFT, RED_BORDER, 2);
  const joinedText = boundedLines.join(" ");
  setPdfFont(doc, joinedText, "bold");
  doc.setFontSize(DOUBT_FONT_SIZE);
  setText(doc, "#7F1D1D");
  doc.text(boundedLines, x + 3, y + 4.5);
  return y + height;
}

function drawDoubtRow(
  doc: jsPDF,
  topic: string,
  concept: string,
  x: number,
  y: number,
  width: number
): number {
  const lines = getDoubtLines(doc, topic, concept, width);
  return drawDoubtSegment(doc, lines, x, y, width);
}

function getTopicRows(doc: jsPDF, topics: string[], width: number): Array<Array<{ text: string; width: number; height: number }>> {
  const inner = 4;
  const available = width - inner * 2;
  const source = topics.length ? topics : ["No topic recorded in this period."];
  const expanded: string[] = [];

  doc.setFontSize(5.8);
  for (const topic of source) {
    setPdfFont(doc, topic || "—", "bold");
    const safeText = topic || "—";
    const probeWidth = Math.min(62, Math.max(10, doc.getTextWidth(safeText) + 6));
    const lines = doc.splitTextToSize(safeText, Math.max(1, Math.min(62, available) - 6));
    const maxLinesPerChip = 3;
    if (lines.length <= maxLinesPerChip) {
      expanded.push(safeText);
    } else {
      for (let index = 0; index < lines.length; index += maxLinesPerChip) {
        expanded.push(lines.slice(index, index + maxLinesPerChip).join(" "));
      }
    }
    void probeWidth;
  }

  const rows: Array<Array<{ text: string; width: number; height: number }>> = [];
  let row: Array<{ text: string; width: number; height: number }> = [];
  let rowWidth = 0;
  for (const topic of expanded) {
    const metrics = getTopicChipMetrics(doc, topic, available);
    const nextWidth = row.length ? rowWidth + 2 + metrics.width : metrics.width;
    if (row.length && nextWidth > available) {
      rows.push(row);
      row = [];
      rowWidth = 0;
    }
    row.push({ text: topic, width: metrics.width, height: metrics.height });
    rowWidth += (row.length > 1 ? 2 : 0) + metrics.width;
  }
  if (row.length) rows.push(row);
  return rows;
}

function getDoubtSegments(doc: jsPDF, subject: PTMSubjectMetric, width: number): string[][] {
  const source = subject.unresolvedDoubts.length
    ? subject.unresolvedDoubts
    : [{ topic: "", concept: "No unresolved doubt in this period." }];
  const segments: string[][] = [];
  for (const item of source) {
    const lines = getDoubtLines(doc, item.topic, item.concept, width);
    const maxLinesPerSegment = DOUBT_MAX_LINES_PER_SEGMENT;
    for (let index = 0; index < lines.length; index += maxLinesPerSegment) {
      segments.push(lines.slice(index, index + maxLinesPerSegment));
    }
  }
  return segments.length ? segments : [["—"]];
}

type SubjectPdfChunk = {
  subject: PTMSubjectMetric;
  topics: string[];
  doubtSegments: string[][];
  continuation: boolean;
};

function getExpandedTopicTexts(doc: jsPDF, topics: string[], width: number): string[] {
  const available = Math.max(1, width - 8);
  const source = topics.length ? topics : ["No topic recorded in this period."];
  const expanded: string[] = [];
  doc.setFontSize(5.8);
  for (const topic of source) {
    const safeText = topic || "—";
    setPdfFont(doc, safeText, "bold");
    const lines = doc.splitTextToSize(safeText, Math.max(1, Math.min(62, available) - 6));
    const maxLinesPerChip = 3;
    if (lines.length <= maxLinesPerChip) {
      expanded.push(safeText);
    } else {
      for (let index = 0; index < lines.length; index += maxLinesPerChip) {
        expanded.push(lines.slice(index, index + maxLinesPerChip).join(" "));
      }
    }
  }
  return expanded;
}

function getTopicRowsFromTexts(doc: jsPDF, topics: string[], width: number): Array<Array<{ text: string; width: number; height: number }>> {
  const inner = 4;
  const available = Math.max(1, width - inner * 2);
  const rows: Array<Array<{ text: string; width: number; height: number }>> = [];
  let row: Array<{ text: string; width: number; height: number }> = [];
  let rowWidth = 0;
  for (const topic of topics) {
    const metrics = getTopicChipMetrics(doc, topic, available);
    const nextWidth = row.length ? rowWidth + 2 + metrics.width : metrics.width;
    if (row.length && nextWidth > available) {
      rows.push(row);
      row = [];
      rowWidth = 0;
    }
    row.push({ text: topic, width: metrics.width, height: metrics.height });
    rowWidth += (row.length > 1 ? 2 : 0) + metrics.width;
  }
  if (row.length) rows.push(row);
  return rows;
}

function estimateSubjectChunkHeight(
  doc: jsPDF,
  subject: PTMSubjectMetric,
  width: number,
  topics: string[],
  doubtSegments: string[][]
): number {
  const topicRows = getTopicRowsFromTexts(doc, topics, width);
  const statsHeight = 3 * 12.5 + 2 * 2;
  const topicHeight = 7 + topicRows.reduce((sum, row) => sum + Math.max(...row.map((item) => item.height)) + 1.5, 0);
  const doubtHeight = 7 + doubtSegments.reduce((sum, lines) => sum + Math.max(8.5, lines.length * DOUBT_LINE_HEIGHT + 4) + 1.5, 0);
  void subject;
  return 12 + statsHeight + topicHeight + doubtHeight + 6;
}

function estimateSubjectCardHeight(
  doc: jsPDF,
  subject: PTMSubjectMetric,
  width: number
): number {
  const inner = 4;
  const topicRows = getTopicRows(doc, subject.topics, width);
  const doubtSegments = getDoubtSegments(doc, subject, width);
  const statsHeight = 3 * 12.5 + 2 * 2;
  const topicHeight = 7 + topicRows.reduce((sum, row) => sum + Math.max(...row.map((item) => item.height)) + 1.5, 0);
  const doubtHeight = 7 + doubtSegments.reduce((sum, lines) => sum + Math.max(8.5, lines.length * DOUBT_LINE_HEIGHT + 4) + 1.5, 0);
  return 12 + statsHeight + topicHeight + doubtHeight + 6;
}

function drawSubjectCard(
  doc: jsPDF,
  chunk: SubjectPdfChunk,
  x: number,
  y: number,
  width: number
): number {
  const subject = chunk.subject;
  const inner = 4;
  const miniGap = 2;
  const miniWidth = (width - inner * 2 - miniGap * 2) / 3;
  const topicRows = getTopicRowsFromTexts(doc, chunk.topics, width);
  const doubtSegments = chunk.doubtSegments;
  const statsHeight = 3 * 12.5 + 2 * 2;
  const topicHeight = 7 + topicRows.reduce((sum, row) => sum + Math.max(...row.map((item) => item.height)) + 1.5, 0);
  const doubtHeight = 7 + doubtSegments.reduce((sum, lines) => sum + Math.max(8.5, lines.length * DOUBT_LINE_HEIGHT + 4) + 1.5, 0);
  const height = 12 + statsHeight + topicHeight + doubtHeight + 6;

  drawRoundedCard(doc, x, y, width, height, "#FFFFFF", BORDER, 3.5);

  const subjectTitle = chunk.continuation ? `${subject.subject} · continued` : subject.subject;
  setPdfFont(doc, subjectTitle, "bold");
  doc.setFontSize(9.2);
  setText(doc, NAVY);
  doc.text(subjectTitle, x + inner, y + 7);

  const scoreText = `${subject.understandingPercentage}% understanding`;
  doc.setFontSize(5.8);
  const badgeWidth = Math.max(24, doc.getTextWidth(scoreText) + 6);
  drawRoundedCard(doc, x + width - inner - badgeWidth, y + 2.8, badgeWidth, 7.5, BLUE_SOFT, BLUE_BORDER, 3.75);
  setText(doc, BLUE);
  doc.text(scoreText, x + width - inner - badgeWidth + 3, y + 7.6);

  let cy = y + 12.5;
  const stats = [
    ["Logs", String(subject.logsCount)],
    ["Responses", String(subject.feedbackCount)],
    ["Rate", `${subject.responseRate}%`],
    ["Understanding", `${subject.understandingPercentage}%`],
    ["Partial", `${subject.partialUnderstandingPercentage}%`],
    ["Didn't understand", `${subject.didntUnderstandPercentage}%`],
    ["Doubt", `${subject.doubtPercentage}%`],
    ["Unresolved doubts", String(subject.unresolvedDoubtCount)],
    ["Doubt closure", `${subject.doubtClosurePercentage}%`],
  ];

  stats.forEach((metric, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    drawMiniCard(doc, x + inner + col * (miniWidth + miniGap), cy + row * 14.5, miniWidth, metric[0], metric[1]);
  });
  cy += statsHeight + 1;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.7);
  setText(doc, MUTED);
  doc.text("WHAT WAS TAUGHT IN THIS SELECTED PERIOD", x + inner, cy + 3.5);
  cy += 5.5;

  topicRows.forEach((row) => {
    let cx = x + inner;
    let rowHeight = 8;
    row.forEach((topic) => {
      const chip = drawChip(doc, topic.text, cx, cy, topic.width);
      cx += chip.width + 2;
      rowHeight = Math.max(rowHeight, chip.height);
    });
    cy += rowHeight + 1.5;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.7);
  setText(doc, RED);
  doc.text(`WHAT UNRESOLVED DOUBT CURRENTLY EXISTS IN THIS SELECTED PERIOD · ${subject.unresolvedDoubtCount}`, x + inner, cy + 3.5);
  cy += 5.5;

  doubtSegments.forEach((lines) => {
    cy = drawDoubtSegment(doc, lines, x + inner, cy, width - inner * 2) + 1.5;
  });

  return y + height;
}

function splitSubjectForPdf(
  doc: jsPDF,
  subject: PTMSubjectMetric,
  width: number,
  maxHeight = 250
): SubjectPdfChunk[] {
  const allTopics = getExpandedTopicTexts(doc, subject.topics, width);
  const allDoubtSegments = getDoubtSegments(doc, subject, width);
  if (estimateSubjectChunkHeight(doc, subject, width, allTopics, allDoubtSegments) <= maxHeight) {
    return [{ subject, topics: allTopics, doubtSegments: allDoubtSegments, continuation: false }];
  }

  const chunks: SubjectPdfChunk[] = [];
  let topicIndex = 0;
  let doubtIndex = 0;
  let continuation = false;

  while (topicIndex < allTopics.length || doubtIndex < allDoubtSegments.length) {
    let selectedTopics: string[] = [];
    let selectedDoubts: string[][] = [];

    const fits = (topics: string[], doubts: string[][]) =>
      estimateSubjectChunkHeight(doc, subject, width, topics, doubts) <= maxHeight;

    while (topicIndex < allTopics.length) {
      const candidate = [...selectedTopics, allTopics[topicIndex]];
      if (selectedTopics.length && !fits(candidate, selectedDoubts)) break;
      if (!selectedTopics.length && !fits(candidate, selectedDoubts)) {
        // A single topic chip is already bounded to three wrapped lines, so it is safe as an atomic item.
        selectedTopics = [allTopics[topicIndex++]];
        break;
      }
      selectedTopics = candidate;
      topicIndex += 1;
    }

    while (doubtIndex < allDoubtSegments.length) {
      const candidate = [...selectedDoubts, allDoubtSegments[doubtIndex]];
      if (selectedDoubts.length && !fits(selectedTopics, candidate)) break;
      if (!selectedDoubts.length && selectedTopics.length && !fits(selectedTopics, candidate)) break;
      if (!selectedDoubts.length && !selectedTopics.length && !fits(selectedTopics, candidate)) {
        // A doubt segment is capped at six wrapped lines, so it is safe as an atomic item.
        selectedDoubts = [allDoubtSegments[doubtIndex++]];
        break;
      }
      selectedDoubts = candidate;
      doubtIndex += 1;
    }

    if (!selectedTopics.length && !selectedDoubts.length) {
      // Defensive progress guarantee: both streams are finite and each atomic item is bounded.
      if (topicIndex < allTopics.length) selectedTopics = [allTopics[topicIndex++]];
      else if (doubtIndex < allDoubtSegments.length) selectedDoubts = [allDoubtSegments[doubtIndex++]];
    }

    chunks.push({ subject, topics: selectedTopics, doubtSegments: selectedDoubts, continuation });
    continuation = true;
  }

  return chunks.length ? chunks : [{ subject, topics: allTopics, doubtSegments: allDoubtSegments, continuation: false }];
}

export function buildPTMPdf(report: PTMReport): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  registerPdfFonts(doc);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const gap = 3.5;
  const metricColumns = 4;
  const metricWidth = (contentWidth - gap * (metricColumns - 1)) / metricColumns;

  // Header mirrors the current PTM report card rather than the legacy PDF.
  setFill(doc, "#FFFFFF");
  doc.rect(0, 0, pageWidth, 43, "F");
  setStroke(doc, BORDER);
  doc.line(margin, 41.5, pageWidth - margin, 41.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.4);
  setText(doc, ORANGE);
  doc.text("READY TO DISCUSS · TALENT PASSPORT", margin, 10);

  const studentName = report.student.studentName || "Student";
  setPdfFont(doc, studentName, "bold");
  doc.setFontSize(17.5);
  setText(doc, NAVY);
  doc.text(studentName, margin, 21);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setText(doc, MUTED);
  doc.text(
    `Class ${report.student.className} · Section ${report.student.sectionName} · ${report.schoolName} · ${report.period.label}`,
    margin,
    28
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  setText(doc, ORANGE);
  doc.text("TALENT PASSPORT", pageWidth - margin, 11, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.3);
  setText(doc, MUTED);
  doc.text("Student Growth Intelligence", pageWidth - margin, 16.5, { align: "right" });

  setStroke(doc, ORANGE);
  doc.setLineWidth(1.1);
  doc.line(margin, 34.5, margin + 24, 34.5);
  doc.setLineWidth(0.2);

  let y = 49;

  // The 12-card sequence is identical to the current Teacher Portal.
  const metrics: Array<[string, string]> = [
    ["Combined understanding", `${report.combinedUnderstandingPercentage}%`],
    ["Full understanding", `${report.combinedFullUnderstandingPercentage}%`],
    ["Partial understanding", `${report.combinedPartialUnderstandingPercentage}%`],
    ["Did not understand", `${report.combinedDidntUnderstandPercentage}%`],
    ["Feedback response", `${report.overallResponseRate}%`],
    ["Feedback days", String(report.feedbackDays)],
    ["Doubt", `${report.combinedDoubtPercentage}%`],
    ["Total doubts raised", String(report.totalDoubtsRaised)],
    ["Unresolved doubts", String(report.unresolvedDoubtCount)],
    ["Doubt closure", `${report.doubtClosurePercentage}%`],
    ["Topics taught", String(report.totalTopicsTaught)],
    ["Subtopics taught", String(report.totalSubtopicsTaught)],
  ];

  for (let index = 0; index < metrics.length; index += 1) {
    const col = index % metricColumns;
    const row = Math.floor(index / metricColumns);
    drawMetricCard(
      doc,
      margin + col * (metricWidth + gap),
      y + row * 23.5,
      metricWidth,
      metrics[index][0],
      metrics[index][1]
    );
  }
  y += 74;

  y = ensureSpace(doc, y, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.4);
  setText(doc, ORANGE);
  doc.text("01 · COVERAGE", margin, y);
  doc.setFontSize(11.8);
  setText(doc, NAVY);
  doc.text("Daily logs and feedback", margin, y + 7);
  y = drawText(
    doc,
    `${report.totalFeedbackResponses} feedback response${report.totalFeedbackResponses === 1 ? "" : "s"} submitted out of ${report.totalLogs} daily lecture log${report.totalLogs === 1 ? "" : "s"} published to this student's assigned classrooms.`,
    margin,
    y + 12,
    contentWidth,
    7,
    LIGHT_MUTED,
    "bold",
    1.35
  );
  y += 5;

  y = ensureSpace(doc, y, 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.4);
  setText(doc, ORANGE);
  doc.text("02 · ALL SUBJECTS", margin, y);
  doc.setFontSize(11.8);
  setText(doc, NAVY);
  doc.text("Complete subject-wise learning snapshot", margin, y + 7);
  y = drawText(
    doc,
    "This student view includes every active subject assigned to this class and section, so the attending teacher can discuss the complete PTM picture even when another subject teacher is unavailable.",
    margin,
    y + 12,
    contentWidth,
    7,
    LIGHT_MUTED,
    "bold",
    1.35
  );
  y += 4;

  const subjectGap = 4;
  const subjectWidth = (contentWidth - subjectGap) / 2;
  const expandedSubjects = report.subjects.flatMap((subject) =>
    splitSubjectForPdf(doc, subject, subjectWidth)
  );

  for (let index = 0; index < expandedSubjects.length; index += 2) {
    const first = expandedSubjects[index];
    const second = expandedSubjects[index + 1];
    const firstHeight = estimateSubjectChunkHeight(doc, first.subject, subjectWidth, first.topics, first.doubtSegments);
    const secondHeight = second
      ? estimateSubjectChunkHeight(doc, second.subject, subjectWidth, second.topics, second.doubtSegments)
      : 0;
    const rowHeight = Math.max(firstHeight, secondHeight);
    y = ensureSpace(doc, y, rowHeight + 4);

    drawSubjectCard(doc, first, margin, y, subjectWidth);
    if (second) {
      drawSubjectCard(doc, second, margin + subjectWidth + subjectGap, y, subjectWidth);
    }
    y += rowHeight + 4;
  }

  // Keep the discussion section separated from the subject-card grid.
  y = ensureSpace(doc, y + 4, 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.4);
  setText(doc, ORANGE);
  doc.text("03 · PARENT DISCUSSION", margin, y);
  doc.setFontSize(11.8);
  setText(doc, NAVY);
  doc.text("Ready to discuss", margin, y + 7);
  y += 12;

  report.discussionPoints.forEach((point) => {
    y = ensureSpace(doc, y, 14);
    const lines = doc.splitTextToSize(point || "—", contentWidth - 10);
    const boxHeight = Math.max(10, lines.length * 3.3 + 5);
    drawRoundedCard(doc, margin, y, contentWidth, boxHeight, ORANGE_SOFT, ORANGE_SOFT, 2.2);
    setFill(doc, ORANGE);
    doc.roundedRect(margin, y, 1.2, boxHeight, 0.5, 0.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    setText(doc, "#7C2D12");
    doc.text(lines, margin + 5, y + 4.7);
    y += boxHeight + 2.5;
  });

  y = ensureSpace(doc, y + 3, 15);
  setStroke(doc, BORDER);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  drawText(
    doc,
    `Prepared by Talent Passport · Generated ${new Date(report.generatedAt).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })}`,
    margin,
    y,
    contentWidth,
    5.5,
    MUTED,
    "normal"
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
