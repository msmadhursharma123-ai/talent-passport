import React from "react";

export default function GrowthPlan() {
  return (
    <div
      style={{
        padding: "30px",
        background: "#F4F5F7",
        minHeight: "100vh"
      }}
    >

      {/* HERO */}

      <div
        style={{
          background: "#FFF",
          borderRadius: 28,
          padding: 40,
          marginBottom: 30
        }}
      >
        <div
          style={{
            color: "#FF6B00",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            marginBottom: 12
          }}
        >
          TALENT PASSPORT INTELLIGENCE ENGINE
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 42,
            color: "#0F172A"
          }}
        >
          Talent Passport AI Growth Operating System™
        </h1>

        <p
          style={{
            marginTop: 15,
            fontSize: 18,
            color: "#64748B",
            maxWidth: 900,
            lineHeight: 1.7
          }}
        >
          Your personalized growth blueprint generated using
          competitions, projects, portfolio evidence,
          skills assessments, DNA questionnaire responses,
          participation history and performance trends.
        </p>
      </div>

      {/* ANALYSIS STATS */}

      <div
        style={{
          background: "#FFF",
          borderRadius: 28,
          padding: 35,
          marginBottom: 30
        }}
      >
        <div
          style={{
            color: "#FF6B00",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            marginBottom: 10
          }}
        >
          DATA ANALYSIS SUMMARY
        </div>

        <h2
          style={{
            marginTop: 0,
            marginBottom: 30
          }}
        >
          How Much Data Was Used
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: 20
          }}
        >
          <div
            style={{
              background: "#FAFAFA",
              borderRadius: 18,
              padding: 25,
              border: "1px solid #E2E8F0"
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#64748B"
              }}
            >
              Competitions Analysed
            </div>

            <h1
              style={{
                marginBottom: 0,
                color: "#FF6B00"
              }}
            >
              12
            </h1>
          </div>

          <div
            style={{
              background: "#FAFAFA",
              borderRadius: 18,
              padding: 25,
              border: "1px solid #E2E8F0"
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#64748B"
              }}
            >
              Projects Analysed
            </div>

            <h1
              style={{
                marginBottom: 0,
                color: "#FF6B00"
              }}
            >
              8
            </h1>
          </div>

          <div
            style={{
              background: "#FAFAFA",
              borderRadius: 18,
              padding: 25,
              border: "1px solid #E2E8F0"
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#64748B"
              }}
            >
              Portfolio Evidence
            </div>

            <h1
              style={{
                marginBottom: 0,
                color: "#FF6B00"
              }}
            >
              14
            </h1>
          </div>

          <div
            style={{
              background: "#FAFAFA",
              borderRadius: 18,
              padding: 25,
              border: "1px solid #E2E8F0"
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#64748B"
              }}
            >
              Total Signals Used
            </div>

            <h1
              style={{
                marginBottom: 0,
                color: "#FF6B00"
              }}
            >
              147
            </h1>
          </div>
        </div>
      </div>

      {/* HOW WE ANALYSED */}

      <div
        style={{
          background: "#FFF",
          borderRadius: 28,
          padding: 35,
          marginBottom: 30
        }}
      >
        <div
          style={{
            color: "#FF6B00",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            marginBottom: 10
          }}
        >
          TRUST & TRANSPARENCY
        </div>

        <h2
          style={{
            marginTop: 0
          }}
        >
          How We Analysed You
        </h2>

        <p
          style={{
            color: "#64748B",
            marginBottom: 30,
            lineHeight: 1.8
          }}
        >
          This report is not based on a single competition.
          It combines all available Talent Passport data
          to understand your strengths, opportunities,
          learning behaviour and growth potential.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(300px,1fr))",
            gap: 16
          }}
        >
          {[
            "Competition Participation",
            "Competition Scores",
            "Project Submissions",
            "Portfolio Evidence",
            "Skill Assessments",
            "Student DNA Questionnaire",
            "Performance Trends",
            "Growth Trajectory",
            "Leadership Indicators",
            "Communication Indicators",
            "Consistency Patterns",
            "Participation Behaviour"
          ].map((item) => (
            <div
              key={item}
              style={{
                background: "#FAFAFA",
                borderRadius: 14,
                padding: 18,
                border: "1px solid #E2E8F0"
              }}
            >
              ✓ {item}
            </div>
          ))}
        </div>
      </div>

