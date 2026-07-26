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
      padding: "20px",
      background: "#F6F7F9",
      minHeight: "100%",
    }}
  >
    {/* =====================================================
        PAGE HERO
       ===================================================== */}

    <div style={heroStyle}>
      <div style={heroOrangeCircle} />
      <div style={heroSoftCircle} />
      <div style={heroBlueCircle} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            CLASSROOM ANALYTICS ENGINE
          </div>

          <h1
            style={{
              margin: "8px 0 8px",
              color: "#0F172A",
              fontSize: "31px",
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-0.7px",
            }}
          >
            Teaching Journal
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "650px",
              color: "#64748B",
              fontSize: "13px",
              lineHeight: 1.65,
            }}
          >
            Review classroom health,
            comprehension trends and teaching
            effectiveness across academics.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "14px",
            }}
          >
            <div style={orangePillStyle}>
              MONTHLY INTELLIGENCE
            </div>

            <div style={bluePillStyle}>
              CLASSROOM HEALTH
            </div>
          </div>
        </div>

        <div style={heroBadgeStyle}>
          <div
            style={{
              fontSize: "28px",
              lineHeight: 1,
            }}
          >
            ◇
          </div>

          <div
            style={{
              marginTop: "8px",
              color: "#F97316",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "1.2px",
            }}
          >
            JOURNAL
          </div>
        </div>
      </div>
    </div>

    {/* =====================================================
        JOURNAL CONTROLS
       ===================================================== */}

    <div style={sectionCardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "18px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            JOURNAL CONTROLS
          </div>

          <h2 style={sectionTitleStyle}>
            Explore Classroom History
          </h2>

          <p style={sectionDescriptionStyle}>
            Select a classroom and month to
            review its teaching and comprehension
            record.
          </p>
        </div>

        <div
          style={{
            color: "#94A3B8",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "1px",
          }}
        >
          ACADEMIC INTELLIGENCE
        </div>
      </div>

   <div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "20px",
  }}
