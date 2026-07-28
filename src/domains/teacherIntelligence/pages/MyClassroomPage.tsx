import { useEffect, useState } from "react";

import {
getCurrentTeacher,
} from "../../../services/identityService";

import {
getTeacherAssignmentsByTeacher,
} from "../repository/TeacherAssignmentRepository";

import type { TeacherAssignment }
from "../types/TeacherAssignment";

import {
getTeacherDailyLogsByAssignment,
} from "../repository/TeacherDailyLogRepository";

import type {
TeacherDailyLog,
} from "../types/TeacherDailyLog";

import {

getStudentsAtRisk

}

from "../repository/TeacherFeedbackAnalyticsRepository";

export default function MyClassroomPage() {

const [assignments,setAssignments] =
useState<TeacherAssignment[]>([]);



const [selectedMonth,setSelectedMonth] =
useState("July 2026");

const [selectedAssignment,
setSelectedAssignment] =
useState<TeacherAssignment | null>(null);

const [dailyLogs,setDailyLogs] =
useState<TeacherDailyLog[]>([]);

const [

studentsAtRisk,

setStudentsAtRisk

] = useState<{

veryCritical:string[];

critical:string[];

moderate:string[];

}>({

veryCritical:[],

critical:[],

moderate:[],

});

const [selectedDayTopics,setSelectedDayTopics] =
useState<TeacherDailyLog[]>([]);

const [showTopicsModal,setShowTopicsModal] =
useState(false);

const academicMonths = [

"July 2026",
"August 2026",
"September 2026",
"October 2026",
"November 2026",
"December 2026",
"January 2027",
"February 2027",
"March 2027",
"April 2027",

];

const selectedMonthName =
selectedMonth.split(" ")[0];

const selectedYear =
selectedMonth.split(" ")[1];


const logsForSelectedMonth =

dailyLogs.filter((item) => {

  const currentDate =
    new Date(item.logDate);

  return (

    currentDate.toLocaleString(
      "default",
      {
        month: "long",
      }
    ) === selectedMonthName &&

    String(
      currentDate.getFullYear()
    ) === selectedYear

  );

});


const sortedLogs =

[...logsForSelectedMonth].sort(
  (a,b) =>
    new Date(a.logDate).getTime() -
    new Date(b.logDate).getTime()
);


const latestLog =

sortedLogs[
  sortedLogs.length - 1
];

const daysInMonthMap = {

"July 2026":31,
"August 2026":31,
"September 2026":30,
"October 2026":31,
"November 2026":30,
"December 2026":31,
"January 2027":31,
"February 2027":28,
"March 2027":31,
"April 2027":30,

};

useEffect(()=>{

loadAssignments();

},[]);


async function loadAssignments(){

const teacher =
getCurrentTeacher();

if(!teacher){
return;
}

const data =
await getTeacherAssignmentsByTeacher(
teacher.teacherUuid
);

setAssignments(data);

console.log(data);

console.log(teacher.teacherUuid);


}return (
  <div
      className="tp-compact-page"
    style={{
      padding: "20px",
      background: "#F6F7F9",
      minHeight: "100%",
    }}
  >
    
<style>{`
/* =========================================================
   RESPONSIVE UI LAYER
   Desktop inline styles remain the source of truth >1024px.
   ========================================================= */

@media (max-width: 1024px) {
  .tp-compact-page {
    padding: 12px !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
  }

  /* ---------- shared hero ---------- */
  .tp-page-hero {
    padding: 16px 18px !important;
    margin-bottom: 12px !important;
    border-radius: 18px !important;
  }

  .tp-page-hero > div:last-child {
    gap: 12px !important;
    align-items: center !important;
  }

  .tp-page-hero > div:last-child > div:first-child {
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }

  .tp-page-hero h1 {
    margin: 4px 0 5px !important;
    font-size: 23px !important;
    line-height: 1.08 !important;
  }

  .tp-page-hero p {
    max-width: none !important;
    font-size: 11px !important;
    line-height: 1.38 !important;
  }

  .tp-page-hero > div:last-child > div:last-child {
    width: 58px !important;
    height: 58px !important;
    min-width: 58px !important;
    padding: 7px !important;
    border-radius: 15px !important;
  }

  /* ---------- all normal sections ---------- */
  .tp-responsive-section {
    padding: 15px !important;
    margin-bottom: 12px !important;
    border-radius: 17px !important;
    box-sizing: border-box !important;
  }

  .tp-section-header {
    align-items: flex-start !important;
    gap: 8px 14px !important;
  }

  .tp-section-header > div:first-child {
    flex: 1 1 320px !important;
    min-width: 0 !important;
  }

  .tp-section-header > div:last-child {
    flex: 0 1 auto !important;
    max-width: 44% !important;
    text-align: right !important;
    align-self: flex-start !important;
  }

  .tp-responsive-section h2 {
    margin-top: 4px !important;
    margin-bottom: 4px !important;
    max-width: none !important;
    font-size: 19px !important;
    line-height: 1.08 !important;
  }

  .tp-responsive-section p {
    max-width: none !important;
    margin-top: 4px !important;
    font-size: 11px !important;
    line-height: 1.35 !important;
  }

  .tp-responsive-grid-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 9px !important;
    margin-top: 11px !important;
  }

  .tp-responsive-grid-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    gap: 8px !important;
    margin-top: 12px !important;
  }

  .tp-responsive-grid-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 8px !important;
    margin-top: 12px !important;
  }

  .tp-responsive-card {
    min-width: 0 !important;
    min-height: 76px !important;
    padding: 10px !important;
    border-radius: 12px !important;
    box-sizing: border-box !important;
  }

  /* ---------- controls ---------- */
  .tp-compact-page select {
    width: 100% !important;
    max-width: 100% !important;
    min-height: 36px !important;
    padding: 7px 9px !important;
    font-size: 10px !important;
    box-sizing: border-box !important;
  }

  /* ---------- calendar header ---------- */
  .tp-calendar-section {
    padding: 15px !important;
    margin-bottom: 12px !important;
    border-radius: 17px !important;
    box-sizing: border-box !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch !important;
  }

  .tp-calendar-header {
    gap: 10px !important;
    align-items: flex-start !important;
  }

  .tp-calendar-header > div:first-child {
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }

  .tp-calendar-header > div:last-child {
    flex: 0 0 auto !important;
    max-width: 42% !important;
    padding: 7px 10px !important;
    font-size: 9px !important;
    line-height: 1.2 !important;
    text-align: center !important;
  }

  .tp-calendar-header h2 {
    margin-top: 4px !important;
    font-size: 19px !important;
    line-height: 1.08 !important;
  }

  .tp-calendar-header p {
    max-width: none !important;
    margin-top: 4px !important;
    font-size: 11px !important;
    line-height: 1.35 !important;
  }

  .teacher-calendar-swipe-hint,
  .teacher-table-swipe-hint {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 10px !important;
    width: 100% !important;
    min-width: 0 !important;
    box-sizing: border-box !important;
    margin: 10px 0 7px !important;
    padding: 7px 9px !important;
    border: 1px solid #FED7AA !important;
    border-radius: 9px !important;
    background: #FFF7ED !important;
    color: #9A3412 !important;
    font-size: 8px !important;
    line-height: 1.2 !important;
  }

  .teacher-calendar-swipe-hint strong,
  .teacher-table-swipe-hint strong {
    text-align: right !important;
  }

  .tp-calendar-track {
    min-width: 620px !important;
    gap: 8px !important;
  }

  .tp-comparison-scroll {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    padding-bottom: 3px !important;
  }

  .tp-comparison-scroll > * {
    min-width: 620px !important;
  }

  /* ---------- classroom assignment cards ---------- */
  .tp-assignment-grid .tp-responsive-card {
    min-height: 70px !important;
    padding: 9px 10px !important;
  }

  /* ---------- risk cards ---------- */
  .tp-risk-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  }

  .tp-risk-grid .tp-responsive-card {
    min-height: 0 !important;
    padding: 11px !important;
  }

  /* ---------- analytics cards ---------- */
  .tp-analytics-grid .tp-responsive-card {
    min-height: 92px !important;
    padding: 10px !important;
  }
}

@media (max-width: 767px) {
  .tp-compact-page {
    padding: 8px !important;
  }

  .tp-page-hero {
    padding: 12px 13px !important;
    margin-bottom: 8px !important;
    border-radius: 14px !important;
  }

  .tp-page-hero h1 {
    font-size: 18px !important;
  }

  .tp-page-hero p {
    font-size: 9px !important;
    line-height: 1.3 !important;
  }

  .tp-page-hero > div:last-child > div:last-child {
    width: 46px !important;
    height: 46px !important;
    min-width: 46px !important;
    padding: 5px !important;
    border-radius: 11px !important;
  }

  .tp-responsive-section,
  .tp-calendar-section {
    padding: 11px !important;
    margin-bottom: 8px !important;
    border-radius: 14px !important;
  }

  /* Headers use the full card width instead of reserving a large empty right column */
  .tp-section-header {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    align-items: start !important;
    gap: 4px 8px !important;
  }

  .tp-section-header > div:first-child {
    grid-column: 1 / -1 !important;
    width: 100% !important;
  }

  .tp-section-header > div:last-child {
    grid-column: 1 / -1 !important;
    justify-self: start !important;
    max-width: 100% !important;
    margin-top: 3px !important;
    text-align: left !important;
    font-size: 8px !important;
    line-height: 1.2 !important;
    letter-spacing: .7px !important;
  }

  .tp-responsive-section h2 {
    font-size: 15px !important;
    line-height: 1.06 !important;
  }

  .tp-responsive-section p {
    font-size: 9px !important;
    line-height: 1.3 !important;
  }

  .tp-responsive-grid-2 {
    gap: 6px !important;
    margin-top: 8px !important;
  }

  /* Four information / summary cards stay compact in a 2×2 matrix */
  .tp-responsive-grid-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 6px !important;
    margin-top: 8px !important;
  }

  .tp-responsive-card {
    min-height: 64px !important;
    padding: 8px !important;
    border-radius: 10px !important;
  }

  .tp-assignment-grid .tp-responsive-card {
    min-height: 62px !important;
    padding: 7px 8px !important;
  }

  /* Critical / very critical / moderate remain side-by-side as a readable compact ledger */
  .tp-risk-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 5px !important;
  }

  .tp-risk-grid .tp-responsive-card {
    padding: 7px !important;
    border-radius: 10px !important;
  }

  .tp-risk-grid .tp-responsive-card * {
    overflow-wrap: anywhere !important;
  }

  .tp-analytics-grid .tp-responsive-card {
    min-height: 78px !important;
    padding: 8px !important;
  }

  /* Calendar title/description now use the whole width; ledger badge sits beneath them */
  .tp-calendar-header {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 5px !important;
  }

  .tp-calendar-header > div:first-child {
    width: 100% !important;
  }

  .tp-calendar-header > div:last-child {
    max-width: 100% !important;
    justify-self: start !important;
    padding: 6px 8px !important;
    font-size: 8px !important;
  }

  .tp-calendar-header h2 {
    font-size: 15px !important;
    line-height: 1.06 !important;
  }

  .tp-calendar-header p {
    font-size: 9px !important;
    line-height: 1.3 !important;
  }

  .teacher-calendar-swipe-hint,
  .teacher-table-swipe-hint {
    margin: 7px 0 5px !important;
    padding: 6px 7px !important;
    font-size: 7.5px !important;
  }

  .tp-calendar-track {
    min-width: 560px !important;
    gap: 7px !important;
  }

  .tp-comparison-scroll > * {
    min-width: 560px !important;
  }

  .tp-compact-page select {
    min-height: 32px !important;
    padding: 6px 7px !important;
    font-size: 9px !important;
    border-radius: 8px !important;
  }
}

/* FINAL MOBILE/TABLET FIT PASS */
@media (max-width: 1024px) {
  .tp-info-card,
  .tp-summary-card {
    min-height: 72px !important;
    padding: 9px 10px !important;
  }

  .tp-calendar-reference {
    display: grid !important;
    grid-template-columns: 1fr !important;
    gap: 10px !important;
    margin-top: 14px !important;
  }

  .tp-calendar-legend {
    display: grid !important;
    grid-template-columns: repeat(3, max-content) !important;
    justify-content: start !important;
    gap: 12px !important;
    width: 100% !important;
  }

  .tp-calendar-legend > div {
    font-size: 10px !important;
    gap: 5px !important;
    white-space: nowrap !important;
  }

  .tp-calendar-abbreviations {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 7px !important;
    width: 100% !important;
    justify-content: stretch !important;
  }

  .tp-calendar-abbreviations > div {
    width: 100% !important;
    min-width: 0 !important;
    justify-content: center !important;
    box-sizing: border-box !important;
  }
}

@media (max-width: 767px) {
  .tp-info-card,
  .tp-summary-card {
    min-height: 58px !important;
    padding: 7px 8px !important;
  }

  .tp-info-card > div:last-child > div:first-child,
  .tp-summary-card > div:last-child > div:first-child {
    font-size: 9px !important;
    line-height: 1.15 !important;
    margin-bottom: 4px !important;
  }

  .tp-info-card > div:last-child > div:nth-child(2) {
    font-size: 10px !important;
    line-height: 1.15 !important;
    margin-bottom: 3px !important;
  }

  .tp-info-card > div:last-child > div:last-child {
    font-size: 19px !important;
    line-height: 1 !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
  }

  .tp-summary-card > div:last-child > div:nth-child(2) {
    font-size: 24px !important;
    line-height: 1 !important;
  }

  .tp-summary-card > div:last-child > div:last-child {
    margin-top: 5px !important;
    font-size: 12px !important;
    line-height: 1.1 !important;
  }

  /* Risk ledger: readable 3-card row, no letter-by-letter wrapping */
  .tp-risk-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 5px !important;
  }

  .tp-risk-card {
    min-height: 0 !important;
    padding: 0 !important;
  }

  .tp-risk-content {
    padding: 7px !important;
  }

  .tp-risk-eyebrow {
    font-size: 7px !important;
    line-height: 1.15 !important;
    letter-spacing: .25px !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
  }

  .tp-risk-title-row {
    gap: 3px !important;
    margin-top: 5px !important;
    align-items: center !important;
  }

  .tp-risk-title {
    font-size: 11px !important;
    line-height: 1.05 !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
  }

  .tp-risk-count {
    min-width: 22px !important;
    height: 22px !important;
    padding: 0 4px !important;
    border-radius: 7px !important;
    font-size: 11px !important;
  }

  .tp-risk-description {
    min-height: 0 !important;
    margin: 6px 0 7px !important;
    font-size: 7.5px !important;
    line-height: 1.25 !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
  }

  .tp-risk-students {
    padding-top: 6px !important;
  }

  .tp-risk-students > div {
    padding: 5px !important;
    margin-bottom: 4px !important;
    font-size: 8px !important;
    line-height: 1.2 !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
  }

  .tp-calendar-legend {
    grid-template-columns: repeat(3, minmax(0, auto)) !important;
    gap: 7px !important;
  }

  .tp-calendar-legend > div {
    font-size: 8px !important;
    line-height: 1.1 !important;
  }

  .tp-calendar-legend > div > div {
    width: 6px !important;
    height: 6px !important;
  }

  .tp-calendar-abbreviations {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 5px !important;
  }

  .tp-calendar-abbreviations > div {
    padding: 5px 6px !important;
    gap: 4px !important;
  }

  .tp-calendar-abbreviations span {
    font-size: 7px !important;
    white-space: nowrap !important;
  }
}



/* STUDENT RISK LEDGER SWIPE — mobile/tablet only */
.teacher-risk-swipe-hint {
  display: none;
}

@media (max-width: 1024px) {
  .teacher-risk-swipe-hint {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 10px !important;
    width: 100% !important;
    box-sizing: border-box !important;
    margin: 10px 0 7px !important;
    padding: 7px 9px !important;
    border: 1px solid #FED7AA !important;
    border-radius: 9px !important;
    background: #FFF7ED !important;
    color: #9A3412 !important;
    font-size: 8px !important;
    line-height: 1.2 !important;
  }

  .teacher-risk-swipe-hint strong {
    text-align: right !important;
  }

  .tp-risk-scroll {
    width: 100% !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch !important;
  }
}

@media (max-width: 767px) {
  .teacher-risk-swipe-hint {
    margin: 7px 0 5px !important;
    padding: 6px 7px !important;
    font-size: 7.5px !important;
  }
}

/* =========================================================
   FREEZE PATCH — REQUESTED SECTIONS ONLY
   Mobile / tablet only. No desktop, data, logic, or other UI changes.
   ========================================================= */
@media (max-width: 1024px) {
  /* HERO ONLY: compact the two center pills and right CLASSROOM badge */
  .tp-page-hero > div:last-child > div:first-child > div:last-child {
    flex-wrap: nowrap !important;
    gap: 5px !important;
  }
  .tp-page-hero > div:last-child > div:first-child > div:last-child > div {
    white-space: nowrap !important;
    padding: 6px 9px !important;
    font-size: 8px !important;
    letter-spacing: .35px !important;
  }
  .tp-page-hero > div:last-child > div:last-child {
    width: 48px !important;
    height: 48px !important;
    min-width: 48px !important;
    padding: 5px !important;
  }
  .tp-page-hero > div:last-child > div:last-child > div:first-child {
    font-size: 18px !important;
  }
  .tp-page-hero > div:last-child > div:last-child > div:last-child {
    margin-top: 3px !important;
    font-size: 6px !important;
    line-height: 1 !important;
    letter-spacing: .3px !important;
    white-space: nowrap !important;
  }

  /* CALENDAR CARDS ONLY: wider + shorter, preserving existing calendar */
  .tp-calendar-track {
    min-width: 760px !important;
  }
  .tp-calendar-track:last-of-type > div {
    min-height: 92px !important;
    padding: 9px !important;
  }

  /* STUDENT RISK LEDGER ONLY: wider table/card row for readability */
  .tp-risk-grid {
    min-width: 700px !important;
    grid-template-columns: repeat(3, minmax(210px, 1fr)) !important;
    gap: 8px !important;
  }
}

@media (max-width: 767px) {
  .tp-page-hero > div:last-child > div:first-child > div:last-child > div {
    padding: 5px 6px !important;
    font-size: 6.5px !important;
    letter-spacing: .1px !important;
  }
  .tp-page-hero > div:last-child > div:last-child {
    width: 38px !important;
    height: 38px !important;
    min-width: 38px !important;
    padding: 3px !important;
    border-radius: 9px !important;
  }
  .tp-page-hero > div:last-child > div:last-child > div:first-child {
    font-size: 14px !important;
  }
  .tp-page-hero > div:last-child > div:last-child > div:last-child {
    font-size: 5px !important;
    letter-spacing: 0 !important;
  }

  .tp-calendar-track {
    min-width: 700px !important;
  }
  .tp-calendar-track:last-of-type > div {
    min-height: 86px !important;
    padding: 8px !important;
  }

  .tp-risk-grid {
    min-width: 660px !important;
    grid-template-columns: repeat(3, minmax(200px, 1fr)) !important;
  }
}

`}</style>

    {/* =====================================================
        PAGE HERO
       ===================================================== */}

    <div className="tp-page-hero" style={heroStyle}>
      <div style={heroOrangeCircle} />
      <div style={heroSoftCircle} />
      <div style={heroBlueCircle} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            CLASSROOM INTELLIGENCE WORKSPACE
          </div>

          <h1
            style={{
              margin: "8px 0 8px",
              color: "#0F172A",
              fontSize: "28px",
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-0.7px",
            }}
          >
            My Classroom
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "650px",
              color: "#64748B",
              fontSize: "16px",
              lineHeight: 1.65,
            }}
          >
            Explore your Assigned Classroom, Teaching History and
            Monthly Activities
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "14px",
            }}
          >
            <div style={orangePillStyle}>
              CLASSROOM HISTORY
            </div>

            <div style={bluePillStyle}>
              STUDENT INTELLIGENCE
            </div>
          </div>
        </div>

        <div style={heroBadgeStyle}>
          <div
            style={{
              fontSize: "28px",
              lineHeight: 1,
            }}
          >
            ◇
          </div>

          <div
            style={{
              marginTop: "8px",
              color: "#F97316",
              fontSize: "8px",
              fontWeight: 800,
              letterSpacing: "1.2px",
            }}
          >
            CLASSROOM
          </div>
        </div>
      </div>
    </div>

    {/* =====================================================
        CLASSROOM CONTROLS
       ===================================================== */}

    <div className="tp-responsive-section" style={sectionCardStyle}>
      <div
        className="tp-section-header"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "18px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            CLASSROOM CONTROLS
          </div>

          <h2 style={sectionTitleStyle}>
            Explore Your Classroom
          </h2>

          <p style={sectionDescriptionStyle}>
            Select an assigned classroom and academic month to
            explore its teaching record.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          ACADEMIC WORKSPACE
        </div>
      </div>

      <div
        className="tp-responsive-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "12px",
          marginTop: "18px",
        }}
      >
        <div>
          <div style={fieldLabelStyle}>
            
          </div>

          <select
            style={dropdownStyle}
            value={selectedAssignment?.id ?? ""}
            onChange={async (e) => {
              const assignment =
                assignments.find(
                  (item) =>
                    String(item.id) === e.target.value
                );

              setSelectedAssignment(
                assignment ?? null
              );

              if (assignment) {
                const logs =
                  await getTeacherDailyLogsByAssignment(
                    assignment.id
                  );

                setDailyLogs(logs);

                const riskData =
                  await getStudentsAtRisk(
                    assignment.className,
                    assignment.sectionName
                  );

                setStudentsAtRisk(riskData);
              } else {
                setDailyLogs([]);
              }
            }}
          >
            <option value="">
              Select Classroom
            </option>

            {assignments.map((assignment) => (
              <option
                key={assignment.id}
                value={assignment.id}
              >
                Class {assignment.className} - Section{" "}
                {assignment.sectionName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={fieldLabelStyle}>
            
          </div>

          <select
            style={dropdownStyle}
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
            }}
          >
            {academicMonths.map((month) => (
              <option
                key={month}
                value={month}
              >
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>

    {/* =====================================================
        ASSIGNED CLASSROOM
       ===================================================== */}

    <div className="tp-responsive-section" style={sectionCardStyle}>
      <div
        className="tp-section-header"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            CLASSROOM PROFILE
          </div>

          <h2 style={sectionTitleStyle}>
            Assigned Classroom Information
          </h2>

          <p style={sectionDescriptionStyle}>
            Your current academic assignment and classroom
            configuration.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          TEACHER ASSIGNMENT
        </div>
      </div>

     <div
  className="tp-responsive-grid-4 tp-assignment-grid"
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "20px",
  }}
>
        <InfoCard
          
          title="Class"
          value={
            selectedAssignment?.className ??
            "Not Selected"
          }
          background="#FFF7ED"
          border="#FED7AA"
          color="#EA580C"
        />

        <InfoCard
          
          title="Section"
          value={
            selectedAssignment?.sectionName ??
            "Not Selected"
          }
          background="#EFF6FF"
          border="#BFDBFE"
          color="#2563EB"
        />

        <InfoCard
          
          title="Subject"
          value={
            selectedAssignment?.subjectName ??
            "Not Selected"
          }
          background="#F0FDF4"
          border="#BBF7D0"
          color="#16A34A"
        />

        <InfoCard
          
          title="Session"
          value={
            selectedAssignment?.academicYear ??
            "2026-2027"
          }
          background="#FAF5FF"
          border="#E9D5FF"
          color="#7C3AED"
        />
      </div>
    </div>

   {/* =====================================================
    CLASSROOM HISTORY
   ===================================================== */}

<div
  className="tp-calendar-section"
  style={{
    position: "relative",
    overflow: "hidden",

    marginBottom: "18px",
    padding: "24px",

    background: "#FFFFFF",

    border: "1px solid #E2E8F0",
    borderRadius: "22px",

    boxShadow:
      "0 7px 24px rgba(15,23,42,0.035)",
  }}
>

  {/* DECORATIVE SECTION CIRCLE */}

  <div
    style={{
      position: "absolute",

      width: "125px",
      height: "125px",

      right: "-38px",
      top: "-52px",

      borderRadius: "50%",

      background:
        "rgba(255,237,213,0.48)",

      pointerEvents: "none",
    }}
  />


  {/* =====================================================
      SECTION HEADER
     ===================================================== */}

  <div
    className="tp-calendar-header"
    style={{
      position: "relative",
      zIndex: 1,

      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",

      gap: "20px",
    }}
  >

    <div>

      <div
        style={{
          color: "#F97316",

          fontSize: "10px",
          fontWeight: 800,

          letterSpacing: "1.6px",
          textTransform: "uppercase",
        }}
      >
        LEARNING CONTINUITY
      </div>


      <h2
        style={{
          margin: "7px 0 0",

          color: "#0F172A",

          fontSize: "21px",
          lineHeight: 1.2,

          fontWeight: 800,

          letterSpacing: "-0.3px",
        }}
      >
        See Your Classroom Calendar
      </h2>


      <p
        style={{
          margin: "7px 0 0",

          color: "#64748B",

          fontSize: "14px",
          lineHeight: 1.55,
        }}
      >
        Review lectures, topics, homework and classroom
        activities recorded throughout the selected month.
      </p>

    </div>


    {/* MONTHLY LEDGER BADGE */}

    <div
      style={{
        position: "relative",
        zIndex: 1,

        flexShrink: 0,

        padding: "8px 14px",

        background:
          "linear-gradient(135deg,#FFF7ED,#FFFFFF)",

        border:
          "1px solid #FED7AA",

        borderRadius: "11px",

        color: "#EA580C",

        fontSize: "10px",
        fontWeight: 800,

        letterSpacing: "0.7px",

        textTransform: "uppercase",
      }}
    >
      Monthly Learning Ledger
    </div>

  </div>


  <div className="teacher-calendar-swipe-hint">
    <span>CALENDAR VIEW</span>
    <strong>Swipe left or right to view the full month →</strong>
  </div>

  {/* =====================================================
      WEEK DAYS
     ===================================================== */}

  <div
    className="tp-calendar-track"
    style={{
      position: "relative",
      zIndex: 1,

      display: "grid",

      gridTemplateColumns:
        "repeat(7, minmax(0,1fr))",

      gap: "12px",

      marginTop: "30px",
      marginBottom: "12px",
    }}
  >

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
        style={{
          textAlign: "center",

          color: "#64748B",

          fontSize: "11px",
          fontWeight: 800,

          letterSpacing: "1.1px",
        }}
      >
        {day}
      </div>

    ))}

  </div>


  {/* =====================================================
      CALENDAR GRID
     ===================================================== */}

  <div
    className="tp-calendar-track"
    style={{
      position: "relative",
      zIndex: 1,

      display: "grid",

      gridTemplateColumns:
        "repeat(7, minmax(0,1fr))",

      gap: "12px",
    }}
  >

    {Array.from({
      length:
        daysInMonthMap[
          selectedMonth as keyof typeof daysInMonthMap
        ],
    }).map((_, index) => {

      const day =
        index + 1;


      /* -------------------------------------------------
         LOGS FOR CURRENT DAY
         EXISTING FUNCTIONALITY PRESERVED
      ------------------------------------------------- */

      const logsForDay =
        dailyLogs.filter((item) => {

          const currentDate =
            new Date(item.logDate);

          const selectedMonthName =
            selectedMonth.split(" ")[0];

          const selectedYear =
            selectedMonth.split(" ")[1];

          return (

            currentDate.getDate() === day &&

            currentDate.toLocaleString(
              "default",
              {
                month: "long",
              }
            ) === selectedMonthName &&

            String(
              currentDate.getFullYear()
            ) === selectedYear

          );

        });


      const visibleTopics =
        logsForDay.slice(0, 1);


      const remainingTopics =
        logsForDay.length - 1;


      /* =================================================
         EMPTY DAY
         SAME UI LANGUAGE AS STUDENT CALENDAR
      ================================================= */

      if (
        logsForDay.length === 0
      ) {

        return (

          <div
            key={day}
            style={{
              position: "relative",

              overflow: "hidden",

              minHeight: "116px",

              padding: "14px",

              boxSizing: "border-box",

              background:
                "linear-gradient(135deg,#FFF9EF 0%,#FFFCF7 100%)",

              border:
                "1px solid #FDBA74",

              borderRadius: "15px",

              display: "flex",
              flexDirection: "column",

              boxShadow:
                "0 2px 6px rgba(15,23,42,0.02)",
            }}
          >

            {/* CORNER CIRCLE */}

            <div
              style={{
                position: "absolute",

                width: "54px",
                height: "54px",

                right: "-18px",
                top: "-18px",

                borderRadius: "50%",

                background:
                  "rgba(255,237,213,0.78)",

                pointerEvents: "none",
              }}
            />


            {/* DATE */}

            <div
              style={{
                position: "relative",
                zIndex: 1,

                color: "#0F172A",

                fontSize: "14px",
                lineHeight: 1,

                fontWeight: 800,
              }}
            >
              {day}
            </div>


            {/* EMPTY MESSAGE */}

            <div
              style={{
                position: "relative",
                zIndex: 1,

                flex: 1,

                display: "flex",

                alignItems: "center",
                justifyContent: "center",

                paddingBottom: "3px",
              }}
            >

              <div
                style={{
                  color: "#EA580C",

                  fontSize: "10px",
                  lineHeight: 1.3,

                  fontWeight: 800,

                  textAlign: "center",
                }}
              >
                No Lecture Conducted
              </div>

            </div>

          </div>

        );

      }


      /* =================================================
         LECTURE DAY
      ================================================= */

      const isLatestDay =
        logsForDay.some(
          (item) =>
            item.id === latestLog?.id
        );


      return (

        <div
          key={day}
          style={{
            position: "relative",

            overflow: "hidden",

            minHeight: "116px",

            padding: "14px",

            boxSizing: "border-box",

   background:
  isLatestDay
    ? "linear-gradient(135deg,#FFF3E8 0%,#FFF9F3 100%)"
    : "linear-gradient(135deg,#F0FDF4 0%,#F8FFF9 100%)",

border:
  isLatestDay
    ? "1.5px solid #F97316"
    : "1px solid #BBF7D0",

            borderRadius: "15px",

            boxShadow:
              "0 2px 6px rgba(15,23,42,0.02)",
          }}
        >

          {/* CORNER CIRCLE */}

          <div
            style={{
              position: "absolute",

              width: "54px",
              height: "54px",

              right: "-18px",
              top: "-18px",

              borderRadius: "50%",

            background:
  isLatestDay
    ? "rgba(249,115,22,0.10)"
    : "rgba(220,252,231,0.82)",

              pointerEvents: "none",
            }}
          />


          {/* DATE */}

          <div
            style={{
              position: "relative",
              zIndex: 1,

              color: "#0F172A",

              fontSize: "14px",
              lineHeight: 1,

              fontWeight: 800,

              marginBottom: "13px",
            }}
          >
            {day}
          </div>


          {/* TOPIC */}

          {visibleTopics.map(
            (topic) => (

              <div
                key={topic.id}
                style={{
                  position: "relative",
                  zIndex: 1,
                }}
              >

                <div
                  style={{
                    display:
                      "inline-flex",

                    maxWidth: "100%",

                    padding:
                      "5px 8px",

                    borderRadius:
                      "10px",

                    background:
                      topic.id ===
                      latestLog?.id
                        ? "#FFEDD5"
                        : "#DCFCE7",

                    color:
                      topic.id ===
                      latestLog?.id
                        ? "#EA580C"
                        : "#15803D",

                    fontWeight: 800,

                    fontSize: "10px",

                    lineHeight: 1.3,

                    overflow:
                      "hidden",

                    textOverflow:
                      "ellipsis",

                    whiteSpace:
                      "nowrap",

                    boxSizing:
                      "border-box",
                  }}
                >
                  {topic.topicName}
                </div>


                <div
                  style={{
                    marginTop: "7px",

                    color: "#64748B",

                    fontSize: "10px",

                    fontWeight: 700,
                  }}
                >
                  Pages:{" "}
                  {topic.pageFrom}–
                  {topic.pageTo}
                </div>

              </div>

            )
          )}


          {/* MORE TOPICS */}

          {remainingTopics > 0 && (

            <button
              type="button"

              onClick={() => {

                setSelectedDayTopics(
                  logsForDay
                );

                setShowTopicsModal(
                  true
                );

              }}

              style={{
                position: "relative",
                zIndex: 1,

                marginTop: "7px",

                padding: 0,

                border: "none",

                background:
                  "transparent",

                color: "#2563EB",

                fontSize: "10px",

                fontWeight: 800,

                cursor: "pointer",
              }}
            >
              View All Topics (
              {logsForDay.length}) →
            </button>

          )}


          {/* HOMEWORK + ACTIVITY */}

          <div
            style={{
              position: "relative",
              zIndex: 1,

              display: "flex",

              flexWrap: "wrap",

              gap: "5px",

              marginTop: "8px",
            }}
          >

            <div
              style={{
                padding:
                  "4px 6px",

                background:
                  "rgba(255,255,255,0.72)",

                border:
                  "1px solid rgba(148,163,184,0.18)",

                borderRadius:
                  "7px",

                color:
                  "#64748B",

                fontSize:
                  "9px",

                fontWeight:
                  700,
              }}
            >
              HW{" "}

              <strong
                style={{
                  color:
                    "#334155",
                }}
              >
                {logsForDay.some(
                  (item) =>
                    item.homeworkGiven
                )
                  ? "YES"
                  : "NO"}
              </strong>

            </div>


            <div
              style={{
                padding:
                  "4px 6px",

                background:
                  "rgba(255,255,255,0.72)",

                border:
                  "1px solid rgba(148,163,184,0.18)",

                borderRadius:
                  "7px",

                color:
                  "#64748B",

                fontSize:
                  "9px",

                fontWeight:
                  700,
              }}
            >
              ACT{" "}

              <strong
                style={{
                  color:
                    "#334155",
                }}
              >
                {logsForDay.some(
                  (item) =>
                    item.activityConducted
                )
                  ? "YES"
                  : "NO"}
              </strong>

            </div>

          </div>

        </div>

      );

    })}

  </div>


  {/* =====================================================
    CALENDAR REFERENCE
   ===================================================== */}

