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

        <div className="min-h-screen bg-[#F7F9FC] px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">

            <div className="mx-auto max-w-[1600px] space-y-3 sm:space-y-4 lg:space-y-4">

                {/* =========================================================
                    HERO / TALENT PASSPORT OVERVIEW
                ========================================================= */}

                <section className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-gradient-to-br from-white via-white to-[#F7F9FF] shadow-sm sm:rounded-[26px] lg:rounded-[28px]">

                    <div className="pointer-events-none absolute -right-20 -top-28 h-[300px] w-[300px] rounded-full bg-orange-50/80" />

                    <div className="pointer-events-none absolute right-[17%] -top-24 hidden h-[170px] w-[170px] rounded-full bg-orange-50/40 sm:block" />

                    <div className="pointer-events-none absolute -bottom-36 right-[13%] h-[250px] w-[250px] rounded-full bg-indigo-50/70" />

                    <div className="relative z-10 px-5 py-5 sm:px-6 sm:py-5 lg:px-7 lg:py-6">

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                            <div className="min-w-0 max-w-3xl">

                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 sm:text-xs sm:tracking-[0.24em]">
                                    Pre-Term Talent Profiling
                                </p>

                                <h1 className="mt-3 text-[28px] font-black leading-[1.08] tracking-tight text-[#07142D] sm:text-3xl lg:text-[38px]">
                                    Co-Curricular Diagnostic Calibration
                                </h1>

                                <p className="mt-3 text-sm font-bold text-slate-500">
                                    {studentName}
                                </p>

                                <p className="mt-2 max-w-2xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                                    A structured view of your current co-curricular strengths,
                                    development gaps, school positioning and future readiness.
                                </p>

                            </div>

                            <div className="w-full rounded-2xl bg-orange-500 p-4 text-white shadow-sm sm:w-auto sm:min-w-[220px] lg:min-w-[235px]">

                                <div className="flex items-center justify-between gap-5 sm:block sm:text-center">

                                    <div>

                                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-100">
                                            Relative DNA Avg
                                        </p>

                                        <div className="mt-2 flex items-end gap-1 sm:justify-center">

                                            <span className="text-3xl font-black leading-none sm:text-4xl">
                                                {dnaAverage}
                                            </span>

                                            <span className="pb-1 text-xs font-bold text-orange-100">
                                                /100
                                            </span>

                                        </div>

                                    </div>

                                    <div className="rounded-xl bg-white/15 px-3 py-2 text-right sm:mt-3 sm:text-center">

                                        <p className="text-[9px] font-black uppercase tracking-wider text-orange-100">
                                            Reliability
                                        </p>

                                        <p className="mt-1 text-lg font-black">
                                            {reliability}%
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* SUMMARY METRICS */}

                        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

                            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 sm:p-4">

                                <p className="text-[9px] font-black uppercase tracking-wider text-blue-700 sm:text-[10px]">
                                    Participation Readiness
                                </p>

                                <p className="mt-2 text-2xl font-black text-[#07142D] sm:text-3xl">
                                    {participationReadiness}
                                </p>

                                <p className="mt-1 text-[10px] font-semibold text-blue-600">
                                    Current readiness score
                                </p>

                            </div>

                            <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-3.5 sm:p-4">

                                <p className="text-[9px] font-black uppercase tracking-wider text-purple-700 sm:text-[10px]">
                                    Future Readiness
                                </p>

                                <p className="mt-2 text-2xl font-black text-[#07142D] sm:text-3xl">
                                    {futureReadiness}
                                </p>

                                <p className="mt-1 text-[10px] font-semibold text-purple-600">
                                    Growth trajectory indicator
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
                                    Leading DNA dimension
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
                                    Current profile confidence
                                </p>

                            </div>

                        </div>

                    </div>

                </section>

                {/* =========================================================
                    DNA PROFILE
                ========================================================= */}

                <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[26px] sm:p-5 lg:rounded-[28px] lg:p-6">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 sm:text-xs">
                                Talent DNA Intelligence
                            </p>

                            <h2 className="mt-2 text-xl font-black text-[#07142D] sm:text-2xl">
                                New User DNA Radar
                            </h2>

                            <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-slate-500 sm:text-sm sm:leading-6">
                                Your six-dimensional co-curricular profile based on the current diagnostic calibration.
                            </p>

                        </div>

                        <div className="w-fit rounded-full bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600">
                            6 Talent Dimensions
                        </div>

                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

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

                <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">

                    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[26px] sm:p-5 lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">
                            Strength Intelligence
                        </p>

                        <h2 className="mt-2 text-xl font-black text-[#07142D] sm:text-2xl">
                            Top Strengths
                        </h2>

                        <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                            Your strongest calibrated talent dimensions.
                        </p>

                        <div className="mt-4 space-y-2.5">

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

                    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[26px] sm:p-5 lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                            Growth Intelligence
                        </p>

                        <h2 className="mt-2 text-xl font-black text-[#07142D] sm:text-2xl">
                            Growth Gaps
                        </h2>

                        <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                            Dimensions with the highest opportunity for development.
                        </p>

                        <div className="mt-4 space-y-2.5">

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
                    BENCHMARK + SCHOOL POSITIONING
                ========================================================= */}

                <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">

                    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[26px] sm:p-5 lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                            Comparative Intelligence
                        </p>

                        <h2 className="mt-2 text-xl font-black text-[#07142D] sm:text-2xl">
                            Benchmark Analysis
                        </h2>

                        <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                            Difference between your score and the current benchmark average.
                        </p>

                        <div className="mt-5 divide-y divide-slate-100">

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

                    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[26px] sm:p-5 lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">
                            School Benchmark
                        </p>

                        <h2 className="mt-2 text-xl font-black text-[#07142D] sm:text-2xl">
                            School Positioning
                        </h2>

                        <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                            Your relative percentile position across each talent dimension.
                        </p>

                        <div className="mt-4 space-y-2.5">

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

                <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">

                    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[26px] sm:p-5 lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                            Profile Distinctiveness
                        </p>

                        <h2 className="mt-2 text-xl font-black text-[#07142D] sm:text-2xl">
                            Talent Distinctiveness
                        </h2>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">

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

                    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[26px] sm:p-5 lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                            Relative Standing
                        </p>

                        <h2 className="mt-2 text-xl font-black text-[#07142D] sm:text-2xl">
                            Class Peer Position
                        </h2>

                        <div className="mt-4 space-y-2.5">

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

                <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr] lg:gap-6">

                    <section className="relative overflow-hidden rounded-[22px] bg-orange-500 p-5 text-white shadow-sm sm:rounded-[26px] sm:p-5 lg:p-6">

                        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />

                        <div className="pointer-events-none absolute -bottom-14 left-8 h-32 w-32 rounded-full bg-white/10" />

                        <div className="relative">

                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-100">
                                Participation Intelligence
                            </p>

                            <h2 className="mt-2 text-xl font-black sm:text-2xl">
                                Participation Readiness
                            </h2>

                            <div className="mt-4 flex items-end gap-2">

                                <span className="text-4xl font-black leading-none sm:text-5xl">
                                    {participationReadiness}
                                </span>

                                <span className="pb-1 text-sm font-bold text-orange-100">
                                    /100
                                </span>

                            </div>

                            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/20">

                                <div
                                    className="h-full rounded-full bg-white"
                                    style={{
                                        width: `${participationReadiness}%`
                                    }}
                                />

                            </div>

                            <p className="mt-4 text-xs font-semibold leading-5 text-orange-100">
                                Indicates your current readiness to participate in
                                co-curricular opportunities and competitive experiences.
                            </p>

                        </div>

                    </section>

                    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[26px] sm:p-5 lg:p-6">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-600">
                            Opportunity Matching
                        </p>

                        <h2 className="mt-2 text-xl font-black text-[#07142D] sm:text-2xl">
                            Recommended Competitions
                        </h2>

                        <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                            Competition recommendations aligned with your current Talent DNA.
                        </p>

                        {recommendedCompetitions.length === 0 ? (

                            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">

                                <p className="text-sm font-black text-[#07142D]">
                                    No recommendations available yet
                                </p>

                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    Matching opportunities will appear here as your profile develops.
                                </p>

                            </div>

                        ) : (

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">

                                {recommendedCompetitions.map((competition) => (

                                    <article
                                        key={competition.name}
                                        className="rounded-2xl border border-green-100 bg-green-50/60 p-3.5"
                                    >

                                        <div className="flex items-start justify-between gap-3">

                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                                                🏆
                                            </div>

                                            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-green-700 shadow-sm">
                                                {competition.score} Match
                                            </span>

                                        </div>

                                        <h3 className="mt-4 text-sm font-black leading-5 text-[#07142D]">
                                            {competition.name}
                                        </h3>

                                    </article>

                                ))}

                            </div>

                        )}

                    </section>

                </div>

                {/* =========================================================
                    YEAR-END PROJECTION
                ========================================================= */}

                <section className="relative overflow-hidden rounded-[22px] bg-[#071A38] p-5 text-white shadow-sm sm:rounded-[26px] sm:p-5 lg:rounded-[28px] lg:p-6">

                    <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/10" />

                    <div className="pointer-events-none absolute -bottom-28 right-[28%] h-56 w-56 rounded-full bg-emerald-400/10" />

                    <div className="relative">

                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-300 sm:text-xs">
                            Growth Forecast
                        </p>

                        <h2 className="mt-2 text-xl font-black sm:text-2xl">
                            Year-End Projection
                        </h2>

                        <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-slate-300 sm:text-sm">
                            Projected development across your talent dimensions based on the current profile.
                        </p>

                        <div className="mt-5 grid gap-3 md:grid-cols-2">

                            {projections.map((projection: PassportProjection) => (

                                <div
                                    key={projection.label}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-3.5 sm:p-4"
                                >

                                    <div className="flex items-center justify-between gap-4">

                                        <span className="text-sm font-black text-white">
                                            {projection.label}
                                        </span>

                                        <span className="shrink-0 text-xs font-black text-emerald-300">
                                            {projection.current} → {projection.projected}
                                        </span>

                                    </div>

                                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">

                                        <div
                                            className="h-full rounded-full bg-emerald-400"
                                            style={{
                                                width: `${projection.projected}%`
                                            }}
                                        />

                                    </div>

                                </div>

                            ))}

                        </div>

                    </div>

                </section>

                {/* =========================================================
                    TALENT INTELLIGENCE
                ========================================================= */}

                <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-[26px] sm:p-5 lg:rounded-[28px] lg:p-6">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                        <div>

                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600">
                                Passport Intelligence
                            </p>

                            <h2 className="mt-2 text-xl font-black text-[#07142D] sm:text-2xl">
                                Talent Intelligence
                            </h2>

                            <p className="mt-1 text-xs font-medium leading-5 text-slate-500 sm:text-sm">
                                A concise interpretation of your current Talent Passport profile.
                            </p>

                        </div>

                        <div className="w-fit rounded-full border border-green-200 bg-green-50 px-4 py-2 text-[10px] font-black uppercase tracking-wider text-green-700">
                            Profile Active
                        </div>

                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

                        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 sm:p-4">

                            <p className="text-[9px] font-black uppercase tracking-wider text-blue-700">
                                Future Readiness
                            </p>

                            <p className="mt-3 text-2xl font-black text-[#07142D] sm:text-3xl">
                                {futureReadiness}
                            </p>

                        </div>

                        <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-3.5 sm:p-4">

                            <p className="text-[9px] font-black uppercase tracking-wider text-purple-700">
                                DNA Confidence
                            </p>

                            <p className="mt-3 break-words text-base font-black text-[#07142D] sm:text-lg">
                                {dnaConfidence}
                            </p>

                        </div>

                        <div className="rounded-2xl border border-green-100 bg-green-50/70 p-3.5 sm:p-4">

                            <p className="text-[9px] font-black uppercase tracking-wider text-green-700">
                                Strongest Skill
                            </p>

                            <p className="mt-3 break-words text-base font-black leading-5 text-[#07142D] sm:text-lg">
                                {strongestSkill || "—"}
                            </p>

                        </div>

                        <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-3.5 sm:p-4">

                            <p className="text-[9px] font-black uppercase tracking-wider text-orange-700">
                                Development Area
                            </p>

                            <p className="mt-3 break-words text-base font-black leading-5 text-[#07142D] sm:text-lg">
                                {weakestSkill || "—"}
                            </p>

                        </div>

                    </div>

                </section>

            </div>

        </div>

    );

}
