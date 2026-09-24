import { getSupabaseClient } from "../../../supabaseClient";
import {
  getCurrentTeacher,
  requireIdentity,
  requireSchoolIdentity,
} from "../../../services/identityService";
import { getTeacherAssignmentsByTeacher } from "../../teacherIntelligence/repository/TeacherAssignmentRepository";
import {
  getLiveDoubtsForSchool,
  getLiveDoubtsForTeacherAssignments,
  getStudentLiveDoubtRows,
  reconcilePendingDoubtsWithLiveLedger,
} from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";
import type {
  CanonicalExamPreparationOptions,
  CanonicalExamPreparationRow,
  ExamPreparationClassroomResult,
  ExamPreparationStudentResult,
  SchoolExamPreparationClassroomResult,
} from "./ExamPreparationTypes";
import {
  examPreparationDateKey,
  isExamPreparationDateInRange,
} from "./ExamPreparationDate";

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function normalize(value: unknown) {
  return clean(value).toLowerCase().replace(/\s+/g, " ");
}

function isAllSubjects(value?: string) {
  const normalized = normalize(value);
  return !normalized || normalized === "all subjects" || normalized === "all_subjects";
}

function activeLoop2(row: any) {
  if (row?.doubt_resolved === true) return false;

  const status = normalize(row?.status);
  return status === "not discussed" || row?.doubt_resolved === false;
}

function canonicalDateFromLive(row: any) {
  return (
    row?.first_seen_at ??
    row?.source_submitted_at ??
    row?.latest_source_submitted_at ??
    row?.created_at ??
    ""
  );
}

function canonicalDateFromPending(row: any) {
  return row?.log_date ?? row?.created_at ?? "";
}

function topicFrom(row: any) {
  return clean(
    row?.previous_topic_name ??
      row?.topic_name ??
      row?.previous_difficult_concept ??
      row?.doubt_concept
  );
}

function conceptFrom(row: any) {
  return clean(
    row?.previous_difficult_concept ??
      row?.doubt_concept ??
      row?.previous_topic_name ??
      row?.topic_name
  );
}

async function fetchPendingRows(
  options: CanonicalExamPreparationOptions,
  assignmentIds: string[]
) {
  const supabase = client();

  let query = supabase
    .from("pending_teacher_doubts")
    .select("*")
    .eq("status", "NOT DISCUSSED");

  if (options.scope === "student") {
    const identity = requireIdentity();
    query = query.eq(
      "student_uuid",
      options.studentUuid ?? identity.studentUuid
    );
  }

  if (options.scope === "teacher" && assignmentIds.length > 0) {
    query = query.in("teacher_assignment_uuid", assignmentIds);
  }

  if (options.scope === "school" && assignmentIds.length > 0) {
    query = query.in("teacher_assignment_uuid", assignmentIds);
  }

  if (options.scope !== "student" && assignmentIds.length === 0) {
    return [];
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).filter(activeLoop2);
}

async function resolveScope(
  options: CanonicalExamPreparationOptions
) {
  if (options.scope === "student") {
    const identity = requireIdentity();
    return {
      studentUuid: identity.studentUuid,
      assignmentIds: [] as string[],
      schoolUuid: identity.schoolUuid ?? "",
    };
  }

  if (options.scope === "teacher") {
    const teacher = getCurrentTeacher();
    if (!teacher) throw new Error("Authenticated teacher identity is missing.");

    const assignments = await getTeacherAssignmentsByTeacher(
      teacher.teacherUuid
    );

    // Keep the Exam Preparation teacher scope inside the authenticated
    // teacher's school. The shared assignment repository intentionally
    // returns every assignment for a teacher, so the canonical projection
    // must apply the portal identity boundary here.
    const schoolAssignments = teacher.schoolUuid
      ? assignments.filter(
          (assignment) =>
            String(assignment.schoolUuid ?? "") ===
            String(teacher.schoolUuid)
        )
      : assignments;

    return {
      studentUuid: options.studentUuid,
      assignmentIds: schoolAssignments
        .map((assignment) => String(assignment.id ?? ""))
        .filter(Boolean),
      schoolUuid: teacher.schoolUuid ?? "",
    };
  }

  const school = requireSchoolIdentity();
  if (!school.schoolUuid) {
    throw new Error("Authenticated school UUID is missing.");
  }

  const { data, error } = await client()
    .from("teacher_classroom_assignments")
    .select(
      "id,teacher_uuid,school_uuid,academic_year,is_active,class_name,section_name,subject_name"
    )
    .eq("school_uuid", school.schoolUuid);

  if (error) throw error;

  const assignments = (data ?? []).filter(
    (assignment: any) =>
      options.activeAssignmentsOnly === false || assignment.is_active !== false
  );

  return {
    studentUuid: options.studentUuid,
    assignmentIds: assignments
      .map((assignment: any) => String(assignment.id ?? ""))
      .filter(Boolean),
    schoolUuid: school.schoolUuid,
    assignments,
  };
}