{/* STUDENT DNA INTELLIGENCE */}

<div
  style={{
    background: "#FFF",
    borderRadius: 28,
    padding: 35,
    marginBottom: 30
  }}
>
  <div
    style={{
      color: "#FF6B00",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 2,
      marginBottom: 10
    }}
  >
    STUDENT DNA INTELLIGENCE
  </div>

  <h2
    style={{
      marginTop: 0,
      marginBottom: 10
    }}
  >
    Personality & Performance Blueprint
  </h2>

  <p
    style={{
      color: "#64748B",
      marginBottom: 30,
      lineHeight: 1.8
    }}
  >
    This section combines questionnaire responses,
    participation behaviour, competition performance,
    communication indicators, project activity and
    growth patterns to identify the student's natural
    strengths and development areas.
  </p>

  {/* TOP SUMMARY */}

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit,minmax(250px,1fr))",
      gap: 20,
      marginBottom: 30
    }}
  >
    <div
      style={{
        background: "#FFF7ED",
        border: "1px solid #FED7AA",
        borderRadius: 18,
        padding: 24
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#64748B"
        }}
      >
        Primary Growth Archetype
      </div>

      <h3
        style={{
          marginBottom: 0,
          color: "#F97316"
        }}
      >
        Emerging Leader
      </h3>
    </div>

    <div
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 18,
        padding: 24
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#64748B"
        }}
      >
        Dominant Strength
      </div>

      <h3
        style={{
          marginBottom: 0
        }}
      >
        Communication
      </h3>
    </div>

    <div
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 18,
        padding: 24
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#64748B"
        }}
      >
        Improvement Priority
      </div>

      <h3
        style={{
          marginBottom: 0
        }}
      >
        Collaboration
      </h3>
    </div>
  </div>

  {/* AI OBSERVATIONS */}

  <div
    style={{
      background: "#FAFAFA",
      borderRadius: 20,
      padding: 25,
      border: "1px solid #E2E8F0",
      marginBottom: 25
    }}
  >
    <h3
      style={{
        marginTop: 0
      }}
    >
      AI Observations
    </h3>

    <div
      style={{
        display: "grid",
        gap: 12
      }}
    >
      <div>
        • Student performs best when presenting
        ideas independently.
      </div>

      <div>
        • Communication confidence remains
        consistently high across activities.
      </div>

      <div>
        • Leadership signals increase when
        working on challenge-based tasks.
      </div>

      <div>
        • Student prefers execution ownership
        over support roles.
      </div>

      <div>
        • Team participation exists but can be
        improved through collaborative projects.
      </div>
    </div>
  </div>

  {/* NATURAL WORKING STYLE */}

  <div
    style={{
      background: "#F8FAFC",
      borderRadius: 20,
      padding: 25,
      border: "1px solid #E2E8F0"
    }}
  >
    <h3
      style={{
        marginTop: 0
      }}
    >
      Natural Working Style
    </h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(250px,1fr))",
        gap: 20
      }}
    >
      <div>
        <strong>Decision Style</strong>
        <p>
          Takes initiative quickly and prefers
          action over long planning.
        </p>
      </div>

      <div>
        <strong>Learning Style</strong>
        <p>
          Learns faster through participation
          and practical experiences.
        </p>
      </div>

      <div>
        <strong>Communication Style</strong>
        <p>
          Comfortable speaking publicly and
          sharing ideas confidently.
        </p>
      </div>

      <div>
        <strong>Leadership Style</strong>
        <p>
          Leads by taking responsibility and
          influencing peers through action.
        </p>
      </div>
    </div>
  </div>
</div>

{/* OPPORTUNITY FIT ENGINE */}

<div
  style={{
    background: "#FFF",
    borderRadius: 28,
    padding: 35,
    marginBottom: 30
  }}
