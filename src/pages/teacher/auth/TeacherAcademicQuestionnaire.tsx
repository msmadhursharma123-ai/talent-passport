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
selectedClasses,
setSelectedClasses,
] = useState<string[]>([]);

const [
selectedSections,
setSelectedSections,
] = useState<string[]>([]);

const [
selectedSubjects,
setSelectedSubjects,
] = useState<string[]>([]);

const [loading, setLoading] =
useState(false);


//======================================
// NEXT STEP
//======================================

function goToNextStep() {

if (
currentStep === 1 &&
selectedClasses.length === 0
) {

alert(
"Please select at least one class."
);

return;

}


if (
currentStep === 2 &&
selectedSections.length === 0
) {

alert(
"Please select at least one section."
);

return;

}

setCurrentStep(
currentStep + 1
);

}


//======================================
// PREVIOUS STEP
//======================================

function goToPreviousStep() {

if (currentStep === 1) {
return;
}

setCurrentStep(
currentStep - 1
);

}


//======================================
// COMPLETE QUESTIONNAIRE
//======================================

async function handleComplete() {

if (
selectedSubjects.length === 0
) {

alert(
"Please select at least one subject."
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

for (const className of selectedClasses) {

for (const sectionName of selectedSections) {

for (const subjectName of selectedSubjects) {

await createTeacherAssignment({

teacherUuid:
teacher.teacherUuid,

schoolUuid:
teacher.schoolUuid,

className,

sectionName,

subjectName,

academicYear:
"2026-2027",

isActive:
true,

});

}

}

}

onContinue();

}

catch (error:any) {

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
      style={{
        minHeight: "100vh",
        background: "#F8F7F4",
        padding: 40,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 900,
          background: "white",
          borderRadius: 32,
          padding: 50,
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
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
            fontSize: 42,
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
          Help us personalize your Teacher
          Portal by selecting the classes,
          sections and subjects that you teach.
        </p>


        {/* PROGRESS BAR */}

        <div
          style={{
            height: 10,
            borderRadius: 20,
            background: "#E2E8F0",
            overflow: "hidden",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: `${(currentStep / 3) * 100}%`,
              height: "100%",
              background: "#F59E0B",
            }}
          />
        </div>


        <h3
          style={{
            color: "#F59E0B",
          }}
        >
          STEP {currentStep} OF 3
        </h3>


        {/* STEP 1 */}

        {currentStep === 1 && (
          <>
            <h2>
              Which Classes do you teach?
            </h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 30,
              }}
            >
              {CLASSES.map((item) => (
                <button
                  key={item}
                  onClick={() => {

                    if (
                      selectedClasses.includes(
                        item
                      )
                    ) {

                      setSelectedClasses(
                        selectedClasses.filter(
                          x => x !== item
                        )
                      );

                    } else {

                      setSelectedClasses([
                        ...selectedClasses,
                        item,
                      ]);

                    }

                  }}
                  style={{
                    padding: "18px 28px",
                    borderRadius: 16,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    background:
                      selectedClasses.includes(
                        item
                      )
                        ? "#F59E0B"
                        : "#F1F5F9",
                    color:
                      selectedClasses.includes(
                        item
                      )
                        ? "white"
                        : "#0F172A",
                  }}
                >
                  Class {item}
                </button>
              ))}
            </div>
          </>
        )}


        {/* STEP 2 */}

        {currentStep === 2 && (
          <>
            <h2>
              Which Sections do you teach?
            </h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 30,
              }}
            >
              {SECTIONS.map((item) => (
                <button
                  key={item}
                  onClick={() => {

                    if (
                      selectedSections.includes(
                        item
                      )
                    ) {

                      setSelectedSections(
                        selectedSections.filter(
                          x => x !== item
                        )
                      );

                    } else {

                      setSelectedSections([
                        ...selectedSections,
                        item,
                      ]);

                    }

                  }}
                  style={{
                    padding: "18px 28px",
                    borderRadius: 16,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    background:
                      selectedSections.includes(
                        item
                      )
                        ? "#F59E0B"
                        : "#F1F5F9",
                    color:
                      selectedSections.includes(
                        item
                      )
                        ? "white"
                        : "#0F172A",
                  }}
                >
                  Section {item}
                </button>
              ))}
            </div>
          </>
        )}


        {/* STEP 3 */}

        {currentStep === 3 && (
          <>
            <h2>
              Which Subjects do you teach?
            </h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                marginTop: 30,
              }}
            >
              {SUBJECTS.map((item) => (
                <button
                  key={item}
                  onClick={() => {

                    if (
                      selectedSubjects.includes(
                        item
                      )
                    ) {

                      setSelectedSubjects(
                        selectedSubjects.filter(
                          x => x !== item
                        )
                      );

                    } else {

                      setSelectedSubjects([
                        ...selectedSubjects,
                        item,
                      ]);

                    }

                  }}
                  style={{
                    padding: "18px 28px",
                    borderRadius: 16,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 18,
                    background:
                      selectedSubjects.includes(
                        item
                      )
                        ? "#F59E0B"
                        : "#F1F5F9",
                    color:
                      selectedSubjects.includes(
                        item
                      )
                        ? "white"
                        : "#0F172A",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </>
        )}


        {/* NAVIGATION BUTTONS */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            marginTop: 50,
          }}
        >

          <button
            onClick={goToPreviousStep}
            disabled={currentStep === 1}
            style={buttonStyle}
          >
            Previous
          </button>

          {currentStep !== 3 ? (

            <button
              onClick={goToNextStep}
              style={buttonStyle}
            >
              Next
            </button>

          ) : (

            <button
              onClick={handleComplete}
              disabled={loading}
              style={buttonStyle}
            >
              {loading
                ? "Saving..."
                : "Complete"}
            </button>

          )}

        </div>

      </div>
    </div>
  );

}

const buttonStyle = {
  padding: "16px 28px",
  borderRadius: "16px",
  border: "none",
  cursor: "pointer",
  background: "#F59E0B",
  color: "white",
  fontSize: 16,
  fontWeight: 700,
};