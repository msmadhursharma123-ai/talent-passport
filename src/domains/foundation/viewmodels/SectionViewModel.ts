import { useCallback, useEffect, useState } from "react";

import type { Section } from "../../../types/section";
import type { Organization } from "../../../types/organization";
import type { Curriculum } from "../../../types/curriculum";
import type { Class } from "../../../types/class";

import {
  getSections,
  createSection,
  updateSection,
  archiveSection,
  restoreSection,
  deleteSection,
} from "../repository/SectionRepository";

import {
  getOrganizations,
} from "../repository/OrganizationRepository";

import {
  getCurriculums,
} from "../repository/CurriculumRepository";

import {
  getClasses,
} from "../repository/ClassRepository";

export default function useSectionViewModel() {

  const [sections, setSections] =
    useState<Section[]>([]);

  const [organizations, setOrganizations] =
    useState<Organization[]>([]);

  const [curriculums, setCurriculums] =
    useState<Curriculum[]>([]);

  const [classes, setClasses] =
    useState<Class[]>([]);

  const [loading, setLoading] =
    useState(false);

  /* ============================================================
     LOAD
  ============================================================ */

  const loadSections =
    useCallback(async () => {

      setLoading(true);

      try {

        const [
          sectionData,
          organizationData,
          curriculumData,
          classData,
        ] = await Promise.all([
          getSections(),
          getOrganizations(),
          getCurriculums(),
          getClasses(),
        ]);

        setSections(sectionData);
        setOrganizations(organizationData);
        setCurriculums(curriculumData);
        setClasses(classData);

      } finally {

        setLoading(false);

      }

    }, []);

  useEffect(() => {

    loadSections();

  }, [loadSections]);

  /* ============================================================
     CREATE
  ============================================================ */

  async function addSection(
    item: Partial<Section>
  ) {

    const created =
      await createSection(item);

    if (!created) {

      return false;

    }

    await loadSections();

    return true;

  }

  /* ============================================================
     UPDATE
  ============================================================ */

  async function editSection(
    id: string,
    updates: Partial<Section>
  ) {

    const updated =
      await updateSection(
        id,
        updates
      );

    if (!updated) {

      return false;

    }

    await loadSections();

    return true;

  }

  /* ============================================================
     ARCHIVE
  ============================================================ */

  async function archive(
    id: string
  ) {

    const ok =
      await archiveSection(id);

    if (!ok) {

      return false;

    }

    await loadSections();

    return true;

  }

  /* ============================================================
     RESTORE
  ============================================================ */

  async function restore(
    id: string
  ) {

    const ok =
      await restoreSection(id);

    if (!ok) {

      return false;

    }

    await loadSections();

    return true;

  }

  /* ============================================================
     DELETE
  ============================================================ */

  async function remove(
    id: string
  ) {

    const ok =
      await deleteSection(id);

    if (!ok) {

      return false;

    }

    await loadSections();

    return true;

  }

  /* ============================================================
     RETURN
  ============================================================ */

  return {

    sections,

    organizations,

    curriculums,

    classes,

    loading,

    reload: loadSections,

    addSection,

    editSection,

    archive,

    restore,

    remove,

  };

}