import type {
  ExecutiveKPIRecord,
} from "./executiveKPITypes";

interface ExecutiveKPICardProps {
  data: ExecutiveKPIRecord;
  onClick?: (
    kpi: ExecutiveKPIRecord
  ) => void;
}

export default function ExecutiveKPICard({
  data,
  onClick,
}: ExecutiveKPICardProps) {
  return (
    <div
      onClick={() => onClick?.(data)}
      style={{
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 18,
        padding: 24,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        minHeight: 210,
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: 24,
          fontSize: 18,
          fontWeight: 700,
          color: "#142B73",
        }}
      >
        {data.title}
      </h3>

      <MetricRow
        label="Today"
        value={data.metrics.today}
      />

      <MetricRow
        label="Last 7 Days"
        value={data.metrics.last7Days}
      />

      <MetricRow
        label="Last 30 Days"
        value={data.metrics.last30Days}
      />

      <button
        style={{
          marginTop: 22,
          border: "none",
          background: "transparent",
          color: "#2563EB",
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
          fontSize: 15,
        }}
      >
        View Details →
      </button>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: number;
}

function MetricRow({
  label,
  value,
}: MetricRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 14,
        fontSize: 16,
      }}
    >
      <span
        style={{
          color: "#64748B",
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color: "#111827",
        }}
      >
        {value}
      </strong>
    </div>
  );
}