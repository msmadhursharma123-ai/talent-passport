import {
  aggregateLearningLectureMetrics,
  calculateLearningLectureMetrics,
} from "../../../utils/learningFeedbackAnalytics";

import { getSupabaseClient } from "../../../supabaseClient";
import { requireSchoolIdentity } from "../../../services/identityService";
import {
  getSchoolIntelligenceLiveRows,
  mergeFeedbackUnderstandingLevels,
  mergePendingDoubtsWithLiveLedger,
} from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";

export interface SchoolIntelligenceRawData {
  schoolUuid: string;
  schoolName: string;
  teachers: any[];
  assignments: any[];
  logs: any[];
  feedback: any[];
  doubts: any[];
  students: any[];
}

function getClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

export async function getSchoolIntelligenceRawData(
  startDate?: string,
  endDate?: string
): Promise<SchoolIntelligenceRawData> {
  const identity = requireSchoolIdentity();
  const schoolUuid = identity.schoolUuid;
  const schoolName = identity.schoolName;
  const supabase = getClient();

  if (!schoolUuid) throw new Error("Authenticated school UUID is missing.");

  const [teacherResult, assignmentResult, studentBySchoolResult] = await Promise.all([
    supabase
      .from("teachers_master")
      .select("teacher_uuid,full_name,school_uuid,subject,is_active")
      .eq("school_uuid", schoolUuid),

    supabase
      .from("teacher_classroom_assignments")
      .select("id,teacher_uuid,school_uuid,academic_year,is_active,class_name,section_name,subject_name")
      .eq("school_uuid", schoolUuid),

    // school_uuid is the canonical school boundary. school_name is used only
    // as a compatibility fallback for older student rows that pre-date the
    // canonical UUID backfill.
    supabase
      .from("students_master")
      .select("student_uuid,student_name,school_uuid,school_name,class_name,section_name")
      .eq("school_uuid", schoolUuid),
  ]);

  if (teacherResult.error) throw teacherResult.error;
  if (assignmentResult.error) throw assignmentResult.error;

  const teachers = teacherResult.data ?? [];
  const assignments = assignmentResult.data ?? [];

  let students = studentBySchoolResult.data ?? [];

  if (studentBySchoolResult.error) {
    throw studentBySchoolResult.error;
  }

  if (students.length === 0 && schoolName) {
    const studentFallbackResult = await supabase
      .from("students_master")
      .select("student_uuid,student_name,school_uuid,school_name,class_name,section_name")
      .eq("school_name", schoolName);

    if (studentFallbackResult.error) {
      throw studentFallbackResult.error;
    }

    students = studentFallbackResult.data ?? [];
  }

  const assignmentIds = assignments.map((x: any) => x.id).filter(Boolean);

  if (assignmentIds.length === 0) {
    return {
      schoolUuid, schoolName, teachers, assignments, students,
      logs: [], feedback: [], doubts: [],
    };
  }

  /*
   * IMPORTANT: teacher_daily_logs is the authoritative publication table,
   * but it stores the assignment UUID rather than duplicating classroom and
   * subject metadata. Do NOT select class_name / section_name / subject_name
   * from teacher_daily_logs. Resolve those fields from the exact assignment
   * row instead. This keeps School Intelligence aligned with the same
   * teacher_assignment_uuid used by the working Daily Log page.
   */
  let logsQuery = supabase
    .from("teacher_daily_logs")
    .select(`
      id,
      teacher_assignment_uuid,
      topic_name,
      concepts_covered,
      page_from,
      page_to,
      homework_given,
      activity_conducted,
      teacher_notes,
      log_date,
      created_at,
      updated_at
    `)
    .in("teacher_assignment_uuid", assignmentIds);

  if (startDate) logsQuery = logsQuery.gte("log_date", startDate);
  if (endDate) logsQuery = logsQuery.lte("log_date", endDate);

  const logResult = await logsQuery;
  if (logResult.error) throw logResult.error;

  const rawLogs = logResult.data ?? [];
  const assignmentById = new Map<string, any>(
    assignments.map(
      (assignment: any): [string, any] => [
        String(assignment.id),
        assignment,
      ]
    )
  );

  // Enrich in memory only. No existing teacher_daily_logs row is changed.
  // This gives every school-intelligence consumer the same classroom context
  // without making the daily-log publication schema responsible for it.
  const logs = rawLogs.map((log: any) => {
    const assignment = assignmentById.get(
      String(log.teacher_assignment_uuid ?? "")
    );

    return {
      ...log,
      teacher_uuid: assignment?.teacher_uuid ?? null,
      school_uuid: assignment?.school_uuid ?? schoolUuid,
      class_name: assignment?.class_name ?? "",
      section_name: assignment?.section_name ?? "",
      subject_name: assignment?.subject_name ?? "",
    };
  });

  const logIds = logs.map((x: any) => x.id).filter(Boolean);

  let feedback: any[] = [];
  if (logIds.length > 0) {
    const feedbackResult = await supabase
      .from("student_daily_feedback")
      .select("id,daily_log_uuid,student_uuid,submitted_at,teacher_uuid,school_uuid,class_name,section_name,subject_name,topic_name,understanding_level,concepts_not_understood,has_doubt")
      .eq("school_uuid", schoolUuid)
      .in("daily_log_uuid", logIds);

    if (feedbackResult.error) throw feedbackResult.error;
    feedback = feedbackResult.data ?? [];
  }

  // Assignment UUIDs are the canonical school boundary here. Do not add a
  // school_name predicate: legacy Loop-2 rows can have stale/null school_name
  // while retaining the correct teacher_assignment_uuid. Teacher Intelligence
  // already uses the assignment UUID boundary, so School Intelligence must
  // use the same boundary for parity.
  let doubtsQuery = supabase
    .from("pending_teacher_doubts")
    .select("id,student_uuid,student_name,teacher_assignment_uuid,daily_log_uuid,status,student_response,school_name,class_name,section_name,subject_name,previous_topic_name,previous_difficult_concept,log_date,doubt_resolved,revision_checked_at,created_at")
    .in("teacher_assignment_uuid", assignmentIds.map(String));

  if (startDate) doubtsQuery = doubtsQuery.gte("log_date", startDate);
  if (endDate) doubtsQuery = doubtsQuery.lte("log_date", endDate);

  const doubtResult = await doubtsQuery;
  if (doubtResult.error) throw doubtResult.error;

  return {
    schoolUuid,
    schoolName,
    teachers,
    assignments,
    logs,
    feedback,
    doubts: doubtResult.data ?? [],
    students,
  };
}

