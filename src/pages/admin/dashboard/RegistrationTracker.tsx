import React, { useState } from "react";

export interface RegistrationStudent {
  id: string;
  studentName: string;
  schoolName: string;
  className: string;
  missingEvents: string[];
}

interface RegistrationTrackerProps {
  students: RegistrationStudent[];

  schools: string[];
  classes: string[];

  selectedSchool: string;
  selectedClass: string;
  selectedActivity: string;

  onSchoolChange: (value: string) => void;
  onClassChange: (value: string) => void;
  onActivityChange: (value: string) => void;
}

export default function RegistrationTracker({
  students,
  schools,
  classes,
  selectedSchool,
  selectedClass,
  selectedActivity,
  onSchoolChange,
  onClassChange,
  onActivityChange,
}: RegistrationTrackerProps) {

const [searchText, setSearchText] =
  useState("");

const normalizedSearch = searchText
  .replace(/\s+/g, " ")
  .trim()
  .toLowerCase();

const visibleStudents = students.filter(
  (student) => {

    const schoolMatch =
      selectedSchool === "All Schools" ||
      student.schoolName === selectedSchool;

    const classMatch =
      selectedClass === "All Classes" ||
      student.className === selectedClass;

    const activityMatch =
      selectedActivity === "All Activities" ||
      student.missingEvents.includes(
        selectedActivity
      );

const searchMatch =
  searchText.trim() === "" ||

 student.studentName
  .trim()
  .toLowerCase()
  .includes(normalizedSearch) ||

  student.schoolName
    .toLowerCase()
    .includes(
      searchText.toLowerCase()
    ) ||

  student.className
    .toLowerCase()
    .includes(
      searchText.toLowerCase()
    );

  return (

    schoolMatch &&

    classMatch &&

    activityMatch &&

    searchMatch

);
  }
);

  return (
    <div style={containerStyle}>
      {/* Header */}

      <div style={headerRow}>
        <div>
          <div style={eyebrowStyle}>
            REGISTRATION OPERATIONS CENTER
          </div>

          <h2 style={headingStyle}>
            Incomplete Registrations
          </h2>
        </div>

        <div style={countBadge}>
          {visibleStudents.length} Students Pending
        </div>
      </div>

      {/* Filters */}

      <div style={filterRow}>
        <select
          value={selectedSchool}
          onChange={(e) =>
            onSchoolChange(e.target.value)
          }
          style={selectStyle}
        >
          <option>All Schools</option>

          {schools.map((school) => (
            <option
              key={school}
              value={school}
            >
              {school}
            </option>
          ))}
        </select>

        <select
          value={selectedClass}
          onChange={(e) =>
            onClassChange(e.target.value)
          }
          style={selectStyle}
        >
          <option>All Classes</option>

          {classes.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        <select
          value={selectedActivity}
          onChange={(e) =>
            onActivityChange(e.target.value)
          }
          style={selectStyle}
        >
          <option>All Activities</option>
          <option>Communication</option>
          <option>Creative Expression</option>
          <option>Critical Thinking</option>
          <option>Team Event</option>
        </select>
      </div>

<div style={toolbarRow}>

 <input
  value={searchText}
  onChange={(e) =>
    setSearchText(e.target.value)
  }
  placeholder="Search student..."
  style={searchInput}
/>

  <div style={toolbarStats}>
    Showing {visibleStudents.length} Students



  </div>

</div>

      {/* Student List */}

     {visibleStudents.length === 0 ? (
        <div style={emptyState}>
          No pending registrations found.
        </div>
      ) : (
    <div style={tableContainer}>

  <div style={tableHeader}>

    <div style={studentColumn}>
      Student
    </div>

    <div style={schoolColumn}>
      School
    </div>

    <div style={classColumn}>
      Class
    </div>

    <div style={completionColumn}>
      Completion
    </div>

    <div style={missingColumn}>
      Missing Activity
    </div>

    <div style={actionColumn}>
      Actions
    </div>

  </div>

{visibleStudents.map((student, index) => {

  const completed =
    4 - student.missingEvents.length;

  const completion =
    Math.round(
      (completed / 4) * 100
    );

  return (

   <div
  key={`${student.id}-${index}`}
  style={{
    ...tableRow,

    background:
      index % 2 === 0
        ? "#FFFFFF"
        : "#F8FAFC",
  }}
>

      <div style={studentColumn}>
        {student.studentName}
      </div>

      <div style={schoolColumn}>
        {student.schoolName}
      </div>

      <div style={classColumn}>
        {student.className}
      </div>

      <div
  style={{
    ...completionColumn,
    color:
      completion >= 100
        ? "#15803D"
        : completion >= 75
        ? "#EA580C"
        : "#DC2626",
  }}
>
        {completion}%
      </div>

      <div style={missingColumn}>
        {student.missingEvents.length === 0
          ? "—"
          : student.missingEvents
  .map((event) => {
    switch (event) {
      case "Communication":
        return "COM";

      case "Creative Expression":
        return "CRE";

      case "Critical Thinking":
        return "CRT";

      case "Team Event":
        return "TEAM";

      default:
        return event;
    }
  })
  .join(" • ")}
      </div>

      <div style={actionColumn}>

       <button style={viewButton}>
  Details
</button>

<button style={remindButton}>
  Notify
</button>

      </div>

    </div>

  );

})}

</div>
      )}
    </div>
  );
}

/* ============================================================
STYLES
============================================================ */

const containerStyle: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: "24px",
  padding: "28px",
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#F97316",
  letterSpacing: "2px",
};

