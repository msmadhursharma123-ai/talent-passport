import React from "react";

import FoundationManagementHeader from "../components/management/FoundationManagementHeader";

import CurriculumStatistics from "../components/academicExplorer/CurriculumStatistics";
import CurriculumCoverage from "../components/academicExplorer/CurriculumCoverage";
import MasterCurriculumSelector from "../components/academicExplorer/MasterCurriculumSelector";

interface AcademicExplorerProps {
  onBack?: () => void;
}

export default function AcademicExplorer({
  onBack,
}: AcademicExplorerProps) {
  return (
    <div style={pageStyle}>
      <FoundationManagementHeader
        showBackButton
        onBack={onBack}
        title="📚 Academic Explorer"
        subtitle="
        Browse and manage the Academic Master Curriculum Layer of Talent Passport OS.
        This curriculum hierarchy powers Teacher Daily Logs, Lesson Planning,
        Homework, Assessments, Student Learning and Curriculum Analytics across
        the platform.
        "
        badge="Foundation"
      />

      <CurriculumStatistics
        totalBoards={2}
        totalSubjects={5}
        totalChapters={4}
        totalTopics={3}
        totalSubTopics={3}
      />

      <CurriculumCoverage />

      <MasterCurriculumSelector />
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "32px",
};