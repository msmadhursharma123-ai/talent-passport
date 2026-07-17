import React from "react";

export default function CurriculumImport() {
  return (
    <div style={containerStyle}>
      {/* HEADER */}

      <section>
        <h1 style={headingStyle}>
          Curriculum Import
        </h1>

        <p style={descriptionStyle}>
          Import academic curriculum structures
          across boards, academic years and
          future learning ecosystems.
        </p>
      </section>

      {/* IMPORT WORKFLOW */}

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>
          Import Workflow
        </h2>

        <div style={workflowContainerStyle}>
          <WorkflowStep
            step="1"
            title="Select Board"
          />

          <WorkflowStep
            step="2"
            title="Select Academic Year"
          />

          <WorkflowStep
            step="3"
            title="Upload Curriculum File"
          />

          <WorkflowStep
            step="4"
            title="Preview Import"
          />

          <WorkflowStep
            step="5"
            title="Validate Curriculum"
          />

          <WorkflowStep
            step="6"
            title="Import Curriculum"
          />

          <WorkflowStep
            step="7"
            title="Import Success"
          />
        </div>
      </section>

      {/* PLACEHOLDERS */}

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>
          Selected Board
        </h2>

        <p style={placeholderTextStyle}>
          No board selected.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>
          Academic Year
        </h2>

        <p style={placeholderTextStyle}>
          No academic year selected.
        </p>
      </section>

      <section style={cardStyle}>
        <h2 style={sectionHeadingStyle}>
          Upload Curriculum File
        </h2>

        <p style={placeholderTextStyle}>
          Curriculum upload functionality will
          be available in the next phase.
        </p>
      </section>
    </div>
  );
}

/* ============================================================
    WORKFLOW STEP
============================================================ */

interface WorkflowStepProps {
  step: string;
  title: string;
}

function WorkflowStep({
  step,
  title,
}: WorkflowStepProps) {
  return (
    <div style={workflowStepStyle}>
      <div style={stepBadgeStyle}>
        {step}
      </div>

      <span>{title}</span>
    </div>
  );
}

/* ============================================================
    STYLES
============================================================ */

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  padding: "8px",
};

const headingStyle: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: 700,
};

const descriptionStyle: React.CSSProperties = {
  color: "#6B7280",
  marginTop: "8px",
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "16px",
  padding: "24px",
};

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 600,
  marginBottom: "16px",
};

const workflowContainerStyle: React.CSSProperties = {
  display: "grid",
  gap: "12px",
};

const workflowStepStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  padding: "12px",
  border: "1px solid #E5E7EB",
  borderRadius: "12px",
};

const stepBadgeStyle: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#2563EB",
  color: "#FFFFFF",
  fontWeight: 700,
};

const placeholderTextStyle: React.CSSProperties = {
  color: "#6B7280",
};