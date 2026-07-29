
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

const identity =
requireIdentity();

const [selectedSubject,setSelectedSubject]
=
useState("");

const [selectedMonth, setSelectedMonth] =
  useState("July 2026");

  const [selectedWeek, setSelectedWeek] =
    useState("Entire Month");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

const [subjects, setSubjects] =
useState<string[]>([]);

const [

selectedDayTopics,

setSelectedDayTopics

]

=

useState<any[]>([]);


const [

showTopicsModal,

setShowTopicsModal

]

=

useState(false);

const [lectureLogs,setLectureLogs]
=
useState<any[]>([]);


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

selectedSubject &&

log.subject_name !==
selectedSubject

){

return false;

}


/* MONTH FILTER */


const logDate = new Date(log.log_date);

const logMonthYear =
  logDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

if (selectedMonth !== logMonthYear) {
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

console.log(filteredLogs);

const selectedMonthDate =
  new Date(`${selectedMonth} 1`);

const selectedYear =
  selectedMonthDate.getFullYear();

const selectedMonthIndex =
  selectedMonthDate.getMonth();

const totalDays =
  new Date(
    selectedYear,
    selectedMonthIndex + 1,
    0
  ).getDate();

const subjectTeacher =

filteredLogs.find(
(item) =>
item.subject_name === selectedSubject
);


const teacherName =

subjectTeacher?.teacher_name ??
"Not Available";

function loadSubjects() {

  if (!identity.className) {
    return;
  }

  const subjectList =
    getSubjectsByClass(
      identity.className
    );

setSubjects(subjectList);

if(subjectList.length > 0){

setSelectedSubject(
subjectList[0]
);

}

}

  return (
    <div className="cc-page space-y-6">
<style>{`
/* =========================================================
   CONTINUOUS CALENDAR — RESPONSIVE SYSTEM
   Desktop JSX / data / functionality remains untouched.
========================================================= */

.cc-page,
.cc-page * {
  box-sizing: border-box;
}

.cc-swipe-hint {
  display: none;
}

.cc-calendar-viewport {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}


/* =========================================================
   TABLET
   768px — 1024px
========================================================= */

@media (min-width: 768px) and (max-width: 1024px) {

  .cc-page {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow-x: hidden;
  }

  .cc-hero,
  .cc-custom-date,
  .cc-facilitator,
  .cc-calendar-shell {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }


  /* -------------------------
     HERO
  ------------------------- */

  .cc-hero {
    padding: 22px !important;
    border-radius: 22px !important;
  }

  .cc-hero > div:last-child {
    gap: 18px !important;
  }

  .cc-hero h1 {
    font-size: 28px !important;
    line-height: 1.08 !important;
  }

  .cc-hero p {
    line-height: 1.45 !important;
  }


  /* -------------------------
     FILTERS
  ------------------------- */

  .cc-filters {
    width: 100%;
    display: grid !important;
    grid-template-columns:
      repeat(3, minmax(0, 1fr)) auto !important;
    align-items: end !important;
    gap: 10px !important;
  }

  .cc-filters > div {
    min-width: 0;
  }

  .cc-filters select {
    width: 100% !important;
    min-width: 0 !important;
  }


  /* -------------------------
     CUSTOM DATE
  ------------------------- */

  .cc-custom-date {
    padding: 20px !important;
    border-radius: 20px !important;
  }

  .cc-custom-date > div:last-child {
    display: grid !important;
    grid-template-columns:
      repeat(2, minmax(0, 1fr)) !important;
    gap: 12px !important;
  }

  .cc-custom-date input {
    width: 100% !important;
  }


  /* -------------------------
     TEACHER
  ------------------------- */

  .cc-facilitator {
    padding: 22px !important;
    border-radius: 22px !important;
  }


  /* =====================================================
     TABLET CALENDAR
  ===================================================== */

  .cc-calendar-shell {
    padding: 22px !important;
    border-radius: 22px !important;

    /*
       Important:
       shell itself does NOT horizontally scroll.
       Only the calendar viewport scrolls.
    */
    overflow: hidden !important;
  }


  .cc-swipe-hint {
    display: flex !important;
    align-items: center;
    justify-content: space-between;
    gap: 12px;

    width: 100%;
    margin-top: 18px;
    padding: 9px 12px;

    border: 1px solid #FED7AA;
    border-radius: 11px;

    background: #FFF7ED;
    color: #9A3412;

    font-size: 10px;
    line-height: 1.25;
  }

  .cc-swipe-hint span {
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .cc-swipe-hint strong {
    font-weight: 800;
    text-align: right;
  }


  /*
     The viewport is the ONLY horizontal scroller.

     It remains in normal document flow, therefore its
     height is determined by the weekday row + calendar grid.
  */

  .cc-calendar-viewport {
    display: block !important;

    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;

    margin-top: 0;

    overflow-x: auto !important;
    overflow-y: visible !important;

    -webkit-overflow-scrolling: touch;

    touch-action: pan-x pan-y;

    scrollbar-width: thin;

    position: relative;
  }


  /*
     Fixed internal calendar width.
     This prevents seven columns being compressed.
  */

  .cc-weekdays,
  .cc-calendar-grid {
    display: grid !important;

    grid-template-columns:
      repeat(7, 104px) !important;

    width: 764px !important;
    min-width: 764px !important;
    max-width: none !important;

    gap: 6px !important;
  }


  .cc-weekdays {
    margin-top: 22px !important;
    margin-bottom: 8px !important;
  }

  .cc-weekdays > div {
    width: 104px !important;
  }


  .cc-calendar-grid {
    grid-auto-flow: row !important;
    grid-auto-rows: minmax(112px, auto) !important;

    align-items: stretch !important;

    padding-bottom: 4px !important;
  }


  /*
     Works for both lecture cards and empty cards.
  */

  .cc-calendar-grid > div {
    width: 104px !important;
    min-width: 104px !important;

    min-height: 112px !important;

    padding: 10px !important;

    border-radius: 13px !important;

    position: relative !important;
    overflow: hidden !important;

    display: block !important;

    visibility: visible !important;
    opacity: 1 !important;

    transform: none !important;
  }


  /* -------------------------
     MODAL
  ------------------------- */

  .cc-modal-overlay {
    position: fixed !important;
    inset: 0 !important;

    z-index: 9999 !important;

    margin: 0 !important;
    padding: 24px !important;

    background: rgba(15, 23, 42, 0.58) !important;

    backdrop-filter: blur(5px);

    align-items: center !important;
    justify-content: center !important;
  }

  .cc-modal-panel {
    width: min(700px, 100%) !important;
    max-height: 88vh !important;

    padding: 24px !important;

    border-radius: 22px !important;
  }
}



/* =========================================================
   MOBILE
   0px — 767px
========================================================= */

@media (max-width: 767px) {

  .cc-page {
    width: 100%;
    max-width: 100%;
    min-width: 0;

    overflow-x: hidden;

    gap: 12px !important;
  }


  .cc-hero,
  .cc-custom-date,
  .cc-facilitator,
  .cc-calendar-shell {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }


  /* =====================================================
     HERO
  ===================================================== */

  .cc-hero {
    padding: 15px !important;
    border-radius: 18px !important;
  }

  .cc-hero > div:last-child {
    gap: 13px !important;
  }

  .cc-hero h1 {
    margin-top: 6px !important;

    font-size: 22px !important;
    line-height: 1.08 !important;
  }

  .cc-hero p:first-child {
    font-size: 8px !important;
    letter-spacing: 0.16em !important;
  }

  .cc-hero h1 + p {
    margin-top: 6px !important;

    max-width: 100% !important;

    font-size: 10.5px !important;
    line-height: 1.4 !important;
  }


  /* =====================================================
     FILTERS
  ===================================================== */

  .cc-filters {
    width: 100%;

    display: grid !important;

    grid-template-columns:
      repeat(3, minmax(0, 1fr)) !important;

    gap: 6px !important;
  }

  .cc-filters > div {
    min-width: 0 !important;
  }

  .cc-filters > div:last-child {
    display: none !important;
  }

  .cc-filters p {
    margin-bottom: 4px !important;

    font-size: 7px !important;
    letter-spacing: 0.08em !important;
  }

  .cc-filters select {
    width: 100% !important;
    min-width: 0 !important;

    height: 36px !important;

    padding: 0 7px !important;

    border-radius: 9px !important;

    font-size: 9px !important;
  }


  /* =====================================================
     CUSTOM DATE
  ===================================================== */

  .cc-custom-date {
    padding: 14px !important;
    border-radius: 17px !important;
  }

  .cc-custom-date h2 {
    font-size: 15px !important;
  }

  .cc-custom-date > p {
    margin-top: 4px !important;

    font-size: 10px !important;
    line-height: 1.4 !important;
  }

  .cc-custom-date > div:last-child {
    margin-top: 12px !important;

    display: grid !important;

    grid-template-columns:
      repeat(2, minmax(0, 1fr)) !important;

    gap: 8px !important;
  }

  .cc-custom-date > div:last-child p {
    margin-bottom: 4px !important;
    font-size: 9px !important;
  }

  .cc-custom-date input {
    width: 100% !important;
    min-width: 0 !important;

    padding: 8px !important;

    border-radius: 9px !important;

    font-size: 10px !important;
  }


  /* =====================================================
     TEACHER
  ===================================================== */

  .cc-facilitator {
    padding: 14px !important;
    border-radius: 17px !important;
  }

  .cc-facilitator h2 {
    margin-top: 5px !important;

    font-size: 17px !important;
  }

  .cc-facilitator h2 + p {
    margin-top: 5px !important;

    font-size: 10px !important;
  }

  .cc-facilitator > div:last-child {
    margin-top: 12px !important;

    padding: 11px !important;

    gap: 8px !important;

    border-radius: 13px !important;
  }

  .cc-facilitator
    > div:last-child
    > div:first-child {
    gap: 9px !important;
  }

  .cc-facilitator
    > div:last-child
    > div:first-child
    > div:first-child {
    width: 36px !important;
    height: 36px !important;

    border-radius: 9px !important;

    font-size: 15px !important;
  }

  .cc-facilitator h3 {
    font-size: 13px !important;
  }

  .cc-facilitator h3 + p {
    font-size: 9px !important;
  }

  .cc-facilitator
    > div:last-child
    > div:last-child {
    padding: 7px 9px !important;

    border-radius: 9px !important;
  }


  /* =====================================================
     CALENDAR SHELL
  ===================================================== */

  .cc-calendar-shell {
    width: 100% !important;
    max-width: 100% !important;

    padding: 12px 8px 14px !important;

    border-radius: 17px !important;

    /*
       The outside card stays fixed to the phone width.
       Horizontal scrolling happens INSIDE viewport.
    */

    overflow: hidden !important;
  }


  .cc-calendar-shell h2 {
    margin-top: 4px !important;

    font-size: 16px !important;
    line-height: 1.15 !important;
  }

  .cc-calendar-shell h2 + p {
    margin-top: 4px !important;

    font-size: 9.5px !important;
    line-height: 1.35 !important;
  }


  /* =====================================================
     SWIPE MESSAGE
  ===================================================== */

  .cc-swipe-hint {
    display: flex !important;

    align-items: center;
    justify-content: space-between;

    gap: 8px;

    width: 100% !important;

    margin-top: 12px;

    padding: 7px 9px;

    border: 1px solid #FED7AA;
    border-radius: 11px;

    background: #FFF7ED;

    color: #9A3412;

    font-size: 8px;
    line-height: 1.25;
  }

  .cc-swipe-hint span {
    flex-shrink: 0;

    font-weight: 900;

    text-transform: uppercase;

    letter-spacing: 0.08em;
  }

  .cc-swipe-hint strong {
    font-weight: 800;

    text-align: right;
  }


  /* =====================================================
     REAL MOBILE CALENDAR VIEWPORT

     IMPORTANT:
     - stays in normal document flow
     - receives its height from the calendar
     - horizontal scrolling only
     - no sticky positioning
     - no absolute positioning
     - no max-content
     - no viewport-width calculations
  ===================================================== */

  .cc-calendar-viewport {
    display: block !important;

    position: relative !important;

    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;

    height: auto !important;
    min-height: 0 !important;

    margin: 0 !important;
    padding: 0 !important;

    overflow-x: auto !important;
    overflow-y: visible !important;

    -webkit-overflow-scrolling: touch;

    touch-action: pan-x pan-y;

    overscroll-behavior-x: contain;

    scrollbar-width: thin;
  }


  /* =====================================================
     WEEKDAY TRACK

     7 × 92px
     6 × 5px gaps

     Total:
     644 + 30 = 674px
  ===================================================== */

  .cc-weekdays {
    display: grid !important;

    grid-template-columns:
      repeat(7, 92px) !important;

    column-gap: 5px !important;
    row-gap: 0 !important;

    width: 674px !important;
    min-width: 674px !important;
    max-width: none !important;

    margin-top: 14px !important;
    margin-bottom: 5px !important;

    position: relative !important;

    visibility: visible !important;
    opacity: 1 !important;
  }


  .cc-weekdays > div {
    display: block !important;

    width: 92px !important;
    min-width: 92px !important;

    font-size: 8px !important;

    letter-spacing: 0.25px !important;

    text-align: center !important;

    visibility: visible !important;
    opacity: 1 !important;
  }


  /* =====================================================
     CALENDAR GRID

     Completely rebuilt responsive behaviour.

     JSX remains the desktop JSX.
     Data remains the desktop data.
  ===================================================== */

  .cc-calendar-grid {
    display: grid !important;

    grid-template-columns:
      repeat(7, 92px) !important;

    grid-auto-flow: row !important;

    /*
       This is important.

       Each row has a REAL height, meaning Safari/iOS cannot
       collapse the calendar beneath the weekday labels.
    */

    grid-auto-rows: 104px !important;

    column-gap: 5px !important;
    row-gap: 5px !important;

    width: 674px !important;
    min-width: 674px !important;
    max-width: none !important;

    height: auto !important;
    min-height: 104px !important;

    margin: 0 !important;

    padding: 0 0 3px 0 !important;

    position: relative !important;

    align-items: stretch !important;

    visibility: visible !important;
    opacity: 1 !important;

    overflow: visible !important;

    transform: none !important;
  }


  /* =====================================================
     EVERY CALENDAR CELL

     Target the DIRECT grid children rather than depending
     on cc-day-card being present.

     This means:
     - empty days appear
     - lecture days appear
     - existing desktop JSX does not need modification
  ===================================================== */

  .cc-calendar-grid > div {
    display: block !important;

    position: relative !important;

    width: 92px !important;
    min-width: 92px !important;
    max-width: 92px !important;

    height: 104px !important;
    min-height: 104px !important;
    max-height: 104px !important;

    padding: 7px !important;

    margin: 0 !important;

    border-radius: 10px !important;

    overflow: hidden !important;

    visibility: visible !important;
    opacity: 1 !important;

    transform: none !important;

    flex: none !important;

    align-self: stretch !important;
  }


  /* =====================================================
     DECORATIVE CIRCLE
  ===================================================== */

  .cc-calendar-grid
    > div
    > div:first-child {
    width: 34px !important;
    height: 34px !important;

    right: -12px !important;
    top: -12px !important;
  }


  /* =====================================================
     DATE NUMBER
  ===================================================== */

  .cc-calendar-grid
    > div
    > div:nth-child(2) {
    margin-bottom: 7px !important;

    font-size: 11px !important;
  }


  /* =====================================================
     TOPIC AREA
  ===================================================== */

  .cc-calendar-grid
    > div
    > div:nth-child(3) {
    min-width: 0 !important;
    max-width: 100% !important;
  }


  .cc-calendar-grid
    > div
    > div:nth-child(3)
    > div {
    display: block !important;

    width: 100% !important;
    max-width: 100% !important;

    padding: 4px 5px !important;

    margin-bottom: 5px !important;

    border-radius: 7px !important;

    font-size: 8px !important;
    line-height: 1.15 !important;

    overflow: hidden !important;

    text-overflow: ellipsis !important;

    white-space: nowrap !important;
  }


  .cc-calendar-grid
    > div
    > div:nth-child(3)
    > p {
    font-size: 8px !important;

    line-height: 1.25 !important;
  }


  /* =====================================================
     VIEW TOPICS BUTTON
  ===================================================== */

  .cc-calendar-grid button {
    display: block !important;

    width: 100% !important;

    margin-top: 5px !important;

    padding: 0 !important;

    font-size: 7.5px !important;
    line-height: 1.25 !important;

    text-align: left !important;

    white-space: normal !important;
  }


  /* =====================================================
     PAGE / HOMEWORK AREA
  ===================================================== */

  .cc-calendar-grid
    > div
    > div:last-child {
    margin-top: 5px !important;

    font-size: 7.5px !important;
    line-height: 1.25 !important;
  }


  .cc-calendar-grid
    > div
    > div:last-child p {
    margin: 0 !important;

    font-size: 7.5px !important;
    line-height: 1.15 !important;
  }


  /* =====================================================
     EMPTY DAY MESSAGE

     The existing inline flex rules remain intact.
  ===================================================== */

  .cc-calendar-grid
    > div
    > div:last-child
    > p {
    max-width: 100% !important;

    overflow-wrap: normal !important;
    word-break: normal !important;
  }


  /* =====================================================
     MODAL
  ===================================================== */

  .cc-modal-overlay {
    position: fixed !important;

    inset: 0 !important;

    z-index: 9999 !important;

    margin: 0 !important;

    padding: 10px !important;

    background: rgba(15, 23, 42, 0.58) !important;

    align-items: center !important;
    justify-content: center !important;
  }


  .cc-modal-panel {
    width: 100% !important;

    max-height: 92vh !important;

    padding: 12px !important;

    border-radius: 17px !important;
  }


  .cc-modal-panel > div:first-child {
    padding: 15px !important;

    margin-bottom: 12px !important;

    border-radius: 14px !important;
  }


  .cc-modal-panel
    > div:first-child p {
    font-size: 8px !important;
  }


  .cc-modal-panel
    > div:first-child h1 {
    margin: 5px 0 !important;

    font-size: 18px !important;
  }


  .cc-modal-panel
    > div:not(:first-child) {
    padding: 12px !important;

    margin-bottom: 9px !important;

    border-radius: 12px !important;
  }


  .cc-modal-panel h3 {
    margin-bottom: 8px !important;

    font-size: 14px !important;
  }


  .cc-modal-panel p {
    font-size: 10px !important;

    line-height: 1.4 !important;
  }
}

/* =========================================================
   FINAL CALENDAR RENDERER
   Desktop and mobile/tablet are independent.
========================================================= */

.cc-desktop-calendar {
  display: block;
}

.cc-mobile-calendar {
  display: none;
}


/* =========================================================
   MOBILE + TABLET
========================================================= */

@media (max-width: 1024px) {

  /* -----------------------------------------
     OUTER CALENDAR CARD
  ----------------------------------------- */

  .cc-calendar-shell {
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;

    padding: 20px !important;

    border-radius: 22px !important;

    overflow: hidden !important;
  }


  /* -----------------------------------------
     HEADER
  ----------------------------------------- */

  .cc-calendar-header {
    display: block !important;

    width: 100% !important;

    padding: 0 !important;
  }

  .cc-calendar-header h2 {
    margin-top: 6px !important;

    font-size: 20px !important;
    line-height: 1.15 !important;
  }

  .cc-calendar-header h2 + p {
    margin-top: 6px !important;

    max-width: 520px;

    font-size: 12px !important;
    line-height: 1.45 !important;
  }

  .cc-monthly-ledger {
    display: none !important;
  }


  /* -----------------------------------------
     SWITCH RENDERERS
  ----------------------------------------- */

  .cc-desktop-calendar {
    display: none !important;
  }

  .cc-mobile-calendar {
    display: block !important;

    position: relative;

    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;

    margin-top: 18px;
  }


  /* -----------------------------------------
     SWIPE BAR

     THIS DOES NOT SCROLL
  ----------------------------------------- */

  .cc-mobile-swipe-hint {
    position: relative;
    z-index: 5;

    display: flex;

    align-items: center;
    justify-content: space-between;

    gap: 12px;

    width: 100%;

    padding: 10px 12px;

    border: 1px solid #FED7AA;
    border-radius: 12px;

    background: #FFF7ED;

    color: #9A3412;

    font-size: 10px;
    line-height: 1.25;
  }

  .cc-mobile-swipe-hint span {
    flex-shrink: 0;

    font-weight: 900;

    text-transform: uppercase;

    letter-spacing: .08em;
  }

  .cc-mobile-swipe-hint strong {
    min-width: 0;

    font-weight: 800;

    text-align: right;
  }


  /* -----------------------------------------
     REAL SCROLL VIEWPORT
  ----------------------------------------- */

  .cc-mobile-scroll {
    position: relative;

    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;

    margin-top: 14px;

    overflow-x: auto !important;
    overflow-y: hidden !important;

    -webkit-overflow-scrolling: touch;

    overscroll-behavior-x: contain;

    touch-action: pan-x pan-y;

    scrollbar-width: thin;

    padding-bottom: 8px;
  }


  /* -----------------------------------------
     FIXED-WIDTH TRACK

     7 columns × 96px + gaps.
     This is intentionally wider than phone.
  ----------------------------------------- */

  .cc-mobile-track {
    width: max-content !important;
    min-width: max-content !important;

    padding-right: 14px;
  }


  /* -----------------------------------------
     WEEKDAYS
  ----------------------------------------- */

  .cc-mobile-weekdays {
    display: grid !important;

    grid-template-columns:
      repeat(7, 96px) !important;

    gap: 7px !important;

    width: max-content !important;

    margin-bottom: 7px;
  }

  .cc-mobile-weekday {
    width: 96px;

    text-align: center;

    color: #64748B;

    font-size: 9px;
    font-weight: 900;

    letter-spacing: .7px;
  }


  /* -----------------------------------------
     CALENDAR GRID
  ----------------------------------------- */

  .cc-mobile-grid {
    display: grid !important;

    grid-template-columns:
      repeat(7, 96px) !important;

    gap: 7px !important;

    width: max-content !important;
  }


  /* -----------------------------------------
     BASE DAY CARD
  ----------------------------------------- */

  .cc-mobile-day {
    position: relative;

    width: 96px !important;
    min-width: 96px !important;

    height: 116px !important;
    min-height: 116px !important;

    padding: 10px !important;

    border-radius: 13px;

    overflow: hidden;

    display: flex;

    flex-direction: column;

    box-shadow:
      0 2px 6px rgba(15,23,42,.025);
  }


  /* -----------------------------------------
     EMPTY DAY
  ----------------------------------------- */

  .cc-mobile-day-empty {
    border: 1px solid #FDBA74;

    background:
      linear-gradient(
        135deg,
        #FFF9EF 0%,
        #FFFCF7 100%
      );
  }


  /* -----------------------------------------
     LECTURE DAY
  ----------------------------------------- */

  .cc-mobile-day-lecture {
    border: 1px solid #BBF7D0;

    background:
      linear-gradient(
        135deg,
        #F7FFF8 0%,
        #FFFFFF 100%
      );
  }


  /* -----------------------------------------
     DECORATIVE CORNER
  ----------------------------------------- */

  .cc-mobile-corner {
    position: absolute;

    width: 40px;
    height: 40px;

    border-radius: 50%;

    right: -14px;
    top: -14px;

    pointer-events: none;
  }

  .cc-mobile-corner-empty {
    background:
      rgba(255,237,213,.82);
  }

  .cc-mobile-corner-lecture {
    background:
      rgba(220,252,231,.82);
  }


  /* -----------------------------------------
     DATE
  ----------------------------------------- */

  .cc-mobile-date {
    position: relative;
    z-index: 1;

    flex-shrink: 0;

    color: #0F172A;

    font-size: 12px;
    font-weight: 900;

    line-height: 1;
  }


  /* -----------------------------------------
     EMPTY MESSAGE
  ----------------------------------------- */

  .cc-mobile-empty-content {
    position: relative;
    z-index: 1;

    flex: 1;

    display: flex;

    flex-direction: column;

    align-items: center;
    justify-content: center;

    text-align: center;

    color: #EA580C;

    font-size: 9px;
    font-weight: 800;

    line-height: 1.3;
  }


  /* -----------------------------------------
     TOPIC
  ----------------------------------------- */

  .cc-mobile-topic {
    position: relative;
    z-index: 1;

    display: block;

    width: 100%;

    margin-top: 10px;

    padding: 5px 6px;

    border-radius: 8px;

    background: #DCFCE7;

    color: #15803D;

    font-size: 8.5px;
    font-weight: 900;

    line-height: 1.2;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;
  }


  /* -----------------------------------------
     PAGES
  ----------------------------------------- */

  .cc-mobile-pages {
    position: relative;
    z-index: 1;

    margin-top: 6px;

    color: #64748B;

    font-size: 8px;
    font-weight: 700;

    line-height: 1.2;

    white-space: nowrap;

    overflow: hidden;

    text-overflow: ellipsis;
  }


  /* -----------------------------------------
     MORE TOPICS
  ----------------------------------------- */

  .cc-mobile-view-all {
    position: relative;
    z-index: 1;

    align-self: flex-start;

    margin-top: 5px;

    padding: 0;

    border: none;

    background: transparent;

    color: #2563EB;

    font-size: 8px;
    font-weight: 900;

    cursor: pointer;
  }


  /* -----------------------------------------
     HOMEWORK
  ----------------------------------------- */

  .cc-mobile-homework {
    position: relative;
    z-index: 1;

    margin-top: auto;

    padding-top: 5px;

    color: #64748B;

    font-size: 8px;
    font-weight: 700;

    line-height: 1;
  }

  .cc-mobile-homework strong {
    color: #334155;
  }

}


/* =========================================================
   PHONE
========================================================= */

@media (max-width: 767px) {

  .cc-calendar-shell {
    padding: 15px 12px 16px !important;

    border-radius: 18px !important;
  }

  .cc-calendar-header h2 {
    font-size: 18px !important;
  }

  .cc-calendar-header h2 + p {
    font-size: 10.5px !important;

    line-height: 1.4 !important;
  }

  .cc-mobile-calendar {
    margin-top: 14px;
  }

  .cc-mobile-swipe-hint {
    padding: 9px 10px;

    gap: 8px;

    font-size: 8.5px;
  }

  .cc-mobile-scroll {
    margin-top: 12px;
  }

}


/* =========================================================
   SMALL PHONE
========================================================= */

@media (max-width: 420px) {

  .cc-calendar-shell {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }

  .cc-mobile-swipe-hint {
    font-size: 8px;
  }

  .cc-mobile-weekdays,
  .cc-mobile-grid {
    grid-template-columns:
      repeat(7, 90px) !important;

    gap: 6px !important;
  }

  .cc-mobile-weekday {
    width: 90px;
  }

  .cc-mobile-day {
    width: 90px !important;
    min-width: 90px !important;
  }

}

`}</style>
   {/* =========================================================
    CONTINUOUS CALENDAR HERO
========================================================= */}

<div
  className="cc-hero relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-8 py-7 shadow-sm"
  style={{
    background:
      "linear-gradient(135deg,#FFFFFF 0%,#FFFFFF 70%,#FFF7ED 100%)",
  }}
>

  {/* Decorative background circles */}

  <div
    className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full"
    style={{
      background: "rgba(255,237,213,0.55)",
    }}
  />

  <div
    className="pointer-events-none absolute right-[300px] -bottom-24 h-44 w-44 rounded-full"
    style={{
      background: "rgba(239,246,255,0.8)",
    }}
  />


  <div className="relative z-10 flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">


    {/* =====================================================
        LEFT — PAGE IDENTITY
    ===================================================== */}

    <div className="min-w-0 flex-1">

      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">
        Student Academic Continuity
      </p>

      <h1 className="mt-3 text-[30px] font-black leading-tight text-slate-900 md:text-[34px]">
        
      </h1>

      <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
        Review your classroom teaching history, covered topics and
        academic continuity across the school year.
      </p>

    </div>


    {/* =====================================================
        RIGHT — FILTERS
    ===================================================== */}

    <div className="cc-filters flex flex-wrap items-end gap-3">


      {/* SUBJECT */}

      <div>

        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
          Subject
        </p>

        <select
          value={selectedSubject}
          onChange={(e) =>
            setSelectedSubject(e.target.value)
          }
          className="h-11 w-48 rounded-xl border border-orange-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-400"
        >

          {subjects.map((subject) => (

            <option
              key={subject}
              value={subject}
            >
              {subject}
            </option>

          ))}

        </select>

      </div>


      {/* MONTH */}

      <div>

        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
          Month
        </p>

        <select
          value={selectedMonth}
          onChange={(e) =>
            setSelectedMonth(e.target.value)
          }
          className="h-11 w-44 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-400"
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


      {/* WEEK */}

      <div>

        <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
          Week
        </p>

        <select
          value={selectedWeek}
          onChange={(e) =>
            setSelectedWeek(e.target.value)
          }
          className="h-11 w-44 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition focus:border-orange-400"
        >

          <option>
            Entire Month
          </option>

          <option>
            Week 1
          </option>

          <option>
            Week 2
          </option>

          <option>
            Week 3
          </option>

          <option>
            Week 4
          </option>

          <option>
            Week 5
          </option>

          <option>
            Custom Date Selection
          </option>

        </select>

      </div>


      {/* PAGE ICON */}

      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-200 bg-white text-xl shadow-sm"
        title="Continuous Calendar"
      >
        📅
      </div>

    </div>

  </div>

</div>

{
  selectedWeek === "Custom Date Selection" && (

    <div className="cc-custom-date rounded-3xl bg-white p-6 shadow-sm">

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

{/* =========================================================
    ASSIGNED SUBJECT FACILITATOR
========================================================= */}

<div
  className="cc-facilitator relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
>

  <div
    className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full"
    style={{
      background: "rgba(239,246,255,0.8)",
    }}
  />


  {/* SECTION HEADER */}

  <div className="relative z-10 flex items-start justify-between gap-4">

    <div>

      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
        Classroom Academic Connection
      </p>

      <h2 className="mt-2 text-xl font-black text-slate-900">
        Assigned Subject Teacher
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        
      </p>

    </div>


    <div className="hidden rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-blue-600 md:block">
      Academic Session 2026–2027
    </div>

  </div>


  {/* FACILITATOR CARD */}

  <div
    className="relative z-10 mt-6 flex flex-col gap-4 rounded-2xl border border-blue-200 px-6 py-5 md:flex-row md:items-center md:justify-between"
    style={{
      background:
        "linear-gradient(135deg,#EFF6FF,#FFFFFF)",
    }}
  >

    <div className="flex items-center gap-4">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-200 bg-white text-xl shadow-sm">
        👨‍🏫
      </div>


      <div>

        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-blue-600">
          Teacher Name
        </p>

        <h3 className="mt-1 text-lg font-black text-slate-900">
          {teacherName}
        </h3>

        <p className="mt-1 text-sm font-semibold text-slate-500">
          {selectedSubject} Subject Facilitator
        </p>

      </div>

    </div>


    <div className="rounded-xl border border-blue-200 bg-white px-5 py-3">

      <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
        Academic Session
      </p>

      <p className="mt-1 text-sm font-black text-blue-600">
        2026–2027
      </p>

    </div>

  </div>

</div>

{/* =========================================================
    CONTINUOUS CLASSROOM CALENDAR
========================================================= */}
{/* =========================================================
    CONTINUOUS CLASSROOM CALENDAR
    DESKTOP + INDEPENDENT MOBILE/TABLET RENDERER
========================================================= */}

<div
  className="cc-calendar-shell relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
  style={{
    overflow: "hidden",
  }}
>

  {/* DECORATIVE BACKGROUND */}

  <div
    className="pointer-events-none absolute -right-12 -top-14 h-40 w-40 rounded-full"
    style={{
      background: "rgba(255,247,237,0.9)",
    }}
  />


  {/* =====================================================
      HEADER
  ===================================================== */}

  <div className="cc-calendar-header relative z-10 flex items-start justify-between gap-5">

    <div>

      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
        Learning Continuity
      </p>

      <h2 className="mt-2 text-xl font-black text-slate-900">
        See Your Classroom Calendar
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Review lectures, topics, pages and classroom activity
        recorded throughout the selected month.
      </p>

    </div>


    <div className="cc-monthly-ledger rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-orange-600">
      Monthly Learning Ledger
    </div>

  </div>


  {/* =========================================================
      DESKTOP CALENDAR
      ONLY > 1024px
  ========================================================= */}

  <div className="cc-desktop-calendar">

    {/* WEEK DAYS */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: 12,
        marginTop: 30,
        marginBottom: 12,
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
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: 1.2,
            color: "#64748B",
          }}
        >
          {day}
        </div>

      ))}

    </div>


    {/* DESKTOP GRID */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: 12,
      }}
    >

      {Array.from({ length: totalDays }).map((_, index) => {

        const day = index + 1;

        const logsForDay =
          filteredLogs.filter((item) => {

            const currentDate =
              new Date(item.log_date);

            return (
              currentDate.getDate() === day
            );

          });


        const visibleTopics =
          logsForDay.slice(0, 1);

        const remainingTopics =
          logsForDay.length - 1;


        /* =====================================================
            DESKTOP EMPTY DAY
        ===================================================== */

        if (logsForDay.length === 0) {

          return (

            <div
              key={`desktop-${day}`}
              style={{
                position: "relative",
                overflow: "hidden",

                minHeight: 116,

                padding: "14px 14px",

                borderRadius: 15,

                border:
                  "1px solid #FDBA74",

                background:
                  "linear-gradient(135deg,#FFF9EF 0%,#FFFCF7 100%)",

                display: "flex",
                flexDirection: "column",

                boxShadow:
                  "0 2px 6px rgba(15,23,42,0.02)",
              }}
            >

              <div
                style={{
                  position: "absolute",

                  width: 54,
                  height: 54,

                  borderRadius: "50%",

                  right: -18,
                  top: -18,

                  background:
                    "rgba(255,237,213,0.75)",

                  pointerEvents: "none",
                }}
              />


              <div
                style={{
                  position: "relative",
                  zIndex: 1,

                  fontWeight: 800,
                  fontSize: 14,

                  lineHeight: 1,

                  color: "#0F172A",
                }}
              >
                {day}
              </div>


              <div
                style={{
                  position: "relative",
                  zIndex: 1,

                  flex: 1,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  paddingBottom: 3,
                }}
              >

                <p
                  style={{
                    margin: 0,

                    textAlign: "center",

                    fontSize: 10,
                    lineHeight: 1.3,

                    color: "#EA580C",

                    fontWeight: 800,
                  }}
                >
                  No Lecture Conducted
                </p>

              </div>

            </div>

          );

        }


        /* =====================================================
            DESKTOP LECTURE DAY
        ===================================================== */

        return (

          <div
            key={`desktop-${day}`}
            style={{
              position: "relative",
              overflow: "hidden",

              minHeight: 116,

              padding: "14px 14px",

              borderRadius: 15,

              border:
                "1px solid #BBF7D0",

              background:
                "linear-gradient(135deg,#F7FFF8,#FFFFFF)",

              display: "flex",
              flexDirection: "column",

              boxShadow:
                "0 2px 6px rgba(15,23,42,0.02)",
            }}
          >

            <div
              style={{
                position: "absolute",

                width: 54,
                height: 54,

                borderRadius: "50%",

                right: -18,
                top: -18,

                background:
                  "rgba(220,252,231,0.75)",

                pointerEvents: "none",
              }}
            />


            <div
              style={{
                position: "relative",
                zIndex: 1,

                fontWeight: 800,
                fontSize: 14,

                lineHeight: 1,

                color: "#0F172A",

                marginBottom: 12,
              }}
            >
              {day}
            </div>


            {visibleTopics.map((topic) => (

              <div
                key={topic.id}
                style={{
                  position: "relative",
                  zIndex: 1,
                }}
              >

                <div
                  style={{
                    display: "inline-flex",

                    maxWidth: "100%",

                    padding: "5px 8px",

                    borderRadius: 10,

                    background: "#DCFCE7",

                    color: "#15803D",

                    fontWeight: 800,
                    fontSize: 10,

                    marginBottom: 8,

                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {topic.topic_name}
                </div>


                <p
                  style={{
                    margin: 0,

                    fontSize: 10,
                    fontWeight: 600,

                    color: "#64748B",
                  }}
                >
                  Pages: {topic.page_from}–{topic.page_to}
                </p>

              </div>

            ))}


            {remainingTopics > 0 && (

              <button
                type="button"

                onClick={() => {

                  setSelectedDayTopics(logsForDay);

                  setShowTopicsModal(true);

                }}

                style={{
                  position: "relative",
                  zIndex: 1,

                  marginTop: 8,

                  padding: 0,

                  border: "none",

                  background: "transparent",

                  color: "#2563EB",

                  fontSize: 10,
                  fontWeight: 800,

                  cursor: "pointer",

                  textAlign: "left",
                }}
              >
                View All Topics ({logsForDay.length}) →
              </button>

            )}


            <div
              style={{
                position: "relative",
                zIndex: 1,

                marginTop: 8,

                fontSize: 10,

                color: "#64748B",
              }}
            >
              Homework:{" "}

              <strong
                style={{
                  color: "#334155",
                }}
              >
                {logsForDay.some(
                  (item) => item.homework_given
                )
                  ? "Yes"
                  : "No"}
              </strong>

            </div>

          </div>

        );

      })}

    </div>

  </div>


  {/* =========================================================
      MOBILE + TABLET CALENDAR
      INDEPENDENT RENDERER
      <= 1024px
  ========================================================= */}

  <div className="cc-mobile-calendar">

    {/* SWIPE INFORMATION — OUTSIDE SCROLLER */}

    <div className="cc-mobile-swipe-hint">

      <span>
        Calendar View
      </span>

      <strong>
        Swipe left or right to view the full month →
      </strong>

    </div>


    {/* =====================================================
        HORIZONTAL VIEWPORT

        ONLY THIS AREA SCROLLS.
        HEADER + SWIPE BAR REMAIN FIXED.
    ===================================================== */}

    <div className="cc-mobile-scroll">

      <div className="cc-mobile-track">


        {/* =================================================
            WEEK DAYS
        ================================================= */}

        <div className="cc-mobile-weekdays">

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
              key={`mobile-week-${day}`}
              className="cc-mobile-weekday"
            >
              {day}
            </div>

          ))}

        </div>


        {/* =================================================
            MOBILE CALENDAR GRID
        ================================================= */}

        <div className="cc-mobile-grid">

          {Array.from({ length: totalDays }).map(
            (_, index) => {

              const day =
                index + 1;


              const logsForDay =
                filteredLogs.filter((item) => {

                  const currentDate =
                    new Date(item.log_date);

                  return (
                    currentDate.getDate() === day
                  );

                });


              const visibleTopic =
                logsForDay[0];


              const remainingTopics =
                logsForDay.length - 1;


              /* =============================================
                  MOBILE EMPTY DAY
              ============================================= */

              if (logsForDay.length === 0) {

                return (

                  <div
                    key={`mobile-${day}`}
                    className="cc-mobile-day cc-mobile-day-empty"
                  >

                    <div className="cc-mobile-corner cc-mobile-corner-empty" />


                    <div className="cc-mobile-date">
                      {day}
                    </div>


                    <div className="cc-mobile-empty-content">

                      <span>
                        No Lecture
                      </span>

                      <span>
                        Conducted
                      </span>

                    </div>

                  </div>

                );

              }


              /* =============================================
                  MOBILE LECTURE DAY
              ============================================= */

              return (

                <div
                  key={`mobile-${day}`}
                  className="cc-mobile-day cc-mobile-day-lecture"
                >

                  <div className="cc-mobile-corner cc-mobile-corner-lecture" />


                  <div className="cc-mobile-date">
                    {day}
                  </div>


                  <div className="cc-mobile-topic">
                    {visibleTopic?.topic_name ?? "Topic"}
                  </div>


                  <div className="cc-mobile-pages">
                    Pages:{" "}
                    {visibleTopic?.page_from ?? "-"}–
                    {visibleTopic?.page_to ?? "-"}
                  </div>


                  {remainingTopics > 0 && (

                    <button
                      type="button"

                      className="cc-mobile-view-all"

                      onClick={() => {

                        setSelectedDayTopics(
                          logsForDay
                        );

                        setShowTopicsModal(true);

                      }}
                    >
                      +{remainingTopics} more
                    </button>

                  )}


                  <div className="cc-mobile-homework">

                    HW:{" "}

                    <strong>
                      {logsForDay.some(
                        (item) =>
                          item.homework_given
                      )
                        ? "Yes"
                        : "No"}
                    </strong>

                  </div>

                </div>

              );

            }
          )}

        </div>

      </div>

    </div>

  </div>

