import { useState } from "react";

import ForgotPasswordDialog from "../../../services/auth/ForgotPasswordDialog";

import {
    signIn,
    signOut
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

    const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

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

            if (result.identity?.role !== "school") {
                const role = result.identity?.role;
                await signOut();

                const portalName =
                    role === "student" ? "Student"
                    : role === "teacher" ? "Teacher"
                    : role === "partner" ? "Partner"
                    : role === "admin" ? "Admin"
                    : null;

                alert(
                    portalName
                        ? `This account belongs to the ${portalName} Portal. Please use ${portalName} Login.`
                        : "Unable to determine account role."
                );
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

 <div className="school-login-page"
    style={{
        minHeight: "100vh",

        background:
            "linear-gradient(135deg, #F8F7F4 0%, #FCFAF7 38%, #FFF7EE 70%, #F3F6FB 100%)",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        position: "relative",
        overflow: "hidden"
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
            pointerEvents: "none"
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
            pointerEvents: "none"
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
            pointerEvents: "none"
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
            pointerEvents: "none"
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
            pointerEvents: "none"
        }}
    />

     <div className="school-login-card"
    style={{
        width: 430,
        maxWidth: "90%",
        background: "white",
        padding: 42,
        borderRadius: 28,
        boxShadow:
            "0 18px 50px rgba(0,0,0,.08)",

        position: "relative",
        zIndex: 1
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
                    className="school-login-submit"
                    onClick={handleLogin}
                    style={buttonStyle}
                >
                    Login
                </button>

                <button
                    type="button"
                    className="school-forgot-password"
                    onClick={() => setForgotPasswordOpen(true)}
                >
                    Forgot Password?
                </button>

                <ForgotPasswordDialog
                    open={forgotPasswordOpen}
                    role="school"
                    onClose={() => setForgotPasswordOpen(false)}
                    onVerified={() => {
                        /*
                         * Recovery is completed through the secure Supabase
                         * email link. The shared dialog stores the recovery
                         * context and closes itself; this callback remains
                         * only for compatibility with its public API.
                         */
                    }}
                />

            </div>

        
<style>{`
@media (max-width: 1024px) {
  .school-login-page { padding: 28px !important; box-sizing: border-box; }
  .school-login-card { width: min(430px, 100%) !important; max-width: 100% !important; padding: 34px !important; box-sizing: border-box; }
}
@media (max-width: 600px) {
  .school-login-page { min-height: 100dvh !important; padding: 14px !important; }
  .school-login-card { width: 100% !important; max-width: 100% !important; padding: 22px 16px !important; border-radius: 18px !important; }
  .school-login-card > button:first-child { font-size: 14px !important; margin-bottom: 18px !important; }
  .school-login-card h1 { font-size: 28px !important; line-height: 1.1 !important; }
  .school-login-card p { font-size: 14px !important; line-height: 1.45 !important; margin-bottom: 20px !important; }
  .school-login-card input { padding: 13px !important; margin-bottom: 12px !important; font-size: 14px !important; }
  .school-login-submit { padding: 14px !important; font-size: 16px !important; }
  .school-forgot-password {
    min-height: 44px;
    padding: 10px 0;
    font-size: 14px;
  }
}

.school-forgot-password {
  display: block;
  width: 100%;
  margin-top: 14px;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: #143B73;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
}

.school-forgot-password:hover {
  text-decoration: underline;
}
`}</style>
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