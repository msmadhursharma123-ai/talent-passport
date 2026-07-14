import { useEffect, useState } from "react";

import SchoolInvitationRepository
from "../repository/SchoolInvitationRepository";

import {
    registerSchool
}
from "../../../services/authenticationService";

import {
    SchoolAdminInvitation
}
from "../types/SchoolAdminInvitation";

import SchoolProfileSetup
from "./SchoolProfileSetup";

const repository =
new SchoolInvitationRepository();

export default function
SchoolInvitationValidation(){

    const [

        loading,

        setLoading

    ] = useState(true);

    const [

        invitation,

        setInvitation

    ] =

    useState<SchoolAdminInvitation | null>(null);

    const [

        invalid,

        setInvalid

    ] = useState(false);

    const [

        password,

        setPassword

    ] = useState("");

    const [

        confirmPassword,

        setConfirmPassword

    ] = useState("");

    const [

        creating,

        setCreating

    ] = useState(false);

    const [

        showProfile,

        setShowProfile

    ] = useState(false);

    useEffect(()=>{

        validate();

    },[]);

    async function validate(){

        const params =

        new URLSearchParams(

            window.location.search

        );

        const token =

        params.get("token");

        if(!token){

            setInvalid(true);

            setLoading(false);

            return;

        }

        const data =

        await repository

        .getInvitationByToken(

            token

        );

        if(!data){

            setInvalid(true);

            setLoading(false);

            return;

        }

        if(

            data.status !== "Pending"

        ){

            setInvalid(true);

            setLoading(false);

            return;

        }

        setInvitation(data);

        setLoading(false);

    }

    async function createSchoolAccount(){

        if(

            !invitation

        ){

            return;

        }

        if(

            !password

        ){

            alert(

                "Please enter password."

            );

            return;

        }

        if(

            password !==

            confirmPassword

        ){

            alert(

                "Passwords do not match."

            );

            return;

        }

        setCreating(true);

        try{

            const result =

            await registerSchool(

                invitation.administratorEmail,

                password

            );

            if(

                !result.success

            ){

                alert(

                    result.error ??

                    "Unable to create account."

                );

                return;

            }

if(

    !result.userId

){

    alert(

        "School account created but Auth User ID was not returned."

    );

    return;

}

await repository.createSchoolAdmin(

    invitation,

    result.userId

);

            setShowProfile(true);

        }

        finally{

            setCreating(false);

        }

    }

    if(loading){

        return(

            <div

                style={{

                    padding:60,

                    textAlign:"center"

                }}

            >

                <h2>

                    Validating Invitation...

                </h2>

            </div>

        );

    }

    if(invalid){

        return(

            <div

                style={{

                    padding:60,

                    textAlign:"center"

                }}

            >

                <h2

                    style={{

                        color:"#DC2626"

                    }}

                >

                    Invalid Invitation

                </h2>

                <p>

                    This invitation is invalid,

                    expired or already accepted.

                </p>

            </div>

        );

    }

    if(

        showProfile &&

        invitation

    ){

                return(

            <SchoolProfileSetup

                schoolUuid={

                    invitation.schoolUuid

                }

                schoolName={

                    invitation.schoolName

                }

                administratorName={

                    invitation.administratorName

                }

                administratorEmail={

                    invitation.administratorEmail

                }

                onContinue={async()=>{

                    const params =

                    new URLSearchParams(

                        window.location.search

                    );

                    const token =

                    params.get(

                        "token"

                    );

                    if(token){

                        await repository

                        .acceptInvitationToken(

                            token

                        );

                    }

                    alert(

                        "School Onboarding Completed."

                    );

                    /*
                        NEXT STEP

                        School Portal

                    */

                }}

                onBack={()=>{

                    setShowProfile(false);

                }}

            />

        );

    }

    return(

        <div

            style={{

                maxWidth:700,

                margin:"60px auto",

                background:"white",

                padding:40,

                borderRadius:16,

                boxShadow:

                "0 4px 20px rgba(0,0,0,.08)"

            }}

        >

            <h1

                style={{

                    color:"#143B73",

                    marginBottom:12

                }}

            >

                School Administrator Setup

            </h1>

            <p

                style={{

                    color:"#64748B",

                    marginBottom:30

                }}

            >

                Your invitation has been verified.

            </p>

            <div style={cardStyle}>

                <strong>

                    School

                </strong>

                <br/>

                {

                    invitation?.schoolName

                }

            </div>

            <div style={cardStyle}>

                <strong>

                    Administrator

                </strong>

                <br/>

                {

                    invitation?.administratorName

                }

            </div>

            <div style={cardStyle}>

                <strong>

                    Email

                </strong>

                <br/>

                {

                    invitation?.administratorEmail

                }

            </div>

            <input

                type="password"

                placeholder="Password"

                value={password}

                onChange={(e)=>

                    setPassword(

                        e.target.value

                    )

                }

                style={{

                    width:"100%",

                    padding:16,

                    marginTop:24,

                    borderRadius:10,

                    border:"1px solid #CBD5E1"

                }}

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

                style={{

                    width:"100%",

                    padding:16,

                    marginTop:16,

                    borderRadius:10,

                    border:"1px solid #CBD5E1"

                }}

            />

            <button

                onClick={

                    createSchoolAccount

                }

                disabled={creating}

                style={{

                    width:"100%",

                    marginTop:28,

                    padding:18,

                    background:"#143B73",

                    color:"white",

                    border:"none",

                    borderRadius:10,

                    fontWeight:700,

                    cursor:"pointer"

                }}

            >

                {

                    creating

                    ?

                    "Creating Account..."

                    :

                    "Create Account"

                }

            </button>

        </div>

    );

}

const cardStyle:

React.CSSProperties={

    padding:18,

    marginBottom:16,

    borderRadius:12,

    background:"#F8FAFC",

    border:"1px solid #E2E8F0"

};