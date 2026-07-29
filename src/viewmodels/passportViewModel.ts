import { getGrowthPlanData } from "../data/passportRepository";
import { getStudentGrowthIntelligence } from "../services/growthIntelligenceService";
import type { GrowthIntelligenceProfile } from "../engines/growthIntelligenceEngine";
import { getStudentLearningIntelligence } from "../services/learningIntelligenceService";
import type { LearningIntelligenceProfile } from "../engines/learningIntelligenceEngine";
import { getPercentileData } from "../data/passportAnalytics";
import { getSchoolBenchmarks } from "../data/schoolBenchmarkEngine";
import { calculateRarity } from "../data/rarityEngine";
import { getRecommendedCompetitions } from "../data/competitionEngine";
import { generatePassport } from "../data/passportEngine";
import {
    getFutureReadinessScore,
    getStrongestSkill,
    getWeakestSkill,
    DNAConfidence
} from "../data/dnaInsightsEngine";

import {
    buildEvidenceIntelligence,
    normalizeCurrentTalentDNA,
    normalizeTalentDNAExplanation,
    EvidenceIntelligence,
    CurrentTalentDNA,
    TalentDNAExplanation
} from "../data/talentEvidenceEngine";

import type {
    TalentEvidenceRecord,
    TalentDNAHistoryRecord,
    TalentEvidenceSummary
} from "../data/talentEvidenceRepository";

export interface PassportDimension {
    key: string;
    label: string;
    value: number;
    average: number;
    percentile: number;
    schoolPercentile: number;
}

export interface PassportProjection {
    label: string;
    current: number;
    projected: number;
}

export interface PercentileRow {
    label: string;
    percentile: number;
}

export interface RarityRow {
    label: string;
    value: string;
}

export interface PassportViewModel {
    passport: any;
    dna: any;
    benchmarks: any;
    percentile: any;
    rarity: any;

    competitions: {
        name: string;
        score: number;
        [key: string]: any;
    }[];

    futureReadiness: number;
    confidence: DNAConfidence;
    strongestSkill: string;
    weakestSkill: string;

    submissions: any[];
    projects: any[];
    assessments: any[];

    evidence: TalentEvidenceRecord[];
    dnaHistory: TalentDNAHistoryRecord[];
    evidenceSummary: TalentEvidenceSummary;
    evidenceIntelligence: EvidenceIntelligence;
    currentTalentDNA: CurrentTalentDNA;
    talentDNAExplanation: TalentDNAExplanation;
    growthIntelligence: GrowthIntelligenceProfile | null;
    learningIntelligence: LearningIntelligenceProfile | null;

    dnaAverage: number;
    reliability: number;
    participationReadiness: number;
    evidenceCoverage: number;

    dimensions: PassportDimension[];
    topStrengths: PassportDimension[];
    growthGaps: PassportDimension[];
    projections: PassportProjection[];
    percentileRows: PercentileRow[];
    rarityRows: RarityRow[];
}

function numeric(value: unknown, fallback = 0): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp100(value: number): number {
    return Math.min(100, Math.max(0, Math.round(value)));
}

function readAnswers(
    dna: any,
    assessments: any[]
): Record<number, unknown> {

    if (
        dna?.answers &&
        typeof dna.answers === "object"
    ) {
        return dna.answers;
    }

    const latestAssessment =
        [...assessments]
            .sort((a, b) => {
                const aTime =
                    new Date(a?.created_at ?? 0).getTime();

                const bTime =
                    new Date(b?.created_at ?? 0).getTime();

                return bTime - aTime;
            })[0];

    if (
        latestAssessment?.answers &&
        typeof latestAssessment.answers === "object"
    ) {
        return latestAssessment.answers;
    }

    return {};
}

function confidenceFromProfile(
    profileConfidence: number
): DNAConfidence {

    if (profileConfidence >= 70) {
        return "High";
    }

    if (profileConfidence >= 40) {
        return "Medium";
    }

    return "Low";
}

