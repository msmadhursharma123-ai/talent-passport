import { getSupabaseClient } from "../supabaseClient";
import { requireIdentity } from "../services/identityService";

export interface StudyBuddyHistoryPaper {
  id: string;
  studentUuid: string;
  schoolUuid: string;
  className: string;
  sectionName: string;
  subjectName: string;
  generatedAt: string;
  title: string;
  unresolvedDoubts: string[];
  questions: any[];
  sourceWorksheetIds: string[];
  sourceAttachmentIds: string[];
  questionCount: number;
  metadata: Record<string, unknown>;
}

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function mapPaper(row: any): StudyBuddyHistoryPaper {
  return {
    id: String(row.id),
    studentUuid: String(row.student_uuid ?? ""),
    schoolUuid: String(row.school_uuid ?? ""),
    className: String(row.class_name ?? ""),
    sectionName: String(row.section_name ?? ""),
    subjectName: String(row.subject_name ?? ""),
    generatedAt: String(row.generated_at ?? ""),
    title: String(row.title ?? "Study Buddy Paper"),
    unresolvedDoubts: Array.isArray(row.unresolved_doubts) ? row.unresolved_doubts.map(String) : [],
    questions: Array.isArray(row.questions) ? row.questions : [],
    sourceWorksheetIds: Array.isArray(row.source_worksheet_ids) ? row.source_worksheet_ids.map(String) : [],
    sourceAttachmentIds: Array.isArray(row.source_attachment_ids) ? row.source_attachment_ids.map(String) : [],
    questionCount: Number(row.question_count ?? (Array.isArray(row.questions) ? row.questions.length : 0)),
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
  };
}




type WorksheetCacheEntry = {
  value: Awaited<ReturnType<typeof fetchStudyBuddySourceWorksheets>>;
  expiresAt: number;
};

const WORKSHEET_CACHE_TTL_MS = 30_000;
const worksheetCache = new Map<string, WorksheetCacheEntry>();
const worksheetInFlight = new Map<string, Promise<Awaited<ReturnType<typeof fetchStudyBuddySourceWorksheets>>>>();

function worksheetCacheKey(input: { subjectName: string; startDate?: string; endDate?: string }) {
  return [
    input.subjectName.trim().toLowerCase(),
    input.startDate || "",
    input.endDate || "",
  ].join("|");
}

async function fetchStudyBuddySourceWorksheets(input: {
  subjectName: string;
  startDate?: string;
  endDate?: string;
}) {
  const identity = requireIdentity();
  if (!identity.studentUuid) return [];
  if (!input.subjectName.trim()) return [];

  const { data, error } = await client().rpc("get_study_buddy_source_worksheets", {
    p_subject_name: input.subjectName.trim(),
    p_start_date: input.startDate || null,
    p_end_date: input.endDate || null,
  });
  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: String(row.id),
    schoolUuid: String(row.school_uuid ?? ""),
    teacherUuid: String(row.teacher_uuid ?? ""),
    teacherName: String(row.teacher_name ?? "Teacher"),
    className: String(row.class_name ?? ""),
    sectionName: String(row.section_name ?? ""),
    subjectName: String(row.subject_name ?? ""),
    worksheetDate: String(row.worksheet_date ?? ""),
    title: String(row.title ?? "Worksheet"),
    chapterName: String(row.chapter_name ?? "Chapter 1"),
    payload: (row.payload ?? {}) as Record<string, unknown>,
    sourcePlannerId: String(row.source_planner_id ?? ""),
    publishedAt: String(row.published_at ?? ""),
  }));
}


export async function getStudyBuddySourceWorksheets(input: {
  subjectName: string;
  startDate?: string;
  endDate?: string;
}) {
  const key = worksheetCacheKey(input);
  const now = Date.now();
  const cached = worksheetCache.get(key);
  if (cached && cached.expiresAt > now) return cached.value;

  const existing = worksheetInFlight.get(key);
  if (existing) return existing;

  const request = fetchStudyBuddySourceWorksheets(input)
    .then(value => {
      worksheetCache.set(key, { value, expiresAt: Date.now() + WORKSHEET_CACHE_TTL_MS });
      return value;
    })
    .finally(() => {
      worksheetInFlight.delete(key);
    });

  worksheetInFlight.set(key, request);
  return request;
}

export function invalidateStudyBuddyWorksheetCache() {
  worksheetCache.clear();
}

export async function saveStudyBuddyPaper(input: {
  subjectName: string;
  title: string;
  unresolvedDoubts: string[];
  questions: any[];
  sourceWorksheetIds: string[];
  sourceAttachmentIds: string[];
  metadata?: Record<string, unknown>;
}): Promise<StudyBuddyHistoryPaper> {
  const identity = requireIdentity();
  if (!identity.studentUuid) throw new Error("Student identity is unavailable.");
  if (!input.subjectName.trim()) throw new Error("Subject is required.");
  if (!input.questions.length) throw new Error("No matching questions were found.");

  const { data, error } = await client().rpc("create_study_buddy_paper", {
    p_subject_name: input.subjectName.trim(),
    p_title: input.title.trim() || "Study Buddy Paper",
    p_unresolved_doubts: input.unresolvedDoubts,
    p_questions: input.questions,
    p_source_worksheet_ids: input.sourceWorksheetIds,
    p_source_attachment_ids: input.sourceAttachmentIds,
    p_metadata: input.metadata ?? {},
  });

  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Study Buddy paper could not be saved.");
  return mapPaper(row);
}

export async function getStudyBuddyHistory(subjectName?: string): Promise<StudyBuddyHistoryPaper[]> {
  const identity = requireIdentity();
  if (!identity.studentUuid) return [];

  const { data, error } = await client().rpc("get_study_buddy_history", {
    p_subject_name: subjectName?.trim() || null,
  });
  if (error) throw error;
  return (data ?? []).map(mapPaper);
}

export async function uploadStudyBuddyAttachments(files: File[]) {
  const identity = requireIdentity();
  if (!identity.studentUuid) throw new Error("Student identity is unavailable.");

  const supabase = client();

  // Each attachment is independent. A single bad upload must never discard
  // successfully archived files from the same Add Files action.
  const uploadOne = async (file: File) => {
    const id = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(-140) || "attachment";
    const storagePath = `${identity.studentUuid}/${id}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("study-buddy-files").upload(storagePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });
    if (uploadError) throw uploadError;

    const { data, error } = await supabase.from("student_study_buddy_attachments").insert({
      id,
      student_uuid: identity.studentUuid,
      file_name: file.name,
      mime_type: file.type || "application/octet-stream",
      file_size: file.size,
      storage_path: storagePath,
    }).select("id,file_name,mime_type,file_size,storage_path").single();

    if (error) {
      await supabase.storage.from("study-buddy-files").remove([storagePath]);
      throw error;
    }

    return {
      id: String(data.id),
      name: String(data.file_name),
      storagePath: String(data.storage_path),
      size: Number(data.file_size),
      mimeType: String(data.mime_type),
    };
  };

  const results = await Promise.all(files.map(async file => {
    try {
      return await uploadOne(file);
    } catch (error) {
      console.error("STUDY BUDDY ATTACHMENT ARCHIVE FAILED", file.name, error);
      return null;
    }
  }));

  return results.filter((item): item is NonNullable<typeof item> => item !== null);
}
