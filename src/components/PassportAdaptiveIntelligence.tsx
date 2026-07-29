import React, { useMemo, useState } from "react";
import type { LearningIntelligenceProfile } from "../engines/learningIntelligenceEngine";
import type { PersonalGrowthActionPlan } from "../engines/personalGrowthActionEngine";

interface Props {
    learning: LearningIntelligenceProfile | null;
    plan: PersonalGrowthActionPlan | null;
}

export default function PassportAdaptiveIntelligence({ learning, plan }: Props) {
    const subjects = learning?.subjectUnderstanding ?? [];
    const [selectedSubject, setSelectedSubject] = useState("ALL");
    const [showAllActions, setShowAllActions] = useState(false);

    const activeSubject = useMemo(
        () => subjects.find(item => item.subject === selectedSubject) ?? null,
        [subjects, selectedSubject]
    );

    const challenges = activeSubject
        ? activeSubject.challenges.map(item => ({
            ...item,
            subjects: [activeSubject.subject],
        }))
        : (learning?.persistentChallenges ?? []);

    const actions = plan?.immediatePriorities ?? [];
    const visibleActions = showAllActions ? actions : actions.slice(0, 3);

    if (!learning && !plan) return null;

    return (
        <div className="space-y-2.5 sm:space-y-3">
            {learning && (
                <section className="overflow-hidden rounded-[18px] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/50 p-3.5 shadow-sm sm:rounded-[20px] sm:p-4 lg:rounded-[22px] lg:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-600">Learning Intelligence</p>
                            <h2 className="mt-1 text-lg font-black text-[#07142D] sm:text-xl">Classroom Understanding</h2>
                            <p className="mt-1 max-w-3xl text-[10px] font-medium leading-4 text-slate-500 sm:text-[11px]">
                                See overall learning first, then choose a subject to understand where revision is actually needed.
                            </p>
                        </div>
                        <span className="w-fit rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase text-cyan-700 shadow-sm">
                            {learning.recordedLectures} Responses · {learning.periodDays} Days
                        </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                            ["Understanding", `${learning.understandingScore}%`, "Overall recent learning", "cyan"],
                            ["Fully Understood", `${learning.fullyUnderstoodPercent}%`, "Clear understanding", "green"],
                            ["Partly Understood", `${learning.partiallyUnderstoodPercent}%`, "Needs revision", "amber"],
                            ["Needs Attention", `${learning.didntUnderstandPercent}%`, "Not yet understood", "rose"],
                        ].map(([label, value, note]) => (
                            <div key={label} className="rounded-xl border border-white bg-white/80 p-2.5 shadow-sm">
                                <p className="text-[8px] font-black uppercase tracking-wider text-slate-500">{label}</p>
                                <p className="mt-1 text-xl font-black text-[#07142D]">{value}</p>
                                <p className="text-[8px] font-semibold text-slate-400">{note}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 rounded-xl border border-white bg-white/75 p-3 shadow-sm">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs font-black text-[#07142D]">Explore by Subject</p>
                                <p className="text-[9px] font-medium text-slate-500">Keeps the Passport compact even when every school subject has data.</p>
                            </div>

                            <select
                                value={selectedSubject}
                                onChange={event => setSelectedSubject(event.target.value)}
                                className="w-full rounded-lg border border-cyan-100 bg-white px-3 py-2 text-[10px] font-bold text-slate-700 outline-none md:w-[240px]"
                            >
                                <option value="ALL">All Subjects</option>
                                {subjects.map(subject => (
                                    <option key={subject.subject} value={subject.subject}>
                                        {subject.subject} · {subject.understandingScore}%
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedSubject === "ALL" ? (
                            <div className="mt-2 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                                {subjects.map(subject => (
                                    <button
                                        type="button"
                                        key={subject.subject}
                                        onClick={() => setSelectedSubject(subject.subject)}
                                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-2 text-left"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-[10px] font-black text-[#07142D]">{subject.subject}</p>
                                            <p className="text-[8px] font-semibold text-slate-400">{subject.feedbackCount} responses</p>
                                        </div>
                                        <span className="ml-2 shrink-0 text-[11px] font-black text-cyan-700">{subject.understandingScore}%</span>
                                    </button>
                                ))}
                            </div>
                        ) : activeSubject ? (
                            <div className="mt-3 grid gap-2 lg:grid-cols-[0.8fr_1.2fr]">
                                <div className="rounded-lg bg-cyan-50/70 p-3">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-black text-[#07142D]">{activeSubject.subject}</p>
                                        <p className="text-lg font-black text-cyan-700">{activeSubject.understandingScore}%</p>
                                    </div>
                                    <div className="mt-2 grid grid-cols-3 gap-1">
                                        <div className="rounded-md bg-white p-2 text-center"><b className="text-[10px] text-green-700">{activeSubject.fullyUnderstoodPercent}%</b><p className="text-[7px] text-slate-400">Full</p></div>
                                        <div className="rounded-md bg-white p-2 text-center"><b className="text-[10px] text-amber-700">{activeSubject.partiallyUnderstoodPercent}%</b><p className="text-[7px] text-slate-400">Partial</p></div>
                                        <div className="rounded-md bg-white p-2 text-center"><b className="text-[10px] text-rose-700">{activeSubject.didntUnderstandPercent}%</b><p className="text-[7px] text-slate-400">Not Yet</p></div>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-orange-50/60 p-3">
                                    <p className="text-[10px] font-black text-[#07142D]">Concepts Needing Attention</p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {challenges.length ? challenges.slice(0, 8).map(item => (
                                            <span key={item.concept} className="rounded-full border border-orange-100 bg-white px-2 py-1 text-[8px] font-bold text-orange-700">
                                                {item.concept} · {item.signals}
                                            </span>
                                        )) : <span className="text-[9px] font-semibold text-green-700">No repeated difficulty identified in this subject.</span>}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </section>
            )}

            {plan && (
                <>
                    <section className="overflow-hidden rounded-[18px] border border-orange-100 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/60 p-3.5 shadow-sm sm:rounded-[20px] sm:p-4 lg:rounded-[22px] lg:p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-600">Personal Growth Prescription</p>
                                <h2 className="mt-1 text-lg font-black text-[#07142D] sm:text-xl">What To Do Next</h2>
                                <p className="mt-1 max-w-3xl text-[10px] font-medium leading-4 text-slate-500 sm:text-[11px]">
                                    Built from this student's current capability, learning, evidence, peer position and readiness signals.
                                </p>
                            </div>
                            <div className="flex gap-1.5">
                                <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-black uppercase text-orange-700 shadow-sm">{plan.planConfidence} Confidence</span>
                                <span className="rounded-full bg-white px-2.5 py-1 text-[8px] font-black uppercase text-slate-500 shadow-sm">Plan {plan.fingerprint}</span>
                            </div>
                        </div>

                        <div className="mt-3 rounded-xl border border-orange-100 bg-white/80 p-3">
                            <p className="text-xs font-black text-[#07142D]">{plan.headline}</p>
                            <p className="mt-1 text-[9px] font-medium leading-4 text-slate-500">{plan.summary}</p>
                        </div>

                        <div className="mt-2.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {visibleActions.map((item, index) => (
                                <article key={item.id} className="rounded-xl border border-white bg-white/85 p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50 text-[9px] font-black text-orange-700">{index + 1}</span>
                                        <span className="rounded-full bg-slate-50 px-2 py-1 text-[7px] font-black uppercase text-slate-500">{item.category}</span>
                                    </div>
                                    <h3 className="mt-2 text-[11px] font-black text-[#07142D]">{item.title}</h3>
                                    <p className="mt-1 text-[8px] font-medium leading-3.5 text-slate-500">{item.why}</p>
                                    <p className="mt-2 text-[9px] font-bold leading-4 text-slate-700">{item.instruction}</p>
                                </article>
                            ))}
                        </div>

                        {actions.length > 3 && (
                            <button
                                type="button"
                                onClick={() => setShowAllActions(value => !value)}
                                className="mt-2.5 rounded-lg border border-orange-100 bg-white px-3 py-2 text-[9px] font-black text-orange-700"
                            >
                                {showAllActions ? "Show Priority Actions Only" : `View All ${actions.length} Actions`}
                            </button>
                        )}
                    </section>

                    <section className="overflow-hidden rounded-[18px] border border-purple-100 bg-gradient-to-br from-purple-50/70 via-white to-fuchsia-50/40 p-3.5 shadow-sm sm:rounded-[20px] sm:p-4 lg:rounded-[22px] lg:p-5">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-purple-600">90-Day Growth Plan</p>
                        <h2 className="mt-1 text-lg font-black text-[#07142D] sm:text-xl">Build Around This Student</h2>
                        <div className="mt-3 grid gap-2.5 md:grid-cols-3">
                            {plan.months.map(month => (
                                <article key={month.month} className="rounded-xl border border-white bg-white/80 p-3 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] font-black uppercase text-purple-600">Month {month.month}</span>
                                        <span className="rounded-full bg-purple-50 px-2 py-1 text-[8px] font-black text-purple-700">{month.theme}</span>
                                    </div>
                                    <p className="mt-2 text-[9px] font-bold leading-4 text-slate-600">{month.objective}</p>
                                    <div className="mt-2 space-y-1.5">
                                        {month.actions.map(item => (
                                            <div key={item.id} className="rounded-lg bg-slate-50/70 p-2">
                                                <p className="text-[9px] font-black text-[#07142D]">{item.title}</p>
                                                <p className="mt-0.5 text-[8px] font-medium leading-3.5 text-slate-500">{item.instruction}</p>
                                            </div>
                                        ))}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="relative overflow-hidden rounded-[18px] bg-[#071A38] p-3.5 text-white shadow-sm sm:rounded-[20px] sm:p-4 lg:rounded-[22px] lg:p-5">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">Year-End Planning Range</p>
                        <h2 className="mt-1 text-lg font-black sm:text-xl">Where The Current Plan Is Aiming</h2>
                        <p className="mt-1 max-w-3xl text-[9px] font-medium leading-4 text-slate-300">
                            These are adaptive planning targets, not promised future scores. They should change when the student's evidence and learning pattern changes.
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {plan.yearEndTargets.map(target => (
                                <div key={target.dimension} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black">{target.dimension}</span>
                                        <span className="text-[9px] font-black text-emerald-300">{target.current} → {target.target}</span>
                                    </div>
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${target.target}%` }} />
                                    </div>
                                    <p className="mt-1.5 text-[7px] font-bold uppercase tracking-wider text-slate-400">{target.focus}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
