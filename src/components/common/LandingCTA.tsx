import React from "react";
import { ArrowRight } from "lucide-react";

interface LandingCTAProps {
  onContinue: () => void;
}

export default function LandingCTA({ onContinue }: LandingCTAProps) {
  return (
    <section className="iw-footer-cta">
      <div className="iw-page-container">
        <div className="iw-footer-cta-inner">
          <div>
            <div className="iw-section-eyebrow">YOUR JOURNEY STARTS HERE</div>
            <h2>One Passport. One Identity. Endless Possibilities.</h2>
            <p>
              Bring learning, growth, recognition and opportunity together in
              one connected student identity.
            </p>
          </div>

          <button type="button" onClick={onContinue}>
            Login to Identity World
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
