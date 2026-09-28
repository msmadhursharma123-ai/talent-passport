import type { StudyMaterialType } from "./studyMaterialConstants";

export interface StudyMaterialFile {
  id: string;
  chapterId: string;
  materialType: StudyMaterialType;
  fileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyMaterialChapter {
  id: string;
  className: string;
  subjectName: string;
  chapterName: string;
  createdAt: string;
  updatedAt: string;
  files: StudyMaterialFile[];
}

export interface StudyMaterialTypeGroup {
  type: StudyMaterialType;
  files: StudyMaterialFile[];
}
