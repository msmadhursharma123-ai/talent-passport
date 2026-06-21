import {
  useState,
  useEffect
} from "react";

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

export default function Homeboard() {
  const [creditView, setCreditView] =
    useState<"guidelines" | "rewards">(
      "guidelines"
    );

    const [passportData, setPassportData] =
  useState<any[]>([]);
useEffect(() => {
  loadPassport();
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

// ============================
// CURRENT LOGGED IN STUDENT
// ============================

const profile = JSON.parse(
  localStorage.getItem(
    "studentProfile"
  ) || "{}"
);

const studentId =
  profile.parent_email
    ?.toLowerCase()
    .replace("@", "_")
    .replace(/\./g, "_");

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

  return (
    <div
      style={{
        padding: "30px",
        background: "#F4F5F7",
        minHeight: "100vh"
      }}
    >
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

      {/* AI SECTION */}

      <div
        style={{
          background: "#FFF",
          borderRadius: 24,
          padding: 30,
          marginBottom: 25
        }}
      >
        <h2>AI Evaluation Center</h2>

        <div
          style={{
            display: "flex",
            gap: 15,
            marginTop: 20
          }}
        >
          <button
            style={{
              background: "#FF6B00",
              color: "#FFF",
              border: "none",
              padding: "14px 24px",
              borderRadius: 12,
              cursor: "pointer"
            }}
          >
            AI Evaluate Student
          </button>

          <button
            style={{
              background: "#0F172A",
              color: "#FFF",
              border: "none",
              padding: "14px 24px",
              borderRadius: 12,
              cursor: "pointer"
            }}
          >
            View Evaluation
          </button>
        </div>
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
     {/* PERFORMANCE INTELLIGENCE */}

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
    PERFORMANCE INTELLIGENCE
  </div>

  <h2
    style={{
      marginTop: 8
    }}
  >
    Student Capability Intelligence Report
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24,
      marginTop: 20
    }}
  >

    <div
      style={{
        background: "#F8FAFC",
        borderRadius: 18,
        padding: 24
      }}
    >
      <h3>Primary Strength</h3>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#F97316"
        }}
      >
        Leadership
      </div>

      <p>
        Student consistently demonstrates
        decision making, initiative and
        influence across activities.
      </p>
    </div>

    <div
      style={{
        background: "#F8FAFC",
        borderRadius: 18,
        padding: 24
      }}
    >
      <h3>Growth Opportunity</h3>

      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "#2563EB"
        }}
      >
        Collaboration
      </div>

      <p>
        Team participation scores indicate
        room for stronger group engagement.
      </p>
    </div>

  </div>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(4,1fr)",
      gap: 16,
      marginTop: 24
    }}
  >

    <div
      style={{
        background: "#FFF7ED",
        padding: 20,
        borderRadius: 18
      }}
    >
      <div>Communication Index</div>
      <h2>{avgCommunication}</h2>
    </div>

    <div
      style={{
        background: "#EFF6FF",
        padding: 20,
        borderRadius: 18
      }}
    >
      <div>Leadership Index</div>
      <h2>{avgLeadership}</h2>
    </div>

    <div
      style={{
        background: "#F5F3FF",
        padding: 20,
        borderRadius: 18
      }}
    >
      <div>Thinking Index</div>
      <h2>{avgThinking}</h2>
    </div>

    <div
      style={{
        background: "#F0FDF4",
        padding: 20,
        borderRadius: 18
      }}
    >
      <div>Confidence Index</div>
      <h2>{avgConfidence}</h2>
    </div>

  </div>
</div>

{/* PATHWAY RECOMMENDATION */}

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
    AI PATHWAY ENGINE
  </div>

  <h2
    style={{
      marginTop: 8
    }}
  >
    Recommended Growth Pathway
  </h2>

  <div
    style={{
      background:
        "linear-gradient(90deg,#FFF7ED,#FFFFFF)",
      borderRadius: 20,
      padding: 30,
      marginTop: 20
    }}
  >
    <h1
      style={{
        color: "#F97316",
        marginBottom: 10
      }}
    >
      Emerging Student Leader
    </h1>

    <p>
      Based on performance patterns,
      leadership consistency and
      communication capability,
      this student shows strong
      potential in student council,
      debating, entrepreneurship
      and public leadership tracks.
    </p>
  </div>
