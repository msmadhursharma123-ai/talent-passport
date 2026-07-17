export interface AcademicTreeNode {
  id: string;

  type:
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

  code?: string;

  name: string;

  description?: string;

  parentId?: string | null;

  isActive?: boolean;

  displayOrder?: number;

  children?: AcademicTreeNode[];
}