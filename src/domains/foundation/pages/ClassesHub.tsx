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

import ClassDialog
from "../components/dialogs/ClassDialog";

import type { Class }
from "../../../types/class";

import {
  useClassViewModel,
} from "../viewmodels/ClassViewModel";

interface ClassesHubProps {
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
    label: "Organization",
    options: [
      "All",
    ],
  },
];

const columns: FoundationTableColumn[] = [
  {
    key: "class",
    label: "Class",
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
    key: "curriculum",
    label: "Curriculum",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function ClassesHub({
  onBack,
}: ClassesHubProps) {

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [
    editingClass,
    setEditingClass,
  ] =
    useState<
      Class | undefined
    >();

  const [search, setSearch] =
    useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] =
    useState("All");

  const [
    selectedOrganization,
    setSelectedOrganization,
  ] =
    useState("All");

  const {
    classes,
    loading,
    addClass,
    editClass,
    archive,
    restore,
    remove,
  } =
    useClassViewModel();

  const statistics:
    FoundationStatistic[] =
    useMemo(() => {

      const active =
        classes.filter(
          (
            item
          ) =>
            item.isActive
        ).length;

      const archived =
        classes.filter(
          (
            item
          ) =>
            !item.isActive
        ).length;

      return [
        {
          title:
            "Classes",

          value:
            classes.length,

          subtitle:
            "Registered",
        },

        {
          title:
            "Active",

          value:
            active,

          subtitle:
            "Classes",
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
      classes,
      loading,
    ]);

  const filteredClasses =
    useMemo(() => {

      return classes.filter(
        (
          item
        ) => {

          const searchMatch =

            search === "" ||

            item.className
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            item.classCode
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

                ? item.isActive

                : !item.isActive
            );

          const organizationMatch =

            selectedOrganization ===
            "All" ||

            item.organizationName ===
            selectedOrganization;

          return (

            searchMatch &&

            statusMatch &&

            organizationMatch

          );

        }

      );

    }, [

      classes,

      search,

      selectedStatus,

      selectedOrganization,

    ]);

      const rows:
    FoundationTableRow[] =
    useMemo(
      () =>
        filteredClasses.map(
          (
            item
          ) => ({
            id: item.id,

            values: {
              class:
                item.className,

              code:
                item.classCode,

              organization:
                item.organizationName,

              curriculum:
                item.curriculumName,

              status:
                item.isActive
                  ? "Active"
                  : "Archived",
            },
          })
        ),
      [
        filteredClasses,
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

          const classRecord =
            classes.find(
              (
                item
              ) =>
                item.id ===
                row.id
            );

          if (
            !classRecord
          ) {
            return;
          }

          setEditingClass(
            classRecord
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

            const classRecord =
              classes.find(
                (
                  item
                ) =>
                  item.id ===
                  row.id
              );

            if (
              !classRecord
            ) {
              return;
            }

            if (
              classRecord.isActive
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
                "Are you sure you want to permanently delete this class?"
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

  const organizationOptions =
    useMemo(() => {

      return [
        "All",

        ...Array.from(
          new Set(
            classes.map(
              (
                item
              ) =>
                item.organizationName
            )
          )
        ),

      ];

    }, [
      classes,
    ]);

  return (
    <>
      <div style={pageStyle}>

        <FoundationManagementHeader
          showBackButton
          onBack={onBack}
          title="🏫 Classes"
          subtitle="Manage classes available within each curriculum. Classes become the parent entity for Sections and student allocations."
          badge="Foundation"
        />

        <FoundationStatisticsRow
          statistics={
            statistics
          }
        />

        <FoundationToolbar
          searchPlaceholder="Search classes..."

          searchValue={
            search
          }

          onSearchChange={
            setSearch
          }

          filters={[
            {
              label:
                "Status",

              options: [
                "All",
                "Active",
                "Archived",
              ],
            },

            {
              label:
                "Organization",

              options:
                organizationOptions,
            },

          ]}

          filterValues={[
            selectedStatus,
            selectedOrganization,
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

              setSelectedOrganization(
                value
              );

            }

          }}

          primaryActionLabel="+ Add Class"

          onPrimaryAction={() => {

            setEditingClass(
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

          rows={
            rows
          }

          actions={
            actions
          }
        />

      </div>

            <ClassDialog
        open={dialogOpen}

        mode={
          editingClass
            ? "edit"
            : "create"
        }

        classRecord={
          editingClass
        }

        onClose={() => {

          setDialogOpen(
            false
          );

          setEditingClass(
            undefined
          );

        }}

        onSubmit={async (
          data
        ) => {

          let success =
            false;

          if (
            editingClass
          ) {

            success =
              await editClass(
                editingClass.id,
                data
              );

          } else {

            success =
              await addClass(
                data
              );

          }

          if (
            success
          ) {

            setDialogOpen(
              false
            );

            setEditingClass(
              undefined
            );

          }

          return success;

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