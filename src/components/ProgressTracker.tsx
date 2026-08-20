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

import {
  getStudentProgressTrackerWithLiveLayer,
} from "../domains/liveDoubtIntelligence/service/LiveStudentProgressTracker";

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

      // ORIGINAL PROGRESS TRACKER IS THE SOURCE OF TRUTH FOR THE
      // CALENDAR CARDS. The live layer is strictly an overlay.
      const baseData =
        await getStudentProgressTracker(
          selectedSubject,
          selectedMonth
        );

      let finalData =
        baseData;

      try {

        const liveData =
          await getStudentProgressTrackerWithLiveLayer(
            selectedSubject,
            selectedMonth
          );

        // Never replace the original calendar array.
        // Only overlay understandingLevel for dates that the live layer
        // actually reconciled.
        const baseCalendar =
          baseData?.calendar ?? [];

        const liveCalendarByDate =
          new Map(
            (liveData?.calendar ?? []).map(
              (item: any) => [
                String(item.date),
                item,
              ]
            )
          );

        const overlaidCalendar =
          baseCalendar.map(
            (item: any) => {

              const liveItem =
                liveCalendarByDate.get(
                  String(item.date)
                );

              if (!liveItem) {
                return item;
              }

              return {
                ...item,
                understandingLevel:
                  liveItem.understandingLevel ??
                  item.understandingLevel,
              };

            }
          );

        finalData = {
          ...baseData,
          calendar:
            overlaidCalendar,
        };

      } catch (liveError) {

        // Live intelligence is optional/fail-open.
        // The original Progress Tracker remains completely intact.
        console.error(
          "Live progress overlay failed; preserving original tracker:",
          liveError
        );

        finalData =
          baseData;

      }

      setProgress(
        finalData
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
      <style>{`
        .pt-page{width:100%;min-width:0}
        @media(max-width:1024px){
          .pt-page{gap:16px!important}.pt-hero,.pt-calendar-section,.pt-stats-section,.pt-weekly-section{border-radius:20px!important}
          .pt-hero{padding:22px!important}.pt-hero-row{gap:18px!important}.pt-hero h1{font-size:27px!important;margin-top:7px!important}
          .pt-filters{width:100%!important;gap:10px!important}.pt-filters>div:not(:last-child){flex:1 1 0!important;min-width:0!important}.pt-filters select{width:100%!important;min-width:0!important}
          .pt-calendar-section,.pt-stats-section,.pt-weekly-section{padding:20px!important}.pt-weekdays,.pt-calendar-grid{gap:7px!important}
          .pt-day-card{min-height:92px!important;padding:10px!important;border-radius:14px!important}.pt-day-status{margin-top:10px!important;min-height:38px!important}
          .pt-stats-grid{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:9px!important}.pt-stat-card{padding:14px!important;border-radius:14px!important}.pt-stat-card p{margin-top:9px!important;font-size:24px!important}
          .pt-week-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}.pt-week-card{padding:15px!important;border-radius:15px!important}
        }
        @media(max-width:767px){
          .pt-page{gap:11px!important}.pt-hero{width:100%!important;padding:14px!important;border-radius:17px!important}.pt-hero-row{gap:12px!important}
          .pt-hero h1{margin-top:5px!important;font-size:21px!important;line-height:1.1!important}.pt-hero h1+p{margin-top:6px!important;font-size:10.5px!important;line-height:1.4!important}
          .pt-filters{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,.82fr) 42px!important;gap:7px!important;align-items:end!important}.pt-filters p{margin-bottom:4px!important;font-size:7px!important}.pt-filters select{height:36px!important;padding:0 8px!important;border-radius:9px!important;font-size:10px!important}.pt-filters>div:last-child{width:42px!important;height:36px!important;border-radius:9px!important;font-size:17px!important}
          .pt-calendar-section,.pt-stats-section,.pt-weekly-section{width:100%!important;padding:13px!important;border-radius:17px!important}
          .pt-calendar-section h2,.pt-stats-section h2,.pt-weekly-section h2{margin-top:4px!important;font-size:17px!important;line-height:1.15!important}.pt-calendar-section h2+p,.pt-stats-section h2+p,.pt-weekly-section h2+p{margin-top:5px!important;font-size:10px!important;line-height:1.35!important}
          .pt-weekdays{margin-top:12px!important;gap:3px!important}.pt-weekdays>div{padding:4px 0!important;font-size:7px!important;letter-spacing:.04em!important}.pt-calendar-grid{margin-top:2px!important;gap:3px!important}
          .pt-day-card{min-width:0!important;min-height:68px!important;padding:5px 3px!important;border-radius:9px!important}.pt-day-card>.relative.z-10.text-sm{font-size:9px!important;padding-left:2px!important}.pt-day-status{margin-top:5px!important;min-height:38px!important}.pt-day-status span{font-size:10px!important;line-height:1!important}.pt-day-status p{margin-top:3px!important;font-size:6.5px!important;line-height:1.15!important;overflow-wrap:anywhere!important}
          .pt-stats-grid{margin-top:11px!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:4px!important}.pt-stat-card{min-width:0!important;padding:8px 5px!important;border-radius:10px!important}.pt-stat-card h3{font-size:6px!important;line-height:1.15!important;letter-spacing:0!important;overflow-wrap:anywhere!important}.pt-stat-card p{margin-top:6px!important;font-size:17px!important;line-height:1!important}
          .pt-week-grid{margin-top:11px!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important}.pt-week-card{min-width:0!important;padding:10px!important;border-radius:12px!important}.pt-week-card h3{font-size:14px!important}.pt-week-card .h-10.w-10{width:30px!important;height:30px!important;font-size:13px!important}.pt-week-card .mt-5{margin-top:9px!important}.pt-week-card .grid.grid-cols-2{gap:5px!important}.pt-week-card .rounded-xl{padding:7px!important;border-radius:8px!important}.pt-week-card .rounded-xl p:first-child{font-size:6.5px!important;line-height:1.15!important}.pt-week-card .rounded-xl p:last-child{font-size:11px!important}
        }
      `}</style>


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

      <StudentExamPreparation
        selectedSubject={selectedSubject}
        selectedMonth={selectedMonth}
        availableSubjects={subjects}
      />

    </div>

  );

}