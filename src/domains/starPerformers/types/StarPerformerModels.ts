export type StarPerformerPeriodType = "week" | "month";

export interface StarPerformerPeriod {
  periodType: StarPerformerPeriodType;
  periodKey: string;
  periodLabel: string;
  startDate: string;
  endDate: string;
  isComplete: boolean;
}

export interface StarPerformerTeacherMetric {
  teacherUuid: string;
  teacherName: string;
  classrooms: string[];
  classroomCount: number;

  understandingPercentage: number;
  doubtClosurePercentage: number;
  classHealthPercentage: number;
  studentFeedbackPercentage: number;

  combinedScore: number;

  classMetrics: Array<{
    classroom: string;
    understandingPercentage: number;
    doubtClosurePercentage: number;
    classHealthPercentage: number;
    studentFeedbackPercentage: number;
    combinedScore: number;
    topicsTaught: number;
    responses: number;
    doubtsAsked: number;
    doubtsResolved: number;
  }>;
}

export interface StarPerformerRow {
  id?: string;
  schoolUuid: string;
  periodType: StarPerformerPeriodType;
  periodKey: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  teacherUuid: string | null;
  teacherName: string | null;
  classrooms: string[];
  understandingPercentage: number | null;
  doubtClosurePercentage: number | null;
  classHealthPercentage: number | null;
  studentFeedbackPercentage: number | null;
  combinedScore: number | null;
  isComplete: boolean;
  calculatedAt?: string;
}
