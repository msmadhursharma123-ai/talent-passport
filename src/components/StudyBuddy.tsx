import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { type PublishedWorksheet } from "../data/studentStudyMaterialRepository";
import type { StudyBuddyDoubtSignal, StudyBuddyWorksheet } from "../domains/studyBuddy/StudyBuddyMatcher";
import {
  getStudyBuddyHistory,
  getStudyBuddySourceWorksheets,
  saveStudyBuddyPaper,
  uploadStudyBuddyAttachments,
  type StudyBuddyHistoryPaper,
} from "../data/studyBuddyRepository";

const StudyBuddyPaperPreview = lazy(() =>
  import("./StudyBuddyPaperUI").then(module => ({ default: module.StudyBuddyPaperPreview }))
);

const getPaperPrinter = () => import("./StudyBuddyPaperUI");

type TimeFilter = "7D" | "14D" | "30D" | "60D" | "90D" | "CUSTOM";

const SUBJECT_CACHE_KEY = "study-buddy:subjects:v1";
const SUBJECT_CACHE_TTL_MS = 10 * 60 * 1000;
let memorySubjectCache: { values: string[]; expiresAt: number } | null = null;
let subjectRequest: Promise<string[]> | null = null;

function normalizeSubjectList(values: unknown[]) {
  return Array.from(new Set((values ?? [])
    .map(value => String(value ?? "").trim())
    .filter(Boolean)))
    .sort((a, b) => a.localeCompare(b));
}

