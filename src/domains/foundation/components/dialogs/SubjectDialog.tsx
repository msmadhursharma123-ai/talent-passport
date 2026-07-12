import React, {
  useEffect,
  useState,
} from "react";

import type {
  Subject,
} from "../../../../types/subject";

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

import FoundationDialog
from "./FoundationDialog";

import FoundationSelect
from "../../../../features/admin/components/common/FoundationSelect";

export interface SubjectDialogProps {

  open: boolean;

  mode:
    | "create"
    | "edit";

  subjectRecord?: Subject;

  organizations:
    Organization[];

  curriculums:
    Curriculum[];

  classes:
    Class[];

  sections:
    Section[];

  onClose: () => void;

  onSubmit: (
    data: Partial<Subject>
  ) => Promise<boolean>;
}

export default function SubjectDialog({

  open,

  mode,

  subjectRecord,

  organizations,

  curriculums,

  classes,

  sections,

  onClose,

  onSubmit,

}: SubjectDialogProps) {

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
    subjectCode,
    setSubjectCode,
  ] =
    useState("");

  const [
    subjectName,
    setSubjectName,
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
      subjectRecord
    ) {

      setOrganizationId(
        subjectRecord.organizationId
      );

      setCurriculumId(
        subjectRecord.curriculumId
      );

      setClassId(
        subjectRecord.classId
      );

      setSectionId(
        subjectRecord.sectionId
      );

      setSubjectCode(
        subjectRecord.subjectCode
      );

      setSubjectName(
        subjectRecord.subjectName
      );

      setDisplayOrder(
        String(
          subjectRecord.displayOrder
        )
      );

      return;
    }

    setOrganizationId("");

    setCurriculumId("");

    setClassId("");

    setSectionId("");

    setSubjectCode("");

    setSubjectName("");

    setDisplayOrder("1");

  }, [

    open,

    mode,

    subjectRecord,

  ]);

  async function handleSubmit() {

    const ok =
      await onSubmit({

        id:
          subjectRecord?.id,

        organizationId,

        curriculumId,

        classId,

        sectionId,

        subjectCode,

        subjectName,

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

  return (

    <FoundationDialog

      open={open}

      title={
        mode === "create"
          ? "Add Subject"
          : "Edit Subject"
      }

      subtitle="Subjects belong to a Section within a Class."

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

          onChange={setSectionId}

          options={filteredSections.map(

            section => ({

              value:
                section.id,

              label:
                section.sectionName,

            })

          )}

        />

        <TextField

          label="Subject Code"

          value={subjectCode}

          onChange={setSubjectCode}

        />

        <TextField

          label="Subject Name"

          value={subjectName}

          onChange={setSubjectName}

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