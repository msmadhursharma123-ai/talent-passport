import { getSupabaseClient } from "../../../supabaseClient";
import { requireSchoolIdentity } from "../../../services/identityService";
import {
  getSchoolAdminCrossQuestions,
  groupSchoolAdminCrossQuestionsByLog,
} from "./SchoolIntelligenceCrossQuestionRepository";

export interface TeacherTeachingHistoryTeacher {
  teacherUuid: string;
  teacherName: string;
  subject: string;
  isActive: boolean;
}

export interface TeacherTeachingHistoryAssignment {
  id: string;
  teacherUuid: string;
  className: string;
  sectionName: string;
  subjectName: string;
  academicYear: string;
  isActive: boolean;
  createdAt: string;
}

export interface TeacherTeachingHistoryAbsence {
  teacherUuid: string;
  absenceDate: string;
  markedAt: string;
}

export interface TeacherTeachingHistoryCrossQuestion {
  questionOrder: number;
  questionType: string;
  questionText: string;
  imagePath: string | null;
}

export interface TeacherTeachingHistoryLog {
  id: string;
  teacherAssignmentUuid: string;
  logDate: string;
  chapterName: string;
  topicName: string;
  conceptsCovered: string[];
  crossQuestions: TeacherTeachingHistoryCrossQuestion[];
  pageFrom: number | null;
  pageTo: number | null;
  homeworkGiven: boolean;
  activityConducted: boolean;
  teacherNotes: string;
  createdAt: string;
}

export interface TeacherTeachingHistoryData {
  teachers: TeacherTeachingHistoryTeacher[];
  assignments: TeacherTeachingHistoryAssignment[];
  logs: TeacherTeachingHistoryLog[];
  absences: TeacherTeachingHistoryAbsence[];
  excludedDates: string[];
}

function normalizeHistoryCrossQuestions(
  rows: any[],
  legacyText?: string | null,
  legacyImagePath?: string | null,
): TeacherTeachingHistoryCrossQuestion[] {
  const normalized = (Array.isArray(rows) ? rows : [])
    .map((question: any, index: number) => ({
      questionOrder: Number.isFinite(Number(question?.question_order)) ? Number(question.question_order) : 0,
      questionType: String(question?.question_type ?? "").trim(),
      questionText: String(question?.question_text ?? "").trim(),
      imagePath: question?.image_path ? String(question.image_path) : null,
      id: String(question?.id ?? ""),
    }))
    .filter((question) => Boolean(question.questionText || question.imagePath))
    .filter((question) => question.questionOrder === 1 || question.questionOrder === 2)
    .sort((a, b) => a.questionOrder - b.questionOrder || a.id.localeCompare(b.id));

  const byOrder = new Map<number, TeacherTeachingHistoryCrossQuestion>();
  for (const question of normalized) {
    if (!byOrder.has(question.questionOrder)) {
      byOrder.set(question.questionOrder, {
        questionOrder: question.questionOrder,
        questionType: question.questionType,
        questionText: question.questionText,
        imagePath: question.imagePath,
      });
    }
  }

  const questions: TeacherTeachingHistoryCrossQuestion[] = [];
  const questionOne = byOrder.get(1);
  const questionTwo = byOrder.get(2);

  // The V11 child rows are authoritative when present. A legacy scalar
  // question is used only to fill a genuinely missing Q1 during mixed/legacy
  // data migration; it must never displace a real V11 Q1 or Q2.
  if (questionOne) {
    questions.push(questionOne);
  } else if (legacyText || legacyImagePath) {
    questions.push({
      questionOrder: 1,
      questionType: "LEGACY",
      questionText: String(legacyText ?? "").trim(),
      imagePath: legacyImagePath ? String(legacyImagePath) : null,
    });
  }
  if (questionTwo) {
    questions.push(questionTwo);
  }

  return questions;
}

function getClient() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

