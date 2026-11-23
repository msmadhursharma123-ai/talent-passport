import {
  getCanonicalExamPreparationRows,
} from "../../examPreparationIntelligence/canonical/ExamPreparationCanonicalService";
import type { CanonicalExamPreparationRow } from "../../examPreparationIntelligence/canonical/ExamPreparationTypes";
import {
  resolveStudentRaisedDoubts,
} from "../repository/StudentResolveRaisedDoubtRepository";
import type {
  StudentResolveRaisedDoubtGroup,
  StudentResolveRaisedDoubtRange,
  StudentResolveRaisedDoubtResolution,
} from "../types/StudentResolveRaisedDoubtTypes";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function normalize(value: unknown) {
  return clean(value).toLocaleLowerCase().replace(/\s+/g, " ");
}


/**
 * This feature intentionally reads the same canonical Exam Preparation
 * projection used by Student Exam Preparation itself. It does not read the
 * Live table, Loop-2 table, or any alternate overlay to build the popup list.
 */
export async function getStudentRaisedDoubtGroups(
  options: StudentResolveRaisedDoubtRange,
): Promise<StudentResolveRaisedDoubtGroup[]> {
  const rows = await getCanonicalExamPreparationRows({
    scope: "student",
    subjectName: options.subjectName,
    startDate: options.startDate,
    endDateExclusive: options.endDateExclusive,
  });

  const groups: StudentResolveRaisedDoubtGroup[] = [];

  for (const row of rows) {
    if (!row.isUnresolved) continue;

    // One selectable card must map to exactly one current canonical row.
    // The canonical service may legitimately retain multiple historical
    // Loop-2 occurrences with the same visible concept when no current Live
    // identity exists. Grouping those rows would make one student selection
    // resolve multiple physical doubts, violating selected-only semantics.
    groups.push({
      key: clean(row.id),
      subjectName: row.subjectName,
      topicName: row.topicName,
      subtopicName: row.conceptName,
      rows: [row],
      dates: [row.canonicalDate],
    });
  }

  return Array.from(groups.values()).sort(
    (a, b) =>
      a.subjectName.localeCompare(b.subjectName) ||
      a.topicName.localeCompare(b.topicName) ||
      a.subtopicName.localeCompare(b.subtopicName),
  );
}

/**
 * Only selected canonical groups are resolved. Every current canonical row
 * represented by a selected group is passed through the same atomic backend
 * operation, so a grouped subtopic cannot leave an older duplicate unresolved.
 */
export async function resolveStudentRaisedDoubtGroups(
  groups: StudentResolveRaisedDoubtGroup[],
) {
  const rows: StudentResolveRaisedDoubtResolution[] = [];

  for (const group of groups) {
    for (const row of group.rows) {
      rows.push({
        canonicalRowId: clean(row.id),
        // Never infer Loop-2 provenance from `source`. A canonical row can be
        // represented as `source: "live"` while still carrying a real
        // pending_teacher_doubts row underneath it. V2 forwards both exact
        // source identities preserved by the canonical layer.
        pendingDoubtId: clean(row.pendingDoubtId) || null,
        liveRowId: clean(row.liveRowId) || null,
        studentUuid: clean(row.studentUuid),
        teacherAssignmentUuid: clean(row.teacherAssignmentUuid),
        subjectName: clean(row.subjectName),
        topicName: clean(row.topicName),
        subtopicName: clean(row.conceptName),
        canonicalDate: clean(row.canonicalDate),
      });
    }
  }

  return resolveStudentRaisedDoubts(rows);
}