const headingStyle: React.CSSProperties = {
  marginTop: "8px",
  marginBottom: 0,
  fontSize: "30px",
};

const countBadge: React.CSSProperties = {
  background: "#FEF3C7",
  color: "#92400E",
  padding: "12px 20px",
  borderRadius: "999px",
  fontWeight: 700,
};

const filterRow: React.CSSProperties = {
  display: "flex",
  gap: "16px",
  marginBottom: "28px",
  flexWrap: "wrap",
};

const selectStyle: React.CSSProperties = {
  minWidth: "220px",
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid #E2E8F0",
};

const studentCard: React.CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: "18px",
  padding: "20px",
  marginBottom: "18px",
};

const studentName: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
};

const studentMeta: React.CSSProperties = {
  marginTop: "8px",
  color: "#64748B",
};

const missingTitle: React.CSSProperties = {
  marginTop: "18px",
  color: "#DC2626",
  fontWeight: 700,
};

const missingList: React.CSSProperties = {
  marginTop: "10px",
  lineHeight: 1.8,
};

const emptyState: React.CSSProperties = {
  textAlign: "center",
  padding: "50px",
  color: "#64748B",
};

const studentHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const completionBadge: React.CSSProperties = {
  background: "#DBEAFE",
  color: "#1E40AF",
  padding: "10px 16px",
  borderRadius: "999px",
  fontWeight: 700,
};

const sectionHeading: React.CSSProperties = {
  marginTop: "20px",
  marginBottom: "12px",
  fontWeight: 700,
};

const badgeContainer: React.CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const activityBadge: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: "999px",
  fontSize: "13px",
  fontWeight: 600,
};

const buttonRow: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  marginTop: "24px",
};

const primaryButton: React.CSSProperties = {
  background: "#143B73",
  color: "#FFFFFF",
  border: "none",
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButton: React.CSSProperties = {
  background: "#F8FAFC",
  color: "#334155",
  border: "1px solid #CBD5E1",
  padding: "12px 20px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 600,
};

const tableContainer: React.CSSProperties = {
  border: "1px solid #E5E7EB",
  borderRadius: "14px",
  overflow: "hidden",
};

const tableHeader: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "2fr 2fr 1fr 1fr 2fr 150px",

  background: "#143B73",

  color: "#FFFFFF",

  padding: "12px 18px",

  fontWeight: 700,

  position: "sticky",

  top: 0,

  zIndex: 5,
};

const tableRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "2fr 2fr 1fr 1fr 2fr 150px",
  alignItems: "center",
  padding: "10px 18px",
  minHeight: "46px",
  borderBottom: "1px solid #EEF2F7",
  background: "#FFFFFF",
  fontSize: "13px",
};

const studentColumn: React.CSSProperties = {};

const schoolColumn: React.CSSProperties = {};

const classColumn: React.CSSProperties = {
  textAlign: "center",
};

const completionColumn: React.CSSProperties = {
  textAlign: "center",
  fontWeight: 700,
};

const missingColumn: React.CSSProperties = {
  color: "#DC2626",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const actionColumn: React.CSSProperties = {
  display: "flex",
  gap: "12px",
  justifyContent: "center",
  cursor: "pointer",
};

const viewButton: React.CSSProperties = {
  background: "#DBEAFE",
  color: "#1D4ED8",
  border: "none",
  borderRadius: "6px",
  padding: "4px 10px",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
};

const remindButton: React.CSSProperties = {
  background: "#FEF3C7",
  color: "#B45309",
  border: "none",
  borderRadius: "6px",
  padding: "4px 10px",
  fontSize: "11px",
  fontWeight: 700,
  cursor: "pointer",
};

const toolbarRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};

const searchInput: React.CSSProperties = {
  width: "320px",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
};

const toolbarStats: React.CSSProperties = {
  color: "#64748B",
  fontWeight: 600,
  fontSize: "13px",
};