export async function getTeacherTeachingHistory(
  startDate: string,
  endDate: string,
  teacherUuid?: string,
): Promise<TeacherTeachingHistoryData> {
  const identity = requireSchoolIdentity();
  const schoolUuid = String(identity.schoolUuid ?? "").trim();
  if (!schoolUuid) throw new Error("Authenticated school UUID is missing.");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    throw new Error("Please select a valid start and end date.");
  }
  if (startDate > endDate) {
    throw new Error("Start date cannot be after end date.");
  }

  const supabase = getClient();

  let teacherQuery = supabase
    .from("teachers_master")
    .select("teacher_uuid,full_name,school_uuid,subject,is_active")
    .eq("school_uuid", schoolUuid)
    .order("full_name", { ascending: true });

  if (teacherUuid) teacherQuery = teacherQuery.eq("teacher_uuid", teacherUuid);

  const assignmentQuery = supabase
    .from("teacher_classroom_assignments")
    .select("id,teacher_uuid,school_uuid,class_name,section_name,subject_name,academic_year,is_active,created_at")
    .eq("school_uuid", schoolUuid)
    .order("class_name", { ascending: true })
    .order("section_name", { ascending: true })
    .order("subject_name", { ascending: true });

  let absenceQuery = supabase
    .from("teacher_daily_absences")
    .select("teacher_uuid,absence_date,created_at")
    .eq("school_uuid", schoolUuid)
    .gte("absence_date", startDate)
    .lte("absence_date", endDate);

  if (teacherUuid) absenceQuery = absenceQuery.eq("teacher_uuid", teacherUuid);

  const [teacherResult, assignmentResult, absenceResult] = await Promise.all([
    teacherQuery,
    assignmentQuery,
    absenceQuery,
  ]);

  if (teacherResult.error) throw teacherResult.error;
  if (assignmentResult.error) throw assignmentResult.error;
  if (absenceResult.error) throw absenceResult.error;

  const teachers: TeacherTeachingHistoryTeacher[] = (teacherResult.data ?? []).map((row: any) => ({
    teacherUuid: String(row.teacher_uuid ?? ""),
    teacherName: String(row.full_name ?? "Teacher"),
    subject: String(row.subject ?? ""),
    isActive: row.is_active !== false,
  })).filter((row: TeacherTeachingHistoryTeacher) => Boolean(row.teacherUuid));

  const selectedTeacherIds = new Set(teachers.map((teacher) => teacher.teacherUuid));

  const absences: TeacherTeachingHistoryAbsence[] = (absenceResult.data ?? [])
    .map((row: any) => ({
      teacherUuid: String(row.teacher_uuid ?? ""),
      absenceDate: String(row.absence_date ?? ""),
      markedAt: String(row.created_at ?? ""),
    }))
    .filter((row: TeacherTeachingHistoryAbsence) =>
      Boolean(row.teacherUuid && row.absenceDate) && selectedTeacherIds.has(row.teacherUuid)
    );

  const assignments: TeacherTeachingHistoryAssignment[] = (assignmentResult.data ?? [])
    .map((row: any) => ({
      id: String(row.id ?? ""),
      teacherUuid: String(row.teacher_uuid ?? ""),
      className: String(row.class_name ?? ""),
      sectionName: String(row.section_name ?? ""),
      subjectName: String(row.subject_name ?? ""),
      academicYear: String(row.academic_year ?? ""),
      isActive: row.is_active !== false,
      createdAt: String(row.created_at ?? ""),
    }))
    .filter((row: TeacherTeachingHistoryAssignment) =>
      Boolean(row.id) && selectedTeacherIds.has(row.teacherUuid)
    );

  const assignmentIds = assignments.map((assignment) => assignment.id);

  let excludedDates: string[] = [];
  const holidayResult = await supabase
    .from("school_calendar_holidays")
    .select("holiday_date")
    .eq("school_uuid", schoolUuid)
    .gte("holiday_date", startDate)
    .lte("holiday_date", endDate);

  if (holidayResult.error) {
    throw holidayResult.error;
  }

  excludedDates = (holidayResult.data ?? [])
    .map((row: any) => String(row.holiday_date ?? "").trim())
    .filter(Boolean);

  if (!assignmentIds.length) {
    return { teachers, assignments, logs: [], absences, excludedDates };
  }

  const { data, error } = await supabase
    .from("teacher_daily_logs")
    .select("id,teacher_assignment_uuid,chapter_name,topic_name,concepts_covered,cross_question_text,cross_question_image_path,page_from,page_to,homework_given,activity_conducted,teacher_notes,log_date,created_at")
    .in("teacher_assignment_uuid", assignmentIds)
    .gte("log_date", startDate)
    .lte("log_date", endDate)
    .order("log_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;

  let crossQuestionsByLog: Record<string, any[]> = {};
  try {
    const crossQuestionRows = await getSchoolAdminCrossQuestions(
      (data ?? []).map((row: any) => String(row.id ?? "")).filter(Boolean),
    );
    crossQuestionsByLog = groupSchoolAdminCrossQuestionsByLog(crossQuestionRows);
  } catch (crossQuestionError) {
    // Cross Questions are additive presentation enrichment. Preserve the
    // already-working teaching-history fetch if the optional read boundary
    // is unavailable; legacy scalar question fields remain usable.
    console.error("SCHOOL TEACHER HISTORY CROSS QUESTION LOAD FAILED", crossQuestionError);
  }

  const logs: TeacherTeachingHistoryLog[] = (data ?? []).map((row: any) => ({
    id: String(row.id ?? ""),
    teacherAssignmentUuid: String(row.teacher_assignment_uuid ?? ""),
    logDate: String(row.log_date ?? ""),
    chapterName: row.chapter_name
      ? String(row.chapter_name).replace(/^__TP_MANUAL_CHAPTER__:/, "").trim()
      : "",
    topicName: String(row.topic_name ?? ""),
    conceptsCovered: Array.isArray(row.concepts_covered)
      ? row.concepts_covered.map((item: unknown) => String(item ?? "").trim()).filter(Boolean)
      : [],
    crossQuestions: normalizeHistoryCrossQuestions(
      crossQuestionsByLog[String(row.id ?? "")] ?? [],
      row.cross_question_text,
      row.cross_question_image_path,
    ),
    pageFrom: row.page_from == null ? null : Number(row.page_from),
    pageTo: row.page_to == null ? null : Number(row.page_to),
    homeworkGiven: Boolean(row.homework_given),
    activityConducted: Boolean(row.activity_conducted),
    teacherNotes: String(row.teacher_notes ?? ""),
    createdAt: String(row.created_at ?? ""),
  })).filter((row: TeacherTeachingHistoryLog) => Boolean(row.id && row.teacherAssignmentUuid && row.logDate));

  return { teachers, assignments, logs, absences, excludedDates };
}
