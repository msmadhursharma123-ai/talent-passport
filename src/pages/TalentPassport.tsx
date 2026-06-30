import React, {
    useEffect,
    useState
} from "react";

import {
    calculateTalentDNA
} from "../data/talentDNAEngine";

import {
    getStudentAchievements
} from "../data/timelineRepository";

import {
    generatePassport
} from "../data/passportEngine";

import {
    savePassport
} from "../data/passportRepository";

import {
    requireIdentity,
    clearStudentIdentity
} from "../services/identityService";

import {
    getPassportViewModel,
    PassportViewModel,
    PassportDimension,
    PassportProjection,
    PercentileRow,
    RarityRow
} from "../viewmodels/passportViewModel";

interface Props {

    onStartDNA?: () => void;

}

export default function TalentPassport({

    onStartDNA

}: Props) {

    /* ==========================================
       Identity Kernel
    ========================================== */

    const identity =
        requireIdentity();

    const studentId =
        identity.studentUuid;

    if (!studentId) {

        throw new Error(
            "Student identity missing."
        );

    }

    /* ==========================================
       Passport ViewModel
    ========================================== */

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        passportModel,

        setPassportModel

    ] = useState<PassportViewModel | null>(null);

    const studentName =
        identity.studentName ?? "";

    /* ==========================================
       Logout
    ========================================== */

    const handleLogout = () => {

        clearStudentIdentity();

        localStorage.removeItem(
            "studentPassport"
        );

        localStorage.removeItem(
            "studentAnswers"
        );

        window.location.reload();

    };

    useEffect(() => {

        async function loadPassportModel() {

            try {

                setLoading(true);

                const model =
                    await getPassportViewModel();

                setPassportModel(model);

            }

            catch (error) {

                console.error(
                    "Passport ViewModel",
                    error
                );

                setPassportModel(null);

            }

            finally {

                setLoading(false);

            }

        }

        loadPassportModel();

    }, []);

/* ==========================================
   ViewModel Data
========================================== */

const passport =
    passportModel?.passport;


const dimensions =
    passportModel?.dimensions ?? [];

const topStrengths =
    passportModel?.topStrengths ?? [];

const growthGaps =
    passportModel?.growthGaps ?? [];

const projections =
    passportModel?.projections ?? [];

const percentileRows =
    passportModel?.percentileRows ?? [];

const rarityRows =
    passportModel?.rarityRows ?? [];

const recommendedCompetitions =
    passportModel?.competitions ?? [];

const dnaAverage =
    passportModel?.dnaAverage ?? 0;

const reliability =
    passportModel?.reliability ?? 0;

const participationReadiness =
    passportModel?.participationReadiness ?? 0;

const futureReadiness =
    passportModel?.futureReadiness ?? 0;

const dnaConfidence =
    passportModel?.confidence ?? "Low";

const strongestSkill =
    passportModel?.strongestSkill ?? "";

const weakestSkill =
    passportModel?.weakestSkill ?? "";

/* ==========================================
   Loading
========================================== */

