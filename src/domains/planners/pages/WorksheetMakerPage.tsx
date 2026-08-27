import { useEffect, useState, type ReactNode } from "react";
import { getPlannerAssignments, getTeacherPlanners, savePlanner } from "../repository/PlannerRepository";
import type { PlannerRecord, PlannerType, QuestionItem, QuestionPaperPayload, TeacherAssignmentOption } from "../types/PlannerModels";
import { AssignmentFields, PlannerHistoryTable, PlannerPageFrame, QuestionEditor } from "../components/PlannerUI";

type WorksheetPayload = QuestionPaperPayload & {
  chapter?: string;
};

type WorksheetPlannerType = PlannerType | "worksheet";

const WORKSHEET_PLANNER_TYPE = "worksheet" as WorksheetPlannerType;

export const worksheetStyles = `
.worksheet-maker{color:#0F172A}
.worksheet-editor .question-marks-field{display:none!important}
.worksheet-editor .question-meta-row{grid-template-columns:minmax(150px,1fr) 36px}
.worksheet-editor .question-meta-row .question-type-field{grid-column:auto}
.worksheet-editor .question-meta-row .question-remove-field{grid-column:auto}
.worksheet-editor .question-meta-row .question-marks-field{grid-column:auto}
.worksheet-paper .worksheet-kicker{margin-bottom:7px;text-align:center;color:#9A3412;font-size:10px;font-weight:800;letter-spacing:1.2px}.worksheet-paper .worksheet-section-heading{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:18px 0 9px;padding:7px 10px;background:#F8FAFC;border-top:2px solid #CBD5E1;border-bottom:1px solid #E2E8F0;font-size:11px;font-weight:800;letter-spacing:.2px;text-transform:uppercase}.worksheet-paper .worksheet-section-description{margin:5px 0 7px;color:#64748B;font-size:9px;font-style:italic;line-height:1.4}
.worksheet-paper .worksheet-title{margin:0 0 5px;text-align:center;font-size:24px;font-weight:800}
.worksheet-paper .worksheet-subject{text-align:center;font-size:11px;font-weight:800}
.worksheet-paper .worksheet-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 16px;margin:18px 0 18px;font-size:11px}
.worksheet-paper .worksheet-instruction{margin-bottom:14px;padding:8px 10px;border-left:3px solid #F97316;background:#FFF7ED;font-size:9px;line-height:1.45}
.worksheet-paper .worksheet-chapter-heading{margin:16px 0 9px;padding:7px 10px;border-top:1px solid #CBD5E1;border-bottom:1px solid #E2E8F0;background:#F8FAFC;font-size:11px;font-weight:800;letter-spacing:.5px;text-transform:uppercase}
.worksheet-paper .worksheet-question{margin:0 0 12px;font-size:12px;line-height:1.5;break-inside:avoid}
.worksheet-paper .worksheet-options{margin:5px 0 0 19px;font-size:11px}
.worksheet-paper .worksheet-options>div{margin:2px 0}
.worksheet-paper .worksheet-fill-statement{margin:4px 0 0 18px}
.worksheet-paper .worksheet-blank{display:inline-block;min-width:62px;height:10px;margin:0 3px;border-bottom:1px solid #111827}
.worksheet-paper .worksheet-match{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin:7px 0 0 18px}
.worksheet-paper .worksheet-match-row{display:grid;grid-template-columns:20px minmax(0,1fr);gap:5px;margin:3px 0}
.worksheet-paper .worksheet-tf-list{margin:5px 0 0 18px}
.worksheet-paper .worksheet-tf-row{display:grid;grid-template-columns:18px minmax(0,1fr) 60px;gap:5px;margin:4px 0}
.worksheet-paper .worksheet-tf-answer{white-space:nowrap}
.worksheet-paper .worksheet-image{display:block;max-width:120mm;max-height:70mm;margin:7px auto;border-radius:4px;object-fit:contain}
.worksheet-paper .worksheet-passage{white-space:pre-wrap;line-height:1.5;margin:6px 0 8px;padding:8px;border:1px solid #CBD5E1;background:#FAFAFA;border-radius:4px}
.worksheet-paper .worksheet-passage-q{margin:4px 0 0 18px}
.worksheet-preview-wrap{display:flex;justify-content:center;align-items:flex-start;padding:14px;background:#F1F5F9;border:1px solid #E2E8F0;border-radius:14px;overflow-x:hidden;overflow-y:auto;box-sizing:border-box}
.worksheet-preview-paper{width:100%!important;max-width:794px!important;min-width:0!important;min-height:1123px;flex:0 1 auto;box-sizing:border-box;overflow-wrap:anywhere;word-break:break-word}
.worksheet-preview-paper *{max-width:100%;box-sizing:border-box}
.worksheet-preview-paper .worksheet-meta{min-width:0}
.worksheet-preview-paper .worksheet-section-heading,.worksheet-preview-paper .worksheet-section-description,.worksheet-preview-paper .worksheet-question{overflow-wrap:anywhere;word-break:break-word}
@media(max-width:1024px){.worksheet-editor .question-meta-row{grid-template-columns:minmax(135px,1fr) 34px}.worksheet-preview-wrap{padding:10px}.worksheet-preview-paper{width:100%!important;max-width:100%!important;min-height:0;padding:38px!important}.worksheet-paper .worksheet-meta{font-size:10px}.worksheet-paper .worksheet-section-heading{font-size:10px}}
@media(max-width:600px){.worksheet-editor .question-meta-row{grid-template-columns:minmax(0,1fr) 30px;gap:6px}.worksheet-editor .question-meta-field label,.worksheet-editor .question-prompt-field label{font-size:7px}.worksheet-editor .question-meta-field select,.worksheet-editor .question-meta-field input{font-size:9px;padding:6px 7px;height:30px}.worksheet-editor .question-remove{width:30px;height:30px;border-radius:8px;font-size:10px}.worksheet-preview-wrap{padding:7px;overflow-x:hidden;overflow-y:auto}.worksheet-preview-paper{width:100%!important;max-width:100%!important;min-width:0!important;min-height:0;padding:18px!important}.worksheet-paper .worksheet-kicker{font-size:8px}.worksheet-paper .worksheet-title{font-size:18px;line-height:1.15}.worksheet-paper .worksheet-subject{font-size:9px}.worksheet-paper .worksheet-meta{font-size:8px;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 8px}.worksheet-paper .worksheet-meta span{min-width:0;overflow-wrap:anywhere}.worksheet-paper .worksheet-instruction{font-size:7px}.worksheet-paper .worksheet-chapter-heading{font-size:9px}.worksheet-paper .worksheet-section-heading{font-size:8px;padding:6px 7px;margin:13px 0 7px}.worksheet-paper .worksheet-section-description{font-size:7px}.worksheet-paper .worksheet-question{font-size:9px}.worksheet-paper .worksheet-options{font-size:8px}.worksheet-paper .worksheet-tf-row{grid-template-columns:15px minmax(0,1fr) 52px}.worksheet-paper .worksheet-tf-answer{font-size:8px}.worksheet-paper .worksheet-match{grid-template-columns:1fr 1fr;gap:7px;margin-left:14px}.worksheet-paper .worksheet-image{max-width:100%;height:auto}.worksheet-paper .worksheet-passage{font-size:8.5px;overflow-wrap:anywhere}}
@media print{body{margin:0!important;background:#FFF!important}.worksheet-print-window{display:block!important}.worksheet-print-window .worksheet-print-page{width:210mm;min-height:297mm;margin:0 auto;padding:12mm;box-sizing:border-box;background:#FFF;color:#111827;font-family:Arial,sans-serif}.worksheet-print-window .worksheet-question{break-inside:avoid}.worksheet-print-window .worksheet-chapter-heading{break-after:avoid}.worksheet-print-window .worksheet-image{max-width:120mm;max-height:150mm}}
`;

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char] as string));
}

