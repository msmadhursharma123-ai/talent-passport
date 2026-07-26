
import { useEffect, useState } from "react";

import {
  getSubjectsByClass,
} from "../data/academicMasterRepository";

import {
  requireIdentity,
} from "../services/identityService";

import {
getStudentMonthlyLectureLogs,
} from "../data/studentGrowthPlanRepository";


export default function ContinuousCalendar() {

const identity =
requireIdentity();

const [selectedSubject,setSelectedSubject]
=
useState("");

const [selectedMonth, setSelectedMonth] =
  useState("July 2026");

  const [selectedWeek, setSelectedWeek] =
    useState("Entire Month");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

const [subjects, setSubjects] =
useState<string[]>([]);

const [

selectedDayTopics,

setSelectedDayTopics

]

=

useState<any[]>([]);


const [

showTopicsModal,

setShowTopicsModal

]

=

useState(false);

const [lectureLogs,setLectureLogs]
=
useState<any[]>([]);


useEffect(() => {

loadSubjects();

loadLectureLogs();

},[]);

async function loadLectureLogs(){

const logs =
await getStudentMonthlyLectureLogs();

setLectureLogs(
logs
);

}

const filteredLogs =
lectureLogs.filter((log)=>{


/* SUBJECT FILTER */

if(

selectedSubject &&

log.subject_name !==
selectedSubject

){

return false;

}


/* MONTH FILTER */


const logDate = new Date(log.log_date);

const logMonthYear =
  logDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

if (selectedMonth !== logMonthYear) {
  return false;
}


/* CUSTOM DATE */


if(

selectedWeek ===
"Custom Date Selection"

){

if(

fromDate &&
toDate

){

const current =
new Date(
log.log_date
);

if(

current <
new Date(fromDate)

||

current >
new Date(toDate)

){

return false;

}

}


}


/* WEEK FILTER */


if(

selectedWeek ===
"Week 1"

){

const day =
new Date(
log.log_date
).getDate();

if(day>7){

return false;

}

}


if(
selectedWeek==="Week 2"
){

const day =
new Date(
log.log_date
).getDate();

if(day<8||day>14){

return false;

}

}



if(
selectedWeek==="Week 3"
){

const day =
new Date(
log.log_date
).getDate();

if(day<15||day>21){

return false;

}

}


if(
selectedWeek==="Week 4"
){

const day =
new Date(
log.log_date
).getDate();

if(day<22||day>28){

return false;

}

}


if(
selectedWeek==="Week 5"
){

const day =
new Date(
log.log_date
).getDate();

if(day<29){

return false;

}

}


return true;


})

.sort(


(a,b)=>

new Date(
a.log_date
).getTime()

-

new Date(
b.log_date
).getTime()

);

console.log(filteredLogs);

const selectedMonthDate =
  new Date(`${selectedMonth} 1`);

const selectedYear =
  selectedMonthDate.getFullYear();

const selectedMonthIndex =
  selectedMonthDate.getMonth();

const totalDays =
  new Date(
    selectedYear,
    selectedMonthIndex + 1,
    0
  ).getDate();

const subjectTeacher =

filteredLogs.find(
(item) =>
item.subject_name === selectedSubject
);


const teacherName =

subjectTeacher?.teacher_name ??
"Not Available";

function loadSubjects() {

  if (!identity.className) {
    return;
  }

  const subjectList =
    getSubjectsByClass(
      identity.className
    );

setSubjects(subjectList);

if(subjectList.length > 0){

setSelectedSubject(
subjectList[0]
);

}

}

  return (
    <div className="space-y-6">
   {/* =========================================================
    CONTINUOUS CALENDAR HERO
========================================================= */}

<div
  className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-8 py-7 shadow-sm"
  style={{
    background:
      "linear-gradient(135deg,#FFFFFF 0%,#FFFFFF 70%,#FFF7ED 100%)",
  }}
>

  {/* Decorative background circles */}

  <div
    className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full"
    style={{
      background: "rgba(255,237,213,0.55)",
    }}
  />

  <div
    className="pointer-events-none absolute right-[300px] -bottom-24 h-44 w-44 rounded-full"
    style={{
      background: "rgba(239,246,255,0.8)",
    }}
  />


  <div className="relative z-10 flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">


    {/* =====================================================
        LEFT — PAGE IDENTITY
    ===================================================== */}

    <div className="min-w-0 flex-1">

      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">
        Student Academic Continuity
      </p>

      <h1 className="mt-3 text-[30px] font-black leading-tight text-slate-900 md:text-[34px]">
        Continuous Calendar
      </h1>

      <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
        Review your classroom teaching history, covered topics and
        academic continuity across the school year.
      </p>

    </div>


    {/* =====================================================
        RIGHT — FILTERS
    ===================================================== */}

    <div className="flex flex-wrap items-end gap-3">


      {/* SUBJECT */}

      <div>

        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
          Subject
        </p>

        <select
          value={selectedSubject}
          onChange={(e) =>
            setSelectedSubject(e.target.value)
          }
          className="h-11 w-48 rounded-xl border border-orange-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-400"
        >

          {subjects.map((subject) => (

            <option
              key={subject}
              value={subject}
            >
              {subject}
            </option>

          ))}

        </select>

      </div>


      {/* MONTH */}

      <div>

        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
          Month
        </p>

        <select
          value={selectedMonth}
          onChange={(e) =>
            setSelectedMonth(e.target.value)
          }
          className="h-11 w-44 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-400"
        >

          <option value="July 2026">
            July 2026
          </option>

          <option value="August 2026">
            August 2026
          </option>

          <option value="September 2026">
            September 2026
          </option>

          <option value="October 2026">
            October 2026
          </option>

          <option value="November 2026">
            November 2026
          </option>

          <option value="December 2026">
            December 2026
          </option>

          <option value="January 2027">
            January 2027
          </option>

          <option value="February 2027">
            February 2027
          </option>

          <option value="March 2027">
            March 2027
          </option>

          <option value="April 2027">
            April 2027
          </option>

        </select>

      </div>


      {/* WEEK */}

      <div>

        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
          Week
        </p>

        <select
          value={selectedWeek}
          onChange={(e) =>
            setSelectedWeek(e.target.value)
          }
          className="h-11 w-44 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-400"
        >

          <option>
            Entire Month
          </option>

          <option>
            Week 1
          </option>

          <option>
            Week 2
          </option>

          <option>
            Week 3
          </option>

          <option>
            Week 4
          </option>

          <option>
            Week 5
          </option>

          <option>
            Custom Date Selection
          </option>

        </select>

      </div>


      {/* PAGE ICON */}

      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-200 bg-white text-xl shadow-sm"
        title="Continuous Calendar"
      >
        📅
      </div>

    </div>

  </div>

</div>

{
  selectedWeek === "Custom Date Selection" && (

    <div className="rounded-3xl bg-white p-6 shadow-sm">

      <h2 className="text-lg font-bold text-slate-800">
        Custom Date Selection
      </h2>

      <p className="mt-2 text-slate-500">
        Select your preferred date range to review
        classroom activities and lecture logs.
      </p>

      <div className="mt-6 flex flex-wrap gap-5">

        <div>

          <p className="mb-2 font-medium text-slate-700">
            From Date
          </p>

          <input
            type="date"
            value={fromDate}
            onChange={(e) =>
              setFromDate(e.target.value)
            }
            className="rounded-xl border border-gray-300 px-4 py-3"
          />

        </div>


        <div>

          <p className="mb-2 font-medium text-slate-700">
            To Date
          </p>

          <input
            type="date"
            value={toDate}
            onChange={(e) =>
              setToDate(e.target.value)
            }
            className="rounded-xl border border-gray-300 px-4 py-3"
          />

        </div>

      </div>

    </div>

  )
}

{/* =========================================================
    ASSIGNED SUBJECT FACILITATOR
========================================================= */}

<div
  className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
>

  <div
    className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full"
    style={{
      background: "rgba(239,246,255,0.8)",
    }}
  />


  {/* SECTION HEADER */}

  <div className="relative z-10 flex items-start justify-between gap-4">

    <div>

      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
        Classroom Academic Connection
      </p>

      <h2 className="mt-2 text-xl font-black text-slate-900">
        Assigned Subject Facilitator
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Your assigned facilitator for the currently selected subject.
      </p>

    </div>


    <div className="hidden rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-blue-600 md:block">
      Academic Session 2026–2027
    </div>

  </div>


  {/* FACILITATOR CARD */}

  <div
    className="relative z-10 mt-6 flex flex-col gap-4 rounded-2xl border border-blue-200 px-6 py-5 md:flex-row md:items-center md:justify-between"
    style={{
      background:
        "linear-gradient(135deg,#EFF6FF,#FFFFFF)",
    }}
  >

    <div className="flex items-center gap-4">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200 bg-white text-xl shadow-sm">
        👨‍🏫
      </div>


      <div>

        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-600">
          Subject Facilitator
        </p>

        <h3 className="mt-1 text-lg font-black text-slate-900">
          {teacherName}
        </h3>

        <p className="mt-1 text-sm font-semibold text-slate-500">
          {selectedSubject} Subject Facilitator
        </p>

      </div>

    </div>


    <div className="rounded-xl border border-blue-200 bg-white px-5 py-3">

      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        Academic Session
      </p>

      <p className="mt-1 text-sm font-black text-blue-600">
        2026–2027
      </p>

    </div>

  </div>

</div>

{/* =========================================================
    CONTINUOUS CLASSROOM CALENDAR
========================================================= */}

<div
  className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
>

  <div
    className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full"
    style={{
      background: "rgba(255,247,237,0.9)",
    }}
  />

<div className="relative z-10 flex items-start justify-between gap-5">

  <div>

    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
      Learning Continuity
    </p>

    <h2 className="mt-2 text-xl font-black text-slate-900">
      See Your Classroom Calendar
    </h2>

    <p className="mt-2 text-sm leading-6 text-slate-500">
      Review lectures, topics, pages and classroom activity
      recorded throughout the selected month.
    </p>

  </div>


  <div className="hidden rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-orange-600 md:block">
    Monthly Learning Ledger
  </div>

</div>


{/* =========================================================
    WEEK DAYS
========================================================= */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gap: 12,
    marginTop: 30,
    marginBottom: 12,
  }}
>
  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
    (day) => (
      <div
        key={day}
        style={{
          textAlign: "center",
          fontWeight: 800,
          fontSize: 11,
          letterSpacing: 1.2,
          color: "#64748B",
        }}
      >
        {day}
      </div>
    )
  )}
