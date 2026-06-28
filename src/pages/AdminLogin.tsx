import React, { useState } from "react";

interface Props {
  onBack: () => void;
  onSuccess: () => void;
}

export default function AdminLogin({
  onBack,
  onSuccess,
}: Props) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const handleLogin = () => {
  const admins = [
  {
    email: "admin@talentpassport.in",
    password: "TalentPassport2026",
  },
  {
    email: "operations@talentpassport.in",
    password: "Operations2026",
  },
  {
    email: "msmadhursharma123@gmail.com",
    password: "TalentPassport2026",
  },
];

  const isValidAdmin = admins.find(
    (admin) =>
      admin.email === email &&
      admin.password === password
  );

  if (isValidAdmin) {
    localStorage.setItem(
      "userRole",
      "admin"
    );

    onSuccess();
    return;
  }

  alert("Invalid Admin Credentials");
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F7F4",
        padding: "70px",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
        }}
      >

        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: "#143B73",
            fontSize: "18px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "30px",
          }}
        >
          ← Back to Portal Selection
        </button>

        <div
          style={{
            color: "#F4A623",
            letterSpacing: "3px",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          TALENT PASSPORT
        </div>

        <h1
          style={{
            fontSize: "60px",
            color: "#143B73",
            marginBottom: "15px",
          }}
        >
          Admin Team Login
        </h1>

        <p
          style={{
            color: "#666",
            fontSize: "20px",
            marginBottom: "40px",
          }}
        >
          Platform Operations & Management
        </p>

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "40px",
            boxShadow:
              "0 10px 25px rgba(0,0,0,0.06)",
          }}
        >
          <input
            placeholder="Admin Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "16px",
              marginBottom: "20px",
              borderRadius: "12px",
              border:
                "1px solid #D1D5DB",
              fontSize: "16px",
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            style={{
              width: "100%",
              padding: "16px",
              marginBottom: "30px",
              borderRadius: "12px",
              border:
                "1px solid #D1D5DB",
              fontSize: "16px",
            }}
          />

          <button
            onClick={handleLogin}
            style={{
              background: "#F4A623",
              color: "white",
              border: "none",
              padding: "16px 28px",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "16px",
            }}
          >
            Login To Admin Portal →
          </button>
        </div>
      </div>
    </div>
  );
}