/* ============================================================
DATE FORMATTER
Reusable CRM Date Utilities
============================================================ */

function isToday(date: Date): boolean {
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

/* ============================================================
09 Aug 2026
============================================================ */

export function formatDate(
  value?: string | null
): string {

  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

/* ============================================================
11:42 AM
============================================================ */

export function formatTime(
  value?: string | null
): string {

  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

/* ============================================================
Today
Yesterday
09 Aug 2026
============================================================ */

export function formatRelativeDate(
  value?: string | null
): string {

  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  if (isToday(date)) {
    return "Today";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  return formatDate(value);
}

/* ============================================================
Today
11:42 AM

Yesterday
4:15 PM

09 Aug 2026
11:42 AM
============================================================ */

export function formatCRMDate(
  value?: string | null
): string {

  if (!value) return "-";

  return `${formatRelativeDate(value)}\n${formatTime(value)}`;
}

/* ============================================================
Sortable Timestamp
============================================================ */

export function timestamp(
  value?: string | null
): number {

  if (!value) return 0;

  return new Date(value).getTime();
}