import { useState } from "react";

import DailyLectureFeedback from "../../components/DailyLectureFeedback";
import ProgressTracker from "../../components/ProgressTracker";
import ContinuousCalendar from "../../components/ContinuousCalendar";
import StudyMaterial from "../../components/StudyMaterial";

type TabType = "daily" | "progress" | "calendar" | "study-material";

export default function GrowthPlan() {
  const [activeTab, setActiveTab] = useState<TabType>("daily");

  return (
    <>

      <style>{`
        @media (max-width: 1024px) {
          .gp-shell {
            border-radius: 22px !important;
          }

          .gp-hero-wrap {
            padding: 16px 16px 0 !important;
          }

          .gp-hero {
            min-height: 178px !important;
            padding: 26px 28px 22px !important;
            border-radius: 22px !important;
          }

          .gp-copy {
            padding-right: 100px !important;
          }

          .gp-copy h1 {
            font-size: 31px !important;
          }

          .gp-copy p {
            margin-top: 9px !important;
            font-size: 13px !important;
            line-height: 1.5 !important;
          }

          .gp-visual {
            right: 28px !important;
            top: 27px !important;
            transform: scale(.82) !important;
            transform-origin: top right !important;
          }

          .gp-tabs {
            margin-top: 20px !important;
          }

          .gp-tabs button {
            padding: 10px 12px !important;
            font-size: 10px !important;
          }

          .gp-content {
            padding: 16px !important;
          }
        }

        @media (max-width: 767px) {
          .gp-shell {
            min-height: 100vh !important;
            width: 100% !important;
            border-radius: 18px !important;
          }

          .gp-hero-wrap {
            padding: 10px 10px 0 !important;
          }

          .gp-hero {
            min-height: 0 !important;
            padding: 17px 15px 14px !important;
            border-radius: 18px !important;
          }

          .gp-copy {
            padding-right: 66px !important;
          }

          .gp-copy > div {
            font-size: 8px !important;
            letter-spacing: 1.5px !important;
            margin-bottom: 7px !important;
          }

          .gp-copy h1 {
            font-size: 24px !important;
            line-height: 1.08 !important;
            letter-spacing: -.4px !important;
          }

          .gp-copy p {
            margin-top: 7px !important;
            font-size: 10.5px !important;
            line-height: 1.4 !important;
          }

          .gp-visual {
            width: 58px !important;
            height: 58px !important;
            right: 13px !important;
            top: 15px !important;
            transform: none !important;
          }

          .gp-visual > div {
            width: 42px !important;
            height: 42px !important;
            font-size: 20px !important;
          }

          .gp-tabs {
            width: 100% !important;
            max-width: none !important;
            gap: 4px !important;
            margin-top: 13px !important;
            padding: 4px !important;
            border-radius: 11px !important;
          }

          .gp-tabs button {
            min-width: 0 !important;
            padding: 8px 4px !important;
            border-radius: 8px !important;
            font-size: 8px !important;
            line-height: 1.15 !important;
            letter-spacing: .1px !important;
            white-space: normal !important;
          }

          .gp-content {
            padding: 10px !important;
          }
        }

        @media (max-width: 390px) {
          .gp-copy {
            padding-right: 58px !important;
          }

          .gp-copy h1 {
            font-size: 22px !important;
          }

          .gp-visual {
            width: 52px !important;
            height: 52px !important;
            right: 10px !important;
          }

          .gp-visual > div {
            width: 38px !important;
            height: 38px !important;
            font-size: 18px !important;
          }

          .gp-tabs button {
            font-size: 7.5px !important;
          }
        }
      `}</style>
    <div className="gp-shell min-h-screen overflow-hidden rounded-3xl border border-gray-200 bg-[#F8F7F4]">

      {/* ==========================================================
          ACADEMIC PASSPORT HERO
      ========================================================== */}

      <div className="gp-hero-wrap px-6 pt-6">

        <div
          className="gp-hero"
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
            className="gp-copy"
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
              and build a continuous record.
            </p>

          </div>

          {/* RIGHT VISUAL */}

          <div
            className="gp-visual"
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
            className="gp-tabs"
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
              TOPIC CALENDAR
            </button>

            {/* STUDY MATERIAL */}

            <button
              onClick={() => setActiveTab("study-material")}
              style={{
                flex: 1,
                border: "none",
                borderRadius: 10,
                padding: "12px 18px",
                cursor: "pointer",
                background:
                  activeTab === "study-material"
                    ? "#F97316"
                    : "transparent",
                color:
                  activeTab === "study-material"
                    ? "#FFFFFF"
                    : "#475569",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.4,
                transition: "all .2s ease",
                boxShadow:
                  activeTab === "study-material"
                    ? "0 5px 14px rgba(249,115,22,.18)"
                    : "none"
              }}
            >
              STUDY MATERIAL
            </button>

          </div>

        </div>

      </div>

      {/* ==========================================================
          TAB CONTENT
      ========================================================== */}

      <div className="gp-content p-6">

        {activeTab === "daily" && (
          <DailyLectureFeedback />
        )}

        {activeTab === "progress" && (
          <ProgressTracker />
        )}

        {activeTab === "calendar" && (
          <ContinuousCalendar />
        )}

        {activeTab === "study-material" && (
          <StudyMaterial />
        )}

      </div>

    </div>
    </>
  );
}