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

export interface SubjectLearningChallenge {
    concept: string;
    signals: number;
}

export interface SubjectUnderstanding {
    subject: string;
    feedbackCount: number;
    fullyUnderstood: number;
    partiallyUnderstood: number;
    didntUnderstand: number;
    fullyUnderstoodPercent: number;
    partiallyUnderstoodPercent: number;
    didntUnderstandPercent: number;
    understandingScore: number;
    challenges: SubjectLearningChallenge[];
}

export interface PersistentLearningChallenge {
    concept: string;
    signals: number;
    subjects: string[];
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

function cleanConcept(value: string): string {
    return value.trim().replace(/\s+/g, " ");
}

function buildSubjectChallenges(
    records: LearningFeedbackRecord[]
): SubjectLearningChallenge[] {
    const map = new Map<string, { label: string; signals: number }>();

    for (const record of records) {
        for (const rawConcept of record.concepts_not_understood ?? []) {
            const concept = cleanConcept(rawConcept);
            if (!concept) continue;

            const key = concept.toLowerCase();
            const existing = map.get(key);

            map.set(key, {
                label: existing?.label ?? concept,
                signals: (existing?.signals ?? 0) + 1,
            });
        }
    }

    return Array.from(map.values())
        .map(item => ({
            concept: item.label,
            signals: item.signals,
        }))
        .sort((a, b) => b.signals - a.signals || a.concept.localeCompare(b.concept));
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
            .map(([subject, subjectRecords]) => {
                const subjectFully = subjectRecords.filter(
                    x => x.understanding_level === "I completely understood."
                ).length;

                const subjectPartially = subjectRecords.filter(
                    x => x.understanding_level === "I partially understood."
                ).length;

                const subjectDidnt = subjectRecords.filter(
                    x => x.understanding_level === "I didn't understand."
                ).length;

                return {
                    subject,
                    feedbackCount: subjectRecords.length,
                    fullyUnderstood: subjectFully,
                    partiallyUnderstood: subjectPartially,
                    didntUnderstand: subjectDidnt,
                    fullyUnderstoodPercent: percent(subjectFully, subjectRecords.length),
                    partiallyUnderstoodPercent: percent(subjectPartially, subjectRecords.length),
                    didntUnderstandPercent: percent(subjectDidnt, subjectRecords.length),
                    understandingScore: weightedUnderstandingScore(subjectRecords),
                    challenges: buildSubjectChallenges(subjectRecords),
                };
            })
            .sort(
                (a, b) =>
                    a.understandingScore - b.understandingScore ||
                    b.feedbackCount - a.feedbackCount
            );

    const globalChallengeMap = new Map<
        string,
        { label: string; signals: number; subjects: Set<string> }
    >();

    for (const [subject, subjectRecords] of subjectMap.entries()) {
        for (const challenge of buildSubjectChallenges(subjectRecords)) {
            const key = challenge.concept.toLowerCase();
            const existing = globalChallengeMap.get(key);

            if (existing) {
                existing.signals += challenge.signals;
                existing.subjects.add(subject);
            } else {
                globalChallengeMap.set(key, {
                    label: challenge.concept,
                    signals: challenge.signals,
                    subjects: new Set([subject]),
                });
            }
        }
    }

    const persistentChallenges: PersistentLearningChallenge[] =
        Array.from(globalChallengeMap.values())
            .map(item => ({
                concept: item.label,
                signals: item.signals,
                subjects: Array.from(item.subjects).sort(),
            }))
            .sort((a, b) => b.signals - a.signals || a.concept.localeCompare(b.concept));

    const understandingScore = weightedUnderstandingScore(valid);

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
