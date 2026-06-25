import { ReactNode } from "react";
import {
  colors,
  radius,
  shadows
} from "./adminTheme";

interface Action {
  title: string;
  description: string;
  icon: ReactNode;
  color?: string;
  disabled?: boolean;
  onClick: () => void;
}

interface Props {
  actions: Action[];
}

export default function QuickActions({
  actions
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: 18,
        marginTop: 24,
        marginBottom: 28
      }}
    >
      {actions.map((action, index) => (
        <div
          key={index}
          onClick={() => {
            if (!action.disabled) {
              action.onClick();
            }
          }}
          style={{
            background: colors.surface,

            border: `1px solid ${colors.border}`,

            borderRadius: radius.lg,

            padding: 22,

            cursor: action.disabled
              ? "not-allowed"
              : "pointer",

            opacity: action.disabled ? 0.55 : 1,

            transition: ".25s",

            boxShadow: shadows.card,

            display: "flex",

            flexDirection: "column",

            justifyContent: "space-between",

            minHeight: 150
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,

              borderRadius: 14,

              background:
                action.color ||
                "#EEF4FF",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              fontSize: 24,

              marginBottom: 18
            }}
          >
            {action.icon}
          </div>

          <div
            style={{
              fontWeight: 700,

              color: colors.text,

              fontSize: 16
            }}
          >
            {action.title}
          </div>

          <div
            style={{
              color: colors.muted,

              fontSize: 13,

              marginTop: 8,

              lineHeight: 1.6
            }}
          >
            {action.description}
          </div>

          {action.disabled && (
            <div
              style={{
                marginTop: 18,

                display: "inline-flex",

                alignSelf: "flex-start",

                background: "#FEF3C7",

                color: "#92400E",

                padding: "6px 10px",

                borderRadius: 999,

                fontSize: 11,

                fontWeight: 700
              }}
            >
              Coming Soon
            </div>
          )}
        </div>
      ))}
    </div>
  );
}