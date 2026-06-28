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