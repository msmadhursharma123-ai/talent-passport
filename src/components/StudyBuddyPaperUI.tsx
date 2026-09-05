import { useMemo } from "react";
import { repairQuestionStructure, type MatchedStudyBuddyQuestion } from "../domains/studyBuddy/StudyBuddyMatcher";
import type { StudyBuddyHistoryPaper } from "../data/studyBuddyRepository";

type QuestionItem = MatchedStudyBuddyQuestion;

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>\'"]/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\'": "&#39;",
    "\"": "&quot;",
  }[char] as string));
}

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

type SectionDef = {
  key: string;
  title: string;
  description: string;
  types: string[];
};

const PAPER_SECTIONS: SectionDef[] = [
  { key: "objective-mcq", title: "Section A — Multiple Choice Questions", description: "Choose the correct option.", types: ["MCQ"] },
  { key: "objective-fill", title: "Section B — Fill in the Blanks", description: "Complete each sentence with the correct word or phrase.", types: ["FILL_BLANK"] },
  { key: "objective-match", title: "Section C — Match the Following", description: "Match the items in Column A with the correct items in Column B.", types: ["MATCH_COLUMNS"] },
  { key: "objective-tf", title: "Section D — True / False", description: "Write True or False for each statement.", types: ["TRUE_FALSE"] },
  { key: "short", title: "Section E — Short Answer Type Questions", description: "Answer briefly and clearly.", types: ["SHORT_ANSWER"] },
  { key: "long", title: "Section F — Long Answer Type Questions", description: "Answer in detail with appropriate explanation.", types: ["LONG_ANSWER"] },
  { key: "image", title: "Section G — Picture / Image Based Questions", description: "Observe the image and answer the question.", types: ["IMAGE_BASED"] },
  { key: "passage", title: "Section H — Unseen Passage / Comprehension", description: "Read the passage carefully and answer the questions that follow.", types: ["READING_COMPREHENSION", "UNSEEN_PASSAGE"] },
  { key: "assertion", title: "Section I — Assertion / Reason Questions", description: "Read the Assertion and Reason and choose the appropriate option.", types: ["ASSERTION_REASON"] },
  { key: "one-word", title: "Section J — One-Word Answer Questions", description: "Answer in one word or the form requested by the question.", types: ["ONE_WORD"] },
  { key: "very-short", title: "Section K — Very Short Answer Questions", description: "Answer briefly as instructed.", types: ["VERY_SHORT_ANSWER"] },
  { key: "identify", title: "Section L — Identify / Underline Questions", description: "Identify, circle or underline the required item as instructed.", types: ["IDENTIFY_UNDERLINE"] },
  { key: "word-sort", title: "Section M — Word Classification", description: "Classify or sort the given words into the correct categories.", types: ["WORD_SORTING"] },
  { key: "odd", title: "Section N — Odd One Out", description: "Identify the item that does not belong.", types: ["ODD_ONE_OUT"] },
  { key: "rearrange", title: "Section O — Rearrange / Jumbled Questions", description: "Arrange or rewrite the given items as instructed.", types: ["REARRANGE"] },
  { key: "correct", title: "Section P — Correct the Sentence", description: "Rewrite the sentence(s) correctly.", types: ["CORRECT_THE_SENTENCE"] },
  { key: "table", title: "Section Q — Complete the Table", description: "Complete the table or chart as instructed.", types: ["COMPLETE_TABLE"] },
  { key: "sequence", title: "Section R — Sequence / Order", description: "Arrange the items in the required order.", types: ["SEQUENCE_ORDER"] },
  { key: "reason", title: "Section S — Give Reasons", description: "Give the required reason(s).", types: ["GIVE_REASON"] },
  { key: "compare", title: "Section T — Differentiate / Compare", description: "Compare or differentiate the given items.", types: ["DIFFERENTIATE_COMPARE"] },
  { key: "transform", title: "Section U — Grammar Transformation", description: "Rewrite or transform the given text as instructed.", types: ["GRAMMAR_TRANSFORMATION"] },
  { key: "case", title: "Section V — Case / Competency Based Questions", description: "Read the case or scenario and answer the questions that follow.", types: ["CASE_BASED"] },
  { key: "source", title: "Section W — Source Based Questions", description: "Read the source or extract and answer the questions.", types: ["SOURCE_BASED"] },
  { key: "data", title: "Section X — Data Interpretation", description: "Study the supplied data, table, graph or chart and answer.", types: ["DATA_INTERPRETATION"] },
  { key: "diagram", title: "Section Y — Diagram / Labeling Questions", description: "Label or identify the required parts of the diagram.", types: ["DIAGRAM_LABEL"] },
  { key: "other", title: "Section Z — Other Question Types", description: "Answer the question exactly as instructed.", types: ["OTHER"] },
];

