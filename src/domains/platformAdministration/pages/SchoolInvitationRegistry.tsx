import { useEffect, useState } from "react";

import useSchoolInvitationViewModel
from "../viewmodels/SchoolInvitationViewModel";

import {

    getSchools,

    SchoolOption

} from "../../../data/schoolRepository";

import {
    registerSchool,
    createSchoolAdmin
}
from "../../../services/authenticationService";

export default function SchoolInvitationRegistry() {

    console.log("SchoolInvitationRegistry Loaded");

    const {

        invitations,

        loading,

        saving,

        pendingCount,

        acceptedCount,

        expiredCount,

        generateInvitation,

        acceptInvitation,

        expireInvitation

    }

    =

    useSchoolInvitationViewModel();

    const [

        schools,

        setSchools

    ] = useState<SchoolOption[]>([]);

    const [

        schoolUuid,

        setSchoolUuid

    ] = useState("");

    const [

        schoolName,

        setSchoolName

    ] = useState("");

    const [

        administratorName,

        setAdministratorName

    ] = useState("");

const [

    temporaryPassword,

    setTemporaryPassword

] = useState(
    generatePassword()
);

    const [

        administratorEmail,

        setAdministratorEmail

    ] = useState("");

    useEffect(()=>{

        loadSchools();

    },[]);

    async function loadSchools(){

        const data =

            await getSchools();

        setSchools(

            data

        );

    }

function generatePassword(){

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let password = "TPOS-";

    for(let i=0;i<8;i++){

        password +=

            chars.charAt(

                Math.floor(

                    Math.random() *

                    chars.length

                )

            );

    }

    return password;

}

    async function handleGenerate(){

        if(

            !schoolUuid ||

            !administratorName ||

            !administratorEmail

        ){

            alert(

                "Please complete all fields."

            );

            return;

        }

      const result =

await registerSchool(

    administratorEmail,

    temporaryPassword

);

if(

    !result.success

){

    alert(

        result.error ??

        "Unable to create school account."

    );

    return;

}

const invitation = {

    invitationUuid:

        crypto.randomUUID(),

    schoolUuid,

    schoolName,

    administratorName,

    administratorEmail,

    invitationToken:

        result.userId ?? "",

    status: "Pending" as const,

    createdAt:

        new Date().toISOString(),

    expiresAt:null,

    acceptedAt:null,

    createdBy:null

};

const schoolAdminCreated =

await createSchoolAdmin(

    invitation,

    result.userId ?? ""

);

if(

    !schoolAdminCreated

){

    alert(

        "School administrator record could not be created."

    );

    return;

}

const success =

await generateInvitation(

    invitation

);

console.log("Generate Invitation Result:", success);

        if(success){

         alert(

`School Administrator Created Successfully.

Email:

${administratorEmail}

Temporary Password:

${temporaryPassword}

Please share these credentials securely with the school administrator.`

);

            setSchoolUuid("");

            setSchoolName("");

            setAdministratorName("");

            setAdministratorEmail("");

            setTemporaryPassword(

    generatePassword()

);

        }

    }

    function copyInvitationLink(

        token:string

    ){

        navigator.clipboard.writeText(

            `${window.location.origin}/school/setup?token=${token}`

        );

        alert(

            "Invitation Link Copied."

        );

    }

    return(

          <div style={pageStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>
          School Administration
          </h1>

          <p style={subtitleStyle}>
           Invite School Administrators to
                Talent Passport OS.
          </p>
        </div>
      </header>

            <div
                style={{

                    display:"flex",

                    gap:20,

                    marginBottom:30

                }}
            >

                <div style={cardStyle}>

                    <h4>

                        Pending

                    </h4>

                    <h2>

                        {pendingCount}

                    </h2>

                </div>

                <div style={cardStyle}>

                    <h4>

                        Accepted

                    </h4>

                    <h2>

                        {acceptedCount}

                    </h2>

                </div>

                <div style={cardStyle}>

                    <h4>

                        Expired

                    </h4>

                    <h2>

                        {expiredCount}

                    </h2>

                </div>

            </div>

            <div
                style={{

                    background:"white",

                    padding:24,

                    borderRadius:16,

                    boxShadow:

                    "0 2px 10px rgba(0,0,0,.06)",

                    marginBottom:30

                }}
            >

                <h3>

                    Generate Invitation

                </h3>

                <select

                    value={schoolUuid}

                    onChange={(e)=>{

                        const selected=

                        schools.find(

                            school=>

                            school.schoolUuid===

                            e.target.value

                        );

                        setSchoolUuid(

                            e.target.value

                        );

                        setSchoolName(

                            selected?.schoolName ??

                            ""

                        );

                    }}

                    style={inputStyle}

                >

                    <option value="">

                        Select School

                    </option>

                    {

                        schools.map(

                            school=>(

                                <option

                                    key={

                                        school.schoolUuid

                                    }

                                    value={

                                        school.schoolUuid

                                    }

                                >

                                    {

                                        school.schoolName

                                    }

                                </option>

                            )

                        )

                    }

                </select>

                <input

                    placeholder="Administrator Name"

                    value={administratorName}

                    onChange={(e)=>

                        setAdministratorName(

                            e.target.value

                        )

                    }

                    style={inputStyle}

                />

                <input

                    placeholder="Administrator Email"

                    value={administratorEmail}

                    onChange={(e)=>

                        setAdministratorEmail(

                            e.target.value

                        )

                    }

                    style={inputStyle}

                />

<div
    style={{
        display:"flex",
        gap:12,
        marginTop:16
    }}
>

<input

    value={temporaryPassword}

    readOnly

    style={{
        ...inputStyle,
        marginTop:0,
        flex:1,
        background:"#F8FAFC",
        fontWeight:700
    }}

/>

<button

    type="button"

    onClick={()=>{

        setTemporaryPassword(

            generatePassword()

        );

    }}

    style={{

        ...buttonStyle,

        marginTop:0,

        whiteSpace:"nowrap"

    }}

>

Generate Password

</button>

</div>

                <button

                    onClick={handleGenerate}

                    disabled={saving}

                    style={buttonStyle}

                >

                    {

                        saving

                        ?

                        "Generating..."

                        :

                        "Create School Administrator Account"

                    }

                </button>

            </div>

                        <div
                style={{

                    background:"white",

                    borderRadius:16,

                    padding:24,

                    boxShadow:

                    "0 2px 10px rgba(0,0,0,.06)"

                }}
            >

                <h3
                    style={{
                        marginBottom:20
                    }}
                >

                    Invitation History

                </h3>

                {

                    loading

                    ?

                    <p>

                        Loading...

                    </p>

                    :

                    <table

                        width="100%"

                        cellPadding={12}

                    >

                        <thead>

                            <tr>

                                <th align="left">

                                    School

                                </th>

                                <th align="left">

                                    Administrator

                                </th>

                                <th align="left">

                                    Email

                                </th>

                                <th align="left">

                                    Status

                                </th>

                                <th align="left">

                                    Expires

                                </th>

                                <th align="left">

                                    Actions

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                invitations.map(

                                    invitation=>(

                                        <tr

                                            key={

                                                invitation.invitationUuid

                                            }

                                        >

                                            <td>

                                                {

                                                    invitation.schoolName

                                                }

                                            </td>

                                            <td>

                                                {

                                                    invitation.administratorName

                                                }

                                            </td>

                                            <td>

                                                {

                                                    invitation.administratorEmail

                                                }

                                            </td>

                                            <td>

                                                <span

                                                    style={{

                                                        color:

                                                        invitation.status==="Accepted"

                                                        ?

                                                        "#16A34A"

                                                        :

                                                        invitation.status==="Expired"

                                                        ?

                                                        "#DC2626"

                                                        :

                                                        "#D97706",

                                                        fontWeight:600

                                                    }}

                                                >

                                                    {

                                                        invitation.status

                                                    }

                                                </span>

                                            </td>

                                            <td>

                                                {

                                                    invitation.expiresAt

                                                    ?

                                                    new Date(

                                                        invitation.expiresAt

                                                    ).toLocaleDateString()

                                                    :

                                                    "-"

                                                }

                                            </td>

                                            <td>

                                                <button

                                                    style={smallButtonStyle}

                                                    onClick={()=>{

                                                        copyInvitationLink(

                                                            invitation.invitationToken

                                                        );

                                                    }}

                                                >

                                                    Copy Link

                                                </button>

                                                {

                                                    invitation.status==="Pending"

                                                    &&

                                                    <>

                                                        <button

                                                            style={{

                                                                ...smallButtonStyle,

                                                                marginLeft:8,

                                                                background:"#16A34A"

                                                            }}

                                                            onClick={()=>{

                                                                acceptInvitation(

                                                                    invitation.invitationUuid

                                                                );

                                                            }}

                                                        >

                                                            Accept

                                                        </button>

                                                        <button

                                                            style={{

                                                                ...smallButtonStyle,

                                                                marginLeft:8,

                                                                background:"#DC2626"

                                                            }}

                                                            onClick={()=>{

                                                                expireInvitation(

                                                                    invitation.invitationUuid

                                                                );

                                                            }}

                                                        >

                                                            Expire

                                                        </button>

                                                    </>

                                                }

                                            </td>

                                        </tr>

                                    )

                                )

                            }

                        </tbody>

                    </table>

                }

            </div>

        </div>

    );

}

const cardStyle={

    flex:1,

    background:"white",

    padding:20,

    borderRadius:12,

    boxShadow:

    "0 2px 8px rgba(0,0,0,.05)"

};

const inputStyle={

    width:"100%",

    padding:14,

    marginTop:16,

    borderRadius:10,

    border:"1px solid #CBD5E1",

    fontSize:16,

    boxSizing:"border-box" as const

};

const buttonStyle={

    marginTop:20,

    padding:"14px 28px",

    border:"none",

    borderRadius:10,

    background:"#143B73",

    color:"white",

    fontWeight:600,

    cursor:"pointer"

};

const smallButtonStyle={

    padding:"8px 14px",

    border:"none",

    borderRadius:8,

    background:"#143B73",

    color:"white",

    cursor:"pointer",

    fontSize:13

};

const pageStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "28px",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "32px",
  fontWeight: 800,
  color: "#143B73",
};

const subtitleStyle: React.CSSProperties = {
  marginTop: "8px",
  color: "#64748B",
  fontSize: "15px",
};