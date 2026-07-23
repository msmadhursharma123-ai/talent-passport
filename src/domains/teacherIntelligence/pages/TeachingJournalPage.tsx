import { useEffect, useState } from "react";

import {
getCurrentTeacher,
} from "../../../services/identityService";

import {
getTeacherAssignmentsByTeacher,
} from "../repository/TeacherAssignmentRepository";

import type {
TeacherAssignment,
} from "../types/TeacherAssignment";

import {
getTeacherDailyLogsByAssignment,
} from "../repository/TeacherDailyLogRepository";

import type {
TeacherDailyLog,
} from "../types/TeacherDailyLog";

import {

getMonthlyComprehensionData,

}

from "../repository/TeachingJournalRepository";

import {
getOverallClassroomComparison,
}
from "../repository/TeachingJournalRepository";

export default function TeachingJournalPage() {

    const [assignments,setAssignments] =
useState<TeacherAssignment[]>([]);

const [dailyLogs,setDailyLogs] =
useState<TeacherDailyLog[]>([]);

const [
selectedAssignmentId,
setSelectedAssignmentId,
] = useState("");

const [selectedMonth,setSelectedMonth] =
useState("July");

const [

overallClassroomComparison,

setOverallClassroomComparison,

] = useState<any[]>([]);

const [

monthlyFeedback,

setMonthlyFeedback

] = useState<any[]>([]);

const loadOverallClassroomComparison =
async ()=>{

const data =

await getOverallClassroomComparison(

selectedMonth.split(" ")[0]

);

setOverallClassroomComparison(
data
);

};

useEffect(()=>{

loadAssignments();

},[]);


useEffect(()=>{

loadOverallClassroomComparison();

},[selectedMonth]);

useEffect(() => {

loadSelectedClassroomData();

},[

selectedAssignmentId,
selectedMonth,

]);

const loadSelectedClassroomData =
async ()=>{

if(
!selectedAssignmentId
){
return;
}

const assignment =

assignments.find(
(item)=>

String(item.id) ===
selectedAssignmentId
);


if(!assignment){
return;
}


const logs =

await getTeacherDailyLogsByAssignment(
assignment.id
);


const filteredLogs =

logs.filter((log)=>{

const monthYear =

new Date(log.logDate)
.toLocaleString(
"default",
{
month:"long",
year:"numeric",
}
);

return monthYear === selectedMonth;

});


setDailyLogs(
filteredLogs
);


const feedback =

await getMonthlyComprehensionData(

filteredLogs.map(
(log)=>log.id!
)

);


setMonthlyFeedback(
feedback
);

};

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

function getDayColor(

day:number

){

const log =

dailyLogs.find((item)=>{

const lectureDay =

new Date(

item.logDate

).getDate();


return lectureDay === day;

});


if(!log){

return "#F3F4F6"; // no lecture

}


const feedback =

monthlyFeedback.filter(

(item)=>

item.daily_log_uuid ===

log.id

);


if(

feedback.length === 0

){

return "#DBEAFE"; // feedback pending

}


const complete =

feedback.filter(

(item)=>

item.understanding_level ===

"I completely understood."

).length;


const partial =

feedback.filter(

(item)=>

item.understanding_level ===

"I partially understood."

).length;


const difficult =

feedback.filter(

(item)=>

item.understanding_level ===

"I didn't understand."

).length;



if(

complete >= partial &&

complete >= difficult

){

return "#DCFCE7"; // understood

}


if(

partial >= complete &&

partial >= difficult

){

return "#FEF3C7"; // partial

}


return "#FEE2E2"; // difficult


}

function getDotColor(

day:number

){

const color =

getDayColor(day);


if(color === "#DCFCE7")
return "#22C55E";


if(color === "#FEF3C7")
return "#F59E0B";


if(color === "#FEE2E2")
return "#EF4444";


if(color === "#DBEAFE")
return "#2563EB";


return "#9CA3AF";

}

function getClassroomHealthScore(
day:number
){

const log = dailyLogs.find((item)=>{

const lectureDay =

new Date(item.logDate).getDate();

return lectureDay === day;

});

if(!log){
return null;
}

const feedback = monthlyFeedback.filter(

(item)=>

item.daily_log_uuid === log.id

);

if(feedback.length === 0){
return null;
}

const complete = feedback.filter(

(item)=>

item.understanding_level ===
"I completely understood."

).length;


const partial = feedback.filter(

(item)=>

item.understanding_level ===
"I partially understood."

).length;


const totalStudents =

feedback.length;


const score =

Math.round(

(

(

complete +

(partial * 0.5)

)

/

totalStudents

) * 100

);

return score;

}

function getMonthSummary(){

let green = 0;

let yellow = 0;

let red = 0;

let blue = 0;


for(

let i=1;

i<=31;

i++

){

const color =

getDayColor(i);


if(color === "#DCFCE7") green++;

if(color === "#FEF3C7") yellow++;

if(color === "#FEE2E2") red++;

if(color === "#DBEAFE") blue++;

}

return{

green,
yellow,
red,
blue,

};

}

function getAverageScoreByColor(

targetColor:string

){

let totalScore = 0;

let count = 0;


for(

let i=1;

i<=31;

i++

){

if(

getDayColor(i) === targetColor

){

const score =

getClassroomHealthScore(i);


if(score !== null){

totalScore += score;

count++;

}

}

}


if(count === 0){

return 0;

}


return Math.round(

totalScore / count

);

}

const summary = getMonthSummary();

 return (
  <div
    style={{
      padding: 20,
      background: "#F6F6F3",
      minHeight: "100%",
    }}
  >
    {/* HEADER */}

    <div
      style={{
        background: "#04122F",
        borderRadius: 18,
        padding: 18,
        color: "white",
        marginBottom: 18,
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#F59E0B",
          fontWeight: 700,
          letterSpacing: 2,
          fontSize: 10,
        }}
      >
        CLASSROOM ANALYTICS ENGINE
      </p>

      <h1
        style={{
          marginTop: 8,
          marginBottom: 8,
          fontSize: 24,
        }}
      >
        TEACHING JOURNAL
      </h1>

      <p
        style={{
          margin: 0,
          color: "#D1D5DB",
          lineHeight: 1.5,
          fontSize: 13,
        }}
      >
        Review class health, comprehension
        trends and teaching effectiveness
        month on month.
      </p>
    </div>

    {/* FILTERS */}

    <div style={cardStyle}>
      <h2
        style={{
          fontSize: 20,
          marginBottom: 12,
          marginTop: 0,
        }}
      >
        Filters
      </h2>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <select
          style={dropdownStyle}
          value={selectedAssignmentId}
          onChange={(e) => {
            setSelectedAssignmentId(
              e.target.value
            );
          }}
        >
          <option value="">
            Select Classroom
          </option>

          {assignments.map((assignment) => (
            <option
              key={assignment.id}
              value={assignment.id}
            >
              Class {assignment.className}
              -
              Section {assignment.sectionName}
            </option>
          ))}
        </select>

        {/* MONTH */}

        <select
          style={dropdownStyle}
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(
              e.target.value
            );
          }}
        >
          <option>January 2026</option>
          <option>February 2026</option>
          <option>March 2026</option>
          <option>April 2026</option>
          <option>May 2026</option>
          <option>June 2026</option>
          <option>July 2026</option>
          <option>August 2026</option>
          <option>September 2026</option>
          <option>October 2026</option>
          <option>November 2026</option>
          <option>December 2026</option>
        </select>
      </div>
    </div>

    {/* MONTHLY CALENDAR */}

    <div style={cardStyle}>
      <h2
        style={{
          marginTop: 0,
          fontSize: 20,
        }}
      >
        Monthly Classroom Calendar
      </h2>

      <p
        style={{
          marginTop: 6,
          color: "#64748B",
          fontSize: 13,
        }}
      >
        Your classroom comprehension heatmap
        for the month.
      </p>

      <div
        style={{
          display: "grid",

          gridTemplateColumns:
            "repeat(7,1fr)",

          gap: 8,

          marginTop: 18,

          marginBottom: 10,
        }}
      >
{

["MON","TUE","WED","THU","FRI","SAT","SUN"]

.map((day)=>(

<div

key={day}

style={{

textAlign:"center",

fontWeight:700,

fontSize:10,

color:"#64748B",

}}

>

{day}

</div>

))

}

