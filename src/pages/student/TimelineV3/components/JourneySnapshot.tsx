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
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#0F172A",
          }}
        >
          No achievement selected
        </div>

        <div
          style={{
            marginTop: 8,
            color: "#64748B",
            fontSize: 14,
          }}
        >
          Add an achievement to begin building your journey.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr 1fr",
        gap: 22,
        marginBottom: 28,
      }}
    >
      {/* ================= PREVIOUS ================= */}

      <div
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
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div>
            <div
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
          style={{
            position: "relative",
            marginTop: 28,
            display: "flex",
            gap: 12,
          }}
        >
          <button
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
  );
}

function SnapshotLine({
  icon,
  value,
}: {
  icon: string;
  value: string | number;
}) {
  return (
    <div
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

function Detail({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div>
      <div
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

function VerificationBadge({
  status,
}: {
  status?: string;
}) {
  const verified =
    status === "Verified";

  return (
    <div
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