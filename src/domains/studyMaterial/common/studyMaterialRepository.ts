import { getSupabaseClient } from "../../../supabaseClient";
import {
  isAllowedStudyMaterialFile,
  sanitizeStudyMaterialFileName,
  STUDY_MATERIAL_MAX_FILE_SIZE_BYTES,
  type StudyMaterialType,
} from "./studyMaterialConstants";
import type { StudyMaterialChapter, StudyMaterialFile } from "./studyMaterialTypes";

const CHAPTERS_TABLE = "tp_study_material_chapters";
const FILES_TABLE = "tp_study_material_files";
const BUCKET = "tp-study-material";

function client() {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase as any;
}

function mimeTypeForFile(file: File): string {
  if (file.type) return file.type;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

function mapFile(row: any): StudyMaterialFile {
  return {
    id: String(row.id),
    chapterId: String(row.chapter_id),
    materialType: row.material_type as StudyMaterialType,
    fileName: String(row.file_name ?? "document"),
    storagePath: String(row.storage_path ?? ""),
    mimeType: String(row.mime_type ?? "application/octet-stream"),
    fileSize: Number(row.file_size ?? 0),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? row.created_at ?? ""),
  };
}

function mapChapter(row: any, files: StudyMaterialFile[] = []): StudyMaterialChapter {
  return {
    id: String(row.id),
    className: String(row.class_name ?? ""),
    subjectName: String(row.subject_name ?? ""),
    chapterName: String(row.chapter_name ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? row.created_at ?? ""),
    files,
  };
}

export async function getStudyMaterialChapters(): Promise<StudyMaterialChapter[]> {
  const supabase = client();

  const [{ data: chapters, error: chapterError }, { data: files, error: fileError }] = await Promise.all([
    supabase.from(CHAPTERS_TABLE).select("id,class_name,subject_name,chapter_name,created_at,updated_at").order("class_name", { ascending: true }).order("subject_name", { ascending: true }).order("chapter_name", { ascending: true }),
    supabase.from(FILES_TABLE).select("id,chapter_id,material_type,file_name,storage_path,mime_type,file_size,sort_order,created_at,updated_at").order("sort_order", { ascending: true }).order("file_name", { ascending: true }),
  ]);

  if (chapterError) throw chapterError;
  if (fileError) throw fileError;

  const grouped = new Map<string, StudyMaterialFile[]>();
  for (const row of files ?? []) {
    const mapped = mapFile(row);
    const list = grouped.get(mapped.chapterId) ?? [];
    list.push(mapped);
    grouped.set(mapped.chapterId, list);
  }

  return (chapters ?? []).map((row: any) => mapChapter(row, grouped.get(String(row.id)) ?? []));
}

export async function getStudyMaterialChaptersForTeacher(
  className: string,
  subjectName: string,
): Promise<StudyMaterialChapter[]> {
  const supabase = client();
  const normalizedClass = className.trim();
  const normalizedSubject = subjectName.trim();

  if (!normalizedClass || !normalizedSubject) return [];

  // Teacher chapter discovery is deliberately scoped at the database query
  // level. This prevents records from another class/subject from ever
  // reaching the chapter dropdown. A chapter is considered available to a
  // teacher only when it has at least one attached study-material file.
  const { data: chapters, error: chapterError } = await supabase
    .from(CHAPTERS_TABLE)
    .select("id,class_name,subject_name,chapter_name,created_at,updated_at")
    .eq("class_name", normalizedClass)
    .eq("subject_name", normalizedSubject)
    .order("chapter_name", { ascending: true });

  if (chapterError) throw chapterError;
  if (!chapters?.length) return [];

  const chapterIds = chapters.map((row: any) => String(row.id));
  const { data: files, error: fileError } = await supabase
    .from(FILES_TABLE)
    .select("id,chapter_id,material_type,file_name,storage_path,mime_type,file_size,sort_order,created_at,updated_at")
    .in("chapter_id", chapterIds)
    .order("sort_order", { ascending: true })
    .order("file_name", { ascending: true });

  if (fileError) throw fileError;

  const grouped = new Map<string, StudyMaterialFile[]>();
  for (const row of files ?? []) {
    const mapped = mapFile(row);
    const list = grouped.get(mapped.chapterId) ?? [];
    list.push(mapped);
    grouped.set(mapped.chapterId, list);
  }

  return (chapters ?? [])
    .map((row: any) => mapChapter(row, grouped.get(String(row.id)) ?? []))
    .filter((chapter) => chapter.files.length > 0);
}

