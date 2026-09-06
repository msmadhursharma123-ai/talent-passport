import { getAcademicYearRuntime } from "../context/AcademicYearRuntime";

export function assertCurrentAcademicYearWritable() {
  const runtime = getAcademicYearRuntime();
  if (!runtime?.academicYear?.isCurrent || runtime.academicYear.status !== "ACTIVE") {
    throw new Error("Historical academic years are read-only. Switch to the current academic year to make changes.");
  }
}

export function getAcademicYearWriteContext() {
  return getAcademicYearRuntime();
}
