
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

minHeight:180,

boxShadow:
"0px 4px 15px rgba(34,197,94,0.06)"

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


export default function ContinuousCalendar() {

const identity =
requireIdentity();

const [selectedSubject,setSelectedSubject]
=
useState("");

  const [selectedMonth, setSelectedMonth] =
    useState("July");

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


const logMonth =
new Date(
log.log_date
).toLocaleString(
"default",
{
month:"long"
}
);


if(

selectedMonth !==
logMonth

){

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

const totalDays = new Date(

2026,

new Date(
`${selectedMonth} 1, 2026`
).getMonth() + 1,

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

      <div className="rounded-3xl bg-[#07142D] p-8 text-white shadow-lg">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
          Doubt Diary & Syllabus Alignment
        </p>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-3xl font-black uppercase">
            Continuous Calendar Of Daily Lectures
          </h1>

    <div className="flex flex-wrap gap-5">

  {/* SUBJECT */}

  <div>
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
      Subject
    </p>

<select
      value={selectedSubject}
      onChange={(e) =>
        setSelectedSubject(e.target.value)
      }
      className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-white outline-none"
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
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
      Month
    </p>

    <select
      value={selectedMonth}
      onChange={(e) =>
        setSelectedMonth(e.target.value)
      }
      className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-white outline-none"
    >
      <option className="text-black">January</option>
      <option className="text-black">February</option>
      <option className="text-black">March</option>
      <option className="text-black">April</option>
      <option className="text-black">May</option>
      <option className="text-black">June</option>
      <option className="text-black">July</option>
      <option className="text-black">August</option>
      <option className="text-black">September</option>
      <option className="text-black">October</option>
      <option className="text-black">November</option>
      <option className="text-black">December</option>
    </select>
  </div>




  {/* WEEK FILTER */}

  <div>
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
      Week Filter
    </p>

    <select
      value={selectedWeek}
      onChange={(e) =>
        setSelectedWeek(e.target.value)
      }
      className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-white outline-none"
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
        <h2 className="text-xl font-bold uppercase text-slate-800">
          Assigned Subject Facilitator
        </h2>

      <div
className="
mt-5
rounded-3xl
p-8
"
style={{

background:"#ECF0DE",

border:
"1px solid #BFDBFE"

}}
>

<h2
style={{
fontSize:"26px",
fontWeight:700,
color:"#04122F"
}}
>
{teacherName}
</h2>

<p
style={{
fontWeight:600,
color:"#64748B"
}}
>
{selectedSubject} Subject Facilitator
</p>

<p>

Academic Session
2026-2027

</p>

</div>
      </div>

     {/* CONTINUOUS CLASSROOM CALENDAR */}

<div
style={{
background:"white",
padding:32,
borderRadius:28,
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
padding:"8px 14px",
borderRadius:14,
background:"#DCFCE7",
color:"#15803D",
fontWeight:700,
fontSize:13,
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
