import React,
{
useState,
useEffect
}
from "react";
import {
  createStudent
} from "../data/studentRepository";

import {
  saveStudentIdentity
} from "../services/identityService";

import {
getSupabaseClient
}
from "../supabaseClient";

import { checkSchoolProfileCapacity }
from "../services/schoolProfileCapacity";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

const activities = [
  "Dance",
  "Singing",
  "Acting",
  "Drama",
  "Debate",
  "Public Speaking",
  "Creative Writing",
  "Art & Craft",
  "Painting",
  "Music Instrument"
];

const cities = [
  "Delhi",
  "Gurugram",
  "Noida",
  "Faridabad",
  "Ghaziabad"
];

export default function StudentProfileForm({
  onContinue,
  onBack,
}: Props) {

  const [studentName, setStudentName] =
    useState("");

  const [parentEmail, setParentEmail] =
    useState("");

  const [schoolName, setSchoolName] =
    useState("");

  const [schoolUuid, setSchoolUuid] =
    useState("");



const [schools,
setSchools] =
useState<any[]>([]);

  const [className, setClassName] =
    useState("");


    
  const [parentMobile, setParentMobile] =
    useState("");

  const [studentAge, setStudentAge] =
    useState("");

  const [gender, setGender] =
    useState("");

  const [favouriteActivity,
    setFavouriteActivity] =
    useState("");

  const [residenceCity,
    setResidenceCity] =
    useState("");

const [residenceArea,
    setResidenceArea] =
    useState("");

const [loading,
    setLoading] =
    useState(false);


useEffect(()=>{

loadSchools();

loadAuthenticatedEmail();

},[]);

async function loadSchools(){

const supabase =
getSupabaseClient();

if(!supabase){
return;
}

const { data } =
await supabase
.from("schools_master")
.select("*")
.order(
"school_name"
);

setSchools(data ?? []);

}

async function
loadAuthenticatedEmail(){

const supabase =
getSupabaseClient();

if(!supabase){
return;
}

const result =
await supabase.auth.getUser();

console.log(result);

const email =
result.data.user?.email;

if(email){

setParentEmail(email);

}

}
    
 const handleContinue = async () => {

  if (
      !studentName ||
      !parentEmail ||
      !parentMobile ||
      !schoolName ||
      !schoolUuid ||
      !className ||
      !studentAge ||
      !gender ||
      !favouriteActivity ||
      !residenceCity
  ) {

      alert(
          "Please complete all required fields"
      );

      return;

  }
  if (!/^\d{10}$/.test(parentMobile)) {
      alert(
          "Parent Mobile Number must contain exactly 10 digits."
      );
      return;
  }

  setLoading(true);

  try {

      const capacity =
          await checkSchoolProfileCapacity(
              schoolUuid,
              "student"
          );

      if (!capacity.allowed) {
          alert(
              capacity.message ??
              "Student profile limit exhausted. Please contact school administration for creating the profile."
          );
          return;
      }


    
      const student =
          await createStudent({

              student_name:
                  studentName,

              parent_email:
                  parentEmail,

              parent_mobile:
                  parentMobile,

              school_name:
                  schoolName,

              school_uuid:
                  schoolUuid,

              class_name:
                  className,

              student_age:
                  Number(studentAge),

              gender,

              favourite_activity:
                  favouriteActivity,

              residence_city:
                  residenceCity,

              residence_area:
                  residenceArea

          });

      if (!student) {

          alert(
              "Unable to create student profile"
          );

          return;

      }

      saveStudentIdentity(
          student
      );

      onContinue();

  } finally {

      setLoading(false);

  }

};

return (
    <div
      className="onboarding-page"
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
        className="onboarding-card"
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
   <div
  style={{
    width: "min(760px, 100%)",
    background: "white",
    padding: 48,
    borderRadius: 32,
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.08)",
    position: "relative",
    zIndex: 1,
  }}
>

        <button

onClick={() => {

alert(

"Your account has already been created. Please complete your student profile to continue."

);

}}
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

        <h1
          style={{
            margin: 0,
            marginBottom: 30,
            fontSize: 42,
            fontWeight: 400,
            color: "#0F172A",
          }}
        >
          Student Profile
        </h1>

        <input
          placeholder="Student Name *" aria-label="Student Name"
          value={studentName}
          onChange={(e) =>
            setStudentName(
              e.target.value
            )
          }
          style={inputStyle}
        />

<input
placeholder="Parent Email"
value={parentEmail}
readOnly
style={{
...inputStyle,
background:"#F1F5F9",
}}
/>

        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          placeholder="Parent Mobile Number *" aria-label="Parent Mobile Number"
          value={parentMobile}
          onChange={(e) => {
            const digitsOnly =
              e.target.value
                .replace(/\D/g, "")
                .slice(0, 10);

            setParentMobile(
              digitsOnly
            );
          }}
          style={inputStyle}
        />

<select
value={schoolUuid}
onChange={(e)=>{

const selected =
schools.find(
school =>
school.school_uuid === e.target.value
);

setSchoolUuid(
e.target.value
);

setSchoolName(
selected?.school_name ?? ""
);

}}
style={inputStyle}
>

<option value="">
Select School
</option>

{

schools.map((school)=>(

<option
key={school.school_uuid}
value={school.school_uuid}
>

{school.school_name}

</option>

))

}

</select>

        <input
          placeholder="Class"
          value={className}
          onChange={(e) =>
            setClassName(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <input
          type="number"
          placeholder="Student Age"
          value={studentAge}
          onChange={(e) =>
            setStudentAge(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <select
          value={gender}
          onChange={(e) =>
            setGender(
              e.target.value
            )
          }
          style={inputStyle}
        >
          <option value="">
            Select Gender
          </option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <select
          value={favouriteActivity}
          onChange={(e) =>
            setFavouriteActivity(
              e.target.value
            )
          }
          style={inputStyle}
        >
          <option value="">
            Favourite Activity
          </option>

          {activities.map(
            (activity) => (
              <option
                key={activity}
              >
                {activity}
              </option>
            )
          )}
        </select>

        <select
          value={residenceCity}
          onChange={(e) =>
            setResidenceCity(
              e.target.value
            )
          }
          style={inputStyle}
        >
          <option value="">
            Residence City
          </option>

          {cities.map(
            (city) => (
              <option
                key={city}
              >
                {city}
              </option>
            )
          )}
        </select>

        <input
          placeholder="Area / Sector"
          value={residenceArea}
          onChange={(e) =>
            setResidenceArea(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <button
    onClick={handleContinue}
    disabled={loading}
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
        ? "Creating Profile..."
        : "Continue"
}
        </button>

      </div>
    
<style>{`
@media (max-width: 1024px) {
  .onboarding-page { padding: 28px !important; box-sizing: border-box; overflow-y: auto !important; }
  .onboarding-card { width: min(760px, 100%) !important; box-sizing: border-box; padding: 38px !important; border-radius: 26px !important; }
  .onboarding-card h1 { font-size: 34px !important; margin-bottom: 22px !important; }
  .onboarding-card input, .onboarding-card select { padding: 15px !important; margin-top: 11px !important; font-size: 16px !important; }
}
@media (max-width: 600px) {
  .onboarding-page { min-height: 100dvh !important; padding: 14px !important; align-items: flex-start !important; }
  .onboarding-card { width: 100% !important; padding: 20px 16px !important; border-radius: 20px !important; }
  .onboarding-card > button:first-child { margin-bottom: 12px !important; font-size: 14px !important; }
  .onboarding-card h1 { font-size: 25px !important; margin-bottom: 12px !important; }
  .onboarding-card input, .onboarding-card select { padding: 11px 12px !important; margin-top: 8px !important; font-size: 14px !important; border-radius: 10px !important; min-height: 44px; }
  .onboarding-card > button:last-child { margin-top: 14px !important; padding: 13px !important; font-size: 15px !important; border-radius: 11px !important; }
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