function getFillItems(q: QuestionItem) {
  const raw = (q as any).fillItems;
  if (Array.isArray(raw) && raw.length) return raw;
  const sentences = q.blanks ?? [];
  return [{ sentence: q.fillSentence ?? q.question ?? "", blank: sentences[0] ?? "" }];
}

function renderFillSentence(sentence: string, answers: string[] = []) {
  const raw = String(sentence ?? "");
  const normalized = raw.replace(/[ \t]+/g, " ").trim();
  const answer = answers.find(Boolean);
  if (answer) {
    const at = normalized.indexOf(answer);
    if (at >= 0) return <>{normalized.slice(0, at)}<span className="sb-paper-blank" />{normalized.slice(at + answer.length)}</>;
  }
  if (/_ {2,}|\.{4,}/.test(normalized)) return <>{normalized.replace(/_ {2,}|_{2,}|\.{4,}/g, "____")}</>;
  // Text-layer PDFs often encode a visual blank as a large whitespace gap.
  // Recover that gap instead of adding a second blank at the end.
  if (/ {3,}/.test(raw)) {
    const parts = raw.trim().split(/ {3,}/);
    if (parts.length >= 2) return <>{parts.map((part, i) => <span key={`fill-gap-${i}`}>{part}{i < parts.length - 1 && <span className="sb-paper-blank" />}</span>)}</>;
  }
  return <>{normalized}<span className="sb-paper-blank" /></>;
}

function renderPrintFillSentence(sentence: string, answer = "") {
  const raw = String(sentence || "");
  let rendered = escapeHtml(raw);
  if (answer) {
    const escaped = escapeHtml(answer);
    if (escaped) rendered = rendered.replace(escaped, `<span class="sb-print-blank"></span>`);
  }
  if (/_ {2,}|_{2,}|\.{4,}/.test(rendered)) return rendered.replace(/_ {2,}|_{2,}|\.{4,}/g, `<span class="sb-print-blank"></span>`);
  if (/ {3,}/.test(raw)) return rendered.replace(/ {3,}/g, `<span class="sb-print-blank"></span>`);
  return `${rendered}<span class="sb-print-blank"></span>`;
}

function getOptionLabel(q: QuestionItem, index: number) {
  return q.optionLabels?.[index] || String.fromCharCode(65 + index);
}

function getSections(questions: QuestionItem[]) {
  const repairedQuestions = questions.map(question => repairQuestionStructure(question));
  return PAPER_SECTIONS
    .map(section => ({ ...section, questions: repairedQuestions.filter(q => section.types.includes(String(q.type))) }))
    .filter(section => section.questions.length > 0);
}

function sectionMarks(questions: QuestionItem[]) {
  return questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);
}

function hasMarks(questions: QuestionItem[]) {
  return sectionMarks(questions) > 0;
}

function hasSuspiciousOcr(q: QuestionItem) {
  if (q.sourceFidelity !== "original-snapshot" || !q.sourceImageDataUrl) return false;
  const text = String(q.question ?? "").trim();
  if (!text) return true;
  // Only use the original crop when OCR quality is genuinely unsafe. Normal
  // attachment questions are rendered as clean, consistent paper text.
  if (Number(q.sourceConfidence ?? 100) < 58) return true;
  if (/\b(?:TURE|Falce|treu|Ayear|Aweek|Atnight|tothe|donot|partular)\b/i.test(text)) return true;
  if (q.type === "FILL_BLANK" && !/_{2,}|\.{4,}/.test(text)) return true;
  return false;
}

