import {
  useEffect,
  useState,
} from "react";

import {
  getTeacherExamAttentionIntelligenceWithLiveLayer,
} from "../../liveDoubtIntelligence/service/LiveTeacherExamPreparation";

export default function ExamPreparationPage() {
  const [tables, setTables] =
    useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data =
      await getTeacherExamAttentionIntelligenceWithLiveLayer();

    setTables(data);

    console.log(data);
  }

  return (
    <div
      className="tp-compact-page"
      style={{
        padding: "20px",
        background: "#F6F6F3",
        minHeight: "100%",
      }}
    >


      <style>{`
        .exam-prep-swipe-cue { display: none; }

        @media (max-width: 1024px) {
          .tp-compact-page { padding: 10px !important; box-sizing: border-box !important; overflow-x: hidden !important; }

          .tp-compact-page .exam-prep-hero { padding: 16px 18px !important; margin-bottom: 10px !important; border-radius: 18px !important; }
          .tp-compact-page .exam-prep-hero > div:last-child { gap: 14px !important; align-items: center !important; }
          .tp-compact-page .exam-prep-hero > div:last-child > div:first-child { min-width: 0 !important; flex: 1 1 auto !important; }
          .tp-compact-page .exam-prep-hero-eyebrow { font-size: 10px !important; line-height: 1.15 !important; letter-spacing: 1.4px !important; }
          .tp-compact-page .exam-prep-hero-title { margin: 6px 0 !important; font-size: 25px !important; line-height: 1.08 !important; letter-spacing: -.45px !important; }
          .tp-compact-page .exam-prep-hero-description { max-width: 650px !important; font-size: 12px !important; line-height: 1.4 !important; }
          .tp-compact-page .exam-prep-hero > div:last-child > div:first-child > div:last-child { gap: 7px !important; margin-top: 10px !important; }
          .tp-compact-page .exam-prep-hero-pill { padding: 6px 9px !important; font-size: 8px !important; line-height: 1 !important; letter-spacing: .4px !important; }
          .tp-compact-page .exam-prep-hero-badge { width: 62px !important; height: 62px !important; min-width: 62px !important; border-radius: 15px !important; }
          .tp-compact-page .exam-prep-hero-badge > div:first-child { font-size: 20px !important; }
          .tp-compact-page .exam-prep-hero-badge > div:last-child { margin-top: 5px !important; font-size: 6px !important; line-height: 1.05 !important; letter-spacing: .55px !important; }

          .tp-compact-page .exam-prep-section { padding: 16px !important; margin-bottom: 10px !important; border-radius: 17px !important; overflow: hidden !important; box-sizing: border-box !important; }
          .tp-compact-page .exam-prep-section > div:first-child { gap: 10px !important; align-items: flex-start !important; }
          .tp-compact-page .exam-prep-section > div:first-child > div:first-child { min-width: 0 !important; }
          .tp-compact-page .exam-prep-section > div:first-child > div:first-child > div:first-child { font-size: 9px !important; line-height: 1.15 !important; letter-spacing: 1.15px !important; }
          .tp-compact-page .exam-prep-section h2 { margin: 5px 0 0 !important; font-size: 19px !important; line-height: 1.1 !important; letter-spacing: -.2px !important; }
          .tp-compact-page .exam-prep-section p { margin: 4px 0 0 !important; font-size: 11px !important; line-height: 1.38 !important; }
          .tp-compact-page .exam-prep-ledger-label { padding-top: 2px !important; font-size: 9px !important; line-height: 1.15 !important; letter-spacing: .8px !important; }

          .tp-compact-page .exam-prep-summary-grid { grid-template-columns: repeat(3,minmax(0,1fr)) !important; gap: 7px !important; margin-top: 12px !important; margin-bottom: 12px !important; }
          .tp-compact-page .exam-prep-summary-card { min-width: 0 !important; min-height: 92px !important; padding: 10px !important; border-radius: 12px !important; box-sizing: border-box !important; }
          .tp-compact-page .exam-prep-summary-card > div:first-child { font-size: 8px !important; line-height: 1.15 !important; letter-spacing: .45px !important; overflow-wrap: anywhere !important; }
          .tp-compact-page .exam-prep-summary-value { margin-top: 6px !important; font-size: 18px !important; line-height: 1.08 !important; overflow-wrap: anywhere !important; }
          .tp-compact-page .exam-prep-summary-description { margin-top: 5px !important; font-size: 9px !important; line-height: 1.25 !important; }

          .tp-compact-page .exam-prep-table-workspace { padding: 12px !important; border-radius: 14px !important; box-sizing: border-box !important; }
          .tp-compact-page .exam-prep-table-workspace > div:first-child { gap: 8px !important; margin-bottom: 8px !important; align-items: flex-start !important; }
          .tp-compact-page .exam-prep-table-workspace > div:first-child > div:first-child > div:first-child { font-size: 14px !important; line-height: 1.15 !important; }
          .tp-compact-page .exam-prep-table-workspace > div:first-child > div:first-child > div:last-child { margin-top: 2px !important; font-size: 10px !important; line-height: 1.25 !important; }
          .tp-compact-page .exam-prep-table-workspace > div:first-child > div:last-child { padding: 5px 8px !important; font-size: 9px !important; }

          .tp-compact-page .exam-prep-swipe-cue { display: block !important; margin: 0 0 7px !important; padding: 6px 9px !important; border: 1px solid #FED7AA !important; border-radius: 8px !important; background: #FFF7ED !important; color: #9A3412 !important; font-size: 9px !important; line-height: 1.15 !important; font-weight: 800 !important; }
          .tp-compact-page .exam-prep-table-scroll { width: 100% !important; max-width: 100% !important; overflow-x: auto !important; overflow-y: hidden !important; -webkit-overflow-scrolling: touch !important; touch-action: pan-x pan-y !important; border-radius: 11px !important; }
          .tp-compact-page .exam-prep-table { width: max-content !important; min-width: 100% !important; table-layout: fixed !important; font-size: 9px !important; }
          .tp-compact-page .exam-prep-table th, .tp-compact-page .exam-prep-table td { padding: 6px 7px !important; height: auto !important; font-size: 9px !important; line-height: 1.2 !important; }

          .tp-compact-page .exam-prep-metric-col { position: sticky !important; left: 0 !important; z-index: 3 !important; width: 190px !important; min-width: 190px !important; max-width: 190px !important; background: #F8FAFC !important; box-shadow: 1px 0 0 #E2E8F0 !important; text-align: left !important; white-space: normal !important; }
          .tp-compact-page .exam-prep-metric-header { z-index: 5 !important; }
          .tp-compact-page .exam-prep-student-col { width: 135px !important; min-width: 135px !important; max-width: 135px !important; white-space: normal !important; overflow-wrap: anywhere !important; }
          .tp-compact-page .exam-prep-table th.exam-prep-student-col > div:first-child { margin-bottom: 2px !important; font-size: 7px !important; }
          .tp-compact-page .exam-prep-table th.exam-prep-student-col > div:last-child { font-size: 10px !important; line-height: 1.15 !important; }
          .tp-compact-page .exam-prep-table-workspace > div:last-child { gap: 5px !important; margin-top: 8px !important; }
          .tp-compact-page .exam-prep-table-workspace > div:last-child > div { gap: 4px !important; padding: 4px 7px !important; font-size: 8px !important; }
        }

        @media (max-width: 600px) {
          .tp-compact-page { padding: 7px !important; }

          .tp-compact-page .exam-prep-hero { padding: 12px 13px !important; margin-bottom: 8px !important; border-radius: 14px !important; }
          .tp-compact-page .exam-prep-hero > div:last-child { gap: 8px !important; }
          .tp-compact-page .exam-prep-hero-eyebrow { font-size: 7px !important; letter-spacing: .95px !important; }
          .tp-compact-page .exam-prep-hero-title { margin: 4px 0 !important; font-size: 18px !important; line-height: 1.08 !important; letter-spacing: -.25px !important; }
          .tp-compact-page .exam-prep-hero-description { font-size: 9px !important; line-height: 1.32 !important; }
          .tp-compact-page .exam-prep-hero > div:last-child > div:first-child > div:last-child { gap: 5px !important; margin-top: 7px !important; }
          .tp-compact-page .exam-prep-hero-pill { padding: 5px 7px !important; font-size: 6px !important; }
          .tp-compact-page .exam-prep-hero-badge { width: 48px !important; height: 48px !important; min-width: 48px !important; border-radius: 11px !important; }
          .tp-compact-page .exam-prep-hero-badge > div:first-child { font-size: 15px !important; }
          .tp-compact-page .exam-prep-hero-badge > div:last-child { margin-top: 3px !important; font-size: 4.5px !important; letter-spacing: .3px !important; }

          .tp-compact-page .exam-prep-section { padding: 11px !important; margin-bottom: 8px !important; border-radius: 14px !important; }
          .tp-compact-page .exam-prep-section > div:first-child { gap: 5px !important; }
          .tp-compact-page .exam-prep-section > div:first-child > div:first-child > div:first-child { font-size: 7px !important; letter-spacing: .8px !important; }
          .tp-compact-page .exam-prep-section h2 { font-size: 15px !important; line-height: 1.08 !important; }
          .tp-compact-page .exam-prep-section p { font-size: 9px !important; line-height: 1.3 !important; }
          .tp-compact-page .exam-prep-ledger-label { width: 100% !important; padding: 0 !important; font-size: 7px !important; letter-spacing: .65px !important; }

          .tp-compact-page .exam-prep-summary-grid { gap: 5px !important; margin-top: 9px !important; margin-bottom: 9px !important; }
          .tp-compact-page .exam-prep-summary-card { min-height: 74px !important; padding: 7px !important; border-radius: 10px !important; }
          .tp-compact-page .exam-prep-summary-card > div:first-child { font-size: 6px !important; line-height: 1.1 !important; letter-spacing: .2px !important; }
          .tp-compact-page .exam-prep-summary-value { margin-top: 4px !important; font-size: 13px !important; line-height: 1.05 !important; }
          .tp-compact-page .exam-prep-summary-description { margin-top: 3px !important; font-size: 7px !important; line-height: 1.15 !important; }

          .tp-compact-page .exam-prep-table-workspace { padding: 8px !important; border-radius: 11px !important; }
          .tp-compact-page .exam-prep-table-workspace > div:first-child { margin-bottom: 6px !important; }
          .tp-compact-page .exam-prep-table-workspace > div:first-child > div:first-child > div:first-child { font-size: 11px !important; }
          .tp-compact-page .exam-prep-table-workspace > div:first-child > div:first-child > div:last-child { font-size: 7.5px !important; }
          .tp-compact-page .exam-prep-table-workspace > div:first-child > div:last-child { padding: 4px 6px !important; font-size: 6.5px !important; }
          .tp-compact-page .exam-prep-swipe-cue { padding: 4px 6px !important; margin-bottom: 5px !important; font-size: 6.5px !important; }

          .tp-compact-page .exam-prep-table th, .tp-compact-page .exam-prep-table td { padding: 4px 5px !important; font-size: 7.5px !important; line-height: 1.15 !important; }
          .tp-compact-page .exam-prep-metric-col { width: 145px !important; min-width: 145px !important; max-width: 145px !important; }
          .tp-compact-page .exam-prep-student-col { width: 108px !important; min-width: 108px !important; max-width: 108px !important; }
          .tp-compact-page .exam-prep-table th.exam-prep-student-col > div:first-child { font-size: 5.5px !important; }
          .tp-compact-page .exam-prep-table th.exam-prep-student-col > div:last-child { font-size: 8px !important; }
          .tp-compact-page .exam-prep-table-workspace > div:last-child { gap: 4px !important; margin-top: 6px !important; }
          .tp-compact-page .exam-prep-table-workspace > div:last-child > div { padding: 3px 5px !important; font-size: 6.5px !important; }
        }
      `}</style>

      {/* HEADER */}

     {/* =====================================================
    PAGE HERO
   ===================================================== */}

<div className="tp-page-hero exam-prep-hero" style={heroStyle}>
  <div style={heroOrangeCircle} />
  <div style={heroSoftCircle} />
  <div style={heroBlueCircle} />

  <div
    style={{
      position: "relative",
      zIndex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "24px",
    }}
  >
    <div>
      <div className="exam-prep-hero-eyebrow" style={eyebrowStyle}>
        EXAM PREPARATION INTELLIGENCE
      </div>

      <h1
        className="exam-prep-hero-title"
        style={{
          margin: "8px 0 8px",
          color: "#0F172A",
          fontSize: "31px",
          lineHeight: 1.15,
          fontWeight: 800,
          letterSpacing: "-0.7px",
        }}
      >
        Students Requiring Revision
      </h1>

      <p
        className="exam-prep-hero-description"
        style={{
          margin: 0,
          maxWidth: "720px",
          color: "#64748B",
          fontSize: "13px",
          lineHeight: 1.65,
        }}
      >
        Identify students whose classroom doubts remained
        unresolved throughout the academic term 
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "14px",
        }}
      >
        <div className="exam-prep-hero-pill" style={orangePillStyle}>
          EXAM READINESS
        </div>

        <div className="exam-prep-hero-pill" style={bluePillStyle}>
          STUDENT ATTENTION
        </div>
      </div>
    </div>

    <div className="exam-prep-hero-badge" style={heroBadgeStyle}>
      <div
        style={{
          fontSize: "28px",
          lineHeight: 1,
        }}
      >
        ◇
      </div>

      <div
        style={{
          marginTop: "8px",
          color: "#F97316",
          fontSize: "8px",
          fontWeight: 800,
          letterSpacing: "1.1px",
          textAlign: "center",
        }}
      >
        EXAM
        <br />
        INTELLIGENCE
      </div>
    </div>
  </div>