>
        <div>
          <div style={fieldLabelStyle}>
            
          </div>

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

            {assignments.map(
              (assignment) => (
                <option
                  key={assignment.id}
                  value={assignment.id}
                >
                  Class{" "}
                  {assignment.className} -
                  Section{" "}
                  {assignment.sectionName}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <div style={fieldLabelStyle}>
            
          </div>

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
    </div>

   {/* =====================================================
    MONTHLY CLASSROOM INTELLIGENCE
   ===================================================== */}

<div
  style={{
    position: "relative",
    overflow: "hidden",

    marginBottom: "18px",
    padding: "24px",

    background: "#FFFFFF",

    border: "1px solid #E2E8F0",
    borderRadius: "22px",

    boxShadow:
      "0 7px 24px rgba(15,23,42,0.035)",
  }}
>
  {/* DECORATIVE TOP-RIGHT CIRCLE */}

  <div
    style={{
      position: "absolute",

      width: "125px",
      height: "125px",

      right: "-38px",
      top: "-52px",

      borderRadius: "50%",

      background:
        "rgba(255,237,213,0.48)",

      pointerEvents: "none",
    }}
  />

  {/* =====================================================
      SECTION HEADER
     ===================================================== */}

  <div
    style={{
      position: "relative",
      zIndex: 1,

      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",

      gap: "20px",
    }}
  >
    <div>
      <div
        style={{
          color: "#F97316",

          fontSize: "10px",
          fontWeight: 800,

          letterSpacing: "1.6px",
          textTransform: "uppercase",
        }}
      >
        LEARNING CONTINUITY
      </div>

      <h2
        style={{
          margin: "7px 0 0",

          color: "#0F172A",

          fontSize: "21px",
          lineHeight: 1.2,

          fontWeight: 800,

          letterSpacing: "-0.3px",
        }}
      >
        Classroom Comprehension Calendar
      </h2>

      <p
        style={{
          margin: "7px 0 0",

          color: "#64748B",

          fontSize: "14px",
          lineHeight: 1.55,
        }}
      >
        Daily classroom health based on student comprehension
        feedback for the selected month.
      </p>
    </div>

    {/* MONTHLY LEARNING LEDGER */}

    <div
      style={{
        position: "relative",
        zIndex: 1,

        flexShrink: 0,

        padding: "8px 14px",

        background:
          "linear-gradient(135deg,#FFF7ED,#FFFFFF)",

        border: "1px solid #FED7AA",

        borderRadius: "11px",

        color: "#EA580C",

        fontSize: "10px",
        fontWeight: 800,

        letterSpacing: "0.7px",

        textTransform: "uppercase",
      }}
    >
      Monthly Learning Ledger
    </div>
  </div>

  {/* =====================================================
      WEEK DAYS
     ===================================================== */}

  <div
    style={{
      position: "relative",
      zIndex: 1,

      display: "grid",

      gridTemplateColumns:
        "repeat(7, minmax(0,1fr))",

      gap: "12px",

      marginTop: "30px",
      marginBottom: "12px",
    }}
  >
    {[
      "MON",
      "TUE",
      "WED",
      "THU",
      "FRI",
      "SAT",
      "SUN",
    ].map((day) => (
      <div
        key={day}
        style={{
          textAlign: "center",

          color: "#64748B",

          fontSize: "11px",
          fontWeight: 800,

          letterSpacing: "1.1px",
        }}
      >
        {day}
      </div>
    ))}
  </div>

  {/* =====================================================
      CALENDAR GRID
     ===================================================== */}

  <div
    style={{
      position: "relative",
      zIndex: 1,

      display: "grid",

      gridTemplateColumns:
        "repeat(7, minmax(0,1fr))",

      gap: "12px",
    }}
  >
    {Array.from({
      length: 31,
    }).map((_, index) => {
      const day = index + 1;

      const score =
        getClassroomHealthScore(day);

      const dayColor =
        getDayColor(day);

      const isNoLecture =
        dayColor === "#F3F4F6";

      const isFeedbackPending =
        dayColor === "#DBEAFE";

      const isUnderstood =
        dayColor === "#DCFCE7";

      const isPartial =
        dayColor === "#FEF3C7";

      const isDifficult =
        dayColor === "#FEE2E2";

      /* =================================================
         NO LECTURE
         NEW ORANGE / CREAM THEME
      ================================================= */

      if (isNoLecture) {
        return (
          <div
            key={day}
            style={{
              position: "relative",

              overflow: "hidden",

              minHeight: "116px",

              padding: "14px",

              boxSizing: "border-box",

              background:
                "linear-gradient(135deg,#FFF9EF 0%,#FFFCF7 100%)",

              border:
                "1px solid #FDBA74",

              borderRadius: "15px",

              display: "flex",
              flexDirection: "column",

              boxShadow:
                "0 2px 6px rgba(15,23,42,0.02)",
            }}
          >
            {/* CORNER CIRCLE */}

            <div
              style={{
                position: "absolute",

                width: "54px",
                height: "54px",

                right: "-18px",
                top: "-18px",

                borderRadius: "50%",

                background:
                  "rgba(255,237,213,0.78)",

                pointerEvents: "none",
              }}
            />

            {/* DAY */}

            <div
              style={{
                position: "relative",
                zIndex: 1,

                color: "#0F172A",

                fontSize: "14px",
                lineHeight: 1,

                fontWeight: 800,
              }}
            >
              {day}
            </div>

            {/* NO LECTURE MESSAGE */}

            <div
              style={{
                position: "relative",
                zIndex: 1,

                flex: 1,

                display: "flex",

                alignItems: "center",
                justifyContent: "center",

                paddingBottom: "3px",
              }}
            >
              <div
                style={{
                  color: "#EA580C",

                  fontSize: "10px",
                  lineHeight: 1.3,

                  fontWeight: 800,

                  textAlign: "center",
                }}
              >
                No Lecture Conducted
              </div>
            </div>
          </div>
        );
      }

      /* =================================================
         FEEDBACK PENDING
      ================================================= */

      if (isFeedbackPending) {
        return (
          <div
            key={day}
            style={{
              position: "relative",

              overflow: "hidden",

              minHeight: "116px",

              padding: "14px",

              boxSizing: "border-box",

              background:
                "linear-gradient(135deg,#EFF6FF 0%,#F8FBFF 100%)",

              border:
                "1px solid #BFDBFE",

              borderRadius: "15px",

              display: "flex",
              flexDirection: "column",

              boxShadow:
                "0 2px 6px rgba(15,23,42,0.02)",
            }}
          >
            {/* CORNER CIRCLE */}

            <div
              style={{
                position: "absolute",

                width: "54px",
                height: "54px",

                right: "-18px",
                top: "-18px",

                borderRadius: "50%",

                background:
                  "rgba(219,234,254,0.92)",

                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 1,

                color: "#0F172A",

                fontSize: "14px",
                lineHeight: 1,

                fontWeight: 800,
              }}
            >
              {day}
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 1,

                flex: 1,

                display: "flex",
                flexDirection: "column",

                alignItems: "center",
                justifyContent: "center",

                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "13px",
                  height: "13px",

                  marginBottom: "8px",

                  borderRadius: "50%",

                  background: "#2563EB",

                  boxShadow:
                    "inset 0 -2px 3px rgba(15,23,42,0.12)",
                }}
              />

              <div
                style={{
                  color: "#2563EB",

                  fontSize: "10px",
                  lineHeight: 1.3,

                  fontWeight: 800,
                }}
              >
                Feedback Pending
              </div>
            </div>
          </div>
        );
      }

      /* =================================================
         COMPREHENSION RESULT
      ================================================= */

      const stateBackground =
        isUnderstood
          ? "linear-gradient(135deg,#F0FDF4 0%,#F8FFF9 100%)"
          : isPartial
          ? "linear-gradient(135deg,#FFFBEB 0%,#FFFDF5 100%)"
          : "linear-gradient(135deg,#FEF2F2 0%,#FFF9F9 100%)";

      const stateBorder =
        isUnderstood
          ? "#BBF7D0"
          : isPartial
          ? "#FDE68A"
          : "#FECACA";

      const stateColor =
        isUnderstood
          ? "#16A34A"
          : isPartial
          ? "#CA8A04"
          : "#DC2626";

      const stateCircle =
        isUnderstood
          ? "rgba(220,252,231,0.90)"
          : isPartial
          ? "rgba(254,243,199,0.90)"
          : "rgba(254,226,226,0.90)";

      const stateLabel =
        isUnderstood
          ? "Most Students Understood"
          : isPartial
          ? "Partially Understood"
          : "Students Struggled";

      return (
        <div
          key={day}
          style={{
            position: "relative",

            overflow: "hidden",

            minHeight: "116px",

            padding: "14px",

            boxSizing: "border-box",

            background: stateBackground,

            border:
              `1px solid ${stateBorder}`,

            borderRadius: "15px",

            display: "flex",
            flexDirection: "column",

            boxShadow:
              "0 2px 6px rgba(15,23,42,0.02)",
          }}
        >
          {/* DECORATIVE CORNER */}

          <div
            style={{
              position: "absolute",

              width: "54px",
              height: "54px",

              right: "-18px",
              top: "-18px",

              borderRadius: "50%",

              background: stateCircle,

              pointerEvents: "none",
            }}
          />

          {/* DAY */}

          <div
            style={{
              position: "relative",
              zIndex: 1,

              color: "#0F172A",

              fontSize: "14px",
              lineHeight: 1,

              fontWeight: 800,
            }}
          >
            {day}
          </div>

          {/* RESULT */}

          <div
            style={{
              position: "relative",
              zIndex: 1,

              flex: 1,

              display: "flex",
              flexDirection: "column",

              alignItems: "center",
              justifyContent: "center",

              textAlign: "center",

              paddingTop: "4px",
            }}
          >
            {/* STATUS DOT */}

            <div
              style={{
                width: "14px",
                height: "14px",

                marginBottom: "7px",

                borderRadius: "50%",

                background:
                  getDotColor(day),

                border:
                  "1px solid rgba(15,23,42,0.08)",

                boxShadow:
                  "inset 0 -2px 3px rgba(15,23,42,0.12)",
              }}
            />

            {/* HEALTH SCORE */}

            {score !== null && (
              <div
                style={{
                  color: stateColor,

                  fontSize: "18px",
                  lineHeight: 1,

                  fontWeight: 800,

                  letterSpacing: "-0.3px",
                }}
              >
                {score}%
              </div>
            )}

            {/* STATUS */}

            <div
              style={{
                marginTop: "6px",

                color: stateColor,

                fontSize: "9px",
                lineHeight: 1.25,

                fontWeight: 800,
              }}
            >
              {stateLabel}
            </div>
          </div>
        </div>
      );
    })}
  </div>

  {/* =====================================================
      LEGEND
     ===================================================== */}

  <div
    style={{
      position: "relative",
      zIndex: 1,

      display: "flex",

      alignItems: "center",

      flexWrap: "wrap",

      gap: "18px",

      marginTop: "18px",
    }}
  >
    {/* UNDERSTOOD */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",

        color: "#64748B",

        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "9px",
          height: "9px",

          borderRadius: "50%",

          background: "#22C55E",
        }}
      />

      Most Students Understood
    </div>

    {/* PARTIAL */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",

        color: "#64748B",

        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "9px",
          height: "9px",

          borderRadius: "50%",

          background: "#F59E0B",
        }}
      />

      Partially Understood
    </div>

    {/* STRUGGLED */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",

        color: "#64748B",

        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "9px",
          height: "9px",

          borderRadius: "50%",

          background: "#EF4444",
        }}
      />

      Students Struggled
    </div>

    {/* PENDING */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",

        color: "#64748B",

        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "9px",
          height: "9px",

          borderRadius: "50%",

          background: "#2563EB",
        }}
      />

      Feedback Pending
    </div>

    {/* NO LECTURE */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",

        color: "#64748B",

        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "9px",
          height: "9px",

          borderRadius: "50%",

          background: "#FDBA74",
        }}
      />

      No Lecture Conducted
    </div>
  </div>
