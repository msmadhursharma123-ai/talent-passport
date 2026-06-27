import React, { useState } from "react";
import { calculateTalentScores } from "../data/scoringEngine";

import { savePassport }
from "../data/passportRepository";

import {
  saveAssessment,
  saveStudentDNA
} from "../data/studentRepository";

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
        background: "#F8F7F4",
        padding: "60px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
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
   Selected: {(answers[current.id] || []).length}
{" / "}
Minimum Required: {current.minSelect}
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
              }}
            >
            <input
  type="range"
  min={1}
  max={10}
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
                }}
              />

              <div
                style={{
                  marginTop: "10px",
                  color: "#666",
                }}
              >
                Current Rating:
{answers[current.id] || 5}/10
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

      onBack?.();

      return;
    }

    setStep(step - 1);

  }}
  style={{
    padding:
      "14px 30px",
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
        (Array.isArray(currentAnswer) &&
          currentAnswer.length === 0)
      ) {
        alert("Please answer this question");
        return;
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

await savePassport(
  scores,
  answers
);

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