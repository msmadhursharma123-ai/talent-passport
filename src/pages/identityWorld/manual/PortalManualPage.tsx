import React, { useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Download,
  KeyRound,
  LifeBuoy,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import teacherOnboardingPdf from "../../../assets/manual/teacher-first-login-to-first-daily-log.pdf";
import studentOnboardingPdf from "../../../assets/manual/student-first-login-to-first-feedback.pdf";
import {
  MANUAL_ACCOUNT_SECTIONS,
  MANUAL_OVERVIEW_SECTIONS,
  MANUAL_ROLE_CONTENT,
  type ManualRole,
  type ManualSection,
} from "./portalManualContent";
import "./portalManual.css";

interface Props {
  onBack: () => void;
  onOpenPortal: () => void;
}

const tabs: { id: ManualRole; label: string }[] = [
  { id: "overview", label: "Start Here" },
  { id: "student", label: "Student" },
  { id: "teacher", label: "Teacher" },
  { id: "school", label: "School Admin" },
  { id: "parent", label: "Parent / Family" },
  { id: "partner", label: "Partner" },
  { id: "admin", label: "Platform Admin" },
  { id: "account", label: "Account & Password" },
];

function SectionCard({ section }: { section: ManualSection }) {
  return (
    <article className="tp-manual-section-card">
      <div className="tp-manual-section-title-row">
        <div className="tp-manual-section-icon" aria-hidden="true">
          <CheckCircle2 size={16} />
        </div>
        <div>
          <h3>{section.title}</h3>
          <p>{section.summary}</p>
        </div>
      </div>

      {section.steps?.length ? (
        <ol className="tp-manual-steps">
          {section.steps.map((step, index) => (
            <li key={`${section.title}-step-${index}`}>
              <span>{index + 1}</span>
              <div>{step}</div>
            </li>
          ))}
        </ol>
      ) : null}

      {section.bullets?.length ? (
        <ul className="tp-manual-bullets">
          {section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function PortalManualPage({ onBack, onOpenPortal }: Props) {
  const [activeRole, setActiveRole] = useState<ManualRole>("overview");
  const [query, setQuery] = useState("");
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);

  const role = useMemo(
    () => MANUAL_ROLE_CONTENT.find((item) => item.id === activeRole),
    [activeRole]
  );

  const sections = useMemo(() => {
    if (activeRole === "overview") return MANUAL_OVERVIEW_SECTIONS;
    if (activeRole === "account") return MANUAL_ACCOUNT_SECTIONS;
    return role?.sections ?? [];
  }, [activeRole, role]);

  const filteredSections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return sections;

    return sections.filter((section) =>
      [
        section.title,
        section.summary,
        ...(section.steps ?? []),
        ...(section.bullets ?? []),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [query, sections]);

  const activeLabel = tabs.find((tab) => tab.id === activeRole)?.label ?? "Start Here";

  const downloadGuide = async (url: string, filename: string) => {
    try {
      if (Capacitor.isNativePlatform()) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Unable to load PDF (${response.status})`);
        const bytes = new Uint8Array(await response.arrayBuffer());
        let binary = "";
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
        }
        const base64 = btoa(binary);
        const saved = await Filesystem.writeFile({
          path: filename,
          data: base64,
          directory: Directory.Documents,
          recursive: true,
        });
        await Share.share({
          title: filename.replace(/\.pdf$/i, ""),
          text: "Talent Passport onboarding guide",
          url: saved.uri,
          dialogTitle: "Save or share onboarding guide",
        });
        return;
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Unable to download onboarding guide", error);
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const selectTab = (id: ManualRole) => {
    setActiveRole(id);
    setQuery("");
    setMobileTabsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="tp-manual-page">
      <section className="tp-manual-hero">
        <div className="tp-manual-hero-orb tp-manual-hero-orb-one" />
        <div className="tp-manual-hero-orb tp-manual-hero-orb-two" />

        <div className="tp-manual-container">
          <div className="tp-manual-topbar">
            <button className="tp-manual-back" type="button" onClick={onBack}>
              <ArrowLeft size={16} />
              Back to Talent Passport
            </button>
            <button className="tp-manual-portal-button" type="button" onClick={onOpenPortal}>
              Open Portal
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="tp-manual-hero-grid">
            <div>
              <div className="tp-manual-eyebrow">
                <BookOpen size={13} /> TALENT PASSPORT USER MANUAL
              </div>
              <h1>Everything you need to get started.</h1>
              <p>
                A simple, role-based guide to account setup, first use, password recovery and the features available across the Talent Passport ecosystem.
              </p>
              <div className="tp-manual-hero-pills">
                <span><ShieldCheck size={14} /> Self-service guidance</span>
                <span><Users size={14} /> Role-based user views</span>
                <span><Sparkles size={14} /> First-use checklists</span>
              </div>
            </div>

            <div className="tp-manual-hero-card">
              <div className="tp-manual-hero-card-icon"><BookOpen size={22} /></div>
              <strong>Choose your role</strong>
              <span>Use the tabs below to see only the instructions relevant to you.</span>
              <div className="tp-manual-mini-list">
                {MANUAL_ROLE_CONTENT.slice(0, 4).map((item) => (
                  <button key={item.id} type="button" onClick={() => selectTab(item.id)}>
                    <span>{item.icon}</span>
                    {item.label}
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="tp-manual-container tp-manual-body">
        <div className="tp-manual-mobile-tab-wrap">
          <button
            type="button"
            className="tp-manual-mobile-tab-trigger"
            onClick={() => setMobileTabsOpen((value) => !value)}
            aria-expanded={mobileTabsOpen}
          >
            <span>{activeLabel}</span>
            <ChevronDown size={17} className={mobileTabsOpen ? "is-open" : ""} />
          </button>
          {mobileTabsOpen ? (
            <div className="tp-manual-mobile-tab-menu">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={tab.id === activeRole ? "active" : ""}
                  onClick={() => selectTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="tp-manual-sidebar">
          <div className="tp-manual-sidebar-label">MANUAL</div>
          <nav aria-label="Manual sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={tab.id === activeRole ? "active" : ""}
                onClick={() => selectTab(tab.id)}
              >
                <span>{tab.label}</span>
                <ArrowRight size={15} />
              </button>
            ))}
          </nav>

          <div className="tp-manual-sidebar-help">
            <LifeBuoy size={18} />
            <strong>Need a quick answer?</strong>
            <span>Search this manual for a keyword such as password, feedback, daily log or marketplace.</span>
          </div>
        </aside>

        <section className="tp-manual-content" aria-live="polite">
          <div className="tp-manual-content-heading">
            <div>
              <div className="tp-manual-content-kicker">{activeLabel}</div>
              <h2>
                {activeRole === "overview"
                  ? "Start with the essentials"
                  : activeRole === "account"
                    ? "Account setup & password help"
                    : role?.label}
              </h2>
              <p>
                {activeRole === "overview"
                  ? "Use this page as your first stop before entering the portal."
                  : activeRole === "account"
                    ? "Common account questions and the safest way to use the existing recovery flow."
                    : role?.intro}
              </p>
            </div>

            <label className="tp-manual-search">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this manual"
                aria-label="Search this manual"
              />
            </label>
          </div>

          <div className="tp-manual-feature-strip">
            <div>
              <KeyRound size={17} />
              <span><strong>Account help</strong>Password and first-login guidance</span>
            </div>
            <div>
              <BookOpen size={17} />
              <span><strong>Role guide</strong>Features explained in plain language</span>
            </div>
            <div>
              <ShieldCheck size={17} />
              <span><strong>Protected actions</strong>Consent and verification explained</span>
            </div>
          </div>

          {filteredSections.length ? (
            <div className="tp-manual-section-list">
              {filteredSections.map((section) => (
                <SectionCard key={section.title} section={section} />
              ))}
            </div>
          ) : (
            <div className="tp-manual-empty">
              <Search size={22} />
              <strong>No matching guidance found.</strong>
              <span>Try a simpler search such as “password”, “feedback”, “daily log” or “account”.</span>
            </div>
          )}

          <div className="tp-manual-pdf-block">
            <div className="tp-manual-pdf-heading">
              <div className="tp-manual-pdf-icon"><Download size={18} /></div>
              <div>
                <div className="tp-manual-content-kicker">DOWNLOADABLE ONBOARDING GUIDES</div>
                <h3>Keep a step-by-step copy for first use.</h3>
              </div>
            </div>
            <div className="tp-manual-pdf-grid">
              <button type="button" className="tp-manual-pdf-card" onClick={() => downloadGuide(teacherOnboardingPdf, "Talent-Passport-Teacher-Onboarding-Manual.pdf")}>
                <span className="tp-manual-pdf-role">TEACHER</span>
                <strong>First login → first Daily Log</strong>
                <span>Registration, verification, profile, academic questionnaire and first Daily Log checklist.</span>
                <em>Download PDF <ArrowRight size={14} /></em>
              </button>
              <button type="button" className="tp-manual-pdf-card" onClick={() => downloadGuide(studentOnboardingPdf, "Talent-Passport-Student-Onboarding-Manual.pdf")}>
                <span className="tp-manual-pdf-role">STUDENT</span>
                <strong>First login → first feedback</strong>
                <span>Registration, profile, parent verification, onboarding and first daily feedback checklist.</span>
                <em>Download PDF <ArrowRight size={14} /></em>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
