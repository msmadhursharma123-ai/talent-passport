export interface CreateTeacherProfileRequest {
    fullName: string;
    email: string;
    phone: string;
    schoolName: string;
    boardName: string;
    department: string;
    designation: string;
}

export interface TeacherProfile {
    teacherUuid: string;
    teacherId: string;
    fullName: string;
    email: string;
    phone: string;
    schoolUuid?: string;
    schoolName?: string;
    boardUuid?: string;
    department?: string;
    designation?: string;
    profileCompleted: boolean;
    isActive: boolean;
}