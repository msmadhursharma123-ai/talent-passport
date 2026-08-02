import HeroSection from "./sections/HeroSection";
import EducationGapSection from "./sections/EducationGapSection";
import EcosystemSection from "./sections/EcosystemSection";
import StudentJourneySection from "./sections/StudentJourneySection";
import AcademicIntelligenceSection from "./sections/AcademicIntelligenceSection";
import PortfolioSection from "./sections/PortfolioSection";
import CompetitionSection from "./sections/CompetitionSection";
import CreditsSection from "./sections/CreditsSection";
import MarketplaceSection from "./sections/MarketplaceSection";
import PartnerSection from "./sections/PartnerSection";
import SchoolSection from "./sections/SchoolSection";
import TeacherSection from "./sections/TeacherSection";
import ParentSection from "./sections/ParentSection";
import FounderSection from "./sections/FounderSection";
import CTASection from "./sections/CTASection";

import MotionReveal from "./shared/MotionReveal";
import ScrollProgress from "./shared/ScrollProgress";

type Props={

    onContinue?:()=>void;

};

export default function IdentityWorldV2({

    onContinue

}:Props){

    return (

        <main

            style={{

                width: "100%",

                overflowX: "hidden",

                background: "#020617",

                scrollBehavior: "smooth",

                position: "relative"

            }}

        >

            {/* ================================================= */}

            {/* GLOBAL STORY NAVIGATION */}

            {/* ================================================= */}

           

            {/* ================================================= */}

            {/* HERO */}

            {/* ================================================= */}

            <MotionReveal disabled>

                <HeroSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* EDUCATION GAP */}

            {/* ================================================= */}

            <MotionReveal delay={0.03}>

                <EducationGapSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* CONNECTED ECOSYSTEM */}

            {/* ================================================= */}

            <MotionReveal delay={0.05}>

                <EcosystemSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* STUDENT JOURNEY */}

            {/* ================================================= */}

            <MotionReveal delay={0.07}>

                <StudentJourneySection />

            </MotionReveal>

            {/* ================================================= */}

            {/* ACADEMIC INTELLIGENCE */}

            {/* ================================================= */}

            <MotionReveal delay={0.09}>

                <AcademicIntelligenceSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* DIGITAL IDENTITY */}

            {/* ================================================= */}

            <MotionReveal delay={0.11}>

                <PortfolioSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* COMPETITIONS */}

            {/* ================================================= */}

            <MotionReveal delay={0.13}>

                <CompetitionSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* CREDIT ECONOMY */}

            {/* ================================================= */}

            <MotionReveal delay={0.15}>

                <CreditsSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* OPPORTUNITY MARKETPLACE */}

            {/* ================================================= */}

            <MotionReveal delay={0.17}>

                <MarketplaceSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* PARTNER ECOSYSTEM */}

            {/* ================================================= */}

            <MotionReveal delay={0.19}>

                <PartnerSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* SCHOOL INTELLIGENCE */}

            {/* ================================================= */}

            <MotionReveal delay={0.21}>

                <SchoolSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* TEACHER INTELLIGENCE */}

            {/* ================================================= */}

            <MotionReveal delay={0.23}>

                <TeacherSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* PARENT INTELLIGENCE */}

            {/* ================================================= */}

            <MotionReveal delay={0.25}>

                <ParentSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* FOUNDER VISION */}

            {/* ================================================= */}

            <MotionReveal delay={0.27}>

                <FounderSection />

            </MotionReveal>

            {/* ================================================= */}

            {/* FINAL CTA */}

            {/* ================================================= */}

            <MotionReveal delay={0.30}>

                <CTASection />

            </MotionReveal>

        </main>

    );

}