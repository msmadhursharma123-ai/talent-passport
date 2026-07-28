import React, { useState } from "react";

import {
  CLASSES,
  SECTIONS,
  SUBJECTS,
} from "../../../domains/teacherIntelligence/constants/TeacherMasterData";

import {
  createTeacherAssignment,
} from "../../../domains/teacherIntelligence/repository/TeacherAssignmentRepository";

import {
  getCurrentTeacher,
} from "../../../services/identityService";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function TeacherAcademicQuestionnaire({
  onContinue,
  onBack,
}: Props) {

  const [currentStep, setCurrentStep] =
    useState(1);

  const [
    selectedSubject,
    setSelectedSubject,
  ] = useState("");

  const [
    selectedClassSections,
    setSelectedClassSections,
  ] = useState<string[]>([]);

  const [loading, setLoading] =
    useState(false);


  // ======================================
  // NEXT STEP
  // ======================================

  function goToNextStep() {

    /*
     * STEP 1 is now SUBJECT.
     *
     * A teacher must choose the subject
     * before choosing classrooms.
     */
    if (
      currentStep === 1 &&
      !selectedSubject
    ) {

      alert(
        "Please select the subject you teach."
      );

      return;

    }

    setCurrentStep(
      currentStep + 1
    );

  }


  // ======================================
  // PREVIOUS STEP
  // ======================================

  function goToPreviousStep() {

    if (currentStep === 1) {
      return;
    }

    setCurrentStep(
      currentStep - 1
    );

  }


  // ======================================
  // COMPLETE QUESTIONNAIRE
  // ======================================

  async function handleComplete() {

    if (!selectedSubject) {

      alert(
        "Please select your subject."
      );

      return;

    }

    if (
      selectedClassSections.length === 0
    ) {

      alert(
        "Please select at least one Class & Section."
      );

      return;

    }

    const teacher =
      getCurrentTeacher();

    if (!teacher) {

      alert(
        "Teacher identity not found."
      );

      return;

    }

    setLoading(true);

    try {

      /*
       * IMPORTANT:
       *
       * Assignment identity is:
       *
       * SCHOOL
       * + SUBJECT
       * + CLASS
       * + SECTION
       * + ACADEMIC YEAR
       *
       * createTeacherAssignment() remains
       * responsible for enforcing whether
       * that assignment is already occupied.
       */

      for (
        const classroom of
        selectedClassSections
      ) {

        const [
          className,
          sectionName,
        ] = classroom.split("-");

        await createTeacherAssignment({

          teacherUuid:
            teacher.teacherUuid,

          schoolUuid:
            teacher.schoolUuid,

          className,

          sectionName,

          subjectName:
            selectedSubject,

          academicYear:
            "2026-2027",

          isActive:
            true,

        });

      }

      onContinue();

    }

    catch (error: any) {

      alert(
        error?.message ??
        "Unable to save teacher assignments."
      );

    }

    finally {

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
                `${(currentStep / 2) * 100}%`,

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
          STEP {currentStep} OF 2
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
              Select your teaching subject first.
              Your classroom assignment will be
              created for this subject.
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
                      setSelectedSubject(
                        item
                      );

                    }}

                    style={{
                      padding:
                        "12px 20px",

                      borderRadius:
                        16,

                      border:
                        selectedSubject === item
                          ? "2px solid #F59E0B"
                          : "2px solid transparent",

                      cursor:
                        "pointer",

                      fontSize:
                        18,

                      fontWeight:
                        600,

                      background:
                        selectedSubject === item
                          ? "#F59E0B"
                          : "#F1F5F9",

                      color:
                        selectedSubject === item
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


            {selectedSubject && (

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

                Selected Subject:{" "}

                <strong>
                  {selectedSubject}
                </strong>

              </div>

            )}

          </>

        )}


        {/* =====================================
            STEP 2 — CLASS + SECTION
        ====================================== */}

        {currentStep === 2 && (

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
                  Select the classrooms where you
                  teach {selectedSubject}.
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

                {selectedSubject}

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

                      {SECTIONS.map(
                        (sectionName) => {

                          const item =
                            `${className}-${sectionName}`;

                          const selected =
                            selectedClassSections.includes(
                              item
                            );

                          return (

                            <button
                              key={item}

                              onClick={() => {

                                if (selected) {

                                  setSelectedClassSections(
                                    selectedClassSections.filter(
                                      (x) =>
                                        x !== item
                                    )
                                  );

                                }

                                else {

                                  setSelectedClassSections([
                                    ...selectedClassSections,
                                    item,
                                  ]);

                                }

                              }}

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


            {selectedClassSections.length > 0 && (

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
                  {selectedClassSections.length}
                </strong>

                {" "}

                {selectedClassSections.length === 1
                  ? "classroom selected"
                  : "classrooms selected"}

                {" "}for{" "}

                <strong>
                  {selectedSubject}
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


          {currentStep !== 2 ? (

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