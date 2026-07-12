import { useCallback, useEffect, useMemo, useState } from "react";

import { PlatformAdministrationService }
from "../services/platformAdministrationService";

import { PlatformUser }
from "../types/platformUser";

export interface UserRegistryViewModel {

  users: PlatformUser[];

  filteredUsers: PlatformUser[];

  loading: boolean;

  error: string | null;

  refresh: () => Promise<void>;

statistics: any;

availableRoles: string[];

availableOrganizations: string[];

  search: string;

  setSearch: React.Dispatch<
    React.SetStateAction<string>
  >;

  roleFilter: string;

  setRoleFilter: React.Dispatch<
    React.SetStateAction<string>
  >;

  statusFilter: string;

  setStatusFilter: React.Dispatch<
    React.SetStateAction<string>
  >;

  organizationFilter: string;

  setOrganizationFilter: React.Dispatch<
    React.SetStateAction<string>
  >;

  clearFilters: () => void;

  selectedUserIds: string[];

  selectedUsers: PlatformUser[];

selectedUser: PlatformUser | null;

drawerOpen: boolean;

openDrawer: (
  user: PlatformUser,
) => void;

closeDrawer: () => void;

/* ======================================================
   DIALOGS
====================================================== */

createUserDialogOpen: boolean;

openCreateUserDialog: () => void;

closeCreateUserDialog: () => void;

editUserDialogOpen: boolean;

openEditUserDialog: () => void;

closeEditUserDialog: () => void;

deleteUserDialogOpen: boolean;

openDeleteUserDialog: () => void;

closeDeleteUserDialog: () => void;

resetPasswordDialogOpen: boolean;

openResetPasswordDialog: () => void;

closeResetPasswordDialog: () => void;

suspendUser: () => Promise<void>;

activateUser: () => Promise<void>;

archiveUser: () => Promise<void>;

  isSelected: (
    id: string,
  ) => boolean;

  toggleSelection: (
    id: string,
  ) => void;

  selectAll: () => void;

  clearSelection: () => void;

/* ======================================================
   SORTING
====================================================== */

sortField: keyof PlatformUser;

sortDirection: "asc" | "desc";

changeSorting: (
  field: keyof PlatformUser,
) => void;

/* ======================================================
   PAGINATION
====================================================== */

currentPage: number;

rowsPerPage: number;

setRowsPerPage: React.Dispatch<
  React.SetStateAction<number>
>;

totalPages: number;

nextPage: () => void;

previousPage: () => void;

goToPage: (
  page: number,
) => void;

/* ======================================================
   BULK COMMANDS
====================================================== */

bulkActivate: () => Promise<void>;

bulkSuspend: () => Promise<void>;

bulkArchive: () => Promise<void>;

/* ======================================================
   EXPORT
====================================================== */

exportUsers: () => Promise<any>;

  allSelected: boolean;

}

export default function useUserRegistryViewModel():

