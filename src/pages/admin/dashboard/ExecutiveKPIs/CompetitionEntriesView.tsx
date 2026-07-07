import { useState } from "react";

import ExecutiveDrawerTabs from "./ExecutiveDrawerTabs";

import ExecutiveDrawerFilters, {
  type ExecutiveFilter,
} from "./ExecutiveDrawerFilters";

import ExecutiveDrawerTable, {
  type ExecutiveTableColumn,
} from "./ExecutiveDrawerTable";

export default function CompetitionEntriesView() {
  const [timeRange, setTimeRange] = useState<
    "today" | "last7Days" | "last30Days"
  >("today");

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
      key: "competition",
      title: "Competition",
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

  const rows: Record<string, React.ReactNode>[] = [];

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

      <ExecutiveDrawerTable
        columns={columns}
        rows={rows}
        emptyMessage="No competition entries found."
      />
    </>
  );
}