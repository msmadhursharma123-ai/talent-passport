import React from "react";

interface LandingCTAProps {
    onContinue: () => void;
}

export default function LandingCTA({
    onContinue,
}: LandingCTAProps) {
    return (
        <section className="landing-cta">

            <div className="landing-cta-glow" />

            <div className="landing-cta-container">

                <div className="landing-cta-eyebrow">
                    YOUR JOURNEY STARTS HERE
                </div>

                <h2 className="landing-cta-title">
                    One Passport.
                    <br />
                    One Identity.
                    <br />
                    Endless Possibilities.
                </h2>

  <p className="landing-cta-description">

    <span className="landing-cta-line">
        
    </span>

    <span className="landing-cta-line-secondary">
        Bring your entire learning journey together in one place and continue building your future.
    </span>

</p>

                <div className="landing-cta-actions">

                    <button
                        className="landing-cta-primary"
                        onClick={onContinue}
                    >
                        Login To Identity World →
                    </button>

                    <button
                        className="landing-cta-secondary"
                        onClick={() =>
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            })
                        }
                    >
                        Back To Top ↑
                    </button>

                </div>

            </div>

        </section>
    );
}