</div>

    {/* =====================================================
    EMPTY STATE
   ===================================================== */}

{tables.length === 0 && (
  <div className="exam-prep-section" style={sectionCardStyle}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
      }}
    >
      <div>
        <div style={eyebrowStyle}>
          EXAM ATTENTION LEDGER
        </div>

        <h2 style={sectionTitleStyle}>
          No Exam Preparation Intelligence Available Yet
        </h2>

        <p style={sectionDescriptionStyle}>
          Students will start appearing here after they
          report unresolved classroom doubts.
        </p>
      </div>

      <div style={emptyStateBadgeStyle}>
        <div
          style={{
            fontSize: "23px",
            lineHeight: 1,
          }}
        >
          ✓
        </div>

        <div
          style={{
            marginTop: "6px",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.8px",
          }}
        >
          NO RISKS
        </div>
      </div>
    </div>

    <div style={emptyStateInnerStyle}>
      <div
        style={{
          width: "38px",
          height: "38px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderRadius: "12px",
          background: "#F0FDF4",
          border: "1px solid #BBF7D0",
          color: "#16A34A",
          fontSize: "20px",
          fontWeight: 800,
        }}
      >
        ✓
      </div>

      <div>
        <div
          style={{
            color: "#0F172A",
            fontSize: "15px",
            fontWeight: 800,
          }}
        >
          No students currently require exam attention
        </div>

        <div
          style={{
            marginTop: "4px",
            color: "#64748B",
            fontSize: "13px",
            lineHeight: 1.55,
          }}
        >
          Unresolved classroom doubts will automatically
          surface here as academic attention intelligence
          becomes available.
        </div>
      </div>
    </div>
  </div>
)}

