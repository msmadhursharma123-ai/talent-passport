import type { AcademicTreeNode } from "./AcademicTreeNode";

export interface AcademicTree {
  boards: AcademicTreeNode[];

  totalBoards: number;

  totalAcademicYears: number;

  totalOrganizations: number;

  totalCurriculums: number;

  totalClasses: number;

  totalSections: number;

  totalSubjects: number;

  totalChapters: number;

  totalTopics: number;

  totalSubTopics: number;

  generatedAt: string;
}