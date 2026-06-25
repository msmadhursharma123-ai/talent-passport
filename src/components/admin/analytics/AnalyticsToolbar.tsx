import { ReactNode } from "react";
import {
  buttons,
  colors,
  input,
  radius,
  shadows
} from "./adminTheme";

interface FilterOption {
  label: string;
  value: string;
}

interface ToolbarFilter {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface ToolbarAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}

interface Props {
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;

  filters?: ToolbarFilter[];

  actions?: ToolbarAction[];

  selectedCount?: number;

  children?: ReactNode;
}

export default function AnalyticsToolbar({
  searchValue,
  searchPlaceholder = "Search...",
  onSearchChange,
  filters = [],
  actions = [],
  selectedCount = 0,
  children
}: Props) {
  return (
    <div
      style={{
        background: colors.surface,

        border: `1px solid ${colors.border}`,

        borderRadius: radius.lg,

        boxShadow: shadows.card,

        padding: 20,

        marginBottom: 22
      }}
    >
      {/* Top Row */}

      <div
        style={{
          display: "flex",

          gap: 16,

          flexWrap: "wrap",

          alignItems: "center"
        }}
      >
        {/* Search */}

        <div
          style={{
            flex: 1,
            minWidth: 280,
            position: "relative"
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 18
            }}
          >
            🔍
          </span>

          <input
            value={searchValue}
            onChange={(e) =>
              onSearchChange(e.target.value)
            }
            placeholder={searchPlaceholder}
            style={{
              ...input,
              paddingLeft: 46
            }}
          />
        </div>

        {/* Filters */}

        {filters.map((filter) => (
          <select
            key={filter.label}
            value={filter.value}
            onChange={(e) =>
              filter.onChange(e.target.value)
            }
            style={{
              ...input,

              width: 180,

              cursor: "pointer"
            }}
          >
            <option value="">
              {filter.label}
            </option>

            {filter.options.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* Selected Bar */}

      {selectedCount > 0 && (
        <div
          style={{
            marginTop: 18,

            display: "flex",

            justifyContent:
              "space-between",

            alignItems: "center",

            flexWrap: "wrap",

            gap: 14,

            padding: "14px 18px",

            background: "#EEF4FF",

            borderRadius: radius.md,

            border:
              "1px solid #BFDBFE"
          }}
        >
          <div
            style={{
              fontWeight: 700,

              color: colors.primary
            }}
          >
            {selectedCount} Student
            {selectedCount > 1 ? "s" : ""} Selected
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap"
            }}
          >
            {actions.map((action) => (
              <button
                key={action.label}
                disabled={action.disabled}
                onClick={action.onClick}
                style={
                  action.primary
                    ? buttons.primary
                    : buttons.ghost
                }
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  {action.icon}

                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Extra Content */}

      {children && (
        <div
          style={{
            marginTop: 20
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}