{/* =====================================================
    CLASSROOM INTELLIGENCE
   ===================================================== */}

{tables.map(
  (table: any, tableIndex: number) => (
    <div
      key={table.classroom}
      className="exam-prep-section"
      style={sectionCardStyle}
    >
      {/* SECTION HEADER */}

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            CLASSROOM INTELLIGENCE
          </div>

          <h2 style={sectionTitleStyle}>
            {table.classroom}
          </h2>

          <p style={sectionDescriptionStyle}>
            Review unresolved doubts, topic-level risk and
            academic attention requirements for students in
            this classroom.
          </p>
        </div>

        <div className="exam-prep-ledger-label" style={ledgerLabelStyle}>
          EXAM ATTENTION LEDGER
        </div>
      </div>

      {/* CLASSROOM SUMMARY STRIP */}

      <div
        className="exam-prep-summary-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "10px",
          marginTop: "18px",
          marginBottom: "18px",
        }}
      >
        <div
          className="exam-prep-summary-card"
          style={{
            ...summaryStripCard,
            background: "#FFF7ED",
            border: "1px solid #FED7AA",
          }}
        >
          <div
            style={{
              color: "#EA580C",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.7px",
            }}
          >
            CLASSROOM
          </div>

          <div className="exam-prep-summary-value" style={summaryStripValue}>
            {table.classroom}
          </div>

          <div className="exam-prep-summary-description" style={summaryStripDescription}>
            Academic classroom
          </div>
        </div>

        <div
          className="exam-prep-summary-card"
          style={{
            ...summaryStripCard,
            background: "#EFF6FF",
            border: "1px solid #BFDBFE",
          }}
        >
          <div
            style={{
              color: "#2563EB",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.7px",
            }}
          >
            STUDENT INTELLIGENCE
          </div>

          <div
            className="exam-prep-summary-value"
            style={{
              ...summaryStripValue,
              color: "#2563EB",
            }}
          >
            {table.students.length}
          </div>

          <div className="exam-prep-summary-description" style={summaryStripDescription}>
            Students analysed
          </div>
        </div>

        <div
          className="exam-prep-summary-card"
          style={{
            ...summaryStripCard,
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
          }}
        >
          <div
            style={{
              color: "#16A34A",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.7px",
            }}
          >
            INTELLIGENCE STATUS
          </div>

          <div
            className="exam-prep-summary-value"
            style={{
              ...summaryStripValue,
              color: "#16A34A",
              fontSize: "20px",
            }}
          >
            ACTIVE
          </div>

          <div className="exam-prep-summary-description" style={summaryStripDescription}>
            Exam preparation analysis
          </div>
        </div>
      </div>

      {/* TABLE WORKSPACE */}

      <div className="exam-prep-table-workspace" style={tableWorkspaceStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div>
            <div
              style={{
                color: "#0F172A",
                fontSize: "15px",
                fontWeight: 800,
              }}
            >
              Student Attention Matrix
            </div>

            <div
              style={{
                marginTop: "3px",
                color: "#94A3B8",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Compare exam preparation risk across students.
            </div>
          </div>

          <div
            style={{
              padding: "6px 9px",
              background: "#FFF7ED",
              border: "1px solid #FED7AA",
              borderRadius: "999px",
              color: "#C2410C",
              fontSize: "11px",
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            {table.students.length} STUDENTS
          </div>
        </div>

        <div className="exam-prep-swipe-cue">
          Swipe left or right to view all students →
        </div>

        <div
          className="exam-prep-table-scroll"
          style={{
            overflowX: "auto",
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
          }}
        >
          <table
            className="exam-prep-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "950px",
              background: "#FFFFFF",
            }}
          >
            <thead>
              <tr>
                <th className="exam-prep-metric-col exam-prep-metric-header" style={metricHeaderStyle}>
                  METRICS
                </th>

                {table.students.map(
                  (
                    student: any,
                    index: number
                  ) => (
                    <th
                      className="exam-prep-student-col"
                      key={student.studentName}
                      style={{
                        ...tableHeaderStyle,

                        background:
                          index % 4 === 0
                            ? "#FFF7ED"
                            : index % 4 === 1
                            ? "#EFF6FF"
                            : index % 4 === 2
                            ? "#F0FDF4"
                            : "#FAF5FF",

                        color:
                          index % 4 === 0
                            ? "#C2410C"
                            : index % 4 === 1
                            ? "#1D4ED8"
                            : index % 4 === 2
                            ? "#15803D"
                            : "#7E22CE",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          letterSpacing: "0.6px",
                          opacity: 0.72,
                          marginBottom: "5px",
                        }}
                      >
                        STUDENT
                      </div>

                      <div
                        style={{
                          color: "#0F172A",
                          fontSize: "15px",
                          fontWeight: 800,
                          lineHeight: 1.3,
                        }}
                      >
                        {student.studentName}
                      </div>
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {renderExamPreparationRow(
                "Total Unresolved Not Discussed Doubts",
                table.students.map(
                  (student: any) =>
                    String(
                      student.totalUnresolvedDoubts
                    )
                )
              )}

              {renderExamPreparationRow(
                "Topics With Unresolved Doubts",
                table.students.map(
                  (student: any) =>
                    student.topics.join(", ")
                )
              )}

              {renderExamPreparationRow(
                "Highest Risk Topic",
                table.students.map(
                  (student: any) =>
                    student.highestRiskTopic ?? "-"
                )
              )}

              {renderExamPreparationRow(
                "Attention Level",
                table.students.map(
                  (student: any) =>
                    student.attentionLevel
                )
              )}
            </tbody>
          </table>
        </div>

        {/* LEGEND */}

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginTop: "12px",
          }}
        >
          <Legend
            color="#DC2626"
            background="#FEF2F2"
            label="High Attention"
          />

          <Legend
            color="#D97706"
            background="#FFFBEB"
            label="Medium Attention"
          />

          <Legend
            color="#16A34A"
            background="#F0FDF4"
            label="Low Attention"
          />
        </div>
      </div>
    </div>
  )
)}
    </div>
  );
}

