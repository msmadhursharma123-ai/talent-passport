import { useEffect, useRef, useState, type CSSProperties } from "react";

import {
  getCurrentTeacher,
} from "../../../services/identityService";

import {
  getTeacherAssignmentsByTeacher,
} from "../repository/TeacherAssignmentRepository";

import {
  getPreviousTeacherDailyLogByAssignment,
} from "../repository/TeacherDailyLogRepository";

import {
  getLessonPlannerDailyLogReference,
} from "../repository/LessonPlannerDailyLogBridgeRepository";

import { getStudyMaterialChaptersForTeacher } from "../../studyMaterial/common/studyMaterialRepository";
import { getSupabaseClient } from "../../../supabaseClient";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (
    data: Record<string, unknown>
  ) => Promise<void>;
  submitting?: boolean;
}

export default function TeacherDailyLogDialog({
  open,
  onClose,
  onSave,
  submitting = false,
}: Props) {
  const [
    selectedAssignmentId,
    setSelectedAssignmentId,
  ] = useState("");

  const [assignments, setAssignments] =
    useState<any[]>([]);
  const [guidedStep, setGuidedStep] = useState<
    "classroom" | "chapter" | "manualChapter" | "topic" | "subtopics" | "question" | "options" | "done"
  >("classroom");

  // Additive Cross Question state. Existing lesson-planner and previous-log
  // state remains independent and unchanged.
  const [chapterOptions, setChapterOptions] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [manualChapterName, setManualChapterName] = useState("");
  const OTHER_CHAPTER_VALUE = "__TP_OTHER_CHAPTER__";
  const [crossQuestionText, setCrossQuestionText] = useState("");
  const [crossQuestionImage, setCrossQuestionImage] = useState<File | null>(null);
  const [crossQuestionImagePreview, setCrossQuestionImagePreview] = useState("");
  const [crossQuestionImageViewerOpen, setCrossQuestionImageViewerOpen] = useState(false);
  const [crossQuestionOptions, setCrossQuestionOptions] = useState(["", "", "", ""]);
  const [crossQuestionCorrectIndex, setCrossQuestionCorrectIndex] = useState("0");


  const [topicName, setTopicName] =
    useState("");

  const [pageFrom, setPageFrom] =
    useState("");

  const [pageTo, setPageTo] =
    useState("");

  const [
    homeworkGiven,
    setHomeworkGiven,
  ] = useState(false);

  const [
    activityConducted,
    setActivityConducted,
  ] = useState(false);

  const [teacherNotes, setTeacherNotes] =
    useState("");

  const [conceptInput, setConceptInput] =
    useState("");

  const [
    conceptsCovered,
    setConceptsCovered,
  ] = useState<string[]>([]);

  const [previousLog, setPreviousLog] =
    useState<any | null>(null);

  const [previousLogLoading, setPreviousLogLoading] =
    useState(false);

  // Additive lesson-planner bridge state. This does not alter the existing UI.
  const [dailyLogBusinessDate, setDailyLogBusinessDate] =
    useState("");
  const lessonPlannerAutoFillRef = useRef(false);

  useEffect(() => {
    loadTeacherAssignments();
  }, []);

  useEffect(() => {
    if (open) {
      resetForm();
      // Capture the India classroom business date each time the dialog opens.
      setDailyLogBusinessDate(getIndiaCalendarDateKey());
    }
  }, [open]);

  useEffect(() => {
    let active = true;

    if (!selectedAssignmentId) {
      setPreviousLog(null);
      setPreviousLogLoading(false);
      return () => {
        active = false;
      };
    }

    setPreviousLog(null);
    setPreviousLogLoading(true);

    void getPreviousTeacherDailyLogByAssignment(
      selectedAssignmentId
    )
      .then((log) => {
        if (!active) return;
        setPreviousLog(log);
      })
      .catch((error) => {
        // Reference loading is intentionally non-blocking.
        // A failure here must never affect Daily Log publishing.
        console.error(
          "PREVIOUS DAILY LOG REFERENCE LOAD FAILED",
          error
        );
        if (active) setPreviousLog(null);
      })
      .finally(() => {
        if (active) setPreviousLogLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedAssignmentId]);

  // =========================================================
  // LESSON PLANNER -> DAILY LOG AUTO-FILL BRIDGE
  // =========================================================
  useEffect(() => {
    let active = true;

    if (!selectedAssignmentId || !dailyLogBusinessDate) {
      return () => {
        active = false;
      };
    }

    const selectedAssignment = assignments.find(
      (item) => String(item.id) === selectedAssignmentId
    );

    if (!selectedAssignment) {
      return () => {
        active = false;
      };
    }

    // If the previous classroom was auto-filled from its planner, clear only
    // those automation-provided fields before resolving the newly selected
    // classroom. Manual Daily Log behavior remains unchanged when no planner
    // record is found.
    if (lessonPlannerAutoFillRef.current) {
      setTopicName("");
      setConceptsCovered([]);
      lessonPlannerAutoFillRef.current = false;
    }

    void getLessonPlannerDailyLogReference({
      teacherUuid: String(getCurrentTeacher()?.teacherUuid ?? ""),
      className: String(selectedAssignment.className ?? ""),
      sectionName: String(selectedAssignment.sectionName ?? ""),
      subjectName: String(selectedAssignment.subjectName ?? ""),
      businessDate: dailyLogBusinessDate,
    })
      .then((reference) => {
        if (!active || !reference) return;

        setTopicName(reference.topicName);
        setConceptsCovered(reference.conceptsCovered);
        lessonPlannerAutoFillRef.current = true;
      })
      .catch((error) => {
        // Planner automation is supplementary. A planner lookup failure must
        // never block or alter the existing Daily Log publication path.
        console.warn(
          "LESSON PLANNER DAILY LOG AUTO-FILL LOOKUP FAILED",
          error
        );
      });

    return () => {
      active = false;
    };
  }, [selectedAssignmentId, assignments, dailyLogBusinessDate]);

  useEffect(() => {
    let active = true;
    const assignment = assignments.find(
      (item) => String(item.id) === selectedAssignmentId
    );
    setChapterOptions([]);
    setSelectedChapter("");
    setManualChapterName("");
    if (!assignment) return () => { active = false; };
    void getStudyMaterialChaptersForTeacher(
      String(assignment.className ?? ""),
      String(assignment.subjectName ?? "")
    ).then((chapters) => {
      if (active) setChapterOptions(chapters);
    }).catch((error) => {
      console.warn("DAILY LOG CHAPTER OPTIONS LOAD FAILED", error);
      if (active) setChapterOptions([]);
    });
    return () => { active = false; };
  }, [selectedAssignmentId, assignments]);

  useEffect(() => {
    if (!crossQuestionImage) {
      setCrossQuestionImagePreview("");
      return;
    }
    const url = URL.createObjectURL(crossQuestionImage);
    setCrossQuestionImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [crossQuestionImage]);

  useEffect(() => {
    if (!crossQuestionImageViewerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCrossQuestionImageViewerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [crossQuestionImageViewerOpen]);

  function resetForm() {
    setSelectedAssignmentId("");
    setTopicName("");
    setPageFrom("");
    setPageTo("");
    setHomeworkGiven(false);
    setActivityConducted(false);
    setTeacherNotes("");
    setConceptInput("");
    setConceptsCovered([]);
    setSelectedChapter("");
    setManualChapterName("");
    setCrossQuestionText("");
    setCrossQuestionImage(null);
    setCrossQuestionImagePreview("");
    setCrossQuestionImageViewerOpen(false);
    setCrossQuestionOptions(["", "", "", ""]);
    setCrossQuestionCorrectIndex("0");
    setPreviousLog(null);
    setPreviousLogLoading(false);
    setDailyLogBusinessDate("");
    lessonPlannerAutoFillRef.current = false;
  }

  async function loadTeacherAssignments() {
    const teacher =
      getCurrentTeacher();

    if (!teacher) return;

    const assignments =
      await getTeacherAssignmentsByTeacher(
        teacher.teacherUuid
      );

    setAssignments(assignments);
  }

  const selectedAssignment = assignments.find(
    (item) => String(item.id) === selectedAssignmentId
  );

  // Recognize common Hindi subject labels without changing assignment data.
  // lang="hi" is a browser/IME hint; a web page cannot force the OS keyboard.
  const normalizedSubjectName = String(selectedAssignment?.subjectName ?? "")
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s._()-]+/g, " ");
  const isHindiSubject =
    /(^|[^a-z])hindi([^a-z]|$)/i.test(normalizedSubjectName) ||
    normalizedSubjectName.includes("हिंदी") ||
    normalizedSubjectName.includes("हिन्दी");

  useEffect(() => {
    if (!open) return;
    setGuidedStep("classroom");
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("tp-daily-log-classroom")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const targetIds: Record<typeof guidedStep, string> = {
      classroom: "tp-daily-log-classroom",
      chapter: "tp-daily-log-chapter",
      manualChapter: "tp-daily-log-manual-chapter",
      topic: "tp-daily-log-topic",
      subtopics: "tp-daily-log-subtopics",
      question: "tp-daily-log-question",
      options: "tp-daily-log-options",
      done: "tp-daily-log-options",
    };
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetIds[guidedStep])?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, guidedStep]);

  useEffect(() => {
    if (!open || guidedStep !== "manualChapter" || !manualChapterName.trim()) return;
    const timeout = window.setTimeout(() => setGuidedStep("topic"), 2000);
    return () => window.clearTimeout(timeout);
  }, [open, guidedStep, manualChapterName]);

  useEffect(() => {
    if (!open || guidedStep !== "topic" || !topicName.trim()) return;
    const timeout = window.setTimeout(() => setGuidedStep("subtopics"), 2000);
    return () => window.clearTimeout(timeout);
  }, [open, guidedStep, topicName]);

  useEffect(() => {
    if (open && guidedStep === "subtopics" && conceptsCovered.length >= 3) {
      setGuidedStep("question");
    }
  }, [open, guidedStep, conceptsCovered.length]);

  useEffect(() => {
    if (!open || guidedStep !== "question" || !crossQuestionText.trim()) return;
    const timeout = window.setTimeout(() => setGuidedStep("options"), 2000);
    return () => window.clearTimeout(timeout);
  }, [open, guidedStep, crossQuestionText]);

  const guidedHighlightStyle: CSSProperties = {
    border: "2px solid #2563EB",
    boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.16)",
    outline: "none",
    transition: "border-color 160ms ease, box-shadow 160ms ease",
  };

  if (!open) {
    return null;
  }

  function addConcept() {
    const normalizedConcept = conceptInput.trim();

    if (!normalizedConcept) return;

    const alreadyExists = conceptsCovered.some(
      (item) =>
        item.trim().toLowerCase() ===
        normalizedConcept.toLowerCase()
    );

    if (!alreadyExists) {
      const nextConcepts = [...conceptsCovered, normalizedConcept];
      setConceptsCovered(nextConcepts);
      if (nextConcepts.length >= 3) setGuidedStep("question");
    } else if (conceptsCovered.length >= 3) {
      setGuidedStep("question");
    }

    setConceptInput("");
  }

  function usePreviousTopic() {
    if (!previousLog?.topicName) return;
    setTopicName(String(previousLog.topicName));
  }

  function usePreviousConcept(concept: string) {
    const value = String(concept ?? "").trim();
    if (!value) return;

    const alreadyExists = conceptsCovered.some(
      (item) =>
        item.trim().toLowerCase() === value.toLowerCase()
    );

    if (!alreadyExists) {
      setConceptsCovered([
        ...conceptsCovered,
        value,
      ]);
    }
  }

  function usePreviousLessonReference() {
    if (!previousLog) return;

    if (previousLog.topicName) {
      setTopicName(String(previousLog.topicName));
    }

    const previousConcepts = Array.isArray(
      previousLog.conceptsCovered
    )
      ? previousLog.conceptsCovered
          .map((item: unknown) => String(item ?? "").trim())
          .filter(Boolean)
      : [];

    if (previousConcepts.length > 0) {
      const merged = [
        ...conceptsCovered,
        ...previousConcepts,
      ];

      setConceptsCovered(
        Array.from(
          new Map(
            merged.map((item) => [
              item.toLowerCase(),
              item,
            ])
          ).values()
        )
      );
    }
  }

  function removeConcept(
    index: number
  ) {
    setConceptsCovered(
      conceptsCovered.filter(
        (_, i) => i !== index
      )
    );
  }

  function getIndiaCalendarDateKey() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const year = parts.find(
      (part) => part.type === "year"
    )?.value ?? "";

    const month = parts.find(
      (part) => part.type === "month"
    )?.value ?? "";

    const day = parts.find(
      (part) => part.type === "day"
    )?.value ?? "";

    return `${year}-${month}-${day}`;
  }

  async function handleSave() {
    const selectedAssignment =
      assignments.find(
        (item) =>
          String(item.id) ===
          selectedAssignmentId
      );

    if (!selectedAssignment) {
      alert(
        "Invalid Teacher Assignment."
      );

      return;
    }

    if (
      conceptsCovered.length < 3
    ) {
      alert(
        "Please add at least 3 concepts or subtopics covered in today's lecture."
      );

      return;
    }

    const normalizedConcepts = Array.from(
      new Set(
        conceptsCovered
          .map((concept) => concept.trim())
          .filter(Boolean)
      )
    );

    if (normalizedConcepts.length < 3) {
      alert(
        "Please add at least 3 unique concepts or subtopics covered in today's lecture."
      );
      return;
    }

    const questionText = crossQuestionText.trim();
    const normalizedQuestionOptions = crossQuestionOptions.map((option) => option.trim());
    const hasCrossQuestion = Boolean(questionText || crossQuestionImage);
    // A Cross Question is chapter-scoped in the approved lesson flow. Keep
    // chapter optional for legacy/no-question daily logs, but do not publish a
    // question that cannot be associated with the selected Study Material chapter.
    const resolvedChapterName =
      selectedChapter === OTHER_CHAPTER_VALUE
        ? manualChapterName.trim()
        : selectedChapter.trim();

    if (hasCrossQuestion && !resolvedChapterName) {
      alert(
        selectedChapter === OTHER_CHAPTER_VALUE
          ? "Please enter the chapter name before adding a Cross Question."
          : "Please select a chapter before adding a Cross Question."
      );
      return;
    }
    if (hasCrossQuestion) {
      if (!questionText && !crossQuestionImage) {
        alert("Enter a cross-question or attach an image.");
        return;
      }
      if (questionText && crossQuestionImage) {
        alert("Use either question text or an image, not both.");
        return;
      }
      if (crossQuestionImage) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(crossQuestionImage.type)) {
          alert("Please use a JPG, PNG, or WebP image.");
          return;
        }
        if (crossQuestionImage.size > 5 * 1024 * 1024) {
          alert("The question image must be 5 MB or smaller.");
          return;
        }
      }
      if (normalizedQuestionOptions.some((option) => !option)) {
        alert("Please enter all four cross-question options.");
        return;
      }
      if (new Set(normalizedQuestionOptions.map((option) => option.toLocaleLowerCase())).size !== 4) {
        alert("All four cross-question options must be unique.");
        return;
      }
    }

    let uploadedImagePath: string | null = null;
    if (hasCrossQuestion && crossQuestionImage) {
      const supabase = getSupabaseClient();
      const teacherUuid = String(getCurrentTeacher()?.teacherUuid ?? "").trim();
      if (!supabase || !teacherUuid) {
        alert("Your teacher session could not be verified. Please sign in again.");
        return;
      }
      const extension = crossQuestionImage.type === "image/png" ? "png" : crossQuestionImage.type === "image/webp" ? "webp" : "jpg";
      const safeToken = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      uploadedImagePath = `${teacherUuid}/${String(selectedAssignment.id)}/${safeToken}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("daily-log-cross-questions")
        .upload(uploadedImagePath, crossQuestionImage, {
          contentType: crossQuestionImage.type,
          upsert: false,
          cacheControl: "3600",
        });
      if (uploadError) {
        console.error("CROSS QUESTION IMAGE UPLOAD FAILED", uploadError);
        alert("The question image could not be uploaded. Please try again.");
        return;
      }
    }

    await onSave({
      teacher_assignment_uuid:
        selectedAssignment.id,

      class_name:
        selectedAssignment.className,

      section_name:
        selectedAssignment.sectionName,

      subject_name:
        selectedAssignment.subjectName,

      topic_name:
        topicName,

      concepts_covered:
        normalizedConcepts,

      chapter_name: resolvedChapterName
        ? selectedChapter === OTHER_CHAPTER_VALUE
          ? `__TP_MANUAL_CHAPTER__:${resolvedChapterName}`
          : resolvedChapterName
        : null,
      cross_question_text: questionText || null,
      cross_question_image_path: uploadedImagePath,
      cross_question_options: hasCrossQuestion ? normalizedQuestionOptions : null,
      cross_question_correct_index: hasCrossQuestion ? Number(crossQuestionCorrectIndex) : null,

      page_from:
        Number(pageFrom),

      page_to:
        Number(pageTo),

      homework_given:
        homeworkGiven,

      activity_conducted:
        activityConducted,

      teacher_notes:
        teacherNotes,

      // log_date is the classroom BUSINESS DATE.
      // Store the India calendar date (YYYY-MM-DD), not a UTC timestamp.
      // This keeps teacher submission and student "today" filtering aligned.
      log_date:
        getIndiaCalendarDateKey(),
    });

    resetForm();
    onClose();
  }

  return (
    <div
      className="tp-log-dialog-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding: "24px",

        background:
          "rgba(15, 23, 42, 0.58)",

        backdropFilter: "blur(5px)",
      }}
    >
      <div
        className="tp-log-dialog"
        style={{
          position: "relative",
          overflowY: "auto",
          overflowX: "hidden",

          width: "100%",
          maxWidth: "650px",
          maxHeight: "92vh",

          background:
            "linear-gradient(145deg, #FFFFFF 0%, #FFFFFF 72%, #FFFCF8 100%)",

          border:
            "1px solid #E2E8F0",

          borderRadius: "28px",

          boxShadow:
            "0 30px 80px rgba(15, 23, 42, 0.22)",
        }}
      >
        {/* =========================================
            DECORATIVE BACKGROUND
           ========================================= */}

        <div
          style={{
            position: "absolute",

            width: "220px",
            height: "220px",

            borderRadius: "50%",

            background:
              "rgba(249, 115, 22, 0.055)",

            right: "-75px",
            top: "-100px",

            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",

            width: "105px",
            height: "105px",

            borderRadius: "50%",

            background:
              "rgba(249, 115, 22, 0.04)",

            right: "150px",
            top: "-55px",

            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "absolute",

            width: "180px",
            height: "180px",

            borderRadius: "50%",

            background:
              "rgba(37, 99, 235, 0.035)",

            left: "-90px",
            bottom: "100px",

            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,

            padding: "30px",
          }}
        >
          {submitting && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                background: "rgba(255, 255, 255, 0.78)",
                backdropFilter: "blur(2px)",
                borderRadius: "28px",
              }}
            >
              <div
                style={{
                  width: "min(100%, 360px)",
                  padding: "24px",
                  textAlign: "center",
                  background: "linear-gradient(145deg, #FFFFFF 0%, #FFF8F1 100%)",
                  border: "1px solid #FED7AA",
                  borderRadius: "20px",
                  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.12)",
                }}
              >
                <div className="tp-dialog-publish-spinner" />
                <div style={{ marginTop: "14px", color: "#0F172A", fontSize: "16px", fontWeight: 800 }}>
                  Submitting Daily Log
                </div>
                <div style={{ marginTop: "6px", color: "#64748B", fontSize: "12px", lineHeight: 1.55, fontWeight: 600 }}>
                  Publishing the lecture and updating classroom intelligence. Kindly wait...
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              HEADER
             ========================================= */}

          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",

              alignItems:
                "flex-start",

              gap: "24px",

              marginBottom: "26px",
            }}
          >
            <div
              style={{
                flex: 1,
              }}
            >
              <div
                style={{
                  color: "#F97316",

                  fontSize: "10px",
                  fontWeight: 800,

                  letterSpacing: "2px",
                  textTransform:
                    "uppercase",

                  marginBottom: "9px",
                }}
              >
                DAILY CLASSROOM INTELLIGENCE LOG
              </div>

              <h1
                style={{
                  margin: 0,

                  color: "#0F172A",

                  fontSize: "27px",
                  lineHeight: 1.2,

                  fontWeight: 800,

                  letterSpacing:
                    "-0.5px",
                }}
              >
                Publish Today's Lecture
              </h1>

              <p
                style={{
                  margin:
                    "10px 0 0",

                  maxWidth: "470px",

                  color: "#64748B",

                  fontSize: "13px",

                  lineHeight: 1.65,
                }}
              >
                Record today's classroom
                coverage, concepts,
                homework and learning
                activity for the academic
                intelligence system.
              </p>
            </div>

            <div
              style={{
                width: "76px",
                height: "76px",

                flexShrink: 0,

                display: "flex",
                flexDirection:
                  "column",

                alignItems: "center",
                justifyContent:
                  "center",

                background:
                  "linear-gradient(145deg, #FFF8F1 0%, #FFFFFF 100%)",

                border:
                  "1px solid #FED7AA",

                borderRadius: "21px",

                boxShadow:
                  "0 8px 20px rgba(249, 115, 22, 0.08)",
              }}
            >
              <div
                style={{
                  fontSize: "25px",
                  lineHeight: 1,
                }}
              >
                📚
              </div>

              <div
                style={{
                  marginTop: "6px",

                  color: "#F97316",

                  fontSize: "8px",
                  fontWeight: 800,

                  letterSpacing:
                    "1px",
                }}
              >
                LECTURE
              </div>
            </div>
          </div>

          {/* =========================================
              CLASSROOM + TOPIC
             ========================================= */}

          <div style={sectionCardStyle}>
            <div style={sectionLabelStyle}>
              LECTURE DETAILS
            </div>

            <div style={fieldLabelStyle}>
              Classroom
            </div>

            <select
              id="tp-daily-log-classroom"
              style={{ ...inputStyle, ...(guidedStep === "classroom" ? guidedHighlightStyle : {}) }}
              value={
                selectedAssignmentId
              }
              onChange={(e) => {
                setSelectedAssignmentId(e.target.value);
                if (e.target.value) setGuidedStep("chapter");
              }}
            >
              <option value="">
                Select Classroom
              </option>

              {assignments.map(
                (assignment) => (
                  <option
                    key={
                      assignment.id
                    }
                    value={
                      assignment.id
                    }
                  >
                    Class{" "}
                    {
                      assignment.className
                    }{" "}
                    - Section{" "}
                    {
                      assignment.sectionName
                    }{" "} -{" "}
                    {
                      assignment.subjectName
                    }
                  </option>
                )
              )}
            </select>

            <div style={fieldLabelStyle}>
              Chapter
            </div>
            <select
              id="tp-daily-log-chapter"
              style={{ ...inputStyle, ...(guidedStep === "chapter" ? guidedHighlightStyle : {}) }}
              value={selectedChapter}
              onChange={(e) => {
                const nextChapter = e.target.value;
                setSelectedChapter(nextChapter);
                if (nextChapter !== OTHER_CHAPTER_VALUE) {
                  setManualChapterName("");
                }
                if (nextChapter === OTHER_CHAPTER_VALUE) setGuidedStep("manualChapter");
                else if (nextChapter) setGuidedStep("topic");
              }}
            >
              <option value="">Select Chapter </option>
              {chapterOptions.map((chapter: any) => (
                <option key={String(chapter.id)} value={String(chapter.chapterName ?? chapter.chapter_name ?? "")}>
                  {String(chapter.chapterName ?? chapter.chapter_name ?? "")}
                </option>
              ))}
              <option value={OTHER_CHAPTER_VALUE}>Other — enter chapter name</option>
            </select>
            {selectedChapter === OTHER_CHAPTER_VALUE && (
              <input
                id="tp-daily-log-manual-chapter"
                style={{ ...inputStyle, marginTop: 10, ...(guidedStep === "manualChapter" ? guidedHighlightStyle : {}) }}
                value={manualChapterName}
                onChange={(e) => setManualChapterName(e.target.value)}
                placeholder="Enter chapter name"
                aria-label="Manually enter chapter name"
                required
              />
            )}

            <div style={fieldLabelStyle}>
              Topic Covered
            </div>

            <input
              id="tp-daily-log-topic"
              style={{
                ...inputStyle,
                marginBottom: 0,
                ...(guidedStep === "topic" ? guidedHighlightStyle : {}),
              }}
              placeholder="Enter today's main topic"
              lang={isHindiSubject ? "hi" : "en"}
              inputMode="text"
              value={topicName}
              onChange={(e) => {
                setTopicName(e.target.value);
                setGuidedStep("topic");
              }}
            />
            {selectedAssignmentId && previousLogLoading && (
              <div
                className="tp-log-previous-reference tp-log-previous-reference-loading"
                style={{
                  marginTop: "10px",
                  padding: "8px 9px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #FFF7ED 0%, #FFFAF5 100%)",
                  border: "1px solid #FED7AA",
                }}
              >
                <div
                  style={{
                    color: "#9A3412",
                    fontSize: "9px",
                    fontWeight: 700,
                  }}
                >
                  Checking your last class reference…
                </div>
              </div>
            )}

            {selectedAssignmentId && previousLog && previousLog.topicName && (
              <div
                className="tp-log-previous-reference tp-log-previous-topic-reference"
                style={{
                  marginTop: "10px",
                  padding: "8px 9px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #FFF7ED 0%, #FFFAF5 100%)",
                  border: "1px solid #FED7AA",
                }}
              >
                <div
                  style={{
                    color: "#9A3412",
                    fontSize: "9.6px",
                    fontWeight: 800,
                    letterSpacing: "0.7px",
                    textTransform: "uppercase",
                    marginBottom: "5px",
                  }}
                >
                  Last class topic · {previousLog.logDate || "Previous class"}
                </div>
                <button
                  type="button"
                  onClick={usePreviousTopic}
                  title="Use this previous topic"
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "5px 7px",
                    border: "1px solid #FED7AA",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.78)",
                    color: "#7C2D12",
                    textAlign: "left",
                    fontSize: "10.8px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {String(previousLog.topicName)}
                </button>
              </div>
            )}

          </div>

          {/* =========================================
              CONCEPTS COVERED
             ========================================= */}

          <div id="tp-daily-log-subtopics" style={{ ...sectionCardStyle, ...(guidedStep === "subtopics" ? guidedHighlightStyle : {}) }}>
            <div style={sectionLabelStyle}>
              CONCEPT INTELLIGENCE
            </div>

            <div
              style={{
                display: "flex",

                alignItems:
                  "flex-start",

                justifyContent:
                  "space-between",

                gap: "16px",

                marginBottom: "6px",
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,

                    color: "#0F172A",

                    fontSize: "16px",
                    fontWeight: 800,
                  }}
                >
                  Subtopics / Concepts
                  Covered Today
                </h3>

                <p
                  style={{
                    margin:
                      "6px 0 0",

                    color: "#64748B",

                    fontSize: "12px",

                    lineHeight: 1.6,
                  }}
                >
                  Add at least 3
                  concepts, headings or
                  subtopics covered in
                  today's lecture.
                </p>
              </div>

              <div
                style={{
                  flexShrink: 0,

                  padding:
                    "6px 10px",

                  borderRadius:
                    "999px",

                  background:
                    conceptsCovered.length >=
                    3
                      ? "#F0FDF4"
                      : "#FFF7ED",

                  border:
                    conceptsCovered.length >=
                    3
                      ? "1px solid #BBF7D0"
                      : "1px solid #FED7AA",

                  color:
                    conceptsCovered.length >=
                    3
                      ? "#15803D"
                      : "#C2410C",

                  fontSize: "10px",
                  fontWeight: 800,

                  whiteSpace:
                    "nowrap",
                }}
              >
                {
                  conceptsCovered.length
                }{" "}
                / 3 MIN
              </div>
            </div>

            <div
              style={{
                display: "flex",

                gap: "10px",

                marginTop: "17px",
              }}
            >
              <input
                style={{
                  ...inputStyle,

                  marginBottom: 0,

                  flex: 1,
                }}
                placeholder="Enter subtopic or concept covered today"
                lang={isHindiSubject ? "hi" : "en"}
                inputMode="text"
                value={conceptInput}
                onChange={(e) =>
                  setConceptInput(
                    e.target.value
                  )
                }
              />

              <button
                onClick={addConcept}
                style={addButton}
              >
                + Add
              </button>
            </div>

            {conceptsCovered.length >
              0 && (
              <div
                style={{
                  display: "flex",

                  flexWrap: "wrap",

                  gap: "8px",

                  marginTop: "15px",
                }}
              >
                {conceptsCovered.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      style={{
                        display:
                          "inline-flex",

                        alignItems:
                          "center",

                        gap: "8px",

                        padding:
                          "7px 10px 7px 12px",

                        borderRadius:
                          "999px",

                        background:
                          "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)",

                        border:
                          "1px solid #FED7AA",

                        color:
                          "#C2410C",

                        fontSize:
                          "11px",

                        fontWeight:
                          700,
                      }}
                    >
                      {item}

                      <button
                        onClick={() =>
                          removeConcept(
                            index
                          )
                        }
                        style={{
                          width: "20px",
                          height: "20px",

                          display:
                            "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "center",

                          padding: 0,

                          border:
                            "none",

                          borderRadius:
                            "50%",

                          background:
                            "#FFEDD5",

                          color:
                            "#C2410C",

                          cursor:
                            "pointer",

                          fontWeight:
                            800,

                          fontSize:
                            "11px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {selectedAssignmentId && previousLog && (
              <div
                className="tp-log-previous-reference tp-log-previous-concepts-reference"
                style={{
                  marginTop: "10px",
                  padding: "8px 9px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #FFF7ED 0%, #FFFAF5 100%)",
                  border: "1px solid #FED7AA",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "7px",
                    marginBottom: "5px",
                  }}
                >
                  <div
                    style={{
                      color: "#9A3412",
                      fontSize: "9.6px",
                      fontWeight: 800,
                      letterSpacing: "0.7px",
                      textTransform: "uppercase",
                    }}
                  >
                    Last class subtopics · {previousLog.logDate || "Previous class"}
                  </div>
                  <button
                    type="button"
                    onClick={usePreviousLessonReference}
                    style={{
                      border: "1px solid #FB923C",
                      borderRadius: "999px",
                      background: "#FFFFFF",
                      color: "#9A3412",
                      padding: "3px 7px",
                      fontSize: "8px",
                      fontWeight: 800,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Use all
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                  }}
                >
                  {Array.isArray(previousLog.conceptsCovered) &&
                    previousLog.conceptsCovered.map((concept: unknown, index: number) => {
                      const value = String(concept ?? "").trim();
                      if (!value) return null;
                      return (
                        <button
                          type="button"
                          key={`${value}-${index}`}
                          onClick={() => usePreviousConcept(value)}
                          title="Add this previous concept"
                          style={{
                            border: "1px solid #FED7AA",
                            borderRadius: "999px",
                            background: "rgba(255,255,255,0.82)",
                            color: "#9A3412",
                            padding: "3px 6px",
                            fontSize: "8px",
                            fontWeight: 700,
                            cursor: "pointer",
                            maxWidth: "100%",
                          }}
                        >
                          {value}
                        </button>
                      );
                    })}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#C2410C",
                    fontSize: "8.4px",
                    fontWeight: 600,
                  }}
                >
                  Click a subtopic to reuse it. You can edit today's fields normally.
                </div>
              </div>
            )}

            {selectedAssignmentId && !previousLogLoading && !previousLog && (
              <div
                className="tp-log-previous-reference"
                style={{
                  marginTop: "10px",
                  padding: "8px 9px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #FFF7ED 0%, #FFFAF5 100%)",
                  border: "1px solid #FED7AA",
                  color: "#C2410C",
                  fontSize: "8px",
                  fontWeight: 700,
                }}
              >
                No previous class reference found for this classroom yet.
              </div>
            )}
          </div>

          {/* =========================================
              PAGE COVERAGE
             ========================================= */}

          {/* Additive Cross Question section; existing Pages Covered fields are untouched. */}
          <div id="tp-daily-log-question" style={{ ...sectionCardStyle, ...(guidedStep === "question" ? guidedHighlightStyle : {}) }}>
            <div style={sectionLabelStyle}>Cross Question (Optional)</div>
            <div style={fieldLabelStyle}>Question text</div>
            <textarea
              style={{ ...inputStyle, minHeight: "84px", resize: "vertical" }}
              value={crossQuestionText}
              onChange={(e) => setCrossQuestionText(e.target.value)}
              placeholder="Type the question, or attach a question image below"
              disabled={!!crossQuestionImage}
            />
            <div style={fieldLabelStyle}>Attach or capture question image (optional)</div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                  alert("Please use a JPG, PNG, or WebP image.");
                  e.currentTarget.value = "";
                  setCrossQuestionImage(null);
                  return;
                }
                if (file && file.size > 5 * 1024 * 1024) {
                  alert("The question image must be 5 MB or smaller.");
                  e.currentTarget.value = "";
                  setCrossQuestionImage(null);
                  return;
                }
                setCrossQuestionImage(file);
                if (file) setCrossQuestionText("");
              }}
              style={{ ...inputStyle, padding: "10px" }}
            />
            {crossQuestionImage && <button type="button" onClick={() => { setCrossQuestionImage(null); setCrossQuestionImageViewerOpen(false); }} style={{ marginTop: 6 }}>Remove image</button>}
            {crossQuestionImagePreview && (
              <button type="button" onClick={() => setCrossQuestionImageViewerOpen(true)} aria-label="Enlarge selected cross-question image" style={{ display: "block", maxWidth: "100%", marginTop: "10px", padding: 0, border: 0, background: "transparent", cursor: "zoom-in" }}>
                <img src={crossQuestionImagePreview} alt="Cross-question preview (select to enlarge)" style={{ display: "block", maxWidth: "100%", maxHeight: "260px", objectFit: "contain", borderRadius: "12px" }} />
              </button>
            )}
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "6px" }}>
              Use one image (JPG, PNG, or WebP, up to 5 MB) or question text. Students will see the image instead of text when an image is attached.
            </div>
            <div id="tp-daily-log-options" style={guidedStep === "options" ? guidedHighlightStyle : undefined}>
            {crossQuestionOptions.map((option, index) => (
              <div key={index} style={{ marginTop: "10px" }}>
                <div style={fieldLabelStyle}>Option {index + 1}</div>
                <input
                  style={inputStyle}
                  value={option}
                  onChange={(e) => setCrossQuestionOptions((current) => current.map((value, i) => i === index ? e.target.value : value))}
                  placeholder={`Enter option ${index + 1}`}
                />
                <label style={{ display: "inline-flex", gap: "8px", alignItems: "center", fontSize: "13px", color: "#334155" }}>
                  <input type="radio" name="cross-question-correct-option" checked={crossQuestionCorrectIndex === String(index)} onChange={() => setCrossQuestionCorrectIndex(String(index))} />
                  Correct answer
                </label>
              </div>
            ))}
            </div>
          </div>

          <div style={sectionCardStyle}>
            <div style={sectionLabelStyle}>
              LESSON COVERAGE
            </div>

            <h3
              style={{
                margin: "0 0 14px",

                color: "#0F172A",

                fontSize: "16px",
                fontWeight: 800,
              }}
            >
              Pages Covered
            </h3>

            <div
              style={{
                display: "flex",
                gap: "12px",
              }}
            >
              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={
                    fieldLabelStyle
                  }
                >
                  Page From
                </div>

                <input
                  style={{
                    ...inputStyle,
                    marginBottom: 0,
                  }}
                  placeholder="From"
                  value={pageFrom}
                  onChange={(e) =>
                    setPageFrom(
                      e.target.value
                    )
                  }
                />
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={
                    fieldLabelStyle
                  }
                >
                  Page To
                </div>

                <input
                  style={{
                    ...inputStyle,
                    marginBottom: 0,
                  }}
                  placeholder="To"
                  value={pageTo}
                  onChange={(e) =>
                    setPageTo(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>

          {/* =========================================
              CLASSROOM ACTIVITY
             ========================================= */}

          <div style={sectionCardStyle}>
            <div style={sectionLabelStyle}>
              CLASSROOM ACTIVITY
            </div>

            <div
              style={{
                display: "grid",

                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",

                gap: "12px",
              }}
            >
              <label
                style={{
                  ...checkboxCardStyle,

                  background:
                    homeworkGiven
                      ? "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)"
                      : "#FFFFFF",

                  border:
                    homeworkGiven
                      ? "1px solid #FDBA74"
                      : "1px solid #E2E8F0",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    homeworkGiven
                  }
                  onChange={(e) =>
                    setHomeworkGiven(
                      e.target
                        .checked
                    )
                  }
                />

                <div>
                  <div
                    style={{
                      color:
                        "#0F172A",

                      fontSize:
                        "13px",

                      fontWeight:
                        800,
                    }}
                  >
                    📝 Homework Given
                  </div>

                  <div
                    style={{
                      marginTop:
                        "3px",

                      color:
                        "#64748B",

                      fontSize:
                        "10px",
                    }}
                  >
                    Assignment provided
                    after class
                  </div>
                </div>
              </label>

              <label
                style={{
                  ...checkboxCardStyle,

                  background:
                    activityConducted
                      ? "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)"
                      : "#FFFFFF",

                  border:
                    activityConducted
                      ? "1px solid #BFDBFE"
                      : "1px solid #E2E8F0",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    activityConducted
                  }
                  onChange={(e) =>
                    setActivityConducted(
                      e.target
                        .checked
                    )
                  }
                />

                <div>
                  <div
                    style={{
                      color:
                        "#0F172A",

                      fontSize:
                        "13px",

                      fontWeight:
                        800,
                    }}
                  >
                    🎯 Activity Conducted
                  </div>

                  <div
                    style={{
                      marginTop:
                        "3px",

                      color:
                        "#64748B",

                      fontSize:
                        "10px",
                    }}
                  >
                    Classroom activity
                    completed today
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* =========================================
              TEACHER NOTES
             ========================================= */}

          <div style={sectionCardStyle}>
            <div style={sectionLabelStyle}>
              TEACHING NOTES
            </div>

            <h3
              style={{
                margin: "0 0 6px",

                color: "#0F172A",

                fontSize: "16px",
                fontWeight: 800,
              }}
            >
              Additional Teaching Notes
            </h3>

            <p
              style={{
                margin:
                  "0 0 13px",

                color: "#64748B",

                fontSize: "12px",
                lineHeight: 1.55,
              }}
            >
              Add any additional
              classroom context or
              observations from today's
              lecture.
            </p>

            <textarea
              rows={5}
              style={textareaStyle}
              placeholder="Additional Teaching Notes..."
              lang={isHindiSubject ? "hi" : "en"}
              inputMode="text"
              value={teacherNotes}
              onChange={(e) =>
                setTeacherNotes(
                  e.target.value
                )
              }
            />
          </div>

          {/* =========================================
              ACTIONS
             ========================================= */}

          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",

              alignItems: "center",

              gap: "15px",

              marginTop: "24px",

              paddingTop: "20px",

              borderTop:
                "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                color: "#94A3B8",

                fontSize: "10px",
                fontWeight: 700,

                letterSpacing:
                  "0.7px",
              }}
            >
              TALENT PASSPORT •
              CLASSROOM INTELLIGENCE
            </div>

            <div
              style={{
                display: "flex",

                justifyContent:
                  "flex-end",

                gap: "10px",
              }}
            >
              <button
                onClick={onClose}
                disabled={submitting}
                style={{
                  ...cancelButton,
                  opacity: submitting ? 0.55 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={submitting}
                style={{
                  ...saveButton,
                  opacity: submitting ? 0.82 : 1,
                  cursor: submitting ? "wait" : "pointer",
                }}
              >
                {submitting ? "Publishing... Kindly wait" : "Publish Lecture →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    
<style>{`
.tp-dialog-publish-spinner {
  width: 30px;
  height: 30px;
  margin: 0 auto;
  border: 4px solid #FFEDD5;
  border-top-color: #F97316;
  border-radius: 50%;
  animation: tpDialogPublishSpin .75s linear infinite;
}
@keyframes tpDialogPublishSpin {
  to { transform: rotate(360deg); }
}
@media (max-width:1024px){
 .tp-log-dialog-overlay{padding:14px !important}
 .tp-log-dialog{max-width:600px !important;max-height:94dvh !important;border-radius:20px !important}
 .tp-log-dialog>div:last-child{padding:20px !important}
 .tp-log-dialog h1{font-size:23px !important}
 .tp-log-dialog h3{font-size:14px !important}
 .tp-log-dialog p{font-size:11px !important;line-height:1.4 !important}
 .tp-log-dialog input,.tp-log-dialog select,.tp-log-dialog textarea{font-size:16px !important}
 .tp-log-dialog button{font-size:12px !important}
 .tp-log-previous-reference{padding:6px 7px !important;margin-top:7px !important}
 .tp-log-previous-reference button{font-size:9px !important}
 .tp-log-previous-reference .tp-log-previous-topic-reference{}
 .tp-log-previous-reference-loading div,.tp-log-previous-reference>div{font-size:9px !important}
}
 .tp-log-previous-reference{padding:7px 8px !important;margin-top:8px !important}
 .tp-log-previous-topic-reference>div:first-child,.tp-log-previous-concepts-reference>div:first-child{font-size:8.4px !important}
 .tp-log-previous-topic-reference button{font-size:9.6px !important}
 .tp-log-previous-concepts-reference button{font-size:9px !important}
 .tp-log-previous-concepts-reference>div:last-child{font-size:8.4px !important}
@media (max-width:600px){
 .tp-log-dialog-overlay{padding:6px !important;align-items:flex-end !important}
 .tp-log-dialog{max-width:none !important;max-height:96dvh !important;border-radius:18px 18px 10px 10px !important}
 .tp-log-dialog>div:last-child{padding:14px !important}
 .tp-log-dialog h1{font-size:19px !important;line-height:1.15 !important}
 .tp-log-dialog h3{font-size:13px !important}
 .tp-log-dialog p{font-size:10px !important}
 .tp-log-dialog input,.tp-log-dialog select,.tp-log-dialog textarea{font-size:16px !important}
 .tp-log-dialog button{font-size:11px !important}
 .tp-log-previous-reference{padding:5px 6px !important;margin-top:6px !important}
 .tp-log-previous-topic-reference>div:first-child,.tp-log-previous-concepts-reference>div:first-child{font-size:7.8px !important}
 .tp-log-previous-topic-reference button{font-size:8.4px !important}
 .tp-log-previous-concepts-reference button{font-size:7.8px !important}
 .tp-log-previous-concepts-reference>div:last-child{font-size:7.8px !important}
 .tp-log-previous-reference-loading div,.tp-log-previous-reference>div{font-size:7.8px !important}
}
`}</style>
      {crossQuestionImageViewerOpen && crossQuestionImagePreview && (
        <div role="dialog" aria-modal="true" aria-label="Selected cross-question image preview" onClick={(event) => { if (event.target === event.currentTarget) setCrossQuestionImageViewerOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(2, 6, 23, 0.88)" }}>
          <button type="button" onClick={() => setCrossQuestionImageViewerOpen(false)} aria-label="Close enlarged image" style={{ position: "absolute", top: 16, right: 16, zIndex: 1, width: 42, height: 42, border: "1px solid rgba(255,255,255,.65)", borderRadius: 999, background: "#fff", color: "#0f172a", fontSize: 26, cursor: "pointer" }}>×</button>
          <img src={crossQuestionImagePreview} alt="Enlarged selected cross question" onClick={(event) => event.stopPropagation()} style={{ display: "block", maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: 8 }} />
        </div>
      )}
</div>
  );
}


/* =========================================================
   UI STYLES
   ========================================================= */

const sectionCardStyle = {
  position: "relative",

  marginBottom: "15px",

  padding: "19px",

  background:
    "rgba(255, 255, 255, 0.86)",

  border:
    "1px solid #E2E8F0",

  borderRadius: "18px",

  boxShadow:
    "0 5px 16px rgba(15, 23, 42, 0.025)",
} as const;


const sectionLabelStyle = {
  marginBottom: "12px",

  color: "#F97316",

  fontSize: "9px",
  fontWeight: 800,

  letterSpacing: "1.6px",

  textTransform:
    "uppercase" as const,
};


const fieldLabelStyle = {
  marginBottom: "6px",

  color: "#475569",

  fontSize: "11px",
  fontWeight: 700,
};


const inputStyle = {
  width: "100%",

  padding: "12px 13px",

  marginBottom: "14px",

  boxSizing:
    "border-box" as const,

  background: "#F8FAFC",

  border:
    "1px solid #CBD5E1",

  borderRadius: "11px",

  color: "#0F172A",

  fontSize: "13px",

  outline: "none",
};


const textareaStyle = {
  width: "100%",

  padding: "13px",

  boxSizing:
    "border-box" as const,

  resize: "none" as const,

  background: "#F8FAFC",

  border:
    "1px solid #CBD5E1",

  borderRadius: "12px",

  color: "#0F172A",

  fontSize: "13px",

  lineHeight: 1.6,

  outline: "none",
};


const checkboxCardStyle = {
  display: "flex",

  alignItems: "center",

  gap: "10px",

  padding: "13px",

  borderRadius: "13px",

  cursor: "pointer",

  transition:
    "all 0.2s ease",
} as const;


const cancelButton = {
  padding: "11px 18px",

  border:
    "1px solid #CBD5E1",

  borderRadius: "11px",

  background: "#FFFFFF",

  color: "#475569",

  cursor: "pointer",

  fontWeight: 700,

  fontSize: "12px",
};


const addButton = {
  padding: "11px 17px",

  border:
    "1px solid #F97316",

  borderRadius: "11px",

  background:
    "linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)",

  color: "#EA580C",

  cursor: "pointer",

  fontWeight: 800,

  fontSize: "12px",

  whiteSpace:
    "nowrap" as const,
};


const saveButton = {
  padding: "11px 18px",

  border:
    "1px solid #F97316",

  borderRadius: "11px",

  background:
    "linear-gradient(135deg, #F97316 0%, #FB8C24 100%)",

  color: "#FFFFFF",

  cursor: "pointer",

  fontWeight: 800,

  fontSize: "12px",

  boxShadow:
    "0 7px 16px rgba(249, 115, 22, 0.18)",

  whiteSpace:
    "nowrap" as const,
};