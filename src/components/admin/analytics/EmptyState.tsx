import { ReactNode } from "react";
import { colors, radius } from "./adminTheme";

interface Props {
  icon?: ReactNode;

  title: string;

  description?: string;

  action?: ReactNode;

  compact?: boolean;
}

export default function EmptyState({
  icon = "📂",
  title,
  description,
  action,
  compact = false
}: Props) {
  return (
    <div
      style={{
        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        justifyContent: "center",

        textAlign: "center",

        padding: compact ? "40px 20px" : "70px 30px",

        background: colors.surface,

        border: `1px dashed ${colors.border}`,

        borderRadius: radius.xl
      }}
    >
      <div
        style={{
          width: compact ? 60 : 82,

          height: compact ? 60 : 82,

          borderRadius: "50%",

          background: "#EEF4FF",

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          fontSize: compact ? 28 : 42,

          marginBottom: 20
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize: compact ? 18 : 22,

          fontWeight: 700,

          color: colors.text
        }}
      >
        {title}
      </div>

      {description && (
        <div
          style={{
            marginTop: 10,

            maxWidth: 420,

            color: colors.muted,

            lineHeight: 1.7,

            fontSize: 14
          }}
        >
          {description}
        </div>
      )}

      {action && (
        <div
          style={{
            marginTop: 28
          }}
        >
          {action}
        </div>
      )}
    </div>
  );
}