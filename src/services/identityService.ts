/* ============================================================
   TALENT PASSPORT IDENTITY SERVICE

   Single Source of Truth for Student Identity

   Every Student Module must use this service.
============================================================ */

export interface StudentIdentity {

  /* Authentication */

  authUserId?: string;

  /* students table */

  studentUuid: string;

  /* students_master table */

  masterStudentId: string;

  /* Human Readable Student ID */

  studentCode: string;

  /* Student Information */

  studentName: string;

  schoolName?: string;

  className?: string;

  section?: string;

  parentEmail?: string;

  parentPhone?: string;

  email?: string;

}

/* ============================================================
   STORAGE KEY
============================================================ */

const STORAGE_KEY = "studentProfile";

/* ============================================================
   SAVE STUDENT IDENTITY
============================================================ */

export function saveStudentIdentity(
  student: StudentIdentity
) {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(student)
  );

}

/* ============================================================
   GET CURRENT STUDENT
============================================================ */

export function getCurrentStudent():
  StudentIdentity | null {

  const raw =
    localStorage.getItem(STORAGE_KEY);

  if (!raw) {

    return null;

  }

  try {

    return JSON.parse(raw);

  }

  catch {

    return null;

  }

}

/* ============================================================
   UPDATE STUDENT IDENTITY
============================================================ */

export function updateStudentIdentity(
  updates: Partial<StudentIdentity>
) {

  const current =
    getCurrentStudent();

  if (!current) {

    return;

  }

  saveStudentIdentity({

    ...current,

    ...updates

  });

}

/* ============================================================
   CLEAR STUDENT SESSION
============================================================ */

export function clearStudentIdentity() {

  localStorage.removeItem(
    STORAGE_KEY
  );

}

/* ============================================================
   CHECK LOGIN
============================================================ */

export function isStudentLoggedIn() {

  return getCurrentStudent() !== null;

}