import { useMemo, useRef, useState, type ReactNode } from "react";
import type { LessonBlock, LessonPlannerPayload, PlannerRecord, QuestionItem, QuestionPaperPayload, QuestionType, TeacherAssignmentOption, PassageQuestion } from "../types/PlannerModels";

export const plannerStyles = `
.planner-page{min-height:100%;background:#F5F6FA;padding:20px;box-sizing:border-box;color:#0F172A;overflow-x:hidden}
.planner-shell{max-width:1500px;margin:0 auto}
.planner-hero{position:relative;overflow:hidden;margin-bottom:18px;padding:26px 28px;background:linear-gradient(135deg,#FFFFFF 0%,#FFFFFF 72%,#FFF9F3 100%);border:1px solid #E2E8F0;border-radius:24px;box-shadow:0 10px 30px rgba(15,23,42,.045)}
.planner-hero:after{content:"";position:absolute;width:190px;height:190px;right:-65px;top:-90px;border-radius:50%;background:rgba(249,115,22,.06);pointer-events:none}
.planner-eyebrow{color:#F97316;font-size:12px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase}
.planner-title{margin:8px 0;color:#0F172A;font-size:31px;line-height:1.15;font-weight:800;letter-spacing:-.7px}
.planner-copy{margin:0;max-width:760px;color:#64748B;font-size:13px;line-height:1.65}
.planner-section{margin-bottom:18px;padding:20px;background:#FFF;border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 7px 24px rgba(15,23,42,.035)}
.planner-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap}.planner-section-title{margin:6px 0 0;font-size:21px;font-weight:800;letter-spacing:-.3px}.planner-section-copy{margin:5px 0 0;color:#64748B;font-size:14px;line-height:1.55}
.planner-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}.planner-field{display:flex;flex-direction:column;gap:6px;min-width:0}.planner-field label{font-size:10px;font-weight:800;color:#64748B;letter-spacing:.8px;text-transform:uppercase}.planner-field input,.planner-field select,.planner-field textarea{width:100%;box-sizing:border-box;border:1px solid #CBD5E1;border-radius:10px;padding:10px 11px;background:#FFF;color:#0F172A;font:inherit;font-size:12px;outline:none}.planner-field textarea{min-height:76px;resize:vertical}.planner-field input:focus,.planner-field select:focus,.planner-field textarea:focus{border-color:#FDBA74;box-shadow:0 0 0 3px rgba(249,115,22,.08)}
.planner-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.planner-btn{border:1px solid #E2E8F0;border-radius:10px;padding:9px 12px;background:#FFF;color:#334155;font-size:11px;font-weight:800;cursor:pointer}.planner-btn.primary{background:#F97316;border-color:#F97316;color:#FFF}.planner-btn.success{background:#ECFDF5;border-color:#BBF7D0;color:#15803D}.planner-btn.danger{background:#FEF2F2;border-color:#FECACA;color:#B91C1C}.planner-btn:disabled{opacity:.5;cursor:not-allowed}
.template-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}.template-card{position:relative;min-height:128px;padding:13px;border:1px solid #E2E8F0;border-radius:15px;background:#FFF;cursor:pointer;transition:.18s;overflow:hidden}.template-card:hover{border-color:#FDBA74;transform:translateY(-1px)}.template-card.selected{border-color:#F97316;box-shadow:0 0 0 3px rgba(249,115,22,.08)}.template-preview{height:72px;border-radius:10px;border:1px solid #E2E8F0;padding:8px;box-sizing:border-box;overflow:hidden}.template-name{margin-top:9px;font-size:12px;font-weight:800}.template-meta{margin-top:3px;font-size:9px;color:#94A3B8}
.block-picker{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px;margin-top:12px}.block-add{padding:9px 5px;border:1px dashed #CBD5E1;border-radius:10px;background:#F8FAFC;color:#475569;font-size:9px;font-weight:800;cursor:pointer}.block-add:hover{border-color:#FDBA74;background:#FFF7ED;color:#C2410C}.block-list{display:flex;flex-direction:column;gap:8px;margin-top:12px}.block-row{display:grid;grid-template-columns:24px 110px minmax(0,1fr) 30px;gap:8px;align-items:start;padding:9px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:11px}.block-index{width:24px;height:24px;display:grid;place-items:center;border-radius:7px;background:#FFF7ED;color:#C2410C;font-size:9px;font-weight:800}.block-type{font-size:9px;font-weight:800;color:#64748B;letter-spacing:.7px;text-transform:uppercase;padding-top:5px}.block-remove{width:28px;height:28px;border:0;border-radius:8px;background:#FFF;color:#94A3B8;cursor:pointer}.block-row input{width:100%;box-sizing:border-box;border:1px solid #CBD5E1;border-radius:8px;padding:7px 8px;font-size:11px}.block-row img{max-width:180px;max-height:110px;border-radius:8px;border:1px solid #E2E8F0}
.question-list{display:flex;flex-direction:column;gap:10px;margin-top:14px}.question-card{padding:12px;border:1px solid #E2E8F0;border-radius:13px;background:#FFF;min-width:0;overflow:hidden}.question-meta-row{display:grid;grid-template-columns:minmax(150px,1fr) 96px 36px;gap:8px;align-items:end;min-width:0}.question-meta-field{display:flex;flex-direction:column;gap:5px;min-width:0}.question-meta-field label{font-size:9px;font-weight:800;color:#64748B;letter-spacing:.7px;text-transform:uppercase}.question-meta-field select,.question-meta-field input{width:100%;min-width:0;box-sizing:border-box;border:1px solid #CBD5E1;border-radius:9px;padding:8px 9px;background:#FFF;color:#0F172A;font:inherit;font-size:11px;outline:none;height:34px}.question-meta-field select:focus,.question-meta-field input:focus{border-color:#FDBA74;box-shadow:0 0 0 3px rgba(249,115,22,.08)}.question-remove{width:34px;height:34px;border:1px solid #FECACA;border-radius:9px;background:#FEF2F2;color:#B91C1C;font-size:12px;font-weight:800;cursor:pointer}.question-prompt-field{margin-top:8px;display:flex;flex-direction:column;gap:5px;min-width:0}.question-prompt-field label{font-size:9px;font-weight:800;color:#64748B;letter-spacing:.7px;text-transform:uppercase}.question-prompt-field textarea{width:100%;min-width:0;box-sizing:border-box;min-height:64px;resize:vertical;border:1px solid #CBD5E1;border-radius:9px;padding:9px 10px;background:#FFF;color:#0F172A;font:inherit;font-size:12px;line-height:1.45;outline:none}.question-prompt-field textarea:focus{border-color:#FDBA74;box-shadow:0 0 0 3px rgba(249,115,22,.08)}.fill-editor-item{margin-top:8px;padding:9px;border:1px solid #E2E8F0;border-radius:9px;background:#FFF}.fill-editor-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;font-size:9px;color:#475569}.fill-editor-head .planner-btn{padding:5px 8px;font-size:8px}.paper-section{margin:18px 0 14px;break-inside:avoid}.paper-section-heading{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 10px;background:#F8FAFC;border-top:2px solid #CBD5E1;border-bottom:1px solid #E2E8F0;font-size:12px;font-weight:800;letter-spacing:.2px;text-transform:uppercase}.paper-section-description{color:#64748B}.paper-fill-statement{margin:6px 0 0 20px;line-height:1.55}.question-body{display:grid;grid-template-columns:1fr;gap:8px;margin-top:8px;min-width:0}.question-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:7px}.question-options input{width:100%;min-width:0;box-sizing:border-box;font-size:11px;padding:7px 8px;border:1px solid #CBD5E1;border-radius:8px}.paper-preview-wrap{display:flex;justify-content:center;padding:14px;background:#F1F5F9;border:1px solid #E2E8F0;border-radius:14px;overflow:auto}.paper-a4{width:794px;min-height:1123px;background:#FFF;box-shadow:0 8px 25px rgba(15,23,42,.10);padding:48px;box-sizing:border-box;color:#111827}.paper-a4 h1{margin:0 0 8px;font-size:24px;text-align:center}.paper-a4 .paper-meta{display:grid;grid-template-columns:repeat(2,1fr);gap:4px;font-size:11px;margin:18px 0 22px}.paper-question{margin:0 0 14px;font-size:12px;line-height:1.5}.paper-question .marks{float:right;font-weight:800}.paper-options{margin:5px 0 0 20px;font-size:11px}.planner-table-scroll{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid #E2E8F0;border-radius:14px}.planner-table{width:100%;min-width:760px;border-collapse:collapse;background:#FFF;font-size:11px}.planner-table th{padding:8px 9px;text-align:left;background:#F8FAFC;color:#64748B;font-size:9px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;border-bottom:1px solid #E2E8F0}.planner-table td{padding:9px;border-bottom:1px solid #EEF2F7;color:#334155;vertical-align:middle}.planner-table tr:last-child td{border-bottom:0}.lesson-preview-table-scroll{width:100%;overflow:auto;-webkit-overflow-scrolling:touch;border:1px solid #E2E8F0;border-radius:12px;background:#FFF}.lesson-preview-table{width:100%;min-width:860px;border-collapse:separate;border-spacing:0;font-size:10px}.lesson-preview-table th{position:sticky;top:0;z-index:1;padding:8px 9px;text-align:left;background:#FFF7ED;color:#9A3412;border-bottom:1px solid #FED7AA;font-size:8px;font-weight:800;letter-spacing:.6px;text-transform:uppercase}.lesson-preview-table td{padding:9px;vertical-align:top;border-bottom:1px solid #F1F5F9;color:#334155;line-height:1.45}.lesson-preview-table tr:last-child td{border-bottom:0}.lesson-preview-table td:first-child{font-weight:800;white-space:nowrap}.lesson-cell-list{display:flex;flex-direction:column;gap:4px}.lesson-cell-list span{display:block}.lesson-preview-image{max-width:130px;max-height:90px;border-radius:7px;border:1px solid #E2E8F0;object-fit:contain}.question-subsection{margin-top:9px;padding:9px;border:1px solid #E2E8F0;border-radius:10px;background:#F8FAFC;min-width:0;overflow:hidden}.question-subsection-title{font-size:9px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px}.match-editor-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;min-width:0}.match-row{display:grid;grid-template-columns:24px minmax(0,1fr) 28px;gap:6px;align-items:center;margin-top:6px;min-width:0}.match-row input{min-width:0;width:100%;box-sizing:border-box}.passage-question-row{display:grid;grid-template-columns:minmax(0,1fr) 70px 28px;gap:6px;align-items:center;margin-top:6px;min-width:0}.passage-question-row input{min-width:0;width:100%;box-sizing:border-box}.print-only{display:none}.planner-status{display:inline-flex;padding:4px 7px;border-radius:999px;font-size:8px;font-weight:800;letter-spacing:.5px}.status-SUBMITTED{background:#FFF7ED;color:#C2410C}.status-APPROVED{background:#ECFDF5;color:#15803D}.status-REJECTED{background:#FEF2F2;color:#B91C1C}.status-DRAFT{background:#F1F5F9;color:#64748B}
.planner-modal{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.42)}.planner-modal-card{width:min(1100px,100%);max-height:92vh;overflow:auto;background:#FFF;border-radius:18px;border:1px solid #E2E8F0;box-shadow:0 25px 60px rgba(15,23,42,.18)}.planner-modal-head{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 16px;background:rgba(255,255,255,.96);backdrop-filter:blur(10px);border-bottom:1px solid #E2E8F0}.planner-modal-body{padding:16px}.teacher-audit-group{margin-bottom:14px;padding:14px;background:#FFF;border:1px solid #E2E8F0;border-radius:17px;box-shadow:0 6px 20px rgba(15,23,42,.03)}.teacher-audit-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.teacher-name{font-size:16px;font-weight:800}.teacher-sub{margin-top:2px;color:#94A3B8;font-size:10px;font-weight:700}
@media(max-width:1024px){.planner-page{padding:10px}.planner-hero{padding:16px 18px;margin-bottom:10px;border-radius:18px}.planner-title{font-size:25px;margin:6px 0}.planner-copy{font-size:12px;line-height:1.4}.planner-section{padding:16px;margin-bottom:10px;border-radius:17px}.planner-section-title{font-size:19px}.planner-section-copy{font-size:11px}.template-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.planner-grid{gap:7px}.block-picker{grid-template-columns:repeat(4,minmax(0,1fr))}.planner-table{font-size:9px}.planner-table th{font-size:8px}.planner-table td{padding:7px}.question-meta-row{grid-template-columns:minmax(135px,1fr) 82px 34px;gap:7px}.question-meta-field label,.question-prompt-field label{font-size:8px}.question-meta-field select,.question-meta-field input{height:32px;font-size:10px;padding:7px 8px}.question-prompt-field textarea{font-size:10px;min-height:58px}.question-remove{width:32px;height:32px}.paper-a4{width:720px;min-height:1018px;padding:38px}.planner-modal{padding:10px}.planner-modal-card{max-height:95vh;border-radius:14px}}
@media(max-width:600px){.planner-page{padding:7px}.planner-hero{padding:12px 13px;border-radius:14px}.planner-eyebrow{font-size:7px;letter-spacing:.95px}.planner-title{font-size:18px;line-height:1.08}.planner-copy{font-size:9px;line-height:1.32}.planner-section{padding:11px;border-radius:14px}.planner-section-title{font-size:15px}.planner-section-copy{font-size:9px}.planner-grid{grid-template-columns:1fr;gap:6px}.planner-field label{font-size:7px}.planner-field input,.planner-field select,.planner-field textarea{padding:7px 8px;border-radius:8px;font-size:9px}.planner-field textarea{min-height:58px}.template-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.template-card{min-height:105px;padding:8px;border-radius:11px}.template-preview{height:57px;padding:5px}.template-name{font-size:9px;margin-top:6px}.template-meta{font-size:7px}.block-picker{grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}.block-add{padding:6px 3px;font-size:6.5px;border-radius:7px}.block-row{grid-template-columns:20px 72px minmax(0,1fr) 24px;gap:5px;padding:6px;border-radius:8px}.block-index{width:20px;height:20px;font-size:7px}.block-type{font-size:6.5px}.block-row input{padding:6px;font-size:8px}.block-remove{width:22px;height:22px}.planner-btn{padding:7px 8px;font-size:8px;border-radius:8px}.planner-table{min-width:700px;font-size:8px}.lesson-preview-table{min-width:820px;font-size:8px}.lesson-preview-table th{font-size:6.5px;padding:6px}.lesson-preview-table td{padding:6px}.lesson-preview-image{max-width:90px;max-height:65px}.question-meta-row{grid-template-columns:minmax(0,1fr) 78px 30px;gap:6px;align-items:end}.question-meta-row .question-type-field{grid-column:1}.question-meta-row .question-marks-field{grid-column:2}.question-meta-row .question-remove-field{grid-column:3}.question-meta-field label,.question-prompt-field label{font-size:7px}.question-meta-field select,.question-meta-field input{height:30px;font-size:9px;padding:6px 7px;border-radius:8px}.question-remove{width:30px;height:30px;border-radius:8px;font-size:10px}.question-prompt-field{margin-top:7px}.question-prompt-field textarea{min-height:54px;font-size:9px;padding:7px 8px;border-radius:8px}.fill-editor-item{padding:8px}.fill-editor-head{font-size:8px}.paper-section-heading{font-size:8px;padding:6px 7px}.paper-fill-statement{margin-left:14px;font-size:8.5px}.question-options{grid-template-columns:1fr;gap:5px}.match-editor-grid{grid-template-columns:1fr;gap:8px}.match-row{grid-template-columns:20px minmax(0,1fr) 25px;gap:5px}.passage-question-row{grid-template-columns:minmax(0,1fr) 55px 25px;gap:4px}.planner-table th{font-size:6.5px;padding:6px}.planner-table td{padding:6px}.paper-preview-wrap{padding:7px}.paper-a4{width:650px;min-height:919px;padding:30px}.paper-a4 h1{font-size:18px}.paper-a4 .paper-meta{font-size:8px}.paper-question{font-size:9px}.paper-options{font-size:8px}.planner-modal{padding:6px}.planner-modal-card{border-radius:11px}.planner-modal-head{padding:9px 11px}.planner-modal-body{padding:9px}.teacher-audit-group{padding:9px;border-radius:12px}.teacher-name{font-size:12px}.teacher-sub{font-size:7px}}
@media print{body{margin:0!important;background:#FFF!important}.planner-print-window{display:block!important}.planner-print-window *{box-shadow:none!important}.planner-print-window .print-page{width:210mm;min-height:297mm;margin:0 auto;padding:12mm;box-sizing:border-box;background:#FFF;color:#111827;font-family:Arial,sans-serif}.planner-print-window .print-table{width:100%;border-collapse:collapse;font-size:9pt}.planner-print-window .print-table th{background:#FFF7ED!important;color:#9A3412!important}.planner-print-window .print-table th,.planner-print-window .print-table td{border:1px solid #CBD5E1;padding:6pt;text-align:left;vertical-align:top}.planner-print-window .print-question{margin:0 0 10pt;break-inside:avoid}.planner-print-window .print-question img{max-width:100%;max-height:180mm}.planner-print-window .print-meta{display:grid;grid-template-columns:1fr 1fr;gap:4pt 14pt;margin:12pt 0 16pt;font-size:9pt}.planner-print-window .print-match{display:grid;grid-template-columns:1fr 1fr;gap:18pt;margin:6pt 0}.planner-print-window .print-match>div{min-width:0}.planner-print-window .print-match-row{display:flex;gap:8pt;margin:3pt 0}.planner-print-window .print-passage{white-space:pre-wrap;line-height:1.5;margin:5pt 0 8pt}.planner-print-window .print-fill{font-size:10pt;line-height:1.6}.planner-print-window .print-blank{display:inline-block;border-bottom:1.2pt solid #111827;min-width:65pt;margin:0 2pt}.planner-print-window .print-header{margin-bottom:12pt}.planner-print-window .print-header h1{margin:0 0 4pt;font-size:18pt}.planner-print-window .print-header p{margin:0;color:#64748B;font-size:8.5pt}.planner-print-window .print-image-prompt{margin-top:5pt;font-weight:600}.planner-print-window .print-passage-q{margin:3pt 0}.planner-print-window .print-page-break{break-before:page}}`;

