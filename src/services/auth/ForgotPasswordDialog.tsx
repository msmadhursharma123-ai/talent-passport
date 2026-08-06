import React, { useEffect, useState } from "react";

import {
    verifyRecoveryIdentity,
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

}

export default function ForgotPasswordDialog({

    open,

    role,

    onClose

}: Props) {

    const [email, setEmail] =
        useState("");

    const [mobile, setMobile] =
        useState("");

    const [loading, setLoading] =
        useState(false);

const [status,setStatus]=useState<
"idle"|
"verifying"|
"sending"|
"success"
>("idle");

const [failedAttempts,setFailedAttempts]=
useState(0);

const [lockedUntil,setLockedUntil]=
useState<number|null>(null);

const [remainingSeconds,setRemainingSeconds]=
useState(0);

useEffect(() => {

    if (!lockedUntil) {

        return;

    }

    const interval = setInterval(() => {

        const seconds = Math.max(

            0,

            Math.ceil(

                (lockedUntil - Date.now()) / 1000

            )

        );

        setRemainingSeconds(seconds);

        if (seconds <= 0) {

            setLockedUntil(null);

            setFailedAttempts(0);

        }

    }, 1000);

    return () => clearInterval(interval);

}, [lockedUntil]);

useEffect(() => {

    if (!open) {

        return;

    }

    setStatus("idle");

    setEmail("");

    setMobile("");

    setLoading(false);

}, [open]);

    if (!open) {

        return null;

    }

  async function handleVerify() {

    if (

        lockedUntil &&

        Date.now() < lockedUntil

    ) {

        alert(

            `Too many failed attempts.

Please wait ${remainingSeconds} seconds before trying again.`

        );

        return;

    }

    if (!email.trim()) {

        alert("Please enter your email.");

        return;

    }

    if (!mobile.trim()) {

        alert("Please enter your registered mobile number.");

        return;

    }

    setLoading(true);

    setStatus("verifying");

    try {

        const verification = await verifyRecoveryIdentity(

            role,

            email.trim(),

            mobile.trim()

        );

        if (!verification.success) {

            const attempts = failedAttempts + 1;

            setFailedAttempts(attempts);

setStatus("idle");

            if (attempts >= 3) {

                setLockedUntil(

                    Date.now() + 5 * 60 * 1000

                );

                alert(

                    "Too many failed attempts.\n\nForgot Password has been locked for 5 minutes."

                );

                return;

            }

            alert(

                `${verification.error}

Remaining Attempts:

${3 - attempts}`

            );

            return;

        }

        setStatus("sending");

        const reset = await sendPasswordResetEmail(

            email.trim()

        );

        if (!reset.success) {

            alert(

                reset.error ??

                "Unable to send reset email."

            );

            setStatus("idle");

            return;

        }

        setStatus("success");

        setTimeout(() => {

            alert(

                `Identity verified successfully.

A secure password reset email has been sent.

Please check your Inbox or Spam folder.`

            );

            setEmail("");

setMobile("");

setStatus("idle");

onClose();

        }, 800);

    }

    catch (error: any) {

        alert(

            error?.message ??

            "Unable to verify identity."

        );

        setStatus("idle");

    }

    finally {

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

                    Verify your identity before resetting your password.

                </p>

{
status==="verifying" && (

<div className="forgot-status">

🔍 Verifying Identity...

</div>

)
}

{
status==="sending" && (

<div className="forgot-status">

📧 Sending Secure Reset Email...

</div>

)
}

{
status==="success" && (

<div className="forgot-status success">

✅ Recovery Email Sent Successfully

</div>

)
}

{

lockedUntil && (

<div

style={{

background:"#FEF3F2",

border:"1px solid #FDA29B",

padding:14,

borderRadius:12,

marginBottom:18,

color:"#B42318",

fontWeight:700,

textAlign:"center"

}}

>

Forgot Password Locked

<br/>

Try again in

{" "}

{remainingSeconds}

 seconds

</div>

)

}

                <input

                    placeholder="Registered Email"

                    value={email}

                    onChange={(e)=>
                        setEmail(
                            e.target.value
                        )
                    }

                    className="forgot-password-input"

style={inputStyle}

                />

                <input

                    placeholder="Registered Mobile Number"

                    value={mobile}

                    onChange={(e)=>
                        setMobile(
                            e.target.value
                        )
                    }

                    className="forgot-password-input"

style={inputStyle}

                />

                <button

                    onClick={handleVerify}

                    disabled={loading}

                    className="forgot-password-button"

style={primaryButton}

                >

                    {

                        loading

                            ? "Verifying..."

                            : "Verify Identity"

                    }

                </button>

                <button

                    onClick={onClose}

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