</div>

    {/* =====================================================
        MONTHLY SUMMARY
       ===================================================== */}

    <div style={sectionCardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            TEACHING INTELLIGENCE
          </div>

          <h2 style={sectionTitleStyle}>
            Monthly Health Summary
          </h2>

          <p style={sectionDescriptionStyle}>
            A snapshot of classroom
            comprehension performance across
            the selected month.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          CLASSROOM HEALTH LEDGER
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "12px",
          marginTop: "18px",
        }}
      >
        <AnalyticsCard
          eyebrow="STRONG COMPREHENSION"
          title="Excellent Days"
          value={String(
            summary.green
          )}
          description={`Average Score : ${getAverageScoreByColor(
            "#DCFCE7"
          )}%`}
          background="#F0FDF4"
          border="#BBF7D0"
          color="#16A34A"
        />

        <AnalyticsCard
          eyebrow="MODERATE COMPREHENSION"
          title="Average Days"
          value={String(
            summary.yellow
          )}
          description={`Average Score : ${getAverageScoreByColor(
            "#FEF3C7"
          )}%`}
          background="#FFFBEB"
          border="#FDE68A"
          color="#CA8A04"
        />

        <AnalyticsCard
          eyebrow="LEARNING ATTENTION"
          title="Needs Support"
          value={String(
            summary.red
          )}
          description={`Average Score : ${getAverageScoreByColor(
            "#FEE2E2"
          )}%`}
          background="#FEF2F2"
          border="#FECACA"
          color="#DC2626"
        />

        <AnalyticsCard
          eyebrow="AWAITING RESPONSES"
          title="Feedback Pending"
          value={String(
            summary.blue
          )}
          description="Feedback not yet submitted."
          background="#EFF6FF"
          border="#BFDBFE"
          color="#2563EB"
        />
      </div>

      <div
        style={{
          marginTop: "14px",
          padding: "11px 14px",
          background: "#F8FAFC",
          border: "1px solid #E2E8F0",
          borderRadius: "12px",
          color: "#64748B",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        Calendar reflects classroom
        comprehension based on student
        feedback for the selected month.
      </div>
    </div>

    {/* =====================================================
        CLASSROOM COMPARISON
       ===================================================== */}

    <div style={sectionCardStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            BEYOND THE CLASSROOM
          </div>

          <h2 style={sectionTitleStyle}>
            Overall Classroom Performance
            Comparison
          </h2>

          <p style={sectionDescriptionStyle}>
            Compare every classroom taught
            by you during the selected month.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          TEACHING PERFORMANCE LEDGER
        </div>
      </div>

      {overallClassroomComparison.length >
      0 ? (
        <div
          style={{
            overflowX: "auto",
            paddingBottom: "3px",
          }}
        >
          <div
            style={{
              minWidth:
                overallClassroomComparison.length >
                4
                  ? "900px"
                  : "100%",
            }}
          >
            {/* CLASSROOM HEADER */}

            <div
              style={{
                display: "grid",

                gridTemplateColumns: `190px repeat(${overallClassroomComparison.length}, minmax(120px, 1fr))`,

                gap: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  color: "#94A3B8",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing:
                    "0.8px",
                }}
              >
                PERFORMANCE METRIC
              </div>

              {overallClassroomComparison.map(
                (item: any) => (
                  <div
                    key={
                      item.classroom
                    }
                    style={
                      comparisonHeaderStyle
                    }
                  >
                    <div
                      style={{
                        color:
                          "#F97316",
                        fontSize:
                          "11px",
                        fontWeight:
                          800,
                        letterSpacing:
                          "0.8px",
                        marginBottom:
                          "3px",
                      }}
                    >
                      CLASSROOM
                    </div>

                    <div
                      style={{
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {
                        item.classroom
                      }
                    </div>
                  </div>
                )
              )}
            </div>

            <ComparisonRow
              title="Average Student Understanding %"
              data={overallClassroomComparison.map(
                (item: any) =>
                  `${item.averageHealthScore}%`
              )}
            />

            <ComparisonRow
              title="Average Doubt %"
              data={overallClassroomComparison.map(
                (item: any) =>
                  `${item.averageDoubtPercentage}%`
              )}
            />

            <ComparisonRow
              title="Average Feedback %"
              data={overallClassroomComparison.map(
                (item: any) =>
                  `${item.averageFeedbackPercentage}%`
              )}
            />

            <ComparisonRow
              title="Low Understanding Student %"
              data={overallClassroomComparison.map(
                (item: any) =>
                  String(
                    item.studentsAtRisk
                  )
              )}
            />
          </div>
        </div>
      ) : (
        <div style={emptyStateStyle}>
          <div
            style={{
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
              borderRadius: "13px",
              background: "#FFF7ED",
              border:
                "1px solid #FED7AA",
              color: "#F97316",
              fontSize: "21px",
            }}
          >
            ◇
          </div>

          <div
            style={{
              color: "#0F172A",
              fontSize: "16px",
              fontWeight: 800,
            }}
          >
            No comparison data available
          </div>

          <div
            style={{
              marginTop: "4px",
              color: "#64748B",
              fontSize: "14px",
            }}
          >
            Classroom intelligence will
            appear here when data is
            available for the selected
            month.
          </div>
        </div>
      )}
    </div>
  </div>
);
}


/* -------------------------------- */

function Legend(props: any) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",

        padding: "7px 10px",

        background: props.color,

        border:
          "1px solid rgba(148, 163, 184, 0.22)",

        borderRadius: "999px",

        color: "#475569",

        fontSize: "13px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "7px",
          height: "7px",

          flexShrink: 0,

          borderRadius: "50%",

          background:
            props.dot ||
            props.color,
        }}
      />

      {props.label}
    </div>
  );
}


