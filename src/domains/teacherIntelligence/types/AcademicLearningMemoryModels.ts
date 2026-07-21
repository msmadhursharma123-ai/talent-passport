export interface DifficultConceptHistory{

concept:string;

timesRepeated:number;

}


export interface StudentRecurringWeakness{

studentUuid:string;

studentName:string;

difficultConcepts:DifficultConceptHistory[];

}


export interface TopicDifficultyHistory{

topicName:string;

difficultyPercentage:number;

}


export interface ClassroomRecurringWeakness{

className:string;

sectionName:string;

topics:TopicDifficultyHistory[];

}