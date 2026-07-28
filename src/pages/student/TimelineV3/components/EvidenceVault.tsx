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
      className="evidence-vault"
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
        className="evidence-vault-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          marginBottom: 26,
        }}
      >
        <div className="evidence-vault-header-copy">
          <div
            className="evidence-vault-eyebrow"
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
            className="evidence-vault-title"
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
            className="evidence-vault-description"
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
          className="evidence-vault-header-icon"
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
        className="evidence-vault-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: 18,
        }}
      >
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

      <style>{`

        /* =====================================================
           TABLET
           DESKTOP > 1024px UNTOUCHED
        ===================================================== */

        @media (max-width: 1024px) {

          .evidence-vault {
            padding: 20px !important;
            margin-bottom: 17px !important;
            border-radius: 20px !important;
          }

          .evidence-vault-header {
            gap: 14px !important;
            margin-bottom: 17px !important;
          }

          .evidence-vault-eyebrow {
            font-size: 9px !important;
            letter-spacing: 1.5px !important;
            margin-bottom: 6px !important;
          }

          .evidence-vault-title {
            font-size: 19px !important;
          }

          .evidence-vault-description {
            margin-top: 5px !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
          }

          .evidence-vault-header-icon {
            width: 40px !important;
            height: 40px !important;
            border-radius: 12px !important;
            font-size: 18px !important;
          }

          .evidence-vault-grid {
            gap: 10px !important;
          }

          .evidence-card {
            min-height: 185px !important;
            padding: 15px !important;
            border-radius: 16px !important;
          }

          .evidence-card-top {
            gap: 8px !important;
            margin-bottom: 12px !important;
          }

          .evidence-card-icon {
            width: 40px !important;
            height: 40px !important;
            border-radius: 12px !important;
            font-size: 19px !important;
          }

          .evidence-card-status {
            padding: 5px 8px !important;
            font-size: 8px !important;
          }

          .evidence-card-eyebrow {
            font-size: 8px !important;
            letter-spacing: 1px !important;
            margin-bottom: 4px !important;
          }

          .evidence-card-title {
            font-size: 16px !important;
            margin-bottom: 6px !important;
          }

          .evidence-card-description {
            font-size: 10.5px !important;
            line-height: 1.4 !important;
            margin-bottom: 13px !important;
          }

          .evidence-card-button {
            padding: 9px 10px !important;
            border-radius: 9px !important;
            font-size: 10.5px !important;
          }
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {

          .evidence-vault {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box;

            padding: 13px !important;
            margin-bottom: 10px !important;

            border-radius: 15px !important;
          }

          .evidence-vault-header {
            gap: 8px !important;
            margin-bottom: 11px !important;
          }

          .evidence-vault-header-copy {
            flex: 1 1 auto;
            min-width: 0;
          }

          .evidence-vault-eyebrow {
            font-size: 7.5px !important;
            letter-spacing: 1px !important;
            margin-bottom: 4px !important;
          }

          .evidence-vault-title {
            font-size: 16px !important;
          }

          .evidence-vault-description {
            margin-top: 4px !important;
            font-size: 9.5px !important;
            line-height: 1.3 !important;
          }

          .evidence-vault-header-icon {
            width: 34px !important;
            height: 34px !important;
            border-radius: 10px !important;
            font-size: 15px !important;
          }


          /*
             Keep the three evidence types immediately visible.

             Certificate occupies the first row.
             Medal + Award share the second row.
          */

          .evidence-vault-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;

            gap: 7px !important;
          }

          .evidence-card:first-child {
            grid-column: 1 / -1;
          }

          .evidence-card {
            min-width: 0 !important;
            min-height: 0 !important;

            padding: 10px !important;

            border-radius: 12px !important;
          }

          .evidence-card:first-child {
            display: grid !important;

            grid-template-columns: auto 1fr auto !important;

            column-gap: 9px !important;
            row-gap: 3px !important;

            align-items: center !important;
          }

          .evidence-card:first-child .evidence-card-top {
            grid-column: 1;
            grid-row: 1 / span 3;

            margin: 0 !important;
          }

          .evidence-card:first-child .evidence-card-status {
            display: none;
          }

          .evidence-card:first-child .evidence-card-eyebrow {
            grid-column: 2;
            grid-row: 1;

            margin: 0 !important;
          }

          .evidence-card:first-child .evidence-card-title {
            grid-column: 2;
            grid-row: 2;

            margin: 0 !important;
          }

          .evidence-card:first-child .evidence-card-description {
            grid-column: 2;
            grid-row: 3;

            margin: 0 !important;
          }

          .evidence-card:first-child .evidence-card-button {
            grid-column: 3;
            grid-row: 1 / span 3;

            width: auto !important;
            margin: 0 !important;

            padding: 7px 9px !important;

            white-space: nowrap;
          }


          /* CARD TOP */

          .evidence-card-top {
            gap: 5px !important;
            margin-bottom: 7px !important;
          }

          .evidence-card-icon {
            width: 32px !important;
            height: 32px !important;

            border-radius: 9px !important;

            font-size: 15px !important;
          }

          .evidence-card-status {
            padding: 4px 6px !important;

            font-size: 6.5px !important;
            letter-spacing: .2px !important;
          }


          /* CARD TEXT */

          .evidence-card-eyebrow {
            font-size: 6.5px !important;
            letter-spacing: .7px !important;

            margin-bottom: 3px !important;
          }

          .evidence-card-title {
            font-size: 12px !important;

            margin-bottom: 4px !important;
          }

          .evidence-card-description {
            font-size: 8px !important;
            line-height: 1.3 !important;

            margin-bottom: 8px !important;
          }


          /* ACTION */

          .evidence-card-button {
            padding: 7px 6px !important;

            border-radius: 8px !important;

            font-size: 8px !important;
          }

          .evidence-card-circle {
            width: 75px !important;
            height: 75px !important;

            right: -30px !important;
            top: -30px !important;
          }
        }


        /* =====================================================
           520px
        ===================================================== */

        @media (max-width: 520px) {

          .evidence-vault {
            padding: 11px !important;
            border-radius: 14px !important;
          }

          .evidence-vault-grid {
            gap: 6px !important;
          }

          .evidence-card {
            padding: 9px !important;
          }

          .evidence-card-title {
            font-size: 11px !important;
          }

          .evidence-card-description {
            font-size: 7.5px !important;
          }

          .evidence-card-button {
            font-size: 7.5px !important;
          }
        }


        /* =====================================================
           390px / 400px
        ===================================================== */

        @media (max-width: 420px) {

          .evidence-vault {
            padding: 10px !important;
            margin-bottom: 8px !important;
            border-radius: 13px !important;
          }

          .evidence-vault-header {
            margin-bottom: 9px !important;
          }

          .evidence-vault-eyebrow {
            font-size: 7px !important;
          }

          .evidence-vault-title {
            font-size: 15px !important;
          }

          .evidence-vault-description {
            font-size: 9px !important;
          }

          .evidence-vault-header-icon {
            width: 31px !important;
            height: 31px !important;
            font-size: 14px !important;
          }

          .evidence-card {
            padding: 8px !important;
            border-radius: 10px !important;
          }

          .evidence-card-icon {
            width: 29px !important;
            height: 29px !important;
            font-size: 14px !important;
          }

          .evidence-card-status {
            padding: 3px 5px !important;
            font-size: 6px !important;
          }

          .evidence-card-title {
            font-size: 10.5px !important;
          }

          .evidence-card-description {
            font-size: 7px !important;
          }

          .evidence-card-button {
            padding: 6px 5px !important;
            font-size: 7px !important;
          }

          .evidence-card:first-child .evidence-card-button {
            padding: 6px 7px !important;
          }
        }

      `}</style>
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
      className="evidence-card"
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
      <div
        className="evidence-card-circle"
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

      <div
        className="evidence-card-top"
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
          className="evidence-card-icon"
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
          className="evidence-card-status"
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

      <div
        className="evidence-card-eyebrow"
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
        className="evidence-card-title"
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
        className="evidence-card-description"
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

      <button
        className="evidence-card-button"
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