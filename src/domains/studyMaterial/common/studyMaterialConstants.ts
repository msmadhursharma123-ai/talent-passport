import { CLASSES as TEACHER_ONBOARDING_CLASSES, SUBJECTS as TEACHER_ONBOARDING_SUBJECTS } from "../../teacherIntelligence/constants/TeacherMasterData";

export const STUDY_MATERIAL_CLASSES = TEACHER_ONBOARDING_CLASSES;
export const STUDY_MATERIAL_SUBJECTS = TEACHER_ONBOARDING_SUBJECTS;

/**
 * CBSE-aligned Study Material subject availability by class.
 * Stored subject names intentionally match the existing TeacherMasterData values
 * so existing database records remain compatible.
 */
export const STUDY_MATERIAL_SUBJECTS_BY_CLASS: Record<string, readonly string[]> = {
  "4": ["English", "Mathematics", "Environmental Studies", "Hindi"],
  "5": ["English", "Mathematics", "Environmental Studies", "Hindi"],
  "6": ["English", "Mathematics", "Science", "Social Science", "Hindi"],
  "7": ["English", "Mathematics", "Science", "Social Science", "Hindi"],
  "8": ["English", "Mathematics", "Science", "Social Science", "Hindi"],
  "9": ["English", "Mathematics", "Science", "Social Science", "Hindi"],
  "10": ["English", "Mathematics", "Science", "Social Science", "Hindi"],
  "11": [
    "English",
    "Hindi",
    "Mathematics",
    "Social Science",
    "Economics",
    "Physical Education",
    "Biology",
    "Chemistry",
    "Physics",
    "Information Practices",
    "Information Technology",
    "Accountancy",
    "Applied Mathematics",
    "Business Studies",
  ],
  "12": [
    "English",
    "Hindi",
    "Mathematics",
    "Social Science",
    "Economics",
    "Physical Education",
    "Biology",
    "Chemistry",
    "Physics",
    "Information Practices",
    "Information Technology",
    "Accountancy",
    "Applied Mathematics",
    "Business Studies",
  ],
};

export function getStudyMaterialSubjectsForClass(className: string): readonly string[] {
  return STUDY_MATERIAL_SUBJECTS_BY_CLASS[className] ?? [];
}

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
