import { getSupabaseClient } from "../../../supabaseClient";
import { requireIdentity } from "../../../services/identityService";
import {
  getStudentLiveDoubtRows,
  mergePendingDoubtsWithLiveLedger,
} from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";

export interface StudentExamPreparationOptions {
  startDate?: string;
  endDateExclusive?: string;
}

function getAttentionLevel(count: number) {
  if (count >= 6) return "HIGH";
  if (count >= 3) return "MEDIUM";
  return "LOW";
}

function dateKey(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);
  return `${parts.find(p => p.type === "year")?.value ?? ""}-${parts.find(p => p.type === "month")?.value ?? ""}-${parts.find(p => p.type === "day")?.value ?? ""}`;
}

function inRange(value: unknown, startDate?: string, endDateExclusive?: string) {
  if (!startDate && !endDateExclusive) return true;
  const key = dateKey(value);
  if (!key) return false;
  if (startDate && key < startDate) return false;
  if (endDateExclusive && key >= endDateExclusive) return false;
  return true;
}

function originalDoubtDate(row: any) {
  // first_seen_at is the canonical historical day. Resolution time must never
  // move an old doubt into the day on which the student resolved it.
  return (
    row?.first_seen_at ??
    row?.log_date ??
    row?.source_submitted_at ??
    row?.latest_source_submitted_at ??
    row?.created_at
  );
}

function buildSignals(rows: any[]) {
  const topicMap = new Map<string, number>();
  const conceptMap = new Map<string, number>();

  for (const row of rows) {
    const topic = String(row?.previous_topic_name ?? "").trim();
    if (topic) topicMap.set(topic, (topicMap.get(topic) ?? 0) + 1);

    const concept = String(row?.previous_difficult_concept ?? "").trim();
    if (concept) conceptMap.set(concept, (conceptMap.get(concept) ?? 0) + 1);
  }

  const topics = Array.from(topicMap.entries())
    .map(([topic, signals]) => ({ topic, signals }))
    .sort((a, b) => b.signals - a.signals || a.topic.localeCompare(b.topic));

  const concepts = Array.from(conceptMap.entries())
    .map(([concept, signals]) => ({ concept, signals }))
    .sort((a, b) => b.signals - a.signals || a.concept.localeCompare(b.concept));

  return { topics, concepts };
}

export async function getStudentExamPreparationIntelligence(
  options: StudentExamPreparationOptions = {}
) {
  const identity = requireIdentity();
  const supabase = getSupabaseClient();

  const { data, error } = await (supabase as any)
    .from("pending_teacher_doubts")
    .select("*")
    .eq("student_uuid", identity.studentUuid)
    .eq("status", "NOT DISCUSSED");

  if (error) throw error;

  const pendingRows = (data ?? []).filter((row: any) =>
    inRange(row?.log_date ?? row?.created_at, options.startDate, options.endDateExclusive)
  );

  let liveRows: any[] = [];
  try {
    liveRows = (await getStudentLiveDoubtRows()).filter((row: any) =>
      inRange(originalDoubtDate(row), options.startDate, options.endDateExclusive)
    );
  } catch (liveError) {
    // Loop 2 remains authoritative if the optional live layer is unavailable.
    console.error("STUDENT EXAM PREPARATION LIVE OVERLAY FAILED", liveError);
  }

  const merged = mergePendingDoubtsWithLiveLedger(
    pendingRows,
    liveRows,
    { includeUnmatchedLive: true }
  );

  const unresolved = merged.filter(
    (row: any) => String(row?.status ?? "").trim().toUpperCase() === "NOT DISCUSSED"
  );

  const bySubject = new Map<string, any[]>();
  for (const row of unresolved) {
    const subject = String(row?.subject_name ?? "Other").trim() || "Other";
    const list = bySubject.get(subject) ?? [];
    list.push(row);
    bySubject.set(subject, list);
  }

  const subjectBreakdown = Array.from(bySubject.entries())
    .map(([subject, rows]) => {
      const { topics, concepts } = buildSignals(rows);
      return {
        subject,
        totalUnresolvedDoubts: rows.length,
        // Row 2: every Loop-2 unresolved subtopic, with repetition count.
        topics,
        // Kept as a compatibility field for existing consumers.
        concepts,
        // Row 3: the highest-risk repeated subtopic, not a teacher exam metric.
        highestRiskTopic: topics[0]?.topic ?? "",
        attentionLevel: getAttentionLevel(rows.length),
      };
    })
    .sort(
      (a, b) =>
        b.totalUnresolvedDoubts - a.totalUnresolvedDoubts ||
        a.subject.localeCompare(b.subject)
    );

  const totalUnresolvedDoubts = unresolved.length;
  const allSignals = buildSignals(unresolved);

  return {
    totalUnresolvedDoubts,
    topics: allSignals.topics.map(item => item.topic),
    highestRiskTopic: allSignals.topics[0]?.topic ?? "",
    attentionLevel: getAttentionLevel(totalUnresolvedDoubts),
    subjectBreakdown,
    // Compatibility/debug payload for the live service layer. No UI relies on it.
    _effectiveRows: unresolved,
  };
}
