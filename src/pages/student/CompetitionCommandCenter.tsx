import { useState } from "react";

import {
  submitCompetitionEntry
} from "../../supabaseClient";

import {
  requireIdentity
} from "../../services/identityService";

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

  const [isSubmitting, setIsSubmitting] =
  useState(false);

const [uploadProgress, setUploadProgress] =
  useState(0);

const [submitMessage, setSubmitMessage] =
  useState("");

  const eventData =
  (
    pathwayData[
      pathway as keyof typeof pathwayData
    ].events as any
  )[selectedEvent];

const handleSubmit = async () => {
  try {
    setSubmitMessage("");

    if (!selectedFile) {
      alert("Please upload a file first.");
      return;
    }

    if (!summary.trim()) {
      alert("Please add performance summary.");
      return;
    }

    setIsSubmitting(true);


    const result = await submitCompetitionEntry(
     {
  pathway,
  eventName: selectedEvent,
  description: summary
},
      selectedFile,
      (progress) => {
        setUploadProgress(progress);
      }
    );

    if (result.success) {
      setSubmitMessage(
        "✅ Submission uploaded successfully!"
      );

      console.log("SUBMISSION SUCCESS");
      console.log(result.data);

      setSummary("");
      setSelectedFile(null);
    } else {
      setSubmitMessage(
        "❌ " + result.error
      );

      console.log(result.error);
    }
  } catch (err) {
    console.log(err);

    setSubmitMessage(
      "❌ Something went wrong"
    );
  } finally {
    setIsSubmitting(false);
  }
};

