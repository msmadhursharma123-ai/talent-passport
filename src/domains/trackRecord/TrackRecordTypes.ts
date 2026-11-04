
export type TrackRecordAudience = "teacher" | "school";
export type TrackRecordView = "monthly" | "weekly";

export type TrackRecordMetricId =
  | "feedback" | "health" | "understanding" | "partial" | "didNotUnderstand"
  | "doubtRate" | "closureRate" | "below50" | "above80"
  | "openingDoubts" | "closingDoubts" | "newDoubts" | "resolvedDoubts"
  | "topics" | "subtopics" | "logsSubmitted" | "logsMissed";

export interface TrackRecordPeriod {
  id: string;
  view: TrackRecordView;
  label: string;
  startDate: string;
  endDateExclusive: string;
  isFuture: boolean;
  /** Current period is capped at today and is not comparable to a complete prior period. */
  isPartial: boolean;
}

export interface TrackRecordMetric {
  id: TrackRecordMetricId;
  label: string;
  value: number | null;
  display: string;
  unit: "percent" | "count" | "countPercent" | "unavailable";
  note?: string;
  /** Comparable value used for trend direction when the displayed value is a count. */
  trendValue?: number;
}

export interface TrackRecordDetailRow {
  label: string;
  value?: string | number;
  secondary?: string;
}

export interface TrackRecordCell {
  period: TrackRecordPeriod;
  metrics: Record<TrackRecordMetricId, TrackRecordMetric>;
  details: Partial<Record<TrackRecordMetricId, TrackRecordDetailRow[]>>;
}

export interface TrackRecordGroup {
  id: string;
  teacherUuid: string;
  teacherName: string;
  className: string;
  sectionName: string;
  subjectName: string;
  assignmentIds: string[];
  cells: TrackRecordCell[];
}

export interface TrackRecordData {
  audience: TrackRecordAudience;
  schoolName: string;
  generatedAt: string;
  startDate: string;
  endDate: string;
  groups: TrackRecordGroup[];
  teachers: Array<{ uuid: string; name: string }>;
  classes: Array<{ value: string; label: string }>;
  sections: Array<{ value: string; label: string }>;
  subjects: Array<{ value: string; label: string }>;
  warnings: string[];
}
