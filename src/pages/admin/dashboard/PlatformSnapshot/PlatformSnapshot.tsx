import { useState } from "react";

import PlatformSnapshotCard from "./PlatformSnapshotCard";
import PlatformSnapshotDrawer from "./PlatformSnapshotDrawer";

interface PlatformSummary {
  totalStudents: number;
  totalEntries: number;
  totalSchools: number;
  totalClasses: number;
  competitions: number;
  pendingEvaluations: number;
  completedRegistrations: number;
  incompleteRegistrations: number;
}

interface PlatformSnapshotProps {
  summary: PlatformSummary;

  students: any[];

  submissions: any[];

  pendingEvaluationRows: any[];

  completedStudents: any[];

  incompleteStudents: any[];
}

type SnapshotType =
  | "students"
  | "schools"
  | "classes"
  | "competitions"
  | "evaluations";

export default function PlatformSnapshot({
  summary,
  students,
  submissions,
  pendingEvaluationRows,
  completedStudents,
  incompleteStudents,
}: PlatformSnapshotProps) {
  const [selected, setSelected] =
    useState<SnapshotType | null>(null);

  return (
    <>
      <PlatformSnapshotCard
        title="Total Students"
        value={summary.totalStudents}
        onClick={() => setSelected("students")}
      />

      <PlatformSnapshotCard
        title="Total Entries"
        value={summary.totalEntries}
        onClick={() => setSelected("competitions")}
      />

      <PlatformSnapshotCard
        title="Completed Registrations"
        value={summary.completedRegistrations}
        onClick={() => setSelected("students")}
      />

      <PlatformSnapshotCard
        title="Incomplete Registrations"
        value={summary.incompleteRegistrations}
        onClick={() => setSelected("students")}
      />

      <PlatformSnapshotCard
        title="Total Schools"
        value={summary.totalSchools}
        onClick={() => setSelected("schools")}
      />

      <PlatformSnapshotCard
        title="Total Classes"
        value={summary.totalClasses}
        onClick={() => setSelected("classes")}
      />

      <PlatformSnapshotCard
        title="Competitions"
        value={summary.competitions}
        onClick={() => setSelected("competitions")}
      />

      <PlatformSnapshotCard
        title="Pending Evaluations"
        value={summary.pendingEvaluations}
        onClick={() => setSelected("evaluations")}
      />

<PlatformSnapshotDrawer
  open={selected !== null}
  type={selected}
  students={students}
  submissions={submissions}
  pendingEvaluationRows={pendingEvaluationRows}
  completedStudents={completedStudents}
  incompleteStudents={incompleteStudents}
  onClose={() => setSelected(null)}
/>
    </>
  );
}