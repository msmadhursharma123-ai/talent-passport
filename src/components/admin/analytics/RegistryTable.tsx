import React from "react";
import StudentRow from "./StudentRow";
import EmptyState from "./EmptyState";

interface RegistryTableProps {
  students: any[];
  selectedStudents: string[];
  getLeadStatus: (studentId: string) => string;
  toggleStudent: (studentId: string) => void;
  toggleAll: () => void;
}

export default function RegistryTable({
  students,
  selectedStudents,
  getLeadStatus,
  toggleStudent,
  toggleAll,
}: RegistryTableProps) {
  if (students.length === 0) {
    return (
      <EmptyState
        title="No Students Found"
        description="Try changing your search keywords or filters."
      />
    );
  }

  return (
    <div
      style={{
        marginTop: 24,
        overflowX: "auto",
        border: "1px solid #E2E8F0",
        borderRadius: 20,
        background: "#FFFFFF",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 1400,
        }}
      >
        <thead>
          <tr
            style={{
              background: "#F8FAFC",
              borderBottom: "1px solid #E2E8F0",
            }}
          >
            <th
              style={{
                padding: 16,
                width: 60,
                textAlign: "center",
              }}
            >
              <input
                type="checkbox"
                checked={
                  students.length > 0 &&
                  selectedStudents.length === students.length
                }
                onChange={toggleAll}
              />
            </th>

            <Header>Student</Header>
            <Header>Mobile</Header>
            <Header>Email</Header>
            <Header>School</Header>
            <Header>Class</Header>
            <Header>Age</Header>
            <Header>Gender</Header>
            <Header>City</Header>
            <Header>Area</Header>
            <Header>Activity</Header>
            <Header>Status</Header>
          </tr>
        </thead>

        <tbody>
          {students.map((student) => (
            <StudentRow
              key={student.student_id}
              student={student}
              status={getLeadStatus(student.student_id)}
              selected={selectedStudents.includes(student.student_id)}
              onToggle={() => toggleStudent(student.student_id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Header({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th
      style={{
        padding: "16px",
        textAlign: "left",
        fontSize: 13,
        fontWeight: 700,
        color: "#475569",
        whiteSpace: "nowrap",
        letterSpacing: ".02em",
      }}
    >
      {children}
    </th>
  );
}