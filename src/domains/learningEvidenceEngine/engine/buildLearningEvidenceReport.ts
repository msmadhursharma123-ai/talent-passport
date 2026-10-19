import type {
  LearningEvidenceAssignment,
  LearningEvidenceFeedbackRow,
  LearningEvidenceFinding,
  LearningEvidenceLogRow,
  LearningEvidenceReport,
} from "../types/LearningEvidenceTypes";

const PARTIAL = "i partially understood.";
const DID_NOT_UNDERSTAND = "i didn't understand.";
const ABSENT = "i was absent.";
const MIN_DISTINCT_STUDENTS_FOR_RECURRING = 2;
const MIN_DISTINCT_LECTURES_FOR_RECURRING = 2;
const MIN_COVERAGE_PERCENT = 25;

function clean(value: unknown): string {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}
function norm(value: unknown): string { return clean(value).toLocaleLowerCase("en"); }
function keyPart(value: unknown): string { return norm(value).replace(/\|/g, " "); }
function concepts(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(value.map(clean).filter(Boolean)));
}
function dateOnly(value: unknown): string | null {
  const text = clean(value);
  if (!text) return null;
  const parsed = new Date(text);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}
function pct(n: number, d: number): number | null {
  return d > 0 ? Math.round((n / d) * 100) : null;
}

export interface BuildLearningEvidenceInput {
  generatedAt?: Date;
  windowStart: string;
  windowEnd: string;
  assignments: LearningEvidenceAssignment[];
  logs: LearningEvidenceLogRow[];
  feedback: LearningEvidenceFeedbackRow[];
  /** Only pass a roster map when sourced from a verified year-linked enrollment ledger. */
  eligibleStudentUuidsByClassroom?: ReadonlyMap<string, ReadonlySet<string>>;
}

/**
 * Pure, deterministic, read-only analysis. It reports repeated evidence,
 * not truthfulness, causation, student reliability, or proof of a learning gap.
 */