>
  <div
    style={{
      color: "#FF6B00",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 2,
      marginBottom: 10
    }}
  >
    TALENT PASSPORT AI MATCHING ENGINE
  </div>

  <h2
    style={{
      marginTop: 0
    }}
  >
    Opportunity Fit Engine™
  </h2>

  <p
    style={{
      color: "#64748B",
      lineHeight: 1.8,
      marginBottom: 30
    }}
  >
    Instead of predicting careers,
    Talent Passport identifies real
    opportunities where you can
    perform, grow and lead right now.
  </p>

  {/* FIT SCORE */}

  <div
    style={{
      background:
        "linear-gradient(135deg,#FFF7ED,#FFFFFF)",
      border: "1px solid #FED7AA",
      borderRadius: 22,
      padding: 30,
      marginBottom: 30
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >
      <div>
        <div
          style={{
            color: "#64748B",
            fontSize: 13
          }}
        >
          CURRENT OPPORTUNITY FIT
        </div>

        <h1
          style={{
            margin: "8px 0"
          }}
        >
          Emerging Leadership Track
        </h1>

        <p
          style={{
            margin: 0,
            color: "#64748B"
          }}
        >
          Strong communication and leadership
          indicators suggest higher success
          in visible responsibility roles.
        </p>
      </div>

      <div
        style={{
          background: "#F97316",
          color: "#FFF",
          width: 120,
          height: 120,
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div
          style={{
            fontSize: 12
          }}
        >
          FIT SCORE
        </div>

        <div
          style={{
            fontSize: 42,
            fontWeight: 800
          }}
        >
          88%
        </div>
      </div>
    </div>
  </div>

  {/* HIGHLY SUITABLE */}

  <div
    style={{
      marginBottom: 25
    }}
  >
    <h3>Highly Suitable</h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(240px,1fr))",
        gap: 15
      }}
    >
      {[
        "Student Council",
        "School Leadership Team",
        "Debate Club",
        "Public Speaking Events",
        "Entrepreneurship Club",
        "Youth Parliament"
      ].map((item) => (
        <div
          key={item}
          style={{
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: 16,
            padding: 18,
            fontWeight: 600
          }}
        >
          {item}
        </div>
      ))}
    </div>
  </div>

  {/* SUITABLE */}

  <div
    style={{
      marginBottom: 25
    }}
  >
    <h3>Suitable</h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(240px,1fr))",
        gap: 15
      }}
    >
      {[
        "Innovation Challenges",
        "Community Projects",
        "MUN Conferences",
        "Hackathons",
        "School Magazine",
        "Social Impact Projects"
      ].map((item) => (
        <div
          key={item}
          style={{
            background: "#F8FAFC",
            border: "1px solid #CBD5E1",
            borderRadius: 16,
            padding: 18
          }}
        >
          {item}
        </div>
      ))}
    </div>
  </div>

  {/* FUTURE EXPLORATION */}

  <div>
    <h3>Future Exploration</h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: 15
      }}
    >
      {[
        "Business",
        "Public Policy",
        "Media & Communication",
        "Law",
        "Product Management",
        "Consulting"
      ].map((item) => (
        <div
          key={item}
          style={{
            background: "#FFF7ED",
            border: "1px solid #FED7AA",
            borderRadius: 16,
            padding: 18
          }}
        >
          {item}
        </div>
      ))}
    </div>
  </div>
</div>

{/* TALENT PASSPORT AI GROWTH OPERATING SYSTEM */}

<div
  style={{
    background: "#FFF",
    borderRadius: 28,
    padding: 35,
    marginBottom: 30
  }}