function renderableMatchColumns(q: QuestionItem) {
  const clean = (value: unknown) => {
    let text = String(value ?? "").replace(/[\uFFFE\uFFFD]/g, " ").replace(/\s+/g, " ").trim();
    text = text.replace(/^(?:column\s*[ab]|columna|columnb)\s*[\uFFFE\uFFFD\-:]?\s*(?:\d{6,}\s*[-:]?)?\s*/i, "").trim();
    text = text.replace(/\b(?:column\s*[ab]|columna|columnb)\s*[\uFFFE\uFFFD\-:]?\s*(?:\d{6,}\s*[-:]?)?/gi, " ").trim();
    if (/^(?=.*\d)[a-z0-9]{5,16}[-:]?$/i.test(text)) return "";
    return text;
  };
  const a = (q.columnA ?? []).map((item: any) => ({ id: clean(item?.id), text: clean(item?.text ?? item) })).filter(item => item.text);
  const b = (q.columnB ?? []).map((item: any) => ({ id: clean(item?.id), text: clean(item?.text ?? item) })).filter(item => item.text);
  return { a, b, count: Math.max(a.length, b.length) };
}

function PaperQuestionPreview({ q, index }: { q: QuestionItem; index: number }) {
  const marks = Number(q.marks || 0);
  const markNode = marks > 0 ? <span className="sb-paper-question-marks">[{marks}]</span> : null;
  const instructionNode = q.instruction ? <div className="sb-paper-section-description">{q.instruction}</div> : null;
  if (hasSuspiciousOcr(q)) return <div className="sb-paper-question sb-source-question">{markNode}{instructionNode}<strong>{index}. </strong><img className="sb-paper-source-snapshot" src={q.sourceImageDataUrl} alt={`Question ${index} reproduced from the attached source`} /></div>;

  if (q.type === "MCQ") return <div className="sb-paper-question">{markNode}{instructionNode}<strong>{index}. </strong>{q.visualImageDataUrl && <img className="sb-paper-image" src={q.visualImageDataUrl} alt={q.imageName || "Question figure"} />}{q.question}
    {(q.options ?? []).length > 0 && <div className="sb-paper-options">{(q.options ?? []).map((option, i) => <div key={`${q.id}-option-${i}`}>{getOptionLabel(q, i)}. {option}</div>)}</div>}
  </div>;

  if (q.type === "FILL_BLANK") return <div className="sb-paper-question">{markNode}{instructionNode}<strong>{index}. </strong>{getFillItems(q).map((item: any, i: number) => <div className="sb-paper-fill-statement" key={`${q.id}-fill-${i}`}><strong>{String.fromCharCode(97 + i)}. </strong>{renderFillSentence(String(item?.sentence ?? ""), [String(item?.blank ?? "")])}</div>)}</div>;

  if (q.type === "TRUE_FALSE") return <div className="sb-paper-question">{markNode}{instructionNode}<strong>{index}. </strong>{q.question && !/^true\s*\/\s*false$/i.test(q.question) ? q.question : "State true or false."}
    <div className="sb-paper-tf-list">{(q.statements ?? []).map((statement, i) => <div className="sb-paper-tf-row" key={`${q.id}-tf-${i}`}><span>{i + 1}.</span><span>{statement}</span><span>True / False</span></div>)}{!(q.statements ?? []).length && <div className="sb-paper-tf-row"><span>1.</span><span>{q.question || "Write True or False."}</span><span>True / False</span></div>}</div>
    {(q.options ?? []).length > 0 && <div className="sb-paper-options">{(q.options ?? []).map((option, i) => <div key={`${q.id}-tf-option-${i}`}>{getOptionLabel(q, i)}. {option}</div>)}</div>}
  </div>;

  if (q.type === "ASSERTION_REASON") return <div className="sb-paper-question">{markNode}{instructionNode}<strong>{index}. </strong>{q.question || "Assertion and Reason"}<div className="sb-paper-ar"><div><strong>Assertion (A):</strong> {q.assertion || ""}</div><div><strong>Reason (R):</strong> {q.reason || ""}</div>{(q.assertionOptions ?? q.options ?? []).length > 0 && <div className="sb-paper-options">{(q.assertionOptions ?? q.options ?? []).map((o, i) => <div key={`${q.id}-ar-${i}`}>{getOptionLabel(q, i)}. {o}</div>)}</div>}</div></div>;

  if (q.type === "MATCH_COLUMNS") { const { a, b, count } = renderableMatchColumns(q); return <div className="sb-paper-question">{markNode}{instructionNode}<strong>{index}. </strong>{q.question || "Match the following"}{count > 0 ? <div className="sb-paper-match"><div><div className="sb-paper-match-title">Column A</div>{Array.from({ length: count }, (_, i) => <div className="sb-paper-match-row" key={`${q.id}-a-${i}`}><span>{a[i]?.id || `${i + 1}.`}</span><span>{a[i]?.text || ""}</span></div>)}</div><div><div className="sb-paper-match-title">Column B</div>{Array.from({ length: count }, (_, i) => <div className="sb-paper-match-row" key={`${q.id}-b-${i}`}><span>{b[i]?.id || `${String.fromCharCode(97 + i)}.`}</span><span>{b[i]?.text || ""}</span></div>)}</div></div> : q.sourceImageDataUrl ? <img className="sb-paper-source-snapshot" src={q.sourceImageDataUrl} alt={`Question ${index} reproduced from the attached source`} /> : null}</div>; }

  if (q.type === "WORD_SORTING") return <div className="sb-paper-question">{markNode}{instructionNode}<strong>{index}. </strong>{q.question}<div className="sb-paper-match">{(q.categories ?? []).map(category => <div key={category}><div className="sb-paper-match-title">{category}</div><div className="sb-paper-sort-box" /></div>)}</div>{(q.wordBank ?? q.items ?? []).length > 0 && <div className="sb-paper-word-bank"><strong>Words:</strong> {(q.wordBank ?? q.items ?? []).join(", ")}</div>}</div>;

  if (q.type === "IMAGE_BASED" || q.type === "DIAGRAM_LABEL") return <div className="sb-paper-question">{markNode}{instructionNode}<strong>{index}. </strong>{(q.imageDataUrl || q.visualImageDataUrl) && <img className="sb-paper-image" src={q.imageDataUrl || q.visualImageDataUrl} alt={q.imageName || "Question"} />}<div className="sb-paper-image-prompt">{q.imageInstruction || q.question || "Observe the image and answer as instructed."}</div></div>;

  if (["CASE_BASED","SOURCE_BASED","DATA_INTERPRETATION","READING_COMPREHENSION","UNSEEN_PASSAGE"].includes(q.type)) return <div className="sb-paper-question">{markNode}{instructionNode}<strong>{index}. </strong>{q.question || "Read the following and answer the questions."}<div className="sb-paper-passage">{q.passage || ""}</div>{(q.passageQuestions ?? []).map((pq, i) => <div className="sb-paper-passage-q" key={`${q.id}-passage-${i}`}><strong>{String.fromCharCode(97 + i)}. </strong>{pq.question || ""}{(pq.options ?? []).map((o, j) => <div className="sb-paper-options" key={`${q.id}-pq-${i}-${j}`}>{String.fromCharCode(65 + j)}. {o}</div>)}</div>)}</div>;

  const items = q.items ?? [];
  return <div className="sb-paper-question">{markNode}{instructionNode}<strong>{index}. </strong>{q.question || "Untitled question"}{items.length > 1 && <div className="sb-paper-item-list">{items.map((item, i) => <div key={`${q.id}-item-${i}`}><strong>{i + 1}. </strong>{item}</div>)}</div>}</div>;
}

