import { getSupabaseClient } from "../supabaseClient";
import { requireIdentity } from "../services/identityService";

/* ============================================================
   TYPES
============================================================ */

export interface StudentDailyLectureLog {
  id: string;
  teacher_assignment_uuid: string;
  teacher_uuid?: string;

  teacher_name?: string;

  school_uuid?: string;
  school_name?: string;
  class_name?: string;
  section_name?: string;

  subject_name?: string;
  topic_name?: string;
  concepts_covered?: string[];

  page_from?: number;
  page_to?: number;

  homework_given?: boolean;
  activity_conducted?: string | boolean;
  teacher_notes?: string;

  log_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface StudentAcademicContext {
  studentUuid: string;
  schoolUuid: string;
  schoolName: string;
  className: string;
  sectionName: string;
}

const LOG_SELECT = `
  id,
  teacher_assignment_uuid,
  topic_name,
  concepts_covered,
  page_from,
  page_to,
  homework_given,
  activity_conducted,
  teacher_notes,
  log_date
`;

const ASSIGNMENT_SELECT = `
  id,
  teacher_uuid,
  school_uuid,
  class_name,
  section_name,
  subject_name
`;

// A page can ask for the same student context/assignment set several
// times (daily feed, subject dropdown, credit summary). Keep the
// resolved values for this browser session so those calls do not
// repeatedly hit students_master and teacher_classroom_assignments.
let cachedContext: StudentAcademicContext | null = null;
let cachedContextStudentUuid = "";
let cachedContextPromise: Promise<StudentAcademicContext | null> | null = null;
let cachedAssignmentsKey = "";
let cachedAssignments: any[] | null = null;
let cachedAssignmentsPromise: Promise<any[]> | null = null;
let cachedLectureLogs: any[] | null = null;
let cachedLectureLogsStudentUuid = "";
let cachedLectureLogsPromise: Promise<any[]> | null = null;

/* ============================================================
   SHARED STUDENT CONTEXT

   The old implementation performed:
   student -> school -> assignments -> logs -> teacher query #1
   -> teacher query #2 -> teacher query #3 ...

   The teacher lookups were the biggest avoidable N+1 cost.
   This helper keeps the same identity resolution while allowing
   the rest of the repository to batch the database work.
============================================================ */

async function getStudentAcademicContext(): Promise<StudentAcademicContext | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const identity = requireIdentity();

  if (
    cachedContext &&
    cachedContextStudentUuid === identity.studentUuid
  ) {
    return cachedContext;
  }

  if (cachedContextPromise) {
    return await cachedContextPromise;
  }

  cachedContextPromise = (async () => {
    const { data: student, error: studentError } = await (supabase as any)
      .from("students_master")
      .select("student_uuid,school_uuid,school_name,class_name,section_name")
      .eq("student_uuid", identity.studentUuid)
      .single();

    if (studentError || !student) {
      console.error("STUDENT FETCH ERROR", studentError);
      return null;
    }

    let schoolUuid = student.school_uuid ?? "";

    if (!schoolUuid && student.school_name) {
      const { data: school, error: schoolError } = await (supabase as any)
        .from("schools_master")
        .select("school_uuid")
        .eq("school_name", student.school_name)
        .single();

      if (schoolError || !school) {
        console.error("SCHOOL FETCH ERROR", schoolError);
        return null;
      }

      schoolUuid = school.school_uuid;
    }

    if (!schoolUuid) {
      console.error("STUDENT SCHOOL UUID MISSING");
      return null;
    }

    cachedContext = {
      studentUuid: identity.studentUuid,
      schoolUuid: String(schoolUuid),
      schoolName: student.school_name ?? "",
      className: student.class_name ?? "",
      sectionName: student.section_name ?? "",
    };
    cachedContextStudentUuid = identity.studentUuid;

    return cachedContext;
  })();

  try {
    return await cachedContextPromise;
  } finally {
    cachedContextPromise = null;
  }
}

async function getStudentAssignments(
  context: StudentAcademicContext
) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const cacheKey = `${context.schoolUuid}|${context.className}|${context.sectionName}`;

  if (cachedAssignments && cachedAssignmentsKey === cacheKey) {
    return cachedAssignments;
  }

  if (cachedAssignmentsPromise) {
    return await cachedAssignmentsPromise;
  }

  cachedAssignmentsPromise = (async () => {
    const { data, error } = await (supabase as any)
      .from("teacher_classroom_assignments")
      .select(ASSIGNMENT_SELECT)
      .eq("school_uuid", context.schoolUuid)
      .eq("class_name", context.className)
      .eq("section_name", context.sectionName);

    if (error) {
      console.error("ASSIGNMENT FETCH ERROR", error);
      return [];
    }

    cachedAssignments = data ?? [];
    cachedAssignmentsKey = cacheKey;

    return cachedAssignments;
  })();

  try {
    return await cachedAssignmentsPromise;
  } finally {
    cachedAssignmentsPromise = null;
  }
}

