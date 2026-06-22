import React, {
  useState
} from "react";

import {
  createPartner
} from "../data/partnerRepository";

interface Props {
  onContinue: () => void;
  onBack: () => void;
}

const cities = [
  "Delhi",
  "Gurugram",
  "Noida",
  "Faridabad",
  "Ghaziabad"
];

const skills = [
  "Dancing",
  "Singing",
  "Acting",
  "Speaking",
  "Art & Craft",
  "Painting",
  "Others"
];

export default function PartnerRegistration({
  onContinue,
  onBack,
}: Props) {

  const [instituteName,
    setInstituteName] =
    useState("");

  const [city,
    setCity] =
    useState("");

  const [email,
    setEmail] =
    useState("");

  const [mobile,
    setMobile] =
    useState("");

  const [skillFocus,
    setSkillFocus] =
    useState<string[]>([]);

  const toggleSkill =
    (skill: string) => {

      if (
        skillFocus.includes(skill)
      ) {
        setSkillFocus(
          skillFocus.filter(
            s => s !== skill
          )
        );
      } else {
        setSkillFocus([
          ...skillFocus,
          skill
        ]);
      }
    };

  const handleContinue =
    async () => {

      if (
        !instituteName ||
        !city ||
        !email ||
        !mobile
      ) {
        alert(
          "Please complete all fields"
        );
        return;
      }

      const partnerId =
        email
          .toLowerCase()
          .replaceAll("@","_")
          .replaceAll(".","_");

      const partner =
        await createPartner({
          partner_id:
            partnerId,

          institute_name:
            instituteName,

          institute_city:
            city,

          email,

          mobile_number:
            mobile,

          skill_focus:
            skillFocus
        });

      if (!partner) {
        alert(
          "Unable to create partner profile"
        );
        return;
      }

      localStorage.setItem(
        "partnerProfile",
        JSON.stringify(partner)
      );

      localStorage.setItem(
        "partner_id",
        partner.partner_id
      );

      localStorage.setItem(
        "userRole",
        "partner"
      );

      onContinue();
    };

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
          width:800,
          background:"white",
          padding:60,
          borderRadius:32
        }}
      >

        <button
          onClick={onBack}
        >
          ← Back
        </button>

        <h1>
          Partner Registration
        </h1>

        <input
          placeholder="Institute Name"
          value={instituteName}
          onChange={(e)=>
            setInstituteName(
              e.target.value
            )
          }
        />

        <select
          value={city}
          onChange={(e)=>
            setCity(
              e.target.value
            )
          }
        >
          <option>
            Select City
          </option>

          {cities.map(city=>(
            <option
              key={city}
            >
              {city}
            </option>
          ))}
        </select>

        <input
          placeholder="Email ID"
          value={email}
          onChange={(e)=>
            setEmail(
              e.target.value
            )
          }
        />

        <input
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e)=>
            setMobile(
              e.target.value
            )
          }
        />

        <h3>
          Skill Focus
        </h3>

        <div
          style={{
            display:"grid",
            gridTemplateColumns:
            "repeat(3,1fr)",
            gap:10
          }}
        >
          {skills.map(skill => (

            <div
              key={skill}
              onClick={()=>
                toggleSkill(skill)
              }
            >
              <input
                type="checkbox"
                checked={
                  skillFocus.includes(skill)
                }
                readOnly
              />

              {skill}
            </div>

          ))}
        </div>

        <button
          onClick={
            handleContinue
          }
        >
          Continue
        </button>

      </div>
    </div>
  );
}