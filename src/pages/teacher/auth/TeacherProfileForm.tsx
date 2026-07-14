import React, { useState } from "react";

import { getSupabaseClient }
from "../../../supabaseClient";

import {

    createTeacherProfile

} from "../../../data/teacherRepository";

import {

    getSchools,

    SchoolOption

} from "../../../data/schoolRepository";

import {

    useEffect

} from "react";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

export default function TeacherProfileForm({
  onContinue,
  onBack,
}: Props) {

const [teacherName, setTeacherName] =
    useState("");

const [teacherEmail, setTeacherEmail] =
    useState("");

const [teacherMobile, setTeacherMobile] =
    useState("");

const [

    schoolUuid,

    setSchoolUuid

] = useState("");

const [

    schoolName,

    setSchoolName

] = useState("");

const [

    schools,

    setSchools

] = useState<SchoolOption[]>([]);

const [board, setBoard] =
    useState("");

const [department, setDepartment] =
    useState("");

const [designation, setDesignation] =
    useState("");

const [loading, setLoading] =
    useState(false);

useEffect(() => {

    loadSchools();

    loadAuthenticatedEmail();

}, []);

async function loadSchools() {

    const data =

        await getSchools();

    setSchools(

        data

    );

} 

async function loadAuthenticatedEmail() {

    const supabase =
        getSupabaseClient();

    if (!supabase)
        return;

    const {

        data

    } = await supabase.auth.getUser();

    setTeacherEmail(

        data.user?.email ?? ""

    );

}

 const handleContinue = async () => {

if (

    !teacherName.trim() ||

    !teacherEmail.trim() ||

    !teacherMobile.trim() ||

    !schoolUuid ||

    !department.trim() ||

    !designation.trim()

){

        alert(
            "Please complete all required fields."
        );

        return;

    }

    setLoading(true);

    try {


        
      const identity =
    await createTeacherProfile({

        fullName:
            teacherName,

        email:
            teacherEmail,

        phone:
            teacherMobile,

        schoolUuid,

        schoolName,

        board,

        department,

        designation

    });

if (!identity) {

    alert(
        "Unable to create teacher profile."
    );

    return;

}

onContinue();

return;

 }

catch (error: any) {

    alert(

        error?.message ??

        "Unable to save teacher profile."

    );

}

finally {

    setLoading(false);

}

};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F7F4",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
      }}
    >
      <div
        style={{
          width: 760,
          background: "white",
          padding: 60,
          borderRadius: 32,
          boxShadow:
            "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >

        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: "#143B73",
            fontSize: "20px",
            fontWeight: 700,
            cursor: "pointer",
            marginBottom: "30px",
          }}
        >
          ← Back
        </button>

        <input
  placeholder="Teacher Name *"
  value={teacherName}
  onChange={(e) =>
    setTeacherName(
      e.target.value
    )
  }
  style={inputStyle}
/>

<input
    value={teacherEmail}
    readOnly
    style={{
        ...inputStyle,
        background:"#F5F5F5",
        cursor:"not-allowed"
    }}
/>

<input
  placeholder="Teacher Mobile Number *"
  value={teacherMobile}
  onChange={(e) =>
    setTeacherMobile(
      e.target.value
    )
  }
  style={inputStyle}
/>

<select

    value={schoolUuid}

    onChange={(e)=>{

  const selected =

    schools.find(

        school =>

        school.schoolUuid ===

        e.target.value

    );

setSchoolUuid(
    e.target.value
);

setSchoolName(
    selected?.schoolName ?? ""
);

setBoard(
    selected?.board ?? ""
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

<div
    style={{
        ...inputStyle,
        background:"#F5F5F5",
        display:"flex",
        alignItems:"center"
    }}
>

    <strong>

        Board :

    </strong>

    <span
        style={{
            marginLeft:12
        }}
    >

        {board || "Not Selected"}

    </span>

</div>
  

<input
  placeholder="Department *"
  value={department}
  onChange={(e) =>
    setDepartment(
      e.target.value
    )
  }
  style={inputStyle}
/>

<input
  placeholder="Designation *"
  value={designation}
  onChange={(e) =>
    setDesignation(
      e.target.value
    )
  }
  style={inputStyle}
/>

        <button
    onClick={handleContinue}
    disabled={

    loading ||

    !schoolUuid

}
          style={{
            marginTop: 28,
            width: "100%",
            padding: 20,
            background: "#F4A623",
            color: "white",
            border: "none",
            borderRadius: 14,
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {
    loading
        ? "Saving Profile..."
        : "Continue"
}
        </button>

      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 20,
  marginTop: 16,
  fontSize: 18,
  borderRadius: 14,
  border: "1px solid #CBD5E1",
  boxSizing: "border-box" as const,
};