function getWorksheetPayload(record: PlannerRecord): WorksheetPayload {
  return record.payload as WorksheetPayload;
}

function getChapter(record: PlannerRecord, payload: WorksheetPayload, questions: QuestionItem[]) {
  if (payload.chapter?.trim()) return payload.chapter.trim();
  const legacyChapter = (questions[0] as QuestionItem & { chapter?: string } | undefined)?.chapter;
  return legacyChapter?.trim() || "Chapter 1";
}

const WORKSHEET_SECTION_DEFS: { key: string; title: string; description: string; types: QuestionItem["type"][] }[] = [
  { key: "objective-mcq", title: "Section A — Multiple Choice Questions", description: "Choose the correct option.", types: ["MCQ"] },
  { key: "objective-fill", title: "Section B — Fill in the Blanks", description: "Complete each sentence with the correct word or phrase.", types: ["FILL_BLANK"] },
  { key: "objective-match", title: "Section C — Match the Following", description: "Match the items in Column A with the correct items in Column B.", types: ["MATCH_COLUMNS"] },
  { key: "objective-tf", title: "Section D — True / False", description: "Write True or False for each statement.", types: ["TRUE_FALSE"] },
  { key: "short", title: "Section E — Short Answer Type Questions", description: "Answer briefly and clearly.", types: ["SHORT_ANSWER"] },
  { key: "long", title: "Section F — Long Answer Type Questions", description: "Answer in detail with appropriate explanation.", types: ["LONG_ANSWER"] },
  { key: "image", title: "Section G — Picture / Image Based Questions", description: "Observe the image and answer the question.", types: ["IMAGE_BASED"] },
  { key: "passage", title: "Section H — Unseen Passage / Comprehension", description: "Read the passage carefully and answer the questions that follow.", types: ["UNSEEN_PASSAGE"] },
];

