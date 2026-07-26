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

    <div
      style={{
        width: "95%",
        maxWidth: "1600px",
        margin: "0 auto",
        padding: "24px",
        boxSizing: "border-box"
      }}
    >

      {/* =========================================================
          PARTNER DASHBOARD HERO
         ========================================================= */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #FFFCF8 55%, #F7FAFF 100%)",
          borderRadius: "28px",
          border: "1px solid #DCE4EE",
          boxShadow:
            "0 12px 34px rgba(15, 23, 42, 0.06)",
          padding: "34px 38px",
          marginBottom: "20px",
          minHeight: "160px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "30px"
        }}
      >

        {/* ORANGE DECORATIVE CIRCLE */}

        <div
          style={{
            position: "absolute",
            width: "330px",
            height: "330px",
            borderRadius: "50%",
            right: "-105px",
            top: "-175px",
            background:
              "rgba(249, 115, 22, 0.065)",
            pointerEvents: "none"
          }}
        />

        {/* BLUE DECORATIVE CIRCLE */}

        <div
          style={{
            position: "absolute",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            right: "150px",
            bottom: "-180px",
            background:
              "rgba(59, 130, 246, 0.055)",
            pointerEvents: "none"
          }}
        />

        {/* SMALL ORANGE CIRCLE */}

        <div
          style={{
            position: "absolute",
            width: "115px",
            height: "115px",
            borderRadius: "50%",
            right: "92px",
            top: "22px",
            background:
              "rgba(255, 237, 213, 0.55)",
            pointerEvents: "none"
          }}
        />


        {/* HERO LEFT */}

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "850px"
          }}
        >

          <div
            style={{
              color: "#F97316",
              fontSize: "12px",
              letterSpacing: "2.4px",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: "12px"
            }}
          >
            PARTNER ECOSYSTEM
          </div>

          <h1
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "40px",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-1px"
            }}
          >
            Welcome Back, {profile.partnerName}
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#64748B",
              fontSize: "15px",
              lineHeight: 1.6,
              maxWidth: "720px"
            }}
          >
            Manage student opportunities, school engagement and
            partner activity across the Talent Passport ecosystem.
          </p>

          <div
            style={{
              marginTop: "17px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >

            {profile.instituteArea && (

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 11px",
                  borderRadius: "999px",
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  color: "#1D4ED8",
                  fontSize: "10px",
                  fontWeight: 800
                }}
              >
                ◉ {profile.instituteArea}
              </div>

            )}

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "7px 11px",
                borderRadius: "999px",
                background: "#FFF7ED",
                border: "1px solid #FED7AA",
                color: "#C2410C",
                fontSize: "10px",
                fontWeight: 800
              }}
            >
              PARTNER ID&nbsp; {partnerId}
            </div>

          </div>

        </div>


        {/* HERO RIGHT */}

        <div
          style={{
            position: "relative",
            zIndex: 2,
            width: "128px",
            height: "128px",
            borderRadius: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(145deg, #FFF7ED, #FFFFFF)",
            border: "1px solid #FED7AA",
            boxShadow:
              "0 12px 30px rgba(249, 115, 22, 0.10)",
            flexShrink: 0
          }}
        >

          <div
            style={{
              textAlign: "center"
            }}
          >

            <div
              style={{
                fontSize: "39px",
                lineHeight: 1
              }}
            >
              ◈
            </div>

            <div
              style={{
                marginTop: "9px",
                color: "#F97316",
                fontSize: "9px",
                fontWeight: 900,
                letterSpacing: "1.4px"
              }}
            >
              PARTNER NETWORK
            </div>

          </div>

        </div>

      </div>


      {/* =========================================================
          PARTNER INTELLIGENCE
         ========================================================= */}

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "24px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow:
            "0 8px 24px rgba(15, 23, 42, 0.035)"
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",
            marginBottom: "20px"
          }}
        >

          <div>

            <div
              style={{
                color: "#F97316",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "1.8px",
                textTransform: "uppercase",
                marginBottom: "7px"
              }}
            >
              PARTNER INTELLIGENCE
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: "21px",
                fontWeight: 800
              }}
            >
              Partnership Activity Summary
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#64748B",
                fontSize: "13px"
              }}
            >
              Your engagement across students, workshops,
              scholarships and admissions.
            </p>

          </div>

          <div
            style={{
              color: "#94A3B8",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.8px",
              whiteSpace: "nowrap"
            }}
          >
            TALENT PASSPORT NETWORK
          </div>

        </div>


        {/* KPI GRID */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",
            gap: "14px"
          }}
        >

          <StatCard
            title="Total Student Leads"
            value="0"
            description="Student opportunities received"
            tone="orange"
          />

          <StatCard
            title="Total Workshops Conducted"
            value="0"
            description="Learning engagements delivered"
            tone="blue"
          />

          <StatCard
            title="Scholarships Offered"
            value="0"
            description="Student scholarships created"
            tone="green"
          />

          <StatCard
            title="Total Admissions Generated"
            value="0"
            description="Admissions generated through network"
            tone="purple"
          />

        </div>

      </div>


      {/* =========================================================
          SCHOOL PERFORMANCE
         ========================================================= */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #FFFFFF 0%, #FBFCFF 65%, #F5F8FF 100%)",
          border: "1px solid #E2E8F0",
          borderRadius: "24px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow:
            "0 8px 24px rgba(15, 23, 42, 0.035)"
        }}
      >

        <div
          style={{
            position: "absolute",
            width: "170px",
            height: "170px",
            borderRadius: "50%",
            right: "-65px",
            top: "-100px",
            background:
              "rgba(59, 130, 246, 0.045)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1
          }}
        >

          <div
            style={{
              color: "#2563EB",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              marginBottom: "7px"
            }}
          >
            SCHOOL ENGAGEMENT
          </div>

          <h2
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "21px",
              fontWeight: 800
            }}
          >
            School Performance
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748B",
              fontSize: "13px"
            }}
          >
            Track engagement and outcomes across connected schools.
          </p>


          {/* EMPTY STATE */}

          <div
            style={{
              marginTop: "18px",
              minHeight: "105px",
              borderRadius: "17px",
              border: "1px dashed #CBD5E1",
              background:
                "rgba(248, 250, 252, 0.72)",
              display: "flex",
              alignItems: "center",
              padding: "18px"
            }}
          >

            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "13px",
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "13px",
                fontSize: "18px",
                flexShrink: 0
              }}
            >
              ◇
            </div>

            <div>

              <div
                style={{
                  color: "#0F172A",
                  fontSize: "13px",
                  fontWeight: 800
                }}
              >
                School intelligence will appear here
              </div>

              <div
                style={{
                  marginTop: "4px",
                  color: "#64748B",
                  fontSize: "11px"
                }}
              >
                No school data available yet.
              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =========================================================
          OFFERS + RECENT ACTIVITY
         ========================================================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: "20px",
          marginBottom: "20px"
        }}
      >

        {/* OFFERS SENT */}

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(145deg, #FFF8EF 0%, #FFFCF7 62%, #FFF4E5 100%)",
            border: "1px solid #FED7AA",
            borderRadius: "24px",
            padding: "24px",
            boxShadow:
              "0 8px 24px rgba(15,23,42,.045)"
          }}
        >

          <div
            style={{
              position: "absolute",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              right: "-50px",
              top: "-58px",
              background:
                "rgba(249,115,22,.075)",
              pointerEvents: "none"
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1
            }}
          >

            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "15px",
                background: "#FFFFFF",
                border: "1px solid #FED7AA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                boxShadow:
                  "0 6px 16px rgba(249,115,22,.08)",
                marginBottom: "17px"
              }}
            >
              ✦
            </div>

            <div
              style={{
                color: "#C2410C",
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing: "1.4px",
                marginBottom: "7px"
              }}
            >
              PARTNER OUTREACH
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: "20px",
                fontWeight: 800
              }}
            >
              Offers Sent
            </h2>

            <p
              style={{
                margin: "6px 0 18px",
                color: "#64748B",
                fontSize: "12px",
                lineHeight: 1.55
              }}
            >
              Track opportunities shared with students and schools.
            </p>


            <EmptyRow text="No scholarship offers yet." />

            <EmptyRow text="No workshop invitations yet." />

            <EmptyRow text="No masterclass invitations yet." />

          </div>

        </div>


        {/* RECENT ACTIVITY */}

        <div
          style={{
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(145deg, #EFF6FF 0%, #F8FBFF 62%, #EDF4FF 100%)",
            border: "1px solid #BFDBFE",
            borderRadius: "24px",
            padding: "24px",
            boxShadow:
              "0 8px 24px rgba(15,23,42,.045)"
          }}
        >

          <div
            style={{
              position: "absolute",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              right: "-50px",
              top: "-58px",
              background:
                "rgba(37,99,235,.07)",
              pointerEvents: "none"
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1
            }}
          >

            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "15px",
                background: "#FFFFFF",
                border: "1px solid #BFDBFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                boxShadow:
                  "0 6px 16px rgba(37,99,235,.08)",
                marginBottom: "17px"
              }}
            >
              ◉
            </div>

            <div
              style={{
                color: "#1D4ED8",
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing: "1.4px",
                marginBottom: "7px"
              }}
            >
              NETWORK ACTIVITY
            </div>

            <h2
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: "20px",
                fontWeight: 800
              }}
            >
              Recent Activity
            </h2>

            <p
              style={{
                margin: "6px 0 18px",
                color: "#64748B",
                fontSize: "12px",
                lineHeight: 1.55
              }}
            >
              Your latest activity across the partner ecosystem.
            </p>


            <div
              style={{
                minHeight: "94px",
                borderRadius: "15px",
                background:
                  "rgba(255,255,255,0.72)",
                border: "1px solid #DBEAFE",
                display: "flex",
                alignItems: "center",
                padding: "16px"
              }}
            >

              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "#EFF6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2563EB",
                  marginRight: "11px",
                  flexShrink: 0
                }}
              >
                ○
              </div>

              <div>

                <div
                  style={{
                    color: "#0F172A",
                    fontSize: "12px",
                    fontWeight: 800
                  }}
                >
                  No recent activity
                </div>

                <div
                  style={{
                    color: "#64748B",
                    fontSize: "10px",
                    marginTop: "3px"
                  }}
                >
                  New partner actions will appear here.
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =========================================================
          INSTITUTE INFORMATION
         ========================================================= */}

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "24px",
          padding: "24px",
          boxShadow:
            "0 8px 24px rgba(15, 23, 42, 0.035)"
        }}
      >

        <div
          style={{
            position: "absolute",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            right: "-70px",
            top: "-105px",
            background:
              "rgba(124,58,237,0.045)",
            pointerEvents: "none"
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1
          }}
        >

          {/* HEADER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "13px",
              marginBottom: "20px"
            }}
          >

            <div
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "14px",
                background: "#F5F3FF",
                border: "1px solid #DDD6FE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px"
              }}
            >
              ◈
            </div>

            <div>

              <div
                style={{
                  color: "#7C3AED",
                  fontSize: "9px",
                  fontWeight: 800,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "4px"
                }}
              >
                PARTNER PROFILE
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#0F172A",
                  fontSize: "20px",
                  fontWeight: 800
                }}
              >
                Institute Information
              </h2>

            </div>

          </div>


          {/* INFORMATION GRID */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "12px"
            }}
          >

            <InfoCard
              label="Email"
              value={profile.email}
              tone="orange"
            />

            <InfoCard
              label="Mobile"
              value={profile.phone}
              tone="blue"
            />

            <InfoCard
              label="Skill Categories"
              value={
                profile.specialization?.join(", ")
              }
              tone="green"
            />

          </div>

        </div>

      </div>

    </div>

  );
}


