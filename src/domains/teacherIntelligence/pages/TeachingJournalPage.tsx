import { useEffect, useState } from "react";

import {
getCurrentTeacher,
} from "../../../services/identityService";

import {
getTeacherAssignmentsByTeacher,
} from "../repository/TeacherAssignmentRepository";

import type {
TeacherAssignment,
} from "../types/TeacherAssignment";

import {
getTeacherDailyLogsByAssignment,
} from "../repository/TeacherDailyLogRepository";

import type {
TeacherDailyLog,
} from "../types/TeacherDailyLog";

import {

getMonthlyComprehensionData,

}

from "../repository/TeachingJournalRepository";

import {
getOverallClassroomComparison,
getCurrentMonthClassroomMetrics,
}
from "../repository/TeachingJournalRepository";

export default function TeachingJournalPage() {

    const [assignments,setAssignments] =
useState<TeacherAssignment[]>([]);

const [dailyLogs,setDailyLogs] =
useState<TeacherDailyLog[]>([]);

const [
selectedAssignmentId,
setSelectedAssignmentId,
] = useState("");

const [selectedMonth,setSelectedMonth] =
useState(
  () =>
    new Date().toLocaleString(
      "default",
      {
        month:"long",
        year:"numeric",
      }
    )
);

const [

overallClassroomComparison,

setOverallClassroomComparison,

] = useState<any[]>([]);

const [

monthlyFeedback,

setMonthlyFeedback

] = useState<any[]>([]);

const [

voucherClassrooms,

setVoucherClassrooms

] = useState<any[]>([]);

const [

voucherLoading,

setVoucherLoading

] = useState(false);

const loadOverallClassroomComparison =
async ()=>{

try {

const data =

await getOverallClassroomComparison(

selectedMonth

);

setOverallClassroomComparison(
data
);

} catch(error) {

console.error(
"TEACHING JOURNAL CLASSROOM COMPARISON LOAD FAILED",
error
);

setOverallClassroomComparison([]);

}

};

useEffect(()=>{

loadAssignments();

},[]);


useEffect(()=>{

loadOverallClassroomComparison();

},[selectedMonth]);

useEffect(() => {

loadSelectedClassroomData();

},[

selectedAssignmentId,
selectedMonth,

]);

const loadSelectedClassroomData =
async ()=>{

if(
!selectedAssignmentId
){
return;
}

const assignment =

assignments.find(
(item)=>

String(item.id) ===
selectedAssignmentId
);


if(!assignment){
return;
}


const logs =

await getTeacherDailyLogsByAssignment(
assignment.id
);


const filteredLogs =

logs.filter((log)=>{

const monthYear =

new Date(log.logDate)
.toLocaleString(
"default",
{
month:"long",
year:"numeric",
}
);

return monthYear === selectedMonth;

});


setDailyLogs(
filteredLogs
);


const feedback =

await getMonthlyComprehensionData(

filteredLogs.map(
(log)=>log.id!
)

);


setMonthlyFeedback(
feedback
);

};

async function loadAssignments(){

const teacher =
getCurrentTeacher();

if(!teacher){
return;
}

try {

const data =

await getTeacherAssignmentsByTeacher(
teacher.teacherUuid
);

setAssignments(
data.filter(
(assignment) =>
assignment.isActive !== false
)
);

} catch(error) {

console.error(
"TEACHING JOURNAL ASSIGNMENTS LOAD FAILED",
error
);

setAssignments([]);

}

}

async function loadVoucherProgress(){

if(assignments.length === 0){
return;
}

setVoucherLoading(true);

try{

const data =
await getCurrentMonthClassroomMetrics(
assignments
);

setVoucherClassrooms(data);

}catch(error){

console.error(
"TEACHER REWARD DATA LOAD FAILED",
error
);

/*
Keep the last successful classroom metrics visible
if a background refresh temporarily fails.
*/
if (
voucherClassrooms.length === 0
) {
setVoucherClassrooms([]);
}

}finally{

setVoucherLoading(false);

}

}

useEffect(()=>{

if(assignments.length === 0){
return;
}

loadVoucherProgress();

const refreshTimer =
setInterval(
loadVoucherProgress,
30000
);

const handleFocus = ()=>
loadVoucherProgress();

window.addEventListener(
"focus",
handleFocus
);

return ()=>{

clearInterval(refreshTimer);

window.removeEventListener(
"focus",
handleFocus
);

};

},[assignments]);

const currentRewardMonth =
new Date().toLocaleString(
"default",
{
month:"long",
year:"numeric",
}
);

const totalRewardClasses =
voucherClassrooms.length;

const reward80ClassTarget =
 totalRewardClasses > 0
 ? Math.ceil(totalRewardClasses * 0.8)
 : 0;

function getRewardProgress(
threshold:number,
requiredClasses:number
){

const qualifiedClasses =
 voucherClassrooms.filter(
(item:any)=>
item.hasDoubtData &&
item.doubtClosureRate >= threshold
).length;

const target =
Math.min(
requiredClasses,
totalRewardClasses
);

const remaining =
Math.max(0,target - qualifiedClasses);

return{
qualifiedClasses,
target,
remaining,
unlocked:
 target > 0 &&
 qualifiedClasses >= target,
};

}

function getRewardScoreColor(
score:number
){

if(score >= 90) return "#16A34A";
if(score >= 80) return "#2563EB";
if(score >= 75) return "#CA8A04";
return "#DC2626";

}

function getRewardScoreBackground(
score:number
){

if(score >= 90) return "#F0FDF4";
if(score >= 80) return "#EFF6FF";
if(score >= 75) return "#FFFBEB";
return "#FEF2F2";

}

function getRewardStatusText(
progress:any
){

if(progress.unlocked){
return "UNLOCKED";
}

if(totalRewardClasses === 0){
return "NO CLASSROOMS";
}

if(progress.remaining === 1){
return "1 CLASS TO GO";
}

return `${progress.remaining} CLASSES TO GO`;

}

function getDoubtClosureLabel(
item:any
){

if(!item.hasDoubtData){
return "No doubts recorded yet";
}

return `${item.doubtsResolved}/${item.doubtsAsked} doubts resolved · ${item.doubtClosureRate}% closure`;

}

function getVoucherRequirementText(
threshold:number,
requiredClasses:number,
allClasses:boolean
){

if(allClasses){
return `${threshold}% doubt closure in every classroom`;
}

return `${threshold}% doubt closure in ${requiredClasses} of ${totalRewardClasses} classrooms`;

}


function getDayColor(

day:number

){

const log =

dailyLogs.find((item)=>{

const lectureDay =

new Date(

item.logDate

).getDate();


return lectureDay === day;

});


if(!log){

return "#F3F4F6"; // no lecture

}


const feedback =

monthlyFeedback.filter(

(item)=>

item.daily_log_uuid ===

log.id

);


if(

feedback.length === 0

){

return "#DBEAFE"; // feedback pending

}


const complete =

feedback.filter(

(item)=>

item.understanding_level ===

"I completely understood."

).length;


const partial =

feedback.filter(

(item)=>

item.understanding_level ===

"I partially understood."

).length;


const difficult =

feedback.filter(

(item)=>

item.understanding_level ===

"I didn't understand."

).length;



if(

complete >= partial &&

complete >= difficult

){

return "#DCFCE7"; // understood

}


if(

partial >= complete &&

partial >= difficult

){

return "#FEF3C7"; // partial

}


return "#FEE2E2"; // difficult


}

function getDotColor(

day:number

){

const color =

getDayColor(day);


if(color === "#DCFCE7")
return "#22C55E";


if(color === "#FEF3C7")
return "#F59E0B";


if(color === "#FEE2E2")
return "#EF4444";


if(color === "#DBEAFE")
return "#2563EB";


return "#9CA3AF";

}

function getClassroomHealthScore(
day:number
){

const log = dailyLogs.find((item)=>{

const lectureDay =

new Date(item.logDate).getDate();

return lectureDay === day;

});

if(!log){
return null;
}

const feedback = monthlyFeedback.filter(

(item)=>

item.daily_log_uuid === log.id

);

if(feedback.length === 0){
return null;
}

const complete = feedback.filter(

(item)=>

item.understanding_level ===
"I completely understood."

).length;


const partial = feedback.filter(

(item)=>

item.understanding_level ===
"I partially understood."

).length;


const totalStudents =

feedback.length;


const score =

Math.round(

(

(

complete +

(partial * 0.5)

)

/

totalStudents

) * 100

);

return score;

}

function getMonthSummary(){

let green = 0;

let yellow = 0;

let red = 0;

let blue = 0;


for(

let i=1;

i<=31;

i++

){

const color =

getDayColor(i);


if(color === "#DCFCE7") green++;

if(color === "#FEF3C7") yellow++;

if(color === "#FEE2E2") red++;

if(color === "#DBEAFE") blue++;

}

return{

green,
yellow,
red,
blue,

};

}

function getAverageScoreByColor(

targetColor:string

){

let totalScore = 0;

let count = 0;


for(

let i=1;

i<=31;

i++

){

if(

getDayColor(i) === targetColor

){

const score =

getClassroomHealthScore(i);


if(score !== null){

totalScore += score;

count++;

}

}

}


if(count === 0){

return 0;

}


return Math.round(

totalScore / count

);

}

const summary = getMonthSummary();

return (
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
    min-width: 100% !important;
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
    min-width: 100% !important;
  }

  .tp-compact-page select {
    min-height: 32px !important;
    padding: 6px 7px !important;
    font-size: 9px !important;
    border-radius: 8px !important;
  }
}


