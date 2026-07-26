import React, { useState } from "react";
import { calculateTalentScores } from "../data/scoringEngine";

import { savePassport }
from "../data/passportRepository";

import {

saveAssessment,
saveStudentDNA,
updateStudentSection

}
from "../data/studentRepository";

import {
    getCurrentStudent,
    requireIdentity
} from "../services/identityService";

import {
  generatePassport
} from "../data/passportEngine";
interface Question {

  id: number;

  type: string;

  title: string;

  options?: readonly string[];

  min?: number;

  max?: number;

  maxSelect?: number;

  minSelect?: number;

}

interface Props {

  questions: readonly Question[];

  title: string;

  onComplete?: () => void;

  onBack?: () => void;

}

export default function QuestionWizard({
  questions,
  title,
  onComplete,
  onBack,
}: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});

  const current = questions[step];

  return (
  <div
  style={{
    minHeight: "100vh",

    background:
      "linear-gradient(135deg, #F8F7F4 0%, #FCFAF7 38%, #FFF7EE 70%, #F3F6FB 100%)",

    padding: "60px",

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
    style={{
      maxWidth: "1100px",
      margin: "0 auto",
      position: "relative",
      zIndex: 1,
    }}
  >
        {/* Progress */}

        <div
          style={{
            width: "100%",
            height: "8px",
            background: "#E5E5E5",
            borderRadius: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: `${
                ((step + 1) / questions.length) *
                100
              }%`,
              height: "100%",
              background: "#F4A623",
              borderRadius: "20px",
            }}
          />
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "40px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              color: "#F4A623",
              fontWeight: 600,
              marginBottom: "10px",
            }}
          >
            STEP {step + 1} OF {questions.length}
          </div>

          <div
            style={{
              float: "right",
              color: "#999",
              fontSize: "14px",
            }}
          >
            {title}
          </div>

          <h1
            style={{
              color: "#143B73",
              fontSize: "42px",
              marginBottom: "20px",
            }}
          >
            {current.title}
          </h1>

          {/* OPTIONS */}

          {current.type !== "slider" &&
            current.options && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(250px,1fr))",
                  gap: "15px",
                  marginTop: "30px",
                }}
              >
{current.type === "multi" && (
  <p
    style={{
      color: "#ff8c00",
      marginBottom: "20px",
    }}
  >
Select minimum {current.minSelect} and maximum {current.maxSelect} options.

    <br />

    Selected:
    {" "}
    {(answers[current.id] || []).length}
  </p>
)}
                {current.options.map((option) => {
  const selected =
    current.type === "multi"
      ? answers[current.id]?.includes(option)
      : answers[current.id] === option;

  return (
    <div
      key={option}
      onClick={() => {
        if (current.type === "multi") {
          const existing =
            answers[current.id] || [];

          if (existing.includes(option)) {
            setAnswers({
              ...answers,
              [current.id]: existing.filter(
                (x: string) => x !== option
              ),
            });
          } else {

if (
current.maxSelect &&
existing.length >= current.maxSelect
){
alert(
`You can select maximum ${current.maxSelect} options.`
);

return;
}

setAnswers({
...answers,
[current.id]: [
...existing,
option,
],
});

}
        } else {
          setAnswers({
            ...answers,
            [current.id]: option,
          });
        }
      }}
      style={{
        border: selected
          ? "2px solid #F4A623"
          : "1px solid #ddd",
        background: selected
          ? "#FFF7E8"
          : "white",
        padding: "18px",
        borderRadius: "14px",
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      {option}
    </div>
  );
})}
              </div>
            )}

        {/* SLIDER */}

{current.type === "slider" && (
  <div
    style={{
      marginTop: "50px",
      width: "100%",
    }}
  >
    {/* CURRENT RATING */}

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          color: "#64748B",
          fontSize: "15px",
          fontWeight: 600,
        }}
      >
        Select your rating
      </div>

      <div
        style={{
          minWidth: "62px",
          padding: "8px 14px",
          borderRadius: "12px",
          background: "#FFF7E8",
          border: "1px solid #F4A623",
          color: "#143B73",
          fontSize: "17px",
          fontWeight: 800,
          textAlign: "center",
        }}
      >
        {answers[current.id] || 5}/10
      </div>
    </div>

    {/* SLIDER */}

    <input
      type="range"
      min={1}
      max={10}
      step={1}
      value={answers[current.id] || 5}
      onChange={(e) =>
        setAnswers({
          ...answers,
          [current.id]: Number(
            e.target.value
          ),
        })
      }
      style={{
        width: "100%",
        cursor: "pointer",
        accentColor: "#F4A623",
      }}
    />

    {/* SCALE 1 — 10 */}

    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(10, 1fr)",
        marginTop: "12px",
        width: "100%",
      }}
    >
      {Array.from(
        { length: 10 },
        (_, index) => index + 1
      ).map((number) => {

        const selected =
          (answers[current.id] || 5) ===
          number;

        return (
          <div
            key={number}
            style={{
              display: "flex",
              justifyContent:
                number === 1
                  ? "flex-start"
                  : number === 10
                  ? "flex-end"
                  : "center",
            }}
          >
            <span
              style={{
                width: "30px",
                height: "30px",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                borderRadius: "50%",

                background: selected
                  ? "#F4A623"
                  : "#F8FAFC",

                border: selected
                  ? "1px solid #F4A623"
                  : "1px solid #E2E8F0",

                color: selected
                  ? "#FFFFFF"
                  : "#64748B",

                fontSize: "13px",
                fontWeight: selected
                  ? 800
                  : 600,

                transition: "all 0.2s ease",
              }}
            >
              {number}
            </span>
          </div>
        );
      })}
    </div>

    {/* SCALE LABELS */}

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "10px",

        color: "#94A3B8",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      <span>1</span>
      <span>10</span>
    </div>
  </div>
)}

          {/* Buttons */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              marginTop: "60px",
            }}
          >