function renderPrintMatch(q: QuestionItem, count: number) {
  const { a, b } = renderableMatchColumns(q);
  return `<div class="sb-print-match"><div><div class="sb-print-match-title">Column A</div>${Array.from({ length: count }, (_, i) => `<div class="sb-print-match-row"><span>${escapeHtml(a[i]?.id || `${i + 1}.`)}</span><span>${escapeHtml(a[i]?.text || "")}</span></div>`).join("")}</div><div><div class="sb-print-match-title">Column B</div>${Array.from({ length: count }, (_, i) => `<div class="sb-print-match-row"><span>${escapeHtml(b[i]?.id || `${String.fromCharCode(97 + i)}.`)}</span><span>${escapeHtml(b[i]?.text || "")}</span></div>`).join("")}</div></div>`;
}

function renderPrintQuestion(q: QuestionItem, number: number) {
  const marks = Number(q.marks || 0) > 0 ? `<span class="sb-print-question-marks">[${escapeHtml(q.marks)}]</span>` : "";
  const instruction = q.instruction ? `<div class="sb-print-section-description">${escapeHtml(q.instruction)}</div>` : "";
  if (hasSuspiciousOcr(q)) return `<div class="sb-print-question sb-source-question">${marks}${instruction}<strong>${number}. </strong><img class="sb-print-source-snapshot" src="${escapeHtml(q.sourceImageDataUrl || "")}" alt="Question ${number} reproduced from the attached source"></div>`;
  if (q.type === "MCQ") return `<div class="sb-print-question">${marks}${instruction}<strong>${number}. </strong>${q.visualImageDataUrl ? `<img class="sb-print-image" src="${escapeHtml(q.visualImageDataUrl)}" alt="Question figure">` : ""}${escapeHtml(q.question)}<div class="sb-print-options">${(q.options ?? []).map((o, j) => `<div>${escapeHtml(getOptionLabel(q, j))}. ${escapeHtml(o)}</div>`).join("")}</div></div>`;
  if (q.type === "FILL_BLANK") return `<div class="sb-print-question">${marks}${instruction}<strong>${number}. </strong>${getFillItems(q).map((item: any, i: number) => `<div class="sb-print-fill-statement"><span class="sb-print-sub-number">${String.fromCharCode(97 + i)}. </span>${renderPrintFillSentence(String(item?.sentence ?? ""), String(item?.blank ?? ""))}</div>`).join("")}</div>`;
  if (q.type === "TRUE_FALSE") { const statements = q.statements ?? []; const rows = statements.length ? statements.map((statement, i) => `<div class="sb-print-tf-row"><span>${i + 1}.</span><span>${escapeHtml(statement)}</span><span>True / False</span></div>`).join("") : `<div class="sb-print-tf-row"><span>1.</span><span>${escapeHtml(q.question || "Write True or False.")}</span><span>True / False</span></div>`; const options = (q.options ?? []).length ? `<div class="sb-print-options">${(q.options ?? []).map((o, i) => `<div>${escapeHtml(getOptionLabel(q, i))}. ${escapeHtml(o)}</div>`).join("")}</div>` : ""; return `<div class="sb-print-question">${marks}${instruction}<strong>${number}. </strong>${escapeHtml(q.question || "State true or false.")}<div class="sb-print-tf-list">${rows}</div>${options}</div>`; }
  if (q.type === "ASSERTION_REASON") return `<div class="sb-print-question">${marks}${instruction}<strong>${number}. </strong>${escapeHtml(q.question || "Assertion and Reason")}<div class="sb-print-ar"><div><strong>Assertion (A):</strong> ${escapeHtml(q.assertion || "")}</div><div><strong>Reason (R):</strong> ${escapeHtml(q.reason || "")}</div>${(q.assertionOptions ?? q.options ?? []).map((o, i) => `<div>${escapeHtml(getOptionLabel(q, i))}. ${escapeHtml(o)}</div>`).join("")}</div></div>`;
  if (q.type === "MATCH_COLUMNS") { const count = Math.max((q.columnA ?? []).length, (q.columnB ?? []).length); return `<div class="sb-print-question">${marks}${instruction}<strong>${number}. </strong>${escapeHtml(q.question || "Match the following")}${renderPrintMatch(q, count)}</div>`; }
  if (q.type === "WORD_SORTING") return `<div class="sb-print-question">${marks}${instruction}<strong>${number}. </strong>${escapeHtml(q.question)}<div class="sb-print-word-bank"><strong>Words:</strong> ${escapeHtml((q.wordBank ?? q.items ?? []).join(", "))}</div><div class="sb-print-sort-grid">${(q.categories ?? []).map(c => `<div><div class="sb-print-match-title">${escapeHtml(c)}</div><div class="sb-print-sort-box"></div></div>`).join("")}</div></div>`;
  if (q.type === "IMAGE_BASED" || q.type === "DIAGRAM_LABEL") { const image = (q.imageDataUrl || q.visualImageDataUrl) ? `<img class="sb-print-image" src="${escapeHtml(q.imageDataUrl || q.visualImageDataUrl || "")}" alt="Question image">` : ""; return `<div class="sb-print-question">${marks}${instruction}<strong>${number}. </strong>${image}<div class="sb-print-image-prompt">${escapeHtml(q.imageInstruction || q.question || "Observe the image and answer as instructed.")}</div></div>`; }
  if (["CASE_BASED","SOURCE_BASED","DATA_INTERPRETATION","READING_COMPREHENSION","UNSEEN_PASSAGE"].includes(q.type)) return `<div class="sb-print-question">${marks}${instruction}<strong>${number}. </strong>${escapeHtml(q.question || "Read the following and answer the questions.")}<div class="sb-print-passage">${escapeHtml(q.passage || "")}</div>${(q.passageQuestions ?? []).map((pq, i) => `<div class="sb-print-passage-q"><strong>${String.fromCharCode(97 + i)}. </strong>${escapeHtml(pq.question || "")}</div>`).join("")}</div>`;
  const items = q.items ?? [];
  return `<div class="sb-print-question">${marks}${instruction}<strong>${number}. </strong>${escapeHtml(q.question || "Untitled question")}${items.length > 1 ? `<div class="sb-print-item-list">${items.map((item, i) => `<div><strong>${i + 1}. </strong>${escapeHtml(item)}</div>`).join("")}</div>` : ""}</div>`;
}

