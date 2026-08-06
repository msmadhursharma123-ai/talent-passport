import React, { useState } from "react";
import ForgotPasswordDialog from "../services/auth/ForgotPasswordDialog";
import {
    signIn,
    signOut
} from "../services/authenticationService";

interface Props {
    onSuccess: () => void;
    onRegister: () => void;
    onBack: () => void;
}

export default function ExistingUserLogin({

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


        
        const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

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

            if (result.identity?.role !== "student") {
                const role = result.identity?.role;
                await signOut();

                const portalName =
                    role === "teacher"
                        ? "Teacher"
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

 <div
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
        className="onboarding-card"
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

                    Existing User Login

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
                            : "Login"
                    }
                </button>

<div
    style={{
        marginTop: 18,
        textAlign: "center"
    }}
>

    <button
        type="button"
        onClick={() => setForgotPasswordOpen(true)}
        style={{
            background: "transparent",
            border: "none",
            color: "#143B73",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            textDecoration: "underline"
        }}
    >
        Forgot Password?
    </button>

</div>

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

        <ForgotPasswordDialog
    open={forgotPasswordOpen}
    role="student"
    onClose={() => setForgotPasswordOpen(false)}
/>

<style>{`
@media (max-width: 1024px) {
  .onboarding-page { padding: 28px !important; box-sizing: border-box; }
  .onboarding-card { width: min(500px, 100%) !important; box-sizing: border-box; padding: 34px !important; border-radius: 24px !important; box-shadow: 0 12px 34px rgba(15,23,42,.08); }
  .onboarding-card h1 { font-size: 30px !important; line-height: 1.12 !important; margin: 0 0 6px !important; }
  .onboarding-card input { box-sizing: border-box; border: 1px solid #CBD5E1; border-radius: 12px; font-size: 16px; }
}
@media (max-width: 600px) {
  .onboarding-page { min-height: 100dvh !important; padding: 18px 14px !important; align-items: center !important; }
  .onboarding-card { width: 100% !important; padding: 22px 18px !important; border-radius: 20px !important; }
  .onboarding-card > button:first-child { margin-bottom: 14px !important; font-size: 14px !important; }
  .onboarding-card h1 { font-size: 25px !important; }
  .onboarding-card input { padding: 12px !important; margin-top: 12px !important; font-size: 15px !important; }
  .onboarding-card input + input { margin-top: 12px !important; }
  .onboarding-card button { min-height: 44px; }
}
`}</style>
</div>

    );

}