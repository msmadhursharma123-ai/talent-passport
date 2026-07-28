import React from "react";

export type JourneySnapshotAchievement = {
  id: string;
  achievement_year: number;
  event_name: string;
  location: string;
  activity_category: string;
  achievement_level: string;
  achievement_type: string;
  verification_status?: string;
};

interface JourneySnapshotProps {
  previous?: JourneySnapshotAchievement;
  current?: JourneySnapshotAchievement;
  next?: JourneySnapshotAchievement;

  editAchievement: (
    achievement: JourneySnapshotAchievement
  ) => void;

  removeAchievement: (
    id: string
  ) => void;
}

export default function JourneySnapshot({
  previous,
  current,
  next,
  editAchievement,
  removeAchievement,
}: JourneySnapshotProps) {

  if (!current) {
    return (
      <div
        className="journey-snapshot-empty"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 26,
          padding: 34,
          marginBottom: 28,
          textAlign: "center",
        }}
      >
        <div
          className="journey-snapshot-empty-icon"
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#FFF7ED",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 28,
          }}
        >
          🏆
        </div>

        <div
          className="journey-snapshot-empty-title"
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#0F172A",
          }}
        >
          No achievement selected
        </div>

        <div
          className="journey-snapshot-empty-copy"
          style={{
            marginTop: 8,
            color: "#64748B",
            fontSize: 14,
          }}
        >
          Add an achievement to begin building your journey.
        </div>

        <ResponsiveStyles />
      </div>
    );
  }

  return (
    <>
      <div
        className="journey-snapshot-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr 1fr",
          gap: 22,
          marginBottom: 28,
        }}
      >
        {/* ================= PREVIOUS ================= */}

        <div
          className="journey-snapshot-side journey-snapshot-previous"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 24,
            padding: 24,
            minHeight: 270,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="journey-snapshot-label"
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#64748B",
              marginBottom: 18,
            }}
          >
            Previous Milestone
          </div>

          {previous ? (
            <>
              <div
                className="journey-snapshot-side-title"
                style={{
                  fontWeight: 800,
                  fontSize: 23,
                  lineHeight: 1.25,
                  color: "#0F172A",
                  marginBottom: 20,
                }}
              >
                {previous.event_name}
              </div>

              <div
                className="journey-snapshot-lines"
                style={{
                  display: "grid",
                  gap: 11,
                  color: "#475569",
                  fontSize: 14,
                }}
              >
                <SnapshotLine
                  icon="🏆"
                  value={previous.achievement_level}
                />

                <SnapshotLine
                  icon="📍"
                  value={previous.location}
                />

                <SnapshotLine
                  icon="📅"
                  value={previous.achievement_year}
                />

                <SnapshotLine
                  icon="🎯"
                  value={previous.activity_category}
                />
              </div>
            </>
          ) : (
            <div
              className="journey-snapshot-side-empty"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "#94A3B8",
                fontWeight: 700,
                lineHeight: 1.6,
              }}
            >
              Beginning of Journey 🚀
            </div>
          )}
        </div>


        {/* ================= CURRENT ================= */}

        <div
          className="journey-snapshot-current"
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg,#ECFDF5 0%,#F0FDF4 60%,#FFFFFF 100%)",
            border: "1px solid #BBF7D0",
            borderRadius: 26,
            padding: 28,
            minHeight: 270,
          }}
        >
          {/* DECORATIVE CIRCLES */}

          <div
            className="journey-snapshot-current-circle-one"
            style={{
              position: "absolute",
              right: -50,
              top: -55,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(34,197,94,.07)",
            }}
          />

          <div
            className="journey-snapshot-current-circle-two"
            style={{
              position: "absolute",
              right: 90,
              bottom: -95,
              width: 150,
              height: 150,
              borderRadius: "50%",
              border: "28px solid rgba(34,197,94,.04)",
            }}
          />

          {/* CURRENT HEADER */}

          <div
            className="journey-snapshot-current-header"
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 20,
              marginBottom: 24,
            }}
          >
            <div className="journey-snapshot-current-copy">
              <div
                className="journey-snapshot-current-label"
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "#166534",
                }}
              >
                Current Achievement
              </div>

              <div
                className="journey-snapshot-current-title"
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  lineHeight: 1.2,
                  marginTop: 10,
                  color: "#0F172A",
                }}
              >
                {current.event_name}
              </div>
            </div>

            <VerificationBadge
              status={current.verification_status}
            />
          </div>

          {/* DETAILS */}

          <div
            className="journey-snapshot-details"
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px 26px",
            }}
          >
            <Detail
              title="Activity"
              value={current.activity_category}
            />

            <Detail
              title="Level"
              value={current.achievement_level}
            />

            <Detail
              title="Award"
              value={current.achievement_type}
            />

            <Detail
              title="Year"
              value={current.achievement_year}
            />
          </div>

          {/* ACTIONS */}

          <div
            className="journey-snapshot-actions"
            style={{
              position: "relative",
              marginTop: 28,
              display: "flex",
              gap: 12,
            }}
          >
            <button
              className="journey-snapshot-action"
              onClick={() =>
                editAchievement(current)
              }
              style={{
                border: "none",
                borderRadius: 12,
                padding: "12px 20px",
                background: "#16335B",
                color: "#FFFFFF",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow:
                  "0 8px 18px rgba(22,51,91,.14)",
              }}
            >
              ✏ Edit
            </button>

            <button
              className="journey-snapshot-action"
              onClick={() =>
                removeAchievement(current.id)
              }
              style={{
                border: "none",
                borderRadius: 12,
                padding: "12px 20px",
                background: "#DC2626",
                color: "#FFFFFF",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow:
                  "0 8px 18px rgba(220,38,38,.12)",
              }}
            >
              🗑 Delete
            </button>
          </div>
        </div>


        {/* ================= NEXT ================= */}

        <div
          className="journey-snapshot-side journey-snapshot-next"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 24,
            padding: 24,
            minHeight: 270,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="journey-snapshot-label"
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#64748B",
              marginBottom: 18,
            }}
          >
            Upcoming Goal
          </div>

          {next ? (
            <>
              <div
                className="journey-snapshot-side-title"
                style={{
                  fontWeight: 800,
                  fontSize: 23,
                  lineHeight: 1.25,
                  color: "#0F172A",
                  marginBottom: 20,
                }}
              >
                {next.event_name}
              </div>

              <div
                className="journey-snapshot-lines"
                style={{
                  display: "grid",
                  gap: 11,
                  color: "#475569",
                  fontSize: 14,
                }}
              >
                <SnapshotLine
                  icon="🏆"
                  value={next.achievement_level}
                />

                <SnapshotLine
                  icon="📍"
                  value={next.location}
                />

                <SnapshotLine
                  icon="📅"
                  value={next.achievement_year}
                />

                <SnapshotLine
                  icon="🎯"
                  value={next.activity_category}
                />
              </div>
            </>
          ) : (
            <div
              className="journey-snapshot-side-empty journey-snapshot-congratulations"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "#16A34A",
                fontWeight: 700,
                fontSize: 17,
                lineHeight: 1.6,
              }}
            >
              <div>
                <div
                  className="journey-snapshot-congratulations-icon"
                  style={{
                    fontSize: 30,
                    marginBottom: 10,
                  }}
                >
                  🎉
                </div>

                Congratulations!
                <br />
                You reached your latest milestone.
              </div>
            </div>
          )}
        </div>
      </div>

      <ResponsiveStyles />
    </>
  );
}