function getWorksheetSections(questions: QuestionItem[]) {
  return WORKSHEET_SECTION_DEFS
    .map(def => ({ ...def, questions: questions.filter(q => def.types.includes(q.type)) }))
    .filter(section => section.questions.length > 0);
}

function normalizeWorksheetQuestions(questions: QuestionItem[]) {
  return questions.map(q => ({
    ...q,
    marks: 0,
    passageQuestions: q.passageQuestions?.map(pq => ({ ...pq, marks: 0 }))
  }));
}

function renderFillSentenceHtml(sentence: string, answers: string[]) {
  let rendered = escapeHtml(sentence || "");
  answers.filter(Boolean).forEach(answer => {
    const escaped = escapeHtml(answer);
    if (escaped) rendered = rendered.replace(escaped, `<span class="worksheet-blank"></span>`);
  });
  return rendered;
}

function renderWorksheetQuestionHtml(q: QuestionItem, number: number) {
  const prefix = `<strong>${number}. </strong>`;
  if (q.type === "MCQ") {
    return `<div class="worksheet-question">${prefix}${escapeHtml(q.question)}<div class="worksheet-options">${(q.options ?? []).map((o, i) => `<div>${String.fromCharCode(65+i)}. ${escapeHtml(o)}</div>`).join("")}</div></div>`;
  }
  if (q.type === "FILL_BLANK") {
    const rawItems = (q as any).fillItems;
    const items = Array.isArray(rawItems) && rawItems.length
      ? rawItems
      : [{ sentence: q.fillSentence ?? q.question ?? "", blank: q.blanks?.[0] ?? "" }];
    const body = items.map((item: any, i: number) => `<div class="worksheet-fill-statement"><strong>${String.fromCharCode(97+i)}. </strong>${renderFillSentenceHtml(String(item?.sentence ?? ""), [String(item?.blank ?? "")])}</div>`).join("");
    return `<div class="worksheet-question">${prefix}${body}</div>`;
  }
  if (q.type === "MATCH_COLUMNS") {
    const a = q.columnA ?? [];
    const b = q.columnB ?? [];
    const count = Math.max(a.length, b.length);
    return `<div class="worksheet-question">${prefix}${escapeHtml(q.question || "Match the following")}${`<div class="worksheet-match"><div>${Array.from({length:count},(_,i)=>`<div class="worksheet-match-row"><span>${i+1}.</span><span>${escapeHtml(a[i]?.text || "")}</span></div>`).join("")}</div><div>${Array.from({length:count},(_,i)=>`<div class="worksheet-match-row"><span>${String.fromCharCode(97+i)}.</span><span>${escapeHtml(b[i]?.text || "")}</span></div>`).join("")}</div></div>`}</div>`;
  }
  if (q.type === "TRUE_FALSE") {
    const statements = q.statements ?? [];
    const rows = statements.length
      ? statements.map((statement, i) => `<div class="worksheet-tf-row"><span>${i+1}.</span><span>${escapeHtml(statement)}</span><span class="worksheet-tf-answer">True / False</span></div>`).join("")
      : `<div class="worksheet-tf-row"><span>1.</span><span>Write True or False.</span><span class="worksheet-tf-answer">True / False</span></div>`;
    return `<div class="worksheet-question">${prefix}${escapeHtml(q.question || "True / False")}<div class="worksheet-tf-list">${rows}</div></div>`;
  }
  if (q.type === "IMAGE_BASED") {
    const image = q.imageDataUrl ? `<img class="worksheet-image" src="${q.imageDataUrl}" alt="Worksheet question image">` : "";
    return `<div class="worksheet-question">${prefix}${image}<div>${escapeHtml(q.imageInstruction || q.question || "Describe the image and explain what you see.")}</div></div>`;
  }
  if (q.type === "UNSEEN_PASSAGE") {
    const childQuestions = (q.passageQuestions ?? []).map((pq, i) => `<div class="worksheet-passage-q"><strong>${String.fromCharCode(97+i)}. </strong>${escapeHtml(pq.question)}</div>`).join("");
    return `<div class="worksheet-question">${prefix}Read the following passage and answer the questions.<div class="worksheet-passage">${escapeHtml(q.passage || "")}</div>${childQuestions}</div>`;
  }
  return `<div class="worksheet-question">${prefix}${escapeHtml(q.question || "Untitled question")}</div>`;
}

