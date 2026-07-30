import React, { useState } from "react";

import {
    signIn,
    signOut
} from "../services/authenticationService";

interface Props {
    onBack: () => void;
    onSuccess: () => void;
}

export default function AdminLogin({

    onBack,
    onSuccess

}: Props) {

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    async function handleLogin() {

        if (!email.trim()) {

            alert(
                "Please enter your email."
            );

            return;

        }

        if (!password.trim()) {

            alert(
                "Please enter your password."
            );

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

            if (result.identity?.role !== "admin") {
                const role = result.identity?.role;
                await signOut();

                const portalName =
                    role === "student"
                        ? "Student"
                        : role === "teacher"
                        ? "Teacher"
                        : role === "school"
                        ? "School"
                        : role === "partner"
                        ? "Partner"
                        : null;

                alert(
                    portalName
                        ? `This account belongs to the ${portalName} Portal. Please use ${portalName} Login.`
                        : "Unable to determine account role."
                );
                return;
            }


            onSuccess();

        }

        catch (error: any) {

            alert(
                error?.message ??
                "Authentication failed."
            );

        }

        finally {

            setLoading(false);

        }

    }

    return (

<div className="admin-login-page"
    style={{
        minHeight: "100vh",

        background:
            "linear-gradient(135deg, #F8F7F4 0%, #FCFAF7 38%, #FFF7EE 70%, #F3F6FB 100%)",

        padding: 70,

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

        <div className="admin-login-content"
    style={{
        maxWidth: 700,
        margin: "0 auto",

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
                        fontSize: 18,
                        fontWeight: 600,
                        cursor: "pointer",
                        marginBottom: 30,
                    }}
                >
                    ← Back to Portal Selection
                </button>

                <div
                    style={{
                        color: "#F4A623",
                        letterSpacing: 3,
                        fontWeight: 600,
                        marginBottom: 20,
                    }}
                >
                    TALENT PASSPORT
                </div>

                <h1
                    style={{
                        fontSize: 60,
                        color: "#143B73",
                        marginBottom: 15,
                    }}
                >
                    Admin Team Login
                </h1>

                <p
                    style={{
                        color: "#666",
                        fontSize: 20,
                        marginBottom: 40,
                    }}
                >
                    Platform Operations & Management
                </p>

                <div className="admin-login-card"
                    style={{
                        background: "white",
                        borderRadius: 24,
                        padding: 40,
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
                            padding: 16,
                            marginBottom: 20,
                            borderRadius: 12,
                            border:
                                "1px solid #D1D5DB",
                            fontSize: 16,
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
                            padding: 16,
                            marginBottom: 30,
                            borderRadius: 12,
                            border:
                                "1px solid #D1D5DB",
                            fontSize: 16,
                        }}
                    />

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        style={{
                            background: "#F4A623",
                            color: "white",
                            border: "none",
                            padding: "16px 28px",
                            borderRadius: 12,
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: 16,
                            opacity:
                                loading
                                    ? 0.7
                                    : 1,
                        }}
                    >
                        {
                            loading
                                ? "Signing In..."
                                : "Login To Admin Portal →"
                        }
                    </button>

                </div>

            </div>

        
<style>{`
@media (max-width: 1024px) {
  .admin-login-page { padding: 42px 28px !important; box-sizing: border-box; }
  .admin-login-content { max-width: 700px !important; width: 100% !important; }
  .admin-login-card { padding: 32px !important; box-sizing: border-box; }
}
@media (max-width: 600px) {
  .admin-login-page { min-height: 100dvh !important; padding: 24px 14px !important; }
  .admin-login-content > button { font-size: 14px !important; margin-bottom: 20px !important; }
  .admin-login-content > div:nth-of-type(1) { font-size: 13px !important; letter-spacing: 2px !important; margin-bottom: 12px !important; }
  .admin-login-content > h1 { font-size: 34px !important; line-height: 1.08 !important; margin-top: 0 !important; margin-bottom: 10px !important; }
  .admin-login-content > p { font-size: 15px !important; margin-bottom: 24px !important; }
  .admin-login-card { width: 100% !important; padding: 20px 16px !important; border-radius: 18px !important; }
  .admin-login-card input { box-sizing: border-box !important; font-size: 14px !important; padding: 13px !important; margin-bottom: 14px !important; }
  .admin-login-card button { width: 100% !important; padding: 14px 16px !important; font-size: 14px !important; }
}
`}</style>
</div>

    );

}