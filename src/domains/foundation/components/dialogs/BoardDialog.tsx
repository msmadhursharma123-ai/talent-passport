import React, {
  useEffect,
  useState,
} from "react";

import type { Board } from "../../../../types/board";

import FoundationDialog from "./FoundationDialog";

export interface BoardDialogProps {
  open: boolean;

  mode: "create" | "edit";

  board?: Board;

  onClose: () => void;

  onSave: (
    board: Partial<Board>
  ) => Promise<void>;
}

const emptyForm: Partial<Board> = {
  boardName: "",
  boardCode: "",
  shortName: "",

  description: "",

  country: "India",

  educationLevel: "School",

  website: "",

  displayOrder: 1,

  isActive: true,
};

export default function BoardDialog({
  open,
  mode,
  board,
  onClose,
  onSave,
}: BoardDialogProps) {
  const [form, setForm] =
    useState<Partial<Board>>(
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
      board
    ) {
      setForm(board);
      return;
    }

    setForm(emptyForm);
  }, [
    open,
    mode,
    board,
  ]);

  function updateField(
    field: keyof Board,
    value: any
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSave() {
    if (
      !form.boardName?.trim()
    ) {
      alert(
        "Board Name is required."
      );
      return;
    }

    if (
      !form.boardCode?.trim()
    ) {
      alert(
        "Board Code is required."
      );
      return;
    }

    if (
      !form.shortName?.trim()
    ) {
      alert(
        "Short Name is required."
      );
      return;
    }

    if (
      !form.country?.trim()
    ) {
      alert(
        "Country is required."
      );
      return;
    }

    if (
      !form.educationLevel?.trim()
    ) {
      alert(
        "Education Level is required."
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
          ? "Add Board"
          : "Edit Board"
      }
      subtitle="Boards define the educational systems used throughout the Foundation Hub."
      onClose={onClose}
      onSave={handleSave}
      saveLabel={
        mode === "create"
          ? "Create Board"
          : "Save Changes"
      }
      saving={saving}
    >
      <div style={gridStyle}>
        <Input
          label="Board Name *"
          value={
            form.boardName ??
            ""
          }
          onChange={(value) =>
            updateField(
              "boardName",
              value
            )
          }
        />

        <Input
          label="Board Code *"
          value={
            form.boardCode ??
            ""
          }
          onChange={(value) =>
            updateField(
              "boardCode",
              value
            )
          }
        />

        <Input
          label="Short Name *"
          value={
            form.shortName ??
            ""
          }
          onChange={(value) =>
            updateField(
              "shortName",
              value
            )
          }
        />

        <Input
          label="Education Level *"
          value={
            form.educationLevel ??
            ""
          }
          onChange={(value) =>
            updateField(
              "educationLevel",
              value
            )
          }
        />

        <Input
          label="Country *"
          value={
            form.country ??
            ""
          }
          onChange={(value) =>
            updateField(
              "country",
              value
            )
          }
        />

        <Input
          label="Website"
          value={
            form.website ??
            ""
          }
          onChange={(value) =>
            updateField(
              "website",
              value
            )
          }
        />

        <Input
          label="Display Order"
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

        <TextArea
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

interface TextAreaProps {
  label: string;

  value: string;

  onChange: (
    value: string
  ) => void;
}

function TextArea({
  label,
  value,
  onChange,
}: TextAreaProps) {
  return (
    <label style={labelStyle}>
      {label}

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        rows={4}
        style={{
          ...inputStyle,
          resize: "vertical",
        }}
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