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

import ChapterDialog
from "../components/dialogs/ChapterDialog";

import type {
  Chapter,
} from "../../../types/chapter";

import useChapterViewModel
from "../viewmodels/ChapterViewModel";

interface ChaptersHubProps {
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
    key: "chapter",
    label: "Chapter",
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
    key: "section",
    label: "Section",
  },
  {
    key: "subject",
    label: "Subject",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function ChaptersHub({
  onBack,
}: ChaptersHubProps) {

  const [
    dialogOpen,
    setDialogOpen,
  ] =
    useState(false);

  const [
    editingChapter,
    setEditingChapter,
  ] =
    useState<
      Chapter | undefined
    >();

  const [
    search,
    setSearch,
  ] =
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

    chapters,

    organizations,

    curriculums,

    classes,

    sections,

    subjects,

    loading,

    addChapter,

    editChapter,

    archive,

    restore,

    remove,

  } =
    useChapterViewModel();

  const statistics:
    FoundationStatistic[] =
    useMemo(() => {

      const active =
        chapters.filter(
          item =>
            item.isActive
        ).length;

      const archived =
        chapters.filter(
          item =>
            !item.isActive
        ).length;

      return [

        {
          title:
            "Chapters",

          value:
            chapters.length,

          subtitle:
            "Registered",
        },

        {
          title:
            "Active",

          value:
            active,

          subtitle:
            "Chapters",
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

      chapters,

      loading,

    ]);

  const filteredChapters =
    useMemo(() => {

      return chapters.filter(
        item => {

          const searchMatch =

            search === "" ||

            item.chapterName
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            item.chapterCode
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

      chapters,

      search,

      selectedStatus,

      selectedOrganization,

    ]);

      const rows: FoundationTableRow[] =
    useMemo(
      () =>
        filteredChapters.map(
          chapter => ({
            id: chapter.id,

            values: {
              chapter:
                chapter.chapterName,

              code:
                chapter.chapterCode,

              organization:
                chapter.organizationName,

              curriculum:
                chapter.curriculumName,

              class:
                chapter.className,

              section:
                chapter.sectionName,

              subject:
                chapter.subjectName,

              status:
                chapter.isActive
                  ? "Active"
                  : "Archived",
            },
          })
        ),
      [filteredChapters]
    );

  const actions:
    FoundationTableAction[] = [
    {
      label: "Edit",

      variant: "primary",

      onClick: row => {

        const record =
          chapters.find(
            item =>
              item.id ===
              row.id
          );

        if (!record) {
          return;
        }

        setEditingChapter(
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
            chapters.find(
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
      label:
        "Delete",

      variant:
        "danger",

      onClick:
        async row => {

          const confirmed =
            window.confirm(
              "Are you sure you want to permanently delete this chapter?"
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

          chapters
            .map(
              item =>
                item.organizationName
            )
            .filter(
              (
                value
              ): value is string =>
                value !== undefined
            )

        )

      ),

    ],

    [chapters]

  );

      return (
    <>
      <div style={pageStyle}>

        <FoundationManagementHeader
          showBackButton
          onBack={onBack}
          title="📖 Chapters"
          subtitle="Manage chapters available within each subject. Chapters organize the syllabus before Topics and Sub Topics."
          badge="Foundation"
        />

        <FoundationStatisticsRow
          statistics={statistics}
        />

        <FoundationToolbar
          searchPlaceholder="Search chapters..."
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
          primaryActionLabel="+ Add Chapter"
          onPrimaryAction={() => {

            setEditingChapter(
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

            <ChapterDialog
        open={dialogOpen}
        mode={
          editingChapter
            ? "edit"
            : "create"
        }
        chapterRecord={
          editingChapter
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
        sections={
          sections
        }
        subjects={
          subjects
        }
        onClose={() => {

          setDialogOpen(
            false
          );

          setEditingChapter(
            undefined
          );

        }}
        onSubmit={async data => {

          let success =
            false;

          if (
            editingChapter
          ) {

            success =
              await editChapter(
                editingChapter.id,
                data
              );

          } else {

            success =
              await addChapter(
                data
              );

          }

          if (
            success
          ) {

            setDialogOpen(
              false
            );

            setEditingChapter(
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