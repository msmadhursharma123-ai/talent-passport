import React from "react";

import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSlider from "../components/landing/HeroSlider";

import ProblemSection from "../components/landing/ProblemSection";

import ImageSection from "../components/common/ImageSection";
import JourneySection from "../components/common/JourneySection";
import PartnerSection from "../components/identityWorld/sections/PartnerSection";
import FounderSection from "../components/landing/FounderSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import AcademicIntelligenceSection from "../components/identityWorld/sections/AcademicIntelligenceSection";
import SchoolSection from "../components/identityWorld/sections/SchoolSection";
import LandingCTA from "../components/common/LandingCTA";
import LandingFooter from "../components/common/LandingFooter";

interface Props {
    onContinue: () => void;
}

export default function IdentityWorld({
    onContinue,
}: Props) {

    return (

     <main
    className="landing-shell"
    style={{
        background: "#FFFFFF",
        overflowX: "hidden",
    }}
>
        {/* Identity World visual corrections
            - Keep the public landing navbar solid white.
            - Move the hero content down to match the frozen landing layout.
            - These are intentionally scoped to this page only.
        */}
        <style>{`
            .landing-shell .landing-navbar {
                background: #FFFFFF !important;
                background-color: #FFFFFF !important;
                z-index: 100 !important;
            }

            .landing-shell .landing-navbar-scrolled {
                background: #FFFFFF !important;
                background-color: #FFFFFF !important;
            }

            .landing-shell #hero {
                position: relative;
                transform: translateY(72px);
                margin-bottom: 72px;
            }
        `}</style>

        {/* ===========================
        NAVBAR
    =========================== */}

    <LandingNavbar
        onPortalClick={onContinue}
    />

    {/* ===========================
        HERO
    =========================== */}

    <section id="hero">

        <HeroSlider
            onContinue={onContinue}
        />

    </section>

    {/* ===========================
        PROBLEM
    =========================== */}

    <section id="problem">

        <ProblemSection />

    </section>


    {/* ===========================
        SchoolSection
    =========================== */}

    <section id="schoolsection">

        <SchoolSection />

    </section>

    {/* ===========================
        IMAGINE
    =========================== */}

    <section id="imagine">

        <ImageSection />

    </section>

    {/* ===========================
        JOURNEY
    =========================== */}

    <section id="journey">

        <JourneySection />

    </section>

        {/* ===========================
        academic
    =========================== */}

    <section id="academicintelligence">

        <AcademicIntelligenceSection />

    </section>


       {/* ===========================
        Partner
    =========================== */}

    <section id="partnersection">

        <PartnerSection />

    </section>


    {/* ===========================
        FOUNDER MESSAGE
    =========================== */}

    <section id="founder">

        <FounderSection />

    </section>

    {/* ===========================
        TESTIMONIALS
    =========================== */}

    <section id="testimonials">

        <TestimonialsSection />

    </section>

    {/* ===========================
        FINAL CTA
    =========================== */}

    <LandingCTA
        onContinue={onContinue}
    />

    {/* ===========================
        FOOTER
    =========================== */}

    <LandingFooter
        onContinue={onContinue}
    />

</main>

    );
}