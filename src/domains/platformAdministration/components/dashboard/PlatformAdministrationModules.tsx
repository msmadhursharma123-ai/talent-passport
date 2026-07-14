import React from "react";

interface Props {

    onOpenRegistry: () => void;

    onOpenTeacherManagement: () => void;

    onOpenSchoolAdministration: () => void;

}

export default function PlatformAdministrationModules({

    onOpenRegistry,

    onOpenTeacherManagement,

    onOpenSchoolAdministration

}: Props) {
  return (
    <section>
      <h2 style={headingStyle}>
        Administration Modules
      </h2>

      <div style={gridStyle}>

        <ModuleCard
          icon="👥"
          title="Universal User Registry"
          description="Manage every student, teacher, parent, partner and administrator from one central registry."
          footer="1,284 Users"
          onClick={onOpenRegistry}
        />

      <ModuleCard

    icon="👨‍🏫"

    title="Teacher Management"

    description="Create teachers and assign organizations, classes and subjects."

    footer="84 Teachers"

    onClick={onOpenTeacherManagement}

/>

        <ModuleCard

    icon="🏫"

    title="School Administration"

    description="Manage school administrators and organization access."

    footer="32 Schools"

    onClick={onOpenSchoolAdministration}

/>

        <ModuleCard
          icon="🤝"
          title="Partner Management"
          description="Manage partner organizations and collaboration accounts."
          footer="41 Partners"
        />

        <ModuleCard
          icon="👨‍👩‍👧"
          title="Parent Management"
          description="Invite parents and link them with student accounts."
          footer="Coming Soon"
        />

        <ModuleCard
          icon="🛡️"
          title="Audit Logs"
          description="Review every administrative activity performed on the platform."
          footer="12,430 Events"
        />

      </div>
    </section>
  );
}

interface ModuleCardProps {
  icon: string;
  title: string;
  description: string;
  footer: string;
  onClick?: () => void;
}

function ModuleCard({
  icon,
  title,
  description,
  footer,
  onClick,
}: ModuleCardProps) {
  return (
    <div style={cardStyle}>
      <div style={iconStyle}>
        {icon}
      </div>

      <h3>{title}</h3>

      <p style={descriptionStyle}>
        {description}
      </p>

      <div style={footerStyle}>
        <span>{footer}</span>

        <button
          style={buttonStyle}
          onClick={onClick}
        >
          Open Module →
        </button>
      </div>
    </div>
  );
}

const headingStyle: React.CSSProperties = {
  fontSize: 30,
  fontWeight: 700,
  color: "#143B73",
  marginBottom: 24,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(320px,1fr))",
  gap: 24,
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 20,
  border: "1px solid #E5E7EB",
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 16,
  boxShadow:
    "0 6px 16px rgba(15,23,42,.05)",
};

const iconStyle: React.CSSProperties = {
  fontSize: 34,
};

const descriptionStyle: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
  flex: 1,
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const buttonStyle: React.CSSProperties = {
  background: "#143B73",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  cursor: "pointer",
  fontWeight: 600,
};