import React, { useState } from "react";
import { getSupabaseClient } from "../supabaseClient";
import {
  getLatestAssessment
} from "../data/studentRepository";
interface Props {
  onSuccess: () => void;
}

export default function ExistingUserLogin({
  onSuccess,
  onRegister
}: any) {

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

localStorage.setItem(
  "studentProfile",
  JSON.stringify(data)
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

  console.log(
    "ASSESSMENT LOADED"
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