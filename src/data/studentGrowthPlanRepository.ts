import { getSupabaseClient } from "../supabaseClient";

import {
  requireIdentity,
} from "../services/identityService";

/* ============================================================
   TYPES
============================================================ */

export interface StudentDailyLectureLog {
  id: string;
  teacher_assignment_uuid: string;

  teacher_name?: string;

  school_name?: string;
  class_name?: string;
  section_name?: string;

  subject_name?: string;
  topic_name?: string;

  page_from?: number;
  page_to?: number;

  homework_given?: boolean;
  activity_conducted?: string;
  teacher_notes?: string;

  log_date?: string;
}

/* ============================================================
   DAILY LECTURE LOGS
============================================================ */

export async function getStudentDailyLectureLogs() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return [];
  }

const identity = requireIdentity();

/* --------------------------------------------------------
   FETCH LATEST STUDENT ACADEMIC MAPPING
-------------------------------------------------------- */

const {
  data: student,
  error: studentError,
} = await (supabase as any)
  .from("students_master")
  .select(
    "school_name, class_name, section_name"
  )
  .eq(
    "student_uuid",
    identity.studentUuid
  )
  .single();

if (studentError || !student) {
  console.error(
    "STUDENT FETCH ERROR",
    studentError
  );

  return [];
}

console.log("LATEST STUDENT DATA");
console.log(student);

const schoolName =
  student.school_name;

const className =
  student.class_name;

const sectionName =
  student.section_name;

console.log("================================");
console.log("STEP 1 : STUDENT DETAILS");
console.log("Student UUID :", identity.studentUuid);
console.log("School Name :", schoolName);
console.log("Class Name :", className);
console.log("Section Name :", sectionName);
console.log("================================");

  /* --------------------------------------------------------
     STEP 1

     FETCH SCHOOL UUID FROM schools_master
  -------------------------------------------------------- */

  const {
    data: school,
    error: schoolError,
  } = await (supabase as any)
    .from("schools_master")
    .select("school_uuid")
    .eq("school_name", schoolName)
    .single();

  if (schoolError || !school) {
    console.error(
      "SCHOOL FETCH ERROR",
      schoolError
    );

    return [];
  }

  const schoolUuid = school.school_uuid;

console.log("================================");
console.log("STEP 2 : SCHOOL UUID");
console.log("School UUID :", schoolUuid);
console.log("================================");

console.log("SCHOOL DATA");
console.log(school);

  /* --------------------------------------------------------
     STEP 2

     FETCH TEACHER ASSIGNMENTS
  -------------------------------------------------------- */

  const {
    data: assignments,
    error: assignmentError,
  } = await (supabase as any)
    .from("teacher_classroom_assignments")
    .select("*")
    .eq("school_uuid", schoolUuid)
    .eq("class_name", className)
    .eq("section_name", sectionName);

console.log("================================");
console.log("STEP 3 : TEACHER ASSIGNMENTS");
console.log(assignments);
console.log("================================");

console.log("TEACHER ASSIGNMENTS");
console.log(assignments);

  if (assignmentError) {
    console.error(
      "ASSIGNMENT FETCH ERROR",
      assignmentError
    );

    return [];
  }

  if (
    !assignments ||
    assignments.length === 0
  ) {
    return [];
  }



  /* --------------------------------------------------------
     STEP 3

     EXTRACT TEACHER ASSIGNMENT UUIDs
  -------------------------------------------------------- */

  const assignmentIds = assignments.map(
    (item: any) => item.id
  );

console.log("================================");
console.log("STEP 4 : ASSIGNMENT UUIDS");
console.log(assignmentIds);
console.log("================================");

console.log("ASSIGNMENT IDS");
console.log(assignmentIds);

  /* --------------------------------------------------------
     STEP 4

     FETCH DAILY LOGS
  -------------------------------------------------------- */

  const {
    data: logs,
    error: logsError,
  } = await (supabase as any)
    .from("teacher_daily_logs")
    .select("*")
    .in(
      "teacher_assignment_uuid",
      assignmentIds
    )
    .order("log_date", {
      ascending: false,
    });

console.log("================================");
console.log("STEP 5 : DAILY LOGS");
console.log(logs);
console.log("================================");

  if (logsError) {
    console.error(
      "LECTURE LOG FETCH ERROR",
      logsError
    );

    return [];
  }

  const teacherUuids = Array.from(
    new Set(
      (assignments ?? [])
        .map((item: any) => item.teacher_uuid)
        .filter(Boolean)
    )
  );

  let teacherMap = new Map<string, string>();

  if (teacherUuids.length > 0) {
    const { data: teachers, error: teachersError } =
      await (supabase as any)
        .from("teachers_master")
        .select("teacher_uuid, full_name")
        .in("teacher_uuid", teacherUuids);

    if (teachersError) {
      console.error("TEACHER FETCH ERROR", teachersError);
    } else {
      teacherMap = new Map(
        (teachers ?? []).map((teacher: any) => [
          teacher.teacher_uuid,
          teacher.full_name ?? "Teacher",
        ])
      );
    }
  }

  const assignmentMap = new Map(
    (assignments ?? []).map((assignment: any) => [
      assignment.id,
      assignment,
    ])
  );

  const enrichedLogs =
    (logs ?? []).map((log: any) => {
      const assignment: any =
        assignmentMap.get(log.teacher_assignment_uuid);

      return {
        ...log,
        teacher_uuid: log.teacher_uuid ?? assignment?.teacher_uuid,
        school_uuid: log.school_uuid ?? assignment?.school_uuid,
        class_name: log.class_name ?? assignment?.class_name,
        section_name: log.section_name ?? assignment?.section_name,
        subject_name: log.subject_name ?? assignment?.subject_name,
        teacher_name:
          teacherMap.get(assignment?.teacher_uuid) ?? "Teacher",
      };
    });

console.log("================================");
console.log("STEP 6 : FINAL LOGS");
console.table(enrichedLogs);
console.log("================================");

return enrichedLogs;



}

/* ============================================================
   TODAY'S DAILY LECTURE LOGS
============================================================ */

export async function getTodaysLectureLogs() {

  const logs =
    await getStudentDailyLectureLogs();

  const now = new Date();

  const today =
    [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

  return logs.filter(
    (log: any) =>
      log.log_date === today
  );

}

/* ============================================================
   CONTINUOUS CALENDAR

   FUTURE IMPLEMENTATION
============================================================ */

export async function
getStudentMonthlyLectureLogs() {

  const logs =
    await getStudentDailyLectureLogs();

  return logs;

}

/* ============================================================
   PROGRESS TRACKER

   FUTURE IMPLEMENTATION
============================================================ */

export async function
getProgressTrackerData() {

  return null;

}

/* ============================================================
   STUDENT FEEDBACK

   FUTURE IMPLEMENTATION
============================================================ */

export async function
submitStudentLectureFeedback() {

  return null;

}

/* ============================================================
   SUBJECTS

   FUTURE IMPLEMENTATION
============================================================ */

export async function
getStudentSubjects() {

  return [];

}