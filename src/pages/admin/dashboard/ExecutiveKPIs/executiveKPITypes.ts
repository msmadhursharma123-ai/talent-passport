export interface ExecutiveKPIMetrics {
  today: number;
  last7Days: number;
  last30Days: number;
}

export interface ExecutiveKPIRecord {
id:
  | "students"
  | "schools"
  | "teachers"
  | "partners"
  | "competitionEntries";

  title: string;

  metrics: ExecutiveKPIMetrics;
}