import React from "react";

interface Props {
  role: string;
  onBack: () => void;
  onSelect: (
    type: "new" | "existing"
  ) => void;
}

export default function UserType({
  role,
  onBack,
  onSelect,
}: Props) {

  const isAdmin =
    role === "admin";

  const roleTitle =
    role === "school"
      ? "School Portal"
      : role === "admin"
      ? "Admin Team Portal"
      : "Student / Parent Portal";

  const newLabel =
    role === "school"
      ? "New School"
      : "New User";

  const existingLabel =
    role === "school"
      ? "Existing School"
      : "Existing User";

  const cardStyle = {
    background: "white",
    borderRadius: "24px",
    padding: "35px",
    minHeight: "320px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    cursor: "pointer",
    boxShadow:
      "0 10px 25px rgba(0,0,0,0.06)",
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
          ← Back to Portal Selection
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
          {roleTitle}
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "24px",
            marginBottom: "60px",
          }}
        >
          Choose how you would like to continue.
        </p>

        {isAdmin ? (

          <div
            style={{
              maxWidth: "700px",
            }}
          >
            <div
              style={cardStyle}
              onClick={() =>
                onSelect("existing")
              }
            >
              <div>
                <h2
                  style={{
                    color: "#143B73",
                    fontSize: "32px",
                    marginBottom: "15px",
                  }}
                >
                  Admin Team Login
                </h2>

                <p
                  style={{
                    color: "#666",
                    fontSize: "18px",
                    lineHeight: "1.7",
                  }}
                >
                  Access platform
                  operations, student
                  records, competition
                  management, analytics
                  and evaluation systems.
                </p>
              </div>

              <button
                style={buttonStyle}
              >
                Login →
              </button>
            </div>
          </div>

        ) : (

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, 1fr)",
              gap: "30px",
            }}
          >
            <div
              style={cardStyle}
              onClick={() =>
                onSelect("new")
              }
            >
              <div>
                <h2
                  style={{
                    color: "#143B73",
                    fontSize: "32px",
                    marginBottom: "15px",
                  }}
                >
                  {newLabel}
                </h2>

                <p
                  style={{
                    color: "#666",
                    fontSize: "18px",
                    lineHeight: "1.7",
                  }}
                >
                  Begin your Talent Passport
                  journey with identity setup,
                  baseline assessment and
                  personalised talent mapping.
                </p>
              </div>

              <button
                style={buttonStyle}
              >
                Start Registration →
              </button>
            </div>

            <div
              style={cardStyle}
              onClick={() =>
                onSelect("existing")
              }
            >
              <div>
                <h2
                  style={{
                    color: "#143B73",
                    fontSize: "32px",
                    marginBottom: "15px",
                  }}
                >
                  {existingLabel}
                </h2>

                <p
                  style={{
                    color: "#666",
                    fontSize: "18px",
                    lineHeight: "1.7",
                  }}
                >
                  Access your Talent Passport,
                  rankings, analytics,
                  assessments, reports and
                  growth dashboard.
                </p>
              </div>

              <button
                style={buttonStyle}
              >
                Login →
              </button>
            </div>
          </div>

        )}
      </div>
    </div>
  );
}