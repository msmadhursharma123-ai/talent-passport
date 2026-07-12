import { getSupabaseClient } from "../../../supabaseClient";

import {
  PlatformUser,
  UserRole,
} from "../types/platformUser";

import {
  mapPlatformUser,
  mapCreatePayload,
  mapUpdatePayload,
} from "../services/platformAdministrationMapper";

import {
  getRoleConfiguration,
  getTableName,
  getStatusColumn,
  getViewName,
} from "../services/PlatformAdministrationConstants";

/* ==========================================================
   PRIVATE HELPERS
========================================================== */

function getSupabase() {

  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error(
      "Supabase client not initialized.",
    );
  }

  return supabase;

}

function getTable(role: UserRole) {

  return getTableName(role);

}

function getStatusField(role: UserRole) {

  return getStatusColumn(role);

}

function getUsersView() {

  return getViewName();

}

/* ==========================================================
   GENERIC READ ENGINE
========================================================== */

async function executeRead(query: any) {

  const { data, error } = await query;

  if (error) {

    console.error(error);

    throw error;

  }

  return data ?? [];

}

/* ==========================================================
   GENERIC SINGLE READ
========================================================== */

async function executeSingle(query: any) {

  const { data, error } = await query.single();

  if (error) {

    console.error(error);

    throw error;

  }

  return data;

}

/* ==========================================================
   GENERIC UPDATE ENGINE
========================================================== */

async function executeUpdate(

  role: UserRole,

  id: string,

  payload: any,

) {

  const supabase = getSupabase();

  const table = getTable(role);

  const { data, error } = await (supabase as any)

    .from(table)

    .update(payload)

    .eq("id", id)

    .select()

    .single();

  if (error) {

    console.error(error);

    throw error;

  }

  return data;

}

/* ==========================================================
   GENERIC BULK UPDATE ENGINE
========================================================== */

async function executeBulkUpdate(

  role: UserRole,

  ids: string[],

  payload: any,

) {

  const supabase = getSupabase();

  const table = getTable(role);

  const { error } = await (supabase as any)

    .from(table)

    .update(payload)

    .in("id", ids);

  if (error) {

    console.error(error);

    throw error;

  }

}

/* ==========================================================
   GENERIC DELETE ENGINE
========================================================== */

async function executeDelete(

  role: UserRole,

  ids: string[],

) {

  const supabase = getSupabase();

  const table = getTable(role);

  const { error } = await (supabase as any)

    .from(table)

    .delete()

    .in("id", ids);

  if (error) {

    console.error(error);

    throw error;

  }

}

/* ==========================================================
   REPOSITORY
========================================================== */

