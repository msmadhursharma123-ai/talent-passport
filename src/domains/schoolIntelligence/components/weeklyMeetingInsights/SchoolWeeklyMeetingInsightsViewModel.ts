import { getSchoolWeeklyMeetingRawData } from "./SchoolWeeklyMeetingInsightsRepository";
import {
  addDays,
  buildSchoolWeeklyMeetingInsights,
  mondayOfWeek,
  getTodayIndiaDateKey,
} from "./SchoolWeeklyMeetingInsightsEngine";

export async function loadSchoolWeeklyMeetingInsights(
  startDate: string,
  endDate: string,
) {
  if (!startDate || !endDate) {
    throw new Error("Select both a start date and an end date.");
  }
  if (startDate > endDate) {
    throw new Error("Start date cannot be after end date.");
  }
  if (endDate > getTodayIndiaDateKey()) {
    throw new Error("Weekly meeting reports cannot include future dates.");
  }

  const raw = await getSchoolWeeklyMeetingRawData(startDate, endDate);
  return buildSchoolWeeklyMeetingInsights(raw, startDate, endDate, raw.schoolHolidays);
}

export function getPreviousCompletedWeek(todayKey = getTodayIndiaDateKey()) {
  const currentMonday = mondayOfWeek(todayKey);
  const startDate = addDays(currentMonday, -7);
  return {
    startDate,
    endDate: addDays(startDate, 6),
  };
}