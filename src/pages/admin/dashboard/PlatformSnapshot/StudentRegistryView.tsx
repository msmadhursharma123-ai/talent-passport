import { useMemo, useState } from "react";

interface StudentRecord {
  student_id?: string;
  student_name: string;
  school_name: string | null;
  class_name: string | null;
  section?: string | null;
  created_at: string;
}

interface Props {
  students: StudentRecord[];
  completedStudents: StudentRecord[];
  incompleteStudents: StudentRecord[];
}

interface SchoolGroup {
  schoolName: string;
  students: StudentRecord[];
  totalStudents: number;
  totalClasses: number;
  completed: number;
  incomplete: number;
}

export default function StudentRegistryView({
  students,
  completedStudents,
  incompleteStudents,
}: Props) {
  const [search, setSearch] = useState("");

  const [selectedClass, setSelectedClass] =
    useState("");

  const [selectedSection, setSelectedSection] =
    useState("");

const [expandedSchools, setExpandedSchools] =
  useState<Record<string, boolean>>({});

function toggleSchool(school: string) {
  setExpandedSchools(previous => ({
    ...previous,
    [school]: !previous[school],
  }));
}

  const classOptions = useMemo(() => {
    return [
      ...new Set(
        students
          .map((x) => x.class_name)
          .filter(Boolean)
      ),
    ].sort();
  }, [students]);

  const sectionOptions = useMemo(() => {
    return [
      ...new Set(
        students
          .map((x) => x.section)
          .filter(Boolean)
      ),
    ].sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.student_name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (student.school_name ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesClass =
        !selectedClass ||
        student.class_name === selectedClass;

      const matchesSection =
        !selectedSection ||
        "-" === selectedSection;

      return (
        matchesSearch &&
        matchesClass &&
        matchesSection
      );
    });
  }, [
    students,
    search,
    selectedClass,
    selectedSection,
  ]);

  const groupedSchools =
    useMemo<SchoolGroup[]>(() => {
      const map = new Map<
        string,
        StudentRecord[]
      >();

      filteredStudents.forEach((student) => {
        const school =
          student.school_name ??
          "Unknown School";

        if (!map.has(school)) {
          map.set(school, []);
        }

        map.get(school)!.push(student);
      });

      return [...map.entries()]
        .map(([schoolName, rows]) => {
          const classCount =
            new Set(
              rows.map((x) => x.class_name)
            ).size;

          const completed =
            rows.filter((student) =>
              completedStudents.some(
                (completed) =>
                  completed.student_id ===
                  student.student_id
              )
            ).length;

          const incomplete =
            rows.filter((student) =>
              incompleteStudents.some(
                (pending) =>
                  pending.student_id ===
                  student.student_id
              )
            ).length;

          return {
            schoolName,
            students: rows.sort((a, b) =>
              a.student_name.localeCompare(
                b.student_name
              )
            ),
            totalStudents: rows.length,
            totalClasses: classCount,
            completed,
            incomplete,
          };
        })
        .sort((a, b) =>
          a.schoolName.localeCompare(
            b.schoolName
          )
        );
    }, [
      filteredStudents,
      completedStudents,
      incompleteStudents,
    ]);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "2fr 1fr 1fr",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <input
          placeholder="Search Student or School"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            height: 42,
            border: "1px solid #CBD5E1",
            borderRadius: 8,
            padding: "0 14px",
          }}
        />

        <select
          value={selectedClass}
          onChange={(e) =>
            setSelectedClass(e.target.value)
          }
          style={{
            height: 42,
            border: "1px solid #CBD5E1",
            borderRadius: 8,
          }}
        >
          <option value="">
            All Classes
          </option>

          {classOptions.map((item) => (
            <option
              key={item}
              value={item!}
            >
              {item}
            </option>
          ))}
        </select>

        <select
          value={selectedSection}
          onChange={(e) =>
            setSelectedSection(
              e.target.value
            )
          }
          style={{
            height: 42,
            border: "1px solid #CBD5E1",
            borderRadius: 8,
          }}
        >
          <option value="">
            All Sections
          </option>

          {sectionOptions.map((item) => (
            <option
              key={item}
              value={item!}
            >
              {item}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 18,
          color: "#64748B",
          fontWeight: 600,
        }}
      >
        Showing {groupedSchools.length} Schools

        {groupedSchools.length === 0 && (
  <div
    style={{
      background: "#FFFFFF",
      border: "1px dashed #CBD5E1",
      borderRadius: 12,
      padding: 40,
      textAlign: "center",
      color: "#64748B",
      marginBottom: 24,
    }}
  >
    <div
      style={{
        fontSize: 20,
        fontWeight: 700,
        marginBottom: 10,
      }}
    >
      No Students Found
    </div>

    <div>
      Try changing search or filters.
    </div>
  </div>
)}
      </div>

            {groupedSchools.map((school) => (
        <div
          key={school.schoolName}
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            marginBottom: 28,
            overflow: "hidden",
          }}
        >
          {/* School Header */}

       <div
  onClick={() =>
    toggleSchool(school.schoolName)
  }
  style={{
    padding: "20px 24px",
    background:
      "linear-gradient(180deg,#F8FAFC,#FFFFFF)",
    borderBottom: "1px solid #E2E8F0",
    cursor: "pointer",
    userSelect: "none",
  }}
>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#071952",
              }}
            >
              <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <div
    style={{
      fontSize: 20,
      fontWeight: 700,
      color: "#071952",
    }}
  >
    {school.schoolName}
  </div>

  <div
    style={{
      display: "flex",
      gap: 12,
      alignItems: "center",
    }}
  >
    <span
      style={{
        background: "#2563EB",
        color: "#fff",
        borderRadius: 999,
        padding: "4px 12px",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {school.totalStudents} Students
    </span>

    <span
      style={{
        fontSize: 22,
      }}
    >
      {expandedSchools[school.schoolName]
        ? "▲"
        : "▼"}
    </span>
  </div>
</div>
            </div>

         <div
  style={{
    display: "flex",
    gap: 14,
    marginTop: 18,
    flexWrap: "wrap",
  }}
>
              <div
  style={{
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 999,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
  }}
>
                <strong>{school.totalStudents}</strong>
                {" "}Students
              </div>

              <div
  style={{
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 999,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
  }}
>
                <strong>{school.totalClasses}</strong>
                {" "}Classes
              </div>

              <div
  style={{
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 999,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
  }}
>
                <strong>{school.completed}</strong>
                {" "}Completed
              </div>

              <div
  style={{
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 999,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
  }}
>
                <strong>{school.incomplete}</strong>
                {" "}Incomplete
              </div>
            </div>
          </div>

{expandedSchools[school.schoolName] && (
<>

          {/* Table Header */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "2fr 120px 120px 160px 160px",
              padding: "14px 22px",
              fontWeight: 700,
              background: "#FFFFFF",
              borderBottom: "1px solid #E2E8F0",
              color: "#0F172A",
            }}
          >
            <div>Student</div>
            <div>Class</div>
            <div>Section</div>
            <div>Status</div>
            <div>Registered</div>
          </div>

          {school.students.map((student) => {
            const completed =
              completedStudents.some(
                (x) =>
                  x.student_id ===
                  student.student_id
              );

            return (
              <div
                key={
                  student.student_id ??
                  student.student_name
                }
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "2fr 120px 120px 160px 160px",
                  padding: "14px 22px",
                  borderBottom:
                    "1px solid #F1F5F9",
                  alignItems: "center",
                  fontSize: 14,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {student.student_name}
                </div>

                <div>
                  {student.class_name ?? "-"}
                </div>

                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      padding:
                        "5px 12px",
                      borderRadius: 999,
                      fontWeight: 600,
                      fontSize: 12,
                      background: completed
                        ? "#DCFCE7"
                        : "#FEE2E2",
                      color: completed
                        ? "#166534"
                        : "#991B1B",
                    }}
                  >
                    {completed
                      ? "Completed"
                      : "Incomplete"}
                  </span>
                </div>

                <div>
                  {new Date(
                    student.created_at
                  ).toLocaleDateString()}
                </div>
              </div>
            );
            
          })}
          </>
)}
        </div>
      ))}
    </>
    
  );
}