async function enrichLogsWithTeacherNames(
  logs: any[],
  assignments: any[]
) {
  const supabase = getSupabaseClient();
  if (!supabase || logs.length === 0) return logs;

  const assignmentMap = new Map(
    assignments.map((assignment: any) => [
      String(assignment.id),
      assignment,
    ])
  );

  const teacherUuids = Array.from(
    new Set(
      logs
        .map((log: any) => {
          const assignment = assignmentMap.get(
            String(log.teacher_assignment_uuid)
          );
          return assignment?.teacher_uuid ?? log.teacher_uuid ?? null;
        })
        .filter(Boolean)
        .map(String)
    )
  );

  const teacherMap = new Map<string, string>();

  if (teacherUuids.length > 0) {
    const { data: teachers, error } = await (supabase as any)
      .from("teachers_master")
      .select("teacher_uuid,full_name")
      .in("teacher_uuid", teacherUuids);

    if (error) {
      console.warn("TEACHER BATCH FETCH FAILED", error);
    } else {
      for (const teacher of teachers ?? []) {
        teacherMap.set(
          String(teacher.teacher_uuid),
          teacher.full_name ?? "Teacher"
        );
      }
    }
  }

  return logs.map((log: any) => {
    const assignment = assignmentMap.get(
      String(log.teacher_assignment_uuid)
    );

    const teacherUuid =
      assignment?.teacher_uuid ??
      log.teacher_uuid ??
      "";

    return {
      ...log,
      teacher_uuid: teacherUuid,
      school_uuid:
        assignment?.school_uuid ??
        log.school_uuid ??
        "",
      school_name:
        log.school_name ??
        "",
      class_name:
        assignment?.class_name ??
        log.class_name ??
        "",
      section_name:
        assignment?.section_name ??
        log.section_name ??
        "",
      subject_name:
        assignment?.subject_name ??
        log.subject_name ??
        "",
      teacher_name:
        teacherMap.get(String(teacherUuid)) ??
        log.teacher_name ??
        "Teacher",
    };
  });
}

/* ============================================================
   DAILY LECTURE LOGS
============================================================ */

export async function getStudentDailyLectureLogs() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const context = await getStudentAcademicContext();
  if (!context) return [];

  if (
    cachedLectureLogs &&
    cachedLectureLogsStudentUuid === context.studentUuid
  ) {
    return cachedLectureLogs;
  }

  if (cachedLectureLogsPromise) {
    return await cachedLectureLogsPromise;
  }

  cachedLectureLogsPromise = (async () => {
    const assignments = await getStudentAssignments(context);
    if (assignments.length === 0) {
      cachedLectureLogs = [];
      cachedLectureLogsStudentUuid = context.studentUuid;
      return [];
    }

    const assignmentIds = assignments
      .map((item: any) => item.id)
      .filter(Boolean);

    const { data: logs, error: logsError } = await (supabase as any)
      .from("teacher_daily_logs")
      .select(LOG_SELECT)
      .in("teacher_assignment_uuid", assignmentIds)
      .order("log_date", { ascending: false });

    if (logsError) {
      console.error("LECTURE LOG FETCH ERROR", logsError);
      return [];
    }

    const enrichedLogs = await enrichLogsWithTeacherNames(
      logs ?? [],
      assignments
    );

    cachedLectureLogs = enrichedLogs;
    cachedLectureLogsStudentUuid = context.studentUuid;

    return enrichedLogs;
  })();

  try {
    return await cachedLectureLogsPromise;
  } finally {
    cachedLectureLogsPromise = null;
  }
}

/* ============================================================
   CLASSROOM DATE NORMALIZATION
============================================================ */

