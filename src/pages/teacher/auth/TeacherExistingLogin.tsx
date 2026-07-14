import React, { useState } from "react";

import {
    signIn
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

console.log("LOGIN RESULT");
console.log(result);

console.log("LOGIN IDENTITY");
console.log(result.identity);

console.log("LOGIN ROLE");
console.log(result.identity?.role);

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

                case "student":

                    console.log(
                        "Student authenticated."
                    );

                    break;

case "teacher":

    console.log(
        "Teacher authenticated."
    );

    break;

                case "partner":

                    console.log(
                        "Partner authenticated."
                    );

                    break;

                case "admin":

                    console.log(
                        "Admin authenticated."
                    );

                    break;

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
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#F8F7F4",
            }}
        >

            <div
                style={{
                    width: 500,
                    background: "white",
                    padding: 40,
                    borderRadius: 24,
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
                    Create Teacher Account
                </button>

            </div>

        </div>

    );

}