</div>


<div

style={{

display:"grid",

gridTemplateColumns:"repeat(7,1fr)",

gap:8,

}}

>

{

Array.from({length:31}).map((_,index)=>{

const day = index + 1;

return(

<div

key={day}

style={{

...calendarBox,

background:getDayColor(day),

}}

>

<div
style={{

fontSize:13,

fontWeight:700,

}}
>

{day}

</div>


{

getClassroomHealthScore(day) && (

<div
style={{

fontSize:10,

fontWeight:700,

marginTop:3,

color:"#04122F",

}}
>

{getClassroomHealthScore(day)}%

</div>

)

}


<div

style={{

marginTop:4,

width:6,

height:6,

borderRadius:"50%",

background:

getDotColor(day),

}}

 />

</div>

);

})

}

</div>


{/* LEGEND SECTION */}


<div

style={{

display:"flex",

gap:16,

marginTop:18,

flexWrap:"wrap",

}}

>

<Legend
color="#DCFCE7"
label="Most Students Understood"
/>

<Legend
color="#FEF3C7"
label="Partially Understood"
/>

<Legend
color="#FEE2E2"
label="Students Struggled"
/>

<Legend
color="#DBEAFE"
label="Feedback Pending"
/>

<Legend
color="#F3F4F6"
label="No Lecture Conducted"
/>

</div>

</div>


{/* MONTHLY SUMMARY */}


<div
style={{

display:"grid",

gridTemplateColumns:
"repeat(4,1fr)",

gap:14,

marginTop:18,

}}
>

<AnalyticsCard

title="Excellent Days"
value={String(summary.green)}
description={`Average Score : ${getAverageScoreByColor("#DCFCE7")}%`}
background="#F0FDF4"
color="#16A34A"

/>


<AnalyticsCard

