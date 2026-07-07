import React, { useMemo, useState } from "react";

import FoundationManagementHeader from "../components/management/FoundationManagementHeader";

import FoundationStatisticsRow, {
  type FoundationStatistic,
} from "../components/management/FoundationStatisticsRow";

import FoundationToolbar, {
  type FoundationFilter,
} from "../components/management/FoundationToolbar";

import FoundationDataTable, {
  type FoundationTableColumn,
  type FoundationTableRow,
  type FoundationTableAction,
} from "../components/management/FoundationDataTable";
import OrganizationDialog
from "../components/dialogs/OrganizationDialog";

import type { Organization } from "../../../types/organization";
import { useOrganizationViewModel } from "../viewmodels/OrganizationViewModel.ts";

interface OrganizationsHubProps {
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
    label: "Board",
    options: [
      "All",
      "CBSE",
      "ICSE",
      "IB",
      "IGCSE",
      "State",
    ],
  },
];

const columns: FoundationTableColumn[] = [
  {
    key: "organization",
    label: "Organization",
  },
  {
    key: "board",
    label: "Board",
  },
  {
    key: "city",
    label: "City",
  },
  {
    key: "status",
    label: "Status",
  },
];

export default function OrganizationsHub({
  onBack,
}: OrganizationsHubProps) {
  const [dialogOpen, setDialogOpen] =
    useState(false);

const [editingOrganization, setEditingOrganization] =
  useState<Organization | undefined>(undefined);

const [search, setSearch] =
  useState("");

const [selectedStatus, setSelectedStatus] =
  useState("All");

const [selectedBoard, setSelectedBoard] =
  useState("All");

const {
  organizations,
  loading,
  addOrganization,
  editOrganization,
  archive,
  restore,
  remove,
} = useOrganizationViewModel();

  const statistics: FoundationStatistic[] =
    useMemo(() => {
      const active =
        organizations.filter(
          (organization) =>
            organization.isActive
        ).length;

      const archived =
        organizations.filter(
          (organization) =>
            !organization.isActive
        ).length;

      return [
        {
          title: "Organizations",
          value: organizations.length,
          subtitle: "Registered",
        },
        {
          title: "Active",
          value: active,
          subtitle: "Organizations",
        },
        {
          title: "Archived",
          value: archived,
          subtitle: "Inactive",
        },
        {
          title: "Loading",
          value: loading ? "Yes" : "No",
          subtitle: "Repository Status",
        },
      ];
    }, [organizations, loading]);

const filteredOrganizations =
  useMemo(() => {
    return organizations.filter(
      (organization) => {

        const searchMatch =
          search === "" ||

          organization.organizationName
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          organization.organizationCode
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          (
            organization.city ??
            ""
          )
            .toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||

          (
            organization.principalName ??
            ""
          )
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const statusMatch =
          selectedStatus === "All" ||

          (
            selectedStatus === "Active"
              ? organization.isActive
              : !organization.isActive
          );

        const boardMatch =
          selectedBoard === "All" ||

          organization.boardId ===
            selectedBoard;

        return (
          searchMatch &&
          statusMatch &&
          boardMatch
        );
      }
    );
  }, [
    organizations,
    search,
    selectedStatus,
    selectedBoard,
  ]);

const rows: FoundationTableRow[] =
  useMemo(
    () =>
      filteredOrganizations.map(
        (organization) => ({
          id: organization.id,

          values: {
            organization:
              organization.organizationName,

            board:
              organization.boardId ??
              "-",

            city:
              organization.city ??
              "-",

            status:
              organization.isActive
                ? "Active"
                : "Archived",
          },
        })
      ),
    [filteredOrganizations]
  );

  const actions: FoundationTableAction[] = [
  {
    label: "Edit",
    variant: "primary",

    onClick: (row) => {
      const organization =
        organizations.find(
          (item) => item.id === row.id
        );

      if (!organization) {
        return;
      }

      setEditingOrganization(
        organization
      );

      setDialogOpen(true);
    },
  },

  {
    label: "Archive / Restore",

    variant: "secondary",

    onClick: async (row) => {
      const organization =
        organizations.find(
          (item) => item.id === row.id
        );

      if (!organization) {
        return;
      }

      if (organization.isActive) {
        await archive(row.id);
      } else {
        await restore(row.id);
      }
    },
  },

  {
    label: "Delete",

    variant: "danger",

    onClick: async (row) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to permanently delete this organization?"
        );

      if (!confirmed) {
        return;
      }

      await remove(row.id);
    },
  },
];

  return (
    <>
      <div style={pageStyle}>
        <FoundationManagementHeader
          showBackButton
          onBack={onBack}
          title="🏫 Organizations"
          subtitle="Manage schools and future organizations onboarded to the Talent Passport Platform. Organizations become the root entity powering teachers, students, curriculum and the Learning Intelligence Engine."
          badge="Foundation"
        />

        <FoundationStatisticsRow
          statistics={statistics}
        />

     <FoundationToolbar
  searchPlaceholder="Search organizations..."

  searchValue={search}

  onSearchChange={setSearch}

  filters={filters}

  filterValues={[
    selectedStatus,
    selectedBoard,
  ]}

onFilterChange={(
  index: number,
  value: string
) => {

    if (index === 0) {
      setSelectedStatus(value);
    }

    if (index === 1) {
      setSelectedBoard(value);
    }

  }}

  primaryActionLabel="+ Add Organization"

 onPrimaryAction={() => {
  setEditingOrganization(undefined);
  setDialogOpen(true);
}}
/>

        <FoundationDataTable
          columns={columns}
          rows={rows}
          actions={actions}
        />
      </div>

     <OrganizationDialog
  mode={
    editingOrganization
      ? "edit"
      : "create"
  }
  organization={editingOrganization}
  open={dialogOpen}
       onClose={() => {
  setDialogOpen(false);
  setEditingOrganization(undefined);
}}
      onSave={async (
  organization
) => {
  if (
    editingOrganization
  ) {
    await editOrganization(
      editingOrganization.id,
      organization
    );
  } else {
    await addOrganization(
      organization
    );
  }

  setEditingOrganization(undefined);

  setDialogOpen(false);
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