export interface TeacherDailyLog {

id:string;

teacherAssignmentUuid:string;

className:string;
sectionName:string;
subjectName:string;

topicName:string;

pageFrom:number | null;
pageTo:number | null;

homeworkGiven:boolean;
activityConducted:boolean;

teacherNotes:string;

logDate:string;

createdAt:string;
updatedAt:string;

}