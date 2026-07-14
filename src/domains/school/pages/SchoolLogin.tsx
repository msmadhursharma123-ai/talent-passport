import { useState } from "react";

import {
    signIn
} from "../../../services/authenticationService";

interface Props {

    onBack: () => void;

    onSuccess: () => void;

    onResetPassword: () => void;

}

export default function SchoolLogin({

    onBack,

    onSuccess,

    onResetPassword,

}: Props) {

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    async function handleLogin() {

        try {

            const result = await signIn(
                email.trim(),
                password
            );

            if (!result.success) {

                alert(result.error);

                return;

            }

            if (result.requiresPasswordReset) {

                onResetPassword();

                return;

            }

            onSuccess();

        }

        catch (e) {

            console.error(e);

            alert("Login failed.");

        }

    }

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#F4F7FC"
            }}
        >

            <div
              style={{
    width: 430,
    maxWidth: "90%",
    background: "white",
    padding: 42,
    borderRadius: 28,
    boxShadow: "0 18px 50px rgba(0,0,0,.08)"
}}
            >

                <button
                    onClick={onBack}
                    style={{
                        border: "none",
                        background: "transparent",
                        color: "#143B73",
                        fontWeight: 700,
                        fontSize: 16,
                        cursor: "pointer",
                        marginBottom: 28
                    }}
                >
                    ← Back
                </button>

                <h1
                    style={{
                        fontSize: 34,
                        fontWeight: 800,
                        margin: 0,
                        color: "#111827"
                    }}
                >
                    School Portal
                </h1>

                <p
                    style={{
                        color: "#64748B",
                        fontSize: 16,
lineHeight: 1.45,
marginTop: 12,
marginBottom: 28
                    }}
                >
                    Login using the credentials provided by the Platform Administrator.
                </p>

                <input
                    placeholder="Email Address"
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

                <button
                    onClick={handleLogin}
                    style={buttonStyle}
                >
                    Login
                </button>

            </div>

        </div>

    );

}

const inputStyle: React.CSSProperties = {

    width: "100%",

    padding: "16px",

    marginBottom: 16,

    borderRadius: 12,

    border: "1px solid #D7E0EE",

    background: "#EDF4FF",

    fontSize: 16,

    boxSizing: "border-box",

    outline: "none"

};

const buttonStyle: React.CSSProperties = {

    width: "100%",

    padding: "16px",

    borderRadius: 12,

    border: "none",

    background: "#143B73",

    color: "white",

    fontWeight: 700,

    fontSize: 18,

    cursor: "pointer",

    marginTop: 6

};