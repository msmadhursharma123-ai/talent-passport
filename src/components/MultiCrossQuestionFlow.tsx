import { useEffect, useMemo, useRef, useState } from "react";

export type MultiCrossQuestion = {
  id: string;
  daily_log_uuid: string;
  question_order: number;
  question_type: "MCQ" | "TRUE_FALSE" | "FILL_UPS" | "ONE_WORD";
  question_text: string | null;
  image_path: string | null;
  image_url?: string | null;
  options: string[] | null;
};

export type MultiCrossQuestionAttempt = {
  daily_log_uuid: string;
  question_uuid: string;
  selected_value: string;
  is_correct: boolean;
  attempted_at?: string;
};

interface Props {
  logId: string;
  questions: MultiCrossQuestion[];
  attempts: Record<string, MultiCrossQuestionAttempt>;
  disabled?: boolean;
  onAttempt: (question: MultiCrossQuestion, selectedValue: string) => Promise<MultiCrossQuestionAttempt>;
  onAllCorrect: (question: MultiCrossQuestion, attempt: MultiCrossQuestionAttempt) => void;
  onWrong: (question: MultiCrossQuestion) => void;
  wrongMessage?: string;
  onScrollNext?: (question: MultiCrossQuestion) => void;
  onError?: (error: unknown) => void;
}

function normalizeQuestions(questions: MultiCrossQuestion[]) {
  return [...questions].sort((a, b) => a.question_order - b.question_order);
}

