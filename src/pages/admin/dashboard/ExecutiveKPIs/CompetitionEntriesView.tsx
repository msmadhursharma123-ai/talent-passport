import { useEffect, useState } from "react";

import { getSupabaseClient } from "../../../../supabaseClient";

import ExecutiveDrawerTabs from "./ExecutiveDrawerTabs";

import ExecutiveDrawerFilters, {
  type ExecutiveFilter,
} from "./ExecutiveDrawerFilters";

import ExecutiveDrawerTable, {
  type ExecutiveTableColumn,
} from "./ExecutiveDrawerTable";



interface CompetitionRecord {
  id: string;
  student_name: string;
  school_name: string;
  class_name: string;
  state: string;
  pathway: string;
  event_name: string;
  created_at: string;
  processing_status: string | null;
}

export default function CompetitionEntriesView() {
  const [timeRange, setTimeRange] = useState<
    "today" | "last7Days" | "last30Days"
  >("today");

  const [entries, setEntries] =
    useState<CompetitionRecord[]>([]);

  const [filters, setFilters] =
    useState<ExecutiveFilter[]>([
      {
        id: "search",
        label: "Search Student",
        type: "search",
        value: "",
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

      {
        id: "category",
        label: "Category",
        type: "select",
        value: "",
        options: [],
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        value: "",
        options: [
          "Submitted",
        ],
      },
    ]);

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
  const supabase = getSupabaseClient();

  if (!supabase) return;

 const { data, error } = await supabase
  .from("submissions")
  .select("*")
  .order("created_at", {
    ascending: false,
  });

if (error) {
  console.error(error);
  return;
}

const records =
  (data ?? []).map((row: any) => ({
    id: row.id,
    student_name: row.student_name,
    school_name: row.school_name ?? "",
    class_name: row.class_name ?? "",
    state: "",
    pathway: row.pathway,
    event_name: row.event_name,
    created_at: row.created_at,
    processing_status: row.processing_status,
  }));

  setEntries(records);

console.log("RAW DATA", data);
console.log("RECORDS", records);
console.log("COUNT", records.length);

  setFilters((previous) =>
    previous.map((filter) => {
      if (filter.id === "school") {
        return {
          ...filter,
          options: [
            ...new Set(
              records
                .map((r) => r.school_name)
                .filter(Boolean)
            ),
          ] as string[],
        };
      }

if (filter.id === "class") {
  return {
    ...filter,
    options: [
      ...new Set(
        records
          .map((r) => r.class_name)
          .filter(Boolean)
      ),
    ] as string[],
  };
}

      if (filter.id === "category") {
        return {
          ...filter,
          options: [
            ...new Set(
              records
                .map((r) => r.pathway)
                .filter(Boolean)
            ),
          ] as string[],
        };
      }

if (filter.id === "status") {
  return {
    ...filter,
    options: [
      "Submitted",
      "Evaluating",
      "Evaluated",
    ],
  };
}

      return filter;
    })
  );
}

  const columns: ExecutiveTableColumn[] = [
    {
      key: "student",
      title: "Student",
      width: "2fr",
    },
   {
  key: "competition",
  title: "Competition",
  width: "2fr",
},
{
  key: "class",
  title: "Class",
},
{
  key: "category",
  title: "Category",
},
    {
      key: "submittedOn",
      title: "Submitted On",
    },
  ];

  const now = new Date();

  const filteredEntries =
    entries.filter((entry) => {
      const created =
        new Date(entry.created_at);

      switch (timeRange) {
        case "today":
          return (
            created.toDateString() ===
            now.toDateString()
          );

        case "last7Days":
          return (
            now.getTime() -
              created.getTime() <=
            7 *
              24 *
              60 *
              60 *
              1000
          );

        case "last30Days":
          return (
            now.getTime() -
              created.getTime() <=
            30 *
              24 *
              60 *
              60 *
              1000
          );

        default:
          return true;
      }
    });

  const search =
    filters
      .find((f) => f.id === "search")
      ?.value.toLowerCase() ?? "";

  const selectedSchool =
    filters.find(
      (f) => f.id === "school"
    )?.value ?? "";

const selectedClass =
  filters.find(
    (f) => f.id === "class"
  )?.value ?? "";

  const selectedCategory =
    filters.find(
      (f) => f.id === "category"
    )?.value ?? "";

const selectedStatus =
  filters.find(
    (f) => f.id === "status"
  )?.value ?? "";

  const finalEntries =
    filteredEntries.filter((entry) => {
      const matchesSearch =
        entry.student_name
          ?.toLowerCase()
          .includes(search);

      const matchesSchool =
        !selectedSchool ||
        entry.school_name ===
          selectedSchool;

          const matchesClass =
  !selectedClass ||
  entry.class_name === selectedClass;

      const matchesCategory =
        !selectedCategory ||
        entry.pathway ===
          selectedCategory;

const status =
  entry.processing_status ??
  "Submitted";

const matchesStatus =
  !selectedStatus ||
  status === selectedStatus;

return (
  matchesSearch &&
  matchesSchool &&
  matchesClass &&
  matchesCategory &&
  matchesStatus
);
    });

console.log("Entries", entries.length);
console.log("Filtered", filteredEntries.length);
console.log("Final", finalEntries.length);

const rows =
  finalEntries.map((entry) => ({
    student: entry.student_name,
    competition: entry.event_name,
    class: entry.class_name,
    category: entry.pathway,
    submittedOn: new Date(
      entry.created_at
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
          color: "#66758D",
          fontWeight: 600,
        }}
      >
        Showing {rows.length} Entr
        {rows.length === 1
          ? "y"
          : "ies"}
      </div>

      <ExecutiveDrawerTable
        columns={columns}
        rows={rows}
        emptyMessage="No competition entries found."
      />
    </>
  );
}