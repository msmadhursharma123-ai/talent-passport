import React, { useState } from "react";

import {
    signIn
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

            switch (
                result.identity?.role
            ) {

                case "admin":

                    console.log(
                        "Admin authenticated."
                    );

                    break;

                case "student":

                    alert(
                        "This account belongs to a Student. Please use Student Login."
                    );

                    return;

                case "partner":

                    alert(
                        "This account belongs to a Partner. Please use Partner Login."
                    );

                    return;

                default:

                    alert(
                        "Unable to determine account role."
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

        <div
            style={{
                minHeight: "100vh",
                background: "#F8F7F4",
                padding: 70,
            }}
        >

            <div
                style={{
                    maxWidth: 700,
                    margin: "0 auto",
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

                <div
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

        </div>

    );

}