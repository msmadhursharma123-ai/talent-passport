import { useState } from "react";

export default function Homeboard() {
  const [creditView, setCreditView] =
    useState<"guidelines" | "rewards">(
      "guidelines"
    );
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
