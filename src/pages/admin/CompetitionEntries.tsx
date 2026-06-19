import { useEffect, useMemo, useState } from "react";

import {
  fetchAllSubmissions,
  fetchStudentsMaster,
  fetchStudentEvents,
  fetchTalentPassports,
  fetchDNAProfiles,
  evaluateSubmission,
  deleteSubmission,
  getEvaluationBySubmissionId,
} from "../../supabaseClient";

export default function CompetitionEntries() {

  const [submissions, setSubmissions] =
    useState<any[]>([]);

  const [students, setStudents] =
    useState<any[]>([]);

  const [studentEvents, setStudentEvents] =
    useState<any[]>([]);

  const [passports, setPassports] =
    useState<any[]>([]);

  const [dnaProfiles, setDnaProfiles] =
    useState<any[]>([]);

  const [selectedStudent,
    setSelectedStudent] =
    useState<any>(null);

  const [selectedEvent,
    setSelectedEvent] =
    useState("Communication");

  const [selectedEvaluation,
    setSelectedEvaluation] =
    useState<any>(null);

  const [search, setSearch] =
    useState("");

  const [schoolFilter,
    setSchoolFilter] =
    useState("All");

  const [classFilter,
    setClassFilter] =
    useState("All");

  const [submissionFilter,
    setSubmissionFilter] =
    useState("All");

  const [evaluationFilter,
    setEvaluationFilter] =
    useState("All");

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

    const passportResult =
      await fetchTalentPassports();

    const dnaResult =
      await fetchDNAProfiles();

    setSubmissions(
      submissionsResult.submissions || []
    );
console.log(
  "ALL SUBMISSIONS",
  submissionsResult.submissions
);

    setStudents(
      studentsResult || []
    );

    setStudentEvents(
      eventsResult || []
    );

    setPassports(
      passportResult || []
    );

    setDnaProfiles(
      dnaResult || []
    );
  }

  const schools =
    [
      "All",
      ...new Set(
        students
          .map(
            (x) => x.school_name
          )
          .filter(Boolean)
      ),
    ];

  const classes =
    [
      "All",
      ...new Set(
        students
          .map(
            (x) => x.class_name
          )
          .filter(Boolean)
      ),
    ];

  const groupedStudents =
    useMemo(() => {

      return students.map(
        (student) => {

         const studentSubmissions =
  submissions.filter(
    (s) =>
      s.student_id ===
      student.student_id
  );

console.log(
  "STUDENT",
  student.student_name
);

console.log(
  "MASTER ID",
  student.student_id
);

console.log(
  "MATCHED SUBMISSIONS",
  studentSubmissions
);

          const events =
            studentEvents.filter(
              (e) =>
                e.student_id ===
                student.student_id
            );

          const passport =
            passports.find(
              (p) =>
                p.student_id ===
                student.student_id
            );

          const dna =
            dnaProfiles.find(
              (d) =>
                d.student_id ===
                student.student_id
            );

          const completedCount =
studentSubmissions.length;

        const ALL_PATHWAYS = [
  "Communication",
  "Thinking",
  "Team Event",
];

const submittedPathways =
  studentSubmissions.map(
    (s: any) =>
      s.pathway
  );

const missingEvents =
  ALL_PATHWAYS.filter(
    (pathway) =>
      !submittedPathways.includes(
        pathway
      )
  );

          const submissionStatus =
            completedCount === 4
              ? "Fully Submitted"
              : "Partially Submitted";

          const evaluationCount =
            studentSubmissions.filter(
              (s) =>
                s.overall_score
            ).length;

          let evaluationStatus =
            "Not Evaluated";

          if (
            evaluationCount > 0
          ) {
            evaluationStatus =
              evaluationCount ===
              completedCount
                ? "Fully Evaluated"
                : "Partially Evaluated";
          }

console.log(
  "FINAL STUDENT OBJECT",
  student.student_name,
  completedCount,
  studentSubmissions.length
);

          return {
            ...student,

            submissions:
              studentSubmissions,

            events,

            passport,

            dna,

            completedCount,

            missingEvents,

            submissionStatus,

            evaluationStatus,
          };
        }
      );

    }, [
      students,
      submissions,
      studentEvents,
      passports,
      dnaProfiles,
    ]);

  const filteredStudents =
    groupedStudents.filter(
      (student) => {

        const searchMatch =
          student.student_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const schoolMatch =
          schoolFilter ===
            "All" ||
          student.school_name ===
            schoolFilter;

        const classMatch =
          classFilter ===
            "All" ||
          student.class_name ===
            classFilter;

        const submissionMatch =
          submissionFilter ===
            "All" ||
          student.submissionStatus ===
            submissionFilter;

        const evaluationMatch =
          evaluationFilter ===
            "All" ||
          student.evaluationStatus ===
            evaluationFilter;

        return (
          searchMatch &&
          schoolMatch &&
          classMatch &&
          submissionMatch &&
          evaluationMatch
        );
      }
    );

  const totalStudents =
    groupedStudents.length;

  const fullySubmitted =
    groupedStudents.filter(
      (x) =>
        x.submissionStatus ===
        "Fully Submitted"
    ).length;

  const partiallySubmitted =
    groupedStudents.filter(
      (x) =>
        x.submissionStatus ===
        "Partially Submitted"
    ).length;

  const fullyEvaluated =
    groupedStudents.filter(
      (x) =>
        x.evaluationStatus ===
        "Fully Evaluated"
    ).length;

  const pendingEvaluation =
    groupedStudents.filter(
      (x) =>
        x.evaluationStatus !==
        "Fully Evaluated"
    ).length;

  return (

    <div
      style={{
        padding: "30px",
        background:
          "radial-gradient(circle at top left, #0B2A4A 0%, #163A63 45%, #2A5A8E 100%)",
        minHeight: "100vh",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          marginBottom: "25px",
        }}
      >

        <h1
          style={{
            color: "white",
            fontSize: "36px",
            marginBottom: "8px",
          }}
        >
          Competition Operations Center
        </h1>

        <p
          style={{
            color: "#CBD5E1",
          }}
        >
          Student Evaluation &
          Talent Passport Engine
        </p>

      </div>
       {/* FILTER BAR */}

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "20px",
          marginBottom: "24px",
        }}
      >

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(5,1fr)",
            gap: "12px",
          }}
        >

          <select
            value={schoolFilter}
            onChange={(e) =>
              setSchoolFilter(
                e.target.value
              )
            }
            style={filterStyle}
          >
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
            value={classFilter}
            onChange={(e) =>
              setClassFilter(
                e.target.value
              )
            }
            style={filterStyle}
          >
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

          <select
            value={
              submissionFilter
            }
            onChange={(e) =>
              setSubmissionFilter(
                e.target.value
              )
            }
            style={filterStyle}
          >
            <option>
              All
            </option>

            <option>
              Fully Submitted
            </option>

            <option>
              Partially Submitted
            </option>
          </select>

          <select
            value={
              evaluationFilter
            }
            onChange={(e) =>
              setEvaluationFilter(
                e.target.value
              )
            }
            style={filterStyle}
          >
            <option>
              All
            </option>

            <option>
              Fully Evaluated
            </option>

            <option>
              Partially Evaluated
            </option>

            <option>
              Not Evaluated
            </option>
          </select>

          <input
            type="text"
            placeholder="Search Student..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={filterStyle}
          />

        </div>

      </div>

      {/* KPI ROW */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4,1fr)",
          gap: "20px",
          marginBottom: "24px",
        }}
      >

        <MetricCard
          title="Total Students"
          value={
            totalStudents
          }
        />

        <MetricCard
          title="Fully Submitted"
          value={
            fullySubmitted
          }
        />

        <MetricCard
          title="Partially Submitted"
          value={
            partiallySubmitted
          }
        />

        <MetricCard
          title="Pending Evaluation"
          value={
            pendingEvaluation
          }
        />

      </div>

      {/* STUDENT REGISTRY */}

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          overflow: "hidden",
        }}
      >

        <div
          style={{
            padding: "24px",
            borderBottom:
              "1px solid #E5E7EB",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#143B73",
            }}
          >
            Student Registry
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
            padding:
              "16px 24px",
            background:
              "#F8FAFC",
            fontWeight: 700,
            color: "#475569",
          }}
        >
          <div>
            Student
          </div>

          <div>
            School
          </div>

          <div>
            Class
          </div>

          <div>
            Submitted
          </div>

          <div>
            Missing
          </div>

          <div>
            Passport
          </div>

          <div>
            Action
          </div>
        </div>

        {filteredStudents.map(
          (student) => (

            <div
              key={
                student.student_id
              }
              style={{
                borderBottom:
                  "1px solid #E5E7EB",
              }}
            >

              {/* STUDENT ROW */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "2fr 1fr 1fr 1fr 1fr 1fr 1fr",
                  padding:
                    "18px 24px",
                  alignItems:
                    "center",
                }}
              >

                <div>

                  <div
                    style={{
                      fontWeight: 700,
                    }}
                  >
                    {
                      student.student_name
                    }
                  </div>

                  <div
                    style={{
                      fontSize:
                        "12px",
                      color:
                        "#64748B",
                    }}
                  >
                    {
                      student.student_email
                    }
                  </div>

                </div>

                <div>
                  {
                    student.school_name
                  }
                </div>

                <div>
                  {
                    student.class_name
                  }
                </div>

                <div>

                  {
                    student.completedCount
                  }
                  /4

                </div>

                <div
                  style={{
                    color:
                      student
                        .missingEvents
                        .length > 0
                        ? "#DC2626"
                        : "#16A34A",
                  }}
                >

                  {
                    student
                      .missingEvents
                      .length
                  }

                </div>

                <div>

                  {
                    student
                      .passport
                      ?.combined_score ||
                    "-"
                  }

                </div>

                <div>

                  <button
  onClick={() => {

    if (
      selectedStudent?.student_id ===
      student.student_id
    ) {
      setSelectedStudent(
        null
      );
      return;
    }

    setSelectedStudent(
      student
    );

    setSelectedEvent(
      student.submissions?.[0]?.id ||
      ""
    );
  }}
  style={
    orangeButton
  }
>
  {selectedStudent
    ?.student_id ===
  student.student_id
    ? "Close"
    : "Open"}
</button>

                </div>

              </div>

              {/* EXPANDED STUDENT WORKSPACE */}

              {selectedStudent
                ?.student_id ===
                student.student_id && (

                <div
                  style={{
                    padding:
                      "24px",
                    background:
                      "#F8FAFC",
                  }}
                >

                  <div
                    style={{
                      display:
                        "flex",
                      gap: "12px",
                      flexWrap:
                        "wrap",
                      marginBottom:
                        "20px",
                    }}
                  >

                    {student.submissions.map(
  (submission: any) => (

    <button
      key={submission.id}
      onClick={() =>
        setSelectedEvent(
          submission.id
        )
      }
      style={{
        border: "none",
        padding: "12px 18px",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: 600,

        background:
          selectedEvent ===
          submission.id
            ? "#F97316"
            : "#E2FBE8",

        color:
          selectedEvent ===
          submission.id
            ? "white"
            : "#334155",
      }}
    >
      {submission.event_name}
    </button>

  )
)}

                  </div>
                   {/* EVENT WORKSPACE */}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "2fr 1fr",
                      gap: "20px",
                    }}
                  >

                    {/* LEFT */}

                    <div>

                      {(() => {



                        const activeSubmission =
  student.submissions.find(
    (s: any) =>
      s.id ===
      selectedEvent
  );

                        if (
                          !activeSubmission
                        ) {

                          return (
                            <div
                              style={{
                                background:
                                  "white",
                                padding:
                                  "40px",
                                borderRadius:
                                  "20px",
                              }}
                            >
                              <h3>
                                No Submission
                                Found
                              </h3>

                              <p>
                                Student has
                                not submitted
                                this event.
                              </p>
                            </div>
                          );
                        }

                        return (

                          <>

                            {/* VIDEO */}

                            <div
                              style={{
                                background:
                                  "white",
                                borderRadius:
                                  "20px",
                                padding:
                                  "20px",
                                marginBottom:
                                  "20px",
                              }}
                            >
<div
  style={{
    marginBottom: "16px",
  }}
>

  <h2
    style={{
      margin: 0,
    }}
  >
    {activeSubmission.event_name}
  </h2>

  <p
    style={{
      color: "#64748B",
      marginTop: "4px",
    }}
  >
    {activeSubmission.pathway}
  </p>

</div>
                              <h3>
                                Performance
                                Video
                              </h3>

                              <video
                                controls
                                width="100%"
                                style={{
                                  borderRadius:
                                    "12px",
                                }}
                              >
                                <source
                                  src={
                                    activeSubmission.video_url
                                  }
                                />
                              </video>

                            </div>

                            {/* TRANSCRIPT */}

                            <div
                              style={{
                                background:
                                  "white",
                                borderRadius:
                                  "20px",
                                padding:
                                  "20px",
                                marginBottom:
                                  "20px",
                              }}
                            >

                              <h3>
                                Transcript
                              </h3>

                              <p>
                                {activeSubmission.description ||
                                  "Transcript generation coming next"}
                              </p>

                            </div>

                            {/* ACTIONS */}

                            <div
                              style={{
                                background:
                                  "white",
                                borderRadius:
                                  "20px",
                                padding:
                                  "20px",
                              }}
                            >

                              <h3>
                                Evaluation
                                Center
                              </h3>

                              <div
                                style={{
                                  display:
                                    "flex",
                                  gap: "12px",
                                  flexWrap:
                                    "wrap",
                                  marginTop:
                                    "16px",
                                }}
                              >

                                <button
                                  style={
                                    orangeButton
                                  }
                                  onClick={async () => {

                                    const result =
                                      await evaluateSubmission(
                                        activeSubmission.id
                                      );

                                    if (
                                      result?.error
                                    ) {
                                      alert(
                                        result.error
                                      );
                                      return;
                                    }

                                    const evaluation: any =
                                      await getEvaluationBySubmissionId(
                                        activeSubmission.id
                                      );

                                    if (
                                      evaluation?.data
                                    ) {
                                      setSelectedEvaluation(
                                        evaluation.data
                                      );
                                    }

                                  }}
                                >
                                  AI Evaluate
                                </button>

                                <button
                                  style={
                                    grayButton
                                  }
                                  onClick={async () => {

                                    const result: any =
                                      await getEvaluationBySubmissionId(
                                        activeSubmission.id
                                      );

                                    if (
                                      result?.data
                                    ) {
                                      setSelectedEvaluation(
                                        result.data
                                      );
                                    } else {
                                      alert(
                                        "No evaluation found"
                                      );
                                    }

                                  }}
                                >
                                  View Evaluation
                                </button>

                                <button
                                  style={
                                    dangerButton
                                  }
                                  onClick={async () => {

                                    const confirmed =
                                      window.confirm(
                                        "Delete this submission?"
                                      );

                                    if (
                                      !confirmed
                                    ) {
                                      return;
                                    }

                                    await deleteSubmission(
                                      activeSubmission.id
                                    );

                                    loadData();

                                  }}
                                >
                                  Delete
                                </button>

                              </div>

                            </div>

                          </>

                        );

                      })()}

                    </div>

                    {/* RIGHT */}

                    <div>

                      <div
                        style={{
                          background:
                            "white",
                          borderRadius:
                            "20px",
                          padding:
                            "20px",
                        }}
                      >

                        <h3>
                          Talent Passport
                        </h3>

                        <ScoreRow
                          title="Communication"
                          value={
                            student.passport
                              ?.communication_score || 0
                          }
                        />

                        <ScoreRow
                          title="Creativity"
                          value={
                            student.passport
                              ?.creativity_score || 0
                          }
                        />

                        <ScoreRow
                          title="Critical Thinking"
                          value={
                            student.passport
                              ?.critical_thinking_score || 0
                          }
                        />

                        <ScoreRow
                          title="Team Score"
                          value={
                            student.passport
                              ?.team_score || 0
                          }
                        />

                        <ScoreRow
                          title="Combined Score"
                          value={
                            student.passport
                              ?.combined_score || 0
                          }
                        />

                      </div>

                      <div
                        style={{
                          background:
                            "white",
                          borderRadius:
                            "20px",
                          padding:
                            "20px",
                          marginTop:
                            "20px",
                        }}
                      >

                        <h3>
                          DNA Intelligence
                        </h3>

                        <ScoreRow
                          title="DNA Index"
                          value={
                            student.dna
                              ?.dna_index || 0
                          }
                        />

                        <ScoreRow
                          title="Participation"
                          value={
                            student.dna
                              ?.participation_index || 0
                          }
                        />

                      </div>

                    </div>

                  </div>

                </div>

              )}

            </div>

          )
        )}

      </div>

      {/* EVALUATION MODAL */}

      {selectedEvaluation && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent:
              "center",
            alignItems:
              "center",
            zIndex: 9999,
          }}
        >

          <div
            style={{
              background:
                "white",
              width: "700px",
              maxHeight:
                "80vh",
              overflowY:
                "auto",
              borderRadius:
                "20px",
              padding:
                "30px",
            }}
          >

            <h2>
              AI Evaluation Report
            </h2>

            <ScoreRow
              title={
                selectedEvaluation.metric_1_name
              }
              value={
                selectedEvaluation.metric_1_score
              }
            />

            <ScoreRow
              title={
                selectedEvaluation.metric_2_name
              }
              value={
                selectedEvaluation.metric_2_score
              }
            />

            <ScoreRow
              title={
                selectedEvaluation.metric_3_name
              }
              value={
                selectedEvaluation.metric_3_score
              }
            />

            <ScoreRow
              title={
                selectedEvaluation.metric_4_name
              }
              value={
                selectedEvaluation.metric_4_score
              }
            />

            <ScoreRow
              title={
                selectedEvaluation.metric_5_name
              }
              value={
                selectedEvaluation.metric_5_score
              }
            />

            <h3>
              Overall Score:
              {" "}
              {
                selectedEvaluation.overall_score
              }
            </h3>

            <p>
              {
                selectedEvaluation.ai_feedback
              }
            </p>

            <button
              style={
                orangeButton
              }
              onClick={() =>
                setSelectedEvaluation(
                  null
                )
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  );

}

/* HELPERS */

function MetricCard({
  title,
  value,
}: any) {

  return (
    <div
      style={{
        background:
          "white",
        borderRadius:
          "20px",
        padding:
          "24px",
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
            "36px",
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

function ScoreRow({
  title,
  value,
}: any) {

  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        padding:
          "12px 0",
        borderBottom:
          "1px solid #E5E7EB",
      }}
    >
      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  );

}

const filterStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #E5E7EB",
};

const orangeButton = {
  background: "#F97316",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 700,
};

const grayButton = {
  background: "#E5E7EB",
  color: "#334155",
  border: "none",
  padding: "12px 18px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 600,
};

const dangerButton = {
  background: "#DC2626",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: 600,
};