<button
  onClick={() => {

    if (step === 0) {

      alert(
        "Your profile has already been saved. Please complete your questionnaire to continue."
      );

      return;

    }

    setStep(step - 1);

  }}
  style={{
    padding: "14px 30px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
  }}
>
  {step === 0
    ? "← Student Profile"
    : "← Previous Question"}
</button>

  <button
  disabled={false}
  onClick={async () => {

    // NEXT QUESTION

    if (step < questions.length - 1) {

      const currentAnswer =
        answers[current.id];

    if (
currentAnswer === undefined ||
(
Array.isArray(currentAnswer)
&&
currentAnswer.length === 0
)
){

alert(
"Please answer this question"
);

return;

}


if(

current.type === "multi"

&&

current.minSelect

){

const selected =
currentAnswer || [];


if(

selected.length <

current.minSelect

){

alert(

`Please select at least ${current.minSelect} options.`

);

return;

}

}


if(

current.type === "multi"

&&

current.maxSelect

){

const selected =
currentAnswer || [];


if(

selected.length >

current.maxSelect

){

alert(

`You can select maximum ${current.maxSelect} options.`

);

return;

}

}

      setStep(step + 1);
      return;
    }

    // FINAL VALIDATION

    for (const q of questions) {

      const answer =
        answers[q.id];

      if (
        answer === undefined ||
        (Array.isArray(answer) &&
          answer.length === 0)
      ) {
        alert(
          `Please answer Question ${q.id}`
        );
        return;
      }

      if (
        q.type === "multi" &&
        q.minSelect
      ) {

        const selected =
          answer || [];

        if (
          selected.length < q.minSelect
        ) {
          alert(
            `Question ${q.id}: Please select at least ${q.minSelect} options`
          );
          return;
        }
      }
    }

    // SAVE

    localStorage.setItem(
      "studentCalibration",
      JSON.stringify(answers)
    );

    const scores =
      calculateTalentScores(answers);
const passport =
  generatePassport(
    scores,
    answers
  );
    localStorage.setItem(
      "talentScores",
      JSON.stringify(scores)
    );

    console.log(
      "Student Answers",
      answers
    );

    console.log(
      "Talent Scores",
      scores
    );
localStorage.setItem(
  "studentPassport",
  JSON.stringify(passport)
);
    console.log(
      "TALENT PASSPORT GENERATED"
    );

 localStorage.setItem(
  "studentAnswers",
  JSON.stringify(answers)
);

console.log("CALLING savePassport");

console.log("========== BEFORE savePassport ==========");

console.log(
  "getCurrentStudent() =",
  getCurrentStudent()
);

try {

  console.log(
    "requireIdentity() =",
    requireIdentity()
  );

}

catch (error) {

  console.error(
    "requireIdentity FAILED",
    error
  );

}

console.log("CALLING savePassport");

await updateStudentSection(
  answers[2]
);

await savePassport(
  scores,
  answers
);

console.log("savePassport FINISHED");

const studentProfile =
  JSON.parse(
    localStorage.getItem(
      "studentProfile"
    ) || "{}"
  );

console.log(
  "STUDENT PROFILE",
  studentProfile
);

console.log(
  "STUDENT ID",
  studentProfile?.id
);

await saveAssessment(
  answers,
  scores,
  passport
);

await saveStudentDNA(
  answers,
  scores
);

console.log(
  "ASSESSMENT SAVED TO SUPABASE"
);

onComplete?.();
  }}
  style={{
    background: "#F4A623",
    color: "white",
    padding: "14px 30px",
    borderRadius: "12px",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  {step === questions.length - 1
    ? "Complete"
    : "Next"}
</button>
          </div>
        </div>
      </div>
    </div>
  );
}