<div
  className="tp-calendar-reference"
  style={{
    position: "relative",
    zIndex: 1,

    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",

    flexWrap: "wrap",

    gap: "16px",

    marginTop: "20px",
  }}
>
  {/* LEFT — CALENDAR LEGEND */}

  <div
    className="tp-calendar-legend"
    style={{
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "18px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",

        color: "#64748B",

        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "9px",
          height: "9px",

          flexShrink: 0,

          borderRadius: "50%",

          background: "#22C55E",
        }}
      />

      Lecture Conducted
    </div>


    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",

        color: "#64748B",

        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "9px",
          height: "9px",

          flexShrink: 0,

          borderRadius: "50%",

          background: "#FDBA74",
        }}
      />

      No Lecture Conducted
    </div>


    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",

        color: "#64748B",

        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "9px",
          height: "9px",

          flexShrink: 0,

          borderRadius: "50%",

          background: "#F97316",
        }}
      />

      Latest Lecture
    </div>
  </div>


  {/* RIGHT — TEACHER REFERENCE */}

  <div
    className="tp-calendar-abbreviations"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",

      flexWrap: "wrap",

      gap: "8px",
    }}
  >
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",

        gap: "7px",

        padding: "6px 9px",

        background:
          "linear-gradient(135deg,#F8FAFC,#FFFFFF)",

        border: "1px solid #E2E8F0",

        borderRadius: "9px",
      }}
    >
      <span
        style={{
          color: "#0F172A",

          fontSize: "10px",
          fontWeight: 800,

          letterSpacing: "0.4px",
        }}
      >
        HW
      </span>

      <span
        style={{
          color: "#CBD5E1",

          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        =
      </span>

      <span
        style={{
          color: "#64748B",

          fontSize: "10px",
          fontWeight: 700,
        }}
      >
        Homework Given After Class
      </span>
    </div>


    <div
      style={{
        display: "inline-flex",
        alignItems: "center",

        gap: "7px",

        padding: "6px 9px",

        background:
          "linear-gradient(135deg,#F8FAFC,#FFFFFF)",

        border: "1px solid #E2E8F0",

        borderRadius: "9px",
      }}
    >
      <span
        style={{
          color: "#0F172A",

          fontSize: "10px",
          fontWeight: 800,

          letterSpacing: "0.4px",
        }}
      >
        ACT
      </span>

      <span
        style={{
          color: "#CBD5E1",

          fontSize: "11px",
          fontWeight: 700,
        }}
      >
        =
      </span>

      <span
        style={{
          color: "#64748B",

          fontSize: "10px",
          fontWeight: 700,
        }}
      >
        Activity Performed In the Class
      </span>
    </div>
  </div>
</div>

</div>

    {/* =====================================================
        TOPICS MODAL
       ===================================================== */}

    {showTopicsModal && (
      <div style={modalOverlayStyle}>
        <div style={modalStyle}>
          <div style={modalHeroStyle}>
            <div
              style={{
                position: "relative",
                zIndex: 1,
              }}
            >
              <div style={eyebrowStyle}>
                CLASSROOM TEACHING HISTORY
              </div>

              <h2
                style={{
                  margin: "7px 0 5px",
                  color: "#0F172A",
                  fontSize: "25px",
                  fontWeight: 800,
                  letterSpacing: "-0.4px",
                }}
              >
                Topics Taught Today
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#64748B",
                  fontSize: "14px",
                  lineHeight: 1.55,
                }}
              >
                {selectedDayTopics.length} topics were
                covered during this lecture day.
              </p>
            </div>
          </div>

          {selectedDayTopics.map(
            (topic, index) => (
              <div
                key={topic.id}
                style={topicModalCard}
              >
                <div
                  style={{
                    color: "#F97316",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                  }}
                >
                  TOPIC {index + 1}
                </div>

                <h3
                  style={{
                    margin: "6px 0 12px",
                    color: "#0F172A",
                    fontSize: "18px",
                    fontWeight: 800,
                  }}
                >
                  {topic.topicName}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(3, 1fr)",
                    gap: "8px",
                  }}
                >
                  <ModalInfo
                    title="PAGES"
                    value={`${topic.pageFrom}-${topic.pageTo}`}
                  />

                  <ModalInfo
                    title="HOMEWORK"
                    value={
                      topic.homeworkGiven
                        ? "Yes"
                        : "No"
                    }
                  />

                  <ModalInfo
                    title="ACTIVITY"
                    value={
                      topic.activityConducted
                        ? "Yes"
                        : "No"
                    }
                  />
                </div>

                {topic.teacherNotes && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      background: "#F8FAFC",
                      border:
                        "1px solid #E2E8F0",
                      borderRadius: "10px",
                    }}
                  >
                    <div
                      style={{
                        color: "#94A3B8",
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.8px",
                      }}
                    >
                      TEACHER NOTES
                    </div>

                    <div
                      style={{
                        marginTop: "5px",
                        color: "#475569",
                        fontSize: "13px",
                        lineHeight: 1.55,
                      }}
                    >
                      {topic.teacherNotes}
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          <button
            onClick={() => {
              setShowTopicsModal(false);
            }}
            style={closeButtonStyle}
          >
            CLOSE TOPICS
          </button>
        </div>
      </div>
    )}

    {/* =====================================================
        MONTHLY SUMMARY
       ===================================================== */}

    <div className="tp-responsive-section" style={sectionCardStyle}>
      <div
        className="tp-section-header"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            TEACHING INTELLIGENCE
          </div>

          <h2 style={sectionTitleStyle}>
            Monthly Classroom Summary
          </h2>

          <p style={sectionDescriptionStyle}>
            A snapshot of teaching activity recorded across
            the selected classroom.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          CLASSROOM ACTIVITY LEDGER
        </div>
      </div>

  <div
  className="tp-responsive-grid-4"
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "20px",
  }}
