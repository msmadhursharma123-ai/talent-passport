interface ExecutiveDrawerTabsProps {
  value:
    | "today"
    | "last7Days"
    | "last30Days";

  onChange: (
    value:
      | "today"
      | "last7Days"
      | "last30Days"
  ) => void;
}

const tabs = [
  {
    id: "today",
    label: "Today",
  },
  {
    id: "last7Days",
    label: "Last 7 Days",
  },
  {
    id: "last30Days",
    label: "Last 30 Days",
  },
] as const;

export default function ExecutiveDrawerTabs({
  value,
  onChange,
}: ExecutiveDrawerTabsProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        marginBottom: 24,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() =>
            onChange(tab.id)
          }
          style={{
            padding:
              "10px 18px",
            borderRadius: 999,
            border:
              value === tab.id
                ? "1px solid #2563EB"
                : "1px solid #CBD5E1",
            background:
              value === tab.id
                ? "#2563EB"
                : "#FFFFFF",
            color:
              value === tab.id
                ? "#FFFFFF"
                : "#475569",
            fontWeight: 600,
            cursor: "pointer",
            transition:
              "all .2s ease",
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}