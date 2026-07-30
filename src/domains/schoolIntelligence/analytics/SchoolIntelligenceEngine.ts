import type {
  SchoolAcademicTrendPoint,
  SchoolClassroomHealthRow,
  SchoolIntelligenceSnapshot,
  SchoolTeacherIntelligenceRow,
} from "../types/SchoolIntelligenceModels";
import type { SchoolIntelligenceRawData } from "../repository/SchoolIntelligenceRepository";

const COMPLETE = "I completely understood.";
const PARTIAL = "I partially understood.";
const NONE = "I didn't understand.";

const pct = (part: number, total: number) =>
  total === 0 ? 0 : Math.round((part / total) * 100);

export function buildSchoolIntelligenceSnapshot(
  raw: SchoolIntelligenceRawData
): SchoolIntelligenceSnapshot {
  const complete = raw.feedback.filter(x => x.understanding_level === COMPLETE).length;
  const partial = raw.feedback.filter(x => x.understanding_level === PARTIAL).length;
  const none = raw.feedback.filter(x => x.understanding_level === NONE).length;

  const activeDoubts = raw.doubts.filter(
    x => x.doubt_resolved !== true && x.status !== "RESOLVED"
  ).length;
  const resolvedDoubts = raw.doubts.filter(
    x => x.doubt_resolved === true || x.status === "RESOLVED"
  ).length;

  const classrooms: SchoolClassroomHealthRow[] = raw.assignments.map(assignment => {
    const logs = raw.logs.filter(x => x.teacher_assignment_uuid === assignment.id);
    const logIds = new Set(logs.map(x => x.id));
    const feedback = raw.feedback.filter(x => logIds.has(x.daily_log_uuid));
    const teacher = raw.teachers.find(x => x.teacher_uuid === assignment.teacher_uuid);

    const fully = feedback.filter(x => x.understanding_level === COMPLETE).length;
    const partly = feedback.filter(x => x.understanding_level === PARTIAL).length;
    const difficult = feedback.filter(x => x.understanding_level === NONE).length;

    return {
      assignmentUuid: assignment.id,
      classroom: `Class ${assignment.class_name} · Section ${assignment.section_name}`,
      className: assignment.class_name ?? "",
      sectionName: assignment.section_name ?? "",
      subjectName: assignment.subject_name ?? "",
      teacherUuid: assignment.teacher_uuid,
      teacherName: teacher?.full_name ?? "Teacher",
      topicsTaught: logs.length,
      responses: feedback.length,
      completelyUnderstood: fully,
      partiallyUnderstood: partly,
      didntUnderstand: difficult,
      understandingRate: pct(fully, feedback.length),
      doubtRate: pct(partly + difficult, feedback.length),
    };
  });

  const teachers: SchoolTeacherIntelligenceRow[] = raw.teachers.map(teacher => {
    const assignments = raw.assignments.filter(x => x.teacher_uuid === teacher.teacher_uuid);
    const assignmentIds = new Set(assignments.map(x => x.id));
    const logs = raw.logs.filter(x => assignmentIds.has(x.teacher_assignment_uuid));
    const logIds = new Set(logs.map(x => x.id));
    const feedback = raw.feedback.filter(x => logIds.has(x.daily_log_uuid));
    const fully = feedback.filter(x => x.understanding_level === COMPLETE).length;
    const difficult = feedback.filter(
      x => x.understanding_level === PARTIAL || x.understanding_level === NONE
    ).length;

    return {
      teacherUuid: teacher.teacher_uuid,
      teacherName: teacher.full_name ?? "Teacher",
      subjects: Array.from(new Set(assignments.map(x => x.subject_name).filter(Boolean))),
      classrooms: Array.from(new Set(
        assignments.map(x => `Class ${x.class_name} · ${x.section_name}`)
      )),
      topicsTaught: logs.length,
      responses: feedback.length,
      understandingRate: pct(fully, feedback.length),
      doubtRate: pct(difficult, feedback.length),
    };
  });

  const byDate = new Map<string, any[]>();
  raw.feedback.forEach(row => {
    const date = String(row.submitted_at ?? "").split("T")[0];
    if (!date) return;
    byDate.set(date, [...(byDate.get(date) ?? []), row]);
  });

  const trends: SchoolAcademicTrendPoint[] = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, rows]) => {
      const fully = rows.filter(x => x.understanding_level === COMPLETE).length;
      const difficult = rows.filter(
        x => x.understanding_level === PARTIAL || x.understanding_level === NONE
      ).length;
      return {
        date,
        responses: rows.length,
        understandingRate: pct(fully, rows.length),
        doubtRate: pct(difficult, rows.length),
      };
    });

  const reporting = new Set(
    raw.logs.map(log => {
      const assignment = raw.assignments.find(x => x.id === log.teacher_assignment_uuid);
      return assignment ? `${assignment.class_name}|${assignment.section_name}` : "";
    }).filter(Boolean)
  );

  return {
    schoolUuid: raw.schoolUuid,
    schoolName: raw.schoolName,
    stats: {
      activeTeachers: raw.teachers.filter(x => x.is_active !== false).length,
      totalStudents: raw.students.length,
      classesReporting: reporting.size,
      topicsTaught: raw.logs.length,
      responses: raw.feedback.length,
      completelyUnderstood: complete,
      partiallyUnderstood: partial,
      didntUnderstand: none,
      understandingRate: pct(complete, raw.feedback.length),
      activeDoubts,
      resolvedDoubts,
      doubtResolutionRate: pct(resolvedDoubts, activeDoubts + resolvedDoubts),
    },
    classrooms,
    teachers,
    trends,
  };
}