/* =========================================================
   SNAPSHOT LINE
========================================================= */

function SnapshotLine({
  icon,
  value,
}: {
  icon: string;
  value: string | number;
}) {
  return (
    <div
      className="journey-snapshot-line"
      style={{
        display: "flex",
        gap: 9,
        alignItems: "center",
      }}
    >
      <span>{icon}</span>

      <span>
        {value || "Not specified"}
      </span>
    </div>
  );
}


/* =========================================================
   DETAIL
========================================================= */

function Detail({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="journey-snapshot-detail">
      <div
        className="journey-snapshot-detail-title"
        style={{
          fontWeight: 700,
          color: "#64748B",
          fontSize: 13,
          marginBottom: 7,
        }}
      >
        {title}
      </div>

      <div
        className="journey-snapshot-detail-value"
        style={{
          color: "#0F172A",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {value || "Not specified"}
      </div>
    </div>
  );
}


/* =========================================================
   VERIFICATION BADGE
========================================================= */

function VerificationBadge({
  status,
}: {
  status?: string;
}) {
  const verified =
    status === "Verified";

  return (
    <div
      className="journey-snapshot-verification"
      style={{
        flexShrink: 0,
        background: verified
          ? "#22C55E"
          : "#F59E0B",
        color: "#FFFFFF",
        padding: "9px 15px",
        borderRadius: 999,
        fontWeight: 800,
        fontSize: 12,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {verified
        ? "✓ Verified"
        : "Pending"}
    </div>
  );
}


/* =========================================================
   RESPONSIVE UI
========================================================= */

function ResponsiveStyles() {
  return (
    <style>{`

      /* =====================================================
         TABLET
         DESKTOP > 1024px COMPLETELY UNTOUCHED
      ===================================================== */

      @media (max-width: 1024px) {

        .journey-snapshot-grid {
          gap: 12px !important;
          margin-bottom: 17px !important;
        }

        .journey-snapshot-side {
          padding: 16px !important;
          min-height: 205px !important;
          border-radius: 17px !important;
        }

        .journey-snapshot-current {
          padding: 18px !important;
          min-height: 205px !important;
          border-radius: 18px !important;
        }

        .journey-snapshot-label,
        .journey-snapshot-current-label {
          font-size: 9px !important;
          letter-spacing: 1.3px !important;
        }

        .journey-snapshot-label {
          margin-bottom: 11px !important;
        }

        .journey-snapshot-side-title {
          font-size: 17px !important;
          margin-bottom: 13px !important;
        }

        .journey-snapshot-lines {
          gap: 7px !important;
          font-size: 11.5px !important;
        }

        .journey-snapshot-current-header {
          gap: 12px !important;
          margin-bottom: 16px !important;
        }

        .journey-snapshot-current-title {
          margin-top: 7px !important;
          font-size: 21px !important;
        }

        .journey-snapshot-verification {
          padding: 7px 10px !important;
          font-size: 9px !important;
        }

        .journey-snapshot-details {
          gap: 13px 18px !important;
        }

        .journey-snapshot-detail-title {
          margin-bottom: 4px !important;
          font-size: 10.5px !important;
        }

        .journey-snapshot-detail-value {
          font-size: 13px !important;
        }

        .journey-snapshot-actions {
          margin-top: 18px !important;
          gap: 8px !important;
        }

        .journey-snapshot-action {
          padding: 9px 14px !important;
          border-radius: 9px !important;
          font-size: 11px !important;
        }

        .journey-snapshot-side-empty {
          font-size: 12px !important;
        }

        .journey-snapshot-congratulations {
          font-size: 12px !important;
        }

        .journey-snapshot-congratulations-icon {
          font-size: 22px !important;
          margin-bottom: 7px !important;
        }


        /* EMPTY WHOLE SNAPSHOT */

        .journey-snapshot-empty {
          padding: 21px !important;
          margin-bottom: 17px !important;
          border-radius: 18px !important;
        }

        .journey-snapshot-empty-icon {
          width: 48px !important;
          height: 48px !important;
          margin-bottom: 10px !important;
          font-size: 21px !important;
        }

        .journey-snapshot-empty-title {
          font-size: 16px !important;
        }

        .journey-snapshot-empty-copy {
          margin-top: 5px !important;
          font-size: 12px !important;
        }

      }


      /* =====================================================
         MOBILE
      ===================================================== */

      @media (max-width: 768px) {

        /*
          Current card first.

          Previous + Upcoming underneath in a 2-column row.
        */

        .journey-snapshot-grid {
          width: 100% !important;

          display: grid !important;

          grid-template-columns:
            repeat(2, minmax(0, 1fr)) !important;

          gap: 7px !important;

          margin-bottom: 10px !important;
        }


        /* CURRENT = full width + first */

        .journey-snapshot-current {
          grid-column: 1 / -1 !important;
          grid-row: 1 !important;

          min-height: 0 !important;

          padding: 13px !important;

          border-radius: 15px !important;
        }


        /* Previous and Next follow */

        .journey-snapshot-previous {
          grid-column: 1 !important;
          grid-row: 2 !important;
        }

        .journey-snapshot-next {
          grid-column: 2 !important;
          grid-row: 2 !important;
        }

        .journey-snapshot-side {
          min-height: 0 !important;

          padding: 11px !important;

          border-radius: 13px !important;

          min-width: 0 !important;
        }


        /* ================= CURRENT HEADER ================= */

        .journey-snapshot-current-header {
          gap: 7px !important;
          margin-bottom: 11px !important;
        }

        .journey-snapshot-current-copy {
          flex: 1 1 auto;
          min-width: 0;
        }

        .journey-snapshot-current-label {
          font-size: 7.5px !important;
          letter-spacing: 1px !important;
        }

        .journey-snapshot-current-title {
          margin-top: 5px !important;

          font-size: 17px !important;
          line-height: 1.12 !important;

          overflow-wrap: break-word;
        }

        .journey-snapshot-verification {
          padding: 5px 8px !important;

          font-size: 7.5px !important;
        }


        /* ================= CURRENT DETAILS ================= */

        .journey-snapshot-details {
          grid-template-columns:
            repeat(2, minmax(0, 1fr)) !important;

          gap: 9px 12px !important;
        }

        .journey-snapshot-detail {
          min-width: 0;
        }

        .journey-snapshot-detail-title {
          margin-bottom: 3px !important;

          font-size: 8.5px !important;
        }

        .journey-snapshot-detail-value {
          font-size: 11px !important;
          line-height: 1.25 !important;

          overflow-wrap: break-word;
        }


        /* ================= ACTIONS ================= */

        .journey-snapshot-actions {
          margin-top: 12px !important;

          gap: 6px !important;
        }

        .journey-snapshot-action {
          padding: 7px 11px !important;

          border-radius: 8px !important;

          font-size: 9.5px !important;
        }


        /* ================= SIDE CARDS ================= */

        .journey-snapshot-label {
          margin-bottom: 7px !important;

          font-size: 7px !important;
          letter-spacing: .8px !important;
        }

        .journey-snapshot-side-title {
          margin-bottom: 8px !important;

          font-size: 12px !important;
          line-height: 1.18 !important;

          overflow-wrap: break-word;
        }

        .journey-snapshot-lines {
          gap: 5px !important;

          font-size: 9px !important;
        }

        .journey-snapshot-line {
          gap: 5px !important;

          min-width: 0;
        }

        .journey-snapshot-line span:last-child {
          min-width: 0;

          overflow-wrap: break-word;
        }

        .journey-snapshot-side-empty {
          min-height: 75px;

          font-size: 9.5px !important;
          line-height: 1.35 !important;
        }

        .journey-snapshot-congratulations {
          font-size: 9.5px !important;
        }

        .journey-snapshot-congratulations-icon {
          font-size: 18px !important;
          margin-bottom: 5px !important;
        }


        /* ================= DECORATION ================= */

        .journey-snapshot-current-circle-one {
          width: 110px !important;
          height: 110px !important;

          right: -45px !important;
          top: -45px !important;
        }

        .journey-snapshot-current-circle-two {
          width: 90px !important;
          height: 90px !important;

          right: 45px !important;
          bottom: -65px !important;

          border-width: 18px !important;
        }


        /* ================= EMPTY WHOLE SNAPSHOT ================= */

        .journey-snapshot-empty {
          padding: 15px !important;
          margin-bottom: 10px !important;

          border-radius: 15px !important;
        }

        .journey-snapshot-empty-icon {
          width: 42px !important;
          height: 42px !important;

          margin-bottom: 8px !important;

          font-size: 18px !important;
        }

        .journey-snapshot-empty-title {
          font-size: 13px !important;
        }

        .journey-snapshot-empty-copy {
          margin-top: 4px !important;

          font-size: 10px !important;
        }

      }


      /* =====================================================
         520px
      ===================================================== */

      @media (max-width: 520px) {

        .journey-snapshot-current {
          padding: 11px !important;
          border-radius: 14px !important;
        }

        .journey-snapshot-side {
          padding: 9px !important;
          border-radius: 12px !important;
        }

        .journey-snapshot-current-title {
          font-size: 16px !important;
        }

        .journey-snapshot-detail-value {
          font-size: 10.5px !important;
        }

        .journey-snapshot-action {
          padding: 6px 10px !important;
          font-size: 9px !important;
        }

        .journey-snapshot-side-title {
          font-size: 11px !important;
        }

        .journey-snapshot-lines {
          font-size: 8.5px !important;
        }

      }


      /* =====================================================
         390px / 400px
      ===================================================== */

      @media (max-width: 420px) {

        .journey-snapshot-grid {
          gap: 6px !important;

          margin-bottom: 8px !important;
        }

        .journey-snapshot-current {
          padding: 10px !important;

          border-radius: 13px !important;
        }

        .journey-snapshot-side {
          padding: 8px !important;

          border-radius: 11px !important;
        }

        .journey-snapshot-current-header {
          margin-bottom: 9px !important;
        }

        .journey-snapshot-current-label {
          font-size: 7px !important;
        }

        .journey-snapshot-current-title {
          font-size: 15px !important;
        }

        .journey-snapshot-verification {
          padding: 4px 7px !important;

          font-size: 7px !important;
        }

        .journey-snapshot-details {
          gap: 7px 9px !important;
        }

        .journey-snapshot-detail-title {
          font-size: 7.5px !important;
        }

        .journey-snapshot-detail-value {
          font-size: 9.5px !important;
        }

        .journey-snapshot-actions {
          margin-top: 10px !important;
        }

        .journey-snapshot-action {
          padding: 6px 9px !important;

          font-size: 8.5px !important;
        }

        .journey-snapshot-label {
          font-size: 6.5px !important;
        }

        .journey-snapshot-side-title {
          font-size: 10.5px !important;
        }

        .journey-snapshot-lines {
          gap: 4px !important;

          font-size: 8px !important;
        }

        .journey-snapshot-side-empty {
          font-size: 8.5px !important;
        }

      }

    `}</style>
  );
}