export type SchoolPostType = "announcement" | "poll";
export type SchoolPostAudience = "student" | "teacher";
export type SchoolPollType = "scale_1_10" | "yes_no" | "slider_1_10";

export interface SchoolPostTarget {
  id?: string;
  postId?: string;
  audience: SchoolPostAudience;
  className?: string | null;
  sectionName?: string | null;
}

export interface SchoolPost {
  id: string;
  schoolUuid: string;
  createdBy: string | null;
  createdByName?: string | null;
  postType: SchoolPostType;
  title: string;
  body: string;
  templateKey: string;
  startsAt: string;
  endsAt: string;
  rulesText?: string | null;
  pollType?: SchoolPollType | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  targets: SchoolPostTarget[];
  responseCount?: number;
  responseAverage?: number | null;
}

export interface SchoolPostAudienceOption {
  className: string;
  sectionName: string;
  label: string;
}

export interface SchoolPostClassResult {
  className: string;
  sectionName: string;
  label: string;
  responseCount: number;
  average: number | null;
  yesCount?: number;
  noCount?: number;
}
