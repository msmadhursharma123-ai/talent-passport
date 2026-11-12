import { useEffect, useMemo, useState } from "react";
import {
  buildExamPreparationRange,
} from "../../examPreparationIntelligence/canonical/ExamPreparationDate";
import {
  getStudentReraiseCandidates,
  submitStudentReraiseCandidates,
} from "../service/StudentDoubtReraiseService";
import type { StudentReraiseCandidate } from "../types/StudentDoubtReraiseTypes";

export type StudentReraiseTimeFilter = "ALL" | "30" | "60" | "90" | "CUSTOM";

const ALL_SUBJECTS = "ALL_SUBJECTS";

type ReraiseStep = "select" | "confirm" | "success";

interface StudentReraiseDoubtModalProps {
  subjectOptions: string[];
  initialSubject?: string;
  initialTimeFilter?: StudentReraiseTimeFilter;
  initialCustomStart?: string;
  initialCustomEnd?: string;
  onReraised?: () => void | Promise<void>;
}

function normalize(value: unknown) {
  return String(value ?? "").trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function optionSubjectValue(value: string) {
  return value === "All Subjects" ? ALL_SUBJECTS : value;
}

export default function StudentReraiseDoubtModal({
  subjectOptions,
  initialSubject = ALL_SUBJECTS,
  initialTimeFilter = "30",
  initialCustomStart = "",
  initialCustomEnd = "",
  onReraised,
}: StudentReraiseDoubtModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ReraiseStep>("select");
  const [subject, setSubject] = useState(
    initialSubject || ALL_SUBJECTS
  );
  const [timeFilter, setTimeFilter] = useState<StudentReraiseTimeFilter>("30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [candidates, setCandidates] = useState<StudentReraiseCandidate[]>([]);
  const [selectedTopicKey, setSelectedTopicKey] = useState("");
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const range = useMemo(
    () => buildExamPreparationRange(timeFilter, customStart, customEnd),
    [timeFilter, customStart, customEnd]
  );

  const customRangeInvalid =
    timeFilter === "CUSTOM" &&
    (!customStart || !customEnd || customStart > customEnd);

  const topicOptions = useMemo(() => {
    const map = new Map<string, { key: string; label: string; subjectName: string; topicName: string }>();

    for (const candidate of candidates) {
      const key = `${normalize(candidate.subjectName)}::${normalize(candidate.topicName)}`;
      if (map.has(key)) continue;
      map.set(key, {
        key,
        label:
          subject === ALL_SUBJECTS
            ? `${candidate.subjectName} — ${candidate.topicName}`
            : candidate.topicName,
        subjectName: candidate.subjectName,
        topicName: candidate.topicName,
      });
    }

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [candidates, subject]);

  const selectedTopic = useMemo(
    () => topicOptions.find((item) => item.key === selectedTopicKey) ?? null,
    [topicOptions, selectedTopicKey]
  );

  const subtopicOptions = useMemo(() => {
    if (!selectedTopic) return [];

    const seen = new Set<string>();
    return candidates
      .filter(
        (candidate) =>
          normalize(candidate.subjectName) === normalize(selectedTopic.subjectName) &&
          normalize(candidate.topicName) === normalize(selectedTopic.topicName)
      )
      .filter((candidate) => {
        const key = normalize(candidate.subtopicName);
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((candidate) => candidate.subtopicName)
      .sort((a, b) => a.localeCompare(b));
  }, [candidates, selectedTopic]);

  useEffect(() => {
    if (!open) return;

    if (!range) {
      setCandidates([]);
      setSelectedTopicKey("");
      setSelectedSubtopics([]);
      setError(
        timeFilter === "CUSTOM"
          ? "Please select a valid custom start and end date."
          : ""
      );
      return;
    }

    let cancelled = false;

    async function loadCandidates() {
      setLoading(true);
      setError("");
      try {
        const rows = await getStudentReraiseCandidates({
          subjectName: subject,
          startDate: range.startDate,
          endDateExclusive: range.endDateExclusive,
        });
        if (cancelled) return;
        setCandidates(rows);
        setSelectedTopicKey("");
        setSelectedSubtopics([]);
      } catch (loadError) {
        if (cancelled) return;
        console.error("STUDENT RE-RAISE CANDIDATE LOAD FAILED", loadError);
        setCandidates([]);
        setSelectedTopicKey("");
        setSelectedSubtopics([]);
        setError("Unable to load unresolved doubts for the selected filters.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCandidates();
    return () => {
      cancelled = true;
    };
  }, [open, subject, timeFilter, customStart, customEnd, range]);

  function openModal() {
    setOpen(true);
    setStep("select");
    setError("");
    setSubject(initialSubject || ALL_SUBJECTS);
    setTimeFilter(initialTimeFilter);
    setCustomStart(initialCustomStart);
    setCustomEnd(initialCustomEnd);
    setSelectedTopicKey("");
    setSelectedSubtopics([]);
  }

  function closeModal() {
    setOpen(false);
    setStep("select");
    setError("");
    setCandidates([]);
    setSelectedTopicKey("");
    setSelectedSubtopics([]);
  }

  function toggleSubtopic(value: string) {
    setSelectedSubtopics((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function proceedToConfirmation() {
    if (!selectedTopic || selectedSubtopics.length === 0) return;
    setError("");
    setStep("confirm");
  }

  async function confirmReraise() {
    if (!selectedTopic || selectedSubtopics.length === 0) return;

    const selectedCandidates = candidates.filter(
      (candidate) =>
        normalize(candidate.subjectName) === normalize(selectedTopic.subjectName) &&
        normalize(candidate.topicName) === normalize(selectedTopic.topicName) &&
        selectedSubtopics.some(
          (subtopic) => normalize(subtopic) === normalize(candidate.subtopicName)
        )
    );

    if (selectedCandidates.length === 0) {
      setError("The selected doubt is no longer unresolved. Please refresh and try again.");
      setStep("select");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await submitStudentReraiseCandidates(selectedCandidates);
      setStep("success");
      await onReraised?.();
    } catch (saveError) {
      console.error("STUDENT DOUBT RE-RAISE SAVE FAILED", saveError);
      setError(
        "The doubt could not be re-raised. Please try again without changing the selected filters."
      );
      setStep("select");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <button
        type="button"
        className="student-reraise-open-button"
        onClick={openModal}
      >
        RE-RAISE DOUBT
      </button>

      {open ? (
        <div
          className="student-reraise-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-reraise-title"
        >
          <div className="student-reraise-modal">
            <div className="student-reraise-header">
              <div className="student-reraise-heading-copy">
                <p className="student-reraise-kicker">DOUBT FOLLOW-UP</p>
                <h2 id="student-reraise-title">Re-raise Doubt</h2>
                <p>
                  Re-raise an unresolved doubt that still needs teacher attention.
                </p>
              </div>
              <button
                type="button"
                className="student-reraise-close-icon"
                aria-label="Close re-raise doubt"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {step === "select" ? (
              <div className="student-reraise-body">
                <div className="student-reraise-filter-grid">
                  <label className="student-reraise-field">
                    <span>Subject</span>
                    <select
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      disabled={loading || saving}
                    >
                      {Array.from(
                        new Set(
                          ["All Subjects", ...subjectOptions].filter(Boolean)
                        )
                      ).map((item) => (
                        <option key={item} value={optionSubjectValue(item)}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="student-reraise-field">
                    <span>Time Period</span>
                    <select
                      value={timeFilter}
                      onChange={(event) =>
                        setTimeFilter(event.target.value as StudentReraiseTimeFilter)
                      }
                      disabled={loading || saving}
                    >
                      <option value="ALL">All time</option>
                      <option value="30">Last 30 Days</option>
                      <option value="60">Last 60 Days</option>
                      <option value="90">Last 90 Days</option>
                      <option value="CUSTOM">Custom Date</option>
                    </select>
                  </label>
                </div>

                {timeFilter === "CUSTOM" ? (
                  <div className="student-reraise-custom-grid">
                    <label className="student-reraise-field">
                      <span>Start Date</span>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(event) => setCustomStart(event.target.value)}
                        disabled={loading || saving}
                      />
                    </label>
                    <label className="student-reraise-field">
                      <span>End Date</span>
                      <input
                        type="date"
                        value={customEnd}
                        min={customStart || undefined}
                        onChange={(event) => setCustomEnd(event.target.value)}
                        disabled={loading || saving}
                      />
                    </label>
                  </div>
                ) : null}

                {customRangeInvalid ? (
                  <div className="student-reraise-error">
                    Please select a valid custom date range.
                  </div>
                ) : null}

                <label className="student-reraise-field student-reraise-topic-field">
                  <span>Topic</span>
                  <select
                    value={selectedTopicKey}
                    onChange={(event) => {
                      setSelectedTopicKey(event.target.value);
                      setSelectedSubtopics([]);
                    }}
                    disabled={loading || saving || topicOptions.length === 0}
                  >
                    <option value="">
                      {loading ? "Loading topics…" : "Select topic"}
                    </option>
                    {topicOptions.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedTopic ? (
                  <div className="student-reraise-subtopic-section">
                    <div className="student-reraise-section-label">
                      Subtopics with unresolved doubts
                    </div>
                    {subtopicOptions.length === 0 ? (
                      <div className="student-reraise-empty">
                        No unresolved subtopics are available for this topic.
                      </div>
                    ) : (
                      <div className="student-reraise-subtopic-list">
                        {subtopicOptions.map((subtopic) => {
                          const checked = selectedSubtopics.includes(subtopic);
                          return (
                            <label
                              key={subtopic}
                              className={`student-reraise-subtopic-card${checked ? " is-selected" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSubtopic(subtopic)}
                                disabled={saving}
                              />
                              <span>{subtopic}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : null}

                {error ? <div className="student-reraise-error">{error}</div> : null}

                {!loading && !error && topicOptions.length === 0 ? (
                  <div className="student-reraise-empty">
                    No unresolved doubts are available for the selected subject and time period.
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === "select" ? (
              <div className="student-reraise-footer">
                <button
                  type="button"
                  className="student-reraise-secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  CLOSE
                </button>
                <button
                  type="button"
                  className="student-reraise-primary-button"
                  onClick={proceedToConfirmation}
                  disabled={
                    loading ||
                    saving ||
                    customRangeInvalid ||
                    !selectedTopic ||
                    selectedSubtopics.length === 0
                  }
                >
                  RE-RAISE DOUBT
                </button>
              </div>
            ) : null}

            {step === "confirm" ? (
              <div className="student-reraise-message-panel">
                <div className="student-reraise-message-title">
                  Are you sure you want to re-raise the doubt to the teacher?
                </div>
                <div className="student-reraise-message-copy">
                  This will push the doubt to the priority list of the teacher.
                </div>
                {error ? <div className="student-reraise-error">{error}</div> : null}
                <div className="student-reraise-message-actions">
                  <button
                    type="button"
                    className="student-reraise-secondary-button"
                    onClick={() => setStep("select")}
                    disabled={saving}
                  >
                    NO
                  </button>
                  <button
                    type="button"
                    className="student-reraise-primary-button"
                    onClick={() => void confirmReraise()}
                    disabled={saving}
                  >
                    {saving ? "SAVING…" : "YES"}
                  </button>
                </div>
              </div>
            ) : null}

            {step === "success" ? (
              <div className="student-reraise-message-panel">
                <div className="student-reraise-success-icon">✓</div>
                <div className="student-reraise-message-title">
                  Doubt re-raised successfully
                </div>
                <div className="student-reraise-message-copy">
                  You can see the re-raise doubt in the doubt table highlighted with yellow color.
                </div>
                <div className="student-reraise-success-actions">
                  <button
                    type="button"
                    className="student-reraise-primary-button"
                    onClick={() => setStep("select")}
                  >
                    CLOSE
                  </button>
                </div>
                <button
                  type="button"
                  className="student-reraise-success-cross"
                  aria-label="Return to re-raise doubt"
                  onClick={() => setStep("select")}
                >
                  ×
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

const styles = `
.student-reraise-open-button{border:1px solid #F59E0B;border-radius:999px;padding:8px 12px;background:#FFF7ED;color:#B45309;font-size:9px;font-weight:900;letter-spacing:.45px;cursor:pointer;white-space:nowrap}
.student-reraise-open-button:hover{background:#FFFBEB}
.student-reraise-overlay{position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(15,23,42,.55);backdrop-filter:blur(4px)}
.student-reraise-modal{position:relative;width:50vw;height:55vh;max-width:calc(100vw - 36px);max-height:calc(100vh - 36px);display:flex;flex-direction:column;overflow:hidden;background:#FFF;border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 24px 70px rgba(15,23,42,.24)}
.student-reraise-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px 13px;border-bottom:1px solid #EEF2F7;background:#FFFCF8}
.student-reraise-heading-copy{min-width:0}.student-reraise-kicker{margin:0 0 5px;color:#EA580C;font-size:9px;font-weight:900;letter-spacing:1.25px}.student-reraise-header h2{margin:0;color:#0F172A;font-size:21px;line-height:1.15;font-weight:900}.student-reraise-header p{margin:5px 0 0;color:#64748B;font-size:10px;line-height:1.45;font-weight:650}
.student-reraise-close-icon,.student-reraise-success-cross{border:0;background:transparent;color:#64748B;font-size:26px;line-height:1;cursor:pointer;padding:0 2px}.student-reraise-close-icon:hover,.student-reraise-success-cross:hover{color:#0F172A}
.student-reraise-body{min-height:0;overflow:auto;padding:16px 18px}
.student-reraise-filter-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.student-reraise-custom-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:9px}
.student-reraise-field{display:flex;flex-direction:column;gap:4px;min-width:0}.student-reraise-field>span{color:#64748B;font-size:8px;font-weight:900;letter-spacing:.8px;text-transform:uppercase}.student-reraise-field select,.student-reraise-field input{width:100%;box-sizing:border-box;min-height:35px;border:1px solid #CBD5E1;border-radius:9px;background:#FFF;color:#0F172A;padding:0 9px;font-size:10px;font-weight:800;outline:none}.student-reraise-field select:focus,.student-reraise-field input:focus{border-color:#F59E0B;box-shadow:0 0 0 2px rgba(245,158,11,.10)}
.student-reraise-topic-field{margin-top:11px}.student-reraise-subtopic-section{margin-top:12px;padding:11px;border:1px solid #E2E8F0;border-radius:12px;background:#FAFAF9}.student-reraise-section-label{margin-bottom:8px;color:#334155;font-size:9px;font-weight:900;letter-spacing:.35px}.student-reraise-subtopic-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.student-reraise-subtopic-card{display:flex;align-items:flex-start;gap:7px;min-width:0;padding:8px;border:1px solid #E2E8F0;border-radius:9px;background:#FFF;color:#475569;font-size:9px;line-height:1.3;font-weight:750;cursor:pointer}.student-reraise-subtopic-card.is-selected{border-color:#FBBF24;background:#FFFBEB;color:#92400E}.student-reraise-subtopic-card input{width:14px;height:14px;margin:0;flex:0 0 auto;accent-color:#F59E0B}.student-reraise-subtopic-card span{min-width:0;overflow-wrap:anywhere}
.student-reraise-empty{padding:14px 8px;text-align:center;color:#94A3B8;font-size:9px;font-weight:750}.student-reraise-error{margin-top:9px;padding:8px 9px;border:1px solid #FECACA;border-radius:8px;background:#FEF2F2;color:#B91C1C;font-size:9px;line-height:1.35;font-weight:800}
.student-reraise-footer,.student-reraise-message-actions,.student-reraise-success-actions{display:flex;align-items:center;justify-content:flex-end;gap:7px;padding:11px 18px;border-top:1px solid #EEF2F7;background:#FCFCFB}.student-reraise-secondary-button,.student-reraise-primary-button{min-height:33px;border-radius:9px;padding:0 12px;font-size:9px;font-weight:900;cursor:pointer}.student-reraise-secondary-button{border:1px solid #CBD5E1;background:#FFF;color:#475569}.student-reraise-primary-button{border:1px solid #F59E0B;background:#F59E0B;color:#FFF}.student-reraise-primary-button:disabled,.student-reraise-secondary-button:disabled{opacity:.45;cursor:not-allowed}
.student-reraise-message-panel{position:relative;display:flex;flex-direction:column;justify-content:center;align-items:center;flex:1;padding:30px;text-align:center}.student-reraise-message-title{max-width:430px;color:#0F172A;font-size:16px;line-height:1.35;font-weight:900}.student-reraise-message-copy{max-width:430px;margin-top:7px;color:#64748B;font-size:10px;line-height:1.5;font-weight:700}.student-reraise-message-actions{width:100%;margin-top:24px;border-top:1px solid #EEF2F7}.student-reraise-success-actions{width:100%;margin-top:24px}.student-reraise-success-icon{display:flex;align-items:center;justify-content:center;width:42px;height:42px;margin-bottom:13px;border:1px solid #BBF7D0;border-radius:50%;background:#F0FDF4;color:#16A34A;font-size:22px;font-weight:900}.student-reraise-success-cross{position:absolute;right:18px;top:12px}
@media(max-width:1024px){.student-reraise-open-button{padding:6px 9px;font-size:8px}.student-reraise-modal{width:min(680px,72vw);height:min(600px,70vh);border-radius:17px}.student-reraise-header{padding:14px 15px 10px}.student-reraise-header h2{font-size:18px}.student-reraise-header p{font-size:9px}.student-reraise-body{padding:12px 13px}.student-reraise-field select,.student-reraise-field input{min-height:32px;font-size:9px}.student-reraise-subtopic-card{font-size:9px}.student-reraise-footer,.student-reraise-message-actions,.student-reraise-success-actions{padding:9px 13px}}
@media(max-width:600px){.student-reraise-open-button{padding:4px 6px;font-size:6.5px;letter-spacing:.25px}.student-reraise-overlay{padding:7px}.student-reraise-modal{width:92vw;height:78vh;max-width:92vw;max-height:92vh;border-radius:14px}.student-reraise-header{padding:10px 11px 8px}.student-reraise-kicker{font-size:7px;letter-spacing:.9px}.student-reraise-header h2{font-size:15px}.student-reraise-header p{font-size:8px;line-height:1.35}.student-reraise-close-icon{font-size:22px}.student-reraise-body{padding:9px}.student-reraise-filter-grid,.student-reraise-custom-grid{gap:5px}.student-reraise-field{gap:3px}.student-reraise-field>span{font-size:6.5px;letter-spacing:.55px}.student-reraise-field select,.student-reraise-field input{min-height:29px;padding:0 6px;border-radius:7px;font-size:8px}.student-reraise-topic-field{margin-top:8px}.student-reraise-subtopic-section{margin-top:8px;padding:8px;border-radius:9px}.student-reraise-section-label{margin-bottom:6px;font-size:7px}.student-reraise-subtopic-list{grid-template-columns:1fr;gap:4px}.student-reraise-subtopic-card{padding:6px;font-size:8px;border-radius:7px}.student-reraise-subtopic-card input{width:12px;height:12px}.student-reraise-empty,.student-reraise-error{font-size:7.5px}.student-reraise-footer,.student-reraise-message-actions,.student-reraise-success-actions{padding:7px 9px}.student-reraise-secondary-button,.student-reraise-primary-button{min-height:29px;padding:0 9px;font-size:8px;border-radius:7px}.student-reraise-message-panel{padding:20px 14px}.student-reraise-message-title{font-size:13px}.student-reraise-message-copy{font-size:8px}.student-reraise-success-icon{width:36px;height:36px;font-size:18px}.student-reraise-success-cross{right:10px;top:7px;font-size:22px}}
`;
