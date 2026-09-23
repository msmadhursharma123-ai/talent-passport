import { useEffect, useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { jsPDF } from "jspdf";
import { BookOpen, CheckCircle2, ChevronDown, Download, Search, X } from "lucide-react";
import { registerAndroidBackHandler } from "../../mobile/androidBackNavigation";
import type { PortalManualRole, PortalManualSection } from "./manualTypes";
import { STUDENT_MANUAL } from "./studentManual";
import { TEACHER_MANUAL } from "./teacherManual";
import { SCHOOL_ADMIN_MANUAL } from "./schoolAdminManual";
import { PARTNER_MANUAL } from "./partnerManual";
import "./portalManual.css";

interface Props {
  role: PortalManualRole;
  activePage?: string;
}

const CONTENT = { student: STUDENT_MANUAL, teacher: TEACHER_MANUAL, school: SCHOOL_ADMIN_MANUAL, partner: PARTNER_MANUAL } as const;
const ACTIVE_HINTS: Record<PortalManualRole, Record<string, string[]>> = {
  student: {
    dashboard: ["dashboard"],
    "daily-log": ["daily-log", "daily-log-dialog"],
    "teaching-journal": ["teaching-journal"],
    "exam-preparation": ["exam-preparation"],
    "my-classroom": ["my-classroom", "topics-popup"],
    "parents-teacher-meeting": ["ptm"],
    planners: ["lesson-planner"],
    "worksheet-maker": ["worksheet-planner"],
    "unit-test-planner": ["unit-test-planner"],
    "exam-paper-planner": ["exam-paper-planner"],
    "star-performers": ["star-performers"],
  },
  teacher: {
    dashboard: ["dashboard"],
    "daily-log": ["daily-log", "daily-log-dialog"],
    "teaching-journal": ["teaching-journal"],
    "exam-preparation": ["exam-preparation"],
    "my-classroom": ["my-classroom", "topics-popup"],
    "parents-teacher-meeting": ["ptm"],
    planners: ["lesson-planner"],
    "worksheet-maker": ["worksheet-planner"],
    "unit-test-planner": ["unit-test-planner"],
    "exam-paper-planner": ["exam-paper-planner"],
    "star-performers": ["star-performers"],
  },
  school: {
    overview: ["overview"],
    teachers: ["teachers"],
    classrooms: ["classrooms"],
    academic: ["academic"],
    "lesson-plans": ["lesson-plans"],
    "unit-tests": ["unit-tests"],
    "exam-papers": ["exam-papers"],
    worksheets: ["worksheets"],
    "star-performers": ["star-performers"],
  },
  partner: {
    "talent-discovery": [
      "talent-discovery",
      "scholarship-offers",
      "workshop-offers",
      "contact-request",
      "offer-details",
      "edit-offer",
    ],
    "incoming-requests": ["incoming-requests"],
    "lead-pipeline": ["lead-pipeline"],
  },
};

export default function PortalManual({ role, activePage }: Props) {
  const content = CONTENT[role];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(content.sections[0]?.id ?? "");
  const [mobileListOpen, setMobileListOpen] = useState(false);

  useEffect(() => {
    const hints = activePage ? ACTIVE_HINTS[role]?.[activePage] ?? [] : [];
    const match = hints.find((id) => content.sections.some((section) => section.id === id));
    if (match) setActiveId(match);
  }, [activePage, content]);

  useEffect(() => {
    if (!open) return;
    const unregister = registerAndroidBackHandler(() => { setOpen(false); return true; }, 1000);
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { unregister(); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return content.sections;
    return content.sections.filter((s) => [s.title,s.summary,...(s.steps ?? []),...(s.bullets ?? []),s.note ?? ""].join(" ").toLowerCase().includes(q));
  }, [content, query]);

  const activeSection = content.sections.find((s) => s.id === activeId) ?? filtered[0] ?? content.sections[0];

  function selectSection(section: PortalManualSection) {
    setActiveId(section.id); setMobileListOpen(false);
  }

  async function downloadPdf() {
    if (!activeSection) return;
    const doc = new jsPDF({ unit:"mm", format:"a4" });
    const margin = 14;
    const width = 210 - margin * 2;
    let y = 18;
    doc.setFont("helvetica","bold"); doc.setFontSize(18); doc.text(`${content.label} — User Manual`, margin, y); y += 9;
    doc.setFont("helvetica","bold"); doc.setFontSize(14); doc.text(activeSection.title, margin, y); y += 7;
    doc.setFont("helvetica","normal"); doc.setFontSize(9);
    const lines = (text:string, size=9) => { doc.setFontSize(size); const wrapped = doc.splitTextToSize(text, width); for (const line of wrapped) { if (y > 280) { doc.addPage(); y = 18; } doc.text(line, margin, y); y += 5; } y += 2; };
    lines(activeSection.summary);
    if (activeSection.steps?.length) { doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.text("Steps", margin, y); y += 6; activeSection.steps.forEach((step,i)=>lines(`${i+1}. ${step}`)); }
    if (activeSection.bullets?.length) { doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.text("Remember", margin, y); y += 6; activeSection.bullets.forEach((b)=>lines(`• ${b}`)); }
    if (activeSection.note) { doc.setFont("helvetica","italic"); lines(activeSection.note); }
    const filename = `Talent-Passport-${role}-${activeSection.id}-Manual.pdf`;
    try {
      if (Capacitor.isNativePlatform()) {
        const base64 = doc.output("datauristring").split(",")[1] ?? "";
        const saved = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Documents, recursive: true });
        await Share.share({ title: activeSection.title, text:"Talent Passport User Manual", url:saved.uri, dialogTitle:"Save or share manual" });
      } else {
        doc.save(filename);
      }
    } catch (error) {
      console.error("Unable to download portal manual PDF", error);
      doc.save(filename);
    }
  }

  return <>
    <button type="button" className={`tp-portal-manual-bookmark tp-manual-theme-${role}`} onClick={()=>setOpen(true)} aria-label={`Open ${content.label} user manual`}>
      <BookOpen size={15} aria-hidden="true" /><span>Manual</span>
    </button>
    {open ? <div className={`tp-portal-manual-overlay tp-manual-theme-${role}`} role="dialog" aria-modal="true" aria-label={`${content.label} user manual`}>
      <div className="tp-portal-manual-card">
        <header className="tp-portal-manual-header">
          <div className="tp-portal-manual-brand"><span className="tp-portal-manual-brand-icon"><BookOpen size={18}/></span><div><strong>{content.label}</strong><small>User Manual</small></div></div>
          <div className="tp-portal-manual-actions"><button type="button" onClick={()=>void downloadPdf()} title="Download this section as PDF"><Download size={16}/><span>PDF</span></button><button type="button" onClick={()=>setOpen(false)} aria-label="Close manual"><X size={18}/></button></div>
        </header>
        <div className="tp-portal-manual-toolbar"><div className="tp-portal-manual-search"><Search size={15}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search this manual" aria-label="Search this manual" /></div><button type="button" className="tp-portal-manual-mobile-trigger" onClick={()=>setMobileListOpen(v=>!v)}>{activeSection?.title ?? "Choose a topic"}<ChevronDown size={15}/></button></div>
        {mobileListOpen ? <div className="tp-portal-manual-mobile-list">{filtered.map(s=><button key={s.id} className={s.id===activeId?"active":""} onClick={()=>selectSection(s)}>{s.title}</button>)}</div> : null}
        <div className="tp-portal-manual-body">
          <aside className="tp-portal-manual-sidebar"><div className="tp-portal-manual-sidebar-label">{role === "student" ? "ACADEMICS" : "MANUAL"}</div>{filtered.map(s=><button type="button" key={s.id} className={s.id===activeId?"active":""} onClick={()=>selectSection(s)}>{s.title}</button>)}</aside>
          <main className="tp-portal-manual-main">
            <div className="tp-portal-manual-intro"><div className="tp-portal-manual-eyebrow">HOW TO USE THIS PORTAL</div><h1>{content.label}</h1><p>{content.intro}</p></div>
            {activeSection ? <article className="tp-portal-manual-section"><div className="tp-portal-manual-section-title"><span><CheckCircle2 size={17}/></span><div><h2>{activeSection.title}</h2><p>{activeSection.summary}</p></div></div>{activeSection.steps?.length ? <div className="tp-portal-manual-step-block"><h3>Steps</h3><ol>{activeSection.steps.map((step,i)=><li key={`${activeSection.id}-step-${i}`}><b>{i+1}</b><span>{step}</span></li>)}</ol></div> : null}{activeSection.bullets?.length ? <div className="tp-portal-manual-bullet-block"><h3>Remember</h3><ul>{activeSection.bullets.map((b)=><li key={b}>{b}</li>)}</ul></div> : null}{activeSection.note ? <div className="tp-portal-manual-note">{activeSection.note}</div> : null}</article> : <div className="tp-portal-manual-empty">No matching topic. Try another word.</div>}
          </main>
        </div>
      </div>
    </div> : null}
  </>;
}
