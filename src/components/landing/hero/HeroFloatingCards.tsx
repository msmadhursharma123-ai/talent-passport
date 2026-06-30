interface HeroFloatingCardsProps {
  studentName?: string;
  growthScore?: number;
  credits?: number;
}

export default function HeroFloatingCards({
  studentName = "Student Identity",
  growthScore = 91,
  credits = 1240,
}: HeroFloatingCardsProps) {
  return (
    <div className="hero-passport-stack">

      {/* ===========================================
          MAIN PASSPORT
      =========================================== */}

      <div className="passport-card">

        <div className="passport-top">

          <div>

            <div className="passport-title">
              TALENT PASSPORT
            </div>

            <div className="passport-subtitle">
              VERIFIED DIGITAL IDENTITY
            </div>

          </div>

          <div className="passport-badge">
            VERIFIED
          </div>

        </div>

        <div className="passport-profile">

          <div className="passport-avatar">

            TP

          </div>

          <div>

            <h3>
              {studentName}
            </h3>

            <p>
              AI Powered Student Profile
            </p>

          </div>

        </div>

        <div className="passport-score-card">

          <div>

            <span>
              Growth Score
            </span>

            <strong>
              {growthScore}
            </strong>

          </div>

          <div className="score-ring">

            91

          </div>

        </div>

        <div className="passport-section-title">

          Core Skills

        </div>

        <div className="passport-skills">

          <span>Leadership</span>

          <span>Communication</span>

          <span>Creativity</span>

          <span>Critical Thinking</span>

          <span>Confidence</span>

          <span>Collaboration</span>

        </div>

        <div className="passport-divider" />

        <div className="passport-section-title">

          Talent Ecosystem

        </div>

        <div className="passport-features">

          <div className="passport-feature">

            <span>🏆</span>

            Competitions

          </div>

          <div className="passport-feature">

            <span>📂</span>

            Portfolio

          </div>

          <div className="passport-feature">

            <span>📅</span>

            Timeline

          </div>

          <div className="passport-feature">

            <span>🎯</span>

            Credits

          </div>

          <div className="passport-feature">

            <span>⭐</span>

            Marketplace

          </div>

          <div className="passport-feature">

            <span>🪪</span>

            Passport

          </div>

        </div>

        <div className="passport-divider" />

        <div className="passport-footer">

          <div>

            <span>Total Credits</span>

            <strong>

              {credits}

            </strong>

          </div>

          <div className="passport-qr">

            QR

          </div>

        </div>

      </div>

            {/* ===========================================
          FLOATING ACHIEVEMENT CARD
      =========================================== */}

      <div className="floating-card achievement-card">
        <div className="floating-icon">
          🏆
        </div>

        <div className="floating-content">
          <span>Latest Achievement</span>

          <strong>National Debate Finalist</strong>

          <small>+120 Credits Earned</small>
        </div>
      </div>

      {/* ===========================================
          LEADERBOARD CARD
      =========================================== */}

      <div className="floating-card leaderboard-card">
        <div className="floating-icon">
          ⭐
        </div>

        <div className="floating-content">
          <span>Leaderboard</span>

          <strong>Top 5%</strong>

          <small>National Ranking</small>
        </div>
      </div>

      {/* ===========================================
          PORTFOLIO CARD
      =========================================== */}

      <div className="floating-card portfolio-card">
        <div className="floating-icon">
          📂
        </div>

        <div className="floating-content">
          <span>Portfolio</span>

          <strong>24 Projects</strong>

          <small>Continuously Growing</small>
        </div>
      </div>

      {/* ===========================================
          CREDITS CARD
      =========================================== */}

      <div className="floating-card credits-card">
        <div className="floating-icon">
          🎯
        </div>

        <div className="floating-content">
          <span>Credits Wallet</span>

          <strong>{credits} Credits</strong>

          <small>Redeem for Workshops</small>
        </div>
      </div>

      {/* ===========================================
          TIMELINE CARD
      =========================================== */}

      <div className="floating-card timeline-card">
        <div className="floating-icon">
          📅
        </div>

        <div className="floating-content">
          <span>Timeline</span>

          <strong>Always Updated</strong>

          <small>Every Achievement Recorded</small>
        </div>
      </div>

    </div>
  );
}