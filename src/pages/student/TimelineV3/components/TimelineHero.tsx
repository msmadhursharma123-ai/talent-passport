import React from "react";

interface TimelineHeroProps {
  totalCount: number;
  verifiedCount: number;
}

export default function TimelineHero({
  totalCount,
  verifiedCount,
}: TimelineHeroProps) {
  return (
    <>
      {/* =====================================================
          HERO
      ===================================================== */}

      <div
        className="timeline-hero-card"
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(115deg,#FFFFFF 0%,#FFFFFF 48%,#FFF9F3 76%,#F3F7FF 100%)",
          borderRadius: 28,
          padding: "38px 40px",
          marginBottom: 24,
          minHeight: 220,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 16px rgba(15,23,42,.04)",
        }}
      >
        <div
          className="timeline-hero-orange-circle"
          style={{
            position: "absolute",
            width: 430,
            height: 430,
            borderRadius: "50%",
            right: -115,
            top: -235,
            background: "rgba(249,115,22,.055)",
          }}
        />

        <div
          className="timeline-hero-blue-circle"
          style={{
            position: "absolute",
            width: 315,
            height: 315,
            borderRadius: "50%",
            right: 120,
            bottom: -245,
            background: "rgba(37,99,235,.05)",
          }}
        />

        <div
          className="timeline-hero-purple-circle"
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            right: 245,
            top: -125,
            background: "rgba(168,85,247,.03)",
          }}
        />

        <div
          className="timeline-hero-content"
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "76%",
          }}
        >
          <div
            className="timeline-hero-eyebrow"
            style={{
              color: "#F97316",
              fontSize: 12,
              letterSpacing: 2,
              fontWeight: 800,
              marginBottom: 10,
            }}
          >
            SHOWCASE YOUR ACHIEVEMENTS
          </div>

          <h1
            className="timeline-hero-title"
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: 38,
              fontWeight: 800,
              lineHeight: 1.15,
            }}
          >
            Bring Your Achievements Here
          </h1>

          <p
            className="timeline-hero-description"
            style={{
              marginTop: 14,
              color: "#64748B",
              lineHeight: 1.7,
              maxWidth: 700,
            }}
          >
            
          </p>
        </div>

        <div
          className="timeline-hero-icon-shell"
          style={{
            position: "relative",
            zIndex: 2,
            width: 112,
            height: 112,
            borderRadius: "50%",
            background: "rgba(249,115,22,.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="timeline-hero-icon"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#FFF",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 34,
            }}
          >
            ★
          </div>
        </div>
      </div>

      {/* =====================================================
          ACHIEVEMENT CREDIT SUMMARY
      ===================================================== */}

      <div
        className="timeline-credit-summary"
        style={{
          background: "#FFFFFF",
          borderRadius: 24,
          padding: "26px 28px",
          marginBottom: 26,
          border: "1px solid #E2E8F0",
          boxShadow: "0 8px 28px rgba(15,23,42,.045)",
        }}
      >
        <div
          className="timeline-credit-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 20,
            marginBottom: 22,
          }}
        >
          <div className="timeline-credit-header-copy">
            <div
              className="timeline-credit-eyebrow"
              style={{
                color: "#F97316",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              ACHIEVEMENT INTELLIGENCE
            </div>

            <h2
              className="timeline-credit-title"
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: 24,
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              Achievement Credit Summary
            </h2>

            <p
              className="timeline-credit-description"
              style={{
                margin: "9px 0 0",
                color: "#64748B",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
           
            </p>
          </div>

          <div
            className="timeline-credit-ledger-label"
            style={{
              color: "#94A3B8",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1,
              whiteSpace: "nowrap",
            }}
          >
            TALENT PASSPORT LEDGER
          </div>
        </div>

        <div
          className="timeline-credit-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 14,
          }}
        >
          <CreditCard
            variant="orange"
            title="TOTAL ACHIEVEMENTS"
            value={totalCount}
            description={`${totalCount} recorded achievements`}
          />

          <CreditCard
            variant="blue"
            title="ACHIEVEMENT CREDITS"
            value={totalCount * 10}
            description="Credits earned from achievements"
          />

          <CreditCard
            variant="green"
            title="VERIFIED CREDITS"
            value={verifiedCount * 10}
            description={`${verifiedCount} verified achievements`}
          />

          <CreditCard
            variant="purple"
            title="LEDGER CREDITS"
            value={(totalCount + verifiedCount) * 10}
            description="Combined achievement ledger score"
          />
        </div>
      </div>

      <style>{`

        /* =====================================================
           TABLET
           DESKTOP ABOVE 1024px REMAINS UNTOUCHED
        ===================================================== */

        @media (max-width: 1024px) {

          .timeline-hero-card {
            min-height: 160px !important;
            padding: 22px 24px !important;
            margin-bottom: 15px !important;
            border-radius: 20px !important;
          }

          .timeline-hero-content {
            max-width: calc(100% - 105px) !important;
          }

          .timeline-hero-eyebrow {
            font-size: 10px !important;
            letter-spacing: 1.5px !important;
            margin-bottom: 7px !important;
          }

          .timeline-hero-title {
            font-size: 27px !important;
            line-height: 1.1 !important;
          }

          .timeline-hero-description {
            margin-top: 9px !important;
            font-size: 13px !important;
            line-height: 1.45 !important;
          }

          .timeline-hero-icon-shell {
            width: 82px !important;
            height: 82px !important;
            flex: 0 0 82px !important;
          }

          .timeline-hero-icon {
            width: 54px !important;
            height: 54px !important;
            font-size: 25px !important;
          }

          .timeline-credit-summary {
            padding: 19px 20px !important;
            margin-bottom: 17px !important;
            border-radius: 19px !important;
          }

          .timeline-credit-header {
            gap: 14px !important;
            margin-bottom: 15px !important;
          }

          .timeline-credit-eyebrow {
            font-size: 9.5px !important;
            letter-spacing: 1.5px !important;
            margin-bottom: 6px !important;
          }

          .timeline-credit-title {
            font-size: 20px !important;
          }

          .timeline-credit-description {
            margin-top: 6px !important;
            font-size: 12.5px !important;
          }

          .timeline-credit-ledger-label {
            font-size: 9px !important;
          }

          .timeline-credit-grid {
            gap: 9px !important;
          }

          .timeline-credit-card {
            min-height: 94px !important;
            padding: 13px 14px !important;
            border-radius: 14px !important;
          }

          .timeline-credit-card-title {
            font-size: 8.5px !important;
          }

          .timeline-credit-card-value {
            margin-top: 8px !important;
            font-size: 25px !important;
          }

          .timeline-credit-card-description {
            margin-top: 7px !important;
            font-size: 9.5px !important;
          }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {

          .timeline-hero-card {
            min-height: 0 !important;

            padding: 16px !important;
            margin-bottom: 10px !important;

            border-radius: 16px !important;

            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;

            gap: 10px !important;
          }

          .timeline-hero-content {
            width: auto !important;
            max-width: none !important;
            min-width: 0 !important;

            flex: 1 1 auto !important;
          }

          .timeline-hero-eyebrow {
            font-size: 8.5px !important;
            letter-spacing: 1.2px !important;
            margin-bottom: 5px !important;
          }

          .timeline-hero-title {
            font-size: 21px !important;
            line-height: 1.08 !important;
          }

          .timeline-hero-description {
            margin-top: 7px !important;

            font-size: 11px !important;
            line-height: 1.35 !important;
          }

          .timeline-hero-icon-shell {
            width: 62px !important;
            height: 62px !important;

            flex: 0 0 62px !important;
          }

          .timeline-hero-icon {
            width: 42px !important;
            height: 42px !important;

            font-size: 20px !important;
          }


          /* Decorative circles reduced */

          .timeline-hero-orange-circle {
            width: 250px !important;
            height: 250px !important;

            right: -100px !important;
            top: -155px !important;
          }

          .timeline-hero-blue-circle {
            width: 180px !important;
            height: 180px !important;

            right: 40px !important;
            bottom: -145px !important;
          }

          .timeline-hero-purple-circle {
            width: 100px !important;
            height: 100px !important;

            right: 120px !important;
            top: -70px !important;
          }


          /* ================= CREDIT SUMMARY ================= */

          .timeline-credit-summary {
            padding: 14px !important;
            margin-bottom: 11px !important;

            border-radius: 16px !important;
          }

          .timeline-credit-header {
            display: flex !important;
            align-items: flex-start !important;

            gap: 10px !important;
            margin-bottom: 12px !important;
          }

          .timeline-credit-header-copy {
            flex: 1 1 auto;
            min-width: 0;
          }

          .timeline-credit-eyebrow {
            font-size: 8px !important;
            letter-spacing: 1.2px !important;
            margin-bottom: 5px !important;
          }

          .timeline-credit-title {
            font-size: 17px !important;
            line-height: 1.15 !important;
          }

          .timeline-credit-description {
            margin-top: 5px !important;

            font-size: 10.5px !important;
            line-height: 1.35 !important;
          }

          .timeline-credit-ledger-label {
            font-size: 7.5px !important;
            letter-spacing: .6px !important;

            flex-shrink: 0;

            white-space: normal !important;
            text-align: right;

            max-width: 85px;
          }


          /* 2 x 2 instead of four narrow cards */

          .timeline-credit-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;

            gap: 7px !important;
          }

          .timeline-credit-card {
            min-height: 78px !important;

            padding: 10px 11px !important;

            border-radius: 12px !important;

            box-sizing: border-box;
          }

          .timeline-credit-card-circle {
            width: 65px !important;
            height: 65px !important;

            right: -25px !important;
            top: -29px !important;
          }

          .timeline-credit-card-title {
            font-size: 7.5px !important;
            letter-spacing: .45px !important;
          }

          .timeline-credit-card-value {
            margin-top: 6px !important;

            font-size: 21px !important;
          }

          .timeline-credit-card-description {
            margin-top: 5px !important;

            font-size: 8.5px !important;
            line-height: 1.3 !important;
          }

        }


        /* =====================================================
           520px
        ===================================================== */

        @media (max-width: 520px) {

          .timeline-hero-card {
            padding: 14px !important;
            gap: 8px !important;
          }

          .timeline-hero-title {
            font-size: 19px !important;
          }

          .timeline-hero-description {
            font-size: 10.5px !important;
          }

          .timeline-hero-icon-shell {
            width: 56px !important;
            height: 56px !important;

            flex-basis: 56px !important;
          }

          .timeline-hero-icon {
            width: 38px !important;
            height: 38px !important;

            font-size: 18px !important;
          }

          .timeline-credit-summary {
            padding: 12px !important;
          }

          .timeline-credit-title {
            font-size: 16px !important;
          }

          .timeline-credit-description {
            font-size: 10px !important;
          }

          .timeline-credit-grid {
            gap: 6px !important;
          }

          .timeline-credit-card {
            min-height: 72px !important;
            padding: 9px !important;
          }

          .timeline-credit-card-value {
            font-size: 19px !important;
          }

          .timeline-credit-card-description {
            font-size: 8px !important;
          }

        }


        /* =====================================================
           390px / 400px
        ===================================================== */

        @media (max-width: 420px) {

          .timeline-hero-card {
            padding: 13px !important;
            margin-bottom: 8px !important;

            gap: 7px !important;

            border-radius: 14px !important;
          }

          .timeline-hero-eyebrow {
            font-size: 7.5px !important;
            letter-spacing: 1px !important;
          }

          .timeline-hero-title {
            font-size: 18px !important;
          }

          .timeline-hero-description {
            margin-top: 5px !important;

            font-size: 9.5px !important;
            line-height: 1.3 !important;
          }

          .timeline-hero-icon-shell {
            width: 50px !important;
            height: 50px !important;

            flex-basis: 50px !important;
          }

          .timeline-hero-icon {
            width: 34px !important;
            height: 34px !important;

            font-size: 16px !important;
          }

          .timeline-credit-summary {
            padding: 11px !important;
            margin-bottom: 9px !important;

            border-radius: 14px !important;
          }

          .timeline-credit-header {
            gap: 7px !important;
            margin-bottom: 9px !important;
          }

          .timeline-credit-eyebrow {
            font-size: 7px !important;
          }

          .timeline-credit-title {
            font-size: 15px !important;
          }

          .timeline-credit-description {
            font-size: 9px !important;
          }

          .timeline-credit-ledger-label {
            display: none;
          }

          .timeline-credit-card {
            min-height: 68px !important;

            padding: 8px !important;

            border-radius: 10px !important;
          }

          .timeline-credit-card-title {
            font-size: 7px !important;
          }

          .timeline-credit-card-value {
            margin-top: 5px !important;
            font-size: 18px !important;
          }

          .timeline-credit-card-description {
            margin-top: 4px !important;
            font-size: 7.5px !important;
          }

        }

      `}</style>
    </>
  );
}


