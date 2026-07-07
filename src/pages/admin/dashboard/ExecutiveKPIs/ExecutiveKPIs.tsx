import { useEffect, useState } from "react";

import ExecutiveKPICard from "./ExecutiveKPICard";

import {
  fetchExecutiveKPIs,
} from "./executiveKPIRepository";

import type {
  ExecutiveKPIRecord,
} from "./executiveKPITypes";

import ExecutiveDetailDrawer from "./ExecutiveDetailDrawer";

import StudentRegistrationView from "./StudentRegistrationView";
import CompetitionEntriesView from "./CompetitionEntriesView";

export default function ExecutiveKPIs() {

  const [kpis, setKpis] =
    useState<ExecutiveKPIRecord[]>([]);

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [selectedKPI, setSelectedKPI] =
    useState<ExecutiveKPIRecord | null>(null);

  useEffect(() => {
    loadKPIs();
  }, []);

  async function loadKPIs() {
    const result =
      await fetchExecutiveKPIs();

    setKpis(result);
  }

  function handleCardClick(
    kpi: ExecutiveKPIRecord
  ) {
    setSelectedKPI(kpi);
    setDrawerOpen(true);
  }

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,minmax(0,1fr))",
          gap: 20,
        }}
      >
        {kpis.map((kpi) => (
          <ExecutiveKPICard
            key={kpi.id}
            data={kpi}
            onClick={handleCardClick}
          />
        ))}
      </div>

      <ExecutiveDetailDrawer
        open={drawerOpen}
        title={
          selectedKPI?.title ?? ""
        }
        onClose={() => {
          setDrawerOpen(false);
          setSelectedKPI(null);
        }}
      >
        {selectedKPI?.id ===
          "students" && (
          <StudentRegistrationView />
        )}

        {selectedKPI?.id ===
          "competitionEntries" && (
          <CompetitionEntriesView />
        )}
      </ExecutiveDetailDrawer>
    </>
  );
}