export const PlatformUserRepository = {

  /* ======================================================
     READ
  ====================================================== */

  async getAll(): Promise<PlatformUser[]> {

    const supabase = getSupabase();

    const rows = await executeRead(

      supabase

        .from(getUsersView())

        .select("*")

        .order("created_at", {

          ascending: false,

        }),

    );

    return rows.map(mapPlatformUser);

  },

  async getById(id: string) {

    const supabase = getSupabase();

    const row = await executeSingle(

      supabase

        .from(getUsersView())

        .select("*")

        .eq("id", id),

    );

    return mapPlatformUser(row);

  },

  async getMany(ids: string[]) {

    const supabase = getSupabase();

    const rows = await executeRead(

      supabase

        .from(getUsersView())

        .select("*")

        .in("id", ids),

    );

    return rows.map(mapPlatformUser);

  },

  async getByRole(role: UserRole) {

    const supabase = getSupabase();

    const rows = await executeRead(

      supabase

        .from(getUsersView())

        .select("*")

        .eq("role", role),

    );

    return rows.map(mapPlatformUser);

  },

  async getByOrganization(

    organizationId: string,

  ) {

    const supabase = getSupabase();

    const rows = await executeRead(

      supabase

        .from(getUsersView())

        .select("*")

        .eq(

          "organization_id",

          organizationId,

        ),

    );

    return rows.map(mapPlatformUser);

  },

  async exists(id: string) {

    const supabase = getSupabase();

    const { count, error } = await supabase

      .from(getUsersView())

      .select("*", {

        count: "exact",

        head: true,

      })

      .eq("id", id);

    if (error) {

      throw error;

    }

    return (count ?? 0) > 0;

  },

  async count() {

    const supabase = getSupabase();

    const { count, error } = await supabase

      .from(getUsersView())

      .select("*", {

        count: "exact",

        head: true,

      });

    if (error) {

      throw error;

    }

    return count ?? 0;

  },

  /* ======================================================
     PART 2 STARTS HERE
  ====================================================== */
  /* ======================================================
     CREATE
  ====================================================== */

  async create(
    role: UserRole,
    form: any,
  ) {

    const supabase = getSupabase();

    const table = getTable(role);

    const payload =
      mapCreatePayload(form);

    const { data, error } = await (supabase as any)

      .from(table)

      .insert(payload)

      .select()

      .single();

    if (error) {

      throw error;

    }

    return mapPlatformUser(data);

  },

  /* ======================================================
     UPDATE
  ====================================================== */

  async update(
    user: PlatformUser,
  ) {

    const payload =
      mapUpdatePayload(user);

    const row =
      await executeUpdate(

        user.role,

        user.id,

        payload,

      );

    return mapPlatformUser(row);

  },

  /* ======================================================
     DELETE
  ====================================================== */

  async delete(
    role: UserRole,
    id: string,
  ) {

    await executeDelete(

      role,

      [id],

    );

  },

  async deleteMany(

    role: UserRole,

    ids: string[],

  ) {

    if (!ids.length) {

      return;

    }

    await executeDelete(

      role,

      ids,

    );

  },

  /* ======================================================
     STATUS
  ====================================================== */

  async activate(
    user: PlatformUser,
  ) {

    const statusColumn =
      getStatusField(
        user.role,
      );

    const row =
      await executeUpdate(

        user.role,

        user.id,

        {

          [statusColumn]:
            "active",

        },

      );

    return mapPlatformUser(row);

  },

  async suspend(
    user: PlatformUser,
  ) {

    const statusColumn =
      getStatusField(
        user.role,
      );

    const row =
      await executeUpdate(

        user.role,

        user.id,

        {

          [statusColumn]:
            "suspended",

        },

      );

    return mapPlatformUser(row);

  },

  async archive(
    user: PlatformUser,
  ) {

    const statusColumn =
      getStatusField(
        user.role,
      );

    const row =
      await executeUpdate(

        user.role,

        user.id,

        {

          [statusColumn]:
            "archived",

        },

      );

    return mapPlatformUser(row);

  },

  /* ======================================================
     BULK STATUS
  ====================================================== */

  async activateMany(

    role: UserRole,

    ids: string[],

  ) {

    await executeBulkUpdate(

      role,

      ids,

      {

        [getStatusField(role)]:
          "active",

      },

    );

  },

  async suspendMany(

    role: UserRole,

    ids: string[],

  ) {

    await executeBulkUpdate(

      role,

      ids,

      {

        [getStatusField(role)]:
          "suspended",

      },

    );

  },

  async archiveMany(

    role: UserRole,

    ids: string[],

  ) {

    await executeBulkUpdate(

      role,

      ids,

      {

        [getStatusField(role)]:
          "archived",

      },

    );

  },

  /* ======================================================
     ASSIGNMENTS
  ====================================================== */

  async assignOrganization(

    user: PlatformUser,

    organizationId: string,

  ) {

    const config =
      getRoleConfiguration(
        user.role,
      );

    const row =
      await executeUpdate(

        user.role,

        user.id,

        {

          [config.organizationColumn]:
            organizationId,

        },

      );

    return mapPlatformUser(row);

  },

  

  async assignSchool(

    user: PlatformUser,

    schoolId: string,

  ) {

    const row =
      await executeUpdate(

        user.role,

        user.id,

        {

          school_id:
            schoolId,

        },

      );

    return mapPlatformUser(row);

  },


  /* ======================================================
     PART 3 STARTS HERE
  ====================================================== */

    /* ======================================================
     DASHBOARD
  ====================================================== */

  async getStatistics() {

    const users =
      await this.getAll();

    return {

      totalUsers:
        users.length,

      activeUsers:
        users.filter(

          x =>
            x.status ===
            "active",

        ).length,

      suspendedUsers:
        users.filter(

          x =>
            x.status ===
            "suspended",

        ).length,

      archivedUsers:
        users.filter(

          x =>
            x.status ===
            "archived",

        ).length,

      pendingUsers:
        users.filter(

          x =>
            x.status ===
            "pending",

        ).length,

    };

  },

  /* ======================================================
     FILTER DATA
  ====================================================== */

  async getOrganizations() {

    const users =
      await this.getAll();

    return [

      ...new Set(

        users

          .map(

            x =>
              x.organization,

          )

          .filter(Boolean),

      ),

    ].sort();

  },

  async getRoles() {

    const users =
      await this.getAll();

    return [

      ...new Set(

        users.map(

          x =>
            x.role,

        ),

      ),

    ].sort();

  },

  /* ======================================================
     EXPORT
  ====================================================== */

  async exportRows() {

    const users =
      await this.getAll();

    return users.map(

      user => ({

        Name:
          user.name,

        Email:
          user.email,

        Phone:
          user.phone ?? "",

        Role:
          user.role,

        Status:
          user.status,

        Organization:
          user.organization ?? "",

        LastLogin:
          user.lastLogin ?? "",

        Created:
          user.createdAt ?? "",

      }),

    );

  },

  /* ======================================================
     REFRESH
  ====================================================== */

  async refresh() {

    return this.getAll();

  },

};

/* ==========================================================
   END OF REPOSITORY
========================================================== */