>
  <div
    style={{
      color: "#FF6B00",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 2,
      marginBottom: 10
    }}
  >
    TALENT PASSPORT AI GROWTH OPERATING SYSTEM™
  </div>

  <h2
    style={{
      marginTop: 0
    }}
  >
    Your Growth Roadmap
  </h2>

  <p
    style={{
      color: "#64748B",
      lineHeight: 1.8,
      marginBottom: 30
    }}
  >
    Based on your competitions, projects,
    portfolio, participation behaviour,
    DNA profile and performance trends,
    this roadmap shows the most likely
    path to accelerate your growth.
  </p>

  {/* CURRENT POSITION */}

  <div
    style={{
      background: "#F8FAFC",
      borderRadius: 20,
      padding: 25,
      marginBottom: 25,
      border: "1px solid #E2E8F0"
    }}
  >
    <h3>Current Position</h3>

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(4,1fr)",
        gap: 16
      }}
    >
      <div>
        <strong>Overall Score</strong>
        <h2>79</h2>
      </div>

      <div>
        <strong>Growth Stage</strong>
        <h2>Explorer</h2>
      </div>

      <div>
        <strong>Strongest Skill</strong>
        <h2>Leadership</h2>
      </div>

      <div>
        <strong>Focus Area</strong>
        <h2>Collaboration</h2>
      </div>
    </div>
  </div>

  {/* NEXT MILESTONE */}

  <div
    style={{
      background:
        "linear-gradient(90deg,#FFF7ED,#FFF)",
      border: "1px solid #FED7AA",
      borderRadius: 20,
      padding: 25,
      marginBottom: 25
    }}
  >
    <h3>Next Milestone</h3>

    <h2
      style={{
        color: "#F97316"
      }}
    >
      Emerging Leader
    </h2>

    <p>
      Improve collaboration, participate
      in 2 additional team-based activities
      and complete one leadership challenge
      to unlock the next growth stage.
    </p>
  </div>

  {/* VISUAL ROADMAP */}

  <div
    style={{
      marginBottom: 30
    }}
  >
    <h3>Growth Journey</h3>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 20
      }}
    >
      {[
        "Explorer",
        "Contributor",
        "Performer",
        "Emerging Leader",
        "School Leader",
        "National Fellow"
      ].map((step, index) => (
        <React.Fragment key={step}>
          <div
            style={{
              textAlign: "center"
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background:
                  index <= 2
                    ? "#F97316"
                    : "#E2E8F0",
                color:
                  index <= 2
                    ? "#FFF"
                    : "#64748B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                fontWeight: 700
              }}
            >
              {index + 1}
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 12
              }}
            >
              {step}
            </div>
          </div>

          {index < 5 && (
            <div
              style={{
                flex: 1,
                height: 3,
                background: "#E2E8F0"
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>

</div>

{/* 90 DAY GROWTH SPRINT */}

<div
  style={{
    background: "#FFF",
    borderRadius: 28,
    padding: 35,
    marginBottom: 30
  }}
>
  <h2>90 Day Growth Sprint™</h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(3,1fr)",
      gap: 20,
      marginTop: 25
    }}
  >

    <div
      style={{
        background: "#F8FAFC",
        borderRadius: 18,
        padding: 24
      }}
    >
      <h3>Month 1</h3>

      <ul>
        <li>1 Speaking Activity</li>
        <li>1 Team Activity</li>
        <li>1 Creative Submission</li>
      </ul>

      <strong>
        Expected Impact:
      </strong>

      <p>
        +2 Communication
      </p>
    </div>

    <div
      style={{
        background: "#F8FAFC",
        borderRadius: 18,
        padding: 24
      }}
    >
      <h3>Month 2</h3>

      <ul>
        <li>1 Debate</li>
        <li>1 Leadership Activity</li>
        <li>1 Project Submission</li>
      </ul>

      <strong>
        Expected Impact:
      </strong>

      <p>
        +3 Leadership
      </p>
    </div>

    <div
      style={{
        background: "#F8FAFC",
        borderRadius: 18,
        padding: 24
      }}
    >
      <h3>Month 3</h3>

      <ul>
        <li>1 School Competition</li>
        <li>1 Team Challenge</li>
        <li>1 Presentation</li>
      </ul>

      <strong>
        Expected Impact:
      </strong>

      <p>
        +5 Overall Score
      </p>
    </div>

  </div>
</div>


{/* 180 DAY LEADERSHIP ROADMAP */}

<div
  style={{
    background: "#FFF",
    borderRadius: 28,
    padding: 35,
    marginBottom: 30
  }}
>
  <div
    style={{
      color: "#FF6B00",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 2,
      marginBottom: 10
    }}
  >
    MID TERM DEVELOPMENT PLAN
  </div>

  <h2>
    180 Day Leadership Roadmap™
  </h2>

  <p
    style={{
      color: "#64748B",
      lineHeight: 1.8
    }}
  >
    This roadmap focuses on transforming
    participation into leadership and
    responsibility.
  </p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit,minmax(260px,1fr))",
      gap: 20,
      marginTop: 25
    }}
  >

    <div
      style={{
        background: "#F8FAFC",
        borderRadius: 18,
        padding: 24
      }}
    >
      <h3>Month 4-5</h3>

      <ul>
        <li>Lead one team activity</li>
        <li>Join school club</li>
        <li>Complete one project</li>
      </ul>
    </div>

    <div
      style={{
        background: "#F8FAFC",
        borderRadius: 18,
        padding: 24
      }}
    >
      <h3>Month 5-6</h3>

      <ul>
        <li>Organize an event</li>
        <li>Mentor junior students</li>
        <li>Take responsibility role</li>
      </ul>
    </div>

    <div
      style={{
        background: "#FFF7ED",
        borderRadius: 18,
        padding: 24,
        border: "1px solid #FED7AA"
      }}
    >
      <h3>Expected Outcome</h3>

      <p>
        Leadership Score
      </p>

      <h1
        style={{
          color: "#F97316"
        }}
      >
        80 → 88
      </h1>
    </div>

  </div>
