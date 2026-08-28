import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentTeacher, requireSchoolIdentity } from "../../../services/identityService";
import { getTeacherAssignmentsByTeacher } from "../../teacherIntelligence/repository/TeacherAssignmentRepository";
import type {
  LessonPlannerPayload,
  PlannerRecord,
  PlannerType,
  QuestionPaperPayload,
  TeacherAssignmentOption,
  PlannerStatus,
  PlannerRecommendation,
} from "../types/PlannerModels";

const TABLE = "academic_planner_documents";

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function mapRow(row: any): PlannerRecord {
  return {
    id: String(row.id),
    schoolUuid: String(row.school_uuid ?? ""),
    teacherUuid: String(row.teacher_uuid ?? ""),
    teacherName: String(row.teacher_name ?? "Teacher"),
    plannerType: row.planner_type as PlannerType,
    title: String(row.title ?? ""),
    templateKey: String(row.template_key ?? "default"),
    className: String(row.class_name ?? ""),
    sectionName: String(row.section_name ?? ""),
    subjectName: String(row.subject_name ?? ""),
    startDate: String(row.start_date ?? ""),
    endDate: String(row.end_date ?? ""),
    payload: (row.payload ?? {}) as LessonPlannerPayload | QuestionPaperPayload,
    status: row.status as PlannerStatus,
    reviewNote: String(row.review_note ?? ""),
    submittedAt: row.submitted_at ?? null,
    reviewedAt: row.reviewed_at ?? null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export async function getPlannerAssignments(): Promise<TeacherAssignmentOption[]> {
  const teacher = getCurrentTeacher();
  if (!teacher?.teacherUuid) return [];
  const assignments = await getTeacherAssignmentsByTeacher(teacher.teacherUuid);
  return assignments
    .filter(item => item.isActive !== false)
    .map(item => ({
      id: String(item.id),
      className: String(item.className ?? ""),
      sectionName: String(item.sectionName ?? ""),
      subjectName: String(item.subjectName ?? ""),
      academicYear: item.academicYear,
    }));
}

export async function getPlannerRecommendations(input: { plannerType: PlannerType; className: string; chapterName?: string; chapterNames?: string[] }): Promise<PlannerRecommendation[]> {
  const classValue = input.className;
  if (!classValue) return [];
  const singleChapter = input.chapterName ?? "";
  const multipleChapters = (input.chapterNames ?? []).filter(Boolean);
  if (input.plannerType === "lesson" || input.plannerType === "worksheet") {
    if (!singleChapter) return [];
  } else if (!multipleChapters.length) {
    return [];
  }
  const { data, error } = await client().rpc("get_planner_recommendations", {
    p_planner_type: input.plannerType,
    p_class_name: classValue,
    p_chapter_name: singleChapter || null,
    p_chapter_names: multipleChapters.length ? multipleChapters : null,
  });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...mapRow(row),
    matchCount: row.match_count == null ? undefined : Number(row.match_count),
    matchPercent: row.match_percent == null ? undefined : Number(row.match_percent),
  }));
}

export async function getTeacherPlanners(plannerType: PlannerType): Promise<PlannerRecord[]> {
  const teacher = getCurrentTeacher();
  if (!teacher?.teacherUuid) return [];
  const { data, error } = await client()
    .from(TABLE)
    .select("*")
    .eq("teacher_uuid", teacher.teacherUuid)
    .eq("planner_type", plannerType)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function getSchoolPlanners(plannerType: PlannerType): Promise<PlannerRecord[]> {
  const identity = requireSchoolIdentity();
  if (!identity?.schoolUuid) throw new Error("Authenticated school UUID is missing.");
  const { data, error } = await client()
    .from(TABLE)
    .select("*")
    .eq("school_uuid", identity.schoolUuid)
    .eq("planner_type", plannerType)
    .order("teacher_name", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function savePlanner(input: {
  id?: string;
  plannerType: PlannerType;
  title: string;
  templateKey: string;
  className: string;
  sectionName: string;
  subjectName: string;
  startDate: string;
  endDate: string;
  payload: LessonPlannerPayload | QuestionPaperPayload;
  /** Exact chapter key(s) used by the recommendation engine. */
  chapterName?: string;
  chapterNames?: string[];
  submit?: boolean;
}): Promise<PlannerRecord> {
  const teacher = getCurrentTeacher();
  if (!teacher?.teacherUuid || !teacher.schoolUuid) throw new Error("Teacher identity is unavailable.");
  const supabase = client();
  const row = {
    school_uuid: teacher.schoolUuid,
    teacher_uuid: teacher.teacherUuid,
    teacher_name: teacher.teacherName ?? "Teacher",
    planner_type: input.plannerType,
    title: input.title.trim() || "Untitled Planner",
    template_key: input.templateKey,
    class_name: input.className,
    section_name: input.sectionName,
    subject_name: input.subjectName,
    start_date: input.startDate || null,
    end_date: input.endDate || null,
    payload: input.payload,
    chapter_name: input.chapterName ?? ((input.payload as any).chapter ?? null),
    chapter_names: input.chapterNames ?? (((input.payload as any).chapters ?? null) as string[] | null),
    status: input.submit ? "SUBMITTED" : "DRAFT",
    submitted_at: input.submit ? new Date().toISOString() : null,
  };

  const query = input.id
    ? supabase.from(TABLE).update(row).eq("id", input.id).eq("teacher_uuid", teacher.teacherUuid).select("*").single()
    : supabase.from(TABLE).insert(row).select("*").single();
  const { data, error } = await query;
  if (error) throw error;
  return mapRow(data);
}

export async function reviewPlanner(id: string, status: "APPROVED" | "REJECTED", reviewNote = "") {
  const identity = requireSchoolIdentity();
  if (!identity?.schoolUuid) throw new Error("Authenticated school UUID is missing.");
  const { data, error } = await client()
    .from(TABLE)
    .update({ status, review_note: reviewNote, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("school_uuid", identity.schoolUuid)
    .select("*")
    .single();
  if (error) throw error;
  return mapRow(data);
}

export async function updateSchoolPlanner(id: string, patch: Partial<Pick<PlannerRecord, "title" | "className" | "sectionName" | "subjectName" | "startDate" | "endDate" | "payload">>) {
  const identity = requireSchoolIdentity();
  if (!identity?.schoolUuid) throw new Error("Authenticated school UUID is missing.");
  const row: any = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.className !== undefined) row.class_name = patch.className;
  if (patch.sectionName !== undefined) row.section_name = patch.sectionName;
  if (patch.subjectName !== undefined) row.subject_name = patch.subjectName;
  if (patch.startDate !== undefined) row.start_date = patch.startDate || null;
  if (patch.endDate !== undefined) row.end_date = patch.endDate || null;
  if (patch.payload !== undefined) {
    row.payload = patch.payload;
    const payload = patch.payload as any;
    if (Object.prototype.hasOwnProperty.call(payload, "chapter")) row.chapter_name = payload.chapter || null;
    if (Object.prototype.hasOwnProperty.call(payload, "chapters")) row.chapter_names = Array.isArray(payload.chapters) ? payload.chapters : null;
  }
  const { data, error } = await client().from(TABLE).update(row).eq("id", id).eq("school_uuid", identity.schoolUuid).select("*").single();
  if (error) throw error;
  return mapRow(data);
}
