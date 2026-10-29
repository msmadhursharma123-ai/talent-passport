import { getSupabaseClient } from "../../../supabaseClient";
import { getCurrentTeacher } from "../../../services/identityService";
import { getTeacherAssignmentsByTeacher } from "./TeacherAssignmentRepository";

export interface PendingDoubtLedger {
  classroom: string;
  pendingCount: number;
  previousTopic: string;
  difficultConcept: string;
  students: string;
  logDate: string;
  status: string;
}

type PendingDoubtRecord = Record<string, any>;

const PAGE_SIZE = 500;
const STUDENT_LOOKUP_CHUNK_SIZE = 500;

function cleanString(value: unknown): string {
  return String(value ?? "").trim();
}

function studentLabel(row: PendingDoubtRecord, canonicalNames: Map<string, string>): string {
  const uuid = cleanString(row.student_uuid);
  const canonicalName = canonicalNames.get(uuid) ?? "";
  if (canonicalName) return canonicalName;

  const storedName = cleanString(row.student_name);
  if (storedName && !/^glps\d+$/i.test(storedName)) return storedName;
  return "";
}

function timestamp(value: unknown): number {
  const raw = cleanString(value);
  if (!raw) return 0;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Select the most recent Loop-2 cycle that still has at least one confirmed
 * unresolved doubt. A newer cycle containing only RESOLVED/PENDING rows must
 * not hide an earlier cycle that still has unresolved work for the teacher.
 * Newer lectures with no Loop-2 rows are naturally skipped. The ledger is a
 * pending-doubt view, so the newest cycle with actionable NOT DISCUSSED rows
 * wins; older cycles are never combined with it.
 *
 * daily_log_uuid is the cycle identity; the fallback key is only for legacy
 * rows missing that UUID.
 */
function selectRecentLoop2Cycles(rows: PendingDoubtRecord[]): PendingDoubtRecord[] {
  const cycles = new Map<string, { rows: PendingDoubtRecord[]; date: string; latestCreatedAt: number }>();

  for (const row of rows) {
    const dailyLogUuid = cleanString(row.daily_log_uuid);
    const date = cleanString(row.log_date);
    const topic = cleanString(row.previous_topic_name);
    const concept = cleanString(row.previous_difficult_concept);
    const key = dailyLogUuid || `legacy:${date}:${topic}:${concept}`;
    let cycle = cycles.get(key);
    if (!cycle) {
      cycle = { rows: [], date, latestCreatedAt: 0 };
      cycles.set(key, cycle);
    }
    cycle.rows.push(row);
    if (date && (!cycle.date || date > cycle.date)) cycle.date = date;
    cycle.latestCreatedAt = Math.max(cycle.latestCreatedAt, timestamp(row.created_at));
  }

  // The ledger is specifically a view of actionable unresolved Loop-2 doubts.
  // Find the latest executed cycle that contains confirmed NOT DISCUSSED rows.
  // Newer lectures with no Loop-2 rows are absent; newer cycles containing
  // only RESOLVED/PENDING rows are skipped, so the most recent earlier cycle
  // with actual unresolved data is shown. Return exactly one cycle, never merge
  // older cycles into it. Order by actual Loop-2 row creation time first, using
  // the source lecture date only when creation timestamps are unavailable.
  const orderedCycles = Array.from(cycles.values()).sort((a, b) => {
    const aTime = a.latestCreatedAt || timestamp(a.date);
    const bTime = b.latestCreatedAt || timestamp(b.date);
    return bTime - aTime || timestamp(b.date) - timestamp(a.date);
  });

  const latestCycleWithUnresolvedData = orderedCycles.find((cycle) =>
    cycle.rows.some((row) => cleanString(row.status).toUpperCase() === "NOT DISCUSSED"),
  );
  if (!latestCycleWithUnresolvedData) return [];

  return latestCycleWithUnresolvedData.rows.filter(
    (row) => cleanString(row.status).toUpperCase() === "NOT DISCUSSED",
  );
}
/**
 * From the selected Loop-2 execution, keep only the most common unresolved
 * doubt. Frequency is based on distinct student UUIDs per normalized concept,
 * not raw duplicate rows. Stable tie-breakers make the result deterministic.
 */
function selectMostCommonLoop2Doubt(rows: PendingDoubtRecord[]): PendingDoubtRecord[] {
  const groups = new Map<string, { rows: PendingDoubtRecord[]; students: Set<string>; latestCreatedAt: number; label: string }>();
  for (const row of rows) {
    const label = cleanString(row.previous_difficult_concept) || cleanString(row.previous_topic_name);
    if (!label || label === "-") continue;
    const key = label.toLocaleLowerCase();
    let group = groups.get(key);
    if (!group) {
      group = { rows: [], students: new Set<string>(), latestCreatedAt: 0, label };
      groups.set(key, group);
    }
    group.rows.push(row);
    const studentUuid = cleanString(row.student_uuid);
    if (studentUuid) group.students.add(studentUuid);
    group.latestCreatedAt = Math.max(group.latestCreatedAt, timestamp(row.created_at));
    if (label.localeCompare(group.label) < 0) group.label = label;
  }

  const winner = Array.from(groups.entries()).sort((a, b) =>
    b[1].students.size - a[1].students.size ||
    b[1].latestCreatedAt - a[1].latestCreatedAt ||
    a[1].label.localeCompare(b[1].label),
  )[0];
  if (!winner) return [];
  const winningKey = winner[0];
  return rows.filter((row) => {
    const label = cleanString(row.previous_difficult_concept) || cleanString(row.previous_topic_name);
    return label !== "" && label !== "-" && label.toLocaleLowerCase() === winningKey &&
      cleanString(row.status).toUpperCase() === "NOT DISCUSSED";
  });
}

/**
 * The ledger shows the most common confirmed unresolved doubt from the latest
 * Loop-2 execution for each classroom/subject assignment. Explicit NOT DISCUSSED
 * and incorrect Cross Question answers remain unresolved; PENDING and RESOLVED
 * records are excluded. If newer lectures produced no Loop-2 rows, the latest
 * earlier execution represented in the ledger is used as the fallback.
 */
export async function getTeacherPendingDoubtLedger(): Promise<PendingDoubtLedger[]> {
  const teacher = getCurrentTeacher();
  if (!teacher) return [];

  type ClassroomAggregate = {
    classroom: string;
    studentUuids: Set<string>;
    studentLabelsByUuid: Map<string, string>;
    topics: Map<string, string>;
    concepts: Map<string, string>;
    dates: Map<string, string>;
  };

  const byClassroom = new Map<string, ClassroomAggregate>();
  const assignments = await getTeacherAssignmentsByTeacher(teacher.teacherUuid);
  const supabase = getSupabaseClient();

  for (const assignment of assignments) {
    try {
      const allRows: PendingDoubtRecord[] = [];
      let offset = 0;
      let expectedCount: number | null = null;
      let complete = true;

      while (true) {
        const { data: page, error, count } = await (supabase as any)
          .from("pending_teacher_doubts")
          .select(
            "id,student_uuid,student_name,teacher_assignment_uuid,daily_log_uuid,previous_topic_name,previous_difficult_concept,log_date,status,created_at",
            { count: "exact" },
          )
          .eq("teacher_assignment_uuid", assignment.id)
          .order("log_date", { ascending: false })
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (error) {
          console.error("TEACHER PENDING DOUBT LEDGER QUERY FAILED", assignment.id, error);
          complete = false;
          break;
        }
        if (expectedCount === null) {
          if (typeof count !== "number" || !Number.isFinite(count) || count < 0) {
            console.error("TEACHER PENDING DOUBT LEDGER QUERY DID NOT RETURN AN EXACT COUNT");
            complete = false;
            break;
          }
          expectedCount = count;
        }

        const rows = Array.isArray(page) ? page as PendingDoubtRecord[] : [];
        if (rows.length === 0 && offset < expectedCount) {
          console.error("TEACHER PENDING DOUBT LEDGER PAGINATION ENDED EARLY");
          complete = false;
          break;
        }
        allRows.push(...rows);
        offset += rows.length;
        if (offset >= expectedCount) break;
      }

      if (!complete || expectedCount === null || allRows.length !== expectedCount || allRows.length === 0) {
        continue;
      }

      // Select by Loop-2 execution time, then retain only the most common
      // confirmed unresolved doubt from that single execution.
      const latestExecutionRows = selectRecentLoop2Cycles(allRows);
      if (latestExecutionRows.length === 0) continue;
      const data = selectMostCommonLoop2Doubt(latestExecutionRows);
      if (data.length === 0) continue;

      const classroom = `${assignment.className}-${assignment.sectionName} · ${assignment.subjectName}`;
      const studentUuids = Array.from(new Set(
        data.map((row) => cleanString(row.student_uuid)).filter(Boolean),
      ));
      const canonicalNames = new Map<string, string>();
      const schoolUuid = cleanString(assignment.schoolUuid);

      for (let start = 0; start < studentUuids.length; start += STUDENT_LOOKUP_CHUNK_SIZE) {
        let query = (supabase as any)
          .from("students_master")
          .select("student_uuid,student_name")
          .in("student_uuid", studentUuids.slice(start, start + STUDENT_LOOKUP_CHUNK_SIZE));
        if (schoolUuid) query = query.eq("school_uuid", schoolUuid);

        const { data: studentRows, error: nameError } = await query;
        if (nameError) {
          console.warn("TEACHER PENDING DOUBT STUDENT NAME RESOLUTION FAILED — USING STORED LABELS", nameError);
          continue;
        }
        for (const row of studentRows ?? []) {
          const uuid = cleanString(row.student_uuid);
          const name = cleanString(row.student_name);
          if (uuid && name && !canonicalNames.has(uuid)) canonicalNames.set(uuid, name);
        }
      }

      let aggregate = byClassroom.get(classroom);
      if (!aggregate) {
        aggregate = {
          classroom,
          studentUuids: new Set<string>(),
          studentLabelsByUuid: new Map<string, string>(),
          topics: new Map<string, string>(),
          concepts: new Map<string, string>(),
          dates: new Map<string, string>(),
        };
        byClassroom.set(classroom, aggregate);
      }

      for (const uuid of studentUuids) aggregate.studentUuids.add(uuid);
      for (const row of data) {
        const uuid = cleanString(row.student_uuid);
        if (uuid && !aggregate.studentLabelsByUuid.has(uuid)) {
          const label = studentLabel(row, canonicalNames);
          if (label) aggregate.studentLabelsByUuid.set(uuid, label);
        }
      }

      const addLabels = (target: Map<string, string>, values: unknown[]) => {
        for (const value of values) {
          const label = cleanString(value);
          if (!label || label === "-") continue;
          const normalized = label.toLocaleLowerCase();
          const current = target.get(normalized);
          if (!current || label.localeCompare(current) < 0) target.set(normalized, label);
        }
      };
      addLabels(aggregate.topics, data.map((row) => row.previous_topic_name));
      addLabels(aggregate.concepts, data.map((row) => row.previous_difficult_concept));
      addLabels(aggregate.dates, data.map((row) => row.log_date));
    } catch (error) {
      console.error("TEACHER PENDING DOUBT ASSIGNMENT LOAD FAILED", assignment.id, error);
    }
  }

  return Array.from(byClassroom.values()).map((aggregate) => ({
    classroom: aggregate.classroom,
    pendingCount: aggregate.studentUuids.size,
    previousTopic: Array.from(aggregate.topics.values()).sort((a, b) => a.localeCompare(b)).join(" / ") || "-",
    difficultConcept: Array.from(aggregate.concepts.values()).sort((a, b) => a.localeCompare(b)).join(" / ") || "-",
    students: Array.from(aggregate.studentLabelsByUuid.values()).sort((a, b) => a.localeCompare(b)).join(", "),
    logDate: Array.from(aggregate.dates.values()).sort((a, b) => a.localeCompare(b)).join(" / ") || "-",
    status: "Needs Revision",
  }));
}
