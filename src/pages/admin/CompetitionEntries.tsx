import { useEffect, useState } from "react";
import {
  fetchAllSubmissions,
  evaluateSubmission,
  deleteSubmission,
  getEvaluationBySubmissionId,
} from "../../supabaseClient";
import StudentInsightPanel
from "./StudentInsightPanel";

export default function CompetitionEntries() {
  const [submissions, setSubmissions] =
    useState<any[]>([]);

  const [selectedEntry, setSelectedEntry] =
    useState<any>(null);

  const [selectedEvaluation,
setSelectedEvaluation] =
useState<any>(null);

  const [search, setSearch] =
    useState("");

  const [pathwayFilter, setPathwayFilter] =
    useState("All");


    
  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    const result =
      await fetchAllSubmissions();

    setSubmissions(
      result?.submissions || []
    );
  }

  const filteredSubmissions =
    submissions.filter((item) => {
      const searchMatch =
        item.student_name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const pathwayMatch =
        pathwayFilter === "All" ||
        item.pathway === pathwayFilter;

      return (
        searchMatch &&
        pathwayMatch
      );
    });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
  "320px 1fr 320px",
        height:
          "calc(100vh - 160px)",
      }}
    >
      {/* LEFT PANEL */}

      <div
        style={{
          borderRight:
            "1px solid #E5E7EB",
          overflowY: "auto",
          background: "#FAFAFA",
        }}
      >
        <div
          style={{
            padding: "20px",
          }}
        >
          <h2>
            Competition Entries
          </h2>

          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "10px",
              border:
                "1px solid #D1D5DB",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          />

          <select
            value={pathwayFilter}
            onChange={(e) =>
              setPathwayFilter(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "10px",
              border:
                "1px solid #D1D5DB",
              borderRadius: "8px",
            }}
          >
            <option>
              All
            </option>

            <option>
              Communication
            </option>

            <option>
              Problem Solving
            </option>

            <option>
              Creative Expression
            </option>

            <option>
              Team Event
            </option>
          </select>
        </div>

        {filteredSubmissions.map(
          (entry) => (
            <div
              key={entry.id}
              onClick={() =>
                setSelectedEntry(
                  entry
                )
              }
              style={{
                padding: "18px",
                borderBottom:
                  "1px solid #E5E7EB",
                cursor: "pointer",
                background:
                  selectedEntry?.id ===
                  entry.id
                    ? "#EFF6FF"
                    : "white",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                }}
              >
                {
                  entry.student_name
                }
              </div>

              <div
                style={{
                  color: "#666",
                  marginTop: "4px",
                }}
              >
                {
                  entry.event_name
                }
              </div>

              <div
                style={{
                  color:
                    "#2563EB",
                  fontSize: "12px",
                  marginTop: "6px",
                }}
              >
                {
                  entry.pathway
                }
              </div>
            </div>
          )
        )}
      </div>

      {/* RIGHT PANEL */}

      <div
        style={{
          padding: "30px",
          overflowY: "auto",
        }}
      >
        {!selectedEntry && (
          <h2>
            Select a Submission
          </h2>
        )}

        {selectedEntry && (
          <>
            <h1>
              {
                selectedEntry.student_name
              }
            </h1>

            <p>
              {
                selectedEntry.student_email
              }
            </p>

            <p>
              {
                selectedEntry.event_name
              }
            </p>

            <p>
              {
                selectedEntry.pathway
              }
            </p>

            {/* VIDEO */}

            <div
              style={{
                marginTop: "20px",
              }}
            >
              <video
                controls
                width="100%"
                style={{
                  borderRadius:
                    "12px",
                }}
              >
                <source
                  src={
                    selectedEntry.video_url
                  }
                />
              </video>
            </div>

            {/* TRANSCRIPT */}

            <div
              style={{
                marginTop: "20px",
                padding: "20px",
                background:
                  "#F8FAFC",
                borderRadius:
                  "12px",
              }}
            >
              <h3>
                Transcript
              </h3>

              <p>
                Transcript
                generation
                coming next...
              </p>
            </div>

            {/* SCORES */}

            <div
              style={{
                marginTop: "25px",
              }}
            >
              <h3>
                Talent Passport
                Scores
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(3,1fr)",
                  gap: "15px",
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
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={async () => {
                  const result =
                    await evaluateSubmission(
                      selectedEntry.id
                    );

                  if (
                    result?.error
                  ) {
                    alert(
                      result.error
                    );
                    return;
                  }

                 const evaluation: any =
                    await getEvaluationBySubmissionId(
                      selectedEntry.id
                    );

              if (
  (evaluation as any)?.data
) {
  setSelectedEvaluation(
    (evaluation as any).data
  );
}
                }}
              >
                AI Evaluate
              </button>

              <button
                onClick={() =>
                  alert(
                    "Transcript module coming next"
                  )
                }
              >
                Generate Transcript
              </button>

              <button
                onClick={async () => {
                  const result: any =
                    await getEvaluationBySubmissionId(
                      selectedEntry.id
                    );

                if (
  (result as any)?.data
) {
  setSelectedEvaluation(
    (result as any).data
  );
} else {
                    alert(
                      "No evaluation found"
                    );
                  }
                }}
              >
                View Evaluation
              </button>

              <button
                onClick={async () => {
                  const confirmed =
                    window.confirm(
                      "Delete this submission?"
                    );

                  if (
                    !confirmed
                  )
                    return;

                  await deleteSubmission(
                    selectedEntry.id
                  );

                  setSelectedEntry(
                    null
                  );

                  loadSubmissions();
                }}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>

 {/* STUDENT INTELLIGENCE PANEL */}

      <div
        style={{
          padding: "20px",
          borderLeft:
            "1px solid #E5E7EB",
          overflowY: "auto",
          background: "#FAFAFA",
        }}
      >
        <StudentInsightPanel />
      </div>

      {/* EVALUATION MODAL */}

      {selectedEvaluation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background:
                "white",
              width: "700px",
              maxHeight:
                "80vh",
              overflowY:
                "auto",
              padding: "30px",
              borderRadius:
                "12px",
            }}
          >
            <h2>
              AI Evaluation
              Report
            </h2>

            <p>
              <strong>
                Pathway:
              </strong>{" "}
              {
                selectedEvaluation.pathway
              }
            </p>

            <p>
              <strong>
                Event:
              </strong>{" "}
              {
                selectedEvaluation.event_name
              }
            </p>

            <hr />

            <p>
              {
                selectedEvaluation.metric_1_name
              }
              :{" "}
              {
                selectedEvaluation.metric_1_score
              }
            </p>

            <p>
              {
                selectedEvaluation.metric_2_name
              }
              :{" "}
              {
                selectedEvaluation.metric_2_score
              }
            </p>

            <p>
              {
                selectedEvaluation.metric_3_name
              }
              :{" "}
              {
                selectedEvaluation.metric_3_score
              }
            </p>

            <p>
              {
                selectedEvaluation.metric_4_name
              }
              :{" "}
              {
                selectedEvaluation.metric_4_score
              }
            </p>

            <p>
              {
                selectedEvaluation.metric_5_name
              }
              :{" "}
              {
                selectedEvaluation.metric_5_score
              }
            </p>

            <hr />

            <h3>
              Overall Score:{" "}
              {
                selectedEvaluation.overall_score
              }
            </h3>

            <p>
              {
                selectedEvaluation.ai_feedback
              }
            </p>

            <button
              onClick={() =>
                setSelectedEvaluation(
                  null
                )
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
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
        background:
          "white",
        border:
          "1px solid #E5E7EB",
        borderRadius:
          "12px",
      }}
    >
      <div>{title}</div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          marginTop: "8px",
        }}
      >
        {score}
      </div>
    </div>
  );
}