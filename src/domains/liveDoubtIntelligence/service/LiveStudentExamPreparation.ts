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

function isActiveLoop2Row(row: any): boolean {
  if (row?.doubt_resolved === true) return false;

  const status = clean(row?.status).toUpperCase();
  if (status === "RESOLVED") return false;

  return status === "NOT DISCUSSED" || row?.doubt_resolved === false;
}

export async function getStudentExamPreparationIntelligenceWithLiveLayer(
  selectedSubject?: string,
  selectedMonth?: string
) {
  const base = await getStudentExamPreparationIntelligence();

  try {
    const identity = requireIdentity();
    const supabase = getSupabaseClient();

    if (!supabase) return base;

    const monthBounds = (() => {
      const value = String(selectedMonth ?? "").trim();
      if (!value) return null;

      const match = value.match(/^([A-Za-z]+)\s+(\d{4})$/);
      if (!match) return null;

      const date = new Date(`${match[1]} 1, ${match[2]} 00:00:00`);
      if (Number.isNaN(date.getTime())) return null;

      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

      const toDate = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;

      return { start: toDate(start), end: toDate(end) };
    })();

    // LOOP 2 IS THE SOURCE OF TRUTH.
    // No class-subject list or available-subject list is injected here.
    let pendingQuery = (supabase as any)
      .from("pending_teacher_doubts")
      .select("*")
      .eq("student_uuid", identity.studentUuid);

    if (
      selectedSubject &&
      selectedSubject !== "ALL_SUBJECTS" &&
      normalize(selectedSubject) !== "all subjects"
    ) {
      pendingQuery = pendingQuery.eq("subject_name", selectedSubject);
    }

    if (monthBounds) {
      pendingQuery = pendingQuery
        .gte("log_date", monthBounds.start)
        .lt("log_date", monthBounds.end);
    }

    const { data: pendingRows, error } = await pendingQuery;
    if (error) throw error;

    const loop2Rows = Array.isArray(pendingRows) ? pendingRows : [];

    const buildResult = (rows: any[]) => {
      const topics = rows.map(topicFor).filter(Boolean);
      const topicCounts = new Map<string, { label: string; count: number }>();

      for (const topic of topics) {
        const key = normalize(topic);
        const current = topicCounts.get(key);
        topicCounts.set(key, {
          label: current?.label ?? topic,
          count: (current?.count ?? 0) + 1,
        });
      }

      const highestRiskTopic =
        Array.from(topicCounts.values()).sort(
          (a, b) => b.count - a.count || a.label.localeCompare(b.label)
        )[0]?.label ?? "";

      return {
        totalUnresolvedDoubts: rows.length,
        topics,
        highestRiskTopic,
        attentionLevel: attentionLevel(rows.length),
        subjectBreakdown: buildSubjectBreakdown(rows),
      };
    };

    // This is the exact pre-live Loop-2 result.
    const loop2Result = buildResult(loop2Rows);

    try {
      // LIVE LAYER: reconcile/upgrade existing Loop-2 rows only.
      await syncStudentLiveDoubtLedger();

      const liveRows = await getStudentLiveDoubtRows();

      const merged = mergePendingDoubtsWithLiveLedger(
        loop2Rows,
        liveRows
      );

      // Live can resolve/update an existing Loop-2 doubt.
      // It cannot manufacture a new subject or a new Exam Preparation row.
      const activeRows = merged.filter(isActiveLoop2Row);

      return buildResult(activeRows);
    } catch (liveError) {
      console.error(
        "LIVE STUDENT EXAM PREPARATION OVERLAY FAILED — LOOP-2 DATA PRESERVED",
        liveError
      );

      return loop2Result;
    }
  } catch (error) {
    console.error(
      "STUDENT EXAM PREPARATION FILTERED LOAD FAILED — ORIGINAL DATA PRESERVED",
      error
    );

    return base;
  }
}