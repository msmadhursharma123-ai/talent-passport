export type ActionDimension =
    | "Creativity"
    | "Communication"
    | "Leadership"
    | "Confidence"
    | "Collaboration"
    | "Critical Thinking";

export type ActionCategory =
    | "Practice"
    | "Project"
    | "Academic"
    | "Experience"
    | "Competition"
    | "Evidence";

export interface ActionDimensionInput {
    key: string;
    label: ActionDimension;
    value: number;
    average: number;
    percentile: number;
    schoolPercentile: number;
}

export interface ActionProjectionInput {
    label: string;
    current: number;
    projected: number;
}

export interface ActionLearningInput {
    recordedLectures: number;
    understandingScore: number;
    consistencyScore: number;
    subjectUnderstanding: {
        subject: string;
        feedbackCount: number;
        understandingScore: number;
        fullyUnderstoodPercent?: number;
        partiallyUnderstoodPercent?: number;
        didntUnderstandPercent?: number;
        challenges?: {
            concept: string;
            signals: number;
        }[];
    }[];
    persistentChallenges: {
        concept: string;
        signals: number;
        subjects?: string[];
    }[];
}

export interface ActionGrowthInput {
    overallChange: number | null;
    overallDirection: string;
    profileConfidence: number;
    totalEvidence: number;
    sourceDiversity: number;
    dimensionCoverage: number;
    recentEvidence90Days: number;
    evidenceSources?: {
        portfolioItems?: number;
        achievements?: number;
        verifiedAchievements?: number;
        competitionSubmissions?: number;
        creditTransactions?: number;
        lifetimeCreditsEarned?: number;
        hasAcademicEvidence?: boolean;
    };
}

export interface RecommendedOpportunity {
    name: string;
    score: number;
}

export interface PersonalGrowthActionInput {
    dimensions: ActionDimensionInput[];
    projections: ActionProjectionInput[];
    participationReadiness: number;
    evidenceCoverage: number;
    growth: ActionGrowthInput | null;
    learning: ActionLearningInput | null;
    competitions: RecommendedOpportunity[];
}

export interface GrowthAction {
    id: string;
    category: ActionCategory;
    title: string;
    why: string;
    instruction: string;
    focus: string;
    priority: number;
    signal: string;
}

export interface GrowthPlanMonth {
    month: 1 | 2 | 3;
    theme: string;
    objective: string;
    actions: GrowthAction[];
}

export interface GrowthTarget {
    dimension: ActionDimension;
    current: number;
    target: number;
    gap: number;
    focus: string;
}

export interface PersonalGrowthActionPlan {
    headline: string;
    summary: string;
    primaryFocus: ActionDimension;
    secondaryFocus: ActionDimension;
    immediatePriorities: GrowthAction[];
    months: GrowthPlanMonth[];
    yearEndTargets: GrowthTarget[];
    evidenceGoals: string[];
    generatedFrom: string[];
    fingerprint: string;
    planConfidence: "Building" | "Medium" | "High";
}

const cap = (value: number) =>
    Math.max(0, Math.min(100, Math.round(value)));

const slug = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const action = (
    category: ActionCategory,
    title: string,
    why: string,
    instruction: string,
    focus: string,
    priority: number,
    signal: string
): GrowthAction => ({
    id: `${slug(category)}-${slug(focus)}-${slug(title)}-${slug(signal)}`,
    category,
    title,
    why,
    instruction,
    focus,
    priority,
    signal,
});

function hashString(value: string): number {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash >>> 0);
}

function choose<T>(items: T[], seed: number): T {
    return items[seed % items.length];
}

function dimensionNeed(d: ActionDimensionInput): number {
    const scoreNeed = 100 - cap(d.value);
    const schoolGap = Math.max(0, d.average - d.value);
    const peerNeed = 100 - cap(d.percentile);
    const schoolPositionNeed = 100 - cap(d.schoolPercentile);

    return (
        scoreNeed * 0.46 +
        schoolGap * 0.24 +
        peerNeed * 0.16 +
        schoolPositionNeed * 0.14
    );
}

