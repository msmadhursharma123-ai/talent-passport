import React, { useState } from "react";
import {
  createStudent
} from "../data/studentRepository";
interface Props {
  onContinue: () => void;
}

export default function StudentProfileForm({
  onContinue,
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

        parent_mobile: parentMobile,

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
            padding: 12,
            marginTop: 12,
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
            padding: 12,
            marginTop: 12,
          }}
        />

<input
  placeholder="Parent Mobile Number"
  value={parentMobile}
  onChange={(e) =>
    setParentMobile(e.target.value)
  }
  style={{
    width: "100%",
    padding: 12,
    marginTop: 12,
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
            padding: 12,
            marginTop: 12,
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
            padding: 12,
            marginTop: 12,
          }}
        />

        <button
          onClick={handleContinue}
          style={{
            marginTop: 20,
            width: "100%",
            padding: 14,
            background: "#F4A623",
            color: "white",
            border: "none",
            borderRadius: 12,
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}