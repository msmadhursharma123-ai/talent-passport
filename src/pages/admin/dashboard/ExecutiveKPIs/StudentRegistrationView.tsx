import { useEffect, useState } from "react";

import { fetchStudentsMaster } from "../../../../supabaseClient";

import ExecutiveDrawerTabs from "./ExecutiveDrawerTabs";

import ExecutiveDrawerFilters, {
  type ExecutiveFilter,
} from "./ExecutiveDrawerFilters";

import ExecutiveDrawerTable, {
  type ExecutiveTableColumn,
} from "./ExecutiveDrawerTable";

interface Props {
  records?: StudentRecord[];
}

interface StudentRecord {
  id: string;
  student_name: string;
  school_name: string | null;
  class_name: string | null;
  state: string | null;
  created_at: string;
}



export default function StudentRegistrationView({
  records = [],
}: Props) {

  const [timeRange, setTimeRange] = useState<
    "today" | "last7Days" | "last30Days"
  >("today");

const [students, setStudents] =
  useState<StudentRecord[]>([]);

useEffect(() => {
  async function loadStudents() {

    // Platform Snapshot
    if (records.length > 0) {
      setStudents(records);
      return;
    }

    // Executive KPI
    const data =
      await fetchStudentsMaster();

    setStudents(data ?? []);
  }

  loadStudents();
}, [records]);

  const [filters, setFilters] =
    useState<ExecutiveFilter[]>([
      {
        id: "search",
        label: "Search Student",
        type: "search",
        value: "",
      },
      {
        id: "state",
        label: "State",
        type: "select",
        value: "",
        options: [],
      },
      {
        id: "school",
        label: "School",
        type: "select",
        value: "",
        options: [],
      },
      {
        id: "class",
        label: "Class",
        type: "select",
        value: "",
        options: [],
      },
    ]);

 

  const columns: ExecutiveTableColumn[] = [
    {
      key: "student",
      title: "Student",
      width: "2fr",
    },
    {
      key: "school",
      title: "School",
    },
    {
      key: "class",
      title: "Class",
    },
    {
      key: "registeredOn",
      title: "Registered On",
    },
  ];

  const now = new Date();

  const filteredStudents = students.filter((student) => {
    const created = new Date(student.created_at);

    switch (timeRange) {
      case "today":
        return (
          created.toDateString() ===
          now.toDateString()
        );

      case "last7Days":
        return (
          now.getTime() - created.getTime() <=
          7 * 24 * 60 * 60 * 1000
        );

      case "last30Days":
        return (
          now.getTime() - created.getTime() <=
          30 * 24 * 60 * 60 * 1000
        );

      default:
        return true;
    }
  });

  const search =
    filters
      .find((f) => f.id === "search")
      ?.value.toLowerCase() ?? "";

  const selectedState =
    filters.find((f) => f.id === "state")?.value ?? "";

  const selectedSchool =
    filters.find((f) => f.id === "school")?.value ?? "";

  const selectedClass =
    filters.find((f) => f.id === "class")?.value ?? "";

  const finalStudents =
    filteredStudents.filter((student) => {
      const matchesSearch =
        student.student_name
          ?.toLowerCase()
          .includes(search);

      const matchesState =
        !selectedState ||
        student.state === selectedState;

      const matchesSchool =
        !selectedSchool ||
        student.school_name === selectedSchool;

      const matchesClass =
        !selectedClass ||
        student.class_name === selectedClass;

      return (
        matchesSearch &&
        matchesState &&
        matchesSchool &&
        matchesClass
      );
    });

  const rows = finalStudents.map((student) => ({
    student: student.student_name,
    school: student.school_name ?? "-",
    class: student.class_name ?? "-",
    registeredOn: new Date(
      student.created_at
    ).toLocaleDateString(),
  }));

  function handleFilterChange(
    id: string,
    value: string
  ) {
    setFilters((previous) =>
      previous.map((filter) =>
        filter.id === id
          ? {
              ...filter,
              value,
            }
          : filter
      )
    );
  }

  return (
    <>
<ExecutiveDrawerTabs
  value={timeRange}
  onChange={setTimeRange}
/>

<ExecutiveDrawerFilters
  filters={filters}
  onChange={handleFilterChange}
/>

<div
  style={{
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 12,
    marginBottom: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: 600,
  }}
>
  Showing {rows.length} Student{rows.length !== 1 ? "s" : ""}
</div>

<ExecutiveDrawerTable
  columns={columns}
  rows={rows}
  emptyMessage="No student registrations found."
/>
    </>
  );
}