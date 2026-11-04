import type { TrackRecordPeriod, TrackRecordView } from "./TrackRecordTypes";

/** Pure date/assignment helpers for Track Record's deterministic period accounting. */
export function enumerateCalendarDays(startDate: string, endDateExclusive: string): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDateExclusive)) return [];
  const result: string[] = [];
  let cursor = startDate;
  while (cursor < endDateExclusive) {
    result.push(cursor);
    const date = new Date(`${cursor}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    cursor = date.toISOString().slice(0, 10);
  }
  return result;
}

/**
 * Only the explicit ended_at field establishes an assignment end date.
 * Generic updated_at may reflect unrelated edits and must not be used to
 * reconstruct historical classroom membership.
 */
export function getAssignmentEffectiveEndDate(
  assignment: any,
  toDate: (value: unknown) => string,
): string {
  return toDate(assignment?.ended_at);
}

/**
 * Whether an event belongs to the effective lifetime of its assignment.
 * The start and end are date-inclusive because assignment records and daily
 * log dates are interpreted as India business calendar dates.
 */
export function isAssignmentActiveOnDate(
  assignment: any,
  eventDate: string,
  toDate: (value: unknown) => string,
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return false;
  const rawStart = assignment?.created_at;
  const assignedFrom = toDate(rawStart);
  const rawEnd = assignment?.ended_at;
  const assignedUntil = toDate(rawEnd);
  if (!rawStart || !assignedFrom) return false;
  if (rawEnd && !assignedUntil) return false;
  if (eventDate < assignedFrom) return false;
  if (assignedUntil && eventDate > assignedUntil) return false;
  if (assignedUntil && assignedUntil < assignedFrom) return false;
  // An inactive assignment without ended_at is ambiguous. Its overlapping
  // periods are withheld by hasUnverifiableAssignmentInterval before use.
  if (assignment?.is_active === false && !assignedUntil) return false;
  return true;
}

/** Only authoritative resolution timestamps can place a resolved doubt in a period. */
export function getResolvedDoubtDate(
  doubt: any,
  isResolved: (row: any) => boolean,
  toDate: (value: unknown) => string,
): string {
  if (!isResolved(doubt)) return "";
  return toDate(doubt?.resolved_at || doubt?.revision_checked_at || "");
}


/**
 * Trends are comparable only when both reporting periods are complete,
 * non-future periods in the same view. A complete month/week must never be
 * compared with a clipped academic-year boundary or an in-progress period.
 */
export function canCompareTrackRecordPeriods(
  current: TrackRecordPeriod,
  previous?: TrackRecordPeriod | null,
): boolean {
  return Boolean(
    previous &&
    current.view === previous.view &&
    !current.isPartial &&
    !previous.isPartial &&
    !current.isFuture &&
    !previous.isFuture
  );
}

/**
 * Return a semantic trend tone rather than assuming every numeric increase is good.
 * Metrics without an unambiguous quality direction remain neutral.
 */
export function getTrackRecordTrendTone(
  metricId: string,
  currentValue: number | null | undefined,
  previousValue: number | null | undefined,
): "up" | "down" | "neutral" {
  if (currentValue == null || previousValue == null || currentValue === previousValue) return "neutral";
  const higherIsBetter = new Set([
    "feedback", "health", "understanding", "closureRate", "above80",
  ]);
  // New-doubt volume is deliberately neutral: more reports can mean either
  // worsening learning difficulty or improved student disclosure/engagement.
  const lowerIsBetter = new Set([
    "didNotUnderstand", "doubtRate", "below50", "openingDoubts",
    "closingDoubts",
  ]);
  if (higherIsBetter.has(metricId)) return currentValue > previousValue ? "up" : "down";
  if (lowerIsBetter.has(metricId)) return currentValue < previousValue ? "up" : "down";
  return "neutral";
}

/** Exact student understanding percentage; null means no eligible observations. */
export function getStudentUnderstandingPercentage(complete: number, eligible: number): number | null {
  if (!Number.isFinite(complete) || !Number.isFinite(eligible) || eligible <= 0) return null;
  return (complete / eligible) * 100;
}

/** Cap an in-progress reporting period at the end of today's local business date. */
export function getEffectivePeriodEndExclusive(periodEndExclusive: string, today: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(periodEndExclusive) || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return periodEndExclusive;
  const date = new Date(`${today}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  const tomorrow = date.toISOString().slice(0, 10);
  return periodEndExclusive < tomorrow ? periodEndExclusive : tomorrow;
}

/**
 * An inactive assignment without ended_at has an unknown historical end.
 * If it could have existed before this period ended, its overlap cannot be
 * reconstructed safely and the period roster must fail closed.
 */
export function hasUnboundedInactiveAssignment(
  assignments: any[],
  periodEndExclusive: string,
  toDate: (value: unknown) => string,
): boolean {
  return (assignments ?? []).some((assignment: any) => {
    if (assignment?.is_active !== false || toDate(assignment?.ended_at)) return false;
    const created = toDate(assignment?.created_at);
    return !created || created < periodEndExclusive;
  });
}

/**
 * Explain assignment-history uncertainty without claiming a single cause.
 * The interval guard can fail closed for missing/malformed boundaries, reversed
 * intervals, or inactive assignments without an explicit end date.
 */
export function buildAssignmentIntervalWarning(
  className: string,
  sectionName: string,
  subjectName: string,
  periodLabel: string,
): string {
  return `Assignment history for ${className} ${sectionName} ${subjectName} cannot be verified for ${periodLabel}. A start or end boundary may be missing or malformed, the interval may be reversed, or an inactive assignment may lack an explicit ended_at date. Because the interval could overlap this period, all period metrics are unavailable rather than estimated.`;
}

/**
 * Fail closed when assignment interval boundaries cannot establish historical
 * membership for this period. This covers missing/malformed created_at,
 * malformed ended_at, reversed intervals, and inactive rows without ended_at.
 */
export function hasUnverifiableAssignmentInterval(
  assignments: any[],
  periodStart: string,
  periodEndExclusive: string,
  toDate: (value: unknown) => string,
): boolean {
  return (assignments ?? []).some((assignment: any) => {
    const rawStart = assignment?.created_at;
    const start = toDate(rawStart);
    if (!rawStart || !start) return true;

    const rawEnd = assignment?.ended_at;
    const end = toDate(rawEnd);
    if (rawEnd && !end) return start < periodEndExclusive;
    if (end && end < start) {
      // The interval is corrupt. If either recorded boundary touches this
      // period, its actual effective membership cannot be reconstructed.
      const earliestBoundary = end < start ? end : start;
      const latestBoundary = end < start ? start : end;
      return earliestBoundary < periodEndExclusive && latestBoundary >= periodStart;
    }
    if (assignment?.is_active === false && !end) return start < periodEndExclusive;
    return false;
  });
}


/** Build academic-year-bounded month/week periods using date-only UTC arithmetic. */
export function buildTrackRecordPeriods(
  startDate: string,
  view: TrackRecordView,
  today: string,
  academicEndExclusive: string,
): TrackRecordPeriod[] {
  const valid = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!valid(startDate) || !valid(today) || !valid(academicEndExclusive) || startDate >= academicEndExclusive) return [];
  const add = (date: string, days: number) => {
    const value = new Date(`${date}T00:00:00.000Z`);
    value.setUTCDate(value.getUTCDate() + days);
    return value.toISOString().slice(0, 10);
  };
  const firstOfMonth = (date: string) => `${date.slice(0, 7)}-01`;
  const format = (date: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-IN", { ...options, timeZone: "UTC" }).format(new Date(`${date}T00:00:00.000Z`));
  const tomorrow = add(today, 1);
  if (view === "monthly") {
    const periods: TrackRecordPeriod[] = [];
    const currentMonth = firstOfMonth(today);
    const firstMonth = firstOfMonth(startDate);
    let cursor = firstMonth;
    while (cursor < academicEndExclusive) {
      const date = new Date(`${cursor}T00:00:00.000Z`);
      const next = new Date(date);
      next.setUTCMonth(next.getUTCMonth() + 1);
      const naturalEnd = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-01`;
      const end = naturalEnd < academicEndExclusive ? naturalEnd : academicEndExclusive;
      const visibleStart = cursor === firstMonth ? startDate : cursor;
      const isFuture = visibleStart > today || cursor > currentMonth;
      const isCurrentPartial = !isFuture && cursor === currentMonth && end > today;
      const isBoundaryPartial = visibleStart > cursor || end < naturalEnd;
      const isPartial = isCurrentPartial || isBoundaryPartial;
      const suffix = isCurrentPartial ? " · MTD" : isBoundaryPartial ? " · Partial" : "";
      const label = `${format(cursor, { month: "short", year: "numeric" })}${suffix}`;
      periods.push({ id: cursor, view, label, startDate: visibleStart, endDateExclusive: end, isFuture, isPartial });
      cursor = end;
    }
    return periods;
  }
  const startDateObj = new Date(`${startDate}T00:00:00.000Z`);
  let cursor = add(startDate, -((startDateObj.getUTCDay() + 6) % 7));
  const todayDate = new Date(`${today}T00:00:00.000Z`);
  const currentMonday = add(today, -((todayDate.getUTCDay() + 6) % 7));
  const periods: TrackRecordPeriod[] = [];
  let index = 1;
  while (cursor < academicEndExclusive) {
    const naturalEnd = add(cursor, 7);
    const end = naturalEnd < academicEndExclusive ? naturalEnd : academicEndExclusive;
    const visibleStart = cursor < startDate ? startDate : cursor;
    const isFuture = visibleStart > today || cursor > currentMonday;
    const isCurrentPartial = !isFuture && cursor === currentMonday && end > today;
    const isBoundaryPartial = visibleStart > cursor || end < naturalEnd;
    const isPartial = isCurrentPartial || isBoundaryPartial;
    const suffix = isCurrentPartial ? " · WTD" : isBoundaryPartial ? " · Partial" : "";
    const label = `W${index} · ${format(visibleStart, { month: "short", day: "numeric" })}–${format(add(end, -1), { month: "short", day: "numeric" })}${suffix}`;
    periods.push({ id: cursor, view, label, startDate: visibleStart, endDateExclusive: end, isFuture, isPartial });
    cursor = end;
    index++;
  }
  return periods;
}


/**
 * Select the canonical School Overview doubt cohort for one Track Record
 * period. School Overview scopes pending_teacher_doubts by active assignment
 * UUIDs and log_date only, then calls calculateDoubtClosureRate on these rows.
 * Keep this selector deliberately free of row metadata, creation-date,
 * carry-forward, and assignment-effective-date predicates.
 */
/**
 * School Overview's monthly date filter is calendar-month scoped, even when
 * Track Record clips the visible first-month start to an academic-year or
 * teacher/assignment timeline boundary. Keep the closure cohort on the same
 * natural month boundary; weekly periods retain their displayed clipped
 * start because their first/last week is explicitly a partial week.
 */
export function getSchoolOverviewDoubtClosureStartDate(period: TrackRecordPeriod): string {
  if (period?.view === "monthly" && /^\d{4}-\d{2}-01$/.test(period.id)) {
    return period.id;
  }
  return period?.startDate ?? "";
}

export function selectSchoolOverviewDoubtClosureCohort<T extends {
  teacher_assignment_uuid?: unknown;
  log_date?: unknown;
}>(
  rows: readonly T[],
  activeAssignmentIds: ReadonlySet<string>,
  startDate: string,
  endDateExclusive: string,
  toDate: (value: unknown) => string,
): T[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(endDateExclusive) ||
      endDateExclusive <= startDate) return [];
  return (rows ?? []).filter(row => {
    const assignmentId = String(row?.teacher_assignment_uuid ?? "").trim();
    const logDate = toDate(row?.log_date);
    return Boolean(assignmentId && activeAssignmentIds.has(assignmentId) &&
      logDate && logDate >= startDate && logDate < endDateExclusive);
  });
}

const PARTIAL_PERIOD_RATE_METRICS = new Set([
  "feedback", "health", "understanding", "partial", "didNotUnderstand",
  "doubtRate", "closureRate", "below50", "above80",
]);

/**
 * Ratio metrics can be directionally compared across partial periods because
 * their denominators are normalized. Raw volume metrics remain neutral when
 * either period is partial, avoiding misleading month/week volume colours.
 */
export function canCompareTrackRecordMetricPeriods(
  current: TrackRecordPeriod,
  previous: TrackRecordPeriod | null | undefined,
  metricId: string,
): boolean {
  if (!previous || current.view !== previous.view || current.isFuture || previous.isFuture) {
    return false;
  }
  if (!current.isPartial && !previous.isPartial) return true;
  return PARTIAL_PERIOD_RATE_METRICS.has(metricId);
}
