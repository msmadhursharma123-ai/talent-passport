import { useEffect, useMemo, useRef, useState } from "react";
import {
  createStudyMaterialSignedUrl,
  deleteStudyMaterialChapter,
  deleteStudyMaterialFiles,
  downloadStudyMaterialFile,
  getStudyMaterialChapters,
  uploadStudyMaterialFiles,
  upsertStudyMaterialChapter,
} from "../common/studyMaterialRepository";
import {
  STUDY_MATERIAL_CLASSES,
  STUDY_MATERIAL_SUBJECTS,
  getStudyMaterialSubjectsForClass,
  STUDY_MATERIAL_TYPE_LABELS,
  STUDY_MATERIAL_TYPES,
  type StudyMaterialType,
} from "../common/studyMaterialConstants";
import type { StudyMaterialChapter, StudyMaterialFile } from "../common/studyMaterialTypes";
import "./studyMaterialAdmin.css";

type PendingFiles = Record<StudyMaterialType, File[]>;
type ExistingFiles = Record<StudyMaterialType, StudyMaterialFile[]>;

const emptyPending = (): PendingFiles => ({ summary: [], notes: [], qa: [], sample_papers: [] });
const emptyExisting = (): ExistingFiles => ({ summary: [], notes: [], qa: [], sample_papers: [] });

