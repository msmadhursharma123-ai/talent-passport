export type PortalManualRole = "student" | "teacher" | "school" | "partner";

export interface PortalManualSection {
  id: string;
  title: string;
  summary: string;
  steps?: string[];
  bullets?: string[];
  note?: string;
}

export interface PortalManualContent {
  role: PortalManualRole;
  label: string;
  intro: string;
  sections: PortalManualSection[];
}
