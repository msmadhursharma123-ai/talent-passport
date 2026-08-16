import { getSupabaseClient } from "../../../supabaseClient";
import { requireIdentity } from "../../../services/identityService";
import { getStudentExamPreparationIntelligence } from "../../teacherIntelligence/repository/StudentExamPreparationRepository";
import {
  getStudentLiveDoubtRows,
  mergePendingDoubtsWithLiveLedger,
} from "../repository/LiveDoubtReconciliationRepository";

function attentionLevel(count: number) {
  if (count >= 6) return "HIGH";
  if (count >= 3) return "MEDIUM";
  return "LOW";
}

export async function getStudentExamPreparationIntelligenceWithLiveLayer() {
  const base = await getStudentExamPreparationIntelligence();

  try {
    const identity = requireIdentity();
    const liveRows = await getStudentLiveDoubtRows();

    const reconciled = liveRows.filter(
      (row) => row.last_reconciled_at
    );

    if (!reconciled.length) return base;

    const supabase = getSupabaseClient();
    if (!supabase) return base;

    const { data, error } = await (supabase as any)
      .from("pending_teacher_doubts")
      .select("*")
      .eq("student_uuid", identity.studentUuid)
      .eq("status", "NOT DISCUSSED");

    if (error) throw error;

    const merged = mergePendingDoubtsWithLiveLedger(
      data ?? [],
      reconciled
    ).filter(
      (row: any) =>
        row.doubt_resolved !== true &&
        String(row.status ?? "").trim().toUpperCase() !== "RESOLVED"
    );

    const topics = merged
      .map((row: any) =>
        String(
          row.previous_topic_name ??
          row.previous_difficult_concept ??
          ""
        ).trim()
      )
      .filter(Boolean);

    const topicMap = new Map<string, number>();
    topics.forEach((topic) =>
      topicMap.set(topic, (topicMap.get(topic) ?? 0) + 1)
    );

    const highestRiskTopic =
      Array.from(topicMap.entries()).sort(
        (a, b) => b[1] - a[1]
      )[0]?.[0] ?? "";

    return {
      totalUnresolvedDoubts: merged.length,
      topics,
      highestRiskTopic,
      attentionLevel: attentionLevel(merged.length),
    };
  } catch (error) {
    console.error(
      "LIVE STUDENT EXAM PREPARATION OVERLAY FAILED — ORIGINAL DATA PRESERVED",
      error
    );
    return base;
  }
}
