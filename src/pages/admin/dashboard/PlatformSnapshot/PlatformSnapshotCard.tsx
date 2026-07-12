interface Props {
  title: string;
  value: number;
  onClick?: () => void;
}

export default function PlatformSnapshotCard({
  title,
  value,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 20,
        border: "1px solid #E2E8F0",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 120,
      }}
    >
      <div>
        <div
          style={{
            color: "#64748B",
            fontSize: 13,
            marginBottom: 14,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: "#071952",
          }}
        >
          {value}
        </div>
      </div>

      {onClick && (
        <div
          style={{
            marginTop: 18,
            color: "#2563EB",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          View Details →
        </div>
      )}
    </div>
  );
}