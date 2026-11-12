import {
  getCanonicalExamPreparationRows,
} from "../../examPreparationIntelligence/canonical/ExamPreparationCanonicalService";
import {
  getStudentLiveDoubtRows,
} from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";
import {
  getStudentDoubtReraiseRecords,
  getTeacherDoubtReraiseRecords,
  getSchoolDoubtReraiseRecords,
  reraiseSubjectTopicKey,
  reraiseKey,
  normalizeReraiseValue,
  upsertStudentDoubtReraiseRequests,
} from "../repository/StudentDoubtReraiseRepository";
import type {
  StudentDoubtReraiseInsert,
  StudentDoubtReraiseRecord,
  StudentReraiseCandidate,
} from "../types/StudentDoubtReraiseTypes";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

export interface StudentReraiseRange {
  subjectName?: string;
  startDate?: string;
  endDateExclusive?: string;
}

/**
 * Re-raise candidates are intentionally limited to canonical rows that still
 * have an exact unresolved Live row. This is the consistency boundary shared
 * by Student Exam Preparation and the Teacher Daily Acknowledgement popup.
 *
 * The canonical row remains the display identity (topic/subtopic), while the
 * Live row id is retained as the authoritative identity for the teacher
 * acknowledgement overlay. This prevents a canonical synthesized concept
 * from being confused with the exact live doubt_concept.
 */
export async function getStudentReraiseCandidates(
  options: StudentReraiseRange
): Promise<StudentReraiseCandidate[]> {
  const [rows, liveRows] = await Promise.all([
    getCanonicalExamPreparationRows({
      scope: "student",
      subjectName: options.subjectName,
      startDate: options.startDate,
      endDateExclusive: options.endDateExclusive,
    }),
    getStudentLiveDoubtRows(true),
  ]);

  const liveById = new Map<string, any>();
  const liveByFeedback = new Map<string, any>();
  for (const live of liveRows ?? []) {
    if (live?.is_unresolved !== true) continue;
    const id = String(live.id ?? "").trim();
    if (id) liveById.set(id, live);
    const feedbackId = String(
      live.source_feedback_id ?? live.latest_source_feedback_id ?? ""
    ).trim();
    if (feedbackId) liveByFeedback.set(feedbackId, live);
  }

  const seen = new Set<string>();
  const candidates: StudentReraiseCandidate[] = [];

  for (const row of rows) {
    // Re-raise follows the same unresolved Live identity as the existing
    // Exam Preparation and Teacher Daily pipelines. A monthly projection is
    // eligible only when it carries a current Live identity; monthly-only and
    // Loop-2-only projections remain non-eligible.
    const liveBackedSource = row.source === "live" ||
      (row.source === "monthly" && Boolean(row.liveRowId));
    if (!liveBackedSource) continue;
    if (!row.topicName || !row.conceptName) continue;

    const live =
      (row.liveRowId ? liveById.get(String(row.liveRowId).trim()) : undefined) ??
      (row.sourceFeedbackId
        ? liveByFeedback.get(String(row.sourceFeedbackId).trim())
        : undefined);

    // Teacher Daily Acknowledgement is Live-backed. Do not offer a re-raise
    // option for a canonical-only/monthly-only row that cannot appear there.
    if (!live || live.is_unresolved !== true) continue;

    const sourceLiveId = String(live.id ?? "").trim();
    if (!sourceLiveId) continue;

    // Exact Live occurrence is the deduplication identity. Two unresolved Live
    // doubts may legitimately share the same canonical topic/subtopic and
    // must remain independently selectable/re-raisable. Canonical text is
    // therefore never sufficient to collapse candidate rows.
    const key = `${reraiseKey({
      studentUuid: row.studentUuid,
      teacherAssignmentUuid: row.teacherAssignmentUuid,
      subjectName: row.subjectName,
      topicName: row.topicName,
      subtopicName: row.conceptName,
    })}::live:${sourceLiveId}`;
    if (seen.has(key)) continue;
    seen.add(key);

    candidates.push({
      id: row.id,
      studentUuid: row.studentUuid,
      teacherUuid: row.teacherUuid,
      teacherAssignmentUuid: row.teacherAssignmentUuid,
      className: row.className,
      sectionName: row.sectionName,
      subjectName: row.subjectName,
      topicName: row.topicName,
      subtopicName: row.conceptName,
      canonicalDate: row.canonicalDate,
      sourceType: row.source,
      sourceLiveId,
      sourceFeedbackId:
        String(
          live.source_feedback_id ?? live.latest_source_feedback_id ?? row.sourceFeedbackId ?? ""
        ).trim() || null,
    });
  }

  return candidates.sort(
    (a, b) =>
      a.subjectName.localeCompare(b.subjectName) ||
      a.topicName.localeCompare(b.topicName) ||
      a.subtopicName.localeCompare(b.subtopicName) ||
      a.canonicalDate.localeCompare(b.canonicalDate)
  );
}

export async function submitStudentReraiseCandidates(
  candidates: StudentReraiseCandidate[]
): Promise<StudentDoubtReraiseRecord[]> {
  const rows: StudentDoubtReraiseInsert[] = candidates.map((candidate) => ({
    student_uuid: candidate.studentUuid,
    school_uuid: "",
    teacher_uuid: candidate.teacherUuid,
    teacher_assignment_uuid: candidate.teacherAssignmentUuid,
    class_name: candidate.className || null,
    section_name: candidate.sectionName || null,
    subject_name: candidate.subjectName,
    topic_name: candidate.topicName,
    subtopic_name: candidate.subtopicName,
    source_type: candidate.sourceType,
    source_live_id: candidate.sourceLiveId,
    source_feedback_id: candidate.sourceFeedbackId,
  }));

  return upsertStudentDoubtReraiseRequests(rows);
}

