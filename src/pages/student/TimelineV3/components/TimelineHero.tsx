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
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "76%",
          }}
        >
          <div
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
            style={{
              marginTop: 14,
              color: "#64748B",
              lineHeight: 1.7,
              maxWidth: 700,
            }}
          >
            Complete achievement history, accredited evidence vault and verified
            student achievement ledger.
          </p>
        </div>

        <div
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
        style={{
          background: "#FFFFFF",
          borderRadius: 24,
          padding: "26px 28px",
          marginBottom: 26,
          border: "1px solid #E2E8F0",
          boxShadow: "0 8px 28px rgba(15,23,42,.045)",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 20,
            marginBottom: 22,
          }}
        >
          <div>
            <div
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
              style={{
                margin: "9px 0 0",
                color: "#64748B",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              Your accumulated achievement credits across your verified
              Talent Passport journey.
            </p>
          </div>

          <div
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

        {/* CREDIT CARDS */}

        <div
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
      {/* DECORATIVE CIRCLE */}

      <div
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