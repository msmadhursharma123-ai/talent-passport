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

  const roleConfig = {

    student: {
      title: "Student / Parent Portal",
      subtitle:
        "{currentRole.subtitle}",
      newLabel: "New User",
      existingLabel: "Existing User",
      newDescription:
        "{currentRole.newDescription}",
      existingDescription:
        "{currentRole.existingDescription}"
    },

    partner: {
      title: "Partner Portal",
      subtitle:
        "Register your institute or access your partner dashboard.",
      newLabel: "New Partner",
      existingLabel: "Existing Partner",
      newDescription:
        "Join the Talent Passport ecosystem and showcase your workshops, scholarships, masterclasses and talent opportunities.",
      existingDescription:
        "Manage programs, discover talent, track student engagement and grow your institute network."
    },

    school: {
      title: "School Portal",
      subtitle:
        "Access school intelligence and student analytics.",
      newLabel: "New School",
      existingLabel: "Existing School",
      newDescription:
        "Register your school and unlock talent analytics, competitions and growth insights.",
      existingDescription:
        "Access reports, rankings, student performance and school intelligence dashboards."
    },

    teacher: {
      title: "Teacher Portal",
      subtitle:
        "Manage classroom performance and student development.",
      newLabel: "New Teacher",
      existingLabel: "Existing Teacher",
      newDescription:
        "Join Talent Passport and access classroom tools and student development resources.",
      existingDescription:
        "Review student growth, assessments and classroom performance insights."
    }

  };

  const currentRole =
    roleConfig[
      role as keyof typeof roleConfig
    ] || roleConfig.student;

  const roleTitle =
    currentRole.title;

  const newLabel =
    currentRole.newLabel;

  const existingLabel =
    currentRole.existingLabel;

  const cardStyle = {
    background: "white",
    borderRadius: "15px",
    padding: "22px",
    minHeight: "200px",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    cursor: "pointer",
    boxShadow:
      "0 6px 16px rgba(0,0,0,0.06)",
  };

  const buttonStyle = {
    marginTop: "18px",
    background: "#F4A623",
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "9px 14px",
    fontSize: "11px",
    fontWeight: 600,
    cursor: "pointer",
    width: "fit-content",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F7F4",
        padding: "44px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: "#143B73",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "18px",
          }}
        >
          ← Back to Portal Selection
        </button>

        <div
          style={{
            color: "#F4A623",
            letterSpacing: "2px",
            fontWeight: 600,
            marginBottom: "12px",
            fontSize: "11px",
          }}
        >
          TALENT PASSPORT
        </div>

        <h1
          style={{
            fontSize: "45px",
            color: "#143B73",
            marginBottom: "9px",
            lineHeight: "1.1",
          }}
        >
          {roleTitle}
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "15px",
            marginBottom: "38px",
          }}
        >
          Choose how you would like to continue.
        </p>

        {isAdmin ? (

          <div
            style={{
              maxWidth: "430px",
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
                    fontSize: "20px",
                    marginBottom: "9px",
                  }}
                >
                  Admin Team Login
                </h2>

                <p
                  style={{
                    color: "#666",
                    fontSize: "11px",
                    lineHeight: "1.6",
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
              gap: "18px",
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
                    fontSize: "20px",
                    marginBottom: "9px",
                  }}
                >
                  {newLabel}
                </h2>

                <p
                  style={{
                    color: "#666",
                    fontSize: "11px",
                    lineHeight: "1.6",
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
                    fontSize: "20px",
                    marginBottom: "9px",
                  }}
                >
                  {existingLabel}
                </h2>

                <p
                  style={{
                    color: "#666",
                    fontSize: "11px",
                    lineHeight: "1.6",
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