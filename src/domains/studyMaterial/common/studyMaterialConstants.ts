import { CLASSES as TEACHER_ONBOARDING_CLASSES, SUBJECTS as TEACHER_ONBOARDING_SUBJECTS } from "../../teacherIntelligence/constants/TeacherMasterData";

export const STUDY_MATERIAL_CLASSES = TEACHER_ONBOARDING_CLASSES;
export const STUDY_MATERIAL_SUBJECTS = TEACHER_ONBOARDING_SUBJECTS;

export const STUDY_MATERIAL_TYPES = [
  "summary",
  "notes",
  "qa",
  "sample_papers",
] as const;

export type StudyMaterialType = (typeof STUDY_MATERIAL_TYPES)[number];

export const STUDY_MATERIAL_TYPE_LABELS: Record<StudyMaterialType, string> = {
  summary: "Chapter Summary",
  notes: "Notes",
  qa: "Chapter Q&A",
  sample_papers: "Sample Papers",
};

export const STUDY_MATERIAL_TYPE_SHORT_LABELS: Record<StudyMaterialType, string> = {
  summary: "Summary",
  notes: "Notes",
  qa: "Q&A",
  sample_papers: "Sample Papers",
};

export const STUDY_MATERIAL_ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;
export const STUDY_MATERIAL_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export function isAllowedStudyMaterialFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return STUDY_MATERIAL_ALLOWED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export function sanitizeStudyMaterialFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^\.+/, "")
    .slice(-140) || "document";
}
