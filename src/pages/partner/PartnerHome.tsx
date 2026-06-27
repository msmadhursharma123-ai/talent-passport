import React from "react";

import {
  requirePartnerIdentity
} from "../../services/identityService";

export default function PartnerHome() {

/*
|--------------------------------------------------------------------------
| IdentityService
|--------------------------------------------------------------------------
|
| PartnerHome now consumes the application's
| central IdentityService instead of reading
| localStorage directly.
|
*/

const profile =
  requirePartnerIdentity();

const partnerId =
  profile.partnerId ||
  "Not Assigned";

  return (

    <div>

      {/* HERO SECTION */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#0F172A,#1E293B)",
          color: "white",
          borderRadius: "28px",
          padding: "40px",
          marginBottom: "25px"
        }}
      >

        <div
          style={{
            color: "#F4A623",
            fontWeight: 700,
            letterSpacing: 2,
            marginBottom: 12
          }}
        >
          PARTNER DASHBOARD
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: "42px",
            marginBottom: "12px"
          }}
        >
          Welcome Back
        </h1>

        <h2
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: 500
          }}
        >
          {profile.partnerName}
        </h2>

        <div
          style={{
            marginTop: 16,
            color: "#CBD5E1"
          }}
        >
          {profile.instituteArea}
        </div>

        <div
          style={{
            marginTop: 20,
            display: "inline-block",
            background: "#334155",
            padding: "10px 16px",
            borderRadius: "12px"
          }}
        >
          Partner ID: {partnerId}
        </div>

      </div>

      {/* KPI SECTION */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",
          gap: "20px",
          marginBottom: "25px"
        }}
      >

        <StatCard
          title="Total Student Leads"
          value="0"
        />

        <StatCard
          title="Total Workshops Conducted"
          value="0"
        />

        <StatCard
          title="Scholarships Offered"
          value="0"
        />

        <StatCard
          title=" Total Admissions Generated"
          value="0"
        />

      </div>

      {/* SCHOOL PERFORMANCE */}

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "30px",
          marginBottom: "25px"
        }}
      >

        <h2
          style={{
            marginTop: 0,
            color: "#143B73"
          }}
        >
          School Performance
        </h2>

        <p
          style={{
            color: "#64748B"
          }}
        >
          No school data available yet.
        </p>

      </div>

      {/* OFFERS + ACTIVITY */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "25px"
        }}
      >

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "30px"
          }}
        >

          <h2
            style={{
              marginTop: 0,
              color: "#143B73"
            }}
          >
            Offers Sent
          </h2>

          <div
            style={{
              color: "#64748B",
              lineHeight: "2"
            }}
          >
            No scholarship offers yet.
            <br />
            No workshop invitations yet.
            <br />
            No masterclass invitations yet.
          </div>

        </div>

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "30px"
          }}
        >

          <h2
            style={{
              marginTop: 0,
              color: "#143B73"
            }}
          >
            Recent Activity
          </h2>

          <div
            style={{
              color: "#64748B",
              lineHeight: "2"
            }}
          >
            No recent activity.
          </div>

        </div>

      </div>

      {/* PROFILE SECTION */}

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "30px",
          marginTop: "25px"
        }}
      >

        <h2
          style={{
            marginTop: 0,
            color: "#143B73"
          }}
        >
          Institute Information
        </h2>

        <p>
          <strong>Email:</strong>
          {" "}
          {profile.email}
        </p>

        <p>
          <strong>Mobile:</strong>
          {" "}
          {profile.phone}
        </p>

        <p>
          <strong>Skill Categories:</strong>
          {" "}
          {
          profile.specialization?.join(", ")
          }
        </p>

      </div>

    </div>

  );
}

function StatCard({
  title,
  value
}: {
  title: string;
  value: string;
}) {

  return (

    <div
      style={{
        background: "white",
        borderRadius: "24px",
        padding: "25px"
      }}
    >

      <div
        style={{
          color: "#64748B",
          fontSize: "15px"
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: "12px",
          fontSize: "42px",
          fontWeight: 700,
          color: "#143B73"
        }}
      >
        {value}
      </div>

    </div>

  );
}