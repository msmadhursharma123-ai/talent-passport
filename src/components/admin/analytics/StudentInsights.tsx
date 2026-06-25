import AnalyticsCard from "./AnalyticsCard";

export interface InsightMetric {
  label: string;
  value: number | string;
}

interface InsightSection {
  title: string;
  icon?: React.ReactNode;
  metrics: InsightMetric[];
}

interface Props {
  sections: InsightSection[];
}

export default function StudentInsights({
  sections
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(320px,1fr))",
        gap: 20,
        marginTop: 28
      }}
    >
      {sections.map(section => (
        <AnalyticsCard
          key={section.title}
          hover={false}
          title={section.title}
          icon={section.icon}
          minHeight={260}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}
          >
            {section.metrics.map(metric => (
              <div
                key={metric.label}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  paddingBottom: 12,
                  borderBottom:
                    "1px solid #F1F5F9"
                }}
              >
                <span
                  style={{
                    color: "#64748B",
                    fontSize: 14
                  }}
                >
                  {metric.label}
                </span>

                <span
                  style={{
                    fontWeight: 700,
                    color: "#0F172A",
                    fontSize: 15
                  }}
                >
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        </AnalyticsCard>
      ))}
    </div>
  );
}