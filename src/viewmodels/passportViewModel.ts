import { getGrowthPlanData } from "../data/passportRepository";
import { getPercentileData } from "../data/passportAnalytics";
import { getSchoolBenchmarks } from "../data/schoolBenchmarkEngine";
import { calculateRarity } from "../data/rarityEngine";
import { getRecommendedCompetitions } from "../data/competitionEngine";
import {
    getDNAConfidence,
    getFutureReadinessScore,
    getStrongestSkill,
    getWeakestSkill
} from "../data/dnaInsightsEngine";

import {
    DNAConfidence
} from "../data/dnaInsightsEngine";

/* ============================================================
   PASSPORT VIEW TYPES
============================================================ */

export interface PassportDimension {

    key: string;

    label: string;

    value: number;

    average: number;

    percentile: number;

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

/* ============================================================
   VIEW MODEL
============================================================ */

export interface PassportViewModel {

    passport: any;

    dna: any;

    benchmarks: any;

    percentile: any;

    rarity: any;

    competitions: {

        name: string;

        score: number;

    }[];

    futureReadiness: number;

    confidence: DNAConfidence;

    strongestSkill: string;

    weakestSkill: string;

    submissions: any[];

    projects: any[];

    assessments: any[];

    /* ---------- Dashboard ---------- */

    dnaAverage: number;

    reliability: number;

    participationReadiness: number;

    /* ---------- Cards ---------- */

    dimensions: PassportDimension[];

    topStrengths: PassportDimension[];

    growthGaps: PassportDimension[];

    projections: PassportProjection[];

    percentileRows: PercentileRow[];

    rarityRows: RarityRow[];

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

        const passport =
            growth.passport;

const dna =
    growth.dna ?? {};

const submissions =
    growth.submissions ?? [];

const projects =
    growth.projects ?? [];

const assessments =
    growth.assessments ?? [];

       /* ============================================================
   DNA PROFILE
============================================================ */

const dnaProfile = {

    creativity:
        passport.creativity_score ?? 0,

    communication:
        passport.communication_score ?? 0,

    leadership:
        passport.leadership_score ?? 0,

    confidence:
        passport.confidence_score ?? 0,

    collaboration:
        passport.team_score ?? 0,

    criticalThinking:
        passport.critical_thinking_score ?? 0

};

/* ============================================================
   LOAD ENGINES
============================================================ */

const [

    benchmarkResult,

    percentileResult,

    rarityResult,

    competitionResult,

    confidenceResult,

    readinessResult,

    strongestResult,

    weakestResult

] = await Promise.allSettled([

    getSchoolBenchmarks(
        passport
    ),

    getPercentileData(
        passport
    ),

    Promise.resolve(

        calculateRarity(

            passport.combined_score ??

            passport.total_score ??

            0

        )

    ),

    Promise.resolve(

        getRecommendedCompetitions({

            normalizedScores: {

                Creativity:
                    passport.creativity_score ?? 0,

                Communication:
                    passport.communication_score ?? 0,

                Leadership:
                    passport.leadership_score ?? 0,

                Confidence:
                    passport.confidence_score ?? 0,

                Collaboration:
                    passport.team_score ?? 0,

                CriticalThinking:
                    passport.critical_thinking_score ?? 0

            }

        })

    ),

    Promise.resolve(
        getDNAConfidence(
            submissions.length
        )
    ),

    Promise.resolve(
        getFutureReadinessScore(
            dnaProfile
        )
    ),

    Promise.resolve(
        getStrongestSkill(
            dnaProfile
        )
    ),

    Promise.resolve(
        getWeakestSkill(
            dnaProfile
        )
    )

]);

/* ============================================================
   RESOLVE ENGINE RESULTS
============================================================ */

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

const competitions =

    competitionResult.status === "fulfilled"

        ? competitionResult.value

        : [];

const confidence =

    confidenceResult.status === "fulfilled"

        ? confidenceResult.value

        : "Low";

const futureReadiness =

    readinessResult.status === "fulfilled"

        ? readinessResult.value

        : 0;

const strongestSkill =

    strongestResult.status === "fulfilled"

        ? strongestResult.value

        : "";

const weakestSkill =

    weakestResult.status === "fulfilled"

        ? weakestResult.value

        : "";

/* ============================================================
   VIEW OBJECTS
============================================================ */

const dimensions: PassportDimension[] = [

    {

        key: "creativity",

        label: "Creativity",

        value: passport.creativity_score ?? 0,

        average:
            benchmarks?.creativity?.average ?? 0,

        percentile:
            percentile?.creativity ?? 0

    },

    {

        key: "communication",

        label: "Communication",

        value: passport.communication_score ?? 0,

        average:
            benchmarks?.communication?.average ?? 0,

        percentile:
            percentile?.communication ?? 0

    },

    {

        key: "leadership",

        label: "Leadership",

        value: passport.leadership_score ?? 0,

        average:
            benchmarks?.leadership?.average ?? 0,

        percentile: 0

    },

    {

        key: "confidence",

        label: "Confidence",

        value: passport.confidence_score ?? 0,

        average:
            benchmarks?.confidence?.average ?? 0,

       percentile: 0

    },

    {

        key: "collaboration",

        label: "Collaboration",

        value: passport.team_score ?? 0,

        average:
            benchmarks?.collaboration?.average ?? 0,

        percentile:
            percentile?.collaboration ?? 0

    },

    {

        key: "criticalThinking",

        label: "Critical Thinking",

        value: passport.critical_thinking_score ?? 0,

        average:
            benchmarks?.criticalThinking?.average ?? 0,

        percentile:
            percentile?.criticalThinking ?? 0

    }

];

const topStrengths =

    [...dimensions]

        .sort((a, b) => b.value - a.value)

        .slice(0, 3);

const growthGaps =

    [...dimensions]

        .sort((a, b) => a.value - b.value)

        .slice(0, 2);

const projections: PassportProjection[] =

    dimensions.map(

        dimension => ({

            label:
                dimension.label,

            current:
                dimension.value,

            projected:
                Math.min(
                    100,
                    dimension.value + 20
                )

        })

    );

const dnaAverage =

    Math.round(

        dimensions.reduce(

            (sum, item) =>

                sum + item.value,

            0

        ) /

        dimensions.length

    );

const reliability =

    submissions.length * 10;

const participationReadiness =

    futureReadiness;

const percentileRows =

    dimensions.map(

        d => ({

            label:
                d.label,

            percentile:
                d.percentile

        })

    );

const rarityRows =

    dimensions.map(

        d => ({

            label:
                d.label,

            value:
                `${d.percentile}th Percentile`

        })

    );

        
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

    dnaAverage,

    reliability,

    participationReadiness,

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