import React, {
  useEffect,
  useState,
} from "react";

import type { Organization } from "../../../../types/organization";

import FoundationDialog from "./FoundationDialog";

import FoundationSelect
from "../../../../features/admin/components/common/FoundationSelect";

import { useBoardViewModel }
  from "../../viewmodels/BoardViewModel";

import { useAcademicYearViewModel }
  from "../../viewmodels/AcademicYearViewModel";

export interface OrganizationDialogProps {
  open: boolean;

  mode: "create" | "edit";

  organization?: Organization;

  onClose: () => void;

  onSave: (
    organization: Partial<Organization>
  ) => Promise<void>;
}

const emptyForm: Partial<Organization> = {
  organizationName: "",
  organizationCode: "",
  organizationType: "School",

  boardId: "",
  academicYearId: "",

  email: "",
  phone: "",

  website: "",

  principalName: "",

  addressLine1: "",
  addressLine2: "",

  city: "",
  state: "",
  country: "India",
  postalCode: "",

  logoUrl: "",

  isActive: true,
};

export default function OrganizationDialog({
  open,
  mode,
  organization,
  onClose,
  onSave,
}: OrganizationDialogProps) {
  const [form, setForm] =
    useState<Partial<Organization>>(
      emptyForm
    );

  const [saving, setSaving] =
    useState(false);

    const {
  boards,
} = useBoardViewModel();

const {
  academicYears,
} =
  useAcademicYearViewModel();

const boardOptions =
  boards.map((board) => ({
    value: board.id,
    label: board.boardName,
  }));

const academicYearOptions =
  academicYears.map(
    (year) => ({
      value: year.id,
      label:
        year.academicYearName,
    })
  );

  useEffect(() => {
    if (!open) return;

    if (
      mode === "edit" &&
      organization
    ) {
      setForm(organization);

      return;
    }

    setForm(emptyForm);
  }, [
    open,
    mode,
    organization,
  ]);

  function updateField(
    field: keyof Organization,
    value: any
  ) {
    setForm((previous) => {
      const next = {
        ...previous,
        [field]: value,
      };

      return next;
    });
  }

  async function handleSave() {
    if (
      !form.organizationName?.trim()
    ) {
      alert(
        "Organization Name is required."
      );

      return;
    }

    if (
      !form.organizationCode?.trim()
    ) {
      alert(
        "Organization Code is required."
      );

      return;
    }

    if (
      !form.organizationType?.trim()
    ) {
      alert(
        "Organization Type is required."
      );

      return;
    }

    if (!form.boardId) {
      alert("Board is required.");

      return;
    }

    if (!form.academicYearId) {
      alert(
        "Academic Year is required."
      );

      return;
    }

    if (!form.city?.trim()) {
      alert("City is required.");

      return;
    }

    if (!form.state?.trim()) {
      alert("State is required.");

      return;
    }

    if (
      !form.country?.trim()
    ) {
      alert("Country is required.");

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
      ? "Add Organization"
      : "Edit Organization"
  }
  subtitle="Organizations are the root entity of the Foundation Hub."
  onClose={onClose}
  onSave={handleSave}
  saveLabel={
    mode === "create"
      ? "Create Organization"
      : "Save Changes"
  }
  saving={saving}
>
      <div style={gridStyle}>
        <Input
          label="Organization Name *"
          value={
            form.organizationName ??
            ""
          }
          onChange={(value) =>
            updateField(
              "organizationName",
              value
            )
          }
        />

        <Input
          label="Organization Code *"
          value={
            form.organizationCode ??
            ""
          }
          onChange={(value) =>
            updateField(
              "organizationCode",
              value
            )
          }
        />

        <Input
          label="Organization Type *"
          value={
            form.organizationType ??
            ""
          }
          onChange={(value) =>
            updateField(
              "organizationType",
              value
            )
          }
        />

        <FoundationSelect
  label="Board"
  required
  value={
    form.boardId ?? ""
  }
  options={
    boardOptions
  }
  placeholder="Select Board"
  onChange={(value) =>
    updateField(
      "boardId",
      value
    )
  }
/>

      <FoundationSelect
  label="Academic Year"
  required
  value={
    form.academicYearId ??
    ""
  }
  options={
    academicYearOptions
  }
  placeholder="Select Academic Year"
  onChange={(value) =>
    updateField(
      "academicYearId",
      value
    )
  }
/>

        <Input
          label="Principal"
          value={
            form.principalName ??
            ""
          }
          onChange={(value) =>
            updateField(
              "principalName",
              value
            )
          }
        />

        <Input
          label="Email"
          value={
            form.email ?? ""
          }
          onChange={(value) =>
            updateField(
              "email",
              value
            )
          }
        />

        <Input
          label="Phone"
          value={
            form.phone ?? ""
          }
          onChange={(value) =>
            updateField(
              "phone",
              value
            )
          }
        />

        <Input
          label="Website"
          value={
            form.website ?? ""
          }
          onChange={(value) =>
            updateField(
              "website",
              value
            )
          }
        />

        <Input
          label="Address Line 1"
          value={
            form.addressLine1 ??
            ""
          }
          onChange={(value) =>
            updateField(
              "addressLine1",
              value
            )
          }
        />

        <Input
          label="Address Line 2"
          value={
            form.addressLine2 ??
            ""
          }
          onChange={(value) =>
            updateField(
              "addressLine2",
              value
            )
          }
        />

        <Input
          label="City *"
          value={
            form.city ?? ""
          }
          onChange={(value) =>
            updateField(
              "city",
              value
            )
          }
        />

        <Input
          label="State *"
          value={
            form.state ?? ""
          }
          onChange={(value) =>
            updateField(
              "state",
              value
            )
          }
        />

        <Input
          label="Country *"
          value={
            form.country ?? ""
          }
          onChange={(value) =>
            updateField(
              "country",
              value
            )
          }
        />

        <Input
          label="Postal Code"
          value={
            form.postalCode ??
            ""
          }
          onChange={(value) =>
            updateField(
              "postalCode",
              value
            )
          }
        />

        <Input
          label="Logo URL"
          value={
            form.logoUrl ?? ""
          }
          onChange={(value) =>
            updateField(
              "logoUrl",
              value
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
    <label
      style={labelStyle}
    >
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