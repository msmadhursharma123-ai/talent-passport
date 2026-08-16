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
  getStudentProgressTrackerWithLiveLayer,
} from "../domains/liveDoubtIntelligence/service/LiveStudentProgressTracker";

import type {
  StudentProgressTracker,
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
        await getStudentProgressTrackerWithLiveLayer(
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

      title: " Partially Understood",

      value: progress?.stats.partiallyUnderstood ?? 0,

    },

    {

      title: "Satisfaction %",

      value: `${progress?.stats.satisfactionRate ?? 0}%`,

    },

  ];

  return (

    <div className="pt-page space-y-6">

     {/* Header */}

<div
  className="pt-hero relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
  style={{
    background:
      "linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 68%, #FFF5EA 100%)",
  }}
>
  {/* decorative circles */}

  <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-100/60" />

  <div className="pointer-events-none absolute right-32 -top-20 h-36 w-36 rounded-full bg-orange-50/80" />

  <div className="pointer-events-none absolute bottom-[-90px] right-[25%] h-48 w-48 rounded-full bg-blue-50/70" />

  <div className="pt-hero-row relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

    {/* LEFT */}

    <div>

      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-orange-500">
        Student Academic Continuity
      </p>

      <h1 className="mt-3 text-3xl font-black text-slate-900 lg:text-4xl">
        Study Progress Tracker
      </h1>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
        Track your classroom understanding, learning consistency and academic progress over time.
      </p>

    </div>

    {/* FILTERS */}

    <div className="pt-filters flex flex-wrap items-end gap-3">

      {/* SUBJECT */}

      <div>

        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Subject
        </p>

        <select
          value={selectedSubject}
          onChange={(e) =>
            setSelectedSubject(
              e.target.value
            )
          }
          className="h-11 min-w-[190px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-orange-300"
        >

          {subjects.map(
            (subject) => (

              <option
                key={subject}
                value={subject}
              >
                {subject}
              </option>

            )
          )}

        </select>

      </div>

      {/* MONTH */}

      <div>

        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Month
        </p>

        <select
          value={selectedMonth}
          onChange={(e) =>
            setSelectedMonth(
              e.target.value
            )
          }
          className="h-11 min-w-[160px] rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-orange-300"
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

      {/* ICON */}

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-200 bg-white/80 text-2xl shadow-sm">
        📊
      </div>

    </div>

  </div>

</div>



    {/* Calendar */}

<div className="pt-calendar-section rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

  {/* HEADER */}

  <div className="flex items-start justify-between gap-4">

    <div>

      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
        Learning Continuity
      </p>

      <h2 className="mt-2 text-xl font-black text-slate-900">
        See Your Classroom Stats
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Shows Daily learning consistency and feedback of your understanding across topics taught in the classroom
      </p>

    </div>

    <div className="hidden rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-orange-600 md:block">
      Monthly Learning Ledger
    </div>

  </div>

  {loading && (
    <div className="mt-5 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600">
      Loading Metrics...
    </div>
  )}

  {/* WEEK DAYS */}

  <div className="pt-weekdays mt-7 grid grid-cols-7 gap-3">

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
        className="py-2 text-center text-[11px] font-black uppercase tracking-[0.14em] text-slate-500"
      >
        {day}
      </div>

    ))}

  </div>

  {/* CALENDAR */}

  <div className="pt-calendar-grid mt-1 grid grid-cols-7 gap-3">

    {(progress?.calendar ?? []).map(
      (item, index) => {

        const complete =
          !loading &&
          item?.understandingLevel ===
            "I completely understood.";

        const partial =
          !loading &&
          item?.understandingLevel ===
            "I partially understood.";

        const support =
          !loading &&
          item?.understandingLevel ===
            "I didn't understand.";

        return (

          <div
            key={index}
            className={`pt-day-card relative min-h-[112px] overflow-hidden rounded-2xl border p-4 transition-all duration-200

              ${
                complete
                  ? "border-green-200 bg-green-50"
                  : partial
                  ? "border-amber-200 bg-amber-50"
                  : support
                  ? "border-red-200 bg-red-50"
                  : "border-orange-200 bg-orange-50"
              }
            `}
          >

            {/* SOFT DECORATION */}

            <div
              className={`pointer-events-none absolute -right-5 -top-5 h-14 w-14 rounded-full

                ${
                  complete
                    ? "bg-green-100/70"
                    : partial
                    ? "bg-amber-100/70"
                    : support
                    ? "bg-red-100/70"
                    : "bg-orange-100/70"
                }
              `}
            />

            {/* DATE */}

            <div className="relative z-10 text-sm font-black text-slate-800">

              {Number(
                item.date.split("-")[2]
              )}

            </div>

            {/* STATUS */}

            <div className="pt-day-status relative z-10 mt-5 flex min-h-[44px] flex-col items-center justify-center text-center">

              {!loading &&
              item?.understandingLevel ? (

                <>

                  <span className="text-lg">

                    {complete
                      ? "🟢"
                      : partial
                      ? "🟡"
                      : "🔴"}

                  </span>

                  <p
                    className={`mt-2 text-[10px] font-bold leading-4

                      ${
                        complete
                          ? "text-green-700"
                          : partial
                          ? "text-amber-700"
                          : "text-red-700"
                      }
                    `}
                  >

                    {complete
                      ? "Excellent"
                      : partial
                      ? "Partially Understood"
                      : "Needs Support"}

                  </p>

                </>

              ) : (

                !loading && (

                  <p className="text-[10px] font-bold leading-4 text-orange-500">
                    Not Submitted Yet
                  </p>

                )

              )}

            </div>

          </div>

        );

      }
    )}

  </div>