function getIndiaCalendarDateKey(value?: unknown) {
  const source =
    value === undefined
      ? new Date()
      : value;

  const parsed =
    source instanceof Date
      ? source
      : new Date(String(source));

  if (Number.isNaN(parsed.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsed);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function toIndiaCalendarDateKey(value: unknown) {
  if (value === null || value === undefined) return "";

  const raw = String(value).trim();
  if (!raw) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  return getIndiaCalendarDateKey(raw);
}

/*
   TeacherDailyLogDialog writes log_date as an ISO timestamp.
   Build database boundaries in IST so a log created late/early in
   the India calendar day is not shifted into the wrong date.
*/
function getIndiaDateRangeUtc(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00+05:30`);
  const endExclusive = new Date(`${endDate}T00:00:00+05:30`);

  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

  return {
    startIso: start.toISOString(),
    endExclusiveIso: endExclusive.toISOString(),
  };
}

/* ============================================================
   TODAY'S DAILY LECTURE LOGS
============================================================ */

export async function getTodaysLectureLogs() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const context = await getStudentAcademicContext();
  if (!context) return [];

  const assignments = await getStudentAssignments(context);
  if (assignments.length === 0) return [];

  const assignmentIds = assignments
    .map((item: any) => item.id)
    .filter(Boolean);

  const today = getIndiaCalendarDateKey();
  if (!today) return [];

  const { startIso, endExclusiveIso } = getIndiaDateRangeUtc(today, today);

  // IMPORTANT: teacher_daily_logs does not have teacher_uuid, school_uuid,
  // school_name, subject_name, class_name or section_name as persisted log
  // columns. Those values are resolved from teacher_classroom_assignments.
  // Query only the actual teacher_daily_logs columns and enrich afterwards.
  const { data: logs, error } = await (supabase as any)
    .from("teacher_daily_logs")
    .select(LOG_SELECT)
    .in("teacher_assignment_uuid", assignmentIds)
    .gte("log_date", startIso)
    .lt("log_date", endExclusiveIso)
    .order("log_date", { ascending: false });

  if (error) {
    console.error("TODAY LECTURE LOG FETCH ERROR", error);
    throw error;
  }

  return enrichLogsWithTeacherNames(logs ?? [], assignments);
}

/* ============================================================
   SUBJECT OPTIONS
============================================================ */

export async function getStudentSubjects() {
  // Subjects must come from subjects for which the student has actually
  // received at least one teacher_daily_logs record — not merely from
  // classroom assignments.
  const logs = await getStudentDailyLectureLogs();

  const subjects: string[] = Array.from(
    new Set(
      (logs ?? [])
        .map((log: any) => String(log.subject_name ?? "").trim())
        .filter((subject: string) => Boolean(subject))
    )
  );

  return subjects.sort((a, b) => a.localeCompare(b));
}

/* ============================================================
   FEEDBACK STATEMENT DATA

   This is intentionally a dedicated fetch path. The statement is
   generated only after the student clicks Fetch Feedback Records,
   so opening Daily Feedback does not pay this historical-query cost.
============================================================ */

export async function getStudentFeedbackStatementData(
  startDate: string,
  endDate: string,
  subjectName: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { logs: [], feedback: [] };
  }

  const context = await getStudentAcademicContext();
  if (!context) {
    return { logs: [], feedback: [] };
  }

  const assignments = await getStudentAssignments(context);
  if (assignments.length === 0) {
    return { logs: [], feedback: [] };
  }

  const assignmentIds = assignments
    .map((item: any) => item.id)
    .filter(Boolean);

  const { startIso, endExclusiveIso } = getIndiaDateRangeUtc(
    startDate,
    endDate
  );

  // Fetch the records from the same teacher_daily_logs source that powers
  // the daily lecture feed. Do not select/filter on teacher_uuid or
  // subject_name here because those are resolved from the assignment.
  const { data: rawLogs, error: logsError } = await (supabase as any)
    .from("teacher_daily_logs")
    .select(LOG_SELECT)
    .in("teacher_assignment_uuid", assignmentIds)
    .gte("log_date", startIso)
    .lt("log_date", endExclusiveIso)
    .order("log_date", { ascending: true });

  if (logsError) {
    console.error("FEEDBACK STATEMENT LOG FETCH ERROR", logsError);
    throw logsError;
  }

  const enrichedLogs = await enrichLogsWithTeacherNames(
    rawLogs ?? [],
    assignments
  );

  const logRows = enrichedLogs.filter((log: any) =>
    String(log.subject_name ?? "").trim() === String(subjectName).trim()
  );

  const logIds = logRows
    .map((log: any) => log.id)
    .filter(Boolean);

  if (logIds.length === 0) {
    return { logs: [], feedback: [] };
  }

  const { data: feedback, error: feedbackError } = await (supabase as any)
    .from("student_daily_feedback")
    .select(
      "id,daily_log_uuid,understanding_level,concepts_not_understood,submitted_at,additional_note"
    )
    .eq("student_uuid", context.studentUuid)
    .in("daily_log_uuid", logIds);

  if (feedbackError) {
    console.error("FEEDBACK STATEMENT RESPONSE FETCH ERROR", feedbackError);
    throw feedbackError;
  }

  return {
    logs: logRows,
    feedback: feedback ?? [],
  };
}

/* ============================================================
   CONTINUOUS CALENDAR
============================================================ */

export async function getStudentMonthlyLectureLogs() {
  return await getStudentDailyLectureLogs();
}

/* ============================================================
   PROGRESS TRACKER
============================================================ */

export async function getProgressTrackerData() {
  return null;
}

/* ============================================================
   STUDENT FEEDBACK
============================================================ */

export async function submitStudentLectureFeedback() {
  return null;
}
