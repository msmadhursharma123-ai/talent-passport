import { getSupabaseClient } from "../../../supabaseClient";

import {
getTeacherAssignmentsByTeacher,
}
from "./TeacherAssignmentRepository";


import {
getTeacherDailyLogsByAssignment,
}
from "./TeacherDailyLogRepository";


import {
getStudentsAtRisk,
}
from "./TeacherFeedbackAnalyticsRepository";


import {
getCurrentTeacher,
}
from "../../../services/identityService";

export async function getMonthlyComprehensionData(

dailyLogIds:string[]

){

const supabase = getSupabaseClient();


if(dailyLogIds.length === 0){

return [];

}


const { data } =

await (supabase as any)

.from("student_daily_feedback")

.select("*")

.in(

"daily_log_uuid",

dailyLogIds

);


return data ?? [];

}

export async function getOverallClassroomComparison(

selectedMonth:string

){

const teacher =
getCurrentTeacher();

if(!teacher){

return [];

}

const assignments =

await getTeacherAssignmentsByTeacher(
teacher.teacherUuid
);


// FETCH ALL CLASSROOMS TOGETHER

const comparisonData =

await Promise.all(

assignments.map(async(assignment)=>{

const dailyLogs =

await getTeacherDailyLogsByAssignment(
assignment.id
);


const monthlyLogs =

dailyLogs.filter((log)=>{

const month =

new Date(log.logDate)

.toLocaleString(

"default",

{month:"long"}

);


return month === selectedMonth;

});


const dailyLogIds =

monthlyLogs.map(
(log)=>log.id
);


const feedback =

await getMonthlyComprehensionData(

dailyLogIds

);


let totalHealthScore = 0;

let lectureCount = 0;

let totalDoubtPercentage = 0;


for(const log of monthlyLogs){


const logFeedback =

feedback.filter(

(item:any)=>

item.daily_log_uuid === log.id

);


if(logFeedback.length === 0){

continue;

}


const completely =

logFeedback.filter(

(item:any)=>

item.understanding_level ===
"I completely understood."

).length;


const partial =

logFeedback.filter(

(item:any)=>

item.understanding_level ===
"I partially understood."

).length;


const difficult =

logFeedback.filter(

(item:any)=>

item.understanding_level ===
"I didn't understand."

).length;



const healthScore =

Math.round(

(

(

completely +

(partial * 0.5)

)

/

logFeedback.length

)

*100

);


totalHealthScore +=
healthScore;



const doubtPercentage =

Math.round(

(

(partial + difficult)

/

logFeedback.length

)

*100

);


totalDoubtPercentage +=
doubtPercentage;


lectureCount++;

}



const riskStudents =

await getStudentsAtRisk(

assignment.className,

assignment.sectionName

);


const totalRiskStudents =

riskStudents.veryCritical.length +

riskStudents.critical.length +

riskStudents.moderate.length;



const averageHealthScore =

lectureCount === 0

? 0

:

Math.round(

totalHealthScore / lectureCount

);


const averageDoubtPercentage =

lectureCount === 0

? 0

:

Math.round(

totalDoubtPercentage / lectureCount

);


const averageFeedbackPercentage =

monthlyLogs.length === 0

? 0

:

100;



return{

classroom:

`Class ${assignment.className}-${assignment.sectionName}`,

averageHealthScore,

averageDoubtPercentage,

averageFeedbackPercentage,

studentsAtRisk:

totalRiskStudents,

};


})

);


return comparisonData;


}