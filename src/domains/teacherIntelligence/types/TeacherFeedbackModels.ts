export interface CommonFeedbackOption {
  option: string;
  count: number;
}

export interface CommonDoubt {
  doubtText: string;
  count: number;
}

export interface StudentAttentionRecord {
  studentName: string;
  topicName: string;
  feedbackOptions: string[];
  doubtText: string | null;
}

export interface ClassroomHealthScore {
  score: number;
  status: string;
}

export interface ClassroomFeedbackRadar {

classroomHealthScore:{

score:number;

status:string;

};


completelyUnderstood:number;

partiallyUnderstood:number;

didNotUnderstand:number;


commonConcepts:{

concept:string;

count:number;

}[];


studentsRequiringAttention:{

studentName:string;

topicName:string;

understandingLevel:string;

concepts:string[];

}[];


teachingRecommendation:string;

}

export interface StudentFeedbackRow {

id:string;

student_uuid:string;

teacher_uuid:string;

school_uuid:string;

class_name:string;

section_name:string;

subject_name:string;

topic_name:string;


understanding_level:string;

concepts_not_understood:string[];

has_doubt:boolean;

additional_note:string | null;

}