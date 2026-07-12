import React, {
  useEffect,
  useState,
} from "react";

import type {
  SubTopic,
} from "../../../../types/subTopic";

import type {
  Topic,
} from "../../../../types/topic";

import type {
  Organization,
} from "../../../../types/organization";

import type {
  Curriculum,
} from "../../../../types/curriculum";

import type {
  Class,
} from "../../../../types/class";

import type {
  Section,
} from "../../../../types/section";

import type {
  Subject,
} from "../../../../types/subject";

import type {
  Chapter,
} from "../../../../types/chapter";

import FoundationDialog
from "./FoundationDialog";

import FoundationSelect
from "../../../../features/admin/components/common/FoundationSelect";

export interface SubTopicDialogProps {

  open: boolean;

  mode:
    | "create"
    | "edit";

  subTopicRecord?: SubTopic;

  organizations:
    Organization[];

  curriculums:
    Curriculum[];

  classes:
    Class[];

  sections:
    Section[];

  subjects:
    Subject[];

  chapters:
    Chapter[];

  topics:
    Topic[];

  onClose: () => void;

  onSubmit: (
    data: Partial<SubTopic>
  ) => Promise<boolean>;

}

export default function
SubTopicDialog({

  open,

  mode,

  subTopicRecord,

  organizations,

  curriculums,

  classes,

  sections,

  subjects,

  chapters,

  topics,

  onClose,

  onSubmit,

}: SubTopicDialogProps) {

  const [
    organizationId,
    setOrganizationId,
  ] =
    useState("");

  const [
    curriculumId,
    setCurriculumId,
  ] =
    useState("");

  const [
    classId,
    setClassId,
  ] =
    useState("");

  const [
    sectionId,
    setSectionId,
  ] =
    useState("");

  const [
    subjectId,
    setSubjectId,
  ] =
    useState("");

  const [
    chapterId,
    setChapterId,
  ] =
    useState("");

  const [
    topicId,
    setTopicId,
  ] =
    useState("");

  const [
    subTopicCode,
    setSubTopicCode,
  ] =
    useState("");

  const [
    subTopicName,
    setSubTopicName,
  ] =
    useState("");

  const [
    displayOrder,
    setDisplayOrder,
  ] =
    useState("1");

      useEffect(() => {

    if (!open) return;

    if (
      mode === "edit" &&
      subTopicRecord
    ) {

      setOrganizationId(
        subTopicRecord.organizationId
      );

      setCurriculumId(
        subTopicRecord.curriculumId
      );

      setClassId(
        subTopicRecord.classId
      );

      setSectionId(
        subTopicRecord.sectionId
      );

      setSubjectId(
        subTopicRecord.subjectId
      );

      setChapterId(
        subTopicRecord.chapterId
      );

      setTopicId(
        subTopicRecord.topicId
      );

      setSubTopicCode(
        subTopicRecord.subTopicCode
      );

      setSubTopicName(
        subTopicRecord.subTopicName
      );

      setDisplayOrder(
        String(
          subTopicRecord.displayOrder
        )
      );

      return;

    }

    setOrganizationId("");

    setCurriculumId("");

    setClassId("");

    setSectionId("");

    setSubjectId("");

    setChapterId("");

    setTopicId("");

    setSubTopicCode("");

    setSubTopicName("");

    setDisplayOrder("1");

  }, [

    open,

    mode,

    subTopicRecord,

  ]);

  async function
  handleSubmit() {

    const ok =
      await onSubmit({

        id:
          subTopicRecord?.id,

        organizationId,

        curriculumId,

        classId,

        sectionId,

        subjectId,

        chapterId,

        topicId,

        subTopicCode,

        subTopicName,

        displayOrder:
          Number(
            displayOrder
          ),

        isActive: true,

      });

    if (ok) {

      onClose();

    }

  }

  const filteredCurriculums =
    curriculums.filter(
      item =>
        item.organizationId ===
        organizationId
    );

  const filteredClasses =
    classes.filter(
      item =>
        item.curriculumId ===
        curriculumId
    );

  const filteredSections =
    sections.filter(
      item =>
        item.classId ===
        classId
    );

  const filteredSubjects =
    subjects.filter(
      item =>
        item.sectionId ===
        sectionId
    );

  const filteredChapters =
    chapters.filter(
      item =>
        item.subjectId ===
        subjectId
    );

  const filteredTopics =
    topics.filter(
      item =>
        item.chapterId ===
        chapterId
    );

      return (

    <FoundationDialog

      open={open}

      title={
        mode === "create"
          ? "Add Sub Topic"
          : "Edit Sub Topic"
      }

      subtitle="Sub Topics belong to a Topic within a Chapter."

      onClose={onClose}

      onSave={handleSubmit}

    >

      <div style={gridStyle}>

        <FoundationSelect
          label="Organization"
          value={organizationId}
          required
          onChange={value => {

            setOrganizationId(value);

            setCurriculumId("");

            setClassId("");

            setSectionId("");

            setSubjectId("");

            setChapterId("");

            setTopicId("");

          }}
          options={organizations.map(
            organization => ({
              value:
                organization.id,
              label:
                organization.organizationName,
            })
          )}
        />

        <FoundationSelect
          label="Curriculum"
          value={curriculumId}
          required
          onChange={value => {

            setCurriculumId(value);

            setClassId("");

            setSectionId("");

            setSubjectId("");

            setChapterId("");

            setTopicId("");

          }}
          options={filteredCurriculums.map(
            curriculum => ({
              value:
                curriculum.id,
              label:
                curriculum.curriculumName,
            })
          )}
        />

        <FoundationSelect
          label="Class"
          value={classId}
          required
          onChange={value => {

            setClassId(value);

            setSectionId("");

            setSubjectId("");

            setChapterId("");

            setTopicId("");

          }}
          options={filteredClasses.map(
            classItem => ({
              value:
                classItem.id,
              label:
                classItem.className,
            })
          )}
        />

        <FoundationSelect
          label="Section"
          value={sectionId}
          required
          onChange={value => {

            setSectionId(value);

            setSubjectId("");

            setChapterId("");

            setTopicId("");

          }}
          options={filteredSections.map(
            section => ({
              value:
                section.id,
              label:
                section.sectionName,
            })
          )}
        />

        <FoundationSelect
          label="Subject"
          value={subjectId}
          required
          onChange={value => {

            setSubjectId(value);

            setChapterId("");

            setTopicId("");

          }}
          options={filteredSubjects.map(
            subject => ({
              value:
                subject.id,
              label:
                subject.subjectName,
            })
          )}
        />

        <FoundationSelect
          label="Chapter"
          value={chapterId}
          required
          onChange={value => {

            setChapterId(value);

            setTopicId("");

          }}
          options={filteredChapters.map(
            chapter => ({
              value:
                chapter.id,
              label:
                chapter.chapterName,
            })
          )}
        />

        <FoundationSelect
          label="Topic"
          value={topicId}
          required
          onChange={setTopicId}
          options={filteredTopics.map(
            topic => ({
              value:
                topic.id,
              label:
                topic.topicName,
            })
          )}
        />

                <TextField
          label="Sub Topic Code"
          value={subTopicCode}
          onChange={setSubTopicCode}
        />

        <TextField
          label="Sub Topic Name"
          value={subTopicName}
          onChange={setSubTopicName}
        />

        <TextField
          label="Display Order"
          value={displayOrder}
          onChange={setDisplayOrder}
          type="number"
        />

      </div>

    </FoundationDialog>

  );

}

interface TextFieldProps {

  label: string;

  value: string;

  onChange: (
    value: string
  ) => void;

  type?: string;

}

function TextField({

  label,

  value,

  onChange,

  type = "text",

}: TextFieldProps) {

  return (

    <label style={labelStyle}>

      {label}

      <input
        type={type}
        value={value}
        onChange={event =>
          onChange(
            event.target.value
          )
        }
        style={inputStyle}
      />

    </label>

  );

}

/* ============================================================
   STYLES
============================================================ */

const gridStyle: React.CSSProperties = {

  display: "grid",

  gridTemplateColumns:
    "repeat(2,minmax(0,1fr))",

  gap: "20px",

};

const labelStyle: React.CSSProperties = {

  display: "flex",

  flexDirection: "column",

  gap: "8px",

  fontWeight: 600,

};

const inputStyle: React.CSSProperties = {

  padding: "12px",

  borderRadius: "10px",

  border:
    "1px solid #CBD5E1",

  fontSize: "14px",

};