if (loading) {

    return (

        <div
            style={{
                minHeight: "70vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >

            Loading Talent Passport...

        </div>

    );

}

/* ==========================================
   Empty Passport
========================================== */

if (!passportModel || !passport) {

    return (

        <div
            style={{
                minHeight: "70vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >

            <div
                style={{
                    background: "white",
                    padding: 40,
                    borderRadius: 20,
                    textAlign: "center",
                    boxShadow:
                        "0 8px 30px rgba(0,0,0,.08)"
                }}
            >

                <h2
                    style={{
                        color: "#143B73",
                        marginBottom: 20
                    }}
                >
                    Talent Passport Not Found
                </h2>

                <p
                    style={{
                        color: "#666",
                        marginBottom: 25
                    }}
                >
                    This student has not completed
                    the DNA Assessment yet.
                </p>

                <button

                    onClick={() => {

                        localStorage.removeItem(
                            "studentPassport"
                        );

                        localStorage.removeItem(
                            "talentScores"
                        );

                        localStorage.removeItem(
                            "studentCalibration"
                        );

                        localStorage.removeItem(
                            "studentAnswers"
                        );

                        onStartDNA?.();

                    }}

                    style={{
                        background: "#F4A623",
                        color: "white",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: 12,
                        cursor: "pointer",
                        fontWeight: 600
                    }}
                >

                    Complete DNA Assessment

                </button>

            </div>

        </div>

    );

}

/* ==========================================
   PAGE
========================================== */

return (

<div
    style={{
        background: "#F4F5F7",
        minHeight: "100vh",
        padding: 30
    }}
>

<div
    style={{
        maxWidth: 1600,
        margin: "0 auto"
    }}
>

{/* HEADER */}

<div
    style={{
        background: "#FFF",
        borderRadius: 24,
        padding: 30,
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    }}
>

<div>

<div
    style={{
        fontSize: 12,
        color: "#F97316",
        fontWeight: 700,
        letterSpacing: 2
    }}
>
    PRE-TERM TALENT PROFILING
</div>

<h1
    style={{
        marginTop: 10,
        color: "#0B2A4A",
        fontSize: 38,
        marginBottom: 10
    }}
>
    Co-Curricular Diagnostic Calibration
</h1>

<div
    style={{
        color: "#64748B"
    }}
>
    {studentName}
</div>

</div>

<div
    style={{
        background: "#FF6B00",
        color: "#FFF",
        padding: 24,
        borderRadius: 20,
        width: 220,
        textAlign: "center"
    }}
>

<div style={{ fontSize: 12 }}>
    RELATIVE DNA AVG
</div>

<div
    style={{
        fontSize: 52,
        fontWeight: 700
    }}
>
    {dnaAverage}
</div>

<div>/100</div>

<div
    style={{
        marginTop: 8,
        fontSize: 12
    }}
>
    Reliability {reliability}%
</div>

</div>
</div>
</div>

      {/* ==========================================================
    MAIN GRID
========================================================== */}

<div
    style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 24,
        alignItems: "start"
    }}
>

    {/* ======================================================
        LEFT COLUMN
    ====================================================== */}

    <div
        style={{
            display: "flex",
            flexDirection: "column",
            gap: 24
        }}
    >

        {/* ==================================================
            DNA RADAR
        ================================================== */}

        <div
            style={{
                background: "#FFF",
                borderRadius: 24,
                padding: 24
            }}
        >

            <h2>New User DNA Radar</h2>

            {dimensions.map((dimension: PassportDimension) => {

                const colors: Record<string, string> = {

                    creativity: "#F97316",

                    communication: "#1DA1F2",

                    leadership: "#6C63FF",

                    confidence: "#FF2D55",

                    collaboration: "#00C781",

                    criticalThinking: "#A855F7"

                };

                const icons: Record<string, string> = {

                    creativity: "🎨",

                    communication: "📢",

                    leadership: "👑",

                    confidence: "🎯",

                    collaboration: "🤝",

                    criticalThinking: "🧠"

                };

                return (

                    <div
                        key={dimension.key}
                        style={{
                            marginBottom: 18
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between"
                            }}
                        >

                            <span>

                                {icons[dimension.key]}{" "}

                                {dimension.label}

                            </span>

                            <strong>

                                {dimension.value}

                            </strong>

                        </div>

                        <div
                            style={{
                                background: "#E5E7EB",
                                height: 10,
                                borderRadius: 20,
                                marginTop: 6
                            }}
                        >

                            <div
                                style={{
                                    width: `${dimension.value}%`,
                                    height: "100%",
                                    borderRadius: 20,
                                    background:
                                        colors[dimension.key]
                                }}
                            />

                        </div>

                    </div>

                );

            })}

        </div>

        {/* ==================================================
            BENCHMARK
        ================================================== */}

        <div
            style={{
                background: "#FFF",
                borderRadius: 24,
                padding: 24
            }}
        >

            <h3>Benchmark Analysis</h3>

            {dimensions.map((dimension: PassportDimension) => {

                const delta = Math.round(

                    dimension.value -

                    dimension.average

                );

                return (

                    <div
                        key={dimension.key}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 10
                        }}
                    >

                        <span>

                            {dimension.label}

                        </span>

                        <strong
                            style={{
                                color:

                                    delta >= 0

                                        ? "#00C781"

                                        : "#EF4444"
                            }}
                        >

                            {delta >= 0

                                ? `+${delta}`

                                : delta}

                        </strong>

                    </div>

                );

            })}

        </div>

        {/* ==================================================
            SCHOOL POSITION
        ================================================== */}

        <div
            style={{
                background: "#FFF",
                borderRadius: 24,
                padding: 24
            }}
        >

            <h3>

                School Positioning

            </h3>

            {dimensions.map((dimension: PassportDimension) => (

                <div
                    key={dimension.key}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 10
                    }}
                >

                    <span>

                        {dimension.label}

                    </span>

                    <strong>

                        {dimension.percentile}%

                    </strong>

                </div>

            ))}

        </div>

        {/* ==================================================
            RARITY
        ================================================== */}

        <div
            style={{
                background: "#FFF",
                borderRadius: 24,
                padding: 24
            }}
        >

            <h3>

                Rarity Index

            </h3>

            {rarityRows.map((row: RarityRow) => (

                <div
                    key={row.label}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 10
                    }}
                >

                    <span>

                        {row.label}

                    </span>

                    <strong>

                        {row.value}

                    </strong>

                </div>

            ))}

        </div>

        {/* ==================================================
            PERCENTILES
        ================================================== */}

        <div
            style={{
                background: "#FFF",
                borderRadius: 24,
                padding: 24
            }}
        >

            <h3>

                Percentile Ranking

            </h3>

            {percentileRows.map((row: PercentileRow) => (

                <div
                    key={row.label}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8
                    }}
                >

                    <span>

                        {row.label}

                    </span>

                    <strong>

                        {row.percentile}th Percentile

                    </strong>

                </div>

            ))}

        </div>

    </div>

              {/* ==========================================================
            RIGHT COLUMN
        ========================================================== */}

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 24
            }}
        >

            {/* ======================================================
                TOP STRENGTHS
            ====================================================== */}

            <div
                style={{
                    background: "#FFF",
                    borderRadius: 24,
                    padding: 24
                }}
            >

                <h3>Top Strengths</h3>

                {topStrengths.map((dimension: PassportDimension) => (

                    <div
                        key={dimension.key}
                        style={{
                            marginBottom: 14
                        }}
                    >

                        <strong>

                            {dimension.label}

                        </strong>

                        <div>

                            {dimension.value}/100

                        </div>

                    </div>

                ))}

            </div>

            {/* ======================================================
                GROWTH GAPS
            ====================================================== */}

            <div
                style={{
                    background: "#FFF",
                    borderRadius: 24,
                    padding: 24
                }}
            >

                <h3>Growth Gaps</h3>

                {growthGaps.map((dimension: PassportDimension) => (

                    <div
                        key={dimension.key}
                        style={{
                            marginBottom: 14
                        }}
                    >

                        <strong>

                            {dimension.label}

                        </strong>

                        <div>

                            {dimension.value}/100

                        </div>

                    </div>

                ))}

            </div>

            {/* ======================================================
                PARTICIPATION
            ====================================================== */}

            <div
                style={{
                    background: "#FFF",
                    borderRadius: 24,
                    padding: 24
                }}
            >

                <h3>

                    Participation Readiness

                </h3>

                <div
                    style={{
                        fontSize: 48,
                        fontWeight: 700
                    }}
                >

                    {participationReadiness}/100

                </div>

            </div>

            {/* ======================================================
                RECOMMENDED COMPETITIONS
            ====================================================== */}

            <div
                style={{
                    background: "#FFF",
                    borderRadius: 24,
                    padding: 24
                }}
            >

                <h3>

                    Recommended Competitions

                </h3>

                {recommendedCompetitions.map((competition) => (

                    <div
                        key={competition.name}
                        style={{
                            marginBottom: 14
                        }}
                    >

                        <strong>

                            {competition.name}

                        </strong>

                        <div>

                            Match Score: {competition.score}

                        </div>

                    </div>

                ))}

            </div>

            {/* ======================================================
                YEAR END PROJECTION
            ====================================================== */}

            <div
                style={{
                    background: "#071A38",
                    color: "#FFF",
                    borderRadius: 24,
                    padding: 24
                }}
            >

                <h3>

                    Year-End Projection

                </h3>

                {projections.map((projection: PassportProjection) => (

                    <div
                        key={projection.label}
                        style={{
                            marginBottom: 18
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between"
                            }}
                        >

                            <span>

                                {projection.label}

                            </span>

                            <strong>

                                {projection.current}

                                {" → "}

                                {projection.projected}

                            </strong>

                        </div>

                        <div
                            style={{
                                height: 10,
                                background: "#243B60",
                                borderRadius: 20,
                                marginTop: 6
                            }}
                        >

                            <div
                                style={{
                                    width: `${projection.projected}%`,
                                    height: "100%",
                                    background: "#00E5A0",
                                    borderRadius: 20
                                }}
                            />

                        </div>

                    </div>

                ))}

            </div>

            {/* ======================================================
                TALENT INTELLIGENCE
            ====================================================== */}

            <div
                style={{
                    background:
                        "linear-gradient(135deg,#071226,#0B2A4A)",
                    color: "#FFF",
                    borderRadius: 24,
                    padding: 24
                }}
            >

                <h3>

                    Talent Intelligence

                </h3>

                <p>

                    Future Readiness: {futureReadiness}

                </p>

                <p>

                    DNA Confidence: {dnaConfidence}

                </p>

                <p>

                    Strongest Skill: {strongestSkill}

                </p>

                <p>

                    Development Area: {weakestSkill}

                </p>

            </div>

        </div>

    </div>

</div>

);
}