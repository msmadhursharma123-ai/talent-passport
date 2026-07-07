import type {
  ExecutiveKPIRecord,
  ExecutiveKPIMetrics,
} from "./executiveKPITypes";

async function fetchStudentRegistrationMetrics(): Promise<ExecutiveKPIMetrics> {
  // TODO: Connect students_master
  return {
    today: 0,
    last7Days: 0,
    last30Days: 0,
  };
}

async function fetchCompetitionEntryMetrics(): Promise<ExecutiveKPIMetrics> {
  // TODO: Connect submissions
  return {
    today: 0,
    last7Days: 0,
    last30Days: 0,
  };
}

export async function fetchExecutiveKPIs(): Promise<
  ExecutiveKPIRecord[]
> {
  const [
    studentMetrics,
    competitionMetrics,
  ] = await Promise.all([
    fetchStudentRegistrationMetrics(),
    fetchCompetitionEntryMetrics(),
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
      id: "teachers",
      title: "New Teachers",
      metrics: {
        today: 0,
        last7Days: 0,
        last30Days: 0,
      },
    },
    {
      id: "competitionEntries",
      title: "Competition Entries",
      metrics: competitionMetrics,
    },
  ];
}