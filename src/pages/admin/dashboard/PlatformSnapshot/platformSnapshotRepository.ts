import type {
  PlatformSnapshotRecord,
} from "./platformSnapshotTypes";

export function buildPlatformSnapshot(
  summary: {
    totalStudents: number;
    totalSchools: number;
    totalClasses: number;
    totalCompetitions: number;
    pendingEvaluations: number;
  }
): PlatformSnapshotRecord[] {
  return [
    {
      id: "students",
      title: "Total Students",
      metrics: {
        value: summary.totalStudents,
      },
    },

    {
      id: "schools",
      title: "Total Schools",
      metrics: {
        value: summary.totalSchools,
      },
    },

    {
      id: "classes",
      title: "Total Classes",
      metrics: {
        value: summary.totalClasses,
      },
    },

    {
      id: "competitions",
      title: "Competitions",
      metrics: {
        value: summary.totalCompetitions,
      },
    },

    {
      id: "pendingEvaluations",
      title: "Pending Evaluations",
      metrics: {
        value: summary.pendingEvaluations,
      },
    },
  ];
}