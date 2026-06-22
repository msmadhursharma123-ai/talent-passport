import React from "react";

export default function PartnerHome() {

  const profile =
    JSON.parse(
      localStorage.getItem(
        "partnerProfile"
      ) || "{}"
    );

  return (
    <div
      style={{
        background:"white",
        padding:"30px",
        borderRadius:"20px"
      }}
    >
      <h1>
        Welcome Partner
      </h1>

      <h2>
        {profile.institute_name}
      </h2>

      <p>
        City:
        {profile.institute_city}
      </p>

      <p>
        Email:
        {profile.email}
      </p>

      <p>
        Mobile:
        {profile.mobile_number}
      </p>

      <p>
        Skills:
        {profile.skill_focus?.join(", ")}
      </p>
    </div>
  );
}