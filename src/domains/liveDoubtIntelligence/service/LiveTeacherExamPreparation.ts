import { getCurrentTeacher } from "../../../services/identityService";
import { getTeacherAssignmentsByTeacher } from "../../teacherIntelligence/repository/TeacherAssignmentRepository";
import { getTeacherExamAttentionIntelligence } from "../../teacherIntelligence/repository/TeacherExamPreparationRepository";
import {
  getLiveDoubtsForTeacherAssignments,
  mergePendingDoubtsWithLiveLedger,
} from "../repository/LiveDoubtReconciliationRepository";

export async function getTeacherExamAttentionIntelligenceWithLiveLayer() {
  const base = await getTeacherExamAttentionIntelligence();

  try {
    const teacher = getCurrentTeacher();
    if (!teacher) return base;

    const assignments = await getTeacherAssignmentsByTeacher(
      teacher.teacherUuid
    );

    const assignmentIds = assignments
      .map((assignment) => assignment.id)
      .filter(Boolean);

    if (assignmentIds.length === 0) return base;

    const liveRows = (
      await getLiveDoubtsForTeacherAssignments(assignmentIds)
    ).filter((row) => Boolean(row.last_reconciled_at));

    if (!liveRows.length) return base;

    // Rebuild from the existing second-loop ledger, then replace only
    // matching concepts with the latest student-side live state.
    // This preserves the original page contract and grouping.
    const existingRows = await import(
      "../../teacherIntelligence/repository/TeacherExamPreparationRepository"
    ).then(async () => {
      const { getSupabaseClient } = await import(
        "../../../supabaseClient"
      );
      const supabase = getSupabaseClient();
      if (!supabase) return [];

      const { data, error } = await (supabase as any)
        .from("pending_teacher_doubts")
        .select("*")
        .in("teacher_assignment_uuid", assignmentIds)
        .eq("status", "NOT DISCUSSED");

      if (error) throw error;
      return data ?? [];
    });

    const merged = mergePendingDoubtsWithLiveLedger(
      existingRows,
      liveRows
    ).filter(
      (row: any) =>
        row.doubt_resolved !== true &&
        String(row.status ?? "").trim().toUpperCase() !== "RESOLVED"
    );

    const classrooms = new Map<string, any[]>();

    for (const row of merged) {
      const key = `Class ${row.class_name} - Section ${row.section_name}`;
      const list = classrooms.get(key) ?? [];
      list.push(row);
      classrooms.set(key, list);
    }

    const result = Array.from(classrooms.entries()).map(
      ([classroom, rows]) => {
        const students = new Map<string, any>();

        for (const row of rows) {
          const studentKey = String(row.student_uuid ?? row.student_name ?? "");
          const student =
            students.get(studentKey) ??
            {
              studentName: row.student_name ?? "Student",
              totalUnresolvedDoubts: 0,
              topics: [],
            };

          student.totalUnresolvedDoubts += 1;

          const topic = String(
            row.previous_topic_name ??
              row.previous_difficult_concept ??
              ""
          ).trim();

          if (topic) student.topics.push(topic);
          students.set(studentKey, student);
        }

        const studentRows = Array.from(students.values())
          .map((student: any) => {
            const topicCounts = new Map<string, number>();
            student.topics.forEach((topic: string) =>
              topicCounts.set(
                topic,
                (topicCounts.get(topic) ?? 0) + 1
              )
            );

            const highestRiskTopic =
              Array.from(topicCounts.entries()).sort(
                (a, b) => b[1] - a[1]
              )[0]?.[0] ?? "";

            return {
              ...student,
              highestRiskTopic,
              attentionLevel:
                student.totalUnresolvedDoubts >= 6
                  ? "HIGH"
                  : student.totalUnresolvedDoubts >= 3
                  ? "MEDIUM"
                  : "LOW",
            };
          })
          .sort(
            (a: any, b: any) =>
              b.totalUnresolvedDoubts -
              a.totalUnresolvedDoubts
          );

        return {
          classroom,
          students: studentRows,
        };
      }
    );

    // Preserve classrooms that have no live unresolved rows by merging
    // them with the original result instead of deleting them.
    const liveMap = new Map(
      result.map((table) => [table.classroom, table])
    );

    const baseRows = Array.isArray(base) ? base : [];

    return baseRows
      .map((table: any) =>
        liveMap.get(table.classroom) ?? table
      )
      .concat(
        result.filter(
          (table) =>
            !baseRows.some(
              (existing: any) =>
                existing.classroom === table.classroom
            )
        )
      );
  } catch (error) {
    console.error(
      "LIVE TEACHER EXAM PREPARATION OVERLAY FAILED — ORIGINAL DATA PRESERVED",
      error
    );
    return base;
  }
}
