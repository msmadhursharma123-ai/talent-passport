import React from "react";
import logo from "../assets/logo.png";

interface Props {
  onContinue: () => void;
}

export default function IdentityWorld({
  onContinue,
}: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          textAlign: "center",
        }}
      >
        <img
  src={logo}
  alt="Talent Passport"
  style={{
    width: "950px",
    maxWidth: "95%",
    display: "block",
    margin: "0 auto 40px auto",
  }}
/>

<h1
  style={{
    color: "#173F7A",
    fontSize: "64px",
    fontWeight: 700,
    lineHeight: 1.15,
    marginBottom: "24px",
    textAlign: "center",
  }}
>
  India's 1st NEP Aligned Talent & Identity
  Infrastructure
</h1>

<p
  style={{
    color: "#475569",
    fontSize: "24px",
    marginBottom: "50px",
    textAlign: "center",
  }}
>
  One Passport. One Identity. Endless Possibilities.
</p>

<button
  onClick={onContinue}
  style={{
    background: "#F4A825",
    color: "white",
    border: "none",
    padding: "20px 50px",
    borderRadius: "14px",
    fontSize: "20px",
    fontWeight: 700,
    cursor: "pointer",
  boxShadow:
  "0 12px 30px rgba(244,168,37,0.35)",
  }}
>
  Login To Your Identity World
</button>
      </div>
    </div>
  );
}