/* -------------------------------- */

function AnalyticsCard(props: any) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",

        minHeight: "108px",
        padding: "14px 16px",

        background: `linear-gradient(
          135deg,
          ${props.background} 0%,
          #FFFFFF 145%
        )`,

        border: `1px solid ${props.border}`,
        borderRadius: "16px",

        boxSizing: "border-box",
      }}
    >
      {/* TOP-RIGHT DECORATIVE ARC */}

      <div
        style={{
          position: "absolute",

          width: "78px",
          height: "78px",

          right: "-27px",
          top: "-31px",

          borderRadius: "50%",

          background: props.color,
          opacity: 0.055,

          pointerEvents: "none",
        }}
      />

      {/* CONTENT */}

      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* LABEL */}

        <div
          style={{
            color: props.color,

            fontSize: "10px",
            fontWeight: 800,

            letterSpacing: "0.65px",
            textTransform: "uppercase",

            marginBottom: "9px",
          }}
        >
          {props.eyebrow}
        </div>

        {/* VALUE */}

        <div
          style={{
            color: props.color,

            fontSize: "31px",
            lineHeight: 1,

            fontWeight: 800,
            letterSpacing: "-0.6px",
          }}
        >
          {props.value}
        </div>

        {/* TITLE */}

        <div
          style={{
            marginTop: "9px",

            color: "#0F172A",

            fontSize: "14px",
            lineHeight: 1.25,

            fontWeight: 800,
          }}
        >
          {props.title}
        </div>

        {/* DESCRIPTION */}

        <div
          style={{
            marginTop: "5px",

            color: "#475569",

            fontSize: "11px",
            fontWeight: 600,

            lineHeight: 1.35,
          }}
        >
          {props.description}
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   PAGE STYLES
   ========================================================= */

