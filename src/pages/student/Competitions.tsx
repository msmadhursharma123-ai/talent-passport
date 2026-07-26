import { useState } from "react";
import CompetitionCommandCenter from "./CompetitionCommandCenter";
import Leaderboard from "../../leaderboard";
import SubmissionsList from "../../components/SubmissionsList";

export default function Competitions() {
  const [view, setView] = useState("submit");

  return (
    <div style={{ padding: 24 }}>
    {/* ==========================================================
    COMPETITIONS HERO
========================================================== */}

<div
  style={{
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(120deg, #FFFFFF 0%, #FFFFFF 58%, #FFF9F4 82%, #F4F7FF 100%)",
    border: "1px solid #E2E8F0",
    borderRadius: 28,
    padding: "38px 42px",
    marginBottom: 30,
    minHeight: 190,
    display: "flex",
    alignItems: "center",
    boxShadow:
      "0 10px 30px rgba(15,23,42,.045)"
  }}
>
  {/* BLUE DECORATIVE CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: 250,
      height: 250,
      borderRadius: "50%",
      right: 120,
      bottom: -185,
      background:
        "rgba(37,99,235,.045)",
      pointerEvents: "none"
    }}
  />

  {/* ORANGE DECORATIVE CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: 270,
      height: 270,
      borderRadius: "50%",
      right: -70,
      top: -105,
      background:
        "rgba(249,115,22,.055)",
      pointerEvents: "none"
    }}
  />

  {/* SMALL DECORATIVE CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: 125,
      height: 125,
      borderRadius: "50%",
      right: 300,
      top: -75,
      background:
        "rgba(249,115,22,.03)",
      pointerEvents: "none"
    }}
  />

  {/* LEFT CONTENT */}

  <div
    style={{
      position: "relative",
      zIndex: 2,
      maxWidth: 900
    }}
  >
    {/* EYEBROW */}

    <div
      style={{
        color: "#F97316",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: 2.2,
        marginBottom: 13
      }}
    >
      COMPETITIONS HUB
    </div>

    {/* TITLE */}

    <h1
      style={{
        margin: 0,
        color: "#0F172A",
        fontSize: 38,
        lineHeight: 1.15,
        fontWeight: 800,
        letterSpacing: "-0.7px"
      }}
    >
      Participate, Compete & Build Your Talent Journey
    </h1>

    {/* DESCRIPTION */}

    <p
      style={{
        margin: "14px 0 0",
        maxWidth: 720,
        color: "#64748B",
        fontSize: 15,
        lineHeight: 1.65,
        fontWeight: 500
      }}
    >
      Participate, track submissions and monitor rankings.
    </p>
  </div>

  {/* RIGHT VISUAL */}

  <div
    style={{
      position: "absolute",
      zIndex: 2,
      right: 52,
      top: "50%",
      transform: "translateY(-50%)",
      width: 94,
      height: 94,
      borderRadius: "50%",
      background:
        "rgba(249,115,22,.09)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}
  >
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: "50%",
        background: "#FFFFFF",
        border:
          "1px solid #FED7AA",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 31,
        boxShadow:
          "0 8px 22px rgba(249,115,22,.10)"
      }}
    >
      🏆
    </div>
  </div>
</div>

      {view === "submit" && (
        <CompetitionCommandCenter />
      )}

      {view === "entries" && (
        <SubmissionsList
          submissions={[]}
          onRefresh={() => {}}
          isMock={true}
          onClearMock={() => {}}
        />
      )}

      {view === "leaderboard" && (
        <Leaderboard />
      )}

      {view === "results" && (
        <div
          style={{
            background: "#FFF",
            padding: 24,
            borderRadius: 16
          }}
        >
          Results Coming Soon
        </div>
      )}
    </div>
  );
}