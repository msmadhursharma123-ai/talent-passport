export interface TeacherDailyLog {

  id: string;

  teacherAssignmentUuid: string;

  className: string;

  sectionName: string;

  subjectName: string;

  topicName: string;

  conceptsCovered: string[];

  pageFrom: number | null;

  pageTo: number | null;

  homeworkGiven: boolean;

  activityConducted: boolean;

  teacherNotes: string;

  logDate: string;

  createdAt: string;

  updatedAt: string;

  chapterName?: string | null;
  crossQuestionText?: string | null;
  crossQuestionImagePath?: string | null;
  crossQuestionImageUrl?: string | null;
  crossQuestionOptions?: string[] | null;
  crossQuestionCorrectIndex?: number | null;

}