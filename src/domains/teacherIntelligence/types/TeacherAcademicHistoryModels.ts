export interface TeacherLectureHistory {

lectureCount:number;

topicNames:string[];

conceptNames:string[];

}


export interface StudentLearningHistory {

studentUuid:string;

studentName:string;

difficultConcepts:string[];

}


export interface TopicLearningHistory {

topicName:string;

timesTaught:number;

totalStudentsFacedDifficulty:number;

difficultyPercentage:number;

mostDifficultConcepts:string[];

}


export interface ClassroomLearningHistory {

className:string;

sectionName:string;

mostDifficultTopics:string[];

}


export interface SubjectLearningHistory {

subjectName:string;

mostDifficultConcepts:string[];

}