</div>

{

showTopicsModal && (

<div
className="cc-modal-overlay"
style={{
background:"linear-gradient(135deg,#EEF7FF,#F8FAFF)",
border:"1px solid #BFDBFE",
borderRadius:20,
marginTop:28,
padding:"22px 28px",
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>

<div
className="cc-modal-panel"

style={{

background:"white",
width:"700px",
maxHeight:"80vh",

overflowY:"auto",

borderRadius:30,
padding:35,

boxShadow:
"0px 25px 50px rgba(0,0,0,0.2)",

}}

>

<div

style={{

background:"#04122F",

padding:28,

borderRadius:22,

marginBottom:30,

}}

>

<p

style={{

color:"#F59E0B",

fontWeight:700,

letterSpacing:1.5,

marginTop:0,

}}

>

CLASSROOM TEACHING HISTORY

</p>


<h1

style={{

color:"white",

marginTop:10,

marginBottom:10,

}}

>

TOPICS COVERED

</h1>


<p

style={{

color:"#E5E7EB",

marginBottom:0,

}}

>

{selectedDayTopics.length}

Topics were covered during this lecture day.

</p>


</div>


{

selectedDayTopics.map((topic,index)=>(

<div

key={topic.id}

style={{

background:"#F8FAFC",

padding:24,

borderRadius:18,

marginBottom:20,

border:"1px solid #E2E8F0",

}}

>

<h3
style={{

color:"#04122F",

marginBottom:18,

fontSize:22,

}}
>

{index+1}. {topic.topic_name}

</h3>


<p>

Pages :

{topic.page_from}

-

{topic.page_to}

</p>


<p>

Homework :

{" "}

{topic.homework_given
? "Yes"
: "No"}

</p>


<p>

Activity :

{" "}

{topic.activity_conducted
? "Yes"
: "No"}

</p>


{

topic.teacher_notes && (

<p>

Teacher Notes :

{" "}

{topic.teacher_notes}

</p>

)

}


</div>

))

}


<button

onClick={()=>{

setShowTopicsModal(false);

}}

style={{

padding:"16px 30px",

background:"#F59E0B",

color:"#04122F",

border:"none",

borderRadius:16,

cursor:"pointer",

fontWeight:700,

fontSize:15,

}}

>

CLOSE TOPICS

</button>


</div>

</div>

)

}

</div>

);

}
