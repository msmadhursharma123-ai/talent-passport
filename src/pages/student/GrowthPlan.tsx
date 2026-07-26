import { useState } from "react";

import DailyLectureFeedback from "../../components/DailyLectureFeedback";
import ProgressTracker from "../../components/ProgressTracker";
import ContinuousCalendar from "../../components/ContinuousCalendar";

type TabType = "daily" | "progress" | "calendar";

export default function GrowthPlan() {
  const [activeTab, setActiveTab] = useState<TabType>("daily");

  return (
    <div className="min-h-screen overflow-hidden rounded-3xl border border-gray-200 bg-[#F8F7F4]">

      {/* ==========================================================
          ACADEMIC PASSPORT HERO
      ========================================================== */}

      <div className="px-6 pt-6">

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(120deg, #FFFFFF 0%, #FFFFFF 58%, #FFF9F4 82%, #F4F7FF 100%)",
            border: "1px solid #E2E8F0",
            borderRadius: 28,
            padding: "38px 42px 30px",
            minHeight: 210,
            boxShadow: "0 10px 30px rgba(15,23,42,.045)"
          }}
        >

          {/* DECORATIVE BLUE CIRCLE */}

          <div
            style={{
              position: "absolute",
              width: 250,
              height: 250,
              borderRadius: "50%",
              right: 120,
              bottom: -185,
              background: "rgba(37,99,235,.045)",
              pointerEvents: "none"
            }}
          />

          {/* DECORATIVE ORANGE CIRCLE */}

          <div
            style={{
              position: "absolute",
              width: 270,
              height: 270,
              borderRadius: "50%",
              right: -70,
              top: -105,
              background: "rgba(249,115,22,.055)",
              pointerEvents: "none"
            }}
          />

          {/* SMALL DECORATIVE CIRCLE */}

          <div
            style={{
              position: "absolute",
              width: 125,
              height: 125,
              borderRadius: "50%",
              right: 300,
              top: -75,
              background: "rgba(249,115,22,.03)",
              pointerEvents: "none"
            }}
          />

          {/* HEADER CONTENT */}

          <div
            style={{
              position: "relative",
              zIndex: 2,
              paddingRight: 130
            }}
          >

            {/* EYEBROW */}

            <div
              style={{
                color: "#F97316",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 2.2,
                marginBottom: 13
              }}
            >
              ACADEMIC GROWTH JOURNEY
            </div>

            {/* TITLE */}

            <h1
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: 38,
                lineHeight: 1.15,
                fontWeight: 800,
                letterSpacing: "-0.7px"
              }}
            >
              Academic Passport
            </h1>

            {/* DESCRIPTION */}

            <p
              style={{
                margin: "14px 0 0",
                maxWidth: 720,
                color: "#64748B",
                fontSize: 15,
                lineHeight: 1.65,
                fontWeight: 500
              }}
            >
              Track daily learning, understand your academic progress
              and build a continuous record of your classroom journey.
            </p>

          </div>

          {/* RIGHT VISUAL */}

          <div
            style={{
              position: "absolute",
              zIndex: 2,
              right: 52,
              top: 42,
              width: 94,
              height: 94,
              borderRadius: "50%",
              background: "rgba(249,115,22,.09)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#FFFFFF",
                border: "1px solid #FED7AA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                boxShadow:
                  "0 8px 22px rgba(249,115,22,.10)"
              }}
            >
              📚
            </div>
          </div>

          {/* ======================================================
              TAB NAVIGATION
          ====================================================== */}

          <div
            style={{
              position: "relative",
              zIndex: 3,
              display: "flex",
              gap: 6,
              marginTop: 28,
              padding: 5,
              background: "rgba(248,250,252,.92)",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              maxWidth: 900
            }}
          >

            {/* DAILY */}

            <button
              onClick={() => setActiveTab("daily")}
              style={{
                flex: 1,
                border: "none",
                borderRadius: 10,
                padding: "12px 18px",
                cursor: "pointer",
                background:
                  activeTab === "daily"
                    ? "#F97316"
                    : "transparent",
                color:
                  activeTab === "daily"
                    ? "#FFFFFF"
                    : "#475569",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.4,
                transition: "all .2s ease",
                boxShadow:
                  activeTab === "daily"
                    ? "0 5px 14px rgba(249,115,22,.18)"
                    : "none"
              }}
            >
              DAILY LECTURE FEEDBACK
            </button>

            {/* PROGRESS */}

            <button
              onClick={() => setActiveTab("progress")}
              style={{
                flex: 1,
                border: "none",
                borderRadius: 10,
                padding: "12px 18px",
                cursor: "pointer",
                background:
                  activeTab === "progress"
                    ? "#F97316"
                    : "transparent",
                color:
                  activeTab === "progress"
                    ? "#FFFFFF"
                    : "#475569",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.4,
                transition: "all .2s ease",
                boxShadow:
                  activeTab === "progress"
                    ? "0 5px 14px rgba(249,115,22,.18)"
                    : "none"
              }}
            >
              PROGRESS TRACKER
            </button>

            {/* CALENDAR */}

            <button
              onClick={() => setActiveTab("calendar")}
              style={{
                flex: 1,
                border: "none",
                borderRadius: 10,
                padding: "12px 18px",
                cursor: "pointer",
                background:
                  activeTab === "calendar"
                    ? "#F97316"
                    : "transparent",
                color:
                  activeTab === "calendar"
                    ? "#FFFFFF"
                    : "#475569",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.4,
                transition: "all .2s ease",
                boxShadow:
                  activeTab === "calendar"
                    ? "0 5px 14px rgba(249,115,22,.18)"
                    : "none"
              }}
            >
              CONTINUOUS CALENDAR
            </button>

          </div>

        </div>

      </div>

      {/* ==========================================================
          TAB CONTENT
      ========================================================== */}

      <div className="p-6">

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