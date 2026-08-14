import type {
  SchoolIntelligenceSnapshot,
  SchoolExamPreparationClassroom,
} from "../../schoolIntelligence/types/SchoolIntelligenceModels";
import type { SchoolIntelligenceRawData } from "../../schoolIntelligence/repository/SchoolIntelligenceRepository";
import {
  effectiveUnderstandingFromLiveFeedback,
  getLiveDoubtRowsForSchool,
  isPendingDoubtLiveResolved,
  type LiveDoubtRow,
} from "../repository/LiveDoubtReconciliationRepository";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";
const pct = (part: number, total: number) => total === 0 ? 0 : Math.round((part / total) * 100);

function withinDate(value: unknown, start?: string, end?: string) {
  const date = String(value ?? "").split("T")[0];
  if (!date) return false;
  if (start && date < start) return false;
  if (end && date >= end) return false;
  return true;
}

function statusForHealth(score: number) {
  if (score < 50) return "Critical";
  if (score < 80) return "Needs Attention";
  return "Excellent";
}

function effectiveFeedbackRows(raw: SchoolIntelligenceRawData, liveRows: LiveDoubtRow[]) {
  return raw.feedback.map(feedback => ({
    ...feedback,
    effective_understanding_level: effectiveUnderstandingFromLiveFeedback(feedback, liveRows),
  }));
}

function overlayDoubtMetrics(rows: any[], liveRows: LiveDoubtRow[]) {
  const doubtsAsked = rows.length;
  const doubtsResolved = rows.filter(doubt => {
    const live = isPendingDoubtLiveResolved(doubt, liveRows);
    if (live !== null) return live;
    return doubt.doubt_resolved === true || String(doubt.status ?? "").trim().toUpperCase() === "RESOLVED";
  }).length;
  return { doubtsAsked, doubtsResolved, doubtClosureRate: pct(doubtsResolved, doubtsAsked) };
}

function buildLiveExamPreparation(raw: SchoolIntelligenceRawData, liveRows: LiveDoubtRow[]): SchoolExamPreparationClassroom[] {
  const teacherNames = new Map<string, string>(raw.teachers.map((t: any) => [String(t.teacher_uuid ?? ""), String(t.full_name ?? "Teacher")]));
  const studentNames = new Map<string, string>(raw.students.map((s: any) => [String(s.student_uuid ?? ""), String(s.student_name ?? "Student")]));
  const classrooms = new Map<string, any>();

  for (const assignment of raw.assignments.filter((x: any) => x.is_active !== false)) {
    const className = String(assignment.class_name ?? "");
    const sectionName = String(assignment.section_name ?? "");
    const key = `${className}__${sectionName}`;
    if (!classrooms.has(key)) {
      classrooms.set(key, {
        classroomKey: key,
        classroom: `Class ${className} - Section ${sectionName}`,
        className,
        sectionName,
        subjects: [],
      });
    }

    const assignmentUuid = String(assignment.id ?? "");
    const records = liveRows.filter(row =>
      String(row.teacher_assignment_uuid ?? "") === assignmentUuid && row.is_unresolved
    );

    const studentMap = new Map<string, any>();
    for (const row of records) {
      const id = String(row.student_uuid ?? "");
      if (!id) continue;
      if (!studentMap.has(id)) {
        studentMap.set(id, {
          studentUuid: id,
          studentName: studentNames.get(id) ?? "Student",
          totalUnresolvedDoubts: 0,
          topics: [],
        });
      }
      const student = studentMap.get(id);
      student.totalUnresolvedDoubts += 1;
      const topic = String(row.topic_name ?? row.doubt_concept ?? "").trim();
      if (topic) student.topics.push(topic);
    }

    const students = Array.from(studentMap.values()).map(student => {
      const topicCounts = new Map<string, number>();
      student.topics.forEach((topic: string) => topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1));
      const highestRiskTopic = Array.from(topicCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";
      const attentionLevel = student.totalUnresolvedDoubts >= 6 ? "HIGH" : student.totalUnresolvedDoubts >= 3 ? "MEDIUM" : "LOW";
      return { ...student, highestRiskTopic, attentionLevel };
    }).sort((a, b) => b.totalUnresolvedDoubts - a.totalUnresolvedDoubts || a.studentName.localeCompare(b.studentName));

    const topicCounts = new Map<string, number>();
    records.forEach(row => {
      const topic = String(row.topic_name ?? row.doubt_concept ?? "").trim();
      if (topic) topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
    });

    classrooms.get(key).subjects.push({
      assignmentUuid,
      subjectName: String(assignment.subject_name ?? "Subject"),
      teacherUuid: String(assignment.teacher_uuid ?? ""),
      teacherName: teacherNames.get(String(assignment.teacher_uuid ?? "")) ?? "Teacher",
      students,
      totalStudentsWithUnresolvedDoubts: students.length,
      doubtsPerKid: students.length ? Math.round((records.length / students.length) * 10) / 10 : 0,
      commonDoubts: Array.from(topicCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]),
    });
  }

  return Array.from(classrooms.values())
    .map(classroom => ({ ...classroom, subjects: classroom.subjects.sort((a: any, b: any) => a.subjectName.localeCompare(b.subjectName)) }))
    .sort((a, b) => Number(a.className) - Number(b.className) || a.sectionName.localeCompare(b.sectionName));
}

