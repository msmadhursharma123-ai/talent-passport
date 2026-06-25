import AnalyticsCard from "./AnalyticsCard";
import { colors } from "./adminTheme";

export interface KPIItem {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
}

interface Props {
  items: KPIItem[];
}

export default function AnalyticsKPICards({
  items
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(240px,1fr))",
        gap: 20,
        marginBottom: 28
      }}
    >
      {items.map((item, index) => (
        <AnalyticsCard
          key={index}
          hover
          minHeight={170}
          title={item.title}
          subtitle={item.subtitle}
          value={item.value}
          icon={
            <div
              style={{
                width: 42,
                height: 42,

                borderRadius: 12,

                background:
                  item.color ||
                  "#EEF4FF",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                fontSize: 22
              }}
            >
              {item.icon}
            </div>
          }
          footer={
            <div
              style={{
                display: "flex",

                justifyContent:
                  "space-between",

                alignItems: "center"
              }}
            >
              <span
                style={{
                  color: colors.muted,
                  fontSize: 13
                }}
              >
                Live Analytics
              </span>

              <span
                style={{
                  color: colors.primary,
                  fontWeight: 700,
                  fontSize: 13
                }}
              >
                View →
              </span>
            </div>
          }
        />
      ))}
    </div>
  );
}