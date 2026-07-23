import { useEffect, useState } from "react";

import {
getCurrentTeacher,
} from "../../../services/identityService";

import {
getTeacherAssignmentsByTeacher,
} from "../repository/TeacherAssignmentRepository";

import type { TeacherAssignment }
from "../types/TeacherAssignment";

import {
getTeacherDailyLogsByAssignment,
} from "../repository/TeacherDailyLogRepository";

import type {
TeacherDailyLog,
} from "../types/TeacherDailyLog";

import {

getStudentsAtRisk

}

from "../repository/TeacherFeedbackAnalyticsRepository";

export default function MyClassroomPage() {

const [assignments,setAssignments] =
useState<TeacherAssignment[]>([]);



const [selectedMonth,setSelectedMonth] =
useState("July 2026");

const [selectedAssignment,
setSelectedAssignment] =
useState<TeacherAssignment | null>(null);

const [dailyLogs,setDailyLogs] =
useState<TeacherDailyLog[]>([]);

const [

studentsAtRisk,

setStudentsAtRisk

] = useState<{

veryCritical:string[];

critical:string[];

moderate:string[];

}>({

veryCritical:[],

critical:[],

moderate:[],

});

const [selectedDayTopics,setSelectedDayTopics] =
useState<TeacherDailyLog[]>([]);

const [showTopicsModal,setShowTopicsModal] =
useState(false);

const academicMonths = [

"July 2026",
"August 2026",
"September 2026",
"October 2026",
"November 2026",
"December 2026",
"January 2027",
"February 2027",
"March 2027",
"April 2027",

];

const sortedLogs =

[...dailyLogs].sort(
(a,b)=>
new Date(a.logDate).getTime() -
new Date(b.logDate).getTime()
);


const latestLog =

sortedLogs[
sortedLogs.length - 1
];

const daysInMonthMap = {

"July 2026":31,
"August 2026":31,
"September 2026":30,
"October 2026":31,
"November 2026":30,
"December 2026":31,
"January 2027":31,
"February 2027":28,
"March 2027":31,
"April 2027":30,

};

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

console.log(data);

console.log(teacher.teacherUuid);


}return (
  <div
    style={{
      padding: 16,
      background: "#F6F6F3",
      minHeight: "100%",
    }}
  >
    {/* HEADER */}

    <div
      style={{
        background: "#04122F",
        padding: 18,
        borderRadius: 18,
        marginBottom: 16,
        position: "relative",
      }}
    >
      <p
        style={{
          color: "#F59E0B",
          fontWeight: 700,
          letterSpacing: 1.5,
          fontSize: 9,
          marginBottom: 5,
        }}
      >
        MY CLASSROOM
      </p>

      <h1
        style={{
          color: "white",
          fontSize: 26,
          margin: 0,
        }}
      >
        CLASSROOM OVERVIEW
      </h1>

      <p
        style={{
          color: "#E5E7EB",
          marginTop: 6,
          fontSize: 12,
          lineHeight: 1.6,
        }}
      >
        View your class details and teaching history
        in a calendar format.
      </p>
    </div>

    {/* FILTERS */}

    <div
      style={{
        background: "white",
        padding: 14,
        borderRadius: 14,
        boxShadow:
          "0px 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 16,
          fontSize: 20,
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
      {/* CLASSROOM */}

<select
style={dropdownStyle}
value={

selectedAssignment?.id ?? ""

}

onChange={async (e)=>{

const assignment =

assignments.find(

(item)=>

String(item.id) ===
e.target.value

);

setSelectedAssignment(
assignment ?? null
);

if(assignment){

const logs =

await getTeacherDailyLogsByAssignment(
assignment.id
);

setDailyLogs(logs);

const riskData =

await getStudentsAtRisk(

assignment.className,
assignment.sectionName

);

setStudentsAtRisk(
riskData
);

}

else{

setDailyLogs([]);

}

}}
>

<option value="">

Select Classroom

</option>

{

assignments.map((assignment)=>(

<option
key={assignment.id}
value={assignment.id}
>

Class {assignment.className}

-

Section {assignment.sectionName}

</option>

))

}

</select>



{/* MONTH */}

<select

style={dropdownStyle}

value={selectedMonth}

onChange={(e)=>{

setSelectedMonth(
e.target.value
);

}}

>

{

academicMonths.map((month)=>(

<option
key={month}
value={month}
>

{month}

</option>

))

}

</select>

</div>

</div>

 {/* CLASS INFO */}

<div
style={{
...cardStyle,
marginTop:20,
}}
>

<h2
style={{
fontSize:"18px",
fontWeight:600,
color:"#04122F",
marginBottom:8,
}}
>

Assigned Classroom Information

</h2>


<div
style={{

display:"grid",

gridTemplateColumns:
"repeat(4,1fr)",

gap:18,

marginTop:18,

}}
>

<InfoCard

title="Class"

value={

selectedAssignment?.className ??

"Not Selected"

}

/>


<InfoCard

title="Section"

value={

selectedAssignment?.sectionName ??

"Not Selected"

}

/>


<InfoCard

title="Subject"

value={

selectedAssignment?.subjectName ??

"Not Selected"

}

/>


<InfoCard

title="Academic Session"

value={

selectedAssignment?.academicYear ??

"2026-2027"

}

/>

</div>

</div>



{/* CLASSROOM HISTORY */}

<div
style={{
...cardStyle,
marginTop:20,
}}
>

<h2
style={{
fontSize:"18px",
fontWeight:600,
color:"#04122F",
marginBottom:8,
}}
>

Classroom Teaching Calendar

</h2>

<p
style={{
marginTop:0,
color:"#64748B",
fontSize:"11px",
fontWeight:500,
}}
>

View all topics taught during the month.

</p>



{/* WEEK DAYS */}

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(7,1fr)",
gap:8,
marginTop:18,
marginBottom:10,
}}
>

{

["MON","TUE","WED","THU","FRI","SAT","SUN"]

.map((day)=>(

<div
key={day}
style={{
textAlign:"center",
fontWeight:800,
fontSize:12,
letterSpacing:1,
color:"#334155",
textTransform:"uppercase",
}}
>

{day}

</div>

))

}

</div>



{/* CALENDAR */}

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(7,1fr)",
gap:8,
}}
>