async function fetchLiveRows(
  options: CanonicalExamPreparationOptions,
  assignmentIds: string[],
  schoolUuid: string
) {
  if (options.scope === "student") {
    return getStudentLiveDoubtRows(true);
  }

  if (options.scope === "teacher") {
    return getLiveDoubtsForTeacherAssignments(assignmentIds, true);
  }

  const rows = await getLiveDoubtsForSchool(schoolUuid, true);
  const allowed = new Set(assignmentIds);
  return rows.filter((row) =>
    allowed.has(String(row.teacher_assignment_uuid ?? ""))
  );
}

function rowMatchesStudent(row: any, studentUuid?: string) {
  return !studentUuid || String(row?.student_uuid ?? "") === String(studentUuid);
}

function canonicalizeReconciledRow(
  item: { pending: any; live: any; merged: any }
): CanonicalExamPreparationRow | null {
  const merged = item.merged;
  const live = item.live;
  if (!merged || !activeLoop2(merged)) return null;

  const studentUuid = clean(merged.student_uuid ?? live?.student_uuid);
  const assignmentUuid = clean(
    live?.teacher_assignment_uuid ?? merged.teacher_assignment_uuid
  );
  const subjectName = clean(merged.subject_name ?? live?.subject_name) || "Other";

  if (!studentUuid || !assignmentUuid) return null;

  const canonicalDate = examPreparationDateKey(
    live ? canonicalDateFromLive(live) : canonicalDateFromPending(merged)
  );
  if (!canonicalDate) return null;

  const topicName = topicFrom(merged) || topicFrom(live);
  const conceptName = conceptFrom(merged) || conceptFrom(live);

  return {
    id: clean(merged.id) || `live-${clean(live?.id)}`,
    studentUuid,
    studentName:
      clean(merged.student_name) ||
      clean(live?.student_name) ||
      "Student",
    teacherUuid:
      clean(merged.teacher_uuid) ||
      clean(live?.teacher_uuid) ||
      null,
    teacherAssignmentUuid: assignmentUuid,
    dailyLogUuid:
      clean(live?.daily_log_uuid) ||
      clean(merged.daily_log_uuid) ||
      null,
    className:
      clean(merged.class_name) ||
      clean(live?.class_name) ||
      "",
    sectionName:
      clean(merged.section_name) ||
      clean(live?.section_name) ||
      "",
    subjectName,
    topicName,
    conceptName,
    canonicalDate,
    isUnresolved: true,
    source: live ? "live" : "loop2",
    sourceFeedbackId:
      clean(live?.source_feedback_id) ||
      clean(live?.latest_source_feedback_id) ||
      clean(merged.source_feedback_id) ||
      null,
    liveRowId: clean(live?.id) || null,
  };
}

/**
 * The only source used by the three Exam Preparation portals.
 *
 * Critical ordering:
 *   1. Load the complete in-scope Loop-2 population.
 *   2. Load the complete in-scope Live population.
 *   3. Reconcile them using the existing exact match hierarchy.
 *   4. Remove resolved rows.
 *   5. Apply subject/date filters to the reconciled current-state rows.
 *
 * This prevents a date or subject filter from separating a Loop-2 row from
 * its Live counterpart before the authoritative current state is known.
 */
