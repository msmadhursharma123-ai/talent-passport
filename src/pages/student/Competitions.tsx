import { useState } from "react";
import CompetitionCommandCenter from "./CompetitionCommandCenter";
import Leaderboard from "../../leaderboard";
import SubmissionsList from "../../components/SubmissionsList";

export default function Competitions() {
  const [view, setView] = useState("submit");

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 24
        }}
      >
        <h1
          style={{
            color: "#0B2A4A",
            marginBottom: 10
          }}
        >
          Competitions Hub
        </h1>

        <p
          style={{
            color: "#64748B"
          }}
        >
          Participate, track submissions and monitor rankings.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap"
        }}
      >
        <button onClick={() => setView("submit")}>
          Submit Entry
        </button>

        <button onClick={() => setView("entries")}>
          My Entries
        </button>

        <button onClick={() => setView("leaderboard")}>
          Leaderboard
        </button>

        <button onClick={() => setView("results")}>
          Results
        </button>
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