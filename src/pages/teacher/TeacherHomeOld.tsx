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
getLectureFeedbackRadar,
}
from "../../domains/teacherIntelligence/repository/TeacherFeedbackAnalyticsRepository";

export default function TeacherHome() {

const [assignments,setAssignments] =
useState<TeacherAssignment[]>([]);

const [dailyLogs,setDailyLogs] =
useState<TeacherDailyLog[]>([]);

const [

selectedLecture,

setSelectedLecture,

] = useState<TeacherDailyLog | null>(null);

const [selectedAssignmentId,
setSelectedAssignmentId] =
useState("");

const [selectedAssignment,
setSelectedAssignment] =
useState<TeacherAssignment | null>(null);

const [classroomRadar, setClassroomRadar] =
useState<any>(null);


const [showStudentsModal,setShowStudentsModal] =
useState(false);

const [selectedConcept,setSelectedConcept] =
useState("");

const [selectedStudents,setSelectedStudents] =
useState<any[]>([]);

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

setSelectedLecture(null);

setClassroomRadar(null);

if (

assignment &&
assignment.id

) {

const logs =

await getTeacherDailyLogsByAssignment(
assignment.id
);

setDailyLogs(logs);



if (

logs.length > 0

) {

const latestLog =
logs[0];

console.log(
    "LATEST DAILY LOG"
);

console.log(
    latestLog
);



setSelectedLecture(
latestLog
);



const radar =

await getLectureFeedbackRadar(
latestLog.id
);

console.log(
    "LECTURE RADAR"
);

console.log(
    radar
);

setClassroomRadar(
radar
);

}else{

setSelectedLecture(null);

setClassroomRadar(null);

}

} else {

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

{

selectedLecture && (

<div
style={{

...cardStyle,

marginTop:20,

padding:24,

background:"#EFF6FF",

borderLeft:"6px solid #F59E0B",

}}
>

<p
style={{

margin:0,

fontSize:13,

fontWeight:700,

letterSpacing:2,

color:"#EA580C",

}}
>

LATEST CLASSROOM INTELLIGENCE

</p>


<h1
style={{

marginTop:18,

marginBottom:15,

fontSize:30,

fontWeight:800,

color:"#04122F",

textTransform:"capitalize",

}}
>

{selectedLecture.topicName}

</h1>


<p
style={{

margin:0,

fontSize:15,

fontWeight:600,

color:"#475569",

}}
>

Most recent lecture submitted by you.

</p>


<p
style={{

marginTop:18,

lineHeight:1.8,

color:"#64748B",

fontSize:15,

}}
>

Today's Academic Intelligence is being generated
based on student comprehension and classroom
feedback collected for this lecture.

</p>

</div>

)

}

{/* CLASSROOM HEALTH SCORE */}

{classroomRadar && (

<>


<div
style={{
...cardStyle,
padding:24,
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
fontSize:54,
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
marginBottom:0,
}}
>

Today's classroom may require revision before tomorrow's lecture.

</p>

</div>

<div
style={{
...cardStyle,
marginTop:25,
}}
>

<h2 style={sectionHeadingStyle}>
Understanding Breakdown
</h2>

<p style={sectionSubHeadingStyle}>
Student comprehension levels for today's lecture.
</p>

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(5,1fr)",
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

<DashboardKPI
title="Total Students"
value={String(
classroomRadar.totalStudents
)}
/>

<div
style={dashboardPendingCard}
>

<h1
style={{

margin:0,
fontSize:42,
fontWeight:800,
color:"#04122F",

}}
>

{classroomRadar.pendingStudentsCount}

</h1>


<p
style={{

marginTop:12,
fontWeight:700,
fontSize:15,
color:"#475569",

}}
>

Feedback Pending

</p>


{

classroomRadar.pendingStudentsCount > 0 && (

<div

onClick={()=>{

setSelectedConcept(
"Students Pending Feedback"
);

setSelectedStudents(
classroomRadar.pendingStudents
);

setShowStudentsModal(true);

}}

style={{

marginTop:15,
padding:"8px 14px",
borderRadius:12,
background:"#EFF6FF",
color:"#2563EB",
fontWeight:700,
fontSize:13,
display:"inline-block",
cursor:"pointer",

}}

>

View Students →

</div>

)

}

</div>

</div>

</div>

{
classroomRadar.commonConcepts.length > 0 && (

<div
style={{
...cardStyle,
marginTop:25,
}}
>

<h2 style={sectionHeadingStyle}>
Most Difficult Concepts as per Students
</h2>

<p style={sectionSubHeadingStyle}>
Common concepts where students struggled.
</p>


<div
style={{

display:"flex",

gap:20,

overflowX:"auto",

paddingBottom:10,

marginTop:20,

}}
>

{

classroomRadar.commonConcepts.map(
(item:any,index:number)=>(

<div
key={index}
style={conceptCard}
>

<h3
style={{

marginTop:0,

marginBottom:12,

fontSize:20,

fontWeight:700,

color:"#04122F",

}}
>

{item.concept}

</h3>


<p
style={{
margin:0,
fontWeight:600,
fontSize:15,
color:"#64748B",
}}
>

Mentioned by {item.count}
student(s)

</p>


<div

onClick={()=>{

const students =

classroomRadar.studentsRequiringAttention
.filter((student:any)=>{

return student.concepts.includes(
item.concept
);

});

setSelectedConcept(
item.concept
);

setSelectedStudents(
students
);

setShowStudentsModal(true);

}}

style={{

marginTop:18,
padding:"8px 14px",
borderRadius:12,
background:"#EFF6FF",
color:"#2563EB",
fontWeight:700,
fontSize:13,
cursor:"pointer",
display:"inline-block",

}}

>

View Students →

</div>

</div>

))

}

</div>

</div>

)

}

{/* STUDENTS REQUIRING ATTENTION */}

<div
style={{

...cardStyle,

marginTop:25,

}}
>

<h2 style={sectionHeadingStyle}>
Students Requiring Additional Attention
</h2>

<p style={sectionSubHeadingStyle}>
Students that may require revision or additional support.
</p>


{

classroomRadar?.studentsRequiringAttention?.length === 0 ? (

<div style={cardStyle}>

<p>
No students currently require additional
teaching support.
</p>

</div>

)

:

(

<div
style={{
display:"flex",
gap:20,
overflowX:"auto",
paddingBottom:10,
}}
>

{

classroomRadar.studentsRequiringAttention.map(
(student:any,index:number)=>(

<div
key={index}
style={studentSliderCard}
>

<h2
style={{
marginTop:0,
marginBottom:15,
fontSize:18,
color:"#04122F",
}}
>

{student.studentName}

</h2>


<div
style={statusChip}
>

{student.understandingLevel}

</div>


<p
style={{

marginTop:15,

marginBottom:0,

fontWeight:700,

fontSize:15,

color:"#475569",

}}
>

{student.concepts.length} Concepts Need Revision

</p>


<div
style={{
display:"flex",
flexWrap:"wrap",
gap:10,
marginTop:15,
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

}

</div>

)

}

</div>

{

showStudentsModal && (

<div
style={{

position:"fixed",
top:0,
left:0,
right:0,
bottom:0,
background:"rgba(0,0,0,0.45)",

display:"flex",
justifyContent:"center",
alignItems:"center",

zIndex:9999,

}}
>

<div
style={{

background:"white",
width:"650px",
maxHeight:"80vh",
overflowY:"auto",

borderRadius:30,
padding:35,

boxShadow:
"0px 25px 50px rgba(0,0,0,0.2)",

}}
>

<div
style={{

background:"#FFF7ED",
padding:28,
borderRadius:22,
marginBottom:30,

}}
>

{

selectedConcept ===
"Students Pending Feedback"

? "FEEDBACK PENDING"

: "CONCEPT INTELLIGENCE"

}

<h1
style={{

color:"4d360e",
marginTop:10,
marginBottom:10,

}}
>

{selectedConcept}

</h1>

<p
style={{
color:"#4d360e",
marginBottom:0,
}}
>

{

selectedConcept ===
"Students Pending Feedback"

? `${selectedStudents.length} students have not yet submitted today's lecture feedback.`

: `${selectedStudents.length} students struggled with this concept.`

}

</p>

</div>


{

selectedStudents.map(
(student:any,index:number)=>(

<div
key={index}
style={{

background:"#F8FAFC",
padding:22,
borderRadius:18,
marginBottom:18,
border:"1px solid #E2E8F0",

}}
>

<h3
style={{
marginTop:0,
marginBottom:10,
color:"#04122F",
}}
>

{

selectedConcept ===
"Students Pending Feedback"

? student.student_name

: student.studentName

}

</h3>


{

selectedConcept !==
"Students Pending Feedback"

&&

(

<p>

Understanding Level :

{" "}

{student.understandingLevel}

</p>

)

}

</div>

))

}


<button

onClick={()=>{

setShowStudentsModal(false);

}}

style={{

padding:"14px 28px",
background:"#F59E0B",
color:"#04122F",
border:"none",
borderRadius:14,
cursor:"pointer",
fontWeight:700,

}}

>

CLOSE

</button>


</div>

</div>

)

}

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

</>

)}

</div>

);

}


function DashboardKPI(props:any){

return(

<div
style={{

padding:20,
borderRadius:20,
background:"#FFF7ED",
border:"1px solid #FDBA74",
minHeight:140,

}}
>

<h1
style={{

margin:0,
fontSize:42,
fontWeight:800,
color:"#04122F",

}}
>

{props.value}

</h1>

<p
style={{

marginTop:12,
marginBottom:0,
fontWeight:700,
fontSize:15,
color:"#475569",

}}
>

{props.title}

</p>

</div>

);

}

const conceptCard = {

minWidth:"240px",

padding:"22px",

borderRadius:"22px",

background:"#FFF7ED",

border:
"1px solid #FDBA74",

boxShadow:
"0px 8px 18px rgba(0,0,0,0.04)",

} as const;

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

const studentSliderCard = {

minWidth:"240px",

background:"#FFF7ED",

padding:20,

borderRadius:20,

border:
"1px solid #FDBA74",

boxShadow:
"0px 8px 18px rgba(0,0,0,0.04)",

} as const;

const statusChip = {

padding:"10px 18px",

background:"#FFF7ED",

border:
"1px solid #FDBA74",

borderRadius:999,

fontWeight:700,

width:"fit-content",

color:"#EA580C",

} as const;

const sectionHeadingStyle = {

fontSize:24,

fontWeight:600,

color:"#04122F",

marginBottom:8,

} as const;


const sectionSubHeadingStyle = {

fontSize:15,

color:"#64748B",

marginBottom:28,

} as const;

const dashboardPendingCard = {

padding:20,

borderRadius:20,

background:"#FFF7ED",

border:"1px solid #FDBA74",

minHeight:140,

} as const;