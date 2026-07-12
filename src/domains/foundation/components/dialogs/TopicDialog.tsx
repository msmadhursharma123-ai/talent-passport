import React, {
  useEffect,
  useState,
} from "react";

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

export interface TopicDialogProps {

  open: boolean;

  mode:
    | "create"
    | "edit";

  topicRecord?: Topic;

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

  onClose: () => void;

  onSubmit: (
    data: Partial<Topic>
  ) => Promise<boolean>;
}

export default function TopicDialog({

  open,

  mode,

  topicRecord,

  organizations,

  curriculums,

  classes,

  sections,

  subjects,

  chapters,

  onClose,

  onSubmit,

}: TopicDialogProps) {

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
    topicCode,
    setTopicCode,
  ] =
    useState("");

  const [
    topicName,
    setTopicName,
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
      topicRecord
    ) {

      setOrganizationId(
        topicRecord.organizationId
      );

      setCurriculumId(
        topicRecord.curriculumId
      );

      setClassId(
        topicRecord.classId
      );

      setSectionId(
        topicRecord.sectionId
      );

      setSubjectId(
        topicRecord.subjectId
      );

      setChapterId(
        topicRecord.chapterId
      );

      setTopicCode(
        topicRecord.topicCode
      );

      setTopicName(
        topicRecord.topicName
      );

      setDisplayOrder(
        String(
          topicRecord.displayOrder
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
    setTopicCode("");
    setTopicName("");
    setDisplayOrder("1");

  }, [
    open,
    mode,
    topicRecord,
  ]);

  async function handleSubmit() {

    const ok =
      await onSubmit({

        id:
          topicRecord?.id,

        organizationId,

        curriculumId,

        classId,

        sectionId,

        subjectId,

        chapterId,

        topicCode,

        topicName,

        displayOrder:
          Number(displayOrder),

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

  return (

    <FoundationDialog

      open={open}

      title={
        mode === "create"
          ? "Add Topic"
          : "Edit Topic"
      }

      subtitle="Topics belong to a Chapter within a Subject."

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
          onChange={setChapterId}
          options={filteredChapters.map(
            chapter => ({
              value:
                chapter.id,
              label:
                chapter.chapterName,
            })
          )}
        />

        <TextField
          label="Topic Code"
          value={topicCode}
          onChange={setTopicCode}
        />

        <TextField
          label="Topic Name"
          value={topicName}
          onChange={setTopicName}
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