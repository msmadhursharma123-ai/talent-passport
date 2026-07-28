import React, { useState } from "react";

import {
  createPartner
} from "../data/partnerRepository";

import {
  registerPartner
} from "../services/authenticationService";

import {
  savePartnerIdentity
} from "../services/identityService";

import {
  TALENT_DOMAINS
} from "../constants/talentDomains";

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


const skills = Array.from(

  new Set([

    ...TALENT_DOMAINS.ACTIVITY_COACHING,

    ...TALENT_DOMAINS.CAREER_GUIDANCE,

    ...TALENT_DOMAINS.PARENT_SUPPORT

  ])

);

const consultationOptions = Array.from(

  new Set([

    ...TALENT_DOMAINS.ACTIVITY_COACHING,

    ...TALENT_DOMAINS.CAREER_GUIDANCE,

    ...TALENT_DOMAINS.PARENT_SUPPORT

  ])

);
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

const [password,
  setPassword] =
  useState("");

const [confirmPassword,
  setConfirmPassword] =
  useState("");

const [loading,
  setLoading] =
  useState(false);

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

if (password.length < 6) {
  alert("Password must contain at least 6 characters.");
  return;
}

if (password !== confirmPassword) {
  alert("Passwords do not match.");
  return;
}

setLoading(true);



try {

const authResult = await registerPartner(
  email,
  password
);

if (!authResult.success) {

  alert(
    authResult.error ??
    "Unable to create account."
  );

  return;

}
  
    const partnerId =
      email
        .toLowerCase()
        .replaceAll("@", "_")
        .replaceAll(".", "_");

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

    /*
    |--------------------------------------------------------------------------
    | IdentityService
    |--------------------------------------------------------------------------
    |
    | Partner Identity becomes the application's
    | Single Source of Truth.
    |
    */

  savePartnerIdentity({

    partnerUuid:
        partner.partner_uuid,

    partnerId:
        partner.partner_id,

    partnerCode:
        partner.partner_id,

    partnerName:
        partner.partner_name,

    email:
        partner.email,

    phone:
        partner.phone,

    category:
        partner.category,

    organization:
        partner.partner_name,

    specialization:
        partner.specialization,

    consultationServices:
        partner.consultation_services,

    instituteArea:
        partner.institute_area,

    preferredAgeFrom:
        partner.preferred_age_from,

    preferredAgeTo:
        partner.preferred_age_to,

    role: "partner",

    permissions: [],

    metadata: {
        partner
    }

});

    /*
    |--------------------------------------------------------------------------
    | Temporary Backward Compatibility
    |--------------------------------------------------------------------------
    |
    | Existing Partner pages still consume
    | partnerProfile directly.
    |
    | Remove after all Partner pages migrate
    | to IdentityService.
    |
    */

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

}

catch (error: any) {

  alert(
    error?.message ??
    "Unable to create account."
  );

}

finally {

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
  className="onboarding-card"
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
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) =>
    setPassword(
      e.target.value
    )
  }
  style={inputStyle}
/>

<input
  type="password"
  placeholder="Confirm Password"
  value={confirmPassword}
  onChange={(e) =>
    setConfirmPassword(
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
  className="responsive-age-grid"
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
  disabled={loading}
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
    
<style>{`
@media (max-width: 1024px) {
  .onboarding-page { padding: 28px !important; box-sizing: border-box; overflow-y: auto !important; }
  .onboarding-card { width: min(760px, 100%) !important; padding: 38px !important; border-radius: 26px !important; box-sizing: border-box; }
  .onboarding-card h1 { font-size: 34px !important; line-height: 1.1 !important; }
  
  .onboarding-card input, .onboarding-card select, .onboarding-card button { box-sizing: border-box; }

  .onboarding-card .responsive-age-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }

}
@media (max-width: 600px) {
  .onboarding-page { min-height: 100dvh !important; padding: 14px !important; align-items: flex-start !important; overflow-y: auto !important; }
  .onboarding-card { width: 100% !important; padding: 20px 16px !important; border-radius: 20px !important; }
  .onboarding-card > button:first-child { margin-bottom: 12px !important; font-size: 14px !important; }
  .onboarding-card h1 { font-size: 26px !important; }
  .onboarding-card > h1 + p { font-size: 14px !important; margin-top: 8px !important; margin-bottom: 18px !important; }
  .onboarding-card input, .onboarding-card select { padding: 11px 12px !important; margin-top: 8px !important; font-size: 14px !important; min-height: 44px; border-radius: 10px !important; }
  .onboarding-card h3 { font-size: 16px !important; margin-top: 20px !important; margin-bottom: 8px !important; }
  .onboarding-card p { line-height: 1.45 !important; }
  .onboarding-card .responsive-age-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; margin-top: 4px !important; }
  .onboarding-card .responsive-age-grid input { min-width: 0 !important; }
}
`}</style>
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