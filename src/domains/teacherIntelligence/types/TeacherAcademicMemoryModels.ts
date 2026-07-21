export interface RecurringConcept {

    concept:string;

    difficultyCount:number;

}


export interface RecurringTopic {

    topic:string;

    difficultyCount:number;

}


export interface RecurringStudent {

    studentName:string;

    difficultLectureCount:number;

}


export interface TeacherAcademicMemory {

    difficultConcepts:RecurringConcept[];

    difficultTopics:RecurringTopic[];

    difficultStudents:RecurringStudent[];

}