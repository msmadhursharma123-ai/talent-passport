import React from "react";

interface LandingFooterProps {
    onContinue: () => void;
}

export default function LandingFooter({
    onContinue,
}: LandingFooterProps) {
    return (

        <footer className="landing-footer">

            <div className="landing-footer-container">

                {/* ===========================
                    BRAND
                =========================== */}

                <div className="landing-footer-brand">

                    <div className="landing-footer-logo">
                        TALENT PASSPORT
                    </div>

                    <p className="landing-footer-description">

                        Building India's next generation talent
                        identity ecosystem where every learner can
                        discover, grow and showcase their journey
                        beyond marks.

                    </p>

                </div>

                {/* ===========================
                    EXPLORE
                =========================== */}

                <div className="landing-footer-column">

                    <h3>
                        Explore
                    </h3>

                    <a href="#hero">
                        Home
                    </a>

                    <a href="#journey">
                        Journey
                    </a>

                    <a href="#opportunities">
                        Opportunities
                    </a>

                    <a href="#community">
                        Community
                    </a>

                </div>

                {/* ===========================
                    ECOSYSTEM
                =========================== */}

                <div className="landing-footer-column">

                    <h3>
                        Ecosystem
                    </h3>

                    <span>
                        Students
                    </span>

                    <span>
                        Schools
                    </span>

                    <span>
                        Teachers
                    </span>

                    <span>
                        Partners
                    </span>

                </div>

                {/* ===========================
                    CTA
                =========================== */}

                <div className="landing-footer-column">

                    <h3>
                        Get Started
                    </h3>

                    <p className="landing-footer-small">

                        Continue your Talent Passport journey.

                    </p>

                    <button
                        className="landing-footer-button"
                        onClick={onContinue}
                    >

                        Login To Identity World →

                    </button>

                </div>

            </div>

            {/* ===========================
                BOTTOM
            =========================== */}

            <div className="landing-footer-bottom">

                <p>

                    © 2026 Talent Passport OS.
                    All Rights Reserved.

                </p>

                <div className="landing-footer-links">

                    <span>
                        Privacy
                    </span>

                    <span>
                        Terms
                    </span>

                    <span>
                        Contact
                    </span>

                </div>

            </div>

        </footer>

    );
}