/* =========================================================
   FREEZE PATCH — REQUESTED SECTIONS ONLY
   Mobile / tablet only. No desktop, data, logic, or other UI changes.
   ========================================================= */
@media (max-width: 1024px) {
  /* HERO ONLY: compact the two center pills and right JOURNAL badge */
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

  /* COMPARISON TABLE ONLY: wider table, smaller internal cards/typography */
  .tp-comparison-scroll {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  .tp-comparison-scroll > * {
    min-width: 720px !important;
  }
  .tp-comparison-scroll > * > * {
    min-height: 0 !important;
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

  .tp-comparison-scroll > * {
    min-width: 680px !important;
  }
  .tp-comparison-scroll div {
    line-height: 1.12 !important;
  }
}



/* =========================================================
   TEACHER REWARD LAYER
   Desktop is intentionally spacious; tablet/mobile stay compact.
   ========================================================= */
.tp-reward-monthly-section,
.tp-reward-voucher-section {
  position: relative;
  width: 100%;
  margin-bottom: 18px;
  padding: 20px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 20px;
  box-shadow: 0 7px 24px rgba(15,23,42,0.035);
  box-sizing: border-box;
  overflow: hidden;
}

.tp-reward-monthly-section::after,
.tp-reward-voucher-section::after {
  content: "";
  position: absolute;
  width: 170px;
  height: 170px;
  right: -80px;
  top: -90px;
  border-radius: 50%;
  background: rgba(249,115,22,0.055);
  pointer-events: none;
}

.tp-reward-section-heading {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.tp-reward-eyebrow {
  color: #F97316;
  font-size: 10px;
  line-height: 1.2;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.tp-reward-section-heading h2 {
  margin: 6px 0 0;
  color: #0F172A;
  font-size: 21px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.tp-reward-section-heading p {
  margin: 6px 0 0;
  max-width: 760px;
  color: #64748B;
  font-size: 13px;
  line-height: 1.5;
}

.tp-reward-live-pill,
.tp-reward-month-pill {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 999px;
  background: #F8FAFC;
  border: 1px solid #CBD5E1;
  color: #475569;
  font-size: 9px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: .8px;
}

.tp-reward-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22C55E;
  box-shadow: 0 0 0 3px rgba(34,197,94,.12);
}

.tp-reward-class-table {
  position: relative;
  z-index: 1;
  width: 100%;
}

.tp-reward-class-table-head,
.tp-reward-class-row {
  display: grid;
  grid-template-columns: minmax(180px, 1.1fr) 110px minmax(240px, 1.5fr);
  gap: 10px;
  align-items: center;
}

.tp-reward-class-table-head {
  padding: 0 12px 7px;
  color: #94A3B8;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1px;
}

.tp-reward-class-row {
  min-height: 54px;
  margin-top: 6px;
  padding: 8px 10px;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  box-sizing: border-box;
}

.tp-reward-class-name {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.tp-reward-class-name strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #0F172A;
  font-size: 12px;
  font-weight: 800;
}

.tp-reward-class-name span,
.tp-reward-row-progress span {
  color: #64748B;
  font-size: 9px;
  line-height: 1.25;
  font-weight: 600;
}

.tp-reward-score-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  min-height: 30px;
  padding: 4px 8px;
  border: 1px solid;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 900;
  box-sizing: border-box;
}

.tp-reward-row-progress {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
}

.tp-reward-row-track {
  flex: 1;
  min-width: 70px;
  height: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: #E2E8F0;
}

.tp-reward-row-fill {
  height: 100%;
  min-width: 0;
  border-radius: inherit;
  transition: width .35s ease;
}

.tp-reward-loading,
.tp-reward-empty {
  position: relative;
  z-index: 1;
  padding: 18px;
  border: 1px dashed #CBD5E1;
  border-radius: 12px;
  background: #F8FAFC;
  color: #64748B;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
}

.tp-reward-voucher-heading {
  margin-bottom: 14px;
}

.tp-reward-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.tp-reward-card {
  position: relative;
  min-width: 0;
  min-height: 190px;
  padding: 13px;
  overflow: hidden;
  border: 1px solid;
  border-radius: 15px;
  box-sizing: border-box;
}

.tp-reward-card-orb {
  position: absolute;
  width: 86px;
  height: 86px;
  right: -34px;
  top: -36px;
  border-radius: 50%;
  opacity: .07;
  pointer-events: none;
}

.tp-reward-card-top {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.tp-reward-card-eyebrow {
  font-size: 8px;
  line-height: 1.2;
  font-weight: 900;
  letter-spacing: .9px;
}

.tp-reward-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border: 1px solid;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 900;
}

.tp-reward-card-title {
  position: relative;
  margin-top: 9px;
  min-height: 32px;
  color: #0F172A;
  font-size: 13px;
  line-height: 1.18;
  font-weight: 900;
}

.tp-reward-card-rule {
  margin-top: 4px;
  color: #64748B;
  font-size: 9px;
  line-height: 1.3;
  font-weight: 700;
}

.tp-reward-card-progress-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 7px;
  margin-top: 11px;
}

.tp-reward-card-progress-row strong {
  color: #0F172A;
  font-size: 18px;
  line-height: 1;
  font-weight: 900;
}

.tp-reward-card-progress-row span {
  color: #64748B;
  font-size: 7px;
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: .45px;
  text-align: right;
}

.tp-reward-card-track {
  width: 100%;
  height: 6px;
  margin-top: 7px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(148,163,184,.18);
}

.tp-reward-card-fill {
  height: 100%;
  border-radius: inherit;
  transition: width .35s ease;
}

.tp-reward-card-footer {
  margin-top: 8px;
  color: #64748B;
  font-size: 8px;
  line-height: 1.35;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .tp-reward-monthly-section,
  .tp-reward-voucher-section {
    margin-bottom: 12px;
    padding: 15px;
    border-radius: 17px;
  }

  .tp-reward-section-heading {
    gap: 10px;
    margin-bottom: 11px;
  }

  .tp-reward-section-heading h2 {
    font-size: 19px;
    line-height: 1.08;
  }

  .tp-reward-section-heading p {
    margin-top: 4px;
    font-size: 10px;
    line-height: 1.35;
  }

  .tp-reward-class-table-head,
  .tp-reward-class-row {
    grid-template-columns: minmax(150px, 1fr) 80px minmax(160px, 1.1fr);
    gap: 7px;
  }

  .tp-reward-class-table-head {
    padding: 0 9px 5px;
    font-size: 7px;
  }

  .tp-reward-class-row {
    min-height: 47px;
    padding: 7px 8px;
    margin-top: 5px;
    border-radius: 10px;
  }

  .tp-reward-class-name strong {
    font-size: 10px;
  }

  .tp-reward-class-name span,
  .tp-reward-row-progress span {
    font-size: 7px;
  }

  .tp-reward-score-pill {
    min-width: 50px;
    min-height: 26px;
    font-size: 12px;
    border-radius: 8px;
  }

  .tp-reward-row-track {
    height: 5px;
  }

  .tp-reward-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
  }

  .tp-reward-card {
    min-height: 160px;
    padding: 10px;
    border-radius: 12px;
  }

  .tp-reward-card-icon {
    width: 23px;
    height: 23px;
    border-radius: 7px;
    font-size: 10px;
  }

  .tp-reward-card-title {
    margin-top: 7px;
    min-height: 28px;
    font-size: 11px;
  }

  .tp-reward-card-rule {
    font-size: 7.5px;
  }

  .tp-reward-card-progress-row {
    margin-top: 8px;
  }

  .tp-reward-card-progress-row strong {
    font-size: 16px;
  }

  .tp-reward-card-progress-row span {
    font-size: 6.5px;
  }

  .tp-reward-card-footer {
    font-size: 7px;
    margin-top: 6px;
  }

  .tp-reward-live-pill,
  .tp-reward-month-pill {
    padding: 6px 8px;
    font-size: 7px;
  }
}

@media (max-width: 767px) {
  .tp-reward-monthly-section,
  .tp-reward-voucher-section {
    margin-bottom: 8px;
    padding: 11px;
    border-radius: 14px;
  }

  .tp-reward-section-heading {
    gap: 6px;
    margin-bottom: 8px;
  }

  .tp-reward-section-heading h2 {
    font-size: 15px;
    line-height: 1.06;
  }

  .tp-reward-section-heading p {
    font-size: 8.5px;
    line-height: 1.3;
  }

  .tp-reward-eyebrow {
    font-size: 7px;
    letter-spacing: 1px;
  }

  .tp-reward-live-pill,
  .tp-reward-month-pill {
    padding: 5px 6px;
    font-size: 6px;
    letter-spacing: .5px;
  }

  .tp-reward-live-dot {
    width: 5px;
    height: 5px;
  }

  .tp-reward-class-table-head,
  .tp-reward-class-row {
    grid-template-columns: minmax(110px, 1fr) 50px minmax(80px, 1fr);
    gap: 5px;
  }

  .tp-reward-class-table-head {
    padding: 0 6px 4px;
    font-size: 5.5px;
    letter-spacing: .65px;
  }

  .tp-reward-class-row {
    min-height: 40px;
    padding: 6px;
    margin-top: 4px;
    border-radius: 9px;
  }

  .tp-reward-class-name {
    gap: 2px;
  }

  .tp-reward-class-name strong {
    font-size: 8px;
  }

  .tp-reward-class-name span,
  .tp-reward-row-progress span {
    font-size: 5.5px;
  }

  .tp-reward-score-pill {
    min-width: 38px;
    min-height: 22px;
    padding: 2px 4px;
    font-size: 10px;
    border-radius: 7px;
  }

  .tp-reward-row-progress {
    gap: 5px;
    flex-direction: column;
    align-items: stretch;
  }

  .tp-reward-row-track {
    width: 100%;
    min-width: 0;
    height: 4px;
  }

  .tp-reward-grid {
    gap: 5px;
  }

  .tp-reward-card {
    min-height: 137px;
    padding: 8px;
    border-radius: 10px;
  }

  .tp-reward-card-orb {
    width: 64px;
    height: 64px;
    right: -27px;
    top: -27px;
  }

  .tp-reward-card-eyebrow {
    font-size: 5.5px;
    letter-spacing: .55px;
  }

  .tp-reward-card-icon {
    width: 19px;
    height: 19px;
    border-radius: 6px;
    font-size: 8px;
  }

  .tp-reward-card-title {
    margin-top: 5px;
    min-height: 25px;
    font-size: 9px;
  }

  .tp-reward-card-rule {
    margin-top: 3px;
    font-size: 6px;
    line-height: 1.25;
  }

  .tp-reward-card-progress-row {
    margin-top: 6px;
  }

  .tp-reward-card-progress-row strong {
    font-size: 13px;
  }

  .tp-reward-card-progress-row span {
    font-size: 5px;
    letter-spacing: .25px;
  }

  .tp-reward-card-track {
    height: 4px;
    margin-top: 5px;
  }

  .tp-reward-card-footer {
    margin-top: 5px;
    font-size: 5.5px;
    line-height: 1.3;
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
            CLASSROOM ANALYTICS ENGINE
          </div>

          <h1
            style={{
              margin: "8px 0 8px",
              color: "#0F172A",
              fontSize: "31px",
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: "-0.7px",
            }}
          >
            Teaching Journal
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: "650px",
              color: "#64748B",
              fontSize: "13px",
              lineHeight: 1.65,
            }}
          >
            Review classroom health,
            comprehension trends and teaching
            effectiveness across academics.
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
              MONTHLY INTELLIGENCE
            </div>

            <div style={bluePillStyle}>
              CLASSROOM HEALTH
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
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "1.2px",
            }}
          >
            JOURNAL
          </div>
        </div>
      </div>
    </div>

    {/* =====================================================
        CURRENT MONTH CLASSROOM AVERAGES
       ===================================================== */}

    <div className="tp-reward-monthly-section">
      <div className="tp-reward-section-heading">
        <div>
          <div className="tp-reward-eyebrow">
            MONTHLY CLASSROOM PULSE
          </div>
          <h2>
            {currentRewardMonth} Doubt Closure %
          </h2>
          <p>
            Live monthly doubt closure across every classroom you currently teach.
          </p>
        </div>

        <div className="tp-reward-live-pill">
          <span className="tp-reward-live-dot" />
          LIVE
        </div>
      </div>

      {voucherLoading && voucherClassrooms.length === 0 ? (
        <div className="tp-reward-loading">
          Updating classroom averages…
        </div>
      ) : voucherClassrooms.length > 0 ? (
        <div className="tp-reward-class-table">
          <div className="tp-reward-class-table-head">
            <span>CLASSROOM</span>
            <span>DOUBT CLOSURE</span>
            <span>PROGRESS</span>
          </div>

          {voucherClassrooms.map((item:any) => (
            <div
              className="tp-reward-class-row"
              key={item.assignmentId}
            >
              <div className="tp-reward-class-name">
                <strong>{item.classroom}</strong>
                <span>
                  {item.doubtsAsked} {item.doubtsAsked === 1 ? "doubt" : "doubts"} raised · {item.doubtsResolved} resolved
                </span>
              </div>

              <div
                className="tp-reward-score-pill"
                style={{
                  color: item.hasDoubtData
                    ? getRewardScoreColor(item.doubtClosureRate)
                    : "#64748B",
                  background: item.hasDoubtData
                    ? getRewardScoreBackground(item.doubtClosureRate)
                    : "#F8FAFC",
                  borderColor: item.hasDoubtData
                    ? `${getRewardScoreColor(item.doubtClosureRate)}35`
                    : "#E2E8F0",
                }}
              >
                {item.hasDoubtData ? `${item.doubtClosureRate}%` : "—"}
              </div>

              <div className="tp-reward-row-progress">
                <div className="tp-reward-row-track">
                  <div
                    className="tp-reward-row-fill"
                    style={{
                      width: `${Math.min(item.doubtClosureRate,100)}%`,
                      background: item.hasDoubtData
                        ? getRewardScoreColor(item.doubtClosureRate)
                        : "#CBD5E1",
                    }}
                  />
                </div>
                <span>
                  {getDoubtClosureLabel(item)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tp-reward-empty">
          No active classrooms found for the current teacher.
        </div>
      )}
    </div>

    {/* =====================================================
        JOURNAL CONTROLS
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
            JOURNAL CONTROLS
          </div>

          <h2 style={sectionTitleStyle}>
            Explore Classroom History
          </h2>

          <p style={sectionDescriptionStyle}>
            Select a classroom and month to
            review its teaching and comprehension
            record.
          </p>
        </div>

        <div
          style={{
            color: "#94A3B8",
            fontSize: "12px",
            fontWeight: 800,
            letterSpacing: "1px",
          }}
        >
          ACADEMIC INTELLIGENCE
        </div>
      </div>

   <div
  className="tp-responsive-grid-2"
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "14px",
    marginTop: "20px",
  }}
>
        <div>
          <div style={fieldLabelStyle}>
            
          </div>

          <select
            style={dropdownStyle}
            value={selectedAssignmentId}
            onChange={(e) => {
              setSelectedAssignmentId(
                e.target.value
              );
            }}
          >
            <option value="">
              Select Classroom
            </option>

            {assignments.map(
              (assignment) => (
                <option
                  key={assignment.id}
                  value={assignment.id}
                >
                  Class{" "}
                  {assignment.className} -
                  Section{" "}
                  {assignment.sectionName}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <div style={fieldLabelStyle}>
            
          </div>

          <select
            style={dropdownStyle}
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(
                e.target.value
              );
            }}
          >
            <option>January 2026</option>
            <option>February 2026</option>
            <option>March 2026</option>
            <option>April 2026</option>
            <option>May 2026</option>
            <option>June 2026</option>
            <option>July 2026</option>
            <option>August 2026</option>
            <option>September 2026</option>
            <option>October 2026</option>
            <option>November 2026</option>
            <option>December 2026</option>
          </select>
        </div>
      </div>
    </div>

   {/* =====================================================
       TEACHER REWARD VOUCHERS
      ===================================================== */}

   <div className="tp-reward-voucher-section">
     <div className="tp-reward-section-heading tp-reward-voucher-heading">
       <div>
         <div className="tp-reward-eyebrow">
           TEACHER REWARDS
         </div>
         <h2>
           Earn Rewards From Doubt Closure
         </h2>
         <p>
           Your progress updates automatically as doubts are raised and resolved this month.
         </p>
       </div>

       <div className="tp-reward-month-pill">
         {currentRewardMonth.toUpperCase()}
       </div>
     </div>

     <div className="tp-reward-grid">
       {(() => {
         const rewards = [
           {
             key: "amazon90",
             eyebrow: "TOP REWARD",
             title: "Amazon Voucher-₹3000",
             threshold: 90,
             required: totalRewardClasses,
             allClasses: true,
             color: "#F97316",
             soft: "#FFF7ED",
             border: "#FED7AA",
             icon: "◇",
           },
           {
             key: "dinner90",
             eyebrow: "FAMILY REWARD",
             title: "Dinner Voucher · ₹1,500",
             threshold: 90,
             required: reward80ClassTarget,
             allClasses: false,
             color: "#16A34A",
             soft: "#F0FDF4",
             border: "#BBF7D0",
             icon: "◈",
           },
           {
             key: "movie80",
             eyebrow: "FAMILY REWARD",
             title: "2 Movie Tickets",
             threshold: 80,
             required: reward80ClassTarget,
             allClasses: false,
             color: "#2563EB",
             soft: "#EFF6FF",
             border: "#BFDBFE",
             icon: "▶",
           },
           {
             key: "amazon75",
             eyebrow: "EVERYDAY REWARD",
             title: "Amazon Voucher · ₹500",
             threshold: 75,
             required: reward80ClassTarget,
             allClasses: false,
             color: "#CA8A04",
             soft: "#FFFBEB",
             border: "#FDE68A",
             icon: "◆",
           },
         ];

         return rewards.map((reward) => {
           const progress = getRewardProgress(
             reward.threshold,
             reward.required
           );

           const percent =
             progress.target === 0
               ? 0
               : Math.min(
                   100,
                   Math.round(
                     (progress.qualifiedClasses / progress.target) * 100
                   )
                 );

           return (
             <div
               key={reward.key}
               className="tp-reward-card"
               style={{
                 background: `linear-gradient(145deg, ${reward.soft} 0%, #FFFFFF 78%)`,
                 borderColor: reward.border,
               }}
             >
               <div
                 className="tp-reward-card-orb"
                 style={{ background: reward.color }}
               />

               <div className="tp-reward-card-top">
                 <span
                   className="tp-reward-card-eyebrow"
                   style={{ color: reward.color }}
                 >
                   {reward.eyebrow}
                 </span>
                 <span
                   className="tp-reward-card-icon"
                   style={{
                     color: reward.color,
                     background: reward.soft,
                     borderColor: reward.border,
                   }}
                 >
                   {reward.icon}
                 </span>
               </div>

               <div className="tp-reward-card-title">
                 {reward.title}
               </div>

               <div className="tp-reward-card-rule">
                 {getVoucherRequirementText(
                   reward.threshold,
                   reward.required,
                   reward.allClasses
                 )}
               </div>

               <div className="tp-reward-card-progress-row">
                 <strong>
                   {progress.qualifiedClasses}/{progress.target || totalRewardClasses}
                 </strong>
                 <span>
                   {getRewardStatusText(progress)}
                 </span>
               </div>

               <div className="tp-reward-card-track">
                 <div
                   className="tp-reward-card-fill"
                   style={{
                     width: `${percent}%`,
                     background: reward.color,
                   }}
                 />
               </div>

               <div className="tp-reward-card-footer">
                 {progress.unlocked
                   ? "Reward unlocked for this month"
                   : progress.remaining > 0
                   ? `${progress.remaining} more classroom${progress.remaining === 1 ? "" : "s"} needed at ${reward.threshold}% closure`
                   : "Start resolving student doubts"}
               </div>
             </div>
           );
         });
       })()}
     </div>
   </div>

   {/* =====================================================
    MONTHLY CLASSROOM INTELLIGENCE
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
  {/* DECORATIVE TOP-RIGHT CIRCLE */}

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
        Classroom Comprehension Calendar
      </h2>

      <p
        style={{
          margin: "7px 0 0",

          color: "#64748B",

          fontSize: "14px",
          lineHeight: 1.55,
        }}
      >
        Daily classroom health based on student comprehension
        feedback for the selected month.
      </p>
    </div>

    {/* MONTHLY LEARNING LEDGER */}

    <div
      style={{
        position: "relative",
        zIndex: 1,

        flexShrink: 0,

        padding: "8px 14px",

        background:
          "linear-gradient(135deg,#FFF7ED,#FFFFFF)",

        border: "1px solid #FED7AA",

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
    <span></span>
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
      length: 31,
    }).map((_, index) => {
      const day = index + 1;

      const score =
        getClassroomHealthScore(day);

      const dayColor =
        getDayColor(day);

      const isNoLecture =
        dayColor === "#F3F4F6";

      const isFeedbackPending =
        dayColor === "#DBEAFE";

      const isUnderstood =
        dayColor === "#DCFCE7";

      const isPartial =
        dayColor === "#FEF3C7";

      const isDifficult =
        dayColor === "#FEE2E2";

      /* =================================================
         NO LECTURE
         NEW ORANGE / CREAM THEME
      ================================================= */

      if (isNoLecture) {
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

            {/* DAY */}

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

            {/* NO LECTURE MESSAGE */}

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
         FEEDBACK PENDING
      ================================================= */

      if (isFeedbackPending) {
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
                "linear-gradient(135deg,#EFF6FF 0%,#F8FBFF 100%)",

              border:
                "1px solid #BFDBFE",

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
                  "rgba(219,234,254,0.92)",

                pointerEvents: "none",
              }}
            />

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

            <div
              style={{
                position: "relative",
                zIndex: 1,

                flex: 1,

                display: "flex",
                flexDirection: "column",

                alignItems: "center",
                justifyContent: "center",

                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "13px",
                  height: "13px",

                  marginBottom: "8px",

                  borderRadius: "50%",

                  background: "#2563EB",

                  boxShadow:
                    "inset 0 -2px 3px rgba(15,23,42,0.12)",
                }}
              />

              <div
                style={{
                  color: "#2563EB",

                  fontSize: "10px",
                  lineHeight: 1.3,

                  fontWeight: 800,
                }}
              >
                Feedback Pending
              </div>
            </div>
          </div>
        );
      }

      /* =================================================
         COMPREHENSION RESULT
      ================================================= */

      const stateBackground =
        isUnderstood
          ? "linear-gradient(135deg,#F0FDF4 0%,#F8FFF9 100%)"
          : isPartial
          ? "linear-gradient(135deg,#FFFBEB 0%,#FFFDF5 100%)"
          : "linear-gradient(135deg,#FEF2F2 0%,#FFF9F9 100%)";

      const stateBorder =
        isUnderstood
          ? "#BBF7D0"
          : isPartial
          ? "#FDE68A"
          : "#FECACA";

      const stateColor =
        isUnderstood
          ? "#16A34A"
          : isPartial
          ? "#CA8A04"
          : "#DC2626";

      const stateCircle =
        isUnderstood
          ? "rgba(220,252,231,0.90)"
          : isPartial
          ? "rgba(254,243,199,0.90)"
          : "rgba(254,226,226,0.90)";

      const stateLabel =
        isUnderstood
          ? "Most Students Understood"
          : isPartial
          ? "Partially Understood"
          : "Students Struggled";

      return (
        <div
          key={day}
          style={{
            position: "relative",

            overflow: "hidden",

            minHeight: "116px",

            padding: "14px",

            boxSizing: "border-box",

            background: stateBackground,

            border:
              `1px solid ${stateBorder}`,

            borderRadius: "15px",

            display: "flex",
            flexDirection: "column",

            boxShadow:
              "0 2px 6px rgba(15,23,42,0.02)",
          }}
        >
          {/* DECORATIVE CORNER */}

          <div
            style={{
              position: "absolute",

              width: "54px",
              height: "54px",

              right: "-18px",
              top: "-18px",

              borderRadius: "50%",

              background: stateCircle,

              pointerEvents: "none",
            }}
          />

          {/* DAY */}

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

          {/* RESULT */}

          <div
            style={{
              position: "relative",
              zIndex: 1,

              flex: 1,

              display: "flex",
              flexDirection: "column",

              alignItems: "center",
              justifyContent: "center",

              textAlign: "center",

              paddingTop: "4px",
            }}
          >
            {/* STATUS DOT */}

            <div
              style={{
                width: "14px",
                height: "14px",

                marginBottom: "7px",

                borderRadius: "50%",

                background:
                  getDotColor(day),

                border:
                  "1px solid rgba(15,23,42,0.08)",

                boxShadow:
                  "inset 0 -2px 3px rgba(15,23,42,0.12)",
              }}
            />

            {/* HEALTH SCORE */}

            {score !== null && (
              <div
                style={{
                  color: stateColor,

                  fontSize: "18px",
                  lineHeight: 1,

                  fontWeight: 800,

                  letterSpacing: "-0.3px",
                }}
              >
                {score}%
              </div>
            )}

            {/* STATUS */}

            <div
              style={{
                marginTop: "6px",

                color: stateColor,

                fontSize: "9px",
                lineHeight: 1.25,

                fontWeight: 800,
              }}
            >
              {stateLabel}
            </div>
          </div>
        </div>
      );
    })}
  </div>

  {/* =====================================================
      LEGEND
     ===================================================== */}

  <div
    style={{
      position: "relative",
      zIndex: 1,

      display: "flex",

      alignItems: "center",

      flexWrap: "wrap",

      gap: "18px",

      marginTop: "18px",
    }}
  >
    {/* UNDERSTOOD */}

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

          borderRadius: "50%",

          background: "#22C55E",
        }}
      />

      Most Students Understood
    </div>

    {/* PARTIAL */}

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

          borderRadius: "50%",

          background: "#F59E0B",
        }}
      />

      Partially Understood
    </div>

    {/* STRUGGLED */}

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

          borderRadius: "50%",

          background: "#EF4444",
        }}
      />

      Students Struggled
    </div>

    {/* PENDING */}

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

          borderRadius: "50%",

          background: "#2563EB",
        }}
      />

      Feedback Pending
    </div>

    {/* NO LECTURE */}

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

          borderRadius: "50%",

          background: "#FDBA74",
        }}
      />

      No Lecture Conducted
    </div>
  </div>
