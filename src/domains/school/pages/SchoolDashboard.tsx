import { useState } from "react";
import SchoolOverviewPage from "../../schoolIntelligence/pages/SchoolOverviewPage";
import TeacherIntelligencePage from "../../schoolIntelligence/pages/TeacherIntelligencePage";
import ClassroomIntelligencePage from "../../schoolIntelligence/pages/ClassroomIntelligencePage";
import SchoolAcademicIntelligencePage from "../../schoolIntelligence/pages/SchoolAcademicIntelligencePage";
import "../../schoolIntelligence/pages/schoolIntelligence.css";

interface Props { onLogout: () => void; }
type Tab = "overview" | "teachers" | "classrooms" | "academic";

const tabs: {key:Tab;label:string;short:string}[] = [
  {key:"overview",label:"School Health",short:"Overview"},
  {key:"teachers",label:"Daily Teacher Logs",short:"Teachers"},
  {key:"classrooms",label:"Classroom Feedback Intelligence",short:"Classes"},
  {key:"academic",label:"Doubt Intelligence",short:"Academic"},
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
    </div>

    <style>{`
      .school-shell{min-height:100vh;background:#f5f7fa;color:#0b1f3a}
      .school-nav{position:sticky;top:0;z-index:30;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;margin:0;padding:10px 18px;border-bottom:1px solid #dce4ee;background:rgba(255,255,255,.96);backdrop-filter:blur(12px)}
      .school-brand{display:flex;align-items:center;gap:9px;min-width:max-content}.school-brand-mark{display:grid;place-items:center;width:30px;height:30px;border:1px solid #ffb57d;border-radius:9px;color:#ff6508;background:#fff8f2;font-weight:900}.school-brand b{display:block;font-size:12px}.school-brand span{display:block;margin-top:2px;color:#6b7d96;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
      .school-nav-tabs{display:flex;justify-content:center;gap:7px;min-width:0}.school-nav-tabs button{border:0;border-radius:10px;background:#f0f3f7;color:#3d506c;padding:9px 12px;font-size:11px;font-weight:900;cursor:pointer;white-space:nowrap}.school-nav-tabs button.active{background:#ff6508;color:#fff}.school-nav-short{display:none}
      .school-logout{border:0;border-radius:10px;background:#d92d2d;color:#fff;padding:9px 16px;font-size:11px;font-weight:900;cursor:pointer}.school-content{width:100%;max-width:1500px;margin:0 auto}
      @media(max-width:1024px){.school-nav{grid-template-columns:auto 1fr auto;padding:10px 14px}.school-brand span{display:none}.school-nav-long{display:none}.school-nav-short{display:inline}.school-nav-tabs{justify-content:flex-start;overflow-x:auto;padding-bottom:2px}.school-nav-tabs::-webkit-scrollbar{display:none}}
      @media(max-width:600px){.school-nav{grid-template-columns:1fr auto;gap:8px;padding:9px 10px}.school-brand{grid-column:1}.school-logout{grid-column:2;grid-row:1}.school-nav-tabs{grid-column:1/-1;grid-row:2;justify-content:stretch;width:100%}.school-nav-tabs button{flex:1;padding:9px 7px;font-size:10px}.school-brand b{font-size:11px}.school-brand-mark{width:28px;height:28px}.school-logout{padding:8px 12px;font-size:10px}}
    `}</style>
  </div>;
}
