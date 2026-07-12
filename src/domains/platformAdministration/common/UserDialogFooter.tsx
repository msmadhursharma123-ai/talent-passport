import React from "react";

import UserPrimaryButton from "./UserPrimaryButton";
import UserSecondaryButton from "./UserSecondaryButton";

interface UserDialogFooterProps {

  saving?: boolean;

  saveLabel?: string;

  cancelLabel?: string;

  saveDisabled?: boolean;

  onSave?: () => void;

  onCancel?: () => void;

}

export default function UserDialogFooter({

  saving = false,

  saveLabel = "Save",

  cancelLabel = "Cancel",

  saveDisabled = false,

  onSave,

  onCancel,

}: UserDialogFooterProps) {

  return (

    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 12,
        padding: "20px 24px",
        borderTop: "1px solid #E5E7EB",
        background: "#FFFFFF",
      }}
    >

      <UserSecondaryButton
        onClick={onCancel}
      >
        {cancelLabel}
      </UserSecondaryButton>

      <UserPrimaryButton
        disabled={
          saving ||
          saveDisabled
        }
        onClick={onSave}
      >
        {saving
          ? "Saving..."
          : saveLabel}
      </UserPrimaryButton>

    </div>

  );

}