{

Array.from({

length:

daysInMonthMap[
selectedMonth as keyof typeof daysInMonthMap
]

}).map((_,index)=>{

const day = index + 1;


const logsForDay =

dailyLogs.filter((item)=>{

const currentDate =
new Date(item.logDate);

const selectedMonthName =
selectedMonth.split(" ")[0];

const selectedYear =
selectedMonth.split(" ")[1];


return(

currentDate.getDate() === day &&

currentDate.toLocaleString(
"default",
{month:"long"}
) === selectedMonthName &&

String(
currentDate.getFullYear()
) === selectedYear

);

});


const visibleTopics =

logsForDay.slice(0,1);


const remainingTopics =

logsForDay.length - 1;


if(logsForDay.length === 0){

return(

<div
key={day}
style={emptyCalendarBox}
>

<div
style={{
fontWeight:700,
fontSize:12,
}}
>

{day}

</div>


<p
style={{
marginTop:14,
fontSize:9,
color:"#CA8A04",
fontWeight:600,
textAlign:"center",
lineHeight:1.4,
}}
>

No Lecture Conducted

</p>

</div>

);

}

return(

<div
key={day}
style={{

...calendarLectureBox,

background:"#F7FFF8",

}}
>

<div
style={{

fontWeight:700,

fontSize:12,

marginBottom:8,

}}
>

{day}

</div>


{

visibleTopics.map((topic)=>(

<div
key={topic.id}
>

<div
style={{

display:"inline-flex",

padding:"5px 9px",

borderRadius:10,

background:

topic.id === latestLog?.id
? "#FFF7ED"
: "#DCFCE7",

color:

topic.id === latestLog?.id
? "#EA580C"
: "#15803D",

fontWeight:700,

fontSize:9,

marginBottom:8,

}}
>

{topic.topicName}

</div>


<p
style={{

marginTop:0,

marginBottom:8,

fontSize:9,

fontWeight:600,

color:"#475569",

lineHeight:1.5,

}}
>

Pages :

{" "}

{topic.pageFrom}

-

{topic.pageTo}

</p>


</div>

))

}



{

remainingTopics > 0 && (

<div

onClick={()=>{

setSelectedDayTopics(logsForDay);

setShowTopicsModal(true);

}}

style={{

marginTop:6,
marginBottom:8,
padding:"5px 8px",
borderRadius:8,
background:"#EFF6FF",
color:"#2563EB",
fontSize:9,
fontWeight:700,
display:"inline-block",
cursor:"pointer",

}}

>

View All Topics ({logsForDay.length}) →

</div>

)

}



<div
style={{

display:"flex",

justifyContent:"space-between",

marginTop:8,

fontSize:9,

color:"#475569",

lineHeight:1.5,

}}
>

<div>

Homework :

{" "}

<strong>

{

logsForDay.some(
item=>item.homeworkGiven
)

? "Yes"

: "No"

}

</strong>

</div>


<div>

Activity :

{" "}

<strong>

{

logsForDay.some(
item=>item.activityConducted
)

? "Yes"

: "No"

}

</strong>

</div>


</div>


</div>

);

})

}

