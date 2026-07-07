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

import SectionDialog
from "../components/dialogs/SectionDialog";

import type { Section }
from "../../../types/section";

import useSectionViewModel
from "../viewmodels/SectionViewModel";

interface SectionsHubProps {
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
    key: "section",
    label: "Section",
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
    key: "class",
    label: "Class",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function SectionsHub({
  onBack,
}: SectionsHubProps) {

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [
    editingSection,
    setEditingSection,
  ] =
    useState<
      Section | undefined
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
    sections,
    organizations,
    curriculums,
    classes,
    loading,
    addSection,
    editSection,
    archive,
    restore,
    remove,
  } =
    useSectionViewModel();

  const statistics:
    FoundationStatistic[] =
    useMemo(() => {

      const active =
        sections.filter(
          (
            item
          ) =>
            item.isActive
        ).length;

      const archived =
        sections.filter(
          (
            item
          ) =>
            !item.isActive
        ).length;

      return [
        {
          title:
            "Sections",

          value:
            sections.length,

          subtitle:
            "Registered",
        },

        {
          title:
            "Active",

          value:
            active,

          subtitle:
            "Sections",
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
      sections,
      loading,
    ]);

  const filteredSections =
    useMemo(() => {

      return sections.filter(
        (
          item
        ) => {

          const searchMatch =

            search === "" ||

            item.sectionName
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            item.sectionCode
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

      sections,

      search,

      selectedStatus,

      selectedOrganization,

    ]);
      const rows: FoundationTableRow[] =
    useMemo(
      () =>
        filteredSections.map(
          section => ({
            id: section.id,

            values: {
              section:
                section.sectionName,

              code:
                section.sectionCode,

              organization:
                section.organizationName,

              curriculum:
                section.curriculumName,

              class:
                section.className,

              status:
                section.isActive
                  ? "Active"
                  : "Archived",
            },
          })
        ),
      [filteredSections]
    );

  const actions:
    FoundationTableAction[] = [
    {
      label: "Edit",

      variant: "primary",

      onClick: row => {
        const record =
          sections.find(
            item =>
              item.id ===
              row.id
          );

        if (!record) {
          return;
        }

        setEditingSection(
          record
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
        async row => {
          const record =
            sections.find(
              item =>
                item.id ===
                row.id
            );

          if (!record) {
            return;
          }

          if (
            record.isActive
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
      label: "Delete",

      variant:
        "danger",

      onClick:
        async row => {
          const confirmed =
            window.confirm(
              "Are you sure you want to permanently delete this section?"
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
    useMemo(
      () => [
        "All",

        ...Array.from(
          new Set(
            sections.map(
              item =>
                item.organizationName
            )
          )
        ),
      ],
      [sections]
    );
      return (
    <>
      <div style={pageStyle}>
        <FoundationManagementHeader
          showBackButton
          onBack={onBack}
          title="🧩 Sections"
          subtitle="Manage sections available within each class. Sections become the parent entity for Subjects and student allocations."
          badge="Foundation"
        />

        <FoundationStatisticsRow
          statistics={statistics}
        />

        <FoundationToolbar
          searchPlaceholder="Search sections..."
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
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
            if (index === 0) {
              setSelectedStatus(
                value
              );
            }

            if (index === 1) {
              setSelectedOrganization(
                value
              );
            }
          }}
          primaryActionLabel="+ Add Section"
          onPrimaryAction={() => {
            setEditingSection(
              undefined
            );

            setDialogOpen(
              true
            );
          }}
        />

        <FoundationDataTable
          columns={columns}
          rows={rows}
          actions={actions}
        />
      </div>
            <SectionDialog
        open={dialogOpen}
        mode={
          editingSection
            ? "edit"
            : "create"
        }
        sectionRecord={
          editingSection
        }
        organizations={
          organizations
        }
        curriculums={
          curriculums
        }
        classes={
          classes
        }
        onClose={() => {
          setDialogOpen(false);
          setEditingSection(
            undefined
          );
        }}
        onSubmit={async data => {
          let success =
            false;

          if (
            editingSection
          ) {
            success =
              await editSection(
                editingSection.id,
                data
              );
          } else {
            success =
              await addSection(
                data
              );
          }

          if (
            success
          ) {
            setDialogOpen(false);
            setEditingSection(
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