import React, {
  useEffect,
  useState,
} from "react";

import type { Curriculum } from "../../../../types/curriculum";

import type { Organization } from "../../../../types/organization";

import FoundationDialog from "./FoundationDialog";

import FoundationSelect from "../../../../features/admin/components/common/FoundationSelect";

import { useOrganizationViewModel } from "../../viewmodels/OrganizationViewModel";

export interface CurriculumDialogProps {
  open: boolean;

  mode: "create" | "edit";

  curriculum?: Curriculum;

  onClose: () => void;

  onSave: (
    curriculum: Partial<Curriculum>
  ) => Promise<void>;
}

const emptyForm: Partial<Curriculum> = {
  organizationId: "",

  curriculumCode: "",

  curriculumName: "",

  description: "",

  displayOrder: 1,

  isActive: true,
};

export default function CurriculumDialog({
  open,
  mode,
  curriculum,
  onClose,
  onSave,
}: CurriculumDialogProps) {
  const [form, setForm] =
    useState<Partial<Curriculum>>(
      emptyForm
    );

  const [saving, setSaving] =
    useState(false);

  const { organizations } =
    useOrganizationViewModel();

  useEffect(() => {
    if (!open) return;

    if (
      mode === "edit" &&
      curriculum
    ) {
      setForm(curriculum);

      return;
    }

    setForm(emptyForm);
  }, [
    open,
    mode,
    curriculum,
  ]);

  function updateField(
    field: keyof Curriculum,
    value: any
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSave() {
    if (
      !form.organizationId
    ) {
      alert(
        "Organization is required."
      );

      return;
    }

    if (
      !form.curriculumCode?.trim()
    ) {
      alert(
        "Curriculum Code is required."
      );

      return;
    }

    if (
      !form.curriculumName?.trim()
    ) {
      alert(
        "Curriculum Name is required."
      );

      return;
    }

    try {
      setSaving(true);

      await onSave(form);

      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <FoundationDialog
      open={open}
      title={
        mode === "create"
          ? "Add Curriculum"
          : "Edit Curriculum"
      }
      subtitle="Curriculum belongs to an Organization."
      onClose={onClose}
      onSave={handleSave}
      saveLabel={
        mode === "create"
          ? "Create Curriculum"
          : "Save Changes"
      }
      saving={saving}
    >
      <div style={gridStyle}>

        <FoundationSelect
          label="Organization"
          required
          value={
            form.organizationId ??
            ""
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
          placeholder="Select Organization"
          onChange={(value) =>
            updateField(
              "organizationId",
              value
            )
          }
        />

        <Input
          label="Curriculum Code"
          value={
            form.curriculumCode ??
            ""
          }
          onChange={(value) =>
            updateField(
              "curriculumCode",
              value
            )
          }
        />

        <Input
          label="Curriculum Name"
          value={
            form.curriculumName ??
            ""
          }
          onChange={(value) =>
            updateField(
              "curriculumName",
              value
            )
          }
        />

        <Input
          label="Description"
          value={
            form.description ??
            ""
          }
          onChange={(value) =>
            updateField(
              "description",
              value
            )
          }
        />

        <Input
          label="Display Order"
          value={String(
            form.displayOrder ?? 1
          )}
          onChange={(value) =>
            updateField(
              "displayOrder",
              Number(value)
            )
          }
        />

      </div>
    </FoundationDialog>
  );
}

interface InputProps {
  label: string;

  value: string;

  onChange: (
    value: string
  ) => void;
}

function Input({
  label,
  value,
  onChange,
}: InputProps) {
  return (
    <label style={labelStyle}>
      {label}

      <input
        value={value}
        onChange={(event) =>
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
    "repeat(auto-fit,minmax(280px,1fr))",
  gap: "20px",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  fontSize: "14px",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
  fontSize: "14px",
  outline: "none",
};