import { useState } from "react";

import type { TeacherAssignment } from "../types/TeacherAssignment";
import { getStudentsAtRisk } from "../repository/TeacherFeedbackAnalyticsRepository";

interface Props { assignments: TeacherAssignment[]; }

const dropdownStyle = {
  width: "100%",

  padding: "11px 12px",

  background: "#F8FAFC",

  border: "1px solid #CBD5E1",
  borderRadius: "11px",

  color: "#0F172A",

  fontSize: "15px",
  fontWeight: 600,

  outline: "none",

  boxSizing:
    "border-box" as const,
};
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






const eyebrowStyle = {
  color: "#F97316",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "1.6px",

  textTransform:
    "uppercase" as const,
};


export default function StudentLearningIntelligence({ assignments }: Props) {
  const [selectedAssignment, setSelectedAssignment] = useState<TeacherAssignment | null>(null);
  const [studentsAtRisk, setStudentsAtRisk] = useState<{ veryCritical:string[]; critical:string[]; moderate:string[] }>({ veryCritical:[], critical:[], moderate:[] });
  async function handleAssignmentChange(value:string){
    const assignment=assignments.find((item)=>String(item.id)===value); setSelectedAssignment(assignment??null);
    if(assignment){ setStudentsAtRisk(await getStudentsAtRisk(assignment.className,assignment.sectionName,assignment.subjectName)); }
  }
  return (<div className="tp-sli-root">
    <div className="tp-responsive-section" style={sectionCardStyle}>
      <select style={dropdownStyle} value={selectedAssignment?.id ?? ""} onChange={(e)=>{void handleAssignmentChange(e.target.value);}}>
        <option value="">Select Classroom</option>
        {assignments.map((assignment)=><option key={assignment.id} value={assignment.id}>Class {assignment.className} - Section {assignment.sectionName} - {assignment.subjectName}</option>)}
      </select>
    </div>
    {/* =====================================================
        STUDENTS AT RISK
       ===================================================== */}

    <div className="tp-responsive-section" style={sectionCardStyle}>
      <div
        className="tp-section-header"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            STUDENT LEARNING INTELLIGENCE
          </div>

          <h2 style={sectionTitleStyle}>
            Students Requiring Attention
          </h2>

          <p style={sectionDescriptionStyle}>
            Identify students showing repeated comprehension
            difficulty and requiring academic support.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          LEARNING RISK LEDGER
        </div>
      </div>

      <div className="teacher-risk-swipe-hint">
        <span>LEARNING RISK LEDGER</span>
        <strong>Swipe left or right to view all categories →</strong>
      </div>

      <div className="tp-risk-scroll">
      <div
        className="tp-responsive-grid-3 tp-risk-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "12px",
          marginTop: "18px",
        }}
      >

        <RiskCard
          eyebrow="IMMEDIATE ATTENTION"
          title="Very Critical"
          count={
            studentsAtRisk.veryCritical
              .length
          }
          students={
            studentsAtRisk.veryCritical
          }
          background="#FEF2F2"
          border="#FECACA"
          color="#DC2626"
          description={`3 consecutive "I didn't understand." responses.`}
        />

        <RiskCard
          eyebrow="ACADEMIC SUPPORT"
          title="Critical"
          count={
            studentsAtRisk.critical.length
          }
          students={
            studentsAtRisk.critical
          }
          background="#FFF7ED"
          border="#FED7AA"
          color="#EA580C"
          description={`2 "I didn't understand." and 1 "I partially understood." response.`}
        />

        <RiskCard
          eyebrow="EARLY ATTENTION"
          title="Moderate"
          count={
            studentsAtRisk.moderate.length
          }
          students={
            studentsAtRisk.moderate
          }
          background="#FFFBEB"
          border="#FDE68A"
          color="#CA8A04"
          description={`3 consecutive "I partially understood." responses.`}
        />
      </div>
      </div>
    </div>

    <style>{`
.tp-sli-root .teacher-risk-swipe-hint { display: none; }

/* These rules are the original MyClassroom responsive contract, scoped to the moved feature. */
@media (max-width: 1024px) {
  .tp-sli-root .tp-responsive-section {
    padding: 15px !important;
    margin-bottom: 12px !important;
    border-radius: 17px !important;
    box-sizing: border-box !important;
  }

  .tp-sli-root select {
    width: 100% !important;
    max-width: 100% !important;
    min-height: 36px !important;
    padding: 7px 9px !important;
    font-size: 10px !important;
    box-sizing: border-box !important;
  }

  .tp-sli-root .tp-section-header {
    align-items: flex-start !important;
    gap: 8px 14px !important;
  }

  .tp-sli-root .tp-section-header > div:first-child {
    flex: 1 1 320px !important;
    min-width: 0 !important;
  }

  .tp-sli-root .tp-section-header > div:last-child {
    flex: 0 1 auto !important;
    max-width: 44% !important;
    text-align: right !important;
    align-self: flex-start !important;
  }

  .tp-sli-root .tp-responsive-section h2 {
    margin-top: 4px !important;
    margin-bottom: 4px !important;
    max-width: none !important;
    font-size: 19px !important;
    line-height: 1.08 !important;
  }

  .tp-sli-root .tp-responsive-section p {
    max-width: none !important;
    margin-top: 4px !important;
    font-size: 11px !important;
    line-height: 1.35 !important;
  }

  .tp-sli-root .tp-responsive-grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 8px !important;
    margin-top: 12px !important;
  }

  .tp-sli-root .tp-responsive-card {
    min-width: 0 !important;
    min-height: 76px !important;
    padding: 10px !important;
    border-radius: 12px !important;
    box-sizing: border-box !important;
  }


  .tp-sli-root .tp-risk-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }

  .tp-sli-root .tp-risk-grid .tp-responsive-card {
    min-height: 0 !important;
    padding: 11px !important;
  }

  .tp-sli-root .teacher-risk-swipe-hint {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 10px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    margin: 10px 0 7px !important;
    padding: 7px 9px !important;
    border: 1px solid #FED7AA !important;
    border-radius: 9px !important;
    background: #FFF7ED !important;
    color: #9A3412 !important;
    font-size: 8px !important;
    line-height: 1.2 !important;
  }

  .tp-sli-root .teacher-risk-swipe-hint strong { text-align: right !important; }
  .tp-sli-root .tp-risk-scroll {
    width: 100% !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .tp-sli-root .tp-risk-grid {
    min-width: 700px !important;
    grid-template-columns: repeat(3, minmax(210px, 1fr)) !important;
    gap: 8px !important;
  }
}

@media (max-width: 767px) {
  .tp-sli-root .tp-responsive-section {
    padding: 11px !important;
    margin-bottom: 8px !important;
    border-radius: 14px !important;
  }

  .tp-sli-root select {
    min-height: 32px !important;
    padding: 6px 7px !important;
    font-size: 9px !important;
    border-radius: 8px !important;
  }

  .tp-sli-root .tp-section-header {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    align-items: start !important;
    gap: 4px 8px !important;
  }

  .tp-sli-root .tp-section-header > div:first-child {
    grid-column: 1 / -1 !important;
    width: 100% !important;
  }

  .tp-sli-root .tp-section-header > div:last-child {
    grid-column: 1 / -1 !important;
    justify-self: start !important;
    max-width: 100% !important;
    margin-top: 3px !important;
    text-align: left !important;
    font-size: 8px !important;
    line-height: 1.2 !important;
    letter-spacing: .7px !important;
  }

  .tp-sli-root .tp-responsive-section h2 {
    font-size: 15px !important;
    line-height: 1.06 !important;
  }

  .tp-sli-root .tp-responsive-section p {
    font-size: 9px !important;
    line-height: 1.3 !important;
  }

  .tp-sli-root .tp-responsive-grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 5px !important;
    margin-top: 8px !important;
  }

  .tp-sli-root .tp-responsive-card {
    min-height: 64px !important;
    padding: 8px !important;
    border-radius: 10px !important;
  }


  .tp-sli-root .tp-risk-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 5px !important;
  }

  .tp-sli-root .tp-risk-grid .tp-responsive-card {
    padding: 7px !important;
    border-radius: 10px !important;
  }

  .tp-sli-root .tp-risk-grid .tp-responsive-card * {
    overflow-wrap: anywhere !important;
  }

  .tp-sli-root .tp-risk-card {
    min-height: 0 !important;
    padding: 0 !important;
  }

  .tp-sli-root .tp-risk-content { padding: 7px !important; }
  .tp-sli-root .tp-risk-eyebrow {
    font-size: 7px !important;
    line-height: 1.15 !important;
    letter-spacing: .25px !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
  }
  .tp-sli-root .tp-risk-title-row {
    gap: 3px !important;
    margin-top: 5px !important;
    align-items: center !important;
  }
  .tp-sli-root .tp-risk-title {
    font-size: 11px !important;
    line-height: 1.05 !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
  }
  .tp-sli-root .tp-risk-count {
    min-width: 22px !important;
    height: 22px !important;
    padding: 0 4px !important;
    border-radius: 7px !important;
    font-size: 11px !important;
  }
  .tp-sli-root .tp-risk-description {
    min-height: 0 !important;
    margin: 6px 0 7px !important;
    font-size: 7.5px !important;
    line-height: 1.25 !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
  }
  .tp-sli-root .tp-risk-students { padding-top: 6px !important; }
  .tp-sli-root .tp-risk-students > div {
    padding: 5px !important;
    margin-bottom: 4px !important;
    font-size: 8px !important;
    line-height: 1.2 !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
  }

  .tp-sli-root .teacher-risk-swipe-hint {
    margin: 7px 0 5px !important;
    padding: 6px 7px !important;
    font-size: 7.5px !important;
  }

  .tp-sli-root .tp-risk-grid {
    min-width: 660px !important;
    grid-template-columns: repeat(3, minmax(200px, 1fr)) !important;
  }
}
`}</style>
  </div>);
}

