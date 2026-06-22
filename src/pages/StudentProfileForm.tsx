import React, { useState } from "react";
import {
  createStudent
} from "../data/studentRepository";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function StudentProfileForm({
  onContinue,
  onBack,
}: Props) {

  const [studentName, setStudentName] =
    useState("");

  const [parentEmail, setParentEmail] =
    useState("");

  const [schoolName, setSchoolName] =
    useState("");

  const [className, setClassName] =
    useState("");

  const [parentMobile, setParentMobile] =
    useState("");

  const handleContinue = async () => {

    if (
      !studentName ||
      !parentEmail ||
      !parentMobile ||
      !schoolName
    ) {
      alert(
        "Please complete all fields"
      );
      return;
    }

    const student =
      await createStudent({
        student_name:
          studentName,

        parent_email:
          parentEmail,

        parent_mobile:
          parentMobile,

        school_name:
          schoolName,

        class_name:
          className,
      });

    if (!student) {

      alert(
        "Unable to create student profile"
      );

      return;
    }

    localStorage.setItem(
      "student_id",
      student.id
    );

    localStorage.setItem(
      "studentProfile",
      JSON.stringify(student)
    );

    onContinue();
  };

  return (
  <div
    style={{
      minHeight: "100vh",
      background: "#F8F7F4",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    }}
  >
    <div
      style={{
        width: 720,
        background: "white",
        padding: 60,
        borderRadius: 32,
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.08)",
      }}
    >

      <button
        onClick={onBack}
        style={{
          background: "transparent",
          border: "none",
          color: "#143B73",
          fontSize: "20px",
          fontWeight: 700,
          cursor: "pointer",
          marginBottom: "30px",
        }}
      >
        ← Back
      </button>

      <h1
        style={{
          margin: 0,
          marginBottom: 30,
          fontSize: 42,
          fontWeight: 400,
          color: "#0F172A",
        }}
      >
        Student Profile
      </h1>

      <input
        placeholder="Student Name"
        value={studentName}
        onChange={(e) =>
          setStudentName(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: 20,
          marginTop: 16,
          fontSize: 18,
          borderRadius: 14,
          border: "1px solid #CBD5E1",
          boxSizing: "border-box",
        }}
      />

      <input
        placeholder="Parent Email"
        value={parentEmail}
        onChange={(e) =>
          setParentEmail(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: 20,
          marginTop: 16,
          fontSize: 18,
          borderRadius: 14,
          border: "1px solid #CBD5E1",
          boxSizing: "border-box",
        }}
      />

      <input
        placeholder="Parent Mobile Number"
        value={parentMobile}
        onChange={(e) =>
          setParentMobile(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: 20,
          marginTop: 16,
          fontSize: 18,
          borderRadius: 14,
          border: "1px solid #CBD5E1",
          boxSizing: "border-box",
        }}
      />

      <input
        placeholder="School Name"
        value={schoolName}
        onChange={(e) =>
          setSchoolName(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: 20,
          marginTop: 16,
          fontSize: 18,
          borderRadius: 14,
          border: "1px solid #CBD5E1",
          boxSizing: "border-box",
        }}
      />

      <input
        placeholder="Class"
        value={className}
        onChange={(e) =>
          setClassName(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: 20,
          marginTop: 16,
          fontSize: 18,
          borderRadius: 14,
          border: "1px solid #CBD5E1",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={handleContinue}
        style={{
          marginTop: 28,
          width: "100%",
          padding: 20,
          background: "#F4A623",
          color: "white",
          border: "none",
          borderRadius: 14,
          fontSize: 18,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Continue
      </button>

    </div>
  </div>
);}
