import { getSupabaseClient } from "../../../supabaseClient";

import {
  getTableIdentity,
} from "../../../services/identityService";
import {
  getStudentLiveDoubtRows,
  mergeFeedbackUnderstandingLevels,
} from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";

export interface StudentCalendarDay {

  date: string;

  understandingLevel: string;

}

export interface StudentWeeklySummary {

  week: string;

  trackedDays: number;

  completelyUnderstood: number;

  partiallyUnderstood: number;

  didntUnderstand: number;

  healthScore: number;

}

export interface StudentProgressTracker {

  calendar: StudentCalendarDay[];

  stats: {

    trackedDays: number;

    completelyUnderstood: number;

    partiallyUnderstood: number;

    didntUnderstand: number;

    assistanceNeeded: number;

    satisfactionRate: number;

  };

  weeklyBreakdown: StudentWeeklySummary[];

}

export async function getStudentProgressTracker(
  subjectName: string,
  selectedMonth: string
): Promise<StudentProgressTracker> {

  const studentUuid =
    getTableIdentity("students");

  if (!studentUuid) {
    throw new Error(
      "Student identity not found."
    );
  }

  const supabase =
    getSupabaseClient();
  // The Progress Tracker dropdown is also the authoritative period for the
  // embedded Student Exam Preparation table. This event is additive and does
  // not alter the existing tracker contract.
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      "talentPassport.progressTracker.selectedMonth",
      selectedMonth
    );
    window.dispatchEvent(
      new CustomEvent("talentPassport:progressTrackerMonthChanged", {
        detail: { selectedMonth },
      })
    );
  }

  /*
  --------------------------------------
  SELECTED MONTH
  --------------------------------------
  */

  const monthParts =
    selectedMonth.split(" ");

  const monthName =
    monthParts[0];

  const year =
    Number(monthParts[1]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month =
    monthNames.indexOf(
      monthName
    );

  if (month === -1) {
    throw new Error(
      `Invalid month: ${selectedMonth}`
    );
  }

  const startDate =
    `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const nextMonth =
    month === 11
      ? 0
      : month + 1;

  const nextMonthYear =
    month === 11
      ? year + 1
      : year;

  const endDate =
    `${nextMonthYear}-${String(nextMonth + 1).padStart(2, "0")}-01`;

  /*
  --------------------------------------
  FETCH STUDENT FEEDBACK
  --------------------------------------
  */

  const {
    data,
    error,
  } = await (supabase as any)

    .from(
      "student_daily_feedback"
    )

    .select(`
      understanding_level,
      submitted_at,
      subject_name
    `)

    .eq(
      "student_uuid",
      studentUuid
    )

    .eq(
      "subject_name",
      subjectName
    )

    .gte(
      "submitted_at",
      `${startDate}T00:00:00`
    )

    .lt(
      "submitted_at",
      `${endDate}T00:00:00`
    )

    .order(
      "submitted_at",
      {
        ascending: true,
      }
    );

  if (error) {
    throw error;
  }

  let rows =
    data ?? [];

  try {
    const liveRows = (await getStudentLiveDoubtRows()).filter((row: any) => {
      const value =
        row?.first_seen_at ??
        row?.log_date ??
        row?.source_submitted_at ??
        row?.latest_source_submitted_at ??
        row?.created_at;
      const parsed = new Date(String(value ?? ""));
      if (Number.isNaN(parsed.getTime())) return false;
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(parsed);
      const dateKey = `${parts.find(p => p.type === "year")?.value ?? ""}-${parts.find(p => p.type === "month")?.value ?? ""}-${parts.find(p => p.type === "day")?.value ?? ""}`;
      return dateKey >= startDate && dateKey < endDate;
    });

    rows = mergeFeedbackUnderstandingLevels(rows, liveRows);
  } catch (liveError) {
    console.error(
      "STUDENT PROGRESS LIVE OVERLAY FAILED — ORIGINAL FEEDBACK PRESERVED",
      liveError
    );
  }

  console.log(
    "===== STUDENT PROGRESS ====="
  );

  console.log(
    "Student UUID",
    studentUuid
  );

  console.log(
    "Subject",
    subjectName
  );

  console.log(
    "Month",
    selectedMonth
  );

  console.log(
    "Date Range",
    startDate,
    endDate
  );

  console.log(
    "Returned Rows"
  );

  console.table(
    rows
  );

  /*
  --------------------------------------
  CALENDAR
  --------------------------------------
  */

  const totalDays =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const feedbackMap =
    new Map<
      string,
      string
    >();

  rows.forEach(
    (item: any) => {

      if (!item.submitted_at) {
        return;
      }

      const date =
        item.submitted_at
          .split("T")[0];

      feedbackMap.set(
        date,
        item.understanding_level
      );

    }
  );

  const calendar:
    StudentCalendarDay[] = [];

  for (
    let day = 1;
    day <= totalDays;
    day++
  ) {

    const isoDate =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    calendar.push({
      date: isoDate,

      understandingLevel:
        feedbackMap.get(
          isoDate
        ) ?? "",
    });

  }

  /*
  --------------------------------------
  STATS
  --------------------------------------
  */

  const completelyUnderstood =
    rows.filter(
      (item: any) =>
        item.understanding_level ===
        "I completely understood."
    ).length;

  const partiallyUnderstood =
    rows.filter(
      (item: any) =>
        item.understanding_level ===
        "I partially understood."
    ).length;

  const didntUnderstand =
    rows.filter(
      (item: any) =>
        item.understanding_level ===
        "I didn't understand."
    ).length;

  const trackedDays =
    rows.length;

  const assistanceNeeded =
    partiallyUnderstood +
    didntUnderstand;

  const satisfactionRate =
    trackedDays === 0
      ? 0
      : Math.round(
          (
            completelyUnderstood /
            trackedDays
          ) * 100
        );

  /*
  --------------------------------------
  WEEKLY BREAKDOWN
  --------------------------------------
  */

  const weekMap =
    new Map<
      number,
      any[]
    >();

  rows.forEach(
    (item: any) => {

      if (!item.submitted_at) {
        return;
      }

      const day =
        new Date(
          item.submitted_at
        ).getDate();

      const week =
        Math.ceil(
          day / 7
        );

      if (
        !weekMap.has(
          week
        )
      ) {
        weekMap.set(
          week,
          []
        );
      }

      weekMap
        .get(week)!
        .push(item);

    }
  );

  const weeklyBreakdown =
    Array.from(
      weekMap.entries()
    ).map(
      ([week, items]) => {

        const complete =
          items.filter(
            (x: any) =>
              x.understanding_level ===
              "I completely understood."
          ).length;

        const partial =
          items.filter(
            (x: any) =>
              x.understanding_level ===
              "I partially understood."
          ).length;

        const didnt =
          items.filter(
            (x: any) =>
              x.understanding_level ===
              "I didn't understand."
          ).length;

        const healthScore =
          items.length === 0
            ? 0
            : Math.round(
                (
                  (
                    complete +
                    partial * 0.5
                  ) /
                  items.length
                ) * 100
              );

        return {
          week:
            `Week ${week}`,

          trackedDays:
            items.length,

          completelyUnderstood:
            complete,

          partiallyUnderstood:
            partial,

          didntUnderstand:
            didnt,

          healthScore,
        };

      }
    );

  return {
    calendar,

    stats: {
      trackedDays,
      completelyUnderstood,
      partiallyUnderstood,
      didntUnderstand,
      assistanceNeeded,
      satisfactionRate,
    },

    weeklyBreakdown,
  };
}