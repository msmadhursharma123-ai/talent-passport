import { getSupabaseClient } from "../../../supabaseClient";
import { requireSchoolIdentity } from "../../../services/identityService";

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

  const [teacherResult, assignmentResult, studentResult] = await Promise.all([
    supabase
      .from("teachers_master")
      .select("teacher_uuid,full_name,school_uuid,subject,is_active")
      .eq("school_uuid", schoolUuid),

    supabase
      .from("teacher_classroom_assignments")
      .select("id,teacher_uuid,school_uuid,academic_year,is_active,class_name,section_name,subject_name")
      .eq("school_uuid", schoolUuid),

    supabase
      .from("students_master")
      .select("student_uuid,student_name,school_name,class_name,section_name")
      .eq("school_name", schoolName),
  ]);

  if (teacherResult.error) throw teacherResult.error;
  if (assignmentResult.error) throw assignmentResult.error;
  if (studentResult.error) throw studentResult.error;

  const teachers = teacherResult.data ?? [];
  const assignments = assignmentResult.data ?? [];
  const students = studentResult.data ?? [];
  const assignmentIds = assignments.map((x: any) => x.id).filter(Boolean);

  if (assignmentIds.length === 0) {
    return {
      schoolUuid, schoolName, teachers, assignments, students,
      logs: [], feedback: [], doubts: [],
    };
  }

  let logsQuery = supabase
    .from("teacher_daily_logs")
    .select("id,teacher_assignment_uuid,topic_name,log_date,created_at,class_name,section_name,subject_name,concepts_covered,page_from,page_to,homework_given,activity_conducted,teacher_notes")
    .in("teacher_assignment_uuid", assignmentIds);

  if (startDate) logsQuery = logsQuery.gte("log_date", startDate);
  if (endDate) logsQuery = logsQuery.lte("log_date", endDate);

  const logResult = await logsQuery;
  if (logResult.error) throw logResult.error;

  const logs = logResult.data ?? [];
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

  let doubtsQuery = supabase
    .from("pending_teacher_doubts")
    .select("id,student_uuid,student_name,teacher_assignment_uuid,daily_log_uuid,status,student_response,school_name,class_name,section_name,subject_name,previous_topic_name,previous_difficult_concept,log_date,doubt_resolved,revision_checked_at,created_at")
    .eq("school_name", schoolName)
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
  className: string;
  sectionName: string;
  totalStudents: number;
  classHealthPercentage: number;
}

function sameClassValue(a: unknown, b: unknown) {
  return String(a ?? "").trim().toLowerCase() ===
    String(b ?? "").trim().toLowerCase();
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

  const matches = doubts.filter(
    doubt =>
      String(doubt.daily_log_uuid ?? "") ===
        String(feedback?.daily_log_uuid ?? "") &&
      String(doubt.student_uuid ?? "") ===
        String(feedback?.student_uuid ?? "")
  );

  if (matches.length === 0) return original;

  const latest = [...matches].sort((a, b) => {
    const aTime = new Date(
      a.revision_checked_at ?? a.created_at ?? 0
    ).getTime();

    const bTime = new Date(
      b.revision_checked_at ?? b.created_at ?? 0
    ).getTime();

    return bTime - aTime;
  })[0];

  const response = String(
    latest?.student_response ?? ""
  ).trim().toUpperCase();

  if (
    response === "DISCUSSED" ||
    latest?.doubt_resolved === true ||
    String(latest?.status ?? "").trim().toUpperCase() ===
      "RESOLVED"
  ) {
    return COMPLETE;
  }

  return original;
}

export async function getSchoolClassroomSupplementalMetrics(
  startDate?: string,
  endDate?: string
): Promise<SchoolClassroomSupplementalMetric[]> {
  const raw = await getSchoolIntelligenceRawData(
    startDate,
    endDate
  );

  const classroomKeys = new Map<
    string,
    { className: string; sectionName: string }
  >();

  raw.assignments
    .filter((assignment: any) => assignment.is_active !== false)
    .forEach((assignment: any) => {
      const className = String(
        assignment.class_name ?? ""
      );

      const sectionName = String(
        assignment.section_name ?? ""
      );

      const key = `${className}|||${sectionName}`;

      if (!classroomKeys.has(key)) {
        classroomKeys.set(key, {
          className,
          sectionName,
        });
      }
    });

  return Array.from(classroomKeys.values()).map(
    ({ className, sectionName }) => {
      const classroomAssignments = raw.assignments.filter(
        (assignment: any) =>
          assignment.is_active !== false &&
          sameClassValue(
            assignment.class_name,
            className
          ) &&
          sameClassValue(
            assignment.section_name,
            sectionName
          )
      );

      const assignmentIds = new Set(
        classroomAssignments.map((assignment: any) =>
          String(assignment.id ?? "")
        )
      );

      const classroomLogs = raw.logs.filter(
        (log: any) =>
          assignmentIds.has(
            String(log.teacher_assignment_uuid ?? "")
          )
      );

      const classroomStudents = raw.students.filter(
        (student: any) =>
          sameClassValue(
            student.class_name,
            className
          ) &&
          sameClassValue(
            student.section_name,
            sectionName
          )
      );

      const totalStudents = new Set(
        classroomStudents
          .map((student: any) => student.student_uuid)
          .filter(Boolean)
      ).size;

      let totalHealth = 0;
      let healthLectureCount = 0;

      for (const log of classroomLogs) {
        const logFeedback = raw.feedback.filter(
          (feedback: any) =>
            String(feedback.daily_log_uuid ?? "") ===
            String(log.id ?? "")
        );

        if (logFeedback.length === 0) {
          continue;
        }

        const completely = logFeedback.filter(
          (feedback: any) =>
            getEffectiveUnderstandingLevel(
              feedback,
              raw.doubts
            ) === "I completely understood."
        ).length;

        const partial = logFeedback.filter(
          (feedback: any) =>
            getEffectiveUnderstandingLevel(
              feedback,
              raw.doubts
            ) === "I partially understood."
        ).length;

        const dailyHealth = Math.round(
          (
            (completely + partial * 0.5) /
            logFeedback.length
          ) * 100
        );

        totalHealth += dailyHealth;
        healthLectureCount += 1;
      }

      const classHealthPercentage =
        healthLectureCount === 0
          ? 0
          : Math.round(
              totalHealth / healthLectureCount
            );

      return {
        className,
        sectionName,
        totalStudents,
        classHealthPercentage,
      };
    }
  );
}
