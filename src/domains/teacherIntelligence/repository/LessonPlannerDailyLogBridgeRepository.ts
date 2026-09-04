import { getSupabaseClient } from "../../../supabaseClient";

const TABLE_NAME = "academic_planner_documents";

type LessonPlannerBlock = {
  type?: string;
  value?: string | null;
};

export interface LessonPlannerDailyLogReference {
  plannerId: string;
  topicName: string;
  conceptsCovered: string[];
  startDate: string;
  endDate: string;
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function splitCommaSeparatedSubtopics(value: unknown): string[] {
  return normalizeText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Extract the lesson-planner entries belonging to one India business date.
 *
 * The current Lesson Planner stores the week as ordered blocks. A `date`
 * block starts the day's group; subsequent topic/subtopics blocks belong to
 * that date until the next `date` block. The helper also supports older/simple
 * records that contain no date blocks by treating the full block list as the
 * planner day's content when the selected date falls inside the planner range.
 */
export function extractLessonPlannerDailyLogReference(
  payload: unknown,
  businessDate: string
): Omit<LessonPlannerDailyLogReference, "plannerId" | "startDate" | "endDate"> | null {
  const blocks =
    payload && typeof payload === "object" && Array.isArray((payload as { blocks?: unknown }).blocks)
      ? ((payload as { blocks: LessonPlannerBlock[] }).blocks ?? [])
      : [];

  if (!blocks.length || !businessDate) return null;

  const datedGroups: Array<{ date: string; blocks: LessonPlannerBlock[] }> = [];
  let currentDate = "";
  let currentBlocks: LessonPlannerBlock[] = [];

  for (const block of blocks) {
    const type = normalizeText(block?.type).toLowerCase();

    if (type === "date") {
      if (currentDate) {
        datedGroups.push({ date: currentDate, blocks: currentBlocks });
      }
      currentDate = normalizeText(block?.value);
      currentBlocks = [];
      continue;
    }

    if (currentDate) {
      currentBlocks.push(block);
    }
  }

  if (currentDate) {
    datedGroups.push({ date: currentDate, blocks: currentBlocks });
  }

  const targetGroup = datedGroups.find((group) => group.date === businessDate);
  const selectedBlocks = targetGroup?.blocks;

  // Preferred path: the planner contains explicit date blocks.
  if (selectedBlocks) {
    return buildReferenceFromBlocks(selectedBlocks);
  }

  // The Daily Log automation must be date-specific. A planner without an
  // explicit date block cannot prove which topic/subtopics belong to the
  // requested business date, so it is intentionally not auto-filled.
  return null;
}

function buildReferenceFromBlocks(blocks: LessonPlannerBlock[]) {
  const topics: string[] = [];
  const subtopics: string[] = [];

  for (const block of blocks) {
    const type = normalizeText(block?.type).toLowerCase();
    const value = normalizeText(block?.value);

    if (!value) continue;

    if (type === "topic") {
      if (!topics.includes(value)) topics.push(value);
    }

    if (type === "subtopics") {
      for (const item of splitCommaSeparatedSubtopics(value)) {
        if (!subtopics.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
          subtopics.push(item);
        }
      }
    }
  }

  if (!topics.length && !subtopics.length) return null;

  return {
    // The Daily Log has one topic field. When a teacher placed more than one
    // topic block on the same day, preserve all entries without silently
    // discarding any of the planner information.
    topicName: topics.join(" · "),
    conceptsCovered: subtopics,
  };
}

export async function getLessonPlannerDailyLogReference(input: {
  teacherUuid: string;
  className: string;
  sectionName: string;
  subjectName: string;
  businessDate: string;
}): Promise<LessonPlannerDailyLogReference | null> {
  const teacherUuid = normalizeText(input.teacherUuid);
  const className = normalizeText(input.className);
  const sectionName = normalizeText(input.sectionName);
  const subjectName = normalizeText(input.subjectName);
  const businessDate = normalizeText(input.businessDate);

  if (!teacherUuid || !className || !sectionName || !subjectName || !businessDate) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id,start_date,end_date,payload,created_at,updated_at")
    .eq("teacher_uuid", teacherUuid)
    .eq("planner_type", "lesson")
    .eq("class_name", className)
    .eq("section_name", sectionName)
    .eq("subject_name", subjectName)
    .in("status", ["SUBMITTED", "APPROVED"])
    .lte("start_date", businessDate)
    .gte("end_date", businessDate)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  for (const row of data ?? []) {
    const extracted = extractLessonPlannerDailyLogReference(row?.payload, businessDate);
    if (!extracted) continue;

    return {
      plannerId: String(row.id ?? ""),
      topicName: extracted.topicName,
      conceptsCovered: extracted.conceptsCovered,
      startDate: String(row.start_date ?? ""),
      endDate: String(row.end_date ?? ""),
    };
  }

  return null;
}
