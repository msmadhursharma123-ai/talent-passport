import { useEffect, useMemo, useRef, useState } from "react";
import { buildExamPreparationRange } from "../../examPreparationIntelligence/canonical/ExamPreparationDate";
import {
  getStudentRaisedDoubtGroups,
  resolveStudentRaisedDoubtGroups,
} from "../service/StudentResolveRaisedDoubtService";
import type {
  StudentResolveRaisedDoubtGroup,
  StudentResolveRaisedDoubtTimeFilter,
} from "../types/StudentResolveRaisedDoubtTypes";

const ALL_SUBJECTS = "ALL_SUBJECTS";

type Step = "select" | "confirm" | "success";

interface Props {
  subjectOptions: string[];
  initialSubject?: string;
  initialTimeFilter?: StudentResolveRaisedDoubtTimeFilter;
  initialCustomStart?: string;
  initialCustomEnd?: string;
  onResolved?: () => void | Promise<void>;
}

function optionSubjectValue(value: string) {
  return value === "All Subjects" ? ALL_SUBJECTS : value;
}

function normalize(value: unknown) {
  return String(value ?? "").trim().toLocaleLowerCase().replace(/\s+/g, " ");
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function StudentResolveRaisedDoubtModal({
  subjectOptions,
  initialSubject = ALL_SUBJECTS,
  initialTimeFilter = "30",
  initialCustomStart = "",
  initialCustomEnd = "",
  onResolved,
}: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("select");
  const [subject, setSubject] = useState(initialSubject || ALL_SUBJECTS);
  const [timeFilter, setTimeFilter] =
    useState<StudentResolveRaisedDoubtTimeFilter>(initialTimeFilter);
  const [customStart, setCustomStart] = useState(initialCustomStart);
  const [customEnd, setCustomEnd] = useState(initialCustomEnd);
  const [groups, setGroups] = useState<StudentResolveRaisedDoubtGroup[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const loadRequestRef = useRef(0);

  const range = useMemo(
    () => buildExamPreparationRange(timeFilter, customStart, customEnd),
    [timeFilter, customStart, customEnd],
  );

  const customRangeInvalid =
    timeFilter === "CUSTOM" &&
    (!customStart || !customEnd || customStart > customEnd);

  const selectedGroups = useMemo(
    () => groups.filter((group) => selectedKeys.has(group.key)),
    [groups, selectedKeys],
  );

  const subjectGroupCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const group of groups) {
      counts.set(
        group.subjectName,
        (counts.get(group.subjectName) ?? 0) + 1,
      );
    }
    return counts;
  }, [groups]);

  async function loadGroups() {
    const requestId = ++loadRequestRef.current;
    if (!open) return;

    if (!range || customRangeInvalid) {
      if (requestId !== loadRequestRef.current) return;
      setGroups([]);
      setSelectedKeys(new Set());
      if (timeFilter === "CUSTOM") {
        setError("Please select a valid custom start and end date.");
      }
      return;
    }

    setLoading(true);
    setError("");

    try {
      const rows = await getStudentRaisedDoubtGroups({
        subjectName: subject,
        startDate: range.startDate,
        endDateExclusive: range.endDateExclusive,
      });

      // Filter changes can overlap in flight. Only the newest request may
      // replace the visible canonical snapshot; an older response must never
      // overwrite a newer subject/date selection.
      if (requestId !== loadRequestRef.current) return;

      setGroups(rows);
      setSelectedKeys(new Set());
    } catch (loadError) {
      if (requestId !== loadRequestRef.current) return;
      console.error("STUDENT RESOLVE RAISED DOUBT LOAD FAILED", loadError);
      setGroups([]);
      setSelectedKeys(new Set());
      setError(
        "Unable to load your current unresolved Exam Preparation doubts. Please try again.",
      );
    } finally {
      if (requestId === loadRequestRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadGroups();
    // The modal deliberately reloads directly from canonical rows whenever a
    // filter changes. No local copy is treated as authoritative.
  }, [open, subject, timeFilter, customStart, customEnd]);

  function openModal() {
    setOpen(true);
    setStep("select");
    setError("");
    setSubject(initialSubject || ALL_SUBJECTS);
    setTimeFilter(initialTimeFilter);
    setCustomStart(initialCustomStart);
    setCustomEnd(initialCustomEnd);
    setGroups([]);
    setSelectedKeys(new Set());
  }

  function closeModal() {
    if (saving) return;
    loadRequestRef.current += 1;
    setOpen(false);
    setStep("select");
    setError("");
    setGroups([]);
    setSelectedKeys(new Set());
  }

  function toggleGroup(key: string) {
    if (saving) return;

    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAllVisible() {
    if (saving) return;

    setSelectedKeys((current) => {
      if (current.size === groups.length) return new Set();
      return new Set(groups.map((group) => group.key));
    });
  }

  async function confirmResolution() {
    if (!selectedGroups.length || saving) return;

    setSaving(true);
    setError("");

    try {
      await resolveStudentRaisedDoubtGroups(selectedGroups);
      setStep("success");

      // Database resolution has already succeeded. A UI refresh failure must
      // never be reported as a failed resolution because that could cause the
      // student to submit the same resolution twice.
      try {
        await onResolved?.();
      } catch (refreshError) {
        console.error(
          "STUDENT RESOLVE RAISED DOUBT REFRESH FAILED",
          refreshError,
        );
      }
    } catch (saveError) {
      console.error(
        "STUDENT RESOLVE RAISED DOUBT SAVE FAILED",
        saveError,
      );
      setError(
        "The selected doubts could not be resolved. Please refresh the Exam Preparation page and try again.",
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
        className="student-resolve-raised-open-button"
        onClick={openModal}
      >
        RESOLVE RAISED DOUBT
      </button>

      {open ? (
        <div
          className="student-resolve-raised-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-resolve-raised-title"
        >
          <div className="student-resolve-raised-modal">
            <div className="student-resolve-raised-header">
              <div className="student-resolve-raised-heading-copy">
                <p className="student-resolve-raised-kicker">
                  DOUBT RESOLUTION
                </p>
                <h2 id="student-resolve-raised-title">
                  Resolve Raised Doubt
                </h2>
                <p>
                  Select the raised doubts you have now understood. Unselected
                  doubts remain unresolved.
                </p>
              </div>

              <button
                type="button"
                className="student-resolve-raised-close-icon"
                aria-label="Close resolve raised doubt"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            {step === "select" ? (
              <>
                <div className="student-resolve-raised-body">
                  <div className="student-resolve-raised-filter-grid">
                    <label className="student-resolve-raised-field">
                      <span>Subject</span>
                      <select
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        disabled={loading || saving}
                      >
                        {Array.from(
                          new Set(
                            ["All Subjects", ...subjectOptions].filter(Boolean),
                          ),
                        ).map((item) => (
                          <option
                            key={item}
                            value={optionSubjectValue(item)}
                          >
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="student-resolve-raised-field">
                      <span>Time Period</span>
                      <select
                        value={timeFilter}
                        onChange={(event) =>
                          setTimeFilter(
                            event.target.value as StudentResolveRaisedDoubtTimeFilter,
                          )
                        }
                        disabled={loading || saving}
                      >
                        <option value="30">Last 30 Days</option>
                        <option value="60">Last 60 Days</option>
                        <option value="90">Last 90 Days</option>
                        <option value="CUSTOM">Custom Date</option>
                      </select>
                    </label>
                  </div>

                  {timeFilter === "CUSTOM" ? (
                    <div className="student-resolve-raised-custom-grid">
                      <label className="student-resolve-raised-field">
                        <span>Start Date</span>
                        <input
                          type="date"
                          value={customStart}
                          onChange={(event) =>
                            setCustomStart(event.target.value)
                          }
                          disabled={loading || saving}
                        />
                      </label>

                      <label className="student-resolve-raised-field">
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
                    <div className="student-resolve-raised-error">
                      Please select a valid custom date range.
                    </div>
                  ) : null}

                  <div className="student-resolve-raised-list-header">
                    <div>
                      <span className="student-resolve-raised-section-label">
                        Current unresolved raised doubts
                      </span>
                      <span className="student-resolve-raised-section-note">
                        {loading
                          ? "Loading from Exam Preparation…"
                          : `${groups.length} doubt${groups.length === 1 ? "" : "s"} across ${subjectGroupCount.size} subject${subjectGroupCount.size === 1 ? "" : "s"}`}
                      </span>
                    </div>

                    {!loading && groups.length > 0 ? (
                      <button
                        type="button"
                        className="student-resolve-raised-select-all"
                        onClick={selectAllVisible}
                        disabled={saving}
                      >
                        {selectedKeys.size === groups.length
                          ? "CLEAR ALL"
                          : "SELECT ALL"}
                      </button>
                    ) : null}
                  </div>

                  {!loading && groups.length > 0 ? (
                    <div className="student-resolve-raised-topic-list">
                      {groups.map((group) => {
                        const selected = selectedKeys.has(group.key);

                        return (
                          <label
                            key={group.key}
                            className={`student-resolve-raised-topic-card${selected ? " is-selected" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleGroup(group.key)}
                              disabled={saving}
                            />

                            <span className="student-resolve-raised-topic-content">
                              <span className="student-resolve-raised-topic-line">
                                <span className="student-resolve-raised-subject">
                                  {group.subjectName}
                                </span>
                                <span className="student-resolve-raised-topic">
                                  {group.topicName}
                                </span>
                              </span>

                              <span className="student-resolve-raised-subtopic">
                                {group.subtopicName}
                              </span>

                              <span className="student-resolve-raised-meta">
                                {group.rows.length > 1
                                  ? `${group.rows.length} current occurrences`
                                  : "Current unresolved doubt"}
                                {" • "}
                                {group.dates
                                  .slice()
                                  .sort()
                                  .map(formatDate)
                                  .join(" • ")}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : null}

                  {!loading && groups.length === 0 && !error ? (
                    <div className="student-resolve-raised-empty">
                      No unresolved raised doubts are available for the selected
                      subject and time period.
                    </div>
                  ) : null}

                  {error ? (
                    <div className="student-resolve-raised-error">{error}</div>
                  ) : null}
                </div>

                <div className="student-resolve-raised-footer">
                  <button
                    type="button"
                    className="student-resolve-raised-secondary-button"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    CLOSE
                  </button>

                  <button
                    type="button"
                    className="student-resolve-raised-primary-button"
                    onClick={() => setStep("confirm")}
                    disabled={
                      loading ||
                      saving ||
                      customRangeInvalid ||
                      selectedGroups.length === 0
                    }
                  >
                    RESOLVE SELECTED
                  </button>
                </div>
              </>
            ) : null}

            {step === "confirm" ? (
              <div className="student-resolve-raised-message-panel">
                <div className="student-resolve-raised-message-title">
                  Mark {selectedGroups.length} selected doubt
                  {selectedGroups.length === 1 ? "" : "s"} as resolved?
                </div>

                <div className="student-resolve-raised-message-copy">
                  Only the selected current Exam Preparation doubts will be
                  resolved. Unselected doubts remain unresolved.
                </div>

                {error ? (
                  <div className="student-resolve-raised-error">{error}</div>
                ) : null}

                <div className="student-resolve-raised-message-actions">
                  <button
                    type="button"
                    className="student-resolve-raised-secondary-button"
                    onClick={() => setStep("select")}
                    disabled={saving}
                  >
                    NO
                  </button>

                  <button
                    type="button"
                    className="student-resolve-raised-primary-button"
                    onClick={() => void confirmResolution()}
                    disabled={saving}
                  >
                    {saving ? "SAVING…" : "YES, RESOLVE"}
                  </button>
                </div>
              </div>
            ) : null}

            {step === "success" ? (
              <div className="student-resolve-raised-message-panel">
                <div className="student-resolve-raised-success-icon">✓</div>

                <div className="student-resolve-raised-message-title">
                  Doubt resolved successfully
                </div>

                <div className="student-resolve-raised-message-copy">
                  Your Exam Preparation data has been updated. The page will
                  now show the current unresolved doubts.
                </div>

                <div className="student-resolve-raised-success-actions">
                  <button
                    type="button"
                    className="student-resolve-raised-primary-button"
                    onClick={closeModal}
                  >
                    CLOSE
                  </button>
                </div>

                <button
                  type="button"
                  className="student-resolve-raised-success-cross"
                  aria-label="Close resolve raised doubt success"
                  onClick={closeModal}
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
.student-resolve-raised-open-button{border:1px solid #16A34A;border-radius:999px;padding:8px 12px;background:#F0FDF4;color:#15803D;font-size:9px;font-weight:900;letter-spacing:.45px;cursor:pointer;white-space:nowrap}
.student-resolve-raised-open-button:hover{background:#DCFCE7}
.student-resolve-raised-overlay{position:fixed;inset:0;z-index:12000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(15,23,42,.55);backdrop-filter:blur(4px)}
.student-resolve-raised-modal{position:relative;width:50vw;height:55vh;max-width:calc(100vw - 36px);max-height:calc(100vh - 36px);display:flex;flex-direction:column;overflow:hidden;background:#FFF;border:1px solid #E2E8F0;border-radius:20px;box-shadow:0 24px 70px rgba(15,23,42,.24)}
.student-resolve-raised-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:18px 20px 13px;border-bottom:1px solid #EEF2F7;background:#F8FFFA}
.student-resolve-raised-heading-copy{min-width:0}.student-resolve-raised-kicker{margin:0 0 5px;color:#16A34A;font-size:9px;font-weight:900;letter-spacing:1.25px}.student-resolve-raised-header h2{margin:0;color:#0F172A;font-size:21px;line-height:1.15;font-weight:900}.student-resolve-raised-header p{margin:5px 0 0;color:#64748B;font-size:10px;line-height:1.45;font-weight:650}
.student-resolve-raised-close-icon,.student-resolve-raised-success-cross{border:0;background:transparent;color:#64748B;font-size:26px;line-height:1;cursor:pointer;padding:0 2px}.student-resolve-raised-close-icon:hover,.student-resolve-raised-success-cross:hover{color:#0F172A}
.student-resolve-raised-body{min-height:0;overflow:auto;padding:16px 18px}.student-resolve-raised-filter-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.student-resolve-raised-custom-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:9px}
.student-resolve-raised-field{display:flex;flex-direction:column;gap:4px;min-width:0}.student-resolve-raised-field>span{color:#64748B;font-size:8px;font-weight:900;letter-spacing:.8px;text-transform:uppercase}.student-resolve-raised-field select,.student-resolve-raised-field input{width:100%;box-sizing:border-box;min-height:35px;border:1px solid #CBD5E1;border-radius:9px;background:#FFF;color:#0F172A;padding:0 9px;font-size:10px;font-weight:800;outline:none}.student-resolve-raised-field select:focus,.student-resolve-raised-field input:focus{border-color:#16A34A;box-shadow:0 0 0 2px rgba(22,163,74,.10)}
.student-resolve-raised-list-header{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:13px;padding:9px 10px;border:1px solid #E2E8F0;border-radius:10px;background:#FAFAF9}.student-resolve-raised-section-label{display:block;color:#334155;font-size:9px;font-weight:900;letter-spacing:.35px}.student-resolve-raised-section-note{display:block;margin-top:2px;color:#94A3B8;font-size:8px;font-weight:700}
.student-resolve-raised-select-all{border:0;background:transparent;color:#15803D;font-size:8px;font-weight:900;cursor:pointer;white-space:nowrap}.student-resolve-raised-select-all:disabled{opacity:.45;cursor:not-allowed}
.student-resolve-raised-topic-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:8px}.student-resolve-raised-topic-card{display:flex;align-items:flex-start;gap:8px;min-width:0;padding:9px;border:1px solid #E2E8F0;border-radius:10px;background:#FFF;color:#475569;font-size:9px;line-height:1.35;font-weight:750;cursor:pointer}.student-resolve-raised-topic-card.is-selected{border-color:#86EFAC;background:#F0FDF4;color:#166534}.student-resolve-raised-topic-card input{width:14px;height:14px;margin:1px 0 0;flex:0 0 auto;accent-color:#16A34A}.student-resolve-raised-topic-content{display:flex;flex-direction:column;min-width:0}.student-resolve-raised-topic-line{display:flex;flex-wrap:wrap;gap:4px;align-items:baseline}.student-resolve-raised-subject{color:#64748B;font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:.45px}.student-resolve-raised-topic{color:#0F172A;font-size:10px;font-weight:900}.student-resolve-raised-subtopic{margin-top:3px;color:#166534;font-size:10px;font-weight:850;overflow-wrap:anywhere}.student-resolve-raised-meta{margin-top:4px;color:#94A3B8;font-size:7.5px;font-weight:700;line-height:1.35}
.student-resolve-raised-empty{padding:28px 8px;text-align:center;color:#94A3B8;font-size:9px;font-weight:750}.student-resolve-raised-error{margin-top:9px;padding:8px 9px;border:1px solid #FECACA;border-radius:8px;background:#FEF2F2;color:#B91C1C;font-size:9px;line-height:1.35;font-weight:800}
.student-resolve-raised-footer,.student-resolve-raised-message-actions,.student-resolve-raised-success-actions{display:flex;align-items:center;justify-content:flex-end;gap:7px;padding:11px 18px;border-top:1px solid #EEF2F7;background:#FCFCFB}.student-resolve-raised-secondary-button,.student-resolve-raised-primary-button{min-height:33px;border-radius:9px;padding:0 12px;font-size:9px;font-weight:900;cursor:pointer}.student-resolve-raised-secondary-button{border:1px solid #CBD5E1;background:#FFF;color:#475569}.student-resolve-raised-primary-button{border:1px solid #16A34A;background:#16A34A;color:#FFF}.student-resolve-raised-primary-button:disabled,.student-resolve-raised-secondary-button:disabled{opacity:.45;cursor:not-allowed}
.student-resolve-raised-message-panel{position:relative;display:flex;flex-direction:column;justify-content:center;align-items:center;flex:1;padding:30px;text-align:center}.student-resolve-raised-message-title{max-width:430px;color:#0F172A;font-size:16px;line-height:1.35;font-weight:900}.student-resolve-raised-message-copy{max-width:430px;margin-top:7px;color:#64748B;font-size:10px;line-height:1.5;font-weight:700}.student-resolve-raised-message-actions{width:100%;margin-top:24px}.student-resolve-raised-success-actions{width:100%;margin-top:24px}.student-resolve-raised-success-icon{display:flex;align-items:center;justify-content:center;width:42px;height:42px;margin-bottom:13px;border:1px solid #BBF7D0;border-radius:50%;background:#F0FDF4;color:#16A34A;font-size:22px;font-weight:900}.student-resolve-raised-success-cross{position:absolute;right:18px;top:12px}
@media(max-width:1024px){.student-resolve-raised-open-button{padding:6px 9px;font-size:8px}.student-resolve-raised-modal{width:min(680px,72vw);height:min(600px,70vh);border-radius:17px}.student-resolve-raised-header{padding:14px 15px 10px}.student-resolve-raised-header h2{font-size:18px}.student-resolve-raised-header p{font-size:9px}.student-resolve-raised-body{padding:12px 13px}.student-resolve-raised-field select,.student-resolve-raised-field input{min-height:32px;font-size:9px}.student-resolve-raised-topic-card{font-size:9px}.student-resolve-raised-footer,.student-resolve-raised-message-actions,.student-resolve-raised-success-actions{padding:9px 13px}}
@media(max-width:600px){.student-resolve-raised-open-button{padding:4px 6px;font-size:6.5px;letter-spacing:.25px}.student-resolve-raised-overlay{padding:7px}.student-resolve-raised-modal{width:92vw;height:78vh;max-width:92vw;max-height:92vh;border-radius:14px}.student-resolve-raised-header{padding:10px 11px 8px}.student-resolve-raised-kicker{font-size:7px;letter-spacing:.9px}.student-resolve-raised-header h2{font-size:15px}.student-resolve-raised-header p{font-size:8px;line-height:1.35}.student-resolve-raised-close-icon{font-size:22px}.student-resolve-raised-body{padding:9px}.student-resolve-raised-filter-grid,.student-resolve-raised-custom-grid{gap:5px}.student-resolve-raised-field{gap:3px}.student-resolve-raised-field>span{font-size:6.5px;letter-spacing:.55px}.student-resolve-raised-field select,.student-resolve-raised-field input{min-height:29px;padding:0 6px;border-radius:7px;font-size:8px}.student-resolve-raised-list-header{margin-top:8px;padding:7px 8px}.student-resolve-raised-section-label{font-size:7px}.student-resolve-raised-section-note{font-size:6.5px}.student-resolve-raised-select-all{font-size:7px}.student-resolve-raised-topic-list{grid-template-columns:1fr;gap:4px;margin-top:6px}.student-resolve-raised-topic-card{padding:7px;font-size:8px;border-radius:7px}.student-resolve-raised-topic-card input{width:12px;height:12px}.student-resolve-raised-subject{font-size:6.5px}.student-resolve-raised-topic{font-size:8.5px}.student-resolve-raised-subtopic{font-size:8.5px}.student-resolve-raised-meta{font-size:6.5px}.student-resolve-raised-empty,.student-resolve-raised-error{font-size:7.5px}.student-resolve-raised-footer,.student-resolve-raised-message-actions,.student-resolve-raised-success-actions{padding:7px 9px}.student-resolve-raised-secondary-button,.student-resolve-raised-primary-button{min-height:29px;padding:0 9px;font-size:8px;border-radius:7px}.student-resolve-raised-message-panel{padding:20px 14px}.student-resolve-raised-message-title{font-size:13px}.student-resolve-raised-message-copy{font-size:8px}.student-resolve-raised-success-icon{width:36px;height:36px;font-size:18px}.student-resolve-raised-success-cross{right:10px;top:7px;font-size:22px}}
`;
