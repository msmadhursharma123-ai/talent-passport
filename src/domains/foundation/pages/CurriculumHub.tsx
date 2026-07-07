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

import CurriculumDialog
from "../components/dialogs/CurriculumDialog";

import type { Curriculum }
from "../../../types/curriculum";

import {
  useCurriculumViewModel,
} from "../viewmodels/CurriculumViewModel";

interface CurriculumHubProps {
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
];

const columns: FoundationTableColumn[] = [
  {
    key: "curriculum",
    label: "Curriculum",
  },
  {
    key: "code",
    label: "Code",
  },
  {
    key: "organization",
    label: "Organization",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function CurriculumHub({
  onBack,
}: CurriculumHubProps) {
  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [
    editingCurriculum,
    setEditingCurriculum,
  ] =
    useState<
      Curriculum | undefined
    >();

  const [search, setSearch] =
    useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState("All");

  const {
    curriculums,
    loading,
    create,
    update,
    archive,
    restore,
    remove,
  } =
    useCurriculumViewModel();

  const statistics:
    FoundationStatistic[] =
    useMemo(() => {

      const active =
        curriculums.filter(
          (
            curriculum
          ) =>
            curriculum.isActive
        ).length;

      const archived =
        curriculums.filter(
          (
            curriculum
          ) =>
            !curriculum.isActive
        ).length;

      return [
        {
          title:
            "Curriculum",

          value:
            curriculums.length,

          subtitle:
            "Registered",
        },

        {
          title:
            "Active",

          value:
            active,

          subtitle:
            "Curriculum",
        },

        {
          title:
            "Archived",

          value:
            archived,

          subtitle:
            "Inactive",
        },

        {
          title:
            "Loading",

          value:
            loading
              ? "Yes"
              : "No",

          subtitle:
            "Repository Status",
        },
      ];
    }, [
      curriculums,
      loading,
    ]);

  const filteredCurriculums =
    useMemo(() => {

      return curriculums.filter(
        (
          curriculum
        ) => {

          const searchMatch =
            search === "" ||

            curriculum.curriculumName
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            curriculum.curriculumCode
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
                ? curriculum.isActive
                : !curriculum.isActive
            );

          return (
            searchMatch &&
            statusMatch
          );

        }
      );

    }, [
      curriculums,
      search,
      selectedStatus,
    ]);

      const rows:
    FoundationTableRow[] =
    useMemo(
      () =>
        filteredCurriculums.map(
          (
            curriculum
          ) => ({
            id:
              curriculum.id,

            values: {
              curriculum:
                curriculum.curriculumName,

              code:
                curriculum.curriculumCode,

             organization:
  curriculum.organizationName ||
  curriculum.organizationId,

              status:
                curriculum.isActive
                  ? "Active"
                  : "Archived",
            },
          })
        ),
      [
        filteredCurriculums,
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
          const curriculum =
            curriculums.find(
              (
                item
              ) =>
                item.id ===
                row.id
            );

          if (
            !curriculum
          ) {
            return;
          }

          setEditingCurriculum(
            curriculum
          );

          setDialogOpen(
            true
          );
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

            const curriculum =
              curriculums.find(
                (
                  item
                ) =>
                  item.id ===
                  row.id
              );

            if (
              !curriculum
            ) {
              return;
            }

            if (
              curriculum.isActive
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
                "Are you sure you want to permanently delete this curriculum?"
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
          title="📘 Curriculum"
          subtitle="Manage curriculum definitions available inside each organization. Subjects, classes and learning pathways are built upon these curriculum records."
          badge="Foundation"
        />

        <FoundationStatisticsRow
          statistics={
            statistics
          }
        />

        <FoundationToolbar
          searchPlaceholder="Search curriculum..."

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

          }}

          primaryActionLabel="+ Add Curriculum"

          onPrimaryAction={() => {

            setEditingCurriculum(
              undefined
            );

            setDialogOpen(
              true
            );

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

            <CurriculumDialog
        mode={
          editingCurriculum
            ? "edit"
            : "create"
        }

        curriculum={
          editingCurriculum
        }

        open={dialogOpen}

        onClose={() => {

          setDialogOpen(
            false
          );

          setEditingCurriculum(
            undefined
          );

        }}

        onSave={async (
          curriculum
        ) => {

          if (
            editingCurriculum
          ) {

            await update(
              editingCurriculum.id,
              curriculum
            );

          } else {

            await create(
              curriculum
            );

          }

          setEditingCurriculum(
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

/* ============================================================
   STYLES
============================================================ */

const pageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};