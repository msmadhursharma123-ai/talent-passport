import { useEffect, useMemo, useRef, useState } from "react";
import type {
  MultiCrossQuestion,
} from "./MultiCrossQuestionFlow";
import type {
  Loop2MultiCrossQuestionAttempt,
} from "../domains/teacherIntelligence/repository/Loop2MultiCrossQuestionRepository";

interface Props {
  doubtId: string;
  questions: MultiCrossQuestion[];
  attempts: Record<string, Loop2MultiCrossQuestionAttempt>;
  disabled?: boolean;
  onAttempt: (
    question: MultiCrossQuestion,
    selectedValue: string,
  ) => Promise<Loop2MultiCrossQuestionAttempt>;
  onBeforeFirstAttemptCancel: () => void;
  onTerminalWrong: (question: MultiCrossQuestion) => void;
  onAllCorrect: (
    question: MultiCrossQuestion,
    attempt: Loop2MultiCrossQuestionAttempt,
  ) => void;
  onError?: (error: unknown) => void;
}

function normalizeQuestions(questions: MultiCrossQuestion[]) {
  return [...questions].sort((a, b) => a.question_order - b.question_order);
}

export default function Loop2MultiCrossQuestionFlow({
  doubtId,
  questions,
  attempts,
  disabled = false,
  onAttempt,
  onBeforeFirstAttemptCancel,
  onTerminalWrong,
  onAllCorrect,
  onError,
}: Props) {
  const ordered = useMemo(() => normalizeQuestions(questions), [questions]);
  const [fillAnswer, setFillAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  const firstAttemptExists = ordered.some((q) => Boolean(attempts[q.id]));
  const terminalWrong =
    ordered.find((q) => attempts[q.id]?.is_correct === false) ?? null;
  const questionSetDeferred =
    ordered.find(
      (q) =>
        attempts[q.id]?.resolution_status ===
        "DEFERRED_QUESTION_SET_CHANGED",
    ) ?? null;
  const terminalAttempt = ordered[ordered.length - 1]
    ? attempts[ordered[ordered.length - 1].id]
    : undefined;
  const allCorrect =
    ordered.length >= 2 &&
    ordered.every((q) => attempts[q.id]?.is_correct === true) &&
    terminalAttempt?.resolution_status === "DISCUSSED";
  const current =
    terminalWrong ??
    questionSetDeferred ??
    ordered.find((q) => !attempts[q.id]) ??
    (allCorrect ? null : ordered[0]);

  useEffect(() => {
    setFillAnswer("");
  }, [current?.id]);

  if (ordered.length < 2) return null;

  async function answer(value: string) {
    if (
      !current ||
      busy ||
      disabled ||
      attempts[current.id] ||
      questionSetDeferred
    ) return;

    const normalized = value.trim();
    if (!normalized) return;

    setBusy(true);

    try {
      const result = await onAttempt(current, normalized);

      if (result.resolution_status === "NOT DISCUSSED") {
        // A wrong answer is terminal. The parent reconciles the guided queue
        // only after the authoritative RPC has committed NOT DISCUSSED.
        onTerminalWrong(current);
      } else if (result.is_correct) {
        const following = ordered.find(
          (question) =>
            question.question_order === current.question_order + 1,
        );

        if (!following) {
          if (result.resolution_status === "DISCUSSED") {
            // The final correct answer is the only event that can complete the
            // Multi-Cross sequence. The server has already committed DISCUSSED.
            onAllCorrect(current, result);
          }
        } else {
          window.requestAnimationFrame(() => {
            document
              .getElementById(
                `dlf-loop2-multi-question-${doubtId}-${following.id}`,
              )
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          });
        }
      }
    } catch (error) {
      onError?.(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      id={`dlf-loop2-multi-question-${doubtId}`}
      className="dlf-gap-meta"
      style={{
        marginTop: 12,
        border: "2px solid #2563eb",
        boxShadow: "0 0 0 3px rgba(37,99,235,.12)",
      }}
    >
      <div className="dlf-label">
        Recheck the Cross Questions
      </div>

      {!firstAttemptExists && !terminalWrong && (
        <div className="dlf-response-options" style={{ marginTop: 8 }}>
          <label className="dlf-choice">
            <input
              type="radio"
              name={`loop2-multi-response-${doubtId}`}
              checked
              disabled={disabled || busy}
              onChange={() => undefined}
            />
            <span>Yes, discussed today</span>
          </label>

          <label className="dlf-choice">
            <input
              type="radio"
              name={`loop2-multi-response-${doubtId}`}
              disabled={disabled || busy}
              onChange={() => {
                onBeforeFirstAttemptCancel();
              }}
            />
            <span>Not discussed yet</span>
          </label>
        </div>
      )}

      {questionSetDeferred && !terminalWrong && !allCorrect && (
        <div
          role="status"
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 10,
            background: "#FEF3C7",
            color: "#92400E",
            fontWeight: 700,
          }}
        >
          Your answer was recorded, but the Cross Question set changed. The
          doubt was not resolved. Please refresh and try again after the
          teacher finishes editing.
        </div>
      )}

      {allCorrect && (
        <div
          role="status"
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 10,
            background: "#ECFDF5",
            color: "#166534",
            fontWeight: 700,
          }}
        >
          All Cross Questions answered correctly. Your doubt is being marked
          discussed.
        </div>
      )}

      {terminalWrong && (
        <div
          role="status"
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 10,
            background: "#FFF7ED",
            color: "#9A3412",
            fontWeight: 700,
          }}
        >
          {attempts[terminalWrong.id]?.resolution_status === "DEFERRED_QUESTION_SET_CHANGED"
            ? "Your answer was recorded, but the Cross Question set changed. The doubt was not resolved. Please refresh and try again after the teacher finishes editing."
            : "That answer is incorrect. This doubt is not marked as discussed."}
        </div>
      )}

      {current && !terminalWrong && !questionSetDeferred && !allCorrect && (
        <div
          id={`dlf-loop2-multi-question-${doubtId}-${current.id}`}
          style={{ marginTop: 10 }}
        >
          <div className="dlf-label">
            Question {current.question_order} of {ordered.length}
          </div>

          {current.image_path && !current.image_url ? (
            <div
              role="alert"
              style={{
                margin: "10px 0",
                padding: 10,
                borderRadius: 8,
                background: "#FEF2F2",
                color: "#991B1B",
                fontWeight: 700,
              }}
            >
              The question image is unavailable. Your doubt cannot be resolved
              until the question is visible.
            </div>
          ) : current.image_url ? (
            <img
              src={current.image_url}
              alt="Cross Question"
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: 260,
                objectFit: "contain",
                margin: "10px auto",
              }}
            />
          ) : current.question_type === "FILL_UPS" &&
            current.options?.[0] ? (
            <div
              style={{
                whiteSpace: "pre-wrap",
                margin: "10px 0",
                fontWeight: 700,
              }}
            >
              {current.options[0]}
            </div>
          ) : current.question_text ? (
            <div
              style={{
                whiteSpace: "pre-wrap",
                margin: "10px 0",
                fontWeight: 700,
              }}
            >
              {current.question_text}
            </div>
          ) : (
            <div style={{ margin: "10px 0", color: "#64748B" }}>
              Question content is unavailable. Your doubt cannot be resolved.
            </div>
          )}

          {current.question_type === "MCQ" &&
            (current.options ?? []).map((option, index) => (
              <button
                key={`${current.id}-${index}`}
                type="button"
                disabled={busy || disabled || Boolean(current.image_path && !current.image_url)}
                onClick={() => void answer(String(index))}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "11px 12px",
                  marginTop: 8,
                  borderRadius: 9,
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  cursor: busy || disabled ? "default" : "pointer",
                }}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}

          {current.question_type === "TRUE_FALSE" &&
            ["True", "False"].map((option) => (
              <button
                key={`${current.id}-${option}`}
                type="button"
                disabled={busy || disabled || Boolean(current.image_path && !current.image_url)}
                onClick={() =>
                  void answer(option === "True" ? "true" : "false")
                }
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "11px 12px",
                  marginTop: 8,
                  borderRadius: 9,
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  cursor: busy || disabled ? "default" : "pointer",
                }}
              >
                {option}
              </button>
            ))}

          {(current.question_type === "FILL_UPS" ||
            current.question_type === "ONE_WORD") && (
            <div style={{ marginTop: 10 }}>
              <input
                type="text"
                value={fillAnswer}
                onChange={(event) => setFillAnswer(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void answer(fillAnswer);
                }}
                disabled={busy || disabled || Boolean(current.image_path && !current.image_url)}
                autoComplete="off"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 12px",
                  border: "1px solid #CBD5E1",
                  borderRadius: 9,
                }}
                placeholder={
                  current.question_type === "ONE_WORD"
                    ? "Type one word"
                    : "Type your answer"
                }
              />
              <button
                type="button"
                onClick={() => void answer(fillAnswer)}
                disabled={busy || disabled || Boolean(current.image_path && !current.image_url) || !fillAnswer.trim()}
                style={{
                  marginTop: 8,
                  minHeight: 42,
                  padding: "9px 16px",
                  borderRadius: 9,
                  border: "1px solid #2563EB",
                  background: "#2563EB",
                  color: "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                {busy ? "Checking…" : "Submit Answer"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