return (
  <div className="competition-command-center">
    <style>{`
      .competition-command-center {
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
      }

      @media (max-width: 1100px) {
        .competition-command-center > div {
          grid-template-columns: minmax(0, 1fr) !important;
          gap: 18px !important;
        }

        .competition-command-center > div > div {
          min-width: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
      }

      @media (max-width: 767px) {
        .competition-command-center {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .competition-command-center > div {
          gap: 12px !important;
          width: 100% !important;
        }

        .competition-command-center > div > div {
          border-radius: 20px !important;
        }

        .competition-command-center > div > div:first-child > div:first-child {
          padding: 20px 18px 18px !important;
        }

        .competition-command-center > div > div:first-child > div:nth-child(2) {
          padding: 18px !important;
        }

        .competition-command-center > div > div:first-child > div:first-child h3 {
          font-size: 19px !important;
          line-height: 1.25 !important;
        }

        .competition-command-center > div > div:first-child > div:first-child p {
          font-size: 12px !important;
          line-height: 1.5 !important;
        }

        .competition-command-center > div > div:first-child > div:nth-child(2) > div:first-child > div:nth-child(2) {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 8px !important;
        }

        .competition-command-center button {
          max-width: 100%;
        }

        .competition-command-center select,
        .competition-command-center textarea {
          max-width: 100%;
        }

        .competition-command-center > div > div:last-child > div:first-child {
          padding: 20px 18px 18px !important;
        }

        .competition-command-center > div > div:last-child > div:nth-child(2) {
          padding: 16px !important;
        }
      }


      /* Mobile/tablet compact form: keep the existing UI, but use the canvas
         efficiently and prevent long labels/table values from colliding. */
      @media (max-width: 767px) {
        .competition-command-center > div > div:first-child > div:nth-child(2) > div {
          margin-top: 22px !important;
        }

        .competition-command-center > div > div:first-child > div:nth-child(2) > div:first-child {
          margin-top: 0 !important;
        }

        .competition-command-center > div > div:first-child > div:nth-child(2) > div > div:first-child {
          gap: 8px !important;
          margin-bottom: 10px !important;
        }

        .competition-command-center > div > div:first-child > div:nth-child(2) > div > div:first-child > div:first-child {
          width: 24px !important;
          height: 24px !important;
          min-width: 24px !important;
          border-radius: 7px !important;
          font-size: 10px !important;
        }

        .competition-command-center > div > div:first-child > div:nth-child(2) > div > div:first-child > div:last-child {
          font-size: 9px !important;
          line-height: 1.25 !important;
          letter-spacing: 1px !important;
        }

        .competition-command-center select {
          height: 46px !important;
          padding: 0 38px 0 12px !important;
          border-radius: 12px !important;
          font-size: 12px !important;
          line-height: 1.2 !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
          overflow: hidden !important;
        }

        /* Judging parameters outer card */
        .competition-command-center select + div {
          margin-top: 12px !important;
          padding: 12px !important;
          border-radius: 14px !important;
        }

        .competition-command-center select + div > div:first-child {
          gap: 8px !important;
          margin-bottom: 9px !important;
          align-items: center !important;
        }

        .competition-command-center select + div > div:first-child > div:first-child {
          font-size: 9px !important;
          line-height: 1.3 !important;
          letter-spacing: .7px !important;
        }

        .competition-command-center select + div > div:first-child > div:last-child {
          flex: 0 0 auto !important;
          max-width: 42% !important;
          padding: 4px 7px !important;
          font-size: 8px !important;
          letter-spacing: .5px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        /* Parameters table */
        .competition-command-center select + div > div:last-child > div {
          grid-template-columns: minmax(100px, .8fr) minmax(0, 1.7fr) !important;
          column-gap: 10px !important;
          padding: 9px 10px !important;
          align-items: start !important;
        }

        .competition-command-center select + div > div:last-child > div:first-child {
          font-size: 8px !important;
          line-height: 1.2 !important;
          letter-spacing: .65px !important;
        }

        .competition-command-center select + div > div:last-child > div:not(:first-child) > div:first-child {
          font-size: 10.5px !important;
          line-height: 1.35 !important;
          min-width: 0 !important;
          overflow-wrap: anywhere !important;
        }

        .competition-command-center select + div > div:last-child > div:not(:first-child) > div:last-child {
          font-size: 10.5px !important;
          line-height: 1.35 !important;
          min-width: 0 !important;
          overflow-wrap: anywhere !important;
        }

        .competition-command-center label {
          min-height: 112px !important;
          padding: 14px !important;
          border-radius: 14px !important;
        }

        .competition-command-center textarea {
          min-height: 104px !important;
          padding: 12px !important;
          font-size: 12px !important;
          line-height: 1.45 !important;
          border-radius: 13px !important;
        }
      }

      @media (min-width: 768px) and (max-width: 1100px) {
        .competition-command-center > div > div:first-child > div:nth-child(2) {
          padding: 22px !important;
        }

        .competition-command-center > div > div:first-child > div:nth-child(2) > div {
          margin-top: 24px !important;
        }

        .competition-command-center > div > div:first-child > div:nth-child(2) > div:first-child {
          margin-top: 0 !important;
        }

        .competition-command-center select {
          height: 50px !important;
          font-size: 13px !important;
        }

        .competition-command-center select + div {
          margin-top: 14px !important;
          padding: 14px !important;
        }

        .competition-command-center select + div > div:last-child > div {
          padding: 10px 12px !important;
        }

        .competition-command-center select + div > div:last-child > div:not(:first-child) > div {
          font-size: 12px !important;
          line-height: 1.4 !important;
        }

        .competition-command-center label {
          min-height: 125px !important;
        }
      }

      @media (max-width: 420px) {
        .competition-command-center > div > div:first-child > div:nth-child(2) > div:first-child > div:nth-child(2) button {
          min-height: 54px !important;
          padding: 9px 7px !important;
          font-size: 11px !important;
        }

        .competition-command-center > div > div:first-child > div:nth-child(2) {
          padding: 16px !important;
        }
      }
    `}</style>
    {/* ==========================================================
        COMPETITION SUBMISSION WORKSPACE
    ========================================================== */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.7fr) minmax(320px, 0.9fr)",
        gap: 22,
        alignItems: "start"
      }}
    >
      {/* ========================================================
          LEFT — SUBMISSION FORM
      ======================================================== */}

      <div
        style={{
          background:
            "linear-gradient(180deg, #FFFFFF 0%, #FCFDFE 100%)",
          border: "1px solid #E2E8F0",
          borderRadius: 26,
          overflow: "hidden",
          boxShadow:
            "0 12px 34px rgba(15,23,42,.045)"
        }}
      >
        {/* FORM HEADER */}

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "26px 28px 24px",
            background:
              "linear-gradient(120deg, #FFFFFF 0%, #FFFFFF 62%, #FFF7ED 100%)",
            borderBottom: "1px solid #EDF1F5"
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              borderRadius: "50%",
              right: -40,
              top: -85,
              background: "rgba(249,115,22,.06)",
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
                color: "#F97316",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 8
              }}
            >
              Competition Entry Desk
            </div>

            <h3
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "-0.3px"
              }}
            >
              Submit Performance Audition
            </h3>

            <p
              style={{
                margin: "8px 0 0",
                color: "#64748B",
                fontSize: 13,
                lineHeight: 1.6
              }}
            >
              Select your pathway, choose a challenge and submit
              your performance evidence for verification.
            </p>
          </div>
        </div>

        {/* FORM BODY */}

        <div
          style={{
            padding: 28
          }}
        >
          {/* ====================================================
              STEP 1
          ==================================================== */}

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: "#FFF4EA",
                  color: "#F97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800
                }}
              >
                01
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.4,
                  color: "#64748B",
                  textTransform: "uppercase"
                }}
              >
                Select Broad Pathway
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10
              }}
            >
              {[
                ["Communication", "🗣"],
                ["Creativity", "🎨"],
                ["Thinking", "💡"],
                ["Team Event", "🤝"]
              ].map(([item, icon]) => {
                const active = pathway === item;

                return (
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
                      minHeight: 62,
                      padding: "12px 10px",
                      borderRadius: 14,

                      background: active
                        ? "linear-gradient(135deg, #FFF8F1 0%, #FFF3E8 100%)"
                        : "#F8FAFC",

                      color: active
                        ? "#EA580C"
                        : "#334155",

                      border: active
                        ? "1.5px solid #FB923C"
                        : "1px solid #E2E8F0",

                      boxShadow: active
                        ? "0 6px 16px rgba(249,115,22,.08)"
                        : "none",

                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 13,
                      transition: "all .2s ease"
                    }}
                  >
                    <span
                      style={{
                        marginRight: 7,
                        fontSize: 16
                      }}
                    >
                      {icon}
                    </span>

                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ====================================================
              STEP 2
          ==================================================== */}

          <div
            style={{
              marginTop: 30
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: "#EEF4FF",
                  color: "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800
                }}
              >
                02
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.4,
                  color: "#64748B",
                  textTransform: "uppercase"
                }}
              >
                Choose Specific Challenge Activity
              </div>
            </div>

            <select
              value={selectedEvent}
              onChange={(e) =>
                setSelectedEvent(e.target.value)
              }
              style={{
                width: "100%",
                height: 54,
                border: "1.5px solid #FDBA74",
                borderRadius: 14,
                padding: "0 18px",
                fontSize: 15,
                fontWeight: 600,
                background: "#FFFCF8",
                color: "#1E293B",
                outline: "none",
                cursor: "pointer",
                boxSizing: "border-box"
              }}
            >
              {events.map((event) => (
                <option
                  key={event}
                  value={event}
                >
                  {event} : {eventData.description}
                </option>
              ))}
            </select>

            {/* JUDGING PARAMETERS */}

            <div
              style={{
                marginTop: 18,
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 18,
                padding: 16
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 13
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#475569",
                    letterSpacing: 1,
                    textTransform: "uppercase"
                  }}
                >
                  ⭐ Judging Parameters & Measurements
                </div>

                <div
                  style={{
                    background: "#FFF4EA",
                    color: "#EA580C",
                    padding: "5px 9px",
                    borderRadius: 999,
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    textTransform: "uppercase"
                  }}
                >
                  {selectedEvent}
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #E2E8F0",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "#FFFFFF"
                }}
              >
                {/* TABLE HEADER */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    padding: "11px 14px",
                    background:
                      "linear-gradient(90deg, #FFF7ED 0%, #FFFBF7 100%)",
                    borderBottom: "1px solid #E2E8F0",
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#64748B",
                    letterSpacing: 1,
                    textTransform: "uppercase"
                  }}
                >
                  <div>Parameter</div>
                  <div>Measurement Basis</div>
                </div>

                {Object.entries(eventData.skills).map(
                  ([skill, value], index, array) => (
                    <div
                      key={skill}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 2fr",
                        padding: "13px 14px",
                        borderBottom:
                          index === array.length - 1
                            ? "none"
                            : "1px solid #EDF1F5",
                        background: "#FFFFFF"
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#334155",
                          fontSize: 13
                        }}
                      >
                        {skill}
                      </div>

                      <div
                        style={{
                          color: "#64748B",
                          fontSize: 13
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

          {/* ====================================================
              STEP 3
          ==================================================== */}

          <div
            style={{
              marginTop: 30
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: "#ECFDF5",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800
                }}
              >
                03
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.4,
                  color: "#64748B",
                  textTransform: "uppercase"
                }}
              >
                Upload Performance Attachment
              </div>
            </div>

            <label
              style={{
                minHeight: 150,
                border: selectedFile
                  ? "1.5px dashed #86EFAC"
                  : "1.5px dashed #CBD5E1",
                borderRadius: 18,
                background: selectedFile
                  ? "#F6FFF9"
                  : "#FAFCFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 20,
                boxSizing: "border-box",
                transition: "all .2s ease"
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: selectedFile
                    ? "#DCFCE7"
                    : "#EEF4FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24
                }}
              >
                {selectedFile ? "✓" : "☁️"}
              </div>

              <div
                style={{
                  fontWeight: 700,
                  color: "#334155",
                  marginTop: 12,
                  fontSize: 13,
                  textAlign: "center"
                }}
              >
                {selectedFile
                  ? selectedFile.name
                  : "Drag and drop file here, or click to upload"}
              </div>

              <div
                style={{
                  color: "#94A3B8",
                  marginTop: 6,
                  fontSize: 12
                }}
              >
                Supports MP4, MP3, WAV, PDF · Max size 40MB
              </div>

              <input
                type="file"
                accept=".mp4,.mp3,.wav,.pdf"
                style={{
                  display: "none"
                }}
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setSelectedFile(
                      e.target.files[0]
                    );
                  }
                }}
              />
            </label>
          </div>

          {/* ====================================================
              STEP 4
          ==================================================== */}

          <div
            style={{
              marginTop: 30
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  background: "#F5F3FF",
                  color: "#7C3AED",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800
                }}
              >
                04
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.4,
                  color: "#64748B",
                  textTransform: "uppercase"
                }}
              >
                Performance Summary Note
              </div>
            </div>

            <textarea
              value={summary}
              onChange={(e) =>
                setSummary(e.target.value)
              }
              placeholder="Provide a detailed note summarizing your tryout entry, co-curricular highlights, and which core competencies you practiced."
              rows={5}
              style={{
                width: "100%",
                border: "1px solid #DCE4EE",
                borderRadius: 16,
                padding: 16,
                fontSize: 13,
                lineHeight: 1.6,
                resize: "vertical",
                background: "#FAFCFF",
                color: "#334155",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* SUBMIT */}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: "100%",
              marginTop: 22,
              padding: "16px 20px",
              background:
                "linear-gradient(135deg, #FF7A00 0%, #F97316 100%)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 14,
              fontWeight: 800,
              fontSize: 13,
              cursor: isSubmitting
                ? "default"
                : "pointer",
              letterSpacing: 0.7,
              textTransform: "uppercase",
              opacity: isSubmitting ? 0.7 : 1,
              boxShadow:
                "0 8px 18px rgba(249,115,22,.16)"
            }}
          >
            {isSubmitting
              ? `Uploading ${uploadProgress}%`
              : "SUBMIT FOR PARENTAL VERIFICATION →"}
          </button>

          {submitMessage && (
            <div
              style={{
                marginTop: 14,
                padding: "11px 14px",
                borderRadius: 12,
                background:
                  submitMessage.includes("✅")
                    ? "#F0FDF4"
                    : "#FEF2F2",
                border:
                  submitMessage.includes("✅")
                    ? "1px solid #BBF7D0"
                    : "1px solid #FECACA",
                fontSize: 13,
                fontWeight: 700,
                color:
                  submitMessage.includes("✅")
                    ? "#15803D"
                    : "#DC2626"
              }}
            >
              {submitMessage}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          RIGHT — ACTIVE SUBMISSIONS
      ======================================================== */}

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 26,
          overflow: "hidden",
          boxShadow:
            "0 12px 34px rgba(15,23,42,.045)"
        }}
      >
        {/* RIGHT HEADER */}

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "24px 24px 21px",
            background:
              "linear-gradient(135deg, #FFFFFF 0%, #F5F8FF 100%)",
            borderBottom: "1px solid #EDF1F5"
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 110,
              height: 110,
              borderRadius: "50%",
              right: -35,
              top: -55,
              background: "rgba(37,99,235,.05)"
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div
                style={{
                  color: "#2563EB",
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  marginBottom: 7
                }}
              >
                Submission Tracker
              </div>

              <h3
                style={{
                  margin: 0,
                  color: "#0F172A",
                  fontSize: 18,
                  fontWeight: 800
                }}
              >
                My Active Submissions
              </h3>
            </div>

            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 19,
                boxShadow:
                  "0 5px 14px rgba(15,23,42,.05)"
              }}
            >
              📋
            </div>
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 1,
              marginTop: 9,
              color: "#94A3B8",
              fontSize: 11
            }}
          >
            NEP Ledger
          </div>
        </div>

        {/* SUBMISSION BODY */}

        <div
          style={{
            padding: 20
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(145deg, #F8FAFC 0%, #FFFFFF 100%)",
              border: "1px solid #E8EDF3",
              borderRadius: 18,
              padding: 18
            }}
          >
            {/* BADGE */}

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "#FFF4EA",
                color: "#EA580C",
                padding: "5px 9px",
                borderRadius: 999,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: "uppercase"
              }}
            >
              Thinking Event
            </div>

            {/* TITLE */}

            <div
              style={{
                marginTop: 12,
                fontWeight: 800,
                fontSize: 16,
                color: "#0F172A"
              }}
            >
              Design Thinking Challenge
            </div>

            {/* DESCRIPTION */}

            <div
              style={{
                marginTop: 12,
                background: "#FFFFFF",
                border: "1px solid #EDF1F5",
                padding: 12,
                borderRadius: 12,
                color: "#64748B",
                fontStyle: "italic",
                fontSize: 12,
                lineHeight: 1.55
              }}
            >
              "Pre-submitted prototype model for rainwater
              harvesting."
            </div>

            {/* FILE */}

            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#64748B",
                fontSize: 12
              }}
            >
              <span>📄</span>
              <span>design_thinking.pdf</span>
            </div>

            {/* STATUS */}

            <div
              style={{
                marginTop: 18,
                borderTop: "1px solid #E2E8F0",
                paddingTop: 16
              }}
            >
              <div
                style={{
                  color: "#94A3B8",
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: 1.3,
                  textTransform: "uppercase",
                  marginBottom: 12
                }}
              >
                Verification Progress
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(4, minmax(0, 1fr))",
                  gap: 6
                }}
              >
                {[
                  ["#22C55E", "Submitted"],
                  ["#F59E0B", "Reviewed"],
                  ["#CBD5E1", "Verified"],
                  ["#CBD5E1", "Top 5%"]
                ].map(([color, label]) => (
                  <div
                    key={label}
                    style={{
                      textAlign: "center"
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: color,
                        margin: "0 auto 7px",
                        boxShadow:
                          color !== "#CBD5E1"
                            ? `0 0 0 4px ${color}18`
                            : "none"
                      }}
                    />

                    <div
                      style={{
                        color: "#64748B",
                        fontSize: 9,
                        fontWeight: 600,
                        whiteSpace: "nowrap"
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* PROGRESS LINE */}

              <div
                style={{
                  height: 4,
                  background: "#E2E8F0",
                  borderRadius: 999,
                  marginTop: 13,
                  overflow: "hidden"
                }}
              >
                <div
                  style={{
                    width: "50%",
                    height: "100%",
                    borderRadius: 999,
                    background:
                      "linear-gradient(90deg, #22C55E, #F59E0B)"
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}