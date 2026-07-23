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

export default function TeacherDailyLogPage() {
  const [openDialog, setOpenDialog] =
    useState(false);

  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

async function fetchLogs() {

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

  async function handleSave(
    data: Record<string, unknown>
  ) {
    await saveTeacherDailyLog(data);

    await fetchLogs();

    setOpenDialog(false);
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
          }}
        >
          Today's Published Lecture Records
        </h2>

        {logs.length === 0 && (
          <div style={cardStyle}>
            <h3>
              No Lecture Published Today.
            </h3>

            <p
              style={{
                color: "#64748B",
              }}
            >
              Publish your first lecture
              for today's classes.
            </p>
          </div>
        )}

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