import React from "react";
import {
  cardStyles,
  colors,
  radius,
  shadows,
  typography
} from "./adminTheme";

interface AnalyticsCardProps {
  title?: string;
  subtitle?: string;
  value?: string | number;

  icon?: React.ReactNode;

  action?: React.ReactNode;

  footer?: React.ReactNode;

  children?: React.ReactNode;

  style?: React.CSSProperties;

  hover?: boolean;

  minHeight?: number;
}

export default function AnalyticsCard({
  title,
  subtitle,
  value,
  icon,
  action,
  footer,
  children,
  style = {},
  hover = true,
  minHeight = 180
}: AnalyticsCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...cardStyles,

        minHeight,

        display: "flex",

        flexDirection: "column",

        justifyContent: "space-between",

        transition: "all .25s ease",

        cursor: hover ? "pointer" : "default",

        boxShadow:
          hover && isHovered
            ? shadows.hover
            : shadows.card,

        transform:
          hover && isHovered
            ? "translateY(-3px)"
            : "translateY(0px)",

        ...style
      }}
    >
      {/* HEADER */}

      {(title || icon || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 18
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12
            }}
          >
            {icon && (
              <div
                style={{
                  width: 46,
                  height: 46,

                  borderRadius: radius.md,

                  background: "#EEF4FF",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  color: colors.primary,

                  fontSize: 22
                }}
              >
                {icon}
              </div>
            )}

            <div>
              {title && (
                <div
                  style={{
                    ...typography.cardTitle,
                    color: colors.text
                  }}
                >
                  {title}
                </div>
              )}

              {subtitle && (
                <div
                  style={{
                    marginTop: 4,

                    color: colors.muted,

                    fontSize: 13
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>
          </div>

          {action}
        </div>
      )}

      {/* VALUE */}

      {value !== undefined && (
        <div
          style={{
            marginBottom: 18
          }}
        >
          <div
            style={{
              ...typography.metric,

              color: colors.text,

              lineHeight: 1
            }}
          >
            {value}
          </div>
        </div>
      )}

      {/* BODY */}

      {children && (
        <div
          style={{
            flex: 1
          }}
        >
          {children}
        </div>
      )}

      {/* FOOTER */}

      {footer && (
        <div
          style={{
            marginTop: 20,

            paddingTop: 16,

            borderTop:
              `1px solid ${colors.borderLight}`
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}