import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  Topic,
} from "../../../types/topic";

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

import type {
  Chapter,
} from "../../../types/chapter";

import {
  getTopics,
  createTopic,
  updateTopic,
  archiveTopic,
  restoreTopic,
  deleteTopic,
} from "../repository/TopicRepository";

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

import {
  getChapters,
} from "../repository/ChapterRepository";

export default function useTopicViewModel() {

  const [topics, setTopics] =
    useState<Topic[]>([]);

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

  const [
    classes,
    setClasses,
  ] =
    useState<Class[]>([]);

  const [
    sections,
    setSections,
  ] =
    useState<
      Section[]
    >([]);

  const [
    subjects,
    setSubjects,
  ] =
    useState<
      Subject[]
    >([]);

  const [
    chapters,
    setChapters,
  ] =
    useState<
      Chapter[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  /* ============================================================
     LOAD
  ============================================================ */

  const loadTopics =
    useCallback(async () => {

      setLoading(true);

      try {

        const [
          topicData,
          organizationData,
          curriculumData,
          classData,
          sectionData,
          subjectData,
          chapterData,
        ] =
          await Promise.all([

            getTopics(),

            getOrganizations(),

            getCurriculums(),

            getClasses(),

            getSections(),

            getSubjects(),

            getChapters(),

          ]);

        setTopics(
          topicData
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

        setChapters(
          chapterData
        );

      } finally {

        setLoading(false);

      }

    }, []);

  useEffect(() => {

    loadTopics();

  }, [loadTopics]);

  /* ============================================================
     CREATE
  ============================================================ */

  async function addTopic(
    topic: Partial<Topic>
  ) {

    const created =
      await createTopic(
        topic
      );

    if (!created) {
      return false;
    }

    await loadTopics();

    return true;

  }

  /* ============================================================
     UPDATE
  ============================================================ */

  async function editTopic(
    topicId: string,
    updates: Partial<Topic>
  ) {

    const updated =
      await updateTopic(
        topicId,
        updates
      );

    if (!updated) {
      return false;
    }

    await loadTopics();

    return true;

  }

  /* ============================================================
     ARCHIVE
  ============================================================ */

  async function archive(
    topicId: string
  ) {

    const ok =
      await archiveTopic(
        topicId
      );

    if (!ok) {
      return false;
    }

    await loadTopics();

    return true;

  }

  /* ============================================================
     RESTORE
  ============================================================ */

  async function restore(
    topicId: string
  ) {

    const ok =
      await restoreTopic(
        topicId
      );

    if (!ok) {
      return false;
    }

    await loadTopics();

    return true;

  }

  /* ============================================================
     DELETE
  ============================================================ */

  async function remove(
    topicId: string
  ) {

    const ok =
      await deleteTopic(
        topicId
      );

    if (!ok) {
      return false;
    }

    await loadTopics();

    return true;

  }

  /* ============================================================
     RETURN
  ============================================================ */

  return {

    topics,

    organizations,

    curriculums,

    classes,

    sections,

    subjects,

    chapters,

    loading,

    reload:
      loadTopics,

    addTopic,

    editTopic,

    archive,

    restore,

    remove,

  };

}