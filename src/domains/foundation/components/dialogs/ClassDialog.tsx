import React, {
  useEffect,
  useState,
} from "react";

import type { Class } from "../../../../types/class";
import type { Organization } from "../../../../types/organization";
import type { Curriculum } from "../../../../types/curriculum";

import FoundationDialog from "./FoundationDialog";
import FoundationSelect from "../../../../features/admin/components/common/FoundationSelect";

import { useOrganizationViewModel } from "../../viewmodels/OrganizationViewModel";
import { useCurriculumViewModel } from "../../viewmodels/CurriculumViewModel";

export interface ClassDialogProps {

  open: boolean;

  mode: "create" | "edit";

  classRecord?: Class;

  onClose: () => void;

  onSubmit: (
    data: Partial<Class>
  ) => Promise<boolean>;
}

export default function ClassDialog({

  open,

  mode,

  classRecord,

  onClose,

  onSubmit,

}: ClassDialogProps) {

  const { organizations } =
    useOrganizationViewModel();

  const { curriculums } =
    useCurriculumViewModel();

  const [organizationId, setOrganizationId] =
    useState("");

  const [curriculumId, setCurriculumId] =
    useState("");

  const [classCode, setClassCode] =
    useState("");

  const [className, setClassName] =
    useState("");

  const [displayOrder, setDisplayOrder] =
    useState("1");

  useEffect(() => {

    if (!open) return;

    if (mode === "edit" && classRecord) {

      setOrganizationId(
        classRecord.organizationId
      );

      setCurriculumId(
        classRecord.curriculumId
      );

      setClassCode(
        classRecord.classCode
      );

      setClassName(
        classRecord.className
      );

      setDisplayOrder(
        String(
          classRecord.displayOrder
        )
      );

      return;
    }

    setOrganizationId("");

    setCurriculumId("");

    setClassCode("");

    setClassName("");

    setDisplayOrder("1");

  }, [
    open,
    mode,
    classRecord,
  ]);

  async function handleSubmit() {

    const ok =
      await onSubmit({

        id:
          classRecord?.id,

        organizationId,

        curriculumId,

        classCode,

        className,

        displayOrder:
          Number(displayOrder),

        isActive: true,

      });

    if (ok) {

      onClose();

    }

  }

  const filteredCurriculum =
    curriculums.filter(

      curriculum =>

        curriculum.organizationId ===
        organizationId

    );

  return (

  <FoundationDialog

  open={open}

  title={
    mode === "create"
      ? "Add Class"
      : "Edit Class"
  }

  subtitle="Classes belong to a Curriculum within an Organization."

  onClose={onClose}

  onSave={handleSubmit}
>

      <div style={gridStyle}>

        <FoundationSelect

          label="Organization"

          value={organizationId}

          required

          onChange={
            value => {

              setOrganizationId(value);

              setCurriculumId("");

            }
          }

          options={organizations.map(

            (
              organization: Organization
            ) => ({

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

          onChange={setCurriculumId}

          options={filteredCurriculum.map(

            (
              curriculum: Curriculum
            ) => ({

              value:
                curriculum.id,

              label:
                curriculum.curriculumName,

            })

          )}

        />

        <TextField

          label="Class Code"

          value={classCode}

          onChange={setClassCode}

        />

        <TextField

          label="Class Name"

          value={className}

          onChange={setClassName}

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