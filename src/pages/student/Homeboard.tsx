import {
  useState,
  useEffect
} from "react";

import {
  getSupabaseClient
} from "../../supabaseClient";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import {
  fetchTalentPassportScores
} from "../../supabaseClient";

import {
  requireIdentity
} from "../../services/identityService";

export default function Homeboard() {
  const [creditView, setCreditView] =
    useState<"guidelines" | "rewards">(
      "guidelines"
    );

    const [passportData, setPassportData] =
  useState<any[]>([]);


const [submissions, setSubmissions] =
  useState<any[]>([]);

const [selectedVideo, setSelectedVideo] =
  useState<any>(null);

useEffect(() => {
  loadPassport();
  loadSubmissions();
}, []);

async function loadPassport() {

  const scores =
    await fetchTalentPassportScores();

  console.log(
    "HOMEBOARD SCORES",
    scores
  );

  setPassportData(scores);
}

async function loadSubmissions() {

  const studentIdentity =
    requireIdentity();

  const studentId =
    studentIdentity.parentEmail
      ?.toLowerCase()
      .replace("@", "_")
      .replace(/\./g, "_");

  if (!studentId) {

    return;

  }

  const supabase =
    getSupabaseClient();

  if (!supabase) {

    return;

  }

  const { data, error } =
    await supabase
      .from("submissions")
      .select("*")
      .eq(
        "student_id",
        studentId
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {

    console.error(error);

    return;

  }

  setSubmissions(data || []);
}


// ============================
// CURRENT LOGGED IN STUDENT
// ============================

const studentIdentity =
  requireIdentity();

const studentId =
  studentIdentity.parentEmail
    ?.toLowerCase()
    ?.replace("@", "_")
    ?.replace(/\./g, "_");
// ============================
// STUDENT SPECIFIC SCORES
// ============================

const studentScores =
  passportData.filter(
    (row) =>
      row.student_id ===
      studentId
  );

const hasCompetitionData =
  studentScores.length > 0;

const totalSubmissions =
  submissions.length;

const submissionCredits =
  totalSubmissions * 10;


  
// ============================
// GROWTH DATA
// ============================

const growthData =
  [...studentScores]
    .reverse()
    .map((item: any) => ({
      event: item.event_name,
      score: item.overall_score
    }));

const avgCommunication =
  hasCompetitionData
    ? Math.round(
        studentScores.reduce(
          (sum, row) =>
            sum +
            row.communication_score,
          0
        ) /
          studentScores.length
      )
    : "--";

const avgLeadership =
  hasCompetitionData
    ? Math.round(
        studentScores.reduce(
          (sum, row) =>
            sum +
            row.leadership_score,
          0
        ) /
          studentScores.length
      )
    : "--";

const avgThinking =
  hasCompetitionData
    ? Math.round(
        studentScores.reduce(
          (sum, row) =>
            sum +
            row.critical_thinking_score,
          0
        ) /
          studentScores.length
      )
    : "--";

const avgCollaboration =
  hasCompetitionData
    ? Math.round(
        studentScores.reduce(
          (sum, row) =>
            sum +
            row.collaboration_score,
          0
        ) /
          studentScores.length
      )
    : "--";

const avgConfidence =
  hasCompetitionData
    ? Math.round(
        studentScores.reduce(
          (sum, row) =>
            sum +
            row.confidence_score,
          0
        ) /
          studentScores.length
      )
    : "--";

const overallScore =
  hasCompetitionData
    ? Math.round(
        studentScores.reduce(
          (sum, row) =>
            sum +
            row.overall_score,
          0
        ) /
          studentScores.length
      )
    : "--";




    const dimensions = [
{
name: "Communication",
score: avgCommunication,
color: "#E85D04",
icon: "📢"
},
{
name: "Leadership",
score: avgLeadership,
color: "#2563EB",
icon: "👑"
},
{
name: "Critical Thinking",
score: avgThinking,
color: "#7C3AED",
icon: "🧠"
},
{
name: "Collaboration",
score: avgCollaboration,
color: "#2F9E44",
icon: "🤝"
},
{
name: "Confidence",
score: avgConfidence,
color: "#E11D48",
icon: "🎯"
}
];

const closeVideo = () =>
  setSelectedVideo(null);

  return (
    <div
      style={{
        padding: "30px",
        background: "#F4F5F7",
        minHeight: "100vh"
      }}
    >
{selectedVideo && (

  <div
    onClick={closeVideo}
    style={{
      position: "fixed",
      inset: 0,
      background:
        "rgba(0,0,0,0.85)",
      zIndex: 9999,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 40
    }}
  >
    <div
      onClick={(e) =>
        e.stopPropagation()
      }
      style={{
        width: "90%",
        maxWidth: 1100
      }}
    >
      <video
        src={
          selectedVideo.video_url
        }
        controls
        autoPlay
        style={{
          width: "100%",
          borderRadius: 20
        }}
      />

      <div
        style={{
          color: "#FFF",
          marginTop: 12,
          fontSize: 18,
          fontWeight: 700
        }}
      >
        {
          selectedVideo.event_name
        }
      </div>
    </div>
  </div>

)}

      {/* HEADER */}

      <div
        style={{
          background: "#FFF",
          borderRadius: 24,
          padding: 30,
          marginBottom: 25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <div
            style={{
              color: "#FF6B00",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              marginBottom: 10
            }}
          >
            ACCREDITED TALENT LEDGER
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 38
            }}
          >
            Student Talent Ledger Terminal
          </h1>


          <p
            style={{
              color: "#64748B"
            }}
          >
            Complete Talent Passport Overview
          </p>
        </div>

        <div
          style={{
            background: "#F97316",
            color: "white",
            padding: 25,
            borderRadius: 20,
            minWidth: 180,
            textAlign: "center"
          }}
        >
          <div
            style={{
              fontSize: 12,
              letterSpacing: 2
            }}
          >
            RELATIVE SCORE
          </div>

          <div
            style={{
              fontSize: 56,
              fontWeight: 800
            }}
          >
            {overallScore}
          </div>
        </div>
      </div>

      {/* TALENT BREAKDOWN */}

      <div
        style={{
          background: "#FFF",
          borderRadius: 24,
          padding: 30,
          marginBottom: 25
        }}
      >
        <h2
          style={{
            marginTop: 0
          }}
        >
          Talent Score Calculation Breakdown
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: 15
          }}
        >
          {dimensions.map((item) => (
            <div
              key={item.name}
              style={{
                background: "#FAFAFA",
                borderRadius: 18,
                padding: 20,
                border: `2px solid ${item.color}20`
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <span>{item.name}</span>
                <span>{item.icon}</span>
              </div>

              <h2
                style={{
                  color: item.color,
                  marginBottom: 0
                }}
              >
                {item.score}%
              </h2>
            </div>
          ))}
        </div>
      </div>

<div
  style={{
    background: "#FFF",
    borderRadius: 24,
    padding: 30,
    marginBottom: 25
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 25
    }}
  >
    <div>
      <div
        style={{
          color: "#F97316",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1.5
        }}
      >
        PERFORMANCE ARCHIVE
      </div>

      <h2
        style={{
          margin: "8px 0"
        }}
      >
        Competition History Ledger
      </h2>
    </div>

    <div
      style={{
        background: "#F8FAFC",
        padding: "10px 16px",
        borderRadius: 12,
        fontWeight: 600
      }}
    >
      {studentScores.length} Evaluations
    </div>
  </div>

  <div
  style={{
    overflowX: "auto"
  }}
>

  {/* HEADER */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "2fr 1fr repeat(5,1fr) 1fr",
      padding: "16px 20px",
      background: "#F8FAFC",
      borderRadius: 14,
      fontWeight: 700,
      color: "#475569",
      marginBottom: 12
    }}
  >
    <div>Competition</div>
    <div>Pathway</div>
    <div>Communication</div>
    <div>Leadership</div>
    <div>Critical Thinking</div>
    <div>Collaboration</div>
    <div>Confidence</div>
    <div>Overall</div>
  </div>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "2fr 1fr repeat(5,1fr) 1fr",
    alignItems: "center",
    padding: "18px 20px",
    borderRadius: 14,
    marginBottom: 14,
    background:
      "linear-gradient(90deg,#FFF7ED,#FFF)",
    border: "2px solid #F97316",
    fontWeight: 700
  }}
