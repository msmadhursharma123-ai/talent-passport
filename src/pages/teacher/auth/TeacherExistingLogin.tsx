import React, { useState } from "react";

import {
    signIn,
    signOut
} from "../../../services/authenticationService";

interface Props {
    onSuccess: () => void;
    onRegister: () => void;
    onBack: () => void;
}

export default function TeacherExistingLogin({

    onSuccess,
    onRegister,
    onBack

}: Props) {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

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

            if (result.identity?.role !== "teacher") {
                const role = result.identity?.role;
                await signOut();

                const portalName =
                    role === "student"
                        ? "Student"
                        : role === "school"
                        ? "School"
                        : role === "partner"
                        ? "Partner"
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

  <div className="teacher-onboarding-page"
    style={{
        minHeight: "100vh",

        background:
            "linear-gradient(135deg, #F8F7F4 0%, #FCFAF7 38%, #FFF7EE 70%, #F3F6FB 100%)",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

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

     <div className="teacher-onboarding-card"
    style={{
        width: 500,
        background: "white",
        padding: 40,
        borderRadius: 24,

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
                        fontSize: 16,
                        fontWeight: 600,
                        cursor: "pointer",
                        marginBottom: 20,
                    }}
                >
                    ← Back
                </button>

                <h1>

                   Teacher Login

                </h1>

                <input
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(
                            e.target.value
                        )
                    }
                    style={{
                        width: "100%",
                        padding: 12,
                        marginTop: 20,
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
                        padding: 12,
                        marginTop: 16,
                    }}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        width: "100%",
                        marginTop: 24,
                        padding: 14,
                        border: "none",
                        borderRadius: 12,
                        background: "#F4A623",
                        color: "white",
                        cursor: "pointer",
                    }}
                >
                    {
                       loading
    ? "Signing In..."
    : "Teacher Login"
                    }
                </button>

                <button
                    onClick={onRegister}
                    style={{
                        width: "100%",
                        marginTop: 16,
                        padding: 12,
                        background: "transparent",
                        border: "1px solid #D9D9D9",
                        borderRadius: 12,
                        cursor: "pointer",
                    }}
                >
                    New User? Register
                </button>

            </div>

        
<style>{`
@media (max-width: 1024px) {
  .teacher-onboarding-page { padding: 28px !important; box-sizing: border-box; overflow-y: auto !important; }
  .teacher-onboarding-card { width: min(500px, 100%) !important; padding: 36px !important; box-sizing: border-box; }
}
@media (max-width: 600px) {
  .teacher-onboarding-page { min-height: 100dvh !important; padding: 14px !important; align-items: center !important; overflow-y: auto !important; }
  .teacher-onboarding-card { width: 100% !important; padding: 18px !important; border-radius: 18px !important; }
  .teacher-onboarding-card > button:first-child { margin-bottom: 14px !important; font-size: 14px !important; }
  .teacher-onboarding-card h1 { font-size: 27px !important; line-height: 1.12 !important; }
  .teacher-onboarding-card input, .teacher-onboarding-card select { box-sizing: border-box !important; max-width: 100% !important; font-size: 14px !important; padding: 12px !important; }
  .teacher-onboarding-card button { min-height: 44px; }
}
`}</style>
</div>

    );

}