const heroStyle = {
  position: "relative",
  overflow: "hidden",

  marginBottom: "18px",

  padding: "26px 28px",

  background:
    "linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 72%, #FFF9F3 100%)",

  border: "1px solid #E2E8F0",

  borderRadius: "24px",

  boxShadow:
    "0 10px 30px rgba(15, 23, 42, 0.045)",
} as const;


const heroOrangeCircle = {
  position: "absolute",

  width: "180px",
  height: "180px",

  right: "-60px",
  top: "-85px",

  borderRadius: "50%",

  background:
    "rgba(249, 115, 22, 0.06)",

  pointerEvents: "none",
} as const;


const heroSoftCircle = {
  position: "absolute",

  width: "95px",
  height: "95px",

  right: "120px",
  top: "-50px",

  borderRadius: "50%",

  background:
    "rgba(249, 115, 22, 0.035)",

  pointerEvents: "none",
} as const;


const heroBlueCircle = {
  position: "absolute",

  width: "150px",
  height: "150px",

  right: "180px",
  bottom: "-105px",

  borderRadius: "50%",

  background:
    "rgba(37, 99, 235, 0.04)",

  pointerEvents: "none",
} as const;


const heroBadgeStyle = {
  width: "82px",
  height: "82px",

  flexShrink: 0,

  display: "flex",
  flexDirection: "column",

  alignItems: "center",
  justifyContent: "center",

  background:
    "linear-gradient(145deg, #FFF8F1 0%, #FFFFFF 100%)",

  border: "1px solid #FED7AA",

  borderRadius: "22px",

  color: "#0F172A",

  boxShadow:
    "0 8px 20px rgba(249, 115, 22, 0.07)",
} as const;