export async function applyLiveDoubtReconciliationToSchoolSnapshot(
  snapshot: SchoolIntelligenceSnapshot,
  raw: SchoolIntelligenceRawData,
  startDate?: string,
  endDateExclusive?: string,
) {
  const liveRows = await getLiveDoubtRowsForSchool(raw.schoolUuid, startDate, endDateExclusive);
  const scopedLiveRows = liveRows.filter(row => row.is_unresolved || withinDate(row.resolved_at ?? row.source_submitted_at, startDate, endDateExclusive));
  const effectiveFeedback = effectiveFeedbackRows(raw, scopedLiveRows);

  const classroomRows = snapshot.classrooms.map(row => {
    const assignmentDoubts = raw.doubts.filter(doubt => String(doubt.teacher_assignment_uuid ?? "") === String(row.assignmentUuid ?? ""));
    const metrics = overlayDoubtMetrics(assignmentDoubts, scopedLiveRows);
    const assignmentLogIds = new Set(raw.logs.filter(log => String(log.teacher_assignment_uuid ?? "") === String(row.assignmentUuid ?? "")).map(log => String(log.id)));
    const feedback = effectiveFeedback.filter(item => assignmentLogIds.has(String(item.daily_log_uuid)));
    const complete = feedback.filter(item => item.effective_understanding_level === COMPLETE).length;
    const partial = feedback.filter(item => item.effective_understanding_level === PARTIAL).length;
    const none = feedback.filter(item => item.effective_understanding_level === NONE).length;
    return {
      ...row,
      responses: feedback.length,
      completelyUnderstood: complete,
      partiallyUnderstood: partial,
      didntUnderstand: none,
      understandingRate: pct(complete, feedback.length),
      partialUnderstandingRate: pct(partial, feedback.length),
      doubtRate: pct(none, feedback.length),
      doubtsAsked: metrics.doubtsAsked,
      doubtsResolved: metrics.doubtsResolved,
      doubtClosureRate: metrics.doubtClosureRate,
    };
  });

  const teacherRows = snapshot.teachers.map(row => {
    const assignmentIds = new Set(raw.assignments.filter(a => String(a.teacher_uuid) === String(row.teacherUuid)).map(a => String(a.id)));
    const doubts = raw.doubts.filter(d => assignmentIds.has(String(d.teacher_assignment_uuid ?? "")));
    const metrics = overlayDoubtMetrics(doubts, scopedLiveRows);
    const logIds = new Set(raw.logs.filter(log => assignmentIds.has(String(log.teacher_assignment_uuid ?? ""))).map(log => String(log.id)));
    const feedback = effectiveFeedback.filter(item => logIds.has(String(item.daily_log_uuid)));
    const complete = feedback.filter(item => item.effective_understanding_level === COMPLETE).length;
    const partial = feedback.filter(item => item.effective_understanding_level === PARTIAL).length;
    const none = feedback.filter(item => item.effective_understanding_level === NONE).length;
    return {
      ...row,
      responses: feedback.length,
      understandingRate: pct(complete, feedback.length),
      partialUnderstandingRate: pct(partial, feedback.length),
      doubtRate: pct(none, feedback.length),
      doubtsAsked: metrics.doubtsAsked,
      doubtsResolved: metrics.doubtsResolved,
      doubtClosureRate: metrics.doubtClosureRate,
    };
  });

  const complete = effectiveFeedback.filter(item => item.effective_understanding_level === COMPLETE).length;
  const partial = effectiveFeedback.filter(item => item.effective_understanding_level === PARTIAL).length;
  const none = effectiveFeedback.filter(item => item.effective_understanding_level === NONE).length;
  const schoolDoubtMetrics = overlayDoubtMetrics(raw.doubts, scopedLiveRows);

  const trendsMap = new Map<string, any[]>();
  effectiveFeedback.forEach(row => {
    const date = String(row.submitted_at ?? "").split("T")[0];
    if (!date) return;
    trendsMap.set(date, [...(trendsMap.get(date) ?? []), row]);
  });
  const trends = Array.from(trendsMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, rows]) => {
    const full = rows.filter(row => row.effective_understanding_level === COMPLETE).length;
    const part = rows.filter(row => row.effective_understanding_level === PARTIAL).length;
    const difficult = rows.filter(row => row.effective_understanding_level === NONE).length;
    return {
      date,
      responses: rows.length,
      understandingRate: pct(full, rows.length),
      partialUnderstandingRate: pct(part, rows.length),
      doubtRate: pct(difficult, rows.length),
    };
  });

  const latestByAssignment = new Map<string, any>();
  raw.logs.forEach(log => {
    const key = String(log.teacher_assignment_uuid ?? "");
    const existing = latestByAssignment.get(key);
    const time = new Date(log.created_at ?? log.log_date ?? 0).getTime();
    const existingTime = new Date(existing?.created_at ?? existing?.log_date ?? 0).getTime();
    if (!existing || time > existingTime) latestByAssignment.set(key, log);
  });

  const dailyClassroomIntelligence = snapshot.dailyClassroomIntelligence.map(teacherGroup => ({
    ...teacherGroup,
    classrooms: teacherGroup.classrooms.map(classroom => {
      const latest = latestByAssignment.get(String(classroom.assignmentUuid));
      if (!latest) return classroom;
      const feedback = effectiveFeedback.filter(item => String(item.daily_log_uuid) === String(latest.id));
      const full = feedback.filter(item => item.effective_understanding_level === COMPLETE).length;
      const part = feedback.filter(item => item.effective_understanding_level === PARTIAL).length;
      const noneCount = feedback.filter(item => item.effective_understanding_level === NONE).length;
      const score = feedback.length === 0 ? 0 : Math.round(((full + part * 0.5) / feedback.length) * 100);
      const conceptCounts = new Map<string, number>();
      feedback.forEach(item => {
        const concepts = Array.isArray(item.concepts_not_understood) ? item.concepts_not_understood : [];
        concepts.forEach((concept: string) => conceptCounts.set(concept, (conceptCounts.get(concept) ?? 0) + 1));
      });
      return {
        ...classroom,
        feedbackSubmitted: new Set(feedback.map(item => item.student_uuid).filter(Boolean)).size,
        feedbackRemaining: Math.max(0, classroom.totalStudents - new Set(feedback.map(item => item.student_uuid).filter(Boolean)).size),
        completelyUnderstood: full,
        completelyUnderstoodRate: pct(full, classroom.totalStudents),
        partiallyUnderstood: part,
        partiallyUnderstoodRate: pct(part, classroom.totalStudents),
        didntUnderstand: noneCount,
        didntUnderstandRate: pct(noneCount, classroom.totalStudents),
        classHealthScore: score,
        classHealthStatus: statusForHealth(score),
        mostDifficultConcept: Array.from(conceptCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-",
      };
    }),
  }));

  const latest = scopedLiveRows.map(row => row.updated_at ?? row.last_seen_at ?? row.source_submitted_at ?? null).filter(Boolean).sort().at(-1) ?? null;

  return {
    ...snapshot,
    stats: {
      ...snapshot.stats,
      responses: effectiveFeedback.length,
      completelyUnderstood: complete,
      partiallyUnderstood: partial,
      didntUnderstand: none,
      understandingRate: pct(complete, effectiveFeedback.length),
      partialUnderstandingRate: pct(partial, effectiveFeedback.length),
      doubtRate: pct(none, effectiveFeedback.length),
      doubtsAsked: schoolDoubtMetrics.doubtsAsked,
      activeDoubts: schoolDoubtMetrics.doubtsAsked - schoolDoubtMetrics.doubtsResolved,
      resolvedDoubts: schoolDoubtMetrics.doubtsResolved,
      doubtResolutionRate: schoolDoubtMetrics.doubtClosureRate,
    },
    classrooms: classroomRows,
    teachers: teacherRows,
    trends,
    dailyClassroomIntelligence,
    examPreparation: buildLiveExamPreparation(raw, scopedLiveRows),
    liveReconciliation: {
      active: true,
      calculatedThrough: latest,
    },
  } as SchoolIntelligenceSnapshot & { liveReconciliation: { active: boolean; calculatedThrough: string | null } };
}