export async function upsertStudyMaterialChapter(input: {
  id?: string;
  className: string;
  subjectName: string;
  chapterName: string;
}): Promise<StudyMaterialChapter> {
  const supabase = client();
  const payload = {
    class_name: input.className.trim(),
    subject_name: input.subjectName.trim(),
    chapter_name: input.chapterName.trim(),
    updated_at: new Date().toISOString(),
  };

  if (!payload.class_name || !payload.subject_name || !payload.chapter_name) {
    throw new Error("Class, subject and chapter name are required.");
  }

  const chapterSelect = "id,class_name,subject_name,chapter_name,created_at,updated_at";

  if (input.id) {
    const { data, error } = await supabase
      .from(CHAPTERS_TABLE)
      .update(payload)
      .eq("id", input.id)
      .select(chapterSelect)
      .single();

    if (error) {
      // The database deliberately enforces one chapter per class + subject +
      // chapter name (case-insensitive). Keep that protection intact and
      // surface a useful message instead of exposing the raw constraint name.
      if (error.code === "23505") {
        throw new Error("A chapter with this name already exists for the selected class and subject. Open that record with Edit to add or update its files.");
      }
      throw error;
    }
    return mapChapter(data);
  }

  /*
    ADD FLOW SAFETY
    ---------------
    The editor can legitimately be opened as a fresh "Add Study Material"
    dialog even when the selected class + subject + chapter already exists.
    Previously this path always attempted a second INSERT, which correctly
    hit the database's unique index `tp_study_material_chapters_unique_idx`.

    Reuse the existing chapter before inserting. This lets an admin add, for
    example, Q&A to an existing chapter without creating a duplicate chapter.
    The database constraint remains the final race-condition guard below.
  */
  const { data: candidates, error: lookupError } = await supabase
    .from(CHAPTERS_TABLE)
    .select(chapterSelect)
    .eq("class_name", payload.class_name)
    .eq("subject_name", payload.subject_name)
    .limit(1000);

  if (lookupError) throw lookupError;

  const normalizedChapterName = payload.chapter_name.trim().toLocaleLowerCase();
  const existing = (candidates ?? []).find(
    (row: any) => String(row.chapter_name ?? "").trim().toLocaleLowerCase() === normalizedChapterName,
  );

  if (existing) return mapChapter(existing);

  const { data, error } = await supabase
    .from(CHAPTERS_TABLE)
    .insert(payload)
    .select(chapterSelect)
    .single();

  if (!error) return mapChapter(data);

  /*
    Two admin sessions can pass the lookup simultaneously. If another session
    creates the same chapter between our lookup and INSERT, the unique index
    returns PostgreSQL 23505 / HTTP 409. Resolve that race by fetching the
    chapter that now exists and continue with the file upload.
  */
  if (error.code === "23505") {
    const { data: racedCandidates, error: raceLookupError } = await supabase
      .from(CHAPTERS_TABLE)
      .select(chapterSelect)
      .eq("class_name", payload.class_name)
      .eq("subject_name", payload.subject_name)
      .limit(1000);

    if (!raceLookupError) {
      const raced = (racedCandidates ?? []).find(
        (row: any) => String(row.chapter_name ?? "").trim().toLocaleLowerCase() === normalizedChapterName,
      );
      if (raced) return mapChapter(raced);
    }
  }

  throw error;
}

