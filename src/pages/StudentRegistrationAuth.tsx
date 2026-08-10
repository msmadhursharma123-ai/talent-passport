import React, { useState } from "react";
import {
    registerStudent
} from "../services/authenticationService";



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

const errorMessage =
result.error ?? "";

if (

errorMessage
.toLowerCase()
.includes("already")

||

errorMessage
.toLowerCase()
.includes("exists")

){

alert(

"This email is already registered.\n\nPlease login from the Existing User Login screen."

);

return;

}

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
    result.resumedIncompleteOnboarding
      ? "Your previous onboarding was incomplete. Let's complete it again."
      : "Account created successfully. Let's complete your profile."
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


  return (
<div
  className="onboarding-page"
  style={{
    minHeight: "100vh",

    background:
      "linear-gradient(135deg, #F8F7F4 0%, #FCFAF7 38%, #FFF7EE 70%, #F3F6FB 100%)",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    padding: 30,

    position: "relative",
    overflow: "hidden",
  }}
>

  {/* LARGE WARM TOP RIGHT CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: "500px",
      height: "500px",
      borderRadius: "50%",
      background:
        "rgba(244,166,35,0.085)",
      right: "-175px",
      top: "-215px",
      pointerEvents: "none",
    }}
  />

  {/* INNER WARM GLOW */}

  <div
    style={{
      position: "absolute",
      width: "270px",
      height: "270px",
      borderRadius: "50%",
      background:
        "rgba(255,184,76,0.055)",
      right: "7%",
      top: "18%",
      pointerEvents: "none",
    }}
  />

  {/* LARGE BLUE BOTTOM LEFT CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: "410px",
      height: "410px",
      borderRadius: "50%",
      background:
        "rgba(20,59,115,0.060)",
      left: "-205px",
      bottom: "-215px",
      pointerEvents: "none",
    }}
  />

  {/* WARM BOTTOM CIRCLE */}

  <div
    style={{
      position: "absolute",
      width: "235px",
      height: "235px",
      borderRadius: "50%",
      background:
        "rgba(244,166,35,0.060)",
      right: "15%",
      bottom: "7%",
      pointerEvents: "none",
    }}
  />

  {/* SOFT CENTER GLOW */}

  <div
    className="onboarding-card"
    style={{
      position: "absolute",
      width: "550px",
      height: "550px",
      borderRadius: "50%",
      background:
        "radial-gradient(circle, rgba(244,166,35,0.035) 0%, rgba(244,166,35,0) 70%)",
      left: "35%",
      top: "20%",
      pointerEvents: "none",
    }}
  />
   <div
  style={{
    width: 520,
    background: "white",
    padding: 50,
    borderRadius: 28,
    boxShadow:
      "0 12px 40px rgba(0,0,0,0.08)",
    position: "relative",
    zIndex: 1,
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
    
<style>{`
@media (max-width: 1024px) {
  .onboarding-page { padding: 28px !important; box-sizing: border-box; }
  .onboarding-card { width: min(520px, 100%) !important; box-sizing: border-box; padding: 38px !important; border-radius: 24px !important; }
  .onboarding-card h1 { font-size: 32px !important; line-height: 1.12 !important; }
}
@media (max-width: 600px) {
  .onboarding-page { min-height: 100dvh !important; padding: 18px 14px !important; align-items: center !important; }
  .onboarding-card { width: 100% !important; padding: 22px 18px !important; border-radius: 20px !important; }
  .onboarding-card > button:first-child { margin-bottom: 14px !important; }
  .onboarding-card h1 { font-size: 25px !important; }
  .onboarding-card h1 + p { margin-top: 8px !important; margin-bottom: 22px !important; font-size: 14px !important; line-height: 1.45 !important; }
  .onboarding-card input { padding: 12px !important; margin-bottom: 12px !important; font-size: 15px !important; }
  .onboarding-card > div { margin-top: 20px !important; font-size: 14px !important; }
}
`}</style>
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

