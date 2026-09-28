import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentTeacher, requireIdentity, requireSchoolIdentity } from "../../../services/identityService";
import { getMyAcademicYearContext } from "../../academicYear/repositories/AcademicYearRepository";
import { getTeacherAssignmentsByTeacher } from "../../teacherIntelligence/repository/TeacherAssignmentRepository";
import type { CanonicalExamPreparationOptions, CanonicalExamPreparationRow } from "../../examPreparationIntelligence/canonical/ExamPreparationTypes";

type OverlayOptions = Omit<CanonicalExamPreparationOptions, "scope"> & {
  scope: "student" | "teacher" | "school" | "ptm";
  className?: string;
  sectionName?: string;
  assignmentIds?: string[];
};

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function norm(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function occurrenceToken(row: any) {
  const source = String(row.source ?? row.source_type ?? "").toLowerCase();
  if (source === "live") {
    return String(
      row.sourceFeedbackId ??
      row.source_feedback_id ??
      row.liveRowId ??
      row.source_live_id ??
      row.id ??
      ""
    ).trim();
  }
  if (source === "monthly") {
    return String(row.sourceMonthlyItemId ?? row.source_monthly_item_id ?? row.id ?? "")
      .replace(/^monthly-/, "")
      .trim();
  }
  return String(row.sourceLoop2Id ?? row.source_loop2_id ?? row.id ?? "").trim();
}

function structuralOccurrenceKey(row: any) {
  const student = String(row.studentUuid ?? row.student_uuid ?? "").trim();
  const assignment = String(row.teacherAssignmentUuid ?? row.teacher_assignment_uuid ?? "").trim();
  const log = String(row.dailyLogUuid ?? row.daily_log_uuid ?? "").trim();
  const subject = norm(row.subjectName ?? row.subject_name);
  const concept = norm(row.conceptName ?? row.concept_name ?? row.doubt_concept);
  if (!student || !assignment || !log || !subject || !concept) return null;
  return [student, assignment, log, subject, concept].join("|");
}

function occurrenceKey(row: any) {
  const structural = structuralOccurrenceKey(row);
  const token = occurrenceToken(row);
  if (!structural || !token) return null;
  return `${structural}|${token}`;
}

function missingProjectionInfrastructure(error: any) {
  const message = String(error?.message ?? error ?? "").toLowerCase();
  return message.includes("tp_learning_verification_projection") || message.includes("schema cache") || message.includes("does not exist");
}

async function allowedAssignmentIds(options: OverlayOptions) {
  if (options.scope === "student" || options.scope === "ptm") return null;

  if (options.scope === "teacher") {
    const teacher = getCurrentTeacher();
    if (!teacher) return new Set<string>();
    const assignments = await getTeacherAssignmentsByTeacher(teacher.teacherUuid);
    const inSchool = teacher.schoolUuid
      ? assignments.filter((assignment) => String(assignment.schoolUuid ?? "") === String(teacher.schoolUuid))
      : assignments;
    const requested = options.teacherAssignmentIds?.length
      ? new Set(options.teacherAssignmentIds.map(String))
      : null;
    return new Set<string>(
      inSchool
        .map((assignment) => String(assignment.id ?? ""))
        .filter((id) => id && (!requested || requested.has(id)))
    );
  }

  const school = requireSchoolIdentity();
  const { data, error } = await client()
    .from("teacher_classroom_assignments")
    .select("id,is_active")
    .eq("school_uuid", options.schoolUuid ?? school.schoolUuid);
  if (error) throw error;
  return new Set<string>(
    (data ?? [])
      .filter((row: any) => options.activeAssignmentsOnly === false || row.is_active !== false)
      .map((row: any) => String(row.id ?? ""))
      .filter(Boolean)
  );
}

function rowPassesScope(row: any, options: OverlayOptions, assignments: Set<string> | null) {
  if (options.scope !== "student" && assignments && !assignments.has(String(row.teacher_assignment_uuid ?? ""))) return false;
  if (options.scope === "student") {
    const identity = requireIdentity();
    if (String(row.student_uuid) !== String(options.studentUuid ?? identity.studentUuid)) return false;
  }
  
  if (options.subjectName && norm(options.subjectName) !== norm(row.subject_name)) return false;
  if (options.className && norm(options.className) !== norm(row.class_name)) return false;
  if (options.sectionName && norm(options.sectionName) !== norm(row.section_name)) return false;
  if (options.startDate && String(row.log_date) < options.startDate) return false;
  if (options.endDateExclusive && String(row.log_date) >= options.endDateExclusive) return false;
  return true;
}

export async function applyMonthlyCanonicalOverlay(
  baseRows: CanonicalExamPreparationRow[],
  options: OverlayOptions
): Promise<CanonicalExamPreparationRow[]> {
  try {
    let query = client()
      .from("tp_learning_verification_projection")
      .select("*")
      .eq("is_active", true);

    if (options.scope === "student") {
      const identity = requireIdentity();
      query = query.eq("student_uuid", options.studentUuid ?? identity.studentUuid);
    } else if (options.scope === "teacher") {
      const teacher = getCurrentTeacher();
      if (!teacher) return baseRows;
      query = query.eq("teacher_uuid", teacher.teacherUuid);
    } else if (options.scope === "school") {
      const school = requireSchoolIdentity();
      query = query.eq("school_uuid", options.schoolUuid ?? school.schoolUuid);
    } else {
      const assignmentIds = (options as any).assignmentIds ?? [];
      if (!assignmentIds.length) return baseRows;
      query = query.in("teacher_assignment_uuid", assignmentIds.map(String));
    }

    const { data, error } = await query;
    if (error) throw error;

    const assignments = options.scope === "ptm"
      ? new Set((options.assignmentIds ?? []).map(String))
      : await allowedAssignmentIds(options);

    // Monthly/current projection state must never leak across academic years.
    // The existing Canonical base remains authoritative; this filter only
    // controls which isolated projection rows may overlay the current view.
    const projectionSchoolUuid =
      options.schoolUuid ??
      (options.scope === "student" ? requireIdentity().schoolUuid : undefined) ??
      (options.scope === "teacher" ? getCurrentTeacher()?.schoolUuid : undefined) ??
      (options.scope === "ptm" ? options.schoolUuid : undefined) ??
      (options.scope === "school" ? requireSchoolIdentity().schoolUuid : undefined);

    if (!projectionSchoolUuid) return baseRows;

    // Monthly overlay is a CURRENT academic-year feature only. Respect the
    // deployed AcademicYearContext, not merely the school's current row. A
    // historical context must return the pre-existing Canonical result intact.
    const academicYearContext = await getMyAcademicYearContext();
    if (!academicYearContext?.id || !academicYearContext.isCurrent) return baseRows;
    if (String(academicYearContext.schoolUuid ?? projectionSchoolUuid) !== String(projectionSchoolUuid)) return baseRows;
    const currentAcademicYearId = String(academicYearContext.id);

    const projections = (data ?? []).filter((projection: any) => {
      if (!rowPassesScope(projection, options, assignments)) return false;
      if (String(projection.academic_year_id ?? "") !== currentAcademicYearId) return false;
      return true;
    });
    if (!projections.length) return baseRows;

    const loop2Ids = projections
      .filter((projection: any) => String(projection.source_type).toLowerCase() === "loop2" && projection.source_loop2_id)
      .map((projection: any) => String(projection.source_loop2_id));
    const liveIds = projections
      .map((projection: any) => projection.source_live_id)
      .filter(Boolean)
      .map(String);

    const [pendingResult, liveResult] = await Promise.all([
      loop2Ids.length
        ? client().from("pending_teacher_doubts").select("id,status").in("id", Array.from(new Set(loop2Ids)))
        : Promise.resolve({ data: [], error: null }),
      liveIds.length
        ? client().from("student_live_unresolved_doubts").select("id,is_unresolved").in("id", Array.from(new Set(liveIds)))
        : Promise.resolve({ data: [], error: null }),
    ]);
    if (pendingResult.error) throw pendingResult.error;
    if (liveResult.error) throw liveResult.error;

    const pendingActive = new Set((pendingResult.data ?? []).filter((row: any) => norm(row.status) === "not discussed").map((row: any) => String(row.id)));
    const liveActive = new Set((liveResult.data ?? []).filter((row: any) => row.is_unresolved === true).map((row: any) => String(row.id)));

    const baseByKey = new Map<string, CanonicalExamPreparationRow>();
    const currentSourceByStructuralKey = new Set<string>();
    for (const row of baseRows) {
      const key = occurrenceKey(row);
      if (key) baseByKey.set(key, row);
      if (row.source === "live" || row.source === "loop2") {
        const structural = structuralOccurrenceKey(row);
        if (structural) currentSourceByStructuralKey.add(structural);
      }
    }

    const merged = [...baseRows];
    const existing = new Set(baseByKey.keys());

    for (const projection of projections) {
      const state = String(projection.review_state).toUpperCase();
      const source = String(projection.source_type).toLowerCase();
      const key = occurrenceKey(projection);
      const structural = structuralOccurrenceKey(projection);
      if (!key || !structural) continue;

      const base = baseByKey.get(key);

      // A current Loop-2/Live row wins over a historical Monthly projection
      // even when their source occurrence tokens differ. The exact occurrence
      // token is still retained for deduplication/history, so a newer source
      // feedback cannot collapse into an older projection row.
      if (source === "monthly" && currentSourceByStructuralKey.has(structural)) continue;
      if (source !== "monthly" && base?.source === "live" && base.liveRowId) continue;

      if (source === "live") continue;
      if (source === "loop2" && !pendingActive.has(String(projection.source_loop2_id ?? ""))) continue;
      if (source === "live" && projection.source_live_id && !liveActive.has(String(projection.source_live_id))) continue;

      if (state === "RESOLVED") {
        // Daily verification can resolve a Loop-2-only occurrence inside the
        // isolated projection. Suppress only that exact Loop-2 source identity;
        // a newer Loop-2 occurrence with the same concept/log must remain visible.
        if (source === "loop2" && base && String(base.id) === String(projection.source_loop2_id ?? "")) {
          const index = merged.findIndex((row) => String(row.id) === String(base.id));
          if (index >= 0) merged.splice(index, 1);
          existing.delete(key);
        }
        // Monthly resolution is historical state. It must never suppress a
        // current Loop-2/Live source row; it only prevents the monthly row from
        // being re-added when the current source is absent.
        continue;
      }

      if (existing.has(key)) continue;

      merged.push({
        id: source === "monthly" ? `monthly-${String(projection.source_monthly_item_id)}` : String(projection.source_loop2_id),
        studentUuid: String(projection.student_uuid),
        studentName: String(projection.student_name ?? "Student"),
        teacherUuid: projection.teacher_uuid ? String(projection.teacher_uuid) : null,
        teacherAssignmentUuid: String(projection.teacher_assignment_uuid),
        dailyLogUuid: projection.daily_log_uuid ? String(projection.daily_log_uuid) : null,
        className: String(projection.class_name ?? ""),
        sectionName: String(projection.section_name ?? ""),
        subjectName: String(projection.subject_name ?? "Other"),
        topicName: String(projection.topic_name ?? ""),
        conceptName: String(projection.concept_name ?? ""),
        canonicalDate: String(projection.log_date ?? ""),
        isUnresolved: true,
        source: source as "loop2" | "live" | "monthly",
        sourceFeedbackId: projection.source_feedback_id ? String(projection.source_feedback_id) : null,
        liveRowId: projection.source_live_id ? String(projection.source_live_id) : null,
      });
      existing.add(key);
    }

    return merged.sort((a, b) =>
      a.canonicalDate.localeCompare(b.canonicalDate) ||
      a.studentName.localeCompare(b.studentName) ||
      a.subjectName.localeCompare(b.subjectName) ||
      a.conceptName.localeCompare(b.conceptName) ||
      a.id.localeCompare(b.id)
    );
  } catch (error) {
    // The Monthly layer is additive. The locked architecture requires the
    // existing Canonical result to survive ANY failure in the new overlay
    // infrastructure; never let a new-table/RLS/network/schema error break
    // the pre-existing Loop-2 + Live intelligence path.
    console.error("MONTHLY CANONICAL OVERLAY FAILED — PRESERVING EXISTING CANONICAL RESULT", error);
    return baseRows;
  }
}
