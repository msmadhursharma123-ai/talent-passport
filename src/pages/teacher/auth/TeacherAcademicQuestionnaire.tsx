import React, { useState } from "react";

import {
  CLASSES,
  SECTIONS,
  UPPER_CLASS_SECTIONS,
  SUBJECTS,
} from "../../../domains/teacherIntelligence/constants/TeacherMasterData";

import {
  createTeacherAssignment,
  createTeacherAssignments,
} from "../../../domains/teacherIntelligence/repository/TeacherAssignmentRepository";

import {
  getCurrentTeacher,
} from "../../../services/identityService";

import {
  saveAnnualTeacherAssignments,
} from "../../../domains/academicYear/services/AnnualTeacherAssignmentService";

import {
  getSchoolCurrentAcademicYear,
} from "../../../domains/academicYear/repositories/AcademicYearRepository";

import {
  finishTeacherAcademicYearOnboarding,
} from "../../../domains/academicYear/services/AcademicYearOnboardingService";

interface Props {
  onContinue: () => void;
  onBack: () => void;
  academicYearId?: string;
  academicYearCode?: string;
}

export default function TeacherAcademicQuestionnaire({
  onContinue,
  onBack,
  academicYearId,
  academicYearCode,
}: Props) {

  const [currentStep, setCurrentStep] =
    useState(1);

  /*
   * ONE SUBJECT = existing onboarding behaviour.
   * MULTIPLE SUBJECTS = each subject owns its own classroom selection.
   *
   * The assignment identity remains the existing school + academic year +
   * subject + class + section boundary.
   */
  const [selectedSubjects, setSelectedSubjects] =
    useState<string[]>([]);

  const [classSectionsBySubject, setClassSectionsBySubject] =
    useState<Record<string, string[]>>({});

  const [loading, setLoading] =
    useState(false);

  const [resolvedAcademicYearId, setResolvedAcademicYearId] =
    useState(academicYearId ?? "");

  const [resolvedAcademicYearCode, setResolvedAcademicYearCode] =
    useState(academicYearCode ?? "");

  React.useEffect(() => {
    if (academicYearId && academicYearCode) return;
    const teacher = getCurrentTeacher();
    if (!teacher?.schoolUuid) return;
    void getSchoolCurrentAcademicYear(teacher.schoolUuid)
      .then((year) => {
        if (!year) return;
        setResolvedAcademicYearId(academicYearId ?? year.id);
        setResolvedAcademicYearCode(academicYearCode ?? year.academicYearCode);
      })
      .catch((error) => {
        // Never invent an academic-year code. The database guard requires the
        // assignment year to match an actual school_academic_years record.
        console.error("ACADEMIC YEAR RESOLUTION FAILED", error);
      });
  }, [academicYearId, academicYearCode]);


  // ======================================
  // SUBJECT / CLASSROOM STEP HELPERS
  // ======================================

  const totalSteps = 1 + selectedSubjects.length;

  const currentSubject =
    currentStep > 1
      ? selectedSubjects[currentStep - 2] ?? ""
      : "";

  const currentClassSections = currentSubject
    ? classSectionsBySubject[currentSubject] ?? []
    : [];

  function toggleSubject(subject: string) {
    setSelectedSubjects((previous) => {
      if (previous.includes(subject)) {
        setClassSectionsBySubject((current) => {
          const next = { ...current };
          delete next[subject];
          return next;
        });
        return previous.filter((item) => item !== subject);
      }

      return [...previous, subject];
    });
  }

  function toggleClassSection(classroom: string) {
    if (!currentSubject) return;

    setClassSectionsBySubject((previous) => {
      const selected = previous[currentSubject] ?? [];

      return {
        ...previous,
        [currentSubject]: selected.includes(classroom)
          ? selected.filter((item) => item !== classroom)
          : [...selected, classroom],
      };
    });
  }

  // ======================================
  // NEXT STEP
  // ======================================

  function goToNextStep() {
    if (currentStep === 1) {
      if (selectedSubjects.length === 0) {
        alert("Please select the subject you teach.");
        return;
      }

      setCurrentStep(2);
      return;
    }

    if (!currentSubject) return;

    if (currentClassSections.length === 0) {
      alert(
        `Please select at least one Class & Section for ${currentSubject}.`
      );
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep((step) => step + 1);
    }
  }

  // ======================================
  // PREVIOUS STEP
  // ======================================

  function goToPreviousStep() {
    if (currentStep === 1) {
      return;
    }

    setCurrentStep((step) => step - 1);
  }

  // ======================================
  // COMPLETE QUESTIONNAIRE
  // ======================================

  async function handleComplete() {
    if (selectedSubjects.length === 0) {
      alert("Please select your subject.");
      return;
    }

    const incompleteSubject = selectedSubjects.find(
      (subject) =>
        (classSectionsBySubject[subject] ?? []).length === 0
    );

    if (incompleteSubject) {
      alert(
        `Please select at least one Class & Section for ${incompleteSubject}.`
      );
      return;
    }

    const teacher = getCurrentTeacher();

    if (!teacher) {
      alert("Teacher identity not found.");
      return;
    }

    const assignments = selectedSubjects.flatMap((subjectName) =>
      (classSectionsBySubject[subjectName] ?? []).map((classroom) => {
        const [className, sectionName] = classroom.split("-");
        return {
          className: className ?? "",
          sectionName: sectionName ?? "",
          subjectName,
        };
      })
    );

    setLoading(true);

    try {
      if (academicYearId && resolvedAcademicYearId) {
        await saveAnnualTeacherAssignments({
          academicYearId: resolvedAcademicYearId,
          assignments,
        });
        await finishTeacherAcademicYearOnboarding(resolvedAcademicYearId);
        onContinue();
        return;
      }

      /*
       * Initial teacher registration is not annual re-onboarding.
       * Resolve the school's CURRENT year directly from the database and use
       * its exact stored code. Never invent a year value.
       */
      const currentSchoolYear = teacher.schoolUuid
        ? await getSchoolCurrentAcademicYear(teacher.schoolUuid)
        : null;

      if (!currentSchoolYear?.id || !currentSchoolYear.academicYearCode) {
        throw new Error(
          "The school's current academic year could not be resolved. Please try again."
        );
      }

      setResolvedAcademicYearId(currentSchoolYear.id);
      setResolvedAcademicYearCode(currentSchoolYear.academicYearCode);

      /*
       * Save the COMPLETE assignment set in one database statement for
       * multi-subject onboarding. The existing single-assignment writer
       * remains unchanged for the original single-subject path.
       */
      const persistedAssignments = assignments.map((assignment) => ({
        teacherUuid: teacher.teacherUuid,
        schoolUuid: teacher.schoolUuid,
        className: assignment.className,
        sectionName: assignment.sectionName,
        subjectName: assignment.subjectName,
        academicYear: currentSchoolYear.academicYearCode,
        isActive: true,
      }));

      if (selectedSubjects.length === 1) {
        for (const assignment of persistedAssignments) {
          await createTeacherAssignment(assignment);
        }
      } else {
        await createTeacherAssignments(persistedAssignments);
      }

      onContinue();
    } catch (error: any) {
      alert(
        error?.message ??
          "Unable to save teacher assignments."
      );
    } finally {
      setLoading(false);
    }
  }


  return (

    <div
      className="teacher-questionnaire-page"
      style={{
        minHeight: "100vh",

        background:
          "linear-gradient(135deg, #F8F7F4 0%, #FCFAF7 38%, #FFF7EE 70%, #F3F6FB 100%)",

        padding: 40,

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* LARGE WARM TOP RIGHT CIRCLE */}

      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",

          background:
            "rgba(244,166,35,0.085)",

          right: "-175px",
          top: "-215px",

          pointerEvents: "none",
        }}
      />


      {/* INNER WARM GLOW */}

      <div
        style={{
          position: "absolute",
          width: "270px",
          height: "270px",
          borderRadius: "50%",

          background:
            "rgba(255,184,76,0.055)",

          right: "7%",
          top: "18%",

          pointerEvents: "none",
        }}
      />


      {/* LARGE BLUE BOTTOM LEFT CIRCLE */}

      <div
        style={{
          position: "absolute",
          width: "410px",
          height: "410px",
          borderRadius: "50%",

          background:
            "rgba(20,59,115,0.060)",

          left: "-205px",
          bottom: "-215px",

          pointerEvents: "none",
        }}
      />


      {/* WARM BOTTOM CIRCLE */}

      <div
        style={{
          position: "absolute",
          width: "235px",
          height: "235px",
          borderRadius: "50%",

          background:
            "rgba(244,166,35,0.060)",

          right: "15%",
          bottom: "7%",

          pointerEvents: "none",
        }}
      />


      {/* SOFT CENTER GLOW */}

      <div
        style={{
          position: "absolute",
          width: "550px",
          height: "550px",
          borderRadius: "50%",

          background:
            "radial-gradient(circle, rgba(244,166,35,0.035) 0%, rgba(244,166,35,0) 70%)",

          left: "35%",
          top: "20%",

          pointerEvents: "none",
        }}
      />


      <div
        className="teacher-questionnaire-card"
        style={{
          width: 680,

          background: "white",

          borderRadius: 24,

          padding: 32,

          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",

          position: "relative",
          zIndex: 1,
        }}
      >

        {/* BACK BUTTON */}

        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",

            color: "#143B73",

            cursor: "pointer",

            fontSize: 18,
            fontWeight: 700,

            marginBottom: 25,
          }}
        >
          ← Back
        </button>


        {/* TITLE */}

        <h1
          style={{
            margin: 0,

            color: "#0F172A",

            fontSize: 32,
            fontWeight: 400,
          }}
        >
          Teacher Academic Questionnaire
        </h1>


        <p
          style={{
            color: "#64748B",

            marginTop: 12,
            marginBottom: 30,

            lineHeight: 1.8,
          }}
        >
          First select the subject you teach.
          Then choose the Class & Sections where
          you teach that subject.
        </p>


        {/* PROGRESS BAR */}

        <div
          style={{
            height: 8,

            borderRadius: 20,

            background: "#E2E8F0",

            overflow: "hidden",

            marginBottom: 40,
          }}
        >

          <div
            style={{
              width:
                `${(currentStep / Math.max(totalSteps, 1)) * 100}%`,

              height: "100%",

              background:
                "#F59E0B",
            }}
          />

        </div>


        <h3
          style={{
            color: "#F59E0B",
          }}
        >
          STEP {currentStep} OF {totalSteps}
        </h3>


        {/* =====================================
            STEP 1 — SUBJECT
        ====================================== */}

        {currentStep === 1 && (

          <>

            <h2>
              Which Subject do you teach?
            </h2>


            <p
              style={{
                color: "#64748B",

                fontSize: 15,

                lineHeight: 1.6,

                marginTop: 8,
              }}
            >
              Select one or more subjects.
              If you teach more than one subject,
              you will choose its Class & Sections separately.
            </p>


            <div
              className="teacher-subject-list"
              style={{
                display: "flex",

                flexWrap: "wrap",

                gap: 12,

                marginTop: 30,
              }}
            >

              {SUBJECTS.map(
                (item) => (

                  <button
                    key={item}

                    onClick={() => {

                      /*
                       * If subject changes before
                       * classroom selection there
                       * is nothing else to reset.
                       */
                      toggleSubject(item);

                    }}

                    style={{
                      padding:
                        "12px 20px",

                      borderRadius:
                        16,

                      border:
                        selectedSubjects.includes(item)
                          ? "2px solid #F59E0B"
                          : "2px solid transparent",

                      cursor:
                        "pointer",

                      fontSize:
                        18,

                      fontWeight:
                        600,

                      background:
                        selectedSubjects.includes(item)
                          ? "#F59E0B"
                          : "#F1F5F9",

                      color:
                        selectedSubjects.includes(item)
                          ? "white"
                          : "#0F172A",

                      transition:
                        "all 0.15s ease",
                    }}
                  >

                    {item}

                  </button>

                )
              )}

            </div>


            {selectedSubjects.length > 0 && (

              <div
                style={{
                  marginTop: 28,

                  padding:
                    "14px 18px",

                  borderRadius:
                    14,

                  background:
                    "#FFF7ED",

                  border:
                    "1px solid #FED7AA",

                  color:
                    "#9A3412",

                  fontSize:
                    15,

                  fontWeight:
                    600,
                }}
              >

                Selected Subject{selectedSubjects.length > 1 ? "s" : ""}:{" "}

                <strong>
                  {selectedSubjects.join(", ")}
                </strong>

              </div>

            )}

          </>

        )}


        {/* =====================================
            STEP 2 — CLASS + SECTION
        ====================================== */}

        {currentStep > 1 && currentSubject && (

          <>

            <div
              style={{
                display: "flex",

                alignItems:
                  "flex-start",

                justifyContent:
                  "space-between",

                gap: 16,

                flexWrap:
                  "wrap",
              }}
            >

              <div>

                <h2
                  style={{
                    marginBottom: 6,
                  }}
                >
                  Which Class & Section do you teach?
                </h2>


                <p
                  style={{
                    color: "#64748B",

                    fontSize: 15,

                    lineHeight: 1.6,

                    margin:
                      "0 0 8px",
                  }}
                >
                  Choose the Class & Section for this subject that you teach.
                </p>

              </div>


              <div
                style={{
                  padding:
                    "9px 14px",

                  borderRadius:
                    999,

                  background:
                    "#FFF7ED",

                  border:
                    "1px solid #FED7AA",

                  color:
                    "#C2410C",

                  fontSize:
                    13,

                  fontWeight:
                    800,

                  whiteSpace:
                    "nowrap",
                }}
              >

                SUBJECT:{" "}

                {currentSubject}

              </div>

            </div>


            <div
              className="teacher-class-list"
              style={{
                display: "flex",

                flexWrap: "wrap",

                gap: 16,

                marginTop: 30,
              }}
            >

              {CLASSES.map(
                (className) => (

                  <div
                    key={className}

                    style={{
                      width: "100%",

                      marginBottom:
                        "18px",
                    }}
                  >

                    <h3
                      style={{
                        marginBottom:
                          "10px",

                        color:
                          "#143B73",

                        fontWeight:
                          700,

                        fontSize:
                          18,
                      }}
                    >

                      CLASS {className}

                    </h3>


                    <div
                      style={{
                        display:
                          "flex",

                        flexWrap:
                          "wrap",

                        gap:
                          16,
                      }}
                    >

                      {(className === "11" || className === "12"
                        ? UPPER_CLASS_SECTIONS
                        : SECTIONS
                      ).map(
                        (sectionName) => {

                          const item =
                            `${className}-${sectionName}`;

                          const selected =
                            currentClassSections.includes(
                              item
                            );

                          return (

                            <button
                              key={item}

                              onClick={() => {
                                toggleClassSection(item);
                              }}

                              aria-pressed={selected}

                              style={{
                                padding:
                                  "12px 20px",

                                borderRadius:
                                  16,

                                border:
                                  selected
                                    ? "2px solid #F59E0B"
                                    : "2px solid transparent",

                                cursor:
                                  "pointer",

                                fontSize:
                                  16,

                                fontWeight:
                                  600,

                                background:
                                  selected
                                    ? "#F59E0B"
                                    : "#F1F5F9",

                                color:
                                  selected
                                    ? "white"
                                    : "#0F172A",

                                transition:
                                  "all 0.15s ease",
                              }}
                            >

                              {item}

                            </button>

                          );

                        }
                      )}

                    </div>

                  </div>

                )
              )}

            </div>


            {currentClassSections.length > 0 && (

              <div
                style={{
                  marginTop: 12,

                  padding:
                    "14px 18px",

                  borderRadius:
                    14,

                  background:
                    "#EFF6FF",

                  border:
                    "1px solid #BFDBFE",

                  color:
                    "#1E3A8A",

                  fontSize:
                    15,

                  lineHeight:
                    1.6,
                }}
              >

                <strong>
                  {currentClassSections.length}
                </strong>

                {" "}

                {currentClassSections.length === 1
                  ? "classroom selected"
                  : "classrooms selected"}

                {" "}for{" "}

                <strong>
                  {currentSubject}
                </strong>

              </div>

            )}

          </>

        )}


        {/* =====================================
            NAVIGATION
        ====================================== */}

        <div
          className="teacher-questionnaire-nav"
          style={{
            display: "flex",

            justifyContent:
              "space-between",

            marginTop:
              50,
          }}
        >

          <button
            onClick={
              goToPreviousStep
            }

            disabled={
              currentStep === 1
            }

            style={{
              ...buttonStyle,

              opacity:
                currentStep === 1
                  ? 0.45
                  : 1,

              cursor:
                currentStep === 1
                  ? "not-allowed"
                  : "pointer",
            }}
          >

            Previous

          </button>


          {currentStep < totalSteps ? (

            <button
              onClick={
                goToNextStep
              }

              style={
                buttonStyle
              }
            >

              Next

            </button>

          ) : (

            <button
              onClick={
                handleComplete
              }

              disabled={
                loading
              }

              style={{
                ...buttonStyle,

                opacity:
                  loading
                    ? 0.65
                    : 1,

                cursor:
                  loading
                    ? "wait"
                    : "pointer",
              }}
            >

              {loading
                ? "Saving..."
                : "Complete"}

            </button>

          )}

        </div>

      </div>


      <style>{`

        @media (max-width: 1024px) {

          .teacher-questionnaire-page {
            padding: 28px !important;
            box-sizing: border-box;
            overflow-y: auto !important;
            align-items: flex-start !important;
          }

          .teacher-questionnaire-card {
            width: min(680px, 100%) !important;
            padding: 28px !important;
            box-sizing: border-box;
            margin: auto;
          }

        }


        @media (max-width: 600px) {

          .teacher-questionnaire-page {
            min-height: 100dvh !important;
            padding: 14px !important;
          }

          .teacher-questionnaire-card {
            width: 100% !important;
            padding: 18px 14px !important;
            border-radius: 18px !important;
          }

          .teacher-questionnaire-card > button:first-child {
            font-size: 14px !important;
            margin-bottom: 14px !important;
          }

          .teacher-questionnaire-card > h1 {
            font-size: 25px !important;
            line-height: 1.12 !important;
          }

          .teacher-questionnaire-card > p {
            font-size: 13px !important;
            line-height: 1.5 !important;
            margin-bottom: 20px !important;
          }

          .teacher-questionnaire-card > h3 {
            font-size: 13px !important;
          }

          .teacher-questionnaire-card h2 {
            font-size: 20px !important;
            line-height: 1.25 !important;
          }

          .teacher-class-list {
            gap: 8px !important;
            margin-top: 18px !important;
          }

          .teacher-class-list > div {
            margin-bottom: 10px !important;
          }

          .teacher-class-list h3 {
            font-size: 14px !important;
            margin-bottom: 7px !important;
          }

          .teacher-class-list button,
          .teacher-subject-list button {
            padding: 9px 12px !important;
            border-radius: 11px !important;
            font-size: 13px !important;
          }

          .teacher-subject-list {
            gap: 8px !important;
            margin-top: 18px !important;
          }

          .teacher-questionnaire-nav {
            margin-top: 26px !important;
            gap: 10px;
          }

          .teacher-questionnaire-nav button {
            flex: 1;
          }

        }

      `}</style>

    </div>

  );

}


const buttonStyle: React.CSSProperties = {

  padding:
    "12px 22px",

  borderRadius:
    "12px",

  border:
    "none",

  cursor:
    "pointer",

  background:
    "#F59E0B",

  color:
    "white",

  fontSize:
    14,

  fontWeight:
    700,

};