function printHtml(paper: StudyBuddyHistoryPaper) {
  const questions = (paper.questions ?? []) as QuestionItem[];
  const sections = getSections(questions);
  const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);
  let number = 1;
  const sectionsHtml = sections.map(section => {
    const sectionTotal = sectionMarks(section.questions);
    const body = section.questions.map(q => renderPrintQuestion(q, number++)).join("");
    return `<section class="sb-print-paper-section"><div class="sb-print-section-heading"><span>${escapeHtml(section.title)}</span>${sectionTotal > 0 ? `<span>${sectionTotal} Marks</span>` : ""}</div><div class="sb-print-section-description">${escapeHtml(section.description)}</div>${body}</section>`;
  }).join("");

  const doubts = paper.unresolvedDoubts ?? [];
  const schoolName = String((paper.metadata as any)?.schoolName ?? "School").trim() || "School";
  return `<div class="sb-print-page"><header class="sb-print-header"><div class="sb-print-kicker">ACADEMIC GROWTH JOURNEY · STUDY BUDDY</div><h1>${escapeHtml(paper.title || "Study Buddy Paper")}</h1><div class="sb-print-subject">${escapeHtml(paper.subjectName)}</div></header><div class="sb-print-meta"><span><strong>School:</strong> ${escapeHtml(schoolName)}</span><span><strong>Questions:</strong> ${escapeHtml(paper.questionCount)}</span><span><strong>Generated:</strong> ${escapeHtml(fmtDate(paper.generatedAt))}</span><span><strong>Class:</strong> ${escapeHtml(paper.className)} · Section ${escapeHtml(paper.sectionName)}</span>${totalMarks > 0 ? `<span><strong>Total Marks:</strong> ${escapeHtml(totalMarks)}</span>` : `<span><strong>Mode:</strong> Targeted Practice</span>`}<span><strong>Subject:</strong> ${escapeHtml(paper.subjectName)}</span></div><div class="sb-print-instructions"><strong>General Instructions:</strong> Read all questions carefully. Answer all questions as instructed in each section.</div><div class="sb-print-focus"><strong>Targeted focus:</strong> ${escapeHtml(doubts.join(" · ") || "Current unresolved doubts")}</div>${sectionsHtml}</div>`;
}

