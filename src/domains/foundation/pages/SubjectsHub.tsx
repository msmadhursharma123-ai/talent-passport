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

import SubjectDialog
from "../components/dialogs/SubjectDialog";

import type { Subject }
from "../../../types/subject";

import useSubjectViewModel
from "../viewmodels/SubjectViewModel";

interface SubjectsHubProps {
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
    key: "subject",
    label: "Subject",
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
    key: "status",
    label: "Status",
  },
];

export default function SubjectsHub({
  onBack,
}: SubjectsHubProps) {

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [
    editingSubject,
    setEditingSubject,
  ] =
    useState<
      Subject | undefined
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
    subjects,
    organizations,
    curriculums,
    classes,
    sections,
    loading,
    addSubject,
    editSubject,
    archive,
    restore,
    remove,
  } =
    useSubjectViewModel();

  const statistics:
    FoundationStatistic[] =
    useMemo(() => {

      const active =
        subjects.filter(
          item =>
            item.isActive
        ).length;

      const archived =
        subjects.filter(
          item =>
            !item.isActive
        ).length;

      return [

        {
          title:
            "Subjects",

          value:
            subjects.length,

          subtitle:
            "Registered",
        },

        {
          title:
            "Active",

          value:
            active,

          subtitle:
            "Subjects",
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

      subjects,

      loading,

    ]);

  const filteredSubjects =
    useMemo(() => {

      return subjects.filter(
        item => {

          const searchMatch =

            search === "" ||

            item.subjectName
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||

            item.subjectCode
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

      subjects,

      search,

      selectedStatus,

      selectedOrganization,

    ]);

      const rows: FoundationTableRow[] =
    useMemo(
      () =>
        filteredSubjects.map(
          subject => ({
            id: subject.id,

            values: {
              subject:
                subject.subjectName,

              code:
                subject.subjectCode,

              organization:
                subject.organizationName,

              curriculum:
                subject.curriculumName,

              class:
                subject.className,

              section:
                subject.sectionName,

              status:
                subject.isActive
                  ? "Active"
                  : "Archived",
            },
          })
        ),
      [filteredSubjects]
    );

  const actions:
    FoundationTableAction[] = [
    {
      label: "Edit",

      variant: "primary",

      onClick: row => {

        const record =
          subjects.find(
            item =>
              item.id ===
              row.id
          );

        if (!record) {
          return;
        }

        setEditingSubject(
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
            subjects.find(
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
              "Are you sure you want to permanently delete this subject?"
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

            subjects.map(
              item =>
                item.organizationName
            )

          )

        ),

      ],

      [subjects]

    );

      return (
    <>
      <div className="tp-admin-foundation-page" style={pageStyle}>

        <FoundationManagementHeader
          showBackButton
          onBack={onBack}
          title="📚 Subjects"
          subtitle="Manage subjects available within each section. Subjects become the foundation for timetable, teachers, assessments and learning plans."
          badge="Foundation"
        />

        <FoundationStatisticsRow
          statistics={statistics}
        />

        <FoundationToolbar
          searchPlaceholder="Search subjects..."
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
          primaryActionLabel="+ Add Subject"
          onPrimaryAction={() => {

            setEditingSubject(
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

            <SubjectDialog
        open={dialogOpen}
        mode={
          editingSubject
            ? "edit"
            : "create"
        }
        subjectRecord={
          editingSubject
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
        onClose={() => {

          setDialogOpen(false);

          setEditingSubject(
            undefined
          );

        }}
        onSubmit={async data => {

          let success =
            false;

          if (
            editingSubject
          ) {

            success =
              await editSubject(
                editingSubject.id,
                data
              );

          } else {

            success =
              await addSubject(
                data
              );

          }

          if (
            success
          ) {

            setDialogOpen(
              false
            );

            setEditingSubject(
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