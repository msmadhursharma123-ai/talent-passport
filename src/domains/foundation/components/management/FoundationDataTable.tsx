import React from "react";

export interface FoundationTableColumn {
  key: string;
  label: string;
}

export interface FoundationTableRow {
  id: string;
  values: Record<string, React.ReactNode>;
}

export interface FoundationTableAction {
  label: string;
  variant?: "primary" | "secondary" | "danger";
  onClick?: (row: FoundationTableRow) => void;
}

interface FoundationDataTableProps {
  columns: FoundationTableColumn[];
  rows: FoundationTableRow[];
  actions?: FoundationTableAction[];
}

export default function FoundationDataTable({
  columns,
  rows,
  actions = [],
}: FoundationDataTableProps) {
  return (
    <section style={containerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={headerCellStyle}
              >
                {column.label}
              </th>
            ))}

            {actions.length > 0 && (
              <th style={headerCellStyle}>
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (actions.length > 0 ? 1 : 0)
                }
                style={emptyRowStyle}
              >
                No records available.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                style={rowStyle}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={cellStyle}
                  >
                    {row.values[column.key]}
                  </td>
                ))}

                {actions.length > 0 && (
                  <td style={cellStyle}>
                    <div style={actionContainerStyle}>
                      {actions.map((action) => (
                        <button
                          key={action.label}
                          style={getButtonStyle(
                            action.variant
                          )}
                          onClick={() =>
                            action.onClick?.(row)
                          }
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
}

/* ============================================================
   STYLES
============================================================ */

const containerStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "18px",
  overflow: "hidden",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const headerCellStyle: React.CSSProperties = {
  padding: "18px 20px",
  textAlign: "left",
  background: "#F8FAFC",
  color: "#143B73",
  fontWeight: 700,
  fontSize: "14px",
  borderBottom: "1px solid #E2E8F0",
};

const rowStyle: React.CSSProperties = {
  borderBottom: "1px solid #F1F5F9",
};

const cellStyle: React.CSSProperties = {
  padding: "18px 20px",
  color: "#334155",
  fontSize: "14px",
  verticalAlign: "middle",
};

const actionContainerStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const emptyRowStyle: React.CSSProperties = {
  padding: "48px",
  textAlign: "center",
  color: "#94A3B8",
  fontStyle: "italic",
};

function getButtonStyle(
  variant: FoundationTableAction["variant"] = "secondary"
): React.CSSProperties {
  const base: React.CSSProperties = {
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  };

  switch (variant) {
    case "primary":
      return {
        ...base,
        border: "none",
        background: "#143B73",
        color: "#FFFFFF",
      };

    case "danger":
      return {
        ...base,
        border: "none",
        background: "#DC2626",
        color: "#FFFFFF",
      };

    default:
      return {
        ...base,
        border: "1px solid #CBD5E1",
        background: "#FFFFFF",
        color: "#334155",
      };
  }
}