import { getSupabaseClient } from "../../../supabaseClient";

import {

TopicLearningHistory,

} from "../types/TeacherAcademicHistoryModels";


export async function getTeacherLectureHistory(){

}


export async function getStudentLearningHistory(){

}


export async function getTopicLearningHistory(

topicName:string

):Promise<TopicLearningHistory>{

const supabase = getSupabaseClient();


const { data : teacherLogs } =

await (supabase as any)

.from("teacher_daily_logs")

.select(

"id"

)

.eq(

"topic_name",

topicName

);

const timesTaught =

teacherLogs?.length ?? 0;

const dailyLogUuids =

teacherLogs?.map(

(log:any)=>log.id

) ?? [];

const { data : studentFeedback } =

await (supabase as any)

.from(

"student_daily_feedback"

)

.select(

"understanding_level"

)

.in(

"daily_log_uuid",

dailyLogUuids

);

const totalStudentsFacedDifficulty =

studentFeedback?.filter(

(item:any)=>

item.understanding_level !==

"I completely understood."

).length ?? 0;

const totalResponses =

studentFeedback?.length ?? 0;



const difficultyPercentage =

totalResponses === 0

? 0

:

Math.round(

(

totalStudentsFacedDifficulty

/

totalResponses

)

*100

);

const mostDifficultConcepts:string[] = [];

return{

topicName,

timesTaught,

totalStudentsFacedDifficulty:0,

difficultyPercentage:0,

mostDifficultConcepts:[],

};

}


export async function getClassroomLearningHistory(){

}


export async function getSubjectLearningHistory(){

}