function renderExamPreparationRow(
  metricName: string,
  values: string[]
) {
  return (
    <tr>
      <td className="exam-prep-metric-col" style={metricColumnStyle}>
        {metricName}
      </td>

      {values.map((value, index) => (
        <td
          className="exam-prep-student-col"
          key={index}
          style={{
            ...tableCellStyle,

            color:
              metricName.includes(
                "Unresolved"
              )
                ? "#EF4444"
                : metricName.includes(
                    "Highest"
                  )
                ? "#1E3A8A"
                : metricName.includes(
                    "Attention"
                  )
                ? value === "HIGH"
                  ? "#DC2626"
                  : value === "MEDIUM"
                  ? "#F59E0B"
                  : "#16A34A"
                : "#334155",

            fontWeight:
              metricName.includes(
                "Unresolved"
              ) ||
              metricName.includes(
                "Highest"
              ) ||
              metricName.includes(
                "Attention"
              )
                ? 700
                : 500,
          }}
        >
          {value || "-"}
        </td>
      ))}
    </tr>
  );
}
/* =========================================================
   UI COMPONENTS
   ========================================================= */

function Legend(props: any) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "7px 10px",
        background: props.background,
        border:
          "1px solid rgba(148,163,184,0.22)",
        borderRadius: "999px",
        color: "#475569",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: props.color,
        }}
      />

      {props.label}
