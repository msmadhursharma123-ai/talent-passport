import { useEffect, useState } from "react";

import {
  fetchAllSubmissions,
  fetchStudentsMaster,
  fetchStudentEvents,
  fetchTalentPassports,
  fetchDNAProfiles,
} from "../supabaseClient";

export default function AdminDashboard() {

  const [submissions, setSubmissions] =
    useState<any[]>([]);

  const [students, setStudents] =
    useState<any[]>([]);

  const [studentEvents, setStudentEvents] =
    useState<any[]>([]);

  const [passports, setPassports] =
    useState<any[]>([]);

  const [dnaProfiles, setDNAProfiles] =
    useState<any[]>([]);

  const [selectedSchool,
    setSelectedSchool] =
    useState("All Schools");

  const [selectedClass,
    setSelectedClass] =
    useState("All Classes");

  const [showIncomplete,
    setShowIncomplete] =
    useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const submissionsResult =
      await fetchAllSubmissions();

    const studentsResult =
      await fetchStudentsMaster();

    const eventsResult =
      await fetchStudentEvents();

    const passportsResult =
      await fetchTalentPassports();

    const dnaResult =
      await fetchDNAProfiles();

    setSubmissions(
      submissionsResult.submissions || []
    );

    setStudents(
      studentsResult || []
    );

    setStudentEvents(
      eventsResult || []
    );

    setPassports(
      passportsResult || []
    );

    setDNAProfiles(
      dnaResult || []
    );
  }

  const schools =
    [
      ...new Set(
        students
          .map(
            (x) =>
              x.school_name
          )
          .filter(Boolean)
      ),
    ];

  const classes =
    [
      ...new Set(
        students
          .filter(
            (x) =>
              selectedSchool ===
                "All Schools" ||
              x.school_name ===
                selectedSchool
          )
          .map(
            (x) =>
              x.class_name
          )
          .filter(Boolean)
      ),
    ];

  const filteredStudents =
    students.filter(
      (student) => {

        const schoolMatch =
          selectedSchool ===
            "All Schools" ||
          student.school_name ===
            selectedSchool;

        const classMatch =
          selectedClass ===
            "All Classes" ||
          student.class_name ===
            selectedClass;

        return (
          schoolMatch &&
          classMatch
        );
      }
    );

  const filteredSubmissions =
    submissions.filter(
      (submission) => {

        const schoolMatch =
          selectedSchool ===
            "All Schools" ||
          submission.school_name ===
            selectedSchool;

        const classMatch =
          selectedClass ===
            "All Classes" ||
          submission.class_name ===
            selectedClass;

        return (
          schoolMatch &&
          classMatch
        );
      }
    );

  const totalStudents =
    filteredStudents.length;

  const totalEntries =
    filteredSubmissions.length;

  const totalSchools =
    [
      ...new Set(
        filteredStudents.map(
          (x) =>
            x.school_name
        )
      ),
    ].length;

  const totalClasses =
    [
      ...new Set(
        filteredStudents.map(
          (x) =>
            x.class_name
        )
      ),
    ].length;

  const totalCompetitions =
    [
      ...new Set(
        filteredSubmissions.map(
          (x) =>
            x.event_name
        )
      ),
    ].length;

  const pendingEvaluations =
    filteredSubmissions.filter(
      (x) =>
        !x.overall_score
    ).length;

  const completedStudents =
    filteredStudents.filter(
      (student) => {

        const events =
          studentEvents.filter(
            (event) =>
              event.student_id ===
              student.student_id
          );

        const completed =
          events.filter(
            (event) =>
              event.status ===
              "Completed"
          );

        return (
          completed.length >= 4
        );
      }
    );

  const incompleteStudents =
    filteredStudents.filter(
      (student) => {

        const events =
          studentEvents.filter(
            (event) =>
              event.student_id ===
              student.student_id
          );

        const completed =
          events.filter(
            (event) =>
              event.status ===
              "Completed"
          );

        return (
          completed.length < 4
        );
      }
    );

  const participationMap:
    Record<
      string,
      number
    > = {};

  filteredSubmissions.forEach(
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

  const eventMap:
    Record<
      string,
      number
    > = {};

  filteredSubmissions.forEach(
    (item) => {

      const event =
        item.event_name ||
        "Unknown";

      eventMap[event] =
        (eventMap[event] || 0) + 1;
    }
  );

  const topEvents =
    Object.entries(
      eventMap
    )
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(0, 5);

  const avgDNA =
    dnaProfiles.length
      ? Math.round(
          dnaProfiles.reduce(
            (
              sum,
              item
            ) =>
              sum +
              (
                item.dna_index ||
                0
              ),
            0
          ) /
            dnaProfiles.length
        )
      : 0;

  const avgPassport =
    passports.length
      ? Math.round(
          passports.reduce(
            (
              sum,
              item
            ) =>
              sum +
              (
                item.combined_score ||
                0
              ),
            0
          ) /
            passports.length
        )
      : 0;

  return (
    <div
      style={{
        padding: "40px",
        background:
          "#F3F4F6",
        minHeight:
          "100vh",
      }}
    >

      {/* HERO SECTION */}

      <div
        style={{
          background:
            "linear-gradient(90deg,#020617,#071952)",
          borderRadius:
            "28px",
          padding: "40px",
          marginBottom:
            "24px",
        }}
      >
        <div
          style={{
            color:
              "#F97316",
            fontSize:
              "12px",
            letterSpacing:
              "2px",
            marginBottom:
              "10px",
          }}
        >
          TALENT PASSPORT
          OPERATING SYSTEM
        </div>

        <h1
          style={{
            color:
              "white",
            fontSize:
              "52px",
            margin: 0,
          }}
        >
          ADMIN
          INTELLIGENCE
          CENTER
        </h1>

        <p
          style={{
            color:
              "#CBD5E1",
            marginTop:
              "12px",
          }}
        >
          Competition
          Operations,
          Participation,
          Talent Passport &
          School Insights
        </p>
      </div>

       {/* FILTER BAR */}

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "20px",
          marginBottom: "24px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <select
          value={selectedSchool}
          onChange={(e) =>
            setSelectedSchool(
              e.target.value
            )
          }
          style={filterStyle}
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

        <select
          value={selectedClass}
          onChange={(e) =>
            setSelectedClass(
              e.target.value
            )
          }
          style={filterStyle}
        >
          <option>
            All Classes
          </option>

          {classes.map(
            (item) => (
              <option
                key={item}
              >
                {item}
              </option>
            )
          )}
        </select>

        <button
          onClick={() =>
            setShowIncomplete(
              !showIncomplete
            )
          }
          style={{
            background:
              "#F97316",
            color: "white",
            border: "none",
            borderRadius:
              "14px",
            padding:
              "12px 18px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Incomplete
          Registrations
        </button>
      </div>

      {/* KPI */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <DashboardCard
          title="Total Students"
          value={totalStudents}
        />

        <DashboardCard
          title="Total Entries"
          value={totalEntries}
        />

        <DashboardCard
          title="Completed Registrations"
          value={
            completedStudents.length
          }
        />

        <DashboardCard
          title="Incomplete Registrations"
          value={
            incompleteStudents.length
          }
        />

        <DashboardCard
          title="Total Schools"
          value={totalSchools}
        />

        <DashboardCard
          title="Total Classes"
          value={totalClasses}
        />

        <DashboardCard
          title="Competitions"
          value={
            totalCompetitions
          }
        />

        <DashboardCard
          title="Pending Evaluations"
          value={
            pendingEvaluations
          }
        />
      </div>

      {/* INSIGHTS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <InfoCard
          title="Top Schools"
        >
          {topSchools.map(
            (item) => (
              <Row
                key={item[0]}
                label={item[0]}
                value={item[1]}
              />
            )
          )}
        </InfoCard>

        <InfoCard
          title="Top Events"
        >
          {topEvents.map(
            (item) => (
              <Row
                key={item[0]}
                label={item[0]}
                value={item[1]}
              />
            )
          )}
        </InfoCard>
      </div>

      {/* TALENT INTELLIGENCE */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px",
          marginBottom: "24px",
        }}
      >
        <InfoCard
          title="Talent Passport Intelligence"
        >
          <Row
            label="Average Passport Score"
            value={avgPassport}
          />

          <Row
            label="Average DNA Index"
            value={avgDNA}
          />

          <Row
            label="Students Evaluated"
            value={
              passports.length
            }
          />
        </InfoCard>

        <InfoCard
          title="Platform Status"
        >
          <Row
            label="Active Students"
            value={totalStudents}
          />

          <Row
            label="Active Schools"
            value={totalSchools}
          />

          <Row
            label="Pending Evaluations"
            value={
              pendingEvaluations
            }
          />
        </InfoCard>
      </div>

     {/* INCOMPLETE REGISTRATION TRACKER */}

{showIncomplete && (

  <div
    style={{
      background: "white",
      borderRadius: "24px",
      padding: "24px",
      marginTop: "20px",
      boxShadow:
        "0 8px 24px rgba(0,0,0,0.05)",
    }}
  >

    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}
    >

      <div>

        <div
          style={{
            color: "#F97316",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "1px",
          }}
        >
          OPERATIONS ALERT CENTER
        </div>

        <h2
          style={{
            marginTop: "6px",
          }}
        >
          Incomplete Registrations
        </h2>

      </div>

      <div
        style={{
          background:
            "#FEF3C7",
          color: "#92400E",
          padding:
            "10px 16px",
          borderRadius:
            "999px",
          fontWeight: 700,
        }}
      >
        {incompleteStudents.length}
        {" "}
        Students Pending
      </div>

    </div>

    {classes.map(
      (className) => {

        const classStudents =
          incompleteStudents.filter(
            (student) =>
              student.class_name ===
              className
          );

        if (
          classStudents.length ===
          0
        ) {
          return null;
        }

        return (

          <div
            key={className}
            style={{
              marginBottom:
                "28px",
            }}
          >

            <div
              style={{
                background:
                  "#EEF2FF",
                color: "#1E3A8A",
                padding:
                  "12px 18px",
                borderRadius:
                  "12px",
                fontWeight: 700,
                marginBottom:
                  "16px",
              }}
            >
              Class {className}
            </div>

            {classStudents.map(
              (student) => {

                const studentRows =
                  studentEvents.filter(
                    (
                      event
                    ) =>
                      event.student_id ===
                      student.student_id
                  );

                const missingEvents =
                  [];

                if (
                  !studentRows.some(
                    (x) =>
                      x.event_name ===
                      "Communication"
                  )
                ) {
                  missingEvents.push(
                    "Communication"
                  );
                }

                if (
                  !studentRows.some(
                    (x) =>
                      x.event_name ===
                      "Creative Expression"
                  )
                ) {
                  missingEvents.push(
                    "Creative Expression"
                  );
                }

                if (
                  !studentRows.some(
                    (x) =>
                      x.event_name ===
                      "Critical Thinking"
                  )
                ) {
                  missingEvents.push(
                    "Critical Thinking"
                  );
                }

                if (
                  !studentRows.some(
                    (x) =>
                      x.event_name ===
                      "Team Event"
                  )
                ) {
                  missingEvents.push(
                    "Team Event"
                  );
                }

                return (

                  <div
                    key={
                      student.student_id
                    }
                    style={{
                      padding:
                        "18px",
                      border:
                        "1px solid #E5E7EB",
                      borderRadius:
                        "16px",
                      marginBottom:
                        "12px",
                    }}
                  >

                    <div
                      style={{
                        fontWeight:
                          700,
                        fontSize:
                          "18px",
                      }}
                    >
                      {
                        student.student_name
                      }
                    </div>

                    <div
                      style={{
                        color:
                          "#64748B",
                        marginTop:
                          "4px",
                      }}
                    >
                      {
                        student.school_name
                      }
                    </div>

                    <div
                      style={{
                        marginTop:
                          "14px",
                        color:
                          "#DC2626",
                        fontWeight:
                          600,
                      }}
                    >
                      Missing:
                    </div>

                    <ul
                      style={{
                        marginTop:
                          "8px",
                      }}
                    >
                      {missingEvents.map(
                        (
                          item
                        ) => (
                          <li
                            key={
                              item
                            }
                          >
                            {item}
                          </li>
                        )
                      )}
                    </ul>

                  </div>

                );
              }
            )}

          </div>

        );
      }
    )}

  </div>

)}

    </div>
  );
}

const filterStyle = {
  padding: "12px 16px",
  borderRadius: "12px",
  border: "1px solid #E5E7EB",
};

function DashboardCard({
  title,
  value,
}: any) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "24px",
        padding: "24px",
      }}
    >
      <div
        style={{
          color: "#64748B",
          fontSize: "14px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "42px",
          fontWeight: 700,
          color: "#071952",
          marginTop: "8px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoCard({
  title,
  children,
}: any) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "24px",
        padding: "24px",
      }}
    >
      <h2
        style={{
          marginBottom: "20px",
          color: "#071952",
        }}
      >
        {title}
      </h2>

      {children}
    </div>
  );
}

function Row({
  label,
  value,
}: any) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        padding: "10px 0",
        borderBottom:
          "1px solid #E5E7EB",
      }}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}