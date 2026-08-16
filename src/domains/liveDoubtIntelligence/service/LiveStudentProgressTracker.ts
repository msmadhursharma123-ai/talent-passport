import { getSupabaseClient } from "../../../supabaseClient";
import { getStudentProgressTracker, type StudentProgressTracker } from "../../teacherIntelligence/repository/StudentProgressTrackerRepository";
import { requireIdentity } from "../../../services/identityService";
import {
  getStudentLiveDoubtRows,
  normalizeLiveConcept,
} from "../repository/LiveDoubtReconciliationRepository";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

function monthBounds(selectedMonth?: string) {
  if (!selectedMonth) return null;

  const match = selectedMonth.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;

  const date = new Date(
    `${match[1]} 1, ${match[2]} 00:00:00`
  );

  if (Number.isNaN(date.getTime())) return null;

  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );

  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  );

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function effectiveRows(rows: any[], liveRows: any[]) {
  if (!liveRows.length) return rows;

  const byFeedback = new Map<string, any[]>();

  for (const live of liveRows) {
    const ids = [
      live.source_feedback_id,
      live.latest_source_feedback_id,
    ].filter(Boolean);

    for (const id of ids) {
      const list = byFeedback.get(String(id)) ?? [];
      list.push(live);
      byFeedback.set(String(id), list);
    }
  }

  return rows.map((row) => {
    const related = byFeedback.get(String(row.id ?? "")) ?? [];
    if (!related.length) return row;

    const concepts = Array.isArray(row.concepts_not_understood)
      ? row.concepts_not_understood.filter(Boolean)
      : [];

    const allResolved =
      concepts.length > 0 &&
      concepts.every((concept: string) =>
        related.some(
          (live) =>
            !live.is_unresolved &&
            normalizeLiveConcept(live.doubt_concept) ===
              normalizeLiveConcept(concept)
        )
      );

    return allResolved
      ? { ...row, understanding_level: COMPLETE }
      : row;
  });
}

export async function getStudentProgressTrackerWithLiveLayer(
  selectedSubject?: string,
  selectedMonth?: string
): Promise<StudentProgressTracker> {
  const base = await getStudentProgressTracker();

  try {
    const identity = requireIdentity();
    const supabase = getSupabaseClient();
    if (!supabase) return base;

    const bounds = monthBounds(selectedMonth);

    let query = (supabase as any)
      .from("student_daily_feedback")
      .select(
        "id,subject_name,understanding_level,concepts_not_understood,submitted_at,created_at"
      )
      .eq("student_uuid", identity.studentUuid)
      .order("submitted_at", { ascending: true });

    if (selectedSubject) {
      query = query.eq("subject_name", selectedSubject);
    }

    if (bounds) {
      query = query
        .gte("submitted_at", bounds.start)
        .lt("submitted_at", bounds.end);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = effectiveRows(
      data ?? [],
      (await getStudentLiveDoubtRows()).filter(
        (row) => row.last_reconciled_at
      )
    );

    if (!rows.length) return base;

    const calendar = rows.map((row: any) => ({
      date: String(
        row.submitted_at ?? row.created_at ?? ""
      ).split("T")[0],
      understandingLevel: row.understanding_level,
    }));

    const completelyUnderstood = rows.filter(
      (row: any) => row.understanding_level === COMPLETE
    ).length;

    const partiallyUnderstood = rows.filter(
      (row: any) => row.understanding_level === PARTIAL
    ).length;

    const didntUnderstand = rows.filter(
      (row: any) => row.understanding_level === NONE
    ).length;

    const trackedDays = rows.length;
    const assistanceNeeded =
      partiallyUnderstood + didntUnderstand;

    const satisfactionRate =
      trackedDays === 0
        ? 0
        : Math.round(
            (completelyUnderstood / trackedDays) * 100
          );

    const weekMap = new Map<number, any[]>();

    rows.forEach((row: any) => {
      const rawDate =
        row.submitted_at ?? row.created_at ?? "";
      const day = new Date(rawDate).getDate();
      const week = Math.ceil(day / 7);
      const list = weekMap.get(week) ?? [];
      list.push(row);
      weekMap.set(week, list);
    });

    const weeklyBreakdown = Array.from(
      weekMap.entries()
    ).map(([week, items]) => {
      const complete = items.filter(
        (row: any) => row.understanding_level === COMPLETE
      ).length;

      const partial = items.filter(
        (row: any) => row.understanding_level === PARTIAL
      ).length;

      const didnt = items.filter(
        (row: any) => row.understanding_level === NONE
      ).length;

      const healthScore =
        items.length === 0
          ? 0
          : Math.round(
              ((complete + partial * 0.5) /
                items.length) *
                100
            );

      return {
        week: `Week ${week}`,
        trackedDays: items.length,
        completelyUnderstood: complete,
        partiallyUnderstood: partial,
        didntUnderstand: didnt,
        healthScore,
      };
    });

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
  } catch (error) {
    console.error(
      "LIVE STUDENT PROGRESS OVERLAY FAILED — ORIGINAL DATA PRESERVED",
      error
    );
    return base;
  }
}
