import type { ReactNode } from "react";

export interface ExecutiveTableColumn {
  key: string;
  title: string;
  width?: string;
}

interface ExecutiveDrawerTableProps {
  columns: ExecutiveTableColumn[];
  rows: Record<string, ReactNode>[];
  emptyMessage?: string;
}

export default function ExecutiveDrawerTable({
  columns,
  rows,
  emptyMessage = "No records found.",
}: ExecutiveDrawerTableProps) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: columns
            .map(
              (column) =>
                column.width ?? "1fr"
            )
            .join(" "),
          padding: "16px 20px",
          background: "#F8FAFC",
          borderBottom: "1px solid #E5E7EB",
          fontWeight: 700,
          color: "#0F172A",
          fontSize: 14,
        }}
      >
        {columns.map((column) => (
          <div key={column.key}>
            {column.title}
          </div>
        ))}
      </div>

      {/* Empty */}
      {rows.length === 0 && (
        <div
          style={{
            padding: 48,
            textAlign: "center",
            color: "#64748B",
          }}
        >
          {emptyMessage}
        </div>
      )}

      {/* Rows */}
      {rows.map((row, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: columns
              .map(
                (column) =>
                  column.width ?? "1fr"
              )
              .join(" "),
            padding: "16px 20px",
            borderBottom:
              index === rows.length - 1
                ? "none"
                : "1px solid #F1F5F9",
            alignItems: "center",
            fontSize: 14,
          }}
        >
          {columns.map((column) => (
            <div key={column.key}>
              {row[column.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}