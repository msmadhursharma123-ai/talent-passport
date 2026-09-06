import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentAdmin, getCurrentSchool, getCurrentStudent, getCurrentTeacher } from "../../../services/identityService";
import type { AcademicYearStatus, SchoolAcademicYear } from "../models/AcademicYearModels";

const TABLE = "school_academic_years";

function client() {
  const s = getSupabaseClient();
  if (!s) throw new Error("Supabase is not configured.");
  return s as any;
}

function mapRow(r: any): SchoolAcademicYear {
  return {
    id: String(r.id),
    schoolUuid: String(r.school_uuid ?? ""),
    academicYearId: r.academic_year_id ? String(r.academic_year_id) : null,
    academicYearCode: String(r.academic_year_code ?? ""),
    academicYearName: String(r.academic_year_name ?? r.academic_year_code ?? ""),
    startDate: String(r.start_date ?? ""),
    endDate: String(r.end_date ?? ""),
    status: String(r.status ?? "PLANNED").toUpperCase() as AcademicYearStatus,
    isCurrent: Boolean(r.is_current),
    onboardingOpen: r.onboarding_open == null ? undefined : Boolean(r.onboarding_open),
    createdAt: String(r.created_at ?? ""),
    updatedAt: String(r.updated_at ?? ""),
    createdBy: r.created_by ?? null,
    closedAt: r.closed_at ?? null,
  };
}

export async function getSchoolAcademicYears(schoolUuid: string) {
  if (!schoolUuid) return [];
  const { data, error } = await client()
    .from(TABLE)
    .select("*")
    .eq("school_uuid", schoolUuid)
    .order("start_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getSchoolCurrentAcademicYear(schoolUuid: string) {
  if (!schoolUuid) return null;
  const { data, error } = await client()
    .from(TABLE)
    .select("*")
    .eq("school_uuid", schoolUuid)
    .eq("is_current", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function getMyAcademicYearContext() {
  const { data, error } = await client().rpc("get_my_academic_year_context");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row ? mapRow(row) : null;
}

export async function createSchoolAcademicYear(input: {
  schoolUuid: string;
  academicYearCode: string;
  academicYearName: string;
  startDate: string;
  endDate: string;
}) {
  const { data, error } = await client().rpc("create_school_academic_year", {
    p_school_uuid: input.schoolUuid,
    p_academic_year_code: input.academicYearCode.trim(),
    p_academic_year_name: input.academicYearName.trim(),
    p_start_date: input.startDate,
    p_end_date: input.endDate,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Academic year was not created.");
  return mapRow(row);
}

export async function setSchoolAcademicYearCurrent(id: string) {
  const { data, error } = await client().rpc("activate_school_academic_year", {
    p_school_academic_year_id: id,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Academic year could not be activated.");
  return mapRow(row);
}

export async function closeSchoolAcademicYear(id: string) {
  const { data, error } = await client().rpc("close_school_academic_year", {
    p_school_academic_year_id: id,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Academic year could not be closed.");
  return mapRow(row);
}

export async function setMyAcademicYear(schoolUuid: string, id: string) {
  const { data, error } = await client().rpc("set_my_academic_year", {
    p_school_uuid: schoolUuid,
    p_school_academic_year_id: id,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Academic year context could not be changed.");
  return mapRow(row);
}

export async function getPendingAcademicYearOnboarding() {
  const { data, error } = await client().rpc("get_my_academic_year_onboarding");
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function beginAcademicYearOnboarding(role: "student" | "teacher", academicYearId: string) {
  const { data, error } = await client().rpc("begin_academic_year_onboarding", {
    p_role: role,
    p_school_academic_year_id: academicYearId,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Academic year onboarding could not be started.");
  return row;
}

export async function completeAcademicYearTeacherOnboarding(academicYearId: string) {
  const { data, error } = await client().rpc("complete_academic_year_teacher_onboarding", {
    p_school_academic_year_id: academicYearId,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Teacher academic-year onboarding could not be completed.");
  return row;
}

export async function captureStudentAcademicYearSnapshot(
  studentUuid: string,
  academicYearId: string,
  passportViewModel?: unknown
) {
  const { data, error } = await client().rpc("capture_student_academic_year_snapshot", {
    p_student_uuid: studentUuid,
    p_school_academic_year_id: academicYearId,
    p_passport_view_model: passportViewModel ?? null,
  });
  if (error) throw error;
  return data;
}

export async function completeAcademicYearStudentOnboarding(
  academicYearId: string,
  passportViewModel?: unknown
) {
  const { data, error } = await client().rpc("complete_academic_year_student_onboarding", {
    p_school_academic_year_id: academicYearId,
    p_passport_view_model: passportViewModel ?? null,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Student academic-year onboarding could not be completed.");
  return row;
}

export async function saveAcademicYearProfileDraft(academicYearId: string, profile: Record<string, unknown>) {
  const { data, error } = await client().rpc("save_student_academic_year_profile_draft", {
    p_school_academic_year_id: academicYearId,
    p_profile: profile,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function saveAcademicYearQuestionnaireDraft(academicYearId: string, answers: unknown, scores: unknown, passport: unknown) {
  const { data, error } = await client().rpc("save_student_academic_year_questionnaire_draft", {
    p_school_academic_year_id: academicYearId,
    p_answers: answers,
    p_scores: scores,
    p_passport: passport,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function getAcademicYearOnboardingSummary(academicYearId: string) {
  if (!academicYearId) return { studentPending: 0, studentCompleted: 0, teacherPending: 0, teacherCompleted: 0 };
  const { data, error } = await client()
    .from("academic_year_onboarding_status")
    .select("role,status")
    .eq("school_academic_year_id", academicYearId);
  if (error) throw error;
  return (data ?? []).reduce((acc:any,row:any)=>{
    const key=`${row.role}${row.status === "COMPLETED" ? "Completed" : "Pending"}`;
    if (key in acc) acc[key] += 1;
    return acc;
  }, { studentPending:0, studentCompleted:0, teacherPending:0, teacherCompleted:0 });
}

export async function getStudentAcademicYearSnapshot(academicYearId: string) {
  const student = getCurrentStudent();
  if (!student?.studentUuid || !academicYearId) return null;
  const { data, error } = await client()
    .from("student_academic_year_snapshots")
    .select("*")
    .eq("student_uuid", student.studentUuid)
    .eq("school_academic_year_id", academicYearId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export function resolveIdentitySchoolUuid() {
  return getCurrentTeacher()?.schoolUuid
    ?? getCurrentStudent()?.schoolUuid
    ?? getCurrentSchool()?.schoolUuid
    ?? null;
}

export function isPlatformAdmin() {
  return Boolean(getCurrentAdmin()?.adminId);
}
