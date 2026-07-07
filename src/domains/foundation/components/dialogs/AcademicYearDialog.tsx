import React, {
  useEffect,
  useState,
} from "react";

import type { AcademicYear } from "../../../../types/academicYear";

import FoundationDialog from "./FoundationDialog";

export interface AcademicYearDialogProps {
  open: boolean;

  mode: "create" | "edit";

  academicYear?: AcademicYear;

  onClose: () => void;

  onSave: (
    academicYear: Partial<AcademicYear>
  ) => Promise<void>;
}

const emptyForm: Partial<AcademicYear> = {
  organizationId: "",

  academicYearCode: "",

  academicYearName: "",

  startDate: "",

  endDate: "",

  isCurrent: false,

  displayOrder: 1,

  isActive: true,
};

export default function AcademicYearDialog({
  open,
  mode,
  academicYear,
  onClose,
  onSave,
}: AcademicYearDialogProps) {
  const [form, setForm] =
    useState<Partial<AcademicYear>>(
      emptyForm
    );

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (
      mode === "edit" &&
      academicYear
    ) {
      setForm(academicYear);

      return;
    }

    setForm(emptyForm);
  }, [
    open,
    mode,
    academicYear,
  ]);

  function updateField(
    field: keyof AcademicYear,
    value: any
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSave() {
    if (
      !form.organizationId?.trim()
    ) {
      alert(
        "Organization is required."
      );

      return;
    }

    if (
      !form.academicYearCode?.trim()
    ) {
      alert(
        "Academic Year Code is required."
      );

      return;
    }

    if (
      !form.academicYearName?.trim()
    ) {
      alert(
        "Academic Year Name is required."
      );

      return;
    }

    if (!form.startDate) {
      alert(
        "Start Date is required."
      );

      return;
    }

    if (!form.endDate) {
      alert(
        "End Date is required."
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
          ? "Add Academic Year"
          : "Edit Academic Year"
      }
      subtitle="Academic Years define organization-specific academic sessions."
      onClose={onClose}
      onSave={handleSave}
      saveLabel={
        mode === "create"
          ? "Create Academic Year"
          : "Save Changes"
      }
      saving={saving}
    >
      <div style={gridStyle}>
        <Input
          label="Organization UUID *"
          value={
            form.organizationId ??
            ""
          }
          onChange={(value) =>
            updateField(
              "organizationId",
              value
            )
          }
        />

        <Input
          label="Academic Year Code *"
          value={
            form.academicYearCode ??
            ""
          }
          onChange={(value) =>
            updateField(
              "academicYearCode",
              value
            )
          }
        />

        <Input
          label="Academic Year Name *"
          value={
            form.academicYearName ??
            ""
          }
          onChange={(value) =>
            updateField(
              "academicYearName",
              value
            )
          }
        />

        <Input
          label="Start Date *"
          type="date"
          value={
            form.startDate ??
            ""
          }
          onChange={(value) =>
            updateField(
              "startDate",
              value
            )
          }
        />

        <Input
          label="End Date *"
          type="date"
          value={
            form.endDate ??
            ""
          }
          onChange={(value) =>
            updateField(
              "endDate",
              value
            )
          }
        />

        <Input
          label="Display Order"
          type="number"
          value={
            String(
              form.displayOrder ??
                1
            )
          }
          onChange={(value) =>
            updateField(
              "displayOrder",
              Number(value)
            )
          }
        />

        <label style={checkboxStyle}>
          <input
            type="checkbox"
            checked={
              form.isCurrent ??
              false
            }
            onChange={(event) =>
              updateField(
                "isCurrent",
                event.target.checked
              )
            }
          />

          Current Academic Year
        </label>
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

  type?:
    | "text"
    | "date"
    | "number";
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: InputProps) {
  return (
    <label style={labelStyle}>
      {label}

      <input
        type={type}
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
  fontWeight: 600,
  fontSize: "14px",
};

const inputStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
  outline: "none",
  fontSize: "14px",
};

const checkboxStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontWeight: 600,
  fontSize: "14px",
};