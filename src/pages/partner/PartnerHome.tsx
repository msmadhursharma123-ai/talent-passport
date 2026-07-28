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
      className="partner-home-page"
      style={{
        width: "95%",
        maxWidth: "1600px",
        margin: "0 auto",
        padding: "24px",
        boxSizing: "border-box"
      }}
    >

      <style>{`
        /* Partner dashboard responsive styling only.
           Existing desktop inline styles remain authoritative above 1024px. */

        @media (max-width: 1024px) {
          .partner-home-page {
            width: 100% !important;
            max-width: none !important;
            padding: 10px !important;
          }

          .partner-home-hero {
            min-height: 0 !important;
            padding: 16px 18px !important;
            margin-bottom: 10px !important;
            border-radius: 18px !important;
            gap: 14px !important;
          }

          .partner-home-hero-copy {
            min-width: 0 !important;
            max-width: none !important;
            flex: 1 1 auto !important;
          }

          .partner-home-hero-copy > div:first-child {
            margin-bottom: 6px !important;
            font-size: 9px !important;
            line-height: 1.15 !important;
            letter-spacing: 1.35px !important;
          }

          .partner-home-hero-title {
            font-size: 25px !important;
            line-height: 1.08 !important;
            letter-spacing: -.45px !important;
          }

          .partner-home-hero-description {
            margin-top: 6px !important;
            max-width: 650px !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
          }

          .partner-home-hero-copy > div:last-child {
            gap: 7px !important;
            margin-top: 10px !important;
          }

          .partner-home-hero-copy > div:last-child > div {
            gap: 5px !important;
            padding: 5px 8px !important;
            font-size: 8px !important;
          }

          .partner-home-hero-badge {
            width: 64px !important;
            height: 64px !important;
            min-width: 64px !important;
            border-radius: 16px !important;
          }

          .partner-home-hero-badge > div > div:first-child {
            font-size: 21px !important;
          }

          .partner-home-hero-badge > div > div:last-child {
            margin-top: 5px !important;
            font-size: 5.5px !important;
            line-height: 1.05 !important;
            letter-spacing: .55px !important;
          }

          .partner-home-section {
            padding: 16px !important;
            margin-bottom: 10px !important;
            border-radius: 17px !important;
            box-sizing: border-box !important;
          }

          .partner-home-section h2,
          .partner-home-two-column h2 {
            font-size: 18px !important;
            line-height: 1.12 !important;
          }

          .partner-home-section p,
          .partner-home-two-column p {
            font-size: 10px !important;
            line-height: 1.35 !important;
          }

          .partner-home-intelligence > div:first-child {
            gap: 10px !important;
            margin-bottom: 12px !important;
            align-items: flex-start !important;
          }

          .partner-home-intelligence > div:first-child > div:first-child > div:first-child,
          .partner-home-school > div:last-child > div:first-child,
          .partner-home-two-column > div > div:last-child > div:nth-child(2) {
            font-size: 8px !important;
            line-height: 1.15 !important;
            letter-spacing: 1.15px !important;
          }

          .partner-home-intelligence > div:first-child > div:last-child {
            font-size: 8px !important;
            letter-spacing: .6px !important;
          }

          .partner-home-kpi-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 7px !important;
          }

          .partner-home-stat-card {
            min-height: 92px !important;
            padding: 10px !important;
            border-radius: 12px !important;
          }

          .partner-home-stat-card > div:last-child > div:first-child {
            font-size: 7px !important;
            line-height: 1.15 !important;
            letter-spacing: .35px !important;
          }

          .partner-home-stat-card > div:last-child > div:nth-child(2) {
            margin-top: 6px !important;
            font-size: 20px !important;
          }

          .partner-home-stat-card > div:last-child > div:last-child {
            margin-top: 5px !important;
            font-size: 8px !important;
            line-height: 1.2 !important;
          }

          .partner-home-school > div:last-child > div:nth-child(4) {
            min-height: 78px !important;
            margin-top: 12px !important;
            padding: 12px !important;
            border-radius: 13px !important;
          }

          .partner-home-school > div:last-child > div:nth-child(4) > div:first-child {
            width: 34px !important;
            height: 34px !important;
            margin-right: 10px !important;
            border-radius: 10px !important;
            font-size: 15px !important;
          }

          .partner-home-two-column {
            gap: 10px !important;
            margin-bottom: 10px !important;
          }

          .partner-home-two-column > div {
            padding: 16px !important;
            border-radius: 17px !important;
          }

          .partner-home-two-column > div > div:last-child > div:first-child {
            width: 38px !important;
            height: 38px !important;
            margin-bottom: 12px !important;
            border-radius: 11px !important;
            font-size: 18px !important;
          }

          .partner-home-empty-row {
            min-height: 32px !important;
            padding: 0 9px !important;
            margin-top: 6px !important;
            border-radius: 9px !important;
            font-size: 8px !important;
          }

          .partner-home-info-grid {
            gap: 7px !important;
          }

          .partner-home-info-card {
            min-height: 70px !important;
            padding: 10px !important;
            border-radius: 12px !important;
          }

          .partner-home-info-card > div:first-child {
            font-size: 7px !important;
          }

          .partner-home-info-card > div:last-child {
            margin-top: 5px !important;
            font-size: 9px !important;
            line-height: 1.3 !important;
          }
        }

        @media (max-width: 600px) {
          .partner-home-page {
            padding: 7px !important;
          }

          .partner-home-hero {
            padding: 12px 13px !important;
            margin-bottom: 8px !important;
            border-radius: 14px !important;
            gap: 8px !important;
          }

          .partner-home-hero-copy > div:first-child {
            margin-bottom: 4px !important;
            font-size: 6.5px !important;
            letter-spacing: .9px !important;
          }

          .partner-home-hero-title {
            font-size: 18px !important;
            line-height: 1.08 !important;
            letter-spacing: -.25px !important;
          }

          .partner-home-hero-description {
            margin-top: 4px !important;
            font-size: 9px !important;
            line-height: 1.3 !important;
          }

          .partner-home-hero-copy > div:last-child {
            gap: 5px !important;
            margin-top: 7px !important;
          }

          .partner-home-hero-copy > div:last-child > div {
            padding: 4px 6px !important;
            font-size: 6px !important;
          }

          .partner-home-hero-badge {
            width: 48px !important;
            height: 48px !important;
            min-width: 48px !important;
            border-radius: 11px !important;
          }

          .partner-home-hero-badge > div > div:first-child {
            font-size: 15px !important;
          }

          .partner-home-hero-badge > div > div:last-child {
            margin-top: 3px !important;
            font-size: 4px !important;
            letter-spacing: .25px !important;
          }

          .partner-home-section {
            padding: 11px !important;
            margin-bottom: 8px !important;
            border-radius: 14px !important;
          }

          .partner-home-section h2,
          .partner-home-two-column h2 {
            font-size: 14px !important;
            line-height: 1.1 !important;
          }

          .partner-home-section p,
          .partner-home-two-column p {
            font-size: 8px !important;
            line-height: 1.3 !important;
          }

          .partner-home-intelligence > div:first-child {
            gap: 5px !important;
            margin-bottom: 9px !important;
          }

          .partner-home-intelligence > div:first-child > div:first-child > div:first-child,
          .partner-home-school > div:last-child > div:first-child,
          .partner-home-two-column > div > div:last-child > div:nth-child(2) {
            font-size: 6px !important;
            letter-spacing: .75px !important;
          }

          .partner-home-intelligence > div:first-child > div:last-child {
            display: none !important;
          }

          .partner-home-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 5px !important;
          }

          .partner-home-stat-card {
            min-height: 76px !important;
            padding: 7px !important;
            border-radius: 10px !important;
          }

          .partner-home-stat-card > div:last-child > div:first-child {
            font-size: 5.5px !important;
            line-height: 1.1 !important;
            letter-spacing: .2px !important;
          }

          .partner-home-stat-card > div:last-child > div:nth-child(2) {
            margin-top: 4px !important;
            font-size: 16px !important;
          }

          .partner-home-stat-card > div:last-child > div:last-child {
            margin-top: 3px !important;
            font-size: 6.5px !important;
            line-height: 1.15 !important;
          }

          .partner-home-school > div:last-child > div:nth-child(4) {
            min-height: 62px !important;
            margin-top: 9px !important;
            padding: 9px !important;
            border-radius: 10px !important;
          }

          .partner-home-school > div:last-child > div:nth-child(4) > div:first-child {
            width: 28px !important;
            height: 28px !important;
            margin-right: 8px !important;
            border-radius: 8px !important;
            font-size: 12px !important;
          }

          .partner-home-school > div:last-child > div:nth-child(4) > div:last-child > div:first-child {
            font-size: 9px !important;
          }

          .partner-home-school > div:last-child > div:nth-child(4) > div:last-child > div:last-child {
            font-size: 7px !important;
          }

          .partner-home-two-column {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 6px !important;
            margin-bottom: 8px !important;
          }

          .partner-home-two-column > div {
            min-width: 0 !important;
            padding: 10px !important;
            border-radius: 13px !important;
          }

          .partner-home-two-column > div > div:last-child > div:first-child {
            width: 30px !important;
            height: 30px !important;
            margin-bottom: 9px !important;
            border-radius: 9px !important;
            font-size: 14px !important;
          }

          .partner-home-two-column > div > div:last-child > p {
            margin: 4px 0 9px !important;
          }

          .partner-home-empty-row {
            min-height: 26px !important;
            padding: 0 6px !important;
            margin-top: 4px !important;
            border-radius: 7px !important;
            font-size: 6px !important;
            line-height: 1.15 !important;
          }

          .partner-home-empty-row > span {
            width: 5px !important;
            height: 5px !important;
            margin-right: 5px !important;
          }

          .partner-home-info-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 5px !important;
          }

          .partner-home-info-card {
            min-width: 0 !important;
            min-height: 58px !important;
            padding: 7px !important;
            border-radius: 9px !important;
          }

          .partner-home-info-card > div:first-child {
            font-size: 5.5px !important;
            letter-spacing: .35px !important;
          }

          .partner-home-info-card > div:last-child {
            margin-top: 4px !important;
            font-size: 7px !important;
            line-height: 1.2 !important;
          }
        }
      `}</style>


      {/* =========================================================
          PARTNER DASHBOARD HERO
         ========================================================= */}

      <div
        className="partner-home-hero"
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
          className="partner-home-hero-copy"
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
            className="partner-home-hero-title"
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
            className="partner-home-hero-description"
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
          className="partner-home-hero-badge"
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
        className="partner-home-section partner-home-intelligence"
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
          className="partner-home-kpi-grid"
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
        className="partner-home-section partner-home-school"
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
        className="partner-home-two-column"
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
        className="partner-home-section partner-home-profile"
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
            className="partner-home-info-grid"
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
      className="partner-home-stat-card"
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
      className="partner-home-empty-row"
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
      className="partner-home-info-card"
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