function dimensionAction(
    dimension: ActionDimensionInput,
    seed: number,
    rank: number
): GrowthAction {
    const variants: Record<ActionDimension, {
        category: ActionCategory;
        titles: string[];
        instructions: string[];
    }> = {
        Creativity: {
            category: "Project",
            titles: ["Constraint Creation Sprint", "Three-Solution Challenge", "Idea-to-Prototype Week"],
            instructions: [
                "Choose one real school or home problem. Create three different solutions, select one, build a simple output and save the first idea plus final version.",
                "Take one topic you already know and express it in three formats: visual, story and model. Keep the strongest version as Portfolio evidence.",
                "Pick a small problem, set one constraint such as time or materials, create a solution in seven days and document what changed after feedback.",
            ],
        },
        Communication: {
            category: "Practice",
            titles: ["Explain–Record–Improve", "Clarity Practice Loop", "Audience Explanation Challenge"],
            instructions: [
                "Choose one current school topic twice this week. Explain it for two minutes, record it, then repeat after removing unclear or repeated points.",
                "Once a week, explain a difficult idea using opening, three key points and conclusion. Ask one listener what was unclear and revise the explanation.",
                "Explain the same concept once to a classmate and once to a family member. Notice what you changed for each audience and save one sample.",
            ],
        },
        Leadership: {
            category: "Experience",
            titles: ["Own a Small Outcome", "Plan–Delegate–Close", "Responsibility Sprint"],
            instructions: [
                "Take ownership of one small group outcome this month. Define the goal, divide roles, check progress once and document what you did when something slipped.",
                "For the next team task, write the goal, roles and deadline before starting. At the end, record one decision you made and one thing you would change.",
                "Choose one responsibility at school, club or home that involves other people. Complete it end-to-end and capture the result plus feedback.",
            ],
        },
        Confidence: {
            category: "Experience",
            titles: ["Progressive Visibility Ladder", "Speak Before Ready", "Confidence Exposure Plan"],
            instructions: [
                "Complete three increasingly visible actions this month: ask one question, explain one answer to a peer, then volunteer for one short public contribution.",
                "Once a week, choose one useful situation you would normally avoid speaking in. Prepare one sentence in advance, contribute, then record what actually happened.",
                "Build a four-step confidence ladder from easiest to hardest. Complete one step each week and keep one reflection or recording as evidence.",
            ],
        },
        Collaboration: {
            category: "Project",
            titles: ["Shared-Outcome Project", "Team Role Rotation", "Listen–Contribute–Close"],
            instructions: [
                "Complete one small project with 2–4 peers where roles are explicit and the final result depends on everyone. Record your role and one team problem you helped resolve.",
                "Across the next two team activities, deliberately take two different roles. After each, note what the team needed from you and what improved the shared result.",
                "In the next group task, contribute one idea, ask another person for input, build on their idea and help summarize the final decision. Capture the outcome.",
            ],
        },
        "Critical Thinking": {
            category: "Practice",
            titles: ["Claim–Evidence–Reason Loop", "Compare Before Choosing", "Decision Journal"],
            instructions: [
                "Twice this week, take one school question and write your answer, the evidence supporting it, one alternative explanation and why you chose your final answer.",
                "Choose one real problem. List three possible solutions, compare two trade-offs for each and document why the final option was selected.",
                "For one decision each week, write the options, evidence, assumption and result. Review after seven days to see whether your reasoning held up.",
            ],
        },
    };

    const variant = variants[dimension.label];
    const localSeed = seed + rank * 37 + Math.round(dimension.value * 11);

    return action(
        variant.category,
        choose(variant.titles, localSeed),
        `${dimension.label} is a current development priority at ${cap(dimension.value)}/100, with school/class average ${cap(dimension.average)}/100 and peer position ${cap(dimension.percentile)}th percentile.`,
        choose(variant.instructions, localSeed + 13),
        dimension.label,
        92 - rank * 3,
        `${dimension.label}:${cap(dimension.value)}:${cap(dimension.percentile)}:${cap(dimension.schoolPercentile)}`
    );
}