</div>

</div>



{

showTopicsModal && (

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
width:"460px",
maxHeight:"75vh",

overflowY:"auto",

borderRadius:20,
padding:22,

boxShadow:
"0px 25px 50px rgba(0,0,0,0.2)",

}}

>

<div

style={{

background:"#04122F",

padding:18,

borderRadius:16,

marginBottom:20,

}}

>

<p

style={{

color:"#F59E0B",

fontWeight:700,

letterSpacing:1,

fontSize:"10px",

marginTop:0,

}}

>

CLASSROOM TEACHING HISTORY

</p>


<h1

style={{

color:"white",

marginTop:6,

marginBottom:6,

fontSize:"24px",

}}

>

TOPICS TAUGHT TODAY

</h1>


<p

style={{

color:"#E5E7EB",

marginBottom:0,

fontSize:"11px",

lineHeight:1.5,

}}

>

{selectedDayTopics.length}

Topics were covered during this lecture day.

</p>


</div>



{

selectedDayTopics.map((topic,index)=>(

<div

key={topic.id}

style={{

background:"#F8FAFC",

padding:16,

borderRadius:12,

marginBottom:14,

border:"1px solid #E2E8F0",

}}

>

<h3
style={{

color:"#04122F",

marginBottom:12,

fontSize:16,

}}
>

{index+1}. {topic.topicName}

</h3>


<p
style={{
fontSize:"11px",
lineHeight:1.6,
}}
>

Pages :

{topic.pageFrom}

-

{topic.pageTo}

</p>


<p
style={{
fontSize:"11px",
lineHeight:1.6,
}}
>

Homework :

{" "}

{topic.homeworkGiven
? "Yes"
: "No"}

</p>


<p
style={{
fontSize:"11px",
lineHeight:1.6,
}}
>

Activity :

{" "}

{topic.activityConducted
? "Yes"
: "No"}

</p>


{

topic.teacherNotes && (

<p
style={{
fontSize:"11px",
lineHeight:1.6,
}}
>

Teacher Notes :

{" "}

{topic.teacherNotes}

</p>

)

}

</div>

))
}



<button

onClick={()=>{

setShowTopicsModal(false);

}}

style={{

padding:"10px 18px",

background:"#F59E0B",

color:"#04122F",

border:"none",

borderRadius:10,

cursor:"pointer",

fontWeight:700,

fontSize:11,

}}

>

CLOSE TOPICS

</button>


</div>

</div>

)

}


{/* MONTHLY SUMMARY */}

<div
style={{
...cardStyle,
marginTop:20,
}}
>

<h2
style={{
fontSize:"18px",
fontWeight:600,
color:"#04122F",
marginBottom:8,
}}
>

Monthly Classroom Summary

</h2>


<div
style={{
display:"grid",
gridTemplateColumns:
"repeat(4,1fr)",
gap:14,
marginTop:18,
}}
>

<SummaryCard
title="Total Lectures"
value={String(dailyLogs.length)}
/>


<SummaryCard
title="Homework Days"
value={String(

dailyLogs.filter(
item=>
item.homeworkGiven
).length

)}
/>


<SummaryCard
title="Activity Days"
value={String(

dailyLogs.filter(
item=>
item.activityConducted
).length

)}
/>


<SummaryCard
title="Completed Topics"
value={String(dailyLogs.length)}
/>

</div>

</div>



{/* STUDENTS AT RISK */}

<div

style={{

...cardStyle,

marginTop:20,

}}

>

<h2
style={{
fontSize:"18px",
marginBottom:"6px",
}}
>

Students At Risk

</h2>

<p
style={{
color:"#64748B",
marginBottom:16,
fontSize:"11px",
}}
>

Identify students requiring immediate academic support.

</p>



<div

style={{

display:"grid",

gridTemplateColumns:
"repeat(3,1fr)",

gap:14,

}}

>

<RiskCard

title="Very Critical"

count={
studentsAtRisk.
veryCritical.length
}

students={
studentsAtRisk.
veryCritical
}

background="#FEF2F2"

/>


<RiskCard

title="Critical"

count={
studentsAtRisk.
critical.length
}

students={
studentsAtRisk.
critical
}

background="#FFF7ED"

/>


<RiskCard

title="Moderate"

count={
studentsAtRisk.
moderate.length
}

students={
studentsAtRisk.
moderate
}

background="#FEFCE8"

/>

</div>



<div
style={{
marginTop:18,
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:14,
}}
>

<div>

<h3
style={{
marginBottom:6,
fontSize:"14px",
}}
>
Very Critical
</h3>

