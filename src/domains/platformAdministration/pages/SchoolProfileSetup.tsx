import React, { useState } from "react";

import {

    updateSchoolProfile

}

from "../../../data/schoolRepository";

interface Props{

    schoolUuid:string;

    schoolName:string;

    administratorName:string;

    administratorEmail:string;

    onContinue:()=>void;

    onBack:()=>void;

}

export default function SchoolProfileSetup({

    schoolUuid,

    schoolName,

    administratorName,

    administratorEmail,

    onContinue,

    onBack

}:Props) {

const [

    board,

    setBoard

] = useState("");

const [

    city,

    setCity

] = useState("");

const [

    principalName,

    setPrincipalName

] = useState("");

const [

    phone,

    setPhone

] = useState("");

const [

    website,

    setWebsite

] = useState("");

const [

    loading,

    setLoading

] = useState(false);

async function handleContinue(){

    if(

        !board.trim() ||

        !city.trim() ||

        !principalName.trim() ||

        !phone.trim()

    ){

        alert(

            "Please complete all required fields."

        );

        return;

    }

    setLoading(true);

    try{

       const success =

await updateSchoolProfile(

    schoolUuid,

    board,

    city,

    principalName,

    phone,

    ""

);

if(!success){

    alert(

        "Unable to save school profile."

    );

    return;

}

onContinue();

    }

    finally{

        setLoading(false);

    }

}

return (

<div
    style={{
        minHeight:"100vh",
        background:"#F8F7F4",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        padding:40
    }}
>

<div
    style={{
        width:760,
        background:"white",
        padding:60,
        borderRadius:32,
        boxShadow:
            "0 10px 30px rgba(0,0,0,.08)"
    }}
>

<button

    onClick={onBack}

    style={{

        background:"transparent",

        border:"none",

        color:"#143B73",

        fontSize:20,

        fontWeight:700,

        cursor:"pointer",

        marginBottom:30

    }}

>

← Back

</button>

<h2
    style={{
        marginBottom:10,
        color:"#143B73"
    }}
>

School Profile Setup

</h2>

<p
    style={{
        color:"#64748B",
        marginBottom:30
    }}
>

Complete your school information to finish onboarding.

</p>

<input

    value={schoolName}

    readOnly

    style={{

        ...inputStyle,

        background:"#F5F5F5",

        cursor:"not-allowed"

    }}

/>

<input

    value={administratorName}

    readOnly

    style={{

        ...inputStyle,

        background:"#F5F5F5",

        cursor:"not-allowed"

    }}

/>

<input

    value={administratorEmail}

    readOnly

    style={{

        ...inputStyle,

        background:"#F5F5F5",

        cursor:"not-allowed"

    }}

/>

<input

    placeholder="Board *"

    value={board}

    onChange={(e)=>

        setBoard(

            e.target.value

        )

    }

    style={inputStyle}

/>

<input

    placeholder="City *"

    value={city}

    onChange={(e)=>

        setCity(

            e.target.value

        )

    }

    style={inputStyle}

/>

<input

    placeholder="Principal Name *"

    value={principalName}

    onChange={(e)=>

        setPrincipalName(

            e.target.value

        )

    }

    style={inputStyle}

/>

<input

    placeholder="Phone Number *"

    value={phone}

    onChange={(e)=>

        setPhone(

            e.target.value

        )

    }

    style={inputStyle}

/>

<input

    placeholder="Website (Optional)"

    value={website}

    onChange={(e)=>

        setWebsite(

            e.target.value

        )

    }

    style={inputStyle}

/>

<button

    onClick={handleContinue}

    disabled={loading}

    style={{

        marginTop:28,

        width:"100%",

        padding:20,

        background:"#143B73",

        color:"white",

        border:"none",

        borderRadius:14,

        fontSize:18,

        fontWeight:700,

        cursor:"pointer"

    }}

>

{

    loading

    ?

    "Saving Profile..."

    :

    "Save & Continue"

}

</button>

</div>

</div>

);

}

const inputStyle: React.CSSProperties = {

    width:"100%",

    padding:20,

    marginTop:16,

    fontSize:18,

    borderRadius:14,

    border:"1px solid #CBD5E1",

    boxSizing:"border-box"

};