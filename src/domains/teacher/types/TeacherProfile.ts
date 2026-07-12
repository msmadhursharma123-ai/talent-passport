export interface TeacherProfile {

  id: string;

  teacherUuid: string;

  qualification: string | null;

  experienceYears: number | null;

  bio: string | null;

  avatarUrl: string | null;

  languages: string[];

  preferences: Record<string, unknown>;

  metadata: Record<string, unknown>;

  createdAt: string;

  updatedAt: string | null;
}