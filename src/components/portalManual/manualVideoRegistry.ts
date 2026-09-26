import type { ManualVideoConfig, ManualVideoRole } from "./manualVideoTypes";

/**
 * Video-only configuration for the Portal Manual.
 *
 * This registry deliberately lives outside the existing manual content files.
 * Adding or replacing a recording therefore does not modify manual text,
 * navigation, search, PDF generation, or any portal business logic.
 *
 * Upload matching MP4 files to the Supabase Storage bucket configured by
 * VITE_PORTAL_MANUAL_VIDEO_BUCKET (default: portal-manual-videos).
 */
const sectionIds: Record<ManualVideoRole, string[]> = {
  student: [
    "growth-plan",
    "daily-feedback",
    "doubt-feedback",
    "feedback-statement",
    "credits",
    "progress",
    "exam-preparation",
    "calendar",
    "worksheets",
    "study-buddy",
    "read-data",
  ],
  teacher: [
    "dashboard",
    "daily-log",
    "daily-log-sections",
    "teaching-journal",
    "exam-preparation",
    "my-classroom",
    "topics-popup",
    "ptm",
    "lesson-planner",
    "worksheet-planner",
    "unit-test-planner",
    "exam-paper-planner",
    "star-performers",
    "data-reading",
  ],
  school: [
    "overview",
    "overview-diagnostic",
    "teachers",
    "classrooms",
    "academic",
    "academic-year",
    "lesson-plans",
    "unit-tests",
    "exam-papers",
    "worksheets",
    "star-performers",
    "morning-brief",
    "weekly-insights",
    "analytics-loading",
    "statement",
    "read-data",
  ],
};

const roleLabels: Record<ManualVideoRole, string> = {
  student: "Student",
  teacher: "Teacher",
  school: "School Admin",
};

const titleFor = (id: string) =>
  id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const PORTAL_MANUAL_VIDEO_BUCKET =
  ((import.meta as any).env?.VITE_PORTAL_MANUAL_VIDEO_BUCKET as string) ||
  "portal-manual-videos";

export const PORTAL_MANUAL_VIDEO_REGISTRY: Record<ManualVideoRole, Record<string, ManualVideoConfig>> =
  Object.fromEntries(
    (Object.entries(sectionIds) as [ManualVideoRole, string[]][]).map(([role, ids]) => [
      role,
      Object.fromEntries(
        ids.map((sectionId) => [
          sectionId,
          {
            role,
            sectionId,
            title: `${roleLabels[role]} Manual — ${titleFor(sectionId)}`,
            description: "Short screen recording showing this page and the main actions.",
            storagePath: `${role}/${sectionId}.mp4`,
          } satisfies ManualVideoConfig,
        ]),
      ),
    ]),
  ) as Record<ManualVideoRole, Record<string, ManualVideoConfig>>;

export function getPortalManualVideo(role: ManualVideoRole, sectionId: string) {
  return PORTAL_MANUAL_VIDEO_REGISTRY[role]?.[sectionId];
}

export function getPortalManualVideoUrl(storagePath: string) {
  const baseUrl = String(((import.meta as any).env?.VITE_SUPABASE_URL as string) || "").replace(/\/$/, "");
  if (!baseUrl) return "";

  const encodedPath = storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${baseUrl}/storage/v1/object/public/${encodeURIComponent(PORTAL_MANUAL_VIDEO_BUCKET)}/${encodedPath}`;
}