</div>


{/* 365 DAY TRANSFORMATION BLUEPRINT */}

<div
  style={{
    background: "#FFF",
    borderRadius: 28,
    padding: 35,
    marginBottom: 30
  }}
>
  <div
    style={{
      color: "#FF6B00",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 2,
      marginBottom: 10
    }}
  >
    LONG TERM TRANSFORMATION PLAN
  </div>

  <h2>
    365 Day Transformation Blueprint™
  </h2>

  <p
    style={{
      color: "#64748B",
      lineHeight: 1.8
    }}
  >
    If you consistently follow the
    Talent Passport roadmap, this is
    your projected growth journey.
  </p>

  <div
    style={{
      marginTop: 35
    }}
  >

    {[
      "Current Participant",
      "Active Contributor",
      "Consistent Performer",
      "Emerging Leader",
      "School Leader",
      "National Talent Passport Fellow"
    ].map((item, index) => (
      <div
        key={item}
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 25
        }}
      >
        <div
          style={{
            width: 55,
            height: 55,
            borderRadius: "50%",
            background:
              index < 3
                ? "#F97316"
                : "#E2E8F0",
            color:
              index < 3
                ? "#FFF"
                : "#64748B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            marginRight: 20
          }}
        >
          {index + 1}
        </div>

        <div>
          <strong>{item}</strong>
        </div>
      </div>
    ))}

  </div>
</div>

{/* PARENT ACTION GUIDE */}

<div
  style={{
    background: "#FFF",
    borderRadius: 28,
    padding: 35,
    marginBottom: 30
  }}
>
  <div
    style={{
      color: "#FF6B00",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 2,
      marginBottom: 10
    }}
  >
    PARENT ENABLEMENT
  </div>

  <h2>
    Parent Action Guide™
  </h2>

  <p
    style={{
      color: "#64748B",
      marginBottom: 30
    }}
  >
    Small actions at home can
    significantly improve growth.
  </p>

  <div
    style={{
      display: "grid",
      gap: 15
    }}
  >
    {[
      "Ask your child to explain one thing learned each day.",
      "Encourage participation before perfection.",
      "Give opportunities to lead family activities.",
      "Allow independent decision making.",
      "Review Talent Passport once every month.",
      "Celebrate consistency, not only results."
    ].map((item) => (
      <div
        key={item}
        style={{
          background: "#F8FAFC",
          padding: 18,
          borderRadius: 14,
          border: "1px solid #E2E8F0"
        }}
      >
        ✓ {item}
      </div>
    ))}
  </div>
</div>

{/* GROWTH PROJECTION */}

