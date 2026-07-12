import React from "react";

import UserRegistryToolbar from "../registry/UserRegistryToolbar";
import UserRegistryKPIs from "../registry/UserRegistryKPIs";
import UserRegistryTable from "../registry/UserRegistryTable";
import UserRegistryFilters from "../registry/UserRegistryFilters";
import CreateTeacherDialog
from "../dialogs/CreateTeacherDialog";

import EditUserDialog
from "../dialogs/EditUserDialog";

import DeleteUserDialog
from "../dialogs/DeleteUserDialog";

import ResetPasswordDialog
from "../dialogs/ResetPasswordDialog";

import useUserRegistryViewModel
from "../viewmodels/UserRegistryViewModel";

import UserBulkActionBar from "../registry/UserBulkActionBar";


import UserDetailsDrawer from "../dialogs/UserDetailsDrawer";


// import UserRegistryEmptyState from "../registry/UserRegistryEmptyState";

export default function UniversalUserRegistry() {

  /* ======================================================
   UNIVERSAL USER REGISTRY

   Presentation Layer

   Business Logic:
   UserRegistryViewModel

   Data:
   PlatformAdministrationService

====================================================== */

  // Later this will come from ViewModel
const {

  /* DATA */

  filteredUsers,

  loading,

  error,

  statistics,

  availableRoles,

  availableOrganizations,

  /* SEARCH */

  search,

  setSearch,

  /* FILTERS */

  roleFilter,

  setRoleFilter,

  statusFilter,

  setStatusFilter,

  organizationFilter,

  setOrganizationFilter,

  clearFilters,

  /* SELECTION */

  selectedUserIds,

  selectedUsers,

  toggleSelection,

  clearSelection,

  /* DRAWER */

  selectedUser,

  drawerOpen,

  openDrawer,

  closeDrawer,

  /* COMMANDS */

  suspendUser,

  activateUser,

  archiveUser,

  bulkActivate,

  bulkSuspend,

  bulkArchive,

  /* REFRESH */

  refresh,

  /* DIALOGS */

  createUserDialogOpen,

  openCreateUserDialog,

  closeCreateUserDialog,

  editUserDialogOpen,

  openEditUserDialog,

  closeEditUserDialog,

  deleteUserDialogOpen,

  openDeleteUserDialog,

  closeDeleteUserDialog,

  resetPasswordDialogOpen,

  openResetPasswordDialog,

  closeResetPasswordDialog,

} = useUserRegistryViewModel();


  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>
            Universal User Registry
          </h1>

          <p style={subtitleStyle}>
            Manage every student, teacher, school administrator,
            partner, parent and platform administrator from one place.
          </p>
        </div>
      </header>

{/* ======================================================
    TOOLBAR
====================================================== */}

 <UserRegistryToolbar

    search={search}

    onSearchChange={setSearch}

onCreateUser={openCreateUserDialog}
/>

{/* ======================================================
    FILTERS
====================================================== */}


<UserRegistryFilters
    roles={availableRoles}
    organizations={availableOrganizations}
    role={roleFilter}
    status={statusFilter}
    organization={organizationFilter}
    onRoleChange={setRoleFilter}
    onStatusChange={setStatusFilter}
    onOrganizationChange={setOrganizationFilter}
    onClear={clearFilters}
/>

{/* ======================================================
    BULK ACTIONS
====================================================== */}

<UserBulkActionBar
    selectedCount={selectedUsers.length}
    loading={loading}
    onActivate={bulkActivate}
    onSuspend={bulkSuspend}
    onArchive={bulkArchive}
    onDelete={() => {
      console.log("Bulk Delete - Coming Soon");
    }}
    onClearSelection={clearSelection}
/>

{/* ======================================================
    KPIs
====================================================== */}

<UserRegistryKPIs

    totalUsers={statistics?.totalUsers ?? 0}

    activeUsers={statistics?.activeUsers ?? 0}

    suspendedUsers={statistics?.suspendedUsers ?? 0}

    archivedUsers={statistics?.archivedUsers ?? 0}

    selectedUsers={selectedUserIds.length}

/>

{/* ======================================================
    CONTENT
====================================================== */}

{loading && (

  <div
    style={{
      padding: 48,
      textAlign: "center",
    }}
  >
    Loading Universal User Registry...
  </div>

)}

{!loading && error && (

  <div
    style={{
      padding: 48,
      color: "#DC2626",
    }}
  >
    {error}
  </div>

)}

{!loading && !error && filteredUsers.length === 0 && (

  <div
    style={{
      padding: 48,
      textAlign: "center",
      color: "#64748B",
    }}
  >
    No users matched your search.
  </div>

)}

{!loading && !error && filteredUsers.length > 0 && (

  <UserRegistryTable
    users={filteredUsers}
    selectedUserIds={selectedUserIds}
    onToggleSelection={toggleSelection}
    onView={openDrawer}
    onEdit={(user) => {
      console.log("Edit User", user);
    }}
    onMore={(user) => {
      console.log("Open User Menu", user);
    }}
  />

)}


{/* ======================================================
    DIALOGS
====================================================== */}

<CreateTeacherDialog

    open={createUserDialogOpen}

    onClose={async () => {

      closeCreateUserDialog();

      await refresh();

    }}
/>

<EditUserDialog

  open={editUserDialogOpen}

  user={selectedUser}

  loading={loading}

  onClose={closeEditUserDialog}

  onSave={async () => {

    closeEditUserDialog();

    await refresh();

  }}

/>

<DeleteUserDialog

  open={deleteUserDialogOpen}

  user={selectedUser}

  loading={loading}

  onClose={closeDeleteUserDialog}

  onDelete={async () => {

    closeDeleteUserDialog();

    await refresh();

  }}

/>

<ResetPasswordDialog

  open={resetPasswordDialogOpen}

  user={selectedUser}

  loading={loading}

  onClose={closeResetPasswordDialog}

  onReset={async () => {

    closeResetPasswordDialog();

    await refresh();

  }}

/>

{/* ======================================================
    DRAWER
====================================================== */}

<UserDetailsDrawer
  open={drawerOpen}
  user={selectedUser}
 onClose={closeDrawer}

onSuspend={suspendUser}

onActivate={activateUser}

onArchive={archiveUser}

onEdit={openEditUserDialog}

onDelete={openDeleteUserDialog}

onResetPassword={openResetPasswordDialog}
/>

    </div>
  );
}

/* ===================================================== */

const pageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "28px",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "32px",
  fontWeight: 800,
  color: "#143B73",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#64748B",
  fontSize: "15px",
};