function finalizeCanonicalRows(
  reconciled: Array<{ pending: any; live: any; merged: any }>,
  options: Pick<CanonicalExamPreparationOptions, "subjectName" | "startDate" | "endDateExclusive">
) {
  const hasSubjectFilter = !isAllSubjects(options.subjectName);

  return reconciled
    .map(canonicalizeReconciledRow)
    .filter((row): row is CanonicalExamPreparationRow => Boolean(row))
    .filter((row) =>
      !hasSubjectFilter ||
      normalize(row.subjectName) === normalize(options.subjectName)
    )
    .filter((row) =>
      isExamPreparationDateInRange(
        row.canonicalDate,
        options.startDate,
        options.endDateExclusive
      )
    )
    .sort(
      (a, b) =>
        a.canonicalDate.localeCompare(b.canonicalDate) ||
        a.studentName.localeCompare(b.studentName) ||
        a.subjectName.localeCompare(b.subjectName) ||
        a.conceptName.localeCompare(b.conceptName) ||
        a.id.localeCompare(b.id)
    );
}

export async function getCanonicalExamPreparationRows(
  options: CanonicalExamPreparationOptions
): Promise<CanonicalExamPreparationRow[]> {
  const scope = await resolveScope(options);

  const assignmentIds = scope.assignmentIds;

  const [pendingRows, liveRows] = await Promise.all([
    fetchPendingRows(
      {
        ...options,
        studentUuid:
          options.scope === "student"
            ? scope.studentUuid
            : options.studentUuid,
      },
      assignmentIds
    ),
    fetchLiveRows(options, assignmentIds, scope.schoolUuid),
  ]);

  const scopedPending = pendingRows.filter((row: any) =>
    rowMatchesStudent(row, options.studentUuid ?? (
      options.scope === "student" ? scope.studentUuid : undefined
    ))
  );

  const scopedLive = liveRows.filter((row: any) =>
    rowMatchesStudent(row, options.studentUuid)
  );

  const reconciled = reconcilePendingDoubtsWithLiveLedger(
    scopedPending,
    scopedLive,
    { includeUnmatchedLive: true }
  );

  return finalizeCanonicalRows(reconciled, options);
}

/**
 * PTM projection of the same canonical Loop-2 + Live Exam Preparation engine.
 *
 * PTM supplies assignment IDs already authorized by its teacher/classroom
 * scope. This function re-validates those IDs against the authenticated
 * school, active status, and optional class/section before reading doubt rows.
 * Reconciliation, canonicalization, subject filtering, and date filtering are
 * exactly the same functions used by the existing Exam Preparation portals.
 */
