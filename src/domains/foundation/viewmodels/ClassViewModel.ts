import { useCallback, useEffect, useState } from "react";

import type { Class } from "../../../types/class";

import {
  archiveClass,
  createClass,
  deleteClass,
  getClasses,
  restoreClass,
  updateClass,
} from "../repository/ClassRepository";

export function useClassViewModel() {

  const [classes, setClasses] =
    useState<Class[]>([]);

  const [loading, setLoading] =
    useState(false);

  /* ============================================================
     LOAD
  ============================================================ */

  const loadClasses =
    useCallback(async () => {

      setLoading(true);

      try {

        const data =
          await getClasses();

        setClasses(data);

      } finally {

        setLoading(false);

      }

    }, []);

  useEffect(() => {

    loadClasses();

  }, [loadClasses]);

  /* ============================================================
     CREATE
  ============================================================ */

  async function addClass(
    item: Partial<Class>
  ) {

    const created =
      await createClass(item);

    if (!created) {

      return false;

    }

    await loadClasses();

    return true;

  }

  /* ============================================================
     UPDATE
  ============================================================ */

  async function editClass(
    id: string,
    updates: Partial<Class>
  ) {

    const updated =
      await updateClass(
        id,
        updates
      );

    if (!updated) {

      return false;

    }

    await loadClasses();

    return true;

  }

  /* ============================================================
     ARCHIVE
  ============================================================ */

  async function archive(
    id: string
  ) {

    const ok =
      await archiveClass(id);

    if (!ok) {

      return false;

    }

    await loadClasses();

    return true;

  }

  /* ============================================================
     RESTORE
  ============================================================ */

  async function restore(
    id: string
  ) {

    const ok =
      await restoreClass(id);

    if (!ok) {

      return false;

    }

    await loadClasses();

    return true;

  }

  /* ============================================================
     DELETE
  ============================================================ */

  async function remove(
    id: string
  ) {

    const ok =
      await deleteClass(id);

    if (!ok) {

      return false;

    }

    await loadClasses();

    return true;

  }

  return {

    classes,

    loading,

    reload: loadClasses,

    addClass,

    editClass,

    archive,

    restore,

    remove,

  };

}