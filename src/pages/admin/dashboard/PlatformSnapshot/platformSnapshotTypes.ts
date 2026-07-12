export interface PlatformSnapshotMetrics {
  value: number;
}

export type PlatformSnapshotId =
  | "students"
  | "schools"
  | "classes"
  | "competitions"
  | "pendingEvaluations";

export interface PlatformSnapshotRecord {
  id: PlatformSnapshotId;

  title: string;

  metrics: PlatformSnapshotMetrics;
}