const eyebrowStyle = {
  color: "#F97316",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "1.6px",

  textTransform:
    "uppercase" as const,
};


const orangePillStyle = {
  padding: "6px 10px",

  background: "#FFF7ED",

  border: "1px solid #FED7AA",

  borderRadius: "999px",

  color: "#C2410C",

  fontSize: "11px",
  fontWeight: 800,

  letterSpacing: "0.6px",
} as const;


const bluePillStyle = {
  padding: "6px 10px",

  background: "#EFF6FF",

  border: "1px solid #BFDBFE",

  borderRadius: "999px",

  color: "#1D4ED8",

  fontSize: "11px",
  fontWeight: 800,

  letterSpacing: "0.6px",
} as const;


const sectionCardStyle = {
  position: "relative",

  marginBottom: "18px",

  padding: "20px",

  background: "#FFFFFF",

  border: "1px solid #E2E8F0",

  borderRadius: "20px",

  boxShadow:
    "0 7px 24px rgba(15, 23, 42, 0.035)",
} as const;


const sectionTitleStyle = {
  margin: "6px 0 0",

  color: "#0F172A",

  fontSize: "21px",
  fontWeight: 800,

  letterSpacing: "-0.3px",
} as const;


const sectionDescriptionStyle = {
  margin: "5px 0 0",

  color: "#64748B",

  fontSize: "14px",

  lineHeight: 1.55,
} as const;


