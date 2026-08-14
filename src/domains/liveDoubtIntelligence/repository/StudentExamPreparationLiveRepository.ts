import { requireIdentity } from "../../../services/identityService";
import {
  getStudentLiveDoubtRows,
  syncStudentLiveDoubtLedger,
} from "../repository/LiveDoubtReconciliationRepository";

export async function getStudentExamPreparationIntelligenceLive() {
  const identity = requireIdentity();
  await syncStudentLiveDoubtLedger(identity.studentUuid);
  const rows = (await getStudentLiveDoubtRows(identity.studentUuid)).filter(row => row.is_unresolved);

  const grouped = new Map<string, any[]>();
  rows.forEach(row => {
    const subject = String(row.subject_name ?? "Subject").trim() || "Subject";
    grouped.set(subject, [...(grouped.get(subject) ?? []), row]);
  });

  const topics = Array.from(new Set(rows.map(row => String(row.topic_name ?? row.doubt_concept ?? "").trim()).filter(Boolean)));
  const topicCounts = new Map<string, number>();
  rows.forEach(row => {
    const topic = String(row.topic_name ?? row.doubt_concept ?? "").trim();
    if (topic) topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
  });

  const highestRiskTopic = Array.from(topicCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
  const totalUnresolvedDoubts = rows.length;

  return {
    totalUnresolvedDoubts,
    topics,
    highestRiskTopic,
    attentionLevel: totalUnresolvedDoubts >= 6 ? "HIGH" : totalUnresolvedDoubts >= 3 ? "MEDIUM" : "LOW",
    bySubject: Array.from(grouped.entries()).map(([subjectName, subjectRows]) => ({
      subjectName,
      totalUnresolvedDoubts: subjectRows.length,
      topics: Array.from(new Set(subjectRows.map(row => String(row.topic_name ?? row.doubt_concept ?? "").trim()).filter(Boolean))),
      doubts: subjectRows.map(row => row.doubt_concept),
    })).sort((a, b) => b.totalUnresolvedDoubts - a.totalUnresolvedDoubts),
    liveCalculatedThrough: rows
      .map(row => row.updated_at ?? row.last_seen_at ?? row.source_submitted_at ?? null)
      .filter(Boolean)
      .sort()
      .at(-1) ?? null,
  };
}
