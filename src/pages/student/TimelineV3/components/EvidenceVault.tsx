import React from "react";

export type EvidenceAchievement = {
  id: string;
  event_name: string;

  certificate_url?: string | null;
  medal_photo_url?: string | null;
  award_photo_url?: string | null;
};

interface EvidenceVaultProps {
  current?: EvidenceAchievement;

  onViewCertificate: () => void;
  onViewMedal: () => void;
  onViewAward: () => void;
}

export default function EvidenceVault({
  current,
  onViewCertificate,
  onViewMedal,
  onViewAward,
}: EvidenceVaultProps) {
  if (!current) {
    return null;
  }

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 30,
        padding: 30,
        marginBottom: 30,
        boxShadow: "0 12px 35px rgba(15,23,42,.04)",
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        style={{
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
            Achievement Evidence
          </div>

          <div
            style={{
              color: "#0F172A",
              fontSize: 23,
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            Evidence Vault
          </div>

          <div
            style={{
              color: "#64748B",
              fontSize: 14,
              marginTop: 7,
              lineHeight: 1.6,
            }}
          >
            Recognition records attached to this achievement.
          </div>
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            flexShrink: 0,
            borderRadius: 15,
            background:
              "linear-gradient(135deg,#FFF7ED,#FFEDD5)",
            border: "1px solid #FED7AA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          🗂️
        </div>
      </div>

      {/* ================= EVIDENCE GRID ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        {/* ================= CERTIFICATE ================= */}

        <EvidenceCard
          icon="📜"
          eyebrow="Official Record"
          title="Certificate"
          description="Official certificate issued for this achievement."
          available={Boolean(current.certificate_url)}
          buttonLabel="View Certificate"
          accent="#F97316"
          softBackground="linear-gradient(135deg,#FFF7ED,#FFFFFF)"
          borderColor="#FED7AA"
          onClick={onViewCertificate}
        />

        {/* ================= MEDAL ================= */}

        <EvidenceCard
          icon="🥇"
          eyebrow="Recognition"
          title="Medal"
          description="View medal proof and supporting recognition records."
          available={Boolean(current.medal_photo_url)}
          buttonLabel="View Medal"
          accent="#2563EB"
          softBackground="linear-gradient(135deg,#EFF6FF,#FFFFFF)"
          borderColor="#BFDBFE"
          onClick={onViewMedal}
        />

        {/* ================= AWARD ================= */}

        <EvidenceCard
          icon="🏆"
          eyebrow="Achievement Proof"
          title="Award"
          description="View award evidence associated with this milestone."
    available={Boolean(current.award_photo_url)}
          buttonLabel="View Award"
          accent="#16A34A"
          softBackground="linear-gradient(135deg,#F0FDF4,#FFFFFF)"
          borderColor="#BBF7D0"
          onClick={onViewAward}
        />
      </div>
    </div>
  );
}

/* =========================================================
   EVIDENCE CARD
========================================================= */

function EvidenceCard({
  icon,
  eyebrow,
  title,
  description,
  available,
  buttonLabel,
  accent,
  softBackground,
  borderColor,
  onClick,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  description: string;
  available: boolean;
  buttonLabel: string;
  accent: string;
  softBackground: string;
  borderColor: string;
  onClick: () => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        background: softBackground,
        border: `1px solid ${borderColor}`,
        borderRadius: 22,
        padding: 22,
        minHeight: 235,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* LIGHT DECORATIVE CIRCLE */}

      <div
        style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: "50%",
          right: -46,
          top: -48,
          background: accent,
          opacity: 0.045,
          pointerEvents: "none",
        }}
      />

      {/* ICON + STATUS */}

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 15,
            background: "#FFFFFF",
            border: `1px solid ${borderColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 23,
            boxShadow:
              "0 6px 18px rgba(15,23,42,.04)",
          }}
        >
          {icon}
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "6px 10px",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            background: available
              ? "#ECFDF5"
              : "#F8FAFC",
            color: available
              ? "#15803D"
              : "#94A3B8",
            border: available
              ? "1px solid #BBF7D0"
              : "1px solid #E2E8F0",
          }}
        >
          {available ? "Available" : "No File"}
        </div>
      </div>

      {/* TEXT */}

      <div
        style={{
          position: "relative",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: accent,
          marginBottom: 6,
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          position: "relative",
          fontWeight: 800,
          fontSize: 19,
          color: "#0F172A",
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          position: "relative",
          color: "#64748B",
          fontSize: 13,
          lineHeight: 1.55,
          marginBottom: 20,
        }}
      >
        {description}
      </div>

      {/* ACTION */}

      <button
        onClick={onClick}
        style={{
          position: "relative",
          width: "100%",
          marginTop: "auto",
          background: available
            ? accent
            : "#F1F5F9",
          color: available
            ? "#FFFFFF"
            : "#64748B",
          border: available
            ? "none"
            : "1px solid #E2E8F0",
          borderRadius: 12,
          padding: "12px 14px",
          fontWeight: 800,
          fontSize: 13,
          cursor: "pointer",
          boxShadow: available
            ? "0 7px 18px rgba(15,23,42,.08)"
            : "none",
        }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}