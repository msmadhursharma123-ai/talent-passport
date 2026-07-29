import {
    getStudentFeedbackHistory,
} from "../data/studentDailyFeedbackRepository";

import {
    buildLearningIntelligence,
    type LearningFeedbackRecord,
    type LearningIntelligenceProfile,
} from "../engines/learningIntelligenceEngine";

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