export async function getCanonicalPTMExamPreparationRows(options: {
  studentUuid: string;
  assignmentIds: string[];
  schoolUuid: string;
  className?: string;
  sectionName?: string;
  subjectName?: string;
  startDate?: string;
  endDateExclusive?: string;
}): Promise<CanonicalExamPreparationRow[]> {
  const requestedAssignmentIds = Array.from(
    new Set(options.assignmentIds.map((id) => String(id ?? "").trim()).filter(Boolean))
  );

  if (!options.studentUuid || !options.schoolUuid || requestedAssignmentIds.length === 0) {
    return [];
  }

  const supabase = client();
  const { data: assignmentRows, error: assignmentError } = await supabase
    .from("teacher_classroom_assignments")
    .select(
      "id,teacher_uuid,school_uuid,academic_year,is_active,class_name,section_name,subject_name"
    )
    .eq("school_uuid", options.schoolUuid)
    .eq("is_active", true)
    .in("id", requestedAssignmentIds);

  if (assignmentError) throw assignmentError;

  const validAssignments = (assignmentRows ?? []).filter((row: any) => {
    if (options.className && normalize(row.class_name) !== normalize(options.className)) return false;
    if (options.sectionName && normalize(row.section_name) !== normalize(options.sectionName)) return false;
    return true;
  });

  const validAssignmentIds: string[] = Array.from(
    new Set<string>(validAssignments.map((row: any) => String(row.id ?? "")).filter(Boolean))
  );

  if (validAssignmentIds.length === 0) return [];

  const [{ data: pendingRows, error: pendingError }, liveRows] = await Promise.all([
    supabase
      .from("pending_teacher_doubts")
      .select("*")
      .eq("status", "NOT DISCUSSED")
      .eq("student_uuid", options.studentUuid)
      .in("teacher_assignment_uuid", validAssignmentIds),
    getLiveDoubtsForTeacherAssignments(validAssignmentIds, true),
  ]);

  if (pendingError) throw pendingError;

  const validAssignmentSet = new Set(validAssignmentIds);
  const scopedPending = (pendingRows ?? []).filter(
    (row: any) =>
      rowMatchesStudent(row, options.studentUuid) &&
      validAssignmentSet.has(String(row?.teacher_assignment_uuid ?? "")) &&
      activeLoop2(row)
  );

  const scopedLive = (liveRows ?? []).filter(
    (row: any) =>
      rowMatchesStudent(row, options.studentUuid) &&
      validAssignmentSet.has(String(row?.teacher_assignment_uuid ?? ""))
  );

  const reconciled = reconcilePendingDoubtsWithLiveLedger(
    scopedPending,
    scopedLive,
    { includeUnmatchedLive: true }
  );

  return finalizeCanonicalRows(reconciled, options).filter((row) => {
    if (options.className && normalize(row.className) !== normalize(options.className)) return false;
    if (options.sectionName && normalize(row.sectionName) !== normalize(options.sectionName)) return false;
    return row.studentUuid === options.studentUuid;
  });
}

function attentionLevel(count: number): "HIGH" | "MEDIUM" | "LOW" {
  if (count >= 6) return "HIGH";
  if (count >= 3) return "MEDIUM";
  return "LOW";
}

function studentResult(
  rows: CanonicalExamPreparationRow[],
  studentUuid: string
): ExamPreparationStudentResult {
  const studentRows = rows.filter((row) => row.studentUuid === studentUuid);

  const topics = studentRows.map((row) => row.topicName).filter(Boolean);
  const subtopics = studentRows.map((row) => row.conceptName).filter(Boolean);

  const topicCounts = new Map<string, number>();
  topics.forEach((topic) =>
    topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1)
  );

  const highestRiskTopic =
    Array.from(topicCounts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
    )[0]?.[0] ?? "-";

  return {
    studentUuid,
    studentName: studentRows[0]?.studentName ?? "Student",
    totalUnresolvedDoubts: studentRows.length,
    topics,
    subtopics,
    highestRiskTopic,
    attentionLevel: attentionLevel(studentRows.length),
  };
}

