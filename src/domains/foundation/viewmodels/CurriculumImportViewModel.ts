import { useState } from "react";

export default function useCurriculumImportViewModel() {
  /* ============================================================
      IMPORT WORKFLOW STEP
  ============================================================ */

  const [currentStep, setCurrentStep] =
    useState(1);

  /* ============================================================
      BOARD
  ============================================================ */

  const [selectedBoard, setSelectedBoard] =
    useState("");

  /* ============================================================
      ACADEMIC YEAR
  ============================================================ */

  const [
    selectedAcademicYear,
    setSelectedAcademicYear,
  ] = useState("");

  /* ============================================================
      CURRICULUM FILE
  ============================================================ */

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  /* ============================================================
      PREVIEW
  ============================================================ */

  const [previewReady, setPreviewReady] =
    useState(false);

  /* ============================================================
      VALIDATION
  ============================================================ */

  const [
    validationCompleted,
    setValidationCompleted,
  ] = useState(false);

  /* ============================================================
      IMPORT STATUS
  ============================================================ */

  const [importCompleted, setImportCompleted] =
    useState(false);

  /* ============================================================
      STEP CONTROLS
  ============================================================ */

  function nextStep() {
    setCurrentStep((previous) =>
      Math.min(previous + 1, 7)
    );
  }

  function previousStep() {
    setCurrentStep((previous) =>
      Math.max(previous - 1, 1)
    );
  }

  function resetWorkflow() {
    setCurrentStep(1);

    setSelectedBoard("");

    setSelectedAcademicYear("");

    setSelectedFile(null);

    setPreviewReady(false);

    setValidationCompleted(false);

    setImportCompleted(false);
  }

  /* ============================================================
      RETURN
  ============================================================ */

  return {
    currentStep,
    nextStep,
    previousStep,
    resetWorkflow,

    selectedBoard,
    setSelectedBoard,

    selectedAcademicYear,
    setSelectedAcademicYear,

    selectedFile,
    setSelectedFile,

    previewReady,
    setPreviewReady,

    validationCompleted,
    setValidationCompleted,

    importCompleted,
    setImportCompleted,
  };
}