import { getSupabaseClient } from "../../../supabaseClient";
import type { LiveDoubtRow } from "../../liveDoubtIntelligence/repository/LiveDoubtReconciliationRepository";

const PAGE_SIZE = 500;
const ASSIGNMENT_CHUNK_SIZE = 100;

function compareIds(a: unknown, b: unknown) {
  const left = String(a ?? "");
  const right = String(b ?? "");
  return left < right ? -1 : left > right ? 1 : 0;
}

const PENDING_SELECT =
  "id,student_uuid,student_name,teacher_assignment_uuid,daily_log_uuid,status,student_response,school_name,class_name,section_name,subject_name,previous_topic_name,previous_difficult_concept,log_date,doubt_resolved,revision_checked_at,created_at";

const LIVE_SELECT =
  "id,student_uuid,school_uuid,student_name,teacher_uuid,teacher_assignment_uuid,daily_log_uuid,source_feedback_id,latest_source_feedback_id,class_name,section_name,subject_name,topic_name,doubt_concept,normalized_concept,original_understanding_level,source_submitted_at,latest_source_submitted_at,first_seen_at,last_seen_at,is_unresolved,resolved_at,resolved_by,last_reconciled_at,updated_at,created_at,academic_year_id";

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function chunks<T>(values: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

async function readPendingPages(assignmentIds: string[]) {
  const rows: any[] = [];

  for (const assignmentChunk of chunks(assignmentIds, ASSIGNMENT_CHUNK_SIZE)) {
    let afterId: string | undefined;

    while (true) {
      let query = client()
        .from("pending_teacher_doubts")
        .select(PENDING_SELECT)
        .eq("status", "NOT DISCUSSED")
        .in("teacher_assignment_uuid", assignmentChunk);

      if (afterId) query = query.gt("id", afterId);

      query = query
        .order("id", { ascending: true })
        .limit(PAGE_SIZE);

      const { data, error } = await query;
      if (error) throw error;

      const page = (data ?? []) as any[];
      rows.push(...page);

      if (page.length < PAGE_SIZE) break;

      const lastId = page[page.length - 1]?.id;
      if (!lastId) {
        throw new Error("Exam Preparation pending-doubt pagination could not advance because the page ended without an id.");
      }
      afterId = String(lastId);
    }
  }

  return rows;
}

export async function getScalablePendingDoubtsForAssignments(
  assignmentIds: string[],
) {
  const ids = Array.from(new Set((assignmentIds ?? []).map(String).filter(Boolean)));
  if (ids.length === 0) return [];

  // Do not push the Exam Preparation date filter into this read. Canonical
  // date is selected only after Loop-2 has been reconciled with the complete
  // Live state; a Live-backed row can legitimately use the Live historical
  // date even when its Loop-2 log date differs. Pagination is therefore the
  // scalability boundary while canonical filtering remains exactly unchanged.
  const rows = await readPendingPages(ids);
  return rows.sort((a, b) => compareIds(a?.id, b?.id));
}

export async function getScalableLiveDoubtsForAssignments(
  assignmentIds: string[],
  schoolUuid?: string,
): Promise<LiveDoubtRow[]> {
  const ids = Array.from(new Set((assignmentIds ?? []).map(String).filter(Boolean)));
  if (ids.length === 0) return [];

  const rows: LiveDoubtRow[] = [];

  for (const assignmentChunk of chunks(ids, ASSIGNMENT_CHUNK_SIZE)) {
    let afterId: string | undefined;

    while (true) {
      let query = client()
        .from("student_live_unresolved_doubts")
        .select(LIVE_SELECT)
        .in("teacher_assignment_uuid", assignmentChunk);

      if (schoolUuid) query = query.eq("school_uuid", schoolUuid);
      if (afterId) query = query.gt("id", afterId);

      query = query
        .order("id", { ascending: true })
        .limit(PAGE_SIZE);

      const { data, error } = await query;
      if (error) throw error;

      const page = (data ?? []) as LiveDoubtRow[];
      rows.push(...page);

      if (page.length < PAGE_SIZE) break;

      const lastId = page[page.length - 1]?.id;
      if (!lastId) {
        throw new Error("Exam Preparation Live pagination could not advance because the page ended without an id.");
      }
      afterId = String(lastId);
    }
  }

  return rows.sort((a, b) => compareIds(a?.id, b?.id));
}