</div>

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
            Monthly Health Summary
          </h2>

          <p style={sectionDescriptionStyle}>
            A snapshot of classroom
            comprehension performance across
            the selected month.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          CLASSROOM HEALTH LEDGER
        </div>
      </div>

      <div
        className="tp-responsive-grid-4 tp-analytics-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "12px",
          marginTop: "18px",
        }}
      >
        <AnalyticsCard
          eyebrow="STRONG COMPREHENSION"
          title="Excellent Days"
          value={String(
            summary.green
          )}
          description={`Average Score : ${getAverageScoreByColor(
            "#DCFCE7"
          )}%`}
          background="#F0FDF4"
          border="#BBF7D0"
          color="#16A34A"
        />

        <AnalyticsCard
          eyebrow="MODERATE COMPREHENSION"
          title="Average Days"
          value={String(
            summary.yellow
          )}
          description={`Average Score : ${getAverageScoreByColor(
            "#FEF3C7"
          )}%`}
          background="#FFFBEB"
          border="#FDE68A"
          color="#CA8A04"
        />

        <AnalyticsCard
          eyebrow="LEARNING ATTENTION"
          title="Needs Support"
          value={String(
            summary.red
          )}
          description={`Average Score : ${getAverageScoreByColor(
            "#FEE2E2"
          )}%`}
          background="#FEF2F2"
          border="#FECACA"
          color="#DC2626"
        />

        <AnalyticsCard
          eyebrow="AWAITING RESPONSES"
          title="Feedback Pending"
          value={String(
            summary.blue
          )}
          description="Feedback not yet submitted."
          background="#EFF6FF"
          border="#BFDBFE"
          color="#2563EB"
        />
      </div>

      <div
        style={{
          marginTop: "14px",
          padding: "11px 14px",
          background: "#F8FAFC",
          border: "1px solid #E2E8F0",
          borderRadius: "12px",
          color: "#64748B",
          fontSize: "13px",
          lineHeight: 1.5,
        }}
      >
        Calendar reflects classroom
        comprehension based on student
        feedback for the selected month.
      </div>
    </div>

    {/* =====================================================
        CLASSROOM COMPARISON
       ===================================================== */}

    <div className="tp-responsive-section" style={sectionCardStyle}>
      <div
        className="tp-section-header"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <div>
          <div style={eyebrowStyle}>
            BEYOND THE CLASSROOM
          </div>

          <h2 style={sectionTitleStyle}>
            Overall Classroom Performance
            Comparison
          </h2>

          <p style={sectionDescriptionStyle}>
            Compare every classroom taught
            by you during the selected month.
          </p>
        </div>

        <div style={ledgerLabelStyle}>
          TEACHING PERFORMANCE LEDGER
        </div>
      </div>

      {overallClassroomComparison.length >
      0 ? (
        <>
        <div className="teacher-table-swipe-hint">
          <span> </span>
          <strong>Swipe left or right to compare classrooms →</strong>
        </div>

        <div
          className="tp-comparison-scroll"
          style={{
            overflowX: "auto",
            paddingBottom: "3px",
          }}
        >
          <div
            style={{
              minWidth:
                overallClassroomComparison.length >
                4
                  ? "900px"
                  : "100%",
            }}
          >
            {/* CLASSROOM HEADER */}

            <div
              style={{
                display: "grid",

                gridTemplateColumns: `190px repeat(${overallClassroomComparison.length}, minmax(120px, 1fr))`,

                gap: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  color: "#94A3B8",
                  fontSize: "12px",
                  fontWeight: 800,
                  letterSpacing:
                    "0.8px",
                }}
              >
                PERFORMANCE METRIC
              </div>

              {overallClassroomComparison.map(
                (item: any) => (
                  <div
                    key={
                      item.classroom
                    }
                    style={
                      comparisonHeaderStyle
                    }
                  >
                    <div
                      style={{
                        color:
                          "#F97316",
                        fontSize:
                          "11px",
                        fontWeight:
                          800,
                        letterSpacing:
                          "0.8px",
                        marginBottom:
                          "3px",
                      }}
                    >
                      CLASSROOM
                    </div>

                    <div
                      style={{
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {
                        item.classroom
                      }
                    </div>
                  </div>
                )
              )}
            </div>

            <ComparisonRow
              title="Average Student Understanding %"
              data={overallClassroomComparison.map(
                (item: any) =>
                  `${item.averageHealthScore}%`
              )}
            />

            <ComparisonRow
              title="Average Doubt %"
              data={overallClassroomComparison.map(
                (item: any) =>
                  `${item.averageDoubtPercentage}%`
              )}
            />
             <ComparisonRow
               title="Doubt Closure Rate %"
               data={overallClassroomComparison.map(
                 (item: any) =>
                   `${item.doubtClosureRate}%`
               )}
             />


            <ComparisonRow
              title="Average Feedback %"
              data={overallClassroomComparison.map(
                (item: any) =>
                  `${item.averageFeedbackPercentage}%`
              )}
            />

            <ComparisonRow
              title="Low Understanding Student %"
              data={overallClassroomComparison.map(
                (item: any) =>
                  String(
                    item.studentsAtRisk
                  )
              )}
            />
          </div>
        </div>
      </>
      ) : (
        <div style={emptyStateStyle}>
          <div
            style={{
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
              borderRadius: "13px",
              background: "#FFF7ED",
              border:
                "1px solid #FED7AA",
              color: "#F97316",
              fontSize: "21px",
            }}
          >
            ◇
          </div>

          <div
            style={{
              color: "#0F172A",
              fontSize: "16px",
              fontWeight: 800,
            }}
          >
            No comparison data available
          </div>

          <div
            style={{
              marginTop: "4px",
              color: "#64748B",
              fontSize: "14px",
            }}
          >
            Classroom intelligence will
            appear here when data is
            available for the selected
            month.
          </div>
        </div>
      )}
    </div>
  </div>
);
}


