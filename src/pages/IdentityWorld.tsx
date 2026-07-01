import React from "react";

import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSlider from "../components/landing/HeroSlider";

import ProblemSection from "../components/landing/ProblemSection";

import ImageSection from "../components/common/ImageSection";
import JourneySection from "../components/common/JourneySection";
import RecognitionSection from "../components/common/RecognitionSection";
import OpportunitySection from "../components/common/OpportunitySection";
import CommunitySection from "../components/common/CommunitySection";
import ImpactSection from "../components/common/ImpactSection";
import FounderSection from "../components/landing/FounderSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import NationalsJourneySection from "../components/landing/NationalsJourneySection";
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
        JOURNEY
    =========================== */}

    <section id="journey">

        <JourneySection />

    </section>

    {/* ===========================
        RECOGNITION
    =========================== */}

    <section id="recognition">

        <RecognitionSection />

    </section>

    {/* ===========================
        ROAD TO NATIONALS
    =========================== */}

    <section id="nationals">

        <NationalsJourneySection />

    </section>

    {/* ===========================
        OPPORTUNITIES
    =========================== */}

    <section id="opportunities">

        <OpportunitySection />

    </section>

    {/* ===========================
        COMMUNITY
    =========================== */}

    <section id="community">

        <CommunitySection />

    </section>

    {/* ===========================
        IMPACT
    =========================== */}

    <section id="impact">

        <ImpactSection />

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