import { useState } from "react";
import SchoolOverviewPage from "../../schoolIntelligence/pages/SchoolOverviewPage";
import TeacherIntelligencePage from "../../schoolIntelligence/pages/TeacherIntelligencePage";
import ClassroomIntelligencePage from "../../schoolIntelligence/pages/ClassroomIntelligencePage";
import SchoolAcademicIntelligencePage from "../../schoolIntelligence/pages/SchoolAcademicIntelligencePage";
import SchoolLessonPlannerAuditPage from "../../planners/pages/SchoolLessonPlannerAuditPage";
import SchoolUnitTestPlannerAuditPage from "../../planners/pages/SchoolUnitTestPlannerAuditPage";
import SchoolExamPaperPlannerAuditPage from "../../planners/pages/SchoolExamPaperPlannerAuditPage";
import "../../schoolIntelligence/pages/schoolIntelligence.css";

interface Props { onLogout: () => void; }
type Tab = "overview" | "teachers" | "classrooms" | "academic" | "lesson-plans" | "unit-tests" | "exam-papers";

const tabs: {key:Tab;label:string;short:string}[] = [
  {key:"overview",label:"School Health",short:"Overview"},
  {key:"teachers",label:"Daily Teacher Logs",short:"Teachers"},
  {key:"classrooms",label:"Classroom Feedback Intelligence",short:"Classes"},
  {key:"academic",label:"Doubt Intelligence",short:"Academic"},
  {key:"lesson-plans",label:"Lesson Planner Audit",short:"Lessons"},
  {key:"unit-tests",label:"Unit Test Audit",short:"Unit Test"},
  {key:"exam-papers",label:"Exam Paper Audit",short:"Papers"},
];

export default function SchoolDashboard({ onLogout }: Props) {
  const [tab,setTab]=useState<Tab>("overview");

  return <div className="school-shell">
    <header className="school-nav">
      <div className="school-brand"><div className="school-brand-mark">◇</div><div><b>Talent Passport</b><span>School Intelligence</span></div></div>
      <nav className="school-nav-tabs">{tabs.map(item=><button key={item.key} className={tab===item.key?"active":""} onClick={()=>setTab(item.key)}><span className="school-nav-long">{item.label}</span><span className="school-nav-short">{item.short}</span></button>)}</nav>
      <button className="school-logout" onClick={onLogout}>Logout</button>
    </header>

    <div className="school-content">
      {tab==="overview"&&<SchoolOverviewPage/>}
      {tab==="teachers"&&<TeacherIntelligencePage/>}
      {tab==="classrooms"&&<ClassroomIntelligencePage/>}
      {tab==="academic"&&<SchoolAcademicIntelligencePage/>}
      {tab==="lesson-plans"&&<SchoolLessonPlannerAuditPage/>}
      {tab==="unit-tests"&&<SchoolUnitTestPlannerAuditPage/>}
      {tab==="exam-papers"&&<SchoolExamPaperPlannerAuditPage/>}
    </div>

    <style>{`
      .school-shell{min-height:100vh;background:#f5f7fa;color:#0b1f3a}
      .school-nav{position:sticky;top:0;z-index:30;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;margin:0;padding:10px 18px;border-bottom:1px solid #dce4ee;background:rgba(255,255,255,.96);backdrop-filter:blur(12px)}
      .school-brand{display:flex;align-items:center;gap:9px;min-width:max-content}.school-brand-mark{display:grid;place-items:center;width:30px;height:30px;border:1px solid #ffb57d;border-radius:9px;color:#ff6508;background:#fff8f2;font-weight:900}.school-brand b{display:block;font-size:12px}.school-brand span{display:block;margin-top:2px;color:#6b7d96;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
      .school-nav-tabs{display:flex;justify-content:center;gap:7px;min-width:0;overflow-x:auto;scrollbar-width:none}.school-nav-tabs::-webkit-scrollbar{display:none}.school-nav-tabs button{border:0;border-radius:10px;background:#f0f3f7;color:#3d506c;padding:9px 12px;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap}.school-nav-tabs button.active{background:#ff6508;color:#fff}.school-nav-short{display:none}
      .school-logout{border:0;border-radius:10px;background:#d92d2d;color:#fff;padding:9px 16px;font-size:11px;font-weight:900;cursor:pointer}.school-content{width:100%;max-width:1500px;margin:0 auto}
      @media(max-width:1024px){.school-nav{grid-template-columns:auto 1fr auto;padding:10px 14px}.school-brand span{display:none}.school-nav-long{display:none}.school-nav-short{display:inline}.school-nav-tabs{justify-content:flex-start;overflow-x:auto;padding-bottom:2px}.school-nav-tabs button{padding:8px 10px;font-size:9px}.school-logout{padding:8px 11px;font-size:9px}}
      @media(max-width:600px){.school-nav{gap:7px;padding:7px 9px}.school-brand b{font-size:9px}.school-brand-mark{width:25px;height:25px;border-radius:7px}.school-nav-tabs{gap:5px}.school-nav-tabs button{padding:7px 8px;border-radius:8px;font-size:7px}.school-logout{padding:7px 9px;border-radius:8px;font-size:7px}}
    `}</style>
  </div>;
}
