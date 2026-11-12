import { getSupabaseClient } from "../../../supabaseClient";
import {
  getCurrentSchool,
  getCurrentTeacher,
  requireIdentity,
} from "../../../services/identityService";
import type {
  StudentDoubtReraiseInsert,
  StudentDoubtReraiseRecord,
} from "../types/StudentDoubtReraiseTypes";

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}


/**
 * Student-owned read. RLS is still the database boundary; the explicit
 * student filter keeps the request narrow and prevents an unnecessarily
 * broad table read from the browser.
 */
export async function getStudentDoubtReraiseRecords(): Promise<StudentDoubtReraiseRecord[]> {
  const identity = requireIdentity();
  const { data, error } = await client()
    .from("student_doubt_reraise_requests")
    .select("*")
    .eq("student_uuid", identity.studentUuid)
    .order("reraised_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as StudentDoubtReraiseRecord[];
}

/**
 * Teacher read. RLS limits rows to the authenticated teacher's assignments.
 * No write capability is exposed here.
 */
export async function getTeacherDoubtReraiseRecords(): Promise<StudentDoubtReraiseRecord[]> {
  if (!getCurrentTeacher()) return [];

  // Do not filter by the stored teacher_uuid here. The assignment is the
  // authoritative classroom boundary, so a later assignment transfer can
  // move the same priority marker to the new teacher without rewriting the
  // re-raise history. RLS enforces the authenticated teacher's assignments.
  const { data, error } = await client()
    .from("student_doubt_reraise_requests")
    .select("*")
    .order("reraised_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as StudentDoubtReraiseRecord[];
}

/**
 * School read. RLS limits rows to the authenticated school admin's school.
 */
export async function getSchoolDoubtReraiseRecords(): Promise<StudentDoubtReraiseRecord[]> {
  if (!getCurrentSchool()) return [];

  // Assignment ownership is the operational boundary. This keeps the marker
  // visible after a legitimate classroom-assignment transfer as well. RLS
  // enforces the authenticated school boundary.
  const { data, error } = await client()
    .from("student_doubt_reraise_requests")
    .select("*")
    .order("reraised_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as StudentDoubtReraiseRecord[];
}

/**
 * Upsert is intentionally idempotent. Re-raising the same student +
 * assignment + subject + topic + subtopic updates the latest re-raise time
 * instead of creating duplicate priority markers.
 */
export async function upsertStudentDoubtReraiseRequests(
  rows: StudentDoubtReraiseInsert[]
): Promise<StudentDoubtReraiseRecord[]> {
  if (!rows.length) return [];

  const identity = requireIdentity();
  const studentUuid = clean(identity.studentUuid);
  const schoolUuid = clean(identity.schoolUuid);
  if (!studentUuid || !schoolUuid) {
    throw new Error("Student school identity is missing.");
  }

  const normalizedRows = rows
    .map((row) => ({
      ...row,
      student_uuid: studentUuid,
      school_uuid: schoolUuid,
      teacher_uuid: clean(row.teacher_uuid) || null,
      teacher_assignment_uuid: clean(row.teacher_assignment_uuid),
      class_name: clean(row.class_name) || null,
      section_name: clean(row.section_name) || null,
      subject_name: clean(row.subject_name),
      topic_name: clean(row.topic_name),
      subtopic_name: clean(row.subtopic_name),
      source_type: row.source_type ?? null,
      source_live_id: clean(row.source_live_id) || null,
      source_feedback_id: clean(row.source_feedback_id) || null,
    }))
    .filter(
      (row) =>
        row.teacher_assignment_uuid &&
        row.subject_name &&
        row.topic_name &&
        row.subtopic_name
    );

  const deduped = new Map<string, StudentDoubtReraiseInsert>();
  for (const row of normalizedRows) {
    const key = row.source_live_id
      ? row.source_live_id
      : [
          row.student_uuid,
          row.teacher_assignment_uuid,
          row.subject_name.toLocaleLowerCase(),
          row.topic_name.toLocaleLowerCase(),
          row.subtopic_name.toLocaleLowerCase(),
        ].join("::");
    deduped.set(key, row);
  }

  const { data, error } = await client()
    .from("student_doubt_reraise_requests")
    .upsert(Array.from(deduped.values()), {
      onConflict: "source_live_id",
    })
    .select("*");

  if (error) throw error;
  return (data ?? []) as StudentDoubtReraiseRecord[];
}


export async function getActiveReraiseRecords(
  rows: StudentDoubtReraiseRecord[]
): Promise<StudentDoubtReraiseRecord[]> {
  const records = uniqueReraiseRecords(rows);
  const liveIds = Array.from(
    new Set(records.map((row) => clean(row.source_live_id)).filter(Boolean))
  );
  if (!liveIds.length) return [];

  const activeIds = new Set<string>();
  const chunkSize = 250;
  for (let index = 0; index < liveIds.length; index += chunkSize) {
    const chunk = liveIds.slice(index, index + chunkSize);
    const { data, error } = await client()
      .from("student_live_unresolved_doubts")
      .select("id,is_unresolved")
      .in("id", chunk);

    if (error) throw error;
    for (const row of data ?? []) {
      if (row?.is_unresolved === true) {
        const id = clean(row?.id);
        if (id) activeIds.add(id);
      }
    }
  }

  return records.filter((row) => activeIds.has(clean(row.source_live_id)));
}

export function normalizeReraiseValue(value: unknown) {
  return clean(value).toLocaleLowerCase().replace(/\s+/g, " ");
}

export function reraiseKey(parts: {
  studentUuid?: unknown;
  teacherAssignmentUuid?: unknown;
  subjectName?: unknown;
  topicName?: unknown;
  subtopicName?: unknown;
}) {
  return [
    normalizeReraiseValue(parts.studentUuid),
    normalizeReraiseValue(parts.teacherAssignmentUuid),
    normalizeReraiseValue(parts.subjectName),
    normalizeReraiseValue(parts.topicName),
    normalizeReraiseValue(parts.subtopicName),
  ].join("::");
}

export function reraiseSubjectTopicKey(parts: {
  subjectName?: unknown;
  topicName?: unknown;
  subtopicName?: unknown;
}) {
  return [
    normalizeReraiseValue(parts.subjectName),
    normalizeReraiseValue(parts.topicName),
    normalizeReraiseValue(parts.subtopicName),
  ].join("::");
}

export function reraiseAssignmentStudentTopicKey(parts: {
  teacherAssignmentUuid?: unknown;
  studentUuid?: unknown;
  topicName?: unknown;
  subtopicName?: unknown;
}) {
  return [
    normalizeReraiseValue(parts.teacherAssignmentUuid),
    normalizeReraiseValue(parts.studentUuid),
    normalizeReraiseValue(parts.topicName),
    normalizeReraiseValue(parts.subtopicName),
  ].join("::");
}

export function uniqueReraiseRecords(rows: StudentDoubtReraiseRecord[]) {
  const map = new Map<string, StudentDoubtReraiseRecord>();
  for (const row of rows ?? []) {
    const liveId = clean(row.source_live_id);
    const key = liveId
      ? `${reraiseKey({
          studentUuid: row.student_uuid,
          teacherAssignmentUuid: row.teacher_assignment_uuid,
          subjectName: row.subject_name,
          topicName: row.topic_name,
          subtopicName: row.subtopic_name,
        })}::live:${liveId}`
      : reraiseKey({
          studentUuid: row.student_uuid,
          teacherAssignmentUuid: row.teacher_assignment_uuid,
          subjectName: row.subject_name,
          topicName: row.topic_name,
          subtopicName: row.subtopic_name,
        });
    if (!map.has(key)) map.set(key, row);
  }
  return Array.from(map.values());
}

