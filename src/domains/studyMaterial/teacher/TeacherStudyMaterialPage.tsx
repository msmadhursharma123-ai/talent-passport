import { useEffect, useState } from "react";
import {
  createStudyMaterialSignedUrl,
  downloadStudyMaterialFile,
  getStudyMaterialChaptersForTeacher,
} from "../common/studyMaterialRepository";
import {
  STUDY_MATERIAL_CLASSES,
  getStudyMaterialSubjectsForClass,
  STUDY_MATERIAL_TYPE_LABELS,
  STUDY_MATERIAL_TYPES,
  type StudyMaterialType,
} from "../common/studyMaterialConstants";
import type { StudyMaterialChapter, StudyMaterialFile } from "../common/studyMaterialTypes";
import "./teacherStudyMaterial.css";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TeacherStudyMaterialPage() {
  const [chapters, setChapters] = useState<StudyMaterialChapter[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [error, setError] = useState("");
  const [className, setClassName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [busyId, setBusyId] = useState("");
  const [preview, setPreview] = useState<{ file: StudyMaterialFile; url: string } | null>(null);

  const availableSubjects = getStudyMaterialSubjectsForClass(className);

  useEffect(() => {
    let cancelled = false;

    async function loadMatchingChapters() {
      if (!className || !subjectName) {
        setChapters([]);
        setChaptersLoading(false);
        return;
      }

      setChaptersLoading(true);
      setError("");
      try {
        const rows = await getStudyMaterialChaptersForTeacher(className, subjectName);
        if (!cancelled) setChapters(rows);
      } catch (e: any) {
        if (!cancelled) {
          setChapters([]);
          setError(e?.message ?? "Unable to load chapters for the selected class and subject.");
        }
      } finally {
        if (!cancelled) setChaptersLoading(false);
      }
    }

    void loadMatchingChapters();
    return () => { cancelled = true; };
  }, [className, subjectName]);

  const matchingChapters = chapters;

  const selectedChapter = matchingChapters.find((chapter) => chapter.id === chapterId) ?? null;

  function changeClass(value: string) {
    setClassName(value);
    setSubjectName("");
    setChapterId("");
    setChapters([]);
  }

  function changeSubject(value: string) {
    setSubjectName(value);
    setChapterId("");
  }

  async function openFile(file: StudyMaterialFile) {
    setBusyId(file.id);
    setError("");
    try {
      const url = await createStudyMaterialSignedUrl(file.storagePath);
      setPreview({ file, url });
    } catch (e: any) {
      setError(e?.message ?? "Unable to preview this file.");
    } finally {
      setBusyId("");
    }
  }

  async function downloadFile(file: StudyMaterialFile) {
    setBusyId(file.id);
    setError("");
    try {
      await downloadStudyMaterialFile(file);
    } catch (e: any) {
      setError(e?.message ?? "Unable to download this file.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <main className="tp-teacher-sm-page">
      <section className="tp-teacher-sm-hero">
        <div>
          <div className="tp-teacher-sm-eyebrow">ACADEMIC WORKSPACE</div>
          <h1>Study Material</h1>
          <p>Access CBSE-aligned chapter resources for any Class 4–12 subject, regardless of your current classroom assignment.</p>
        </div>
        <div className="tp-teacher-sm-hero-badge"><span>●</span> Teacher Library</div>
      </section>

      <section className="tp-teacher-sm-selector-card">
        <div className="tp-teacher-sm-selector-heading">
          <div>
            <div className="tp-teacher-sm-label">SELECT ACADEMIC RECORD</div>
            <h2>Find Study Material</h2>
          </div>
          {selectedChapter && <div className="tp-teacher-sm-selection-pill">Class {selectedChapter.className} · {selectedChapter.subjectName}</div>}
        </div>

        <div className="tp-teacher-sm-select-grid">
          <label><span>1 · Class</span><select value={className} onChange={(e) => changeClass(e.target.value)}><option value="">Choose class</option>{STUDY_MATERIAL_CLASSES.map((value) => <option key={value} value={value}>Class {value}</option>)}</select></label>
          <label><span>2 · Subject</span><select value={subjectName} onChange={(e) => changeSubject(e.target.value)}><option value="">Choose subject</option>{availableSubjects.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="tp-teacher-sm-chapter-select"><span>3 · Chapter</span><select value={chapterId} onChange={(e) => setChapterId(e.target.value)} disabled={!className || !subjectName || chaptersLoading}><option value="">{!className || !subjectName ? "Choose class & subject first" : chaptersLoading ? "Loading chapters…" : matchingChapters.length ? "Choose chapter" : "No chapters added yet"}</option>{matchingChapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.chapterName}</option>)}</select></label>
        </div>

        <div className="tp-teacher-sm-selector-note">
          {!className || !subjectName ? "Select Class and Subject first. The Chapter list will show only chapters with study material for that selection." : chaptersLoading ? "Loading chapters for the selected Class + Subject…" : !matchingChapters.length ? "No study material has been added for this Class + Subject yet." : !selectedChapter ? "Now choose the chapter to load its Summary, Notes, Q&A and Sample Papers." : `Showing resources added by the platform admin for “${selectedChapter.chapterName}”.`}
        </div>
      </section>

      {error && <div className="tp-teacher-sm-error">{error}<button type="button" onClick={() => setError("")}>×</button></div>}

      {!selectedChapter ? (
        <section className="tp-teacher-sm-empty-state">
          <div className="tp-teacher-sm-empty-icon">▤</div>
          <h2>Choose Class, Subject & Chapter</h2>
          <p>The page intentionally stays clear until all three selections are complete. Once selected, the four chapter resource sections will appear here.</p>
        </section>
      ) : (
        <section className="tp-teacher-sm-results">
          <div className="tp-teacher-sm-results-head">
            <div><div className="tp-teacher-sm-label">CHAPTER RESOURCES</div><h2>{selectedChapter.chapterName}</h2><p>Class {selectedChapter.className} · {selectedChapter.subjectName}</p></div>
            <div className="tp-teacher-sm-total">{selectedChapter.files.length} file{selectedChapter.files.length === 1 ? "" : "s"}</div>
          </div>

          <div className="tp-teacher-sm-resource-grid">
            {STUDY_MATERIAL_TYPES.map((type) => (
              <TeacherMaterialSection key={type} type={type} files={selectedChapter.files.filter((file) => file.materialType === type)} busyId={busyId} onView={openFile} onDownload={downloadFile} />
            ))}
          </div>
        </section>
      )}
      {preview && <StudyMaterialDocumentPreview file={preview.file} url={preview.url} onClose={() => setPreview(null)} />}
    </main>
  );
}

function StudyMaterialDocumentPreview({ file, url, onClose }: { file: StudyMaterialFile; url: string; onClose: () => void }) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [onClose]);
  const lower = file.fileName.toLowerCase();
  const isPdf = file.mimeType === "application/pdf" || lower.endsWith(".pdf");
  const frameUrl = isPdf ? url : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  return (
    <div className="tp-teacher-sm-preview-backdrop" role="dialog" aria-modal="true" aria-label={`Preview ${file.fileName}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="tp-teacher-sm-preview-dialog">
        <header className="tp-teacher-sm-preview-head">
          <div className="tp-teacher-sm-preview-title"><span className="tp-teacher-sm-preview-type">{isPdf ? "PDF" : "DOC"}</span><div><strong>{file.fileName}</strong><small>Study Material · Secure preview</small></div></div>
          <button type="button" onClick={onClose} aria-label="Close document preview">×</button>
        </header>
        <div className="tp-teacher-sm-preview-body"><iframe title={`Preview of ${file.fileName}`} src={frameUrl} className="tp-teacher-sm-preview-frame" allow="fullscreen" /></div>
        <footer className="tp-teacher-sm-preview-foot"><span>Close the preview to return to Study Material.</span><button type="button" onClick={onClose}>Close</button></footer>
      </section>
    </div>
  );
}

function TeacherMaterialSection({
  type,
  files,
  busyId,
  onView,
  onDownload,
}: {
  type: StudyMaterialType;
  files: StudyMaterialFile[];
  busyId: string;
  onView: (file: StudyMaterialFile) => Promise<void>;
  onDownload: (file: StudyMaterialFile) => Promise<void>;
}) {
  const icon = type === "summary" ? "▤" : type === "notes" ? "▥" : type === "qa" ? "Q" : "▦";
  return (
    <article className="tp-teacher-sm-resource-card">
      <div className="tp-teacher-sm-resource-head"><div className="tp-teacher-sm-resource-icon">{icon}</div><div><h3>{STUDY_MATERIAL_TYPE_LABELS[type]}</h3><span>{files.length} file{files.length === 1 ? "" : "s"}</span></div></div>
      {files.length === 0 ? (
        <div className="tp-teacher-sm-no-file">No files have been added for this section yet.</div>
      ) : (
        <div className="tp-teacher-sm-file-list">
          {files.map((file) => (
            <div className="tp-teacher-sm-file" key={file.id}>
              <div className="tp-teacher-sm-file-info"><span className="tp-teacher-sm-file-type">{file.fileName.toLowerCase().endsWith(".pdf") ? "PDF" : "DOC"}</span><div><strong>{file.fileName}</strong><small>{formatBytes(file.fileSize)}</small></div></div>
              <div className="tp-teacher-sm-file-actions"><button type="button" disabled={busyId === file.id} onClick={() => void onView(file)}>{busyId === file.id ? "…" : "View"}</button><button type="button" disabled={busyId === file.id} onClick={() => void onDownload(file)}>Download</button><button type="button" disabled className="publish">Publish</button></div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
