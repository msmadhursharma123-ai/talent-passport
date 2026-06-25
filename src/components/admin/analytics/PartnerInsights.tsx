import AnalyticsCard from "./AnalyticsCard";

export interface PartnerInsightMetric {
  label: string;
  value: number | string;
}

export interface PartnerInsightSection {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  metrics: PartnerInsightMetric[];
}

interface Props {
  sections: PartnerInsightSection[];
}

export default function PartnerInsights({
  sections
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(340px,1fr))",
        gap: 20,
        marginTop: 28
      }}
    >
      {sections.map(section => (
        <AnalyticsCard
          key={section.title}
          title={section.title}
          subtitle={section.subtitle}
          icon={section.icon}
          hover={false}
          minHeight={270}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14
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

                  paddingBottom: 14,

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