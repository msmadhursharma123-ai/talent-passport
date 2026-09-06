import {
  beginAcademicYearOnboarding,
  captureStudentAcademicYearSnapshot,
  completeAcademicYearStudentOnboarding,
  completeAcademicYearTeacherOnboarding,
  getMyAcademicYearContext,
  getSchoolAcademicYears,
  getPendingAcademicYearOnboarding,
  getSchoolCurrentAcademicYear,
  setMyAcademicYear,
} from "../repositories/AcademicYearRepository";
import { getCurrentStudent, getCurrentTeacher } from "../../../services/identityService";
import { getPassportViewModel } from "../../../viewmodels/passportViewModel";

export async function getPendingAcademicYearOnboardingForRole(role: "student"|"teacher") {
  let rows:any[] = [];
  try {
    rows = await getPendingAcademicYearOnboarding();
  } catch (error:any) {
    const code = String(error?.code ?? "");
    const message = String(error?.message ?? "").toLowerCase();
    const featureMissing = code === "42P01" || code === "42883" || message.includes("get_my_academic_year_onboarding") && message.includes("does not exist");
    if (featureMissing) {
      console.error("ACADEMIC YEAR MIGRATION NOT DEPLOYED; PRESERVING EXISTING LOGIN", error);
      return null;
    }
    throw error;
  }
  const identity = role === "student" ? getCurrentStudent() : getCurrentTeacher();
  const schoolUuid = identity?.schoolUuid;
  if (!schoolUuid) return null;
  const candidate = rows.find((row:any) => row.role === role && row.school_uuid === schoolUuid);
  if (!candidate) return null;
  const years = await getSchoolAcademicYears(schoolUuid);
  const year = years.find(item => item.id === candidate.school_academic_year_id);
  if (!year) return null;
  return { ...candidate, year };
}

export async function prepareTeacherAcademicYearOnboarding(academicYearId: string) {
  const teacher = getCurrentTeacher();
  if (!teacher?.schoolUuid) throw new Error("Teacher school identity is unavailable.");
  const year = (await getSchoolAcademicYears(teacher.schoolUuid)).find(item => item.id === academicYearId);
  if (!year) throw new Error("The academic year could not be resolved.");
  await beginAcademicYearOnboarding("teacher", academicYearId);
  await setMyAcademicYear(teacher.schoolUuid, academicYearId);
  return year;
}

export async function prepareStudentAcademicYearOnboarding(academicYearId: string) {
  const student = getCurrentStudent();
  if (!student?.schoolUuid || !student.studentUuid) throw new Error("Student identity is unavailable.");
  const years = await getSchoolAcademicYears(student.schoolUuid);
  const target = years.find(item => item.id === academicYearId);
  if (!target) throw new Error("The academic year could not be resolved.");

  const current = await getSchoolCurrentAcademicYear(student.schoolUuid);
  if (current && current.id !== target.id) {
    // Force the snapshot source to the real current year. This also clears a
    // previously selected historical context without changing identity/auth.
    await setMyAcademicYear(student.schoolUuid, current.id);
    try {
      const currentModel = await getPassportViewModel();
      await captureStudentAcademicYearSnapshot(student.studentUuid, current.id, currentModel);
    } catch (error) {
      console.error("FULL STUDENT HISTORICAL PASSPORT SNAPSHOT FAILED; RAW SNAPSHOT IS RETAINED", error);
      await captureStudentAcademicYearSnapshot(student.studentUuid, current.id);
    }
  }

  await beginAcademicYearOnboarding("student", academicYearId);
  await setMyAcademicYear(student.schoolUuid, academicYearId);
  return target;
}

export async function finishTeacherAcademicYearOnboarding(academicYearId: string) {
  return completeAcademicYearTeacherOnboarding(academicYearId);
}

export async function finishStudentAcademicYearOnboarding(academicYearId: string) {
  // The questionnaire is staged in the target-year snapshot. The live/current
  // student profile, DNA and Passport are applied atomically when that year
  // becomes current, so the old year cannot be contaminated during onboarding.
  return completeAcademicYearStudentOnboarding(academicYearId, null);
}

export async function resetToCurrentAcademicYear(schoolUuid: string) {
  const current = await getSchoolCurrentAcademicYear(schoolUuid);
  if (current) await setMyAcademicYear(schoolUuid, current.id);
  return current;
}
