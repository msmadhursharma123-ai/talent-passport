import { useEffect, useState } from "react";

import {
  getCurrentTeacher,
} from "../../services/identityService";

import {
  getTeacherAssignmentsByTeacher,
} from "../../domains/teacherIntelligence/repository/TeacherAssignmentRepository";

import type {
  TeacherAssignment,
} from "../../domains/teacherIntelligence/types/TeacherAssignment";

import {
  getTeacherDailyLogsByAssignment,
} from "../../domains/teacherIntelligence/repository/TeacherDailyLogRepository";

import {
  getLectureFeedbackRadar,
} from "../../domains/teacherIntelligence/repository/TeacherFeedbackAnalyticsRepository";



interface ClassroomDashboardData {

  classroom: string;

  latestTopic: string;

  studentsFilledFeedback: string;

  feedbackRemaining: number;

  completelyUnderstood: string;

  partiallyUnderstood: string;

  didNotUnderstand: string;

  classHealthScore: number;

  classHealthStatus: string;

  studentsRequiringAttention: string;

  mostDifficultConcept: string;

  studentsWhoDidNotUnderstand: string;

  teachingRecommendation: string;

}



export default function TeacherHome() {

  const [dashboardData, setDashboardData] =
    useState<ClassroomDashboardData[]>([]);

const [loading, setLoading] =
useState(true);

const [teacherAssignments,setTeacherAssignments] =
useState<TeacherAssignment[]>([]);

const [loadingClassrooms,setLoadingClassrooms] =
useState<string[]>([]);

  useEffect(() => {

    loadDashboard();

  }, []);



 async function loadDashboard() {

  try {

    const teacher =
      getCurrentTeacher();

    if (!teacher) {
      return;
    }

    const assignments =
      await getTeacherAssignmentsByTeacher(
        teacher.teacherUuid
      );

    /* ==========================================
       DEDUPLICATE CLASS + SECTION ASSIGNMENTS
       ========================================== */

    const uniqueAssignments =
      assignments.filter(
        (assignment, index, array) => {

          const classroom =
            `${assignment.className}-${assignment.sectionName}`;

          return (
            array.findIndex(
              (item) =>
                `${item.className}-${item.sectionName}` ===
                classroom
            ) === index
          );

        }
      );

    const classroomData:
      ClassroomDashboardData[] = [];

    const allAssignedClassrooms =
      uniqueAssignments.map(
        (assignment) =>
          `${assignment.className}-${assignment.sectionName}`
      );

    const usedClassrooms: string[] = [];

    /* ==========================================
       CHECK EACH ASSIGNED CLASSROOM
       ========================================== */

    for (
      const assignment
      of uniqueAssignments
    ) {

      const classroom =
        `${assignment.className}-${assignment.sectionName}`;

      const logs =
        await getTeacherDailyLogsByAssignment(
          assignment.id!
        );

      /* ========================================
         NO DAILY LOG FOR THIS CLASSROOM

         Do NOT create dashboard analytics here.

         If the teacher has never used Daily Log
         anywhere, we will fall back to ALL
         assigned classrooms after this loop.
         ======================================== */

      if (logs.length === 0) {
        continue;
      }

      /* ========================================
         THIS CLASSROOM HAS BEEN USED
         ======================================== */

      usedClassrooms.push(
        classroom
      );

      const latestLecture =
        logs[0];

      const radar =
        await getLectureFeedbackRadar(
          latestLecture.id
        );

      const totalStudents =
        radar.totalStudents || 1;

      const completelyPercentage =
        Math.round(
          (
            radar.completelyUnderstood /
            totalStudents
          ) * 100
        );

      const partiallyPercentage =
        Math.round(
          (
            radar.partiallyUnderstood /
            totalStudents
          ) * 100
        );

      const didNotPercentage =
        Math.round(
          (
            radar.didNotUnderstand /
            totalStudents
          ) * 100
        );

      const difficultConcept =
        radar.commonConcepts?.length > 0
          ? radar.commonConcepts[0].concept
          : "-";

      const studentsAttention =
        radar.studentsRequiringAttention
          ?.length > 0

          ? radar.studentsRequiringAttention
              .map(
                (student: any) =>
                  student.studentName
              )
              .join(", ")

          : "-";

      const studentsNotUnderstood =
        radar.studentsRequiringAttention
          ?.length > 0

          ? radar.studentsRequiringAttention
              .filter(
                (student: any) =>
                  student
                    .understandingLevel
                    ?.toLowerCase()
                    .includes("did")
              )
              .map(
                (student: any) =>
                  student.studentName
              )
              .join(", ")

          : "-";

      classroomData.push({

        classroom,

        latestTopic:
          latestLecture.topicName,

        studentsFilledFeedback:
          `${
            radar.totalStudents -
            radar.pendingStudentsCount
          } / ${radar.totalStudents}`,

        feedbackRemaining:
          radar.pendingStudentsCount,

        completelyUnderstood:
          `${radar.completelyUnderstood} (${completelyPercentage}%)`,

        partiallyUnderstood:
          `${radar.partiallyUnderstood} (${partiallyPercentage}%)`,

        didNotUnderstand:
          `${radar.didNotUnderstand} (${didNotPercentage}%)`,

        classHealthScore:
          radar.classroomHealthScore.score,

        classHealthStatus:
          radar.classroomHealthScore.status,

        studentsRequiringAttention:
          studentsAttention,

        mostDifficultConcept:
          difficultConcept,

        studentsWhoDidNotUnderstand:
          studentsNotUnderstood,

        teachingRecommendation:
          radar.teachingRecommendation,

      });

    }

    /* ==========================================
       FINAL DASHBOARD CLASSROOM RULE

       ZERO used classrooms:
       → New teacher
       → Show every assigned classroom

       ONE OR MORE used classrooms:
       → Active teacher
       → Show only classrooms with Daily Logs
       ========================================== */

    if (usedClassrooms.length === 0) {

      setTeacherAssignments(
        uniqueAssignments
      );

      setLoadingClassrooms(
        allAssignedClassrooms
      );

    } else {

      const usedAssignments =
        uniqueAssignments.filter(
          (assignment) => {

            const classroom =
              `${assignment.className}-${assignment.sectionName}`;

            return usedClassrooms.includes(
              classroom
            );

          }
        );

      setTeacherAssignments(
        usedAssignments
      );

      setLoadingClassrooms(
        usedClassrooms
      );

    }

    setDashboardData(
      classroomData
    );

  }

  catch (error) {

    console.error(
      "TEACHER HOME DASHBOARD ERROR",
      error
    );

  }

  finally {

    setLoading(false);

  }

}

const classroomColumns =
  teacherAssignments.map(
    (assignment) => ({
      classroom:
        `${assignment.className}-${assignment.sectionName}`,
    })
  );

  function getDashboardItem(
  classroom: string
) {

  return dashboardData.find(
    (item) =>
      item.classroom === classroom
  );

}

  return (

<div
style={{

padding:"22px",

background:"#F5F6FA",

minHeight:"100vh",

}}

>


{/* PREMIUM HEADER */}


<div

style={{

background:"#141212",

padding:"18px",

borderRadius:"24px",

marginBottom:"25px",

}}

>

<div
style={{

color:"#F59E0B",

fontSize:"10px",

fontWeight:700,

letterSpacing:"2px",

marginBottom:"10px",

}}

>

CLASSROOM INTELLIGENCE OVERVIEW

</div>


<h1
style={{

margin:0,

color:"white",

fontSize:"26px",

fontWeight:700,

}}

>

Welcome Back, Teacher!

</h1>


<p
style={{

color:"#D8E4FF",

marginTop:"12px",

lineHeight:1.7,

}}

>

Here is your classroom intelligence summary for yesterday's latest lecture.

</p>

</div>



{/* LOADING */}









{/* TABLE CONTAINER */}

{loading && (

<div
style={{
marginBottom:"14px",
fontSize:"16px",
fontWeight:700,
color:"#64748B",
}}
>

Loading All Metrics...

</div>

)}

<>

<div
style={{
background:"white",
padding:"16px",
borderRadius:"24px",
boxShadow:
"0px 8px 24px rgba(0,0,0,0.05)",
overflowX:"auto",
}}
>

<table
style={{
width: "100%",
borderCollapse: "collapse",
minWidth: "950px",
}}
>

<thead>

<tr>

<th
style={{
padding:"10px",
background:"#f7f4f9",
color:"#041B4D",
fontWeight:700,
fontSize:"18px",
textAlign:"center",
border:"1px solid #E5E7EB",
}}
>

METRICS

</th>

{

classroomColumns.map(
  (item:any,index)=>(

<th
key={item.classroom}
style={{

...tableHeaderStyle,

background:

index % 4 === 0
? "#F9F4EA"

: index % 4 === 1
? "#EEF4FB"

: index % 4 === 2
? "#EEF8F4"

: "#F4EFFA",

color:"#041B4D",
fontSize:"20px",
fontWeight:700,

}}
>

{item.classroom}

</th>

))

}

</tr>

</thead>



<tbody>

{renderTableRow(

"Latest Topic",

classroomColumns.map(
(item) =>
  getDashboardItem(
    item.classroom
  )?.latestTopic ?? "-"
)

)}



{renderTableRow(

"Students Filled Feedback",

classroomColumns.map(
(item) =>
  getDashboardItem(
    item.classroom
  )?.studentsFilledFeedback ?? "-"
)

)}



{renderTableRow(

"Feedback Remaining",

classroomColumns.map(
(item) => {

  const data =
    getDashboardItem(
      item.classroom
    );

  return data
    ? String(
        data.feedbackRemaining
      )
    : "-";

})

)}



{renderTableRow(

"Completely Understood",

classroomColumns.map(
(item) =>
  getDashboardItem(
    item.classroom
  )?.completelyUnderstood ?? "-"
)

)}



{renderTableRow(

"Partially Understood",

classroomColumns.map(
(item) =>
  getDashboardItem(
    item.classroom
  )?.partiallyUnderstood ?? "-"
)

)}



{renderTableRow(

"Didn't Understand",

classroomColumns.map(
(item) =>
  getDashboardItem(
    item.classroom
  )?.didNotUnderstand ?? "-"
)

)}



{renderTableRow(

"Class Health Score",

classroomColumns.map(
(item) => {

  const data =
    getDashboardItem(
      item.classroom
    );

  if (
    !data ||
    data.classHealthStatus === "No Data"
  ) {

    return "-";

  }

  return `${data.classHealthScore} /100 — ${data.classHealthStatus}`;

})

)}



{renderTableRow(

"Most Difficult Concept",

classroomColumns.map(
(item) =>
  getDashboardItem(
    item.classroom
  )?.mostDifficultConcept ?? "-"
)

)}



{renderTableRow(

"Students Requiring Attention",

classroomColumns.map(
(item) =>
  getDashboardItem(
    item.classroom
  )?.studentsRequiringAttention ?? "-"
)

)}

</tbody>

</table>

<div
style={{
display:"flex",
gap:"40px",
marginTop:"20px",
fontSize:"14px",
fontWeight:600,
color:"#64748B",
}}
>

<div>
🟢 Good (70-100)
</div>

<div>
🟠 Average (40-69)
</div>

<div>
🔴 Needs Attention (0-39)
</div>

</div>

</div>



{/* TOMORROW'S TEACHING PLAN */}

<div
style={{
marginTop:"28px",
background:"#FFF8EA",
padding:"24px",
borderRadius:"24px",
border:"1px solid #FFE1A3",
}}
>

<h2
style={{
marginTop:0,
color:"#041B4D",
}}
>
Tomorrow's Teaching Plan
</h2>


{dashboardData.map((item)=>(

<div
key={item.classroom}
style={{
marginBottom:"14px",
lineHeight:1.8,
}}
>

<strong>
{item.classroom}
</strong>

{" - "}

{item.teachingRecommendation}

</div>

))}

</div>

</>


</div>

);

}