export async function uploadStudyMaterialFiles(
  chapterId: string,
  materialType: StudyMaterialType,
  files: File[],
): Promise<StudyMaterialFile[]> {
  const supabase = client();
  if (!files.length) return [];

  const results: StudyMaterialFile[] = [];
  const uploadedPaths: string[] = [];

  try {
    for (const file of files) {
      if (!isAllowedStudyMaterialFile(file)) {
        throw new Error(`${file.name}: only PDF, DOC and DOCX files are allowed.`);
      }
      if (file.size > STUDY_MATERIAL_MAX_FILE_SIZE_BYTES) {
        throw new Error(`${file.name}: file size must be 50 MB or less.`);
      }

      const id = crypto.randomUUID();
      const storagePath = `${chapterId}/${materialType}/${id}-${sanitizeStudyMaterialFileName(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: mimeTypeForFile(file),
        });

      if (uploadError) throw uploadError;
      uploadedPaths.push(storagePath);

      const { data, error } = await supabase
        .from(FILES_TABLE)
        .insert({
          id,
          chapter_id: chapterId,
          material_type: materialType,
          file_name: file.name,
          storage_path: storagePath,
          mime_type: mimeTypeForFile(file),
          file_size: file.size,
          sort_order: 0,
        })
        .select("id,chapter_id,material_type,file_name,storage_path,mime_type,file_size,sort_order,created_at,updated_at")
        .single();

      if (error) throw error;
      results.push(mapFile(data));
    }

    return results;
  } catch (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from(BUCKET).remove(uploadedPaths);
    }
    throw error;
  }
}

export async function deleteStudyMaterialFiles(fileIds: string[]): Promise<void> {
  const supabase = client();
  if (!fileIds.length) return;

  const { data, error } = await supabase
    .from(FILES_TABLE)
    .select("id,storage_path")
    .in("id", fileIds);
  if (error) throw error;

  const paths = (data ?? []).map((row: any) => String(row.storage_path)).filter(Boolean);
  if (paths.length) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove(paths);
    if (storageError) throw storageError;
  }

  const { error: deleteError } = await supabase.from(FILES_TABLE).delete().in("id", fileIds);
  if (deleteError) throw deleteError;
}

export async function deleteStudyMaterialChapter(chapterId: string): Promise<void> {
  const supabase = client();

  const { data, error } = await supabase
    .from(FILES_TABLE)
    .select("id,storage_path")
    .eq("chapter_id", chapterId);
  if (error) throw error;

  const paths = (data ?? []).map((row: any) => String(row.storage_path)).filter(Boolean);
  if (paths.length) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove(paths);
    if (storageError) throw storageError;
  }

  const { error: deleteError } = await supabase.from(CHAPTERS_TABLE).delete().eq("id", chapterId);
  if (deleteError) throw deleteError;
}

export async function createStudyMaterialSignedUrl(storagePath: string): Promise<string> {
  const supabase = client();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error("Unable to create a secure file URL.");
  return data.signedUrl;
}

export async function downloadStudyMaterialFile(file: StudyMaterialFile): Promise<void> {
  const url = await createStudyMaterialSignedUrl(file.storagePath);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to download ${file.fileName}.`);

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = file.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

export async function viewStudyMaterialFile(file: StudyMaterialFile): Promise<void> {
  // Open the tab synchronously so browser popup protection does not block the
  // viewer while the secure signed URL is being generated asynchronously.
  const viewer = window.open("about:blank", "_blank", "noopener,noreferrer");
  try {
    const url = await createStudyMaterialSignedUrl(file.storagePath);
    if (viewer) {
      viewer.location.href = url;
    } else {
      window.location.href = url;
    }
  } catch (error) {
    if (viewer) viewer.close();
    throw error;
  }
}
