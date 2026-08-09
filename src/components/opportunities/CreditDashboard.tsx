
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import {
  getStudentCompetitionCount
} from "../../data/studentRepository";

import {
  getStudentAchievements
} from "../../data/timelineRepository";

import {
  getStudentPerformances,
  getStudentProjects,
  getStudentSkills
} from "../../data/studentRepository";

import {
  getStudentDailyLectureLogs
} from "../../data/studentGrowthPlanRepository";

import {
  getStudentFeedbackHistory
} from "../../data/studentDailyFeedbackRepository";

import {
  fetchConsultationPartners,
  fetchStudentConsultationHistory
} from "../../data/consultationRepository";

import {
  syncStudentWallet
} from "../../services/walletService";

import {
  getStudentWallet,
  updateStudentWallet
} from "../../data/walletRepository";

import {
  bookConsultation
} from "../../services/consultationService";

import {
  getStudentConsultationSpentCredits
} from "../../data/creditTransactionRepository";

import {
  calculateCompetitionCredits,
  calculateAchievementCredits,
  calculatePortfolioCredits,
  calculateDailyFeedbackCreditSummary
} from "../../data/creditEngine";

import {
  getCurrentStudent,
  getMasterStudentId,
  requireIdentity
} from "../../services/identityService";

export default function CreditDashboard() {

const [viewportWidth, setViewportWidth] =
  useState(() =>
    typeof window !== "undefined"
      ? window.innerWidth
      : 1440
  );

useEffect(() => {
  if (typeof window === "undefined") return;

  const handleResize = () =>
    setViewportWidth(window.innerWidth);

  handleResize();

  window.addEventListener(
    "resize",
    handleResize
  );

  return () =>
    window.removeEventListener(
      "resize",
      handleResize
    );
}, []);

const isMobile = viewportWidth < 640;
const isTablet =
  viewportWidth >= 640 &&
  viewportWidth < 1100;
const isCompact = viewportWidth < 1100;

const responsive = {
  page: {
    padding: isMobile
      ? 0
      : isTablet
      ? 4
      : 40,
    borderRadius: isMobile
      ? 20
      : isTablet
      ? 26
      : 32
  },
  hero: {
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    padding: isMobile
      ? "16px 14px"
      : isTablet
      ? "20px 18px"
      : "38px 42px",
    borderRadius: isMobile
      ? 20
      : isTablet
      ? 24
      : 28
  },
  heroTitle: {
    fontSize: isMobile
      ? 21
      : isTablet
      ? 25
      : 38,
    lineHeight: isMobile
      ? 1.12
      : 1.15
  },
  marketplaceTitle: {
    fontSize: isMobile
      ? 23
      : isTablet
      ? 27
      : 34
  },
  section: {
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    padding: isMobile
      ? "15px 12px"
      : isTablet
      ? "19px 16px"
      : "26px 28px",
    borderRadius: isMobile
      ? 20
      : 24
  },
  sectionHeader: {
    flexDirection:
      isMobile
        ? "column"
        : "row",
    alignItems:
      isMobile
        ? "flex-start"
        : "flex-end"
  },
  threeColumns: {
    gridTemplateColumns:
      isCompact
        ? "repeat(2, minmax(0, 1fr))"
        : "repeat(3, minmax(0, 1fr))"
  },
  twoColumns: {
    gridTemplateColumns:
      isMobile
        ? "1fr"
        : "repeat(2, minmax(0, 1fr))"
  },
  formColumns: {
    gridTemplateColumns:
      isMobile
        ? "1fr"
        : "1fr 1fr"
  },
  cardGrid: {
    gridTemplateColumns:
      viewportWidth < 1024
        ? "none"
        : "repeat(auto-fit,minmax(300px,1fr))"
  },
  expertGrid: {
    gridTemplateColumns:
      viewportWidth < 1024
        ? "none"
        : "repeat(auto-fit,minmax(320px,1fr))"
  },
  compactThree: {
    gridTemplateColumns:
      isMobile
        ? "repeat(3, minmax(0, 1fr))"
        : "repeat(3, minmax(0, 1fr))"
  },
  stackRow: {
    flexDirection:
      isMobile
        ? "column"
        : "row",
    alignItems:
      isMobile
        ? "stretch"
        : "center"
  },
  fullButton: {
    width: isMobile
      ? "100%"
      : undefined,
    minWidth: isMobile
      ? 0
      : 220
  },
  input: {
    boxSizing: "border-box"
  },
  visual: {
    display:
      isCompact
        ? "none"
        : "flex",
    right:
      isTablet
        ? 28
        : 52
  }
} satisfies Record<string, CSSProperties>;

const [competitionCredits,
  setCompetitionCredits] =
  useState(0);

const [achievementCredits,
  setAchievementCredits] =
  useState(0);

const [portfolioCredits,
  setPortfolioCredits] =
  useState(0);

const [dailyFeedbackEarnedCredits,
  setDailyFeedbackEarnedCredits] =
  useState(0);

const [dailyFeedbackLostCredits,
  setDailyFeedbackLostCredits] =
  useState(0);

const [dailyFeedbackTotalCredits,
  setDailyFeedbackTotalCredits] =
  useState(0);

  const [walletBalance,
  setWalletBalance] =
  useState(0);

const [spentCredits,
  setSpentCredits] =
  useState(0);

const [totalEarnedCredits,
  setTotalEarnedCredits] =
  useState(0);

const [consultationHistory,
  setConsultationHistory] =
  useState<any[]>([]);

const [consultationHistoryLoading,
  setConsultationHistoryLoading] =
  useState(false);

const [bookingLoading,
  setBookingLoading] =
  useState(false);

const [bookingSuccess,
  setBookingSuccess] =
  useState(false);

const [bookingError,
  setBookingError] =
  useState("");

const [bookingResult,
  setBookingResult] =
  useState<any>(null);

const [totalCredits,
  setTotalCredits] =
  useState(0);

const [selectedCategory, setSelectedCategory] =
  useState<string | null>(null);

const [selectedSkill, setSelectedSkill] =
  useState("");

const [selectedPartner, setSelectedPartner] =
  useState<any>(null);

const [recommendedPartners,
setRecommendedPartners] =
useState<any[]>([]);

const [showPartners,
setShowPartners] =
useState(false);

const [consultationTopic,
setConsultationTopic] =
useState("");

const [loadingPartners, setLoadingPartners] =
  useState(false);

const [
consultationDescription,
setConsultationDescription
] = useState("");

const consultationCost = 60;

const availableCredits = Math.max(0, totalEarnedCredits - spentCredits);

/*
  Credits should only reduce AFTER
  a successful booking.

  Until booking succeeds, remaining
  balance is equal to the current
  wallet balance.
*/
const remainingCredits = availableCredits;

  useEffect(() => {
  loadCredits();
  loadConsultationHistory();
}, []);

const student =
  getCurrentStudent();

async function loadConsultationHistory() {
  const masterStudentId = getMasterStudentId();

  if (!masterStudentId) {
    setConsultationHistory([]);
    return;
  }

  try {
    setConsultationHistoryLoading(true);

    const history =
      await fetchStudentConsultationHistory(
        masterStudentId
      );

    setConsultationHistory(
      history ?? []
    );
  } catch (error) {
    console.error(
      "Consultation history load failed",
      error
    );
    setConsultationHistory([]);
  } finally {
    setConsultationHistoryLoading(false);
  }
}

async function loadCredits() {

  const masterStudentId =
    getMasterStudentId();

  if (!masterStudentId)
    return;

  const studentName =
    student?.studentName || "";

const submissionCount =
  await getStudentCompetitionCount();

  const achievements =
   await getStudentAchievements();

  const performances =
    await getStudentPerformances();

  const projects =
   await getStudentProjects();

  const skills =
    await getStudentSkills();

  const [dailyLectureLogs, feedbackHistory] =
    await Promise.all([
      getStudentDailyLectureLogs(),
      getStudentFeedbackHistory()
    ]);

  const now = new Date();

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  const completedLectureLogs =
    (dailyLectureLogs ?? []).filter(
      (log: any) =>
        typeof log.log_date === "string" &&
        log.log_date < today
    );

  const submittedLogIds = new Set(
    (feedbackHistory ?? []).map(
      (feedback: any) => feedback.daily_log_uuid
    )
  );

  const missedFeedbackCount =
    completedLectureLogs.filter(
      (log: any) => !submittedLogIds.has(log.id)
    ).length;

  const dailyFeedback =
    calculateDailyFeedbackCreditSummary(
      (feedbackHistory ?? []).length,
      missedFeedbackCount
    );

  const verifiedCount =
    achievements.filter(
      (a: any) =>
        a.verification_status ===
        "Verified"
    ).length;

const competition =
  calculateCompetitionCredits(
    submissionCount
  );

  const timeline =
    calculateAchievementCredits(
      achievements.length,
      verifiedCount
    );

  const portfolio =
    calculatePortfolioCredits(
      performances.length,
      projects.length,
      skills.length
    );

  const totalEarnedCredits =
    competition +
    timeline +
    portfolio +
    dailyFeedback.totalCredits;

  setCompetitionCredits(
    competition
  );

  setAchievementCredits(
    timeline
  );

  setPortfolioCredits(
    portfolio
  );

  setDailyFeedbackEarnedCredits(
    dailyFeedback.earnedCredits
  );

  setDailyFeedbackLostCredits(
    dailyFeedback.lostCredits
  );

  setDailyFeedbackTotalCredits(
    dailyFeedback.totalCredits
  );

  setTotalCredits(
    totalEarnedCredits
  );

  setTotalEarnedCredits(
    totalEarnedCredits
  );

  /* ============================================
     Sync Student Wallet
  ============================================ */

  try {

    await syncStudentWallet(

      masterStudentId,

      competition,

      timeline,

      portfolio,

      dailyFeedback.totalCredits

    );

    const wallet =
      await getStudentWallet(
        masterStudentId
      );

    const ledgerSpentCredits =
      await getStudentConsultationSpentCredits(
        masterStudentId
      );

    const resolvedTotalEarned =
      Number(totalEarnedCredits) || 0;

    const resolvedSpentCredits =
      Number(ledgerSpentCredits) ||
      Number(wallet.spent_credits) ||
      0;

    const resolvedAvailableCredits =
      Math.max(
        0,
        resolvedTotalEarned -
          resolvedSpentCredits
      );

    if (
      Number(wallet.spent_credits) !==
        resolvedSpentCredits ||
      Number(wallet.available_credits) !==
        resolvedAvailableCredits ||
      Number(wallet.lifetime_earned) !==
        resolvedTotalEarned
    ) {
      await updateStudentWallet(
        masterStudentId,
        resolvedAvailableCredits,
        resolvedSpentCredits,
        resolvedTotalEarned
      );
    }

    setTotalEarnedCredits(
      resolvedTotalEarned
    );

    setSpentCredits(
      resolvedSpentCredits
    );

    setWalletBalance(
      resolvedAvailableCredits
    );

  } catch (error) {

    console.error(

      "Wallet sync failed",

      error

    );

  }

}

async function loadRecommendedPartners(
  category: string,
  skill: string
) {

  setLoadingPartners(true);

try {

  const partners =
    await fetchConsultationPartners();

  console.log("================================");
  console.log("SELECTED CATEGORY");
  console.log(category);

  console.log("SELECTED SKILL");
  console.log(skill);

  console.log("DATABASE PARTNERS");
  console.dir(partners, { depth: null });

  console.log("================================");

const filteredPartners =
  partners.filter((partner: any) => {

    console.log("---------------------------");

    console.log("PARTNER");
    console.log(partner.institute_name);

    console.log("PARTNER SKILLS");
    console.log(partner.skill_focus);

    console.log("SEARCHING SKILL");
    console.log(skill);

    const partnerSkills =
      partner.skill_focus ?? [];

    const matched =
      partnerSkills.includes(skill);

    console.log("MATCH");
    console.log(matched);

    return matched;

});

const mappedPartners =
filteredPartners.map((partner:any)=>({

    id:
        partner.id,

    partner_id:
        partner.partner_id,

    partner_uuid:
        partner.partner_uuid,

    name:
        partner.institute_name,

    city:
        partner.institute_city,

    credits:60,

    rating:5,

    verified:true,

    experience:0,

    studentsMentored:0,

    consultationDuration:45,

    specializations:
        partner.skill_focus ?? [],

    languages:["English"]

}));

    setRecommendedPartners(
      mappedPartners
    );

    setShowPartners(true);

  } catch (error) {

    console.error(error);

    setRecommendedPartners([]);

  } finally {

    setLoadingPartners(false);

  }

}

  const [creditView, setCreditView] =
    useState<
      "guidelines" | "rewards"
    >("guidelines");

const activitySkills = [
  "Debate",
  "Public Speaking",
  "Dance",
  "Music",
  "Singing",
  "Acting",
  "Drama",
  "Creative Writing",
  "Painting",
  "Art & Craft",
  "Fine Arts",
  "Music Instrument",
  "Coding",
  "Robotics"
];

const careerTopics = [
  "Scholarship Guidance",
  "College Admissions",
  "Portfolio Review",
  "Competition Strategy",
  "Leadership Coaching",
  "Career Planning"
];

const parentTopics = [
  "Confidence Building",
  "Performance Anxiety",
  "Learning Challenges",
  "Screen Addiction",
  "Career Support",
  "Student Motivation"
];

type MarketplacePartner = {
  id: number;
  name: string;
  city: string;
  rating: number;
  credits: number;
  skills: string[];

  experience: number;
  studentsMentored: number;
  languages: string[];
  consultationDuration: number;
  verified: boolean;
};

const demoPartners: MarketplacePartner[] = [
  {
    id: 1,
    name: "Maestro Performing Arts Academy",
    city: "New Delhi",
    rating: 4.9,
    credits: 60,
    skills: [
      "Debate",
      "Public Speaking",
      "Theatre"
    ],
    experience: 12,
    studentsMentored: 1800,
    languages: [
      "English",
      "Hindi"
    ],
    consultationDuration: 45,
    verified: true
  },

  {
    id: 2,
    name: "Future Leaders Institute",
    city: "Gurugram",
    rating: 4.8,
    credits: 60,
    skills: [
      "Leadership",
      "Debate",
      "Communication"
    ],
    experience: 9,
    studentsMentored: 1200,
    languages: [
      "English",
      "Hindi"
    ],
    consultationDuration: 45,
    verified: true
  },

  {
    id: 3,
    name: "Creative Minds Studio",
    city: "Jaipur",
    rating: 4.7,
    credits: 60,
    skills: [
      "Dance",
      "Music",
      "Drama"
    ],
    experience: 15,
    studentsMentored: 2500,
    languages: [
      "English",
      "Hindi"
    ],
    consultationDuration: 60,
    verified: true
  }
];

  return (
 <div
  className="credit-dashboard-page"
  style={{
    background: "#f8f7f4",
    color: "#0F172A",
    padding: responsive.page.padding,
    borderRadius: isCompact ? 0 : responsive.page.borderRadius,
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    minHeight: isCompact ? "auto" : "1100px",
    border: "1px solid #E2E8F0",
    zoom: isMobile ? 0.88 : isTablet ? 0.93 : 1
  }}
>
{/* ==========================================================
    CREDIT DASHBOARD HERO
========================================================== */}

<div
  style={{
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(120deg, #FFFFFF 0%, #FFFFFF 58%, #FFF9F4 82%, #F4F7FF 100%)",
    border: "1px solid #E2E8F0",
    borderRadius: responsive.hero.borderRadius,
    padding: responsive.hero.padding,
    marginBottom: isCompact ? 14 : 30,
    minHeight: isCompact ? 112 : 190,
    display: "flex",
    alignItems: "center",
    boxShadow: "0 10px 30px rgba(15,23,42,.045)"
  }}
>
  {/* DECORATIVE BLUE CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: 250,
      height: 250,
      borderRadius: "50%",
      right: 120,
      bottom: -185,
      background: "rgba(37,99,235,.045)",
      pointerEvents: "none"
    }}
  />

  {/* DECORATIVE ORANGE CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: 270,
      height: 270,
      borderRadius: "50%",
      right: -70,
      top: -105,
      background: "rgba(249,115,22,.055)",
      pointerEvents: "none"
    }}
  />

  {/* SMALL DECORATIVE CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: 125,
      height: 125,
      borderRadius: "50%",
      right: 300,
      top: -75,
      background: "rgba(249,115,22,.03)",
      pointerEvents: "none"
    }}
  />

  {/* LEFT CONTENT */}

  <div
    style={{
      position: "relative",
      zIndex: 2,
      maxWidth: 900
    }}
  >
    {/* EYEBROW */}

    <div
      style={{
        color: "#F97316",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 2.2,
        marginBottom: 13
      }}
    >
      YOUR OPPORTUNITIES ARE IN YOUR HAND
    </div>

    {/* TITLE */}

    <h1
      style={{
        margin: 0,
        color: "#0F172A",
        fontSize: responsive.heroTitle.fontSize,
        lineHeight: responsive.heroTitle.lineHeight,
        fontWeight: 800,
        letterSpacing: "-0.7px"
      }}
    >
      Consultation Garage
    </h1>

    {/* DESCRIPTION */}

    <p
      style={{
        margin: "14px 0 0",
        maxWidth: 720,
        color: "#64748B",
        fontSize: 12,
        lineHeight: 1.65,
        fontWeight: 500
      }}
    >
      Unlock one-on-one guidance from mentors, institutes and professionals across
      academics, performing arts, leadership,
      competitions and career development.
    </p>
  </div>

  {/* RIGHT VISUAL */}

  <div
    style={{
      position: "absolute",
      zIndex: 2,
      right: responsive.visual.right,
      display: responsive.visual.display,
      top: "50%",
      transform: "translateY(-50%)",
      width: 94,
      height: 94,
      borderRadius: "50%",
      background: "rgba(249,115,22,.09)",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "#FFFFFF",
        border: "1px solid #FED7AA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 31,
        boxShadow:
          "0 8px 22px rgba(249,115,22,.10)"
      }}
    >
      🚀
    </div>
  </div>
</div>
 
  
  {/* ==========================================================
    CREDIT INTELLIGENCE
========================================================== */}

<div
  style={{
    marginBottom: isCompact ? 14 : 30,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: responsive.section.borderRadius,
    padding: responsive.section.padding,
    boxShadow: "0 8px 28px rgba(15,23,42,.045)"
  }}
>
  {/* HEADER */}

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: responsive.sectionHeader.alignItems,
      flexDirection: responsive.sectionHeader.flexDirection,
      gap: isCompact ? 8 : 20,
      marginBottom: isCompact ? 10 : 22
    }}
  >
    <div>
      <div
        style={{
          color: "#F97316",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 2,
          marginBottom: 8
        }}
      >
        CREDIT INTELLIGENCE
      </div>

      <h2
        style={{
          margin: 0,
          color: "#0F172A",
          fontSize: isMobile ? 20 : isTablet ? 22 : 24,
          fontWeight: 800,
          lineHeight: 1.2
        }}
      >
        Talent Passport Credit Ledger
      </h2>

      <p
        style={{
          margin: "9px 0 0",
          color: "#64748B",
          fontSize: 14,
          lineHeight: 1.5
        }}
      >
        
      </p>
    </div>

    <div
      style={{
        color: "#94A3B8",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 1,
        whiteSpace: "nowrap"
      }}
    >
      
    </div>
  </div>

  {/* PRIMARY CREDIT CARDS */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns: isCompact
        ? "repeat(3, minmax(0, 1fr))"
        : responsive.threeColumns.gridTemplateColumns,
      gap: isMobile ? 5 : isTablet ? 8 : 14,
      marginBottom: isCompact ? 7 : 14
    }}
  >
    {/* TOTAL EARNED */}

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: isCompact ? 68 : 118,
        background:
          "linear-gradient(135deg, #FFF8EF 0%, #FFFCF7 100%)",
        border: "1px solid #FED7AA",
        borderRadius: 18,
        padding: isMobile ? "8px 7px" : isTablet ? "10px 9px" : "18px 20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: isCompact ? 66 : 100,
          height: isCompact ? 66 : 100,
          borderRadius: "50%",
          right: -34,
          top: -42,
          background: "rgba(249,115,22,.08)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1
        }}
      >
        <div
          style={{
            color: "#9A3412",
            fontSize: isMobile ? 6.5 : isTablet ? 7.5 : 10,
            fontWeight: 800,
            letterSpacing: 0.7
          }}
        >
          TOTAL EARNED CREDITS
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 12,
            color: "#F97316",
            fontSize: isMobile ? 18 : isTablet ? 21 : 32,
            lineHeight: 1,
            fontWeight: 900
          }}
        >
          {totalEarnedCredits}
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 10,
            color: "#475569",
            fontSize: isMobile ? 7 : isTablet ? 8.5 : 11,
            fontWeight: 600,
            lineHeight: 1.4
          }}
        >
          Credits earned across your Talent Passport
        </div>
      </div>
    </div>

    {/* SPENT CREDITS */}

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: isCompact ? 68 : 118,
        background:
          "linear-gradient(135deg, #EFF6FF 0%, #F8FBFF 100%)",
        border: "1px solid #BFDBFE",
        borderRadius: 18,
        padding: isMobile ? "8px 7px" : isTablet ? "10px 9px" : "18px 20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: isCompact ? 66 : 100,
          height: isCompact ? 66 : 100,
          borderRadius: "50%",
          right: -34,
          top: -42,
          background: "rgba(37,99,235,.07)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1
        }}
      >
        <div
          style={{
            color: "#1E40AF",
            fontSize: isMobile ? 6.5 : isTablet ? 7.5 : 10,
            fontWeight: 800,
            letterSpacing: 0.7
          }}
        >
          SPENT CREDITS
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 12,
            color: "#2563EB",
            fontSize: isMobile ? 18 : isTablet ? 21 : 32,
            lineHeight: 1,
            fontWeight: 900
          }}
        >
          {spentCredits}
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 10,
            color: "#475569",
            fontSize: isMobile ? 7 : isTablet ? 8.5 : 11,
            fontWeight: 600,
            lineHeight: 1.4
          }}
        >
          Credits redeemed across opportunities
        </div>
      </div>
    </div>

    {/* AVAILABLE BALANCE */}

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: isCompact ? 68 : 118,
        background:
          "linear-gradient(135deg, #ECFDF5 0%, #F7FFFB 100%)",
        border: "1px solid #BBF7D0",
        borderRadius: 18,
        padding: isMobile ? "8px 7px" : isTablet ? "10px 9px" : "18px 20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: isCompact ? 66 : 100,
          height: isCompact ? 66 : 100,
          borderRadius: "50%",
          right: -34,
          top: -42,
          background: "rgba(22,163,74,.07)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1
        }}
      >
        <div
          style={{
            color: "#166534",
            fontSize: isMobile ? 6.5 : isTablet ? 7.5 : 10,
            fontWeight: 800,
            letterSpacing: 0.7
          }}
        >
          AVAILABLE BALANCE
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 12,
            color: "#16A34A",
            fontSize: isMobile ? 18 : isTablet ? 21 : 32,
            lineHeight: 1,
            fontWeight: 900
          }}
        >
          {availableCredits}
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 10,
            color: "#475569",
            fontSize: isMobile ? 7 : isTablet ? 8.5 : 11,
            fontWeight: 600,
            lineHeight: 1.4
          }}
        >
          Credits currently available to use
        </div>
      </div>
    </div>
  </div>

  {/* CREDIT BREAKDOWN */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns: isCompact
        ? "repeat(2, minmax(0, 1fr))"
        : "repeat(4, minmax(0, 1fr))",
      gap: isMobile ? 5 : isTablet ? 8 : 14
    }}
  >
    {/* COMPETITION */}

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: isCompact ? 64 : 102,
        background:
          "linear-gradient(135deg, #FFF8EF 0%, #FFFCF7 100%)",
        border: "1px solid #FED7AA",
        borderRadius: 18,
        padding: isMobile ? "7px 7px" : isTablet ? "9px 9px" : "17px 20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: isCompact ? 58 : 82,
          height: isCompact ? 58 : 82,
          borderRadius: "50%",
          right: -26,
          top: -34,
          background: "rgba(249,115,22,.07)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1
        }}
      >
        <div
          style={{
            color: "#9A3412",
            fontSize: isMobile ? 6.5 : isTablet ? 7.5 : 10,
            fontWeight: 800,
            letterSpacing: 0.7
          }}
        >
          COMPETITION CREDITS
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 11,
            color: "#F97316",
            fontSize: isMobile ? 17 : isTablet ? 20 : 27,
            fontWeight: 900,
            lineHeight: 1
          }}
        >
          {competitionCredits}
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 9,
            color: "#64748B",
            fontSize: isMobile ? 7 : isTablet ? 8.5 : 11,
            fontWeight: 600
          }}
        >
          Earned through competition submissions
        </div>
      </div>
    </div>

    {/* ACHIEVEMENT */}

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: isCompact ? 64 : 102,
        background:
          "linear-gradient(135deg, #EFF6FF 0%, #F8FBFF 100%)",
        border: "1px solid #BFDBFE",
        borderRadius: 18,
        padding: isMobile ? "7px 7px" : isTablet ? "9px 9px" : "17px 20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: isCompact ? 58 : 82,
          height: isCompact ? 58 : 82,
          borderRadius: "50%",
          right: -26,
          top: -34,
          background: "rgba(37,99,235,.07)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1
        }}
      >
        <div
          style={{
            color: "#1E40AF",
            fontSize: isMobile ? 6.5 : isTablet ? 7.5 : 10,
            fontWeight: 800,
            letterSpacing: 0.7
          }}
        >
          ACHIEVEMENT CREDITS
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 11,
            color: "#2563EB",
            fontSize: isMobile ? 17 : isTablet ? 20 : 27,
            fontWeight: 900,
            lineHeight: 1
          }}
        >
          {achievementCredits}
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 9,
            color: "#64748B",
            fontSize: isMobile ? 7 : isTablet ? 8.5 : 11,
            fontWeight: 600
          }}
        >
          Earned through achievements and verification
        </div>
      </div>
    </div>

    {/* PORTFOLIO */}

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: isCompact ? 64 : 102,
        background:
          "linear-gradient(135deg, #F5F3FF 0%, #FBFAFF 100%)",
        border: "1px solid #DDD6FE",
        borderRadius: 18,
        padding: isMobile ? "7px 7px" : isTablet ? "9px 9px" : "17px 20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: isCompact ? 58 : 82,
          height: isCompact ? 58 : 82,
          borderRadius: "50%",
          right: -26,
          top: -34,
          background: "rgba(124,58,237,.07)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1
        }}
      >
        <div
          style={{
            color: "#6D28D9",
            fontSize: isMobile ? 6.5 : isTablet ? 7.5 : 10,
            fontWeight: 800,
            letterSpacing: 0.7
          }}
        >
          PORTFOLIO CREDITS
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 11,
            color: "#7C3AED",
            fontSize: isMobile ? 17 : isTablet ? 20 : 27,
            fontWeight: 900,
            lineHeight: 1
          }}
        >
          {portfolioCredits}
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 9,
            color: "#64748B",
            fontSize: isMobile ? 7 : isTablet ? 8.5 : 11,
            fontWeight: 600
          }}
        >
          Earned through portfolio activity
        </div>
      </div>
    </div>

    {/* DAILY FEEDBACK */}

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: isCompact ? 64 : 102,
        background:
          "linear-gradient(135deg, #F0FDF4 0%, #FBFFFC 100%)",
        border: "1px solid #BBF7D0",
        borderRadius: 18,
        padding: isMobile ? "7px 7px" : isTablet ? "9px 9px" : "17px 20px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: isCompact ? 58 : 82,
          height: isCompact ? 58 : 82,
          borderRadius: "50%",
          right: -26,
          top: -34,
          background: "rgba(22,163,74,.07)",
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1
        }}
      >
        <div
          style={{
            color: "#166534",
            fontSize: isMobile ? 6.5 : isTablet ? 7.5 : 10,
            fontWeight: 800,
            letterSpacing: 0.7
          }}
        >
          DAILY FEEDBACK CREDITS
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 11,
            color: dailyFeedbackTotalCredits >= 0 ? "#16A34A" : "#DC2626",
            fontSize: isMobile ? 17 : isTablet ? 20 : 27,
            fontWeight: 900,
            lineHeight: 1
          }}
        >
          {dailyFeedbackTotalCredits}
        </div>

        <div
          style={{
            marginTop: isCompact ? 5 : 9,
            color: "#64748B",
            fontSize: isMobile ? 7 : isTablet ? 8.5 : 11,
            fontWeight: 600,
            lineHeight: 1.4
          }}
        >
          +{dailyFeedbackEarnedCredits} earned · -{dailyFeedbackLostCredits} lost
        </div>
      </div>
    </div>
  </div>
