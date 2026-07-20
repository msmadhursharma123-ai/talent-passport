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

const [selectedAssignment,
setSelectedAssignment] =
useState<TeacherAssignment | null>(null);

const [dailyLogs,setDailyLogs] =
useState<TeacherDailyLog[]>([]);

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
          CLASSROOM HISTORY ENGINE
        </p>

        <h1
          style={{
            marginTop: 12,
            marginBottom: 12,
            fontSize: 34,
          }}
        >
          MY CLASSROOM
        </h1>

        <p
          style={{
            margin: 0,
            color: "#D1D5DB",
            lineHeight: 1.8,
          }}
        >
          Review your complete classroom
          teaching history across the
          academic session.
        </p>
      </div>

      {/* FILTERS */}

<div style={cardStyle}>

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

<select style={dropdownStyle}>
<option>July</option>
</select>

</div>

</div>

      {/* CLASS INFO */}

      <div
        style={{
          ...cardStyle,
          marginTop: 30,
        }}
      >
        <h2>
          Assigned Classroom Information
        </h2>

        <p>

Class :

{" "}

{selectedAssignment?.className ??
"Select a Class"}

</p>


<p>

Section :

{" "}

{selectedAssignment?.sectionName ??
"Select a Section"}

</p>


<p>

Subject :

{" "}

{selectedAssignment?.subjectName ??
"Select a Subject"}

</p>


<p>

Academic Session :

{" "}

{selectedAssignment?.academicYear ??
"2026-2027"}

</p>

      </div>


{/* CLASSROOM HISTORY */}

<div
style={{
...cardStyle,
marginTop:30,
}}
>

<h2>
Classroom Teaching History
</h2>


<div
style={{
background:"#F8FAFC",
padding:24,
borderRadius:18,
marginTop:20,
}}
>

{

dailyLogs.length === 0 ?

(

<p>

No lectures have been
published yet for this
classroom.

</p>

)

:

(

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(340px,1fr))",
    gap: 24,
    marginTop: 24,
  }}
>
  {dailyLogs.map((log) => (
    <div
      key={log.id}
      style={{
        background: "white",
        border: "1px solid #E2E8F0",
        borderRadius: 24,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* TOP ROW */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            border: "1px solid #F97316",
            color: "#EA580C",
            borderRadius: 10,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {log.topicName}
        </div>

        <div
          style={{
            fontSize: 14,
            color: "#334155",
            fontWeight: 600,
          }}
        >
          {log.logDate.slice(0, 10)}
        </div>
      </div>

      {/* DETAILS */}

      <div
        style={{
          lineHeight: 1.9,
          color: "#1E293B",
        }}
      >
        <div>
          <strong>Pages :</strong>{" "}
          {log.pageFrom} - {log.pageTo}
        </div>

        <div>
          <strong>Homework :</strong>{" "}
          {log.homeworkGiven
            ? "YES"
            : "NO"}
        </div>

        <div>
          <strong>Activity :</strong>{" "}
          {log.activityConducted
            ? "YES"
            : "NO"}
        </div>

        <div>
          <strong>Teacher Notes :</strong>{" "}
          {log.teacherNotes || "--"}
        </div>
      </div>

      {/* FOOTER */}

      <div
        style={{
          borderTop:
            "1px solid #E2E8F0",
          paddingTop: 14,
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#DC2626",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 1,
          }}
        >
          DAILY CLASSROOM LOG
        </span>

        <span
          style={{
            color: "#059669",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          PUBLISHED
        </span>
      </div>
    </div>
  ))}
</div>

)

}

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

function SummaryCard(props: any) {
  return (
    <div style={cardStyle}>
      <h1>{props.value}</h1>

      <p>{props.title}</p>
    </div>
  );
}

/* ------------------------------------------------ */

const cardStyle = {
  background: "white",
  padding: 30,
  borderRadius: 24,
  boxShadow:
    "0px 10px 25px rgba(0,0,0,0.05)",
} as const;

const dropdownStyle = {
  padding: "14px",
  minWidth: "220px",
  borderRadius: "14px",
  border:
    "1px solid #CBD5E1",
} as const;