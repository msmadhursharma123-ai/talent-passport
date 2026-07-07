import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  Subject,
} from "../../../types/subject";

import type {
  Organization,
} from "../../../types/organization";

import type {
  Curriculum,
} from "../../../types/curriculum";

import type {
  Class,
} from "../../../types/class";

import type {
  Section,
} from "../../../types/section";

import {
  getSubjects,
  createSubject,
  updateSubject,
  archiveSubject,
  restoreSubject,
  deleteSubject,
} from "../repository/SubjectRepository";

import {
  getOrganizations,
} from "../repository/OrganizationRepository";

import {
  getCurriculums,
} from "../repository/CurriculumRepository";

import {
  getClasses,
} from "../repository/ClassRepository";

import {
  getSections,
} from "../repository/SectionRepository";

export default function useSubjectViewModel() {

  const [subjects, setSubjects] =
    useState<Subject[]>([]);

  const [
    organizations,
    setOrganizations,
  ] =
    useState<
      Organization[]
    >([]);

  const [
    curriculums,
    setCurriculums,
  ] =
    useState<
      Curriculum[]
    >([]);

  const [classes, setClasses] =
    useState<Class[]>([]);

  const [
    sections,
    setSections,
  ] =
    useState<
      Section[]
    >([]);

  const [loading, setLoading] =
    useState(false);

  /* ============================================================
     LOAD
  ============================================================ */

  const loadSubjects =
    useCallback(async () => {

      setLoading(true);

      try {

        const [
          subjectData,
          organizationData,
          curriculumData,
          classData,
          sectionData,
        ] =
          await Promise.all([
            getSubjects(),
            getOrganizations(),
            getCurriculums(),
            getClasses(),
            getSections(),
          ]);

        setSubjects(
          subjectData
        );

        setOrganizations(
          organizationData
        );

        setCurriculums(
          curriculumData
        );

        setClasses(
          classData
        );

        setSections(
          sectionData
        );

      } finally {

        setLoading(false);

      }

    }, []);

  useEffect(() => {

    loadSubjects();

  }, [loadSubjects]);

  /* ============================================================
     CREATE
  ============================================================ */

  async function addSubject(
    item: Partial<Subject>
  ) {

    const created =
      await createSubject(
        item
      );

    if (!created) {

      return false;

    }

    await loadSubjects();

    return true;

  }

  /* ============================================================
     UPDATE
  ============================================================ */

  async function editSubject(
    id: string,
    updates: Partial<Subject>
  ) {

    const updated =
      await updateSubject(
        id,
        updates
      );

    if (!updated) {

      return false;

    }

    await loadSubjects();

    return true;

  }

  /* ============================================================
     ARCHIVE
  ============================================================ */

  async function archive(
    id: string
  ) {

    const ok =
      await archiveSubject(
        id
      );

    if (!ok) {

      return false;

    }

    await loadSubjects();

    return true;

  }

  /* ============================================================
     RESTORE
  ============================================================ */

  async function restore(
    id: string
  ) {

    const ok =
      await restoreSubject(
        id
      );

    if (!ok) {

      return false;

    }

    await loadSubjects();

    return true;

  }

  /* ============================================================
     DELETE
  ============================================================ */

  async function remove(
    id: string
  ) {

    const ok =
      await deleteSubject(
        id
      );

    if (!ok) {

      return false;

    }

    await loadSubjects();

    return true;

  }

  /* ============================================================
     RETURN
  ============================================================ */

  return {

    subjects,

    organizations,

    curriculums,

    classes,

    sections,

    loading,

    reload:
      loadSubjects,

    addSubject,

    editSubject,

    archive,

    restore,

    remove,

  };

}