</div>

   {/* ==========================================================
    CREDIT GUIDE + REWARDS
========================================================== */}

<div
  style={{
    marginBottom: isCompact ? 16 : 32
  }}
>
  {/* PREMIUM TOGGLE */}

  <div
    style={{
      display: "inline-flex",
      width: isMobile ? "100%" : undefined,
      gap: 6,
      padding: 5,
      marginBottom: 18,
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: 14,
      boxShadow: "0 4px 14px rgba(15,23,42,.04)"
    }}
  >
    <button
      onClick={() =>
        setCreditView("guidelines")
      }
      style={{
        background:
          creditView === "guidelines"
            ? "#143B73"
            : "transparent",
        color:
          creditView === "guidelines"
            ? "#FFFFFF"
            : "#64748B",
        border: "none",
        padding: isMobile ? "11px 10px" : "11px 18px",
        flex: isMobile ? 1 : undefined,
        borderRadius: 10,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 800,
        transition: "all .2s ease"
      }}
    >
      Credit Guidelines
    </button>

    <button
      onClick={() =>
        setCreditView("rewards")
      }
      style={{
        background:
          creditView === "rewards"
            ? "#F97316"
            : "transparent",
        color:
          creditView === "rewards"
            ? "#FFFFFF"
            : "#64748B",
        border: "none",
        padding: isMobile ? "11px 10px" : "11px 18px",
        flex: isMobile ? 1 : undefined,
        borderRadius: 10,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 800,
        transition: "all .2s ease"
      }}
    >
      Rewards Marketplace
    </button>
  </div>

  {/* MAIN CONTAINER */}

  <div
    style={{
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: responsive.section.borderRadius,
      padding: responsive.section.padding,
      boxShadow:
        "0 8px 28px rgba(15,23,42,.045)"
    }}
  >
    {creditView === "guidelines" ? (

      /* ======================================================
          CREDIT GUIDELINES
      ====================================================== */

      <div>
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: responsive.sectionHeader.alignItems,
            flexDirection: responsive.sectionHeader.flexDirection,
            gap: 20,
            marginBottom: isCompact ? 14 : 22
          }}
        >
          <div>
            <div
              style={{
                color: "#F97316",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                marginBottom: 8
              }}
            >
              CREDIT GUIDE
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: 24,
                fontWeight: 800
              }}
            >
              How Your Credits Work
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: "#64748B",
                fontSize: 14,
                lineHeight: 1.5
              }}
            >
              Learn how to earn credits.
            </p>
          </div>

          <div
            style={{
              color: "#94A3B8",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1,
              whiteSpace: "nowrap"
            }}
          >
            CREDIT ECONOMY
          </div>
        </div>

        {/* EARN + SPEND */}

        {isCompact && (
          <div style={{
            margin:"0 0 10px",
            color:"#64748B",
            fontSize:11,
            fontWeight:800,
            letterSpacing:.5
          }}>
            Swipe left or right to compare earning and spending →
          </div>
        )}

        <div
          style={{
            display: isCompact ? "flex" : "grid",
            gridTemplateColumns:
              responsive.twoColumns.gridTemplateColumns,
            gap: isMobile ? 12 : 18,
            overflowX: isCompact ? "auto" : undefined,
            paddingBottom: isCompact ? 12 : undefined,
            scrollSnapType: isCompact ? "x mandatory" : undefined,
            WebkitOverflowScrolling: isCompact ? "touch" : undefined
          }}
        >
          {/* =========================
              EARN CREDITS
          ========================= */}

          <div
            style={{
              border: "1px solid #BBF7D0",
              borderRadius: 20,
              padding: isCompact ? 16 : 20,
              minWidth: isCompact ? (isMobile ? "84%" : 360) : undefined,
              maxWidth: isCompact ? (isMobile ? "84%" : 360) : undefined,
              flexShrink: isCompact ? 0 : undefined,
              scrollSnapAlign: isCompact ? "start" : undefined,
              background:
                "linear-gradient(145deg, #F0FDF4 0%, #FBFFFC 100%)"
            }}
          >
            {/* EARN HEADER */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "#FFFFFF",
                  border: "1px solid #BBF7D0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20
                }}
              >
                ↗
              </div>

              <div>
                <div
                  style={{
                    color: "#15803D",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    marginBottom: 3
                  }}
                >
                  BUILD YOUR BALANCE
                </div>

                <div
                  style={{
                    color: "#0F172A",
                    fontSize: 18,
                    fontWeight: 800
                  }}
                >
                  Ways To Earn Credits
                </div>
              </div>
            </div>

            {[
              [
                "Competition Submission",
                "+10"
              ],
              [
                "Competition Winner",
                "+50"
              ],
              [
                "Achievement Added",
                "+10"
              ],
              [
                "Verified Achievement",
                "+10"
              ],
              [
                "Portfolio Upload",
                "+10"
              ],
              [
                "Daily Feedback Submission",
                "+1"
              ],
              [
                "Missed Daily Feedback",
                "-10"
              ]
            ].map((item, index) => (

              <div
                key={item[0]}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 18,
                  padding: "14px 16px",
                  marginBottom:
                    index === 4 ? 0 : 9,
                  background: "#FFFFFF",
                  border: "1px solid #DCFCE7",
                  borderRadius: 13
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "#F0FDF4",
                      color: "#16A34A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 900,
                      flexShrink: 0
                    }}
                  >
                    +
                  </div>

                  <span
                    style={{
                      color: "#334155",
                      fontSize: 13,
                      fontWeight: 700
                    }}
                  >
                    {item[0]}
                  </span>
                </div>

                <div
                  style={{
                    background: "#DCFCE7",
                    color: "#15803D",
                    padding: "6px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 900,
                    minWidth: 42,
                    textAlign: "center"
                  }}
                >
                  {item[1]}
                </div>
              </div>

            ))}
          </div>

          {/* =========================
              SPEND CREDITS
          ========================= */}

          <div
            style={{
              border: "1px solid #FED7AA",
              borderRadius: 20,
              padding: isCompact ? 16 : 20,
              minWidth: isCompact ? (isMobile ? "84%" : 360) : undefined,
              maxWidth: isCompact ? (isMobile ? "84%" : 360) : undefined,
              flexShrink: isCompact ? 0 : undefined,
              scrollSnapAlign: isCompact ? "start" : undefined,
              background:
                "linear-gradient(145deg, #FFF7ED 0%, #FFFCF8 100%)"
            }}
          >
            {/* SPEND HEADER */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "#FFFFFF",
                  border: "1px solid #FED7AA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20
                }}
              >
                ✦
              </div>

              <div>
                <div
                  style={{
                    color: "#C2410C",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    marginBottom: 3
                  }}
                >
                  UNLOCK OPPORTUNITIES
                </div>

                <div
                  style={{
                    color: "#0F172A",
                    fontSize: 18,
                    fontWeight: 800
                  }}
                >
                  Ways To Spend Credits
                </div>
              </div>
            </div>

            {[
              [
                "Expert Consultation",
                "-60"
              ],
              [
                "Partner Reach Out",
                "-80"
              ],
              [
                "Leadership Nomination",
                "-250"
              ],
              [
                "Principal Roundtable",
                "-300"
              ]
            ].map((item, index) => (

              <div
                key={item[0]}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 18,
                  padding: "14px 16px",
                  marginBottom:
                    index === 3 ? 0 : 9,
                  background: "#FFFFFF",
                  border: "1px solid #FFEDD5",
                  borderRadius: 13
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: "#FFF7ED",
                      color: "#F97316",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 900,
                      flexShrink: 0
                    }}
                  >
                    −
                  </div>

                  <span
                    style={{
                      color: "#334155",
                      fontSize: 13,
                      fontWeight: 700
                    }}
                  >
                    {item[0]}
                  </span>
                </div>

                <div
                  style={{
                    background: "#FFEDD5",
                    color: "#C2410C",
                    padding: "6px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 900,
                    minWidth: 48,
                    textAlign: "center"
                  }}
                >
                  {item[1]}
                </div>
              </div>

            ))}
          </div>
        </div>
      </div>

    ) : (

      /* ======================================================
          REWARDS MARKETPLACE
      ====================================================== */

      <div>
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: responsive.sectionHeader.alignItems,
            flexDirection: responsive.sectionHeader.flexDirection,
            gap: 20,
            marginBottom: isCompact ? 14 : 22
          }}
        >
          <div>
            <div
              style={{
                color: "#F97316",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                marginBottom: 8
              }}
            >
              REWARDS MARKETPLACE
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: 24,
                fontWeight: 800
              }}
            >
              Turn Credits Into Opportunities
            </h2>

            <p
              style={{
                margin: "8px 0 0",
                color: "#64748B",
                fontSize: 14,
                lineHeight: 1.5
              }}
            >
              Use your earned credits to unlock
              mentorship, access and growth
              opportunities.
            </p>
          </div>

          <div
            style={{
              background: "#ECFDF5",
              border: "1px solid #BBF7D0",
              padding: "8px 13px",
              borderRadius: 999,
              color: "#15803D",
              fontSize: 11,
              fontWeight: 800,
              whiteSpace: "nowrap"
            }}
          >
            {availableCredits} CREDITS AVAILABLE
          </div>
        </div>

        {/* REWARD CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              responsive.twoColumns.gridTemplateColumns,
            gap: 14
          }}
        >
          {[
            [
              "Expert Consultation",
              "60 Credits",
              "🎓",
              "One-on-one guidance from verified experts.",
              "#EFF6FF",
              "#BFDBFE",
              "#2563EB"
            ],
            [
              "Partner Reach-Out",
              "80 Credits",
              "🤝",
              "Connect directly with relevant partner organisations.",
              "#F0FDFA",
              "#99F6E4",
              "#0F766E"
            ],
            [
              "Leadership Eligibility",
              "250 Credits",
              "🏅",
              "Unlock access to leadership opportunities.",
              "#FFF7ED",
              "#FED7AA",
              "#F97316"
            ],
            [
              "Principal Roundtable",
              "300 Credits",
              "✦",
              "Access exclusive high-value leadership conversations.",
              "#F5F3FF",
              "#DDD6FE",
              "#7C3AED"
            ]
          ].map((item) => (

            <div
              key={item[0]}
              style={{
                position: "relative",
                overflow: "hidden",
                background: item[4],
                border: `1px solid ${item[5]}`,
                borderRadius: 18,
                padding: 20,
                minHeight: 145,
                display: "flex",
                justifyContent: "space-between",
                alignItems: isMobile ? "stretch" : "center",
                flexDirection: isMobile ? "column" : "row",
                gap: 20
              }}
            >
              {/* DECORATIVE CIRCLE */}

              <div
                style={{
                  position: "absolute",
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  right: -42,
                  top: -52,
                  background:
                    "rgba(255,255,255,.45)",
                  pointerEvents: "none"
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  gap: 15,
                  alignItems: "flex-start"
                }}
              >
                {/* ICON */}

                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 13,
                    background: "#FFFFFF",
                    border:
                      `1px solid ${item[5]}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 21,
                    flexShrink: 0
                  }}
                >
                  {item[2]}
                </div>

                <div>
                  <div
                    style={{
                      color: "#0F172A",
                      fontSize: 16,
                      fontWeight: 800,
                      marginBottom: 5
                    }}
                  >
                    {item[0]}
                  </div>

                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 12,
                      lineHeight: 1.5,
                      maxWidth: 330
                    }}
                  >
                    {item[3]}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      color: item[6],
                      fontSize: 17,
                      fontWeight: 900
                    }}
                  >
                    {item[1]}
                  </div>
                </div>
              </div>

              {/* KEEPING EXISTING REDEEM BUTTON */}

              <button
                style={{
                  position: "relative",
                  zIndex: 1,
                  background: item[6],
                  border: "none",
                  color: "#FFFFFF",
                  padding: "10px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                  width: isMobile ? "100%" : undefined
                }}
              >
                Redeem
              </button>
            </div>

          ))}
        </div>
      </div>

    )}
  </div>
</div>


{/* ===========================================
      CONSULTATION MARKETPLACE
=========================================== */}

<div
  style={{
    marginTop: isCompact ? 18 : 40,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 28,
    overflow: "hidden"
  }}
>
 {/* HERO */}

<div
  style={{
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(120deg, #FFFFFF 0%, #FFFFFF 58%, #FFF9F4 82%, #F4F7FF 100%)",
    padding: responsive.hero.padding,
    borderBottom: "1px solid #E2E8F0",
    minHeight: viewportWidth < 1024 ? 0 : 250
  }}
>
  {/* DECORATIVE BLUE CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: 250,
      height: 250,
      borderRadius: "50%",
      right: 120,
      bottom: -185,
      background: "rgba(37,99,235,.045)",
      pointerEvents: "none"
    }}
  />

  {/* DECORATIVE ORANGE CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: 270,
      height: 270,
      borderRadius: "50%",
      right: -70,
      top: -105,
      background: "rgba(249,115,22,.055)",
      pointerEvents: "none"
    }}
  />

  {/* SMALL DECORATIVE CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: 125,
      height: 125,
      borderRadius: "50%",
      right: 300,
      top: -75,
      background: "rgba(249,115,22,.03)",
      pointerEvents: "none"
    }}
  />

  {/* CONTENT */}

  <div
    style={{
      position: "relative",
      zIndex: 2
    }}
  >
    <div
      style={{
        color: "#F97316",
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: 2.2,
        textTransform: "uppercase",
        marginBottom: 13
      }}
    >
      CONSULTATION MARKETPLACE
    </div>

    <h2
      style={{
        margin: 0,
        color: "#0F172A",
        fontSize: responsive.marketplaceTitle.fontSize,
        lineHeight: 1.18,
        fontWeight: 800,
        letterSpacing: "-0.6px"
      }}
    >
      Learn From Experts Using Your Earned Credits
    </h2>

    <div
      style={{
        marginTop: 14,
        maxWidth: 850,
        color: "#64748B",
        fontSize: 15,
        lineHeight: 1.65,
        fontWeight: 500
      }}
    >
     

      <div
        style={{
          marginTop: 15
        }}
      >
        Every consultation is booked using the
        credits you earn throughout your Talent
        Passport journey.
      </div>
    </div>

    {/* BENEFIT PILLS */}

    <div
      style={{
        display: "flex",
        gap: 10,
        marginTop: 22,
        flexWrap: "wrap"
      }}
    >
      <div
        style={{
          background: "#FFF7ED",
          border: "1px solid #FED7AA",
          padding: "8px 13px",
          borderRadius: 999,
          fontWeight: 800,
          fontSize: 12,
          color: "#C2410C"
        }}
      >
        🎯 Credit Based
      </div>

      <div
        style={{
          background: "#EFF6FF",
          border: "1px solid #BFDBFE",
          padding: "8px 13px",
          borderRadius: 999,
          fontWeight: 800,
          fontSize: 12,
          color: "#1D4ED8"
        }}
      >
        ⭐ Verified Experts
      </div>

      <div
        style={{
          background: "#F0FDFA",
          border: "1px solid #99F6E4",
          padding: "8px 13px",
          borderRadius: 999,
          fontWeight: 800,
          fontSize: 12,
          color: "#0F766E"
        }}
      >
        🤝 One-on-One Guidance
      </div>
    </div>
  </div>

  {/* RIGHT VISUAL */}

  <div
    style={{
      position: "absolute",
      zIndex: 2,
      right: responsive.visual.right,
      display: responsive.visual.display,
      top: "50%",
      transform: "translateY(-50%)",
      width: 94,
      height: 94,
      borderRadius: "50%",
      background: "rgba(249,115,22,.09)",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "#FFFFFF",
        border: "1px solid #FED7AA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 30,
        boxShadow:
          "0 8px 22px rgba(249,115,22,.10)"
      }}
    >
      🎓
    </div>
  </div>
</div>

  {/* CATEGORY CARDS */}

  {isCompact && (
    <div style={{
      padding: isMobile ? "12px 12px 0" : "14px 16px 0",
      color:"#64748B",
      fontSize:10,
      fontWeight:800,
      letterSpacing:.35
    }}>
      Swipe left or right to explore consultation categories →
    </div>
  )}

  <div
    style={{
      padding: isMobile ? 12 : isTablet ? 16 : 30,
      display: isCompact ? "flex" : "grid",
      gridTemplateColumns: responsive.cardGrid.gridTemplateColumns,
      gap: isCompact ? 10 : 24,
      overflowX: isCompact ? "auto" : undefined,
      scrollSnapType: isCompact ? "x mandatory" : undefined,
      WebkitOverflowScrolling: isCompact ? "touch" : undefined,
      paddingBottom: isCompact ? 8 : undefined
    }}
  >
    {/* ACTIVITY */}

{/* =========================================================
    ACTIVITY COACHING
========================================================= */}

<div
  onClick={() => {
    setSelectedCategory("Activity Coaching");
    setSelectedSkill("");
    setSelectedPartner(null);
    setConsultationTopic("");
    setConsultationDescription("");
  }}
  style={{
    position: "relative",
    overflow: "hidden",
    border:
      selectedCategory === "Activity Coaching"
        ? "1.5px solid #F97316"
        : "1px solid #FED7AA",
    borderRadius: isCompact ? 16 : 24,
    padding: isCompact ? 13 : 26,
    minWidth: isCompact ? (isMobile ? "78%" : 270) : undefined,
    maxWidth: isCompact ? (isMobile ? "78%" : 270) : undefined,
    flexShrink: isCompact ? 0 : undefined,
    scrollSnapAlign: isCompact ? "start" : undefined,
    background:
      "linear-gradient(145deg, #FFF8EF 0%, #FFFCF7 62%, #FFF4E5 100%)",
    transition: "all .25s ease",
    cursor: "pointer",
    boxShadow:
      selectedCategory === "Activity Coaching"
        ? "0 14px 32px rgba(249,115,22,.14)"
        : "0 8px 24px rgba(15,23,42,.045)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: isCompact ? (isMobile ? 152 : 168) : 320
  }}
>
  {/* DECORATIVE CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: "50%",
      right: -50,
      top: -58,
      background: "rgba(249,115,22,.075)",
      pointerEvents: "none"
    }}
  />

  <div
    style={{
      position: "absolute",
      width: 90,
      height: 90,
      borderRadius: "50%",
      right: 52,
      top: -55,
      background: "rgba(249,115,22,.035)",
      pointerEvents: "none"
    }}
  />

  <div
    style={{
      position: "relative",
      zIndex: 1
    }}
  >
    {/* ICON */}

    <div
      style={{
        width: isCompact ? 36 : 58,
        height: isCompact ? 36 : 58,
        borderRadius: 16,
        background: "#FFFFFF",
        border: "1px solid #FED7AA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: isCompact ? 18 : 29,
        boxShadow: "0 6px 16px rgba(249,115,22,.08)",
        marginBottom: isCompact ? 14 : 22
      }}
    >
      🎭
    </div>

    {/* EYEBROW */}

    <div
      style={{
        color: "#C2410C",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 1.4,
        marginBottom: 8
      }}
    >
      CREATIVE & PERFORMANCE
    </div>

    <h3
      style={{
        margin: "0 0 12px",
        color: "#0F172A",
        fontSize: isCompact ? 15 : 21,
        fontWeight: 800,
        lineHeight: 1.25
      }}
    >
      Activity Coaching
    </h3>

    <div
      style={{
        color: "#64748B",
        fontSize: isCompact ? 10.5 : 14,
        lineHeight: isCompact ? 1.38 : 1.65,
        maxWidth: 430
      }}
    >
      Learn directly from Debate,
      Dance, Music, Theatre, Coding and
      Public Speaking mentors.
    </div>
  </div>

  <button
    style={{
      position: "relative",
      zIndex: 1,
      marginTop: isCompact ? 11 : 26,
      width: "100%",
      padding: "13px 18px",
      background:
        selectedCategory === "Activity Coaching"
          ? "#EA580C"
          : "#F97316",
      color: "#FFFFFF",
      border: "none",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 800,
      fontSize: 13,
      boxShadow:
        "0 6px 14px rgba(249,115,22,.15)",
      transition: "all .2s ease"
    }}
  >
    {selectedCategory === "Activity Coaching"
      ? "Selected ✓"
      : "Explore Coaches →"}
  </button>
</div>


{/* =========================================================
    CAREER GUIDANCE
========================================================= */}

<div
  onClick={() => {
    setSelectedCategory("Career Guidance");
    setSelectedSkill("");
    setSelectedPartner(null);
    setConsultationTopic("");
    setConsultationDescription("");
  }}
  style={{
    position: "relative",
    overflow: "hidden",
    border:
      selectedCategory === "Career Guidance"
        ? "1.5px solid #2563EB"
        : "1px solid #BFDBFE",
    borderRadius: isCompact ? 16 : 24,
    padding: isCompact ? 13 : 26,
    minWidth: isCompact ? (isMobile ? "78%" : 270) : undefined,
    maxWidth: isCompact ? (isMobile ? "78%" : 270) : undefined,
    flexShrink: isCompact ? 0 : undefined,
    scrollSnapAlign: isCompact ? "start" : undefined,
    background:
      "linear-gradient(145deg, #EFF6FF 0%, #F8FBFF 62%, #EDF4FF 100%)",
    transition: "all .25s ease",
    cursor: "pointer",
    boxShadow:
      selectedCategory === "Career Guidance"
        ? "0 14px 32px rgba(37,99,235,.14)"
        : "0 8px 24px rgba(15,23,42,.045)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: isCompact ? (isMobile ? 152 : 168) : 320
  }}
>
  {/* DECORATIVE CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: "50%",
      right: -50,
      top: -58,
      background: "rgba(37,99,235,.07)",
      pointerEvents: "none"
    }}
  />

  <div
    style={{
      position: "absolute",
      width: 90,
      height: 90,
      borderRadius: "50%",
      right: 52,
      top: -55,
      background: "rgba(37,99,235,.035)",
      pointerEvents: "none"
    }}
  />

  <div
    style={{
      position: "relative",
      zIndex: 1
    }}
  >
    {/* ICON */}

    <div
      style={{
        width: isCompact ? 36 : 58,
        height: isCompact ? 36 : 58,
        borderRadius: 16,
        background: "#FFFFFF",
        border: "1px solid #BFDBFE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: isCompact ? 18 : 29,
        boxShadow: "0 6px 16px rgba(37,99,235,.08)",
        marginBottom: isCompact ? 14 : 22
      }}
    >
      🎓
    </div>

    {/* EYEBROW */}

    <div
      style={{
        color: "#1D4ED8",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 1.4,
        marginBottom: 8
      }}
    >
      FUTURE PATHWAYS
    </div>

    <h3
      style={{
        margin: "0 0 12px",
        color: "#0F172A",
        fontSize: isCompact ? 15 : 21,
        fontWeight: 800,
        lineHeight: 1.25
      }}
    >
      Career Guidance
    </h3>

    <div
      style={{
        color: "#64748B",
        fontSize: isCompact ? 10.5 : 14,
        lineHeight: isCompact ? 1.38 : 1.65,
        maxWidth: 430
      }}
    >
      Receive guidance on scholarships,
      admissions, portfolio building,
      competitions, leadership,
      interview preparation and
      future career pathways.
    </div>
  </div>

  <button
    style={{
      position: "relative",
      zIndex: 1,
      marginTop: isCompact ? 11 : 26,
      width: "100%",
      padding: "13px 18px",
      background:
        selectedCategory === "Career Guidance"
          ? "#1D4ED8"
          : "#143B73",
      color: "#FFFFFF",
      border: "none",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 800,
      fontSize: 13,
      boxShadow:
        "0 6px 14px rgba(20,59,115,.14)",
      transition: "all .2s ease"
    }}
  >
    {selectedCategory === "Career Guidance"
      ? "Selected ✓"
      : "Explore Mentors →"}
  </button>
</div>


{/* =========================================================
    PARENT SUPPORT
========================================================= */}

<div
  onClick={() => {
    setSelectedCategory("Parent Support");
    setSelectedSkill("");
    setSelectedPartner(null);
    setConsultationTopic("");
    setConsultationDescription("");
  }}
  style={{
    position: "relative",
    overflow: "hidden",
    border:
      selectedCategory === "Parent Support"
        ? "1.5px solid #0F766E"
        : "1px solid #99F6E4",
    borderRadius: isCompact ? 16 : 24,
    padding: isCompact ? 13 : 26,
    minWidth: isCompact ? (isMobile ? "78%" : 270) : undefined,
    maxWidth: isCompact ? (isMobile ? "78%" : 270) : undefined,
    flexShrink: isCompact ? 0 : undefined,
    scrollSnapAlign: isCompact ? "start" : undefined,
    background:
      "linear-gradient(145deg, #F0FDFA 0%, #F8FFFD 62%, #ECFDF5 100%)",
    transition: "all .25s ease",
    cursor: "pointer",
    boxShadow:
      selectedCategory === "Parent Support"
        ? "0 14px 32px rgba(15,118,110,.14)"
        : "0 8px 24px rgba(15,23,42,.045)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: isCompact ? (isMobile ? 152 : 168) : 320
  }}
>
  {/* DECORATIVE CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: "50%",
      right: -50,
      top: -58,
      background: "rgba(15,118,110,.07)",
      pointerEvents: "none"
    }}
  />

  <div
    style={{
      position: "absolute",
      width: 90,
      height: 90,
      borderRadius: "50%",
      right: 52,
      top: -55,
      background: "rgba(15,118,110,.035)",
      pointerEvents: "none"
    }}
  />

  <div
    style={{
      position: "relative",
      zIndex: 1
    }}
  >
    {/* ICON */}

    <div
      style={{
        width: isCompact ? 36 : 58,
        height: isCompact ? 36 : 58,
        borderRadius: 16,
        background: "#FFFFFF",
        border: "1px solid #99F6E4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: isCompact ? 18 : 29,
        boxShadow: "0 6px 16px rgba(15,118,110,.08)",
        marginBottom: isCompact ? 14 : 22
      }}
    >
      👨‍👩‍👧
    </div>

    {/* EYEBROW */}

    <div
      style={{
        color: "#0F766E",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 1.4,
        marginBottom: 8
      }}
    >
      STUDENT & FAMILY GROWTH
    </div>

    <h3
      style={{
        margin: "0 0 12px",
        color: "#0F172A",
        fontSize: isCompact ? 15 : 21,
        fontWeight: 800,
        lineHeight: 1.25
      }}
    >
      Parent Support
    </h3>

    <div
      style={{
        color: "#64748B",
        fontSize: isCompact ? 10.5 : 14,
        lineHeight: isCompact ? 1.38 : 1.65,
        maxWidth: 430
      }}
    >
      Connect with experienced mentors
      for parenting, confidence building,
      emotional wellbeing, student
      motivation, learning challenges
      and holistic student growth.
    </div>
  </div>

  <button
    style={{
      position: "relative",
      zIndex: 1,
      marginTop: isCompact ? 11 : 26,
      width: "100%",
      padding: "13px 18px",
      background:
        selectedCategory === "Parent Support"
          ? "#0B5F59"
          : "#0F766E",
      color: "#FFFFFF",
      border: "none",
      borderRadius: 12,
      cursor: "pointer",
      fontWeight: 800,
      fontSize: 13,
      boxShadow:
        "0 6px 14px rgba(15,118,110,.14)",
      transition: "all .2s ease"
    }}
  >
    {selectedCategory === "Parent Support"
      ? "Selected ✓"
      : "Explore Experts →"}
  </button>
</div>



  </div>

{/* ===========================================
      CONSULTATION BOOKING PANEL
=========================================== */}

{selectedCategory && (

<div
style={{
marginTop: isMobile ? 16 : isTablet ? 24 : 40,
padding: isMobile ? 14 : isTablet ? 20 : 30,
borderRadius:24,
border:"1px solid #E2E8F0",
background:"#FFFFFF"
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
flexDirection: responsive.stackRow.flexDirection,
alignItems: responsive.stackRow.alignItems,
gap: isMobile ? 14 : undefined,
marginBottom:30
}}
>

<div>

<div
style={{
fontSize:13,
fontWeight:700,
letterSpacing:1,
color:"#EA580C",
textTransform:"uppercase"
}}
>

Selected Consultation

</div>

<h2
style={{
marginTop:8,
marginBottom:0
}}
>

{selectedCategory}

</h2>

</div>

<div
style={{
background:"#FFF7ED",
padding:"10px 18px",
borderRadius:999,
fontWeight:700,
color:"#EA580C"
}}
>

{consultationCost} Credits

</div>

</div>

<div
style={{
display:"grid",
gridTemplateColumns: responsive.formColumns.gridTemplateColumns,
gap:24
}}
>

<div>

<label
style={{
fontWeight:700,
fontSize:15,
boxSizing: responsive.input.boxSizing
}}
>

Choose Skill

</label>

<select

value={selectedSkill}

onChange={(e)=>
setSelectedSkill(
e.target.value
)
}

style={{
marginTop:10,
width:"100%",
padding:16,
borderRadius:12,
border:"1px solid #CBD5E1",
fontSize:15,
boxSizing: responsive.input.boxSizing
}}

>

<option value="">

Select Skill

</option>

{(
selectedCategory==="Activity Coaching"

? activitySkills

: selectedCategory==="Career Guidance"

? careerTopics

: parentTopics

).map(skill=>(

<option
key={skill}
value={skill}
>

{skill}

</option>

))}

</select>

</div>

<div>

<label
style={{
fontWeight:700,
fontSize:15
}}
>

Consultation Topic

</label>

<input

value={consultationTopic}

onChange={(e)=>
setConsultationTopic(
e.target.value
)
}

placeholder="e.g. Improve Debate Structure"

style={{
marginTop:10,
width:"100%",
padding:16,
borderRadius:12,
border:"1px solid #CBD5E1",
fontSize:15
}}

>

</input>

</div>

</div>

<div
style={{
marginTop:28
}}
>

<label
style={{
fontWeight:700,
fontSize:15
}}
>

Describe your requirement

</label>

<textarea

rows={6}

value={consultationDescription}

onChange={(e)=>
setConsultationDescription(
e.target.value
)
}

placeholder="Explain your challenge in detail..."

style={{
marginTop:10,
width:"100%",
padding:18,
borderRadius:14,
border:"1px solid #CBD5E1",
fontSize:15,
boxSizing: responsive.input.boxSizing,
resize:"vertical"
}}

>

</textarea>

</div>

<div
style={{
marginTop:36,
display:"flex",
justifyContent:"space-between",
flexDirection: responsive.stackRow.flexDirection,
alignItems: responsive.stackRow.alignItems,
gap:30
}}
>

<div
style={{
display:"grid",
gridTemplateColumns: responsive.compactThree.gridTemplateColumns,
gap:18,
flex:1,
width:"100%"
}}
>

<div
style={{
background:"#F8FAFC",
border:"1px solid #E2E8F0",
padding:18,
borderRadius:16
}}
>

<div
style={{
fontSize:13,
color:"#64748B",
marginBottom:8
}}
>

Available Credits

</div>

<div
style={{
fontSize:24,
fontWeight:700,
color:"#0F172A"
}}
>

{availableCredits}

</div>

</div>

<div
style={{
background:"#FFF7ED",
border:"1px solid #FED7AA",
padding:18,
borderRadius:16
}}
>

<div
style={{
fontSize:13,
color:"#EA580C",
marginBottom:8
}}
>

Consultation Cost

</div>

<div
style={{
fontSize:24,
fontWeight:700,
color:"#EA580C"
}}
>

{consultationCost}

</div>

</div>

<div
style={{
background:
remainingCredits >= 0
? "#F0FDF4"
: "#FEF2F2",

border:
remainingCredits >= 0
? "1px solid #BBF7D0"
: "1px solid #FECACA",

padding:18,
borderRadius:16
}}
>

<div
style={{
fontSize:13,
color:
remainingCredits >= 0
? "#15803D"
: "#DC2626",
marginBottom:8
}}
>

Remaining Balance

</div>

<div
style={{
fontSize:24,
fontWeight:700,
color:
remainingCredits >= 0
? "#15803D"
: "#DC2626"
}}
>

{remainingCredits}

</div>

</div>

</div>

<button
onClick={() => {

  loadRecommendedPartners(
    selectedCategory!,
    selectedSkill
  );

}}

disabled={
!selectedSkill ||
remainingCredits < 0
}

style={{

background:

selectedSkill &&
remainingCredits >= 0

? "#FF6B00"

:"#CBD5E1",

color:"#FFFFFF",

padding:"18px 34px",

border:"none",

borderRadius:16,

fontWeight:700,

cursor:

selectedSkill &&
remainingCredits >= 0

? "pointer"

:"not-allowed",

fontSize:16,

width: responsive.fullButton.width,
minWidth: responsive.fullButton.minWidth

}}

>

Find Experts →

</button>

</div>

</div>

)}

{/* ============================================================
                    RECOMMENDED EXPERTS
============================================================ */}

{showPartners && (

<div
style={{
marginTop: isCompact ? 18 : 40,
padding: isMobile ? "0 16px 18px" : isTablet ? "0 22px 24px" : "0 30px 30px"
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
flexDirection: responsive.stackRow.flexDirection,
alignItems: responsive.stackRow.alignItems,
gap: isMobile ? 14 : undefined,
marginBottom:24
}}
>

<div>

<div
style={{
fontSize:13,
fontWeight:700,
letterSpacing:1,
textTransform:"uppercase",
color:"#EA580C"
}}
>

RECOMMENDED EXPERTS

</div>

<h2
style={{
margin:"8px 0 0"
}}
>

Choose Your Mentor

</h2>

</div>

<div
style={{
background:"#FFF7ED",
padding:"10px 18px",
borderRadius:999,
fontWeight:700,
color:"#EA580C"
}}
>

{recommendedPartners.length} Experts Found

</div>

</div>

{isCompact && recommendedPartners.length > 1 && (
<div style={{
  margin:"-6px 0 12px",
  color:"#64748B",
  fontSize:11,
  fontWeight:800,
  letterSpacing:.5
}}>
  Swipe left or right to explore more experts →
</div>
)}

<div
style={{
display: isCompact ? "flex" : "grid",
gridTemplateColumns: responsive.expertGrid.gridTemplateColumns,
gap: isCompact ? 12 : 24,
overflowX: isCompact ? "auto" : undefined,
scrollSnapType: isCompact ? "x mandatory" : undefined,
WebkitOverflowScrolling: isCompact ? "touch" : undefined,
paddingBottom: isCompact ? 10 : undefined
}}
>

{recommendedPartners.map((partner) => (

<div

key={partner.id}

style={{

background:"#FFFFFF",

border:
selectedPartner?.id===partner.id
?"2px solid #FF6B00"
:"1px solid #E2E8F0",

borderRadius: isCompact ? 18 : 24,

padding: isMobile ? 12 : isTablet ? 15 : 28,
minWidth: isCompact ? (isMobile ? "78%" : 320) : undefined,
maxWidth: isCompact ? (isMobile ? "78%" : 320) : undefined,
flexShrink: isCompact ? 0 : undefined,
scrollSnapAlign: isCompact ? "start" : undefined,

display:"flex",

flexDirection:"column",

justifyContent:"space-between",

boxShadow:
selectedPartner?.id===partner.id
?"0 16px 36px rgba(255,107,0,.18)"
:"0 8px 24px rgba(15,23,42,.05)",

transition:".25s"

}}

>

<div>

<div
style={{
display:"flex",
justifyContent:"space-between",
flexDirection: responsive.stackRow.flexDirection,
alignItems: isMobile ? "flex-start" : "center",
gap: isMobile ? 14 : undefined,
marginBottom:20
}}
>

<div>

{partner.verified && (

<div
style={{
display:"inline-block",
background:"#E8F5EE",
color:"#15803D",
padding:"6px 12px",
borderRadius:999,
fontSize:12,
fontWeight:700,
marginBottom:10
}}
>

✔ VERIFIED PARTNER

</div>

)}

<h3
style={{
margin:"0 0 8px",
fontSize:24
}}
>

{partner.name}

</h3>

<div
style={{
color:"#64748B"
}}
>

📍 {partner.city}

</div>

</div>

<div
style={{
background:"#EEF4FF",
padding:"10px 16px",
borderRadius:999,
fontWeight:700,
color:"#143B73"
}}
>

⭐ {partner.rating}

</div>

</div>

<div
style={{
display:"grid",
gridTemplateColumns: responsive.compactThree.gridTemplateColumns,
gap:12,
marginBottom:24
}}
>

<div
style={{
background:"#F8FAFC",
padding:14,
borderRadius:14,
textAlign:"center"
}}
>

<div
style={{
fontSize:12,
color:"#64748B"
}}
>

Experience

</div>

<div
style={{
fontWeight:700,
marginTop:6
}}
>

{partner.experience} Years

</div>

</div>

<div
style={{
background:"#F8FAFC",
padding:14,
borderRadius:14,
textAlign:"center"
}}
>

<div
style={{
fontSize:12,
color:"#64748B"
}}
>

Students

</div>

<div
style={{
fontWeight:700,
marginTop:6
}}
>

{partner.studentsMentored.toLocaleString()}+

</div>

</div>

<div
style={{
background:"#F8FAFC",
padding:14,
borderRadius:14,
textAlign:"center"
}}
>

<div
style={{
fontSize:12,
color:"#64748B"
}}
>

Session

</div>

<div
style={{
fontWeight:700,
marginTop:6
}}
>

{partner.consultationDuration} Min

</div>

</div>

</div>

<div
style={{
marginBottom:18
}}
>

<div
style={{
fontWeight:700,
marginBottom:12
}}
>

Specializations

</div>

<div
style={{
display:"flex",
gap:8,
flexWrap:"wrap"
}}
>

{(partner.specializations ?? []).map((skill: string) => (

<div
key={skill}
style={{
background:"#FFF7ED",
padding:"7px 14px",
borderRadius:999,
fontSize:13,
fontWeight:600,
color:"#EA580C"
}}
>

{skill}

</div>

))}

</div>

</div>

<div
style={{
marginBottom:24
}}
>

<div
style={{
fontWeight:700,
marginBottom:8
}}
>

Languages

</div>

<div
style={{
color:"#64748B"
}}
>

{(partner.languages ?? []).join(" • ")}

</div>

</div>

</div>

<div
style={{
borderTop:"1px solid #E2E8F0",
paddingTop:20,
display:"flex",
justifyContent:"space-between",
flexDirection: responsive.stackRow.flexDirection,
alignItems: responsive.stackRow.alignItems,
gap: isMobile ? 16 : undefined
}}
>

<div>

<div
style={{
fontSize:24,
fontWeight:700,
color:"#EA580C"
}}
>

{partner.credits} Credits

</div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

One-on-One Consultation

</div>

</div>

<button

onClick={() =>
setSelectedPartner(partner)
}

style={{

background:
selectedPartner?.id===partner.id
? "#15803D"
: "#143B73",

color:"#FFFFFF",

border:"none",

padding:"14px 22px",

borderRadius:14,

cursor:"pointer",

fontWeight:700,

fontSize:15

}}

>

{selectedPartner?.id===partner.id
? "✓ Selected"
: "Select Expert"}

</button>

</div>

</div>

      ))}
    </div>
  </div>
)}

{/* ============================================================
                CONSULTATION SUMMARY
============================================================ */}

{selectedPartner && (

<div
style={{
marginTop: isCompact ? 18 : 40,
background:"#FFFFFF",
border:"1px solid #E2E8F0",
borderRadius:28,
padding: isMobile ? 16 : isTablet ? 22 : 32
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
flexDirection: responsive.stackRow.flexDirection,
alignItems: responsive.stackRow.alignItems,
gap: isMobile ? 14 : undefined,
marginBottom:30
}}
>

<div>

<div
style={{
fontSize:13,
fontWeight:700,
letterSpacing:1,
textTransform:"uppercase",
color:"#EA580C"
}}
>

CONSULTATION SUMMARY

</div>

<h2
style={{
margin:"8px 0 0"
}}
>

Review Before Booking

</h2>

</div>

<div
style={{
background:"#FFF7ED",
padding:"10px 18px",
borderRadius:999,
fontWeight:700,
color:"#EA580C"
}}
>

{selectedPartner.credits} Credits

</div>

</div>

<div
style={{
display:"grid",
gridTemplateColumns: responsive.twoColumns.gridTemplateColumns,
gap:20,
marginBottom:28
}}
>

<div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

Expert

</div>

<div
style={{
fontSize:18,
fontWeight:700,
marginTop:6
}}
>

{selectedPartner.name}

</div>

</div>

<div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

Category

</div>

<div
style={{
fontSize:18,
fontWeight:700,
marginTop:6
}}
>

{selectedCategory}

</div>

</div>

<div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

Skill

</div>

<div
style={{
fontSize:18,
fontWeight:700,
marginTop:6
}}
>

{selectedSkill}

</div>

</div>

<div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

Topic

</div>

<div
style={{
fontSize:18,
fontWeight:700,
marginTop:6
}}
>

{consultationTopic}

</div>

</div>

</div>

<div
style={{
marginBottom:28
}}
>

<div
style={{
fontSize:13,
color:"#64748B",
marginBottom:10
}}
>

Description

</div>

<div
style={{
background:"#F8FAFC",
padding:20,
borderRadius:16,
lineHeight:1.7,
color:"#334155"
}}
>

{consultationDescription}

</div>

</div>

<div
style={{
display:"grid",
gridTemplateColumns: responsive.twoColumns.gridTemplateColumns,
gap:20,
marginBottom:30
}}
>

<div
style={{
background:"#FFF7ED",
padding:20,
borderRadius:16,
border:"1px solid #FED7AA"
}}
>

<div
style={{
fontSize:13,
color:"#EA580C"
}}
>

Consultation Cost

</div>

<div
style={{
fontSize:28,
fontWeight:700,
marginTop:10,
color:"#EA580C"
}}
>

{selectedPartner.credits}

</div>

</div>

<div
style={{
background:"#F0FDF4",
padding:20,
borderRadius:16,
border:"1px solid #BBF7D0"
}}
>

<div
style={{
fontSize:13,
color:"#15803D"
}}
>

Remaining Credits

</div>

<div
style={{
fontSize:28,
fontWeight:700,
marginTop:10,
color:"#15803D"
}}
>

{availableCredits}

</div>

</div>

</div>

<div
style={{
display:"flex",
justifyContent:"flex-end",
flexDirection: isMobile ? "column" : "row",
gap:16
}}
>

<button

onClick={()=>{
setSelectedPartner(null);
}}

style={{
padding:"14px 26px",
borderRadius:14,
background:"#E2E8F0",
border:"none",
cursor:"pointer",
fontWeight:700
}}
>

Cancel

</button>

{bookingError && (

<div
style={{
marginBottom:20,
padding:16,
borderRadius:12,
background:"#FEF2F2",
border:"1px solid #FECACA",
color:"#B91C1C",
fontWeight:600
}}
>

{bookingError}

</div>

)}

<button

onClick={async()=>{

setBookingError("");

setBookingLoading(true);

try{

  console.log("BOOKING PARTNER", {
    id: selectedPartner.id,
    partner_uuid: selectedPartner.partner_uuid,
    partner_id: selectedPartner.partner_id,
    name: selectedPartner.name
  });

console.log("========== CREDIT DASHBOARD ==========");
console.log("selectedPartner =", selectedPartner);
console.log("selectedPartner.id =", selectedPartner?.id);
console.log("selectedPartner.partner_uuid =", selectedPartner?.partner_uuid);
console.log("selectedPartner.partner_id =", selectedPartner?.partner_id);
console.log("======================================");

const identity = requireIdentity();
const result = await bookConsultation({

    studentId: getMasterStudentId(),

    partnerId: selectedPartner.partner_id,

    partnerUuid: selectedPartner.partner_uuid,

    partnerName: selectedPartner.name,

    studentName: identity.studentName,

    studentEmail: identity.email,

    studentPhone: identity.parentPhone,

    schoolName: identity.schoolName,

    className: identity.className,

    category: selectedCategory,

    skill: selectedSkill,

    topic: consultationTopic,

    description: consultationDescription,

    consultationCredits: selectedPartner.credits

});

setBookingResult(
result
);

setBookingSuccess(
true
);

await loadCredits();
await loadConsultationHistory();

}
catch(error:any){

console.error(error);

setBookingError(

error?.message ??

"Unable to submit consultation request."

);

}
finally{

setBookingLoading(
false
);

}

}}

disabled={
bookingLoading
}

style={{

padding:"14px 32px",

borderRadius:14,

background:"#FF6B00",

color:"#FFFFFF",

border:"none",

cursor:
bookingLoading
? "not-allowed"
: "pointer",

opacity:
bookingLoading
? 0.7
: 1,

fontWeight:700,

fontSize:16

}}

>

{bookingLoading

? "Booking..."

: "Book Consultation →"}

</button>

</div>

</div>

)}

{/* ============================================================
                 BOOKING SUCCESS
============================================================ */}

{bookingSuccess && bookingResult && (

<div
style={{
marginTop: isCompact ? 18 : 40,
background:"#F0FDF4",
border:"1px solid #BBF7D0",
borderRadius:28,
padding:36
}}
>

<div
style={{
textAlign:"center",
marginBottom:32
}}
>

<div
style={{
fontSize:70
}}
>

🎉

</div>

<h2
style={{
margin:"12px 0"
}}
>

Consultation Booked Successfully

</h2>

<div
style={{
color:"#15803D",
fontSize:17
}}
>

Your consultation request has been submitted.

</div>

</div>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:20,
marginBottom:32
}}
>

<div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

Request ID

</div>

<div
style={{
fontWeight:700,
marginTop:6
}}
>

{bookingResult.consultation.id}

</div>

</div>

<div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

Status

</div>

<div
style={{
fontWeight:700,
marginTop:6,
color:"#EA580C"
}}
>

Pending Approval

</div>

</div>

<div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

Expert

</div>

<div
style={{
fontWeight:700,
marginTop:6
}}
>

{selectedPartner.name}

</div>

</div>

<div>

<div
style={{
fontSize:13,
color:"#64748B"
}}
>

Credits Deducted

</div>

<div
style={{
fontWeight:700,
marginTop:6,
color:"#DC2626"
}}
>

{selectedPartner.credits}

</div>

</div>

</div>

<div
style={{
display:"flex",
justifyContent:"center",
gap:20
}}
>

<button

onClick={()=>{

setBookingSuccess(false);

setSelectedPartner(null);

setConsultationTopic("");

setConsultationDescription("");

setSelectedSkill("");

}}

style={{

background:"#143B73",

color:"#FFFFFF",

border:"none",

padding:"14px 26px",

borderRadius:14,

cursor:"pointer",

fontWeight:700

}}

>

Book Another Consultation

</button>

<button

style={{

background:"#FF6B00",

color:"#FFFFFF",

border:"none",

padding:"14px 26px",

borderRadius:14,

cursor:"pointer",

fontWeight:700

}}

>

View My Consultations

</button>

</div>

</div>

)}

{/* ============================================================
                 CONSULTATION HISTORY
============================================================ */}

<div
  style={{
    marginTop: isCompact ? 18 : 40,
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: isCompact ? 20 : 28,
    overflow: "hidden"
  }}
>
  <div
    style={{
      padding: isMobile ? "16px 14px" : isTablet ? "20px 18px" : "26px 28px",
      borderBottom: "1px solid #E2E8F0"
    }}
  >
    <div
      style={{
        color: "#F97316",
        fontSize: isMobile ? 9 : isTablet ? 10 : 11,
        fontWeight: 800,
        letterSpacing: 1.8,
        textTransform: "uppercase",
        marginBottom: 7
      }}
    >
      CONSULTATION HISTORY
    </div>

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "center",
        flexDirection: isMobile ? "column" : "row",
        gap: 7
      }}
    >
      <h2
        style={{
          margin: 0,
          color: "#0F172A",
          fontSize: isMobile ? 18 : isTablet ? 21 : 24,
          lineHeight: 1.2
        }}
      >
        My Consultations
      </h2>

      {(isMobile || isTablet) && consultationHistory.length > 0 && (
        <div
          style={{
            color: "#64748B",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: .35
          }}
        >
          Swipe left or right to see →
        </div>
      )}
    </div>
  </div>

  {consultationHistoryLoading ? (
    <div
      style={{
        padding: isMobile ? 22 : 30,
        color: "#64748B",
        fontSize: isMobile ? 11 : 13
      }}
    >
      Loading consultation history...
    </div>
  ) : consultationHistory.length === 0 ? (
    <div
      style={{
        padding: isMobile ? 22 : 30,
        color: "#64748B",
        fontSize: isMobile ? 11 : 13
      }}
    >
      No consultations booked yet.
    </div>
  ) : (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch"
      }}
    >
      <table
        style={{
          width: "100%",
          minWidth: isCompact ? 780 : 900,
          borderCollapse: "collapse",
          fontSize: isMobile ? 10 : isTablet ? 11 : 13
        }}
      >
        <thead>
          <tr style={{ background: "#F8FAFC" }}>
            {[
              "BOOKED DATE",
              "PARTNER",
              "REASON / NOTES",
              "STATUS",
              "PARTNER CONTACT"
            ].map((heading) => (
              <th
                key={heading}
                style={{
                  padding: isMobile ? "9px 10px" : isTablet ? "10px 12px" : "13px 16px",
                  textAlign: "left",
                  color: "#64748B",
                  fontSize: isMobile ? 8 : isTablet ? 9 : 10,
                  fontWeight: 850,
                  letterSpacing: .75,
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid #E2E8F0"
                }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {consultationHistory.map((item: any) => {
            const status =
              String(
                item.status ??
                item.booking_status ??
                "pending"
              ).toLowerCase();

            const accepted =
              status === "accepted";

            return (
              <tr key={item.booking_id ?? item.request_id}>
                <td style={{ padding: isMobile ? "10px" : isTablet ? "11px 12px" : "14px 16px", color: "#475569", whiteSpace: "nowrap", borderBottom: "1px solid #E2E8F0", verticalAlign: "top" }}>
                  {item.booked_at ? new Date(item.booked_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                </td>

                <td style={{ padding: isMobile ? "10px" : isTablet ? "11px 12px" : "14px 16px", color: "#0F172A", fontWeight: 750, borderBottom: "1px solid #E2E8F0", verticalAlign: "top" }}>
                  <div>{item.partner_name || "Partner"}</div>
                  {item.partner_city && (
                    <div style={{ marginTop: 3, color: "#64748B", fontSize: isMobile ? 9 : 11, fontWeight: 500 }}>
                      {item.partner_city}
                    </div>
                  )}
                </td>

                <td style={{ padding: isMobile ? "10px" : isTablet ? "11px 12px" : "14px 16px", color: "#475569", borderBottom: "1px solid #E2E8F0", verticalAlign: "top", maxWidth: 330 }}>
                  <div style={{ color: "#0F172A", fontWeight: 700 }}>{item.topic || "Consultation"}</div>
                  <div style={{ marginTop: 4, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{item.description || "No notes added"}</div>
                </td>

                <td style={{ padding: isMobile ? "10px" : isTablet ? "11px 12px" : "14px 16px", borderBottom: "1px solid #E2E8F0", verticalAlign: "top" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: isMobile ? "4px 7px" : "5px 9px",
                      borderRadius: 999,
                      background: accepted ? "#ECFDF5" : status === "rejected" ? "#FEF2F2" : "#FEFCE8",
                      border: `1px solid ${accepted ? "#BBF7D0" : status === "rejected" ? "#FECACA" : "#FDE68A"}`,
                      color: accepted ? "#15803D" : status === "rejected" ? "#B91C1C" : "#A16207",
                      fontSize: isMobile ? 8 : 9,
                      fontWeight: 850,
                      textTransform: "capitalize",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {status || "pending"}
                  </span>
                </td>

                <td style={{ padding: isMobile ? "10px" : isTablet ? "11px 12px" : "14px 16px", color: "#475569", borderBottom: "1px solid #E2E8F0", verticalAlign: "top", minWidth: 180 }}>
                  {accepted ? (
                    <div>
                      {item.partner_phone && (
                        <div style={{ fontWeight: 700 }}>{item.partner_phone}</div>
                      )}
                      {item.partner_email && (
                        <div style={{ marginTop: 3, fontSize: isMobile ? 9 : 11, wordBreak: "break-word" }}>{item.partner_email}</div>
                      )}
                      {!item.partner_phone && !item.partner_email && "Contact details not available"}
                    </div>
                  ) : (
                    <span style={{ color: "#94A3B8" }}>Available after acceptance</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</div>

    </div>
</div>
);
}