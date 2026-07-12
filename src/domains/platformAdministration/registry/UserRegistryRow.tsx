import React from "react";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  organization: string;
  status: string;
  lastLogin: string;
}

interface UserRegistryRowProps {
  user: UserRow;
}

export default function UserRegistryRow({
  user,
}: UserRegistryRowProps) {
  const statusStyle: React.CSSProperties = {
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    display: "inline-block",
    background:
      user.status === "Active"
        ? "#DCFCE7"
        : user.status === "Pending"
        ? "#FEF3C7"
        : "#FEE2E2",
    color:
      user.status === "Active"
        ? "#15803D"
        : user.status === "Pending"
        ? "#B45309"
        : "#B91C1C",
  };

  return (
    <tr>
      <td>
        <strong>{user.name}</strong>
      </td>

      <td>{user.email}</td>

      <td>{user.role}</td>

      <td>{user.organization}</td>

      <td>
        <span style={statusStyle}>
          {user.status}
        </span>
      </td>

      <td>{user.lastLogin}</td>

      <td>
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
          }}
        >
          <button style={buttonStyle}>
            View
          </button>

          <button style={buttonStyle}>
            Edit
          </button>

          <button style={buttonStyle}>
            More
          </button>
        </div>
      </td>
    </tr>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "#143B73",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "8px",
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: "12px",
};