export const TEMPLATES = [
  { key: "classic", name: "Classic Academic", meta: "Clean · formal", style: { fontFamily: "Georgia,serif", background: "#FFFDF8", color: "#24324A", accent: "#B45309" } },
  { key: "modern", name: "Modern Minimal", meta: "Crisp · compact", style: { fontFamily: "Inter,Arial,sans-serif", background: "#FFFFFF", color: "#0F172A", accent: "#2563EB" } },
  { key: "sage", name: "Calm Sage", meta: "Soft · classroom", style: { fontFamily: "Trebuchet MS,Arial,sans-serif", background: "#F8FFFB", color: "#14532D", accent: "#16A34A" } },
  { key: "executive", name: "Executive Plan", meta: "Bold · structured", style: { fontFamily: "Arial,sans-serif", background: "#F8FAFC", color: "#1E293B", accent: "#7C3AED" } },
] as const;

export function uid(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }
export function fmtDate(value: string | null | undefined) { if (!value) return "—"; return new Date(value).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }); }

export function TemplatePicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  return <div className="template-grid">{TEMPLATES.map(t => <div key={t.key} className={`template-card ${value===t.key?"selected":""}`} onClick={()=>onChange(t.key)}>
    <div className="template-preview" style={{fontFamily:t.style.fontFamily,background:t.style.background,color:t.style.color}}><div style={{fontSize:8,fontWeight:800,color:t.style.accent}}>LESSON PLAN</div><div style={{fontSize:10,fontWeight:800,marginTop:5}}>Week / Topic</div><div style={{height:2,width:"55%",marginTop:6,background:t.style.accent,opacity:.45}}/><div style={{fontSize:7,marginTop:5}}>Objectives · Topics · Notes</div></div>
    <div className="template-name">{t.name}</div><div className="template-meta">{t.meta}</div>
  </div>)}</div>;
}

