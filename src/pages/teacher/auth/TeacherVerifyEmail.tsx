import React from "react";

interface Props {
  email: string;
  onContinue: () => void;
  onBackToLogin: () => void;
}

export default function TeacherVerifyEmail({
  email,
  onContinue,
  onBackToLogin,
}: Props) {

  return (
    <div className="teacher-verify-page"
      style={{
        minHeight: "100vh",
        background: "#F8F7F4",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
      }}
    >
      <div className="teacher-verify-card"
        style={{
          width: 560,
          background: "white",
          borderRadius: 28,
          padding: 50,
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.08)",
        }}
      >

        <div
          style={{
            fontSize: 52,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          📧
        </div>

        <h1
          style={{
            margin: 0,
            textAlign: "center",
            color: "#143B73",
            fontSize: 36,
          }}
        >
          Verify Teacher Email
        </h1>

        <p
          style={{
            marginTop: 22,
            textAlign: "center",
            color: "#666",
            lineHeight: 1.7,
          }}
        >
       We have sent a verification link to

<br />

<strong>{email}</strong>

<br />
<br />

Please verify your email address to activate your
Teacher Portal account.

Once verification is complete,
click the button below to continue.
        </p>

        <button
          onClick={onContinue}
          style={{
            width: "100%",
            marginTop: 35,
            padding: 16,
            border: "none",
            borderRadius: 12,
            background: "#143B73",
            color: "white",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          Continue to Teacher Profile
        </button>

        <button
          onClick={onBackToLogin}
          style={{
            width: "100%",
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            border: "1px solid #DDD",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Back to Teacher Login
        </button>

      </div>
    
<style>{`
@media (max-width: 1024px) {
  .teacher-verify-page { padding: 28px !important; box-sizing: border-box; }
  .teacher-verify-card { width: min(560px, 100%) !important; padding: 40px !important; box-sizing: border-box; }
}
@media (max-width: 600px) {
  .teacher-verify-page { min-height: 100dvh !important; padding: 14px !important; }
  .teacher-verify-card { width: 100% !important; padding: 24px 16px !important; border-radius: 18px !important; }
  .teacher-verify-card > div:first-child { font-size: 42px !important; margin-bottom: 14px !important; }
  .teacher-verify-card h1 { font-size: 26px !important; line-height: 1.12 !important; }
  .teacher-verify-card p { font-size: 14px !important; line-height: 1.55 !important; margin-top: 16px !important; overflow-wrap: anywhere; }
  .teacher-verify-card button { padding: 13px !important; min-height: 44px; }
}
`}</style>
</div>
  );
}