function RiskCard(props: any) {
  return (
    <div
      className="tp-responsive-card tp-risk-card"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "205px",
        background: props.background,
        border: `1px solid ${props.border}`,
        borderRadius: "16px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "80px",
          height: "80px",
          right: "-25px",
          top: "-28px",
          borderRadius: "50%",
          background:
            "rgba(255,255,255,0.42)",
        }}
      />

      <div
        className="tp-risk-content"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "16px",
        }}
      >
        <div
          className="tp-risk-eyebrow"
          style={{
            color: props.color,
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.8px",
          }}
        >
          {props.eyebrow}
        </div>

        <div
          className="tp-risk-title-row"
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "10px",
            marginTop: "8px",
          }}
        >
          <h3
            className="tp-risk-title"
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "18px",
              fontWeight: 800,
            }}
          >
            {props.title}
          </h3>

          <div
            className="tp-risk-count"
            style={{
              minWidth: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 7px",
              borderRadius: "10px",
              background:
                "rgba(255,255,255,0.65)",
              color: props.color,
              fontSize: "16px",
              fontWeight: 800,
            }}
          >
            {props.count}
          </div>
        </div>

        <p
          className="tp-risk-description"
          style={{
            margin: "8px 0 13px",
            minHeight: "30px",
            color: "#64748B",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {props.description}
        </p>

        <div
          className="tp-risk-students"
          style={{
            borderTop: `1px solid ${props.border}`,
            paddingTop: "10px",
          }}
        >
          {props.students.length === 0 ? (
            <div
              style={{
                padding: "9px",
                background:
                  "rgba(255,255,255,0.55)",
                borderRadius: "9px",
                color: "#94A3B8",
                fontSize: "12px",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              No students in this category
            </div>
          ) : (
            props.students.map(
              (name: string) => (
                <div
                  key={name}
                  style={{
                    padding: "7px 9px",
                    marginBottom: "6px",
                    background:
                      "rgba(255,255,255,0.75)",
                    borderRadius: "8px",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {name}
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