export function AssignmentFields({ assignments, className, sectionName, subjectName, onSelect }: { assignments: TeacherAssignmentOption[]; className:string; sectionName:string; subjectName:string; onSelect:(a:TeacherAssignmentOption)=>void }) {
  const value = assignments.find(a => a.className===className && a.sectionName===sectionName && a.subjectName===subjectName);
  return <div className="planner-grid"><div className="planner-field"><label>Class · Section</label><select value={value?.id ?? ""} onChange={(e: any)=>{const a=assignments.find(x=>x.id===e.target.value); if(a) onSelect(a);}}><option value="">Select assigned classroom</option>{assignments.map(a=><option key={a.id} value={a.id}>{a.className} · Section {a.sectionName} · {a.subjectName}</option>)}</select></div><div className="planner-field"><label>Subject</label><input value={subjectName} readOnly placeholder="Selected from assignment"/></div></div>;
}

export function LessonComposer({ blocks, onChange }: { blocks: LessonBlock[]; onChange:(blocks:LessonBlock[])=>void }) {
  const fileRef = useRef<HTMLInputElement|null>(null);
  const [pendingImage, setPendingImage] = useState<string|null>(null);
  const add = (type: LessonBlock["type"]) => onChange([...blocks,{id:uid("block"),type,value:type==="day"?"Monday":""}]);
  const update = (id:string, value:string) => onChange(blocks.map(b=>b.id===id?{...b,value}:b));
  const remove = (id:string) => onChange(blocks.filter(b=>b.id!==id));
  const handleImage = (file:File) => { const reader=new FileReader(); reader.onload=()=>{ const data=String(reader.result??""); onChange([...blocks,{id:uid("block"),type:"image",imageDataUrl:data,imageName:file.name}]); setPendingImage(null); }; reader.readAsDataURL(file); };
  return <>
    <div className="block-picker">{(["date","day","chapter","topic","subtopics","notes","image"] as const).map(type=><button className="block-add" key={type} onClick={()=>type==="image"?setPendingImage("choose"):add(type)}>+ {type}</button>)}</div>
    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e: any)=>{const f=e.target.files?.[0];if(f)handleImage(f);e.currentTarget.value=""}}/>
    {pendingImage && <div style={{marginTop:8,display:"flex",gap:7}}><button className="planner-btn" onClick={()=>fileRef.current?.click()}>Choose image</button><button className="planner-btn" onClick={()=>setPendingImage(null)}>Cancel</button></div>}
    <div className="block-list">{blocks.length===0?<div style={{padding:14,textAlign:"center",color:"#94A3B8",fontSize:10,border:"1px dashed #CBD5E1",borderRadius:10}}>Add sections in any order. Each section can be used multiple times.</div>:blocks.map((b,i)=><div className="block-row" key={b.id}><div className="block-index">{i+1}</div><div className="block-type">{b.type}</div><div>{b.type==="image"?(<>{b.imageDataUrl&&<img src={b.imageDataUrl} alt={b.imageName||"planner"}/>}<div style={{fontSize:8,color:"#64748B",marginTop:4}}>{b.imageName}</div></>):b.type==="day"?(<select style={{width:"100%",border:"1px solid #CBD5E1",borderRadius:8,padding:7,fontSize:11}} value={b.value||"Monday"} onChange={(e: any)=>update(b.id,e.target.value)}>{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map(d=><option key={d}>{d}</option>)}</select>):b.type==="date"?(<input type="date" value={b.value||""} onChange={(e: any)=>update(b.id,e.target.value)}/>):<input value={b.value||""} onChange={(e: any)=>update(b.id,e.target.value)} placeholder={`Enter ${b.type}`}/>}</div><button className="block-remove" onClick={()=>remove(b.id)}>×</button></div>)}</div>
  </>;
}

export interface LessonPreviewRow {
  date: string;
  day: string;
  chapter: string;
  topic: string;
  subtopics: string[];
  notes: string[];
  images: LessonBlock[];
}

export function buildLessonPreviewRows(blocks: LessonBlock[]): LessonPreviewRow[] {
  const rows: LessonPreviewRow[] = [];
  let current: LessonPreviewRow | null = null;
  const ensure = () => {
    if (!current) {
      current = { date: "", day: "", chapter: "", topic: "", subtopics: [], notes: [], images: [] };
      rows.push(current);
    }
    return current;
  };
  blocks.forEach(block => {
    if (block.type === "date") {
      current = { date: block.value ?? "", day: "", chapter: "", topic: "", subtopics: [], notes: [], images: [] };
      rows.push(current);
      return;
    }
    const row = ensure();
    if (block.type === "day") row.day = block.value ?? "";
    if (block.type === "chapter") row.chapter = block.value ?? "";
    if (block.type === "topic") row.topic = block.value ?? "";
    if (block.type === "subtopics" && block.value) row.subtopics.push(block.value);
    if (block.type === "notes" && block.value) row.notes.push(block.value);
    if (block.type === "image") row.images.push(block);
  });
  return rows.length ? rows : [{ date: "", day: "", chapter: "", topic: "", subtopics: [], notes: [], images: [] }];
}

