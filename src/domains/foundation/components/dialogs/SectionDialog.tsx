import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Section } from "../../../../types/section";
import type { Organization } from "../../../../types/organization";
import type { Curriculum } from "../../../../types/curriculum";
import type { Class } from "../../../../types/class";

import FoundationDialog from "./FoundationDialog";
import FoundationSelect from "../../../../features/admin/components/common/FoundationSelect";

export interface SectionDialogProps {
  open: boolean;

  mode: "create" | "edit";

  sectionRecord?: Section;

  organizations: Organization[];

  curriculums: Curriculum[];

  classes: Class[];

  onClose: () => void;

  onSubmit: (
    data: Partial<Section>
  ) => Promise<boolean>;
}

export default function SectionDialog({
  open,
  mode,
  sectionRecord,
  organizations,
  curriculums,
  classes,
  onClose,
  onSubmit,
}: SectionDialogProps) {
  const [organizationId, setOrganizationId] =
    useState("");

  const [curriculumId, setCurriculumId] =
    useState("");

  const [classId, setClassId] =
    useState("");

  const [sectionCode, setSectionCode] =
    useState("");

  const [sectionName, setSectionName] =
    useState("");

  const [displayOrder, setDisplayOrder] =
    useState("1");

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && sectionRecord) {
      setOrganizationId(
        sectionRecord.organizationId
      );

      setCurriculumId(
        sectionRecord.curriculumId
      );

      setClassId(
        sectionRecord.classId
      );

      setSectionCode(
        sectionRecord.sectionCode
      );

      setSectionName(
        sectionRecord.sectionName
      );

      setDisplayOrder(
        String(
          sectionRecord.displayOrder
        )
      );

      return;
    }

    setOrganizationId("");

    setCurriculumId("");

    setClassId("");

    setSectionCode("");

    setSectionName("");

    setDisplayOrder("1");
  }, [
    open,
    mode,
    sectionRecord,
  ]);

  async function handleSubmit() {
    const ok =
      await onSubmit({
        id:
          sectionRecord?.id,

        organizationId,

        curriculumId,

        classId,

        sectionCode,

        sectionName,

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

      return (
    <FoundationDialog
      open={open}
      title={
        mode === "create"
          ? "Add Section"
          : "Edit Section"
      }
      subtitle="Sections belong to a Class within a Curriculum."
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
          }}
          options={organizations.map(
            (organization: Organization) => ({
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
          }}
          options={filteredCurriculums.map(
            (curriculum: Curriculum) => ({
              value: curriculum.id,
              label: curriculum.curriculumName,
            })
          )}
        />

        <FoundationSelect
          label="Class"
          value={classId}
          required
          onChange={setClassId}
          options={filteredClasses.map(
            (classItem: Class) => ({
              value: classItem.id,
              label: classItem.className,
            })
          )}
        />

        <TextField
          label="Section Code"
          value={sectionCode}
          onChange={setSectionCode}
        />

        <TextField
          label="Section Name"
          value={sectionName}
          onChange={setSectionName}
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
  border: "1px solid #CBD5E1",
  fontSize: "14px",
};