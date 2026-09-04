import { useEffect, useMemo, useState } from "react";
import { getStudentPublishedWorksheets, type PublishedWorksheet } from "../data/studentStudyMaterialRepository";
import { getStudentSubjects } from "../data/studentGrowthPlanRepository";

interface MatchColumnItem { id: string; text: string; }
interface PassageQuestion { id: string; question: string; marks: number; }
type QuestionType = "MCQ" | "SHORT_ANSWER" | "LONG_ANSWER" | "MATCH_COLUMNS" | "FILL_BLANK" | "TRUE_FALSE" | "IMAGE_BASED" | "UNSEEN_PASSAGE";
interface QuestionItem {
  id: string;
  type: QuestionType;
  question: string;
  marks: number;
  options?: string[];
  fillSentence?: string;
  blanks?: string[];
  statements?: string[];
  columnA?: MatchColumnItem[];
  columnB?: MatchColumnItem[];
  imageDataUrl?: string;
  imageName?: string;
  imageInstruction?: string;
  passage?: string;
  passageQuestions?: PassageQuestion[];
}

interface WorksheetPayload {
  schoolName?: string;
  chapter?: string;
  questions?: QuestionItem[];
}

type TimeFilter = "ALL" | "30D" | "60D" | "90D" | "CUSTOM";

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function dateKey(value: string | null | undefined) {
  return String(value ?? "").slice(0, 10);
}

function getPayload(record: PublishedWorksheet): WorksheetPayload {
  return record.payload as WorksheetPayload;
}

function getChapter(record: PublishedWorksheet) {
  const payload = getPayload(record);
  return String(record.chapterName || payload.chapter || "Chapter 1").trim() || "Chapter 1";
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char] as string));
}

function normalizeQuestions(questions: QuestionItem[]) {
  return questions.map(question => ({
    ...question,
    marks: 0,
    passageQuestions: question.passageQuestions?.map(item => ({ ...item, marks: 0 })),
  }));
}

function renderFillHtml(sentence: string, answers: string[]) {
  let rendered = escapeHtml(sentence || "");
  for (const answer of answers.filter(Boolean)) {
    const escaped = escapeHtml(answer);
    if (escaped) rendered = rendered.replace(escaped, `<span class="sm-blank"></span>`);
  }
  return rendered;
}

function renderQuestionHtml(question: QuestionItem, number: number) {
  const prefix = `<strong>${number}. </strong>`;
  if (question.type === "MCQ") {
    return `<div class="sm-question">${prefix}${escapeHtml(question.question)}<div class="sm-options">${(question.options ?? []).map((option, index) => `<div>${String.fromCharCode(65 + index)}. ${escapeHtml(option)}</div>`).join("")}</div></div>`;
  }
  if (question.type === "FILL_BLANK") {
    const rawItems = (question as any).fillItems;
    const items = Array.isArray(rawItems) && rawItems.length
      ? rawItems
      : [{ sentence: question.fillSentence ?? question.question ?? "", blank: question.blanks?.[0] ?? "" }];
    return `<div class="sm-question">${prefix}${items.map((item: any, index: number) => `<div class="sm-fill"><strong>${String.fromCharCode(97 + index)}. </strong>${renderFillHtml(String(item?.sentence ?? ""), [String(item?.blank ?? "")])}</div>`).join("")}</div>`;
  }
  if (question.type === "MATCH_COLUMNS") {
    const left = question.columnA ?? [];
    const right = question.columnB ?? [];
    const count = Math.max(left.length, right.length);
    return `<div class="sm-question">${prefix}${escapeHtml(question.question || "Match the following")}<div class="sm-match"><div>${Array.from({ length: count }, (_, index) => `<div class="sm-match-row"><span>${index + 1}.</span><span>${escapeHtml(left[index]?.text || "")}</span></div>`).join("")}</div><div>${Array.from({ length: count }, (_, index) => `<div class="sm-match-row"><span>${String.fromCharCode(97 + index)}.</span><span>${escapeHtml(right[index]?.text || "")}</span></div>`).join("")}</div></div></div>`;
  }
  if (question.type === "TRUE_FALSE") {
    const statements = question.statements ?? [];
    const rows = statements.length
      ? statements.map((statement, index) => `<div class="sm-tf-row"><span>${index + 1}.</span><span>${escapeHtml(statement)}</span><span>True / False</span></div>`).join("")
      : `<div class="sm-tf-row"><span>1.</span><span>Write True or False.</span><span>True / False</span></div>`;
    return `<div class="sm-question">${prefix}${escapeHtml(question.question || "True / False")}<div class="sm-tf-list">${rows}</div></div>`;
  }
  if (question.type === "IMAGE_BASED") {
    const image = question.imageDataUrl ? `<img class="sm-image" src="${question.imageDataUrl}" alt="Worksheet question">` : "";
    return `<div class="sm-question">${prefix}${image}<div>${escapeHtml(question.imageInstruction || question.question || "Describe the image and explain what you see.")}</div></div>`;
  }
  if (question.type === "UNSEEN_PASSAGE") {
    const childQuestions = (question.passageQuestions ?? []).map((item, index) => `<div class="sm-passage-q"><strong>${String.fromCharCode(97 + index)}. </strong>${escapeHtml(item.question)}</div>`).join("");
    return `<div class="sm-question">${prefix}Read the following passage and answer the questions.<div class="sm-passage">${escapeHtml(question.passage || "")}</div>${childQuestions}</div>`;
  }
  return `<div class="sm-question">${prefix}${escapeHtml(question.question || "Untitled question")}</div>`;
}

