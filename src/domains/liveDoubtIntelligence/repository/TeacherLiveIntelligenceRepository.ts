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
  topics.forEach(topic => map.set(topic, (map.get(topic) ?? 0) + 1));
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
}

function attentionLevel(count: number) {
  if (count >= 6) return "HIGH";
  if (count >= 3) return "MEDIUM";
  return "LOW";
}

export async function getTeacherExamAttentionIntelligenceLive() {
  const teacher = getCurrentTeacher();
  if (!teacher) return [];
  const assignments = await getTeacherAssignmentsByTeacher(teacher.teacherUuid);
  const assignmentIds = assignments.map(item => String(item.id ?? "")).filter(Boolean);
  const liveRows = (await getLiveDoubtRowsForAssignments(assignmentIds)).filter(row => row.is_unresolved);

  const classroomMap = new Map<string, any[]>();
  assignments.forEach(assignment => {
    const key = `Class ${assignment.className} - Section ${assignment.sectionName}`;
    if (!classroomMap.has(key)) classroomMap.set(key, []);
  });

  liveRows.forEach(row => {
    const key = `Class ${row.class_name} - Section ${row.section_name}`;
    if (classroomMap.has(key)) classroomMap.get(key)!.push(row);
  });

  return Array.from(classroomMap.entries()).map(([classroom, records]) => {
    const studentMap = new Map<string, any>();
    records.forEach(row => {
      const id = String(row.student_uuid ?? row.source_feedback_id ?? "");
      if (!id) return;
      if (!studentMap.has(id)) {
        studentMap.set(id, {
          studentName: String((row as any).student_name ?? "Student"),
          totalUnresolvedDoubts: 0,
          topics: [],
        });
      }
      const student = studentMap.get(id);
      student.totalUnresolvedDoubts += 1;
      const topic = String(row.topic_name ?? row.doubt_concept ?? "").trim();
      if (topic) student.topics.push(topic);
    });

    return {
      classroom,
      students: Array.from(studentMap.values())
        .map(student => ({
          ...student,
          highestRiskTopic: highestRiskTopic(student.topics),
          attentionLevel: attentionLevel(student.totalUnresolvedDoubts),
        }))
        .sort((a, b) => b.totalUnresolvedDoubts - a.totalUnresolvedDoubts),
      liveCalculatedThrough: liveRows
        .map(row => row.updated_at ?? row.last_seen_at ?? row.source_submitted_at ?? null)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
    };
  });
}

export async function getTeacherPendingDoubtLedgerLive() {
  const teacher = getCurrentTeacher();
  if (!teacher) return [];
  const assignments = await getTeacherAssignmentsByTeacher(teacher.teacherUuid);
  const assignmentIds = assignments.map(item => String(item.id ?? "")).filter(Boolean);
  const liveRows = (await getLiveDoubtRowsForAssignments(assignmentIds)).filter(row => row.is_unresolved);

  return assignments
    .map(assignment => {
      const rows = liveRows.filter(row => String(row.teacher_assignment_uuid ?? "") === String(assignment.id ?? ""));
      if (rows.length === 0) return null;
      const first = rows[0];
      return {
        classroom: `${assignment.className}-${assignment.sectionName}`,
        pendingCount: rows.length,
        previousTopic: first.topic_name ?? "-",
        difficultConcept: first.doubt_concept ?? "-",
        students: Array.from(new Set(rows.map(row => (row as any).student_name ?? "Student"))).join(", "),
        logDate: first.source_submitted_at ? String(first.source_submitted_at).split("T")[0] : "-",
        status: "Needs Revision",
        liveCalculatedThrough: rows.map(row => row.updated_at ?? row.last_seen_at ?? row.source_submitted_at ?? null).filter(Boolean).sort().at(-1) ?? null,
      };
    })
    .filter(Boolean);
}

export async function getTeacherLiveDoubtClosureForAssignments(assignmentIds: string[], startDate: string, endDateExclusive: string) {
  if (assignmentIds.length === 0) return new Map<string, { doubtsAsked: number; doubtsResolved: number; doubtClosureRate: number }>();
  const supabase = getSupabaseClient();
  if (!supabase) return new Map();
  const { data, error } = await (supabase as any)
    .from("pending_teacher_doubts")
    .select("id,student_uuid,teacher_assignment_uuid,subject_name,previous_topic_name,previous_difficult_concept,status,doubt_resolved,log_date")
    .in("teacher_assignment_uuid", assignmentIds)
    .gte("log_date", startDate)
    .lt("log_date", endDateExclusive);
  if (error) throw error;

  const liveRows = await getLiveDoubtRowsForAssignments(assignmentIds, startDate, endDateExclusive);
  const result = new Map<string, { doubtsAsked: number; doubtsResolved: number; doubtClosureRate: number }>();
  for (const assignmentId of assignmentIds) {
    const doubts = (data ?? []).filter((row: any) => String(row.teacher_assignment_uuid) === String(assignmentId));
    const resolved = doubts.filter((row: any) => {
      const live = isPendingDoubtLiveResolved(row, liveRows as LiveDoubtRow[]);
      if (live !== null) return live;
      return row.doubt_resolved === true || String(row.status ?? "").trim().toUpperCase() === "RESOLVED";
    }).length;
    result.set(String(assignmentId), {
      doubtsAsked: doubts.length,
      doubtsResolved: resolved,
      doubtClosureRate: doubts.length === 0 ? 0 : Math.round((resolved / doubts.length) * 100),
    });
  }
  return result;
}
