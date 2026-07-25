import { useState } from "react";

import DailyLectureFeedback from "../../components/DailyLectureFeedback";
import ProgressTracker from "../../components/ProgressTracker";
import ContinuousCalendar from "../../components/ContinuousCalendar";

type TabType = "daily" | "progress" | "calendar";

export default function GrowthPlan() {
  const [activeTab, setActiveTab] = useState<TabType>("daily");

  return (
    <div className="min-h-screen overflow-hidden rounded-3xl border border-gray-200 bg-[#F7FAF9]">

      {/* Header */}

      <div className="border-b border-gray-200 bg-white px-6 py-4">

        <div className="inline-flex items-center rounded-lg bg-green-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-green-700">
          Portal : Student / Parent
        </div>

        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Left Section */}

          <div className="lg:w-[34%]">

            <h1 className="text-[28px] font-black uppercase leading-tight tracking-tight text-slate-900">
              Academic Passport
            </h1>

          </div>

          {/* Right Section */}

          <div className="lg:w-[64%]">

            <div className="flex flex-nowrap gap-2 rounded-xl bg-gray-100 p-2">

              <button
                onClick={() => setActiveTab("daily")}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                  activeTab === "daily"
                    ? "bg-orange-500 text-white shadow"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                Daily Lecture Feedback
              </button>

              <button
                onClick={() => setActiveTab("progress")}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                  activeTab === "progress"
                    ? "bg-orange-500 text-white shadow"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                Progress Tracker
              </button>

              <button
                onClick={() => setActiveTab("calendar")}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                  activeTab === "calendar"
                    ? "bg-orange-500 text-white shadow"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                Continuous Calendar
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Tab Content */}

      <div className="p-6">

        {activeTab === "daily" && <DailyLectureFeedback />}

        {activeTab === "progress" && <ProgressTracker />}

        {activeTab === "calendar" && <ContinuousCalendar />}

      </div>

    </div>
  );
}