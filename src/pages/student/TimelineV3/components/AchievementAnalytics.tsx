import React from "react";

interface AchievementAnalyticsProps {
  highestLevel: string;
  categoriesCount: number;
  verifiedCount: number;
  completionPercentage: number;
  totalCount: number;
}

export default function AchievementAnalytics({
  highestLevel,
  categoriesCount,
  verifiedCount,
  completionPercentage,
  totalCount,
}: AchievementAnalyticsProps) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg,#FFFFFF 0%,#FFFDF9 55%,#FFF7ED 100%)",
        border: "1px solid #E2E8F0",
        borderRadius: 30,
        padding: 30,
        marginBottom: 30,
        boxShadow: "0 12px 35px rgba(15,23,42,.04)",
      }}
    >
      {/* =================================================
          DECORATIVE BACKGROUND
      ================================================= */}

      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          right: -95,
          top: -130,
          background: "rgba(249,115,22,.055)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 190,
          height: 190,
          borderRadius: "50%",
          right: 120,
          bottom: -125,
          background: "rgba(37,99,235,.035)",
          pointerEvents: "none",
        }}
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 26,
        }}
      >
        <div>
          <div
            style={{
              color: "#F97316",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Talent Insights
          </div>

          <div
            style={{
              color: "#0F172A",
              fontSize: 24,
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            Achievement Intelligence
          </div>

          <div
            style={{
              color: "#64748B",
              fontSize: 14,
              marginTop: 7,
              lineHeight: 1.6,
            }}
          >
            A snapshot of your achievement journey,
            participation and verified milestones.
          </div>
        </div>

        <div
          style={{
            width: 50,
            height: 50,
            flexShrink: 0,
            borderRadius: 16,
            background:
              "linear-gradient(135deg,#FFF7ED,#FFEDD5)",
            border: "1px solid #FED7AA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 23,
            boxShadow: "0 7px 18px rgba(249,115,22,.08)",
          }}
        >
          📊
        </div>
      </div>

      {/* =================================================
          INTELLIGENCE CARDS
      ================================================= */}

      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        {/* HIGHEST LEVEL */}

        <InsightCard
          icon="🏆"
          eyebrow="Journey Reach"
          title="Highest Level"
          value={highestLevel}
          background="linear-gradient(135deg,#FFF7ED,#FFFFFF)"
          border="#FED7AA"
        />

        {/* CATEGORIES */}

        <InsightCard
          icon="📚"
          eyebrow="Exploration"
          title="Categories"
          value={categoriesCount}
          background="linear-gradient(135deg,#EFF6FF,#FFFFFF)"
          border="#BFDBFE"
        />

        {/* VERIFIED */}

        <InsightCard
          icon="✓"
          eyebrow="Accredited Record"
          title="Verified"
          value={`${verifiedCount} / ${totalCount}`}
          background="linear-gradient(135deg,#ECFDF5,#FFFFFF)"
          border="#BBF7D0"
        />

        {/* COMPLETION */}

        <CompletionCard
          completionPercentage={completionPercentage}
        />
      </div>
    </div>
  );
}

/* =========================================================
   STANDARD INSIGHT CARD
========================================================= */

function InsightCard({
  icon,
  eyebrow,
  title,
  value,
  background,
  border,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  value: string | number;
  background: string;
  border: string;
}) {
  return (
    <div
      style={{
        background,
        border: `1px solid ${border}`,
        borderRadius: 20,
        padding: 20,
        minHeight: 150,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div>
          <div
            style={{
              color: "#64748B",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              marginBottom: 7,
            }}
          >
            {eyebrow}
          </div>

          <div
            style={{
              color: "#475569",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "#FFFFFF",
            border: `1px solid ${border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            fontWeight: 900,
            color: "#16A34A",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>

      <div
        style={{
          color: "#0F172A",
          fontSize: 25,
          fontWeight: 850,
          lineHeight: 1.1,
          marginTop: 18,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   COMPLETION CARD
========================================================= */

function CompletionCard({
  completionPercentage,
}: {
  completionPercentage: number;
}) {
  const safePercentage = Math.max(
    0,
    Math.min(100, completionPercentage)
  );

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg,#F5F3FF,#FFFFFF)",
        border: "1px solid #DDD6FE",
        borderRadius: 20,
        padding: 20,
        minHeight: 150,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div>
          <div
            style={{
              color: "#7C3AED",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              marginBottom: 7,
            }}
          >
            Journey Progress
          </div>

          <div
            style={{
              color: "#475569",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Completion
          </div>
        </div>

        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: "#FFFFFF",
            border: "1px solid #DDD6FE",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          🎯
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 3,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              color: "#0F172A",
              fontSize: 25,
              fontWeight: 850,
              lineHeight: 1,
            }}
          >
            {safePercentage}
          </span>

          <span
            style={{
              color: "#64748B",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            %
          </span>
        </div>

        {/* PROGRESS TRACK */}

        <div
          style={{
            width: "100%",
            height: 7,
            background: "#EDE9FE",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${safePercentage}%`,
              height: "100%",
              borderRadius: 999,
              background:
                "linear-gradient(90deg,#8B5CF6,#7C3AED)",
              transition: "width .35s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}