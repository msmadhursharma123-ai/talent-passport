import { useState, useEffect } from "react";

import TeacherDailyLogDialog from "../dialogs/TeacherDailyLogDialog";

import {
  saveTeacherDailyLog,
} from "../viewmodels/TeacherDailyLogViewModel";

import { getCurrentTeacher }
from "../../../services/identityService";

import {
getTeacherAssignmentsByTeacher,
} from "../repository/TeacherAssignmentRepository";

import {
loadTodaysTeacherLogsByAssignment,
} from "../viewmodels/TeacherDailyLogViewModel";

import {
getTeacherPendingDoubtLedger,
} from "../repository/TeacherPendingDoubtRepository";

export default function TeacherDailyLogPage() {
  const [openDialog, setOpenDialog] =
    useState(false);

  const [logs, setLogs] = useState<any[]>([]);

const [logsLoading, setLogsLoading] =
useState(true);

const [pendingDoubtLoading, setPendingDoubtLoading] =
useState(true);

const [

pendingDoubts,

setPendingDoubts,

] = useState<any[]>([]);

useEffect(() => {

fetchLogs();

loadPendingDoubtLedger();

}, []);

async function fetchLogs() {

setLogsLoading(true);

try{

const teacher =
getCurrentTeacher();

if (!teacher) {

setLogs([]);

return;

}

const assignments =

await getTeacherAssignmentsByTeacher(
teacher.teacherUuid
);

let allLogs:any[] = [];

for (const assignment of assignments) {

if (!assignment.id) {
continue;
}

const logs =

await loadTodaysTeacherLogsByAssignment(
assignment.id
);

allLogs.push(...logs);

}

allLogs.sort(
(a,b)=>
new Date(
b.createdAt
).getTime()
-
new Date(
a.createdAt
).getTime()
);

setLogs(allLogs);

}

finally{

setLogsLoading(false);

}

}

async function
loadPendingDoubtLedger(){

setPendingDoubtLoading(true);

try{

const data =

await getTeacherPendingDoubtLedger();

setPendingDoubts(
data
);

}

finally{

setPendingDoubtLoading(false);

}

}

async function handleSave(
data: Record<string, unknown>
) {

await saveTeacherDailyLog(
data
);

await fetchLogs();

await loadPendingDoubtLedger();

setOpenDialog(
false
);

}

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
          borderRadius: 28,
          padding: 20,
          marginBottom: 20,
          color: "white",
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
          CLASSROOM LECTURE LOGGING INTERFACE
        </p>

        <h1
          style={{
            marginTop: 12,
            marginBottom: 12,
            fontSize: 26,
          }}
        >
          DAILY LESSON PUBLISHING CENTER
        </h1>

        <p
          style={{
            margin: 0,
            color: "#D1D5DB",
            lineHeight: 1.8,
          }}
        >
          Publish today's lecture details for
          parents, students and classroom
          intelligence surveys.
        </p>
      </div>

      {/* SUBMIT CARD */}

      <div style={cardStyle}>
        <h2
          style={{
            marginTop: 0,
            color: "#04122F",
          }}
        >
          Today's Lecture Submission
        </h2>

        <p
          style={{
            color: "#64748B",
            marginBottom: 25,
          }}
        >
          Publish today's lesson coverage,
          homework status and classroom
          activity.
        </p>

        <button
          onClick={() =>
            setOpenDialog(true)
          }
          style={buttonStyle}
        >
          + Publish Today's Lecture
        </button>
      </div>

      {/* TODAY'S LOGS */}

      <div
        style={{
          marginTop: 35,
        }}
      >
        <h2
          style={{
            color: "#04122F",
            fontSize:"15px",
            margin:"0 0 15px 0",
fontWeight:800,


          }}
        >
          Today's Published Lecture Records
        </h2>

        {

logsLoading ? (

Array.from({length:5}).map((_,index)=>(

<div
key={index}
style={{
background:"white",
padding:"16px",
borderRadius:"16px",
marginBottom:"18px",
border:"1px solid #CBD5E1",
}}
>

<h2
style={{
margin:"0 0 10px 0",
color:"#64748B",
}}
>

Loading Today's Lecture...

</h2>

<p
style={{
color:"#94A3B8"
}}
>

Fetching today's classroom records...

</p>

</div>

))

)

:

logs.length === 0 && (

<div style={cardStyle}>

<h3>
No Lecture Published Today.
</h3>

<p
style={{
color:"#64748B",
}}
>

Publish your first lecture
for today's classes.

</p>

</div>

)

}
        

       {logs.map((log: any) => (

<div
key={log.id}
style={{
background:"white",
padding:"16px",
borderRadius:"16px",
marginBottom:"18px",
border:"1px solid #CBD5E1",
display:"flex",
justifyContent:"space-between",
alignItems:"center",
gap:"16px",
flexWrap:"wrap",
}}
>

<div>

<h2
style={{
margin:"0 0 10px 0",
color:"#1E293B",
fontSize:"15px",
fontWeight:800,
}}
>
Class {log.className}
{" "}
•
{" "}
Section {log.sectionName}
{" "}
—
{" "}
{log.topicName}
</h2>


<p
style={{
margin:0,
color:"#64748B",
fontSize:"13px",
}}
>

Covered Pages :

Page {log.pageFrom}
{" "}
to
{" "}
Page {log.pageTo}

{" • "}

Homework :

<strong>
{log.homeworkGiven ? "YES" : "NO"}
</strong>

{" • "}

Activity :

<strong>
{log.activityConducted ? "YES" : "NO"}
</strong>

</p>


<p
style={{
marginTop:"8px",
color:"#64748B",
fontSize:"15px",
}}
>

Teacher Notes :

<strong>

{log.teacherNotes || "No Notes"}

</strong>

</p>

</div>


<div
style={{
background:"#DCFCE7",
padding:"6px 12px",
borderRadius:"8px",
fontSize:"12px",
border:"1px solid #15803D",
fontWeight:700,
color:"#065F46",
whiteSpace:"nowrap",
}}
>
🟢 ACTIVE SURVEY PUBLISHED
</div>

</div>

))}

{/* -------------------------------------------

SESSION BEYOND THE CLASSROOM

-------------------------------------------- */}

<div
style={{

marginTop:"30px",

background:"white",

padding:"24px",

borderRadius:"24px",

boxShadow:
"0px 8px 24px rgba(0,0,0,0.05)",

overflowX:"auto",

}}

>

<div
style={{

marginBottom:"25px",

}}

>

<p
style={{

margin:0,

fontSize:"12px",

fontWeight:700,

letterSpacing:"2px",

color:"#F59E0B",

textTransform:"uppercase",

}}

>

SESSION BEYOND THE CLASSROOM

</p>


<h2
style={{

marginTop:"8px",

marginBottom:"10px",

color:"#041B4D",

}}

>

 Not discussed Doubt Ledger

</h2>


<p
style={{

margin:0,

color:"#64748B",

lineHeight:1.7,

}}

>

These are the difficult concepts that students reported were NOT revised during the next classroom lecture.

</p>

</div>

{

pendingDoubtLoading ? (

<table
style={{

width:"100%",
borderCollapse:"collapse",
minWidth:"950px",

}}
>

<thead>

<tr>

<th style={{
padding:"10px",
background:"#f7f4f9",
color:"#041B4D",
fontWeight:700,
fontSize:"18px",
textAlign:"center",
border:"1px solid #E5E7EB",
}}>
METRICS
</th>

<th style={{
...tableHeaderStyle,
background:"#F9F4EA",
color:"#041B4D",
fontSize:"20px",
fontWeight:700,
}}>
Loading...
</th>

</tr>

</thead>

<tbody>

{renderPendingDoubtRow(
"Students Count who had Doubt",
["-"]
)}

{renderPendingDoubtRow(
"Topic that was taught that day",
["-"]
)}

{renderPendingDoubtRow(
"Most Difficult Concept from that topic",
["-"]
)}

{renderPendingDoubtRow(
"Students Are",
["-"]
)}

{renderPendingDoubtRow(
"Date of this discussion",
["-"]
)}

{renderPendingDoubtRow(
"Status",
["-"]
)}

</tbody>

</table>

)

:

pendingDoubts.length === 0 ? (

<div
style={{

padding:"30px",

textAlign:"center",

color:"#64748B",

fontSize:"16px",

}}

>

No unresolved classroom learning gaps.

</div>

)

:
(

  <table
style={{

width:"100%",

borderCollapse:"collapse",

minWidth:"950px",

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

pendingDoubts.map(

(item:any, index:number)=>(

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

{renderPendingDoubtRow(

"Students Count who had Doubt",

pendingDoubts.map(
(item)=>String(item.pendingCount)
)

)}


{renderPendingDoubtRow(

"Topic that was taught that day",

pendingDoubts.map(
(item)=>item.previousTopic
)

)}


{renderPendingDoubtRow(

"Most Difficult Concept from that topic",

pendingDoubts.map(
(item)=>item.difficultConcept
)

)}


{renderPendingDoubtRow(

"Students Are",

pendingDoubts.map(
(item)=>item.students
)

)}


{renderPendingDoubtRow(

"Date of this discussion",

pendingDoubts.map(
(item)=>item.logDate
)

)}


{renderPendingDoubtRow(

"Status",

pendingDoubts.map(
(item)=>item.status
)

)}

</tbody>

</table>

)

}

</div>

      </div>

      <TeacherDailyLogDialog
        open={openDialog}
        onClose={() =>
          setOpenDialog(false)
        }
        onSave={handleSave}
      />
    </div>



      );
}


function renderPendingDoubtRow(
  metricName: string,
  values: string[]
) {
  return (
    <tr>
      <td style={metricColumnStyle}>
        {metricName}
      </td>

      {values.map((value, index) => (
        <td
          key={index}
          style={{
            ...tableCellStyle,

            color:
              metricName.includes("Count")
                ? "#EF4444"
                : metricName.includes("Difficult")
                ? "#1E3A8A"
                : metricName === "Students Are"
                ? "#DC2626"
                : metricName === "Status"
                ? "#F59E0B"
                : "#334155",

            fontWeight:
              metricName.includes("Count") ||
              metricName.includes("Difficult")
                ? 700
                : 500,
          }}
        >
          {value || "-"}
        </td>
      ))}
    </tr>
  );
}

const cardStyle = {
  background: "white",
  padding: 20,
  borderRadius: 18,
  marginBottom: 24,
  boxShadow:
    "0px 10px 25px rgba(0,0,0,0.05)",
} as const;

const buttonStyle = {
padding:"12px 20px",
  border: "none",
  borderRadius: "10px",
  background: "#F97316",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
} as const;

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

width: "320px",
minWidth: "320px",

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
