import React, { useState } from "react";

import { getSupabaseClient }
from "../../../supabaseClient";

import {
createTeacherProfile
} from "../../../data/teacherRepository";

import {
  isTeacherEmailAuthorizedForSchool,
  getTeacherAuthorizedSchools
} from "../../../data/schoolTeacherAllowlistRepository";

import type { SchoolOption } from "../../../data/schoolRepository";

import {
useEffect
} from "react";

import { checkSchoolProfileCapacity }
from "../../../services/schoolProfileCapacity";

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
  void loadAuthenticatedTeacherContext();
}, []);

async function loadAuthenticatedTeacherContext() {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { data } = await supabase.auth.getUser();
  const email = data.user?.email ?? "";
  setTeacherEmail(email);

  if (!email) {
    setSchools([]);
    return;
  }

  const authorizedSchools = await getTeacherAuthorizedSchools(email);
  setSchools(authorizedSchools as SchoolOption[]);

  if (authorizedSchools.length === 1) {
    const school = authorizedSchools[0];
    setSchoolUuid(school.schoolUuid);
    setSchoolName(school.schoolName);
    setBoard(school.board);
  }
}

const handleContinue = async () => {

if (

!teacherName.trim() ||
!teacherEmail.trim() ||
!teacherMobile.trim() ||
!schoolUuid ||
!department.trim() ||
!designation.trim()

) {

alert(
"Please complete all mandatory profile details."
);

return;

}

setLoading(true);

try {

const authorizedForSchool =
  await isTeacherEmailAuthorizedForSchool(
    teacherEmail,
    schoolUuid
  );

if (!authorizedForSchool) {
  alert(
    "This teacher email is not authorized for the selected school. Please select the school assigned to this email."
  );
  return;
}

const capacity =
await checkSchoolProfileCapacity(
schoolUuid,
"teacher"
);

if (!capacity.allowed) {

alert(
capacity.message ??
"Teacher profile limit exhausted. Please contact school administration for creating the profile."
);

return;

}

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

designation,

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

catch (error:any) {

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
  <div className="teacher-onboarding-page"
  style={{
    minHeight: "100vh",

    background:
      "linear-gradient(135deg, #F8F7F4 0%, #FCFAF7 38%, #FFF7EE 70%, #F3F6FB 100%)",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    padding: 40,

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
  <div className="teacher-onboarding-card"
  style={{
    width: 760,
    background: "white",
    padding: 60,
    borderRadius: 32,
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",

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

        {schools.length ? "Select Your School" : "No school access assigned"}

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
    
<style>{`
@media (max-width: 1024px) {
  .teacher-onboarding-page { padding: 28px !important; box-sizing: border-box; overflow-y: auto !important; }
  .teacher-onboarding-card { width: min(760px, 100%) !important; padding: 36px !important; box-sizing: border-box; }
}
@media (max-width: 600px) {
  .teacher-onboarding-page { min-height: 100dvh !important; padding: 14px !important; align-items: center !important; overflow-y: auto !important; }
  .teacher-onboarding-card { width: 100% !important; padding: 16px !important; border-radius: 18px !important; }
  .teacher-onboarding-card > button:first-child { margin-bottom: 14px !important; font-size: 14px !important; }
  .teacher-onboarding-card h1 { font-size: 27px !important; line-height: 1.12 !important; }
  .teacher-onboarding-card input, .teacher-onboarding-card select { box-sizing: border-box !important; max-width: 100% !important; font-size: 14px !important; padding: 12px !important; }
  .teacher-onboarding-card button { min-height: 44px; }
}
`}</style>
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