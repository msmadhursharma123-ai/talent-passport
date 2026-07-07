import { useEffect, useState } from "react";

import type { Curriculum } from "../../../types/curriculum";

import {
  getCurriculums,
  createCurriculum,
  updateCurriculum,
  archiveCurriculum,
  restoreCurriculum,
  deleteCurriculum,
} from "../repository/CurriculumRepository";

export function useCurriculumViewModel() {
  const [curriculums, setCurriculums] =
    useState<Curriculum[]>([]);

  const [loading, setLoading] =
    useState(false);

  async function loadCurriculums() {
    setLoading(true);

    try {
      const data =
        await getCurriculums();

      setCurriculums(data);
    } finally {
      setLoading(false);
    }
  }

  async function create(
    curriculum: Partial<Curriculum>
  ) {
    const created =
      await createCurriculum(
        curriculum
      );

    if (created) {
      await loadCurriculums();
    }

    return created;
  }

  async function update(
    curriculumId: string,
    updates: Partial<Curriculum>
  ) {
    const updated =
      await updateCurriculum(
        curriculumId,
        updates
      );

    if (updated) {
      await loadCurriculums();
    }

    return updated;
  }

  async function archive(
    curriculumId: string
  ) {
    const success =
      await archiveCurriculum(
        curriculumId
      );

    if (success) {
      await loadCurriculums();
    }

    return success;
  }

  async function restore(
    curriculumId: string
  ) {
    const success =
      await restoreCurriculum(
        curriculumId
      );

    if (success) {
      await loadCurriculums();
    }

    return success;
  }

  async function remove(
    curriculumId: string
  ) {
    const success =
      await deleteCurriculum(
        curriculumId
      );

    if (success) {
      await loadCurriculums();
    }

    return success;
  }

  useEffect(() => {
    loadCurriculums();
  }, []);

  return {
    curriculums,

    loading,

    refresh:
      loadCurriculums,

    create,

    update,

    archive,

    restore,

    remove,
  };
}