export default function MultiCrossQuestionFlow({
  logId,
  questions,
  attempts,
  disabled = false,
  onAttempt,
  onAllCorrect,
  onWrong,
  wrongMessage = "That answer is incorrect. You cannot try again or continue to another Cross Question.",
  onScrollNext,
  onError,
}: Props) {
  const ordered = useMemo(() => normalizeQuestions(questions), [questions]);
  const [fillAnswer, setFillAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageViewerUrl, setImageViewerUrl] = useState<string | null>(null);
  const wrongNotifiedRef = useRef(false);
  const previousCurrentIdRef = useRef<string | null>(null);

  const terminalWrong = ordered.find((question) => attempts[question.id]?.is_correct === false) ?? null;
  const nextQuestion = ordered.find((question) => !attempts[question.id]);
  const allCorrect = ordered.length >= 2 && ordered.every((question) => attempts[question.id]?.is_correct === true);
  const current = terminalWrong ?? nextQuestion ?? (allCorrect ? null : ordered[0]);

  useEffect(() => {
    setFillAnswer("");
  }, [current?.id]);

  useEffect(() => {
    const question = terminalWrong;
    if (!question || wrongNotifiedRef.current) return;
    wrongNotifiedRef.current = true;
    onWrong(question);
  }, [terminalWrong?.id]);

  useEffect(() => {
    if (!current || previousCurrentIdRef.current === null || previousCurrentIdRef.current === current.id) {
      previousCurrentIdRef.current = current?.id ?? null;
      return;
    }
    previousCurrentIdRef.current = current.id;
    window.requestAnimationFrame(() => {
      document.getElementById(`dlf-multi-question-${logId}-${current.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [current?.id, logId]);

  useEffect(() => {
    if (!imageViewerUrl) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setImageViewerUrl(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageViewerUrl]);

  if (ordered.length < 2) {
    return (
      <div role="alert" style={{ marginTop: 16, padding: 12, borderRadius: 10, background: "#FEF2F2", color: "#991B1B" }}>
        This Cross Question set is incomplete. Please contact your teacher.
      </div>
    );
  }

  async function answer(value: string) {
    if (!current || busy || disabled || attempts[current.id]) return;
    const normalized = value.trim();
    if (!normalized) return;
    setBusy(true);
    try {
      const result = await onAttempt(current, normalized);
      if (result.is_correct) {
        const following = ordered.find((question) => question.question_order === current.question_order + 1);
        if (following) {
          setSuccessMessage("Question answered correctly. Let's move to the next.");
          onScrollNext?.(following);
        } else {
          setSuccessMessage("All Cross Questions answered correctly.");
          // Completion is an answer-event transition only. Do not auto-fire
          // onAllCorrect on mount after a refresh; that would lose the
          // student's pre-refresh Partial/Didn't-understand context and could
          // skip the existing verification dialog.
          onAllCorrect(current, result);
        }
      }
    } catch (error) {
      onError?.(error);
    } finally {
      setBusy(false);
    }
  }

  const questionNumber = current?.question_order ?? ordered.length;

  return (
    <>
      <div id={`dlf-multi-question-${logId}`} className="dlf-form-section" style={{ marginTop: 16, padding: 14, border: "1px solid #CBD5E1", borderRadius: 12 }}>
        <div className="dlf-form-label">
          Cross Questions · {allCorrect ? "Completed" : `Question ${questionNumber} of ${ordered.length}`}
        </div>

        {allCorrect && (
          <div role="status" style={{ marginTop: 10, padding: 12, borderRadius: 10, background: "#ECFDF5", color: "#166534", fontWeight: 700 }}>
            All Cross Questions answered correctly.
          </div>
        )}

        {successMessage && !terminalWrong && !allCorrect && (
          <div role="status" style={{ marginTop: 10, padding: 12, borderRadius: 10, background: "#ECFDF5", color: "#166534", fontWeight: 700 }}>
            {successMessage}
          </div>
        )}

        {terminalWrong && (
          <div role="status" style={{ marginTop: 10, padding: 12, borderRadius: 10, background: "#FFF7ED", color: "#9A3412", fontWeight: 600 }}>
            {wrongMessage}
          </div>
        )}

        {current && !terminalWrong && !allCorrect && (
          <div id={`dlf-multi-question-${logId}-${current.id}`} style={{ marginTop: 10 }}>
            {current.image_url ? (
              <button type="button" onClick={() => setImageViewerUrl(current.image_url ?? null)} aria-label="Enlarge Cross Question image" style={{ display: "block", maxWidth: "100%", margin: "10px auto", padding: 0, border: 0, background: "transparent", cursor: "zoom-in" }}>
                <img src={current.image_url} alt="Cross Question" style={{ display: "block", maxWidth: "100%", maxHeight: 320, objectFit: "contain" }} />
              </button>
            ) : current.question_type === "FILL_UPS" && current.options?.[0] ? (
              <div style={{ whiteSpace: "pre-wrap", margin: "10px 0", fontWeight: 600 }}>{current.options[0]}</div>
            ) : current.question_text ? (
              <div style={{ whiteSpace: "pre-wrap", margin: "10px 0", fontWeight: 600 }}>{current.question_text}</div>
            ) : (
              <div style={{ margin: "10px 0", color: "#64748B" }}>Question content is unavailable. Please contact your teacher.</div>
            )}

            {current.question_type === "MCQ" && (current.options ?? []).map((option, index) => (
              <button
                key={`${current.id}-${index}`}
                type="button"
                disabled={busy || disabled}
                onClick={() => void answer(String(index))}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 12px", marginTop: 8, borderRadius: 9, border: "1px solid #CBD5E1", background: "#FFFFFF", cursor: busy || disabled ? "default" : "pointer" }}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}

            {current.question_type === "TRUE_FALSE" && ["True", "False"].map((option) => (
              <button
                key={`${current.id}-${option}`}
                type="button"
                disabled={busy || disabled}
                onClick={() => void answer(option === "True" ? "true" : "false")}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 12px", marginTop: 8, borderRadius: 9, border: "1px solid #CBD5E1", background: "#FFFFFF", cursor: busy || disabled ? "default" : "pointer" }}
              >
                {option}
              </button>
            ))}

            {(current.question_type === "FILL_UPS" || current.question_type === "ONE_WORD") && (
              <div style={{ marginTop: 10 }}>
                <input
                  type="text"
                  value={fillAnswer}
                  onChange={(event) => setFillAnswer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void answer(fillAnswer);
                  }}
                  disabled={busy || disabled}
                  autoComplete="off"
                  style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #CBD5E1", borderRadius: 9 }}
                  placeholder={current.question_type === "ONE_WORD" ? "Type one word" : "Type your answer"}
                />
                <button type="button" onClick={() => void answer(fillAnswer)} disabled={busy || disabled || !fillAnswer.trim()} style={{ marginTop: 8, minHeight: 42, padding: "9px 16px", borderRadius: 9, border: "1px solid #2563EB", background: "#2563EB", color: "#FFFFFF", fontWeight: 700 }}>
                  {busy ? "Checking…" : "Submit Answer"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {imageViewerUrl && (
        <div role="dialog" aria-modal="true" aria-label="Enlarged Cross Question image" onClick={(event) => { if (event.target === event.currentTarget) setImageViewerUrl(null); }} style={{ position: "fixed", inset: 0, zIndex: 3100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(2,6,23,.88)" }}>
          <button type="button" onClick={() => setImageViewerUrl(null)} aria-label="Close enlarged image" style={{ position: "absolute", top: 16, right: 16, width: 42, height: 42, border: "1px solid rgba(255,255,255,.65)", borderRadius: 999, background: "#fff", color: "#0f172a", fontSize: 26, cursor: "pointer" }}>×</button>
          <img src={imageViewerUrl} alt="Enlarged Cross Question" onClick={(event) => event.stopPropagation()} style={{ display: "block", maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} />
        </div>
      )}
    </>
  );
}
