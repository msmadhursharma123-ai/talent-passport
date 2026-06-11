import React from "react";

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
        background:
          "linear-gradient(135deg,#091A3A,#143B73)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          textAlign: "center",
          color: "white",
        }}
      >
        

        <h1
          style={{
            fontSize: "72px",
            margin: 0,
            fontWeight: 800,
            lineHeight: 1.1,
          }}
        >
          Talent Passport
        </h1>

       

       <p
  style={{
    color: "#F4A825",
    fontSize: "28px",
    fontWeight: 600,
    marginTop: "30px",
  }}
>
  India's 1st NEP Aligned Talent & Identity Infrastructure.
</p>

<p
  style={{
    color: "white",
    fontSize: "16px",
    marginTop: "10px",
  }}
>
  One Passport. One Identity. Endless Possibilities.
</p>

        <button
          onClick={onContinue}
          style={{
            marginTop: "50px",
            background: "#F4A623",
            color: "white",
            border: "none",
            padding: "18px 40px",
            borderRadius: "14px",
            fontSize: "18px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Login To Your Identity World
        </button>
      </div>
    </div>
  );
}