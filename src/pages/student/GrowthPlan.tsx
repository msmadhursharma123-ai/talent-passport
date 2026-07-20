import { useState } from "react";

import DailyLectureFeedback from "../../components/DailyLectureFeedback";
import ProgressTracker from "../../components/ProgressTracker";
import ContinuousCalendar from "../../components/ContinuousCalendar";

type TabType = "daily" | "progress" | "calendar";

export default function GrowthPlan() {
  const [activeTab, setActiveTab] = useState<TabType>("daily");

  return (
    <div className="min-h-screen bg-[#F7FAF9] rounded-3xl border border-gray-200 overflow-hidden">

      {/* Header */}

      <div className="border-b border-gray-200 px-8 py-6 bg-white">

        <div className="inline-flex items-center rounded-lg bg-green-50 px-4 py-2 text-xs font-bold tracking-widest text-green-700 uppercase">
          Portal : Student / Parent
        </div>

        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <h1 className="text-3xl font-black tracking-wide text-slate-900 uppercase">
            Continuous Learning Feedback Index
          </h1>

          {/* Tabs */}

          <div className="flex flex-wrap gap-3 rounded-2xl bg-gray-100 p-2">

            <button
              onClick={() => setActiveTab("daily")}
              className={`rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === "daily"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              Daily Lecture Feedback
            </button>

            <button
              onClick={() => setActiveTab("progress")}
              className={`rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === "progress"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              Progress Tracker
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                activeTab === "calendar"
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              Continuous Calendar
            </button>

          </div>
        </div>
      </div>

      {/* Tab Content */}

      <div className="p-8">

        {activeTab === "daily" && (
          <DailyLectureFeedback />
        )}

        {activeTab === "progress" && (
          <ProgressTracker />
        )}

        {activeTab === "calendar" && (
          <ContinuousCalendar />
        )}

      </div>
    </div>
  );
}