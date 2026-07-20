
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

  const [selectedSubject, setSelectedSubject] =
    useState("All Subjects");

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

const [lectureLogs,setLectureLogs]
=
useState<any[]>([]);

  const lectureCalendar: any[] = [];

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

selectedSubject !==
"All Subjects"

&&

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

function loadSubjects() {

  const identity =
    requireIdentity();

  if (!identity.className) {
    return;
  }

  const subjectList =
    getSubjectsByClass(
      identity.className
    );

  setSubjects(
    subjectList
  );

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

        <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="text-lg font-bold text-slate-800">
            Teacher information will appear here.
          </h3>

          <p className="mt-2 text-slate-500">
            Subject teacher details will automatically populate once
            classroom mapping is completed.
          </p>
        </div>
      </div>

      {/* Calendar */}

      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold uppercase text-slate-800">
          Continuous Classroom Diary Calendar
        </h2>

        <div className="mt-6 grid grid
grid-cols-1
md:grid-cols-2
xl:grid-cols-4
gap-5">
          {filteredLogs.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-10 text-center">
              <h3 className="text-2xl font-bold text-slate-800">
                No Lecture Calendar Available Yet
              </h3>

              <p className="mt-4 text-slate-500">
                Your teachers have not yet submitted classroom lecture
                logs for the selected month.
              </p>

              <p className="mt-2 text-slate-500">
                Once available, you will be able to review topics
                covered, syllabus completion and daily learning logs.
              </p>
            </div>
          ) : (
            <>

{

filteredLogs.map((log)=>(


<div
key={log.id}
className="rounded-3xl border border-gray-200 bg-slate-50 p-5 shadow-sm"
>

<div className="text-xs font-bold uppercase text-orange-500">

{log.log_date}

</div>


<div className="mt-3 inline-flex rounded-xl bg-white px-3 py-1 text-xs font-bold">

{log.subject_name}

</div>


<h3 className="mt-4 text-lg font-bold">

{log.topic_name}

</h3>


<p className="mt-3 text-sm text-slate-500">

Teacher :
{log.teacher_name}

</p>


<p className="mt-2 text-sm">

Page :

{log.page_from}

-

{log.page_to}

</p>


<p className="mt-2 text-sm">

Homework :

{log.homework_given
?
"Yes"
:
"No"
}

</p>


<p className="mt-2 text-sm text-slate-500">

{log.teacher_notes}

</p>

</div>

))

}


</>
          )}
        </div>
      </div>

      {/* Features */}

      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold uppercase text-slate-800">
          Upcoming Classroom Intelligence Features
        </h2>

        <ul className="mt-5 space-y-3 text-slate-600">
          <li>• Topic Coverage Tracking</li>
          <li>• Lecture Completion Timeline</li>
          <li>• Daily Doubt Diary</li>
          <li>• Syllabus Alignment Tracker</li>
          <li>• Teacher Learning Insights</li>
        </ul>
      </div>
    </div>
  );
}