const fieldLabelStyle = {
  marginBottom: "6px",

  color: "#64748B",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "0.8px",
} as const;


const dropdownStyle = {
  width: "100%",

  padding: "11px 12px",

  background: "#F8FAFC",

  border: "1px solid #CBD5E1",

  borderRadius: "11px",

  color: "#0F172A",

  fontSize: "15px",
  fontWeight: 600,

  outline: "none",

  boxSizing:
    "border-box" as const,
};


const calendarBadgeStyle = {
  display: "flex",

  alignItems: "center",

  gap: "9px",

  flexShrink: 0,

  padding: "9px 12px",

  background:
    "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)",

  border: "1px solid #FED7AA",

  borderRadius: "13px",

  color: "#F97316",
} as const;



const ledgerLabelStyle = {
  color: "#94A3B8",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "1px",

  whiteSpace:
    "nowrap" as const,
};


const comparisonHeaderStyle = {
  padding: "11px 10px",

  background:
    "linear-gradient(135deg, #0F172A 0%, #172554 100%)",

  borderRadius: "11px",

  color: "#FFFFFF",

  textAlign:
    "center" as const,

  fontSize: "14px",

  fontWeight: 800,
};


const emptyStateStyle = {
  padding: "32px 20px",

  background: "#F8FAFC",

  border: "1px dashed #CBD5E1",

  borderRadius: "16px",

  textAlign:
    "center" as const,
};


/* =========================================================
   CLASSROOM COMPARISON ROW
   ========================================================= */

function ComparisonRow(props: any) {
  return (
    <div
      style={{
        display: "grid",

        gridTemplateColumns: `190px repeat(${props.data.length}, minmax(120px, 1fr))`,

        gap: "6px",

        marginTop: "6px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",

          minHeight: "45px",

          padding: "10px 12px",

          background:
            "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)",

          border:
            "1px solid #FED7AA",

          borderRadius: "11px",

          color: "#7C2D12",

          fontWeight: 700,

          fontSize: "13px",

          lineHeight: 1.35,
        }}
      >
        {props.title}
      </div>

      {props.data.map(
        (
          item: string,
          index: number
        ) => (
          <div
            key={index}
            style={{
              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              minHeight: "45px",

              padding:
                "10px 12px",

              background:
                "#F8FAFC",

              border:
                "1px solid #E2E8F0",

              borderRadius:
                "11px",

              color:
                "#0F172A",

              fontWeight: 800,

              fontSize: "15px",

              textAlign:
                "center",
            }}
          >
            {item}
          </div>
        )
      )}
    </div>
  );
}


/* -------------------------------- */
