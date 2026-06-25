import { colors, radius, shadows } from "./adminTheme";

export interface AnalyticsTab {
  id: string;
  label: string;
  count?: number;
}

interface Props {
  tabs: AnalyticsTab[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function AnalyticsTabs({
  tabs,
  activeTab,
  onChange
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 28,

        background: colors.surface,

        borderRadius: radius.lg,

        border: `1px solid ${colors.border}`,

        padding: 8,

        boxShadow: shadows.card
      }}
    >
      {tabs.map(tab => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              border: "none",

              background: active
                ? colors.primary
                : "transparent",

              color: active
                ? colors.white
                : colors.textSecondary,

              borderRadius: radius.md,

              padding: "12px 18px",

              display: "flex",

              alignItems: "center",

              gap: 10,

              cursor: "pointer",

              transition: ".25s",

              fontWeight: 600,

              fontSize: 14
            }}
          >
            <span>{tab.label}</span>

            {tab.count !== undefined && (
              <span
                style={{
                  background: active
                    ? "rgba(255,255,255,.18)"
                    : colors.borderLight,

                  color: active
                    ? colors.white
                    : colors.text,

                  borderRadius: 999,

                  padding: "4px 10px",

                  fontSize: 12,

                  fontWeight: 700,

                  minWidth: 28,

                  textAlign: "center"
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}