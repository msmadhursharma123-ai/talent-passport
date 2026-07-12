export type TeacherAssignmentStatus =
    | "active"
    | "inactive"
    | "pending";

export interface TeacherAssignment {

    id: string;

    teacherUuid: string;

    organizationUuid: string | null;

    schoolUuid: string | null;

    academicYearId: string | null;

    curriculumId: string | null;

    classId: string | null;

    sectionId: string | null;

    subjectId: string | null;

    assignmentStatus: TeacherAssignmentStatus;

    createdAt: string;

    updatedAt: string | null;
}