function filterReraiseRecordsToCurrentLiveIds(
  records: StudentDoubtReraiseRecord[],
  currentLiveIds: Iterable<string>
) {
  const liveIds = new Set(
    Array.from(currentLiveIds)
      .map((id) => clean(id))
      .filter(Boolean)
  );

  return records.filter((row) => {
    const liveId = clean(row.source_live_id);
    return Boolean(liveId && liveIds.has(liveId));
  });
}

export async function getStudentReraiseMarkerSet(options: StudentReraiseRange = {}) {
  const [canonicalRows, records] = await Promise.all([
    getCanonicalExamPreparationRows({
      scope: "student",
      subjectName: options.subjectName,
      startDate: options.startDate,
      endDateExclusive: options.endDateExclusive,
    }),
    getStudentDoubtReraiseRecords(),
  ]);

  // The canonical service has already reconciled the current Live Layer and
  // removed resolved doubts. Use its exact liveRowId as the active-state
  // boundary instead of issuing a second direct query against the Live table.
  // This keeps the overlay on the same access path as the existing portal and
  // prevents an RLS/access-path failure from silently hiding a valid marker.
  const activeRows = filterReraiseRecordsToCurrentLiveIds(
    records,
    canonicalRows.map((row) => row.liveRowId ?? "")
  );

  const activeByLiveId = new Map(
    activeRows
      .map((row) => [clean(row.source_live_id), row] as const)
      .filter(([id]) => Boolean(id))
  );

  return new Set(
    canonicalRows
      .filter((row) => {
        const liveId = clean(row.liveRowId);
        if (!liveId || !activeByLiveId.has(liveId)) return false;
        const marker = activeByLiveId.get(liveId);
        return marker?.student_uuid === row.studentUuid &&
          marker?.teacher_assignment_uuid === row.teacherAssignmentUuid;
      })
      .map((row) => reraiseSubjectTopicKey({
        subjectName: row.subjectName,
        topicName: row.topicName,
        subtopicName: row.conceptName,
      }))
  );
}

export async function getTeacherReraiseRecordsForOverlay() {
  const [canonicalRows, records] = await Promise.all([
    getCanonicalExamPreparationRows({ scope: "teacher" }),
    getTeacherDoubtReraiseRecords(),
  ]);

  // Teacher Daily already has its own exact Live rows for the selected range.
  // This service-level current-state filter guarantees that only still-visible
  // unresolved Live identities are eligible for the overlay, without making a
  // second direct query against student_live_unresolved_doubts.
  return filterReraiseRecordsToCurrentLiveIds(
    records,
    canonicalRows.map((row) => row.liveRowId ?? "")
  );
}


export async function getTeacherReraiseDisplayKeys(options: StudentReraiseRange = {}) {
  const [canonicalRows, records] = await Promise.all([
    getCanonicalExamPreparationRows({
      scope: "teacher",
      startDate: options.startDate,
      endDateExclusive: options.endDateExclusive,
    }),
    getTeacherDoubtReraiseRecords(),
  ]);

  const activeRows = filterReraiseRecordsToCurrentLiveIds(
    records,
    canonicalRows.map((row) => row.liveRowId ?? "")
  );

  const activeByLiveId = new Set(
    activeRows
      .map((row) => clean(row.source_live_id))
      .filter(Boolean)
  );

  const keys = new Set<string>();
  for (const row of canonicalRows) {
    const liveId = clean(row.liveRowId);
    if (!liveId || !activeByLiveId.has(liveId)) continue;
    keys.add(
      `${normalizeReraiseValue(row.className)}::${normalizeReraiseValue(row.sectionName)}::${normalizeReraiseValue(row.subjectName)}::${normalizeReraiseValue(row.studentUuid)}::${reraiseSubjectTopicKey({
        subjectName: row.subjectName,
        topicName: row.topicName,
        subtopicName: row.conceptName,
      })}`
    );
  }
  return keys;
}

export async function getSchoolReraiseDisplayKeys(options: StudentReraiseRange = {}) {
  const [canonicalRows, records] = await Promise.all([
    getCanonicalExamPreparationRows({
      scope: "school",
      startDate: options.startDate,
      endDateExclusive: options.endDateExclusive,
    }),
    getSchoolDoubtReraiseRecords(),
  ]);

  const activeRows = filterReraiseRecordsToCurrentLiveIds(
    records,
    canonicalRows.map((row) => row.liveRowId ?? "")
  );

  const activeByLiveId = new Map(
    activeRows
      .map((row) => [clean(row.source_live_id), row] as const)
      .filter(([id]) => Boolean(id))
  );

  const keys = new Set<string>();
  for (const row of canonicalRows) {
    const liveId = clean(row.liveRowId);
    const marker = liveId ? activeByLiveId.get(liveId) : undefined;
    if (!marker) continue;
    if (marker.student_uuid !== row.studentUuid || marker.teacher_assignment_uuid !== row.teacherAssignmentUuid) continue;
    keys.add(
      `${clean(row.teacherAssignmentUuid)}::${clean(row.studentUuid)}::${reraiseSubjectTopicKey({
        subjectName: row.subjectName,
        topicName: row.topicName,
        subtopicName: row.conceptName,
      })}`
    );
  }
  return keys;
}

export { reraiseKey, reraiseSubjectTopicKey, normalizeReraiseValue };
