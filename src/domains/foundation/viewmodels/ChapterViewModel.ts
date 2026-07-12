import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  Chapter,
} from "../../../types/chapter";

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

import type {
  Subject,
} from "../../../types/subject";

import {
  getChapters,
  createChapter,
  updateChapter,
  archiveChapter,
  restoreChapter,
  deleteChapter,
} from "../repository/ChapterRepository";

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

import {
  getSubjects,
} from "../repository/SubjectRepository";

export default function useChapterViewModel() {

  const [chapters, setChapters] =
    useState<Chapter[]>([]);

  const [
    organizations,
    setOrganizations,
  ] =
    useState<Organization[]>([]);

  const [
    curriculums,
    setCurriculums,
  ] =
    useState<Curriculum[]>([]);

  const [
    classes,
    setClasses,
  ] =
    useState<Class[]>([]);

  const [
    sections,
    setSections,
  ] =
    useState<Section[]>([]);

  const [
    subjects,
    setSubjects,
  ] =
    useState<Subject[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  /* ============================================================
     LOAD
  ============================================================ */

  const loadChapters =
    useCallback(async () => {

      setLoading(true);

      try {

        const [
          chapterData,
          organizationData,
          curriculumData,
          classData,
          sectionData,
          subjectData,
        ] =
          await Promise.all([

            getChapters(),

            getOrganizations(),

            getCurriculums(),

            getClasses(),

            getSections(),

            getSubjects(),

          ]);

        setChapters(
          chapterData
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

        setSubjects(
          subjectData
        );

      } finally {

        setLoading(false);

      }

    }, []);

  useEffect(() => {

    loadChapters();

  }, [loadChapters]);

  /* ============================================================
     CREATE
  ============================================================ */

  async function addChapter(
    chapter: Partial<Chapter>
  ) {

    const created =
      await createChapter(
        chapter
      );

    if (!created) {
      return false;
    }

    await loadChapters();

    return true;

  }

  /* ============================================================
     UPDATE
  ============================================================ */

  async function editChapter(
    chapterId: string,
    updates: Partial<Chapter>
  ) {

    const updated =
      await updateChapter(
        chapterId,
        updates
      );

    if (!updated) {
      return false;
    }

    await loadChapters();

    return true;

  }

  /* ============================================================
     ARCHIVE
  ============================================================ */

  async function archive(
    chapterId: string
  ) {

    const ok =
      await archiveChapter(
        chapterId
      );

    if (!ok) {
      return false;
    }

    await loadChapters();

    return true;

  }

  /* ============================================================
     RESTORE
  ============================================================ */

  async function restore(
    chapterId: string
  ) {

    const ok =
      await restoreChapter(
        chapterId
      );

    if (!ok) {
      return false;
    }

    await loadChapters();

    return true;

  }

  /* ============================================================
     DELETE
  ============================================================ */

  async function remove(
    chapterId: string
  ) {

    const ok =
      await deleteChapter(
        chapterId
      );

    if (!ok) {
      return false;
    }

    await loadChapters();

    return true;

  }

  /* ============================================================
     RETURN
  ============================================================ */

  return {

    chapters,

    organizations,

    curriculums,

    classes,

    sections,

    subjects,

    loading,

    reload:
      loadChapters,

    addChapter,

    editChapter,

    archive,

    restore,

    remove,

  };

}