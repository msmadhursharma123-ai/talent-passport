import React from "react";

import { PlatformUser } from "../types/platformUser";
import UserActionMenu from "../common/UserActionMenu";

export interface UserRegistryTableProps {

    users: PlatformUser[];

    selectedUserIds: string[];

    onToggleSelection: (
        id: string,
    ) => void;

    onView?: (
        user: PlatformUser,
    ) => void;

    onEdit?: (
        user: PlatformUser,
    ) => void;

    onMore?: (
        user: PlatformUser,
    ) => void;

    loading?: boolean;

}

/* ======================================================
   STATUS
====================================================== */

function getStatusStyle(
    status: string,
): React.CSSProperties {

    switch (status) {

        case "active":

            return activeStyle;

        case "pending":

            return pendingStyle;

        case "suspended":

            return suspendedStyle;

        default:

            return archivedStyle;

    }

}

export default function UserRegistryTable({

    users,

    selectedUserIds,

    onToggleSelection,

    onView,

    onEdit,

    onMore,

    loading = false,

}: UserRegistryTableProps) {

    if (

        loading

    ) {

        return (

            <div style={loadingStyle}>

                Loading users...

            </div>

        );

    }

  return (
    <div style={containerStyle}>
      <table
  style={tableStyle}
>
  <colgroup>

  <col style={{ width: 48 }} />

  <col />

  <col />

  <col />

  <col />

  <col style={{ width: 130 }} />

  <col style={{ width: 160 }} />

  <col style={{ width: 170 }} />

</colgroup>
       <thead>
  <tr style={headerRowStyle}>

    <th style={checkboxHeaderStyle}>

      <input
        type="checkbox"
        checked={
          users.length > 0 &&
          selectedUserIds.length === users.length
        }
        onChange={() => {

          users.forEach((user) => {

            if (
              !selectedUserIds.includes(
                user.id,
              )
            ) {

              onToggleSelection(
                user.id,
              );

            }

          });

        }}
      />

    </th>

    <th style={headerCellStyle}>
  Name
</th>

    <th style={headerCellStyle}>
  Email
</th>

    <th style={headerCellStyle}>
  Role
</th>

    <th style={headerCellStyle}>
  Organization
</th>

    <th style={headerCellStyle}>
  Status
</th>

    <th style={headerCellStyle}>
  Last Login
</th>

    <th
      style={{
        textAlign: "center",
        width: 170,
      }}
    >
      Actions
    </th>

  </tr>
</thead>

        <tbody>
          {users.map((user) => {
            const selected =
              selectedUserIds.includes(user.id);

            return (
              <tr
  key={user.id}
  style={{

    ...(selected
      ? selectedRowStyle
      : rowStyle),

    transition:
      "background 0.15s ease",

  }}
>
                <td style={checkboxCellStyle}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      onToggleSelection(user.id)
                    }
                  />
                </td>

                <td style={cellStyle}>

<strong>

{user.name}

</strong>

</td>

                <td style={cellStyle}>

<strong>

{user.email}

</strong>

</td>

                <td style={cellStyle}>

<strong>

{user.role}

</strong>

</td>

               <td style={cellStyle}>

<strong>

{user.organization}

</strong>

</td>



                <td style={cellStyle}>
                  <span
                    style={{
                      ...statusStyle,
                    ...getStatusStyle(

    user.status,

),
                    }}
                  >
                    {user.status}
                  </span>
                </td>

                <td>
                  {user.lastLogin ?? "-"}
                </td>

                <td
  style={{
    textAlign: "center",
    width: 170,
  }}
>

  <div style={actionsStyle}>
                    <button
                      style={primaryButton}
                      onClick={() =>
                        onView?.(user)
                      }
                    >
                      View
                    </button>

                    <button
                      style={secondaryButton}
                      onClick={() =>
                        onEdit?.(user)
                      }
                    >
                      Edit
                    </button>

                  <UserActionMenu

  onView={() =>

    onView?.(user)

  }

  onEdit={() =>

    onEdit?.(user)

  }

  onResetPassword={() => {

    console.log(
      "Reset Password",
      user.id,
    );

  }}

  onAssignRole={() => {

    console.log(
      "Assign Role",
      user.id,
    );

  }}

  onAssignSchool={() => {

    console.log(
      "Assign School",
      user.id,
    );

  }}

  onAssignOrganization={() => {

    console.log(
      "Assign Organization",
      user.id,
    );

  }}

  onSuspend={() => {

    console.log(
      "Suspend User",
      user.id,
    );

  }}

  onActivate={() => {

    console.log(
      "Activate User",
      user.id,
    );

  }}

  onArchive={() => {

    console.log(
      "Archive User",
      user.id,
    );

  }}

  onDelete={() => {

    console.log(
      "Delete User",
      user.id,
    );

  }}

/>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

   {users.length === 0 && (

  <div style={emptyStyle}>

    <div
      style={{
        fontSize: 18,
        fontWeight: 700,
        marginBottom: 8,
      }}
    >
      No Users Found
    </div>

    <div
      style={{
        color: "#64748B",
        fontSize: 14,
      }}
    >
      Try changing your search or filters.
    </div>

  </div>

)}
    </div>
  );
}

/* ========================================================= */

const containerStyle: React.CSSProperties = {

  background: "#FFFFFF",

  border: "1px solid #E5E7EB",

  borderRadius: "18px",

  overflowX: "auto",

  overflowY: "auto",

  maxHeight: "72vh",

};

const tableStyle: React.CSSProperties = {

  width: "100%",

  borderCollapse: "collapse",

  minWidth: "1100px",

};

const headerRowStyle: React.CSSProperties = {

  background: "#F8FAFC",

  position: "sticky",

  top: 0,

  zIndex: 2,

};

const rowStyle: React.CSSProperties = {

  borderTop: "1px solid #E5E7EB",

  transition:

    "background 0.15s ease",

};

const selectedRowStyle: React.CSSProperties = {

  borderTop: "1px solid #E5E7EB",

  background: "#EFF6FF",

  transition:

    "background 0.15s ease",

};

const checkboxHeaderStyle: React.CSSProperties = {
  width: 48,
};

const checkboxCellStyle: React.CSSProperties = {
  textAlign: "center",
};

const statusStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 700,
};

const activeStyle: React.CSSProperties = {
  background: "#DCFCE7",
  color: "#15803D",
};

const pendingStyle: React.CSSProperties = {
  background: "#FEF3C7",
  color: "#B45309",
};

const suspendedStyle: React.CSSProperties = {
  background: "#FEE2E2",
  color: "#B91C1C",
};

const archivedStyle: React.CSSProperties = {
  background: "#E5E7EB",
  color: "#475569",
};

const actionsStyle: React.CSSProperties = {

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  gap: "8px",

  flexWrap: "nowrap",

};

const buttonBase: React.CSSProperties = {
  border: "none",
  borderRadius: "8px",
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
};

const primaryButton: React.CSSProperties = {
  ...buttonBase,
  background: "#143B73",
  color: "#FFFFFF",
};

const secondaryButton: React.CSSProperties = {
  ...buttonBase,
  background: "#E2E8F0",
  color: "#0F172A",
};

const emptyStyle: React.CSSProperties = {

  padding: "64px",

  textAlign: "center",

  color: "#64748B",

  fontWeight: 500,

  background: "#FFFFFF",

};

const loadingStyle: React.CSSProperties = {

    padding: "48px",

    textAlign: "center",

    color: "#64748B",

    background: "#FFFFFF",

};

const headerCellStyle: React.CSSProperties = {

  padding: "16px",

  textAlign: "left",

  fontWeight: 700,

  color: "#334155",

  fontSize: "14px",

};

const cellStyle: React.CSSProperties = {

  padding: "16px",

  verticalAlign: "middle",

};