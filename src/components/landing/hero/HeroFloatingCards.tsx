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
              Academic & Talent Growth Profile
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

          Student Growth Ecosystem

        </div>

        <div className="passport-features">

          <div className="passport-feature">

            <span>📚</span>

            Daily Learning

          </div>

          <div className="passport-feature">

            <span>🏆</span>

            Competitions

          </div>

          <div className="passport-feature">

            <span>💬</span>

            Teacher Feedback

          </div>

          <div className="passport-feature">

            <span>🎯</span>

            Talent Credits

          </div>

          <div className="passport-feature">

            <span>🛍️</span>

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

          <small>Recognized This Week</small>

        </div>

      </div>

   {/* ===========================================
    DAILY LEARNING CARD
=========================================== */}

<div className="floating-card leaderboard-card">

    <div className="floating-card-watermark">
        🎓
    </div>

    <div className="floating-icon">
        📚
    </div>

    <div className="floating-content">

        <span>Daily Learning</span>

        <strong>5 / 6 Classes</strong>

        <small>Today's Progress</small>

        <div className="daily-progress">

            <div
                className="daily-progress-fill"
                style={{ width: "83%" }}
            />

        </div>

        <div className="daily-subject-grid">

            <div className="subject-chip complete">
                📖 English ✓
                <span className="subject-check">✓</span>
            </div>

            <div className="subject-chip complete">
                ➗ Maths ✓
                <span className="subject-check">✓</span>
            </div>

            <div className="subject-chip complete">
                🧪 Science ✓
                <span className="subject-check">✓</span>
            </div>

            <div className="subject-chip">
                🌍 Social
                <span className="subject-check">✓</span>
            </div>

            <div className="subject-chip">
                🎨 Art
                <span className="subject-check">✓</span>
            </div>

            <div className="subject-chip">
                🇮🇳 Hindi
                <span className="subject-check">✓</span>
            </div>

        </div>

        <div className="daily-footer">

            <span>
                ⏱ 1 Class Remaining
            </span>

        </div>

    </div>

</div>

      {/* ===========================================
          MARKETPLACE CARD
      =========================================== */}

      <div className="floating-card portfolio-card">

        <div className="floating-icon">

          🛍️

        </div>

        <div className="floating-content">

          <span>Marketplace</span>

          <strong>18 Opportunities</strong>

          <small>Scholarships & Workshops</small>

        </div>

      </div>

      {/* ===========================================
          TALENT CREDITS CARD
      =========================================== */}

      <div className="floating-card credits-card">

        <div className="floating-icon">

          🎯

        </div>

        <div className="floating-content">

          <span>Talent Credits</span>

          <strong>{credits} Credits</strong>

          <small>Unlock New Opportunities</small>

        </div>

      </div>

{/* ===========================================
    TEACHER FEEDBACK CARD
=========================================== */}

<div className="floating-card timeline-card">

    <div className="floating-card-watermark">
        ✨
    </div>

    <div className="floating-icon">
        💬
    </div>

    <div className="floating-content">

        <span>Teacher Feedback</span>

        <strong>Excellent Progress</strong>

        <small>Updated This Week</small>

        <div className="feedback-grid">

            <div className="feedback-chip">
                <label>Communication</label>
                <strong>A+</strong>
            </div>

            <div className="feedback-chip">
                <label>Critical Thinking</label>
                <strong>A</strong>
            </div>

            <div className="feedback-chip">
                <label>Participation</label>
                <strong>A+</strong>
            </div>

        </div>

    </div>

</div>

    </div>
  );
}