</div>
  );
}


/* =========================================================
   PAGE STYLES
   ========================================================= */

const heroStyle = {
  position: "relative",
  overflow: "hidden",

  marginBottom: "18px",
  padding: "26px 28px",

  background:
    "linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 72%, #FFF9F3 100%)",

  border: "1px solid #E2E8F0",
  borderRadius: "24px",

  boxShadow:
    "0 10px 30px rgba(15, 23, 42, 0.045)",
} as const;


const heroOrangeCircle = {
  position: "absolute",

  width: "180px",
  height: "180px",

  right: "-60px",
  top: "-85px",

  borderRadius: "50%",

  background:
    "rgba(249, 115, 22, 0.06)",

  pointerEvents: "none",
} as const;


const heroSoftCircle = {
  position: "absolute",

  width: "95px",
  height: "95px",

  right: "120px",
  top: "-50px",

  borderRadius: "50%",

  background:
    "rgba(249, 115, 22, 0.035)",

  pointerEvents: "none",
} as const;


const heroBlueCircle = {
  position: "absolute",

  width: "150px",
  height: "150px",

  right: "180px",
  bottom: "-105px",

  borderRadius: "50%",

  background:
    "rgba(37, 99, 235, 0.04)",

  pointerEvents: "none",
} as const;