>
  <div>
    <div
      style={{
        fontSize: 16,
        fontWeight: 800,
        color: "#F97316"
      }}
    >
      Talent Passport Average
    </div>

    <div
      style={{
        fontSize: 12,
        color: "#64748B"
      }}
    >
      Combined performance across all competitions
    </div>
  </div>

  <div>—</div>

  <div>{avgCommunication}</div>
  <div>{avgLeadership}</div>
  <div>{avgThinking}</div>
  <div>{avgCollaboration}</div>
  <div>{avgConfidence}</div>

  <div>
    <span
      style={{
        background: "#F97316",
        color: "#FFF",
        padding: "8px 12px",
        borderRadius: 10,
        fontWeight: 700
      }}
    >
      {overallScore}
    </span>
  </div>
</div>

  {hasCompetitionData ? (

  studentScores.map((row) => (

    <div
      key={row.id}
      style={{
        display: "grid",
        gridTemplateColumns:
          "2fr 1fr repeat(5,1fr) 1fr",
        alignItems: "center",
        padding: "18px 20px",
        border: "1px solid #E2E8F0",
        borderRadius: 14,
        marginBottom: 10,
        background: "#FFF"
      }}
    >

      <div>
        <div
          style={{
            fontWeight: 700,
            fontSize: 15
          }}
        >
          {row.event_name}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "#64748B"
          }}
        >
          Competition Evaluation
        </div>
      </div>

      <div
        style={{
          color: "#F97316",
          fontWeight: 600
        }}
      >
        {row.pathway}
      </div>

      <div>{row.communication_score}</div>

      <div>{row.leadership_score}</div>

      <div>{row.critical_thinking_score}</div>

      <div>{row.collaboration_score}</div>

      <div>{row.confidence_score}</div>

      <div>
        <span
          style={{
            background: "#F97316",
            color: "#FFF",
            padding: "8px 12px",
            borderRadius: 10,
            fontWeight: 700
          }}
        >
          {row.overall_score}
        </span>
      </div>

    </div>

  ))

) : (

  <div
    style={{
      padding: 40,
      textAlign: "center",
      color: "#64748B",
      background: "#FFF",
      borderRadius: 16,
      border: "1px dashed #CBD5E1"
    }}
  >
    Competition history will appear after
    your first evaluated submission.
  </div>

)}

