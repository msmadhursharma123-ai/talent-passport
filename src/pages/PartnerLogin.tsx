import React, {
  useState
} from "react";

import {
  findPartnerByEmail
} from "../data/partnerRepository";

interface Props {
  onSuccess: () => void;
  onBack: () => void;
}

export default function PartnerLogin({
  onSuccess,
  onBack
}: Props) {

  const [email,
    setEmail] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  async function
  handleLogin() {

    if (!email) {

      alert(
        "Please enter your email"
      );

      return;
    }

    setLoading(true);

    const partner =
      await findPartnerByEmail(
        email
      );

    setLoading(false);

    if (!partner) {

      alert(
        "Partner not found"
      );

      return;
    }

    localStorage.setItem(
      "partnerProfile",
      JSON.stringify(partner)
    );

    localStorage.setItem(
      "partner_id",
      partner.partner_id
    );

    localStorage.setItem(
      "userRole",
      "partner"
    );

    onSuccess();
  }

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
          width: 700,
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
            fontSize: 42,
            fontWeight: 400,
            color: "#0F172A",
          }}
        >
          Partner Login
        </h1>

        <p
          style={{
            color: "#64748B",
            fontSize: 18,
            marginTop: 12,
            marginBottom: 30,
          }}
        >
          Welcome back to Talent Passport
        </p>

        <input
          placeholder="Email Address"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: "20px",
            fontSize: "18px",
            borderRadius: "14px",
            border:
              "1px solid #CBD5E1",
            boxSizing:
              "border-box",
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            marginTop: 30,
            width: "100%",
            padding: 20,
            background: "#F4A623",
            color: "white",
            border: "none",
            borderRadius: 14,
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
            opacity:
              loading ? 0.7 : 1,
          }}
        >
          {loading
            ? "Signing In..."
            : "Login"}
        </button>

      </div>
    </div>
  );
}