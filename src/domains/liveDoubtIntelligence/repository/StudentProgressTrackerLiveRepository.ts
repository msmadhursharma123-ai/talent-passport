import { getSupabaseClient } from "../../../supabaseClient";
import { getTableIdentity } from "../../../services/identityService";
import {
  effectiveUnderstandingFromLiveFeedback,
  getStudentLiveDoubtRows,
  syncStudentLiveDoubtLedger,
  type LiveDoubtRow,
} from "../repository/LiveDoubtReconciliationRepository";

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
  liveCalculatedThrough?: string | null;
}

function monthRange(selectedMonth: string) {
  const parts = selectedMonth.split(" ");
  const monthName = parts[0];
  const year = Number(parts[1]);
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const month = months.indexOf(monthName);
  if (month < 0 || !Number.isFinite(year)) throw new Error(`Invalid month: ${selectedMonth}`);
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const endDate = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-01`;
  return { year, month, startDate, endDate };
}

export async function getStudentProgressTrackerLive(subjectName: string, selectedMonth: string): Promise<StudentProgressTracker> {
  const studentUuid = getTableIdentity("students");
  if (!studentUuid) throw new Error("Student identity not found.");
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { year, month, startDate, endDate } = monthRange(selectedMonth);
  await syncStudentLiveDoubtLedger(studentUuid);

  const [{ data: feedback, error: feedbackError }, liveRows] = await Promise.all([
    (supabase as any)
      .from("student_daily_feedback")
      .select("id,daily_log_uuid,student_uuid,subject_name,understanding_level,concepts_not_understood,submitted_at")
      .eq("student_uuid", studentUuid)
      .eq("subject_name", subjectName)
      .gte("submitted_at", `${startDate}T00:00:00`)
      .lt("submitted_at", `${endDate}T00:00:00`)
      .order("submitted_at", { ascending: true }),
    getStudentLiveDoubtRows(studentUuid),
  ]);

  if (feedbackError) throw feedbackError;
  const rows = (feedback ?? []).map((item: any) => ({
    ...item,
    effective_understanding_level: effectiveUnderstandingFromLiveFeedback(item, liveRows as LiveDoubtRow[]),
  }));

  const totalDays = new Date(year, month + 1, 0).getDate();
  const feedbackMap = new Map<string, string>();
  rows.forEach((item: any) => {
    if (!item.submitted_at) return;
    feedbackMap.set(String(item.submitted_at).split("T")[0], item.effective_understanding_level ?? item.understanding_level ?? "");
  });

  const calendar: StudentCalendarDay[] = [];
  for (let day = 1; day <= totalDays; day++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendar.push({ date, understandingLevel: feedbackMap.get(date) ?? "" });
  }

  const completelyUnderstood = rows.filter((item: any) => item.effective_understanding_level === "I completely understood.").length;
  const partiallyUnderstood = rows.filter((item: any) => item.effective_understanding_level === "I partially understood.").length;
  const didntUnderstand = rows.filter((item: any) => item.effective_understanding_level === "I didn't understand.").length;
  const trackedDays = rows.length;
  const assistanceNeeded = partiallyUnderstood + didntUnderstand;
  const satisfactionRate = trackedDays === 0 ? 0 : Math.round((completelyUnderstood / trackedDays) * 100);

  const weekMap = new Map<number, any[]>();
  rows.forEach((item: any) => {
    if (!item.submitted_at) return;
    const day = new Date(item.submitted_at).getDate();
    const week = Math.ceil(day / 7);
    weekMap.set(week, [...(weekMap.get(week) ?? []), item]);
  });

  const weeklyBreakdown = Array.from(weekMap.entries()).map(([week, items]) => {
    const complete = items.filter((x: any) => x.effective_understanding_level === "I completely understood.").length;
    const partial = items.filter((x: any) => x.effective_understanding_level === "I partially understood.").length;
    const didnt = items.filter((x: any) => x.effective_understanding_level === "I didn't understand.").length;
    const healthScore = items.length === 0 ? 0 : Math.round(((complete + partial * 0.5) / items.length) * 100);
    return {
      week: `Week ${week}`,
      trackedDays: items.length,
      completelyUnderstood: complete,
      partiallyUnderstood: partial,
      didntUnderstand: didnt,
      healthScore,
    };
  });

  const liveCalculatedThrough = liveRows
    .map(row => row.updated_at ?? row.last_seen_at ?? row.source_submitted_at ?? null)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;

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
    liveCalculatedThrough,
  };
}