/* =========================================================
   CREDIT CARD
========================================================= */

type CreditCardVariant =
  | "orange"
  | "blue"
  | "green"
  | "purple";

interface CreditCardProps {
  title: string;
  value: number;
  description: string;
  variant: CreditCardVariant;
}

const cardThemes: Record<
  CreditCardVariant,
  {
    background: string;
    border: string;
    title: string;
    value: string;
    circle: string;
  }
> = {
  orange: {
    background:
      "linear-gradient(135deg, #FFF8EF 0%, #FFFCF7 100%)",
    border: "#FED7AA",
    title: "#9A3412",
    value: "#F97316",
    circle: "rgba(249,115,22,.08)",
  },

  blue: {
    background:
      "linear-gradient(135deg, #EFF6FF 0%, #F8FBFF 100%)",
    border: "#BFDBFE",
    title: "#1E40AF",
    value: "#2563EB",
    circle: "rgba(37,99,235,.07)",
  },

  green: {
    background:
      "linear-gradient(135deg, #ECFDF5 0%, #F7FFFB 100%)",
    border: "#BBF7D0",
    title: "#166534",
    value: "#16A34A",
    circle: "rgba(22,163,74,.07)",
  },

  purple: {
    background:
      "linear-gradient(135deg, #F5F3FF 0%, #FBFAFF 100%)",
    border: "#DDD6FE",
    title: "#6D28D9",
    value: "#7C3AED",
    circle: "rgba(124,58,237,.07)",
  },
};

function CreditCard({
  title,
  value,
  description,
  variant,
}: CreditCardProps) {
  const theme = cardThemes[variant];

  return (
    <div
      className="timeline-credit-card"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 118,
        background: theme.background,
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: "18px 20px",
      }}
    >
      <div
        className="timeline-credit-card-circle"
        style={{
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: "50%",
          right: -34,
          top: -42,
          background: theme.circle,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="timeline-credit-card-title"
          style={{
            color: theme.title,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.7,
          }}
        >
          {title}
        </div>

        <div
          className="timeline-credit-card-value"
          style={{
            marginTop: 12,
            color: theme.value,
            fontSize: 32,
            lineHeight: 1,
            fontWeight: 900,
          }}
        >
          {value}
        </div>

        <div
          className="timeline-credit-card-description"
          style={{
            marginTop: 10,
            color: "#475569",
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}