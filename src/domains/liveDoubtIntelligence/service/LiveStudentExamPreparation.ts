import { getSupabaseClient } from "../../../supabaseClient";
import { requireIdentity } from "../../../services/identityService";
import { getStudentExamPreparationIntelligence } from "../../teacherIntelligence/repository/StudentExamPreparationRepository";
import {
  getStudentLiveDoubtRows,
  mergePendingDoubtsWithLiveLedger,
  syncStudentLiveDoubtLedger,
} from "../repository/LiveDoubtReconciliationRepository";

interface SubjectBreakdown {
  subject: string;
  totalUnresolvedDoubts: number;
  concepts: Array<{ concept: string; signals: number }>;
  topics: Array<{ topic: string; signals: number }>;
  highestRiskTopic: string;
  attentionLevel: string;
}

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalize(value: unknown): string {
  return clean(value).toLowerCase().replace(/\s+/g, " ");
}

function subjectFor(row: any): string {
  return clean(row?.subject_name ?? row?.subject) || "Other";
}

function conceptFor(row: any): string {
  return clean(
    row?.previous_difficult_concept ??
      row?.doubt_concept ??
      row?.previous_topic_name ??
      row?.topic_name
  );
}

function topicFor(row: any): string {
  return clean(
    row?.previous_topic_name ??
      row?.topic_name ??
      row?.doubt_concept ??
      row?.previous_difficult_concept
  );
}

function attentionLevel(count: number): string {
  if (count >= 6) return "HIGH";
  if (count >= 3) return "MEDIUM";
  return "LOW";
}

function buildSubjectBreakdown(rows: any[]): SubjectBreakdown[] {
  const bySubject = new Map<
    string,
    {
      subject: string;
      concepts: Map<string, { label: string; signals: number }>;
      topics: Map<string, { label: string; signals: number }>;
    }
  >();

  for (const row of rows) {
    const subject = subjectFor(row);
    const subjectKey = normalize(subject);

    const current = bySubject.get(subjectKey) ?? {
      subject,
      concepts: new Map(),
      topics: new Map(),
    };

    const concept = conceptFor(row);
    if (concept) {
      const key = normalize(concept);
      const existing = current.concepts.get(key);
      current.concepts.set(key, {
        label: existing?.label ?? concept,
        signals: (existing?.signals ?? 0) + 1,
      });
    }

    const topic = topicFor(row);
    if (topic) {
      const key = normalize(topic);
      const existing = current.topics.get(key);
      current.topics.set(key, {
        label: existing?.label ?? topic,
        signals: (existing?.signals ?? 0) + 1,
      });
    }

    bySubject.set(subjectKey, current);
  }

  return Array.from(bySubject.values())
    .map((entry) => {
      const concepts = Array.from(entry.concepts.values())
        .sort((a, b) => b.signals - a.signals || a.label.localeCompare(b.label))
        .map((item) => ({ concept: item.label, signals: item.signals }));

      const topics = Array.from(entry.topics.values())
        .sort((a, b) => b.signals - a.signals || a.label.localeCompare(b.label))
        .map((item) => ({ topic: item.label, signals: item.signals }));

      const totalUnresolvedDoubts = rows.filter(
        (row) => normalize(subjectFor(row)) === normalize(entry.subject)
      ).length;

      return {
        subject: entry.subject,
        totalUnresolvedDoubts,
        concepts,
        topics,
        highestRiskTopic: topics[0]?.topic ?? concepts[0]?.concept ?? "-",
        attentionLevel: attentionLevel(totalUnresolvedDoubts),
      };
    })
    .sort(
      (a, b) =>
        b.totalUnresolvedDoubts - a.totalUnresolvedDoubts ||
        a.subject.localeCompare(b.subject)
    );
}

function isActive(row: any): boolean {
  if (row?.doubt_resolved === true) return false;

  const status = clean(row?.status).toUpperCase();
  if (status === "RESOLVED") return false;

  return (
    row?._live_only === true ||
    status === "NOT DISCUSSED" ||
    row?.doubt_resolved === false
  );
}

export async function getStudentExamPreparationIntelligenceWithLiveLayer() {
  const base = await getStudentExamPreparationIntelligence();

  try {
    const identity = requireIdentity();
    const supabase = getSupabaseClient();

    if (!supabase) return base;

    /*
     * The sync is additive. It never changes the original feedback or
     * second-loop tables. It only refreshes the current live ledger.
     */
    await syncStudentLiveDoubtLedger();

    const liveRows = await getStudentLiveDoubtRows();

    /*
     * Read the existing second-loop rows as fallback evidence. We then run
     * the canonical merge exactly once. This prevents a live row from being
     * counted twice and also allows a live-only unresolved first-loop row to
     * appear in Student Exam Preparation.
     */
    const { data: pendingRows, error } = await (supabase as any)
      .from("pending_teacher_doubts")
      .select("*")
      .eq("student_uuid", identity.studentUuid);

    if (error) throw error;

    const merged = mergePendingDoubtsWithLiveLedger(
      Array.isArray(pendingRows) ? pendingRows : [],
      liveRows,
      { includeUnmatchedLive: true }
    );

    const activeRows = merged.filter(isActive);

    const topics = activeRows
      .map(topicFor)
      .filter(Boolean);

    const topicCounts = new Map<string, number>();
    for (const topic of topics) {
      const key = normalize(topic);
      topicCounts.set(key, (topicCounts.get(key) ?? 0) + 1);
    }

    const highestRiskTopic =
      Array.from(topicCounts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? "";

    const subjectBreakdown = buildSubjectBreakdown(activeRows);

    return {
      totalUnresolvedDoubts: activeRows.length,
      topics,
      highestRiskTopic,
      attentionLevel: attentionLevel(activeRows.length),
      subjectBreakdown,
    };
  } catch (error) {
    console.error(
      "LIVE STUDENT EXAM PREPARATION OVERLAY FAILED — ORIGINAL DATA PRESERVED",
      error
    );

    return {
      ...(base ?? {}),
      subjectBreakdown: [],
    };
  }
}
