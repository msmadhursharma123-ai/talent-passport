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

  const studentIdentity = requireIdentity();

const studentId = studentIdentity.studentCode;

if (!studentId) {
  return;
}

const supabase = getSupabaseClient();

if (!supabase) {
  return;
}

const { data, error } = await supabase
  .from("submissions")
  .select("*")
  .eq("student_id", studentId)
  .order("created_at", {
    ascending: false,
  });

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
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(115deg, #FFFFFF 0%, #FFFFFF 48%, #FFF9F3 76%, #F3F7FF 100%)",
    borderRadius: 28,
    padding: "38px 40px",
    marginBottom: 25,
    minHeight: 220,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 16px rgba(15,23,42,0.04)"
  }}
>

  {/* DECORATIVE BACKGROUND CIRCLES */}

  <div
    style={{
      position: "absolute",
      width: 430,
      height: 430,
      borderRadius: "50%",
      right: -115,
      top: -235,
      background: "rgba(249,115,22,0.055)",
      pointerEvents: "none"
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
      background: "rgba(37,99,235,0.05)",
      pointerEvents: "none"
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
      background: "rgba(168,85,247,0.025)",
      pointerEvents: "none"
    }}
  />

  {/* LEFT CONTENT */}

  <div
    style={{
      position: "relative",
      zIndex: 2,
      maxWidth: "68%"
    }}
  >

    <div
      style={{
        color: "#F97316",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 2,
        marginBottom: 10
      }}
    >
      ACCREDITED TALENT LEDGER
    </div>

    <h1
      style={{
        margin: 0,
        color: "#0F172A",
        fontSize: 38,
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: -0.7
      }}
    >
      Student Talent Ledger Terminal
    </h1>

    <p
      style={{
        color: "#64748B",
        marginTop: 12,
        marginBottom: 0,
        fontSize: 14,
        fontWeight: 500
      }}
    >
      Complete Talent Passport Overview
    </p>

  </div>

  {/* RELATIVE SCORE */}

  <div
    style={{
      position: "relative",
      zIndex: 2,
      background: "#F97316",
      color: "#FFF",
      padding: "20px 24px",
      borderRadius: 18,
      minWidth: 190,
      textAlign: "center",
      boxShadow: "0 10px 25px rgba(249,115,22,0.16)"
    }}
  >

    <div
      style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: 1.5,
        opacity: 0.9
      }}
    >
      RELATIVE SCORE
    </div>

    <div
      style={{
        fontSize: 52,
        lineHeight: 1.1,
        fontWeight: 800,
        marginTop: 6
      }}
    >
      {overallScore}
    </div>

    <div
      style={{
        marginTop: 3,
        fontSize: 11,
        fontWeight: 600,
        opacity: 0.85
      }}
    >
      TALENT PASSPORT
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

    {/* LEFT SIDE SUBMISSIONS */}

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
    {submissions.map((item) => (
      <div
        key={item.id}
        style={{
          minWidth: 320,
          background: "#FFF",
          border: "1px solid #E2E8F0",
          borderRadius: 18,
          padding: 20
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 10
          }}
        >
          🎭 {item.event_name}
        </div>

        <div
          style={{
            color: "#64748B",
            fontSize: 14,
            marginBottom: 8
          }}
        >
          📅 Submitted on{" "}
          {new Date(item.created_at).toLocaleDateString()}
        </div>

        <div
          style={{
            color: "#64748B",
            fontSize: 14,
            marginBottom: 20
          }}
        >
          🎬 Verified Competition Submission
        </div>

        <button
          onClick={() => setSelectedVideo(item)}
          style={{
            background: "#F97316",
            color: "#FFF",
            border: "none",
            borderRadius: 12,
            padding: "12px 20px",
            fontWeight: 700,
            cursor: "pointer"
          }}
        >
          ▶ Watch Submission
        </button>
      </div>
    ))}
  </div>
</div>

     
    </div>

 )}

