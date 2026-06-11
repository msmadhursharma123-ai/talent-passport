import React from "react";

export default function GrowthCenter() {
    <button
  onClick={() =>
    window.location.reload()
  }
  style={{
    background: "#143B73",
    color: "white",
    border: "none",
    borderRadius: 12,
    padding: "10px 18px",
    cursor: "pointer",
    marginBottom: 20,
  }}
>
  ← Back To Passport
</button>
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F7F4",
        padding: 40,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: 30,
          }}
        >
          <div
            style={{
              color: "#F97316",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            STUDENT DEVELOPMENT CENTER
          </div>

          <h1
            style={{
              color: "#143B73",
              fontSize: 48,
              marginTop: 10,
            }}
          >
            Growth Plan & Recommendations
          </h1>
        </div>

        {/* DNA SNAPSHOT */}

        <div
          style={{
            background: "white",
            borderRadius: 24,
            padding: 30,
            marginBottom: 25,
          }}
        >
          <h2>DNA Snapshot</h2>

          <div
            style={{
              marginTop: 20,
              lineHeight: 2,
              fontSize: 18,
            }}
          >
            ✓ Observe before acting
            <br />
            ✓ Think deeply before speaking
            <br />
            ✓ Prefer quality over quantity
            <br />
            ✓ Solve problems creatively
          </div>
        </div>

        {/* RECOMMENDATIONS */}

        <div
          style={{
            background: "white",
            borderRadius: 24,
            padding: 30,
            marginBottom: 25,
          }}
        >
          <h2>Recommended Activities</h2>

          <ul
            style={{
              marginTop: 20,
              lineHeight: 2,
              fontSize: 18,
            }}
          >
            <li>Public Speaking</li>
            <li>School Council</li>
            <li>Case Competitions</li>
            <li>Entrepreneurship Club</li>
          </ul>
        </div>

        {/* 90 DAY PLAN */}

        <div
          style={{
            background: "white",
            borderRadius: 24,
            padding: 30,
          }}
        >
          <h2>90-Day Growth Plan</h2>

          <div
            style={{
              marginTop: 25,
              lineHeight: 2,
              fontSize: 18,
            }}
          >
            <strong>Month 1</strong>
            <br />
            • Participate in 1 speaking activity
            <br />
            <br />

            <strong>Month 2</strong>
            <br />
            • Join a team competition
            <br />
            <br />

            <strong>Month 3</strong>
            <br />
            • Present before audience
            <br />
            <br />

            <strong>Expected Outcome</strong>
            <br />
            Communication: 58 → 72
            <br />
            Confidence: 42 → 68
          </div>
        </div>
      </div>
    </div>
  );
}