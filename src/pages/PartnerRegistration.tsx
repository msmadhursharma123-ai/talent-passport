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
  "Debate",
  "Public Speaking",
  "Creative Writing",

  "Dance",
  "Music",
  "Singing",

  "Acting",
  "Drama",
  "Theatre",

  "Painting",
  "Art & Craft",
  "Fine Arts",
  "Music Instrument"
];

const consultationOptions = [
  "Career Guidance",
  "Scholarship Planning",
  "Portfolio Review",
  "Competition Coaching",
  "Leadership Coaching",
  "Public Speaking Coaching",
  "Dance Mentoring",
  "Music Mentoring",
  "Acting Mentoring",
  "Robotics Mentoring",
  "Creative Writing Mentoring",
  "Art Portfolio Review",
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

  const [skillFocus, setSkillFocus] = useState<string[]>([]);
const [consultationServices, setConsultationServices] = useState<string[]>([]);

const [showSkillDropdown, setShowSkillDropdown] = useState(false);
const [showConsultationDropdown, setShowConsultationDropdown] = useState(false);

const [preferredAgeFrom,
  setPreferredAgeFrom] =
  useState("");

const [preferredAgeTo,
  setPreferredAgeTo] =
  useState("");

const [instituteArea,
  setInstituteArea] =
  useState("");

 const toggleSkill = (skill: string) => {
  if (skillFocus.includes(skill)) {
    setSkillFocus(skillFocus.filter((s) => s !== skill));
  } else {
    setSkillFocus([...skillFocus, skill]);
  }
};

const toggleConsultation = (service: string) => {
  if (consultationServices.includes(service)) {
    setConsultationServices(
      consultationServices.filter(
        (s) => s !== service
      )
    );
  } else {
    setConsultationServices([
      ...consultationServices,
      service,
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

      consultation_services:
  consultationServices,

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
    marginBottom: 14,
    color: "#143B73",
  }}
>
  Skill Focus
</h3>

<div
  style={{
    position: "relative",
  }}
>
  <button
    type="button"
    onClick={() =>
      setShowSkillDropdown(
        !showSkillDropdown
      )
    }
    style={{
      ...inputStyle,
      textAlign: "left",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      background: "white",
    }}
  >
    <span>
      {skillFocus.length
        ? skillFocus.join(", ")
        : "Select Activities"}
    </span>

    ▼
  </button>

  {showSkillDropdown && (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        background: "white",
        border: "1px solid #CBD5E1",
        borderRadius: 14,
        marginTop: 6,
        maxHeight: 280,
        overflowY: "auto",
        zIndex: 100,
        boxShadow:
          "0 10px 25px rgba(0,0,0,.12)",
      }}
    >
      {skills.map((skill) => (
        <label
          key={skill}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 14,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={skillFocus.includes(skill)}
            onChange={() =>
              toggleSkill(skill)
            }
          />

          {skill}
        </label>
      ))}
    </div>
  )}
</div>

        <h3
  style={{
    marginTop: 32,
    marginBottom: 12,
    color: "#143B73",
  }}
>
  Consultation Expertise
</h3>

<h3
  style={{
    marginTop: 30,
    marginBottom: 12,
    color: "#143B73",
  }}
>
  Consultation Expertise
</h3>

<p
  style={{
    color: "#64748B",
    marginBottom: 12,
    fontSize: 14,
  }}
>
  Select consultation services your institute provides.
</p>

<div
  style={{
    position: "relative",
  }}
>
  <button
    type="button"
    onClick={() =>
      setShowConsultationDropdown(
        !showConsultationDropdown
      )
    }
    style={{
      ...inputStyle,
      textAlign: "left",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      cursor: "pointer",
      background: "white",
    }}
  >
    <span>
      {consultationServices.length
        ? consultationServices.join(", ")
        : "Select Consultation Services"}
    </span>

    ▼
  </button>

  {showConsultationDropdown && (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        background: "white",
        border: "1px solid #CBD5E1",
        borderRadius: 14,
        marginTop: 6,
        maxHeight: 320,
        overflowY: "auto",
        zIndex: 100,
        boxShadow:
          "0 10px 25px rgba(0,0,0,.12)",
      }}
    >
      {consultationOptions.map(
        (service) => (
          <label
            key={service}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 14,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={consultationServices.includes(
                service
              )}
              onChange={() =>
                toggleConsultation(
                  service
                )
              }
            />

            {service}
          </label>
        )
      )}
    </div>
  )}
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