export interface LiveSchoolClassroomSupplementalMetric {
  className: string;
  sectionName: string;
  totalStudents: number;
  classHealthPercentage: number;
  liveCalculatedThrough: string | null;
}

export async function getLiveSchoolClassroomSupplementalMetrics(startDate?: string, endDate?: string): Promise<LiveSchoolClassroomSupplementalMetric[]> {
  const { getSchoolIntelligenceRawData } = await import("../../schoolIntelligence/repository/SchoolIntelligenceRepository");
  const raw = await getSchoolIntelligenceRawData(startDate, endDate);
  const liveRows = await getLiveDoubtRowsForSchool(raw.schoolUuid, startDate, endDate);
  const effectiveFeedback = effectiveFeedbackRows(raw, liveRows);

  const classrooms = new Map<string, { className: string; sectionName: string }>();
  raw.assignments.filter((assignment: any) => assignment.is_active !== false).forEach((assignment: any) => {
    const className = String(assignment.class_name ?? "");
    const sectionName = String(assignment.section_name ?? "");
    classrooms.set(`${className}|||${sectionName}`, { className, sectionName });
  });

  return Array.from(classrooms.values()).map(({ className, sectionName }) => {
    const assignments = raw.assignments.filter((assignment: any) =>
      assignment.is_active !== false &&
      String(assignment.class_name ?? "").trim().toLowerCase() === className.trim().toLowerCase() &&
      String(assignment.section_name ?? "").trim().toLowerCase() === sectionName.trim().toLowerCase()
    );
    const assignmentIds = new Set(assignments.map((assignment: any) => String(assignment.id ?? "")));
    const students = new Set(raw.students.filter((student: any) =>
      String(student.class_name ?? "").trim().toLowerCase() === className.trim().toLowerCase() &&
      String(student.section_name ?? "").trim().toLowerCase() === sectionName.trim().toLowerCase()
    ).map((student: any) => student.student_uuid).filter(Boolean));

    const logs = raw.logs.filter((log: any) => assignmentIds.has(String(log.teacher_assignment_uuid ?? "")));
    let healthTotal = 0;
    let healthCount = 0;
    for (const log of logs) {
      const feedback = effectiveFeedback.filter(item => String(item.daily_log_uuid ?? "") === String(log.id ?? ""));
      if (!feedback.length) continue;
      const full = feedback.filter(item => item.effective_understanding_level === COMPLETE).length;
      const partial = feedback.filter(item => item.effective_understanding_level === PARTIAL).length;
      healthTotal += Math.round(((full + partial * 0.5) / feedback.length) * 100);
      healthCount += 1;
    }

    const latest = liveRows.map(row => row.updated_at ?? row.last_seen_at ?? row.source_submitted_at ?? null).filter(Boolean).sort().at(-1) ?? null;
    return {
      className,
      sectionName,
      totalStudents: students.size,
      classHealthPercentage: healthCount === 0 ? 0 : Math.round(healthTotal / healthCount),
      liveCalculatedThrough: latest,
    };
  });
}