/* =========================================================
   KPI CARD
   ========================================================= */

function StatCard({
  title,
  value,
  description,
  tone
}: {
  title: string;
  value: string;
  description: string;
  tone:
    | "orange"
    | "blue"
    | "green"
    | "purple";
}) {

  const palette = {

    orange: {
      background:
        "linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 100%)",
      border: "#FED7AA",
      circle:
        "rgba(249,115,22,0.08)",
      title: "#9A3412",
      value: "#F97316"
    },

    blue: {
      background:
        "linear-gradient(135deg, #EFF6FF 0%, #F8FBFF 100%)",
      border: "#BFDBFE",
      circle:
        "rgba(37,99,235,0.07)",
      title: "#1E40AF",
      value: "#2563EB"
    },

    green: {
      background:
        "linear-gradient(135deg, #ECFDF5 0%, #F7FFFB 100%)",
      border: "#BBF7D0",
      circle:
        "rgba(22,163,74,0.07)",
      title: "#166534",
      value: "#16A34A"
    },

    purple: {
      background:
        "linear-gradient(135deg, #F5F3FF 0%, #FBFAFF 100%)",
      border: "#DDD6FE",
      circle:
        "rgba(124,58,237,0.07)",
      title: "#6D28D9",
      value: "#7C3AED"
    }

  };

  const colors =
    palette[tone];

  return (

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "112px",
        background:
          colors.background,
        border:
          `1px solid ${colors.border}`,
        borderRadius: "18px",
        padding: "18px"
      }}
    >

      <div
        style={{
          position: "absolute",
          width: "90px",
          height: "90px",
          borderRadius: "50%",
          right: "-30px",
          top: "-35px",
          background:
            colors.circle,
          pointerEvents: "none"
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1
        }}
      >

        <div
          style={{
            color:
              colors.title,
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "0.7px",
            textTransform: "uppercase"
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "10px",
            color:
              colors.value,
            fontSize: "31px",
            lineHeight: 1,
            fontWeight: 900
          }}
        >
          {value}
        </div>

        <div
          style={{
            marginTop: "8px",
            color: "#475569",
            fontSize: "11px",
            fontWeight: 600
          }}
        >
          {description}
        </div>

      </div>

    </div>

  );
}


