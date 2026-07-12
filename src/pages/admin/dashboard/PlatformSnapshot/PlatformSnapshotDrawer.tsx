import ExecutiveDetailDrawer
  from "../ExecutiveKPIs/ExecutiveDetailDrawer";

import StudentRegistryView
  from "./StudentRegistryView";

import CompetitionEntriesView
  from "../ExecutiveKPIs/CompetitionEntriesView";

import SchoolRegistryView
  from "./SchoolRegistryView";

import ClassDistributionView
  from "./ClassDistributionView";

import PendingEvaluationsView
  from "./PendingEvaluationsView";

type SnapshotType =
  | "students"
  | "schools"
  | "classes"
  | "competitions"
  | "evaluations";

interface Props {
  open: boolean;

  type: SnapshotType | null;

  students: any[];

  submissions: any[];

  pendingEvaluationRows: any[];

  completedStudents: any[];

  incompleteStudents: any[];

  onClose: () => void;
}

export default function PlatformSnapshotDrawer({
  open,
  type,
  students,
  submissions,
  pendingEvaluationRows,
  completedStudents,
  incompleteStudents,
  onClose,
}: Props) {

  const titles = {
    students: "Student Registry",
    schools: "School Registry",
    classes: "Class Distribution",
    competitions: "Competition Catalog",
    evaluations: "Pending Evaluations",
  };

  return (
    <ExecutiveDetailDrawer
      open={open}
      title={type ? titles[type] : ""}
      onClose={onClose}
    >
     {type === "students" && (
  <StudentRegistryView
    students={students}
    completedStudents={completedStudents}
    incompleteStudents={incompleteStudents}
  />
)}

{type === "competitions" && (
  <CompetitionEntriesView />
)}

{type === "schools" && (
  <SchoolRegistryView
    students={students}
  />
)}

{type === "classes" && (
  <ClassDistributionView
    students={students}
  />
)}

{type === "evaluations" && (
  <PendingEvaluationsView
    records={pendingEvaluationRows}
  />
)}
    </ExecutiveDetailDrawer>
  );
}