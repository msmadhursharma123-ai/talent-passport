import { useState } from "react";

const pathwayData = {
  Communication: {
    events: {
      Speak90: {
        description: "90-second impromptu speaking",
        skills: {
          Communication: "Fluency, grammar, speech structure",
          Confidence: "Eye contact, posture, voice stability",
          "Critical Thinking": "Quality of ideas",
          Leadership: "Persuasive influence",
          Collaboration: "N/A"
        }
      },

      StorySprint: {
        description: "Tell a story from a prompt",
        skills: {
          Communication: "Story coherence",
          Confidence: "Delivery",
          "Critical Thinking": "Plot logic",
          Creativity: "Originality score",
          Leadership: "Audience engagement"
        }
      },

      "Podcast Hero": {
        description: "Record a 2-minute audio",
        skills: {
          Communication: "Voice quality",
          Confidence: "Vocal energy",
          "Critical Thinking": "Content depth",
          Collaboration: "Guest interaction"
        }
      },

      "News Anchor Challenge": {
        description: "Present a news bulletin",
        skills: {
          Communication: "Professional delivery",
          Confidence: "Camera presence",
          "Critical Thinking": "Fact interpretation",
          Leadership: "Authority in presentation"
        }
      },

      "Interview Master": {
        description: "Interview a teacher or parent",
        skills: {
          Communication: "Question quality",
          Confidence: "Speaking confidence",
          "Critical Thinking": "Follow-up questions",
          Collaboration: "Listening behavior"
        }
      }
    }
  },

  Creativity: {
    events: {
      Rhythm90: {
        description: "Dance",
        skills: {
          Creativity: "Originality",
          Expression: "Body language",
          Confidence: "Stage presence",
          Innovation: "Movement design",
          Originality: "Uniqueness"
        }
      },

      Melody90: {
        description: "Singing",
        skills: {
          Creativity: "Performance quality",
          Expression: "Voice modulation",
          Confidence: "Stage confidence",
          Innovation: "Interpretation",
          Originality: "Style"
        }
      },

      "Navras Live": {
        description: "Acting & emotions",
        skills: {
          Creativity: "Character depth",
          Expression: "Emotional range",
          Confidence: "Performance confidence",
          Innovation: "Scene interpretation",
          Originality: "Character portrayal"
        }
      },

      "Visual Story Lab": {
        description: "Art",
        skills: {
          Creativity: "Visual imagination",
          Expression: "Artistic expression",
          Confidence: "Presentation",
          Innovation: "Concept",
          Originality: "Design uniqueness"
        }
      },

      "Poetry Performance": {
        description: "Poetry presentation",
        skills: {
          Creativity: "Language usage",
          Expression: "Voice delivery",
          Confidence: "Audience presence",
          Innovation: "Interpretation",
          Originality: "Personal style"
        }
      },

      "Creative Writing": {
        description: "Stories and narratives",
        skills: {
          Creativity: "Storytelling",
          Expression: "Language",
          Confidence: "Idea clarity",
          Innovation: "Narrative structure",
          Originality: "Unique concepts"
        }
      }
    }
  },

  Thinking: {
    events: {
      "Problem Solving Arena": {
        description: "Problem solving challenge",
        skills: {
          "Problem Solving": "Solution quality",
          "Critical Thinking": "Logic",
          Innovation: "Creativity",
          Execution: "Implementation",
          Analysis: "Depth"
        }
      },

      "Design Thinking Challenge": {
        description: "Design thinking",
        skills: {
          "Problem Solving": "Problem framing",
          "Critical Thinking": "Reasoning",
          Innovation: "Idea generation",
          Execution: "Prototype quality",
          Analysis: "User insights"
        }
      },

      "STEM Project": {
        description: "Science project",
        skills: {
          "Problem Solving": "Technical solution",
          "Critical Thinking": "Scientific logic",
          Innovation: "Innovation",
          Execution: "Build quality",
          Analysis: "Research"
        }
      },

      "Business Challenge": {
        description: "Business case",
        skills: {
          "Problem Solving": "Business strategy",
          "Critical Thinking": "Decision making",
          Innovation: "New ideas",
          Execution: "Practicality",
          Analysis: "Market understanding"
        }
      },

      "Hack The School": {
        description: "School challenge",
        skills: {
          "Problem Solving": "Solutions",
          "Critical Thinking": "Reasoning",
          Innovation: "Creativity",
          Execution: "Implementation",
          Analysis: "Impact"
        }
      },

      "Social Impact Challenge": {
        description: "Community challenge",
        skills: {
          "Problem Solving": "Community solution",
          "Critical Thinking": "Evaluation",
          Innovation: "Approach",
          Execution: "Feasibility",
          Analysis: "Social impact"
        }
      }
    }
  },

  "Team Event": {
    events: {
      Nirnay: {
        description: "4 students receive situations",
        skills: {
          Leadership: "Team direction",
          "Decision Making": "Decision quality",
          Communication: "Communication",
          Negotiation: "Conflict handling",
          Ethics: "Judgement"
        }
      },

      "Mission Impossible": {
        description: "Real school challenge",
        skills: {
          "Problem Solving": "Solution quality",
          Collaboration: "Teamwork",
          Leadership: "Leadership",
          Innovation: "Creativity",
          Execution: "Implementation"
        }
      }
    }
  }
};

