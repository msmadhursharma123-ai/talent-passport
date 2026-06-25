import { ReactNode } from "react";
import {
  colors,
  radius,
  shadows
} from "./adminTheme";

interface HeroMetric {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
}

interface Props {
  title: string;
  subtitle: string;

  metrics: HeroMetric[];

  rightContent?: ReactNode;
}

export default function AnalyticsHero({
  title,
  subtitle,
  metrics,
  rightContent
}: Props) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg,
          ${colors.heroStart},
          ${colors.heroEnd})`,

        borderRadius: radius.xl,

        padding: 34,

        color: colors.white,

        marginBottom: 28,

        boxShadow: shadows.hero
      }}
    >
      {/* TOP */}

      <div
        style={{
          display: "flex",

          justifyContent: "space-between",

          alignItems: "flex-start",

          marginBottom: 34,

          flexWrap: "wrap",

          gap: 24
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",

              alignItems: "center",

              gap: 8,

              background: "rgba(255,255,255,.12)",

              padding: "6px 14px",

              borderRadius: 999,

              fontSize: 12,

              fontWeight: 700,

              letterSpacing: ".5px",

              marginBottom: 16
            }}
          >
            ● LIVE COMMAND CENTER
          </div>

          <h1
            style={{
              margin: 0,

              fontSize: 38,

              fontWeight: 700,

              lineHeight: 1.2
            }}
          >
            {title}
          </h1>

          <p
            style={{
              marginTop: 14,

              color: "rgba(255,255,255,.82)",

              fontSize: 15,

              maxWidth: 650,

              lineHeight: 1.7
            }}
          >
            {subtitle}
          </p>
        </div>

        {rightContent}
      </div>

      {/* METRICS */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",

          gap: 18
        }}
      >
        {metrics.map((metric, index) => (
          <div
            key={index}
            style={{
              background:
                "rgba(255,255,255,.08)",

              backdropFilter: "blur(8px)",

              border:
                "1px solid rgba(255,255,255,.08)",

              borderRadius: 18,

              padding: 22
            }}
          >
            {metric.icon && (
              <div
                style={{
                  fontSize: 22,

                  marginBottom: 12
                }}
              >
                {metric.icon}
              </div>
            )}

            <div
              style={{
                fontSize: 34,

                fontWeight: 700,

                lineHeight: 1
              }}
            >
              {metric.value}
            </div>

            <div
              style={{
                marginTop: 10,

                fontWeight: 600,

                fontSize: 15
              }}
            >
              {metric.title}
            </div>

            {metric.subtitle && (
              <div
                style={{
                  marginTop: 6,

                  fontSize: 12,

                  color:
                    "rgba(255,255,255,.70)"
                }}
              >
                {metric.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}