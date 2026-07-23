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

const [classes,setClasses] =
useState<string[]>([]);

const [sections,setSections] =
useState<string[]>([]);

const [subjects,setSubjects] =
useState<string[]>([]);

const [selectedClass,setSelectedClass] =
useState("");

const [selectedSection,setSelectedSection] =
useState("");

const [selectedSubject,setSelectedSubject] =
useState("");

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

const uniqueClasses = [

...new Set(
data.map(
item=>item.className
)
),

];

setClasses(uniqueClasses);

}
  return (
    <div
      style={{
        padding: 32,
        background: "#F6F6F3",
        minHeight: "100%",
      }}
    >
      {/* HEADER */}

      <div
style={{
background:"#04122F",
padding:40,
borderRadius:28,
marginBottom:24,
position:"relative",
}}
>

<p
style={{
color:"#F59E0B",
fontWeight:700,
letterSpacing:2,
fontSize:13,
marginBottom:8,
}}
>

MY CLASSROOM

</p>


<h1
style={{
color:"white",
fontSize:48,
margin:0,
}}
>

CLASSROOM OVERVIEW

</h1>


<p
style={{
color:"#E5E7EB",
marginTop:10,
fontSize:18,
}}
>

View your class details and teaching history in a calendar format.

</p>

</div>

      {/* FILTERS */}

<div style={{

background:"white",
padding:28,
borderRadius:28,
boxShadow:"0px 10px 30px rgba(0,0,0,0.05)",

}}>

<h2>Filters</h2>

<div
style={{
display:"flex",
gap:18,
flexWrap:"wrap",
}}
>

{/* CLASS */}

<select
style={dropdownStyle}
value={selectedClass}
onChange={(e)=>{

const value =
e.target.value;

setSelectedClass(value);

const filteredSections = [

...new Set(

assignments

.filter(
item=>
item.className === value
)

.map(
item=>item.sectionName
)

),

];

setSections(filteredSections);

setSelectedSection("");
setSelectedSubject("");
setSubjects([]);
setSelectedAssignment(null);

}}
>

<option value="">
Select Class
</option>

{

classes.map((item)=>(

<option
key={item}
value={item}
>
Class {item}
</option>

))

}

</select>


{/* SECTION */}

<select
style={dropdownStyle}
value={selectedSection}
onChange={(e)=>{

const value =
e.target.value;

setSelectedSection(value);

const filteredSubjects = [

...new Set(

assignments

.filter(
item=>

item.className ===
selectedClass &&

item.sectionName ===
value

)

.map(
item=>item.subjectName
)

),

];

setSubjects(filteredSubjects);

setSelectedSubject("");
setSelectedAssignment(null);

}}
>

<option value="">
Select Section
</option>

{

sections.map((item)=>(

<option
key={item}
value={item}
>
Section {item}
</option>

))

}

</select>



{/* SUBJECT */}

<select
style={dropdownStyle}
value={selectedSubject}
onChange={async (e)=>{

const value =
e.target.value;

setSelectedSubject(value);

const assignment =

assignments.find(
item=>

item.className ===
selectedClass &&

item.sectionName ===
selectedSection &&

item.subjectName ===
value

);

setSelectedAssignment(
assignment ?? null
);

if (assignment) {

const logs =

await getTeacherDailyLogsByAssignment(
assignment.id
);

setDailyLogs(logs);

const riskData =

await getStudentsAtRisk(

selectedClass,
selectedSection

);

setStudentsAtRisk(
riskData
);


} else {

setDailyLogs([]);

}

}}
>

<option value="">
Select Subject
</option>

{

subjects.map((item)=>(

<option
key={item}
value={item}
>
{item}
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
marginTop:30,
}}
>

<h2
style={{
fontSize:"24px",
fontWeight:600,
color:"#04122F",
marginBottom:12,
}}
>

Assigned Classroom Information

</h2>


<div
style={{

display:"grid",

gridTemplateColumns:
"repeat(4,1fr)",

gap:30,

marginTop:30,

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
marginTop:30,
}}
>

<h2
style={{
fontSize:"24px",
fontWeight:600,
color:"#04122F",
marginBottom:12,
}}
>

Classroom Teaching Calendar

</h2>

<p
style={{
marginTop:0,
color:"#64748B",
fontSize:"16px",
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
gap:12,
marginTop:30,
marginBottom:15,
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
fontSize:18,
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
gap:12,
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
fontSize:18,
}}
>

{day}

</div>


<p
style={{
marginTop:25,
fontSize:13,
color:"#CA8A04",
fontWeight:600,
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

fontSize:18,

marginBottom:12,

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

padding:"8px 14px",

borderRadius:14,

background:

topic.id === latestLog?.id
? "#FFF7ED"
: "#DCFCE7",

color:

topic.id === latestLog?.id
? "#EA580C"
: "#15803D",

fontWeight:700,

fontSize:13,

marginBottom:12,

}}
>

{topic.topicName}

</div>


<p
style={{

marginTop:0,

marginBottom:14,

fontSize:13,

fontWeight:600,

color:"#475569",

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

marginTop:10,
marginBottom:14,
padding:"8px 12px",
borderRadius:12,
background:"#EFF6FF",
color:"#2563EB",
fontSize:13,
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

marginTop:14,

fontSize:13,

color:"#475569",

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
width:"700px",
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

background:"#04122F",

padding:28,

borderRadius:22,

marginBottom:30,

}}

>

<p

style={{

color:"#F59E0B",

fontWeight:700,

letterSpacing:1.5,

marginTop:0,

}}

>

CLASSROOM TEACHING HISTORY

</p>


<h1

style={{

color:"white",

marginTop:10,

marginBottom:10,

}}

>

TOPICS TAUGHT TODAY

</h1>


<p

style={{

color:"#E5E7EB",

marginBottom:0,

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

padding:24,

borderRadius:18,

marginBottom:20,

border:"1px solid #E2E8F0",

}}

>

<h3
style={{

color:"#04122F",

marginBottom:18,

fontSize:22,

}}
>

{index+1}. {topic.topicName}

</h3>


<p>

Pages :

{topic.pageFrom}

-

{topic.pageTo}

</p>


<p>

Homework :

{" "}

{topic.homeworkGiven
? "Yes"
: "No"}

</p>


<p>

Activity :

{" "}

{topic.activityConducted
? "Yes"
: "No"}

</p>


{

topic.teacherNotes && (

<p>

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

padding:"16px 30px",

background:"#F59E0B",

color:"#04122F",

border:"none",

borderRadius:16,

cursor:"pointer",

fontWeight:700,

fontSize:15,

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
marginTop:30,
}}
>

<h2
style={{
fontSize:"24px",
fontWeight:600,
color:"#04122F",
marginBottom:12,
}}
>

Monthly Classroom Summary

</h2>


<div
style={{
display:"grid",
gridTemplateColumns:
"repeat(4,1fr)",
gap:20,
marginTop:30,
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
title=" Activity Days"
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

marginTop:30,

}}

>

<h2>

Students At Risk

</h2>

<p
style={{
color:"#64748B",
marginBottom:24,
}}
>

Identify students requiring immediate academic support.

</p>



<div

style={{

display:"grid",

gridTemplateColumns:
"repeat(3,1fr)",

gap:20,

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
marginTop:30,
display:"grid",
gridTemplateColumns:"repeat(3,1fr)",
gap:20,
}}
>

<div>
<h3 style={{marginBottom:8}}>
Very Critical
</h3>

<p style={{color:"#64748B"}}>
3 consecutive "I didn't understand."
responses.
</p>
</div>


<div>
<h3 style={{marginBottom:8}}>
Critical
</h3>

<p style={{color:"#64748B"}}>
2 "I didn't understand." and
1 "I partially understood."
response.
</p>
</div>


<div>
<h3 style={{marginBottom:8}}>
Moderate
</h3>

<p style={{color:"#64748B"}}>
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
        background: "#F8FAFC",
        padding: 18,
        borderRadius: 16,
        marginBottom: 14,
      }}
    >
      <h3>{props.date}</h3>

      <p>Topic : {props.topic}</p>

      <p>Status : {props.status}</p>
    </div>
  );
}