{submissions.length > 0 && (

  <div
    style={{
      marginTop: 24,
      background: "#FFFFFF",
      border: "1px solid #E2E8F0",
      borderRadius: 24,
      padding: "26px 28px",
      boxShadow:
        "0 8px 28px rgba(15,23,42,.045)"
    }}
  >

    {/* HEADER */}

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 20,
        marginBottom: 22
      }}
    >
      <div>

        <div
          style={{
            color: "#F97316",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 2,
            marginBottom: 8
          }}
        >
          SUBMISSION INTELLIGENCE
        </div>

        <h2
          style={{
            margin: 0,
            color: "#0F172A",
            fontSize: 24,
            fontWeight: 800,
            lineHeight: 1.2
          }}
        >
          Submission Credit Summary
        </h2>

        <p
          style={{
            margin: "9px 0 0",
            color: "#64748B",
            fontSize: 14,
            lineHeight: 1.5
          }}
        >
          Your accumulated credits from verified competition
          submissions across your Talent Passport journey.
        </p>

      </div>

      <div
        style={{
          color: "#94A3B8",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1,
          whiteSpace: "nowrap"
        }}
      >
        TALENT PASSPORT LEDGER
      </div>

    </div>


    {/* CREDIT CARDS */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(3, minmax(0, 1fr))",
        gap: 14
      }}
    >

      {/* TOTAL SUBMISSIONS */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: 118,
          background:
            "linear-gradient(135deg, #FFF8EF 0%, #FFFCF7 100%)",
          border: "1px solid #FED7AA",
          borderRadius: 18,
          padding: "18px 20px"
        }}
      >

        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            right: -34,
            top: -42,
            background:
              "rgba(249,115,22,.08)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1
          }}
        >

          <div
            style={{
              color: "#9A3412",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.7
            }}
          >
            TOTAL SUBMISSIONS
          </div>

          <div
            style={{
              marginTop: 12,
              color: "#F97316",
              fontSize: 32,
              lineHeight: 1,
              fontWeight: 900
            }}
          >
            {totalSubmissions}
          </div>

          <div
            style={{
              marginTop: 10,
              color: "#475569",
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.4
            }}
          >
            Verified competition submissions
          </div>

        </div>

      </div>


      {/* CREDITS PER SUBMISSION */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: 118,
          background:
            "linear-gradient(135deg, #EFF6FF 0%, #F8FBFF 100%)",
          border: "1px solid #BFDBFE",
          borderRadius: 18,
          padding: "18px 20px"
        }}
      >

        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            right: -34,
            top: -42,
            background:
              "rgba(37,99,235,.07)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1
          }}
        >

          <div
            style={{
              color: "#1E40AF",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.7
            }}
          >
            CREDITS / SUBMISSION
          </div>

          <div
            style={{
              marginTop: 12,
              color: "#2563EB",
              fontSize: 32,
              lineHeight: 1,
              fontWeight: 900
            }}
          >
            10
          </div>

          <div
            style={{
              marginTop: 10,
              color: "#475569",
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.4
            }}
          >
            Credits awarded per verified submission
          </div>

        </div>

      </div>


      {/* TOTAL CREDITS EARNED */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: 118,
          background:
            "linear-gradient(135deg, #ECFDF5 0%, #F7FFFB 100%)",
          border: "1px solid #BBF7D0",
          borderRadius: 18,
          padding: "18px 20px"
        }}
      >

        <div
          style={{
            position: "absolute",
            width: 100,
            height: 100,
            borderRadius: "50%",
            right: -34,
            top: -42,
            background:
              "rgba(22,163,74,.07)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1
          }}
        >

          <div
            style={{
              color: "#166534",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.7
            }}
          >
            TOTAL CREDITS EARNED
          </div>

          <div
            style={{
              marginTop: 12,
              color: "#16A34A",
              fontSize: 32,
              lineHeight: 1,
              fontWeight: 900
            }}
          >
            {submissionCredits}
          </div>

          <div
            style={{
              marginTop: 10,
              color: "#475569",
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1.4
            }}
          >
            Accumulated submission ledger credits
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