>
        <SummaryCard
          eyebrow="TEACHING RECORD"
          title="Total Lectures"
          value={String(dailyLogs.length)}
          background="#FFF7ED"
          border="#FED7AA"
          color="#EA580C"
        />

        <SummaryCard
          eyebrow="ACADEMIC PRACTICE"
          title="Homework Days"
          value={String(
            dailyLogs.filter(
              (item) => item.homeworkGiven
            ).length
          )}
          background="#EFF6FF"
          border="#BFDBFE"
          color="#2563EB"
        />

        <SummaryCard
          eyebrow="ACTIVE LEARNING"
          title="Activity Days"
          value={String(
            dailyLogs.filter(
              (item) =>
                item.activityConducted
            ).length
          )}
          background="#F0FDF4"
          border="#BBF7D0"
          color="#16A34A"
        />

        <SummaryCard
          eyebrow="CURRICULUM PROGRESS"
          title="Completed Topics"
          value={String(dailyLogs.length)}
          background="#FAF5FF"
          border="#E9D5FF"
          color="#7C3AED"
        />
      </div>
    </div>

    {/* =====================================================
        STUDENTS AT RISK
       ===================================================== */}

    <div className="tp-responsive-section" style={sectionCardStyle}>
      <div
        className="tp-section-header"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            STUDENT LEARNING INTELLIGENCE
          </div>

          <h2 style={sectionTitleStyle}>
            Students Requiring Attention
          </h2>

          <p style={sectionDescriptionStyle}>
            Identify students showing repeated comprehension
            difficulty and requiring academic support.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          LEARNING RISK LEDGER
        </div>
      </div>

      <div className="teacher-risk-swipe-hint">
        <span>LEARNING RISK LEDGER</span>
        <strong>Swipe left or right to view all categories →</strong>
      </div>

      <div className="tp-risk-scroll">
      <div
        className="tp-responsive-grid-3 tp-risk-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "12px",
          marginTop: "18px",
        }}
      >

        <RiskCard
          eyebrow="IMMEDIATE ATTENTION"
          title="Very Critical"
          count={
            studentsAtRisk.veryCritical
              .length
          }
          students={
            studentsAtRisk.veryCritical
          }
          background="#FEF2F2"
          border="#FECACA"
          color="#DC2626"
          description={`3 consecutive "I didn't understand." responses.`}
        />

        <RiskCard
          eyebrow="ACADEMIC SUPPORT"
          title="Critical"
          count={
            studentsAtRisk.critical.length
          }
          students={
            studentsAtRisk.critical
          }
          background="#FFF7ED"
          border="#FED7AA"
          color="#EA580C"
          description={`2 "I didn't understand." and 1 "I partially understood." response.`}
        />

        <RiskCard
          eyebrow="EARLY ATTENTION"
          title="Moderate"
          count={
            studentsAtRisk.moderate.length
          }
          students={
            studentsAtRisk.moderate
          }
          background="#FFFBEB"
          border="#FDE68A"
          color="#CA8A04"
          description={`3 consecutive "I partially understood." responses.`}
        />
      </div>
      </div>
    </div>
  </div>
);

}

