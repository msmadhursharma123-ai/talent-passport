import { useEffect, useState } from "react";

export type TeacherCrossQuestionDraft = {
  questionType: "MCQ" | "TRUE_FALSE" | "FILL_UPS" | "ONE_WORD";
  questionText: string;
  imageFile: File | null;
  options: string[];
  correctIndex: string;
  acceptedAnswers: string[];
};

interface Props {
  questions: TeacherCrossQuestionDraft[];
  onChange: (questions: TeacherCrossQuestionDraft[]) => void;
  guidedHighlight?: boolean;
}

const emptyQuestion = (): TeacherCrossQuestionDraft => ({
  questionType: "MCQ",
  questionText: "",
  imageFile: null,
  options: ["", "", "", ""],
  correctIndex: "",
  acceptedAnswers: [""],
});

export function createEmptyTeacherCrossQuestion(): TeacherCrossQuestionDraft {
  return emptyQuestion();
}

function QuestionCard({
  question,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  question: TeacherCrossQuestionDraft;
  index: number;
  onChange: (next: TeacherCrossQuestionDraft) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [preview, setPreview] = useState("");
  const [imageViewerUrl, setImageViewerUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!question.imageFile) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(question.imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [question.imageFile]);

  useEffect(() => {
    if (!imageViewerUrl) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setImageViewerUrl(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageViewerUrl]);

  const setType = (questionType: TeacherCrossQuestionDraft["questionType"]) => {
    onChange({
      ...question,
      questionType,
      // Fill-ups are sentence-based by contract: changing to Fill-ups clears
      // any image so the teacher cannot accidentally publish an answer key that
      // has no visible sentence in which to hide the answer.
      imageFile: questionType === "FILL_UPS" ? null : question.imageFile,
      correctIndex: questionType === "MCQ" || questionType === "TRUE_FALSE" ? question.correctIndex : "",
      options: questionType === "MCQ" ? (question.options.length === 4 ? question.options : ["", "", "", ""]) : [],
      acceptedAnswers: questionType === "FILL_UPS" || questionType === "ONE_WORD" ? (question.acceptedAnswers.length ? question.acceptedAnswers : [""]) : [],
    });
  };

  return (
    <>
    <div style={{ marginTop: 14, padding: 14, border: "1px solid #CBD5E1", borderRadius: 14, background: "#FFFFFF" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Cross Question {index + 1}</div>
        {canRemove && <button type="button" onClick={onRemove} style={{ border: "0", background: "transparent", color: "#B91C1C", fontWeight: 700, cursor: "pointer" }}>Remove</button>}
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Question type</div>
        <select value={question.questionType} onChange={(event) => setType(event.target.value as TeacherCrossQuestionDraft["questionType"])} style={{ width: "100%", padding: "10px 11px", border: "1px solid #CBD5E1", borderRadius: 9, background: "#FFFFFF" }}>
          <option value="MCQ">MCQ</option>
          <option value="TRUE_FALSE">True / False</option>
          <option value="FILL_UPS">Fill-ups</option>
          <option value="ONE_WORD">One-word</option>
        </select>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
          {question.questionType === "FILL_UPS" ? "Full sentence" : "Question text (or use image)"}
        </div>
        <textarea
          value={question.questionText}
          disabled={question.questionType !== "FILL_UPS" && !!question.imageFile}
          onChange={(event) => onChange({ ...question, questionText: event.target.value })}
          placeholder={question.questionType === "FILL_UPS" ? "Type the complete sentence; the accepted answer will be hidden automatically for students." : "Type the question, or attach a question image below"}
          style={{ width: "100%", boxSizing: "border-box", minHeight: 84, padding: "10px 11px", border: "1px solid #CBD5E1", borderRadius: 9, resize: "vertical" }}
        />
        {question.questionType === "FILL_UPS" && (
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748B", lineHeight: 1.45 }}>
            Enter the complete sentence and put the word/phrase to hide in the Accepted answer field below. Students will see the same sentence with that answer replaced by a blank.
          </div>
        )}
      </div>

      {question.questionType !== "FILL_UPS" && <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Attach or capture question image <span style={{ color: "#64748B" }}>(alternative)</span></div>
        <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            alert("Please use a JPG, PNG, or WebP image.");
            event.currentTarget.value = "";
            return;
          }
          if (file && file.size > 5 * 1024 * 1024) {
            alert("The question image must be 5 MB or smaller.");
            event.currentTarget.value = "";
            return;
          }
          onChange({ ...question, imageFile: file, questionText: file ? "" : question.questionText });
        }} style={{ width: "100%", boxSizing: "border-box", padding: 10, border: "1px solid #CBD5E1", borderRadius: 9 }} />
        {question.imageFile && <button type="button" onClick={() => { setImageViewerUrl(null); onChange({ ...question, imageFile: null }); }} style={{ marginTop: 6 }}>Remove image</button>}
        {preview && (
          <button type="button" onClick={() => setImageViewerUrl(preview)} aria-label={`Enlarge Cross Question ${index + 1} image`} style={{ display: "block", maxWidth: "100%", marginTop: 10, padding: 0, border: 0, background: "transparent", cursor: "zoom-in" }}>
            <img src={preview} alt={`Cross Question ${index + 1} preview (select to enlarge)`} style={{ display: "block", maxWidth: "100%", maxHeight: 240, margin: "0 auto", objectFit: "contain", borderRadius: 10 }} />
          </button>
        )}
      </div>}

      {question.questionType === "MCQ" && (
        <div style={{ marginTop: 10 }}>
          {question.options.map((option, optionIndex) => (
            <div key={optionIndex} style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 5 }}>Option {optionIndex + 1} <span style={{ color: "#DC2626" }}>*</span></div>
              <input value={option} onChange={(event) => onChange({ ...question, options: question.options.map((value, i) => i === optionIndex ? event.target.value : value) })} placeholder={`Enter option ${optionIndex + 1}`} style={{ width: "100%", boxSizing: "border-box", padding: "10px 11px", border: "1px solid #CBD5E1", borderRadius: 9 }} />
              <label style={{ display: "inline-flex", gap: 8, alignItems: "center", marginTop: 5, fontSize: 13, color: "#334155" }}>
                <input type="radio" name={`cross-question-correct-${index}`} checked={question.correctIndex === String(optionIndex)} onChange={() => onChange({ ...question, correctIndex: String(optionIndex) })} />
                Correct answer
              </label>
            </div>
          ))}
        </div>
      )}

      {question.questionType === "TRUE_FALSE" && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>Correct answer</div>
          <label style={{ marginRight: 18, fontSize: 13 }}><input type="radio" name={`cross-question-tf-${index}`} checked={question.correctIndex === "0"} onChange={() => onChange({ ...question, correctIndex: "0" })} /> True</label>
          <label style={{ fontSize: 13 }}><input type="radio" name={`cross-question-tf-${index}`} checked={question.correctIndex === "1"} onChange={() => onChange({ ...question, correctIndex: "1" })} /> False</label>
        </div>
      )}

      {(question.questionType === "FILL_UPS" || question.questionType === "ONE_WORD") && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
            {question.questionType === "FILL_UPS" ? "Word / phrase to hide" : "Accepted answer(s)"} <span style={{ color: "#64748B" }}>{question.questionType === "FILL_UPS" ? "(students will see this part as a blank)" : "(add alternatives when needed)"}</span>
          </div>
          {question.acceptedAnswers.map((answer, answerIndex) => (
            <div key={answerIndex} style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input value={answer} onChange={(event) => onChange({ ...question, acceptedAnswers: question.acceptedAnswers.map((value, i) => i === answerIndex ? event.target.value : value) })} placeholder={question.questionType === "ONE_WORD" ? "Accepted word" : "Word / phrase to hide"} style={{ flex: 1, minWidth: 0, padding: "10px 11px", border: "1px solid #CBD5E1", borderRadius: 9 }} />
              {question.questionType === "ONE_WORD" && question.acceptedAnswers.length > 1 && <button type="button" onClick={() => onChange({ ...question, acceptedAnswers: question.acceptedAnswers.filter((_, i) => i !== answerIndex) })}>Remove</button>}
            </div>
          ))}
          {question.questionType === "ONE_WORD" && <button type="button" onClick={() => onChange({ ...question, acceptedAnswers: [...question.acceptedAnswers, ""] })} style={{ marginTop: 8 }}>+ Add accepted answer</button>}
        </div>
      )}
    </div>
    {imageViewerUrl && (
      <div role="dialog" aria-modal="true" aria-label={`Enlarged Cross Question ${index + 1} image`} onClick={(event) => { if (event.target === event.currentTarget) setImageViewerUrl(null); }} style={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(2, 6, 23, 0.88)" }}>
        <button type="button" onClick={() => setImageViewerUrl(null)} aria-label="Close enlarged Cross Question image" style={{ position: "absolute", top: 16, right: 16, zIndex: 1, width: 42, height: 42, border: "1px solid rgba(255,255,255,.65)", borderRadius: 999, background: "#fff", color: "#0f172a", fontSize: 26, cursor: "pointer" }}>×</button>
        <img src={imageViewerUrl} alt={`Enlarged Cross Question ${index + 1}`} onClick={(event) => event.stopPropagation()} style={{ display: "block", maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} />
      </div>
    )}
    </>
  );
}

