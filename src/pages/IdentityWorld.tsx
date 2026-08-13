import React, { useEffect, useMemo, useState } from "react";
import "../styles/identityWorldNavigation.css";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingCTA from "../components/common/LandingCTA";
import LandingFooter from "../components/common/LandingFooter";

import IdentityWorldHome from "./identityWorld/IdentityWorldHome";
import SchoolsPage from "./identityWorld/SchoolsPage";
import PartnersPage from "./identityWorld/PartnersPage";
import HPCPage from "./identityWorld/HPCPage";
import RecognitionPage from "./identityWorld/RecognitionPage";
import GrowthPage from "./identityWorld/GrowthPage";
import AcademicIntelligencePage from "./identityWorld/AcademicIntelligencePage";
import FounderPage from "./identityWorld/FounderPage";
import TestimonialsPage from "./identityWorld/TestimonialsPage";
import MarketplacePage from "./identityWorld/MarketplacePage";
import ConsultationPage from "./identityWorld/ConsultationPage";
import TeacherAnalyticsPage from "./identityWorld/TeacherAnalyticsPage";
import SchoolAnalyticsPage from "./identityWorld/SchoolAnalyticsPage";
import StudentPortfolioPage from "./identityWorld/StudentPortfolioPage";
import NEPSkillsPage from "./identityWorld/NEPSkillsPage";
import CompetitionsPage from "./identityWorld/CompetitionsPage";
import StarPerformerPage from "./identityWorld/StarPerformerPage";
import PlansPage from "./identityWorld/PlansPage";
import FAQPage from "./identityWorld/FAQPage";
import TrustCenterPage from "./identityWorld/TrustCenterPage";
import ResourcesPage from "./identityWorld/ResourcesPage";
import BlogsPage from "./identityWorld/BlogsPage";
import ContactCenterPage from "./identityWorld/ContactCenterPage";
import PlatformIntelligenceSection from "./identityWorld/PlatformIntelligenceSection";
import RequestDemoPage from "./identityWorld/RequestDemoPage";

interface Props {
  onContinue: () => void;
}

type PublicPage =
  | "home"
  | "academic-intelligence"
  | "schools"
  | "partners"
  | "hpc"
  | "recognition"
  | "growth"
  | "founder"
  | "testimonials"
  | "marketplace"
  | "consultation"
  | "teacher-analytics"
  | "school-analytics"
  | "student-portfolio"
  | "nep-skills"
  | "competitions"
  | "star-performer"
  | "plans"
  | "faq"
  | "trust"
  | "resources"
  | "blogs"
  | "contact"
  | "request-demo";

const VALID_PAGES = new Set<PublicPage>([
  "home",
  "academic-intelligence",
  "schools",
  "partners",
  "hpc",
  "recognition",
  "growth",
  "founder",
  "testimonials",
  "marketplace",
  "consultation",
  "teacher-analytics",
  "school-analytics",
  "student-portfolio",
  "nep-skills",
  "competitions",
  "star-performer",
  "plans",
  "faq",
  "trust",
  "resources",
  "blogs",
  "contact",
  "request-demo",
]);

function readPageFromHash(): PublicPage {
  const raw = window.location.hash.replace(/^#/, "").trim();
  if (!raw || raw === "hero") return "home";
  return VALID_PAGES.has(raw as PublicPage) ? (raw as PublicPage) : "home";
}

export default function IdentityWorld({ onContinue }: Props) {
  const [page, setPage] = useState<PublicPage>(() =>
    typeof window === "undefined" ? "home" : readPageFromHash()
  );

  useEffect(() => {
    const onHash = () => {
      setPage(readPageFromHash());
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.title =
      page === "home"
        ? "Talent Passport | Identity World"
        : `Talent Passport | ${page.split("-").map(
            w => w[0].toUpperCase() + w.slice(1)
          ).join(" ")}`;
  }, [page]);

  const content = useMemo(() => {
    switch (page) {
      case "home":
        return (
          <>
            <IdentityWorldHome onContinue={onContinue} />
            <PlatformIntelligenceSection />
          </>
        );
      case "academic-intelligence": return <AcademicIntelligencePage />;
      case "schools": return <SchoolsPage />;
      case "partners": return <PartnersPage />;
      case "hpc": return <HPCPage />;
      case "recognition": return <RecognitionPage />;
      case "growth": return <GrowthPage />;
      case "founder": return <FounderPage />;
      case "testimonials": return <TestimonialsPage />;
      case "marketplace": return <MarketplacePage />;
      case "consultation": return <ConsultationPage />;
      case "teacher-analytics": return <TeacherAnalyticsPage />;
      case "school-analytics": return <SchoolAnalyticsPage />;
      case "student-portfolio": return <StudentPortfolioPage />;
      case "nep-skills": return <NEPSkillsPage />;
      case "competitions": return <CompetitionsPage />;
      case "star-performer": return <StarPerformerPage />;
      case "plans": return <PlansPage />;
      case "faq": return <FAQPage />;
      case "trust": return <TrustCenterPage />;
      case "resources": return <ResourcesPage />;
      case "blogs": return <BlogsPage />;
      case "contact": return <ContactCenterPage />;
      case "request-demo": return <RequestDemoPage />;
      default: return <IdentityWorldHome onContinue={onContinue} />;
    }
  }, [page, onContinue]);

  return (
    <main className="landing-shell iw-public-shell">
      <LandingNavbar onPortalClick={onContinue} />
      <div className="iw-public-content">{content}</div>
      {page !== "home" && <LandingCTA onContinue={onContinue} />}
      <LandingFooter onContinue={onContinue} />
    </main>
  );
}