const SECTION_DEFS: { title: string; types: QuestionItem["type"][]; description: string }[] = [
  { title: "Section A — Multiple Choice Questions", description: "Choose the correct option.", types: ["MCQ"] },
  { title: "Section B — Fill in the Blanks", description: "Complete each sentence with the correct word or phrase.", types: ["FILL_BLANK"] },
  { title: "Section C — Match the Following", description: "Match the items in Column A with the correct items in Column B.", types: ["MATCH_COLUMNS"] },
  { title: "Section D — True / False", description: "Write True or False for each statement.", types: ["TRUE_FALSE"] },
  { title: "Section E — Short Answer Type Questions", description: "Answer briefly and clearly.", types: ["SHORT_ANSWER"] },
  { title: "Section F — Long Answer Type Questions", description: "Answer in detail with appropriate explanation.", types: ["LONG_ANSWER"] },
  { title: "Section G — Picture / Image Based Questions", description: "Observe the image and answer the question.", types: ["IMAGE_BASED"] },
  { title: "Section H — Unseen Passage / Comprehension", description: "Read the passage carefully and answer the questions that follow.", types: ["UNSEEN_PASSAGE"] },
];

function printWorksheet(record: PublishedWorksheet) {
  const payload = getPayload(record);
  const questions = normalizeQuestions(payload.questions ?? []);
  const sections = SECTION_DEFS.map(def => ({ ...def, questions: questions.filter(question => def.types.includes(question.type)) })).filter(section => section.questions.length);
  const popup = window.open("", "_blank", "width=1000,height=800");
  if (!popup) {
    window.alert("Please allow pop-ups for Talent Passport to download this worksheet as PDF.");
    return;
  }
  let number = 1;
  const sectionsHtml = sections.map(section => `<section class="sm-section"><div class="sm-section-title">${escapeHtml(section.title)}</div><div class="sm-section-copy">${escapeHtml(section.description)}</div>${section.questions.map(question => renderQuestionHtml(question, number++)).join("")}</section>`).join("");
  const body = `<article class="sm-paper"><div class="sm-kicker">${escapeHtml(payload.schoolName || "School")} · WORKSHEET</div><h1>${escapeHtml(record.title || "Worksheet")}</h1><div class="sm-subject">${escapeHtml(record.subjectName)}</div><div class="sm-meta"><span><strong>Date:</strong> ${escapeHtml(fmtDate(record.publishedAt))}</span><span><strong>Class:</strong> ${escapeHtml(record.className)} · Section ${escapeHtml(record.sectionName)}</span><span><strong>Teacher:</strong> ${escapeHtml(record.teacherName)}</span><span><strong>Chapter:</strong> ${escapeHtml(getChapter(record))}</span></div><div class="sm-instruction"><strong>Practice Worksheet:</strong> Complete all activities carefully.</div>${sectionsHtml}</article>`;
  const css = `@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff;color:#111827}body{font-family:Arial,sans-serif}.sm-paper{width:210mm;min-height:297mm;margin:0 auto;padding:12mm;box-sizing:border-box}.sm-kicker{margin-bottom:7px;text-align:center;color:#9A3412;font-size:10pt;font-weight:800;letter-spacing:1.2pt}.sm-paper h1{margin:0 0 5pt;text-align:center;font-size:24pt}.sm-subject{text-align:center;font-size:11pt;font-weight:800}.sm-meta{display:grid;grid-template-columns:repeat(2,1fr);gap:4pt 16pt;margin:18pt 0;font-size:9pt}.sm-instruction{margin-bottom:14pt;padding:6pt 8pt;border-left:3pt solid #F97316;background:#FFF7ED;font-size:8pt;line-height:1.45}.sm-section{margin:0 0 10pt}.sm-section-title{padding:6pt 8pt;background:#F8FAFC;border-top:1.5pt solid #CBD5E1;border-bottom:.7pt solid #E2E8F0;font-size:9pt;font-weight:800;text-transform:uppercase}.sm-section-copy{margin:5pt 0 7pt;color:#64748B;font-size:8pt;font-style:italic}.sm-question{margin:0 0 9pt;font-size:9.5pt;line-height:1.48;break-inside:avoid}.sm-options{margin:4pt 0 0 17pt}.sm-options>div{margin:2pt 0}.sm-fill{margin:4pt 0 0 18pt}.sm-blank{display:inline-block;min-width:58pt;height:10pt;border-bottom:1pt solid #111827;margin:0 2pt}.sm-match{display:grid;grid-template-columns:1fr 1fr;gap:24pt;margin:6pt 0 0 18pt}.sm-match-row{display:grid;grid-template-columns:20pt 1fr;gap:5pt;margin:3pt 0}.sm-tf-list{margin:5pt 0 0 18pt}.sm-tf-row{display:grid;grid-template-columns:18pt 1fr 55pt;gap:5pt;margin:4pt 0}.sm-tf-row span:last-child{white-space:nowrap}.sm-image{display:block;max-width:120mm;max-height:70mm;margin:7pt auto;object-fit:contain}.sm-passage{white-space:pre-wrap;line-height:1.5;margin:6pt 0 8pt;padding:8pt;border:1pt solid #CBD5E1;background:#FAFAFA;border-radius:4pt}.sm-passage-q{margin:4pt 0 0 18pt}`;
  popup.document.open();
  popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(record.title || "Worksheet")}</title><style>${css}</style></head><body>${body}<script>(function(){function ready(){var imgs=[].slice.call(document.images);if(!imgs.length){setTimeout(function(){window.focus();window.print()},180);return;}var left=imgs.length;function done(){left-=1;if(left<=0)setTimeout(function(){window.focus();window.print()},180)}imgs.forEach(function(img){if(img.complete)done();else{img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});}});setTimeout(function(){window.focus();window.print()},2500)}if(document.readyState==='complete')ready();else window.addEventListener('load',ready);window.onafterprint=function(){setTimeout(function(){window.close()},150)};})();<\/script></body></html>`);
  popup.document.close();
}

function WorksheetPreview({ record, onClose }: { record: PublishedWorksheet; onClose: () => void }) {
  const payload = getPayload(record);
  const questions = normalizeQuestions(payload.questions ?? []);
  const sections = SECTION_DEFS.map(def => ({ ...def, questions: questions.filter(question => def.types.includes(question.type)) })).filter(section => section.questions.length);
  let number = 1;
  return <div className="sm-modal" role="dialog" aria-modal="true"><div className="sm-modal-card"><div className="sm-modal-head"><div><div className="sm-eyebrow">WORKSHEET PREVIEW</div><strong>{record.title || "Worksheet"}</strong></div><div className="sm-actions"><button className="sm-btn" onClick={onClose}>Close</button><button className="sm-btn sm-primary" onClick={() => printWorksheet(record)}>Download PDF</button></div></div><div className="sm-modal-body"><article className="sm-paper sm-screen-paper"><div className="sm-kicker">{payload.schoolName || "School"} · WORKSHEET</div><h1>{record.title || "Worksheet"}</h1><div className="sm-subject">{record.subjectName}</div><div className="sm-meta"><span><strong>Published:</strong> {fmtDate(record.publishedAt)}</span><span><strong>Class:</strong> {record.className} · Section {record.sectionName}</span><span><strong>Teacher:</strong> {record.teacherName}</span><span><strong>Chapter:</strong> {getChapter(record)}</span></div><div className="sm-instruction"><strong>Practice Worksheet:</strong> Complete all activities carefully.</div>{sections.map(section => <section className="sm-section" key={section.title}><div className="sm-section-title">{section.title}</div><div className="sm-section-copy">{section.description}</div>{section.questions.map(question => <QuestionPreview key={question.id} question={question} index={number++} />)}</section>)}</article></div></div></div>;
}

function QuestionPreview({ question, index }: { question: QuestionItem; index: number }) {
  const prefix = <strong>{index}. </strong>;
  if (question.type === "MCQ") return <div className="sm-question">{prefix}{question.question}<div className="sm-options">{(question.options ?? []).map((option, i) => <div key={i}>{String.fromCharCode(65 + i)}. {option}</div>)}</div></div>;
  if (question.type === "FILL_BLANK") {
    const rawItems = (question as any).fillItems;
    const items = Array.isArray(rawItems) && rawItems.length ? rawItems : [{ id: "legacy", sentence: question.fillSentence ?? question.question ?? "", blank: question.blanks?.[0] ?? "" }];
    return <div className="sm-question">{prefix}{items.map((item: any, i: number) => <div className="sm-fill" key={String(item.id || i)}><strong>{String.fromCharCode(97 + i)}. </strong><FillSentenceReact sentence={String(item.sentence ?? "")} answer={String(item.blank ?? "")} /></div>)}</div>;
  }
  if (question.type === "MATCH_COLUMNS") {
    const a = question.columnA ?? [], b = question.columnB ?? [], count = Math.max(a.length, b.length);
    return <div className="sm-question">{prefix}{question.question || "Match the following"}<div className="sm-match"><div>{Array.from({ length: count }, (_, i) => <div className="sm-match-row" key={`a-${i}`}><span>{i + 1}.</span><span>{a[i]?.text || "—"}</span></div>)}</div><div>{Array.from({ length: count }, (_, i) => <div className="sm-match-row" key={`b-${i}`}><span>{String.fromCharCode(97 + i)}.</span><span>{b[i]?.text || "—"}</span></div>)}</div></div></div>;
  }
  if (question.type === "TRUE_FALSE") return <div className="sm-question">{prefix}{question.question || "True / False"}<div className="sm-tf-list">{(question.statements ?? []).length ? (question.statements ?? []).map((statement, i) => <div className="sm-tf-row" key={`${question.id}-${i}`}><span>{i + 1}.</span><span>{statement}</span><span>True / False</span></div>) : <div className="sm-tf-row"><span>1.</span><span>Write True or False.</span><span>True / False</span></div>}</div></div>;
  if (question.type === "IMAGE_BASED") return <div className="sm-question">{prefix}{question.imageDataUrl && <img className="sm-image" src={question.imageDataUrl} alt={question.imageName || "Question"} />}<div>{question.imageInstruction || question.question || "Describe the image and explain what you see."}</div></div>;
  if (question.type === "UNSEEN_PASSAGE") return <div className="sm-question">{prefix}Read the following passage and answer the questions.<div className="sm-passage">{question.passage || ""}</div>{(question.passageQuestions ?? []).map((item, i) => <div className="sm-passage-q" key={item.id}><strong>{String.fromCharCode(97 + i)}. </strong>{item.question}</div>)}</div>;
  return <div className="sm-question">{prefix}{question.question || "Untitled question"}</div>;
}

function FillSentenceReact({ sentence, answer }: { sentence: string; answer: string }) {
  if (!answer) return <>{sentence}</>;
  const at = sentence.indexOf(answer);
  if (at < 0) return <>{sentence}</>;
  return <>{sentence.slice(0, at)}<span className="sm-blank" />{sentence.slice(at + answer.length)}</>;
}

function indiaTodayKey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${year}-${month}-${day}`;
}

