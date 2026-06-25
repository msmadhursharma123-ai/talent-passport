import React from "react";
import { colors, radius, shadows } from "./adminTheme";

interface AnalyticsSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;

  action?: React.ReactNode;

  style?: React.CSSProperties;

  noPadding?: boolean;
}

export default function AnalyticsSection({
  title,
  subtitle,
  children,
  action,
  style = {},
  noPadding = false
}: AnalyticsSectionProps) {
  return (
    <section
      style={{
        background: colors.surface,

        borderRadius: radius.lg,

        border: `1px solid ${colors.borderLight}`,

        boxShadow: shadows.card,

        overflow: "hidden",

        ...style
      }}
    >
      {/* Header */}

      <div
        style={{
          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",

          padding: "22px 24px",

          borderBottom:
            `1px solid ${colors.borderLight}`
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,

              fontSize: 20,

              fontWeight: 700,

              color: colors.text
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <div
              style={{
                marginTop: 6,

                fontSize: 13,

                color: colors.muted
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {action}
      </div>

      {/* Body */}

      <div
        style={{
          padding: noPadding ? 0 : 24
        }}
      >
        {children}
      </div>
    </section>
  );
}