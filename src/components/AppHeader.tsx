import React from "react";
import logo from "../assets/logo.png";

interface Props {
  schoolName?: string | null;
}

export default function AppHeader({
  schoolName = null
}: Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "72px",
        boxSizing: "border-box",
        background: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        padding: "8px 48px"
      }}
    >
      {/* =====================================================
          TALENT PASSPORT LOGO

          ALWAYS VISIBLE.
          This is NOT connected to student login/logout.
      ====================================================== */}

      <img
        src={logo}
        alt="Talent Passport"
        style={{
          width: "200px",
          height: "auto",
          maxHeight: "200px",
          objectFit: "contain",
          objectPosition: "left center",
          display: "block",
          flexShrink: 0
        }}
      />

      {/* =====================================================
          SCHOOL IDENTITY

          OPTIONAL.
          App.tsx will pass schoolName ONLY when the
          authenticated student is inside Student Portal.

          No schoolName -> nothing appears here.
      ====================================================== */}

      {schoolName ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            minWidth: 0,
            marginLeft: 32
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.2,
              textAlign: "right",
              whiteSpace: "nowrap"
            }}
          >
            {schoolName}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              fontWeight: 600,
              color: "#64748B",
              lineHeight: 1.2,
              textAlign: "right",
              whiteSpace: "nowrap"
            }}
          >
            Student Academic Workspace
          </div>
        </div>
      ) : null}
    </div>
  );
}