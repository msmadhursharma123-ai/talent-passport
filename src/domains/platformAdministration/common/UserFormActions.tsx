import React from "react";

import UserPrimaryButton from "./UserPrimaryButton";
import UserSecondaryButton from "./UserSecondaryButton";

interface UserFormActionsProps {

  saving?: boolean;

  saveText?: string;

  onCancel: () => void;

  onSave: () => void;

}

export default function UserFormActions({

  saving = false,

  saveText = "Save",

  onCancel,

  onSave,

}: UserFormActionsProps) {

  return (

    <div style={actionsStyle}>

      <UserSecondaryButton
        onClick={onCancel}
      >
        Cancel
      </UserSecondaryButton>

      <UserPrimaryButton
        onClick={onSave}
        disabled={saving}
      >
        {saving
          ? "Saving..."
          : saveText}
      </UserPrimaryButton>

    </div>

  );

}

const actionsStyle: React.CSSProperties = {

  display: "flex",

  justifyContent: "flex-end",

  gap: 12,

  marginTop: 8,

};