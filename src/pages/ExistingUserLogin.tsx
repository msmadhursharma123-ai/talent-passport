import React, { useState } from "react";
import { getSupabaseClient } from "../supabaseClient";
import {
  getLatestAssessment
} from "../data/studentRepository";

import {
  findStudentByEmail,
  findStudentMasterByEmail
}
from "../data/studentRepository";

interface Props {
  onSuccess: () => void;
  onRegister: () => void;
  onBack: () => void;
}

export default function ExistingUserLogin({
  onSuccess,
  onRegister,
  onBack
}: Props) {

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleLogin() {

    const supabase =
      getSupabaseClient();

    if (!supabase) return;

    setLoading(true);

    const { data }: any =
      await supabase
        .from("students")
        .select("*")
        .eq(
          "parent_email",
          email
        )
        .single();

    if (!data) {

      alert(
        "No registration found. Please sign up first."
      );

      onRegister();

      return;
    }

  const masterStudent =
  await findStudentMasterByEmail(
    email
  );

console.log(
  "MASTER STUDENT",
  masterStudent
);

const enrichedProfile = {

  ...data,

  student_id:
    masterStudent?.student_id,

  student_email:
    masterStudent?.student_email,

  school_name:
    masterStudent?.school_name ||
    data.school_name,

  class_name:
    masterStudent?.class_name ||
    data.class_name,

  phone:
    masterStudent?.phone ||
    data.phone ||
    data.parent_mobile ||
    "",

  parent_mobile:
    masterStudent?.phone ||
    data.phone ||
    data.parent_mobile ||
    ""
};

console.log(
  "ENRICHED PROFILE",
  enrichedProfile
);

localStorage.setItem(
  "studentProfile",
  JSON.stringify(
    enrichedProfile
  )
);

    const assessment =
      await getLatestAssessment(
        data.id
      );

    if (assessment) {

      localStorage.setItem(
        "studentCalibration",
        JSON.stringify(
          assessment.answers
        )
      );

      localStorage.setItem(
        "talentScores",
        JSON.stringify(
          assessment.scores
        )
      );

      localStorage.setItem(
        "studentPassport",
        JSON.stringify(
          assessment.passport
        )
      );
    }

    onSuccess();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent:
          "center",
        alignItems: "center",
        background:
          "#F8F7F4",
      }}
    >
      <div
        style={{
          width: 500,
          background: "white",
          padding: 40,
          borderRadius: 24,
        }}
      >

        <button
          onClick={onBack}
          style={{
            background:
              "transparent",
            border: "none",
            color: "#143B73",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          ← Back
        </button>

        <h1>
          Existing User Login
        </h1>

        <input
          placeholder="Parent Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: 12,
            marginTop: 20,
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 20,
            padding: 14,
            border: "none",
            borderRadius: 12,
            background:
              "#F4A623",
            color: "white",
          }}
        >
          {loading
            ? "Checking..."
            : "Access Passport"}
        </button>

      </div>
    </div>
  );
}