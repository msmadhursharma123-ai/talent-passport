import { useState } from "react";

export default function CompetitionEntries() {

  const [selectedEntry, setSelectedEntry] =
    useState<any>(null);

  const mockEntries = [
    {
      id: 1,
      studentName: "Madhur Sharma",
      school: "DPS Gurgaon",
      event: "News Anchor Challenge",
      pathway: "Communication",
      status: "Pending"
    },
    {
      id: 2,
      studentName: "Aarav Sharma",
      school: "Modern School",
      event: "Debate Challenge",
      pathway: "Communication",
      status: "Evaluated"
    }
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "350px 1fr",
        height: "calc(100vh - 160px)"
      }}
    >

      {/* LEFT */}

      <div
        style={{
          borderRight:
            "1px solid #E5E7EB",
          overflowY: "auto"
        }}
      >

        <div
          style={{
            padding: "20px",
            fontSize: "24px",
            fontWeight: 700
          }}
        >
          Competition Entries
        </div>

        {mockEntries.map((entry) => (

          <div
            key={entry.id}
            onClick={() =>
              setSelectedEntry(entry)
            }
            style={{
              padding: "18px",
              borderBottom:
                "1px solid #E5E7EB",
              cursor: "pointer"
            }}
          >
            <div
              style={{
                fontWeight: 600
              }}
            >
              {entry.studentName}
            </div>

            <div
              style={{
                color: "#666"
              }}
            >
              {entry.event}
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color:
                  entry.status ===
                  "Pending"
                    ? "#DC2626"
                    : "#16A34A"
              }}
            >
              {entry.status}
            </div>

          </div>

        ))}

      </div>

      {/* RIGHT */}

      <div
        style={{
          padding: "30px",
          overflowY: "auto"
        }}
      >

        {!selectedEntry && (

          <h2>
            Select an Entry
          </h2>

        )}

        {selectedEntry && (

          <>

            <h1>
              {selectedEntry.studentName}
            </h1>

            <p>
              {selectedEntry.school}
            </p>

            <p>
              {selectedEntry.event}
            </p>

            {/* VIDEO */}

            <div
              style={{
                height: "320px",
                background: "#F3F4F6",
                borderRadius: "16px",
                marginTop: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              Video Player
            </div>

            {/* TRANSCRIPT */}

            <div
              style={{
                marginTop: "25px",
                padding: "20px",
                background: "#F8FAFC",
                borderRadius: "12px"
              }}
            >
              <h3>Transcript</h3>

              <p>
                AI transcript will appear
                here...
              </p>
            </div>

            {/* SKILLS */}

            <div
              style={{
                marginTop: "25px"
              }}
            >

              <h3>
                Talent Passport Scores
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3,1fr)",
                  gap: "15px"
                }}
              >

                <ScoreCard
                  title="Communication"
                  score="84"
                />

                <ScoreCard
                  title="Confidence"
                  score="79"
                />

                <ScoreCard
                  title="Leadership"
                  score="72"
                />

                <ScoreCard
                  title="Critical Thinking"
                  score="81"
                />

                <ScoreCard
                  title="Creativity"
                  score="68"
                />

                <ScoreCard
                  title="Collaboration"
                  score="74"
                />

              </div>

            </div>

            {/* ACTIONS */}

            <div
              style={{
                marginTop: "30px",
                display: "flex",
                gap: "12px"
              }}
            >

              <button>
                AI Evaluate
              </button>

              <button>
                Generate Transcript
              </button>

              <button>
                Approve
              </button>

              <button>
                Reject
              </button>

            </div>

          </>

        )}

      </div>

    </div>
  );
}

function ScoreCard({
  title,
  score,
}: any) {
  return (
    <div
      style={{
        padding: "18px",
        background: "white",
        border:
          "1px solid #E5E7EB",
        borderRadius: "12px"
      }}
    >
      <div>{title}</div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          marginTop: "8px"
        }}
      >
        {score}
      </div>
    </div>
  );
}