</div>

{/* Stats */}

<div className="pt-stats-section rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

  <div className="flex items-end justify-between gap-4">

    <div>

      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
        Progress Intelligence
      </p>

      <h2 className="mt-2 text-xl font-black text-slate-900">
        Monthly Stats Consolidation
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Your consolidated learning activity and classroom understanding for the selected month.
      </p>

    </div>

    <p className="hidden text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 lg:block">
      Academic Progress Ledger
    </p>

  </div>

  <div className="pt-stats-grid mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">

    {stats.map((item, index) => {

      const cards = [

        {
          background:
            "linear-gradient(135deg,#FFF9F2,#FFFFFF)",
          border: "#FED7AA",
          label: "#C2410C",
          value: "#F97316",
          bubble: "#FFEDD5",
        },

        {
          background:
            "linear-gradient(135deg,#EFF6FF,#FFFFFF)",
          border: "#BFDBFE",
          label: "#1D4ED8",
          value: "#2563EB",
          bubble: "#DBEAFE",
        },

        {
          background:
            "linear-gradient(135deg,#FEF2F2,#FFFFFF)",
          border: "#FECACA",
          label: "#B91C1C",
          value: "#DC2626",
          bubble: "#FEE2E2",
        },

        {
          background:
            "linear-gradient(135deg,#FFFBEB,#FFFFFF)",
          border: "#FDE68A",
          label: "#B45309",
          value: "#D97706",
          bubble: "#FEF3C7",
        },

        {
          background:
            "linear-gradient(135deg,#FAF5FF,#FFFFFF)",
          border: "#E9D5FF",
          label: "#7E22CE",
          value: "#9333EA",
          bubble: "#F3E8FF",
        },

      ];

      const card =
        cards[index];

      return (

        <div
          key={item.title}
          className="pt-stat-card relative overflow-hidden rounded-2xl border p-5"
          style={{
            background:
              card.background,
            borderColor:
              card.border,
          }}
        >

          <div
            className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full"
            style={{
              background:
                card.bubble,
            }}
          />

          <h3
            className="relative z-10 text-[10px] font-black uppercase tracking-wide"
            style={{
              color:
                card.label,
            }}
          >
            {item.title}
          </h3>

          <p
            className="relative z-10 mt-4 text-3xl font-black"
            style={{
              color:
                card.value,
            }}
          >

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

<div className="pt-weekly-section rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

  <div className="flex items-start justify-between gap-4">

    <div>

      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
        Weekly Learning Intelligence
      </p>

      <h2 className="mt-2 text-xl font-black text-slate-900">
        Weekly Feedback Reports Breakdown
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Review your learning consistency and classroom understanding week by week.
      </p>

    </div>

    <div className="hidden rounded-xl border border-blue-100 bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-blue-600 md:block">
      Weekly Ledger
    </div>

  </div>

  <div className="pt-week-grid mt-6 grid gap-4 lg:grid-cols-2">

    {(loading
      ? [1, 2, 3, 4]
      : progress?.weeklyBreakdown ?? []
    ).map((week: any, index) => (

      <div
        key={index}
        className="pt-week-card relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5"
      >

        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-50" />

        <div className="relative z-10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-500">
                Weekly Check-In
              </p>

              <h3 className="mt-1 text-lg font-black text-slate-900">

                {loading
                  ? `Week ${week}`
                  : week.week}

              </h3>

            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-lg">
              📅
            </div>

          </div>

          {loading ? (

            <p className="mt-5 text-sm text-slate-500">
              Loading weekly classroom insights...
            </p>

          ) : (

            <div className="mt-5 grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-slate-50 p-3">

                <p className="text-[9px] font-bold uppercase text-slate-400">
                  Tracked Days
                </p>

                <p className="mt-1 font-black text-slate-800">
                  {week.trackedDays}
                </p>

              </div>

              <div className="rounded-xl bg-blue-50 p-3">

                <p className="text-[9px] font-bold uppercase text-blue-500">
                  Health Score
                </p>

                <p className="mt-1 font-black text-blue-700">
                  {week.healthScore}%
                </p>

              </div>

              <div className="rounded-xl bg-green-50 p-3">

                <p className="text-[9px] font-bold uppercase text-green-600">
                  Understood
                </p>

                <p className="mt-1 font-black text-green-700">
                  {week.completelyUnderstood}
                </p>

              </div>

              <div className="rounded-xl bg-amber-50 p-3">

                <p className="text-[9px] font-bold uppercase text-amber-600">
                  Partial
                </p>

                <p className="mt-1 font-black text-amber-700">
                  {week.partiallyUnderstood}
                </p>

              </div>

              <div className="col-span-2 rounded-xl bg-red-50 p-3">

                <p className="text-[9px] font-bold uppercase text-red-500">
                  Didn't Understand
                </p>

                <p className="mt-1 font-black text-red-700">
                  {week.didntUnderstand}
                </p>

              </div>

            </div>

          )}

        </div>

      </div>

    ))}

  </div>

</div>

      {/* Academic Ledger */}

      <StudentExamPreparation />

    </div>

  );

}