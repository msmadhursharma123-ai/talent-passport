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

  if (logsError) {
    console.error(
      "LECTURE LOG FETCH ERROR",
      logsError
    );

    return [];
  }

  const enrichedLogs = [];

for (const log of logs ?? []) {

  const assignment =
    assignments.find(
      (item: any) =>
        item.id ===
        log.teacher_assignment_uuid
    );


  if (!assignment) {

    enrichedLogs.push(log);

    continue;

  }
console.log("ASSIGNMENT");
console.log(assignment);

console.log("CURRENT ASSIGNMENT");
console.log(assignment);

console.log("TEACHER UUID");
console.log(assignment.teacher_uuid);



const {
  data: teacher,
  error: teacherError,
} = await (supabase as any)
  .from("teachers_master")
  .select("*")
  .eq(
    "teacher_uuid",
    assignment.teacher_uuid
  );

console.log("TEACHER QUERY RESULT");
console.log(teacher);

console.log("TEACHER QUERY ERROR");
console.log(teacherError);

console.log("TEACHER DATA");
console.log(teacher);

console.log("TEACHER ERROR");
console.log(teacherError);

enrichedLogs.push({

  ...log,

teacher_name:
teacher?.[0]?.full_name ??
"Teacher",

});

}
console.log("LECTURE LOGS");
console.log(logs);

return enrichedLogs;



}

/* ============================================================
   TODAY'S DAILY LECTURE LOGS
============================================================ */

export async function getTodaysLectureLogs() {

  const logs =
    await getStudentDailyLectureLogs();

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

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