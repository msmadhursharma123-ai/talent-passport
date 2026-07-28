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

  const cardStyle: React.CSSProperties = {
    background:
      "rgba(255,255,255,0.94)",
    borderRadius: "20px",
    padding: "29px",
    minHeight: "265px",

    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",

    cursor: "pointer",

    border:
      "1px solid rgba(20,59,115,0.10)",

    boxShadow:
      "0 14px 34px rgba(15,23,42,0.075)",

    backdropFilter: "blur(8px)",
  };

  const buttonStyle: React.CSSProperties = {
    marginTop: "24px",

    background:
      "linear-gradient(135deg, #F4A623 0%, #FFB21C 100%)",

    color: "white",

    border: "none",

    borderRadius: "10px",

    padding: "12px 18px",

    fontSize: "15px",

    fontWeight: 700,

    cursor: "pointer",

    width: "fit-content",

    boxShadow:
      "0 6px 16px rgba(244,166,35,0.22)",
  };

  return (
    <div
      className="onboarding-page"
      style={{
        minHeight: "100vh",

        background:
          "linear-gradient(135deg, #F8F7F4 0%, #FCFAF7 38%, #FFF7EE 70%, #F3F6FB 100%)",

        padding: "59px",

        position: "relative",

        overflow: "hidden",
      }}
    >

      {/* ======================================================
          BACKGROUND TEXTURE
      ====================================================== */}

      {/* LARGE WARM TOP RIGHT CIRCLE */}

      <div
        style={{
          position: "absolute",

          width: "500px",
          height: "500px",

          borderRadius: "50%",

          background:
            "rgba(244,166,35,0.085)",

          right: "-175px",
          top: "-215px",

          pointerEvents: "none",
        }}
      />

      {/* INNER WARM GLOW */}

      <div
        style={{
          position: "absolute",

          width: "270px",
          height: "270px",

          borderRadius: "50%",

          background:
            "rgba(255,184,76,0.055)",

          right: "7%",
          top: "18%",

          pointerEvents: "none",
        }}
      />

      {/* LARGE BLUE BOTTOM LEFT CIRCLE */}

      <div
        style={{
          position: "absolute",

          width: "410px",
          height: "410px",

          borderRadius: "50%",

          background:
            "rgba(20,59,115,0.060)",

          left: "-205px",
          bottom: "-215px",

          pointerEvents: "none",
        }}
      />

      {/* WARM BOTTOM CIRCLE */}

      <div
        style={{
          position: "absolute",

          width: "235px",
          height: "235px",

          borderRadius: "50%",

          background:
            "rgba(244,166,35,0.060)",

          right: "15%",
          bottom: "7%",

          pointerEvents: "none",
        }}
      />

      {/* VERY SOFT CENTER TEXTURE */}

      <div
        style={{
          position: "absolute",

          width: "550px",
          height: "550px",

          borderRadius: "50%",

          background:
            "radial-gradient(circle, rgba(244,166,35,0.035) 0%, rgba(244,166,35,0) 70%)",

          left: "35%",
          top: "20%",

          pointerEvents: "none",
        }}
      />

      {/* ======================================================
          PAGE CONTENT
      ====================================================== */}

      <div
        className="user-type-content"
        style={{
          maxWidth: "1060px",

          margin: "0 auto",

          position: "relative",

          zIndex: 1,
        }}
      >

        {/* BACK */}

        <button
          className="user-type-back"
          onClick={onBack}
          style={{
            background: "transparent",

            border: "none",

            color: "#143B73",

            fontSize: "15px",

            fontWeight: 700,

            cursor: "pointer",

            marginBottom: "24px",

            padding: 0,
          }}
        >
          ← Back to Portal Selection
        </button>

        {/* EYEBROW */}

        <div
          className="user-type-eyebrow"
          style={{
            color: "#F4A623",

            letterSpacing: "2.6px",

            fontWeight: 700,

            marginBottom: "16px",

            fontSize: "15px",
          }}
        >
          TALENT PASSPORT
        </div>

        {/* TITLE */}

        <h1
          className="user-type-title"
          style={{
            fontSize: "60px",

            color: "#143B73",

            margin: 0,

            marginBottom: "12px",

            lineHeight: "1.08",

            fontWeight: 500,

            letterSpacing: "-1px",
          }}
        >
          {roleTitle}
        </h1>

        {/* SUBTITLE */}

        <p
          className="user-type-subtitle"
          style={{
            color: "#555",

            fontSize: "20px",

            marginTop: 0,

            marginBottom: "51px",

            lineHeight: "1.5",
          }}
        >
          Choose how you would like to continue.
        </p>

        {/* ======================================================
            ADMIN
        ====================================================== */}

        {isAdmin ? (

          <div
            style={{
              maxWidth: "570px",
            }}
          >

            <div
              className="user-type-card"
              style={cardStyle}
              onClick={() =>
                onSelect("existing")
              }
            >

              <div>

                <h2
                  style={{
                    color: "#143B73",

                    fontSize: "27px",

                    marginTop: 0,

                    marginBottom: "12px",

                    fontWeight: 600,
                  }}
                >
                  Admin Team Login
                </h2>

                <p
                  style={{
                    color: "#666",

                    fontSize: "15px",

                    lineHeight: "1.65",

                    margin: 0,
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

          /* ====================================================
              NEW / EXISTING USER
          ==================================================== */

          <div
            className="user-type-grid"
            style={{
              display: "grid",

              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",

              gap: "24px",
            }}
          >

            {/* NEW USER */}

            <div
              className="user-type-card"
              style={cardStyle}
              onClick={() =>
                onSelect("new")
              }
            >

              <div>

                <h2
                  style={{
                    color: "#143B73",

                    fontSize: "27px",

                    marginTop: 0,

                    marginBottom: "12px",

                    fontWeight: 600,
                  }}
                >
                  {newLabel}
                </h2>

                <p
                  style={{
                    color: "#666",

                    fontSize: "15px",

                    lineHeight: "1.65",

                    margin: 0,
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

            {/* EXISTING USER */}

            <div
              className="user-type-card"
              style={cardStyle}
              onClick={() =>
                onSelect("existing")
              }
            >

              <div>

                <h2
                  style={{
                    color: "#143B73",

                    fontSize: "27px",

                    marginTop: 0,

                    marginBottom: "12px",

                    fontWeight: 600,
                  }}
                >
                  {existingLabel}
                </h2>

                <p
                  style={{
                    color: "#666",

                    fontSize: "15px",

                    lineHeight: "1.65",

                    margin: 0,
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

    
<style>{`
@media (max-width: 1024px) {
  .onboarding-page { padding: 36px 28px !important; box-sizing: border-box; }
  .user-type-content { max-width: 100% !important; }
  .user-type-title { font-size: 46px !important; }
  .user-type-grid { gap: 18px !important; }
  .user-type-card { min-height: 230px !important; padding: 24px !important; }
}
@media (max-width: 700px) {
  .onboarding-page { min-height: 100dvh !important; padding: 22px 14px !important; overflow-y: auto !important; }
  .user-type-content { width: 100% !important; }
  .user-type-back { margin-bottom: 18px !important; font-size: 13px !important; }
  .user-type-eyebrow { margin-bottom: 10px !important; font-size: 11px !important; letter-spacing: 2px !important; }
  .user-type-title { font-size: 32px !important; line-height: 1.08 !important; letter-spacing: -.4px !important; }
  .user-type-subtitle { margin-bottom: 24px !important; font-size: 15px !important; }
  .user-type-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
  .user-type-card { min-height: 0 !important; padding: 18px !important; border-radius: 17px !important; }
  .user-type-card h2 { font-size: 21px !important; margin-bottom: 7px !important; }
  .user-type-card p { font-size: 13px !important; line-height: 1.45 !important; }
  .user-type-card button { margin-top: 16px !important; padding: 10px 14px !important; font-size: 13px !important; }
}
`}</style>
</div>
  );
}