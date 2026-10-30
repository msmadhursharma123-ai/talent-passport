export interface LearningLectureMetrics {
  totalStudents: number;
  absentStudents: number;
  eligibleStudents: number;
  responseStudents: number;
  completeStudents: number;
  partialStudents: number;
  didntUnderstandStudents: number;
  responseRate: number;
  understandingRate: number;
  partialRate: number;
  didntUnderstandRate: number;
  healthPercentage: number;
}

export interface LearningAggregateMetrics {
  totalStudentObservations: number;
  absentStudentObservations: number;
  eligibleStudentObservations: number;
  responseStudentObservations: number;
  completeStudentObservations: number;
  partialStudentObservations: number;
  didntUnderstandStudentObservations: number;
  lectureCount: number;
  responseRate: number;
  understandingRate: number;
  partialRate: number;
  didntUnderstandRate: number;
  classHealthPercentage: number;
  healthPercentageSum: number;
}


export interface LearningLectureMetricsInput {
  studentUuids: Iterable<unknown>;
  feedback: any[];
  getUnderstandingLevel?: (feedback: any) => unknown;
}
