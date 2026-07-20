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

import type {
TeacherDailyLog,
} from "../../domains/teacherIntelligence/types/TeacherDailyLog";



import {

getClassroomFeedbackRadar,

} from "../../domains/teacherIntelligence/repository/TeacherFeedbackAnalyticsRepository";

export default function TeacherHome() {

const [assignments,setAssignments] =
useState<TeacherAssignment[]>([]);

const [dailyLogs,setDailyLogs] =
useState<TeacherDailyLog[]>([]);

const [selectedAssignmentId,
setSelectedAssignmentId] =
useState("");

const [selectedAssignment,
setSelectedAssignment] =
useState<TeacherAssignment | null>(null);

const [classroomRadar, setClassroomRadar] =
useState<any>(null);

useEffect(()=>{

loadAssignments();

},[]);


async function loadAssignments(){

const teacher =
getCurrentTeacher();

if(!teacher){
return;
}


const data =

await getTeacherAssignmentsByTeacher(
teacher.teacherUuid
);


setAssignments(data);

}

  return (
    <div
      style={{
        padding: 32,
        background: "#F6F6F3",
        minHeight: "100%",
      }}
    >
      {/* DARK HEADER */}

      <div
        style={{
          background: "#04122F",
          borderRadius: 28,
          padding: 30,
          marginBottom: 28,
          color: "white",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#F59E0B",
            fontSize: 13,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          CLASSROOM COMPREHENSION LIMIT ALERTS
        </p>

        <h1
          style={{
            marginTop: 12,
            marginBottom: 12,
            fontSize: 34,
          }}
        >
          CLASSROOM INTELLIGENCE DASHBOARD
        </h1>

        <p
          style={{
            margin: 0,
            color: "#D1D5DB",
            lineHeight: 1.8,
          }}
        >
          Review today's classroom feedback and
          identify concepts that require additional
          teaching support.
        </p>
      </div>

      {/* CLASS SELECTOR */}

      <div
        style={{
          marginBottom: 30,
          display: "flex",
          gap: 18,
        }}
      >
       <select

style={dropdownStyle}

value={selectedAssignmentId}

onChange={async (e)=>{

const value =
e.target.value;

setSelectedAssignmentId(
value
);


const assignment =

assignments.find(
item=>item.id === value
);


setSelectedAssignment(
assignment ?? null
);


if(

assignment &&
assignment.id

){

const logs =

await getTeacherDailyLogsByAssignment(
assignment.id
);

setDailyLogs(logs);

const radar =

await getClassroomFeedbackRadar(

assignment.className,
assignment.sectionName

);

console.log("CLASSROOM RADAR");

console.log(radar);

setClassroomRadar(radar);

}else{

setDailyLogs([]);

}

}}

>

<option value="">

Select Classroom

</option>


{

assignments.map((item)=>(

<option
key={item.id}
value={item.id}
>

Class {item.className}

{" - "}

Section {item.sectionName}

</option>

))

}

</select>

      </div>


{/* CLASSROOM HEALTH SCORE */}

{classroomRadar && (

<>

<div
style={{
...cardStyle,
background:"#FFF7ED",
border:"2px solid #FDBA74",
marginTop:20,
}}
>

<p
style={{
margin:0,
color:"#EA580C",
fontSize:13,
fontWeight:700,
letterSpacing:2,
}}
>

CLASSROOM HEALTH SCORE

</p>


<h1
style={{
marginTop:15,
marginBottom:5,
fontSize:64,
color:"#04122F",
}}
>

{classroomRadar.classroomHealthScore.score}/100

</h1>


<h2
style={{
marginTop:0,
color:"#EA580C",
}}
>

{classroomRadar.classroomHealthScore.status}

</h2>


<p
style={{
color:"#475569",
lineHeight:1.8,
}}
>

Today's classroom comprehension levels
suggest whether revision is required
before beginning tomorrow's lecture.

</p>

</div>

<div
style={{
...cardStyle,
marginTop:25,
}}
>

<h2>

Understanding Breakdown

</h2>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:20,
marginTop:20,
}}
>

<DashboardKPI
title="Completely Understood"
value={String(
classroomRadar.completelyUnderstood
)}
/>

<DashboardKPI
title="Partially Understood"
value={String(
classroomRadar.partiallyUnderstood
)}
/>

<DashboardKPI
title="Didn't Understand"
value={String(
classroomRadar.didNotUnderstand
)}
/>

</div>

</div>

<div
style={{
...cardStyle,
marginTop:25,
}}
>

<h2>

Most Difficult Concepts Today

</h2>


{

classroomRadar.commonConcepts.map(
(item:any,index:number)=>(

<div
key={index}
style={{
marginTop:18,
}}
>

<h3>

{item.concept}

</h3>

<p>

Mentioned by {item.count}
student(s)

</p>

</div>

))

}

</div>

{/* STUDENTS REQUIRING ATTENTION */}

<div
style={{
marginTop:30,
}}
>

<h2
style={{
fontSize:28,
marginBottom:25,
}}
>

Students Requiring Additional Attention

</h2>

{

classroomRadar?.studentsRequiringAttention?.length === 0 ? (

<div
style={cardStyle}
>

<p>

No students currently require additional
teaching support.

</p>

</div>

)

:

(

classroomRadar.studentsRequiringAttention.map(
(student:any,index:number)=>(

<div
key={index}
style={studentAttentionCard}
>

<h2
style={{
marginTop:0,
color:"#04122F",
}}
>

{student.studentName}

</h2>


<h3>

Topic Requiring Revision

</h3>

<p>

{student.topicName}

</p>


<h3>

Understanding Level

</h3>

<p>

{student.understandingLevel}

</p>


<h3>

Difficult Concepts

</h3>


<div
style={{
display:"flex",
gap:12,
flexWrap:"wrap",
marginBottom:25,
}}
>

{

student.concepts?.map(
(concept:string)=>(

<div
key={concept}
style={feedbackChip}
>

{concept}

</div>

))

}

</div>


</div>

))

)

}

</div>

{/* TOMORROW'S TEACHING PLAN */}

<div
style={{
...cardStyle,
marginTop:25,
background:"#FFF7ED",
border:"1px solid #FDBA74",
}}
>

<h2>

Tomorrow's Teaching Plan

</h2>

<p
style={{
lineHeight:1.8,
}}
>

{classroomRadar.teachingRecommendation}

</p>

</div>


{/* CLASSROOM INFORMATION */}

<div
style={{
...cardStyle,
marginTop:30,
}}
>

<h2>

Classroom Information

</h2>

<p>

Class : {selectedAssignment?.className ?? "--"}

</p>

<p>

Section : {selectedAssignment?.sectionName ?? "--"}

</p>

<p>

Last Daily Log Submitted :

{

dailyLogs.length > 0

? dailyLogs[0].logDate

: "No Lecture Published"

}

</p>

</div>

</>

)}

</div>

);

}


function DashboardKPI(props:any){

return(

<div
style={{
background:"white",
padding:25,
borderRadius:20,
boxShadow:
"0px 10px 25px rgba(0,0,0,0.05)",
}}
>

<h1
style={{
margin:0,
color:"#04122F",
}}
>
{props.value}
</h1>

<p>
{props.title}
</p>

</div>

)

}



const cardStyle={

background:"white",
padding:30,
borderRadius:24,
boxShadow:
"0px 10px 25px rgba(0,0,0,0.05)",

} as const;



const dropdownStyle={

padding:"16px",
minWidth:"260px",
borderRadius:"14px",
border:
"1px solid #CBD5E1",
fontSize:16,

} as const;




const feedbackChip={

padding:"12px 18px",
background:"#EFF6FF",
border:"1px solid #BFDBFE",
borderRadius:999,
fontWeight:600,
color:"#1D4ED8",

} as const;

const studentAttentionCard = {

background:"white",

padding:30,

borderRadius:28,

marginTop:20,

boxShadow:
"0px 10px 25px rgba(0,0,0,0.05)",

} as const;