</div>
</div>

{/* SUBMISSION EVIDENCE VAULT */}

<div
  style={{
    background: "#FFF",
    borderRadius: 24,
    padding: 30,
    marginBottom: 25
  }}
>
  <div
    style={{
      marginBottom: 24
    }}
  >
    <div
      style={{
        color: "#F97316",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 1.5
      }}
    >
      VERIFIED PERFORMANCE EVIDENCE
    </div>

    <h2
      style={{
        margin: "8px 0"
      }}
    >
      Submission Evidence Vault
    </h2>

    <p
      style={{
        color: "#64748B",
        margin: 0
      }}
    >
      Every score, rank and growth
      metric in your Talent Passport
      is generated from the verified
      submissions below.
    </p>
  </div>

  {submissions.length === 0 ? (

    <div
      style={{
        padding: 40,
        textAlign: "center",
        color: "#64748B",
        border:
          "1px dashed #CBD5E1",
        borderRadius: 18
      }}
    >
      No submissions uploaded yet.
    </div>

  ) : (

    <div
  style={{
    display: "flex",
    gap: 24,
    alignItems: "flex-start"
  }}
>

      {/* LEFT SIDE VIDEOS */}

     <div
  style={{
    flex: 1,
    overflowX: "auto"
  }}
>
        <div
          style={{
            display: "flex",
            gap: 20,
            paddingBottom: 10
          }}
        >
          {submissions.map(
            (item) => (
              <div
                key={item.id}
                onClick={() =>
                  setSelectedVideo(item)
                }
                style={{
                  minWidth: 280,
                  cursor: "pointer"
                }}
              >
                <div
                  style={{
                    borderRadius: 18,
                    overflow: "hidden",
                    border:
                      "1px solid #E2E8F0"
                  }}
                >
                  <video
                    src={item.video_url}
                    muted
                    preload="metadata"
                    style={{
                      width: "100%",
                      height: 180,
                      objectFit: "cover",
                      background: "#000"
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 12
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15
                    }}
                  >
                    {item.event_name}
                  </div>

                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 13
                    }}
                  >
                    Submitted on{" "}
                    {new Date(
                      item.created_at
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* RIGHT SIDE CREDIT SUMMARY */}

  <div
  style={{
    width: 260,
    flexShrink: 0,
    border: "1px solid #E2E8F0",
    borderRadius: 18,
    padding: 10,
    background: "#FAFAFA",
    marginTop: 0
  }}
>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 16
          }}
        >
          🎓 Submission Credit Summary
        </div>

       <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 8
  }}
