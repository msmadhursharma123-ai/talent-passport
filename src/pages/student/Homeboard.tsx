export default function Homeboard() {
  const dimensions = [
    {
      name: "Communication",
      score: 92.2,
      color: "#E85D04",
      icon: "📢"
    },
    {
      name: "Leadership",
      score: 84.3,
      color: "#2563EB",
      icon: "👑"
    },
    {
      name: "Critical Thinking",
      score: 89.5,
      color: "#7C3AED",
      icon: "🧠"
    },
    {
      name: "Collaboration",
      score: 88,
      color: "#2F9E44",
      icon: "🤝"
    },
    {
      name: "Confidence",
      score: 88.5,
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
            88.5
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
        <h2>Performance Growth Trajectory</h2>

        <div
          style={{
            height: 320,
            borderRadius: 20,
            background:
              "linear-gradient(180deg,#FFFFFF,#F8FAFC)",
            border: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#64748B"
          }}
        >
          Graph Placeholder
        </div>
      </div>

      {/* RANKINGS */}

      <div
        style={{
          background: "#FFF",
          borderRadius: 24,
          padding: 30,
          marginBottom: 25
        }}
      >
        <h2>Consolidated Rankings Scoreboard</h2>

        <div
          style={{
            display: "grid",
            gap: 12,
            marginTop: 20
          }}
        >
          <div
            style={{
              padding: 18,
              border: "1px solid #CBD5E1",
              borderRadius: 12
            }}
          >
            School Audition Rank #2
          </div>

          <div
            style={{
              padding: 18,
              border: "1px solid #CBD5E1",
              borderRadius: 12
            }}
          >
            District Rank #14
          </div>

          <div
            style={{
              padding: 18,
              border: "1px solid #CBD5E1",
              borderRadius: 12
            }}
          >
            National Percentile Top 2%
          </div>
        </div>
      </div>

      {/* CREDIT SYSTEM */}

      <div
        style={{
          background: "#071226",
          color: "white",
          borderRadius: 30,
          padding: 35
        }}
      >
        <h2>
          Student Co-Curricular Credits Dashboard
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: 20,
            marginTop: 25
          }}
        >
          <div
            style={{
              background: "#09162F",
              padding: 25,
              borderRadius: 20
            }}
          >
            <h3>Total Credits</h3>
            <h1>411</h1>
          </div>

          <div
            style={{
              background: "#09162F",
              padding: 25,
              borderRadius: 20
            }}
          >
            <h3>Spent Credits</h3>
            <h1>0</h1>
          </div>

          <div
            style={{
              background: "#09162F",
              padding: 25,
              borderRadius: 20
            }}
          >
            <h3>Available Balance</h3>
            <h1>411</h1>
          </div>
        </div>

        <div
          style={{
            marginTop: 35
          }}
        >
          <h3>Consultation & Rewards Portal</h3>

          <ul>
            <li>Direct Expert Consultation</li>
            <li>Partner Reach-Out Match</li>
            <li>Leadership Eligibility Status</li>
            <li>Principal Roundtable Lunch</li>
            <li>Bronze / Silver / Gold Club Membership</li>
          </ul>
        </div>
      </div>
    </div>
  );
}