function LessonPreviewTable({ blocks }: { blocks: LessonBlock[] }) {
  const rows = buildLessonPreviewRows(blocks);
  return <div className="lesson-preview-table-scroll">
    <table className="lesson-preview-table">
      <thead><tr><th>Date</th><th>Day</th><th>Chapter</th><th>Topic</th><th>Subtopics</th><th>Notes</th><th>Image</th></tr></thead>
      <tbody>{rows.map((row, index) => <tr key={`${row.date}-${index}`}>
        <td>{row.date ? fmtDate(row.date) : "—"}</td>
        <td>{row.day || "—"}</td>
        <td>{row.chapter || "—"}</td>
        <td>{row.topic || "—"}</td>
        <td>{row.subtopics.length ? <div className="lesson-cell-list">{row.subtopics.map((x,i)=><span key={i}>{x}</span>)}</div> : "—"}</td>
        <td>{row.notes.length ? <div className="lesson-cell-list">{row.notes.map((x,i)=><span key={i}>{x}</span>)}</div> : "—"}</td>
        <td>{row.images.length ? <div className="lesson-cell-list">{row.images.map((x,i)=>x.imageDataUrl?<img className="lesson-preview-image" key={i} src={x.imageDataUrl} alt={x.imageName || "Lesson image"}/>:<span key={i}>{x.imageName || "Image"}</span>)}</div> : "—"}</td>
      </tr>)}</tbody>
    </table>
  </div>;
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[char] as string));
}
function printLessonHtml(record: PlannerRecord) {
  const payload = record.payload as LessonPlannerPayload;
  const rows = buildLessonPreviewRows(payload.blocks ?? []);
  const rowHtml = rows.map(row => `<tr><td>${escapeHtml(row.date ? fmtDate(row.date) : "—")}</td><td>${escapeHtml(row.day || "—")}</td><td>${escapeHtml(row.chapter || "—")}</td><td>${escapeHtml(row.topic || "—")}</td><td>${row.subtopics.map(escapeHtml).join("<br>") || "—"}</td><td>${row.notes.map(escapeHtml).join("<br>") || "—"}</td><td>${row.images.map(x => x.imageDataUrl ? `<img src="${x.imageDataUrl}" style="max-width:120px;max-height:80px;display:block;margin:2px 0" alt="Lesson image">` : escapeHtml(x.imageName || "Image")).join("") || "—"}</td></tr>`).join("");
  return `<div class="print-page"><header class="print-header"><h1>${escapeHtml(record.title || "Weekly Lesson Plan")}</h1><p>${escapeHtml(record.className)} · Section ${escapeHtml(record.sectionName)} · ${escapeHtml(record.subjectName)} · ${escapeHtml(fmtDate(record.startDate))} — ${escapeHtml(fmtDate(record.endDate))}</p></header><table class="print-table"><thead><tr><th>Date</th><th>Day</th><th>Chapter</th><th>Topic</th><th>Subtopics</th><th>Notes</th><th>Image</th></tr></thead><tbody>${rowHtml}</tbody></table></div>`;
}

function getPaperSections(questions: QuestionItem[]) {
  const defs: { key: string; title: string; description: string; types: QuestionType[] }[] = [
    { key: "objective-mcq", title: "Section A — Multiple Choice Questions", description: "Choose the correct option.", types: ["MCQ"] },
    { key: "objective-fill", title: "Section B — Fill in the Blanks", description: "Complete each sentence with the correct word or phrase.", types: ["FILL_BLANK"] },
    { key: "objective-match", title: "Section C — Match the Following", description: "Match the items in Column A with the correct items in Column B.", types: ["MATCH_COLUMNS"] },
    { key: "objective-tf", title: "Section D — True / False", description: "Write True or False for each statement.", types: ["TRUE_FALSE"] },
    { key: "short", title: "Section E — Short Answer Type Questions", description: "Answer briefly and clearly.", types: ["SHORT_ANSWER"] },
    { key: "long", title: "Section F — Long Answer Type Questions", description: "Answer in detail with appropriate explanation.", types: ["LONG_ANSWER"] },
    { key: "image", title: "Section G — Picture / Image Based Questions", description: "Observe the image and answer the question.", types: ["IMAGE_BASED"] },
    { key: "passage", title: "Section H — Unseen Passage / Comprehension", description: "Read the passage carefully and answer the questions that follow.", types: ["UNSEEN_PASSAGE"] },
  ];
  return defs.map(def => ({ ...def, questions: questions.filter(q => def.types.includes(q.type)) })).filter(section => section.questions.length > 0);
}

function sectionMarks(section: { questions: QuestionItem[] }) {
  return section.questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);
}

function printPaperQuestion(q: QuestionItem, number: number) {
  const marks = `<span class="print-q-marks">[${escapeHtml(q.marks)}]</span>`;
  if (q.type === "MCQ") return `<div class="print-question">${marks}<strong>${number}. </strong>${escapeHtml(q.question)}<div class="print-options">${(q.options ?? []).map((o,j)=>`<div>${String.fromCharCode(65+j)}. ${escapeHtml(o)}</div>`).join("")}</div></div>`;
  if (q.type === "FILL_BLANK") {
    const items = getFillBlankItems(q);
    const body = items.map((item, i) => {
      let rendered = escapeHtml(item.sentence || "");
      const escaped = escapeHtml(item.blank || "");
      if (escaped) rendered = rendered.replace(escaped, `<span class="print-blank"></span>`);
      return `<div class="print-fill-statement"><span class="print-sub-number">${String.fromCharCode(97+i)}. </span>${rendered}</div>`;
    }).join("");
    return `<div class="print-question">${marks}<strong>${number}. </strong>${body || `<div class="print-fill-statement">Enter the sentence and blank.</div>`}</div>`;
  }
  if (q.type === "MATCH_COLUMNS") {
    const a=q.columnA??[], b=q.columnB??[], count=Math.max(a.length,b.length);
    return `<div class="print-question">${marks}<strong>${number}. </strong>${escapeHtml(q.question || "Match the following")}${renderPrintMatch(q,count)}</div>`;
  }
  if (q.type === "TRUE_FALSE") {
    const statements = q.statements ?? [];
    const tfBody = statements.length
      ? statements.map((statement,i)=>`<div class="print-tf-row"><span>${i+1}.</span><span>${escapeHtml(statement)}</span><span>True / False</span></div>`).join("")
      : `<div class="print-tf-row"><span>1.</span><span>Write True or False.</span><span>True / False</span></div>`;
    return `<div class="print-question">${marks}<strong>${number}. </strong><span>${escapeHtml(q.question || "True / False")}</span><div class="print-tf-list">${tfBody}</div></div>`;
  }
  if (q.type === "IMAGE_BASED") {
    const image = q.imageDataUrl ? `<img class="print-image" src="${q.imageDataUrl}" alt="Question image">` : "";
    return `<div class="print-question">${marks}<strong>${number}. </strong>${image}<div class="print-image-prompt">${escapeHtml(q.imageInstruction || q.question || "Describe the image and explain what you see.")}</div></div>`;
  }
  if (q.type === "UNSEEN_PASSAGE") return `<div class="print-question">${marks}<strong>${number}. </strong>Read the following passage and answer the questions.<div class="print-passage">${escapeHtml(q.passage || "")}</div>${(q.passageQuestions??[]).map((pq,j)=>`<div class="print-passage-q"><strong>${String.fromCharCode(97+j)}. </strong>${escapeHtml(pq.question)} <span class="print-q-marks">[${escapeHtml(pq.marks)}]</span></div>`).join("")}</div>`;
  return `<div class="print-question">${marks}<strong>${number}. </strong>${escapeHtml(q.question || "Untitled question")}</div>`;
}

