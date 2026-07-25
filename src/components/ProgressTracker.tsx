import { useEffect, useState } from "react";

import {
  getSubjectsByClass,
} from "../data/academicMasterRepository";

import {
  requireIdentity,
} from "../services/identityService";

import StudentExamPreparation
from "../domains/teacherIntelligence/pages/StudentExamPreparation";

import {
  getStudentProgressTracker,
  type StudentProgressTracker,
} from "../domains/teacherIntelligence/repository/StudentProgressTrackerRepository";

export default function ProgressTracker() {

  const identity =
    requireIdentity();

  const [
    subjects,
    setSubjects,
  ] =
    useState<string[]>([]);

  const [
    selectedSubject,
    setSelectedSubject,
  ] =
    useState("");

  const [
    selectedMonth,
    setSelectedMonth,
  ] =
    useState("July 2026");

  const [

    progress,

    setProgress,

  ] =

    useState<StudentProgressTracker | null>(null);

  const [

    loading,

    setLoading,

  ] =

    useState(true);

   useEffect(() => {

    loadSubjects();

  }, []);


  useEffect(() => {

    if (!selectedSubject) {
      return;
    }

    loadProgress();

  }, [
    selectedSubject,
    selectedMonth,
  ]);


  function loadSubjects() {

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

    if (
      subjectList.length > 0
    ) {
      setSelectedSubject(
        subjectList[0]
      );
    }

  }


  async function loadProgress() {

    try {

      setLoading(true);

      const data =
        await getStudentProgressTracker(
          selectedSubject,
          selectedMonth
        );

      setProgress(
        data
      );

    } catch (error) {

      console.error(
        "Failed to load student progress:",
        error
      );

    } finally {

      setLoading(false);

    }

  }

  const stats = [

    {

      title: "Tracked Days",

      value: progress?.stats.trackedDays ?? 0,

    },

    {

      title: "Satisfactory Feedbacks",

      value: progress?.stats.completelyUnderstood ?? 0,

    },

    {

      title: "Assistance Needed",

      value: progress?.stats.assistanceNeeded ?? 0,

    },

    {

      title: "Partially Understood",

      value: progress?.stats.partiallyUnderstood ?? 0,

    },

    {

      title: "Satisfaction %",

      value: `${progress?.stats.satisfactionRate ?? 0}%`,

    },

  ];

  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="rounded-3xl bg-[#07142D] p-8 text-white shadow-lg">

        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">

          Student Academic Continuity

        </p>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <h1 className="text-3xl font-black uppercase">

            Focus Progress Tracker Dashboard

          </h1>
<div className="flex items-end gap-4">

  {/* SUBJECT */}

  <div>

    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
      Subject
    </p>

    <select
      value={selectedSubject}
      onChange={(e) =>
        setSelectedSubject(
          e.target.value
        )
      }
      className="h-12 w-56 rounded-xl border border-white/20 bg-white/10 px-4 text-base text-white outline-none"
    >

      {subjects.map(
        (subject) => (

          <option
            key={subject}
            value={subject}
            className="text-black"
          >
            {subject}
          </option>

        )
      )}

    </select>

  </div>


  {/* MONTH */}

  <div>

    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
      Month
    </p>

    <select
      value={selectedMonth}
      onChange={(e) =>
        setSelectedMonth(
          e.target.value
        )
      }
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

</div>

        </div>

      </div>



     {/* Calendar */}

     

<div className="rounded-3xl bg-white p-8 shadow-sm">

  <h2 className="text-xl font-bold uppercase text-slate-800">
    Monthly Classroom Check-In Calendar
  </h2>

  <p className="mt-2 text-slate-500">
    Daily learning consistency and feedback tracking calendar.
  </p>

  {loading && (
    <div className="mt-5 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600">
      Loading Metrics...
    </div>
  )}

<div className="mt-6 grid grid-cols-7 gap-3 mb-3">

  {["MON","TUE","WED","THU","FRI","SAT","SUN"].map(day => (

    <div
      key={day}
      className="text-center text-sm font-bold uppercase tracking-wide text-slate-700"
    >
      {day}
    </div>

  ))}

</div>

  <div className="mt-6 grid grid-cols-7 gap-3">

{(progress?.calendar ?? []).map((item, index) => {

      return (

     <div
  key={index}
  className={`rounded-xl border p-4 text-center transition-all duration-200

    ${
      !loading && item?.understandingLevel === "I completely understood."
        ? "border-green-300 bg-green-100 text-green-900"
        : !loading &&
          item?.understandingLevel === "I partially understood."
        ? "border-yellow-300 bg-yellow-100 text-yellow-900"
        : !loading &&
          item?.understandingLevel === "I didn't understand."
        ? "border-red-300 bg-red-100 text-red-900"
        : "border-yellow-300 bg-yellow-50 text-slate-700"
    }
  `}
>

  <div className="text-base font-bold">
  {Number(item.date.split("-")[2])}
</div>

<div className="mt-3 flex flex-col items-center justify-center min-h-[52px]">

  {!loading && item?.understandingLevel ? (

    <>
      <span className="text-xl">
        {item.understandingLevel === "I completely understood."
          ? "🟢"
          : item.understandingLevel === "I partially understood."
          ? "🟡"
          : "🔴"}
      </span>

      <p className="mt-2 text-[11px] font-semibold">

        {item.understandingLevel === "I completely understood."
          ? "Excellent"
          : item.understandingLevel === "I partially understood."
          ? "Partially Understood"
          : "Needs Support"}

      </p>

    </>

  ) : (

    !loading && (

      <p className="text-[11px] font-semibold leading-4 text-amber-600 text-center">

        Not Submitted Yet

      </p>

    )

  )}

</div>

</div>

      );

    })}

  </div>

</div>

{/* Stats */}

      <div className="rounded-3xl bg-white p-8 shadow-sm">

        <h2 className="text-xl font-bold uppercase text-slate-800">

          Monthly Stats Consolidation

        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">

        {stats.map((item, index) => {

  const colors = [

    {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      value: "text-green-600",
    },

    {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      value: "text-blue-600",
    },

    {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      value: "text-red-600",
    },

    {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      value: "text-yellow-600",
    },

    {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      value: "text-purple-600",
    },

  ];

  const color = colors[index];

  return (

    <div

      key={item.title}

      className={`rounded-2xl border p-5 shadow-sm ${color.bg} ${color.border}`}

    >

      <h3 className={`text-sm font-semibold uppercase ${color.text}`}>

        {item.title}

      </h3>

      <p className={`mt-4 text-4xl font-black ${color.value}`}>

        {loading

          ? "--"

          : item.value}

      </p>

    </div>

  );

})}

        </div>

      </div>

      {/* Weekly Breakdown */}

      <div className="rounded-3xl bg-white p-8 shadow-sm">

        <h2 className="text-xl font-bold uppercase text-slate-800">

          Weekly Feedback Reports Breakdown

        </h2>

        <div className="mt-6 space-y-4">

          {(loading

            ? [1, 2, 3, 4]

            : progress?.weeklyBreakdown ?? []

          ).map((week: any, index) => (

            <div

              key={index}

              className="rounded-2xl border border-gray-200 bg-gray-50 p-5"

            >

              <h3 className="font-bold text-slate-800">

                {

                  loading

                    ? `Week ${week}`

                    : week.week

                }

              </h3>

              <p className="mt-2 text-slate-500">

                {

                  loading

                    ? "Loading weekly classroom insights..."

                    : `Tracked ${week.trackedDays} day(s) • Health Score ${week.healthScore}% • Completely Understood ${week.completelyUnderstood} • Partially Understood ${week.partiallyUnderstood} • Didn't Understand ${week.didntUnderstand}`

                }

              </p>

            </div>

          ))}

        </div>

      </div>

      {/* Academic Ledger */}

      <StudentExamPreparation />

    </div>

  );

}