export default function CompetitionCommandCenter() {
  const [pathway, setPathway] =
    useState("Communication");

  const events = Object.keys(
    pathwayData[pathway as keyof typeof pathwayData].events
  );

  const [selectedEvent, setSelectedEvent] =
    useState(events[0]);

const [summary, setSummary] =
  useState("");

const [selectedFile, setSelectedFile] =
  useState<File | null>(null);

  const eventData =
  (
    pathwayData[
      pathway as keyof typeof pathwayData
    ].events as any
  )[selectedEvent];

  return (
  <div>
    {/* HERO */}

<div
  style={{
    background: "#FFF8F2",
    border: "1px solid #F4E6D4",
    borderRadius: 24,
    padding: 28,
    marginBottom: 28
  }}
>
  <div
    style={{
      display: "inline-block",
      background: "#FFF0DE",
      border: "1px solid #F2D8B5",
      borderRadius: 999,
      padding: "6px 12px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 2,
      color: "#F97316",
      marginBottom: 12
    }}
  >
    TRYOUT REGISTER DESK
  </div>

  <h2
    style={{
      margin: 0,
      fontSize: 34,
      fontWeight: 700,
      color: "#1E293B"
    }}
  >
    Co-curricular Pathway Auditions & Tryouts
  </h2>

  <p
    style={{
      color: "#64748B",
      marginTop: 10,
      fontSize: 15
    }}
  >
    Submit video clips, audio briefings or project demonstrations.
  </p>
</div>

    {/* MAIN GRID */}

    <div
      style={{
       display: "grid",
gridTemplateColumns: "1.7fr 1fr",
gap: 24,
alignItems: "start"
      }}
    >
      {/* LEFT PANEL */}

      <div
        style={{
          background: "#FFFFFF",
border: "1px solid #E2E8F0",
borderRadius: 28,
padding: 28
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: 24
          }}
        >
          Submit Performance Audition
        </h3>

        {/* PATHWAYS */}

        <div
          style={{
            marginBottom: 24
          }}
        >
          <div
            style={{
            fontSize: 11,
fontWeight: 700,
letterSpacing: 1.5,
color: "#94A3B8",
marginBottom: 12,
textTransform: "uppercase",
fontFamily: "'IBM Plex Mono', monospace"
            }}
          >
            STEP 1: SELECT BROAD PATHWAY
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4,1fr)",
              gap: 12
            }}
          >
            {[
  ["Communication", "🗣"],
  ["Creativity", "🎨"],
  ["Thinking", "💡"],
  ["Team Event", "🤝"]
].map(([item, icon]) => (
  <button
    key={item}
    onClick={() => {
      setPathway(item);

      const newEvents =
        Object.keys(
          pathwayData[
            item as keyof typeof pathwayData
          ].events
        );

      setSelectedEvent(newEvents[0]);
    }}
    style={{
      padding: 16,
      borderRadius: 14,

      background:
        pathway === item
          ? "#FFF8F1"
          : "#FFFFFF",

      color:
        pathway === item
          ? "#F97316"
          : "#334155",

      border:
        pathway === item
          ? "1px solid #F97316"
          : "1px solid #E2E8F0",

      cursor: "pointer",
      fontWeight: 600,

      fontFamily:
        "'IBM Plex Mono', monospace"
    }}
  >
    {icon} {item}
  </button>
))}
          </div>
        </div>

        {/* STEP 2 */}