/* -------------------------------- */

function Legend(props: any) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",

        padding: "7px 10px",

        background: props.color,

        border:
          "1px solid rgba(148, 163, 184, 0.22)",

        borderRadius: "999px",

        color: "#475569",

        fontSize: "13px",
        fontWeight: 700,
      }}
    >
      <div
        style={{
          width: "7px",
          height: "7px",

          flexShrink: 0,

          borderRadius: "50%",

          background:
            props.dot ||
            props.color,
        }}
      />

      {props.label}
    </div>
  );
}


/* -------------------------------- */

function AnalyticsCard(props: any) {
  return (
    <div
      className="tp-responsive-card"
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
      {/* TOP-RIGHT DECORATIVE ARC */}

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

      {/* CONTENT */}

      <div
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* LABEL */}

        <div
          style={{
            color: props.color,

            fontSize: "10px",
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

            fontSize: "31px",
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

            fontSize: "14px",
            lineHeight: 1.25,

            fontWeight: 800,
          }}
        >
          {props.title}
        </div>

        {/* DESCRIPTION */}

        <div
          style={{
            marginTop: "5px",

            color: "#475569",

            fontSize: "11px",
            fontWeight: 600,

            lineHeight: 1.35,
          }}
        >
          {props.description}
        </div>
      </div>
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



const ledgerLabelStyle = {
  color: "#94A3B8",

  fontSize: "12px",
  fontWeight: 800,

  letterSpacing: "1px",

  whiteSpace:
    "nowrap" as const,
};


const comparisonHeaderStyle = {
  padding: "11px 10px",

  background:
    "linear-gradient(135deg, #0F172A 0%, #172554 100%)",

  borderRadius: "11px",

  color: "#FFFFFF",

  textAlign:
    "center" as const,

  fontSize: "14px",

  fontWeight: 800,
};


const emptyStateStyle = {
  padding: "32px 20px",

  background: "#F8FAFC",

  border: "1px dashed #CBD5E1",

  borderRadius: "16px",

  textAlign:
    "center" as const,
};


/* =========================================================
   CLASSROOM COMPARISON ROW
   ========================================================= */

function ComparisonRow(props: any) {
  return (
    <div
      style={{
        display: "grid",

        gridTemplateColumns: `190px repeat(${props.data.length}, minmax(120px, 1fr))`,

        gap: "6px",

        marginTop: "6px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",

          minHeight: "45px",

          padding: "10px 12px",

          background:
            "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)",

          border:
            "1px solid #FED7AA",

          borderRadius: "11px",

          color: "#7C2D12",

          fontWeight: 700,

          fontSize: "13px",

          lineHeight: 1.35,
        }}
      >
        {props.title}
      </div>

      {props.data.map(
        (
          item: string,
          index: number
        ) => (
          <div
            key={index}
            style={{
              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              minHeight: "45px",

              padding:
                "10px 12px",

              background:
                "#F8FAFC",

              border:
                "1px solid #E2E8F0",

              borderRadius:
                "11px",

              color:
                "#0F172A",

              fontWeight: 800,

              fontSize: "15px",

              textAlign:
                "center",
            }}
          >
            {item}
          </div>
        )
      )}
    
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


/* -------------------------------- */
