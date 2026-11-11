interface Props {
  log: any;
  disabled: boolean;
  onAnswer: (selected: number) => void | Promise<void>;
  onImageClick?: (url: string) => void;
}

export default function Loop1FeedbackVerificationQuestion({ log, disabled, onAnswer, onImageClick }: Props) {
  if (!log) return null;

  return (
    <div id={`dlf-question-${log.id}`} className="dlf-form-section" style={{ marginTop: 16, padding: 14, border: "1px solid #CBD5E1", borderRadius: 12 }}>
      <div className="dlf-form-label">Cross Question{log.chapter_name ? ` · ${String(log.chapter_name).replace(/^__TP_MANUAL_CHAPTER__:/, "")}` : ""}</div>
      {log.cross_question_image_path ? (
        log.cross_question_image_url ? (
          <button type="button" onClick={() => onImageClick?.(log.cross_question_image_url)} aria-label="Enlarge cross-question image" style={{ display: "block", maxWidth: "100%", margin: "10px auto", padding: 0, border: 0, background: "transparent", cursor: "zoom-in" }}>
            <img src={log.cross_question_image_url} alt="Cross question (select to enlarge)" style={{ display: "block", maxWidth: "100%", maxHeight: 320, objectFit: "contain" }} />
          </button>
        ) : (
          <div>Question image is unavailable. Please contact your teacher.</div>
        )
      ) : (
        <div style={{ whiteSpace: "pre-wrap", margin: "10px 0", fontWeight: 600 }}>{log.cross_question_text}</div>
      )}
      {log.cross_question_options.map((option: string, index: number) => (
        <button
          key={`${log.id}-loop1-verification-${index}`}
          type="button"
          disabled={disabled}
          onClick={() => void onAnswer(Number(index))}
          style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 12px", marginTop: 8, borderRadius: 9, border: "1px solid #CBD5E1", background: "#FFFFFF", cursor: disabled ? "default" : "pointer" }}
        >
          {String.fromCharCode(65 + index)}. {option}
        </button>
      ))}
    </div>
  );
}
