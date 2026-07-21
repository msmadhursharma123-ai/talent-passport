export interface TopicDifficultyTrend {

topicName:string;

difficultyPercentage:number;

trendStatus:string;

}


export interface StudentDifficultyTrend {

studentUuid:string;

studentName:string;

difficultyPercentage:number;

trendStatus:string;

}


export interface ClassroomDifficultyTrend {

className:string;

sectionName:string;

difficultyPercentage:number;

trendStatus:string;

}


export interface SubjectDifficultyTrend {

subjectName:string;

difficultyPercentage:number;

trendStatus:string;

}


export interface TeacherImprovementTrend {

teacherName:string;

improvementPercentage:number;

trendStatus:string;

}


export interface MostImprovedTopic {

topicName:string;

previousDifficultyPercentage:number;

currentDifficultyPercentage:number;

improvementPercentage:number;

}