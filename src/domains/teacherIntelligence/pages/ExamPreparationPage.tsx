import {
  useEffect,
  useState,
} from "react";

import {
  getTeacherExamAttentionIntelligence,
} from "../repository/TeacherExamPreparationRepository";

export default function ExamPreparationPage() {
  const [tables, setTables] =
    useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data =
      await getTeacherExamAttentionIntelligence();

    setTables(data);

    console.log(data);
  }

  return (
    <div
      style={{
        padding: "20px",
        background: "#F6F6F3",
        minHeight: "100%",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          background: "#141212",
          borderRadius: "28px",
          padding: "24px",
          marginBottom: "30px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#F59E0B",
            fontWeight: 700,
            letterSpacing: "2px",
            fontSize: "11px",
          }}
        >
          EXAM PREPARATION INTELLIGENCE
        </p>

        <h1
          style={{
            marginTop: "12px",
            marginBottom: "12px",
            fontSize: "28px",
            color: "white",
          }}
        >
          Students Requiring Academic Attention
        </h1>

        <p
          style={{
            margin: 0,
            color: "#D1D5DB",
            lineHeight: 1.8,
          }}
        >
          Identify students whose classroom doubts
          remained unresolved throughout the academic
          term and prepare targeted revision plans
          before examinations.
        </p>
      </div>

      {/* EMPTY STATE */}

      {tables.length === 0 && (
        <div style={cardStyle}>
          <h2
            style={{
              marginTop: 0,
              color: "#041B4D",
            }}
          >
            No Exam Preparation Intelligence Available Yet.
          </h2>

          <p
            style={{
              color: "#64748B",
              lineHeight: 1.8,
            }}
          >
            Students will start appearing here after
            they report unresolved classroom doubts.
          </p>
        </div>
      )}

      {/* CLASSROOM TABLES */}

      {tables.map(
        (table: any, tableIndex: number) => (
          <div
            key={table.classroom}
            style={{
              marginTop: "28px",
              background: "white",
              padding: "24px",
              borderRadius: "24px",
              boxShadow:
                "0px 8px 24px rgba(0,0,0,0.05)",
              overflowX: "auto",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#F59E0B",
                fontWeight: 700,
                letterSpacing: "2px",
                fontSize: "11px",
                textTransform: "uppercase",
              }}
            >
              CLASSROOM INTELLIGENCE
            </p>

            <h2
              style={{
                marginTop: "8px",
                marginBottom: "12px",
                color: "#041B4D",
              }}
            >
              {table.classroom}
            </h2>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "950px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      padding: "10px",
                      background: "#f7f4f9",
                      color: "#041B4D",
                      fontWeight: 700,
                      fontSize: "18px",
                      textAlign: "center",
                      border:
                        "1px solid #E5E7EB",
                    }}
                  >
                    METRICS
                  </th>

                  {table.students.map(
                    (
                      student: any,
                      index: number
                    ) => (
                      <th
                      key={student.studentName}
                        style={{
                          ...tableHeaderStyle,

                          background:
                            index % 4 === 0
                              ? "#F9F4EA"
                              : index % 4 === 1
                              ? "#EEF4FB"
                              : index % 4 === 2
                              ? "#EEF8F4"
                              : "#F4EFFA",

                          color: "#041B4D",
                          fontSize: "20px",
                          fontWeight: 700,
                        }}
                      >
                        {student.studentName}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {renderExamPreparationRow(
                  "Total Unresolved Not Discussed Doubts",

               table.students.map(
(student:any)=>
String(
student.totalUnresolvedDoubts
)
)
                )}

                {renderExamPreparationRow(
                  "Topics With Unresolved Doubts",

               table.students.map(
(student:any)=>
student.topics.join(", ")
)
                  
                )}

                {renderExamPreparationRow(
                  "Highest Risk Topic",

             table.students.map(
(student:any)=>
student.highestRiskTopic ?? "-"
)
                )}

                {renderExamPreparationRow(
                  "Attention Level",

         table.students.map(
(student:any)=>
student.attentionLevel
)
                )}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

function renderExamPreparationRow(
  metricName: string,
  values: string[]
) {
  return (
    <tr>
      <td style={metricColumnStyle}>
        {metricName}
      </td>

      {values.map((value, index) => (
        <td
          key={index}
          style={{
            ...tableCellStyle,

            color:
              metricName.includes(
                "Unresolved"
              )
                ? "#EF4444"
                : metricName.includes(
                    "Highest"
                  )
                ? "#1E3A8A"
                : metricName.includes(
                    "Attention"
                  )
                ? value === "HIGH"
                  ? "#DC2626"
                  : value === "MEDIUM"
                  ? "#F59E0B"
                  : "#16A34A"
                : "#334155",

            fontWeight:
              metricName.includes(
                "Unresolved"
              ) ||
              metricName.includes(
                "Highest"
              ) ||
              metricName.includes(
                "Attention"
              )
                ? 700
                : 500,
          }}
        >
          {value || "-"}
        </td>
      ))}
    </tr>
  );
}

const cardStyle = {
  background: "white",
  padding: "24px",
  borderRadius: "24px",
  boxShadow:
    "0px 8px 24px rgba(0,0,0,0.05)",
} as const;

const tableHeaderStyle = {
  padding: "10px",

  color: "white",

  fontWeight: 700,

  fontSize: "14px",

  textAlign: "center" as const,

  border: "1px solid #E5E7EB",
};

const metricColumnStyle = {
  padding: "10px",

  fontWeight: 700,

  background: "#FFFFFF",

  color: "#0F172A",

  fontSize: "14px",

  border: "1px solid #E5E7EB",

  width: "320px",

  minWidth: "320px",

  textAlign: "left" as const,
};

const tableCellStyle = {
  padding: "10px",

  border: "1px solid #E5E7EB",

  textAlign: "center" as const,

  color: "#334155",

  fontSize: "14px",

  verticalAlign: "top" as const,

  lineHeight: 1.4,
};