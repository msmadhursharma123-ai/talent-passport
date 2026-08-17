import {
    getStudentFeedbackHistory,
} from "../data/studentDailyFeedbackRepository";

import {
    buildLearningIntelligence,
    type LearningFeedbackRecord,
    type LearningIntelligenceProfile,
    type SubjectLearningChallenge,
} from "../engines/learningIntelligenceEngine";

import {
    getStudentLiveDoubtRows,
    mergeFeedbackUnderstandingLevels,
    syncStudentLiveDoubtLedger,
    type LiveDoubtRow,
} from "../domains/liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";

/*
 * Base learning intelligence remains unchanged.
 * The live function below is an additive outer overlay used only by the
 * Student Talent Passport Classroom Understanding section.
 *
 * It does NOT write to student_daily_feedback and does NOT alter the
 * existing learning-intelligence calculation contract.
 */

export async function getStudentLearningIntelligence(
    periodDays = 30
): Promise<LearningIntelligenceProfile> {
    const rows =
        await getStudentFeedbackHistory() as LearningFeedbackRecord[];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    cutoff.setHours(0, 0, 0, 0);

    const recentRows = rows.filter(row => {
        if (!row.submitted_at) return false;

        const submittedAt = new Date(row.submitted_at);

        return (
            !Number.isNaN(submittedAt.getTime()) &&
            submittedAt >= cutoff
        );
    });

    return buildLearningIntelligence(
        recentRows,
        periodDays
    );
}

function normalize(value: unknown): string {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function liveChallengeMap(
    rows: LiveDoubtRow[]
): Map<string, SubjectLearningChallenge[]> {
    const bySubject = new Map<
        string,
        Map<string, { label: string; signals: number }>
    >();

    for (const row of rows) {
        if (!row.is_unresolved) continue;

        const subject =
            String(row.subject_name ?? "").trim() || "Other";

        const concept =
            String(row.doubt_concept ?? row.topic_name ?? "").trim();

        if (!concept) continue;

        const subjectMap =
            bySubject.get(subject) ??
            new Map<string, { label: string; signals: number }>();

        const key =
            String(
                row.normalized_concept ??
                normalize(concept)
            )
                .trim()
                .toLowerCase();

        const existing = subjectMap.get(key);

        subjectMap.set(key, {
            label: existing?.label ?? concept,
            signals: (existing?.signals ?? 0) + 1,
        });

        bySubject.set(subject, subjectMap);
    }

    const result =
        new Map<string, SubjectLearningChallenge[]>();

    for (const [subject, conceptMap] of bySubject.entries()) {
        result.set(
            subject,
            Array.from(conceptMap.values())
                .map(item => ({
                    concept: item.label,
                    signals: item.signals,
                }))
                .sort(
                    (a, b) =>
                        b.signals - a.signals ||
                        a.concept.localeCompare(b.concept)
                )
        );
    }

    return result;
}

/**
 * Live outer overlay:
 *
 * 1. Keeps the existing first-loop feedback records as the base.
 * 2. Uses the live ledger only to reinterpret feedback whose doubt state has
 *    subsequently been reconciled.
 * 3. A feedback row becomes "completely understood" only when the live
 *    reconciliation layer confirms all of its doubt concepts are resolved.
 * 4. "Concepts Needing Attention" comes from the CURRENT active live ledger,
 *    grouped by subject, so resolved concepts disappear from the current
 *    attention list without rewriting historical feedback.
 *
 * If the live infrastructure is unavailable, the original profile is returned
 * unchanged.
 */
export async function getStudentLearningIntelligenceWithLiveLayer(
    periodDays = 30
): Promise<LearningIntelligenceProfile> {
    const base =
        await getStudentLearningIntelligence(periodDays);

    try {
        const syncAvailable =
            await syncStudentLiveDoubtLedger();

        if (!syncAvailable) {
            return base;
        }

        const liveRows =
            await getStudentLiveDoubtRows();

        const reconciledRows =
            liveRows.filter(
                row => Boolean(row.last_reconciled_at)
            );

        const rawRows =
            await getStudentFeedbackHistory() as LearningFeedbackRecord[];

        const cutoff = new Date();
        cutoff.setDate(
            cutoff.getDate() - periodDays
        );
        cutoff.setHours(0, 0, 0, 0);

        const recentRows =
            rawRows.filter(row => {
                if (!row.submitted_at) return false;

                const submittedAt =
                    new Date(row.submitted_at);

                return (
                    !Number.isNaN(
                        submittedAt.getTime()
                    ) &&
                    submittedAt >= cutoff
                );
            });

        /*
         * Re-use the canonical live reconciliation matching logic instead of
         * inventing another identity rule here.
         */
        const effectiveRows =
            mergeFeedbackUnderstandingLevels(
                recentRows as any[],
                reconciledRows
            ) as LearningFeedbackRecord[];

        const effectiveProfile =
            buildLearningIntelligence(
                effectiveRows,
                periodDays
            );

        const activeLiveRows =
            liveRows.filter(
                row => row.is_unresolved
            );

        const liveChallenges =
            liveChallengeMap(activeLiveRows);

        /*
         * Preserve every subject already represented by the learning
         * profile, while replacing its attention concepts with the current
         * live unresolved concepts.
         */
        const subjectUnderstanding =
            effectiveProfile.subjectUnderstanding.map(
                subject => ({
                    ...subject,
                    challenges:
                        liveChallenges.get(subject.subject) ?? [],
                })
            );

        /*
         * Include a subject if it currently has a live doubt even when its
         * recent feedback rows are outside the selected reporting window.
         * It gets a zero-feedback shell rather than distorting the learning
         * denominator.
         */
        const knownSubjects =
            new Set(
                subjectUnderstanding.map(
                    subject => normalize(subject.subject)
                )
            );

        for (const [subject, challenges] of liveChallenges.entries()) {
            if (
                challenges.length === 0 ||
                knownSubjects.has(normalize(subject))
            ) {
                continue;
            }

            subjectUnderstanding.push({
                subject,
                feedbackCount: 0,
                fullyUnderstood: 0,
                partiallyUnderstood: 0,
                didntUnderstand: 0,
                fullyUnderstoodPercent: 0,
                partiallyUnderstoodPercent: 0,
                didntUnderstandPercent: 0,
                understandingScore: 0,
                challenges,
            });
        }

        subjectUnderstanding.sort(
            (a, b) =>
                a.understandingScore - b.understandingScore ||
                b.feedbackCount - a.feedbackCount ||
                a.subject.localeCompare(b.subject)
        );

        /*
         * For the visible "Concepts Needing Attention" layer, the live
         * unresolved ledger is authoritative. Resolved concepts therefore
         * disappear from this current attention set.
         */
        const persistentChallenges =
            Array.from(
                liveChallenges.entries()
            )
                .flatMap(
                    ([subject, challenges]) =>
                        challenges.map(challenge => ({
                            concept: challenge.concept,
                            signals: challenge.signals,
                            subjects: [subject],
                        }))
                )
                .sort(
                    (a, b) =>
                        b.signals - a.signals ||
                        a.concept.localeCompare(b.concept) ||
                        a.subjects[0].localeCompare(
                            b.subjects[0]
                        )
                );

        return {
            ...effectiveProfile,
            subjectUnderstanding,
            persistentChallenges,
        };
    } catch (error) {
        console.error(
            "LIVE LEARNING INTELLIGENCE OVERLAY FAILED — ORIGINAL LEARNING INTELLIGENCE PRESERVED",
            error
        );

        return base;
    }
}