</div>


{/* =========================================================
    CALENDAR GRID
========================================================= */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gap: 12,
  }}
>
  {Array.from({ length: totalDays }).map((_, index) => {

    const day = index + 1;

    const logsForDay =
      filteredLogs.filter((item) => {

        const currentDate =
          new Date(item.log_date);

        return (
          currentDate.getDate() === day
        );

      });


    const visibleTopics =
      logsForDay.slice(0, 1);

    const remainingTopics =
      logsForDay.length - 1;


    /* =====================================================
       EMPTY DAY
    ===================================================== */

    if (logsForDay.length === 0) {

      return (

        <div
          key={day}
          style={{
            position: "relative",
            overflow: "hidden",

            minHeight: 116,

            padding: "14px 14px",

            borderRadius: 15,

            border:
              "1px solid #FDBA74",

            background:
              "linear-gradient(135deg,#FFF9EF 0%,#FFFCF7 100%)",

            display: "flex",
            flexDirection: "column",

            boxShadow:
              "0 2px 6px rgba(15,23,42,0.02)",
          }}
        >

          {/* TOP RIGHT DECORATIVE CIRCLE */}

          <div
            style={{
              position: "absolute",

              width: 54,
              height: 54,

              borderRadius: "50%",

              right: -18,
              top: -18,

              background:
                "rgba(255,237,213,0.75)",

              pointerEvents: "none",
            }}
          />


          {/* DATE */}

          <div
            style={{
              position: "relative",
              zIndex: 1,

              fontWeight: 800,
              fontSize: 14,

              lineHeight: 1,

              color: "#0F172A",
            }}
          >
            {day}
          </div>


          {/* EMPTY STATE */}

          <div
            style={{
              position: "relative",
              zIndex: 1,

              flex: 1,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              paddingBottom: 3,
            }}
          >

            <p
              style={{
                margin: 0,

                textAlign: "center",

                fontSize: 10,
                lineHeight: 1.3,

                color: "#EA580C",

                fontWeight: 800,
              }}
            >
              No Lecture Conducted
            </p>

          </div>

        </div>

      );

    }


    /* =====================================================
       LECTURE CONDUCTED
    ===================================================== */

    return (

      <div
        key={day}
        style={{
          position: "relative",
          overflow: "hidden",

          minHeight: 116,

          padding: "14px 14px",

          borderRadius: 15,

          border:
            "1px solid #BBF7D0",

          background:
            "linear-gradient(135deg,#F0FDF4 0%,#F8FFF9 100%)",

          boxShadow:
            "0 2px 6px rgba(34,197,94,0.03)",
        }}
      >

        {/* TOP RIGHT DECORATIVE CIRCLE */}

        <div
          style={{
            position: "absolute",

            width: 54,
            height: 54,

            borderRadius: "50%",

            right: -18,
            top: -18,

            background:
              "rgba(220,252,231,0.8)",

            pointerEvents: "none",
          }}
        />


        {/* DATE */}

        <div
          style={{
            position: "relative",
            zIndex: 1,

            fontWeight: 800,
            fontSize: 14,

            lineHeight: 1,

            color: "#0F172A",

            marginBottom: 13,
          }}
        >
          {day}
        </div>


        {/* TOPIC */}

        {visibleTopics.map((topic) => (

          <div
            key={topic.id}
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >

            <div
              style={{
                display: "inline-flex",

                maxWidth: "100%",

                padding: "5px 8px",

                borderRadius: 10,

                background:
                  "#DCFCE7",

                color:
                  "#15803D",

                fontWeight: 800,

                fontSize: 10,

                marginBottom: 8,

                overflow: "hidden",

                textOverflow: "ellipsis",

                whiteSpace: "nowrap",
              }}
            >
              {topic.topic_name}
            </div>


            <p
              style={{
                margin: 0,

                fontSize: 10,

                fontWeight: 600,

                color: "#64748B",
              }}
            >
              Pages: {topic.page_from}–{topic.page_to}
            </p>

          </div>

        ))}


        {/* MULTIPLE TOPICS */}

        {remainingTopics > 0 && (

          <button
            type="button"

            onClick={() => {

              setSelectedDayTopics(
                logsForDay
              );

              setShowTopicsModal(
                true
              );

            }}

            style={{
              position: "relative",
              zIndex: 1,

              marginTop: 8,

              padding: 0,

              border: "none",

              background:
                "transparent",

              color:
                "#2563EB",

              fontSize: 10,

              fontWeight: 800,

              cursor:
                "pointer",
            }}
          >
            View All Topics ({logsForDay.length}) →
          </button>

        )}


        {/* HOMEWORK */}

        <div
          style={{
            position: "relative",
            zIndex: 1,

            marginTop: 8,

            fontSize: 10,

            color: "#64748B",
          }}
        >
          Homework:{" "}

          <strong
            style={{
              color: "#334155",
            }}
          >
            {logsForDay.some(
              (item) =>
                item.homework_given
            )
              ? "Yes"
              : "No"}
          </strong>

        </div>

      </div>

    );

  })}

</div>

</div>

{

showTopicsModal && (

<div
style={{
background:"linear-gradient(135deg,#EEF7FF,#F8FAFF)",
border:"1px solid #BFDBFE",
borderRadius:20,
marginTop:28,
padding:"22px 28px",
display:"flex",
justifyContent:"space-between",
alignItems:"center"
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

TOPICS COVERED

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

{index+1}. {topic.topic_name}

</h3>


<p>

Pages :

{topic.page_from}

-

{topic.page_to}

</p>


<p>

Homework :

{" "}

{topic.homework_given
? "Yes"
: "No"}

</p>


<p>

Activity :

{" "}

{topic.activity_conducted
? "Yes"
: "No"}

</p>


{

topic.teacher_notes && (

<p>

Teacher Notes :

{" "}

{topic.teacher_notes}

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

</div>

);

}
