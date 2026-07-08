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

import TopicDialog
from "../components/dialogs/TopicDialog";

import type {
  Topic,
} from "../../../types/topic";

import useTopicViewModel
from "../viewmodels/TopicViewModel";

interface TopicsHubProps {
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
    key: "topic",
    label: "Topic",
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
    key: "status",
    label: "Status",
  },
];

export default function TopicsHub({
  onBack,
}: TopicsHubProps) {

  const [
    dialogOpen,
    setDialogOpen,
  ] =
    useState(false);

  const [
    editingTopic,
    setEditingTopic,
  ] =
    useState<
      Topic | undefined
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

    topics,

    organizations,

    curriculums,

    classes,

    sections,

    subjects,

    chapters,

    loading,

    addTopic,

    editTopic,

    archive,

    restore,

    remove,

  } =
    useTopicViewModel();

  const statistics:
    FoundationStatistic[] =
    useMemo(() => {

      const active =
        topics.filter(
          item =>
            item.isActive
        ).length;

      const archived =
        topics.filter(
          item =>
            !item.isActive
        ).length;

      return [

        {
          title:
            "Topics",

          value:
            topics.length,

          subtitle:
            "Registered",
        },

        {
          title:
            "Active",

          value:
            active,

          subtitle:
            "Topics",
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

      topics,

      loading,

    ]);

  const filteredTopics =
    useMemo(() => {

      return topics.filter(
        item => {

          const searchMatch =

            search === "" ||

            item.topicName
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            item.topicCode
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

      topics,

      search,

      selectedStatus,

      selectedOrganization,

    ]);

      const rows: FoundationTableRow[] =
    useMemo(
      () =>
        filteredTopics.map(
          topic => ({
            id: topic.id,

            values: {
              topic:
                topic.topicName,

              code:
                topic.topicCode,

              organization:
                topic.organizationName,

              curriculum:
                topic.curriculumName,

              class:
                topic.className,

              section:
                topic.sectionName,

              subject:
                topic.subjectName,

              chapter:
                topic.chapterName,

              status:
                topic.isActive
                  ? "Active"
                  : "Archived",
            },
          })
        ),
      [filteredTopics]
    );

  const actions:
    FoundationTableAction[] = [
    {
      label: "Edit",

      variant: "primary",

      onClick: row => {

        const record =
          topics.find(
            item =>
              item.id ===
              row.id
          );

        if (!record) {
          return;
        }

        setEditingTopic(
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
            topics.find(
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
              "Are you sure you want to permanently delete this topic?"
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

            topics
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

      [topics]

    );

      return (
    <>
      <div style={pageStyle}>

        <FoundationManagementHeader
          showBackButton
          onBack={onBack}
          title="📝 Topics"
          subtitle="Manage topics available within each chapter. Topics become the learning units for Sub Topics, assessments and lesson planning."
          badge="Foundation"
        />

        <FoundationStatisticsRow
          statistics={statistics}
        />

        <FoundationToolbar
          searchPlaceholder="Search topics..."
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
          primaryActionLabel="+ Add Topic"
          onPrimaryAction={() => {

            setEditingTopic(
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

            <TopicDialog
        open={dialogOpen}
        mode={
          editingTopic
            ? "edit"
            : "create"
        }
        topicRecord={
          editingTopic
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
        onClose={() => {

          setDialogOpen(
            false
          );

          setEditingTopic(
            undefined
          );

        }}
        onSubmit={async data => {

          let success =
            false;

          if (
            editingTopic
          ) {

            success =
              await editTopic(
                editingTopic.id,
                data
              );

          } else {

            success =
              await addTopic(
                data
              );

          }

          if (
            success
          ) {

            setDialogOpen(
              false
            );

            setEditingTopic(
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