function readCachedSubjects() {
  const now = Date.now();
  if (memorySubjectCache && memorySubjectCache.expiresAt > now) return memorySubjectCache.values;

  try {
    const raw = sessionStorage.getItem(SUBJECT_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { values?: unknown[]; expiresAt?: number };
    if (!Array.isArray(parsed.values) || Number(parsed.expiresAt ?? 0) <= now) return [];
    const values = normalizeSubjectList(parsed.values);
    memorySubjectCache = { values, expiresAt: Number(parsed.expiresAt) };
    return values;
  } catch {
    return [];
  }
}

function writeCachedSubjects(values: string[]) {
  const expiresAt = Date.now() + SUBJECT_CACHE_TTL_MS;
  memorySubjectCache = { values, expiresAt };
  try {
    sessionStorage.setItem(SUBJECT_CACHE_KEY, JSON.stringify({ values, expiresAt }));
  } catch {
    // Session storage is only an optimization; never let it affect the page.
  }
}

async function fetchSubjects() {
  if (subjectRequest) return subjectRequest;
  subjectRequest = import("../data/studentGrowthPlanRepository")
    .then(({ getStudentSubjects }) => getStudentSubjects())
    .then(values => normalizeSubjectList(values ?? []))
    .finally(() => {
      subjectRequest = null;
    });
  return subjectRequest;
}

const TIME_OPTIONS: Array<{ value: TimeFilter; label: string }> = [
  { value: "7D", label: "Last 1 week" },
  { value: "14D", label: "Last 2 weeks" },
  { value: "30D", label: "Last 30 days" },
  { value: "60D", label: "Last 60 days" },
  { value: "90D", label: "Last 90 days" },
  { value: "CUSTOM", label: "Custom dates" },
];

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function dateKey(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(parsed);
}

function indiaTodayKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function startForFilter(filter: TimeFilter) {
  const days = filter === "7D" ? 6 : filter === "14D" ? 13 : filter === "30D" ? 29 : filter === "60D" ? 59 : filter === "90D" ? 89 : 0;
  if (!days) return "";
  const today = new Date(`${indiaTodayKey()}T00:00:00+05:30`);
  today.setDate(today.getDate() - days);
  return dateKey(today.toISOString());
}

function withinTime(value: string, filter: TimeFilter, customStart: string, customEnd: string) {
  const key = dateKey(value);
  if (!key) return false;
  if (filter === "CUSTOM") {
    if (customStart && key < customStart) return false;
    if (customEnd && key > customEnd) return false;
    return true;
  }
  const start = startForFilter(filter);
  return !start || key >= start;
}

function getChapter(record: PublishedWorksheet) {
  const payload = record.payload as any;
  return String(record.chapterName || payload?.chapter || "Chapter 1").trim() || "Chapter 1";
}

export default function StudyBuddy() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30D");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [worksheets, setWorksheets] = useState<PublishedWorksheet[]>([]);
  const [history, setHistory] = useState<StudyBuddyHistoryPaper[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDoubts, setLoadingDoubts] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [currentPaper, setCurrentPaper] = useState<StudyBuddyHistoryPaper | null>(null);
  const [preview, setPreview] = useState<StudyBuddyHistoryPaper | null>(null);
  const worksheetRequestId = useRef(0);

  useEffect(() => {
    let alive = true;

    // If this student has already visited Study Buddy in the current browser
    // session, render the subject control immediately from a short-lived cache.
    // The canonical source is still refreshed in the background, so this is
    // only a first-paint optimization and never becomes a source of truth.
    const cachedSubjects = readCachedSubjects();
    if (cachedSubjects.length) {
      setSubjects(cachedSubjects);
      setSelectedSubject(current => current || cachedSubjects[0]);
      setLoading(false);
    }

    (async () => {
      try {
        const merged = await fetchSubjects();
        if (!alive) return;

        if (merged.length) {
          writeCachedSubjects(merged);
          setSubjects(merged);
          setSelectedSubject(current => current || merged[0]);
        } else if (!cachedSubjects.length) {
          setError("Unable to load your classroom subjects.");
        }
        setLoading(false);
      } catch (subjectError: any) {
        // Preserve the old fallback only when the canonical subject feed
        // actually fails. It is intentionally lazy so the normal path never
        // downloads the entire worksheet corpus just to populate the dropdown.
        if (!cachedSubjects.length) {
          try {
            const { getStudentPublishedWorksheets } = await import("../data/studentStudyMaterialRepository");
            const worksheetValues = await getStudentPublishedWorksheets();
            if (!alive) return;
            const fallbackSubjects = normalizeSubjectList(worksheetValues.map(row => row.subjectName));
            setSubjects(fallbackSubjects);
            if (fallbackSubjects.length) setSelectedSubject(current => current || fallbackSubjects[0]);
            else setError(subjectError?.message ?? "Unable to load your classroom subjects.");
          } catch (fallbackError: any) {
            if (alive) setError(fallbackError?.message ?? subjectError?.message ?? "Unable to load your classroom subjects.");
          }
        }
        if (alive) setLoading(false);
      }
    })();

    // History is deliberately non-blocking. It can render as an empty
    // state first and fill in when the response arrives.
    getStudyBuddyHistory()
      .then(value => {
        if (alive) setHistory(value);
      })
      .catch(historyError => {
        console.warn("STUDY BUDDY HISTORY LOAD FAILED", historyError);
      })
      .finally(() => {
        if (alive) setLoadingHistory(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;

    let alive = true;
    const requestSubject = selectedSubject;
    setCurrentPaper(null);

    // Date inputs fire on every keystroke/change. Debouncing only the CUSTOM
    // case prevents two RPCs from being fired while the user is still choosing
    // the range, without changing the existing UI or filter semantics.
    const delay = timeFilter === "CUSTOM" ? 180 : 0;
    const timer = window.setTimeout(() => {
      void loadWorksheets(requestSubject).then(() => {
        if (!alive) return;
      });
    }, delay);

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [selectedSubject, timeFilter, customStart, customEnd]);

  async function loadWorksheets(subject = selectedSubject) {
    if (!subject) return;

    const requestId = ++worksheetRequestId.current;
    setLoadingDoubts(true);
    setWorksheets([]);
    try {
      if (timeFilter === "CUSTOM") {
        if (!customStart || !customEnd) {
          if (requestId === worksheetRequestId.current) setWorksheets([]);
          return;
        }
        if (customStart > customEnd) {
          if (requestId === worksheetRequestId.current) {
            setWorksheets([]);
            setError("Custom start date must be on or before the end date.");
          }
          return;
        }
      }
      const startDate = timeFilter === "CUSTOM" ? customStart : startForFilter(timeFilter);
      const endDate = timeFilter === "CUSTOM" ? customEnd : indiaTodayKey();
      const rows = await getStudyBuddySourceWorksheets({ subjectName: subject, startDate, endDate });
      if (requestId !== worksheetRequestId.current) return;
      setWorksheets(rows);
    } catch (e: any) {
      if (requestId !== worksheetRequestId.current) return;
      setWorksheets([]);
      setError(e?.message ?? "Unable to load published worksheets.");
    } finally {
      if (requestId === worksheetRequestId.current) setLoadingDoubts(false);
    }
  }

  // History is intentionally independent of the source worksheet filter.
  // Every paper ever generated for this student remains discoverable here.
  const historyFiltered = useMemo(() => [...history].sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()), [history]);

  function addFiles(next: FileList | null) {
    if (!next) return;
    const incoming = Array.from(next);
    const existingKeys = new Set(files.map(file => `${file.name}:${file.size}:${file.lastModified}`));
    const accepted: File[] = [];
    for (const file of incoming) {
      const key = `${file.name}:${file.size}:${file.lastModified}`;
      if (existingKeys.has(key)) continue;
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} is larger than 10 MB and was not added.`);
        continue;
      }
      accepted.push(file);
      existingKeys.add(key);
    }
    setFiles(current => [...current, ...accepted]);
    setError("");
  }

  function removeFile(index: number) {
    setFiles(current => current.filter((_, i) => i !== index));
  }

  async function generate() {
    if (!selectedSubject) {
      setError("Select a subject first.");
      return;
    }
    if (timeFilter === "CUSTOM" && (!customStart || !customEnd || customStart > customEnd)) {
      setError("Select a valid custom start and end date first.");
      return;
    }
    if (!worksheets.length) {
      setError("No published worksheets are available for this subject and time period.");
      return;
    }

    setGenerating(true);
    setProgress(3);
    setError("");
    setNotice("");
    setStatusText("Reading your current unresolved doubts…");

    try {
      // Heavy generation-only modules are loaded on demand. This keeps PDF.js,
      // Tesseract and the generation intelligence layer out of the initial
      // Study Buddy page bundle while preserving the exact generation flow.
      const [
        { getStudentExamPreparationIntelligenceWithLiveLayer },
        { buildStudyBuddyPaper },
        { extractStudyBuddyFiles },
        { requireIdentity },
      ] = await Promise.all([
        import("../domains/liveDoubtIntelligence/service/LiveStudentExamPreparation"),
        import("../domains/studyBuddy/StudyBuddyMatcher"),
        import("../data/studyBuddyFileExtractor"),
        import("../services/identityService"),
      ]);

      const intelligence = await getStudentExamPreparationIntelligenceWithLiveLayer(selectedSubject, "");
      setProgress(18);
      setStatusText("Taking the latest live unresolved-doubt layer…");
      const breakdown = (intelligence?.subjectBreakdown ?? []).find((item: any) => String(item.subject).trim().toLowerCase() === selectedSubject.trim().toLowerCase());
      const doubts: StudyBuddyDoubtSignal[] = [];
      for (const topic of breakdown?.topics ?? []) doubts.push({ topic: String(topic.topic ?? topic), signals: Number(topic.signals ?? 1) });
      for (const concept of breakdown?.concepts ?? []) doubts.push({ topic: String(concept.concept ?? concept), concept: String(concept.concept ?? concept), signals: Number(concept.signals ?? 1) });

      if (!doubts.length) {
        throw new Error(`There are no unresolved doubts for ${selectedSubject}. Your Study Buddy paper can only target currently unresolved doubts.`);
      }

      let uploadedText = "";
      let extractedResults: Awaited<ReturnType<typeof extractStudyBuddyFiles>> = [];
      let uploadedAttachments: Array<{ id: string; name: string; storagePath: string; size: number; mimeType: string }> = [];
      if (files.length) {
        setStatusText(`Reading ${files.length} attached file${files.length === 1 ? "" : "s"}…`);
        const [extractResult, uploadResult] = await Promise.all([
          extractStudyBuddyFiles(files, (completed, total, fileProgress) => {
            setProgress(20 + Math.round(((completed + fileProgress / 100) / Math.max(1, total)) * 28));
          }),
          uploadStudyBuddyAttachments(files).catch(attachmentError => {
            console.error("STUDY BUDDY ATTACHMENT ARCHIVE FAILED — LOCAL MATCHING CONTINUES", attachmentError);
            return [];
          }),
        ]);
        extractedResults = extractResult;
        uploadedAttachments = uploadResult;
        uploadedText = extractedResults.map(result => result.text).filter(Boolean).join("\n");
      }

      setProgress(50);
      setStatusText("Matching topics and subtopics against published worksheet questions…");
      await new Promise(resolve => window.setTimeout(resolve, 0));
      const worksheetInput: StudyBuddyWorksheet[] = worksheets.map(row => ({
        id: row.id,
        teacherUuid: row.teacherUuid,
        teacherName: row.teacherName,
        subjectName: row.subjectName,
        chapterName: getChapter(row),
        publishedAt: row.publishedAt,
        title: row.title,
        payload: row.payload as any,
      }));
      setProgress(68);
      const attachmentSources = extractedResults
        .filter(result => result.text.trim() || Boolean(result.questionBlocks?.length))
        .map(result => {
          const uploaded = uploadedAttachments.find(item => item.name === result.fileName);
          // Preserve the structured blocks produced by the attachment extractor.
          // This is critical for camera photos: unlike a text-layer PDF, an image needs
          // the OCR line/question boundaries to reach the matcher reliably.
          const sourceContext = [result.fileName, result.questionBlocks?.map(block => block.blockContext).filter(Boolean).slice(0, 12).join(" ")].filter(Boolean).join(" ");
          return {
            id: uploaded?.id ?? `local-${result.fileName}-${result.text.length}`,
            fileName: result.fileName,
            text: result.text,
            questionBlocks: result.questionBlocks,
            sourceContext,
          };
        });
      const result = buildStudyBuddyPaper(worksheetInput, doubts, uploadedText, 24, attachmentSources);
      setProgress(84);
      setStatusText("Selecting the strongest non-duplicate questions and building your paper…");

      if (!result.questions.length) {
        throw new Error("No sufficiently connected worksheet questions were found for the current unresolved doubts. Try a wider time period or add a relevant file.");
      }

      setProgress(90);
      const sourceAttachmentIds = uploadedAttachments.map(item => item.id);
      if (files.length && uploadedAttachments.length < files.length) {
        setNotice("Your paper was generated. One or more attached files could not be archived, but readable files were still used locally.");
      }

      const unresolvedLabels = Array.from(new Set(doubts.map(item => item.topic).filter(Boolean)));
      const title = `Study Buddy · ${selectedSubject} · ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;
      const identity = requireIdentity();
      const schoolName = String((identity as any).schoolName ?? (identity as any).school_name ?? "").trim();
      const saved = await saveStudyBuddyPaper({
        subjectName: selectedSubject,
        title,
        unresolvedDoubts: unresolvedLabels,
        questions: result.questions,
        sourceWorksheetIds: Array.from(new Set(result.questions.map(question => question.studyBuddySource.worksheetId).filter((id): id is string => Boolean(id)))),
        sourceAttachmentIds: Array.from(new Set(result.questions.map(question => question.studyBuddySource.attachmentId).filter((id): id is string => Boolean(id) && uploadedAttachments.some(item => item.id === id)))),
        metadata: {
          timeFilter,
          customStart,
          customEnd,
          worksheetCount: worksheets.length,
          candidateCount: result.totalCandidates,
          matchedDoubts: result.matchedDoubts,
          unmatchedDoubts: result.unmatchedDoubts,
          attachmentStatuses: extractedResults.map(item => ({ name: item.fileName, status: item.status })),
          generationMode: "deterministic-keyword-matching",
          schoolName,
        },
      });

      setProgress(100);
      setStatusText("100% · Your Study Buddy paper is ready.");
      setCurrentPaper(saved);
      setHistory(current => [saved, ...current.filter(item => item.id !== saved.id)]);
      setNotice(result.unmatchedDoubts.length ? `Paper ready. ${result.unmatchedDoubts.length} doubt signal${result.unmatchedDoubts.length === 1 ? " was" : "s were"} not represented by an available question.` : "Paper ready with coverage across the current unresolved doubts.");
    } catch (e: any) {
      setProgress(0);
      setStatusText("");
      setError(e?.message ?? "Unable to create the Study Buddy paper.");
    } finally {
      setGenerating(false);
    }
  }

  return <main className="sb-page"><style>{styles}</style>
    <section className="sb-hero"><div><div className="sb-eyebrow">ACADEMIC GROWTH JOURNEY</div><h1>Study Buddy</h1><p>Create a fresh practice paper from your published classroom worksheets, targeted only to your current unresolved doubts.</p></div><div className="sb-hero-icon">✦</div></section>

    <section className="sb-card">
      <div className="sb-card-head"><div><div className="sb-eyebrow">01 · CHOOSE YOUR TARGET</div><h2>Build a paper for your weak areas</h2><p>Select the subject and worksheet period. Study Buddy reads the latest unresolved-doubt layer for that subject every time you generate.</p></div><span className="sb-live">LIVE DOUBTS</span></div>
      <div className="sb-filter-grid">
        <label className="sb-field"><span>Subject</span><select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={loading}><option value="">Select subject</option>{subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select></label>
        <label className="sb-field"><span>Worksheet period</span><select value={timeFilter} onChange={e => setTimeFilter(e.target.value as TimeFilter)}><option value="7D">Last 1 week</option><option value="14D">Last 2 weeks</option><option value="30D">Last 30 days</option><option value="60D">Last 60 days</option><option value="90D">Last 90 days</option><option value="CUSTOM">Custom dates</option></select></label>
      </div>
      {timeFilter === "CUSTOM" && <div className="sb-custom-grid"><label className="sb-field"><span>From</span><input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} /></label><label className="sb-field"><span>To</span><input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} /></label></div>}
      <div className="sb-source-head"><div><strong>{loadingDoubts ? "Loading worksheets…" : `${worksheets.length} published worksheet${worksheets.length === 1 ? "" : "s"}`}</strong><span> · {selectedSubject || "Select a subject"}</span></div><small>Only worksheets visible in Study Material are used.</small></div>
      <div className="sb-table-scroll"><table className="sb-table"><thead><tr><th>Date</th><th>Chapter</th><th>Teacher</th><th>Worksheet</th></tr></thead><tbody>{loadingDoubts ? <tr><td colSpan={4}><div className="sb-loading-state"><span className="sb-loading-spinner" aria-hidden="true" /><div><span>Worksheets are loading for {selectedSubject || "the selected subject"}.</span><small className="sb-loading-subtext">Please wait while the published worksheets are loaded.</small></div></div></td></tr> : worksheets.length === 0 ? <tr><td colSpan={4} className="sb-empty">No worksheets found for this subject and period.</td></tr> : worksheets.map(row => <tr key={row.id}><td>{fmtDate(row.publishedAt)}</td><td>{getChapter(row)}</td><td>{row.teacherName}</td><td>{row.title}</td></tr>)}</tbody></table></div>
    </section>

    <section className="sb-card">
      <div className="sb-card-head"><div><div className="sb-eyebrow">02 · OPTIONAL SOURCES</div><h2>Add files from your notebook</h2><p>Add PDFs, screenshots or photos. Readable text is used as an additional deterministic matching signal; no generated questions are invented from the file.</p></div><div className="sb-file-count">{files.length} file{files.length === 1 ? "" : "s"}</div></div>
      <label className="sb-drop"><input type="file" multiple accept="application/pdf,image/*,text/plain,text/markdown,text/csv,application/json,.pdf,.jpg,.jpeg,.png,.webp,.txt,.md,.csv,.json" onChange={e => { addFiles(e.target.files); e.currentTarget.value = ""; }} /><span className="sb-plus">＋</span><strong>Add Files</strong><small>PDF · JPG · JPEG · PNG · WEBP · text · up to 10 MB each</small></label>
      {files.length > 0 && <div className="sb-file-list">{files.map((file, index) => <div className="sb-file-row" key={`${file.name}-${file.size}-${file.lastModified}`}><span className="sb-file-type">{file.type.includes("pdf") ? "PDF" : file.type.startsWith("image/") ? "IMG" : "TXT"}</span><div><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></div><button className="sb-remove" onClick={() => removeFile(index)} aria-label={`Remove ${file.name}`}>×</button></div>)}</div>}
    </section>

    <section className="sb-card sb-generate-card">
      <div className="sb-card-head"><div><div className="sb-eyebrow">03 · GENERATE</div><h2>Give me the paper as per my unresolved doubts</h2><p>Each generation starts from the latest unresolved doubts. Questions are selected from the worksheet corpus using exact/normalized keyword and topic matching, with duplicate avoidance and coverage balancing.</p></div></div>
      {generating && <div className="sb-progress-wrap"><div className="sb-progress-top"><strong>{progress}%</strong><span>{statusText}</span></div><div className="sb-progress"><span style={{ width: `${progress}%` }} /></div><div className="sb-progress-steps"><span className={progress >= 18 ? "done" : ""}>Doubts</span><span className={progress >= 50 ? "done" : ""}>Files</span><span className={progress >= 68 ? "done" : ""}>Match</span><span className={progress >= 90 ? "done" : ""}>Build</span><span className={progress >= 100 ? "done" : ""}>Ready</span></div></div>}
      <div className="sb-generate-row"><button className="sb-generate" onClick={() => void generate()} disabled={generating || loading || !selectedSubject || !worksheets.length}>{generating ? `${progress}% · Preparing…` : "✦ Give me my paper"}</button><span>{worksheets.length ? `${worksheets.length} worksheet${worksheets.length === 1 ? "" : "s"} available` : "Choose a subject and period first"}</span></div>
      {error && <div className="sb-error">{error}</div>}
      {notice && <div className="sb-notice">{notice}</div>}
    </section>

    {currentPaper && <section className="sb-card sb-ready"><div className="sb-ready-head"><div><div className="sb-eyebrow">100% COMPLETE</div><h2>Your Study Buddy paper is ready</h2><p>{currentPaper.questionCount} targeted questions · {currentPaper.unresolvedDoubts.length} unresolved doubt signals used</p></div><div className="sb-ready-actions"><button className="sb-btn sb-primary" onClick={() => setPreview(currentPaper)}>Preview</button><button className="sb-btn" onClick={() => { void getPaperPrinter().then(({ printStudyBuddyPaper }) => printStudyBuddyPaper(currentPaper)); }}>Download PDF</button></div></div></section>}

    <section className="sb-card"><div className="sb-card-head"><div><div className="sb-eyebrow">04 · HISTORY</div><h2>Study Buddy paper history</h2><p>Every generated paper stays available so you can revisit your targeted practice during exam preparation.</p></div><span className="sb-file-count">{historyFiltered.length}</span></div>
      <div className="sb-table-scroll"><table className="sb-table sb-history-table"><thead><tr><th>Date</th><th>Unresolved doubts used</th><th>Paper</th><th>Options</th></tr></thead><tbody>{loadingHistory ? <tr><td colSpan={4}><div className="sb-loading-state"><span className="sb-loading-spinner" aria-hidden="true" /><div><span>Study Buddy papers are loading.</span><small className="sb-loading-subtext">Your generated paper history is being loaded.</small></div></div></td></tr> : historyFiltered.length === 0 ? <tr><td colSpan={4} className="sb-empty">No Study Buddy papers found for these filters.</td></tr> : historyFiltered.map(paper => <tr key={paper.id}><td>{fmtDate(paper.generatedAt)}</td><td><div className="sb-doubt-cell">{paper.unresolvedDoubts.slice(0, 4).map(doubt => <span key={doubt}>{doubt}</span>)}{paper.unresolvedDoubts.length > 4 && <span>+{paper.unresolvedDoubts.length - 4} more</span>}</div></td><td><strong>{paper.title}</strong><small>{paper.questionCount} questions</small></td><td><div className="sb-row-actions"><button className="sb-btn sb-secondary" onClick={() => setPreview(paper)}>View</button><button className="sb-btn" onClick={() => { void getPaperPrinter().then(({ printStudyBuddyPaper }) => printStudyBuddyPaper(paper)); }}>Download</button></div></td></tr>)}</tbody></table></div>
    </section>

    {preview && (
      <Suspense fallback={null}>
        <StudyBuddyPaperPreview paper={preview} onClose={() => setPreview(null)} />
      </Suspense>
    )}
  </main>;
}

const styles = `
.sb-page{width:100%;min-width:0;color:#0F172A}.sb-hero,.sb-card{box-sizing:border-box}.sb-hero{position:relative;overflow:hidden;padding:32px 36px;border:1px solid #E2E8F0;border-radius:26px;background:linear-gradient(120deg,#fff 0%,#fff 58%,#FFF9F4 82%,#F4F7FF 100%);box-shadow:0 10px 30px rgba(15,23,42,.045);display:flex;justify-content:space-between;gap:20px}.sb-eyebrow{color:#F97316;font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase}.sb-hero h1{margin:8px 0 0;font-size:36px;line-height:1.12;font-weight:800;letter-spacing:-.7px}.sb-hero p{max-width:780px;margin:12px 0 0;color:#64748B;font-size:14px;line-height:1.6;font-weight:500}.sb-hero-icon{width:74px;height:74px;flex:0 0 74px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#FFF7ED;border:1px solid #FED7AA;color:#F97316;font-size:30px}.sb-card{margin-top:18px;padding:24px;border:1px solid #E2E8F0;border-radius:22px;background:#fff;box-shadow:0 7px 22px rgba(15,23,42,.035)}.sb-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px}.sb-card-head h2{margin:6px 0 0;font-size:21px;line-height:1.2;font-weight:800;letter-spacing:-.3px}.sb-card-head p{margin:8px 0 0;max-width:800px;color:#64748B;font-size:11px;line-height:1.55}.sb-live{padding:7px 9px;border-radius:9px;background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;font-size:8px;font-weight:900;letter-spacing:.7px;white-space:nowrap}.sb-filter-grid,.sb-custom-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}.sb-field{display:flex;flex-direction:column;gap:6px;min-width:0}.sb-field span{font-size:8px;font-weight:800;letter-spacing:.7px;color:#64748B;text-transform:uppercase}.sb-field select,.sb-field input{width:100%;box-sizing:border-box;border:1px solid #CBD5E1;border-radius:10px;background:#fff;color:#0F172A;padding:10px 11px;font-size:11px;outline:none}.sb-field select:focus,.sb-field input:focus{border-color:#F97316;box-shadow:0 0 0 3px rgba(249,115,22,.09)}.sb-source-head{display:flex;justify-content:space-between;gap:12px;margin-top:18px;padding:10px 11px;border:1px solid #E2E8F0;border-radius:10px;background:#F8FAFC;font-size:9px}.sb-source-head strong{font-size:10px}.sb-source-head span{color:#64748B}.sb-source-head small{color:#94A3B8;font-size:8px}.sb-loading-state{display:flex;align-items:center;justify-content:center;gap:8px;padding:18px 12px;text-align:center;color:#64748B;font-size:9px;font-weight:800}.sb-loading-spinner{width:15px;height:15px;flex:0 0 15px;border:2px solid #FED7AA;border-top-color:#F97316;border-radius:50%;box-sizing:border-box;animation:sb-spin .72s linear infinite}.sb-loading-state span{display:inline-block}.sb-loading-subtext{display:block;margin-top:2px;color:#94A3B8;font-size:7.5px;font-weight:600}@keyframes sb-spin{to{transform:rotate(360deg)}}.sb-table-scroll{width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid #E2E8F0;border-radius:13px;margin-top:10px}.sb-table{width:100%;min-width:700px;border-collapse:separate;border-spacing:0;font-size:10px}.sb-table th{padding:10px 11px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;text-align:left;color:#64748B;font-size:8px;text-transform:uppercase;letter-spacing:.6px;white-space:nowrap}.sb-table td{padding:11px;border-bottom:1px solid #F1F5F9;vertical-align:top}.sb-table tr:last-child td{border-bottom:none}.sb-table td small{display:block;margin-top:3px;color:#94A3B8;font-size:8px}.sb-empty{text-align:center!important;color:#94A3B8;padding:22px!important}.sb-drop{margin-top:16px;min-height:125px;border:1.5px dashed #CBD5E1;border-radius:15px;background:#FAFAF9;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;text-align:center;cursor:pointer;transition:.18s}.sb-drop:hover{border-color:#F97316;background:#FFF7ED}.sb-drop input{display:none}.sb-plus{width:35px;height:35px;border-radius:11px;background:#FFF7ED;border:1px solid #FED7AA;color:#F97316;display:flex;align-items:center;justify-content:center;font-size:22px}.sb-drop strong{font-size:12px}.sb-drop small{font-size:8px;color:#94A3B8}.sb-file-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:12px}.sb-file-row{display:flex;align-items:center;gap:9px;padding:9px;border:1px solid #E2E8F0;border-radius:11px;min-width:0}.sb-file-type{font-size:7px;font-weight:900;padding:6px 5px;border-radius:7px;background:#F1F5F9;color:#475569}.sb-file-row>div{min-width:0;flex:1}.sb-file-row strong{display:block;font-size:9px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sb-file-row small{display:block;margin-top:2px;color:#94A3B8;font-size:7px}.sb-remove{border:none;background:#F8FAFC;color:#64748B;width:26px;height:26px;border-radius:8px;cursor:pointer;font-size:17px}.sb-generate-card{background:linear-gradient(135deg,#fff 0%,#FFFDF9 100%)}.sb-progress-wrap{margin-top:18px;padding:13px;border:1px solid #E2E8F0;border-radius:13px;background:#F8FAFC}.sb-progress-top{display:flex;justify-content:space-between;gap:10px;align-items:center;font-size:9px}.sb-progress-top strong{font-size:18px;color:#F97316}.sb-progress-top span{color:#64748B;text-align:right}.sb-progress{height:8px;margin-top:9px;border-radius:99px;background:#E2E8F0;overflow:hidden}.sb-progress span{display:block;height:100%;border-radius:99px;background:#F97316;transition:width .2s ease}.sb-progress-steps{display:flex;justify-content:space-between;margin-top:8px;color:#94A3B8;font-size:7px;font-weight:800;text-transform:uppercase}.sb-progress-steps .done{color:#F97316}.sb-generate-row{display:flex;align-items:center;gap:12px;margin-top:18px}.sb-generate{border:none;border-radius:11px;background:#F97316;color:#fff;padding:12px 17px;font-size:10px;font-weight:900;cursor:pointer;box-shadow:0 6px 16px rgba(249,115,22,.18)}.sb-generate:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}.sb-generate-row span{color:#94A3B8;font-size:8px}.sb-error,.sb-notice{margin-top:11px;padding:9px 10px;border-radius:10px;font-size:8px;font-weight:800}.sb-error{border:1px solid #FECACA;background:#FEF2F2;color:#B91C1C}.sb-notice{border:1px solid #FED7AA;background:#FFF7ED;color:#9A3412}.sb-ready{border-color:#FED7AA;background:linear-gradient(135deg,#FFFDF8 0%,#fff 100%)}.sb-ready-head{display:flex;justify-content:space-between;align-items:center;gap:16px}.sb-ready-actions,.sb-row-actions,.sb-actions{display:flex;gap:7px;flex-wrap:wrap}.sb-btn{border:1px solid #CBD5E1;background:#fff;color:#475569;border-radius:9px;padding:8px 10px;font-size:8px;font-weight:800;cursor:pointer;white-space:nowrap}.sb-btn:hover{border-color:#94A3B8}.sb-btn.sb-primary{border-color:#F97316;background:#F97316;color:#fff}.sb-btn.sb-secondary{background:#F8FAFC}.sb-file-count{font-size:10px;font-weight:900;color:#64748B}.sb-doubt-cell{display:flex;flex-wrap:wrap;gap:4px;max-width:360px}.sb-doubt-cell span{padding:4px 6px;border-radius:7px;background:#FFF7ED;color:#9A3412;font-size:7px;font-weight:800}.sb-modal{position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.58);display:flex;align-items:center;justify-content:center;padding:16px}.sb-modal-card{width:min(1000px,100%);max-height:94vh;overflow:hidden;border-radius:18px;background:#fff;box-shadow:0 30px 80px rgba(15,23,42,.28)}.sb-modal-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #E2E8F0}.sb-modal-head strong{font-size:11px}.sb-modal-body{padding:10px;background:#F1F5F9;overflow:auto;max-height:calc(94vh - 58px)}.sb-screen-paper{max-width:794px;margin:0 auto;background:#fff;padding:38px;border:1px solid #E2E8F0;box-shadow:0 10px 25px rgba(15,23,42,.06)}.sb-paper-kicker{text-align:center;color:#9A3412;font-size:8px;font-weight:900;letter-spacing:1.1px}.sb-screen-paper h1{text-align:center;margin:8px 0 4px;font-size:22px}.sb-paper-subject{text-align:center;font-size:10px;font-weight:900}.sb-paper-meta{text-align:center;color:#64748B;font-size:8px;margin:9px 0}.sb-paper-note{padding:8px 10px;border-left:3px solid #F97316;background:#FFF7ED;color:#475569;font-size:8px;margin:13px 0}.sb-preview-q{padding:10px 0;border-bottom:1px solid #F1F5F9;font-size:10px;line-height:1.55}.sb-preview-options{padding-left:18px;margin-top:4px;font-size:9px}.sb-match-tag{margin-top:6px;color:#9A3412;font-size:7px;font-weight:800}.sb-history-table{min-width:900px}

.sb-paper-modal{position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.58);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box}.sb-paper-modal-card{width:min(1100px,100%);height:min(94vh,980px);display:flex;flex-direction:column;overflow:hidden;border-radius:18px;background:#FFF;border:1px solid #E2E8F0;box-shadow:0 25px 70px rgba(15,23,42,.25)}.sb-paper-modal-head{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 16px;background:rgba(255,255,255,.97);backdrop-filter:blur(10px);border-bottom:1px solid #E2E8F0}.sb-paper-modal-head strong{font-size:11px;color:#0F172A}.sb-paper-eyebrow{font-size:8px;font-weight:900;color:#F97316;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px}.sb-paper-modal-actions{display:flex;gap:7px;flex-wrap:wrap}.sb-paper-btn{border:1px solid #CBD5E1;border-radius:9px;padding:8px 11px;background:#FFF;color:#475569;font-size:8px;font-weight:800;cursor:pointer;white-space:nowrap}.sb-paper-btn:hover{border-color:#94A3B8}.sb-paper-btn-primary{border-color:#F97316;background:#F97316;color:#FFF}.sb-paper-modal-body{flex:1;min-height:0;overflow:auto;padding:14px;background:#F1F5F9;-webkit-overflow-scrolling:touch}.sb-paper-preview-wrap{display:flex;justify-content:center;align-items:flex-start;width:100%;overflow:auto}.sb-paper-a4{width:794px;min-height:1123px;flex:0 0 794px;box-sizing:border-box;background:#FFF;border:1px solid #E2E8F0;box-shadow:0 10px 30px rgba(15,23,42,.12);padding:48px;color:#111827;font-family:Arial,Helvetica,sans-serif}.sb-paper-header{text-align:center;margin-bottom:12px}.sb-paper-kicker{font-size:9px;font-weight:800;letter-spacing:1.4px;color:#C2410C;text-transform:uppercase}.sb-paper-header h1{margin:5px 0 3px;font-size:24px;line-height:1.15}.sb-paper-subject{font-size:11px;font-weight:800}.sb-paper-meta{display:grid;grid-template-columns:1fr 1fr;gap:5px 18px;margin:18px 0 14px;padding:10px;border:1px solid #CBD5E1;border-radius:6px;font-size:9px}.sb-paper-meta span{min-width:0;overflow-wrap:anywhere}.sb-paper-instructions{padding:8px 10px;margin:0 0 8px;background:#F8FAFC;border-left:3px solid #F97316;font-size:9px;line-height:1.45}.sb-paper-focus{padding:7px 10px;margin:0 0 14px;background:#FFF7ED;border-left:3px solid #FDBA74;color:#475569;font-size:8px;line-height:1.45}.sb-paper-section{margin:0 0 14px;break-inside:auto}.sb-paper-section-heading{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:7px 9px;background:#F8FAFC;border-top:2px solid #CBD5E1;border-bottom:1px solid #E2E8F0;font-size:11px;font-weight:800;text-transform:uppercase}.sb-paper-section-description{margin:5px 0 8px;color:#64748B;font-size:9px;font-style:italic}.sb-paper-question{position:relative;margin:0 0 12px;font-size:11px;line-height:1.5;break-inside:avoid}.sb-paper-question-marks{float:right;font-weight:800}.sb-paper-options{margin:5px 0 0 19px;font-size:10px}.sb-paper-options>div{margin:2px 0}.sb-paper-blank{display:inline-block;min-width:62px;height:10px;border-bottom:1px solid #111827;margin:0 3px}.sb-paper-fill-statement{margin:4px 0 0 18px;line-height:1.55}.sb-paper-match{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:24px;margin:7px 0 0 18px}.sb-paper-match-title{font-size:8px;font-weight:800;text-transform:uppercase;color:#64748B;margin-bottom:3px}.sb-paper-match-row{display:grid;grid-template-columns:20px minmax(0,1fr);gap:5px;margin:3px 0;overflow-wrap:anywhere;word-break:break-word}.sb-paper-tf-list{margin:5px 0 0 18px}.sb-paper-tf-row{display:grid;grid-template-columns:18px 1fr 60px;gap:5px;margin:4px 0}.sb-paper-tf-row span:last-child{white-space:nowrap}.sb-paper-image{display:block;max-width:120mm;max-height:70mm;margin:7px auto;border-radius:4px;object-fit:contain}.sb-paper-image-prompt{font-weight:600;margin-top:5px}.sb-paper-passage{white-space:pre-wrap;line-height:1.5;margin:6px 0 8px;padding:8px;border:1px solid #CBD5E1;background:#FAFAFA;border-radius:4px}.sb-paper-passage-q{margin:4px 0 0 18px;position:relative}
@media(max-width:1024px){.sb-paper-modal{padding:10px}.sb-paper-modal-card{height:95vh;border-radius:15px}.sb-paper-modal-body{padding:10px}.sb-paper-a4{width:720px;min-height:1018px;flex-basis:720px;padding:38px}.sb-paper-header h1{font-size:22px}.sb-paper-meta{font-size:8.5px}.sb-paper-section-heading{font-size:10px}.sb-paper-question{font-size:10px}.sb-paper-options{font-size:9px}.sb-hero{padding:25px 24px;border-radius:22px}.sb-hero h1{font-size:30px}.sb-card{padding:20px;border-radius:19px}.sb-card-head h2{font-size:19px}.sb-filter-grid,.sb-custom-grid{gap:10px}.sb-file-list{grid-template-columns:repeat(2,minmax(0,1fr))}.sb-table{min-width:680px}.sb-screen-paper{padding:26px}}
@media(max-width:767px){.sb-paper-modal{padding:6px}.sb-paper-modal-card{height:96vh;border-radius:13px}.sb-paper-modal-head{padding:9px}.sb-paper-modal-head strong{font-size:9px}.sb-paper-eyebrow{font-size:6.5px}.sb-paper-modal-actions{gap:5px}.sb-paper-btn{padding:7px 8px;font-size:7px}.sb-paper-modal-body{padding:6px}.sb-paper-preview-wrap{overflow-x:auto;justify-content:flex-start}.sb-paper-a4{width:650px;max-width:none;min-width:650px;flex-basis:650px;min-height:919px;padding:30px}.sb-paper-header{margin-bottom:10px}.sb-paper-kicker{font-size:7px}.sb-paper-header h1{font-size:18px}.sb-paper-subject{font-size:9px}.sb-paper-meta{font-size:7.5px;gap:4px 8px;margin:12px 0;padding:8px}.sb-paper-instructions{font-size:7.5px;margin-bottom:6px}.sb-paper-focus{font-size:7px;margin-bottom:10px}.sb-paper-section{margin-bottom:10px}.sb-paper-section-heading{font-size:8px;padding:6px 7px}.sb-paper-section-description{font-size:7px;margin:4px 0 6px}.sb-paper-question{font-size:8.5px;line-height:1.5;margin-bottom:9px}.sb-paper-options{font-size:8px;margin-left:15px}.sb-paper-fill-statement{margin-left:14px}.sb-paper-match{gap:8px;margin-left:14px}.sb-paper-match-title{font-size:6.5px}.sb-paper-match-row{grid-template-columns:16px 1fr;font-size:7.5px}.sb-paper-tf-row{grid-template-columns:15px 1fr 52px;font-size:7.5px}.sb-paper-image{max-width:100%;height:auto}.sb-paper-passage{font-size:8px;padding:7px}.sb-page{overflow-x:hidden}.sb-hero{padding:18px 16px;border-radius:18px;gap:8px}.sb-hero h1{font-size:24px;letter-spacing:-.4px}.sb-hero p{font-size:10px;line-height:1.45;margin-top:7px}.sb-hero-icon{width:48px;height:48px;flex-basis:48px;font-size:19px}.sb-eyebrow{font-size:7.5px;letter-spacing:1.4px}.sb-card{margin-top:10px;padding:12px;border-radius:16px}.sb-card-head{gap:9px}.sb-card-head h2{font-size:16px;line-height:1.18}.sb-card-head p{font-size:8.5px;line-height:1.45}.sb-live{font-size:6.5px;padding:5px 6px}.sb-filter-grid,.sb-custom-grid{grid-template-columns:1fr;gap:8px;margin-top:12px}.sb-field{gap:4px}.sb-field span{font-size:6.8px}.sb-field select,.sb-field input{font-size:9px;padding:9px 9px;border-radius:9px}.sb-source-head{margin-top:11px;display:block;font-size:8px}.sb-source-head small{display:block;margin-top:4px}.sb-table{min-width:650px;font-size:8px}.sb-table th{padding:8px;font-size:6.5px}.sb-table td{padding:8px}.sb-drop{min-height:105px;margin-top:11px}.sb-drop strong{font-size:10px}.sb-drop small{font-size:7px}.sb-file-list{grid-template-columns:1fr;gap:6px;margin-top:9px}.sb-file-row{padding:8px}.sb-file-row strong{font-size:8px}.sb-file-row small{font-size:6.5px}.sb-generate-row{display:block;margin-top:12px}.sb-generate{width:100%;padding:11px 12px;font-size:9px}.sb-generate-row span{display:block;text-align:center;margin-top:6px}.sb-progress-wrap{margin-top:12px;padding:10px}.sb-progress-top span{font-size:7px;line-height:1.3}.sb-progress-top strong{font-size:16px}.sb-progress-steps{font-size:5.8px}.sb-ready-head{display:block}.sb-ready-actions{margin-top:10px}.sb-btn{padding:8px 9px;font-size:7px}.sb-modal{padding:7px}.sb-modal-card{border-radius:13px}.sb-modal-head{padding:9px}.sb-modal-head strong{font-size:9px}.sb-modal-body{padding:6px}.sb-screen-paper{padding:16px}.sb-screen-paper h1{font-size:17px}.sb-preview-q{font-size:8.5px}.sb-preview-options{font-size:8px}.sb-doubt-cell{max-width:280px}.sb-history-table{min-width:900px}}
@media(max-width:390px){.sb-paper-a4{padding:14px}.sb-paper-header h1{font-size:16px}.sb-paper-meta{font-size:7px}.sb-paper-question{font-size:8px}.sb-paper-options{font-size:7.5px}.sb-hero{padding:15px 13px}.sb-hero h1{font-size:22px}.sb-card{padding:10px}.sb-card-head h2{font-size:15px}.sb-table{min-width:620px}.sb-generate{font-size:8.5px}}
`;
