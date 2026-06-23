import React,
{
  useEffect,
  useState
}
from "react";

import {
  fetchStudentsMaster,
  fetchTalentPassportScores
}
from "../../supabaseClient";

interface StudentRecord {
  student_id: string;
  student_name: string;
  school_name: string;
  class_name: string;
  event_name?: string;
  pathway?: string;
  overall_score?: number;
}

export default function TalentDiscovery() {

  const [students,
    setStudents] =
    useState<StudentRecord[]>([]);

  const [filteredStudents,
    setFilteredStudents] =
    useState<StudentRecord[]>([]);

  const [schoolFilter,
    setSchoolFilter] =
    useState("All");

  const [classFilter,
    setClassFilter] =
    useState("All");

  const [scoreFilter,
    setScoreFilter] =
    useState(0);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {

    let results =
      [...students];

    if (
      schoolFilter !== "All"
    ) {
      results =
        results.filter(
          s =>
            s.school_name ===
            schoolFilter
        );
    }

    if (
      classFilter !== "All"
    ) {
      results =
        results.filter(
          s =>
            String(
              s.class_name
            ) === classFilter
        );
    }

    results =
      results.filter(
        s =>
          (s.overall_score || 0)
          >= scoreFilter
      );

    setFilteredStudents(
      results
    );

  }, [
    students,
    schoolFilter,
    classFilter,
    scoreFilter
  ]);

  async function
  loadStudents() {

    const studentData =
      await fetchStudentsMaster();

    const scoreData =
      await fetchTalentPassportScores();

    const merged =
      studentData.map(
        (student: any) => {

          const score: any =
  scoreData.find(
    (s: any) =>
      s.student_id ===
      student.student_id
  ) || {};

return {
  ...student,
  event_name:
    score.event_name || "",
  pathway:
    score.pathway || "",
  overall_score:
    score.overall_score || 0
};
        }
      );

    setStudents(
      merged
    );
  }

  const schools =
    Array.from(
      new Set(
        students.map(
          s => s.school_name
        )
      )
    );

  const classes =
    Array.from(
      new Set(
        students.map(
          s =>
            String(
              s.class_name
            )
        )
      )
    );

  return (

    <div>

      {/* HEADER */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#0F172A,#1E293B)",
          color: "white",
          padding: "40px",
          borderRadius: "24px",
          marginBottom: "25px"
        }}
      >

        <div
          style={{
            color: "#F4A623",
            letterSpacing: 2,
            fontWeight: 700,
            marginBottom: 10
          }}
        >
          TALENT MARKETPLACE
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 42
          }}
        >
          Discover Students
        </h1>

        <p
          style={{
            color: "#CBD5E1",
            marginTop: 12
          }}
        >
          Find talented students,
          offer workshops,
          scholarships and
          learning opportunities.
        </p>

      </div>

      {/* FILTERS */}

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "25px",
          marginBottom: "25px",
          display: "grid",
          gridTemplateColumns:
            "repeat(3,1fr)",
          gap: "20px"
        }}
      >

        <div>

          <label>
            School
          </label>

          <select
            value={
              schoolFilter
            }
            onChange={(e)=>
              setSchoolFilter(
                e.target.value
              )
            }
            style={{
              width:"100%",
              padding:12,
              marginTop:8
            }}
          >

            <option>
              All
            </option>

            {schools.map(
              school => (
                <option
                  key={school}
                >
                  {school}
                </option>
              )
            )}

          </select>

        </div>

        <div>

          <label>
            Class
          </label>

          <select
            value={
              classFilter
            }
            onChange={(e)=>
              setClassFilter(
                e.target.value
              )
            }
            style={{
              width:"100%",
              padding:12,
              marginTop:8
            }}
          >

            <option>
              All
            </option>

            {classes.map(
              cls => (
                <option
                  key={cls}
                >
                  {cls}
                </option>
              )
            )}

          </select>

        </div>

        <div>

          <label>
            Minimum Score
          </label>

          <input
            type="number"
            value={
              scoreFilter
            }
            onChange={(e)=>
              setScoreFilter(
                Number(
                  e.target.value
                )
              )
            }
            style={{
              width:"100%",
              padding:12,
              marginTop:8
            }}
          />

        </div>

      </div>

      {/* STUDENTS */}

      <div
        style={{
          display:"grid",
          gridTemplateColumns:
          "repeat(2,1fr)",
          gap:"20px"
        }}
      >

        {filteredStudents.map(
          student => (

            <div
              key={
                student.student_id
              }
              style={{
                background:"white",
                borderRadius:"24px",
                padding:"25px"
              }}
            >

              <h2
                style={{
                  marginTop:0,
                  color:"#143B73"
                }}
              >
                {
                  student.student_name
                }
              </h2>

              <p>
                <strong>
                  School:
                </strong>
                {" "}
                {
                  student.school_name
                }
              </p>

              <p>
                <strong>
                  Class:
                </strong>
                {" "}
                {
                  student.class_name
                }
              </p>

              <p>
                <strong>
                  Event:
                </strong>
                {" "}
                {
                  student.event_name ||
                  "-"
                }
              </p>

              <p>
                <strong>
                  Pathway:
                </strong>
                {" "}
                {
                  student.pathway ||
                  "-"
                }
              </p>

              <p>
                <strong>
                  Score:
                </strong>
                {" "}
                {
                  student.overall_score ||
                  0
                }
              </p>

              <div
                style={{
                  display:"flex",
                  gap:"10px",
                  marginTop:"20px"
                }}
              >

                <button
                  onClick={() =>
                    alert(
                      "Scholarship feature coming next"
                    )
                  }
                >
                  Offer Scholarship
                </button>

                <button
                  onClick={() =>
                    alert(
                      "Workshop feature coming next"
                    )
                  }
                >
                  Offer Workshop
                </button>

                <button
                  onClick={() =>
                    alert(
                      "Parent Contact Request feature coming next"
                    )
                  }
                >
                  Request Contact
                </button>

              </div>

            </div>

          )
        )}

      </div>

    </div>

  );
}