function groupFiles(files: StudyMaterialFile[]): ExistingFiles {
  const result = emptyExisting();
  for (const file of files) {
    if (result[file.materialType]) result[file.materialType].push(file);
  }
  return result;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function typeCount(chapter: StudyMaterialChapter, type: StudyMaterialType) {
  return chapter.files.filter((file) => file.materialType === type).length;
}

export default function StudyMaterialAdminPage() {
  const [chapters, setChapters] = useState<StudyMaterialChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<StudyMaterialChapter | null | "new">(null);
  const [viewer, setViewer] = useState<StudyMaterialChapter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudyMaterialChapter | null>(null);
  const filterSubjects = useMemo(
    () => (classFilter ? getStudyMaterialSubjectsForClass(classFilter) : STUDY_MATERIAL_SUBJECTS),
    [classFilter],
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      setChapters(await getStudyMaterialChapters());
    } catch (e: any) {
      setError(e?.message ?? "Unable to load study material.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return chapters.filter((chapter) => {
      if (classFilter && chapter.className !== classFilter) return false;
      if (subjectFilter && chapter.subjectName !== subjectFilter) return false;
      if (!query) return true;
      return `${chapter.chapterName} ${chapter.subjectName} ${chapter.className}`.toLowerCase().includes(query);
    });
  }, [chapters, classFilter, subjectFilter, search]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    setError("");
    try {
      await deleteStudyMaterialChapter(deleteTarget.id);
      setDeleteTarget(null);
      setNotice("Study material chapter deleted.");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Unable to delete the chapter.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="tp-sm-admin-page">
      <section className="tp-sm-admin-hero">
        <div>
          <div className="tp-sm-eyebrow">LEARNING INTELLIGENCE</div>
          <h1>Study Material Library</h1>
          <p>Build the CBSE-aligned academic library that teachers can access across Class 4–12.</p>
        </div>
        <button className="tp-sm-primary-btn" type="button" onClick={() => { setNotice(""); setError(""); setEditor("new"); }}>
          + Add Study Material
        </button>
      </section>

      <section className="tp-sm-stats">
        <div><span>Chapters</span><strong>{chapters.length}</strong></div>
        <div><span>Files</span><strong>{chapters.reduce((sum, item) => sum + item.files.length, 0)}</strong></div>
        <div><span>Classes Covered</span><strong>{new Set(chapters.map((item) => item.className)).size}</strong></div>
        <div><span>Subjects Covered</span><strong>{new Set(chapters.map((item) => item.subjectName)).size}</strong></div>
      </section>

      {(error || notice) && (
        <div className={error ? "tp-sm-alert tp-sm-alert-error" : "tp-sm-alert tp-sm-alert-success"}>
          {error || notice}
          <button type="button" onClick={() => { setError(""); setNotice(""); }}>×</button>
        </div>
      )}

      <section className="tp-sm-admin-card">
        <div className="tp-sm-toolbar">
          <div>
            <div className="tp-sm-section-label">LIBRARY RECORDS</div>
            <h2>Class & Chapter Material</h2>
            <p>Each row represents one class + subject + chapter. Multiple files can live under every material type.</p>
          </div>
          <div className="tp-sm-filters">
            <select
              value={classFilter}
              onChange={(e) => {
                const value = e.target.value;
                setClassFilter(value);
                if (subjectFilter && value && !getStudyMaterialSubjectsForClass(value).includes(subjectFilter)) {
                  setSubjectFilter("");
                }
              }}
              aria-label="Filter by class"
            >
              <option value="">All Classes</option>
              {STUDY_MATERIAL_CLASSES.map((value) => <option key={value} value={value}>Class {value}</option>)}
            </select>
            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} aria-label="Filter by subject">
              <option value="">All Subjects</option>
              {filterSubjects.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chapter…" aria-label="Search chapter" />
          </div>
        </div>

        <div className="tp-sm-table-scroll">
          <table className="tp-sm-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Chapter Name</th>
                {STUDY_MATERIAL_TYPES.map((type) => <th key={type}>{STUDY_MATERIAL_TYPE_LABELS[type]}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="tp-sm-empty">Loading study material…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="tp-sm-empty">No study material records found.</td></tr>
              ) : filtered.map((chapter, index) => (
                <tr key={chapter.id}>
                  <td>{index + 1}</td>
                  <td><span className="tp-sm-class-pill">Class {chapter.className}</span></td>
                  <td>{chapter.subjectName}</td>
                  <td><strong>{chapter.chapterName}</strong></td>
                  {STUDY_MATERIAL_TYPES.map((type) => (
                    <td key={type} className="tp-sm-status-cell">
                      {typeCount(chapter, type) > 0 ? <span className="tp-sm-check">✓ {typeCount(chapter, type)}</span> : <span className="tp-sm-dash">—</span>}
                    </td>
                  ))}
                  <td>
                    <div className="tp-sm-row-actions">
                      <button type="button" onClick={() => setViewer(chapter)}>View</button>
                      <button type="button" onClick={() => setEditor(chapter)}>Edit</button>
                      <button type="button" className="danger" onClick={() => setDeleteTarget(chapter)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="tp-sm-table-note">On mobile/tablet, swipe horizontally to access all table columns.</div>
      </section>

      {editor !== null && (
        <StudyMaterialEditor
          chapter={editor === "new" ? null : editor}
          saving={saving}
          onClose={() => setEditor(null)}
          onSaved={async (message) => { setEditor(null); setNotice(message); await load(); }}
          onError={setError}
        />
      )}

      {viewer && <StudyMaterialViewer chapter={viewer} onClose={() => setViewer(null)} />}

      {deleteTarget && (
        <div className="tp-sm-modal-backdrop">
          <div className="tp-sm-dialog tp-sm-confirm-dialog">
            <div className="tp-sm-dialog-head"><div><div className="tp-sm-section-label">DELETE RECORD</div><h2>Delete this chapter?</h2></div><button type="button" onClick={() => setDeleteTarget(null)}>×</button></div>
            <p>This removes <strong>{deleteTarget.chapterName}</strong> and all attached Summary, Notes, Q&A and Sample Paper files from the study-material library.</p>
            <div className="tp-sm-dialog-actions"><button type="button" className="tp-sm-secondary-btn" onClick={() => setDeleteTarget(null)}>Cancel</button><button type="button" className="tp-sm-danger-btn" disabled={saving} onClick={() => void confirmDelete()}>{saving ? "Deleting…" : "Delete Record"}</button></div>
          </div>
        </div>
      )}
    </main>
  );
}

function StudyMaterialEditor({
  chapter,
  saving,
  onClose,
  onSaved,
  onError,
}: {
  chapter: StudyMaterialChapter | null;
  saving: boolean;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [className, setClassName] = useState(chapter?.className ?? "");
  const [subjectName, setSubjectName] = useState(chapter?.subjectName ?? "");
  const [chapterName, setChapterName] = useState(chapter?.chapterName ?? "");
  const [pending, setPending] = useState<PendingFiles>(emptyPending());
  const [existing, setExisting] = useState<ExistingFiles>(() => groupFiles(chapter?.files ?? []));
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [activeAddType, setActiveAddType] = useState<StudyMaterialType | null>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const [draggingType, setDraggingType] = useState<StudyMaterialType | null>(null);
  const editorSubjects = getStudyMaterialSubjectsForClass(className);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setActiveAddType(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function addFiles(type: StudyMaterialType, incoming: FileList | File[]) {
    const next = Array.from(incoming);
    const invalid = next.find((file) => !file.name.toLowerCase().match(/\.(pdf|doc|docx)$/));
    if (invalid) {
      setLocalError(`${invalid.name}: only PDF, DOC and DOCX files are allowed.`);
      return;
    }
    const oversized = next.find((file) => file.size > 50 * 1024 * 1024);
    if (oversized) {
      setLocalError(`${oversized.name}: file size must be 50 MB or less.`);
      return;
    }
    setLocalError("");
    setPending((current) => ({ ...current, [type]: [...current[type], ...next] }));
    setActiveAddType(null);
  }

  function removePending(type: StudyMaterialType, index: number) {
    setPending((current) => ({ ...current, [type]: current[type].filter((_, itemIndex) => itemIndex !== index) }));
  }

  function removeExisting(type: StudyMaterialType, file: StudyMaterialFile) {
    setExisting((current) => ({ ...current, [type]: current[type].filter((item) => item.id !== file.id) }));
    setRemovedIds((current) => [...current, file.id]);
  }

  async function save() {
    if (!className || !subjectName || !chapterName.trim()) {
      setLocalError("Choose a class, choose a subject and enter a chapter name.");
      return;
    }

    setBusy(true);
    setLocalError("");
    onError("");
    try {
      const saved = await upsertStudyMaterialChapter({ id: chapter?.id, className, subjectName, chapterName });

      if (removedIds.length) await deleteStudyMaterialFiles(removedIds);
      for (const type of STUDY_MATERIAL_TYPES) {
        if (pending[type].length) await uploadStudyMaterialFiles(saved.id, type, pending[type]);
      }

      await onSaved(chapter ? "Study material updated successfully." : "Study material added successfully.");
    } catch (e: any) {
      const message = e?.message ?? "Unable to save study material.";
      setLocalError(message);
      onError(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tp-sm-modal-backdrop">
      <div className="tp-sm-dialog tp-sm-editor-dialog">
        <div className="tp-sm-dialog-head">
          <div><div className="tp-sm-section-label">{chapter ? "EDIT LIBRARY RECORD" : "ADD TO LIBRARY"}</div><h2>{chapter ? "Update Study Material" : "Add Study Material"}</h2><p>Choose the academic record first, then attach any number of PDFs or DOC/DOCX files.</p></div>
          <button type="button" onClick={onClose}>×</button>
        </div>

        <div className="tp-sm-academic-fields">
          <label><span>Class</span><select value={className} onChange={(e) => { const value = e.target.value; setClassName(value); if (subjectName && !getStudyMaterialSubjectsForClass(value).includes(subjectName)) setSubjectName(""); }}><option value="">Select class</option>{STUDY_MATERIAL_CLASSES.map((value) => <option key={value} value={value}>Class {value}</option>)}</select></label>
          <label><span>Subject</span><select value={subjectName} onChange={(e) => setSubjectName(e.target.value)}><option value="">Select subject</option>{editorSubjects.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label className="chapter-field"><span>Chapter Name</span><input value={chapterName} onChange={(e) => setChapterName(e.target.value)} placeholder="e.g. The French Revolution" /></label>
        </div>

        <div className="tp-sm-add-control" ref={menuRef}>
          <button type="button" className="tp-sm-plus-btn" onClick={() => setActiveAddType((current) => current ? null : "summary")} aria-label="Add material type">+</button>
          <div><strong>Add files</strong><span>Click + to choose a material type, or drag files directly onto any card below.</span></div>
          {activeAddType && (
            <div className="tp-sm-add-menu">
              {STUDY_MATERIAL_TYPES.map((type) => (
                <button key={type} type="button" onClick={() => { setActiveAddType(type); window.setTimeout(() => fileInputs.current[type]?.click(), 0); }}>
                  <span>{type === "summary" ? "▤" : type === "notes" ? "▥" : type === "qa" ? "Q" : "▦"}</span>{STUDY_MATERIAL_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          )}
        </div>

        {localError && <div className="tp-sm-alert tp-sm-alert-error">{localError}</div>}

        <div className="tp-sm-upload-grid">
          {STUDY_MATERIAL_TYPES.map((type) => (
            <MaterialDropZone
              key={type}
              type={type}
              existing={existing[type]}
              pending={pending[type]}
              dragging={draggingType === type}
              onDragState={setDraggingType}
              onFiles={(files) => addFiles(type, files)}
              onRemoveExisting={(file) => removeExisting(type, file)}
              onRemovePending={(index) => removePending(type, index)}
              inputRef={(node) => { fileInputs.current[type] = node; }}
              onChoose={() => fileInputs.current[type]?.click()}
            />
          ))}
        </div>

        <div className="tp-sm-dialog-actions">
          <button type="button" className="tp-sm-secondary-btn" disabled={busy || saving} onClick={onClose}>Cancel</button>
          <button type="button" className="tp-sm-primary-btn" disabled={busy || saving} onClick={() => void save()}>{busy ? "Saving…" : "Save Study Material"}</button>
        </div>
      </div>
    </div>
  );
}

function MaterialDropZone({
  type,
  existing,
  pending,
  dragging,
  onDragState,
  onFiles,
  onRemoveExisting,
  onRemovePending,
  inputRef,
  onChoose,
}: {
  type: StudyMaterialType;
  existing: StudyMaterialFile[];
  pending: File[];
  dragging: boolean;
  onDragState: (type: StudyMaterialType | null) => void;
  onFiles: (files: FileList | File[]) => void;
  onRemoveExisting: (file: StudyMaterialFile) => void;
  onRemovePending: (index: number) => void;
  inputRef: (node: HTMLInputElement | null) => void;
  onChoose: () => void;
}) {
  const total = existing.length + pending.length;
  return (
    <section className={`tp-sm-drop-zone${dragging ? " is-dragging" : ""}`} onDragEnter={(event) => { event.preventDefault(); onDragState(type); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => onDragState(null)} onDrop={(event) => { event.preventDefault(); onDragState(null); onFiles(event.dataTransfer.files); }}>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple hidden onChange={(event) => { if (event.target.files) onFiles(event.target.files); event.target.value = ""; }} />
      <div className="tp-sm-drop-head"><div><span className="tp-sm-drop-icon">{type === "summary" ? "▤" : type === "notes" ? "▥" : type === "qa" ? "Q" : "▦"}</span><div><strong>{STUDY_MATERIAL_TYPE_LABELS[type]}</strong><small>{total} file{total === 1 ? "" : "s"}</small></div></div><button type="button" onClick={onChoose} aria-label={`Add ${STUDY_MATERIAL_TYPE_LABELS[type]}`}>+</button></div>
      <label className="tp-sm-drop-inner">
        <span className="tp-sm-upload-plus">+</span>
        <strong>Drag & drop</strong>
        <span>or click to choose files</span>
        <input type="file" accept=".pdf,.doc,.docx" multiple onChange={(event) => { if (event.target.files) onFiles(event.target.files); event.target.value = ""; }} />
      </label>
      <div className="tp-sm-file-list">
        {existing.map((file) => <div className="tp-sm-file-row" key={file.id}><span className="tp-sm-file-name">{file.fileName}<small>{formatBytes(file.fileSize)}</small></span><button type="button" onClick={() => onRemoveExisting(file)} aria-label={`Remove ${file.fileName}`}>×</button></div>)}
        {pending.map((file, index) => <div className="tp-sm-file-row pending" key={`${file.name}-${index}`}><span className="tp-sm-file-name">{file.name}<small>New · {formatBytes(file.size)}</small></span><button type="button" onClick={() => onRemovePending(index)} aria-label={`Remove ${file.name}`}>×</button></div>)}
      </div>
    </section>
  );
}

function StudyMaterialViewer({ chapter, onClose }: { chapter: StudyMaterialChapter; onClose: () => void }) {
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{ file: StudyMaterialFile; url: string } | null>(null);

  async function view(file: StudyMaterialFile) {
    setBusyId(file.id); setError("");
    try {
      const url = await createStudyMaterialSignedUrl(file.storagePath);
      setPreview({ file, url });
    } catch (e: any) {
      setError(e?.message ?? "Unable to preview file.");
    } finally { setBusyId(""); }
  }
  async function download(file: StudyMaterialFile) {
    setBusyId(file.id); setError("");
    try { await downloadStudyMaterialFile(file); } catch (e: any) { setError(e?.message ?? "Unable to download file."); } finally { setBusyId(""); }
  }

  return (
    <div className="tp-sm-modal-backdrop">
      <div className="tp-sm-dialog tp-sm-viewer-dialog">
        <div className="tp-sm-dialog-head"><div><div className="tp-sm-section-label">LIBRARY PREVIEW</div><h2>{chapter.chapterName}</h2><p>Class {chapter.className} · {chapter.subjectName}</p></div><button type="button" onClick={onClose}>×</button></div>
        {error && <div className="tp-sm-alert tp-sm-alert-error">{error}</div>}
        <div className="tp-sm-viewer-grid">
          {STUDY_MATERIAL_TYPES.map((type) => {
            const files = chapter.files.filter((file) => file.materialType === type);
            return <section className="tp-sm-viewer-section" key={type}><div className="tp-sm-viewer-title"><strong>{STUDY_MATERIAL_TYPE_LABELS[type]}</strong><span>{files.length}</span></div>{files.length === 0 ? <div className="tp-sm-viewer-empty">No files added.</div> : files.map((file) => <div className="tp-sm-viewer-file" key={file.id}><div><strong>{file.fileName}</strong><small>{formatBytes(file.fileSize)}</small></div><div><button type="button" onClick={() => void view(file)} disabled={busyId === file.id}>{busyId === file.id ? "Opening…" : "View"}</button><button type="button" onClick={() => void download(file)} disabled={busyId === file.id}>Download</button></div></div>)}</section>;
          })}
        </div>
      </div>
      {preview && <StudyMaterialDocumentPreview file={preview.file} url={preview.url} onClose={() => setPreview(null)} />}
    </div>
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
    <div className="tp-sm-document-preview-backdrop" role="dialog" aria-modal="true" aria-label={`Preview ${file.fileName}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="tp-sm-document-preview-dialog">
        <header className="tp-sm-document-preview-head">
          <div className="tp-sm-document-preview-title"><span className="tp-sm-document-preview-type">{isPdf ? "PDF" : "DOC"}</span><div><strong>{file.fileName}</strong><small>Study Material · Secure preview</small></div></div>
          <button type="button" onClick={onClose} aria-label="Close document preview">×</button>
        </header>
        <div className="tp-sm-document-preview-body"><iframe title={`Preview of ${file.fileName}`} src={frameUrl} className="tp-sm-document-preview-frame" allow="fullscreen" /></div>
        <footer className="tp-sm-document-preview-foot"><span>Close the preview to return to the Study Material Library.</span><button type="button" onClick={onClose}>Close</button></footer>
      </section>
    </div>
  );
}
