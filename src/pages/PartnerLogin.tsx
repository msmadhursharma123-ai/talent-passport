import React, { useState } from "react";

import {
    signIn
} from "../services/authenticationService";

interface Props {
    onSuccess: () => void;
    onBack: () => void;
}

export default function PartnerLogin({

    onSuccess,
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

            switch (
                result.identity?.role
            ) {

                case "partner":

                    console.log(
                        "Partner authenticated."
                    );

                    break;

                case "student":

                    alert(
                        "This account belongs to a Student. Please use Student Login."
                    );

                    return;

                case "admin":

                    alert(
                        "This account belongs to an Admin. Please use Admin Login."
                    );

                    return;

                default:

                    alert(
                        "Unable to determine user role."
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

    <div
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

            </div>

        </div>

    );

}