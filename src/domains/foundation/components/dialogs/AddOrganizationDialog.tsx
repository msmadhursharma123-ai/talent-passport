import React, { useState } from "react";

import FoundationDialog from "./FoundationDialog";

import type {
  Organization,
  OrganizationType,
} from "../../../../types/organization";

interface AddOrganizationDialogProps {
  open: boolean;

  saving?: boolean;

  onClose: () => void;

  onSave: (
    organization: Partial<Organization>
  ) => Promise<void> | void;
}

export default function AddOrganizationDialog({
  open,
  saving = false,
  onClose,
  onSave,
}: AddOrganizationDialogProps) {
  const [form, setForm] = useState({
    organizationName: "",
    organizationCode: "",
    organizationType:
      "School" as OrganizationType,

    email: "",
    phone: "",

    city: "",
    state: "",

    principalName: "",
  });

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSave() {
    if (
      !form.organizationName.trim() ||
      !form.organizationCode.trim()
    ) {
      alert(
        "Organization Name and Code are required."
      );
      return;
    }

    await onSave({
      organizationName:
        form.organizationName,

      organizationCode:
        form.organizationCode,

      organizationType:
        form.organizationType,

      email: form.email,

      phone: form.phone,

      city: form.city,

      state: form.state,

      principalName:
        form.principalName,

      country: "India",

      isActive: true,
    });

    setForm({
      organizationName: "",
      organizationCode: "",
      organizationType: "School",
      email: "",
      phone: "",
      city: "",
      state: "",
      principalName: "",
    });

    onClose();
  }

  return (
    <FoundationDialog
      open={open}
      title="Add Organization"
      subtitle="Register a new organization in the Foundation Hub."
      saveLabel="Save Organization"
      saving={saving}
      onSave={handleSave}
      onClose={onClose}
    >
      <div style={gridStyle}>
        <FormField
          label="Organization Name"
          value={form.organizationName}
          onChange={(value) =>
            updateField(
              "organizationName",
              value
            )
          }
        />

        <FormField
          label="Organization Code"
          value={form.organizationCode}
          onChange={(value) =>
            updateField(
              "organizationCode",
              value
            )
          }
        />

        <div>
          <label style={labelStyle}>
            Organization Type
          </label>

          <select
            style={inputStyle}
            value={form.organizationType}
            onChange={(event) =>
              updateField(
                "organizationType",
                event.target.value as OrganizationType
              )
            }
          >
            <option>School</option>
            <option>Academy</option>
            <option>College</option>
            <option>University</option>
            <option>
              Training Institute
            </option>
            <option>NGO</option>
            <option>Corporate</option>
          </select>
        </div>

        <FormField
          label="Email"
          value={form.email}
          onChange={(value) =>
            updateField("email", value)
          }
        />

        <FormField
          label="Phone"
          value={form.phone}
          onChange={(value) =>
            updateField("phone", value)
          }
        />

        <FormField
          label="Principal Name"
          value={form.principalName}
          onChange={(value) =>
            updateField(
              "principalName",
              value
            )
          }
        />

        <FormField
          label="City"
          value={form.city}
          onChange={(value) =>
            updateField("city", value)
          }
        />

        <FormField
          label="State"
          value={form.state}
          onChange={(value) =>
            updateField("state", value)
          }
        />
      </div>
    </FoundationDialog>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
}

function FormField({
  label,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <input
        style={inputStyle}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      />
    </div>
  );
}

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2,minmax(0,1fr))",
  gap: "20px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 600,
  color: "#334155",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
  fontSize: "14px",
  boxSizing: "border-box",
};