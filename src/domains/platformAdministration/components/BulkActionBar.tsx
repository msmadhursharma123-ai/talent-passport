import React from "react";

import UserPrimaryButton
from "../common/UserPrimaryButton";

import UserSecondaryButton
from "../common/UserSecondaryButton";

interface BulkActionBarProps {

  selectedCount: number;

  onActivate: () => void;

  onSuspend: () => void;

  onArchive: () => void;

  onDelete: () => void;

  onAssignRole: () => void;

  onAssignOrganization: () => void;

  onAssignSchool: () => void;

  onExport: () => void;

  onClearSelection: () => void;

}

export default function BulkActionBar({

  selectedCount,

  onActivate,

  onSuspend,

  onArchive,

  onDelete,

  onAssignRole,

  onAssignOrganization,

  onAssignSchool,

  onExport,

  onClearSelection,

}: BulkActionBarProps) {

  if (selectedCount === 0) {

    return null;

  }

  return (

    <div style={containerStyle}>

      <div style={leftSectionStyle}>

        <span style={selectionTextStyle}>

          {selectedCount} user

          {selectedCount !== 1 ? "s" : ""}

          {" "}selected

        </span>

      </div>

      <div style={actionsStyle}>

        <UserPrimaryButton

          onClick={onActivate}

        >

          Activate

        </UserPrimaryButton>

        <UserSecondaryButton

          onClick={onSuspend}

        >

          Suspend

        </UserSecondaryButton>

        <UserSecondaryButton

          onClick={onArchive}

        >

          Archive

        </UserSecondaryButton>

        <UserSecondaryButton

          onClick={onDelete}

        >

          Delete

        </UserSecondaryButton>

        <UserSecondaryButton

          onClick={onAssignRole}

        >

          Assign Role

        </UserSecondaryButton>

        <UserSecondaryButton

          onClick={onAssignOrganization}

        >

          Assign Organization

        </UserSecondaryButton>

        <UserSecondaryButton

          onClick={onAssignSchool}

        >

          Assign School

        </UserSecondaryButton>

        <UserSecondaryButton

          onClick={onExport}

        >

          Export

        </UserSecondaryButton>

        <UserSecondaryButton

          onClick={onClearSelection}

        >

          Clear Selection

        </UserSecondaryButton>

      </div>

    </div>

  );

}

const containerStyle: React.CSSProperties = {

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  gap: 16,

  padding: "16px 20px",

  marginBottom: 20,

  background: "#FFFFFF",

  border: "1px solid #E2E8F0",

  borderRadius: 12,

  boxShadow: "0 2px 8px rgba(15,23,42,0.06)",

};

const leftSectionStyle: React.CSSProperties = {

  display: "flex",

  alignItems: "center",

};

const selectionTextStyle: React.CSSProperties = {

  fontSize: 15,

  fontWeight: 600,

  color: "#143B73",

};

const actionsStyle: React.CSSProperties = {

  display: "flex",

  flexWrap: "wrap",

  justifyContent: "flex-end",

  gap: 10,

};