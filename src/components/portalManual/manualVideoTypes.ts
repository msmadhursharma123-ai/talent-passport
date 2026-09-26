export type ManualVideoRole = "student" | "teacher" | "school";

export interface ManualVideoConfig {
  role: ManualVideoRole;
  sectionId: string;
  title: string;
  description: string;
  storagePath: string;
}
