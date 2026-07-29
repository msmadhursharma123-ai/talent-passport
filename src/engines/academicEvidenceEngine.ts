import { getSupabaseClient } from "../supabaseClient";
import { requireIdentity } from "../services/identityService";

export type AcademicEvidenceLevel =
  | "No Evidence"
  | "Emerging"
  | "Developing"
  | "Consistent"
  | "Strong";

export interface AcademicEvidenceSnapshot {
  totalResponses: number;
  completelyUnderstood: number;
  partiallyUnderstood: number;
  didNotUnderstand: number;
  lecturesWithDoubts: number;
  subjectsEngaged: number;
  responseRateSignal: number;
  understandingScore: number;
  consistencyScore: number;
  academicEvidenceScore: number;
  level: AcademicEvidenceLevel;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function getLevel(score: number, totalResponses: number): AcademicEvidenceLevel {
  if (totalResponses === 0) return "No Evidence";
  if (score >= 80) return "Strong";
  if (score >= 65) return "Consistent";
  if (score >= 45) return "Developing";
  return "Emerging";
}

/**
 * Academic Evidence is intentionally NOT an academic marks/ability score.
 *
 * It summarizes the student's real learning-response evidence generated
 * through the Continuous Learning Feedback System.
 *
 * Sources:
 * - student_daily_feedback
 *
 * Signals:
 * - understanding across submitted lecture feedback
 * - consistency / volume of learning-response evidence
 * - subject breadth
 * - doubt participation
 *
 * No teacher judgement, competition score, portfolio score, or self-uploaded
 * achievement score is mixed into this layer.
 */
export async function getStudentAcademicEvidenceSnapshot():
  Promise<AcademicEvidenceSnapshot> {

  const supabase = getSupabaseClient();
  const identity = requireIdentity();

  const { data, error } = await (supabase as any)
    .from("student_daily_feedback")
    .select(
      "understanding_level, has_doubt, subject_name, daily_log_uuid, submitted_at"
    )
    .eq("student_uuid", identity.studentUuid)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("ACADEMIC EVIDENCE FETCH ERROR", error);
    throw error;
  }

  const rows = data ?? [];
  const totalResponses = rows.length;

  const completelyUnderstood = rows.filter(
    (row: any) =>
      row.understanding_level === "I completely understood."
  ).length;

  const partiallyUnderstood = rows.filter(
    (row: any) =>
      row.understanding_level === "I partially understood."
  ).length;

  const didNotUnderstand = rows.filter(
    (row: any) =>
      row.understanding_level === "I didn't understand."
  ).length;

  const lecturesWithDoubts = rows.filter(
    (row: any) => Boolean(row.has_doubt)
  ).length;

  const subjectsEngaged = new Set(
    rows
      .map((row: any) => row.subject_name?.trim())
      .filter(Boolean)
  ).size;

  /*
   * UNDERSTANDING SCORE
   * Complete = 1.00
   * Partial  = 0.55
   * Didn't   = 0.15
   *
   * This measures the learning-response signal only.
   */
  const understandingScore =
    totalResponses === 0
      ? 0
      : Math.round(
          (
            completelyUnderstood * 1 +
            partiallyUnderstood * 0.55 +
            didNotUnderstand * 0.15
          ) /
            totalResponses *
            100
        );

  /*
   * CONSISTENCY SCORE
   * Evidence confidence grows with repeated feedback.
   * 10 responses reaches full consistency confidence.
   */
  const consistencyScore = Math.round(
    clamp((totalResponses / 10) * 100)
  );

  /*
   * RESPONSE RATE SIGNAL
   * At this stage we do not have a guaranteed student-specific denominator
   * for every lecture that required feedback, so this is an evidence-volume
   * signal rather than a claimed attendance/response percentage.
   */
  const responseRateSignal = consistencyScore;

  /*
   * FINAL ACADEMIC EVIDENCE SCORE
   *
   * 75% actual understanding signal
   * 25% evidence consistency
   *
   * Subject breadth and doubts remain descriptive evidence and do not
   * artificially increase academic performance.
   */
  const academicEvidenceScore =
    totalResponses === 0
      ? 0
      : Math.round(
          understandingScore * 0.75 +
          consistencyScore * 0.25
        );

  return {
    totalResponses,
    completelyUnderstood,
    partiallyUnderstood,
    didNotUnderstand,
    lecturesWithDoubts,
    subjectsEngaged,
    responseRateSignal,
    understandingScore,
    consistencyScore,
    academicEvidenceScore,
    level: getLevel(academicEvidenceScore, totalResponses),
  };
}
