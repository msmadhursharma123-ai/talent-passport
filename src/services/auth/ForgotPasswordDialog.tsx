import React, { useEffect, useState } from "react";

import {
    sendPasswordResetEmail
} from "../../services/authenticationService";

interface Props {
    open: boolean;

    role:
        | "student"
        | "teacher"
        | "partner"
        | "school"
        | "admin";

    onClose: () => void;

    /*
     * Kept in the public component API for compatibility with the
     * existing login/portal callers. The recovery flow now completes
     * through the Supabase recovery email, so this callback is not used
     * to enter the reset page prematurely.
     */
    onVerified: (email: string) => void;
}

export default function ForgotPasswordDialog({
    open,
    role,
    onClose
}: Props) {

    const [email, setEmail] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [status, setStatus] = useState<
        "idle" |
        "sending" |
        "success"
    >("idle");

    useEffect(() => {
        if (!open) {
            return;
        }

        setStatus("idle");
        setEmail("");
        setLoading(false);
    }, [open]);

    if (!open) {
        return null;
    }

    async function handleVerify() {

        const verifiedEmail =
            email.trim();

        if (!verifiedEmail) {
            alert("Please enter your email.");
            return;
        }

        setLoading(true);
        setStatus("sending");

        try {
            /*
             * IMPORTANT:
             *
             * The old flow first called the `verify-recovery` Edge Function.
             * That function currently returns HTTP 404 in the deployed
             * environment, which blocked password recovery before Supabase
             * could send the actual recovery email.
             *
             * The Supabase recovery email itself is the secure ownership
             * verification step. The user must open that email link before
             * ResetPasswordPage can obtain the PASSWORD_RECOVERY session.
             *
             * We therefore remove the broken preflight dependency without
             * changing OTP, login, identity, or any other portal flow.
             */
            const resetResult =
                await sendPasswordResetEmail(
                    verifiedEmail
                );

            if (!resetResult.success) {
                throw new Error(
                    resetResult.error ??
                    "Unable to send the password reset email."
                );
            }

            /*
             * Recovery context only.
             * These values never create an identity and never trigger
             * onboarding.
             */
            sessionStorage.setItem(
                "recoveryEmail",
                verifiedEmail
            );

            sessionStorage.setItem(
                "recoveryRole",
                role
            );

            setStatus("success");
            setEmail("");

            alert(
                "Password reset link sent successfully.\n\nPlease check your email and open the secure reset link to create your new password."
            );

            /*
             * Do NOT call onVerified() here.
             *
             * The recovery session is created only after the user opens the
             * Supabase email link. App.tsx then routes to ResetPasswordPage.
             */
            onClose();

        } catch (error: any) {

            console.error(
                "PASSWORD RECOVERY EMAIL FAILED",
                error
            );

            setStatus("idle");

            alert(
                error?.message ??
                "Unable to send the password reset email."
            );

        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={overlayStyle}
        >
            <div
                className="forgot-password-dialog"
                style={dialogStyle}
            >

                <h2
                    className="forgot-password-title"
                    style={titleStyle}
                >
                    Forgot Password
                </h2>

                <p
                    className="forgot-password-subtitle"
                    style={subtitleStyle}
                >
                    Enter your registered email. We will send a secure password reset link to verify account ownership and create a new password.
                </p>

                {status === "sending" && (
                    <div className="forgot-status">
                        📧 Sending Secure Reset Link...
                    </div>
                )}

                {status === "success" && (
                    <div className="forgot-status success">
                        ✅ Recovery Email Sent Successfully
                    </div>
                )}

                <input
                    type="email"
                    autoComplete="email"
                    placeholder="Registered Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(
                            e.target.value
                        )
                    }
                    className="forgot-password-input"
                    style={inputStyle}
                    disabled={loading}
                />

                <button
                    type="button"
                    onClick={handleVerify}
                    disabled={loading}
                    className="forgot-password-button"
                    style={primaryButton}
                >
                    {
                        loading
                            ? "Sending..."
                            : "Verify & Send Reset Link"
                    }
                </button>

                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="forgot-password-button"
                    style={secondaryButton}
                >
                    Cancel
                </button>

            </div>
        </div>
    );
}

const overlayStyle: React.CSSProperties = {

    position: "fixed",

    inset: 0,

    background: "rgba(15,23,42,.45)",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    padding: 24,

    boxSizing: "border-box",

    overflowY: "auto",

    zIndex: 10000

};

const dialogStyle: React.CSSProperties = {

    width: "100%",

    maxWidth: 500,

    background: "#FFFFFF",

    borderRadius: 26,

    padding: 36,

    boxShadow:
        "0 24px 60px rgba(15,23,42,.18)",

    position: "relative",

    overflow: "hidden"

};

const titleStyle: React.CSSProperties = {

    margin: 0,

    color: "#173F7A",

    fontSize: 28,

    fontWeight: 800

};

const subtitleStyle: React.CSSProperties = {

    color: "#64748B",

    marginTop: 12,

    marginBottom: 28,

    lineHeight: 1.6

};

const inputStyle: React.CSSProperties = {

    width: "100%",

    padding: 16,

    marginBottom: 16,

    borderRadius: 12,

    border: "1px solid #CBD5E1",

    boxSizing: "border-box"

};

const primaryButton: React.CSSProperties = {

    width: "100%",

    padding: 16,

    border: "none",

    borderRadius: 12,

    background: "#F4A623",

    color: "#FFFFFF",

    fontWeight: 700,

    cursor: "pointer"

};

const secondaryButton: React.CSSProperties = {

    width: "100%",

    padding: 16,

    marginTop: 14,

    borderRadius: 12,

    border: "1px solid #CBD5E1",

    background: "#FFFFFF",

    cursor: "pointer"

};

<style>{`

.forgot-status{

margin-bottom:18px;

padding:14px;

border-radius:12px;

background:#EEF6FF;

border:1px solid #B2DDFF;

color:#175CD3;

font-weight:700;

text-align:center;

}

.forgot-status.success{

background:#ECFDF3;

border:1px solid #ABEFC6;

color:#067647;

}

@media (max-width:1024px){

.forgot-password-dialog{

max-width:460px !important;

padding:30px !important;

border-radius:24px !important;

}

.forgot-password-title{

font-size:25px !important;

}

.forgot-password-subtitle{

font-size:15px !important;

margin-bottom:22px !important;

}

.forgot-password-input{

padding:14px !important;

font-size:15px !important;

}

.forgot-password-button{

padding:15px !important;

font-size:15px !important;

}

}

@media (max-width:640px){

.forgot-password-dialog{

width:100% !important;

padding:22px 18px !important;

border-radius:20px !important;

}

.forgot-password-title{

font-size:22px !important;

text-align:center;

}

.forgot-password-subtitle{

font-size:14px !important;

text-align:center;

line-height:1.6;

margin-bottom:18px !important;

}

.forgot-password-input{

padding:13px !important;

font-size:15px !important;

margin-bottom:12px !important;

}

.forgot-password-button{

padding:14px !important;

font-size:15px !important;

}

}

`}</style>