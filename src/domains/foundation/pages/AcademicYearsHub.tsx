import React, {
  useMemo,
  useState,
} from "react";

import FoundationManagementHeader from "../components/management/FoundationManagementHeader";

import FoundationStatisticsRow, {
  type FoundationStatistic,
} from "../components/management/FoundationStatisticsRow";

import FoundationToolbar, {
  type FoundationFilter,
} from "../components/management/FoundationToolbar";

import FoundationDataTable, {
  type FoundationTableAction,
  type FoundationTableColumn,
  type FoundationTableRow,
} from "../components/management/FoundationDataTable";

import AcademicYearDialog
from "../components/dialogs/AcademicYearDialog";

import type { AcademicYear } from "../../../types/academicYear";

import {
  useAcademicYearViewModel,
} from "../viewmodels/AcademicYearViewModel";

interface AcademicYearsHubProps {
  onBack?: () => void;
}

const filters: FoundationFilter[] = [
  {
    label: "Status",
    options: [
      "All",
      "Active",
      "Archived",
    ],
  },
  {
    label: "Current",
    options: [
      "All",
      "Current",
      "Past",
    ],
  },
];

const columns: FoundationTableColumn[] = [
  {
    key: "academicYear",
    label: "Academic Year",
  },
  {
    key: "code",
    label: "Code",
  },
  {
    key: "startDate",
    label: "Start Date",
  },
  {
    key: "endDate",
    label: "End Date",
  },
  {
    key: "current",
    label: "Current",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function AcademicYearsHub({
  onBack,
}: AcademicYearsHubProps) {
  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [
    editingAcademicYear,
    setEditingAcademicYear,
  ] =
    useState<
      AcademicYear | undefined
    >();

  const [search, setSearch] =
    useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState("All");

  const [
    selectedCurrent,
    setSelectedCurrent,
  ] =
    useState("All");

  const {
    academicYears,
    loading,
    addAcademicYear,
    editAcademicYear,
    archive,
    restore,
    remove,
  } =
    useAcademicYearViewModel();

  const statistics:
    FoundationStatistic[] =
    useMemo(() => {
      const active =
        academicYears.filter(
          (
            academicYear
          ) =>
            academicYear.isActive
        ).length;

      const archived =
        academicYears.filter(
          (
            academicYear
          ) =>
            !academicYear.isActive
        ).length;

      return [
        {
          title:
            "Academic Years",
          value:
            academicYears.length,
          subtitle:
            "Registered",
        },
        {
          title:
            "Active",
          value: active,
          subtitle:
            "Academic Years",
        },
        {
          title:
            "Archived",
          value: archived,
          subtitle:
            "Inactive",
        },
        {
          title:
            "Loading",
          value: loading
            ? "Yes"
            : "No",
          subtitle:
            "Repository Status",
        },
      ];
    }, [
      academicYears,
      loading,
    ]);

  const filteredAcademicYears =
    useMemo(() => {
      return academicYears.filter(
        (
          academicYear
        ) => {
          const searchMatch =
            search === "" ||

            academicYear.academicYearName
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            academicYear.academicYearCode
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const statusMatch =
            selectedStatus ===
              "All" ||

            (
              selectedStatus ===
              "Active"
                ? academicYear.isActive
                : !academicYear.isActive
            );

          const currentMatch =
            selectedCurrent ===
              "All" ||

            (
              selectedCurrent ===
              "Current"
                ? academicYear.isCurrent
                : !academicYear.isCurrent
            );

          return (
            searchMatch &&
            statusMatch &&
            currentMatch
          );
        }
      );
    }, [
      academicYears,
      search,
      selectedStatus,
      selectedCurrent,
    ]);

  const rows:
    FoundationTableRow[] =
    useMemo(
      () =>
        filteredAcademicYears.map(
          (
            academicYear
          ) => ({
            id:
              academicYear.id,

            values: {
              academicYear:
                academicYear.academicYearName,

              code:
                academicYear.academicYearCode,

              startDate:
                academicYear.startDate,

              endDate:
                academicYear.endDate,

              current:
                academicYear.isCurrent
                  ? "Yes"
                  : "No",

              status:
                academicYear.isActive
                  ? "Active"
                  : "Archived",
            },
          })
        ),
      [
        filteredAcademicYears,
      ]
    );

  const actions:
    FoundationTableAction[] =
    [
      {
        label: "Edit",

        variant:
          "primary",

        onClick: (
          row
        ) => {
          const year =
            academicYears.find(
              (
                item
              ) =>
                item.id ===
                row.id
            );

          if (!year) {
            return;
          }

          setEditingAcademicYear(
            year
          );

          setDialogOpen(true);
        },
      },

      {
        label:
          "Archive / Restore",

        variant:
          "secondary",

        onClick:
          async (
            row
          ) => {
            const year =
              academicYears.find(
                (
                  item
                ) =>
                  item.id ===
                  row.id
              );

            if (
              !year
            ) {
              return;
            }

            if (
              year.isActive
            ) {
              await archive(
                row.id
              );
            } else {
              await restore(
                row.id
              );
            }
          },
      },

      {
        label:
          "Delete",

        variant:
          "danger",

        onClick:
          async (
            row
          ) => {
            const confirmed =
              window.confirm(
                "Are you sure you want to permanently delete this academic year?"
              );

            if (
              !confirmed
            ) {
              return;
            }

            await remove(
              row.id
            );
          },
      },
    ];

  return (
    <>
      <div style={pageStyle}>
        <FoundationManagementHeader
          showBackButton
          onBack={onBack}
          title="📅 Academic Years"
          subtitle="Manage academic sessions used across organizations. These become the parent records for classes, curriculum and student enrollment."
          badge="Foundation"
        />

        <FoundationStatisticsRow
          statistics={
            statistics
          }
        />

        <FoundationToolbar
          searchPlaceholder="Search academic years..."
          searchValue={
            search
          }
          onSearchChange={
            setSearch
          }
          filters={
            filters
          }
          filterValues={[
            selectedStatus,
            selectedCurrent,
          ]}
          onFilterChange={(
            index,
            value
          ) => {
            if (
              index === 0
            ) {
              setSelectedStatus(
                value
              );
            }

            if (
              index === 1
            ) {
              setSelectedCurrent(
                value
              );
            }
          }}
          primaryActionLabel="+ Add Academic Year"
          onPrimaryAction={() => {
            setEditingAcademicYear(
              undefined
            );

            setDialogOpen(true);
          }}
        />

        <FoundationDataTable
          columns={
            columns
          }
          rows={rows}
          actions={
            actions
          }
        />
      </div>

      <AcademicYearDialog
        mode={
          editingAcademicYear
            ? "edit"
            : "create"
        }
        academicYear={
          editingAcademicYear
        }
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(
            false
          );

          setEditingAcademicYear(
            undefined
          );
        }}
        onSave={async (
          academicYear
        ) => {
          if (
            editingAcademicYear
          ) {
            await editAcademicYear(
              editingAcademicYear.id,
              academicYear
            );
          } else {
            await addAcademicYear(
              academicYear
            );
          }

          setEditingAcademicYear(
            undefined
          );

          setDialogOpen(
            false
          );
        }}
      />
    </>
  );
}

const pageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};