>

          <div
            style={{
              background: "#E8E1D6",
              borderRadius: 14,
              padding: 4
            }}
          >
            <div
              style={{
                fontSize: 13
              }}
            >
              Total Submissions
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 700
              }}
            >
              {totalSubmissions}
            </div>
          </div>

          <div
            style={{
              background: "#DCE3EF",
              borderRadius: 14,
              padding: 4
            }}
          >
            <div
              style={{
                fontSize: 13
              }}
            >
              Credit Per Submission
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 700
              }}
            >
              10
            </div>
          </div>

          <div
            style={{
              background: "#D9ECE6",
              borderRadius: 14,
              padding: 4
            }}
          >
            <div
              style={{
                fontSize: 13
              }}
            >
              Total Credits Earned
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 700
              }}
            >
              {submissionCredits}
            </div>
          </div>

        </div>
      </div>

    </div>

  )}

</div>

      {/* GRAPH SECTION */}

<div
  style={{
    background: "#FFF",
    borderRadius: 24,
    padding: 30,
    marginBottom: 25
  }}
>
  <div
    style={{
      color: "#F97316",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 1.5
    }}
  >
    PERFORMANCE ANALYTICS
  </div>

  <h2
    style={{
      marginTop: 8
    }}
  >
    Performance Growth Trajectory
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24,
      marginTop: 24
    }}
  >

    {/* LINE CHART */}

    <div
      style={{
        background: "#FAFAFA",
        border: "1px solid #E2E8F0",
        borderRadius: 18,
        padding: 20
      }}
    >
      <h4>
        Competency Growth Across Events
      </h4>

      <div
        style={{
          height: 320
        }}
      >
        {hasCompetitionData ? (

  <ResponsiveContainer
    width="100%"
    height="100%"
  >
    <LineChart
      data={studentScores}
    >
      <CartesianGrid strokeDasharray="3 3" />

      <XAxis dataKey="event_name" />

      <YAxis domain={[50,100]} />

      <Tooltip />

      <Line
        type="monotone"
        dataKey="communication_score"
        stroke="#F97316"
        strokeWidth={3}
      />

      <Line
        type="monotone"
        dataKey="leadership_score"
        stroke="#2563EB"
        strokeWidth={3}
      />

      <Line
        type="monotone"
        dataKey="critical_thinking_score"
        stroke="#7C3AED"
        strokeWidth={3}
      />

      <Line
        type="monotone"
        dataKey="confidence_score"
        stroke="#E11D48"
        strokeWidth={3}
      />
    </LineChart>
  </ResponsiveContainer>

) : (

  <div
    style={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#64748B",
      fontSize: 16
    }}
  >
    Performance analytics will unlock
    after your first evaluation.
  </div>

)}
      </div>
    </div>

    {/* BAR CHART */}

    <div
      style={{
        background: "#FAFAFA",
        border: "1px solid #E2E8F0",
        borderRadius: 18,
        padding: 20
      }}
    >
      <h4>
        Overall Event Comparison
      </h4>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
          height: 320
        }}
      >
        {studentScores.map((item) => (
          <div
            key={item.id}
            style={{
              textAlign: "center"
            }}
          >
            <div
              style={{
                marginBottom: 10,
                fontWeight: 700
              }}
            >
              {item.overall_score}
            </div>

            <div
              style={{
                width: 70,
                height: `${item.overall_score * 2}px`,
                background: "#F97316",
                borderRadius: "12px 12px 0 0"
              }}
            />

            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                width: 80
              }}
            >
              {item.event_name}
            </div>
          </div>
        ))}
      </div>
    </div>

  </div>
</div>
  
   
    </div>
  );}
