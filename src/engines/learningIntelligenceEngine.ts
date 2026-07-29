export type LearningUnderstandingLevel =
    | "I completely understood."
    | "I partially understood."
    | "I didn't understand.";

export interface LearningFeedbackRecord {
    understanding_level?: string | null;
    subject_name?: string | null;
    topic_name?: string | null;
    concepts_not_understood?: string[] | null;
    submitted_at?: string | null;
}

export interface SubjectUnderstanding {
    subject: string;
    feedbackCount: number;
    fullyUnderstood: number;
    partiallyUnderstood: number;
    didntUnderstand: number;
    understandingScore: number;
}

export interface PersistentLearningChallenge {
    concept: string;
    signals: number;
}

export interface LearningIntelligenceProfile {
    periodDays: number;
    recordedLectures: number;
    fullyUnderstood: number;
    partiallyUnderstood: number;
    didntUnderstand: number;
    fullyUnderstoodPercent: number;
    partiallyUnderstoodPercent: number;
    didntUnderstandPercent: number;
    understandingScore: number;
    consistencyScore: number;
    subjectUnderstanding: SubjectUnderstanding[];
    persistentChallenges: PersistentLearningChallenge[];
}

function percent(part: number, total: number): number {
    if (total <= 0) return 0;
    return Math.round((part / total) * 100);
}

function weightedUnderstandingScore(records: LearningFeedbackRecord[]): number {
    if (records.length === 0) return 0;

    const points = records.reduce((sum, record) => {
        if (record.understanding_level === "I completely understood.") return sum + 1;
        if (record.understanding_level === "I partially understood.") return sum + 0.5;
        return sum;
    }, 0);

    return Math.round((points / records.length) * 100);
}

export function buildLearningIntelligence(
    records: LearningFeedbackRecord[],
    periodDays = 30
): LearningIntelligenceProfile {
    const valid = records.filter(record =>
        record.understanding_level === "I completely understood." ||
        record.understanding_level === "I partially understood." ||
        record.understanding_level === "I didn't understand."
    );

    const fullyUnderstood = valid.filter(
        record => record.understanding_level === "I completely understood."
    ).length;

    const partiallyUnderstood = valid.filter(
        record => record.understanding_level === "I partially understood."
    ).length;

    const didntUnderstand = valid.filter(
        record => record.understanding_level === "I didn't understand."
    ).length;

    const subjectMap = new Map<string, LearningFeedbackRecord[]>();

    for (const record of valid) {
        const subject = record.subject_name?.trim() || "Other";
        const current = subjectMap.get(subject) ?? [];
        current.push(record);
        subjectMap.set(subject, current);
    }

    const subjectUnderstanding: SubjectUnderstanding[] =
        Array.from(subjectMap.entries())
            .map(([subject, subjectRecords]) => ({
                subject,
                feedbackCount: subjectRecords.length,
                fullyUnderstood: subjectRecords.filter(
                    x => x.understanding_level === "I completely understood."
                ).length,
                partiallyUnderstood: subjectRecords.filter(
                    x => x.understanding_level === "I partially understood."
                ).length,
                didntUnderstand: subjectRecords.filter(
                    x => x.understanding_level === "I didn't understand."
                ).length,
                understandingScore: weightedUnderstandingScore(subjectRecords),
            }))
            .sort((a, b) => b.feedbackCount - a.feedbackCount);

    const challengeMap = new Map<string, number>();

    for (const record of valid) {
        for (const rawConcept of record.concepts_not_understood ?? []) {
            const concept = rawConcept.trim();
            if (!concept) continue;
            challengeMap.set(concept, (challengeMap.get(concept) ?? 0) + 1);
        }
    }

    const persistentChallenges: PersistentLearningChallenge[] =
        Array.from(challengeMap.entries())
            .map(([concept, signals]) => ({ concept, signals }))
            .sort((a, b) => b.signals - a.signals)
            .slice(0, 5);

    const understandingScore = weightedUnderstandingScore(valid);

    // Consistency means how often learning was at least partially understood.
    // It is intentionally separate from Talent DNA and does not change capability scores.
    const consistencyScore =
        valid.length === 0
            ? 0
            : Math.round(
                ((fullyUnderstood + partiallyUnderstood) / valid.length) * 100
            );

    return {
        periodDays,
        recordedLectures: valid.length,
        fullyUnderstood,
        partiallyUnderstood,
        didntUnderstand,
        fullyUnderstoodPercent: percent(fullyUnderstood, valid.length),
        partiallyUnderstoodPercent: percent(partiallyUnderstood, valid.length),
        didntUnderstandPercent: percent(didntUnderstand, valid.length),
        understandingScore,
        consistencyScore,
        subjectUnderstanding,
        persistentChallenges,
    };
}
