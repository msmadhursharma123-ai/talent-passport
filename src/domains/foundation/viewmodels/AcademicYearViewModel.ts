import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type { AcademicYear } from "../../../types/academicYear";

import {
  getAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  archiveAcademicYear,
  restoreAcademicYear,
  deleteAcademicYear,
} from "../repository/AcademicYearRepository";

export function useAcademicYearViewModel() {
  const [academicYears, setAcademicYears] =
    useState<AcademicYear[]>([]);

  const [loading, setLoading] =
    useState(true);

  const loadAcademicYears =
    useCallback(async () => {
      setLoading(true);

      const data =
        await getAcademicYears();

      setAcademicYears(data);

      setLoading(false);
    }, []);

  useEffect(() => {
    loadAcademicYears();
  }, [loadAcademicYears]);

  async function addAcademicYear(
    academicYear: Partial<AcademicYear>
  ) {
    const created =
      await createAcademicYear(
        academicYear
      );

    if (created) {
      await loadAcademicYears();
    }

    return created;
  }

  async function editAcademicYear(
    academicYearId: string,
    updates: Partial<AcademicYear>
  ) {
    const updated =
      await updateAcademicYear(
        academicYearId,
        updates
      );

    if (updated) {
      await loadAcademicYears();
    }

    return updated;
  }

  async function archive(
    academicYearId: string
  ) {
    const success =
      await archiveAcademicYear(
        academicYearId
      );

    if (success) {
      await loadAcademicYears();
    }
  }

  async function restore(
    academicYearId: string
  ) {
    const success =
      await restoreAcademicYear(
        academicYearId
      );

    if (success) {
      await loadAcademicYears();
    }
  }

  async function remove(
    academicYearId: string
  ) {
    const success =
      await deleteAcademicYear(
        academicYearId
      );

    if (success) {
      await loadAcademicYears();
    }
  }

  return {
    academicYears,

    loading,

    refresh:
      loadAcademicYears,

    addAcademicYear,

    editAcademicYear,

    archive,

    restore,

    remove,
  };
}