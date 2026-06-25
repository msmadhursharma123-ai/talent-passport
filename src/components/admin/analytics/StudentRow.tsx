import React from "react";
import StatusBadge from "./StatusBadge";

interface StudentRowProps {
  student: any;
  status: string;
  selected: boolean;
  onToggle: () => void;
}

export default function StudentRow({
  student,
  status,
  selected,
  onToggle,
}: StudentRowProps) {
  return (
    <tr
      style={{
        borderBottom: "1px solid #EEF2F7",
        transition: "all .2s ease",
      }}
    >
      {/* Checkbox */}
      <td
        style={{
          padding: "16px",
          textAlign: "center",
        }}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          style={{
            width: 18,
            height: 18,
            cursor: "pointer",
          }}
        />
      </td>

      {/* Student */}
      <td style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#143B73",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {(student.student_name || "?")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <div
              style={{
                fontWeight: 700,
                color: "#0F172A",
                fontSize: 15,
              }}
            >
              {student.student_name}
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#64748B",
                marginTop: 3,
              }}
            >
              {student.student_id}
            </div>
          </div>
        </div>
      </td>

      {/* Mobile */}
      <td
        style={{
          padding: "16px",
          color: "#334155",
        }}
      >
        {student.phone || "-"}
      </td>

      {/* Email */}
      <td
        style={{
          padding: "16px",
          color: "#334155",
        }}
      >
        {student.student_email || "-"}
      </td>

      {/* School */}
      <td
        style={{
          padding: "16px",
          fontWeight: 500,
          color: "#0F172A",
        }}
      >
        {student.school_name}
      </td>

      {/* Class */}
      <td
        style={{
          padding: "16px",
        }}
      >
        {student.class_name}
      </td>

      {/* Age */}
      <td
        style={{
          padding: "16px",
        }}
      >
        {student.student_age}
      </td>

      {/* Gender */}
      <td
        style={{
          padding: "16px",
        }}
      >
        {student.gender}
      </td>

      {/* City */}
      <td
        style={{
          padding: "16px",
        }}
      >
        {student.residence_city}
      </td>

      {/* Area */}
      <td
        style={{
          padding: "16px",
        }}
      >
        {student.residence_area}
      </td>

      {/* Favourite Activity */}
      <td
        style={{
          padding: "16px",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "6px 12px",
            borderRadius: 999,
            background: "#F1F5F9",
            color: "#143B73",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {student.favourite_activity}
        </span>
      </td>

      {/* Status */}
      <td
        style={{
          padding: "16px",
        }}
      >
        <StatusBadge status={status} />
      </td>
    </tr>
  );
}