import { useEffect, useState } from "react";
import {
  fetchAllSubmissions,
} from "../supabaseClient";

export default function AdminDashboard() {

  const [submissions, setSubmissions] =
    useState<any[]>([]);

  const [selectedSchool,
    setSelectedSchool] =
    useState("All Schools");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const result =
      await fetchAllSubmissions();

    setSubmissions(
      result.submissions || []
    );
  }

  const schools =
    [...new Set(
      submissions.map(
        (x) => x.school_name
      )
    )];

  const filtered =
    selectedSchool ===
    "All Schools"
      ? submissions
      : submissions.filter(
          (x) =>
            x.school_name ===
            selectedSchool
        );

  const totalSchools =
    [...new Set(
      filtered.map(
        (x) => x.school_name
      )
    )].length;

  const totalEvents =
    [...new Set(
      filtered.map(
        (x) => x.event_name
      )
    )].length;

  const pending =
    filtered.filter(
      (x) =>
        !x.evaluation_status ||
        x.evaluation_status ===
          "Pending"
    ).length;

  const participationMap:
    Record<string, number> = {};

  filtered.forEach(
    (item) => {

      const school =
        item.school_name ||
        "Unknown";

      participationMap[
        school
      ] =
        (participationMap[
          school
        ] || 0) + 1;
    }
  );

  const topSchools =
    Object.entries(
      participationMap
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 5);

  return (
    <div
      style={{
        padding: "40px",
        background:
          "radial-gradient(circle at top left, #0B2A4A 0%, #163A63 45%, #2A5A8E 100%)",
        minHeight: "100vh",
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >

        <div>

          <h1
            style={{
              color: "white",
              fontSize: "38px",
            }}
          >
            Executive Dashboard
          </h1>

          <p
            style={{
              color:
                "#D1D5DB",
            }}
          >
            Talent Passport
            Intelligence Center
          </p>

        </div>

        <select
          value={
            selectedSchool
          }
          onChange={(e) =>
            setSelectedSchool(
              e.target.value
            )
          }
          style={{
            padding:
              "12px 16px",
            borderRadius:
              "12px",
          }}
        >

          <option>
            All Schools
          </option>

          {schools.map(
            (school) => (
              <option
                key={school}
              >
                {school}
              </option>
            )
          )}

        </select>

      </div>

      {/* KPI */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",
          gap: "20px",
          marginBottom:
            "25px",
        }}
      >

        <DashboardCard
          title="Total Student Entries"
          value={
            filtered.length
          }
        />

        <DashboardCard
          title="Total Schools"
          value={
            totalSchools
          }
        />

        <DashboardCard
          title="Total Events"
          value={
            totalEvents
          }
        />

        <DashboardCard
          title="Evaluations Pending"
          value={pending}
        />

      </div>

      {/* INSIGHTS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px",
        }}
      >

        <div
          style={{
            background:
              "white",
            borderRadius:
              "16px",
            padding:
              "25px",
          }}
        >

          <h2>
            School-wise Participation
          </h2>

          {topSchools.map(
            (
              school
            ) => (

              <div
                key={
                  school[0]
                }
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  padding:
                    "12px 0",
                  borderBottom:
                    "1px solid #eee",
                }}
              >

                <span>
                  {school[0]}
                </span>

                <strong>
                  {school[1]}
                </strong>

              </div>

            )
          )}

        </div>

        <div
          style={{
            background:
              "white",
            borderRadius:
              "16px",
            padding:
              "25px",
          }}
        >

          <h2>
            Talent Intelligence
          </h2>

          <p>
            Total Active
            Students:
            {" "}
            {
              filtered.length
            }
          </p>

          <p>
            Schools
            Participating:
            {" "}
            {
              totalSchools
            }
          </p>

          <p>
            Events
            Running:
            {" "}
            {
              totalEvents
            }
          </p>

          <p>
            Pending
            Evaluations:
            {" "}
            {pending}
          </p>

        </div>

      </div>

      {/* TOP SCHOOLS */}

      <div
        style={{
          background:
            "white",
          borderRadius:
            "16px",
          padding:
            "25px",
          marginTop:
            "20px",
        }}
      >

        <h2>
          Top Schools
        </h2>

        {topSchools.map(
          (
            school
          ) => (

            <div
              key={school[0]}
              style={{
                padding:
                  "12px 0",
                borderBottom:
                  "1px solid #eee",
              }}
            >
              <strong>
                {school[0]}
              </strong>

              {" - "}

              {
                school[1]
              }

              {" Entries"}
            </div>

          )
        )}

      </div>

    </div>
  );
}

function DashboardCard({
  title,
  value,
}: any) {

  return (
    <div
      style={{
        background:
          "white",
        borderRadius:
          "16px",
        padding:
          "25px",
      }}
    >

      <div
        style={{
          color:
            "#64748B",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize:
            "42px",
          fontWeight: 700,
          color:
            "#143B73",
        }}
      >
        {value}
      </div>

    </div>
  );
}