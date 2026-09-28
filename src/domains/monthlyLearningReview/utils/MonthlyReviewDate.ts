export function indiaDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  return `${parts.find((p) => p.type === "year")?.value ?? ""}-${parts.find((p) => p.type === "month")?.value ?? ""}-${parts.find((p) => p.type === "day")?.value ?? ""}`;
}

export function currentReviewMonth(date = new Date()): string {
  return indiaDate(date).slice(0, 7) + "-01";
}

export function previousMonthBounds(reviewMonth: string): { start: string; end: string } {
  const [year, month] = reviewMonth.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 2, 1));
  const last = new Date(Date.UTC(year, month - 1, 0));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { start: iso(first), end: iso(last) };
}

export function isIndiaFirstDay(date = new Date()): boolean {
  return indiaDate(date).slice(-2) === "01";
}