function renderPrintMatch(q: QuestionItem, count: number) {
  const a=q.columnA??[], b=q.columnB??[];
  return `<div class="print-match"><div><div class="print-match-title">Column A</div>${Array.from({length:count},(_,i)=>`<div class="print-match-row"><span>${i+1}.</span><span>${escapeHtml(a[i]?.text || "")}</span></div>`).join("")}</div><div><div class="print-match-title">Column B</div>${Array.from({length:count},(_,i)=>`<div class="print-match-row"><span>${String.fromCharCode(97+i)}.</span><span>${escapeHtml(b[i]?.text || "")}</span></div>`).join("")}</div></div>`;
}

function printPaperHtml(record: PlannerRecord) {
  const p = record.payload as QuestionPaperPayload;
  const questions = p.questions ?? [];
  const total = questions.reduce((sum, q) => sum + Number(q.marks || 0), 0) || p.totalMarks;
  const sections = getPaperSections(questions);
  let globalNumber = 1;
  const sectionsHtml = sections.map(section => {
    const body = section.questions.map(q => printPaperQuestion(q, globalNumber++)).join("");
    return `<section class="print-paper-section"><div class="print-section-heading"><span>${escapeHtml(section.title)}</span><span>${sectionMarks(section)} Marks</span></div><div class="print-section-description">${escapeHtml(section.description)}</div>${body}</section>`;
  }).join("");
  return `<div class="print-page print-paper-page"><header class="print-header"><div class="print-kicker">${escapeHtml(record.plannerType === "unit_test" ? "UNIT TEST" : "EXAMINATION PAPER")}</div><h1>${escapeHtml(record.title)}</h1><div class="print-subject">${escapeHtml(record.subjectName)}</div></header><div class="print-meta"><span><strong>School:</strong> ${escapeHtml(p.schoolName)}</span><span><strong>Total Marks:</strong> ${escapeHtml(total)}</span><span><strong>Date:</strong> ${escapeHtml(fmtDate(record.startDate))}</span><span><strong>Day:</strong> ${escapeHtml(record.startDate ? new Date(record.startDate).toLocaleDateString("en-IN",{weekday:"long"}) : "")}</span><span><strong>Time Allowed:</strong> ${escapeHtml(p.timeAllowed)}</span><span><strong>Class:</strong> ${escapeHtml(record.className)} · Section ${escapeHtml(record.sectionName)}</span></div><div class="print-instructions"><strong>General Instructions:</strong> Read all questions carefully. Marks allotted to each question are shown against it. Answer all questions as instructed in each section.</div>${sectionsHtml}</div>`;
}

