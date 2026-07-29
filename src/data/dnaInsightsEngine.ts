/* ============================================================
   DNA INSIGHTS ENGINE

   Pure evidence-aware insight engine.

   RULE:
   Using the portal does not increase Talent DNA.
   Confidence/readiness improve only when the profile has
   meaningful evaluated evidence.
============================================================ */

export interface DNAProfile {
  communication: number;
  leadership: number;
  confidence: number;
  collaboration: number;
  criticalThinking: number;
  creativity: number;
}

export type DNAConfidence =
  | "High"
  | "Medium"
  | "Low";

export interface DNAEvidenceContext {
  verifiedCount?: number;
  assessmentCount?: number;
  projectCount?: number;
  submissionCount?: number;
  academicFeedbackCount?: number;
  evidenceCoverage?: number;
}

function clamp100(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function values(dna: DNAProfile): number[] {
  return Object.values(dna).map(value =>
    clamp100(Number(value) || 0)
  );
}

export function getEvidenceCoverage(
  context: DNAEvidenceContext
): number {

  if (Number.isFinite(Number(context.evidenceCoverage))) {
    return clamp100(Number(context.evidenceCoverage));
  }

  const assessments =
    Math.min(3, Math.max(0, Number(context.assessmentCount) || 0));

  const projects =
    Math.min(3, Math.max(0, Number(context.projectCount) || 0));

  const submissions =
    Math.min(4, Math.max(0, Number(context.submissionCount) || 0));

  const academic =
    Math.min(10, Math.max(0, Number(context.academicFeedbackCount) || 0));

  return clamp100(
    (assessments / 3) * 30 +
    (projects / 3) * 25 +
    (submissions / 4) * 30 +
    (academic / 10) * 15
  );
}

export function getDNAConfidence(
  input: number | DNAEvidenceContext
): DNAConfidence {

  const coverage =
    typeof input === "number"
      ? clamp100((Math.max(0, input) / 10) * 100)
      : getEvidenceCoverage(input);

  if (coverage >= 70) {
    return "High";
  }

  if (coverage >= 35) {
    return "Medium";
  }

  return "Low";
}

export function getStrongestSkill(
  dna: DNAProfile
): keyof DNAProfile {

  return Object.keys(dna).reduce(
    (best, current) =>
      dna[current as keyof DNAProfile] >
      dna[best as keyof DNAProfile]
        ? current
        : best
  ) as keyof DNAProfile;
}

export function getWeakestSkill(
  dna: DNAProfile
): keyof DNAProfile {

  return Object.keys(dna).reduce(
    (worst, current) =>
      dna[current as keyof DNAProfile] <
      dna[worst as keyof DNAProfile]
        ? current
        : worst
  ) as keyof DNAProfile;
}

export function getFutureReadinessScore(
  dna: DNAProfile,
  context?: DNAEvidenceContext
): number {

  const dnaValues =
    values(dna);

  if (dnaValues.length === 0) {
    return 0;
  }

  const average =
    dnaValues.reduce(
      (sum, value) => sum + value,
      0
    ) / dnaValues.length;

  /*
   * Breadth rewards a balanced profile but never invents talent.
   * Evidence coverage adjusts certainty/readiness, not raw DNA.
   */
  const minimum =
    Math.min(...dnaValues);

  const breadth =
    average * 0.8 +
    minimum * 0.2;

  if (!context) {
    return clamp100(breadth);
  }

  const coverage =
    getEvidenceCoverage(context);

  return clamp100(
    breadth * 0.8 +
    coverage * 0.2
  );
}