/* ------------------------------------------------ */

function SummaryCard(props:any){

return(

<div
style={{
...cardStyle,
padding:25,
background:"#ecf0de",

border:"1px solid #DBEAFE",
}}
>

<h1
style={{
margin:0,
fontSize:48,
color:"#64748B",
}}
>

{props.value}

</h1>


<p
style={{
marginTop:12,
fontWeight:600,
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

borderRadius:20,

minHeight:220,

overflowY:"auto",

}}

>

<div
style={{

padding:"16px 18px",

background:"rgba(255,255,255,0.55)",

borderTopLeftRadius:20,

borderTopRightRadius:20,

borderBottom:"1px solid rgba(0,0,0,0.08)",

}}
>

<h3
style={{
margin:0,
}}
>
{props.title}
</h3>

<p
style={{
marginTop:6,
marginBottom:0,
fontWeight:700,
}}
>
{props.count} Students
</p>

</div>


<div
style={{
padding:18,
}}
>

{

props.students.map(

(name:string)=>(

<div

key={name}

style={{

padding:"10px 14px",

background:"white",

borderRadius:12,

marginBottom:10,

fontWeight:600,

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

gap:10,

}}
>

<div
style={{

width:18,

height:18,

borderRadius:"50%",

background:props.color,

border:
"1px solid #CBD5E1",

}}
/>


<span
style={{

fontWeight:600,

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

padding:20,

borderRadius:18,

background:"#ecf0de",

border:
"1px solid #BFDBFE",

}}
>

<p
style={{

margin:0,

fontSize:14,

fontWeight:600,

color:"#64748B",

}}
>

{props.title}

</p>


<h2
style={{

marginTop:12,
marginBottom:0,

color:"#64748B",

fontSize:30,

}}
>

{props.value}

</h2>


</div>

);

}

const cardStyle = {

background:"white",

padding:32,

borderRadius:28,

boxShadow:
"0px 10px 30px rgba(0,0,0,0.05)",

} as const;

const calendarLectureBox = {

background:"#FFFFFF",

border:"1px solid #E2E8F0",

borderRadius:24,

padding:18,

minHeight:180,

boxShadow:
"0px 4px 15px rgba(0,0,0,0.04)",

} as const;



const emptyCalendarBox = {

background:"#FFFDF3",

border:"1px solid #FDE68A",

borderRadius:24,

padding:18,

minHeight:150,

display:"flex",

flexDirection:"column" as const,

alignItems:"center",

} as const;

const dropdownStyle = {
  padding: "14px",
  minWidth: "220px",
  borderRadius: "14px",
  border:
    "1px solid #CBD5E1",
} as const;