/* =========================================================
   CLASSROOM VERIFICATION METRICS
   ---------------------------------------------------------
   Used by School Overview to verify teacher reward / voucher
   performance for the selected timeline without changing the
   existing school-intelligence snapshot contract.
   ========================================================= */

export interface SchoolClassroomSupplementalMetric {
  assignmentUuid: string;
  className: string;
  sectionName: string;
  subjectName: string;
  totalStudents: number;
  classHealthPercentage: number;
  healthLectureCount: number;
  healthPercentageSum: number;
  eligibleStudentObservations: number;
  responseStudentObservations: number;
  completeStudentObservations: number;
  partialStudentObservations: number;
  didntUnderstandStudentObservations: number;
  responseRate: number;
  understandingRate: number;
  partialUnderstandingRate: number;
  didntUnderstandRate: number;
}

function sameClassValue(a: unknown, b: unknown) {
  return String(a ?? "").trim().toLowerCase() ===
    String(b ?? "").trim().toLowerCase();
}

function normalizeConcept(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function getEffectiveUnderstandingLevel(
  feedback: any,
  doubts: any[]
) {
  const COMPLETE = "I completely understood.";
  const PARTIAL = "I partially understood.";
  const NONE = "I didn't understand.";

  const original = feedback?.understanding_level;

  if (original !== PARTIAL && original !== NONE) {
    return original;
  }

  const concepts = Array.isArray(feedback?.concepts_not_understood)
    ? feedback.concepts_not_understood.filter(Boolean)
    : [];

  if (concepts.length === 0) return original;

  const matches = doubts.filter((doubt) => {
    const sameLog =
      String(doubt.daily_log_uuid ?? "") ===
      String(feedback?.daily_log_uuid ?? "");
    const sameStudent =
      String(doubt.student_uuid ?? "") ===
      String(feedback?.student_uuid ?? "");
    const doubtConcept = normalizeConcept(
      doubt.previous_difficult_concept ??
        doubt.doubt_concept ??
        doubt.previous_topic_name
    );

    return (
      sameLog &&
      sameStudent &&
      concepts.some(
        (concept: string) => normalizeConcept(concept) === doubtConcept
      )
    );
  });

  if (matches.length === 0) return original;

  const unresolvedConcepts = concepts.filter((concept: string) => {
    const normalizedConcept = normalizeConcept(concept);

    return !matches.some((doubt) => {
      const doubtConcept = normalizeConcept(
        doubt.previous_difficult_concept ??
          doubt.doubt_concept ??
          doubt.previous_topic_name
      );

      if (doubtConcept !== normalizedConcept) return false;

      const response = String(
        doubt.student_response ?? ""
      ).trim().toUpperCase();

      return !(
        response === "DISCUSSED" ||
        doubt.doubt_resolved === true ||
        String(doubt.status ?? "").trim().toUpperCase() === "RESOLVED"
      );
    });
  });

  return unresolvedConcepts.length === 0 ? COMPLETE : original;
}

export async function getSchoolClassroomSupplementalMetrics(
  startDate?: string,
  endDate?: string
): Promise<SchoolClassroomSupplementalMetric[]> {
  const raw = await getSchoolIntelligenceRawData(
    startDate,
    endDate
  );

  // This is a presentation-specific metric for each assignment (class +
  // section + subject). It intentionally uses the same current-state Live
  // evidence contract as the main School Overview snapshot, while retaining
  // the existing fail-open behavior if the optional Live infrastructure is
  // unavailable.
  let effectiveFeedback = raw.feedback;
  let effectiveDoubts = raw.doubts;
  try {
    const liveRows = await getSchoolIntelligenceLiveRows(
      raw.schoolUuid,
      startDate,
      endDate
    );
    effectiveFeedback = mergeFeedbackUnderstandingLevels(
      raw.feedback,
      liveRows
    );
    effectiveDoubts = mergePendingDoubtsWithLiveLedger(
      raw.doubts,
      liveRows,
      { includeUnmatchedLive: true }
    );
  } catch (liveError) {
    console.error(
      "SCHOOL SUPPLEMENTAL LIVE OVERLAY FAILED — ORIGINAL METRICS PRESERVED",
      liveError
    );
  }

  const getEffectiveLevel = (feedback: any) =>
    getEffectiveUnderstandingLevel(feedback, effectiveDoubts);
  return raw.assignments
    .filter((assignment: any) => assignment.is_active !== false)
    .map((assignment: any) => {
      const assignmentUuid = String(assignment.id ?? "");
      const assignmentLogs = raw.logs.filter(
        (log: any) =>
          String(log.teacher_assignment_uuid ?? "") === assignmentUuid
      );


      const classroomStudents = raw.students.filter(
        (student: any) =>
          sameClassValue(student.class_name, assignment.class_name) &&
          sameClassValue(student.section_name, assignment.section_name)
      );

      const totalStudents = new Set(
        classroomStudents
          .map((student: any) => student.student_uuid)
          .filter(Boolean)
      ).size;

      const lectureMetrics = assignmentLogs.map((log: any) =>
        calculateLearningLectureMetrics({
          studentUuids: classroomStudents.map((student: any) => student.student_uuid),
          feedback: effectiveFeedback.filter(
            (feedback: any) =>
              String(feedback.daily_log_uuid ?? "") === String(log.id ?? ""),
          ),
          getUnderstandingLevel: getEffectiveLevel,
        }),
      );
      const aggregate = aggregateLearningLectureMetrics(lectureMetrics);

      const classHealthPercentage = aggregate.classHealthPercentage;
      const healthLectureCount = aggregate.lectureCount;

      return {
        assignmentUuid,
        className: String(assignment.class_name ?? ""),
        sectionName: String(assignment.section_name ?? ""),
        subjectName: String(assignment.subject_name ?? ""),
        totalStudents,
        classHealthPercentage,
        healthLectureCount,
        healthPercentageSum: aggregate.healthPercentageSum,
        eligibleStudentObservations: aggregate.eligibleStudentObservations,
        responseStudentObservations: aggregate.responseStudentObservations,
        completeStudentObservations: aggregate.completeStudentObservations,
        partialStudentObservations: aggregate.partialStudentObservations,
        didntUnderstandStudentObservations: aggregate.didntUnderstandStudentObservations,
        responseRate: aggregate.responseRate,
        understandingRate: aggregate.understandingRate,
        partialUnderstandingRate: aggregate.partialRate,
        didntUnderstandRate: aggregate.didntUnderstandRate,
      };
    });
}