export function printPlannerRecord(record: PlannerRecord) {
  const printWindow = window.open("", "_blank", "width=1100,height=900");
  if (!printWindow) {
    window.alert("Please allow pop-ups for Talent Passport to print or save this planner as PDF.");
    return;
  }
  const body = record.plannerType === "lesson" ? printLessonHtml(record) : printPaperHtml(record);
  const css = `
    @page{size:A4;margin:0}
    *{box-sizing:border-box}
    html,body{margin:0;padding:0;background:#fff;color:#111827}
    body{font-family:Arial,Helvetica,sans-serif}
    .planner-print-window{display:block;background:#fff}
    .print-page{width:210mm;min-height:297mm;margin:0 auto;padding:13mm 14mm;background:#fff;color:#111827}
    .print-header{text-align:center;margin-bottom:12pt}.print-kicker{font-size:9pt;font-weight:800;letter-spacing:1.4pt;color:#C2410C;text-transform:uppercase}.print-header h1{margin:4pt 0 3pt;font-size:19pt;line-height:1.15}.print-subject{font-size:10pt;font-weight:800}.print-header p{margin:0;color:#64748B;font-size:8.5pt}
    .print-meta{display:grid;grid-template-columns:1fr 1fr;gap:5pt 18pt;margin:13pt 0 12pt;padding:10pt;border:1px solid #CBD5E1;border-radius:6pt;font-size:8.5pt}.print-meta span{min-width:0}.print-instructions{padding:8pt 10pt;margin:0 0 12pt;background:#F8FAFC;border-left:3pt solid #F97316;font-size:8.5pt;line-height:1.45}
    .print-paper-section{margin:0 0 12pt;break-inside:auto}.print-section-heading{display:flex;justify-content:space-between;gap:10pt;align-items:center;padding:6pt 8pt;background:#F8FAFC;border-top:1.5pt solid #CBD5E1;border-bottom:.7pt solid #E2E8F0;font-size:9.5pt;font-weight:800;text-transform:uppercase}.print-section-description{margin:5pt 0 7pt;color:#64748B;font-size:8pt;font-style:italic}.print-question{position:relative;margin:0 0 9pt;font-size:9.5pt;line-height:1.48;break-inside:avoid}.print-q-marks{float:right;font-weight:800}.print-options{margin:4pt 0 0 17pt}.print-options div{margin:2pt 0}.print-blank{display:inline-block;min-width:58pt;border-bottom:1pt solid #111827;margin:0 2pt;height:10pt}.print-fill-statement{margin:4pt 0 0 18pt;line-height:1.55}.print-sub-number{font-weight:700;display:inline-block;min-width:15pt}.print-match{display:grid;grid-template-columns:1fr 1fr;gap:24pt;margin:6pt 0 0 18pt}.print-match-title{font-size:8pt;font-weight:800;text-transform:uppercase;color:#64748B;margin-bottom:3pt}.print-match-row{display:grid;grid-template-columns:20pt 1fr;gap:5pt;margin:3pt 0}.print-tf-list{margin:5pt 0 0 18pt}.print-tf-row{display:grid;grid-template-columns:18pt 1fr 55pt;gap:5pt;margin:4pt 0}.print-tf-row span:last-child{white-space:nowrap}.print-image{display:block;max-width:120mm;max-height:70mm;margin:7pt auto;border-radius:4pt;object-fit:contain}.print-image-prompt{font-weight:600;margin-top:5pt}.print-passage{white-space:pre-wrap;line-height:1.5;margin:6pt 0 8pt;padding:8pt;border:1pt solid #CBD5E1;background:#FAFAFA;border-radius:4pt}.print-passage-q{margin:4pt 0 0 18pt}.print-table{width:100%;border-collapse:collapse;font-size:8pt}.print-table th{background:#FFF7ED;color:#9A3412}.print-table th,.print-table td{border:1pt solid #CBD5E1;padding:5pt;text-align:left;vertical-align:top}.print-table tr{break-inside:avoid}.print-lesson-page .print-header{text-align:left}
    @media print{body{background:#fff!important}.planner-print-window{width:100%}.print-page{margin:0}.print-paper-section{break-inside:auto}.print-section-heading{break-after:avoid}.print-question{break-inside:avoid}.print-table tr{break-inside:avoid}}
  `;
  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(record.title)}</title><style>${css}</style></head><body><div class="planner-print-window">${body}</div><script>(function(){function ready(){var imgs=[].slice.call(document.images);if(!imgs.length){setTimeout(function(){window.focus();window.print()},180);return;}var left=imgs.length;function done(){left-=1;if(left<=0)setTimeout(function(){window.focus();window.print()},180)}imgs.forEach(function(img){if(img.complete)done();else{img.addEventListener('load',done,{once:true});img.addEventListener('error',done,{once:true});}});setTimeout(function(){window.focus();window.print()},2500)}if(document.readyState==='complete')ready();else window.addEventListener('load',ready);window.onafterprint=function(){setTimeout(function(){window.close()},150)};})();<\/script></body></html>`);
  printWindow.document.close();
}

export function LessonPreview({ record, editable=false, onSaveEdit, onClose }: { record: PlannerRecord; editable?: boolean; onSaveEdit?:(payload:LessonPlannerPayload)=>void; onClose:()=>void }) {
  const payload = record.payload as LessonPlannerPayload;
  const [blocks,setBlocks] = useState(payload.blocks ?? []);
  const template = TEMPLATES.find(t=>t.key===record.templateKey) ?? TEMPLATES[0];
  return <div className="planner-modal"><div className="planner-modal-card"><div className="planner-modal-head"><div><div className="planner-eyebrow">Planner Preview</div><strong>{record.title || "Lesson Planner"}</strong></div><div className="planner-actions"><button className="planner-btn" onClick={onClose}>Close</button><button className="planner-btn" onClick={()=>printPlannerRecord({...record,payload:{blocks}})}>Download / Save PDF</button>{editable&&onSaveEdit&&<button className="planner-btn primary" onClick={()=>onSaveEdit({blocks})}>Save edits</button>}</div></div><div className="planner-modal-body"><div style={{padding:18,borderRadius:14,border:"1px solid #E2E8F0",background:template.style.background,fontFamily:template.style.fontFamily,color:template.style.color}}><div style={{fontSize:10,fontWeight:800,color:template.style.accent,letterSpacing:1.2}}>TALENT PASSPORT · LESSON PLAN</div><h2 style={{margin:"7px 0",fontSize:22}}>{record.title}</h2><div style={{display:"flex",gap:8,flexWrap:"wrap",fontSize:10,color:"#64748B"}}><span>{record.className} · Section {record.sectionName}</span><span>·</span><span>{record.subjectName}</span><span>·</span><span>{fmtDate(record.startDate)} — {fmtDate(record.endDate)}</span></div><div style={{marginTop:14}}><LessonPreviewTable blocks={blocks}/></div></div>{editable&&<div style={{marginTop:12}}><LessonComposer blocks={blocks} onChange={setBlocks}/></div>}</div></div></div>;
}

type FillBlankEditorItem = { id: string; sentence: string; blank: string };
function getFillBlankItems(q: QuestionItem): FillBlankEditorItem[] {
  const raw = (q as any).fillItems;
  if (Array.isArray(raw) && raw.length) return raw.map((item: any, i: number) => ({ id: String(item?.id || `fill-${q.id}-${i}`), sentence: String(item?.sentence ?? ""), blank: String(item?.blank ?? "") }));
  return [{ id: `fill-${q.id}-0`, sentence: String(q.fillSentence ?? q.question ?? ""), blank: String(q.blanks?.[0] ?? "") }];
}

export function QuestionEditor({ questions, onChange }: { questions:QuestionItem[]; onChange:(q:QuestionItem[])=>void }) {
  const addQuestion=()=>onChange([...questions,{id:uid("q"),type:"SHORT_ANSWER",question:"",marks:1}]);
  const update=(id:string,patch:Partial<QuestionItem>)=>onChange(questions.map(q=>q.id===id?{...q,...patch}:q));
  const remove=(id:string)=>onChange(questions.filter(q=>q.id!==id));
  const addOption=(id:string)=>onChange(questions.map(q=>q.id===id?{...q,options:[...(q.options??[]),""]}:q));
  const updateOption=(id:string,index:number,value:string)=>onChange(questions.map(q=>q.id===id?{...q,options:(q.options??[]).map((o,i)=>i===index?value:o)}:q));
  const updateList=(id:string,key:"columnA"|"columnB",index:number,value:string)=>onChange(questions.map(q=>q.id===id?{...q,[key]:(q[key]??[]).map((item,i)=>i===index?{...item,text:value}:item)}:q));
  const addMatch=(id:string,key:"columnA"|"columnB")=>onChange(questions.map(q=>q.id===id?{...q,[key]:[...(q[key]??[]),{id:uid(key),text:""}]}:q));
  const removeMatch=(id:string,key:"columnA"|"columnB",index:number)=>onChange(questions.map(q=>q.id===id?{...q,[key]:(q[key]??[]).filter((_,i)=>i!==index)}:q));
  const addPassageQuestion=(id:string)=>onChange(questions.map(q=>q.id===id?{...q,passageQuestions:[...(q.passageQuestions??[]),{id:uid("pq"),question:"",marks:1}]}:q));
  const updatePassageQuestion=(id:string,index:number,patch:Partial<PassageQuestion>)=>onChange(questions.map(q=>q.id===id?{...q,passageQuestions:(q.passageQuestions??[]).map((item,i)=>i===index?{...item,...patch}:item)}:q));
  const removePassageQuestion=(id:string,index:number)=>onChange(questions.map(q=>q.id===id?{...q,passageQuestions:(q.passageQuestions??[]).filter((_,i)=>i!==index)}:q));
  const fillItemsFor=(q:QuestionItem)=>getFillBlankItems(q);
  const updateFillItem=(id:string,index:number,patch:Partial<FillBlankEditorItem>)=>onChange(questions.map(q=>{
    if(q.id!==id)return q;
    const items=fillItemsFor(q).map((item,i)=>i===index?{...item,...patch}:item);
    const next:any={...(q as any),fillItems:items};
    if(index===0){next.fillSentence=items[0]?.sentence??"";next.question=items[0]?.sentence??"";next.blanks=[items[0]?.blank??""];}
    return next as QuestionItem;
  }));
  const addFillItem=(id:string)=>onChange(questions.map(q=>q.id===id?({...q,fillItems:[...fillItemsFor(q),{id:uid("fill"),sentence:"",blank:""}]} as any as QuestionItem):q));
  const removeFillItem=(id:string,index:number)=>onChange(questions.map(q=>{
    if(q.id!==id)return q;
    const items=fillItemsFor(q);
    if(items.length<=1)return q;
    const nextItems=items.filter((_,i)=>i!==index);
    const next:any={...(q as any),fillItems:nextItems};
    next.fillSentence=nextItems[0]?.sentence??"";next.question=nextItems[0]?.sentence??"";next.blanks=[nextItems[0]?.blank??""];
    return next as QuestionItem;
  }));
  const types:QuestionType[]=["MCQ","SHORT_ANSWER","LONG_ANSWER","MATCH_COLUMNS","FILL_BLANK","TRUE_FALSE","IMAGE_BASED","UNSEEN_PASSAGE"];
  const addStatement=(id:string)=>onChange(questions.map(q=>q.id===id?{...q,statements:[...(q.statements?.length?q.statements:[q.question||""]),""]}:q));
  const updateStatement=(id:string,index:number,value:string)=>onChange(questions.map(q=>q.id===id?{...q,statements:(q.statements?.length?q.statements:[q.question||""]).map((item,i)=>i===index?value:item),question:index===0?value:q.question}:q));
  const removeStatement=(id:string,index:number)=>onChange(questions.map(q=>q.id===id?{...q,statements:(q.statements?.length?q.statements:[q.question||""]).filter((_,i)=>i!==index)}:q));
  return <div className="question-list">{questions.map((q,i)=>{
    const statements=q.statements?.length?q.statements:[q.question||""];
    return <div className="question-card" key={q.id}>
      <div className="question-meta-row">
        <div className="question-meta-field question-type-field"><label>Question type · {i+1}</label><select value={q.type} onChange={(e: any)=>update(q.id,{type:e.target.value as QuestionType})}>{types.map(t=><option key={t} value={t}>{t.replace(/_/g," ")}</option>)}</select></div>
        <div className="question-meta-field question-marks-field"><label>Marks</label><input type="number" min={0} step={0.5} value={q.marks} onChange={(e: any)=>update(q.id,{marks:Number(e.target.value)})} placeholder="Marks"/></div>
        <div className="question-remove-field"><button className="question-remove" aria-label={`Remove question ${i+1}`} onClick={()=>remove(q.id)}>×</button></div>
      </div>
      <div className="question-prompt-field"><label>Type the question / instruction</label><textarea value={q.question} onChange={(e: any)=>update(q.id,{question:e.target.value})} placeholder={`Enter question ${i+1} or the instruction for students...`}/></div>
      {q.type==="MCQ"&&<div className="question-options">{(q.options??[]).map((o,j)=><input key={j} value={o} onChange={(e: any)=>updateOption(q.id,j,e.target.value)} placeholder={`Option ${j+1}`}/>)}{(q.options??[]).length<4&&<button className="planner-btn" onClick={()=>addOption(q.id)}>+ Option</button>}</div>}
      {q.type==="FILL_BLANK"&&<div className="question-subsection"><div className="question-subsection-title">Fill in the Blanks</div>{fillItemsFor(q).map((item,j)=><div className="fill-editor-item" key={item.id}><div className="fill-editor-head"><strong>Statement {j+1}</strong><button className="planner-btn danger" disabled={fillItemsFor(q).length<=1} onClick={()=>removeFillItem(q.id,j)}>×</button></div><div className="planner-field"><label>Full sentence — enter the complete sentence</label><textarea value={item.sentence} onChange={(e:any)=>updateFillItem(q.id,j,{sentence:e.target.value})} placeholder="Example: The capital of India is New Delhi."/></div><div className="planner-field" style={{marginTop:7}}><label>Word / phrase to remove and print as blank</label><input value={item.blank} onChange={(e:any)=>updateFillItem(q.id,j,{blank:e.target.value})} placeholder="Example: New Delhi"/></div></div>)}<button className="planner-btn" style={{marginTop:8}} onClick={()=>addFillItem(q.id)}>+ Add statement</button><div style={{marginTop:5,color:"#94A3B8",fontSize:8}}>Each statement keeps its full sentence and the exact word/phrase that will become a blank in the paper.</div></div>}
      {q.type==="MATCH_COLUMNS"&&<div className="question-subsection"><div className="question-subsection-title">Match the following</div><div className="match-editor-grid"><div><div className="question-subsection-title">Column A</div>{(q.columnA??[]).map((item,j)=><div className="match-row" key={item.id}><strong>{j+1}.</strong><input value={item.text} onChange={(e: any)=>updateList(q.id,"columnA",j,e.target.value)} placeholder={`Column A item ${j+1}`}/><button className="planner-btn danger" onClick={()=>removeMatch(q.id,"columnA",j)}>×</button></div>)}<button className="planner-btn" style={{marginTop:6}} onClick={()=>addMatch(q.id,"columnA")}>+ Add A</button></div><div><div className="question-subsection-title">Column B</div>{(q.columnB??[]).map((item,j)=><div className="match-row" key={item.id}><strong>{String.fromCharCode(97+j)}.</strong><input value={item.text} onChange={(e: any)=>updateList(q.id,"columnB",j,e.target.value)} placeholder={`Column B item ${j+1}`}/><button className="planner-btn danger" onClick={()=>removeMatch(q.id,"columnB",j)}>×</button></div>)}<button className="planner-btn" style={{marginTop:6}} onClick={()=>addMatch(q.id,"columnB")}>+ Add B</button></div></div><div style={{marginTop:5,color:"#94A3B8",fontSize:8}}>The paper prints the two lists side-by-side.</div></div>}
      {q.type==="TRUE_FALSE"&&<div className="question-subsection"><div className="question-subsection-title">True / False statements</div>{statements.map((statement,j)=><div className="passage-question-row" key={`${q.id}-tf-${j}`}><input value={statement} onChange={(e: any)=>updateStatement(q.id,j,e.target.value)} placeholder={`Statement ${j+1}`}/><div style={{height:30,border:"1px solid #E2E8F0",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:800,color:"#64748B",background:"#F8FAFC"}}>T / F</div><button className="planner-btn danger" disabled={statements.length<=1} onClick={()=>removeStatement(q.id,j)}>×</button></div>)}<button className="planner-btn" style={{marginTop:7}} onClick={()=>addStatement(q.id)}>+ Add statement</button></div>}
      {q.type==="IMAGE_BASED"&&<ImageQuestionEditor question={q} onChange={patch=>update(q.id,patch)}/>} 
      {q.type==="UNSEEN_PASSAGE"&&<div className="question-subsection"><div className="question-subsection-title">Unseen passage</div><div className="planner-field"><label>Passage</label><textarea value={q.passage??""} onChange={(e: any)=>update(q.id,{passage:e.target.value})} placeholder="Paste or type the unseen passage here." style={{minHeight:120}}/></div>{(q.passageQuestions??[]).map((pq,j)=><div className="passage-question-row" key={pq.id}><input value={pq.question} onChange={(e: any)=>updatePassageQuestion(q.id,j,{question:e.target.value})} placeholder={`Question ${j+1} based on the passage`}/><input type="number" min={0} step={0.5} value={pq.marks} onChange={(e: any)=>updatePassageQuestion(q.id,j,{marks:Number(e.target.value)})} placeholder="Marks"/><button className="planner-btn danger" onClick={()=>removePassageQuestion(q.id,j)}>×</button></div>)}<button className="planner-btn" style={{marginTop:7}} onClick={()=>addPassageQuestion(q.id)}>+ Add passage question</button></div>}
    </div>;
  })}<button className="planner-btn primary" onClick={addQuestion}>+ Add question</button></div>;
}

function ImageQuestionEditor({ question, onChange }: { question: QuestionItem; onChange:(patch:Partial<QuestionItem>)=>void }) {
  const ref = useRef<HTMLInputElement | null>(null);
  function choose(file: File) { const reader = new FileReader(); reader.onload = () => onChange({imageDataUrl:String(reader.result||""),imageName:file.name}); reader.readAsDataURL(file); }
  return <div className="question-subsection"><div className="question-subsection-title">Image-based question</div><div className="planner-actions"><button className="planner-btn" onClick={()=>ref.current?.click()}>Upload image</button>{question.imageName&&<span style={{fontSize:8,color:"#64748B"}}>{question.imageName}</span>}</div><input ref={ref} type="file" accept="image/*" hidden onChange={(e:any)=>{const f=e.target.files?.[0];if(f)choose(f);e.currentTarget.value=""}}/>{question.imageDataUrl&&<img src={question.imageDataUrl} alt={question.imageName||"Question"} style={{marginTop:8,maxWidth:"100%",maxHeight:180,borderRadius:8,border:"1px solid #E2E8F0"}}/>}<div className="planner-field" style={{marginTop:7}}><label>Instruction / what students should explain</label><textarea value={question.imageInstruction??question.question} onChange={(e:any)=>onChange({imageInstruction:e.target.value,question:e.target.value})} placeholder="Describe the image and explain what you see."/></div></div>;
}

export function PaperPreview({ record, onClose, editable=false, onSaveEdit }: { record:PlannerRecord; onClose:()=>void; editable?:boolean; onSaveEdit?:(payload:QuestionPaperPayload)=>void }) {
  const p=record.payload as QuestionPaperPayload;
  const [questions,setQuestions]=useState(p.questions??[]);
  const total=useMemo(()=>questions.reduce((s,q)=>s+Number(q.marks||0),0),[questions]);
  const sections=getPaperSections(questions);
  let globalNumber=1;
  return <div className="planner-modal"><div className="planner-modal-card"><div className="planner-modal-head"><strong>Paper Preview · A4</strong><div className="planner-actions"><button className="planner-btn" onClick={onClose}>Close</button><button className="planner-btn" onClick={()=>printPlannerRecord({...record,payload:{...p,questions,totalMarks:total||p.totalMarks}})}>Download / Save PDF</button>{editable&&onSaveEdit&&<button className="planner-btn primary" onClick={()=>onSaveEdit({...p,questions,totalMarks:total})}>Save edits</button>}</div></div><div className="planner-modal-body"><div className="paper-preview-wrap"><article className="paper-a4"><div className="print-kicker" style={{textAlign:"center"}}>{record.plannerType === "unit_test" ? "UNIT TEST" : "EXAMINATION PAPER"}</div><h1>{record.title}</h1><div style={{textAlign:"center",fontSize:11,fontWeight:800}}>{record.subjectName}</div><div className="paper-meta"><span><strong>School:</strong> {p.schoolName}</span><span><strong>Total Marks:</strong> {total || p.totalMarks}</span><span><strong>Date:</strong> {fmtDate(record.startDate)}</span><span><strong>Day:</strong> {record.startDate ? new Date(record.startDate).toLocaleDateString("en-IN",{weekday:"long"}) : ""}</span><span><strong>Time Allowed:</strong> {p.timeAllowed}</span><span><strong>Class:</strong> {record.className} · Section {record.sectionName}</span></div><div className="print-instructions" style={{fontSize:9,marginBottom:14,padding:8,borderLeft:"3px solid #F97316",background:"#F8FAFC"}}><strong>General Instructions:</strong> Read all questions carefully. Marks allotted to each question are shown against it. Answer all questions as instructed in each section.</div>{sections.map(section=><section className="paper-section" key={section.key}><div className="paper-section-heading"><span>{section.title}</span><span>{sectionMarks(section)} Marks</span></div><div className="paper-section-description" style={{fontSize:9,color:"#64748B",fontStyle:"italic",margin:"6px 0 8px"}}>{section.description}</div>{section.questions.map(q=><PaperQuestionPreview key={q.id} q={q} index={globalNumber++}/>)}</section>)}</article></div>{editable&&<div style={{marginTop:12}}><QuestionEditor questions={questions} onChange={setQuestions}/></div>}</div></div></div>;
}

function PaperQuestionPreview({q,index}:{q:QuestionItem;index:number;key?:string}) {
  const marks=<span className="marks">[{q.marks}]</span>;
  if(q.type==="MCQ") return <div className="paper-question">{marks}<strong>{index}. </strong>{q.question}<div className="paper-options">{(q.options??[]).map((o,j)=><div key={j}>{String.fromCharCode(65+j)}. {o}</div>)}</div></div>;
  if(q.type==="FILL_BLANK"){const items=getFillBlankItems(q);return <div className="paper-question">{marks}<strong>{index}. </strong>{items.map((item,j)=><div className="paper-fill-statement" key={item.id}><strong>{String.fromCharCode(97+j)}. </strong>{renderFillSentence(item.sentence,[item.blank])}</div>)}</div>}
  if(q.type==="MATCH_COLUMNS") return <div className="paper-question">{marks}<strong>{index}. </strong>{q.question||"Match the following"}<MatchColumnsPreview q={q}/></div>;
  if(q.type==="TRUE_FALSE") return <div className="paper-question">{marks}<strong>{index}. </strong>{q.question || "True / False"}<div className="paper-tf-list">{(q.statements??[]).length?(q.statements??[]).map((statement,j)=><div className="paper-tf-row" key={`${q.id}-preview-${j}`}><span>{j+1}.</span><span>{statement}</span><span className="paper-tf-answer">True / False</span></div>):<div className="paper-tf-row"><span>1.</span><span>Write True or False.</span><span className="paper-tf-answer">True / False</span></div>}</div></div>;
  if(q.type==="IMAGE_BASED") return <div className="paper-question">{marks}<strong>{index}. </strong>{q.imageDataUrl&&<img className="paper-image" src={q.imageDataUrl} alt={q.imageName||"Question"}/>}<div>{q.imageInstruction||q.question||"Describe the image and explain what you see."}</div></div>;
  if(q.type==="UNSEEN_PASSAGE") return <div className="paper-question">{marks}<strong>{index}. </strong>Read the following passage and answer the questions.<div className="paper-passage">{q.passage||""}</div>{(q.passageQuestions??[]).map((pq,j)=><div key={pq.id} style={{marginTop:6}}><strong>{String.fromCharCode(97+j)}. </strong>{pq.question}<span style={{float:"right",fontWeight:800}}>[{pq.marks}]</span></div>)}</div>;
  return <div className="paper-question">{marks}<strong>{index}. </strong>{q.question||"Untitled question"}</div>;
}

function renderFillSentence(sentence:string,answers:string[]) {
  let remaining = sentence;
  const parts: ReactNode[] = [];
  const escapedAnswers = answers.filter(Boolean);
  escapedAnswers.forEach((answer,index)=>{
    const at=remaining.indexOf(answer);
    if(at<0)return;
    const before=remaining.slice(0,at); if(before)parts.push(<span key={`b-${index}`}>{before}</span>);
    parts.push(<span key={`blank-${index}`} style={{display:"inline-block",minWidth:70,borderBottom:"1px solid #111827",margin:"0 3px"}}/>);
    remaining=remaining.slice(at+answer.length);
  });
  if(remaining)parts.push(<span key="tail">{remaining}</span>);
  return parts;
}

function MatchColumnsPreview({q}:{q:QuestionItem}) { const a=q.columnA??[]; const b=q.columnB??[]; const count=Math.max(a.length,b.length); return <div className="match-editor-grid" style={{marginTop:8}}><div>{Array.from({length:count},(_,i)=><div className="match-row" key={`a-${i}`}><strong>{i+1}.</strong><span>{a[i]?.text||"—"}</span></div>)}</div><div>{Array.from({length:count},(_,i)=><div className="match-row" key={`b-${i}`}><strong>{String.fromCharCode(97+i)}.</strong><span>{b[i]?.text||"—"}</span></div>)}</div></div>; }

export function PlannerHistoryTable({ records, onView, onEdit, onDownload }: { records:PlannerRecord[]; onView:(r:PlannerRecord)=>void; onEdit:(r:PlannerRecord)=>void; onDownload:(r:PlannerRecord)=>void }) {
  return <div className="planner-table-scroll"><table className="planner-table"><thead><tr><th>Publish Date</th><th>Class</th><th>Section</th><th>Subject</th><th>Status</th><th>Review note</th><th>View</th><th>PDF</th><th>Edit</th></tr></thead><tbody>{records.length===0?<tr><td colSpan={9} style={{textAlign:"center",color:"#94A3B8",padding:18}}>No planners submitted yet.</td></tr>:records.map(r=><tr key={r.id}><td>{fmtDate(r.submittedAt||r.createdAt)}</td><td>{r.className}</td><td>{r.sectionName}</td><td>{r.subjectName}</td><td><span className={`planner-status status-${r.status}`}>{r.status}</span></td><td>{r.reviewNote || "—"}</td><td><button className="planner-btn" onClick={()=>onView(r)}>View</button></td><td><button className="planner-btn" onClick={()=>onDownload(r)}>PDF</button></td><td><button className="planner-btn" onClick={()=>onEdit(r)}>Edit</button></td></tr>)}</tbody></table></div>;
}

export function AuditGroups({ records, onView, onEdit, onReview }: { records:PlannerRecord[]; onView:(r:PlannerRecord)=>void; onEdit:(r:PlannerRecord)=>void; onReview:(r:PlannerRecord,status:"APPROVED"|"REJECTED")=>void }) {
  const groups=useMemo(()=>{const m=new Map<string,PlannerRecord[]>();records.forEach(r=>m.set(r.teacherUuid,[...(m.get(r.teacherUuid)??[]),r]));return Array.from(m.entries()).map(([teacherUuid,items])=>({teacherUuid,teacherName:items[0]?.teacherName??"Teacher",items}));},[records]);
  return <div>{groups.length===0?<div className="planner-section" style={{textAlign:"center",color:"#94A3B8",fontSize:11}}>No teacher submissions found for this school.</div>:groups.map(g=><section className="teacher-audit-group" key={g.teacherUuid}><div className="teacher-audit-head"><div><div className="teacher-name">{g.teacherName}</div><div className="teacher-sub">{g.items.length} submission{g.items.length===1?"":"s"} · {Array.from(new Set(g.items.map(x=>`${x.className} · ${x.sectionName}`))).join(" · ")}</div></div><span className="planner-status status-SUBMITTED">TEACHER LEDGER</span></div><PlannerTable records={g.items} onView={onView} onEdit={onEdit} onReview={onReview}/></section>)}</div>;
}

function PlannerTable({records,onView,onEdit,onReview}:{records:PlannerRecord[];onView:(r:PlannerRecord)=>void;onEdit:(r:PlannerRecord)=>void;onReview:(r:PlannerRecord,s:"APPROVED"|"REJECTED")=>void}){return <div className="planner-table-scroll"><table className="planner-table"><thead><tr><th>Submission</th><th>Class</th><th>Section</th><th>Subject</th><th>Status</th><th>Review note</th><th>View</th><th>Edit</th><th>Review</th></tr></thead><tbody>{records.map(r=><tr key={r.id}><td>{fmtDate(r.submittedAt||r.createdAt)}</td><td>{r.className}</td><td>{r.sectionName}</td><td>{r.subjectName}</td><td><span className={`planner-status status-${r.status}`}>{r.status}</span></td><td>{r.reviewNote || "—"}</td><td><button className="planner-btn" onClick={()=>onView(r)}>View</button></td><td><button className="planner-btn" onClick={()=>onEdit(r)}>Edit</button></td><td><div className="planner-actions"><button className="planner-btn success" onClick={()=>onReview(r,"APPROVED")}>Approve</button><button className="planner-btn danger" onClick={()=>onReview(r,"REJECTED")}>Reject</button></div></td></tr>)}</tbody></table></div>}

export function PlannerPageFrame({ title, eyebrow, copy, children }: { title:string;eyebrow:string;copy:string;children:ReactNode }) { return <main className="planner-page"><style>{plannerStyles}</style><div className="planner-shell"><section className="planner-hero"><div className="planner-eyebrow">{eyebrow}</div><h1 className="planner-title">{title}</h1><p className="planner-copy">{copy}</p></section>{children}</div></main>; }