export default function TeacherDailyLogCrossQuestionBuilder({ questions, onChange, guidedHighlight = false }: Props) {
  const safeQuestions = questions.length >= 2 ? questions : [emptyQuestion(), emptyQuestion()];

  useEffect(() => {
    if (questions.length < 2) onChange(safeQuestions);
    // Intentional one-time repair of legacy single-question local state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length]);

  return (
    <div id="tp-daily-log-question" style={{ border: guidedHighlight ? "2px solid #2563EB" : "1px solid #E2E8F0", boxShadow: guidedHighlight ? "0 0 0 4px rgba(37, 99, 235, 0.16)" : "none", borderRadius: 14, padding: 14, background: "#FFFFFF" }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Cross Questions <span style={{ color: "#DC2626" }}>*</span></div>
      <div style={{ fontSize: 12, color: "#64748B", marginTop: 5, lineHeight: 1.5 }}>Add at least 2 Cross Questions. There is no maximum. Students answer them in order. Correct answers advance automatically; the first wrong answer ends the Cross Question flow.</div>
      {safeQuestions.map((question, index) => (
        <QuestionCard key={index} question={question} index={index} canRemove={safeQuestions.length > 2} onChange={(next) => onChange(safeQuestions.map((item, i) => i === index ? next : item))} onRemove={() => onChange(safeQuestions.filter((_, i) => i !== index))} />
      ))}
      <button type="button" onClick={() => onChange([...safeQuestions, emptyQuestion()])} style={{ marginTop: 12, minHeight: 42, padding: "9px 16px", borderRadius: 9, border: "1px solid #2563EB", background: "#FFFFFF", color: "#1D4ED8", fontWeight: 800, cursor: "pointer" }}>+ Add Cross Question</button>
    </div>
  );
}