function dateWithinFilter(value: string, filter: TimeFilter, customStart: string, customEnd: string) {
  const key = dateKey(value);
  if (!key) return false;
  if (filter === "CUSTOM") {
    if (customStart && customEnd && customStart > customEnd) return false;
    return (!customStart || key >= customStart) && (!customEnd || key <= customEnd);
  }
  if (filter === "ALL") return true;
  const days = filter === "30D" ? 30 : filter === "60D" ? 60 : 90;
  const todayKey = indiaTodayKey();
  const today = new Date(`${todayKey}T00:00:00`);
  today.setDate(today.getDate() - (days - 1));
  const cutoff = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return key >= cutoff && key <= todayKey;
}

const studyMaterialStyles = `
.sm-page{width:100%;min-width:0;color:#0F172A}
.sm-hero{position:relative;overflow:hidden;padding:26px 28px;background:linear-gradient(120deg,#FFFFFF 0%,#FFFFFF 58%,#FFF9F4 82%,#F4F7FF 100%);border:1px solid #E2E8F0;border-radius:24px;box-shadow:0 10px 30px rgba(15,23,42,.045)}
.sm-hero:after{content:"";position:absolute;right:-55px;top:-95px;width:190px;height:190px;border-radius:50%;background:rgba(249,115,22,.055);pointer-events:none}
.sm-eyebrow{color:#F97316;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
.sm-title{margin:8px 0 0;font-size:31px;line-height:1.15;font-weight:800;letter-spacing:-.6px}
.sm-copy{margin:8px 0 0;max-width:760px;color:#64748B;font-size:13px;line-height:1.55}
.sm-card{margin-top:14px;padding:18px;background:#FFF;border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 7px 24px rgba(15,23,42,.035)}
.sm-card-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap}.sm-card-title{margin:5px 0 0;font-size:21px;font-weight:800;letter-spacing:-.3px}.sm-card-copy{margin:5px 0 0;color:#64748B;font-size:12px;line-height:1.5}
.sm-filter-grid{display:grid;grid-template-columns:minmax(180px,1.5fr) minmax(150px,1fr);gap:8px;margin-top:12px}.sm-field{display:flex;flex-direction:column;gap:4px}.sm-field label{font-size:8px;font-weight:800;color:#64748B;letter-spacing:.8px;text-transform:uppercase}.sm-field select,.sm-field input{width:100%;box-sizing:border-box;border:1px solid #CBD5E1;border-radius:9px;padding:9px 10px;background:#FFF;color:#0F172A;font-size:11px;outline:none}.sm-field select:focus,.sm-field input:focus{border-color:#FDBA74;box-shadow:0 0 0 3px rgba(249,115,22,.08)}.sm-custom{display:grid;grid-template-columns:1fr 1fr;gap:5px}
.sm-current-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:12px}.sm-current-item{padding:12px;border:1px solid #E2E8F0;border-radius:14px;background:linear-gradient(135deg,#FFFFFF 0%,#FFF9F4 100%)}.sm-current-title{font-size:13px;font-weight:800}.sm-current-meta{margin-top:5px;color:#64748B;font-size:9px;line-height:1.45}.sm-current-actions{margin-top:10px;display:flex;gap:6px}.sm-btn{border:1px solid #CBD5E1;border-radius:9px;padding:7px 9px;background:#FFF;color:#334155;font-size:9px;font-weight:800;cursor:pointer}.sm-btn:hover{border-color:#FDBA74}.sm-primary{background:#F97316;border-color:#F97316;color:#FFF}.sm-secondary{background:#F8FAFC}
.sm-table-note{margin:12px 0 6px;color:#64748B;font-size:9px;font-weight:700}.sm-table-scroll{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid #E2E8F0;border-radius:14px}.sm-table{width:100%;min-width:560px;border-collapse:collapse;background:#FFF;font-size:10px}.sm-table th{padding:8px 9px;text-align:left;background:#F8FAFC;color:#64748B;font-size:8px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;border-bottom:1px solid #E2E8F0;white-space:nowrap}.sm-table td{padding:9px;border-bottom:1px solid #EEF2F7;color:#334155;vertical-align:middle}.sm-table tr:last-child td{border-bottom:0}.sm-empty{padding:18px;text-align:center;color:#94A3B8;font-size:10px}
.sm-modal{position:fixed;inset:0;z-index:300;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(15,23,42,.44)}.sm-modal-card{width:min(1040px,100%);max-height:94vh;overflow:hidden;background:#FFF;border:1px solid #E2E8F0;border-radius:18px;box-shadow:0 25px 70px rgba(15,23,42,.20)}.sm-modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 15px;border-bottom:1px solid #E2E8F0;background:rgba(255,255,255,.96);backdrop-filter:blur(8px)}.sm-actions{display:flex;gap:6px}.sm-modal-body{max-height:calc(94vh - 62px);overflow:auto;padding:12px;background:#F1F5F9}
.sm-screen-paper{box-shadow:0 8px 25px rgba(15,23,42,.10)}.sm-paper{width:794px;max-width:100%;margin:0 auto;background:#FFF;color:#111827;padding:42px;box-sizing:border-box}.sm-kicker{margin-bottom:7px;text-align:center;color:#9A3412;font-size:10px;font-weight:800;letter-spacing:1.2px}.sm-paper h1{margin:0 0 5px;text-align:center;font-size:24px}.sm-subject{text-align:center;font-size:11px;font-weight:800}.sm-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 16px;margin:18px 0;font-size:10px}.sm-instruction{margin-bottom:14px;padding:8px 10px;border-left:3px solid #F97316;background:#FFF7ED;font-size:9px;line-height:1.45}.sm-section{margin:0 0 12px;break-inside:auto}.sm-section-title{padding:7px 9px;background:#F8FAFC;border-top:2px solid #CBD5E1;border-bottom:1px solid #E2E8F0;font-size:10px;font-weight:800;letter-spacing:.2px;text-transform:uppercase}.sm-section-copy{margin:5px 0 7px;color:#64748B;font-size:9px;font-style:italic}.sm-question{margin:0 0 10px;font-size:11px;line-height:1.5;break-inside:avoid}.sm-options{margin:5px 0 0 18px;font-size:10px}.sm-options>div{margin:2px 0}.sm-fill{margin:4px 0 0 17px}.sm-blank{display:inline-block;min-width:60px;height:10px;margin:0 3px;border-bottom:1px solid #111827}.sm-match{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:6px 0 0 18px}.sm-match-row{display:grid;grid-template-columns:20px 1fr;gap:5px;margin:3px 0}.sm-tf-list{margin:5px 0 0 18px}.sm-tf-row{display:grid;grid-template-columns:18px minmax(0,1fr) 58px;gap:5px;margin:4px 0}.sm-tf-row span:last-child{white-space:nowrap}.sm-image{display:block;max-width:100%;max-height:360px;margin:7px auto;object-fit:contain}.sm-passage{white-space:pre-wrap;line-height:1.5;margin:6px 0 8px;padding:8px;border:1px solid #CBD5E1;background:#FAFAFA;border-radius:4px}.sm-passage-q{margin:4px 0 0 18px}
@media(max-width:1024px){.sm-hero{padding:18px;border-radius:19px}.sm-title{font-size:25px}.sm-copy{font-size:11px}.sm-card{padding:15px;border-radius:17px}.sm-card-title{font-size:18px}.sm-current-grid{grid-template-columns:1fr 1fr}.sm-paper{width:100%;padding:28px}.sm-filter-grid{grid-template-columns:1.4fr 1fr}}
@media(max-width:767px){.sm-hero{padding:14px;border-radius:16px}.sm-eyebrow{font-size:8px;letter-spacing:1.4px}.sm-title{font-size:21px}.sm-copy{font-size:10px;line-height:1.4}.sm-card{padding:11px;border-radius:14px;margin-top:10px}.sm-card-title{font-size:15px}.sm-card-copy{font-size:9px}.sm-filter-grid{grid-template-columns:minmax(0,1fr) minmax(0,.95fr);gap:6px}.sm-field label{font-size:7px}.sm-field select,.sm-field input{font-size:8px;padding:7px 8px;border-radius:8px}.sm-custom{gap:3px}.sm-current-grid{grid-template-columns:1fr;gap:7px}.sm-current-item{padding:9px;border-radius:11px}.sm-current-title{font-size:11px}.sm-current-meta{font-size:7.5px}.sm-btn{font-size:8px;padding:6px 7px}.sm-table-note{font-size:8px}.sm-table{min-width:520px;font-size:8px}.sm-table th{font-size:7px;padding:6px}.sm-table td{padding:7px}.sm-modal{padding:6px}.sm-modal-card{border-radius:12px}.sm-modal-head{padding:9px 10px}.sm-modal-body{padding:7px;max-height:calc(94vh - 50px)}.sm-paper{padding:18px}.sm-kicker{font-size:7px}.sm-paper h1{font-size:18px}.sm-subject{font-size:9px}.sm-meta{font-size:8px;gap:4px 8px;margin:12px 0}.sm-instruction{font-size:7px;padding:6px 8px}.sm-section-title{font-size:8px;padding:6px 7px}.sm-section-copy{font-size:7px}.sm-question{font-size:9px}.sm-options{font-size:8px}.sm-tf-row{grid-template-columns:15px minmax(0,1fr) 52px}.sm-tf-row span:last-child{font-size:7px}.sm-passage-q{margin-left:14px}.sm-image{max-height:240px}}
`;