export function buildStudentExamPreparationResult(
  rows: CanonicalExamPreparationRow[]
) {
  const bySubject = new Map<string, CanonicalExamPreparationRow[]>();

  for (const row of rows) {
    const key = normalize(row.subjectName);
    const list = bySubject.get(key) ?? [];
    list.push(row);
    bySubject.set(key, list);
  }

  const subjectBreakdown = Array.from(bySubject.values())
    .map((subjectRows) => {
      const subject = subjectRows[0]?.subjectName ?? "Other";
      const concepts = new Map<string, number>();
      const topics = new Map<string, { label: string; count: number; subtopics: string[] }>();

      for (const row of subjectRows) {
        if (row.conceptName) {
          const conceptKey = normalize(row.conceptName);
          concepts.set(
            conceptKey,
            (concepts.get(conceptKey) ?? 0) + 1
          );
        }

        if (row.topicName) {
          const topicKey = normalize(row.topicName);
          const current = topics.get(topicKey) ?? {
            label: row.topicName,
            count: 0,
            subtopics: [],
          };
          current.count += 1;
          if (row.conceptName) current.subtopics.push(row.conceptName);
          topics.set(topicKey, current);
        }
      }

      return {
        subject,
        totalUnresolvedDoubts: subjectRows.length,
        concepts: Array.from(concepts.entries())
          .map(([conceptKey, signals]) => ({
            concept:
              subjectRows.find((row) => normalize(row.conceptName) === conceptKey)?.conceptName ??
              conceptKey,
            signals,
          }))
          .sort(
            (a, b) => b.signals - a.signals || a.concept.localeCompare(b.concept)
          ),
        topics: Array.from(topics.values())
          .sort(
            (a, b) => b.count - a.count || a.label.localeCompare(b.label)
          )
          .map((item) => ({
            topic: item.label,
            signals: item.count,
            subtopics: item.subtopics,
          })),
        highestRiskTopic:
          Array.from(topics.values()).sort(
            (a, b) => b.count - a.count || a.label.localeCompare(b.label)
          )[0]?.label ?? "-",
        attentionLevel: attentionLevel(subjectRows.length),
      };
    })
    .sort(
      (a, b) =>
        b.totalUnresolvedDoubts - a.totalUnresolvedDoubts ||
        a.subject.localeCompare(b.subject)
    );

  const studentIds = Array.from(new Set(rows.map((row) => row.studentUuid)));

  const globalTopicCounts = new Map<string, { label: string; count: number }>();
  rows.forEach((row) => {
    if (!row.topicName) return;
    const key = normalize(row.topicName);
    const current = globalTopicCounts.get(key);
    globalTopicCounts.set(key, {
      label: current?.label ?? row.topicName,
      count: (current?.count ?? 0) + 1,
    });
  });

  const highestRiskTopic =
    Array.from(globalTopicCounts.values()).sort(
      (a, b) => b.count - a.count || a.label.localeCompare(b.label)
    )[0]?.label ?? "-";

  return {
    totalUnresolvedDoubts: rows.length,
    topics: Array.from(globalTopicCounts.values())
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .map((item) => item.label),
    highestRiskTopic,
    attentionLevel: attentionLevel(rows.length),
    subjectBreakdown,
    _effectiveRows: rows,
    _studentIds: studentIds,
  };
}

export function buildTeacherExamPreparationResult(
  rows: CanonicalExamPreparationRow[]
): ExamPreparationClassroomResult[] {
  const classroomMap = new Map<string, CanonicalExamPreparationRow[]>();

  for (const row of rows) {
    const key = `Class ${row.className} - Section ${row.sectionName}`;
    const list = classroomMap.get(key) ?? [];
    list.push(row);
    classroomMap.set(key, list);
  }

  return Array.from(classroomMap.entries())
    .map(([classroom, classroomRows]) => {
      const students = Array.from(
        new Set(classroomRows.map((row) => row.studentUuid))
      )
        .map((studentUuid) => studentResult(classroomRows, studentUuid))
        .sort(
          (a, b) =>
            b.totalUnresolvedDoubts - a.totalUnresolvedDoubts ||
            a.studentName.localeCompare(b.studentName)
        );

      return { classroom, students };
    })
    .sort((a, b) => a.classroom.localeCompare(b.classroom));
}