<div
  style={{
    marginTop: 26
  }}
>
  <div
    style={{
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: 1.5,
      color: "#94A3B8",
      marginBottom: 12,
      fontFamily:
        "'IBM Plex Mono', monospace"
    }}
  >
    STEP 2: CHOOSE SPECIFIC CHALLENGE ACTIVITY
  </div>

  <select
    value={selectedEvent}
    onChange={(e) =>
      setSelectedEvent(
        e.target.value
      )
    }
    style={{
      width: "100%",
      height: 55,
      border:
        "3px solid #F97316",
      borderRadius: 24,
      paddingLeft: 22,
      fontSize: 18,
      fontWeight: 400,
      background: "#FFF",
      color: "#1E293B"
    }}
  >
    {events.map((event) => (
      <option
        key={event}
        value={event}
      >
        {event} :{" "}
        {
          eventData.description
        }
      </option>
    ))}
  </select>

 <div
  style={{
    marginTop: 20,
    borderLeft: "3px solid #F97316",
    paddingLeft: 14
  }}
>
  <div
    style={{
      fontSize: 12,
      fontWeight: 700,
      color: "#64748B",
      letterSpacing: "1px",
      textTransform: "uppercase",
      marginBottom: 10,
      fontFamily: "monospace"
    }}
  >
    ⭐ JUDGING PARAMETERS & MEASUREMENTS (
    {selectedEvent.toUpperCase()})
  </div>

  <div
    style={{
      border: "1px solid #CBD5E1",
      borderRadius: 18,
      overflow: "hidden",
      background: "#FFFFFF"
    }}
  >
    {/* HEADER */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr",
        padding: "12px 16px",
        background: "#FFF7ED",
        borderBottom: "1px solid #D6DCE5",
        fontSize: 12,
        fontWeight: 700,
        color: "#64748B",
        letterSpacing: "1px",
        textTransform: "uppercase",
        fontFamily: "monospace"
      }}
    >
      <div>Parameter</div>
      <div>Measurement Basis</div>
    </div>

    {Object.entries(eventData.skills).map(
      ([skill, value]) => (
        <div
          key={skill}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            padding: "16px",
            borderBottom:
              "1px solid #CBD5E1",
            background: "#FFFFFF"
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "#334155",
              fontSize: 15
            }}
          >
            {skill}
          </div>

          <div
            style={{
              color: "#475569",
              fontSize: 15
            }}
          >
            {String(value)}
          </div>
        </div>
      )
    )}
  </div>
</div>
</div>

{/* STEP 3 */}

<div
  style={{
    marginTop: 28
  }}
>
  <div
    style={{
      fontSize: 11,
fontWeight: 700,
letterSpacing: 1.5,
color: "#94A3B8",
marginBottom: 12,
textTransform: "uppercase",
fontFamily:
  "'IBM Plex Mono', monospace"
    }}
  >
    STEP 3: UPLOAD PERFORMANCE ATTACHMENT
  </div>

  <div
  style={{
    marginTop: 30
  }}
