import React, { useState } from "react";
import {
    registerStudent
} from "../services/authenticationService";

import { getSupabaseClient } from "../supabaseClient";

interface Props {
  onRegistrationComplete: () => void;
  onVerificationRequired: (email: string) => void;
  onLogin: () => void;
  onBack: () => void;
}

export default function StudentRegistrationAuth({
  onRegistrationComplete,
  onVerificationRequired,
  onLogin,
  onBack,
}: Props) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

 async function handleCreateAccount() {

  if (!email.trim()) {
    alert("Please enter your email.");
    return;
  }

  if (!password.trim()) {
    alert("Please enter a password.");
    return;
  }

  if (password.length < 6) {
    alert("Password must contain at least 6 characters.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  setLoading(true);

  try {

    const result = await registerStudent(
  email,
  password
);

if (!result.success) {

  alert(
    result.error ??
    "Unable to create account."
  );

  return;

}

if (!result.userId) {

  alert(
    "Account created but authentication information was not returned."
  );

  return;

}
if (result.sessionExists) {

  alert(
    "Account created successfully. Let's complete your profile."
  );

console.log("CALLING onRegistrationComplete");

  onRegistrationComplete();

} else {

  alert(
    "Your account has been created.\n\nPlease verify your email before continuing."
  );

console.log("CALLING onVerificationRequired");

  onVerificationRequired(email);

}

  } catch (error: any) {

    alert(
      error?.message ??
      "Unable to create account."
    );

  } finally {

    setLoading(false);

  }


}

async function handleGoogleLogin() {

  const supabase = getSupabaseClient();

  if (!supabase) {
    alert("Supabase is not configured.");
    return;
  }

  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

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
          width: 520,
          background: "white",
          padding: 50,
          borderRadius: 28,
          boxShadow:
            "0 12px 40px rgba(0,0,0,0.08)",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: "#143B73",
            cursor: "pointer",
            fontWeight: 600,
            marginBottom: 25,
          }}
        >
          ← Back
        </button>

        <h1
          style={{
            margin: 0,
            fontSize: 38,
            fontWeight: 500,
          }}
        >
          Create Student Account
        </h1>

        <p
          style={{
            color: "#666",
            marginTop: 12,
            marginBottom: 35,
          }}
        >
          Create your login credentials to begin
          your Talent Passport journey.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <button
          onClick={handleCreateAccount}
          disabled={loading}
          style={primaryButton}
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>

        <div
          style={{
            textAlign: "center",
            marginTop: 24,
            marginBottom: 20,
            color: "#999",
          }}
        >
          OR
        </div>

       <button
  onClick={handleGoogleLogin}
  style={{
    ...secondaryButton,
    cursor: "pointer"
  }}
>
  Continue with Google
</button>

        <div
          style={{
            marginTop: 28,
            textAlign: "center",
          }}
        >
          Already have an account?
        </div>

        <button
          onClick={onLogin}
          style={{
            width: "100%",
            marginTop: 12,
            padding: 14,
            borderRadius: 12,
            border: "1px solid #DDD",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Existing User Login
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 14,
  marginBottom: 18,
  borderRadius: 12,
  border: "1px solid #DDD",
  fontSize: 15,
  boxSizing: "border-box",
};

const primaryButton: React.CSSProperties = {
  width: "100%",
  padding: 16,
  border: "none",
  borderRadius: 12,
  background: "#143B73",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 16,
};

const secondaryButton: React.CSSProperties = {
  width: "100%",
  padding: 16,
  borderRadius: 12,
  border: "1px solid #DDD",
  background: "#FFF",
  cursor: "pointer",
  color: "#666",
  fontWeight: 600,
};