const heroBadgeStyle = {
  width: "82px",
  height: "82px",

  flexShrink: 0,

  display: "flex",
  flexDirection: "column",

  alignItems: "center",
  justifyContent: "center",

  background:
    "linear-gradient(145deg, #FFF8F1 0%, #FFFFFF 100%)",

  border: "1px solid #FED7AA",
  borderRadius: "22px",

  color: "#0F172A",

  boxShadow:
    "0 8px 20px rgba(249, 115, 22, 0.07)",
} as const;


const eyebrowStyle = {
  color: "#F97316",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "1.6px",

  textTransform: "uppercase" as const,
};


const orangePillStyle = {
  padding: "6px 10px",

  background: "#FFF7ED",

  border: "1px solid #FED7AA",
  borderRadius: "999px",

  color: "#C2410C",

  fontSize: "11px",
  fontWeight: 800,

  letterSpacing: "0.6px",
} as const;


const bluePillStyle = {
  padding: "6px 10px",

  background: "#EFF6FF",

  border: "1px solid #BFDBFE",
  borderRadius: "999px",

  color: "#1D4ED8",

  fontSize: "11px",
  fontWeight: 800,

  letterSpacing: "0.6px",
} as const;


const sectionCardStyle = {
  position: "relative",

  marginBottom: "18px",
  padding: "20px",

  background: "#FFFFFF",

  border: "1px solid #E2E8F0",
  borderRadius: "20px",

  boxShadow:
    "0 7px 24px rgba(15, 23, 42, 0.035)",
} as const;