UserRegistryViewModel {

  const [

    users,

    setUsers,

  ] = useState<PlatformUser[]>([]);

  const [

    loading,

    setLoading,

  ] = useState(true);

  const [

    error,

    setError,

  ] = useState<string | null>(null);

  

/* ======================================================
   SUPPORTING DATA
====================================================== */

const [
  statistics,
  setStatistics,
] = useState<{
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  archivedUsers: number;
  pendingUsers: number;
} | null>(null);

const [
  availableRoles,
  setAvailableRoles,
] = useState<string[]>([]);

const [
  availableOrganizations,
  setAvailableOrganizations,
] = useState<string[]>([]);

/* ======================================================
   DRAWER
====================================================== */

const [
  selectedUser,
  setSelectedUser,
] = useState<PlatformUser | null>(null);

const [
  drawerOpen,
  setDrawerOpen,
] = useState(false);

/* ======================================================
   DIALOGS
====================================================== */

const [
  createUserDialogOpen,
  setCreateUserDialogOpen,
] = useState(false);

const [
  editUserDialogOpen,
  setEditUserDialogOpen,
] = useState(false);

const [
  deleteUserDialogOpen,
  setDeleteUserDialogOpen,
] = useState(false);

const [
  resetPasswordDialogOpen,
  setResetPasswordDialogOpen,
] = useState(false);

const refresh = useCallback(

  async () => {

    try {

      setLoading(true);

      setError(null);

      const [

        users,

        stats,

        roles,

        organizations,

      ] = await Promise.all([

        PlatformAdministrationService.loadUsers(),

        PlatformAdministrationService.getStatistics(),

        PlatformAdministrationService.getRoles(),

        PlatformAdministrationService.getOrganizations(),

      ]);

      setUsers(users);

      setStatistics(stats);

      setAvailableRoles(roles);

     setAvailableOrganizations(

  organizations.filter(

    (organization): organization is string =>

      Boolean(organization),

  ),

);

    } catch (err: any) {

      console.error(err);

      setError(

        err?.message ??

        "Failed to load users.",

      );

    } finally {

      setLoading(false);

    }

  },

  [],

);

  useEffect(() => {

    refresh();

  }, [

    refresh,

  ]);

  const filteredUsers =

    useMemo(() => {

      return users;

    }, [

      users,

    ]);

      const [

    search,

    setSearch,

  ] = useState("");

  const searchedUsers =

    useMemo(() => {

      if (!search.trim()) {

        return filteredUsers;

      }

      const query =

        search.toLowerCase();

      return filteredUsers.filter(

        (user) =>

          user.name

            .toLowerCase()

            .includes(query) ||

          user.email

            .toLowerCase()

            .includes(query) ||

          (user.organization ?? "")

            .toLowerCase()

            .includes(query) ||

          user.role

            .toLowerCase()

            .includes(query),

      );

    }, [

      filteredUsers,

      search,

    ]);

      const [

    roleFilter,

    setRoleFilter,

  ] = useState("");

  const [

    statusFilter,

    setStatusFilter,

  ] = useState("");

  const [

    organizationFilter,

    setOrganizationFilter,

  ] = useState("");

  const visibleUsers =

    useMemo(() => {

      return searchedUsers.filter(

        (user) => {

          const matchesRole =

            !roleFilter ||

            user.role === roleFilter;

          const matchesStatus =

            !statusFilter ||

            user.status === statusFilter;

          const matchesOrganization =

            !organizationFilter ||

            user.organization ===

            organizationFilter;

          return (

            matchesRole &&

            matchesStatus &&

            matchesOrganization

          );

        },

      );

    }, [

      searchedUsers,

      roleFilter,

      statusFilter,

      organizationFilter,

    ]);

const clearFilters = useCallback(() => {

  setSearch("");

  setRoleFilter("");

  setStatusFilter("");

  setOrganizationFilter("");

}, []);

    const [

    selectedUserIds,

    setSelectedUserIds,

  ] = useState<string[]>([]);

  const isSelected =

    useCallback(

      (id: string) => {

        return selectedUserIds.includes(id);

      },

      [selectedUserIds],

    );

  const toggleSelection =

    useCallback(

      (id: string) => {

        setSelectedUserIds(

          (previous) =>

            previous.includes(id)

              ? previous.filter(

                  (item) =>

                    item !== id,

                )

              : [

                  ...previous,

                  id,

                ],

        );

      },

      [],

    );

  const clearSelection =

    useCallback(() => {

      setSelectedUserIds([]);

    }, []);

/* ======================================================
   DRAWER COMMANDS
====================================================== */

const openDrawer = useCallback(

  (user: PlatformUser) => {

    setSelectedUser(user);

    setDrawerOpen(true);

  },

  [],

);

const closeDrawer = useCallback(() => {

  setSelectedUser(null);

  setDrawerOpen(false);

}, []);

/* ======================================================
   DIALOG COMMANDS
====================================================== */

const openCreateUserDialog = useCallback(() => {

  setCreateUserDialogOpen(true);

}, []);

const closeCreateUserDialog = useCallback(() => {

  setCreateUserDialogOpen(false);

}, []);

const openEditUserDialog = useCallback(() => {

  setEditUserDialogOpen(true);

}, []);

const closeEditUserDialog = useCallback(() => {

  setEditUserDialogOpen(false);

}, []);

const openDeleteUserDialog = useCallback(() => {

  setDeleteUserDialogOpen(true);

}, []);

const closeDeleteUserDialog = useCallback(() => {

  setDeleteUserDialogOpen(false);

}, []);

const openResetPasswordDialog = useCallback(() => {

  setResetPasswordDialogOpen(true);

}, []);

const closeResetPasswordDialog = useCallback(() => {

  setResetPasswordDialogOpen(false);

}, []);



/* ======================================================
   USER COMMANDS
====================================================== */

const suspendUser = useCallback(

  async () => {

    if (!selectedUser) {

      return;

    }

    await PlatformAdministrationService.suspendUser(

      selectedUser.id,

    );

    await refresh();

    closeDrawer();

  },

  [

    selectedUser,

    refresh,

    closeDrawer,

  ],

);

const activateUser = useCallback(

  async () => {

    if (!selectedUser) {

      return;

    }

    await PlatformAdministrationService.activateUser(

      selectedUser.id,

    );

    await refresh();

    closeDrawer();

  },

  [

    selectedUser,

    refresh,

    closeDrawer,

  ],

);

const archiveUser = useCallback(

  async () => {

    if (!selectedUser) {

      return;

    }

    await PlatformAdministrationService.archiveUser(

      selectedUser.id,

    );

    await refresh();

    closeDrawer();

  },

  [

    selectedUser,

    refresh,

    closeDrawer,

  ],

);

  const selectAll =

    useCallback(() => {

      setSelectedUserIds(

        visibleUsers.map(

          (user) => user.id,

        ),

      );

    }, [

      visibleUsers,

    ]);

  const allSelected =

    visibleUsers.length > 0 &&

    selectedUserIds.length ===

      visibleUsers.length;

  const selectedUsers =

    useMemo(() => {

      return visibleUsers.filter(

        (user) =>

          selectedUserIds.includes(

            user.id,

          ),

      );

    }, [

      visibleUsers,

      selectedUserIds,

    ]);

/* ======================================================
   SORTING
====================================================== */

const [

  sortField,

  setSortField,

] = useState<keyof PlatformUser>("name");

const [

  sortDirection,

  setSortDirection,

] = useState<"asc" | "desc">("asc");

const sortedUsers = useMemo(() => {

  const items = [...visibleUsers];

  items.sort((a, b) => {

    const left = String(a[sortField] ?? "");

    const right = String(b[sortField] ?? "");

    const comparison = left.localeCompare(right);

    return sortDirection === "asc"

      ? comparison

      : -comparison;

  });

  return items;

}, [

  selectedUsers,

  sortField,

  sortDirection,

]);

const changeSorting = useCallback(

  (field: keyof PlatformUser) => {

    if (field === sortField) {

      setSortDirection(previous =>

        previous === "asc"

          ? "desc"

          : "asc",

      );

      return;

    }

    setSortField(field);

    setSortDirection("asc");

  },

  [

    sortField,

  ],

);

/* ======================================================
   PAGINATION
====================================================== */

const [

  currentPage,

  setCurrentPage,

] = useState(1);

const [

  rowsPerPage,

  setRowsPerPage,

] = useState(25);

const totalPages = Math.max(

  1,

  Math.ceil(

    sortedUsers.length /

    rowsPerPage,

  ),

);

const pagedUsers = useMemo(() => {

  const start =

    (currentPage - 1) *

    rowsPerPage;

  return sortedUsers.slice(

    start,

    start + rowsPerPage,

  );

}, [

  sortedUsers,

  currentPage,

  rowsPerPage,

]);

const nextPage = useCallback(() => {

  setCurrentPage(

    page =>

      Math.min(

        page + 1,

        totalPages,

      ),

  );

}, [

  totalPages,

]);

const previousPage = useCallback(() => {

  setCurrentPage(

    page =>

      Math.max(

        1,

        page - 1,

      ),

  );

}, []);

const goToPage = useCallback(

  (page: number) => {

    setCurrentPage(

      Math.min(

        Math.max(page, 1),

        totalPages,

      ),

    );

  },

  [

    totalPages,

  ],

);

/* ======================================================
   BULK COMMANDS
====================================================== */

const bulkActivate = useCallback(

  async () => {

    if (!selectedUsers.length) {

      return;

    }

    const grouped = new Map<string, string[]>();

    selectedUsers.forEach(user => {

      const ids =

        grouped.get(user.role) ?? [];

      ids.push(user.id);

      grouped.set(

        user.role,

        ids,

      );

    });

    for (const [

      role,

      ids,

    ] of grouped) {

      await PlatformAdministrationService.bulkActivate(

        role as any,

        ids,

      );

    }

    await refresh();

    clearSelection();

  },

  [

    selectedUsers,

    refresh,

    clearSelection,

  ],

);

const bulkSuspend = useCallback(

  async () => {

    if (!selectedUsers.length) {

      return;

    }

    const grouped = new Map<string, string[]>();

    selectedUsers.forEach(user => {

      const ids =

        grouped.get(user.role) ?? [];

      ids.push(user.id);

      grouped.set(

        user.role,

        ids,

      );

    });

    for (const [

      role,

      ids,

    ] of grouped) {

      await PlatformAdministrationService.bulkSuspend(

        role as any,

        ids,

      );

    }

    await refresh();

    clearSelection();

  },

  [

    selectedUsers,

    refresh,

    clearSelection,

  ],

);

const bulkArchive = useCallback(

  async () => {

    if (!selectedUsers.length) {

      return;

    }

    const grouped = new Map<string, string[]>();

    selectedUsers.forEach(user => {

      const ids =

        grouped.get(user.role) ?? [];

      ids.push(user.id);

      grouped.set(

        user.role,

        ids,

      );

    });

    for (const [

      role,

      ids,

    ] of grouped) {

      await PlatformAdministrationService.bulkArchive(

        role as any,

        ids,

      );

    }

    await refresh();

    clearSelection();

  },

  [

    selectedUsers,

    refresh,

    clearSelection,

  ],

);

/* ======================================================
   EXPORT
====================================================== */

const exportUsers = useCallback(

  async () => {

    return PlatformAdministrationService.exportUsers();

  },

  [],

);

     return {

  /* ======================================================
     DATA
  ====================================================== */

  users,

  filteredUsers: pagedUsers,

  loading,

  error,

  statistics,

  availableRoles,

  availableOrganizations,

  /* ======================================================
     REFRESH
  ====================================================== */

  refresh,

  /* ======================================================
     SEARCH
  ====================================================== */

  search,

  setSearch,

  /* ======================================================
     FILTERS
  ====================================================== */

  roleFilter,

  setRoleFilter,

  statusFilter,

  setStatusFilter,

  organizationFilter,

  setOrganizationFilter,

  clearFilters,

  /* ======================================================
     SORTING
  ====================================================== */

  sortField,

  sortDirection,

  changeSorting,

  /* ======================================================
     PAGINATION
  ====================================================== */

  currentPage,

  rowsPerPage,

  setRowsPerPage,

  totalPages,

  nextPage,

  previousPage,

  goToPage,

  /* ======================================================
     SELECTION
  ====================================================== */

  selectedUserIds,

  selectedUsers,

  allSelected,

  isSelected,

  toggleSelection,

  selectAll,

  clearSelection,

  /* ======================================================
     DRAWER
  ====================================================== */

  selectedUser,

  drawerOpen,

  openDrawer,

  closeDrawer,

  /* ======================================================
   DIALOGS
====================================================== */

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

  /* ======================================================
     USER COMMANDS
  ====================================================== */

  suspendUser,

  activateUser,

  archiveUser,

  /* ======================================================
     BULK COMMANDS
  ====================================================== */

  bulkActivate,

  bulkSuspend,

  bulkArchive,

  /* ======================================================
     EXPORT
  ====================================================== */

  exportUsers,

};
}