<p
style={{
color:"#64748B",
fontSize:"10px",
lineHeight:1.6,
}}
>
3 consecutive "I didn't understand."
responses.
</p>

</div>


<div>

<h3
style={{
marginBottom:6,
fontSize:"14px",
}}
>
Critical
</h3>

<p
style={{
color:"#64748B",
fontSize:"10px",
lineHeight:1.6,
}}
>
2 "I didn't understand." and
1 "I partially understood."
response.
</p>

</div>


<div>

<h3
style={{
marginBottom:6,
fontSize:"14px",
}}
>
Moderate
</h3>

<p
style={{
color:"#64748B",
fontSize:"10px",
lineHeight:1.6,
}}
>
3 consecutive "I partially understood."
responses.
</p>

</div>

</div>

</div>



</div>

);

}


/* ------------------------------------------------ */

function TimelineCard(props: any) {

return (

<div
style={{
background:"#F8FAFC",
padding:12,
borderRadius:10,
marginBottom:10,
}}
>

<h3
style={{
fontSize:"14px",
marginBottom:"6px",
}}
>
{props.date}
</h3>

<p
style={{
fontSize:"11px",
}}
>
Topic : {props.topic}
</p>

<p
style={{
fontSize:"11px",
}}
>
Status : {props.status}
</p>

</div>

);

}


/* ------------------------------------------------ */

function SummaryCard(props:any){

return(

<div
style={{
...cardStyle,
padding:16,
background:"#ecf0de",
border:"1px solid #DBEAFE",
}}
>

<h1
style={{
margin:0,
fontSize:30,
color:"#64748B",
}}
>

{props.value}

</h1>


<p
style={{
marginTop:8,
fontWeight:600,
fontSize:"11px",
color:"#475569",
}}
>

{props.title}

</p>

</div>

);

}


function RiskCard(props:any){

return(

<div

style={{

background:
props.background,

borderRadius:12,

minHeight:140,

overflowY:"auto",

}}

>

<div
style={{

padding:"10px 12px",

background:"rgba(255,255,255,0.55)",

borderTopLeftRadius:12,

borderTopRightRadius:12,

borderBottom:"1px solid rgba(0,0,0,0.08)",

}}
>

<h3
style={{
margin:0,
fontSize:"15px",
}}
>
{props.title}
</h3>

<p
style={{
marginTop:4,
marginBottom:0,
fontWeight:700,
fontSize:"11px",
}}
>
{props.count} Students
</p>

</div>


<div
style={{
padding:12,
}}
>

{

props.students.map(

(name:string)=>(

<div

key={name}

style={{

padding:"6px 10px",

background:"white",

borderRadius:8,

marginBottom:6,

fontWeight:600,

fontSize:"11px",

}}

>

{name}

</div>

))

}

</div>

</div>

);

}


/* ------------------------------------------------ */

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

width:12,

height:12,

borderRadius:"50%",

background:props.color,

border:
"1px solid #CBD5E1",

}}
/>


<span
style={{

fontWeight:600,

fontSize:"11px",

color:"#334155",

}}
>

{props.label}

</span>

</div>

);

}


/* ------------------------------------------------ */

function InfoCard(props:any){

return(

<div
style={{

padding:12,

borderRadius:12,

background:"#ecf0de",

border:
"1px solid #BFDBFE",

}}
>

<p
style={{

margin:0,

fontSize:10,

fontWeight:600,

color:"#64748B",

}}
>

{props.title}

</p>


<h2
style={{

marginTop:8,
marginBottom:0,

color:"#64748B",

fontSize:18,

}}
>

{props.value}

</h2>


</div>

);

}


/* ------------------------------------------------ */

const cardStyle = {

background:"white",

padding:20,

borderRadius:18,

boxShadow:
"0px 10px 30px rgba(0,0,0,0.05)",

} as const;


/* ------------------------------------------------ */

const calendarLectureBox = {

background:"#FFFFFF",

border:"1px solid #E2E8F0",

borderRadius:16,

padding:12,

minHeight:120,

boxShadow:
"0px 4px 15px rgba(0,0,0,0.04)",

} as const;


/* ------------------------------------------------ */

const emptyCalendarBox = {

background:"#FFFDF3",

border:"1px solid #FDE68A",

borderRadius:16,

padding:12,

minHeight:100,

display:"flex",

flexDirection:"column" as const,

alignItems:"center",

} as const;


/* ------------------------------------------------ */

const dropdownStyle = {
  padding: "9px",
  minWidth: "150px",
  borderRadius: "9px",
  border:
    "1px solid #CBD5E1",
} as const;