function academicActions(
    learning: ActionLearningInput | null,
    seed: number
): GrowthAction[] {
    if (!learning || learning.recordedLectures === 0) return [];

    const subjects = [...learning.subjectUnderstanding]
        .sort(
            (a, b) =>
                a.understandingScore - b.understandingScore ||
                b.feedbackCount - a.feedbackCount
        );

    const weakest = subjects[0];
    const second = subjects[1];
    const actions: GrowthAction[] = [];

    if (weakest && weakest.understandingScore < 80) {
        const challenge = weakest.challenges?.[0];

        actions.push(
            action(
                "Academic",
                challenge
                    ? `${weakest.subject}: Resolve "${challenge.concept}"`
                    : `${weakest.subject}: Close the understanding gap`,
                `${weakest.subject} is currently the lowest-understanding subject at ${weakest.understandingScore}% across ${weakest.feedbackCount} recorded response${weakest.feedbackCount === 1 ? "" : "s"}.`,
                challenge
                    ? `Within 24 hours of the next ${weakest.subject} lesson, revisit "${challenge.concept}", solve or explain one example without notes, then submit the next classroom feedback based on whether the gap actually improved.`
                    : `For the next three ${weakest.subject} lessons, review the lesson within 24 hours and write one unresolved question. Recheck it before the next class.`,
                weakest.subject,
                100,
                `${weakest.subject}:${weakest.understandingScore}:${challenge?.concept ?? "subject"}:${challenge?.signals ?? 0}`
            )
        );
    }

    if (second && second.understandingScore < 70) {
        actions.push(
            action(
                "Academic",
                `${second.subject}: Recovery check`,
                `${second.subject} is another current academic pressure point at ${second.understandingScore}% understanding.`,
                "After each of the next two lessons, identify the single hardest concept and explain it in your own words before using notes. Keep the one that remains unclear for teacher follow-up.",
                second.subject,
                91,
                `${second.subject}:${second.understandingScore}:${seed}`
            )
        );
    }

    if (learning.consistencyScore < 80) {
        const variants = [
            "For five school days, end the day by naming one lesson understood well and one concept still unclear. Revisit only the unclear item for 10 focused minutes.",
            "For the next week, use a two-line learning closeout after school: 'I can explain…' and 'I still need help with…'. Use the second line to choose the next revision task.",
            "Create a seven-day understanding streak: after the final lesson each day, pick one concept and explain it without notes. If you cannot, schedule a 10-minute review.",
        ];

        actions.push(
            action(
                "Practice",
                "Stabilize Learning Consistency",
                `Recent learning consistency is ${learning.consistencyScore}%, so the plan should improve follow-through before adding more activities.`,
                choose(variants, seed + learning.consistencyScore),
                "Learning Consistency",
                95,
                `consistency:${learning.consistencyScore}:${learning.recordedLectures}`
            )
        );
    }

    return actions;
}

function evidenceActions(
    input: PersonalGrowthActionInput,
    seed: number
): GrowthAction[] {
    const sources = input.growth?.evidenceSources;
    const actions: GrowthAction[] = [];

    if (input.evidenceCoverage < 55) {
        const missingPortfolio = (sources?.portfolioItems ?? 0) < 3;
        const missingVerified = (sources?.verifiedAchievements ?? 0) === 0;
        const missingCompetition = (sources?.competitionSubmissions ?? 0) === 0;

        const instruction =
            missingPortfolio
                ? "Create one meaningful Portfolio record from work you are already doing: include the output, your role and one sentence explaining what capability it demonstrates."
                : missingVerified
                    ? "For the next genuine achievement already earned, add available proof and enough context to make the evidence verifiable."
                    : missingCompetition
                        ? "Use one suitable real challenge or competition to create evaluated evidence instead of adding another self-described activity."
                        : "Add one new piece of evidence from a source not yet well represented in the Passport, rather than repeating the strongest existing source.";

        actions.push(
            action(
                "Evidence",
                "Strengthen the Passport's Evidence Mix",
                `Evidence coverage is ${cap(input.evidenceCoverage)}%. Recommendations become more reliable when different real activities support the profile.`,
                instruction,
                "Evidence Confidence",
                89,
                `evidence:${cap(input.evidenceCoverage)}:${sources?.portfolioItems ?? 0}:${sources?.verifiedAchievements ?? 0}:${sources?.competitionSubmissions ?? 0}:${seed}`
            )
        );
    }

    return actions;
}

function competitionAction(
    input: PersonalGrowthActionInput,
    primary: ActionDimension,
    seed: number
): GrowthAction[] {
    if (input.competitions.length === 0 || input.participationReadiness < 35) {
        return [];
    }

    const sorted = [...input.competitions].sort((a, b) => b.score - a.score);
    const pool = sorted.slice(0, Math.min(3, sorted.length));
    const best = choose(pool, seed + cap(input.participationReadiness));

    return [
        action(
            "Competition",
            `Use ${best.name} as a Growth Test`,
            `${best.name} is a ${best.score} match and participation readiness is ${cap(input.participationReadiness)}/100. The value is the evaluated evidence it can create, not participation alone.`,
            `Prepare for ${best.name} around the current ${primary} priority. After participation, keep the submission, evaluation and one reflection on what changed so the next Passport update can use real evidence.`,
            primary,
            83,
            `${best.name}:${best.score}:${cap(input.participationReadiness)}:${seed}`
        ),
    ];
}

