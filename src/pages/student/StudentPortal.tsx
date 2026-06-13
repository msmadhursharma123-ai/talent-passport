import { useState } from "react";

import StudentLayout, {
  StudentTab
} from "./StudentLayout";
import TalentPassport from "../TalentPassport";
import Homeboard from "./Homeboard";
import Timeline from "./TimelineV3";
import Portfolio from "./Portfolio";
import Competitions from "./Competitions";
import MyAnalysis from "./MyAnalysis";
import GrowthPlan from "./GrowthPlan";

export default function StudentPortal() {
 const [activeTab, setActiveTab] =
  useState<StudentTab>("dna-radar");

  const handleLogout = () => {
    localStorage.removeItem("studentProfile");
    localStorage.removeItem("student_id");

    window.location.reload();
  };

  const renderPage = () => {
    switch (activeTab) {
case "dna-radar":
  return <TalentPassport />;
        
        case "homeboard":
        return <Homeboard />;

      case "timeline":
        return <Timeline />;

      case "portfolio":
        return <Portfolio />;

      case "competitions":
        return <Competitions />;

      case "my-analysis":
        return <MyAnalysis />;

      case "growth-plan":
        return <GrowthPlan />;

      default:
        return <Homeboard />;
    }
  };

  return (
    <StudentLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
    >
      {renderPage()}
    </StudentLayout>
  );
}