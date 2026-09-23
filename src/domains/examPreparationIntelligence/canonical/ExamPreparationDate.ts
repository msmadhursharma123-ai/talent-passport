const INDIA_TIME_ZONE = "Asia/Kolkata";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function examPreparationDateKey(value: unknown): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);

  return `${parts.find((part) => part.type === "year")?.value ?? ""}-${parts.find((part) => part.type === "month")?.value ?? ""}-${parts.find((part) => part.type === "day")?.value ?? ""}`;
}

export function shiftExamPreparationDate(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return "";

  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate()
  )}`;
}

export function todayExamPreparationDate() {
  return examPreparationDateKey(new Date());
}

export function isExamPreparationDateInRange(
  value: unknown,
  startDate?: string,
  endDateExclusive?: string
) {
  if (!startDate && !endDateExclusive) return true;

  const key = examPreparationDateKey(value);
  if (!key) return false;

  if (startDate && key < startDate) return false;
  if (endDateExclusive && key >= endDateExclusive) return false;

  return true;
}

export function inclusiveEndToExclusive(endDateInclusive?: string) {
  return endDateInclusive
    ? shiftExamPreparationDate(endDateInclusive, 1)
    : undefined;
}

export function buildExamPreparationRange(
  mode: "30" | "60" | "90" | "ALL" | "CUSTOM",
  customStart?: string,
  customEnd?: string
) {
  if (mode === "ALL") return {};

  if (mode === "CUSTOM") {
    if (!customStart || !customEnd || customStart > customEnd) return null;

    return {
      startDate: customStart,
      endDateExclusive: shiftExamPreparationDate(customEnd, 1),
    };
  }

  const today = todayExamPreparationDate();
  const days = Number(mode);

  return {
    startDate: shiftExamPreparationDate(today, -(days - 1)),
    endDateExclusive: shiftExamPreparationDate(today, 1),
  };
}
