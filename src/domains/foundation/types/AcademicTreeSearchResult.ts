import type { AcademicTreeNode } from "./AcademicTreeNode";

export interface AcademicTreeSearchResult {
  node: AcademicTreeNode;

  path: string;

  level:
    | "board"
    | "academicYear"
    | "organization"
    | "curriculum"
    | "class"
    | "section"
    | "subject"
    | "chapter"
    | "topic"
    | "subTopic";
}