title="Average Days"
value={String(summary.yellow)}
description={`Average Score : ${getAverageScoreByColor("#FEF3C7")}%`}
background="#FEFCE8"
color="#CA8A04"

/>


<AnalyticsCard

title="Needs Support"
value={String(summary.red)}
description={`Average Score : ${getAverageScoreByColor("#FEE2E2")}%`}
background="#FEF2F2"
color="#DC2626"

/>


<AnalyticsCard

title="Feedback Pending"
value={String(summary.blue)}
description="Feedback not yet submitted."
background="#EFF6FF"
color="#2563EB"

/>


<div

style={{

marginTop:18,

textAlign:"center",

color:"#64748B",

fontSize:11,

}}

>

Calendar reflects classroom comprehension based on student feedback for the selected month.

</div>

</div>

{/* BEYOND THE CLASSROOM */}

<div
style={{
...cardStyle,
marginTop:18,
}}
>

<p
style={{
margin:0,
fontSize:10,
fontWeight:700,
letterSpacing:1.5,
color:"#F59E0B",
}}
>

BEYOND THE CLASSROOM

</p>


<h2
style={{
marginTop:8,
marginBottom:8,
fontSize:20,
}}
>

Overall Classroom Performance Comparison

</h2>


<p
style={{
marginBottom:18,
color:"#64748B",
fontSize:13,
}}
>

Compare all classrooms taught by you during the selected month.

</p>


{/* HEADER ROW */}

<div
style={{
display:"grid",

gridTemplateColumns:
`170px repeat(${overallClassroomComparison.length},1fr)`,

gap:4,
}}
>

<div />

{

overallClassroomComparison.map(
(item:any)=>(

<div
key={item.classroom}
style={{
background:"#04122F",
padding:"8px 6px",
borderRadius:8,
color:"white",
fontWeight:700,
fontSize:"11px",
textAlign:"center",
whiteSpace:"nowrap",
overflow:"hidden",
textOverflow:"ellipsis",
}}
>

{item.classroom}

</div>

))

}

</div>


<ComparisonRow

title="Average Student Understanding %"

data={

overallClassroomComparison.map(

(item:any)=>

`${item.averageHealthScore}%`

)

}

/>


<ComparisonRow

title="Average Doubt %"

data={

overallClassroomComparison.map(

(item:any)=>

`${item.averageDoubtPercentage}%`

)

}

/>


<ComparisonRow

title="Average Feedback %"

data={

overallClassroomComparison.map(

(item:any)=>

`${item.averageFeedbackPercentage}%`

)

}

/>


<ComparisonRow

title="Low Understanding Student %"

data={

overallClassroomComparison.map(

(item:any)=>

String(item.studentsAtRisk)

)

}

/>

</div>

</div>

);

}


/* -------------------------------- */

function Legend(props:any){

return(

<div

style={{

display:"flex",

alignItems:"center",

gap:6,

}}

>

<div

style={{

width:10,
height:10,

borderRadius:"50%",

background:props.color,

border:"1px solid #CBD5E1",

}}

 />

<span
style={{
fontSize:"12px",
}}
>

{props.label}

</span>

</div>

);

}


/* -------------------------------- */

function AnalyticsCard(props:any){

return(

<div

style={{

...cardStyle,

padding:18,

background:props.background,

}}

>

<h1

style={{

margin:0,

fontSize:32,

color:props.color,

}}

>

{props.value}

</h1>


<h3

style={{

marginTop:8,

marginBottom:4,

fontSize:"16px",

}}

>

{props.title}

</h3>


<p

style={{

margin:0,

color:"#64748B",

fontSize:"13px",

}}

>

{props.description}

</p>

</div>

);

}


/* -------------------------------- */


/* -------------------------------- */

const cardStyle = {

background: "white",

padding: 18,

borderRadius: 16,

boxShadow:
"0px 8px 18px rgba(0,0,0,0.05)",

} as const;


/* -------------------------------- */


const dropdownStyle = {

padding: "10px",

minWidth: "170px",

borderRadius: "10px",

fontSize:"13px",

border:
"1px solid #CBD5E1",

} as const;


/* -------------------------------- */


const calendarBox = {

padding:10,

height:48,

borderRadius:10,

display:"flex",

flexDirection:"column",

justifyContent:"center",

alignItems:"center",

cursor:"pointer",

boxShadow:
"0px 3px 10px rgba(0,0,0,0.04)",

border:
"1px solid rgba(0,0,0,0.04)",

} as const;


/* -------------------------------- */


function ComparisonRow(props:any){

return(

<div
style={{
display:"grid",

gridTemplateColumns:
`170px repeat(${props.data.length},1fr)`,

gap:4,

marginTop:4,

}}
>

<div
style={{
background:"#FFF7ED",

padding:12,

borderRadius:10,

fontWeight:700,

fontSize:"13px",

}}
>

{props.title}

</div>


{

props.data.map(

(item:string,index:number)=>(

<div
key={index}
style={{
background:"#F8FAFC",

padding:12,

borderRadius:10,

fontWeight:700,

fontSize:"13px",

textAlign:"center",

}}
>

{item}

</div>

))

}

</div>

);

}