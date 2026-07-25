
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

const calendarLectureBox = {

background:"#F7FFF8",

border:
"1px solid #BBF7D0",

borderRadius:24,

padding:18,

minHeight:150,

boxShadow:
"0px 4px 15px rgba(34,197,94,0.06)"

} as const;



const emptyCalendarBox = {

background:"#FFFDF3",

border:"1px solid #FDE68A",

borderRadius:24,

padding:18,

minHeight:130,

display:"flex",

flexDirection:"column" as const,

alignItems:"center",

} as const;


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
      {/* Header */}

     <div className="rounded-3xl bg-[#07142D] px-8 py-5 text-white shadow-lg">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
         
        </p>

    <div className="mt-2 flex items-center justify-between gap-10">

  {/* LEFT */}

  <div className="flex-1">

    <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
      Doubt Diary & Syllabus Alignment
    </p>

    <h1 className="mt-2 text-[38px] font-black uppercase leading-tight">
      Continuous Calendar
    </h1>

  </div>

  {/* RIGHT */}

  <div className="flex items-end gap-4">

    {/* SUBJECT */}

    <div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
        Subject
      </p>

      <select
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
        className="h-12 w-56 rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white outline-none"
      >
        {subjects.map((subject) => (

          <option
            key={subject}
            value={subject}
            className="text-black"
          >
            {subject}
          </option>

        ))}
      </select>

    </div>

    {/* MONTH */}

    <div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
        Month
      </p>

<select
  value={selectedMonth}
  onChange={(e) => setSelectedMonth(e.target.value)}
  className="h-12 w-44 rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white outline-none"
>

  <option value="July 2026" className="text-black">
    July 2026
  </option>

  <option value="August 2026" className="text-black">
    August 2026
  </option>

  <option value="September 2026" className="text-black">
    September 2026
  </option>

  <option value="October 2026" className="text-black">
    October 2026
  </option>

  <option value="November 2026" className="text-black">
    November 2026
  </option>

  <option value="December 2026" className="text-black">
    December 2026
  </option>

  <option value="January 2027" className="text-black">
    January 2027
  </option>

  <option value="February 2027" className="text-black">
    February 2027
  </option>

  <option value="March 2027" className="text-black">
    March 2027
  </option>

  <option value="April 2027" className="text-black">
    April 2027
  </option>

</select>

    </div>

    {/* WEEK FILTER */}

    <div>

      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
        Week
      </p>

      <select
        value={selectedWeek}
        onChange={(e) => setSelectedWeek(e.target.value)}
        className="h-12 w-48 rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white outline-none"
      >

        <option className="text-black">
          Entire Month
        </option>

        <option className="text-black">
          Week 1
        </option>

        <option className="text-black">
          Week 2
        </option>

        <option className="text-black">
          Week 3
        </option>

        <option className="text-black">
          Week 4
        </option>

        <option className="text-black">
          Week 5
        </option>

        <option className="text-black">
          Custom Date Selection
        </option>

      </select>

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

{/* Teacher Card */}

<div className="rounded-3xl bg-white p-8 shadow-sm">

  <h2 className="mb-6 text-xl font-bold uppercase text-slate-800">
    Assigned Subject Facilitator
  </h2>

  <div
    style={{
      background:"linear-gradient(135deg,#EEF7FF,#F8FAFF)",
      border:"1px solid #BFDBFE",
      borderRadius:20,
      padding:"22px 28px",
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center"
    }}
  >

<h2
style={{
fontSize:"22px",
fontWeight:800,
color:"#0F172A",
margin:0
}}
>
{teacherName}
</h2>

<p
style={{
marginTop:6,
fontWeight:600,
fontSize:15,
color:"#64748B"
}}
>
{selectedSubject} Subject Facilitator
</p>

<div
style={{
background:"#2563EB",
color:"white",
padding:"10px 18px",
borderRadius:14,
fontWeight:700,
fontSize:14
}}
>

Academic Session

<br/>

2026–2027

</div>

</div>
      </div>

     {/* CONTINUOUS CLASSROOM CALENDAR */}

<div
style={{
background:"white",
padding:24,
borderRadius:28,
marginTop:30,
}}
>

<h2
style={{
fontSize:"20px",
fontWeight:600,
color:"#04122F",
marginBottom:12,
}}
>

Continuous Classroom Calendar

</h2>


<p
style={{
marginTop:0,
color:"#64748B",
fontSize:"16px",
fontWeight:500,
}}
>

View all lectures conducted during the selected month.

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
fontSize:15,
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


<div
style={{
display:"grid",
gridTemplateColumns:"repeat(7,1fr)",
gap:12,
}}
>

{

Array.from({ length: totalDays }).map((_,index)=>{

const day = index + 1;


const logsForDay =

filteredLogs.filter((item)=>{

const currentDate =
new Date(item.log_date);

return(

currentDate.getDate() === day

);

});


const visibleTopics =
logsForDay.slice(0,1);


const remainingTopics =
logsForDay.length - 1;



if(logsForDay.length===0){

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
marginBottom:0,
width:"100%",
textAlign:"center",
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
style={calendarLectureBox}
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

<div key={topic.id}>


<div
style={{

display:"inline-flex",
padding:"6px 10px",
borderRadius:14,
background:"#DCFCE7",
color:"#15803D",
fontWeight:700,
fontSize:12,
marginBottom:12,

}}
>

{topic.topic_name}

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

{topic.page_from}

-

{topic.page_to}

</p>


</div>

))

}



{

remainingTopics > 0 && (



<div

onClick={()=>{

setSelectedDayTopics(
logsForDay
);

setShowTopicsModal(
true
);

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
cursor:"pointer",
display:"inline-block",

}}

>

View All Topics
({logsForDay.length})
→

</div>

)

}



<div
style={{
fontSize:13,
color:"#475569",
}}
>

Homework :

<strong>

{

logsForDay.some(
item=>item.homework_given
)

?

"Yes"

:

"No"

}

</strong>

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
