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

import SubTopicDialog
from "../components/dialogs/SubTopicDialog";

import type {
  SubTopic,
} from "../../../types/subTopic";

import useSubTopicViewModel
from "../viewmodels/SubTopicViewModel";

interface SubTopicsHubProps {
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
    key: "subTopic",
    label: "Sub Topic",
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
    key: "chapter",
    label: "Chapter",
  },
  {
    key: "topic",
    label: "Topic",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function SubTopicsHub({
  onBack,
}: SubTopicsHubProps) {

  const [
    dialogOpen,
    setDialogOpen,
  ] =
    useState(false);

  const [
    editingSubTopic,
    setEditingSubTopic,
  ] =
    useState<
      SubTopic | undefined
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

    subTopics,

    organizations,

    curriculums,

    classes,

    sections,

    subjects,

    chapters,

    topics,

    loading,

    addSubTopic,

    editSubTopic,

    archive,

    restore,

    remove,

  } =
    useSubTopicViewModel();

  const statistics:
    FoundationStatistic[] =
    useMemo(() => {

      const active =
        subTopics.filter(
          item =>
            item.isActive
        ).length;

      const archived =
        subTopics.filter(
          item =>
            !item.isActive
        ).length;

      return [

        {
          title:
            "Sub Topics",

          value:
            subTopics.length,

          subtitle:
            "Registered",
        },

        {
          title:
            "Active",

          value:
            active,

          subtitle:
            "Sub Topics",
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

      subTopics,

      loading,

    ]);

  const filteredSubTopics =
    useMemo(() => {

      return subTopics.filter(
        item => {

          const searchMatch =

            search === "" ||

            item.subTopicName
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            item.subTopicCode
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

      subTopics,

      search,

      selectedStatus,

      selectedOrganization,

    ]);

      const rows: FoundationTableRow[] =
    useMemo(
      () =>
        filteredSubTopics.map(
          subTopic => ({
            id: subTopic.id,

            values: {
              subTopic:
                subTopic.subTopicName,

              code:
                subTopic.subTopicCode,

              organization:
                subTopic.organizationName,

              curriculum:
                subTopic.curriculumName,

              class:
                subTopic.className,

              section:
                subTopic.sectionName,

              subject:
                subTopic.subjectName,

              chapter:
                subTopic.chapterName,

              topic:
                subTopic.topicName,

              status:
                subTopic.isActive
                  ? "Active"
                  : "Archived",
            },
          })
        ),
      [filteredSubTopics]
    );

  const actions:
    FoundationTableAction[] = [
    {
      label: "Edit",

      variant: "primary",

      onClick: row => {

        const record =
          subTopics.find(
            item =>
              item.id ===
              row.id
          );

        if (!record) {
          return;
        }

        setEditingSubTopic(
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
            subTopics.find(
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
              "Are you sure you want to permanently delete this sub topic?"
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

            subTopics
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

      [subTopics]

    );

      return (
    <>
      <div style={pageStyle}>

        <FoundationManagementHeader
          showBackButton
          onBack={onBack}
          title="📖 Sub Topics"
          subtitle="Manage sub topics available within each topic. Sub Topics become the smallest learning units used for lesson planning, assessments and AI learning intelligence."
          badge="Foundation"
        />

        <FoundationStatisticsRow
          statistics={statistics}
        />

        <FoundationToolbar
          searchPlaceholder="Search sub topics..."
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
          primaryActionLabel="+ Add Sub Topic"
          onPrimaryAction={() => {

            setEditingSubTopic(
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

            <SubTopicDialog
        open={dialogOpen}
        mode={
          editingSubTopic
            ? "edit"
            : "create"
        }
        subTopicRecord={
          editingSubTopic
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
        chapters={
          chapters
        }
        topics={
          topics
        }
        onClose={() => {

          setDialogOpen(
            false
          );

          setEditingSubTopic(
            undefined
          );

        }}
        onSubmit={async data => {

          let success =
            false;

          if (
            editingSubTopic
          ) {

            success =
              await editSubTopic(
                editingSubTopic.id,
                data
              );

          } else {

            success =
              await addSubTopic(
                data
              );

          }

          if (
            success
          ) {

            setDialogOpen(
              false
            );

            setEditingSubTopic(
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