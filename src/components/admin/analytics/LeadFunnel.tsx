import AnalyticsSection from "./AnalyticsSection";
import AnalyticsCard from "./AnalyticsCard";

interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

interface Props {
  stages: FunnelStage[];
}

export default function LeadFunnel({
  stages
}: Props) {
  const total =
    stages.reduce(
      (sum, item) => sum + item.value,
      0
    ) || 1;

  return (
    <AnalyticsSection
      title="Lead Funnel"
      subtitle="Track student journey from allocation to admission."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: 18
        }}
      >
        {stages.map(stage => {

          const percentage = Math.round(
            (stage.value / total) * 100
          );

          return (
            <AnalyticsCard
              key={stage.label}
              hover={false}
              minHeight={170}
              title={stage.label}
              value={stage.value}
            >
              <div
                style={{
                  marginTop: 18
                }}
              >
                <div
                  style={{
                    height: 10,

                    borderRadius: 999,

                    background: "#E5E7EB",

                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,

                      background: stage.color,

                      height: "100%"
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 10,

                    display: "flex",

                    justifyContent:
                      "space-between",

                    fontSize: 13,

                    color: "#64748B"
                  }}
                >
                  <span>
                    {percentage}%
                  </span>

                  <span>
                    {stage.value} Leads
                  </span>
                </div>
              </div>
            </AnalyticsCard>
          );

        })}
      </div>
    </AnalyticsSection>
  );
}