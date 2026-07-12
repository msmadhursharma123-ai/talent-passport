import type {
  ExecutiveKPIRecord,
  ExecutiveKPIMetrics,
} from "./executiveKPITypes";

import {
  fetchStudentRegistrationMetrics,
  fetchCompetitionEntryMetrics,
  fetchPartnerRegistrationMetrics,
} from "../../../../supabaseClient";



export async function fetchExecutiveKPIs(): Promise<
  ExecutiveKPIRecord[]
> {
const [
  studentMetrics,
  competitionMetrics,
  partnerMetrics,
] = await Promise.all([
  fetchStudentRegistrationMetrics(),
  fetchCompetitionEntryMetrics(),
  fetchPartnerRegistrationMetrics(),
]);

return [
  {
    id: "students",
    title: "New Students",
    metrics: studentMetrics,
  },
  {
    id: "schools",
    title: "New Schools",
    metrics: {
      today: 0,
      last7Days: 0,
      last30Days: 0,
    },
  },
  {
    id: "partners",
    title: "New Partners",
    metrics: partnerMetrics,
  },
  {
    id: "competitionEntries",
    title: "Competition Entries",
    metrics: competitionMetrics,
  },
];
}