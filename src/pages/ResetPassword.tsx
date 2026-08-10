import React, { useEffect, useState } from "react";
import {
    getCurrentSession,
    updatePasswordWithRecoverySession,
    signOut
} from "../services/authenticationService";

export default function ResetPasswordPage() {

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

const [error,setError]=
useState("");
    const [loading, setLoading] = useState(false);
const [checkingRecovery, setCheckingRecovery] = useState(true);
    const [validRecovery, setValidRecovery] = useState(false);

   

    useEffect(() => {
        let mounted = true;

        async function validateRecoverySession() {
            try {
                /*
                 * Supabase consumes the recovery token from the URL hash and
                 * creates a temporary authenticated recovery session.
                 * Give that process a short window to complete on slower
                 * production devices/browsers.
                 */
                let session = null;

                for (let attempt = 0; attempt < 20; attempt += 1) {
                    session = await getCurrentSession();

                    if (session || !mounted) {
                        break;
                    }

                    await new Promise((resolve) =>
                        setTimeout(resolve, 300)
                    );
                }

                if (!mounted) {
                    return;
                }

                setValidRecovery(Boolean(session));

                /*
                 * Only remove the recovery hash after the session has been
                 * established. Removing it earlier can destroy the token
                 * before Supabase has consumed it.
                 */
                if (session && window.location.hash) {
                    window.history.replaceState(
                        {},
                        document.title,
                        `${window.location.pathname}${window.location.search}`
                    );
                }
            } catch (error) {
                console.error(
                    "PASSWORD RECOVERY SESSION CHECK FAILED",
                    error
                );

                if (mounted) {
                    setValidRecovery(false);
                }
            } finally {
                if (mounted) {
                    setCheckingRecovery(false);
                }
            }
        }

        validateRecoverySession();

        return () => {
            mounted = false;
        };
    }, []);

    async function updatePassword() {
        setError("");

        if (!password.trim()) {
            setError("Please enter a password.");
            return;
        }

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (!hasUpper || !hasLower || !hasNumber) {
            setError(
                "Password must contain an uppercase letter, lowercase letter and a number."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const result =
                await updatePasswordWithRecoverySession(
                    password
                );

            if (!result.success) {
                throw new Error(
                    result.error ??
                    "Unable to update password."
                );
            }

            /*
             * End the temporary recovery session so the user is not silently
             * signed into a portal after changing the password.
             */
            /*
             * This was a password reset for an already-existing authenticated
             * account. It is never an onboarding/new-user event.
             * Keep only a short-lived semantic marker so the next Existing
             * User Login remains unambiguously an existing-user flow.
             */
            sessionStorage.setItem(
                "passwordResetCompleted",
                "true"
            );

            await signOut();

            alert(
                "Password updated successfully.\n\nPlease login using your new password."
            );

            window.location.href = "/";
        } catch (error: any) {
            setError(
                error?.message ??
                "Unable to update password."
            );
        } finally {
            setLoading(false);
        }
    }

    if (checkingRecovery) {
        return (
            <div className="reset-page">
                <div className="reset-card">
                    <div className="reset-icon">🔒</div>
                    <h1>Verifying Reset Link</h1>
                    <p>
                        Please wait while we securely verify your password reset link.
                    </p>
                </div>
                <style>{styles}</style>
            </div>
        );
    }

    if (!validRecovery) {

        return (

            <div className="reset-page">

                <div className="reset-card">

                    <h2>

                        Invalid Recovery Session

                    </h2>

                    <p>

                        Your password reset link has expired or is invalid.

                    </p>

                </div>

                <style>{styles}</style>

            </div>

        );

    }

    return (

        <div className="reset-page">

            <div className="reset-card">

                <div className="reset-icon">

                    🔒

                </div>

                <h1>

                    Create New Password

                </h1>

                <p>

                    Your identity has been verified.
                    Choose a strong password to continue.

                </p>

                <input

                    type="password"

                    placeholder="New Password"

                    value={password}

                    onChange={(e)=>
                        setPassword(
                            e.target.value
                        )
                    }

                />

                <input

                    type="password"

                    placeholder="Confirm Password"

                    value={confirmPassword}

                    onChange={(e)=>
                        setConfirmPassword(
                            e.target.value
                        )
                    }

                />

             <button

    type="button"

    onClick={updatePassword}

    disabled={

        loading ||

        !password ||

        !confirmPassword

    }

>

{

error && (

<div
className="reset-error"
>

{error}

</div>

)

}

                    {

                        loading

                            ? "Updating..."

                            : "Update Password"

                    }

                </button>

            </div>

            <style>{styles}</style>

        </div>

    );

}

const styles = `

.reset-error{

margin-bottom:18px;

padding:14px;

border-radius:10px;

background:#FEF3F2;

border:1px solid #FDA29B;

color:#B42318;

font-size:14px;

font-weight:600;

text-align:left;

}

.reset-page{

min-height:100vh;

display:flex;

justify-content:center;

align-items:center;

padding:30px;

box-sizing:border-box;

background:
linear-gradient(
135deg,
#F8F7F4 0%,
#FCFAF7 40%,
#FFF7EE 72%,
#F3F6FB 100%
);

}

.reset-card{

width:100%;

max-width:520px;

background:white;

border-radius:28px;

padding:42px;

box-shadow:
0 24px 60px rgba(15,23,42,.14);

text-align:center;

box-sizing:border-box;

}

.reset-icon{

width:82px;

height:82px;

margin:auto;

margin-bottom:20px;

border-radius:50%;

background:#FFF4DF;

display:flex;

justify-content:center;

align-items:center;

font-size:38px;

}

.reset-card h1{

margin:0;

font-size:34px;

color:#173F7A;

font-weight:800;

}

.reset-card h2{

margin:0;

font-size:30px;

color:#173F7A;

}

.reset-card p{

margin:18px 0 30px;

line-height:1.7;

color:#64748B;

font-size:16px;

}

.reset-card input{

width:100%;

padding:16px;

margin-bottom:16px;

border-radius:12px;

border:1px solid #CBD5E1;

font-size:16px;

box-sizing:border-box;

}

.reset-card button{

width:100%;

padding:16px;

border:none;

border-radius:12px;

background:#F4A623;

color:white;

font-size:16px;

font-weight:700;

cursor:pointer;

}

.reset-card button:hover{

background:#E89B14;

}

@media(max-width:1024px){

.reset-card{

max-width:470px;

padding:34px;

}

.reset-card h1{

font-size:30px;

}

.reset-icon{

width:72px;

height:72px;

font-size:34px;

}

}

@media(max-width:640px){

.reset-page{

padding:16px;

}

.reset-card{

padding:22px 18px;

border-radius:20px;

}

.reset-icon{

width:58px;

height:58px;

font-size:28px;

margin-bottom:16px;

}

.reset-card h1{

font-size:24px;

}

.reset-card h2{

font-size:22px;

}

.reset-card p{

font-size:14px;

margin:12px 0 22px;

}

.reset-card input{

padding:13px;

font-size:15px;

margin-bottom:12px;

}

.reset-card button{

padding:14px;

font-size:15px;

}

}

`;