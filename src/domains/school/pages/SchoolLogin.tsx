import React, { useEffect, useState } from "react";
import ForgotPasswordDialog from "../../../services/auth/ForgotPasswordDialog";
import {
    signIn,
    signOut,
    SignInResult
} from "../../../services/authenticationService";

interface Props {
    initialEmail?: string;
    onSuccess: (result: SignInResult) => void;
    onBack: () => void;
    onResetPassword: () => void;
}

export default function SchoolLogin({
    initialEmail = "",
    onSuccess,
    onBack,
    onResetPassword
}: Props) {
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

    useEffect(() => {
        const storedEmail =
            initialEmail?.trim() ||
            sessionStorage.getItem("schoolLoginEmail")?.trim() ||
            "";

        if (storedEmail) {
            setEmail(storedEmail);
        }
    }, [initialEmail]);

    async function handleLogin() {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            alert("Please enter your email.");
            return;
        }

        if (!password) {
            alert("Please enter your password.");
            return;
        }

        setLoading(true);

        try {
            const result = await signIn(
                normalizedEmail,
                password
            );

            if (!result.success) {
                alert(
                    result.error ??
                    "Unable to sign in. Please verify your email and password."
                );
                return;
            }

            if (result.identity?.role !== "school") {
                const role = result.identity?.role;
                await signOut();

                const portalName =
                    role === "student"
                        ? "Student"
                        : role === "teacher"
                        ? "Teacher"
                        : role === "partner"
                        ? "Partner"
                        : role === "admin"
                        ? "Admin"
                        : null;

                alert(
                    portalName
                        ? `This account belongs to the ${portalName} Portal. Please use ${portalName} Login.`
                        : "This account is not linked to the School Portal."
                );
                return;
            }

            sessionStorage.removeItem("schoolLoginEmail");
            onSuccess(result);
        } catch (error: any) {
            alert(
                error?.message ??
                "Unable to sign in. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    function handleRecoveryVerified(verifiedEmail: string) {
        sessionStorage.setItem("schoolLoginEmail", verifiedEmail);
        setForgotPasswordOpen(false);
        onResetPassword();
    }

    return (
        <div style={pageStyle}>
            <div style={glowTopRight} />
            <div style={glowBottomLeft} />

            <div style={cardStyle}>
                <button
                    type="button"
                    onClick={onBack}
                    style={backButtonStyle}
                >
                    ← Back
                </button>

                <div style={eyebrowStyle}>TALENT PASSPORT </div>
                <h1 style={titleStyle}>School Portal</h1>
                <p style={subtitleStyle}>
                    
                </p>

                <label style={labelStyle}>Administrator Email</label>
                <input
                    type="email"
                    autoComplete="username"
                    placeholder="Administrator email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    disabled={loading}
                />

                <label style={labelStyle}>Password</label>
                <input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            void handleLogin();
                        }
                    }}
                    style={inputStyle}
                    disabled={loading}
                />

                <button
                    type="button"
                    onClick={() => void handleLogin()}
                    disabled={loading}
                    style={primaryButtonStyle}
                >
                    {loading ? "Signing In..." : "School Login"}
                </button>

                <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    style={forgotButtonStyle}
                    disabled={loading}
                >
                    Forgot Password?
                </button>

               
            </div>

            <ForgotPasswordDialog
                open={forgotPasswordOpen}
                role="school"
                onClose={() => setForgotPasswordOpen(false)}
                onVerified={handleRecoveryVerified}
            />
        </div>
    );
}

const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    background:
        "linear-gradient(135deg, #F8F7F4 0%, #FCFAF7 38%, #FFF7EE 70%, #F3F6FB 100%)",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box"
};

const glowTopRight: React.CSSProperties = {
    position: "absolute",
    width: 460,
    height: 460,
    borderRadius: "50%",
    background: "rgba(244,166,35,0.08)",
    right: -190,
    top: -210,
    pointerEvents: "none"
};

const glowBottomLeft: React.CSSProperties = {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: "50%",
    background: "rgba(20,59,115,0.06)",
    left: -180,
    bottom: -190,
    pointerEvents: "none"
};

const cardStyle: React.CSSProperties = {
    width: "min(500px, 100%)",
    background: "rgba(255,255,255,0.97)",
    padding: 40,
    borderRadius: 24,
    boxShadow: "0 18px 50px rgba(15,23,42,.10)",
    position: "relative",
    zIndex: 1,
    boxSizing: "border-box"
};

const backButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    padding: 0,
    color: "#143B73",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 26
};

const eyebrowStyle: React.CSSProperties = {
    color: "#F4A623",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.4,
    marginBottom: 8
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    color: "#143B73",
    fontSize: 34,
    fontWeight: 800,
    lineHeight: 1.1
};

const subtitleStyle: React.CSSProperties = {
    color: "#64748B",
    lineHeight: 1.55,
    margin: "12px 0 28px"
};

const labelStyle: React.CSSProperties = {
    display: "block",
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
    margin: "0 0 8px"
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "15px 16px",
    marginBottom: 18,
    borderRadius: 12,
    border: "1px solid #CBD5E1",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
    background: "#FFFFFF"
};

const primaryButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: 16,
    marginTop: 6,
    borderRadius: 12,
    border: "none",
    background: "#143B73",
    color: "white",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer"
};

const forgotButtonStyle: React.CSSProperties = {
    width: "100%",
    marginTop: 14,
    padding: 10,
    border: "none",
    background: "transparent",
    color: "#143B73",
    fontWeight: 700,
    cursor: "pointer"
};

const helperStyle: React.CSSProperties = {
    margin: "18px 0 0",
    padding: 14,
    borderRadius: 12,
    background: "#F8FAFC",
    color: "#64748B",
    fontSize: 13,
    lineHeight: 1.5,
    textAlign: "center"
};
