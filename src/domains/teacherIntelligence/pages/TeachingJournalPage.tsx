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


export default function TeachingJournalPage() {

    const [assignments,setAssignments] =
useState<TeacherAssignment[]>([]);

const [dailyLogs,setDailyLogs] =
useState<TeacherDailyLog[]>([]);

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
useState("July");


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
          background: "#04122F",
          borderRadius: 28,
          padding: 30,
          color: "white",
          marginBottom: 28,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#F59E0B",
            fontWeight: 700,
            letterSpacing: 2,
            fontSize: 13,
          }}
        >
          CLASSROOM ANALYTICS ENGINE
        </p>

        <h1
          style={{
            marginTop: 12,
            marginBottom: 12,
            fontSize: 34,
          }}
        >
          TEACHING JOURNAL
        </h1>

        <p
          style={{
            margin: 0,
            color: "#D1D5DB",
            lineHeight: 1.8,
          }}
        >
          Review class health, comprehension
          trends and teaching effectiveness
          month on month.
        </p>
      </div>

      {/* FILTERS */}

      <div style={cardStyle}>
        <h2>Filters</h2>

        <div
          style={{
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
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

setDailyLogs([]);

setSelectedMonth("July");
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
setDailyLogs([]);

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


if(assignment && assignment.id){

const logs =

await getTeacherDailyLogsByAssignment(
assignment.id
);

setDailyLogs(logs);

}else{

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

<option>January</option>
<option>February</option>
<option>March</option>
<option>April</option>
<option>May</option>
<option>June</option>
<option>July</option>
<option>August</option>
<option>September</option>
<option>October</option>
<option>November</option>
<option>December</option>

</select>
        </div>
      </div>

      {/* MONTHLY CALENDAR */}

      <div style={cardStyle}>
        <h2>
          Monthly Classroom Calendar
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(7,1fr)",
            gap: 12,
            marginTop: 20,
          }}
        >
          {Array.from({ length: 31 }).map(
            (_, index) => (
              <div
                key={index}
                style={calendarBox}
              >
                {index + 1}
              </div>
            )
          )}
        </div>
      </div>

     {/* MONTHLY SUMMARY */}

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(4,1fr)",
gap:20,
marginTop:30,
}}
>

<AnalyticsCard
title="Total Lectures"
value={String(dailyLogs.length)}
/>

<AnalyticsCard
title="Homework Given"
value={String(

dailyLogs.filter(
log=>log.homeworkGiven
).length

)}
/>

<AnalyticsCard
title="Activities Conducted"
value={String(

dailyLogs.filter(
log=>log.activityConducted
).length

)}
/>

<AnalyticsCard
title="Topics Covered"
value={String(

new Set(
dailyLogs.map(
log=>log.topicName
)
).size

)}
/>

</div>

      {/* MONTHLY INSIGHTS */}

<div
style={{
...cardStyle,
marginTop:30,
}}
>

<h2>
Monthly Teaching Insights
</h2>


{

dailyLogs.length === 0 ?

(

<p>

No lecture records found
for the selected classroom.

</p>

)

:

(

<ul
style={{
lineHeight:2,
}}
>

{

dailyLogs.map((log)=>(

<li key={log.id}>

{log.logDate}

{" - "}

{log.topicName}

</li>

))

}

</ul>

)

}

</div>

    {/* ADVANCED ANALYTICS */}

<div
style={{
...cardStyle,
marginTop:30,
background:"#FFF7ED",
}}
>

<h2>
Upcoming Classroom Analytics
</h2>


<ul
style={{
lineHeight:2,
}}
>

<li>
Student Comprehension Analytics
</li>

<li>
Parent Feedback Intelligence
</li>

<li>
AI Teaching Recommendations
</li>

<li>
Engagement Analytics Engine
</li>

<li>
Classroom Performance Insights
</li>

</ul>

</div>
   </div>
  );
}

/* -------------------------------- */

function AnalyticsCard(props: any) {
  return (
    <div style={cardStyle}>
      <h1
        style={{
          margin: 0,
          color: "#04122F",
        }}
      >
        {props.value}
      </h1>

      <p>
        {props.title}
      </p>
    </div>
  );
}

/* -------------------------------- */

function WeeklyCard(props: any) {
  return (
    <div
      style={{
        background: "#F8FAFC",
        padding: 18,
        borderRadius: 16,
        marginBottom: 14,
      }}
    >
      <h3
        style={{
          marginTop: 0,
        }}
      >
        {props.week}
      </h3>

      <p>
        Average Response :
        {" "}
        {props.score}
      </p>
    </div>
  );
}

/* -------------------------------- */

const cardStyle = {
  background: "white",
  padding: 30,
  borderRadius: 24,
  boxShadow:
    "0px 10px 25px rgba(0,0,0,0.05)",
} as const;

/* -------------------------------- */

const dropdownStyle = {
  padding: "14px",
  minWidth: "220px",
  borderRadius: "14px",
  border:
    "1px solid #CBD5E1",
} as const;

/* -------------------------------- */

const calendarBox = {
  background: "#F8FAFC",
  padding: 18,
  borderRadius: 14,
  textAlign: "center" as const,
  fontWeight: 700,
};