export default function StudyMaterial() {
  const [records, setRecords] = useState<PublishedWorksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("ALL");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [preview, setPreview] = useState<PublishedWorksheet | null>(null);
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    try {
      // Independent reads: a temporary subject-source failure must never stop
      // published worksheets from rendering, and vice versa.
      const [publicationResult, subjectResult] = await Promise.allSettled([
        getStudentPublishedWorksheets(),
        getStudentSubjects(),
      ]);

      const rows = publicationResult.status === "fulfilled" ? publicationResult.value : [];
      const dailyLogSubjects = subjectResult.status === "fulfilled" ? subjectResult.value : [];

      setRecords(rows);
      const mergedSubjects = Array.from(new Set([
        ...(dailyLogSubjects ?? []),
        ...(rows ?? []).map(record => record.subjectName),
      ].map(value => String(value ?? "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
      setSubjectOptions(mergedSubjects);

      if (publicationResult.status === "rejected") {
        setError(publicationResult.reason?.message ?? "Unable to load published worksheets.");
      } else if (subjectResult.status === "rejected" && rows.length > 0) {
        // Keep the worksheet data visible while making the auxiliary subject
        // source failure explicit; published-record subjects are still usable.
        setError(subjectResult.reason?.message ?? "Unable to load all classroom subjects.");
      } else {
        setError("");
      }
    } catch (e: any) {
      setRecords([]);
      setSubjectOptions([]);
      setError(e?.message ?? "Unable to load study material.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const subjects = useMemo(() => subjectOptions, [subjectOptions]);

  const filtered = useMemo(() => records.filter(record => {
    if (subject && record.subjectName !== subject) return false;
    return dateWithinFilter(record.publishedAt, timeFilter, customStart, customEnd);
  }), [records, subject, timeFilter, customStart, customEnd]);

  // Current material is intentionally independent of the history time filter.
  // A 30/60/90-day history filter must never make the live worksheet disappear.
  const current = useMemo(() => {
    const byKey = new Map<string, PublishedWorksheet>();
    records.forEach(record => {
      const key = `${record.teacherUuid}::${record.className}::${record.sectionName}::${record.subjectName}`;
      const existing = byKey.get(key);
      if (!existing || new Date(record.publishedAt).getTime() > new Date(existing.publishedAt).getTime()) byKey.set(key, record);
    });
    return Array.from(byKey.values()).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, [records]);

  return <main className="sm-page"><style>{studyMaterialStyles}</style>
    <section className="sm-hero"><div className="sm-eyebrow">ACADEMIC GROWTH JOURNEY</div><h1 className="sm-title">Study Material</h1><p className="sm-copy">Access the latest worksheets shared by your teachers for your class and section, with older worksheets kept safely in your academic history.</p></section>

    <section className="sm-card"><div className="sm-card-head"><div><div className="sm-eyebrow">YOUR WORKSHEETS</div><h2 className="sm-card-title">Latest Study Material</h2><p className="sm-card-copy">The newest published worksheet from each teacher and subject appears here automatically.</p></div><div style={{color:"#94A3B8",fontSize:9,fontWeight:700}}>{loading ? "Updating…" : `${current.length} current worksheet${current.length === 1 ? "" : "s"}`}</div></div>
      {error && <div style={{marginTop:10,padding:"8px 10px",border:"1px solid #FECACA",borderRadius:9,background:"#FEF2F2",color:"#B91C1C",fontSize:8,fontWeight:800}}>{error}</div>}
      <div className="sm-current-grid">{current.length===0 ? <div className="sm-empty" style={{gridColumn:"1 / -1"}}>No worksheets are currently published for your class and section.</div> : current.map(record=><article className="sm-current-item" key={record.id}><div className="sm-current-title">{record.title || "Worksheet"}</div><div className="sm-current-meta"><strong>{record.subjectName}</strong> · {getChapter(record)}<br/>Class {record.className} · Section {record.sectionName}<br/>{record.teacherName} · Published {fmtDate(record.publishedAt)}</div><div className="sm-current-actions"><button className="sm-btn sm-primary" onClick={()=>setPreview(record)}>View</button><button className="sm-btn" onClick={()=>printWorksheet(record)}>Download PDF</button></div></article>)}</div>
    </section>

    <section className="sm-card"><div className="sm-card-head"><div><div className="sm-eyebrow">ACADEMIC HISTORY</div><h2 className="sm-card-title">All Published Worksheets</h2><p className="sm-card-copy">Newest to oldest. Use the filters below to find any worksheet in your history.</p></div><div style={{color:"#94A3B8",fontSize:9,fontWeight:700}}>{filtered.length} record{filtered.length===1?"":"s"}</div></div>
      <div className="sm-filter-grid"><div className="sm-field"><label>Subject</label><select value={subject} onChange={e=>setSubject(e.target.value)}><option value="">All subjects</option>{subjects.map(item=><option key={item} value={item}>{item}</option>)}</select></div><div className="sm-field"><label>Time</label>{timeFilter === "CUSTOM" ? <div className="sm-custom"><input aria-label="Start date" type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} /><input aria-label="End date" type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} /></div> : <select value={timeFilter} onChange={e=>{const next=e.target.value as TimeFilter;setTimeFilter(next);if(next!=="CUSTOM"){setCustomStart("");setCustomEnd("");}}}><option value="ALL">All time</option><option value="30D">Last 30 days</option><option value="60D">Last 60 days</option><option value="90D">Last 90 days</option><option value="CUSTOM">Custom dates</option></select>}</div></div>
      <div className="sm-table-note">Swipe left or right to see the full table.</div>
      <div className="sm-table-scroll"><table className="sm-table"><thead><tr><th>Published Date</th><th>Chapter</th><th>Teacher</th><th>View</th></tr></thead><tbody>{loading ? <tr><td colSpan={4} className="sm-empty">Loading worksheets…</td></tr> : filtered.length===0 ? <tr><td colSpan={4} className="sm-empty">No published worksheets found for these filters.</td></tr> : filtered.map(record=><tr key={record.id}><td>{fmtDate(record.publishedAt)}</td><td>{getChapter(record)}</td><td>{record.teacherName}</td><td><button className="sm-btn sm-secondary" onClick={()=>setPreview(record)}>View</button></td></tr>)}</tbody></table></div>
    </section>

    {preview && <WorksheetPreview record={preview} onClose={()=>setPreview(null)} />}
  </main>;
}
