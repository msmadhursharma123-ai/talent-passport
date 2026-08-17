import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentTeacher } from "../../../services/identityService";
import { getTeacherAssignmentsByTeacher } from "../../teacherIntelligence/repository/TeacherAssignmentRepository";
import {
  getLiveDoubtRowsForAssignments,
  isPendingDoubtLiveResolved,
  type LiveDoubtRow,
} from "./LiveDoubtReconciliationRepository";

function highestRiskTopic(topics: string[]) {
  const map = new Map<string, number>();
  topics.forEach((topic) => map.set(topic, (map.get(topic) ?? 0) + 1));
  return (
    Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-"
  );
}

function attentionLevel(count: number) {
  if (count >= 6) return "HIGH";
  if (count >= 3) return "MEDIUM";
  return "LOW";
}

function assignmentKey(value: unknown) {
  return String(value ?? "").trim();
}

/**
 * Live teacher intelligence is assignment-safe.
 *
 * A teacher may have multiple subjects in the same class/section. The exact
 * teacher_assignment_uuid is therefore retained throughout the calculation.
 * The returned classroom label remains for backwards UI compatibility.
 */
export async function getTeacherExamAttentionIntelligenceLive() {
  const teacher = getCurrentTeacher();
  if (!teacher) return [];

  const assignments = await getTeacherAssignmentsByTeacher(teacher.teacherUuid);
  const assignmentIds = assignments
    .map((item) => assignmentKey(item.id))
    .filter(Boolean);

  if (assignmentIds.length === 0) return [];

  const liveRows = (
    await getLiveDoubtRowsForAssignments(assignmentIds)
  ).filter((row) => row.is_unresolved);

  return assignments
    .map((assignment) => {
      const id = assignmentKey(assignment.id);
      const records = liveRows.filter(
        (row) => assignmentKey(row.teacher_assignment_uuid) === id
      );

      const studentMap = new Map<string, any>();

      records.forEach((row) => {
        const studentId = String(
          row.student_uuid ?? row.source_feedback_id ?? ""
        );
        if (!studentId) return;

        if (!studentMap.has(studentId)) {
          studentMap.set(studentId, {
            studentName: String(row.student_name ?? "Student"),
            totalUnresolvedDoubts: 0,
            topics: [],
          });
        }

        const student = studentMap.get(studentId);
        student.totalUnresolvedDoubts += 1;

        const topic = String(
          row.topic_name ?? row.doubt_concept ?? ""
        ).trim();
        if (topic) student.topics.push(topic);
      });

      return {
        teacherAssignmentUuid: id,
        subjectName: assignment.subjectName,
        classroom: `Class ${assignment.className} - Section ${assignment.sectionName}`,
        students: Array.from(studentMap.values())
          .map((student) => ({
            ...student,
            highestRiskTopic: highestRiskTopic(student.topics),
            attentionLevel: attentionLevel(student.totalUnresolvedDoubts),
          }))
          .sort((a, b) => b.totalUnresolvedDoubts - a.totalUnresolvedDoubts),
        liveCalculatedThrough:
          records
            .map(
              (row) =>
                row.updated_at ??
                row.last_seen_at ??
                row.source_submitted_at ??
                null
            )
            .filter(Boolean)
            .sort()
            .at(-1) ?? null,
      };
    })
    .filter((item) => item.students.length > 0);
}

export async function getTeacherPendingDoubtLedgerLive() {
  const teacher = getCurrentTeacher();
  if (!teacher) return [];

  const assignments = await getTeacherAssignmentsByTeacher(teacher.teacherUuid);
  const assignmentIds = assignments
    .map((item) => assignmentKey(item.id))
    .filter(Boolean);

  const liveRows = (
    await getLiveDoubtRowsForAssignments(assignmentIds)
  ).filter((row) => row.is_unresolved);

  return assignments
    .map((assignment) => {
      const id = assignmentKey(assignment.id);
      const rows = liveRows.filter(
        (row) => assignmentKey(row.teacher_assignment_uuid) === id
      );

      if (rows.length === 0) return null;

      const first = [...rows].sort(
        (a, b) =>
          new Date(
            a.source_submitted_at ?? a.last_seen_at ?? 0
          ).getTime() -
          new Date(
            b.source_submitted_at ?? b.last_seen_at ?? 0
          ).getTime()
      )[0];

      return {
        teacherAssignmentUuid: id,
        subjectName: assignment.subjectName,
        classroom: `${assignment.className}-${assignment.sectionName}`,
        pendingCount: rows.length,
        previousTopic: first.topic_name ?? "-",
        difficultConcept: first.doubt_concept ?? "-",
        students: Array.from(
          new Set(rows.map((row) => row.student_name ?? "Student"))
        ).join(", "),
        logDate: first.source_submitted_at
          ? String(first.source_submitted_at).split("T")[0]
          : "-",
        status: "Needs Revision",
        liveCalculatedThrough:
          rows
            .map(
              (row) =>
                row.updated_at ??
                row.last_seen_at ??
                row.source_submitted_at ??
                null
            )
            .filter(Boolean)
            .sort()
            .at(-1) ?? null,
      };
    })
    .filter(Boolean);
}

export async function getTeacherLiveDoubtClosureForAssignments(
  assignmentIds: string[],
  startDate: string,
  endDateExclusive: string
) {
  const ids = Array.from(
    new Set((assignmentIds ?? []).map(assignmentKey).filter(Boolean))
  );

  if (ids.length === 0) {
    return new Map<
      string,
      { doubtsAsked: number; doubtsResolved: number; doubtClosureRate: number }
    >();
  }

  const supabase = getSupabaseClient();
  if (!supabase) return new Map();

  const { data, error } = await (supabase as any)
    .from("pending_teacher_doubts")
    .select(
      "id,student_uuid,teacher_assignment_uuid,daily_log_uuid,subject_name,previous_topic_name,previous_difficult_concept,source_feedback_id,status,doubt_resolved,log_date"
    )
    .in("teacher_assignment_uuid", ids)
    .gte("log_date", startDate)
    .lt("log_date", endDateExclusive);

  if (error) throw error;

  const liveRows = await getLiveDoubtRowsForAssignments(
    ids,
    startDate,
    endDateExclusive
  );

  const result = new Map<
    string,
    { doubtsAsked: number; doubtsResolved: number; doubtClosureRate: number }
  >();

  for (const assignmentId of ids) {
    const doubts = (data ?? []).filter(
      (row: any) =>
        assignmentKey(row.teacher_assignment_uuid) === assignmentId
    );

    const resolved = doubts.filter((row: any) => {
      const live = isPendingDoubtLiveResolved(row, liveRows as LiveDoubtRow[]);
      if (live !== null) return live;
      return (
        row.doubt_resolved === true ||
        String(row.status ?? "").trim().toUpperCase() === "RESOLVED"
      );
    }).length;

    result.set(assignmentId, {
      doubtsAsked: doubts.length,
      doubtsResolved: resolved,
      doubtClosureRate:
        doubts.length === 0 ? 0 : Math.round((resolved / doubts.length) * 100),
    });
  }

  return result;
}