export function buildLearningEvidenceReport(input: BuildLearningEvidenceInput): LearningEvidenceReport {
  const assignmentById = new Map<string, LearningEvidenceAssignment>();
  for (const assignment of input.assignments) {
    if (assignment?.id != null) assignmentById.set(String(assignment.id), assignment);
  }
  const logById = new Map<string, LearningEvidenceLogRow>();
  for (const log of input.logs) {
    if (log?.id != null && assignmentById.has(String(log.teacher_assignment_uuid))) {
      logById.set(String(log.id), log);
    }
  }

  const evidenceMap = new Map<string, {
    assignment: LearningEvidenceAssignment;
    topic: string;
    concept: string;
    students: Set<string>;
    lectures: Set<string>;
    feedbackIds: Set<string>;
    dates: string[];
    hasPartialOrNone: boolean;
    hasContradiction: boolean;
  }>();
  const distinctStudents = new Set<string>();
  const distinctLectures = new Set<string>();
  const feedbackSeen = new Set<string>();
  // Participation coverage is measured from all valid, non-absence feedback
  // for the class/section/subject, not only from students who named a specific
  // difficult concept. This keeps coverage separate from concept prevalence.
  const participatingStudentsByClassroomSubject = new Map<string, Set<string>>();

  for (const row of input.feedback) {
    if (!row || !row.daily_log_uuid || !row.student_uuid) continue;
    const log = logById.get(String(row.daily_log_uuid));
    if (!log) continue;
    const assignment = assignmentById.get(String(log.teacher_assignment_uuid));
    if (!assignment) continue;
    const classroom = [assignment.class_name, assignment.section_name].map(keyPart).join("|");
    // Enforce the verified academic-year enrollment roster when supplied.
    // Recorded classroom metadata must also match the exact linked assignment.
    const eligibleStudentUuids = input.eligibleStudentUuidsByClassroom?.get(classroom);
    if (input.eligibleStudentUuidsByClassroom && (!eligibleStudentUuids || !eligibleStudentUuids.has(String(row.student_uuid)))) continue;
    if (row.class_name != null && norm(row.class_name) !== norm(assignment.class_name)) continue;
    if (row.section_name != null && norm(row.section_name) !== norm(assignment.section_name)) continue;
    if (row.subject_name != null && norm(row.subject_name) !== norm(assignment.subject_name)) continue;
    if (row.teacher_uuid != null && norm(row.teacher_uuid) !== norm(assignment.teacher_uuid)) continue;
    const understanding = norm(row.understanding_level);
    if (understanding === ABSENT) continue; // absence is not learning-gap evidence
    const rowId = row.id == null
      ? `${row.daily_log_uuid}:${row.student_uuid}:${understanding}:${clean(row.submitted_at)}`
      : String(row.id);
    if (feedbackSeen.has(rowId)) continue;
    feedbackSeen.add(rowId);
    distinctStudents.add(String(row.student_uuid));
    distinctLectures.add(String(row.daily_log_uuid));
    const classroomSubjectKey = [assignment.class_name, assignment.section_name, assignment.subject_name].map(keyPart).join("|");
    const participants = participatingStudentsByClassroomSubject.get(classroomSubjectKey) ?? new Set<string>();
    participants.add(String(row.student_uuid));
    participatingStudentsByClassroomSubject.set(classroomSubjectKey, participants);

    const reportedConcepts = concepts(row.concepts_not_understood);
    const isPartialOrNone = understanding === PARTIAL || understanding === DID_NOT_UNDERSTAND;
    // A partial/low understanding response without a named concept is retained
    // as a limitation in coverage, but is not converted into a guessed concept.
    for (const concept of reportedConcepts) {
      const key = [assignment.class_name, assignment.section_name, assignment.subject_name, clean(log.topic_name), concept].map(keyPart).join("|");
      let item = evidenceMap.get(key);
      if (!item) {
        item = { assignment, topic: clean(log.topic_name), concept, students: new Set(), lectures: new Set(), feedbackIds: new Set(), dates: [], hasPartialOrNone: false, hasContradiction: false };
        evidenceMap.set(key, item);
      }
      item.students.add(String(row.student_uuid));
      item.lectures.add(String(row.daily_log_uuid));
      item.feedbackIds.add(rowId);
      const date = dateOnly(log.log_date ?? log.created_at ?? row.submitted_at);
      if (date) item.dates.push(date);
      item.hasPartialOrNone ||= isPartialOrNone;
      // Complete understanding plus a named difficult concept is not treated
      // as a contradiction automatically; the form may permit historical notes.
    }
  }

  const findings: LearningEvidenceFinding[] = Array.from(evidenceMap.entries()).map(([key, item]) => {
    const rosterKey = [item.assignment.class_name, item.assignment.section_name].map(keyPart).join("|");
    const eligibleRoster = input.eligibleStudentUuidsByClassroom?.get(rosterKey);
    const eligible = eligibleRoster?.size ?? null;
    const classroomSubjectKey = [item.assignment.class_name, item.assignment.section_name, item.assignment.subject_name].map(keyPart).join("|");
    const participatingStudents = participatingStudentsByClassroomSubject.get(classroomSubjectKey);
    const coverage = eligible != null && participatingStudents
      ? pct(Array.from(participatingStudents).filter((studentUuid) => eligibleRoster?.has(studentUuid)).length, eligible)
      : null;
    const limitations: string[] = [
      "Student feedback is self-reported and is not proof of mastery or difficulty.",
      "Independent assessment evidence is not connected to this first-stage engine.",
    ];
    if (eligible == null || eligible === 0) limitations.push("A verified academic-year enrollment roster is unavailable; class strength and feedback coverage cannot be calculated.");
    if (item.students.size < MIN_DISTINCT_STUDENTS_FOR_RECURRING) limitations.push("Fewer than two distinct students reported this concept.");
    if (item.lectures.size < MIN_DISTINCT_LECTURES_FOR_RECURRING) limitations.push("Evidence spans fewer than two distinct daily logs.");
    if (coverage !== null && coverage < MIN_COVERAGE_PERCENT) limitations.push("Observed feedback coverage is below the minimum reporting threshold.");

    let status: LearningEvidenceFinding["status"] = "limited_signal";
    if (eligible == null || eligible === 0 || coverage === null || coverage < MIN_COVERAGE_PERCENT) status = "insufficient_coverage";
    else if (item.students.size >= MIN_DISTINCT_STUDENTS_FOR_RECURRING && item.lectures.size >= MIN_DISTINCT_LECTURES_FOR_RECURRING) status = "recurring_signal";
    if (item.hasContradiction) status = "conflicting_or_incomplete_data";

    const dates = item.dates.slice().sort();
    const evidence = [
      `${item.students.size} distinct student(s) named the concept.`,
      `Observed across ${item.lectures.size} distinct daily log(s).`,
      `${item.feedbackIds.size} distinct feedback record(s) contributed.`,
      item.hasPartialOrNone ? "At least one related response selected partial or not-understood." : "Concept was named without a partial/not-understood response flag.",
    ];
    return {
      key, className: item.assignment.class_name, sectionName: item.assignment.section_name,
      subjectName: item.assignment.subject_name, topicName: item.topic, concept: item.concept,
      distinctStudentCount: item.students.size, distinctLectureCount: item.lectures.size,
      feedbackCount: item.feedbackIds.size, eligibleStudentCount: eligible,
      feedbackCoveragePercent: coverage, firstObservedDate: dates[0] ?? null,
      lastObservedDate: dates[dates.length - 1] ?? null, status,
      independentAssessmentStatus: "not_connected" as const, evidence, limitations,
    };
  }).sort((a, b) => {
    const rank = (status: LearningEvidenceFinding["status"]) => status === "recurring_signal" ? 0 : status === "limited_signal" ? 1 : status === "insufficient_coverage" ? 2 : 3;
    return rank(a.status) - rank(b.status) || b.distinctStudentCount - a.distinctStudentCount || a.className.localeCompare(b.className) || a.concept.localeCompare(b.concept);
  });

  return {
    generatedAt: (input.generatedAt ?? new Date()).toISOString(),
    windowStart: input.windowStart, windowEnd: input.windowEnd,
    source: "student_daily_feedback + teacher_daily_logs + teacher_classroom_assignments",
    readOnly: true, independentAssessmentStatus: "not_connected", findings,
    coverage: {
      eligibleRosterStatus: input.eligibleStudentUuidsByClassroom ? "verified" : "unavailable",
      assignments: input.assignments.length, dailyLogs: input.logs.length,
      feedbackRows: feedbackSeen.size, distinctStudentsWithFeedback: distinctStudents.size,
      distinctLecturesWithFeedback: distinctLectures.size,
    },
    caveats: [
      "This report is an evidence summary, not a student score, diagnosis, or disciplinary recommendation.",
      "Only concepts explicitly named in feedback are analysed; no concept is inferred from free-text keyword matching.",
      input.eligibleStudentUuidsByClassroom
        ? "Class strength uses ACTIVE year-linked enrollment records for the selected school academic year. Feedback participation coverage counts eligible, non-absence respondents in the class/section/subject; it is not the share naming a particular concept."
        : "A verified year-linked enrollment roster is unavailable; class strength and feedback participation coverage cannot be calculated.",
      "Absence responses are excluded from learning-gap evidence.",
      "Independent assessment data is not connected; the engine must not present feedback as independently verified.",
      "No database writes, RPC calls, feedback edits, or existing analytics mutations are performed by the engine.",
    ],
  };
}
