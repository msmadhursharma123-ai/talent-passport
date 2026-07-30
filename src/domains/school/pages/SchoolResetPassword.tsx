import { useState } from "react";

import {

    updatePassword

} from "../../../services/authenticationService";


interface Props {
    onSuccess: () => void;
}

export default function SchoolResetPassword({
    onSuccess,
}: Props) {

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleReset() {

        if (password.length < 8) {
            alert("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }


   const result = await updatePassword(

    password

);

if (!result.success) {

    alert(result.error);

    return;

}

alert("Password Updated Successfully.");

onSuccess();
    }



    return (

        <div className="school-reset-page"
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#F5F7FA"
            }}
        >

            <div className="school-reset-card"
                style={{
                    width: 500,
                    background: "white",
                    padding: 40,
                    borderRadius: 18,
                    boxShadow: "0 10px 30px rgba(0,0,0,.08)"
                }}
            >

                <h1>Reset Password</h1>

                <p>Create your permanent password.</p>

                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    style={inputStyle}
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                    style={inputStyle}
                />

                <button
                    style={buttonStyle}
                    onClick={handleReset}
                >
                    Save Password
                </button>

            </div>

        
<style>{`
@media (max-width: 1024px) {
  .school-reset-page { padding: 28px !important; box-sizing: border-box; }
  .school-reset-card { width: min(500px, 100%) !important; padding: 34px !important; box-sizing: border-box; }
}
@media (max-width: 600px) {
  .school-reset-page { min-height: 100dvh !important; padding: 14px !important; }
  .school-reset-card { width: 100% !important; padding: 22px 16px !important; border-radius: 18px !important; }
  .school-reset-card h1 { font-size: 28px !important; line-height: 1.1 !important; margin-top: 0 !important; margin-bottom: 10px !important; }
  .school-reset-card p { font-size: 14px !important; margin-bottom: 20px !important; }
  .school-reset-card input { padding: 13px !important; margin-bottom: 12px !important; font-size: 14px !important; }
  .school-reset-card button { padding: 14px !important; font-size: 15px !important; }
}
`}</style>
</div>

    );

}

const inputStyle:React.CSSProperties={

    width:"100%",
    padding:18,
    marginBottom:18,
    borderRadius:12,
    border:"1px solid #CBD5E1",
    boxSizing:"border-box"

};

const buttonStyle:React.CSSProperties={

    width:"100%",
    padding:18,
    borderRadius:12,
    border:"none",
    background:"#143B73",
    color:"white",
    cursor:"pointer"

};