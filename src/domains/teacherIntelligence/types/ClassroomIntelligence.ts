export interface ClassroomDoubtInput{

topicName:string;

doubts:string[];

}


export interface ConceptualGap{

title:string;

summary:string;

frequency:number;

}


export interface ClassroomIntelligence{

commonConceptualGaps:
ConceptualGap[];

}