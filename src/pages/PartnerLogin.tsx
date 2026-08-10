import React, { useState } from "react";

import {
    signIn,
    signOut
} from "../services/authenticationService";

import ForgotPasswordDialog
from "../services/auth/ForgotPasswordDialog";

interface Props {

    onSuccess: () => void;

    onBack: () => void;

    onForgotPasswordVerified: (email: string) => void;

}

export default function PartnerLogin({

    onSuccess,

    onBack,

    onForgotPasswordVerified

}: Props) {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

const [

forgotPasswordOpen,

setForgotPasswordOpen

] = useState(false);

    async function handleLogin() {

        if (!email.trim()) {

            alert("Please enter your email.");

            return;

        }

        if (!password.trim()) {

            alert("Please enter your password.");

            return;

        }

        setLoading(true);

        try {

            const result =
                await signIn(
                    email.trim(),
                    password
                );

            if (!result.success) {

                alert(
                    result.error ??
                    "Login failed."
                );

                return;

            }

            if (result.identity?.role !== "partner") {
                const role = result.identity?.role;
                await signOut();

                const portalName =
                    role === "student"
                        ? "Student"
                        : role === "teacher"
                        ? "Teacher"
                        : role === "school"
                        ? "School"
                        : role === "admin"
                        ? "Admin"
                        : null;

                alert(
                    portalName
                        ? `This account belongs to the ${portalName} Portal. Please use ${portalName} Login.`
                        : "Unable to determine user role."
                );
                return;
            }


            /* Existing Partner Login always returns to the Partner Portal. */
            sessionStorage.removeItem("passwordResetCompleted");
            onSuccess();

        }

        catch (error: any) {

            alert(
                error?.message ??
                "Login failed."
            );

        }

        finally {

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

        padding: 40,

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
  className="onboarding-card"
    style={{
        width: 700,
        background: "white",
        padding: 60,
        borderRadius: 32,
        boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",

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
                        fontSize: 20,
                        fontWeight: 700,
                        cursor: "pointer",
                        marginBottom: 30,
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
                        padding: 20,
                        fontSize: 18,
                        borderRadius: 14,
                        border:
                            "1px solid #CBD5E1",
                        boxSizing:
                            "border-box",
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
                        padding: 20,
                        fontSize: 18,
                        marginTop: 20,
                        borderRadius: 14,
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
                    {
                        loading
                            ? "Signing In..."
                            : "Login"
                    }
                </button>

<div

style={{

marginTop:20,

textAlign:"center"

}}

>

<button

type="button"

onClick={()=>

setForgotPasswordOpen(true)

}

style={{

background:"transparent",

border:"none",

color:"#173F7A",

fontWeight:700,

fontSize:15,

cursor:"pointer",

textDecoration:"underline"

}}

>

Forgot Password?

</button>

</div>

            </div>

<ForgotPasswordDialog
    open={forgotPasswordOpen}
    role="partner"
    onClose={() => setForgotPasswordOpen(false)}
    onVerified={(email) => {

        setForgotPasswordOpen(false);

        onForgotPasswordVerified(email);

    }}
/>
        
<style>{`
@media (max-width: 1024px) {
  .onboarding-page { padding: 28px !important; box-sizing: border-box; overflow-y: auto !important; }
  .onboarding-card { width: min(700px, 100%) !important; padding: 38px !important; border-radius: 26px !important; box-sizing: border-box; }
  .onboarding-card h1 { font-size: 34px !important; line-height: 1.1 !important; }
  
  .onboarding-card input, .onboarding-card select, .onboarding-card button { box-sizing: border-box; }

}
@media (max-width: 600px) {
  .onboarding-page { min-height: 100dvh !important; padding: 14px !important; align-items: center !important; overflow-y: auto !important; }
  .onboarding-card { width: 100% !important; padding: 20px 16px !important; border-radius: 20px !important; }
  .onboarding-card > button:first-child { margin-bottom: 12px !important; font-size: 14px !important; }
  .onboarding-card h1 { font-size: 26px !important; }
  .onboarding-card > h1 + p { font-size: 14px !important; margin-top: 8px !important; margin-bottom: 18px !important; }
  .onboarding-card input, .onboarding-card select { padding: 11px 12px !important; margin-top: 8px !important; font-size: 14px !important; min-height: 44px; border-radius: 10px !important; }
  .onboarding-card h3 { font-size: 16px !important; margin-top: 20px !important; margin-bottom: 8px !important; }
  .onboarding-card p { line-height: 1.45 !important; }
  .onboarding-card .responsive-age-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; margin-top: 4px !important; }
  .onboarding-card .responsive-age-grid input { min-width: 0 !important; }
}
`}</style>
</div>

    );

}