>
  <div
    style={{
      fontSize: 12,
      fontWeight: 700,
      color: "#94A3B8",
      letterSpacing: "1px",
      textTransform: "uppercase",
      marginBottom: 12,
      fontFamily: "monospace"
    }}
  >
    STEP 3: UPLOAD PERFORMANCE ATTACHMENT
    (VIDEO/AUDIO/DOC)
  </div>

  <label
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      border: "2px dashed #D7E2EF",
      borderRadius: 24,
      minHeight: 150,
      cursor: "pointer",
      background: "#FFFFFF"
    }}
  >
    <div
      style={{
        fontSize: 44,
        color: "#94A3B8"
      }}
    >
      ☁️
    </div>

    <div
      style={{
        fontWeight: 600,
        color: "#334155",
        marginTop: 8
      }}
    >
      Drag and drop file here,
      or click to upload
    </div>

    <div
      style={{
        color: "#94A3B8",
        marginTop: 8,
        fontSize: 14
      }}
    >
      Supports MP4, MP3, WAV, PDF
      (Max size 40MB)
    </div>

    <input
      type="file"
      style={{
        display: "none"
      }}
    />
  </label>
</div>
</div>

{/* STEP 4 */}

<div
  style={{
    marginTop: 24
  }}
>
  <div
    style={{
      fontSize: 11,
fontWeight: 700,
letterSpacing: 1.5,
color: "#94A3B8",
marginBottom: 12,
textTransform: "uppercase",
fontFamily:
  "'IBM Plex Mono', monospace"
    }}
  >
    STEP 4: PERFORMANCE SUMMARY NOTE
  </div>

  <textarea
  placeholder="Provide a detailed note summarizing your tryout entry, co-curricular highlights, and which core competencies you practiced (minimum 20 words for NEP credit accreditation)..."
  rows={5}
  style={{
    width: "100%",
    border: "1px solid #D7E2EF",
    borderRadius: 18,
    padding: 18,
    fontSize: 15,
    resize: "vertical"
  }}
/>
</div>

<button
  style={{
  width: "100%",
  marginTop: 24,
  padding: "20px",
  background: "#F97316",
  color: "#FFF",
  border: "none",
  borderRadius: 18,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  letterSpacing: "1px",
  textTransform: "uppercase"
}}
>
  SUBMIT FOR PARENTAL VERIFICATION →
</button>

      </div>



      {/* RIGHT PANEL */}

      <div
        style={{
        background: "#FFFFFF",
border: "1px solid #E2E8F0",
borderRadius: 28,
padding: 24,
minHeight: 700
        }}
      >
       <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
  }}
>
  <h3
    style={{
      margin: 0,
      fontSize: 18
    }}
  >
    📋 My Active Submissions
  </h3>

  <span
    style={{
      fontSize: 12,
      color: "#94A3B8"
    }}
  >
    NEP Ledger
  </span>
</div>

        <div
  style={{
    background: "#F8FAFC",
    borderRadius: 18,
    padding: 20,
    marginTop: 18
  }}
>
  <div
    style={{
      display: "inline-block",
      background: "#FFF4EA",
      color: "#F97316",
      padding: "4px 10px",
      borderRadius: 8,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 1
    }}
  >
    THINKING EVENT
  </div>

  <div
    style={{
      marginTop: 12,
      fontWeight: 700,
      fontSize: 18,
      color: "#0F172A"
    }}
  >
    Design Thinking Challenge
  </div>

  <div
    style={{
      marginTop: 14,
      background: "#FFF",
      padding: 14,
      borderRadius: 12,
      color: "#64748B",
      fontStyle: "italic",
      fontSize: 14
    }}
  >
    "Pre-submitted prototype model for
    rainwater harvesting."
  </div>

  <div
    style={{
      marginTop: 14,
      color: "#64748B",
      fontSize: 13
    }}
  >
    📄 design_thinking.pdf
  </div>

  <div
    style={{
      marginTop: 20,
      borderTop:
        "1px solid #E2E8F0",
      paddingTop: 16,
      display: "flex",
      justifyContent:
        "space-between",
      fontSize: 12
    }}
  >
    <span>🟢 Submitted</span>
    <span>🟠 Reviewed</span>
    <span>⚪ Verified</span>
    <span>⚪ Top 5%</span>
  </div>
</div>
      </div>
    </div>
  </div>
);
}