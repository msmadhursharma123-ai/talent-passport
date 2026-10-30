/** Date helpers for analytics adapters. Existing repositories remain responsible for selecting their date windows. */
export function normalizeAnalyticsDate(value: unknown): string | null {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return text;
}

/** Inclusive date-window predicate for already-fetched date-keyed records; no timezone inference. */
export function isWithinInclusiveAnalyticsDateWindow(value: unknown, startDate?: string, endDate?: string): boolean {
  const date = normalizeAnalyticsDate(value);
  const start = startDate ? normalizeAnalyticsDate(startDate) : null;
  const end = endDate ? normalizeAnalyticsDate(endDate) : null;
  if (!date || (startDate && !start) || (endDate && !end)) return false;
  return (!start || date >= start) && (!end || date <= end);
}