</div>


{/* STUDENT DNA PROFILE */}

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
    STUDENT DNA INTELLIGENCE
  </div>

  <h2
    style={{
      marginTop: 8
    }}
  >
    Student DNA Profile
  </h2>

  <p
    style={{
      color: "#64748B",
      marginBottom: 25
    }}
  >
    Behavioral fingerprint generated from
    competition performance patterns.
  </p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24
    }}
  >

    {/* LEFT */}

    <div
      style={{
        background: "#F8FAFC",
        borderRadius: 18,
        padding: 24
      }}
    >
      <h3>Core DNA Archetype</h3>

      <div
        style={{
          fontSize: 32,
          fontWeight: 800,
          color: "#F97316",
          marginBottom: 10
        }}
      >
        Emerging Leader
      </div>

      <p>
        Strong communication,
        leadership presence and
        confidence suggest a natural
        inclination toward influence,
        presentation and team guidance.
      </p>
    </div>

    {/* RIGHT */}

    <div
      style={{
        background: "#F8FAFC",
        borderRadius: 18,
        padding: 24
      }}
    >
      <h3>Potential Career Clusters</h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 12
        }}
      >
        {[
          "Entrepreneur",
          "Public Speaker",
          "Law",
          "Management",
          "Politics",
          "Leadership"
        ].map((item) => (
          <div
            key={item}
            style={{
              background: "#FFF7ED",
              color: "#F97316",
              padding: "8px 14px",
              borderRadius: 20,
              fontWeight: 600
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>

  </div>

  {/* DNA RADARS */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(6,1fr)",
      gap: 16,
      marginTop: 24
    }}
  >
    {[
      ["Leader", 88],
      ["Creator", 72],
      ["Thinker", 81],
      ["Collaborator", 75],
      ["Performer", 84],
      ["Innovator", 78]
    ].map(([label, score]) => (
      <div
        key={label}
        style={{
          background: "#F8FAFC",
          borderRadius: 16,
          padding: 18,
          textAlign: "center"
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: "#64748B"
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#0F172A"
          }}
        >
          {score}
        </div>
      </div>
    ))}
  </div>
</div>

    {/* CREDIT SYSTEM */}

<div
  style={{
    background: "#071226",
    color: "white",
    borderRadius: 32,
    padding: 35,
    marginTop: 30
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 30
    }}
  >
    <div>
      <div
        style={{
          color: "#FF8A00",
          fontSize: 11,
          letterSpacing: 2,
          fontWeight: 700,
          marginBottom: 8
        }}
      >
        NEP 2020 ACCREDITATION LEDGER
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: 34
        }}
      >
        Student Co-Curricular Credits Dashboard
      </h2>
    </div>

    <div
      style={{
        display: "flex",
        gap: 12
      }}
    >
      <button
        style={{
          background: "#FF6B00",
          color: "white",
          border: "none",
          padding: "12px 18px",
          borderRadius: 12,
          fontWeight: 700
        }}
      >
        + Simulate Win (+50)
      </button>

      <button
        style={{
          background: "#E08A00",
          color: "white",
          border: "none",
          padding: "12px 18px",
          borderRadius: 12,
          fontWeight: 700
        }}
      >
        + Simulate Tryout (+20)
      </button>
    </div>
  </div>

  {/* TOP STATS */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: 20,
      marginBottom: 25
    }}
  >
    <div
      style={{
        background: "#03112A",
        borderRadius: 18,
        padding: 24
      }}
    >
      <div>Total Earned Credits</div>
      <h1>411</h1>
    </div>

    <div
      style={{
        background: "#03112A",
        borderRadius: 18,
        padding: 24
      }}
    >
      <div>Spent Credits</div>
      <h1>0</h1>
    </div>

    <div
      style={{
        background: "#140B14",
        border: "1px solid #5E2D00",
        borderRadius: 18,
        padding: 24
      }}
    >
      <div>Available Remaining Balance</div>
      <h1>411</h1>
    </div>
  </div>

  {/* ACTION BAR */}

  <div
    style={{
      background: "#020C22",
      borderRadius: 18,
      padding: 18,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 25
    }}
  >
    <div>🔍 Search Ledger Mechanics</div>

    <div
      style={{
        display: "flex",
        gap: 10
      }}
    >
      <button
  onClick={() =>
    setCreditView("rewards")
  }
  style={{
    background:
      creditView === "rewards"
        ? "#FF6B00"
        : "#16223D",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: 12,
    cursor: "pointer"
  }}
>
  Redeem Rewards & Earning Board
</button>

<button
  onClick={() =>
    setCreditView("guidelines")
  }
  style={{
    background:
      creditView === "guidelines"
        ? "#FF6B00"
        : "#16223D",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: 12,
    cursor: "pointer"
  }}
>
  Learn Credit Rules & Guidelines
</button>
    </div>
  </div>

  {/* MAIN TABLE */}

<div
  style={{
    background: "#020C22",
    borderRadius: 24,
    padding: 28
  }}
>
  {creditView === "guidelines" ? (
    <>
      <h3
        style={{
          marginTop: 0,
          marginBottom: 25
        }}
      >
        📖 Co-Curricular Accredited Earning & Spending Guidelines
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24
        }}
      >
        <div>
          <h4
            style={{
              color: "#FF8A00"
            }}
          >
            📈 Ways To Accrue Merit Credits
          </h4>

          {[
            ["Competition Victories", "+50 Credits"],
            ["Topping School Tryouts", "+20 Credits"],
            ["Performance Uploads", "+5 Credits"],
            ["Project Submissions", "+5 Credits"],
            ["Event Participation", "+10 Credits"],
            ["Semester Academic Toppers", "+50 Credits"],
            ["Daily Academic Feedback", "+1 Credit"]
          ].map((item) => (
            <div
              key={item[0]}
              style={{
                background: "#101B35",
                padding: 18,
                borderRadius: 14,
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>{item[0]}</span>

              <span
                style={{
                  color: "#FFB000",
                  fontWeight: 700
                }}
              >
                {item[1]}
              </span>
            </div>
          ))}
        </div>

        <div>
          <h4
            style={{
              color: "#FF8A00"
            }}
          >
            🎁 Ways To Retain & Spend Credits
          </h4>

          {[
            ["Direct Expert Consultations", "-20 Credits"],
            ["Partner Reach-Out Match", "-200 Credits"],
            ["Institutional Leadership Roles", "-250 Credits"],
            ["Principal Roundtable Lunch", "-300 Credits"],
            ["Academy Merit Club Membership", "-350 to -500"]
          ].map((item) => (
            <div
              key={item[0]}
              style={{
                background: "#101B35",
                padding: 18,
                borderRadius: 14,
                marginBottom: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>{item[0]}</span>

              <span
                style={{
                  color: "#FF5A5A",
                  fontWeight: 700
                }}
              >
                {item[1]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  ) : (
    <>
      <h3
        style={{
          marginTop: 0,
          marginBottom: 25
        }}
      >
        🎁 Redeem Rewards & Opportunities
      </h3>

      <div
        style={{
          display: "grid",
          gap: 14
        }}
      >
        {[
          [
            "Direct Consultation From Experts",
            "20 Credits"
          ],
          [
            "Partner Reach-Out Match",
            "200 Credits"
          ],
          [
            "Leadership Eligibility Status",
            "250 Credits"
          ],
          [
            "Principal Roundtable Lunch",
            "300 Credits"
          ],
          [
            "Bronze Club Membership",
            "350 Credits"
          ],
          [
            "Silver Club Membership",
            "400 Credits"
          ],
          [
            "Gold Club Membership",
            "500 Credits"
          ]
        ].map((item) => (
          <div
            key={item[0]}
            style={{
              background: "#101B35",
              padding: 20,
              borderRadius: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 6
                }}
              >
                {item[0]}
              </div>

              <div
                style={{
                  color: "#94A3B8"
                }}
              >
                Cost: {item[1]}
              </div>
            </div>

            <button
              style={{
                background: "#FF6B00",
                border: "none",
                color: "white",
                borderRadius: 10,
                padding: "12px 18px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Redeem
            </button>
          </div>
        ))}
      </div>
    </>
  )}
</div>
    </div>
    </div>
  );}
