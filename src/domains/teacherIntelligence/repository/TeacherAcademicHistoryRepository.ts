import { getSupabaseClient } from "../../../supabaseClient";

import {

TopicLearningHistory,

} from "../types/TeacherAcademicHistoryModels";

import { getCurrentTeacher } from "../../../services/identityService";


export async function getTeacherLectureHistory(){

}


export async function getStudentLearningHistory(){

}


export async function getTopicLearningHistory(

topicName:string,

subjectName?:string

):Promise<TopicLearningHistory>{

const supabase = getSupabaseClient();

let assignmentIds:string[] = [];

if (subjectName) {
  const teacher = getCurrentTeacher();
  if (!teacher?.teacherUuid) {
    return {
      topicName,
      timesTaught: 0,
      totalStudentsFacedDifficulty: 0,
      difficultyPercentage: 0,
      mostDifficultConcepts: [],
    };
  }

  const { data: subjectAssignments } = await (supabase as any)
    .from("teacher_classroom_assignments")
    .select("id")
    .eq("teacher_uuid", teacher.teacherUuid)
    .eq("subject_name", subjectName);

  assignmentIds = (subjectAssignments ?? [])
    .map((assignment:any) => assignment.id)
    .filter(Boolean);

  if (assignmentIds.length === 0) {
    return {
      topicName,
      timesTaught: 0,
      totalStudentsFacedDifficulty: 0,
      difficultyPercentage: 0,
      mostDifficultConcepts: [],
    };
  }
}

let teacherLogsQuery = (supabase as any)
  .from("teacher_daily_logs")
  .select("id")
  .eq("topic_name", topicName);

if (subjectName) {
  teacherLogsQuery = teacherLogsQuery.in(
    "teacher_assignment_uuid",
    assignmentIds
  );
}

const { data : teacherLogs } = await teacherLogsQuery;

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