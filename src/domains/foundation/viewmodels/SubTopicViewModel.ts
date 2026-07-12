import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  SubTopic,
} from "../../../types/subTopic";

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

import type {
  Topic,
} from "../../../types/topic";

import {
  getSubTopics,
  createSubTopic,
  updateSubTopic,
  archiveSubTopic,
  restoreSubTopic,
  deleteSubTopic,
} from "../repository/SubTopicRepository";

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

import {
  getTopics,
} from "../repository/TopicRepository";

export default function
useSubTopicViewModel() {

  const [
    subTopics,
    setSubTopics,
  ] =
    useState<SubTopic[]>([]);

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
    topics,
    setTopics,
  ] =
    useState<
      Topic[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  /* ============================================================
     LOAD
  ============================================================ */

  const loadSubTopics =
    useCallback(async () => {

      setLoading(true);

      try {

        const [

          subTopicData,

          organizationData,

          curriculumData,

          classData,

          sectionData,

          subjectData,

          chapterData,

          topicData,

        ] = await Promise.all([

          getSubTopics(),

          getOrganizations(),

          getCurriculums(),

          getClasses(),

          getSections(),

          getSubjects(),

          getChapters(),

          getTopics(),

        ]);

        setSubTopics(
          subTopicData
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

        setTopics(
          topicData
        );

      } finally {

        setLoading(false);

      }

    }, []);

  useEffect(() => {

    loadSubTopics();

  }, [loadSubTopics]);

    /* ============================================================
     CREATE
  ============================================================ */

  async function addSubTopic(
    subTopic: Partial<SubTopic>
  ) {

    const created =
      await createSubTopic(
        subTopic
      );

    if (!created) {
      return false;
    }

    await loadSubTopics();

    return true;

  }

  /* ============================================================
     UPDATE
  ============================================================ */

  async function editSubTopic(
    subTopicId: string,
    updates: Partial<SubTopic>
  ) {

    const updated =
      await updateSubTopic(
        subTopicId,
        updates
      );

    if (!updated) {
      return false;
    }

    await loadSubTopics();

    return true;

  }

  /* ============================================================
     ARCHIVE
  ============================================================ */

  async function archive(
    subTopicId: string
  ) {

    const ok =
      await archiveSubTopic(
        subTopicId
      );

    if (!ok) {
      return false;
    }

    await loadSubTopics();

    return true;

  }

  /* ============================================================
     RESTORE
  ============================================================ */

  async function restore(
    subTopicId: string
  ) {

    const ok =
      await restoreSubTopic(
        subTopicId
      );

    if (!ok) {
      return false;
    }

    await loadSubTopics();

    return true;

  }

  /* ============================================================
     DELETE
  ============================================================ */

  async function remove(
    subTopicId: string
  ) {

    const ok =
      await deleteSubTopic(
        subTopicId
      );

    if (!ok) {
      return false;
    }

    await loadSubTopics();

    return true;

  }

  /* ============================================================
     RETURN
  ============================================================ */

  return {

    subTopics,

    organizations,

    curriculums,

    classes,

    sections,

    subjects,

    chapters,

    topics,

    loading,

    reload:
      loadSubTopics,

    addSubTopic,

    editSubTopic,

    archive,

    restore,

    remove,

  };

}