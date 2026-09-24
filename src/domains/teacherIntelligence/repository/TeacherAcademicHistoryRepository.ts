import { getSupabaseClient } from "../../../supabaseClient";

import {

TopicLearningHistory,

} from "../types/TeacherAcademicHistoryModels";

import { getCurrentTeacher } from "../../../services/identityService";
import { calculateLearningLectureMetrics } from "../../../utils/learningFeedbackAnalytics";


export async function getTeacherLectureHistory(){

}


export async function getStudentLearningHistory(){

}


export async function getTopicLearningHistory(
  topicName: string,
  subjectName?: string
): Promise<TopicLearningHistory> {
  const supabase = getSupabaseClient();
  const teacher = getCurrentTeacher();

  if (!teacher?.teacherUuid) {
    return {
      topicName,
      timesTaught: 0,
      totalStudentsFacedDifficulty: 0,
      difficultyPercentage: 0,
      mostDifficultConcepts: [],
    };
  }

  // Preserve the existing contract: this history calculation is subject-scoped.
  // The previous implementation returned an empty history when no subject was supplied;
  // do not broaden that contract as part of a denominator-only correction.
  if (!subjectName) {
    return {
      topicName,
      timesTaught: 0,
      totalStudentsFacedDifficulty: 0,
      difficultyPercentage: 0,
      mostDifficultConcepts: [],
    };
  }

  let assignmentIds: string[] = [];

  if (subjectName) {
    let subjectAssignmentsQuery = (supabase as any)
      .from("teacher_classroom_assignments")
      .select("id")
      .eq("teacher_uuid", teacher.teacherUuid)
      .eq("subject_name", subjectName);

    if (teacher.schoolUuid) {
      subjectAssignmentsQuery = subjectAssignmentsQuery.eq("school_uuid", teacher.schoolUuid);
    }

    const { data: subjectAssignments } = await subjectAssignmentsQuery;

    assignmentIds = (subjectAssignments ?? [])
      .map((assignment: any) => assignment.id)
      .filter(Boolean);

    if (assignmentIds.length === 0) {
      return {
        topicName,
        timesTaught: 0,
        totalStudentsFacedDifficulty: 0,
        difficultyPercentage: 0,
        mostDifficultConcepts: [],
      };
    }
  }

  let teacherLogsQuery = (supabase as any)
    .from("teacher_daily_logs")
    .select("id,teacher_assignment_uuid")
    .eq("topic_name", topicName);

  if (subjectName) {
    teacherLogsQuery = teacherLogsQuery.in(
      "teacher_assignment_uuid",
      assignmentIds
    );
  }

  const { data: teacherLogs } = await teacherLogsQuery;
  const logs = teacherLogs ?? [];
  const timesTaught = logs.length;
  const dailyLogUuids = logs.map((log: any) => log.id).filter(Boolean);

  if (dailyLogUuids.length === 0) {
    return {
      topicName,
      timesTaught: 0,
      totalStudentsFacedDifficulty: 0,
      difficultyPercentage: 0,
      mostDifficultConcepts: [],
    };
  }

  const { data: studentFeedback } = await (supabase as any)
    .from("student_daily_feedback")
    .select("daily_log_uuid,student_uuid,understanding_level,submitted_at,created_at")
    .in("daily_log_uuid", dailyLogUuids);

  const logAssignmentIds = Array.from(
    new Set(logs.map((log: any) => String(log.teacher_assignment_uuid ?? "")).filter(Boolean)),
  );

  const { data: assignments } = await (supabase as any)
    .from("teacher_classroom_assignments")
    .select("id,class_name,section_name,school_uuid")
    .in("id", logAssignmentIds);

  const assignmentById = new Map(
    (assignments ?? []).map((assignment: any) => [String(assignment.id), assignment]),
  );

  const schoolUuids = Array.from(
    new Set((assignments ?? []).map((assignment: any) => String(assignment.school_uuid ?? "")).filter(Boolean)),
  );

  let studentsQuery = (supabase as any)
    .from("students_master")
    .select("student_uuid,class_name,section_name,school_uuid");

  if (teacher.schoolUuid) {
    studentsQuery = studentsQuery.eq("school_uuid", teacher.schoolUuid);
  } else if (schoolUuids.length === 1) {
    studentsQuery = studentsQuery.eq("school_uuid", schoolUuids[0]);
  }

  const { data: rosterStudents } = await studentsQuery;

  const rosterByAssignment = new Map<string, Set<string>>();
  for (const assignment of assignments ?? []) {
    const key = String(assignment.id);
    const roster = new Set<string>();
    for (const student of rosterStudents ?? []) {
      if (
        String(student.class_name ?? "").trim().toLowerCase() === String(assignment.class_name ?? "").trim().toLowerCase() &&
        String(student.section_name ?? "").trim().toLowerCase() === String(assignment.section_name ?? "").trim().toLowerCase() &&
        (!assignment.school_uuid || String(student.school_uuid ?? "") === String(assignment.school_uuid)) &&
        student.student_uuid
      ) {
        roster.add(String(student.student_uuid));
      }
    }
    rosterByAssignment.set(key, roster);
  }

  const lectureMetrics = logs.map((log: any) =>
    calculateLearningLectureMetrics({
      studentUuids: rosterByAssignment.get(String(log.teacher_assignment_uuid ?? "")) ?? new Set<string>(),
      feedback: (studentFeedback ?? []).filter(
        (row: any) => String(row.daily_log_uuid ?? "") === String(log.id ?? ""),
      ),
    }),
  );

  const eligibleObservations = lectureMetrics.reduce(
    (sum, metric) => sum + metric.eligibleStudents,
    0,
  );
  const totalStudentsFacedDifficulty = lectureMetrics.reduce(
    (sum, metric) => sum + metric.partialStudents + metric.didntUnderstandStudents,
    0,
  );

  const difficultyPercentage =
    eligibleObservations === 0
      ? 0
      : Math.round((totalStudentsFacedDifficulty / eligibleObservations) * 100);

  return {
    topicName,
    timesTaught,
    totalStudentsFacedDifficulty,
    difficultyPercentage,
    mostDifficultConcepts: [],
  };
}


export async function getClassroomLearningHistory(){

}


export async function getSubjectLearningHistory(){

}