import { useState } from "react";

import StudentLayout, {
  StudentTab,
} from "./StudentLayout";

import TalentPassport from "../TalentPassport";
import Homeboard from "./Homeboard";
import Timeline from "./TimelineV3";
import Portfolio from "./Portfolio";
import Competitions from "./Competitions";
import MyAnalysis from "./MyAnalysis";
import Opportunities from "./Opportunities.tsx";
import GrowthPlan from "./GrowthPlan";
import MaukePeChauka
from "./MaukePeChauka";

interface Props {
  onLogout: () => void;
  onStartDNA: () => void;
}

export default function StudentPortal({
  onLogout,
  onStartDNA,
}: Props) {
  const [activeTab, setActiveTab] =
    useState<StudentTab>("dna-radar");

 const currentPage = (() => {

  switch (activeTab) {

    case "dna-radar":
      return (
        <TalentPassport
          onStartDNA={onStartDNA}
        />
      );

    case "homeboard":
      return <Homeboard />;

    case "timeline":
      return <Timeline />;

    case "portfolio":
      return <Portfolio />;

    case "competitions":
      return <Competitions />;

    case "opportunities":
      return <Opportunities />;

    case "mauke-pe-chauka":
      return <MaukePeChauka />;

    case "my-analysis":
      return <MyAnalysis />;

    case "growth-plan":
      return <GrowthPlan />;

    default:
      return <Homeboard />;

  }

})();

  return (
    <StudentLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={onLogout}
    >
      {currentPage}
    </StudentLayout>
  );
}