/* =========================================================
   UI COMPONENTS
   ========================================================= */

function InfoCard(props: any) {
  return (
    <div
      className="tp-responsive-card tp-info-card"
      style={{
        position: "relative",
        overflow: "hidden",

        minHeight: "108px",
        padding: "14px 16px",

        background: `linear-gradient(
          135deg,
          ${props.background} 0%,
          #FFFFFF 145%
        )`,

        border: `1px solid ${props.border}`,
        borderRadius: "16px",

        boxSizing: "border-box",
      }}
    >
      {/* DECORATIVE CORNER */}

      <div
        style={{
          position: "absolute",

          width: "78px",
          height: "78px",

          right: "-27px",
          top: "-31px",

          borderRadius: "50%",

          background: props.color,
          opacity: 0.055,

          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* EYEBROW */}

        <div
          style={{
            color: props.color,

            fontSize: "13px",
            fontWeight: 800,

            letterSpacing: "0.65px",
            textTransform: "uppercase",

            marginBottom: "10px",
          }}
        >
          {props.eyebrow}
        </div>

        {/* SMALL LABEL */}

        <div
          style={{
            color: "#475569",

            fontSize: "14px",
            fontWeight: 700,

            marginBottom: "5px",
          }}
        >
          {props.title}
        </div>

        {/* VALUE */}

        <div
          style={{
            color: props.color,

            fontSize: "27px",
            lineHeight: 1.05,

            fontWeight: 800,
            letterSpacing: "-0.45px",
          }}
        >
          {props.value}
        </div>
      </div>
    </div>
  );
}


/* --------------------------------------------------------- */

function SummaryCard(props: any) {
  return (
    <div
      className="tp-responsive-card tp-summary-card"
      style={{
        position: "relative",
        overflow: "hidden",

        minHeight: "108px",
        padding: "14px 16px",

        background: `linear-gradient(
          135deg,
          ${props.background} 0%,
          #FFFFFF 145%
        )`,

        border: `1px solid ${props.border}`,
        borderRadius: "16px",

        boxSizing: "border-box",
      }}
    >
      {/* DECORATIVE CORNER */}

      <div
        style={{
          position: "absolute",

          width: "78px",
          height: "78px",

          right: "-27px",
          top: "-31px",

          borderRadius: "50%",

          background: props.color,
          opacity: 0.055,

          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* EYEBROW */}

        <div
          style={{
            color: props.color,

            fontSize: "13px",
            fontWeight: 800,

            letterSpacing: "0.65px",
            textTransform: "uppercase",

            marginBottom: "9px",
          }}
        >
          {props.eyebrow}
        </div>

        {/* VALUE */}

        <div
          style={{
            color: props.color,

            fontSize: "34px",
            lineHeight: 1,

            fontWeight: 800,
            letterSpacing: "-0.6px",
          }}
        >
          {props.value}
        </div>

        {/* TITLE */}

        <div
          style={{
            marginTop: "9px",

            color: "#0F172A",

            fontSize: "17px",
            lineHeight: 1.25,

            fontWeight: 800,
          }}
        >
          {props.title}
        </div>
      </div>
    </div>
  );
}


/* --------------------------------------------------------- */

function RiskCard(props: any) {
  return (
    <div
      className="tp-responsive-card tp-risk-card"
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "205px",
        background: props.background,
        border: `1px solid ${props.border}`,
        borderRadius: "16px",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "80px",
          height: "80px",
          right: "-25px",
          top: "-28px",
          borderRadius: "50%",
          background:
            "rgba(255,255,255,0.42)",
        }}
      />

      <div
        className="tp-risk-content"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "16px",
        }}
      >
        <div
          className="tp-risk-eyebrow"
          style={{
            color: props.color,
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "0.8px",
          }}
        >
          {props.eyebrow}
        </div>

        <div
          className="tp-risk-title-row"
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "10px",
            marginTop: "8px",
          }}
        >
          <h3
            className="tp-risk-title"
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "18px",
              fontWeight: 800,
            }}
          >
            {props.title}
          </h3>

          <div
            className="tp-risk-count"
            style={{
              minWidth: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 7px",
              borderRadius: "10px",
              background:
                "rgba(255,255,255,0.65)",
              color: props.color,
              fontSize: "16px",
              fontWeight: 800,
            }}
          >
            {props.count}
          </div>
        </div>

        <p
          className="tp-risk-description"
          style={{
            margin: "8px 0 13px",
            minHeight: "30px",
            color: "#64748B",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {props.description}
        </p>

        <div
          className="tp-risk-students"
          style={{
            borderTop: `1px solid ${props.border}`,
            paddingTop: "10px",
          }}
        >
          {props.students.length === 0 ? (
            <div
              style={{
                padding: "9px",
                background:
                  "rgba(255,255,255,0.55)",
                borderRadius: "9px",
                color: "#94A3B8",
                fontSize: "12px",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              No students in this category
            </div>
          ) : (
            props.students.map(
              (name: string) => (
                <div
                  key={name}
                  style={{
                    padding: "7px 9px",
                    marginBottom: "6px",
                    background:
                      "rgba(255,255,255,0.75)",
                    borderRadius: "8px",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  {name}
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}


/* --------------------------------------------------------- */

function Legend(props: any) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "7px 10px",
        background: props.background,
        border:
          "1px solid rgba(148,163,184,0.22)",
        borderRadius: "999px",
        color: "#475569",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: props.color,
        }}
      />

      {props.label}
    </div>
  );
}


/* --------------------------------------------------------- */

function ModalInfo(props: any) {
  return (
    <div
      style={{
        padding: "9px",
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: "9px",
      }}
    >
      <div
        style={{
          color: "#94A3B8",
          fontSize: "10px",
          fontWeight: 800,
          letterSpacing: "0.7px",
        }}
      >
        {props.title}
      </div>

      <div
        style={{
          marginTop: "4px",
          color: "#0F172A",
          fontSize: "13px",
          fontWeight: 800,
        }}
      >
        {props.value}
      </div>
    
<style>{`
.tp-mobile-swipe-hint { display: none; }

@media (max-width: 1024px) {
  .tp-compact-page {
    padding: 16px !important;
    overflow-x: hidden !important;
    box-sizing: border-box !important;
  }

  .tp-page-hero {
    padding: 20px 22px !important;
    margin-bottom: 16px !important;
    border-radius: 20px !important;
  }

  .tp-page-hero > div:last-child {
    gap: 12px !important;
    align-items: center !important;
  }

  .tp-page-hero > div:last-child > div:first-child {
    min-width: 0 !important;
    flex: 1 1 auto !important;
  }

  .tp-page-hero h1 {
    font-size: 22px !important;
    line-height: 1.08 !important;
    letter-spacing: -0.3px !important;
    margin-top: 6px !important;
    margin-bottom: 6px !important;
  }

  .tp-page-hero p {
    font-size: 11px !important;
    line-height: 1.35 !important;
  }

  .tp-page-hero > div:last-child > div:last-child {
    width: 60px !important;
    height: 60px !important;
    min-width: 60px !important;
    border-radius: 15px !important;
  }

  .tp-compact-page h2 {
    font-size: 18px !important;
    line-height: 1.12 !important;
  }

  .tp-compact-page h3 {
    font-size: 14px !important;
    line-height: 1.2 !important;
  }

  .tp-compact-page p {
    line-height: 1.4 !important;
  }

  .tp-compact-page select,
  .tp-compact-page input,
  .tp-compact-page textarea {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .tp-compact-page table {
    font-size: 10px !important;
  }

  .tp-compact-page th,
  .tp-compact-page td {
    padding: 7px 8px !important;
    line-height: 1.2 !important;
  }
}

@media (max-width: 767px) {
  .tp-compact-page {
    padding: 12px !important;
  }

  .tp-page-hero {
    padding: 14px 15px !important;
    margin-bottom: 12px !important;
    border-radius: 16px !important;
  }

  .tp-page-hero h1 {
    font-size: 18px !important;
    line-height: 1.08 !important;
  }

  .tp-page-hero p {
    font-size: 9px !important;
    line-height: 1.32 !important;
  }

  .tp-page-hero > div:last-child > div:last-child {
    width: 50px !important;
    height: 50px !important;
    min-width: 50px !important;
    border-radius: 13px !important;
  }

  .tp-compact-page h2 {
    font-size: 15px !important;
  }

  .tp-compact-page h3 {
    font-size: 12px !important;
  }

  .tp-compact-page select,
  .tp-compact-page input {
    min-height: 34px !important;
    font-size: 9px !important;
  }

  .tp-compact-page button {
    min-height: 34px !important;
    font-size: 9px !important;
  }

  .tp-compact-page table {
    font-size: 8px !important;
  }

  .tp-compact-page th,
  .tp-compact-page td {
    padding: 5px 6px !important;
  }
}

@media (max-width: 1024px) {
  .teacher-calendar-swipe-hint {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    gap: 10px !important;
    margin: 14px 0 8px !important;
    padding: 8px 10px !important;
    border: 1px solid #FED7AA !important;
    border-radius: 10px !important;
    background: #FFF7ED !important;
    color: #9A3412 !important;
    font-size: 9px !important;
    line-height: 1.2 !important;
  }
}

@media (max-width: 767px) {
  .teacher-calendar-swipe-hint {
    margin: 10px 0 6px !important;
    padding: 7px 8px !important;
    font-size: 8px !important;
  }
}
`}</style>
</div>
  );
}


/* =========================================================
   PAGE STYLES
   ========================================================= */

const heroStyle = {
  position: "relative",
  overflow: "hidden",
  marginBottom: "18px",
  padding: "26px 28px",

  background:
    "linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 72%, #FFF9F3 100%)",

  border: "1px solid #E2E8F0",
  borderRadius: "24px",

  boxShadow:
    "0 10px 30px rgba(15, 23, 42, 0.045)",
} as const;


const heroOrangeCircle = {
  position: "absolute",

  width: "180px",
  height: "180px",

  right: "-60px",
  top: "-85px",

  borderRadius: "50%",

  background:
    "rgba(249, 115, 22, 0.06)",

  pointerEvents: "none",
} as const;


const heroSoftCircle = {
  position: "absolute",

  width: "95px",
  height: "95px",

  right: "120px",
  top: "-50px",

  borderRadius: "50%",

  background:
    "rgba(249, 115, 22, 0.035)",

  pointerEvents: "none",
} as const;


const heroBlueCircle = {
  position: "absolute",

  width: "150px",
  height: "150px",

  right: "180px",
  bottom: "-105px",

  borderRadius: "50%",

  background:
    "rgba(37, 99, 235, 0.04)",

  pointerEvents: "none",
} as const;


const heroBadgeStyle = {
  width: "82px",
  height: "82px",

  flexShrink: 0,

  display: "flex",
  flexDirection: "column",

  alignItems: "center",
  justifyContent: "center",

  background:
    "linear-gradient(145deg, #FFF8F1 0%, #FFFFFF 100%)",

  border: "1px solid #FED7AA",
  borderRadius: "22px",

  color: "#0F172A",

  boxShadow:
    "0 8px 20px rgba(249, 115, 22, 0.07)",
} as const;


const eyebrowStyle = {
  color: "#F97316",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "1.6px",

  textTransform:
    "uppercase" as const,
};


const orangePillStyle = {
  padding: "6px 10px",

  background: "#FFF7ED",

  border: "1px solid #FED7AA",
  borderRadius: "999px",

  color: "#C2410C",

  fontSize: "11px",
  fontWeight: 800,

  letterSpacing: "0.6px",
} as const;


const bluePillStyle = {
  padding: "6px 10px",

  background: "#EFF6FF",

  border: "1px solid #BFDBFE",
  borderRadius: "999px",

  color: "#1D4ED8",

  fontSize: "11px",
  fontWeight: 800,

  letterSpacing: "0.6px",
} as const;


const sectionCardStyle = {
  position: "relative",

  marginBottom: "18px",
  padding: "20px",

  background: "#FFFFFF",

  border: "1px solid #E2E8F0",
  borderRadius: "20px",

  boxShadow:
    "0 7px 24px rgba(15, 23, 42, 0.035)",
} as const;


const sectionTitleStyle = {
  margin: "6px 0 0",

  color: "#0F172A",

  fontSize: "21px",
  fontWeight: 800,

  letterSpacing: "-0.3px",
} as const;


const sectionDescriptionStyle = {
  margin: "5px 0 0",

  color: "#64748B",

  fontSize: "14px",

  lineHeight: 1.55,
} as const;


const ledgerLabelStyle = {
  color: "#94A3B8",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "1px",

  whiteSpace: "nowrap" as const,
};


const fieldLabelStyle = {
  marginBottom: "6px",

  color: "#64748B",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "0.8px",
} as const;


const dropdownStyle = {
  width: "100%",

  padding: "11px 12px",

  background: "#F8FAFC",

  border: "1px solid #CBD5E1",
  borderRadius: "11px",

  color: "#0F172A",

  fontSize: "15px",
  fontWeight: 600,

  outline: "none",

  boxSizing:
    "border-box" as const,
};


const calendarBadgeStyle = {
  display: "flex",

  alignItems: "center",

  gap: "9px",

  flexShrink: 0,

  padding: "9px 12px",

  background:
    "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)",

  border: "1px solid #FED7AA",
  borderRadius: "13px",

  color: "#F97316",
} as const;


const miniStatusPill = {
  padding: "4px 6px",

  background:
    "rgba(255,255,255,0.75)",

  border:
    "1px solid rgba(148,163,184,0.20)",

  borderRadius: "7px",

  color: "#64748B",

  fontSize: "10px",
  fontWeight: 700,
} as const;


const modalOverlayStyle = {
  position: "fixed",

  top: 0,
  left: 0,
  right: 0,
  bottom: 0,

  display: "flex",

  justifyContent: "center",
  alignItems: "center",

  padding: "20px",

  background:
    "rgba(15, 23, 42, 0.48)",

  backdropFilter: "blur(3px)",

  zIndex: 9999,
} as const;


const modalStyle = {
  width: "480px",
  maxWidth: "100%",

  maxHeight: "78vh",

  overflowY: "auto" as const,

  padding: "18px",

  background: "#FFFFFF",

  border: "1px solid #E2E8F0",

  borderRadius: "22px",

  boxShadow:
    "0 25px 70px rgba(15,23,42,0.22)",
} as const;


const modalHeroStyle = {
  position: "relative",

  overflow: "hidden",

  marginBottom: "14px",

  padding: "17px",

  background:
    "linear-gradient(135deg, #FFFFFF 0%, #FFF7ED 100%)",

  border: "1px solid #FED7AA",

  borderRadius: "16px",
} as const;


const topicModalCard = {
  marginBottom: "10px",

  padding: "14px",

  background: "#FFFFFF",

  border: "1px solid #E2E8F0",

  borderRadius: "14px",

  boxShadow:
    "0 4px 14px rgba(15,23,42,0.03)",
} as const;


const closeButtonStyle = {
  width: "100%",

  marginTop: "4px",

  padding: "11px 16px",

  background:
    "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",

  color: "#FFFFFF",

  border: "none",

  borderRadius: "11px",

  cursor: "pointer",

  fontSize: "13px",
  fontWeight: 800,

  letterSpacing: "0.5px",

  boxShadow:
    "0 7px 16px rgba(249,115,22,0.16)",
} as const;