const sectionTitleStyle = {
  margin: "6px 0 0",

  color: "#0F172A",

  fontSize: "21px",
  fontWeight: 800,

  letterSpacing: "-0.3px",
} as const;


const sectionDescriptionStyle = {
  margin: "5px 0 0",

  color: "#64748B",

  fontSize: "14px",

  lineHeight: 1.55,
} as const;


const ledgerLabelStyle = {
  color: "#94A3B8",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "1px",

  whiteSpace: "nowrap" as const,
};


const summaryStripCard = {
  position: "relative",

  overflow: "hidden",

  minHeight: "92px",

  padding: "14px",

  borderRadius: "14px",
} as const;


const summaryStripValue = {
  marginTop: "9px",

  color: "#EA580C",

  fontSize: "25px",
  fontWeight: 800,

  lineHeight: 1,
} as const;


const summaryStripDescription = {
  marginTop: "7px",

  color: "#64748B",

  fontSize: "12px",
  fontWeight: 600,
} as const;


const tableWorkspaceStyle = {
  padding: "16px",

  background: "#FAFBFC",

  border: "1px solid #E2E8F0",

  borderRadius: "17px",
} as const;


const metricHeaderStyle = {
  width: "280px",
  minWidth: "280px",

  padding: "13px 14px",

  background: "#F8FAFC",

  borderRight: "1px solid #E2E8F0",
  borderBottom: "1px solid #E2E8F0",

  color: "#64748B",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "0.8px",

  textAlign: "left" as const,
};


const tableHeaderStyle = {
  minWidth: "170px",

  padding: "12px",

  borderRight: "1px solid #E2E8F0",
  borderBottom: "1px solid #E2E8F0",

  textAlign: "center" as const,
};


const metricColumnStyle = {
  width: "280px",
  minWidth: "280px",

  padding: "12px 14px",

  background: "#F8FAFC",

  borderRight: "1px solid #E2E8F0",
  borderBottom: "1px solid #E2E8F0",

  color: "#0F172A",

  fontSize: "13px",
  fontWeight: 800,

  textAlign: "left" as const,

  lineHeight: 1.45,
};


const tableCellStyle = {
  minWidth: "170px",

  padding: "12px",

  background: "#FFFFFF",

  borderRight: "1px solid #E2E8F0",
  borderBottom: "1px solid #E2E8F0",

  textAlign: "center" as const,

  color: "#334155",

  fontSize: "13px",

  verticalAlign: "middle" as const,

  lineHeight: 1.5,
};


const emptyStateBadgeStyle = {
  width: "72px",
  height: "72px",

  flexShrink: 0,

  display: "flex",
  flexDirection: "column",

  alignItems: "center",
  justifyContent: "center",

  background: "#F0FDF4",

  border: "1px solid #BBF7D0",

  borderRadius: "18px",

  color: "#16A34A",
} as const;


const emptyStateInnerStyle = {
  display: "flex",

  alignItems: "center",

  gap: "12px",

  marginTop: "18px",

  padding: "14px",

  background:
    "linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)",

  border: "1px solid #E2E8F0",

  borderRadius: "14px",
} as const;