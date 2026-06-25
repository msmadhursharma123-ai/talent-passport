import { statusColors, radius } from "./adminTheme";

interface Props {
  status?: string;
}

export default function StatusBadge({ status = "" }: Props) {
  const key = status.toLowerCase();

  const palette =
    (statusColors as any)[key] ||
    statusColors.pending;

  const icon = getStatusIcon(key);

  const label = formatLabel(status);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,

        padding: "6px 12px",

        borderRadius: radius.round,

        background: palette.background,

        color: palette.color,

        fontSize: 13,

        fontWeight: 600,

        whiteSpace: "nowrap"
      }}
    >
      <span
        style={{
          fontSize: 12
        }}
      >
        {icon}
      </span>

      <span>{label}</span>
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case "allocated":
      return "🟢";

    case "contacted":
      return "📞";

    case "counselling":
      return "🎯";

    case "admitted":
      return "🎓";

    case "rejected":
      return "⛔";

    case "pending":
      return "⏳";

    case "new_lead":
      return "✨";

    case "consent_pending":
      return "📝";

    case "consent_received":
      return "✅";

    case "scholarship_sent":
      return "🏅";

    case "workshop_invited":
      return "🎪";

    default:
      return "●";
  }
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, l => l.toUpperCase());
}