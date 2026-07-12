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

interface ClassGroup {
  key: string;
  className: string;
  students: StudentRecord[];
  totalStudents: number;
  totalSchools: number;
  latestRegistration: string;
}

function normalizeClassName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

export default function ClassDistributionView({
  students,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [expandedClasses, setExpandedClasses] =
    useState<Record<string, boolean>>({});

  function toggleClass(key: string) {
    setExpandedClasses((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  }

  const groupedClasses =
    useMemo<ClassGroup[]>(() => {
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
            student.class_name ??
            "Unknown"
          ).trim();

        const key =
          normalizeClassName(display);

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
            className:
              value.displayName,
            students: value.students.sort(
              (a, b) =>
                a.student_name.localeCompare(
                  b.student_name
                )
            ),
            totalStudents:
              value.students.length,
            totalSchools:
              new Set(
                value.students.map(
                  (student) =>
                    (
                      student.school_name ??
                      ""
                    )
                      .trim()
                      .toLowerCase()
                )
              ).size,
            latestRegistration:
              new Date(
                latest
              ).toLocaleDateString(),
          };
        })
        .sort((a, b) =>
          a.className.localeCompare(
            b.className,
            undefined,
            {
              numeric: true,
            }
          )
        );
    }, [students]);

  const filteredClasses =
    useMemo(() => {
      return groupedClasses.filter(
        (group) =>
          group.className
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [
      groupedClasses,
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
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <input
          placeholder="Search Class..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          style={{
            width: 300,
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
            Classes:
            <strong>
              {" "}
              {
                filteredClasses.length
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

      {filteredClasses.length === 0 && (
        <div
          style={{
            border:
              "1px dashed #CBD5E1",
            borderRadius: 12,
            padding: 60,
            textAlign: "center",
            color: "#64748B",
          }}
        >
          No Classes Found
        </div>
      )}

      {filteredClasses.map(
        (classGroup) => (
          <div
            key={classGroup.key}
            style={{
              background: "#FFFFFF",
              border:
                "1px solid #E2E8F0",
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 24,
            }}
          >
            <div
              onClick={() =>
                toggleClass(
                  classGroup.key
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
                    Class{" "}
                    {
                      classGroup.className
                    }
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginTop: 8,
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
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      👨‍🎓{" "}
                      {
                        classGroup.totalStudents
                      }{" "}
                      Students
                    </div>

                    <div
                      style={{
                        background:
                          "#ECFDF5",
                        padding:
                          "6px 12px",
                        borderRadius: 999,
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      🏫{" "}
                      {
                        classGroup.totalSchools
                      }{" "}
                      Schools
                    </div>

                    <div
                      style={{
                        background:
                          "#F8FAFC",
                        padding:
                          "6px 12px",
                        borderRadius: 999,
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      Latest:{" "}
                      {
                        classGroup.latestRegistration
                      }
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 24,
                  }}
                >
                  {expandedClasses[
                    classGroup.key
                  ]
                    ? "▲"
                    : "▼"}
                </div>
              </div>
            </div>

            {expandedClasses[
              classGroup.key
            ] && (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "70px 2fr 2fr 160px",
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

                  <div>
                    School
                  </div>

                  <div>
                    Registered
                  </div>
                </div>
                                {classGroup.students.map(
                  (student, index) => (
                    <div
                      key={
                        student.student_id ??
                        `${classGroup.key}-${index}`
                      }
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "70px 2fr 2fr 160px",
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
                        <div
                          style={{
                            fontWeight: 600,
                          }}
                        >
                          {student.school_name ??
                            "Unknown School"}
                        </div>
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
                    {
                      classGroup.totalStudents
                    }
                  </div>

                  <div>
                    Schools:{" "}
                    {
                      classGroup.totalSchools
                    }
                  </div>

                  <div>
                    Latest Registration:{" "}
                    {
                      classGroup.latestRegistration
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