export function printStudyBuddyPaper(paper: StudyBuddyHistoryPaper) {
  const printWindow = window.open("", "_blank", "width=1100,height=900");
  if (!printWindow) {
    window.alert("Please allow pop-ups for Talent Passport to print or save this paper as PDF.");
    return;
  }

  const css = `
    @page{size:A4;margin:0}
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#fff;color:#111827}
    body{font-family:Arial,Helvetica,sans-serif}
    .sb-print-page{width:210mm;min-height:297mm;margin:0 auto;padding:13mm 14mm;background:#fff;color:#111827}
    .sb-print-header{text-align:center;margin-bottom:12pt}.sb-print-kicker{font-size:9pt;font-weight:800;letter-spacing:1.4pt;color:#C2410C;text-transform:uppercase}.sb-print-header h1{margin:4pt 0 3pt;font-size:19pt;line-height:1.15}.sb-print-subject{font-size:10pt;font-weight:800}
    .sb-print-meta{display:grid;grid-template-columns:1fr 1fr;gap:5pt 18pt;margin:13pt 0 12pt;padding:10pt;border:1px solid #CBD5E1;border-radius:6pt;font-size:8.5pt}.sb-print-meta span{min-width:0;overflow-wrap:anywhere}
    .sb-print-instructions{padding:8pt 10pt;margin:0 0 8pt;background:#F8FAFC;border-left:3pt solid #F97316;font-size:8.5pt;line-height:1.45}.sb-print-focus{padding:7pt 10pt;margin:0 0 12pt;background:#FFF7ED;border-left:3pt solid #FDBA74;color:#475569;font-size:8pt;line-height:1.45}
    .sb-print-paper-section{margin:0 0 12pt;break-inside:auto}.sb-print-section-heading{display:flex;justify-content:space-between;gap:10pt;align-items:center;padding:6pt 8pt;background:#F8FAFC;border-top:1.5pt solid #CBD5E1;border-bottom:.7pt solid #E2E8F0;font-size:9.5pt;font-weight:800;text-transform:uppercase}.sb-print-section-description{margin:5pt 0 7pt;color:#64748B;font-size:8pt;font-style:italic}.sb-print-question{position:relative;margin:0 0 9pt;font-size:9.5pt;line-height:1.48;break-inside:avoid}.sb-source-question{display:block;padding:2pt 0}.sb-print-source-snapshot{display:inline-block;vertical-align:top;max-width:calc(100% - 28pt);max-height:72mm;width:auto;height:auto;object-fit:contain;margin:0 0 2pt 5pt;border:0;background:#fff}.sb-print-question-marks{float:right;font-weight:800}.sb-print-options{margin:4pt 0 0 17pt}.sb-print-options div{margin:2pt 0}.sb-print-blank{display:inline-block;min-width:58pt;border-bottom:1pt solid #111827;margin:0 2pt;height:10pt}.sb-print-fill-statement{margin:4pt 0 0 18pt;line-height:1.55}.sb-print-sub-number{font-weight:700;display:inline-block;min-width:15pt}.sb-print-match{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24pt;margin:6pt 0 0 18pt}.sb-print-match-title{font-size:8pt;font-weight:800;text-transform:uppercase;color:#64748B;margin-bottom:3pt}.sb-print-match-row{display:grid;grid-template-columns:20pt minmax(0,1fr);gap:5pt;margin:3pt 0;overflow-wrap:anywhere;word-break:break-word}.sb-print-tf-list{margin:5pt 0 0 18pt}.sb-print-tf-row{display:grid;grid-template-columns:18pt 1fr 55pt;gap:5pt;margin:4pt 0}.sb-print-tf-row span:last-child{white-space:nowrap}.sb-print-image{display:block;max-width:120mm;max-height:70mm;margin:7pt auto;border-radius:4pt;object-fit:contain}.sb-print-image-prompt{font-weight:600;margin-top:5pt}.sb-print-passage{white-space:pre-wrap;line-height:1.5;margin:6pt 0 8pt;padding:8pt;border:1pt solid #CBD5E1;background:#FAFAFA;border-radius:4pt}.sb-print-passage-q{margin:4pt 0 0 18pt;position:relative} .sb-print-ar{margin:6pt 0 0 18pt;line-height:1.5}.sb-print-word-bank{margin:6pt 0 0 18pt}.sb-print-sort-grid{display:grid;grid-template-columns:1fr 1fr;gap:12pt;margin:8pt 0 0 18pt}.sb-print-sort-box{height:35pt;border:1pt solid #CBD5E1;border-radius:3pt}.sb-print-item-list{margin:6pt 0 0 18pt}.sb-paper-ar{margin:7pt 0 0 18pt;line-height:1.55}.sb-paper-word-bank{margin:8pt 0 0 18pt}.sb-paper-sort-box{min-height:55pt;border:1px solid #CBD5E1;border-radius:4pt}.sb-paper-item-list{margin:7pt 0 0 18pt}.sb-paper-options{margin:4pt 0 0 17pt}.sb-paper-options div{margin:2pt 0}
    @media print{body{background:#fff!important}.sb-print-page{margin:0}.sb-print-paper-section{break-inside:auto}.sb-print-section-heading{break-after:avoid}.sb-print-question{break-inside:avoid}}
  `;

  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(paper.title)}</title><style>${css}</style></head><body>${printHtml(paper)}<script>(function(){function ready(){var imgs=[].slice.call(document.images);if(!imgs.length){setTimeout(function(){window.focus();window.print()},180);return;}var left=imgs.length;function done(){left-=1;if(left<=0)setTimeout(function(){window.focus();window.print()},180)}imgs.forEach(function(img){if(img.complete)done();else{img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});}});setTimeout(function(){window.focus();window.print()},2500)}if(document.readyState==='complete')ready();else window.addEventListener('load',ready);window.onafterprint=function(){setTimeout(function(){window.close()},150)};})();<\/script></body></html>`);
  printWindow.document.close();
}

export function StudyBuddyPaperPreview({ paper, onClose }: { paper: StudyBuddyHistoryPaper; onClose: () => void }) {
  const questions = (paper.questions ?? []) as QuestionItem[];
  const sections = useMemo(() => getSections(questions), [questions]);
  const totalMarks = useMemo(() => questions.reduce((sum, q) => sum + Number(q.marks || 0), 0), [questions]);
  const allDoubts = paper.unresolvedDoubts ?? [];
  const schoolName = String((paper.metadata as any)?.schoolName ?? "School").trim() || "School";
  let globalNumber = 1;

  return <div className="sb-paper-modal" role="dialog" aria-modal="true" aria-label="Study Buddy paper preview">
    <div className="sb-paper-modal-card">
      <div className="sb-paper-modal-head">
        <div><div className="sb-paper-eyebrow">PAPER PREVIEW · A4</div><strong>{paper.title || "Study Buddy Paper"}</strong></div>
        <div className="sb-paper-modal-actions"><button className="sb-paper-btn" onClick={onClose}>Close</button><button className="sb-paper-btn sb-paper-btn-primary" onClick={() => printStudyBuddyPaper(paper)}>Download / Save PDF</button></div>
      </div>
      <div className="sb-paper-modal-body">
        <div className="sb-paper-preview-wrap">
          <article className="sb-paper-a4">
            <header className="sb-paper-header"><div className="sb-paper-kicker">ACADEMIC GROWTH JOURNEY · STUDY BUDDY</div><h1>{paper.title || "Study Buddy Paper"}</h1><div className="sb-paper-subject">{paper.subjectName}</div></header>
            <div className="sb-paper-meta"><span><strong>School:</strong> {schoolName}</span><span><strong>Questions:</strong> {paper.questionCount}</span><span><strong>Generated:</strong> {fmtDate(paper.generatedAt)}</span><span><strong>Class:</strong> {paper.className} · Section {paper.sectionName}</span>{totalMarks > 0 ? <span><strong>Total Marks:</strong> {totalMarks}</span> : <span><strong>Mode:</strong> Targeted Practice</span>}<span><strong>Subject:</strong> {paper.subjectName}</span></div>
            <div className="sb-paper-instructions"><strong>General Instructions:</strong> Read all questions carefully. Answer all questions as instructed in each section.</div><div className="sb-paper-focus"><strong>Targeted focus:</strong> {allDoubts.length ? allDoubts.join(" · ") : "Current unresolved doubts"}</div>
            {sections.map(section => { const sectionTotal = sectionMarks(section.questions); return <section className="sb-paper-section" key={section.key}><div className="sb-paper-section-heading"><span>{section.title}</span>{hasMarks(section.questions) && <span>{sectionTotal} Marks</span>}</div><div className="sb-paper-section-description">{section.description}</div>{section.questions.map(q => <PaperQuestionPreview key={`${q.studyBuddySource.sourceId}-${q.id}-${globalNumber}`} q={q} index={globalNumber++}/>)}</section>; })}
          </article>
        </div>
      </div>
    </div>
  </div>;
}
