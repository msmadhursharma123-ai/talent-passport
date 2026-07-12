import React, {
  useEffect,
  useState,
} from "react";

import type {
  Chapter,
} from "../../../../types/chapter";

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

import FoundationDialog
from "./FoundationDialog";

import FoundationSelect
from "../../../../features/admin/components/common/FoundationSelect";

export interface ChapterDialogProps {

  open: boolean;

  mode:
    | "create"
    | "edit";

  chapterRecord?: Chapter;

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

  onClose: () => void;

  onSubmit: (
    data: Partial<Chapter>
  ) => Promise<boolean>;
}

export default function ChapterDialog({

  open,

  mode,

  chapterRecord,

  organizations,

  curriculums,

  classes,

  sections,

  subjects,

  onClose,

  onSubmit,

}: ChapterDialogProps) {

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
    chapterCode,
    setChapterCode,
  ] =
    useState("");

  const [
    chapterName,
    setChapterName,
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
      chapterRecord
    ) {

      setOrganizationId(
        chapterRecord.organizationId
      );

      setCurriculumId(
        chapterRecord.curriculumId
      );

      setClassId(
        chapterRecord.classId
      );

      setSectionId(
        chapterRecord.sectionId
      );

      setSubjectId(
        chapterRecord.subjectId
      );

      setChapterCode(
        chapterRecord.chapterCode
      );

      setChapterName(
        chapterRecord.chapterName
      );

      setDisplayOrder(
        String(
          chapterRecord.displayOrder
        )
      );

      return;

    }

    setOrganizationId("");
    setCurriculumId("");
    setClassId("");
    setSectionId("");
    setSubjectId("");
    setChapterCode("");
    setChapterName("");
    setDisplayOrder("1");

  }, [
    open,
    mode,
    chapterRecord,
  ]);

  async function handleSubmit() {

    const ok =
      await onSubmit({

        id:
          chapterRecord?.id,

        organizationId,

        curriculumId,

        classId,

        sectionId,

        subjectId,

        chapterCode,

        chapterName,

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
      curriculum =>
        curriculum.organizationId ===
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

  return (

    <FoundationDialog

      open={open}

      title={
        mode === "create"
          ? "Add Chapter"
          : "Edit Chapter"
      }

      subtitle="Chapters belong to a Subject within a Section."

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
          }}
          options={organizations.map(
            organization => ({
              value: organization.id,
              label: organization.organizationName,
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
          }}
          options={filteredCurriculums.map(
            curriculum => ({
              value: curriculum.id,
              label: curriculum.curriculumName,
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
          onChange={setSubjectId}
          options={filteredSubjects.map(
            subject => ({
              value:
                subject.id,
              label:
                subject.subjectName,
            })
          )}
        />

        <TextField
          label="Chapter Code"
          value={chapterCode}
          onChange={setChapterCode}
        />

        <TextField
          label="Chapter Name"
          value={chapterName}
          onChange={setChapterName}
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