const tableHeaderStyle = {

padding: "10px",

background: "#041B4D",

color: "white",

fontWeight: 700,

fontSize: "14px",

textAlign: "center" as const,

border: "1px solid #E5E7EB",

};



const metricColumnStyle = {

padding: "10px",

fontWeight: 700,

background: "#FFFFFF",

color: "#0F172A",

fontSize:"14px",

border: "1px solid #E5E7EB",

width: "220px",

textAlign: "left" as const,

};



const tableCellStyle = {

padding: "10px",

border: "1px solid #E5E7EB",

textAlign: "center" as const,

color: "#334155",

fontSize: "14px",

verticalAlign: "top" as const,

lineHeight:1.4,

};



function renderTableRow(

metricName:string,
values:string[]

) {

return (

<tr>

<td style={metricColumnStyle}>

{

metricName === "Latest Topic"
? "📖 Latest Topic"

:

metricName === "Students Filled Feedback"
? "👥 Students Filled Feedback"

:

metricName === "Feedback Remaining"
? "⏳ Feedback Remaining"

:

metricName === "Completely Understood"
? "😊 Completely Understood"

:

metricName === "Partially Understood"
? "😐 Partially Understood"

:

metricName === "Didn't Understand"
? "☹️ Didn't Understand"

:

metricName === "Class Health Score"
? "🛡️ Class Health Score"

:

metricName === "Most Difficult Concept"
? "⚠️ Most Difficult Concept"

:

metricName === "Students Requiring Attention"
? "👤 Students Requiring Attention"

:

metricName

}

</td>

{values.map((value, index) => (

<td
key={index}
style={{

...tableCellStyle,

color:

metricName === "Completely Understood"
? "#16A34A"

:

metricName === "Partially Understood"
? "#F59E0B"

:

metricName === "Didn't Understand"
? "#EF4444"

:

metricName === "Most Difficult Concept"
? "#1E3A8A"

:

metricName === "Students Requiring Attention"
? "#DC2626"

:

"#334155",

fontWeight:

metricName === "Completely Understood" ||
metricName === "Partially Understood" ||
metricName === "Didn't Understand"

? 700

: 500,

}}
>

{value || "-"}

</td>

))}

</tr>

);}

function renderHealthScoreRow(

dashboardData:
ClassroomDashboardData[]

) {

return (

<tr>

<td style={metricColumnStyle}>

🛡️ Class Health Score

</td>


{dashboardData.map((item,index)=>(

<td
key={index}
style={{

...tableCellStyle,

}}

>

<div
style={{

fontSize:"22px",

fontWeight:700,

color:"#041B4D",

}}
>

{item.classHealthScore}

<span
style={{

fontSize:"14px",

fontWeight:500,

}}

>

 /100

</span>

</div>


<div
style={{

marginTop:"10px",

display:"inline-block",

padding:"5px 10px",

borderRadius:"999px",

fontWeight:700,

fontSize:"11px",

background:

item.classHealthStatus
.toLowerCase()
.includes("good")

? "#DCFCE7"

:

item.classHealthStatus
.toLowerCase()
.includes("average")

? "#FEF3C7"

:

"#FEE2E2",


color:

item.classHealthStatus
.toLowerCase()
.includes("good")

? "#16A34A"

:

item.classHealthStatus
.toLowerCase()
.includes("average")

? "#D97706"

:

"#DC2626",

}}

>

{item.classHealthStatus}

</div>

</td>

))}

</tr>

);

}