import type { SchoolAcademicYear } from "../models/AcademicYearModels";
let snapshot:{schoolUuid:string;academicYear:SchoolAcademicYear}|null=null;
export function setAcademicYearRuntime(schoolUuid:string,academicYear:SchoolAcademicYear|null){snapshot=academicYear?{schoolUuid,academicYear}:null;}
export function clearAcademicYearRuntime(){snapshot=null;}
export function getAcademicYearRuntime(){return snapshot;}
export function getAcademicYearCode(){return snapshot?.academicYear.academicYearCode??null;}
export function getAcademicYearId(){return snapshot?.academicYear.id??null;}
export function isHistoricalAcademicYearRuntime(){return Boolean(snapshot&&!snapshot.academicYear.isCurrent);}