export async function getPassportViewModel():
Promise<PassportViewModel | null> {

    try {

        const growth =
            await getGrowthPlanData();

        if (
            !growth ||
            !growth.passport
        ) {
            return null;
        }

        const storedPassport =
            growth.passport;

        const dna =
            growth.dna ?? {};

        const submissions =
            growth.submissions ?? [];

        const projects =
            growth.projects ?? [];

        const assessments =
            growth.assessments ?? [];

        const evidence: TalentEvidenceRecord[] =
            growth.evidence ?? [];

        const dnaHistory: TalentDNAHistoryRecord[] =
            growth.dnaHistory ?? [];

        const evidenceSummary: TalentEvidenceSummary =
            growth.evidenceSummary ?? {
                totalEvidence: 0,
                sourceDiversity: 0,
                dimensionCoverage: 0,
                recentEvidence90Days: 0,
                baselineEvidence: 0
            };

        /*
         * Phase 3 — Evidence Foundation.
         *
         * Evidence Intelligence interprets the authenticated ledger
         * and history. It does NOT alter the six DNA scores yet.
         */
        const evidenceIntelligence =
            buildEvidenceIntelligence(
                evidence,
                dnaHistory,
                evidenceSummary
            );

        /*
         * BASELINE DNA
         *
         * These are calibrated talent values.
         * Merely opening/using a portal feature NEVER changes them.
         * Future evidence engines may provide evaluated score updates,
         * but those updates must be attributable to real evidence.
         */
        const baselineScores = {

            creativity:
                numeric(
                    dna?.creativity_score,
                    numeric(storedPassport?.creativity_score)
                ),

            communication:
                numeric(
                    dna?.communication_score,
                    numeric(storedPassport?.communication_score)
                ),

            leadership:
                numeric(
                    dna?.leadership_score,
                    numeric(storedPassport?.leadership_score)
                ),

            confidence:
                numeric(
                    dna?.confidence_score,
                    numeric(storedPassport?.confidence_score)
                ),

            collaboration:
                numeric(
                    dna?.collaboration_score,
                    numeric(storedPassport?.team_score)
                ),

            criticalThinking:
                numeric(
                    dna?.critical_thinking_score,
                    numeric(storedPassport?.critical_thinking_score)
                )
        };

        /*
         * PHASE 4 — CURRENT TALENT DNA
         *
         * Secure database calculation is authoritative.
         * Existing DNA is only the compatibility fallback.
         * Baseline-only students therefore remain unchanged.
         */
        const currentTalentDNA =
            normalizeCurrentTalentDNA(
                growth.currentTalentDNA,
                {
                    ...baselineScores,
                    profileConfidence:
                        evidenceIntelligence.profileConfidence,
                    evidenceSignalCount: 0
                }
            );

        const talentDNAExplanation =
            normalizeTalentDNAExplanation(
                growth.talentDNAExplanation
            );

        const sourceScores = {
            creativity:
                currentTalentDNA.creativity,

            communication:
                currentTalentDNA.communication,

            leadership:
                currentTalentDNA.leadership,

            confidence:
                currentTalentDNA.confidence,

            collaboration:
                currentTalentDNA.collaboration,

            criticalThinking:
                currentTalentDNA.criticalThinking
        };

        const passport = {
            ...storedPassport,

            creativity_score:
                sourceScores.creativity,

            communication_score:
                sourceScores.communication,

            leadership_score:
                sourceScores.leadership,

            confidence_score:
                sourceScores.confidence,

            team_score:
                sourceScores.collaboration,

            collaboration_score:
                sourceScores.collaboration,

            critical_thinking_score:
                sourceScores.criticalThinking,

            combined_score:
                Math.round(
                    (
                        sourceScores.creativity +
                        sourceScores.communication +
                        sourceScores.leadership +
                        sourceScores.confidence +
                        sourceScores.collaboration +
                        sourceScores.criticalThinking
                    ) / 6
                )
        };

        const dnaProfile = {
            creativity:
                sourceScores.creativity,

            communication:
                sourceScores.communication,

            leadership:
                sourceScores.leadership,

            confidence:
                sourceScores.confidence,

            collaboration:
                sourceScores.collaboration,

            criticalThinking:
                sourceScores.criticalThinking
        };

        const answers =
            readAnswers(
                dna,
                assessments
            );

        const engineScores = {
            Communication:
                sourceScores.communication * 0.6,

            Leadership:
                sourceScores.leadership * 0.6,

            Creativity:
                sourceScores.creativity * 0.6,

            CriticalThinking:
                sourceScores.criticalThinking * 0.6,

            Collaboration:
                sourceScores.collaboration * 0.6,

            Confidence:
                sourceScores.confidence * 0.6,

            Resilience: 0,
            Entrepreneurship: 0
        };

        const generatedMetrics =
            generatePassport(
                engineScores,
                answers
            );

        /*
         * Evidence Coverage now comes from the Evidence Foundation.
         * It measures profile maturity/trustworthiness, not talent.
         */
        const evidenceCoverage =
            currentTalentDNA.profileConfidence > 0
                ? currentTalentDNA.profileConfidence
                : evidenceIntelligence.profileConfidence;

        /*
         * Preserve the existing downstream EvidenceContext API while
         * feeding its verified count from the new evidence ledger.
         */
        const evidenceContext = {
            verifiedCount:
                evidenceSummary.totalEvidence,

            submissionCount:
                submissions.length,

            projectCount:
                projects.length,

            assessmentCount:
                assessments.length,

            academicFeedbackCount:
                0
        };

        const [
            benchmarkResult,
            percentileResult,
            rarityResult,
            growthIntelligenceResult,
            learningIntelligenceResult
        ] = await Promise.allSettled([

            getSchoolBenchmarks(
                passport
            ),

            getPercentileData(
                passport
            ),

            calculateRarity(
                passport.combined_score
            ),

            getStudentGrowthIntelligence(),

            getStudentLearningIntelligence(30)
        ]);

        const benchmarks =
            benchmarkResult.status === "fulfilled"
                ? benchmarkResult.value
                : null;

        const percentile =
            percentileResult.status === "fulfilled"
                ? percentileResult.value
                : null;

        const rarity =
            rarityResult.status === "fulfilled"
                ? rarityResult.value
                : null;

        const growthIntelligence =
            growthIntelligenceResult.status === "fulfilled"
                ? growthIntelligenceResult.value
                : null;

        if (growthIntelligenceResult.status === "rejected") {
            console.error(
                "Growth Intelligence failed",
                growthIntelligenceResult.reason
            );
        }

        const learningIntelligence =
            learningIntelligenceResult.status === "fulfilled"
                ? learningIntelligenceResult.value
                : null;

        if (learningIntelligenceResult.status === "rejected") {
            console.error(
                "Learning Intelligence failed",
                learningIntelligenceResult.reason
            );
        }

        const confidence =
            confidenceFromProfile(
                evidenceCoverage
            );

        const futureReadiness =
            getFutureReadinessScore(
                dnaProfile,
                evidenceContext
            );

        const strongestSkill =
            getStrongestSkill(
                dnaProfile
            );

        const weakestSkill =
            getWeakestSkill(
                dnaProfile
            );

        const competitions =
            getRecommendedCompetitions({
                normalizedScores: {
                    Creativity:
                        sourceScores.creativity,

                    Communication:
                        sourceScores.communication,

                    Leadership:
                        sourceScores.leadership,

                    Confidence:
                        sourceScores.confidence,

                    Collaboration:
                        sourceScores.collaboration,

                    CriticalThinking:
                        sourceScores.criticalThinking
                },

                evidenceConfidence:
                    evidenceCoverage
            });

        /*
         * THREE DIFFERENT COMPARISONS:
         *
         * average          = school + class cohort average
         * schoolPercentile = school + class relative position
         * percentile       = class cohort across the platform
         */
        const dimensions: PassportDimension[] = [
            {
                key: "creativity",
                label: "Creativity",
                value: sourceScores.creativity,
                average: benchmarks?.creativity?.average ?? 0,
                schoolPercentile: benchmarks?.creativity?.percentile ?? 0,
                percentile: percentile?.creativity ?? 0
            },
            {
                key: "communication",
                label: "Communication",
                value: sourceScores.communication,
                average: benchmarks?.communication?.average ?? 0,
                schoolPercentile: benchmarks?.communication?.percentile ?? 0,
                percentile: percentile?.communication ?? 0
            },
            {
                key: "leadership",
                label: "Leadership",
                value: sourceScores.leadership,
                average: benchmarks?.leadership?.average ?? 0,
                schoolPercentile: benchmarks?.leadership?.percentile ?? 0,
                percentile: percentile?.leadership ?? 0
            },
            {
                key: "confidence",
                label: "Confidence",
                value: sourceScores.confidence,
                average: benchmarks?.confidence?.average ?? 0,
                schoolPercentile: benchmarks?.confidence?.percentile ?? 0,
                percentile: percentile?.confidence ?? 0
            },
            {
                key: "collaboration",
                label: "Collaboration",
                value: sourceScores.collaboration,
                average: benchmarks?.collaboration?.average ?? 0,
                schoolPercentile: benchmarks?.collaboration?.percentile ?? 0,
                percentile: percentile?.collaboration ?? 0
            },
            {
                key: "criticalThinking",
                label: "Critical Thinking",
                value: sourceScores.criticalThinking,
                average: benchmarks?.criticalThinking?.average ?? 0,
                schoolPercentile: benchmarks?.criticalThinking?.percentile ?? 0,
                percentile: percentile?.criticalThinking ?? 0
            }
        ];

        const topStrengths =
            [...dimensions]
                .sort(
                    (a, b) =>
                        b.value - a.value
                )
                .slice(0, 3);

        const growthGaps =
            [...dimensions]
                .sort(
                    (a, b) =>
                        a.value - b.value
                )
                .slice(0, 2);

        const projectionMap:
            Record<string, number> = {
            Creativity:
                generatedMetrics.projectedScores.Creativity,

            Communication:
                generatedMetrics.projectedScores.Communication,

            Leadership:
                generatedMetrics.projectedScores.Leadership,

            Confidence:
                generatedMetrics.projectedScores.Confidence,

            Collaboration:
                generatedMetrics.projectedScores.Collaboration,

            "Critical Thinking":
                generatedMetrics.projectedScores.CriticalThinking
        };

        const projections: PassportProjection[] =
            dimensions.map(
                dimension => ({
                    label:
                        dimension.label,

                    current:
                        dimension.value,

                    projected:
                        clamp100(
                            projectionMap[
                                dimension.label
                            ] ??
                            dimension.value
                        )
                })
            );

        const dnaAverage =
            Math.round(
                (
                    (
                        sourceScores.creativity +
                        sourceScores.communication +
                        sourceScores.leadership +
                        sourceScores.confidence +
                        sourceScores.collaboration +
                        sourceScores.criticalThinking
                    ) / 6
                ) * 100
            ) / 100;

        const hasAnswers =
            Object.keys(
                answers
            ).length > 0;

        /*
         * Questionnaire reliability describes baseline calibration.
         * Evidence confidence is a separate live concept and is exposed
         * through DNA Confidence/evidenceCoverage.
         */
        const reliability =
            hasAnswers
                ? generatedMetrics.reliability
                : numeric(
                    dna?.reliability,
                    0
                );

        const participationReadiness =
            hasAnswers
                ? generatedMetrics.participationIndex
                : numeric(
                    dna?.participation_index,
                    futureReadiness
                );

        const percentileRows: PercentileRow[] =
            dimensions.map(
                dimension => ({
                    label:
                        dimension.label,

                    percentile:
                        clamp100(
                            dimension.percentile
                        )
                })
            );

        const rarityRows: RarityRow[] = [
            {
                label:
                    "Talent Distinctiveness",

                value:
                    rarity
                        ? `${clamp100(rarity.score)}/100`
                        : "—"
            },
            {
                label:
                    "Profile Signal",

                value:
                    rarity?.label ??
                    "Unavailable"
            },
            {
                label:
                    "Evidence Confidence",

                value:
                    rarity?.confidence ??
                    confidence
            },
            {
                label:
                    "Class Cohort",

                value:
                    rarity?.totalStudents
                        ? `${rarity.totalStudents} Students`
                        : "—"
            }
        ];

        return {
            passport,
            dna,
            benchmarks,
            percentile,
            rarity,
            competitions,
            futureReadiness,
            confidence,
            strongestSkill,
            weakestSkill,
            submissions,
            projects,
            assessments,
            evidence,
            dnaHistory,
            evidenceSummary,
            evidenceIntelligence,
            currentTalentDNA,
            talentDNAExplanation,
            growthIntelligence,
            learningIntelligence,
            dnaAverage,
            reliability,
            participationReadiness,
            evidenceCoverage,
            dimensions,
            topStrengths,
            growthGaps,
            projections,
            percentileRows,
            rarityRows
        };
    }

    catch (error) {

        console.error(
            "PassportViewModel",
            error
        );

        return null;
    }
}
