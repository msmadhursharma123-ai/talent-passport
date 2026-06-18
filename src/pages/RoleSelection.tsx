import React from "react";

interface Props {
  onSelect: (role: string) => void;
  onBack: () => void;
}

export default function RoleSelection({
  onSelect,
  onBack,
}: Props) {
  const cardStyle = {
    background: "white",
    borderRadius: "24px",
    padding: "35px",
    cursor: "pointer",
    minHeight: "320px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    boxShadow:
      "0 10px 25px rgba(0,0,0,0.06)",
    transition: "0.3s",
  };

  const titleStyle = {
    fontSize: "30px",
    color: "#143B73",
    marginBottom: "15px",
    fontWeight: 600,
  };

  const descriptionStyle = {
    fontSize: "17px",
    color: "#666",
    lineHeight: "1.7",
  };

  const buttonStyle = {
    marginTop: "30px",
    background: "#F4A623",
    color: "white",
    border: "none",
    borderRadius: "12px",
    padding: "14px 22px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    width: "fit-content",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F7F4",
        padding: "70px",
      }}
    >
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: "#143B73",
            fontSize: "18px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "30px",
          }}
        >
          ← Back to Identity World
        </button>

        <div
          style={{
            color: "#F4A623",
            letterSpacing: "3px",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          TALENT PASSPORT
        </div>

        <h1
          style={{
            fontSize: "72px",
            color: "#143B73",
            marginBottom: "15px",
            lineHeight: "1.1",
          }}
        >
          Choose Your Portal
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "24px",
            marginBottom: "60px",
          }}
        >
          Access your dedicated Talent Passport environment.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: "30px",
          }}
        >
          <div
            style={cardStyle}
            onClick={() =>
              onSelect("student")
            }
          >
            <div>
              <h2 style={titleStyle}>
                Student / Parent
              </h2>

              <p style={descriptionStyle}>
                Talent Passport, rankings,
                achievements, DNA profile,
                growth analytics and verified
                progress records.
              </p>
            </div>

            <button style={buttonStyle}>
              Enter Portal →
            </button>
          </div>

          <div
            style={cardStyle}
            onClick={() =>
              onSelect("school")
            }
          >
            <div>
              <h2 style={titleStyle}>
                School Admin
              </h2>

              <p style={descriptionStyle}>
                School leaderboard,
                participation tracking,
                rankings, reports,
                analytics and talent
                intelligence dashboard.
              </p>
            </div>

            <button style={buttonStyle}>
              Enter Portal →
            </button>
          </div>

          <div
            style={cardStyle}
            onClick={() =>
              onSelect("teacher")
            }
          >
            <div>
              <h2 style={titleStyle}>
                Teacher Portal
              </h2>

              <p style={descriptionStyle}>
                Student mentoring,
                evaluations, participation
                monitoring and performance
                insights.
              </p>
            </div>

            <button style={buttonStyle}>
              Enter Portal →
            </button>
          </div>

          <div
            style={cardStyle}
            onClick={() =>
              onSelect("partner")
            }
          >
            <div>
              <h2 style={titleStyle}>
                Partner Portal
              </h2>

              <p style={descriptionStyle}>
                Workshops, scholarships,
                masterclasses, talent
                discovery and ecosystem
                collaboration.
              </p>
            </div>

            <button style={buttonStyle}>
              Enter Portal →
            </button>
          </div>

          <div
  style={cardStyle}
  onClick={() =>
    onSelect("admin")
  }
>
  <div>
    <h2 style={titleStyle}>
      Admin Team
    </h2>

    <p style={descriptionStyle}>
      Competition operations,
      evaluations, platform
      analytics, reports,
      leaderboard management
      and ecosystem controls.
    </p>
  </div>

  <button style={buttonStyle}>
    Enter Portal →
  </button>
</div>
        </div>
      </div>
    </div>
  );
}