export interface TeacherAssignment {

id: string;

  teacherUuid: string;

  schoolUuid: string;

  className: string;

  sectionName: string;

  subjectName: string;

  academicYear?: string;

  academicYearId?: string | null;

  isActive?: boolean;

  createdAt?: string;

  updatedAt?: string;

  endedAt?: string | null;

  endReason?: string | null;

}