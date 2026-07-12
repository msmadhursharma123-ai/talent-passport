import { useMemo, useState } from "react";

interface StudentRecord {
  student_id?: string;
  student_name: string;
  school_name: string | null;
  class_name: string | null;
  created_at: string;
}

interface Props {
  students: StudentRecord[];
}

interface SchoolGroup {
  key: string;
  schoolName: string;
  students: StudentRecord[];
  totalStudents: number;
  totalClasses: number;
  latestRegistration: string;
}

function normalizeSchoolName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export default function SchoolRegistryView({
  students,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [expandedSchools, setExpandedSchools] =
    useState<Record<string, boolean>>({});

  function toggleSchool(key: string) {
    setExpandedSchools((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  }

  const groupedSchools =
    useMemo<SchoolGroup[]>(() => {
      const map = new Map<
        string,
        {
          displayName: string;
          students: StudentRecord[];
        }
      >();

      students.forEach((student) => {
        const display =
          (
            student.school_name ??
            "Unknown School"
          ).trim();

        const key =
          normalizeSchoolName(display);

        if (!map.has(key)) {
          map.set(key, {
            displayName: display,
            students: [],
          });
        }

        map.get(key)!.students.push(student);
      });

      return [...map.entries()]
        .map(([key, value]) => {
          const latest =
            value.students
              .map((student) =>
                new Date(
                  student.created_at
                ).getTime()
              )
              .sort((a, b) => b - a)[0];

          return {
            key,
            schoolName:
              value.displayName,
            students: value.students.sort(
              (a, b) =>
                a.student_name.localeCompare(
                  b.student_name
                )
            ),
            totalStudents:
              value.students.length,
            totalClasses:
              new Set(
                value.students.map(
                  (student) =>
                    student.class_name
                )
              ).size,
            latestRegistration:
              new Date(
                latest
              ).toLocaleDateString(),
          };
        })
        .sort((a, b) =>
          a.schoolName.localeCompare(
            b.schoolName
          )
        );
    }, [students]);

  const filteredSchools =
    useMemo(() => {
      return groupedSchools.filter(
        (school) =>
          school.schoolName
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [
      groupedSchools,
      search,
    ]);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 24,
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Search School..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={{
            width: 320,
            height: 44,
            border:
              "1px solid #CBD5E1",
            borderRadius: 10,
            padding: "0 14px",
          }}
        />

        <div
          style={{
            display: "flex",
            gap: 16,
            color: "#64748B",
            fontWeight: 600,
          }}
        >
          <div>
            Schools:
            <strong>
              {" "}
              {
                filteredSchools.length
              }
            </strong>
          </div>

          <div>
            Students:
            <strong>
              {" "}
              {students.length}
            </strong>
          </div>
        </div>
      </div>

      {filteredSchools.length === 0 && (
        <div
          style={{
            padding: 60,
            textAlign: "center",
            border:
              "1px dashed #CBD5E1",
            borderRadius: 12,
            color: "#64748B",
          }}
        >
          No schools found.
        </div>
      )}

      {filteredSchools.map(
        (school) => (
          <div
            key={school.key}
            style={{
              background: "#fff",
              border:
                "1px solid #E2E8F0",
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 24,
            }}
          >
            <div
              onClick={() =>
                toggleSchool(
                  school.key
                )
              }
              style={{
                cursor: "pointer",
                padding: 22,
                background:
                  "linear-gradient(180deg,#F8FAFC,#FFFFFF)",
                borderBottom:
                  "1px solid #E2E8F0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 21,
                      fontWeight: 700,
                      color:
                        "#071952",
                    }}
                  >
                    {school.schoolName}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      gap: 12,
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <div
                      style={{
                        background:
                          "#EEF4FF",
                        padding:
                          "6px 12px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      👨‍🎓{" "}
                      {
                        school.totalStudents
                      }{" "}
                      Students
                    </div>

                    <div
                      style={{
                        background:
                          "#F1F5F9",
                        padding:
                          "6px 12px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      🏫{" "}
                      {
                        school.totalClasses
                      }{" "}
                      Classes
                    </div>

                    <div
                      style={{
                        background:
                          "#ECFDF5",
                        padding:
                          "6px 12px",
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Latest:{" "}
                      {
                        school.latestRegistration
                      }
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 24,
                  }}
                >
                  {expandedSchools[
                    school.key
                  ]
                    ? "▲"
                    : "▼"}
                </div>
              </div>
            </div>

            {expandedSchools[
              school.key
            ] && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "70px 2fr 150px 170px",
                    background:
                      "#F8FAFC",
                    padding:
                      "14px 22px",
                    fontWeight: 700,
                    borderBottom:
                      "1px solid #E2E8F0",
                  }}
                >
                  <div>#</div>

                  <div>
                    Student Name
                  </div>

                  <div>Class</div>

                  <div>
                    Registered
                  </div>
                </div>

                                {school.students.map(
                  (student, index) => (
                    <div
                      key={
                        student.student_id ??
                        `${school.key}-${index}`
                      }
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "70px 2fr 150px 170px",
                        padding: "14px 22px",
                        alignItems: "center",
                        borderBottom:
                          "1px solid #F1F5F9",
                        background:
                          index % 2 === 0
                            ? "#FFFFFF"
                            : "#FAFBFC",
                        transition:
                          "background 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "#F8FAFC";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          index % 2 === 0
                            ? "#FFFFFF"
                            : "#FAFBFC";
                      }}
                    >
                      <div
                        style={{
                          color: "#64748B",
                          fontWeight: 600,
                        }}
                      >
                        {index + 1}
                      </div>

                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#0F172A",
                          }}
                        >
                          {student.student_name}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color: "#64748B",
                            marginTop: 3,
                          }}
                        >
                          {student.student_id ??
                            "-"}
                        </div>
                      </div>

                      <div>
                        <span
                          style={{
                            background: "#EFF6FF",
                            color: "#1D4ED8",
                            padding:
                              "4px 12px",
                            borderRadius: 999,
                            fontWeight: 600,
                            fontSize: 12,
                          }}
                        >
                          {student.class_name ??
                            "-"}
                        </span>
                      </div>

                      <div
                        style={{
                          color: "#475569",
                          fontWeight: 500,
                        }}
                      >
                        {new Date(
                          student.created_at
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  )
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    padding: "16px 22px",
                    background: "#F8FAFC",
                    borderTop:
                      "1px solid #E2E8F0",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  <div>
                    Total Students:{" "}
                    {school.totalStudents}
                  </div>

                  <div>
                    Total Classes:{" "}
                    {school.totalClasses}
                  </div>

                  <div>
                    Latest Registration:{" "}
                    {
                      school.latestRegistration
                    }
                  </div>
                </div>
              </>
            )}
          </div>
        )
      )}
    </>
  );
}