export function buildSchoolExamPreparationResult(
  rows: CanonicalExamPreparationRow[],
  assignments: any[] = [],
  students: any[] = [],
  teachers: any[] = []
): SchoolExamPreparationClassroomResult[] {
  const teacherNames = new Map(
    teachers.map((teacher) => [
      String(teacher.teacher_uuid ?? ""),
      String(teacher.full_name ?? "Teacher"),
    ])
  );
  const studentNames = new Map(
    students.map((student) => [
      String(student.student_uuid ?? ""),
      String(student.student_name ?? "Student"),
    ])
  );

  // Student and Teacher Exam Preparation both retain historical assignment
  // rows. School must use the same assignment universe or an inactive
  // historical assignment can disappear from the school projection while
  // remaining visible to the student/teacher for the same time range.
  const activeAssignments = assignments;

  const classroomMap = new Map<string, any>();

  for (const assignment of activeAssignments) {
    const className = clean(assignment.class_name);
    const sectionName = clean(assignment.section_name);
    const key = `${className}__${sectionName}`;

    if (!classroomMap.has(key)) {
      classroomMap.set(key, {
        classroomKey: key,
        classroom: `Class ${className} - Section ${sectionName}`,
        className,
        sectionName,
        subjects: [],
      });
    }

    const assignmentUuid = clean(assignment.id);
    const assignmentRows = rows.filter(
      (row) => row.teacherAssignmentUuid === assignmentUuid
    );

    const studentIds = Array.from(
      new Set(assignmentRows.map((row) => row.studentUuid))
    );

    const subjectStudents = studentIds
      .map((studentUuid) =>
        studentResult(assignmentRows, studentUuid)
      )
      .map((result) => ({
        ...result,
        studentName:
          result.studentName ||
          studentNames.get(result.studentUuid) ||
          "Student",
      }))
      .sort(
        (a, b) =>
          b.totalUnresolvedDoubts - a.totalUnresolvedDoubts ||
          a.studentName.localeCompare(b.studentName)
      );

    const commonDoubts = new Map<string, number>();
    assignmentRows.forEach((row) => {
      const topic = row.topicName || row.conceptName;
      if (topic) {
        commonDoubts.set(topic, (commonDoubts.get(topic) ?? 0) + 1);
      }
    });

    classroomMap.get(key).subjects.push({
      assignmentUuid,
      subjectName: clean(assignment.subject_name) || "Subject",
      teacherUuid: clean(assignment.teacher_uuid),
      teacherName:
        teacherNames.get(clean(assignment.teacher_uuid)) ?? "Teacher",
      students: subjectStudents,
      totalStudentsWithUnresolvedDoubts: subjectStudents.length,
      doubtsPerKid: subjectStudents.length
        ? Math.round((assignmentRows.length / subjectStudents.length) * 10) / 10
        : 0,
      commonDoubts: Array.from(commonDoubts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 3)
        .map(([topic]) => topic),
    });
  }

  return Array.from(classroomMap.values())
    .map((classroom) => ({
      ...classroom,
      subjects: classroom.subjects
        .sort((a: any, b: any) =>
          a.subjectName.localeCompare(b.subjectName)
        ),
    }))
    .sort(
      (a, b) =>
        Number(a.className) - Number(b.className) ||
        a.sectionName.localeCompare(b.sectionName)
    );
}


export async function loadCanonicalSchoolExamPreparation(
  options: {
    startDate?: string;
    endDateExclusive?: string;
  } = {}
) {
  const school = requireSchoolIdentity();
  if (!school.schoolUuid) {
    throw new Error("Authenticated school UUID is missing.");
  }

  const supabase = client();

  const [assignmentResult, studentResult, teacherResult] = await Promise.all([
    supabase
      .from("teacher_classroom_assignments")
      .select(
        "id,teacher_uuid,school_uuid,academic_year,is_active,class_name,section_name,subject_name"
      )
      .eq("school_uuid", school.schoolUuid),

    supabase
      .from("students_master")
      .select("student_uuid,student_name,school_uuid,school_name,class_name,section_name")
      .eq("school_uuid", school.schoolUuid),

    supabase
      .from("teachers_master")
      .select("teacher_uuid,full_name,school_uuid,is_active")
      .eq("school_uuid", school.schoolUuid),
  ]);

  if (assignmentResult.error) throw assignmentResult.error;
  if (studentResult.error) throw studentResult.error;
  if (teacherResult.error) throw teacherResult.error;

  const assignments = assignmentResult.data ?? [];
  const students = studentResult.data ?? [];
  const teachers = teacherResult.data ?? [];

  const rows = await getCanonicalExamPreparationRows({
    scope: "school",
    startDate: options.startDate,
    endDateExclusive: options.endDateExclusive,
    activeAssignmentsOnly: false,
  });

  return buildSchoolExamPreparationResult(
    rows,
    assignments,
    students,
    teachers
  );
}
