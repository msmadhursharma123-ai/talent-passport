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

        /*
            Next Step
            ----------
            Here we will call authenticationService.updatePassword()
            and update school_admins.account_status = ACTIVE.
        */

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

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#F5F7FA"
            }}
        >

            <div
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