function planConfidence(input: PersonalGrowthActionInput): "Building" | "Medium" | "High" {
    const evidence = cap(input.evidenceCoverage);
    const lectures = input.learning?.recordedLectures ?? 0;
    const sources = input.growth?.sourceDiversity ?? 0;

    if (evidence >= 70 && (lectures >= 8 || sources >= 3)) return "High";
    if (evidence >= 40 || lectures >= 4 || sources >= 2) return "Medium";
    return "Building";
}

export function buildPersonalGrowthActionPlan(
    input: PersonalGrowthActionInput
): PersonalGrowthActionPlan {
    const fingerprintSource = JSON.stringify({
        dimensions: input.dimensions.map(d => [
            d.label,
            cap(d.value),
            cap(d.average),
            cap(d.percentile),
            cap(d.schoolPercentile),
        ]),
        learning: input.learning
            ? {
                understanding: input.learning.understandingScore,
                consistency: input.learning.consistencyScore,
                subjects: input.learning.subjectUnderstanding.map(s => [
                    s.subject,
                    s.feedbackCount,
                    s.understandingScore,
                    s.challenges?.map(c => [c.concept, c.signals]) ?? [],
                ]),
            }
            : null,
        evidence: {
            coverage: cap(input.evidenceCoverage),
            total: input.growth?.totalEvidence ?? 0,
            diversity: input.growth?.sourceDiversity ?? 0,
            recent: input.growth?.recentEvidence90Days ?? 0,
            sources: input.growth?.evidenceSources ?? {},
        },
        growth: {
            change: input.growth?.overallChange ?? null,
            direction: input.growth?.overallDirection ?? "No History",
        },
        readiness: cap(input.participationReadiness),
        competitions: input.competitions.map(c => [c.name, c.score]),
    });

    const seed = hashString(fingerprintSource);
    const fingerprint = seed.toString(36).toUpperCase();

    const ranked = [...input.dimensions].sort(
        (a, b) => dimensionNeed(b) - dimensionNeed(a)
    );

    const primaryDimension = ranked[0] ?? input.dimensions[0];
    const secondaryDimension = ranked[1] ?? primaryDimension;

    const primary = primaryDimension?.label ?? "Collaboration";
    const secondary = secondaryDimension?.label ?? "Critical Thinking";

    const candidates: GrowthAction[] = [
        ...academicActions(input.learning, seed),
        ...(primaryDimension ? [dimensionAction(primaryDimension, seed, 0)] : []),
        ...(secondaryDimension ? [dimensionAction(secondaryDimension, seed, 1)] : []),
        ...evidenceActions(input, seed),
        ...competitionAction(input, primary, seed),
    ];

    const unique = Array.from(
        new Map(candidates.map(item => [item.id, item])).values()
    ).sort((a, b) => b.priority - a.priority);

    const immediatePriorities = unique.slice(0, 5);

    const month1Pool = unique.filter(
        item => item.category === "Academic" || item.category === "Practice"
    );
    const month2Pool = unique.filter(
        item =>
            item.category === "Project" ||
            item.category === "Experience" ||
            item.category === "Competition"
    );
    const month3Pool = unique.filter(item => item.category === "Evidence");

    const takeUnique = (
        preferred: GrowthAction[],
        count: number,
        excluded: Set<string>
    ) => {
        const result: GrowthAction[] = [];

        for (const item of [...preferred, ...unique]) {
            if (excluded.has(item.id) || result.some(x => x.id === item.id)) continue;
            result.push(item);
            if (result.length >= count) break;
        }

        result.forEach(item => excluded.add(item.id));
        return result;
    };

    const used = new Set<string>();
    const month1 = takeUnique(month1Pool, 2, used);
    const month2 = takeUnique(month2Pool, 2, used);
    const month3 = takeUnique(month3Pool, 2, used);

    const weakestSubject = input.learning?.subjectUnderstanding
        ?.slice()
        .sort((a, b) => a.understandingScore - b.understandingScore)[0];

    const months: GrowthPlanMonth[] = [
        {
            month: 1,
            theme: weakestSubject && weakestSubject.understandingScore < 75
                ? "Recover + Build"
                : `Build ${primary}`,
            objective: weakestSubject && weakestSubject.understandingScore < 75
                ? `Reduce the most important ${weakestSubject.subject} learning friction while starting focused ${primary} practice.`
                : `Build ${primary} through repeated practice tied to the student's current profile.`,
            actions: month1,
        },
        {
            month: 2,
            theme: `Apply ${primary}`,
            objective: `Use ${primary} and ${secondary} in a real project, responsibility, performance or challenge that can produce observable evidence.`,
            actions: month2,
        },
        {
            month: 3,
            theme: "Prove + Recalibrate",
            objective: "Turn the strongest work from the first two months into credible evidence, then let the Passport recalculate the next priorities.",
            actions: month3,
        },
    ];

    const confidence = planConfidence(input);

    const yearEndTargets: GrowthTarget[] = input.dimensions.map(dimension => {
        const projection = input.projections.find(
            item => item.label === dimension.label
        )?.projected;

        const priorityRank = ranked.findIndex(
            item => item.label === dimension.label
        );

        const evidenceFactor =
            input.evidenceCoverage >= 70 ? 1 :
            input.evidenceCoverage >= 40 ? 0 :
            -2;

        const growthFactor =
            (input.growth?.overallChange ?? 0) > 0 ? 2 : 0;

        const priorityBoost =
            priorityRank === 0 ? 10 :
            priorityRank === 1 ? 7 :
            dimension.value < 60 ? 5 : 3;

        const calculated = cap(
            dimension.value + priorityBoost + evidenceFactor + growthFactor
        );

        const target = Math.max(
            cap(dimension.value),
            Math.min(
                100,
                projection && projection > dimension.value
                    ? Math.round((calculated + projection) / 2)
                    : calculated
            )
        );

        return {
            dimension: dimension.label,
            current: cap(dimension.value),
            target,
            gap: Math.max(0, target - cap(dimension.value)),
            focus:
                priorityRank === 0
                    ? "Primary plan focus"
                    : priorityRank === 1
                        ? "Secondary plan focus"
                        : dimension.value >= 70
                            ? "Protect strength through evidence"
                            : "Build after higher priorities",
        };
    });

    const evidenceGoals: string[] = [];

    if ((input.growth?.evidenceSources?.portfolioItems ?? 0) < 3) {
        evidenceGoals.push("Create one meaningful Portfolio record showing the work, role and capability demonstrated.");
    }

    if ((input.growth?.evidenceSources?.verifiedAchievements ?? 0) === 0) {
        evidenceGoals.push("Add proof to the next genuine achievement when verification evidence is available.");
    }

    if ((input.growth?.evidenceSources?.competitionSubmissions ?? 0) === 0 && input.participationReadiness >= 35) {
        evidenceGoals.push("Create one evaluated real-world evidence event through a suitable competition or challenge.");
    }

    if ((input.learning?.recordedLectures ?? 0) > 0) {
        evidenceGoals.push("Keep classroom understanding feedback current so academic recommendations adapt by subject.");
    }

    if (evidenceGoals.length < 2) {
        evidenceGoals.push("Add one new evidence source that is different from the student's strongest existing source.");
    }

    const generatedFrom = [
        "Current six-dimension Talent DNA",
        "School/class benchmark and relative position",
        "Day 0 to current growth signal",
        "Evidence coverage, recency and source diversity",
        "Subject-level classroom understanding and concept difficulties",
        "Participation readiness and current opportunity matches",
    ];

    const learningLead =
        weakestSubject && weakestSubject.understandingScore < 75
            ? `${weakestSubject.subject} currently needs attention (${weakestSubject.understandingScore}% understanding), so the plan starts by reducing that learning friction.`
            : "No major subject-level learning friction currently outranks the capability priorities.";

    return {
        headline: `${primary} is the first capability priority; ${secondary} is second.`,
        summary: `${learningLead} Recommendations are selected from this student's current combination of scores, peer position, learning signals, evidence and readiness. Targets are planning ranges, not guaranteed scores.`,
        primaryFocus: primary,
        secondaryFocus: secondary,
        immediatePriorities,
        months,
        yearEndTargets,
        evidenceGoals,
        generatedFrom,
        fingerprint,
        planConfidence: confidence,
    };
}
