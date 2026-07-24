import StudentExamPreparation
from "../domains/teacherIntelligence/pages/StudentExamPreparation";


export default function ProgressTracker() {
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

          <select className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-white outline-none">
            <option className="text-black">May</option>
            <option className="text-black">June</option>
            <option className="text-black">July</option>
          </select>
        </div>
      </div>

      {/* Monthly Calendar */}

      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold uppercase text-slate-800">
          May Classroom Check-In Calendar
        </h2>

        <p className="mt-2 text-slate-500">
          Daily learning consistency and feedback tracking calendar.
        </p>

        <div className="mt-6 grid grid-cols-7 gap-3">
          {Array.from({ length: 31 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center font-bold text-slate-700"
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}

      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold uppercase text-slate-800">
          May Stats Consolidation Table
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            "Tracked Days",
            "Satisfactory Feedbacks",
            "Assistance Needed",
            "Response Rate %",
            "Satisfaction %",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-gray-200 p-5"
            >
              <h3 className="text-sm font-semibold uppercase text-slate-500">
                {item}
              </h3>

              <p className="mt-4 text-3xl font-black text-orange-500">
                --
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Breakdown */}

      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold uppercase text-slate-800">
          Weekly Feedback Reports Breakdown
        </h2>

        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4].map((week) => (
            <div
              key={week}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-5"
            >
              <h3 className="font-bold text-slate-800">
                Week {week}
              </h3>

              <p className="mt-2 text-slate-500">
                Weekly classroom insights will appear here.
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