export function printWorksheetRecord(record: PlannerRecord) {
  const payload = getWorksheetPayload(record);
  const questions = normalizeWorksheetQuestions(payload.questions ?? []);
  const chapter = getChapter(record, payload, questions);
  const printWindow = window.open("", "_blank", "width=1000,height=800");
  if (!printWindow) {
    window.alert("Please allow pop-ups for Talent Passport to print or save this worksheet as PDF.");
    return;
  }

  const sections = getWorksheetSections(questions);
  let globalNumber = 1;
  const sectionsHtml = sections.map(section => {
    const body = section.questions.map(q => renderWorksheetQuestionHtml(q, globalNumber++)).join("");
    return `<section class="worksheet-section"><div class="worksheet-section-heading">${escapeHtml(section.title)}</div><div class="worksheet-section-description">${escapeHtml(section.description)}</div>${body}</section>`;
  }).join("");
  const body = `<div class="worksheet-print-page"><header><div class="worksheet-kicker">${escapeHtml(payload.schoolName || "School")} · WORKSHEET</div><h1 class="worksheet-title">${escapeHtml(record.title || "Worksheet")}</h1><div class="worksheet-subject">${escapeHtml(record.subjectName)}</div></header><div class="worksheet-meta"><span><strong>School:</strong> ${escapeHtml(payload.schoolName)}</span><span><strong>Worksheet Date:</strong> ${escapeHtml(fmtDate(record.startDate))}</span><span><strong>Class:</strong> ${escapeHtml(record.className)} · Section ${escapeHtml(record.sectionName)}</span><span><strong>Day:</strong> ${escapeHtml(record.startDate ? new Date(record.startDate).toLocaleDateString("en-IN", { weekday:"long" }) : "")}</span></div><div class="worksheet-instruction"><strong>Practice Worksheet:</strong> Complete all activities carefully.</div><div class="worksheet-chapter-heading">${escapeHtml(chapter)}</div>${sectionsHtml}</div>`;

  const css = `@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff;color:#111827}body{font-family:Arial,sans-serif}.worksheet-print-page{width:210mm;min-height:297mm;margin:0 auto;padding:12mm;box-sizing:border-box}.worksheet-kicker{margin-bottom:7px;text-align:center;color:#9A3412;font-size:10pt;font-weight:800;letter-spacing:1.2pt}.worksheet-title{margin:0 0 5pt;text-align:center;font-size:24pt;font-weight:800}.worksheet-subject{text-align:center;font-size:11pt;font-weight:800}.worksheet-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4pt 16pt;margin:18pt 0;font-size:9pt}.worksheet-instruction{margin-bottom:14pt;padding:6pt 8pt;border-left:3pt solid #F97316;background:#FFF7ED;font-size:8pt;line-height:1.45}.worksheet-chapter-heading{margin:16pt 0 9pt;padding:6pt 8pt;border-top:1pt solid #CBD5E1;border-bottom:1pt solid #E2E8F0;background:#F8FAFC;font-size:9.5pt;font-weight:800;letter-spacing:.5pt;text-transform:uppercase;break-after:avoid}.worksheet-section{margin:0 0 10pt;break-inside:auto}.worksheet-section-heading{padding:6pt 8pt;background:#F8FAFC;border-top:1.5pt solid #CBD5E1;border-bottom:.7pt solid #E2E8F0;font-size:9pt;font-weight:800;text-transform:uppercase;break-after:avoid}.worksheet-section-description{margin:5pt 0 7pt;color:#64748B;font-size:8pt;font-style:italic}.worksheet-question{margin:0 0 9pt;font-size:9.5pt;line-height:1.48;break-inside:avoid}.worksheet-options{margin:4pt 0 0 17pt}.worksheet-options>div{margin:2pt 0}.worksheet-fill-statement{margin:4pt 0 0 18pt}.worksheet-blank{display:inline-block;min-width:58pt;height:10pt;margin:0 2pt;border-bottom:1pt solid #111827}.worksheet-match{display:grid;grid-template-columns:1fr 1fr;gap:24pt;margin:6pt 0 0 18pt}.worksheet-match-row{display:grid;grid-template-columns:20pt 1fr;gap:5pt;margin:3pt 0}.worksheet-tf-list{margin:5pt 0 0 18pt}.worksheet-tf-row{display:grid;grid-template-columns:18pt 1fr 55pt;gap:5pt;margin:4pt 0}.worksheet-tf-answer{white-space:nowrap}.worksheet-image{display:block;max-width:120mm;max-height:70mm;margin:7pt auto;object-fit:contain}.worksheet-passage{white-space:pre-wrap;line-height:1.5;margin:6pt 0 8pt;padding:8pt;border:1pt solid #CBD5E1;background:#FAFAFA;border-radius:4pt}.worksheet-passage-q{margin:4pt 0 0 18pt}`;

  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(record.title || "Worksheet")}</title><style>${css}</style></head><body>${body}<script>(function(){function ready(){var imgs=[].slice.call(document.images);if(!imgs.length){setTimeout(function(){window.focus();window.print()},180);return;}var left=imgs.length;function done(){left-=1;if(left<=0)setTimeout(function(){window.focus();window.print()},180)}imgs.forEach(function(img){if(img.complete)done();else{img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});}});setTimeout(function(){window.focus();window.print()},2500)}if(document.readyState==='complete')ready();else window.addEventListener('load',ready);window.onafterprint=function(){setTimeout(function(){window.close()},150)};})();<\/script></body></html>`);
  printWindow.document.close();
}

function WorksheetPaper({ record, questions }: { record: PlannerRecord; questions: QuestionItem[] }) {
  const payload = getWorksheetPayload(record);
  const chapter = getChapter(record, payload, questions);
  return <article className="paper-a4 worksheet-paper worksheet-preview-paper">
    <div className="worksheet-kicker">{payload.schoolName || "School"} · WORKSHEET</div>
    <h1 className="worksheet-title">{record.title || "Worksheet"}</h1>
    <div className="worksheet-subject">{record.subjectName}</div>
    <div className="worksheet-meta">
      <span><strong>School:</strong> {payload.schoolName}</span>
      <span><strong>Worksheet Date:</strong> {fmtDate(record.startDate)}</span>
      <span><strong>Class:</strong> {record.className} · Section {record.sectionName}</span>
      <span><strong>Day:</strong> {record.startDate ? new Date(record.startDate).toLocaleDateString("en-IN", { weekday:"long" }) : ""}</span>
    </div>
    <div className="worksheet-instruction"><strong>Practice Worksheet:</strong> Complete all activities carefully.</div>
    <div className="worksheet-chapter-heading">{chapter}</div>
    {(() => {
      const sections = getWorksheetSections(questions);
      let globalNumber = 1;
      return sections.map(section => <section className="worksheet-section" key={section.key}>
        <div className="worksheet-section-heading">{section.title}</div>
        <div className="worksheet-section-description">{section.description}</div>
        {section.questions.map(q => <WorksheetQuestionPreview key={q.id} q={q} index={globalNumber++} />)}
      </section>);
    })()}
  </article>;
}

function WorksheetQuestionPreview({ q, index }: { q: QuestionItem; index: number }) {
  const prefix = <strong>{index}. </strong>;
  if (q.type === "MCQ") return <div className="worksheet-question">{prefix}{q.question}<div className="worksheet-options">{(q.options ?? []).map((o, i) => <div key={i}>{String.fromCharCode(65+i)}. {o}</div>)}</div></div>;
  if (q.type === "FILL_BLANK") {
    const rawItems = (q as any).fillItems;
    const items = Array.isArray(rawItems) && rawItems.length ? rawItems : [{ id:"legacy", sentence:q.fillSentence ?? q.question ?? "", blank:q.blanks?.[0] ?? "" }];
    return <div className="worksheet-question">{prefix}{items.map((item:any, i:number) => <div className="worksheet-fill-statement" key={String(item.id || i)}><strong>{String.fromCharCode(97+i)}. </strong>{renderFillSentenceReact(String(item.sentence ?? ""), [String(item.blank ?? "")])}</div>)}</div>;
  }
  if (q.type === "MATCH_COLUMNS") {
    const a=q.columnA??[], b=q.columnB??[], count=Math.max(a.length,b.length);
    return <div className="worksheet-question">{prefix}{q.question || "Match the following"}<div className="worksheet-match"><div>{Array.from({length:count},(_,i)=><div className="worksheet-match-row" key={`a-${i}`}><span>{i+1}.</span><span>{a[i]?.text || "—"}</span></div>)}</div><div>{Array.from({length:count},(_,i)=><div className="worksheet-match-row" key={`b-${i}`}><span>{String.fromCharCode(97+i)}.</span><span>{b[i]?.text || "—"}</span></div>)}</div></div></div>;
  }
  if (q.type === "TRUE_FALSE") return <div className="worksheet-question">{prefix}{q.question || "True / False"}<div className="worksheet-tf-list">{(q.statements ?? []).length ? (q.statements ?? []).map((statement, i) => <div className="worksheet-tf-row" key={`${q.id}-${i}`}><span>{i+1}.</span><span>{statement}</span><span className="worksheet-tf-answer">True / False</span></div>) : <div className="worksheet-tf-row"><span>1.</span><span>Write True or False.</span><span className="worksheet-tf-answer">True / False</span></div>}</div></div>;
  if (q.type === "IMAGE_BASED") return <div className="worksheet-question">{prefix}{q.imageDataUrl && <img className="worksheet-image" src={q.imageDataUrl} alt={q.imageName || "Question"}/>}<div>{q.imageInstruction || q.question || "Describe the image and explain what you see."}</div></div>;
  if (q.type === "UNSEEN_PASSAGE") return <div className="worksheet-question">{prefix}Read the following passage and answer the questions.<div className="worksheet-passage">{q.passage || ""}</div>{(q.passageQuestions ?? []).map((pq, i) => <div className="worksheet-passage-q" key={pq.id}><strong>{String.fromCharCode(97+i)}. </strong>{pq.question}</div>)}</div>;
  return <div className="worksheet-question">{prefix}{q.question || "Untitled question"}</div>;
}

function renderFillSentenceReact(sentence: string, answers: string[]): ReactNode {
  let remaining = sentence;
  const parts: ReactNode[] = [];
  answers.filter(Boolean).forEach((answer, index) => {
    const at = remaining.indexOf(answer);
    if (at < 0) return;
    const before = remaining.slice(0, at);
    if (before) parts.push(<span key={`before-${index}`}>{before}</span>);
    parts.push(<span key={`blank-${index}`} className="worksheet-blank" />);
    remaining = remaining.slice(at + answer.length);
  });
  if (remaining) parts.push(<span key="tail">{remaining}</span>);
  return parts;
}

export function WorksheetPreview({ record, onClose, editable=false, onSaveEdit }: { record: PlannerRecord; onClose:()=>void; editable?:boolean; onSaveEdit?:(payload:WorksheetPayload)=>void }) {
  const payload = getWorksheetPayload(record);
  const [questions, setQuestions] = useState<QuestionItem[]>(normalizeWorksheetQuestions(payload.questions ?? []));
  const currentPayload: WorksheetPayload = { ...payload, totalMarks:0, timeAllowed:"", chapter:getChapter(record, payload, questions), questions:normalizeWorksheetQuestions(questions) };

  return <div className="planner-modal"><div className="planner-modal-card"><div className="planner-modal-head"><div><div className="planner-eyebrow">WORKSHEET PREVIEW</div><strong>{record.title || "Worksheet"} · A4</strong></div><div className="planner-actions"><button className="planner-btn" onClick={onClose}>Close</button><button className="planner-btn" onClick={()=>printWorksheetRecord({...record,payload:currentPayload})}>Download / Save PDF</button>{editable&&onSaveEdit&&<button className="planner-btn primary" onClick={()=>onSaveEdit(currentPayload)}>Save edits</button>}</div></div><div className="planner-modal-body"><div className="worksheet-preview-wrap"><WorksheetPaper record={{...record,payload:currentPayload}} questions={questions}/></div>{editable&&<div className="worksheet-editor" style={{marginTop:12}}><QuestionEditor questions={questions} onChange={setQuestions}/></div>}</div></div></div>;
}

export default function WorksheetMakerPage() {
  const [assignments,setAssignments]=useState<TeacherAssignmentOption[]>([]);
  const [records,setRecords]=useState<PlannerRecord[]>([]);
  const [preview,setPreview]=useState<PlannerRecord|null>(null);
  const [editing,setEditing]=useState<PlannerRecord|null>(null);
  const [schoolName,setSchoolName]=useState("");
  const [title,setTitle]=useState("Worksheet");
  const [chapter,setChapter]=useState("");
  const [className,setClassName]=useState("");
  const [sectionName,setSectionName]=useState("");
  const [subjectName,setSubjectName]=useState("");
  const [date,setDate]=useState("");
  const [questions,setQuestions]=useState<QuestionItem[]>([]);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");

  async function load(){try{const [a,r]=await Promise.all([getPlannerAssignments(),getTeacherPlanners(WORKSHEET_PLANNER_TYPE as PlannerType)]);setAssignments(a);setRecords(r);}catch(e:any){setError(e?.message??"Unable to load worksheet planners.")}}
  useEffect(()=>{void load()},[]);
  function choose(a:TeacherAssignmentOption){setClassName(a.className);setSectionName(a.sectionName);setSubjectName(a.subjectName)}
  function valid(){if(!schoolName||!chapter.trim()||!className||!sectionName||!subjectName||!date||questions.length===0){setError("Complete school, chapter, assigned classroom, subject, date and at least one question.");return false}setError("");return true}
  function makePayload():WorksheetPayload{return{schoolName,totalMarks:0,timeAllowed:"",chapter:chapter.trim(),questions:normalizeWorksheetQuestions(questions)}}
  function makeRecord():PlannerRecord{return{id:"preview",schoolUuid:"",teacherUuid:"",teacherName:"",plannerType:WORKSHEET_PLANNER_TYPE as PlannerType,title:title.trim()||"Worksheet",templateKey:"a4-paper",className,sectionName,subjectName,startDate:date,endDate:date,payload:makePayload(),status:"DRAFT",reviewNote:"",submittedAt:null,reviewedAt:null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}
  async function submit(){if(!valid())return;setSaving(true);try{await savePlanner({plannerType:WORKSHEET_PLANNER_TYPE as PlannerType,title:title.trim()||"Worksheet",templateKey:"a4-paper",className,sectionName,subjectName,startDate:date,endDate:date,payload:makePayload(),submit:true});setQuestions([]);setChapter("");await load()}catch(e:any){setError(e?.message??"Unable to submit worksheet.")}finally{setSaving(false)}}
  async function saveEdited(payload:WorksheetPayload){if(!editing)return;setSaving(true);try{await savePlanner({id:editing.id,plannerType:WORKSHEET_PLANNER_TYPE as PlannerType,title:editing.title,templateKey:editing.templateKey,className:editing.className,sectionName:editing.sectionName,subjectName:editing.subjectName,startDate:editing.startDate,endDate:editing.endDate,payload:{...payload,totalMarks:0,timeAllowed:"",chapter:payload.chapter?.trim()||"Chapter 1",questions:normalizeWorksheetQuestions(payload.questions??[])},submit:true});setEditing(null);await load()}catch(e:any){setError(e?.message??"Unable to save worksheet edits.")}finally{setSaving(false)}}
  function newPreview(){if(valid())setPreview(makeRecord())}
  function download(r:PlannerRecord){printWorksheetRecord(r)}

  return <main className="worksheet-maker"><style>{worksheetStyles}</style><PlannerPageFrame title="Worksheet Maker" eyebrow="WORKSHEET PLANNING WORKSPACE" copy="Create a clean practice worksheet using the same question-building experience already used by the Question Paper planner, with worksheet-specific chapter and preview formatting.">
    {error&&<div className="planner-section" style={{background:"#FEF2F2",borderColor:"#FECACA",color:"#B91C1C",fontSize:10,fontWeight:800}}>{error}</div>}
    <section className="planner-section"><div className="planner-section-head"><div><div className="planner-eyebrow">01 · Worksheet setup</div><h2 className="planner-section-title">Save the worksheet details</h2><p className="planner-section-copy">Enter one chapter for this worksheet, then choose the assigned classroom.</p></div></div><div className="planner-grid"><div className="planner-field"><label>School name</label><input value={schoolName} onChange={(e:any)=>setSchoolName(e.target.value)} placeholder="School name"/></div><div className="planner-field"><label>Worksheet title</label><input value={title} onChange={(e:any)=>setTitle(e.target.value)} placeholder="Worksheet"/></div><div className="planner-field"><label>Chapter name</label><input value={chapter} onChange={(e:any)=>setChapter(e.target.value)} placeholder="Chapter 1 · Jingle Bell"/></div><div className="planner-field"><label>Date</label><input type="date" value={date} onChange={(e:any)=>setDate(e.target.value)}/></div></div><AssignmentFields assignments={assignments} className={className} sectionName={sectionName} subjectName={subjectName} onSelect={choose}/><div className="planner-grid"><div className="planner-field"><label>Day</label><input value={date?new Date(date).toLocaleDateString("en-IN",{weekday:"long"}):""} readOnly placeholder="Auto from date"/></div></div></section>
    <section className="planner-section"><div className="planner-section-head"><div><div className="planner-eyebrow">02 · Questions</div><h2 className="planner-section-title">Build the worksheet</h2><p className="planner-section-copy">Question type, question text and all existing question-specific options use the same editor as the Question Paper planner. Marks are not used for worksheets.</p></div></div><div className="worksheet-editor"><QuestionEditor questions={questions} onChange={setQuestions}/></div><div className="planner-actions" style={{marginTop:12}}><button className="planner-btn" onClick={newPreview}>Preview A4</button><button className="planner-btn primary" disabled={saving} onClick={submit}>{saving?"Submitting…":"Save & Submit"}</button></div></section>
    <section className="planner-section"><div className="planner-section-head"><div><div className="planner-eyebrow">03 · History</div><h2 className="planner-section-title">Published worksheet history</h2><p className="planner-section-copy">View, edit and download worksheets using the same worksheet-only layout.</p></div></div><PlannerHistoryTable records={records} onView={setPreview} onEdit={setEditing} onDownload={download}/></section>
    {preview&&<WorksheetPreview record={preview} onClose={()=>setPreview(null)}/>} {editing&&<WorksheetPreview record={editing} editable onClose={()=>setEditing(null)} onSaveEdit={saveEdited}/>} 
  </PlannerPageFrame></main>;
}
