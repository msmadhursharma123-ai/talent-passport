import React, { useState } from "react";

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

const [preferredAgeFrom,
  setPreferredAgeFrom] =
  useState("");

const [preferredAgeTo,
  setPreferredAgeTo] =
  useState("");

const [instituteArea,
  setInstituteArea] =
  useState("");

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
  !mobile ||
  !preferredAgeFrom ||
  !preferredAgeTo ||
  !instituteArea
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

    partner_name:
      instituteName,

    category:
      "Institute",

    email,

    phone:
      mobile,

    specialization:
      skillFocus,

    preferred_age_from:
      Number(
        preferredAgeFrom
      ),

    preferred_age_to:
      Number(
        preferredAgeTo
      ),

    institute_area:
      instituteArea,

    description: "",

    website: "",

    status: "active"
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

        <h1
          style={{
            margin: 0,
            fontSize: 42,
            fontWeight: 400,
            color: "#0F172A",
          }}
        >
          Partner Registration
        </h1>

        <p
          style={{
            color: "#64748B",
            fontSize: 18,
            marginBottom: 30,
          }}
        >
          Join the Talent Passport Ecosystem
        </p>

        <input
          placeholder="Institute Name"
          value={instituteName}
          onChange={(e) =>
            setInstituteName(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <select
          value={city}
          onChange={(e) =>
            setCity(
              e.target.value
            )
          }
          style={inputStyle}
        >
          <option value="">
            Select City
          </option>

          {cities.map(city => (
            <option
              key={city}
              value={city}
            >
              {city}
            </option>
          ))}
        </select>

        <input
          placeholder="Email ID"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <input
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) =>
            setMobile(
              e.target.value
            )
          }
          style={inputStyle}
        />

<input
  placeholder="Institute Area / Sector"
  value={instituteArea}
  onChange={(e) =>
    setInstituteArea(
      e.target.value
    )
  }
  style={inputStyle}
/>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr",
    gap: 16,
    marginTop: 16
  }}
>

  <input
    type="number"
    placeholder="Preferred Age From"
    value={preferredAgeFrom}
    onChange={(e) =>
      setPreferredAgeFrom(
        e.target.value
      )
    }
    style={inputStyle}
  />

  <input
    type="number"
    placeholder="Preferred Age To"
    value={preferredAgeTo}
    onChange={(e) =>
      setPreferredAgeTo(
        e.target.value
      )
    }
    style={inputStyle}
  />

</div>

        <h3
          style={{
            marginTop: 30,
            marginBottom: 20,
            color: "#143B73",
          }}
        >
          Skill Focus
        </h3>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {skills.map(skill => (

            <button
              key={skill}
              type="button"
              onClick={() =>
                toggleSkill(skill)
              }
              style={{
                padding:
                  "12px 18px",
                borderRadius:
                  "999px",
                border:
                  skillFocus.includes(skill)
                    ? "none"
                    : "1px solid #CBD5E1",

                background:
                  skillFocus.includes(skill)
                    ? "#F4A623"
                    : "white",

                color:
                  skillFocus.includes(skill)
                    ? "white"
                    : "#334155",

                cursor:"pointer"
              }}
            >
              {skill}
            </button>

          ))}
        </div>

        <button
          onClick={handleContinue}
          style={{
            marginTop: 40,
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
          Continue
        </button>

      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "20px",
  marginTop: "16px",
  fontSize: "18px",
  borderRadius: "14px",
  border: "1px solid #CBD5E1",
  boxSizing: "border-box" as const,
};