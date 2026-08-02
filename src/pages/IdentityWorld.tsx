import React from "react";

import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSlider from "../components/landing/HeroSlider";

import ProblemSection from "../components/landing/ProblemSection";

import ImageSection from "../components/common/ImageSection";
import JourneySection from "../components/common/JourneySection";

import FounderSection from "../components/landing/FounderSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import AcademicIntelligenceSection from "../components/identityWorld/sections/AcademicIntelligenceSection";
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
        IMAGINE
    =========================== */}

    <section id="imagine">

        <ImageSection />

    </section>

        {/* ===========================
        academic
    =========================== */}

    <section id="academicintelligence">

        <AcademicIntelligenceSection />

    </section>

    {/* ===========================
        JOURNEY
    =========================== */}

    <section id="journey">

        <JourneySection />

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