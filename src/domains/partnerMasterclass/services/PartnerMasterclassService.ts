import {
  getPartnerMasterclassHistory,
  recordPartnerMasterclassCheckin,
  verifyPartnerMasterclassRoll,
} from "../repository/PartnerMasterclassRepository";
import type {
  PartnerMasterclassHistoryFilters,
  PartnerMasterclassHistoryRow,
  PartnerMasterclassVerificationCandidate,
  PartnerMasterclassVerificationResult,
} from "../types/PartnerMasterclassModels";

function indiaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getPreviousCalendarMonthRange(todayKey = indiaDateKey()) {
  const today = parseDateKey(todayKey);
  const firstOfCurrent = new Date(today.getFullYear(), today.getMonth(), 1);
  const previousMonthStart = new Date(
    firstOfCurrent.getFullYear(),
    firstOfCurrent.getMonth() - 1,
    1,
  );
  const previousMonthEnd = new Date(
    firstOfCurrent.getFullYear(),
    firstOfCurrent.getMonth(),
    0,
  );

  return {
    start: toKey(previousMonthStart),
    end: toKey(previousMonthEnd),
    label: new Intl.DateTimeFormat("en-IN", {
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(previousMonthStart),
  };
}

export async function verifyStudentForCurrentMasterclass(
  rollNumber: string,
): Promise<PartnerMasterclassVerificationResult> {
  return verifyPartnerMasterclassRoll(rollNumber);
}

export async function saveVerifiedStudent(
  candidate: PartnerMasterclassVerificationCandidate,
) {
  await recordPartnerMasterclassCheckin(candidate);
}

function dateOnly(value: string) {
  return String(value ?? "").slice(0, 10);
}

function dateToMonth(value: string) {
  return dateOnly(value).slice(0, 7);
}

function monthLabel(key: string) {
  if (!/^\d{4}-\d{2}$/.test(key)) return key;
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function startOfToday() {
  return indiaDateKey();
}

function subtractDays(key: string, days: number) {
  const date = parseDateKey(key);
  date.setDate(date.getDate() - days);
  return toKey(date);
}

function periodBounds(filters: PartnerMasterclassHistoryFilters) {
  const today = startOfToday();

  if (filters.timePeriod === "CUSTOM") {
    const start = filters.customStart || today;
    const end = filters.customEnd || today;
    return start <= end ? { start, end } : { start: end, end: start };
  }

  const days = filters.timePeriod === "LAST_60_DAYS"
    ? 59
    : filters.timePeriod === "LAST_90_DAYS"
      ? 89
      : 29;

  return {
    start: subtractDays(today, days),
    end: today,
  };
}

export function filterPartnerMasterclassHistory(
  rows: PartnerMasterclassHistoryRow[],
  filters: PartnerMasterclassHistoryFilters,
) {
  const bounds = periodBounds(filters);
  const studentQuery = filters.studentName.trim().toLowerCase();
  const rollQuery = filters.rollNumber.trim().toUpperCase();

  return rows.filter((row) => {
    const verifiedDate = dateOnly(row.verifiedAt);
    if (!verifiedDate || verifiedDate < bounds.start || verifiedDate > bounds.end) return false;

    if (
      studentQuery &&
      !row.studentName.toLowerCase().includes(studentQuery)
    ) return false;

    if (rollQuery && !row.rollNumber.toUpperCase().includes(rollQuery)) return false;

    if (filters.className !== "ALL" && row.className !== filters.className) return false;
    if (filters.schoolName !== "ALL" && row.schoolName !== filters.schoolName) return false;
    if (filters.month !== "ALL" && dateToMonth(row.verifiedAt) !== filters.month) return false;
    if (filters.year !== "ALL") {
      const verifiedKey = dateOnly(row.verifiedAt);
      const parts = verifiedKey.slice(0, 7).split("-").map(Number);
      const startYear = parts[1] >= 4 ? parts[0] : parts[0] - 1;
      const academicYear = `${startYear}-${String(startYear + 1).slice(-2)}`;
      if (academicYear !== filters.year) return false;
    }

    return true;
  });
}

export async function loadPartnerMasterclassHistory() {
  return getPartnerMasterclassHistory();
}

export function buildHistoryFilterOptions(rows: PartnerMasterclassHistoryRow[]) {
  const classes = Array.from(
    new Set(rows.map((row) => row.className).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  const schools = Array.from(
    new Set(rows.map((row) => row.schoolName).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const months = Array.from(
    new Set(rows.map((row) => dateToMonth(row.verifiedAt)).filter(Boolean)),
  ).sort().reverse();

  const academicYearKey = (dateKey: string) => {
    const [yearText, monthText] = dateKey.slice(0, 7).split("-");
    const year = Number(yearText);
    const month = Number(monthText);
    if (!year || !month) return "";
    const startYear = month >= 4 ? year : year - 1;
    return `${startYear}-${String(startYear + 1).slice(-2)}`;
  };

  const years = Array.from(
    new Set(rows.map((row) => academicYearKey(dateOnly(row.verifiedAt))).filter(Boolean)),
  ).sort().reverse();

  return {
    classes,
    schools,
    months: months.map((key) => ({ value: key, label: monthLabel(key) })),
    years,
  };
}
