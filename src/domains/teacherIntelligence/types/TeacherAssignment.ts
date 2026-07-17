export interface TeacherAssignment {

  id?: string;

  teacherUuid: string;

  schoolUuid: string;

  className: string;

  sectionName: string;

  subjectName: string;

  academicYear?: string;

  isActive?: boolean;

  createdAt?: string;

  updatedAt?: string;

}