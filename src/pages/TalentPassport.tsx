import React, {
    useEffect,
    useState
} from "react";

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

                console.log("====================================");
                console.log("MODEL RECEIVED BY PAGE");
                console.log(model);
                console.log("====================================");

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

    const growthIntelligence =
        passportModel?.growthIntelligence ?? null;

    const learningIntelligence =
        passportModel?.learningIntelligence ?? null;

    const personalGrowthPlan =
        passportModel?.personalGrowthPlan ?? null;

    const baselineOverall =
        growthIntelligence?.baselineOverall ?? null;

    const currentOverall =
        growthIntelligence?.currentOverall ?? dnaAverage;

    const overallGrowth =
        growthIntelligence?.overallChange ?? null;

    const growthDirection =
        growthIntelligence?.overallDirection ?? "No History";

    const growthProfileConfidence =
        growthIntelligence?.profileConfidence ??
        passportModel?.evidenceCoverage ??
        0;

    const growthProfileConfidenceLabel =
        growthIntelligence?.profileConfidenceLabel ??
        "Early Profile";

    const formatSigned = (value: number | null) => {
        if (value === null) return "—";
        const rounded = Math.round(value * 100) / 100;
        return rounded > 0 ? `+${rounded}` : `${rounded}`;
    };

    const growthDimensionRows =
        dimensions.map((dimension: PassportDimension) => {
            const dimensionName =
                dimension.label === "Critical Thinking"
                    ? "CriticalThinking"
                    : dimension.label;

            const growthDimension =
                growthIntelligence?.dimensions?.[
                    dimensionName as keyof NonNullable<
                        PassportViewModel["growthIntelligence"]
                    >["dimensions"]
                ];

            return {
                ...dimension,
                baseline: growthDimension?.baseline ?? null,
                current: growthDimension?.current ?? dimension.value,
                change: growthDimension?.change ?? null,
                direction: growthDimension?.direction ?? "No History"
            };
        });

    const dimensionColors: Record<string, string> = {
        creativity: "#F97316",
        communication: "#2563EB",
        leadership: "#7C3AED",
        confidence: "#E11D48",
        collaboration: "#16A34A",
        criticalThinking: "#A855F7"
    };

    const dimensionIcons: Record<string, string> = {
        creativity: "🎨",
        communication: "📢",
        leadership: "👑",
        confidence: "🎯",
        collaboration: "🤝",
        criticalThinking: "🧠"
    };

    /* ==========================================
       Loading
    ========================================== */

    if (loading) {

        return (

            <div className="min-h-[70vh] bg-[#F7F9FC] px-4 py-6 sm:px-6 lg:px-8">

                <div className="mx-auto flex min-h-[60vh] max-w-[1600px] items-center justify-center">

                    <div className="rounded-[24px] border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-xl">
                            ◈
                        </div>

                        <p className="mt-4 text-sm font-black text-[#07142D]">
                            Loading Talent Passport...
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-400">
                            Preparing your talent intelligence.
                        </p>

                    </div>

                </div>

            </div>

        );

    }

    /* ==========================================
       Empty Passport
    ========================================== */

    if (!passportModel || !passport) {

        return (

            <div className="min-h-[70vh] bg-[#F7F9FC] px-4 py-6 sm:px-6 lg:px-8">

                <div className="mx-auto flex min-h-[60vh] max-w-[1600px] items-center justify-center">

                    <div className="w-full max-w-[520px] rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-2xl">
                            ◈
                        </div>

                        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                            Talent Passport
                        </p>

                        <h2 className="mt-2 text-2xl font-black tracking-tight text-[#07142D]">
                            Talent Passport Not Found
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-slate-500">
                            This student has not completed the DNA Assessment yet.
                        </p>

                        <button

                            type="button"

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

                            className="mt-6 rounded-xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-orange-600"
                        >

                            Complete DNA Assessment

                        </button>

                    </div>

                </div>

            </div>

        );

    }

    /* ==========================================
       PAGE
    ========================================== */

    return (

        <div className="min-h-screen bg-[#F7F9FC] px-2.5 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5">

            <div className="mx-auto max-w-[1600px] space-y-4 sm:space-y-5 lg:space-y-6">

                {/* =========================================================
                    HERO / TALENT PASSPORT OVERVIEW
                ========================================================= */}

                <section className="relative overflow-hidden rounded-[18px] border border-slate-200 bg-gradient-to-br from-white via-white to-[#F7F9FF] shadow-sm sm:rounded-[20px] lg:rounded-[22px]">

                    <div className="pointer-events-none absolute -right-20 -top-28 h-[300px] w-[300px] rounded-full bg-orange-50/80" />

                    <div className="pointer-events-none absolute right-[17%] -top-24 hidden h-[170px] w-[170px] rounded-full bg-orange-50/40 sm:block" />

                    <div className="pointer-events-none absolute -bottom-36 right-[13%] h-[250px] w-[250px] rounded-full bg-indigo-50/70" />

                    <div className="relative z-10 px-3.5 py-3.5 sm:px-5 sm:py-4 lg:px-6 lg:py-5">

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                            <div className="min-w-0 max-w-3xl">

                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 sm:text-xs sm:tracking-[0.24em]">
                                    Live Talent Passport
                                </p>

                                <h1 className="mt-3 text-[24px] font-black leading-[1.08] tracking-tight text-[#07142D] sm:text-[28px] lg:text-[34px]">
                                    Talent Growth Intelligence
                                </h1>

                                <p className="mt-3 text-sm font-bold text-slate-500">
                                    {studentName}
                                </p>

                                <p className="mt-2 max-w-2xl text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs sm:leading-5">
                                    This is your child's live growth record. The questionnaire shows where they started on Day 0; new meaningful evidence shows where they are today, how they are growing, and how they compare with similar students.
                                </p>

                            </div>

                            <div className="w-full rounded-2xl bg-orange-500 p-4 text-white shadow-sm sm:w-auto sm:min-w-[220px] lg:min-w-[235px]">

                                <div className="flex items-center justify-between gap-5 sm:block sm:text-center">

                                    <div>

                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-100">
                                            Your Talent DNA Today
                                        </p>

                                        <div className="mt-2 flex items-end gap-1 sm:justify-center">

                                            <span className="text-3xl font-black leading-none sm:text-4xl">
                                                {currentOverall}
                                            </span>

                                            <span className="pb-1 text-xs font-bold text-orange-100">
                                                /100
                                            </span>

                                        </div>

                                    </div>

                                    <div className="rounded-xl bg-white/15 px-3 py-2 text-right sm:mt-3 sm:text-center">

                                        <p className="text-[9px] font-black uppercase tracking-wider text-orange-100">
                                            Day 0 Baseline
                                        </p>

                                        <p className="mt-1 text-lg font-black">
                                            {baselineOverall !== null
                                                ? `${baselineOverall}/100`
                                                : "Recorded"}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* SUMMARY METRICS */}

                        <div className="mt-3.5 grid grid-cols-2 gap-3 lg:grid-cols-4">

                            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 sm:p-4">

                                <p className="text-[9px] font-black uppercase tracking-wider text-blue-700 sm:text-[10px]">
                                    Profile Confidence
                                </p>

                                <p className="mt-2 text-2xl font-black text-[#07142D] sm:text-3xl">
                                    {growthProfileConfidence}%
                                </p>

                                <p className="mt-1 text-[10px] font-semibold text-blue-600">
                                    {growthProfileConfidenceLabel}
                                </p>

                            </div>

                            <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-3.5 sm:p-4">

                                <p className="text-[9px] font-black uppercase tracking-wider text-purple-700 sm:text-[10px]">
                                    Growth Momentum
                                </p>

                                <p className="mt-2 text-2xl font-black text-[#07142D] sm:text-3xl">
                                    {formatSigned(overallGrowth)}
                                </p>

                                <p className="mt-1 text-[10px] font-semibold text-purple-600">
                                    {growthDirection}
                                </p>

                            </div>

                            <div className="rounded-2xl border border-green-100 bg-green-50/70 p-3.5 sm:p-4">

                                <p className="text-[9px] font-black uppercase tracking-wider text-green-700 sm:text-[10px]">
                                    Strongest Skill
                                </p>

                                <p className="mt-2 break-words text-base font-black leading-5 text-[#07142D] sm:text-lg">
                                    {strongestSkill || "—"}
                                </p>

                                <p className="mt-1 text-[10px] font-semibold text-green-600">
                                    The capability currently supported by your child's strongest score and evidence.
                                </p>

                            </div>

                            <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-3.5 sm:p-4">

                                <p className="text-[9px] font-black uppercase tracking-wider text-orange-700 sm:text-[10px]">
                                    DNA Confidence
                                </p>

                                <p className="mt-2 text-base font-black text-[#07142D] sm:text-lg">
                                    {dnaConfidence}
                                </p>

                                <p className="mt-1 text-[10px] font-semibold text-orange-600">
                                    How reliable the live profile is based on the evidence available so far.
                                </p>

                            </div>

                        </div>

                    </div>

                </section>

                {/* =========================================================
                    DNA PROFILE
                ========================================================= */}

                <section className="rounded-[18px] border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4 sm:rounded-[20px] sm:p-5 lg:rounded-[22px] lg:p-6">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 sm:text-xs">
                                Talent DNA Intelligence
                            </p>

                            <h2 className="mt-2 text-lg font-black text-[#07142D] sm:text-xl">
                                Your Talent DNA Today
                            </h2>

                            <p className="mt-1 max-w-2xl text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs sm:leading-5">
                                These six scores show your child's current strengths across creativity, communication, leadership, confidence, collaboration and critical thinking. They change only when new meaningful evidence is added.
                            </p>

                        </div>

                        <div className="w-fit rounded-full bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600">
                            6 Talent Dimensions
                        </div>

                    </div>

                    <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                        {dimensions.map((dimension: PassportDimension) => {

                            const color =
                                dimensionColors[dimension.key] || "#2563EB";

                            const icon =
                                dimensionIcons[dimension.key] || "✦";

                            return (

                                <article
                                    key={dimension.key}
                                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 sm:p-4"
                                >

                                    <div className="flex items-start justify-between gap-3">

                                        <div className="flex min-w-0 items-center gap-3">

                                            <div
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm"
                                            >
                                                {icon}
                                            </div>

                                            <div className="min-w-0">

                                                <p className="truncate text-sm font-black text-[#07142D]">
                                                    {dimension.label}
                                                </p>

                                                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    DNA Dimension
                                                </p>

                                            </div>

                                        </div>

                                        <span className="text-xl font-black text-[#07142D]">
                                            {dimension.value}
                                        </span>

                                    </div>

                                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">

                                        <div
                                            style={{
                                                width: `${dimension.value}%`,
                                                background: color
                                            }}
                                            className="h-full rounded-full"
                                        />

                                    </div>

                                    <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-slate-400">

                                        <span>0</span>

                                        <span>100</span>

                                    </div>

                                </article>

                            );

                        })}

                    </div>

                </section>

                {/* =========================================================
                    STRENGTHS + GROWTH GAPS
                ========================================================= */}

                <div className="grid gap-2.5 lg:grid-cols-2 lg:gap-3">

                    <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5 lg:rounded-[28px] lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">
                            Strength Intelligence
                        </p>

                        <h2 className="mt-2 text-lg font-black text-[#07142D] sm:text-xl">
                            Where You Are Strongest
                        </h2>

                        <p className="mt-1 text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs">
                            The capabilities where your child currently shows the strongest evidence. Use these strengths to choose activities where they can build confidence, depth and real-world experience.
                        </p>

                        <div className="mt-3 space-y-2.5">

                            {topStrengths.map((dimension: PassportDimension, index: number) => (

                                <div
                                    key={dimension.key}
                                    className="flex items-center justify-between gap-4 rounded-2xl border border-green-100 bg-green-50/60 p-3.5"
                                >

                                    <div className="flex min-w-0 items-center gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-green-700 shadow-sm">
                                            {index + 1}
                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-black text-[#07142D]">
                                                {dimension.label}
                                            </p>

                                            <p className="mt-0.5 text-[10px] font-bold text-green-700">
                                                Leading strength
                                            </p>

                                        </div>

                                    </div>

                                    <div className="text-right">

                                        <p className="text-xl font-black text-green-700">
                                            {dimension.value}
                                        </p>

                                        <p className="text-[9px] font-bold text-slate-400">
                                            /100
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </section>

                    <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5 lg:rounded-[28px] lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                            Growth Intelligence
                        </p>

                        <h2 className="mt-2 text-lg font-black text-[#07142D] sm:text-xl">
                            Where You Can Grow Next
                        </h2>

                        <p className="mt-1 text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs">
                            These are not weaknesses. They are capabilities with more room to grow, helping you choose the right practice, projects or opportunities for your child.
                        </p>

                        <div className="mt-3 space-y-2.5">

                            {growthGaps.map((dimension: PassportDimension, index: number) => (

                                <div
                                    key={dimension.key}
                                    className="flex items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-orange-50/60 p-3.5"
                                >

                                    <div className="flex min-w-0 items-center gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-orange-600 shadow-sm">
                                            {index + 1}
                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate text-sm font-black text-[#07142D]">
                                                {dimension.label}
                                            </p>

                                            <p className="mt-0.5 text-[10px] font-bold text-orange-600">
                                                Development opportunity
                                            </p>

                                        </div>

                                    </div>

                                    <div className="text-right">

                                        <p className="text-xl font-black text-orange-600">
                                            {dimension.value}
                                        </p>

                                        <p className="text-[9px] font-bold text-slate-400">
                                            /100
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </section>

                </div>

                {/* =========================================================
                    GROWTH INTELLIGENCE — DAY 0 → CURRENT
                ========================================================= */}

                <section className="rounded-[18px] border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4 sm:rounded-[20px] sm:p-5 lg:rounded-[22px] lg:p-6">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">
                                Growth Intelligence
                            </p>

                            <h2 className="mt-2 text-lg font-black text-[#07142D] sm:text-xl">
                                How You Have Grown Since Day 0
                            </h2>

                            <p className="mt-1 max-w-2xl text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs sm:leading-5">
                                This shows how your child has changed since joining. Day 0 is the questionnaire baseline; Current is the latest evidence-backed profile; Growth is the difference between the two.
                            </p>
                        </div>

                        <div className="w-fit rounded-full bg-purple-50 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-purple-700">
                            {growthDirection}
                        </div>

                    </div>

                    <div className="mt-3.5 grid gap-4 sm:grid-cols-3">

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                                Day 0 Talent DNA
                            </p>
                            <p className="mt-2 text-2xl font-black text-[#07142D]">
                                {baselineOverall ?? "—"}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                            <p className="text-[9px] font-black uppercase tracking-wider text-blue-700">
                                Your Talent DNA Today
                            </p>
                            <p className="mt-2 text-2xl font-black text-[#07142D]">
                                {currentOverall}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4">
                            <p className="text-[9px] font-black uppercase tracking-wider text-purple-700">
                                Overall Growth
                            </p>
                            <p className="mt-2 text-2xl font-black text-[#07142D]">
                                {formatSigned(overallGrowth)}
                            </p>
                        </div>

                    </div>

                    <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                        {growthDimensionRows.map((dimension) => (

                            <div
                                key={dimension.key}
                                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5"
                            >

                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-sm font-black text-[#07142D]">
                                        {dimension.label}
                                    </span>

                                    <span className="text-xs font-black text-purple-700">
                                        {formatSigned(dimension.change)}
                                    </span>
                                </div>

                                <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-500">
                                    <span>
                                        Day 0: {dimension.baseline ?? "—"}
                                    </span>

                                    <span>
                                        Current: {dimension.current}
                                    </span>
                                </div>

                                <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    {dimension.direction}
                                </p>

                            </div>

                        ))}

                    </div>

                    {!growthIntelligence && (
                        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                            <p className="text-xs font-bold text-slate-500">
                                Growth history is still building. Your Talent DNA Today remains available while baseline-to-current history becomes available.
                            </p>
                        </div>
                    )}

                </section>

                {/* =========================================================
                    LEARNING INTELLIGENCE
                ========================================================= */}

                <section className="rounded-[18px] border border-slate-200 bg-white p-3.5 shadow-sm sm:rounded-[20px] sm:p-4 lg:rounded-[22px] lg:p-5">

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-600">
                                Learning Intelligence
                            </p>

                            <h2 className="mt-1.5 text-lg font-black text-[#07142D] sm:text-xl">
                                How Classroom Learning Is Going
                            </h2>

                            <p className="mt-1 max-w-3xl text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs sm:leading-5">
                                Shows how well your child has understood recent classroom lessons from the feedback they submitted. It helps parents see understanding patterns, subjects needing attention and concepts that may need revision.
                            </p>
                        </div>

                        <div className="w-fit rounded-full bg-cyan-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-cyan-700">
                            Last {learningIntelligence?.periodDays ?? 30} Days
                        </div>
                    </div>

                    {!learningIntelligence || learningIntelligence.recordedLectures === 0 ? (
                        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3">
                            <p className="text-[11px] font-bold text-slate-500">
                                Learning intelligence will appear after classroom feedback is submitted.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-2.5">
                                    <p className="text-[8px] font-black uppercase tracking-wider text-cyan-700">Understanding</p>
                                    <p className="mt-1 text-xl font-black text-[#07142D]">{learningIntelligence.understandingScore}%</p>
                                    <p className="mt-0.5 text-[9px] font-semibold text-slate-500">Overall recent learning</p>
                                </div>

                                <div className="rounded-xl border border-green-100 bg-green-50/60 p-2.5">
                                    <p className="text-[8px] font-black uppercase tracking-wider text-green-700">Fully Understood</p>
                                    <p className="mt-1 text-xl font-black text-[#07142D]">{learningIntelligence.fullyUnderstoodPercent}%</p>
                                    <p className="mt-0.5 text-[9px] font-semibold text-slate-500">Lessons understood clearly</p>
                                </div>

                                <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-2.5">
                                    <p className="text-[8px] font-black uppercase tracking-wider text-amber-700">Partly Understood</p>
                                    <p className="mt-1 text-xl font-black text-[#07142D]">{learningIntelligence.partiallyUnderstoodPercent}%</p>
                                    <p className="mt-0.5 text-[9px] font-semibold text-slate-500">Lessons needing some revision</p>
                                </div>

                                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-2.5">
                                    <p className="text-[8px] font-black uppercase tracking-wider text-rose-700">Needs Attention</p>
                                    <p className="mt-1 text-xl font-black text-[#07142D]">{learningIntelligence.didntUnderstandPercent}%</p>
                                    <p className="mt-0.5 text-[9px] font-semibold text-slate-500">Lessons not yet understood</p>
                                </div>
                            </div>

                            <div className="mt-2.5 grid gap-2.5 lg:grid-cols-2">
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black text-[#07142D]">Subject Understanding</p>
                                            <p className="mt-0.5 text-[9px] font-medium text-slate-500">
                                                Recent understanding score by subject.
                                            </p>
                                        </div>
                                        <span className="text-[9px] font-black text-cyan-700">
                                            {learningIntelligence.recordedLectures} responses
                                        </span>
                                    </div>

                                    <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                                        {learningIntelligence.subjectUnderstanding.slice(0, 6).map((subject) => (
                                            <div key={subject.subject} className="flex items-center justify-between rounded-lg bg-white px-2.5 py-2">
                                                <span className="truncate pr-2 text-[10px] font-bold text-slate-600">{subject.subject}</span>
                                                <span className="shrink-0 text-[10px] font-black text-cyan-700">{subject.understandingScore}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black text-[#07142D]">Learning Consistency</p>
                                            <p className="mt-0.5 text-[9px] font-medium text-slate-500">
                                                How often your child understood at least part of the lesson.
                                            </p>
                                        </div>
                                        <span className="text-lg font-black text-purple-700">{learningIntelligence.consistencyScore}%</span>
                                    </div>

                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className="h-full rounded-full bg-purple-500"
                                            style={{ width: `${learningIntelligence.consistencyScore}%` }}
                                        />
                                    </div>

                                    <p className="mt-3 text-xs font-black text-[#07142D]">Concepts Needing Attention</p>
                                    <p className="mt-0.5 text-[9px] font-medium text-slate-500">
                                        Concepts repeatedly selected as difficult in student feedback.
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {learningIntelligence.persistentChallenges.length === 0 ? (
                                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[9px] font-bold text-green-700">
                                                No repeated challenge identified
                                            </span>
                                        ) : (
                                            learningIntelligence.persistentChallenges.map((challenge) => (
                                                <span
                                                    key={challenge.concept}
                                                    className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-[9px] font-bold text-orange-700"
                                                >
                                                    {challenge.concept} · {challenge.signals}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </section>

                {/* =========================================================
                    BENCHMARK + SCHOOL POSITIONING
                ========================================================= */}

                <div className="grid gap-2.5 lg:grid-cols-2 lg:gap-3">

                    <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5 lg:rounded-[28px] lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                            Comparative Intelligence
                        </p>

                        <h2 className="mt-2 text-lg font-black text-[#07142D] sm:text-xl">
                            How Your Scores Compare
                        </h2>

                        <p className="mt-1 text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs">
                            Shows whether your child's actual score is above or below the average score of participating students in the same school and class. A + number means above the benchmark; a − number means below it.
                        </p>

                        <div className="mt-3.5 divide-y divide-slate-100">

                            {dimensions.map((dimension: PassportDimension) => {

                                const delta =
                                    Math.round(
                                        dimension.value -
                                        dimension.average
                                    );

                                return (

                                    <div
                                        key={dimension.key}
                                        className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                                    >

                                        <div className="flex min-w-0 items-center gap-3">

                                            <span className="text-base">
                                                {dimensionIcons[dimension.key] || "✦"}
                                            </span>

                                            <span className="truncate text-sm font-bold text-slate-600">
                                                {dimension.label}
                                            </span>

                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1.5 text-xs font-black ${
                                                delta >= 0
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-red-50 text-red-700"
                                            }`}
                                        >
                                            {delta >= 0
                                                ? `+${delta}`
                                                : delta}
                                        </span>

                                    </div>

                                );

                            })}

                        </div>

                    </section>

                    <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5 lg:rounded-[28px] lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">
                            School Benchmark
                        </p>

                        <h2 className="mt-2 text-lg font-black text-[#07142D] sm:text-xl">
                            Where You Stand In School
                        </h2>

                        <p className="mt-1 text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs">
                            Shows where your child stands among participating students in the same school and class. For example, 80th percentile means the score is higher than about 80% of that comparison group.
                        </p>

                        <div className="mt-3 space-y-2.5">

                            {dimensions.map((dimension: PassportDimension) => (

                                <div
                                    key={dimension.key}
                                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5"
                                >

                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-sm font-black text-[#07142D]">
                                            {dimension.label}
                                        </span>

                                        <span className="text-sm font-black text-purple-700">
                                            {dimension.schoolPercentile}%
                                        </span>

                                    </div>

                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                                        <div
                                            className="h-full rounded-full bg-purple-500"
                                            style={{
                                                width: `${dimension.schoolPercentile}%`
                                            }}
                                        />

                                    </div>

                                </div>

                            ))}

                        </div>

                    </section>

                </div>

                {/* =========================================================
                    RARITY + PERCENTILES
                ========================================================= */}

                <div className="grid gap-2.5 lg:grid-cols-2 lg:gap-3">

                    <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5 lg:rounded-[28px] lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                            Profile Distinctiveness
                        </p>

                        <h2 className="mt-2 text-lg font-black text-[#07142D] sm:text-xl">
                            How Distinctive Your Talent Profile Is
                        </h2>

                        <p className="mt-1 text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs">
                            Shows how unusual your child's overall combination of the six Talent DNA capabilities is compared with students in the same class across the platform. A higher score means the overall profile is less common; it does not mean better or worse.
                        </p>

                        <div className="mt-3 grid gap-4 sm:grid-cols-2">

                            {rarityRows.map((row: RarityRow) => (

                                <div
                                    key={row.label}
                                    className="rounded-2xl border border-orange-100 bg-orange-50/60 p-3.5"
                                >

                                    <p className="text-xs font-bold text-slate-500">
                                        {row.label}
                                    </p>

                                    <p className="mt-2 text-xl font-black text-orange-600">
                                        {row.value}
                                    </p>

                                </div>

                            ))}

                        </div>

                    </section>

                    <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[24px] sm:p-5 lg:rounded-[28px] lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                            Relative Standing
                        </p>

                        <h2 className="mt-2 text-lg font-black text-[#07142D] sm:text-xl">
                            Where You Stand Among Class Peers
                        </h2>

                        <p className="mt-1 text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs">
                            Shows where your child's score stands against participating students in the same class across all schools on Talent Passport. For example, 82nd percentile means the score is higher than about 82% of comparable peers.
                        </p>

                        <div className="mt-3 space-y-2.5">

                            {percentileRows.map((row: PercentileRow) => (

                                <div
                                    key={row.label}
                                    className="flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-3.5"
                                >

                                    <span className="min-w-0 text-sm font-black text-[#07142D]">
                                        {row.label}
                                    </span>

                                    <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-black text-blue-700 shadow-sm">
                                        {(() => {
                                            const value = Math.max(0, Math.min(100, Math.round(row.percentile)));
                                            const mod100 = value % 100;
                                            if (mod100 >= 11 && mod100 <= 13) return `${value}th Percentile`;
                                            if (value % 10 === 1) return `${value}st Percentile`;
                                            if (value % 10 === 2) return `${value}nd Percentile`;
                                            if (value % 10 === 3) return `${value}rd Percentile`;
                                            return `${value}th Percentile`;
                                        })()}
                                    </span>

                                </div>

                            ))}

                        </div>

                    </section>

                </div>

                {/* =========================================================
                    PARTICIPATION + RECOMMENDATIONS
                ========================================================= */}

                <section className="rounded-[18px] border border-slate-200 bg-white p-3.5 shadow-sm sm:rounded-[20px] sm:p-4 lg:rounded-[22px] lg:p-5">

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-600">
                                Personal Growth Action Plan
                            </p>

                            <h2 className="mt-1.5 text-lg font-black text-[#07142D] sm:text-xl">
                                Your Next Best Actions
                            </h2>

                            <p className="mt-1 max-w-3xl text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs sm:leading-5">
                                Your Passport now turns scores, growth, evidence and classroom learning into practical next steps. The plan updates as new evidence is added.
                            </p>
                        </div>

                        <div className="w-fit rounded-full bg-orange-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-orange-700">
                            {personalGrowthPlan
                                ? `${personalGrowthPlan.primaryFocus} First`
                                : "Building Plan"}
                        </div>
                    </div>

                    {personalGrowthPlan && (
                        <>
                            <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50/60 p-3">
                                <p className="text-xs font-black text-[#07142D]">
                                    {personalGrowthPlan.headline}
                                </p>
                                <p className="mt-1 text-[10px] font-medium leading-4 text-slate-600">
                                    {personalGrowthPlan.summary}
                                </p>
                            </div>

                            <div className="mt-2.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {personalGrowthPlan.immediatePriorities.map((item, index) => (
                                    <article
                                        key={item.id}
                                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white text-[10px] font-black text-orange-600 shadow-sm">
                                                {index + 1}
                                            </span>
                                            <span className="rounded-full bg-white px-2 py-1 text-[8px] font-black uppercase tracking-wider text-slate-500">
                                                {item.category}
                                            </span>
                                        </div>

                                        <h3 className="mt-2 text-xs font-black text-[#07142D]">
                                            {item.title}
                                        </h3>

                                        <p className="mt-1 text-[9px] font-medium leading-3.5 text-slate-500">
                                            {item.why}
                                        </p>

                                        <p className="mt-2 text-[10px] font-bold leading-4 text-slate-700">
                                            {item.instruction}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </>
                    )}

                </section>

                <section className="rounded-[18px] border border-slate-200 bg-white p-3.5 shadow-sm sm:rounded-[20px] sm:p-4 lg:rounded-[22px] lg:p-5">

                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-purple-600">
                        90-Day Growth Plan
                    </p>

                    <h2 className="mt-1.5 text-lg font-black text-[#07142D] sm:text-xl">
                        Your 90-Day Growth Journey
                    </h2>

                    <p className="mt-1 max-w-3xl text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs sm:leading-5">
                        Three short stages turn development priorities into habits, real experiences and evidence that can update the Passport.
                    </p>

                    <div className="mt-3 grid gap-2.5 md:grid-cols-3">
                        {personalGrowthPlan?.months.map(month => (
                            <article
                                key={month.month}
                                className="rounded-xl border border-purple-100 bg-purple-50/40 p-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-purple-600">
                                        Month {month.month}
                                    </span>
                                    <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-purple-700 shadow-sm">
                                        {month.theme}
                                    </span>
                                </div>

                                <p className="mt-2 text-[10px] font-bold leading-4 text-slate-700">
                                    {month.objective}
                                </p>

                                <div className="mt-2 space-y-1.5">
                                    {month.actions.map(item => (
                                        <div
                                            key={item.id}
                                            className="rounded-lg bg-white px-2.5 py-2"
                                        >
                                            <p className="text-[10px] font-black text-[#07142D]">
                                                {item.title}
                                            </p>
                                            <p className="mt-0.5 text-[9px] font-medium leading-3.5 text-slate-500">
                                                {item.instruction}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>

                </section>

                <section className="relative overflow-hidden rounded-[18px] bg-[#071A38] p-3.5 text-white shadow-sm sm:rounded-[20px] sm:p-4 lg:rounded-[22px] lg:p-5">

                    <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/10" />
                    <div className="pointer-events-none absolute -bottom-28 right-[28%] h-56 w-56 rounded-full bg-emerald-400/10" />

                    <div className="relative">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-300">
                            Year-End Growth Targets
                        </p>

                        <h2 className="mt-1.5 text-lg font-black sm:text-xl">
                            Your Year-End Growth Targets
                        </h2>

                        <p className="mt-1 max-w-3xl text-[11px] font-medium leading-4.5 text-slate-300 sm:text-xs sm:leading-5">
                            These are planning targets linked to the 90-day actions above, not guaranteed future scores. New evidence should continuously update both the targets and the plan.
                        </p>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {personalGrowthPlan?.yearEndTargets.map(target => (
                                <div
                                    key={target.dimension}
                                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[10px] font-black text-white">
                                            {target.dimension}
                                        </span>
                                        <span className="shrink-0 text-[10px] font-black text-emerald-300">
                                            {target.current} → {target.target}
                                        </span>
                                    </div>

                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-emerald-400"
                                            style={{ width: `${target.target}%` }}
                                        />
                                    </div>

                                    <p className="mt-1.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                                        {target.focus}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </section>

                <section className="rounded-[18px] border border-slate-200 bg-white p-3.5 shadow-sm sm:rounded-[20px] sm:p-4 lg:rounded-[22px] lg:p-5">

                    <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-green-600">
                                Evidence Goals
                            </p>

                            <h2 className="mt-1.5 text-lg font-black text-[#07142D] sm:text-xl">
                                Evidence That Will Strengthen Your Passport
                            </h2>

                            <p className="mt-1 text-[11px] font-medium leading-4.5 text-slate-500 sm:text-xs">
                                The plan becomes more accurate when actions create genuine evidence across the product.
                            </p>

                            <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                                {personalGrowthPlan?.evidenceGoals.map((goal, index) => (
                                    <div
                                        key={goal}
                                        className="flex gap-2 rounded-lg border border-green-100 bg-green-50/50 px-2.5 py-2"
                                    >
                                        <span className="text-[10px] font-black text-green-700">
                                            {index + 1}.
                                        </span>
                                        <p className="text-[9px] font-bold leading-3.5 text-slate-600">
                                            {goal}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                            <p className="text-[9px] font-black uppercase tracking-wider text-blue-700">
                                Participation Readiness
                            </p>

                            <div className="mt-1 flex items-end gap-1">
                                <span className="text-3xl font-black text-[#07142D]">
                                    {participationReadiness}
                                </span>
                                <span className="pb-1 text-[9px] font-black text-slate-400">
                                    /100
                                </span>
                            </div>

                            <p className="mt-1 text-[9px] font-medium leading-3.5 text-slate-500">
                                Indicates current readiness to take part in co-curricular opportunities and competitive experiences.
                            </p>

                            {recommendedCompetitions.length > 0 && (
                                <>
                                    <p className="mt-3 text-[9px] font-black uppercase tracking-wider text-green-700">
                                        Best Current Competition Matches
                                    </p>

                                    <div className="mt-1.5 space-y-1.5">
                                        {recommendedCompetitions.slice(0, 3).map(competition => (
                                            <div
                                                key={competition.name}
                                                className="flex items-center justify-between gap-3 rounded-lg bg-white px-2.5 py-2"
                                            >
                                                <span className="text-[9px] font-black text-[#07142D]">
                                                    {competition.name}
                                                </span>
                                                <span className="shrink-0 text-[9px] font-black text-green-700">
                                                    {competition.score} Match
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                </section>

            </div>

        </div>

    );

}