/* =========================================================
   EMPTY OFFER ROW
   ========================================================= */

function EmptyRow({
  text
}: {
  text: string;
}) {

  return (

    <div
      style={{
        minHeight: "38px",
        borderRadius: "11px",
        border: "1px solid #FED7AA",
        background:
          "rgba(255,255,255,0.72)",
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        marginTop: "8px",
        color: "#64748B",
        fontSize: "10px",
        fontWeight: 600
      }}
    >

      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "#FDBA74",
          marginRight: "9px",
          flexShrink: 0
        }}
      />

      {text}

    </div>

  );
}


/* =========================================================
   PROFILE INFORMATION CARD
   ========================================================= */

function InfoCard({
  label,
  value,
  tone
}: {
  label: string;
  value?: string | null;
  tone:
    | "orange"
    | "blue"
    | "green";
}) {

  const palette = {

    orange: {
      background: "#FFF7ED",
      border: "#FED7AA",
      label: "#C2410C"
    },

    blue: {
      background: "#EFF6FF",
      border: "#BFDBFE",
      label: "#1D4ED8"
    },

    green: {
      background: "#ECFDF5",
      border: "#BBF7D0",
      label: "#15803D"
    }

  };

  const colors =
    palette[tone];

  return (

    <div
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: "82px",
        borderRadius: "15px",
        background:
          colors.background,
        border:
          `1px solid ${colors.border}`,
        padding: "14px"
      }}
    >

      <div
        style={{
          color:
            colors.label,
          fontSize: "9px",
          fontWeight: 900,
          letterSpacing: "0.8px",
          textTransform: "uppercase"
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "7px",
          color: "#0F172A",
          fontSize: "12px",
          fontWeight: 750,
          lineHeight: 1.45,
          wordBreak: "break-word"
        }}
      >
        {value || "Not available"}
      </div>

    </div>

  );
}