<div
  style={{
    background:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF6B00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    FUTURE PERFORMANCE PROJECTION
  </div>

  <h2>
    Growth Projection Simulator™
  </h2>

  <p
    style={{
      color:"#64748B",
      marginBottom:30
    }}
  >
    Based on your current participation
    behaviour and performance trajectory.
  </p>

  <div
    style={{
      display:"grid",
      gridTemplateColumns:"repeat(4,1fr)",
      gap:20
    }}
  >

    <div
      style={{
        background:"#F8FAFC",
        borderRadius:18,
        padding:24
      }}
    >
      <div>Current Score</div>
      <h1>79</h1>
    </div>

    <div
      style={{
        background:"#FFF7ED",
        borderRadius:18,
        padding:24
      }}
    >
      <div>90 Day Projection</div>
      <h1>84</h1>
    </div>

    <div
      style={{
        background:"#FFF7ED",
        borderRadius:18,
        padding:24
      }}
    >
      <div>180 Day Projection</div>
      <h1>88</h1>
    </div>

    <div
      style={{
        background:"#ECFDF5",
        borderRadius:18,
        padding:24
      }}
    >
      <div>365 Day Projection</div>
      <h1>92</h1>
    </div>

  </div>
</div>

<div
  style={{
    background:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF6B00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    READINESS ENGINE
  </div>

  <h2>
    Leadership & Responsibility Readiness
  </h2>

  <div
    style={{
      display:"grid",
      gap:18,
      marginTop:25
    }}
  >

    <div>
      Leadership Readiness — 84%
    </div>

    <div>
      Communication Readiness — 91%
    </div>

    <div>
      Team Management Readiness — 73%
    </div>

    <div>
      Project Ownership Readiness — 81%
    </div>

  </div>
</div>



<div
  style={{
    background:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF6B00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    OPPORTUNITY UNLOCK TRACKER
  </div>

  <h2>
    What You Can Unlock Next
  </h2>

  <div
    style={{
      display:"grid",
      gap:16,
      marginTop:25
    }}
  >

    <div className="unlock-card">
      Student Council Eligibility
      <strong>83% Ready</strong>
    </div>

    <div className="unlock-card">
      School Leadership Team
      <strong>78% Ready</strong>
    </div>

    <div className="unlock-card">
      Debate Captain Pathway
      <strong>87% Ready</strong>
    </div>

    <div className="unlock-card">
      Youth Parliament Delegate
      <strong>80% Ready</strong>
    </div>

  </div>
</div>


<div
  style={{
    background:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF6B00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    AI PRIORITY RECOMMENDATIONS
  </div>

  <h2>
    Top 5 Actions For Maximum Growth
  </h2>

  <div
    style={{
      display:"grid",
      gap:15,
      marginTop:25
    }}
  >

    <div>
      1. Join one collaborative activity this month.
    </div>

    <div>
      2. Submit one communication-based project.
    </div>

    <div>
      3. Attempt one leadership challenge.
    </div>

    <div>
      4. Present work publicly at least once.
    </div>

    <div>
      5. Maintain monthly participation consistency.
    </div>

  </div>
</div>


<div
  style={{
    background:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF6B00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    LIKELIHOOD INDEX
  </div>

  <h2>
    Probability Of Future Success
  </h2>

  <div
    style={{
      display:"grid",
      gridTemplateColumns:"repeat(4,1fr)",
      gap:20,
      marginTop:25
    }}
  >

    <div>
      Leadership Success
      <h2>88%</h2>
    </div>

    <div>
      Communication Excellence
      <h2>91%</h2>
    </div>

    <div>
      Team Excellence
      <h2>74%</h2>
    </div>

    <div>
      Innovation Success
      <h2>82%</h2>
    </div>

  </div>
</div>


<div
  style={{
    background:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF6B00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    FUTURE POTENTIAL FORECAST
  </div>

  <h2>
    Next 2-3 Year Development Outlook
  </h2>

  <p
    style={{
      color:"#64748B",
      lineHeight:1.8
    }}
  >
    Based on current participation, communication strength,
    leadership indicators, project activity and competition
    performance, the student is likely to develop strongest
    in communication-led leadership environments. Continued
    participation in collaborative activities can significantly
    increase leadership readiness and responsibility ownership.
  </p>

  <div
    style={{
      display:"flex",
      gap:15,
      marginTop:25,
      flexWrap:"wrap"
    }}
  >
    <span className="future-tag">
      Leadership Potential
    </span>

    <span className="future-tag">
      Public Speaking
    </span>

    <span className="future-tag">
      Youth Leadership
    </span>

    <span className="future-tag">
      Project Ownership
    </span>

    <span className="future-tag">
      Communication Excellence
    </span>
  </div>
</div>


<div
  style={{
    background:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF6B00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    HIDDEN POTENTIAL DISCOVERY
  </div>

  <h2>
    Strengths Not Fully Visible Yet
  </h2>

  <p
    style={{
      color:"#64748B"
    }}
  >
    Talent Passport found strong signals that are not yet fully reflected in your scores.
  </p>

  <div
    style={{
      display:"grid",
      gap:18,
      marginTop:25
    }}
  >

    <div className="potential-card">
      Leadership Potential Detected
      <strong>87%</strong>
    </div>

    <div className="potential-card">
      Public Speaking Potential
      <strong>91%</strong>
    </div>

    <div className="potential-card">
      Influence & Persuasion Potential
      <strong>85%</strong>
    </div>

  </div>
</div>


<div
  style={{
    background:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF6B00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    GROWTH BLOCKERS ENGINE
  </div>

  <h2>
    What Is Slowing Down Growth
  </h2>

  <div
    style={{
      display:"grid",
      gap:14,
      marginTop:25
    }}
  >

    <div>
      Collaboration opportunities are lower than communication activities.
    </div>

    <div>
      Team-based participation frequency is below ideal range.
    </div>

    <div>
      Leadership responsibilities are not yet consistent.
    </div>

    <div>
      More project ownership can accelerate growth.
    </div>

  </div>
</div>


<div
  style={{
    background:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF6B00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    TALENT PASSPORT AI COACH
  </div>

  <h2>
    Personalized Advice
  </h2>

  <div
    style={{
      background:"#FFF7ED",
      border:"1px solid #FED7AA",
      padding:25,
      borderRadius:18,
      marginTop:25
    }}
  >
    <p>
      You already perform strongly when speaking individually.
      The next stage of growth will come from leading small teams,
      coordinating projects and taking responsibility for outcomes.
    </p>

    <p>
      Focus on collaboration before trying to improve communication further.
      This will create faster overall growth.
    </p>
  </div>
</div>


<div
  style={{
    background:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF6B00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    STUDENT VS SELF
  </div>

  <h2>
    Personal Improvement Tracker
  </h2>

  <div
    style={{
      display:"grid",
      gridTemplateColumns:"repeat(5,1fr)",
      gap:15,
      marginTop:25
    }}
  >

    <div>
      Communication
      <h3>+11</h3>
    </div>

    <div>
      Leadership
      <h3>+9</h3>
    </div>

    <div>
      Thinking
      <h3>+8</h3>
    </div>

    <div>
      Collaboration
      <h3>+14</h3>
    </div>

    <div>
      Confidence
      <h3>+12</h3>
    </div>

  </div>
</div>


<div
  style={{
    background:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF6B00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    ACHIEVEMENT VELOCITY
  </div>

  <h2>
    Growth Speed Indicator
  </h2>

  <div
    style={{
      display:"grid",
      gridTemplateColumns:"1fr 1fr 1fr",
      gap:20,
      marginTop:25
    }}
  >
    <div>
      Participation Velocity
      <h2>High</h2>
    </div>

    <div>
      Skill Velocity
      <h2>Medium</h2>
    </div>

    <div>
      Leadership Velocity
      <h2>Rising</h2>
    </div>
  </div>
</div>


<div
  style={{
    background:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF6B00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    TALENT PASSPORT IMPACT SCORE
  </div>

  <h2>
    Overall Development Impact
  </h2>

  <div
    style={{
      display:"flex",
      justifyContent:"center",
      marginTop:30
    }}
  >
    <div
      style={{
        width:180,
        height:180,
        borderRadius:"50%",
        background:"#F97316",
        color:"#FFF",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        alignItems:"center"
      }}
    >
      <div>Impact Score</div>
      <h1>88</h1>
    </div>
  </div>

  <p
    style={{
      textAlign:"center",
      marginTop:20,
      color:"#64748B"
    }}
  >
    Higher than 82% of students with similar participation history.
  </p>
</div>


<div
  style={{
    background:"#071226",
    color:"#FFF",
    borderRadius:28,
    padding:35,
    marginBottom:30
  }}
>
  <div
    style={{
      color:"#FF8A00",
      fontSize:12,
      fontWeight:700,
      letterSpacing:2
    }}
  >
    NEXT ACTION COMMAND CENTER
  </div>

  <h2>
    Do These 3 Things Next
  </h2>

  <div
    style={{
      display:"grid",
      gap:18,
      marginTop:25
    }}
  >

    <div
      style={{
        background:"#0F1C33",
        padding:20,
        borderRadius:16
      }}
    >
      1. Join one team-based activity this month.
    </div>

    <div
      style={{
        background:"#0F1C33",
        padding:20,
        borderRadius:16
      }}
    >
      2. Submit one communication-focused project.
    </div>

    <div
      style={{
        background:"#0F1C33",
        padding:20,
        borderRadius:16
      }}
    >
      3. Take one leadership responsibility in school.
    </div>

  </div>
</div>


    </div>
  );
}