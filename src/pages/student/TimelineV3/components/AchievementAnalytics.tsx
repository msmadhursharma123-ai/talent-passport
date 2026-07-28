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
      className="achievement-analytics"
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
        className="achievement-analytics-circle-one"
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
        className="achievement-analytics-circle-two"
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
        className="achievement-analytics-header"
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 26,
        }}
      >
        <div className="achievement-analytics-header-copy">
          <div
            className="achievement-analytics-eyebrow"
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
            className="achievement-analytics-title"
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
            className="achievement-analytics-description"
            style={{
              color: "#64748B",
              fontSize: 14,
              marginTop: 7,
              lineHeight: 1.6,
            }}
          >
          
          </div>
        </div>

        <div
          className="achievement-analytics-header-icon"
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
            boxShadow:
              "0 7px 18px rgba(249,115,22,.08)",
          }}
        >
          📊
        </div>
      </div>

      {/* =================================================
          INTELLIGENCE CARDS
      ================================================= */}

      <div
        className="achievement-analytics-grid"
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        <InsightCard
          icon="🏆"
          eyebrow="Journey Reach"
          title="Highest Level"
          value={highestLevel}
          background="linear-gradient(135deg,#FFF7ED,#FFFFFF)"
          border="#FED7AA"
        />

        <InsightCard
          icon="📚"
          eyebrow="Exploration"
          title="Categories"
          value={categoriesCount}
          background="linear-gradient(135deg,#EFF6FF,#FFFFFF)"
          border="#BFDBFE"
        />

        <InsightCard
          icon="✓"
          eyebrow="Accredited Record"
          title="Verified"
          value={`${verifiedCount} / ${totalCount}`}
          background="linear-gradient(135deg,#ECFDF5,#FFFFFF)"
          border="#BBF7D0"
        />

        <CompletionCard
          completionPercentage={completionPercentage}
        />
      </div>

      <style>{`

        /* =====================================================
           TABLET
           DESKTOP > 1024px UNTOUCHED
        ===================================================== */

        @media (max-width: 1024px) {

          .achievement-analytics {
            padding: 20px !important;
            margin-bottom: 18px !important;
            border-radius: 21px !important;
          }

          .achievement-analytics-header {
            gap: 14px !important;
            margin-bottom: 17px !important;
          }

          .achievement-analytics-eyebrow {
            font-size: 9px !important;
            letter-spacing: 1.4px !important;
            margin-bottom: 5px !important;
          }

          .achievement-analytics-title {
            font-size: 19px !important;
          }

          .achievement-analytics-description {
            margin-top: 5px !important;
            font-size: 11.5px !important;
            line-height: 1.4 !important;
          }

          .achievement-analytics-header-icon {
            width: 40px !important;
            height: 40px !important;
            border-radius: 12px !important;
            font-size: 18px !important;
          }

          .achievement-analytics-grid {
            gap: 10px !important;
          }

          .achievement-insight-card,
          .achievement-completion-card {
            min-height: 118px !important;
            padding: 14px !important;
            border-radius: 15px !important;
          }

          .achievement-insight-card-top,
          .achievement-completion-card-top {
            gap: 7px !important;
          }

          .achievement-insight-eyebrow,
          .achievement-completion-eyebrow {
            font-size: 7px !important;
            letter-spacing: .9px !important;
            margin-bottom: 5px !important;
          }

          .achievement-insight-title,
          .achievement-completion-title {
            font-size: 10.5px !important;
          }

          .achievement-insight-icon,
          .achievement-completion-icon {
            width: 31px !important;
            height: 31px !important;
            border-radius: 9px !important;
            font-size: 14px !important;
          }

          .achievement-insight-value {
            margin-top: 12px !important;
            font-size: 20px !important;
          }

          .achievement-completion-content {
            margin-top: 12px !important;
          }

          .achievement-completion-number {
            font-size: 20px !important;
          }

          .achievement-completion-percent {
            font-size: 11px !important;
          }

          .achievement-completion-value {
            margin-bottom: 8px !important;
          }

          .achievement-completion-track {
            height: 5px !important;
          }
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {

          .achievement-analytics {
            width: 100% !important;
            max-width: 100% !important;

            box-sizing: border-box;

            padding: 13px !important;
            margin-bottom: 10px !important;

            border-radius: 15px !important;
          }

          .achievement-analytics-header {
            gap: 8px !important;
            margin-bottom: 11px !important;
          }

          .achievement-analytics-header-copy {
            flex: 1 1 auto;
            min-width: 0;
          }

          .achievement-analytics-eyebrow {
            font-size: 7px !important;
            letter-spacing: 1px !important;
            margin-bottom: 3px !important;
          }

          .achievement-analytics-title {
            font-size: 15px !important;
            line-height: 1.15 !important;
          }

          .achievement-analytics-description {
            margin-top: 4px !important;

            max-width: 270px;

            font-size: 9px !important;
            line-height: 1.3 !important;
          }

          .achievement-analytics-header-icon {
            width: 33px !important;
            height: 33px !important;

            border-radius: 10px !important;

            font-size: 15px !important;
          }


          /* ==========================
             2 × 2 MOBILE GRID
          ========================== */

          .achievement-analytics-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;

            gap: 7px !important;
          }

          .achievement-insight-card,
          .achievement-completion-card {
            min-width: 0 !important;
            min-height: 94px !important;

            padding: 9px !important;

            border-radius: 11px !important;
          }

          .achievement-insight-card-top,
          .achievement-completion-card-top {
            gap: 5px !important;
          }

          .achievement-insight-copy,
          .achievement-completion-copy {
            min-width: 0;
          }

          .achievement-insight-eyebrow,
          .achievement-completion-eyebrow {
            margin-bottom: 3px !important;

            font-size: 5.8px !important;
            letter-spacing: .55px !important;

            line-height: 1.15 !important;
          }

          .achievement-insight-title,
          .achievement-completion-title {
            font-size: 8.5px !important;
            line-height: 1.2 !important;
          }

          .achievement-insight-icon,
          .achievement-completion-icon {
            width: 26px !important;
            height: 26px !important;

            flex: 0 0 26px;

            border-radius: 8px !important;

            font-size: 12px !important;
          }

          .achievement-insight-value {
            margin-top: 9px !important;

            font-size: 16px !important;
            line-height: 1.05 !important;

            overflow-wrap: anywhere;
          }


          /* COMPLETION */

          .achievement-completion-content {
            margin-top: 9px !important;
          }

          .achievement-completion-value {
            gap: 2px !important;
            margin-bottom: 6px !important;
          }

          .achievement-completion-number {
            font-size: 16px !important;
          }

          .achievement-completion-percent {
            font-size: 9px !important;
          }

          .achievement-completion-track {
            height: 4px !important;
          }


          /* DECORATION */

          .achievement-analytics-circle-one {
            width: 150px !important;
            height: 150px !important;

            right: -65px !important;
            top: -80px !important;
          }

          .achievement-analytics-circle-two {
            width: 100px !important;
            height: 100px !important;

            right: 50px !important;
            bottom: -70px !important;
          }
        }


        /* =====================================================
           PHONE
        ===================================================== */

        @media (max-width: 520px) {

          .achievement-analytics {
            padding: 11px !important;
            border-radius: 14px !important;
          }

          .achievement-analytics-grid {
            gap: 6px !important;
          }

          .achievement-insight-card,
          .achievement-completion-card {
            min-height: 88px !important;

            padding: 8px !important;

            border-radius: 10px !important;
          }

          .achievement-insight-icon,
          .achievement-completion-icon {
            width: 24px !important;
            height: 24px !important;

            flex-basis: 24px;

            font-size: 11px !important;
          }

          .achievement-insight-value,
          .achievement-completion-number {
            font-size: 15px !important;
          }
        }


        /* =====================================================
           390px / 400px PHONE
        ===================================================== */

        @media (max-width: 420px) {

          .achievement-analytics {
            padding: 10px !important;
            margin-bottom: 8px !important;

            border-radius: 13px !important;
          }

          .achievement-analytics-header {
            margin-bottom: 9px !important;
          }

          .achievement-analytics-eyebrow {
            font-size: 6.5px !important;
          }

          .achievement-analytics-title {
            font-size: 14px !important;
          }

          .achievement-analytics-description {
            font-size: 8px !important;
            line-height: 1.25 !important;
          }

          .achievement-analytics-header-icon {
            width: 30px !important;
            height: 30px !important;

            font-size: 14px !important;
          }

          .achievement-analytics-grid {
            gap: 5px !important;
          }

          .achievement-insight-card,
          .achievement-completion-card {
            min-height: 82px !important;

            padding: 7px !important;

            border-radius: 9px !important;
          }

          .achievement-insight-eyebrow,
          .achievement-completion-eyebrow {
            font-size: 5.2px !important;
            letter-spacing: .4px !important;
          }

          .achievement-insight-title,
          .achievement-completion-title {
            font-size: 7.8px !important;
          }

          .achievement-insight-icon,
          .achievement-completion-icon {
            width: 22px !important;
            height: 22px !important;

            flex-basis: 22px;

            border-radius: 7px !important;

            font-size: 10px !important;
          }

          .achievement-insight-value {
            margin-top: 7px !important;

            font-size: 14px !important;
          }

          .achievement-completion-content {
            margin-top: 7px !important;
          }

          .achievement-completion-number {
            font-size: 14px !important;
          }

          .achievement-completion-percent {
            font-size: 8px !important;
          }

          .achievement-completion-value {
            margin-bottom: 5px !important;
          }

          .achievement-completion-track {
            height: 3px !important;
          }
        }


        /* =====================================================
           VERY SMALL PHONE
        ===================================================== */

        @media (max-width: 360px) {

          .achievement-analytics {
            padding: 9px !important;
          }

          .achievement-analytics-title {
            font-size: 13px !important;
          }

          .achievement-analytics-description {
            font-size: 7.5px !important;
          }

          .achievement-insight-card,
          .achievement-completion-card {
            min-height: 78px !important;
            padding: 6px !important;
          }

          .achievement-insight-value,
          .achievement-completion-number {
            font-size: 13px !important;
          }
        }

      `}</style>
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
      className="achievement-insight-card"
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
        className="achievement-insight-card-top"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div className="achievement-insight-copy">
          <div
            className="achievement-insight-eyebrow"
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
            className="achievement-insight-title"
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
          className="achievement-insight-icon"
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
        className="achievement-insight-value"
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
      className="achievement-completion-card"
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
        className="achievement-completion-card-top"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <div className="achievement-completion-copy">
          <div
            className="achievement-completion-eyebrow"
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
            className="achievement-completion-title"
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
          className="achievement-completion-icon"
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

      <div
        className="achievement-completion-content"
        style={{ marginTop: 18 }}
      >
        <div
          className="achievement-completion-value"
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 3,
            marginBottom: 12,
          }}
        >
          <span
            className="achievement-completion-number"
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
            className="achievement-completion-percent"
            style={{
              color: "#64748B",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            %
          </span>
        </div>

        <div
          className="achievement-completion-track"
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