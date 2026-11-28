import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import {
  collectSchoolOverviewClassSections,
  projectSchoolOverviewCardDetailByClassSection,
  SCHOOL_OVERVIEW_ALL_CLASS_SECTION,
  schoolOverviewClassSectionKey,
} from "../analytics/SchoolOverviewCardDetailEngine";
import type {
  SchoolOverviewCardDetailSnapshot,
  SchoolOverviewCardKey,
} from "../types/SchoolOverviewCardDetailModels";

const TITLES: Record<SchoolOverviewCardKey, string> = {
  understanding: "Understanding Detail",
  activeDoubts: "Active Doubts Detail",
  doubtClosure: "Doubt Closure Detail",
  responses: "Student Responses Detail",
  topicsTaught: "Topics Taught Detail",
  activeTeachers: "Active Teachers Detail",
  classesReporting: "Classes Reporting Detail",
  students: "Students Detail",
};

const EXPLANATIONS: Record<SchoolOverviewCardKey, string> = {
  understanding:
    "The card remains the existing canonical school-level understanding percentage: complete-understanding student observations divided by eligible student observations. The evidence is grouped first by class and section, then by subject and teacher, with the student-level observations behind each subject. Health contribution is shown separately so the 50% value of Partial understanding is never confused with the full-understanding percentage.",
  activeDoubts:
    "This card remains the existing unresolved-doubt count after the same canonical Live / Loop 2 resolution classifier. Only unresolved records are shown here, with the exact student, classroom, teacher, topic, subtopic and raised date.",
  doubtClosure:
    "The card remains the existing canonical closure calculation: resolved doubts divided by all raised doubts in the selected period. Every doubt record is listed below so resolved and unresolved evidence can be verified directly.",
  responses:
    "The card remains the existing response count. The detail shows actual submitted learning responses by day, then class, section and subject. Absent feedback is not presented as a submitted learning response; it remains part of the existing card calculation exactly as before.",
  topicsTaught:
    "The card remains the existing published Daily Log count. The evidence is grouped first by class and section, then by subject and teacher, with every published log showing its date, topic and recorded concepts/subtopics exactly from the Daily Log.",
  activeTeachers:
    "The card remains the existing active-teacher count. Each teacher is shown with every active class, section and subject assignment, expected Daily Logs, submitted logs, missed logs and a deterministic rank by the same canonical class-health calculation used by School Intelligence.",
  classesReporting:
    "The card remains the existing class/section reporting count: unique class and section pairs represented by published Daily Logs in the selected period. The list below is the evidence behind that count.",
  students:
    "The card remains the existing school student count. Students are grouped by their class and section using the school-scoped student roster already used by School Intelligence.",
};


function periodLabel(detail: SchoolOverviewCardDetailSnapshot) {
  return `${detail.period.startDate} → ${detail.period.endDate}`;
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      className="school-overview-detail-close"
      onClick={onClose}
      aria-label="Close detail popup"
    >
      ×
    </button>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="school-overview-detail-empty">{text}</div>;
}

function SectionHead({ title, count }: { title: string; count?: string }) {
  return (
    <div className="school-overview-detail-section-head">
      <h4>{title}</h4>
      {count ? <span>{count}</span> : null}
    </div>
  );
}

function UnderstandingDetail({ detail }: { detail: SchoolOverviewCardDetailSnapshot }) {
  const value = detail.understanding;
  const subjectCount = value.classGroups.reduce((sum, group) => sum + group.subjects.length, 0);
  return (
    <>
      <div className="school-overview-detail-summary-grid">
        <span>Card understanding <b>{value.cardValue}%</b></span>
        <span>Class / section groups <b>{value.classSectionCount}</b></span>
        <span>Subject groups <b>{subjectCount}</b></span>
        <span>Eligible observations <b>{value.eligibleStudentObservations}</b></span>
        <span>Full understanding <b>{value.completeStudentObservations}</b></span>
        <span>Partial understanding <b>{value.partialStudentObservations}</b></span>
        <span>Did not understand <b>{value.didntUnderstandStudentObservations}</b></span>
      </div>

      {!value.classGroups.length && <Empty text="No active class / section teaching groups were found for the selected period." />}

      <div className="school-overview-detail-understanding-class-list">
        {value.classGroups.map(classGroup => (
          <section
            className="school-overview-detail-understanding-class"
            key={JSON.stringify([classGroup.className, classGroup.sectionName])}
          >
            <div className="school-overview-detail-understanding-class-head">
              <div>
                <strong>Class {classGroup.className} · Section {classGroup.sectionName}</strong>
                <span>{classGroup.subjects.length} subject{classGroup.subjects.length === 1 ? "" : "s"} · {classGroup.logsCount} published log{classGroup.logsCount === 1 ? "" : "s"}</span>
              </div>
              <b>{classGroup.understandingRate}%</b>
            </div>

            <div className="school-overview-detail-understanding-stats">
              <span>Eligible <b>{classGroup.eligibleStudentObservations}</b></span>
              <span>Complete <b>{classGroup.completeStudentObservations}</b></span>
              <span>Partial <b>{classGroup.partialStudentObservations}</b></span>
              <span>DNU <b>{classGroup.didntUnderstandStudentObservations}</b></span>
              <span>Health <b>{classGroup.healthPercentage}%</b></span>
            </div>

            <div className="school-overview-detail-understanding-subject-list">
              {classGroup.subjects.map(subject => (
                <section
                  className="school-overview-detail-understanding-subject"
                  key={JSON.stringify([classGroup.className, classGroup.sectionName, subject.subjectName])}
                >
                  <div className="school-overview-detail-understanding-subject-head">
                    <div>
                      <strong>{subject.subjectName}</strong>
                      <span>
                        {subject.teacherNames.length
                          ? `Teacher${subject.teacherNames.length === 1 ? "" : "s"}: ${subject.teacherNames.join(" · ")}`
                          : "Teacher not recorded"}
                        {subject.logsCount ? ` · ${subject.logsCount} published log${subject.logsCount === 1 ? "" : "s"}` : " · No published logs"}
                      </span>
                    </div>
                    <b>{subject.understandingRate}%</b>
                  </div>

                  <div className="school-overview-detail-understanding-stats subject">
                    <span>Eligible <b>{subject.eligibleStudentObservations}</b></span>
                    <span>Complete <b>{subject.completeStudentObservations}</b></span>
                    <span>Partial <b>{subject.partialStudentObservations}</b></span>
                    <span>DNU <b>{subject.didntUnderstandStudentObservations}</b></span>
                    <span>Health <b>{subject.healthPercentage}%</b></span>
                  </div>

                  <div className="school-overview-detail-students">
                    {subject.students.map(student => (
                      <div className="school-overview-detail-student-row" key={student.studentUuid}>
                        <div className="school-overview-detail-student-main">
                          <strong>{student.studentName}</strong>
                          <span>{student.eligibleObservations} eligible · {student.responseObservations} responses</span>
                        </div>
                        <div className="school-overview-detail-student-metrics">
                          <span>Full {student.fullUnderstandingRate}%</span>
                          <span>Health contribution {student.healthContributionRate}%</span>
                          <span>P {student.partialObservations} · DNU {student.didntUnderstandObservations}</span>
                        </div>
                      </div>
                    ))}
                    {!subject.students.length && <Empty text="No students are in this class / section subject roster." />}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function DoubtRows({ rows }: { rows: SchoolOverviewCardDetailSnapshot["activeDoubts"] }) {
  if (!rows.length) return <Empty text="No matching doubt records were recorded for the selected period." />;
  return (
    <div className="school-overview-detail-list">
      {rows.map(row => (
        <article className="school-overview-detail-doubt" key={`${row.id}-${row.studentUuid}`}>
          <div className="school-overview-detail-card-head">
            <div>
              <strong>{row.studentName}</strong>
              <span>{row.className} · Section {row.sectionName} · {row.subjectName} · Teacher: {row.teacherName}</span>
            </div>
            <b className={row.resolved ? "good" : "attention"}>{row.status}</b>
          </div>
          <div className="school-overview-detail-doubt-topic"><strong>Topic:</strong> {row.topic}</div>
          <div className="school-overview-detail-doubt-topic"><strong>Subtopic / concept:</strong> {row.subtopic}</div>
          <div className="school-overview-detail-doubt-meta">Raised: {row.raisedDate} · Student response: {row.studentResponse}</div>
        </article>
      ))}
    </div>
  );
}

function DoubtGroupRows({
  groups,
  mode,
}: {
  groups: SchoolOverviewCardDetailSnapshot["activeDoubtGroups"];
  mode: "active" | "closure";
}) {
  if (!groups.length) {
    return <Empty text="No matching doubt records were recorded for the selected period." />;
  }

  return (
    <div className="school-overview-detail-doubt-class-list">
      {groups.map(classGroup => {
        const closureRate = classGroup.doubtCount
          ? Math.round((classGroup.resolvedCount / classGroup.doubtCount) * 100)
          : 0;

        return (
          <section
            className="school-overview-detail-doubt-class"
            key={JSON.stringify([classGroup.className, classGroup.sectionName])}
          >
            <div className="school-overview-detail-doubt-class-head">
              <div>
                <strong>Class {classGroup.className} · Section {classGroup.sectionName}</strong>
                <span>
                  {mode === "active"
                    ? `${classGroup.doubtCount} active doubt${classGroup.doubtCount === 1 ? "" : "s"}`
                    : `${classGroup.doubtCount} raised doubt${classGroup.doubtCount === 1 ? "" : "s"}`}
                </span>
              </div>
              <b>{classGroup.doubtCount}</b>
            </div>

            <div className="school-overview-detail-doubt-stats">
              {mode === "active" ? (
                <>
                  <span>Active doubts <b>{classGroup.unresolvedCount}</b></span>
                  <span>Subjects with active doubts <b>{classGroup.subjects.length}</b></span>
                </>
              ) : (
                <>
                  <span>Total raised <b>{classGroup.doubtCount}</b></span>
                  <span>Resolved <b>{classGroup.resolvedCount}</b></span>
                  <span>Unresolved <b>{classGroup.unresolvedCount}</b></span>
                  <span>Closure rate <b>{closureRate}%</b></span>
                </>
              )}
            </div>

            <div className="school-overview-detail-doubt-subject-list">
              {classGroup.subjects.map(subjectGroup => {
                const subjectClosureRate = subjectGroup.doubtCount
                  ? Math.round((subjectGroup.resolvedCount / subjectGroup.doubtCount) * 100)
                  : 0;

                return (
                  <section
                    className="school-overview-detail-doubt-subject"
                    key={JSON.stringify([classGroup.className, classGroup.sectionName, subjectGroup.subjectName])}
                  >
                    <div className="school-overview-detail-doubt-subject-head">
                      <div>
                        <strong>{subjectGroup.subjectName}</strong>
                        <span>
                          {subjectGroup.teacherNames.length
                            ? `Teacher${subjectGroup.teacherNames.length === 1 ? "" : "s"}: ${subjectGroup.teacherNames.join(" · ")}`
                            : "Teacher not recorded"}
                        </span>
                      </div>
                      <b>
                        {subjectGroup.doubtCount} {mode === "active" ? "active" : "raised"}
                      </b>
                    </div>

                    <div className="school-overview-detail-doubt-stats subject">
                      {mode === "active" ? (
                        <span>Pending doubts <b>{subjectGroup.unresolvedCount}</b></span>
                      ) : (
                        <>
                          <span>Total <b>{subjectGroup.doubtCount}</b></span>
                          <span>Resolved <b>{subjectGroup.resolvedCount}</b></span>
                          <span>Unresolved <b>{subjectGroup.unresolvedCount}</b></span>
                          <span>Closure <b>{subjectClosureRate}%</b></span>
                        </>
                      )}
                    </div>

                    <DoubtRows rows={subjectGroup.rows} />
                  </section>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ActiveDoubtTeacherTable({ detail }: { detail: SchoolOverviewCardDetailSnapshot }) {
  return (
    <section className="school-overview-detail-teacher-table-section">
      <SectionHead title="Teacher-wise Active Doubts" count={`${detail.activeDoubtTeacherRows.length} teachers`} />
      {!detail.activeDoubtTeacherRows.length ? (
        <Empty text="No active doubts were recorded for the selected period." />
      ) : (
        <div className="school-overview-detail-teacher-table-wrap">
          <table className="school-overview-detail-teacher-table">
            <thead>
              <tr>
                <th>Teacher name</th>
                <th>Total active doubts</th>
                <th>Class · Section · Subject · Doubts</th>
              </tr>
            </thead>
            <tbody>
              {detail.activeDoubtTeacherRows.map((row, index) => (
                <tr key={`${row.teacherName}-${index}`}>
                  <td data-label="Teacher name"><strong>{row.teacherName}</strong></td>
                  <td data-label="Total active doubts"><b>{row.activeDoubtCount}</b></td>
                  <td data-label="Class · Section · Subject · Doubts">
                    <div className="school-overview-detail-teacher-breakdown">
                      {row.breakdown.map(item => (
                        <span key={`${item.className}|${item.sectionName}|${item.subjectName}`}>
                          Class {item.className} · {item.sectionName} · {item.subjectName} · <b>{item.doubtCount}</b>
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function DoubtClosureTeacherTable({ detail }: { detail: SchoolOverviewCardDetailSnapshot }) {
  return (
    <section className="school-overview-detail-teacher-table-section">
      <SectionHead title="Teacher-wise Doubt Closure" count={`${detail.doubtClosureTeacherRows.length} teachers`} />
      {!detail.doubtClosureTeacherRows.length ? (
        <Empty text="No doubts were recorded for the selected period." />
      ) : (
        <div className="school-overview-detail-teacher-table-wrap">
          <table className="school-overview-detail-teacher-table school-overview-detail-closure-table">
            <thead>
              <tr>
                <th>Teacher name</th>
                <th>Total doubts asked</th>
                <th>Total doubts resolved</th>
                <th>Total doubts remaining</th>
                <th>Doubt closure</th>
                <th>Remaining · Class · Section · Subject · Doubts</th>
              </tr>
            </thead>
            <tbody>
              {detail.doubtClosureTeacherRows.map((row, index) => {
                const totalAsked = row.resolvedDoubtCount + row.remainingDoubtCount;
                const closureRate = totalAsked ? Math.round((row.resolvedDoubtCount / totalAsked) * 100) : 0;
                return (
                  <tr key={`${row.teacherName}-${index}`}>
                    <td data-label="Teacher name"><strong>{row.teacherName}</strong></td>
                    <td data-label="Total doubts asked"><b>{totalAsked}</b></td>
                    <td data-label="Total doubts resolved"><b>{row.resolvedDoubtCount}</b></td>
                    <td data-label="Total doubts remaining"><b>{row.remainingDoubtCount}</b></td>
                    <td data-label="Doubt closure"><b>{closureRate}%</b></td>
                    <td data-label="Remaining · Class · Section · Subject · Doubts">
                      <div className="school-overview-detail-teacher-breakdown">
                        {row.remainingBreakdown.length ? row.remainingBreakdown.map(item => (
                          <span key={JSON.stringify([item.className, item.sectionName, item.subjectName])}>
                            Class {item.className} · {item.sectionName} · {item.subjectName} · <b>{item.doubtCount}</b>
                          </span>
                        )) : (
                          <span>No remaining doubts</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ActiveDoubtsDetail({ detail }: { detail: SchoolOverviewCardDetailSnapshot }) {
  if (detail.doubtsLoadFailed) {
    return <Empty text="Pending-doubt data could not be retrieved. Active Doubts is unavailable, not zero. Refresh and retry." />;
  }
  return (
    <>
      <ActiveDoubtTeacherTable detail={detail} />
      <div className="school-overview-detail-summary-grid compact">
        <span>School active doubts <b>{detail.activeDoubts.length}</b></span>
        <span>Class / section groups <b>{detail.activeDoubtGroups.length}</b></span>
      </div>
      <DoubtGroupRows groups={detail.activeDoubtGroups} mode="active" />
    </>
  );
}

function DoubtClosureDetail({ detail }: { detail: SchoolOverviewCardDetailSnapshot }) {
  if (detail.doubtsLoadFailed) {
    return <Empty text="Pending-doubt data could not be retrieved. Doubt Closure is unavailable, not zero. Refresh and retry." />;
  }
  const resolved = detail.doubtClosure.filter(row => row.resolved).length;
  return (
    <>
      <DoubtClosureTeacherTable detail={detail} />
      <div className="school-overview-detail-summary-grid">
        <span>Total raised <b>{detail.doubtClosure.length}</b></span>
        <span>Resolved <b>{resolved}</b></span>
        <span>Unresolved <b>{detail.doubtClosure.length - resolved}</b></span>
        <span>Closure rate <b>{detail.doubtClosure.length ? Math.round((resolved / detail.doubtClosure.length) * 100) : 0}%</b></span>
      </div>
      <DoubtGroupRows groups={detail.doubtClosureGroups} mode="closure" />
    </>
  );
}

function ResponsesDetail({
  detail,
  classSectionFiltered,
}: {
  detail: SchoolOverviewCardDetailSnapshot;
  classSectionFiltered: boolean;
}) {
  if (!detail.responses.days.length && !classSectionFiltered) {
    return <Empty text="No submitted learning responses were recorded for the selected period." />;
  }
  return (
    <>
      <div className="school-overview-detail-summary-grid compact">
        <span>Card response total <b>{detail.responses.cardValue}</b></span>
        <span>Submitted learning responses <b>{detail.responses.submittedLearningResponses}</b></span>
        <span>Absent records in card total <b>{detail.responses.absentFeedbackObservations}</b></span>
        <span>Period days with responses <b>{detail.responses.days.length}</b></span>
      </div>
      {!detail.responses.days.length ? (
        <Empty text="No submitted learning responses were recorded for the selected period. Absent records remain included in the card total above." />
      ) : (
        <div className="school-overview-detail-list">
          {detail.responses.days.map(day => (
            <section className="school-overview-detail-day" key={day.date}>
              <SectionHead title={day.day} count={day.date} />
              {day.groups.map(group => (
                <div className="school-overview-detail-group" key={`${day.date}|${group.assignmentUuid}|${group.className}|${group.sectionName}|${group.subjectName}`}>
                  <div className="school-overview-detail-group-head">
                    <strong>Class {group.className} · Section {group.sectionName} · {group.subjectName}</strong>
                    <span>{group.teacherNames.join(" · ")}</span>
                  </div>
                  <div className="school-overview-detail-response-students">
                    {group.students.map((student, index) => (
                      <span key={`${student.studentUuid}-${index}`}><b>{student.studentName}</b> — {student.response}</span>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function TopicsDetail({ detail }: { detail: SchoolOverviewCardDetailSnapshot }) {
  const groups = detail.topicClassGroups;
  const subjectCount = groups.reduce((sum, group) => sum + group.subjects.length, 0);
  const logCount = groups.reduce((sum, group) => sum + group.logsCount, 0);
  if (!groups.length) {
    return <Empty text="No published Daily Logs were recorded for the selected period." />;
  }

  return (
    <>
      <div className="school-overview-detail-summary-grid compact">
        <span>Published logs <b>{logCount}</b></span>
        <span>Class / section groups <b>{detail.topicClassSectionCount}</b></span>
        <span>Subject groups <b>{subjectCount}</b></span>
        <span>Period days represented <b>{new Set(groups.flatMap(group => group.subjects.flatMap(subject => subject.logs.map(log => log.date)))).size}</b></span>
      </div>

      <div className="school-overview-detail-topic-class-list">
        {groups.map(classGroup => (
          <section
            className="school-overview-detail-topic-class"
            key={JSON.stringify([classGroup.className, classGroup.sectionName])}
          >
            <div className="school-overview-detail-topic-class-head">
              <div>
                <strong>Class {classGroup.className} · Section {classGroup.sectionName}</strong>
                <span>{classGroup.subjects.length} subject{classGroup.subjects.length === 1 ? "" : "s"} · {classGroup.logsCount} published log{classGroup.logsCount === 1 ? "" : "s"}</span>
              </div>
              <b>{classGroup.logsCount}</b>
            </div>

            <div className="school-overview-detail-topic-subject-list">
              {classGroup.subjects.map(subject => (
                <section
                  className="school-overview-detail-topic-subject"
                  key={JSON.stringify([classGroup.className, classGroup.sectionName, subject.subjectName])}
                >
                  <div className="school-overview-detail-topic-subject-head">
                    <div>
                      <strong>{subject.subjectName}</strong>
                      <span>
                        {subject.teacherNames.length
                          ? `Teacher${subject.teacherNames.length === 1 ? "" : "s"}: ${subject.teacherNames.join(" · ")}`
                          : "Teacher not recorded"}
                      </span>
                    </div>
                    <b>{subject.logsCount} log{subject.logsCount === 1 ? "" : "s"}</b>
                  </div>

                  <div className="school-overview-detail-topic-log-list">
                    {subject.logs.map(log => (
                      <div className="school-overview-detail-topic-log" key={log.logId}>
                        <div className="school-overview-detail-topic-log-head">
                          <strong>{log.topic}</strong>
                          <span>{log.date} · {log.day}</span>
                        </div>
                        <span className="school-overview-detail-topic-log-teacher">Teacher: {log.teacherName}</span>
                        <span className="school-overview-detail-topic-log-subtopics">
                          {log.subtopics.length ? log.subtopics.join(" · ") : "No subtopics / concepts recorded"}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function TeachersDetail({ detail }: { detail: SchoolOverviewCardDetailSnapshot }) {
  if (!detail.activeTeachers.length) {
    return <Empty text="No active teachers were found in the school roster." />;
  }
  return (
    <div className="school-overview-detail-list">
      {detail.activeTeachers.map(row => (
        <article className="school-overview-detail-card" key={row.teacherUuid}>
          <div className="school-overview-detail-card-head">
            <div>
              <strong>{row.teacherName}</strong>
              <span>{row.assignments.length} active class / section / subject assignment{row.assignments.length === 1 ? "" : "s"}</span>
            </div>
            <b>{row.rank ? `Rank #${row.rank}` : "No health rank"}</b>
          </div>
          <div className="school-overview-detail-assignment-tags">
            {row.assignments.map(assignment => (
              <span key={assignment.assignmentUuid}>Class {assignment.className} · {assignment.sectionName} · {assignment.subjectName}</span>
            ))}
          </div>
          <div className="school-overview-detail-summary-grid compact">
            <span>Expected logs <b>{row.expectedLogs}</b></span>
            <span>Submitted <b>{row.submittedLogs}</b></span>
            <span>Missed <b>{row.missedLogs}</b></span>
            <span>Class health <b>{row.classHealthPercentage === null ? "—" : `${row.classHealthPercentage}%`}</b></span>
          </div>
        </article>
      ))}
    </div>
  );
}

function ClassesDetail({ detail }: { detail: SchoolOverviewCardDetailSnapshot }) {
  if (!detail.classesReporting.length) {
    return <Empty text="No class / section has a published Daily Log in the selected period." />;
  }
  return (
    <div className="school-overview-detail-class-grid">
      {detail.classesReporting.map(row => (
        <div className="school-overview-detail-class-chip" key={`${row.className}|${row.sectionName}`}>
          <strong>Class {row.className}</strong>
          <span>Section {row.sectionName}</span>
        </div>
      ))}
    </div>
  );
}

function StudentsDetail({ detail }: { detail: SchoolOverviewCardDetailSnapshot }) {
  if (!detail.students.length) {
    return <Empty text="No students are present in the school-scoped roster." />;
  }
  return (
    <div className="school-overview-detail-list">
      {detail.students.map(group => (
        <section className="school-overview-detail-day" key={`${group.className}|${group.sectionName}`}>
          <SectionHead title={`Class ${group.className} · Section ${group.sectionName}`} count={`${group.students.length} students`} />
          <div className="school-overview-detail-name-grid">
            {group.students.map(student => <span key={student.studentUuid}>{student.studentName}</span>)}
          </div>
        </section>
      ))}
    </div>
  );
}


function ClassSectionFilter({
  options,
  value,
  onChange,
}: {
  options: ReturnType<typeof collectSchoolOverviewClassSections>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="school-overview-detail-scope-filter">
      <div>
        <strong>Class & Section</strong>
        <span>Select a class and section to view only that card's data.</span>
      </div>
      <select
        className="school-overview-detail-scope-select"
        aria-label="Filter school overview detail by class and section"
        value={value}
        onChange={event => onChange(event.target.value)}
      >
        <option value={SCHOOL_OVERVIEW_ALL_CLASS_SECTION}>All Classes & Sections</option>
        {options.map(option => (
          <option key={schoolOverviewClassSectionKey(option.className, option.sectionName)} value={schoolOverviewClassSectionKey(option.className, option.sectionName)}>
            Class {option.className} · Section {option.sectionName}
          </option>
        ))}
      </select>
    </div>
  );
}

function Content({
  card,
  detail,
  classSectionFiltered,
}: {
  card: SchoolOverviewCardKey;
  detail: SchoolOverviewCardDetailSnapshot;
  classSectionFiltered: boolean;
}) {
  switch (card) {
    case "understanding": return <UnderstandingDetail detail={detail} />;
    case "activeDoubts": return <ActiveDoubtsDetail detail={detail} />;
    case "doubtClosure": return <DoubtClosureDetail detail={detail} />;
    case "responses": return <ResponsesDetail detail={detail} classSectionFiltered={classSectionFiltered} />;
    case "topicsTaught": return <TopicsDetail detail={detail} />;
    case "activeTeachers": return <TeachersDetail detail={detail} />;
    case "classesReporting": return <ClassesDetail detail={detail} />;
    case "students": return <StudentsDetail detail={detail} />;
  }
}

const CSS = `
.school-overview-detail-overlay{position:fixed;inset:0;z-index:10002;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(15,23,42,.34);backdrop-filter:blur(2px)}
.school-overview-detail-modal{width:min(1040px,100%);max-height:min(92vh,900px);display:flex;flex-direction:column;overflow:hidden;background:#FFF;border:1px solid #E2E8F0;border-radius:24px;box-shadow:0 22px 60px rgba(15,23,42,.24)}
.school-overview-detail-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:24px 28px 17px;border-bottom:1px solid #EEF2F7;background:#FFF}
.school-overview-detail-kicker{margin:0 0 5px;color:#EA580C;font-size:11px;font-weight:950;letter-spacing:1.1px}
.school-overview-detail-head h3{margin:0;color:#07142D;font-size:28px;line-height:1.18;font-weight:950}
.school-overview-detail-head p{margin:5px 0 0;color:#64748B;font-size:13px;line-height:1.4;font-weight:750}
.school-overview-detail-close{flex:0 0 auto;width:40px;height:40px;border:1px solid #E2E8F0;border-radius:50%;background:#FFF;color:#0F172A;font-size:25px;line-height:1;cursor:pointer}
.school-overview-detail-body{min-height:0;overflow-y:auto;padding:16px}
.school-overview-detail-explanation{padding:13px 14px;border:1px solid #FED7AA;background:#FFF7ED;border-radius:12px;margin-bottom:12px}
.school-overview-detail-explanation strong{display:block;color:#9A3412;font-size:12px;font-weight:950}
.school-overview-detail-explanation p{margin:5px 0 0;color:#64748B;font-size:11px;line-height:1.55;font-weight:650}
.school-overview-detail-summary-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin-bottom:12px}
.school-overview-detail-summary-grid.compact{grid-template-columns:repeat(4,minmax(0,1fr));margin:9px 0 0}
.school-overview-detail-summary-grid span{padding:9px;border:1px solid #E2E8F0;border-radius:9px;background:#FCFCFB;color:#64748B;font-size:10px;font-weight:800}
.school-overview-detail-summary-grid b{display:block;margin-top:3px;color:#0F172A;font-size:15px}
.school-overview-detail-card{padding:12px;border:1px solid #E2E8F0;background:#FCFCFB;border-radius:12px;margin-bottom:9px}
.school-overview-detail-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.school-overview-detail-card-head strong{display:block;color:#0F172A;font-size:12px;line-height:1.4;font-weight:950}
.school-overview-detail-card-head span{display:block;margin-top:3px;color:#64748B;font-size:10px;font-weight:750;line-height:1.4}
.school-overview-detail-card-head>b{color:#0F172A;font-size:20px;font-weight:950;white-space:nowrap}
.school-overview-detail-mini-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin:9px 0}
.school-overview-detail-mini-grid span{padding:7px;border:1px solid #E2E8F0;border-radius:7px;background:#FFF;color:#64748B;font-size:9.5px;font-weight:750}
.school-overview-detail-mini-grid b{color:#0F172A}
.school-overview-detail-student-row{padding:9px 10px;border:1px solid #E2E8F0;border-radius:9px;background:#FFF;margin-top:6px}
.school-overview-detail-student-main{display:flex;justify-content:space-between;gap:10px;align-items:center}
.school-overview-detail-student-main strong{color:#0F172A;font-size:11px;font-weight:950}
.school-overview-detail-student-main span{color:#64748B;font-size:9.5px;font-weight:700}
.school-overview-detail-student-metrics{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
.school-overview-detail-student-metrics span{padding:4px 6px;border:1px solid #E2E8F0;border-radius:999px;background:#F8FAFC;color:#475569;font-size:9px;font-weight:800}
.school-overview-detail-list{display:grid;gap:9px}
.school-overview-detail-doubt{padding:12px;border:1px solid #E2E8F0;border-radius:11px;background:#FFF}
.school-overview-detail-doubt .school-overview-detail-card-head>b{padding:4px 7px;border-radius:999px;font-size:9px}
.school-overview-detail-doubt .school-overview-detail-card-head>b.good{color:#15803D;background:#DCFCE7;border:1px solid #BBF7D0}
.school-overview-detail-doubt .school-overview-detail-card-head>b.attention{color:#C2410C;background:#FFEDD5;border:1px solid #FED7AA}
.school-overview-detail-doubt-topic{margin-top:7px;color:#334155;font-size:10.5px;line-height:1.45;font-weight:700}
.school-overview-detail-doubt-meta{margin-top:7px;color:#64748B;font-size:9.5px;line-height:1.45;font-weight:700}
.school-overview-detail-day{padding:11px;border:1px solid #E2E8F0;border-radius:12px;background:#FFF}
.school-overview-detail-section-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
.school-overview-detail-section-head h4{margin:0;color:#0F172A;font-size:12px;font-weight:950}
.school-overview-detail-section-head span{color:#64748B;font-size:9.5px;font-weight:800}
.school-overview-detail-group{padding:9px;border:1px solid #EEF2F7;border-radius:9px;background:#FCFCFB;margin-top:6px}
.school-overview-detail-group-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.school-overview-detail-group-head strong{color:#334155;font-size:10.5px;font-weight:950;line-height:1.4}
.school-overview-detail-group-head span{color:#64748B;font-size:9.5px;font-weight:700}
.school-overview-detail-response-students{display:grid;gap:4px;margin-top:6px}
.school-overview-detail-response-students span{color:#475569;font-size:9.5px;line-height:1.45}
.school-overview-detail-topic-row{margin-top:6px;padding:8px;border:1px solid #E2E8F0;border-radius:8px;background:#FFF}
.school-overview-detail-topic-row strong{display:block;color:#0F172A;font-size:10.5px;font-weight:950}
.school-overview-detail-topic-row span{display:block;margin-top:3px;color:#64748B;font-size:9.5px;line-height:1.45;font-weight:700}
.school-overview-detail-assignment-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
.school-overview-detail-assignment-tags span{padding:5px 7px;border:1px solid #D8E0EA;border-radius:999px;background:#FFF;color:#475569;font-size:9.5px;font-weight:800}
.school-overview-detail-class-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.school-overview-detail-class-chip{padding:12px;border:1px solid #E2E8F0;border-radius:10px;background:#FCFCFB}
.school-overview-detail-class-chip strong{display:block;color:#0F172A;font-size:12px;font-weight:950}
.school-overview-detail-class-chip span{display:block;margin-top:4px;color:#64748B;font-size:10px;font-weight:750}
.school-overview-detail-name-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.school-overview-detail-name-grid span{padding:8px 9px;border:1px solid #E2E8F0;border-radius:8px;background:#FFF;color:#334155;font-size:9.5px;font-weight:750}
.school-overview-detail-empty{padding:12px;border:1px dashed #CBD5E1;border-radius:10px;color:#64748B;background:#FCFCFB;font-size:10.5px;line-height:1.5;font-weight:750}
.school-overview-detail-understanding-class-list{display:grid;gap:12px}
.school-overview-detail-understanding-class{padding:13px;border:1px solid #CBD5E1;border-radius:14px;background:#F8FAFC}
.school-overview-detail-understanding-class-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.school-overview-detail-understanding-class-head strong{display:block;color:#0F172A;font-size:14px;line-height:1.4;font-weight:950}
.school-overview-detail-understanding-class-head span{display:block;margin-top:3px;color:#64748B;font-size:10.5px;line-height:1.4;font-weight:750}
.school-overview-detail-understanding-class-head>b{color:#0F172A;font-size:22px;font-weight:950;white-space:nowrap}
.school-overview-detail-understanding-stats{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin-top:9px}
.school-overview-detail-understanding-stats span{padding:7px 8px;border:1px solid #E2E8F0;border-radius:8px;background:#FFF;color:#64748B;font-size:9.5px;font-weight:800}
.school-overview-detail-understanding-stats b{display:block;margin-top:2px;color:#0F172A;font-size:13px}
.school-overview-detail-understanding-stats.subject{grid-template-columns:repeat(5,minmax(0,1fr))}
.school-overview-detail-understanding-subject-list{display:grid;gap:9px;margin-top:10px;padding-left:10px;border-left:3px solid #E2E8F0}
.school-overview-detail-understanding-subject{padding:10px;border:1px solid #DDE5EE;border-radius:11px;background:#FFF}
.school-overview-detail-understanding-subject-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.school-overview-detail-understanding-subject-head strong{display:block;color:#1E293B;font-size:12px;line-height:1.4;font-weight:950}
.school-overview-detail-understanding-subject-head span{display:block;margin-top:3px;color:#64748B;font-size:9.5px;line-height:1.4;font-weight:750}
.school-overview-detail-understanding-subject-head>b{color:#0F172A;font-size:15px;font-weight:950;white-space:nowrap}
.school-overview-detail-topic-class-list{display:grid;gap:12px}
.school-overview-detail-topic-class{padding:13px;border:1px solid #CBD5E1;border-radius:14px;background:#F8FAFC}
.school-overview-detail-topic-class-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.school-overview-detail-topic-class-head strong{display:block;color:#0F172A;font-size:14px;line-height:1.4;font-weight:950}
.school-overview-detail-topic-class-head span{display:block;margin-top:3px;color:#64748B;font-size:10.5px;line-height:1.4;font-weight:750}
.school-overview-detail-topic-class-head>b{color:#0F172A;font-size:22px;font-weight:950;white-space:nowrap}
.school-overview-detail-topic-subject-list{display:grid;gap:9px;margin-top:10px;padding-left:10px;border-left:3px solid #E2E8F0}
.school-overview-detail-topic-subject{padding:10px;border:1px solid #DDE5EE;border-radius:11px;background:#FFF}
.school-overview-detail-topic-subject-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.school-overview-detail-topic-subject-head strong{display:block;color:#1E293B;font-size:12px;line-height:1.4;font-weight:950}
.school-overview-detail-topic-subject-head span{display:block;margin-top:3px;color:#64748B;font-size:9.5px;line-height:1.4;font-weight:750}
.school-overview-detail-topic-subject-head>b{color:#0F172A;font-size:15px;font-weight:950;white-space:nowrap}
.school-overview-detail-topic-log-list{display:grid;gap:6px;margin-top:8px}
.school-overview-detail-topic-log{padding:8px;border:1px solid #E2E8F0;border-radius:8px;background:#FCFCFB}
.school-overview-detail-topic-log-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.school-overview-detail-topic-log-head strong{color:#0F172A;font-size:10.5px;line-height:1.4;font-weight:950}
.school-overview-detail-topic-log-head span{color:#64748B;font-size:9px;line-height:1.4;font-weight:800;white-space:nowrap}
.school-overview-detail-topic-log-teacher{display:block;margin-top:4px;color:#475569;font-size:9px;line-height:1.4;font-weight:750}
.school-overview-detail-topic-log-subtopics{display:block;margin-top:4px;color:#64748B;font-size:9px;line-height:1.45;font-weight:700}
.school-overview-detail-doubt-class-list{display:grid;gap:12px}
.school-overview-detail-doubt-class{padding:13px;border:1px solid #CBD5E1;border-radius:14px;background:#F8FAFC}
.school-overview-detail-doubt-class-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.school-overview-detail-doubt-class-head strong{display:block;color:#0F172A;font-size:14px;line-height:1.4;font-weight:950}
.school-overview-detail-doubt-class-head span{display:block;margin-top:3px;color:#64748B;font-size:10.5px;line-height:1.4;font-weight:750}
.school-overview-detail-doubt-class-head>b{color:#0F172A;font-size:22px;font-weight:950;white-space:nowrap}
.school-overview-detail-doubt-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:9px}
.school-overview-detail-doubt-stats span{padding:7px 8px;border:1px solid #E2E8F0;border-radius:8px;background:#FFF;color:#64748B;font-size:9.5px;font-weight:800}
.school-overview-detail-doubt-stats b{display:block;margin-top:2px;color:#0F172A;font-size:13px}
.school-overview-detail-doubt-stats.subject{grid-template-columns:repeat(4,minmax(0,1fr))}
.school-overview-detail-doubt-subject-list{display:grid;gap:9px;margin-top:10px;padding-left:10px;border-left:3px solid #E2E8F0}
.school-overview-detail-doubt-subject{padding:10px;border:1px solid #DDE5EE;border-radius:11px;background:#FFF}
.school-overview-detail-doubt-subject-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.school-overview-detail-doubt-subject-head strong{display:block;color:#1E293B;font-size:12px;line-height:1.4;font-weight:950}
.school-overview-detail-doubt-subject-head span{display:block;margin-top:3px;color:#64748B;font-size:9.5px;line-height:1.4;font-weight:750}
.school-overview-detail-doubt-subject-head>b{color:#0F172A;font-size:15px;font-weight:950;white-space:nowrap}
.school-overview-detail-doubt-subject .school-overview-detail-list{margin-top:8px}

.school-overview-detail-teacher-table-section{margin-bottom:12px;padding:12px;border:1px solid #CBD5E1;border-radius:14px;background:#F8FAFC}
.school-overview-detail-teacher-table-wrap{width:100%;overflow-x:auto;border:1px solid #E2E8F0;border-radius:10px;background:#FFF}
.school-overview-detail-teacher-table{width:100%;min-width:680px;border-collapse:collapse;table-layout:fixed}
.school-overview-detail-teacher-table th,.school-overview-detail-teacher-table td{padding:9px 10px;border-bottom:1px solid #EEF2F7;text-align:left;vertical-align:top}
.school-overview-detail-teacher-table th{color:#475569;background:#F8FAFC;font-size:9.5px;font-weight:950;letter-spacing:.15px}
.school-overview-detail-teacher-table td{color:#334155;font-size:10px;font-weight:700;line-height:1.45}
.school-overview-detail-teacher-table tr:last-child td{border-bottom:0}
.school-overview-detail-teacher-table th:nth-child(1),.school-overview-detail-teacher-table td:nth-child(1){width:25%}
.school-overview-detail-teacher-table th:nth-child(2),.school-overview-detail-teacher-table td:nth-child(2){width:19%;text-align:center}
.school-overview-detail-teacher-table th:nth-child(3),.school-overview-detail-teacher-table td:nth-child(3){width:56%}
.school-overview-detail-teacher-table td strong{color:#0F172A;font-weight:950}
.school-overview-detail-teacher-table td b{color:#0F172A;font-weight:950}
.school-overview-detail-teacher-breakdown{display:flex;flex-wrap:wrap;gap:5px}
.school-overview-detail-teacher-breakdown span{display:inline-block;padding:4px 6px;border:1px solid #E2E8F0;border-radius:7px;background:#FCFCFB;color:#475569;font-size:9px;font-weight:750}
.school-overview-detail-closure-table{min-width:1040px}
.school-overview-detail-closure-table th:nth-child(1),.school-overview-detail-closure-table td:nth-child(1){width:18%}
.school-overview-detail-closure-table th:nth-child(2),.school-overview-detail-closure-table td:nth-child(2),.school-overview-detail-closure-table th:nth-child(3),.school-overview-detail-closure-table td:nth-child(3),.school-overview-detail-closure-table th:nth-child(4),.school-overview-detail-closure-table td:nth-child(4),.school-overview-detail-closure-table th:nth-child(5),.school-overview-detail-closure-table td:nth-child(5){width:12%;text-align:center}
.school-overview-detail-closure-table th:nth-child(6),.school-overview-detail-closure-table td:nth-child(6){width:34%}
.school-overview-detail-scope-filter{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:11px 12px;margin-bottom:12px;border:1px solid #E2E8F0;border-radius:12px;background:#F8FAFC}
.school-overview-detail-scope-filter>div{min-width:0}
.school-overview-detail-scope-filter strong{display:block;color:#0F172A;font-size:11px;font-weight:950}
.school-overview-detail-scope-filter span{display:block;margin-top:3px;color:#64748B;font-size:9.5px;font-weight:700}
.school-overview-detail-scope-select{width:min(340px,100%);min-height:38px;padding:8px 34px 8px 11px;border:1px solid #CBD5E1;border-radius:9px;background:#FFF;color:#0F172A;font-size:11px;font-weight:800;cursor:pointer;outline:none}
.school-overview-detail-scope-select:focus{border-color:#94A3B8;box-shadow:0 0 0 2px rgba(148,163,184,.18)}
@media(max-width:1024px){.school-overview-detail-overlay{padding:10px}.school-overview-detail-modal{width:min(820px,100%);max-height:92vh;border-radius:18px}.school-overview-detail-head{padding:17px 19px 13px}.school-overview-detail-kicker{font-size:10px}.school-overview-detail-head h3{font-size:23px}.school-overview-detail-head p{font-size:11px}.school-overview-detail-body{padding:11px}.school-overview-detail-summary-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.school-overview-detail-summary-grid.compact{grid-template-columns:repeat(2,minmax(0,1fr))}.school-overview-detail-mini-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.school-overview-detail-class-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.school-overview-detail-name-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.school-overview-detail-explanation p{font-size:10.5px}.school-overview-detail-card-head strong{font-size:11.5px}.school-overview-detail-card-head span{font-size:9.5px}.school-overview-detail-card-head>b{font-size:18px}.school-overview-detail-doubt-class-head strong{font-size:13px}.school-overview-detail-doubt-class-head>b{font-size:20px}.school-overview-detail-doubt-stats,.school-overview-detail-doubt-stats.subject{grid-template-columns:repeat(2,minmax(0,1fr))}.school-overview-detail-understanding-stats,.school-overview-detail-understanding-stats.subject{grid-template-columns:repeat(2,minmax(0,1fr))}.school-overview-detail-topic-log-head{display:block}.school-overview-detail-topic-log-head span{display:block;margin-top:3px}}
@media(max-width:600px){.school-overview-detail-scope-filter{display:block;padding:9px;margin-bottom:9px}.school-overview-detail-scope-filter span{font-size:8.5px}.school-overview-detail-scope-select{width:100%;margin-top:7px;min-height:36px;font-size:10px}.school-overview-detail-teacher-table-section{padding:9px}.school-overview-detail-teacher-table-wrap{overflow:visible;border:0;background:transparent}.school-overview-detail-teacher-table,.school-overview-detail-closure-table{min-width:0;border:0}.school-overview-detail-teacher-table thead{display:none}.school-overview-detail-teacher-table,.school-overview-detail-teacher-table tbody,.school-overview-detail-teacher-table tr,.school-overview-detail-teacher-table td{display:block;width:100%}.school-overview-detail-teacher-table tr{margin-bottom:7px;border:1px solid #E2E8F0;border-radius:9px;background:#FFF;padding:7px}.school-overview-detail-teacher-table tr:last-child{margin-bottom:0}.school-overview-detail-teacher-table td{display:flex;justify-content:space-between;gap:10px;padding:6px 4px;border-bottom:1px solid #F1F5F9;text-align:right}.school-overview-detail-teacher-table td:last-child{border-bottom:0}.school-overview-detail-teacher-table td::before{content:attr(data-label);color:#64748B;font-size:8.5px;font-weight:850;text-align:left}.school-overview-detail-teacher-table td:nth-child(2),.school-overview-detail-closure-table td:nth-child(2),.school-overview-detail-closure-table td:nth-child(3){text-align:right}.school-overview-detail-teacher-breakdown{justify-content:flex-end;max-width:72%}.school-overview-detail-teacher-breakdown span{font-size:8.5px}.school-overview-detail-overlay{padding:5px}.school-overview-detail-modal{width:100%;max-width:none;max-height:95vh;border-radius:14px}.school-overview-detail-head{padding:12px 13px 10px}.school-overview-detail-kicker{font-size:8px;letter-spacing:.85px}.school-overview-detail-head h3{font-size:20px}.school-overview-detail-head p{font-size:9.5px}.school-overview-detail-close{width:32px;height:32px;font-size:21px}.school-overview-detail-body{padding:8px}.school-overview-detail-summary-grid,.school-overview-detail-summary-grid.compact,.school-overview-detail-mini-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.school-overview-detail-class-grid,.school-overview-detail-name-grid{grid-template-columns:1fr}.school-overview-detail-card-head strong{font-size:10.5px}.school-overview-detail-card-head span{font-size:9px}.school-overview-detail-card-head>b{font-size:16px}.school-overview-detail-student-main{display:block}.school-overview-detail-student-main strong{font-size:10.5px}.school-overview-detail-student-main span{display:block;margin-top:3px;font-size:9px}.school-overview-detail-student-metrics{margin-top:5px}.school-overview-detail-group-head{display:block}.school-overview-detail-group-head span{display:block;margin-top:4px}.school-overview-detail-explanation p{font-size:9.5px}.school-overview-detail-summary-grid span{font-size:9px}.school-overview-detail-summary-grid b{font-size:13px}.school-overview-detail-mini-grid span{font-size:9px}.school-overview-detail-doubt-topic{font-size:10px}.school-overview-detail-doubt-meta{font-size:9px}.school-overview-detail-doubt-class{padding:10px}.school-overview-detail-doubt-class-head strong{font-size:11px}.school-overview-detail-doubt-class-head span{font-size:8.5px}.school-overview-detail-doubt-class-head>b{font-size:18px}.school-overview-detail-doubt-stats,.school-overview-detail-doubt-stats.subject{grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.school-overview-detail-understanding-class{padding:10px}.school-overview-detail-understanding-class-head strong,.school-overview-detail-topic-class-head strong{font-size:11px}.school-overview-detail-understanding-class-head span,.school-overview-detail-topic-class-head span{font-size:8.5px}.school-overview-detail-understanding-class-head>b,.school-overview-detail-topic-class-head>b{font-size:18px}.school-overview-detail-understanding-stats,.school-overview-detail-understanding-stats.subject{grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.school-overview-detail-understanding-stats span{font-size:8.5px}.school-overview-detail-understanding-stats b{font-size:12px}.school-overview-detail-understanding-subject-list,.school-overview-detail-topic-subject-list{padding-left:6px}.school-overview-detail-understanding-subject,.school-overview-detail-topic-subject{padding:8px}.school-overview-detail-understanding-subject-head strong,.school-overview-detail-topic-subject-head strong{font-size:10.5px}.school-overview-detail-understanding-subject-head span,.school-overview-detail-topic-subject-head span{font-size:8.5px}.school-overview-detail-understanding-subject-head>b,.school-overview-detail-topic-subject-head>b{font-size:13px}.school-overview-detail-topic-class{padding:10px}.school-overview-detail-topic-log-head strong{font-size:10px}.school-overview-detail-topic-log-head span,.school-overview-detail-topic-log-teacher,.school-overview-detail-topic-log-subtopics{font-size:8.5px}.school-overview-detail-doubt-stats span{font-size:8.5px}.school-overview-detail-doubt-stats b{font-size:12px}.school-overview-detail-doubt-subject-list{padding-left:6px}.school-overview-detail-doubt-subject{padding:8px}.school-overview-detail-doubt-subject-head strong{font-size:10.5px}.school-overview-detail-doubt-subject-head span{font-size:8.5px}.school-overview-detail-doubt-subject-head>b{font-size:13px}}
/* Mobile/tablet teacher-wise rows: preserve the desktop table and allow horizontal scrolling on compact layouts. */
@media(max-width:1024px){
  .school-overview-detail-teacher-table-wrap{overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}
  .school-overview-detail-teacher-table{min-width:680px}
  .school-overview-detail-closure-table{min-width:1040px}
}
@media(max-width:600px){
  .school-overview-detail-teacher-table-wrap{overflow-x:auto;overflow-y:hidden;border:1px solid #E2E8F0;border-radius:10px;background:#FFF}
  .school-overview-detail-teacher-table,.school-overview-detail-closure-table{display:table;width:100%;min-width:680px;border:0;border-collapse:collapse;table-layout:fixed}
  .school-overview-detail-closure-table{min-width:1040px}
  .school-overview-detail-teacher-table thead{display:table-header-group}
  .school-overview-detail-teacher-table tbody{display:table-row-group}
  .school-overview-detail-teacher-table tr{display:table-row;margin:0;border:0;border-radius:0;background:transparent;padding:0}
  .school-overview-detail-teacher-table th,.school-overview-detail-teacher-table td{display:table-cell;padding:9px 10px;border-bottom:1px solid #EEF2F7;text-align:left;vertical-align:top}
  .school-overview-detail-teacher-table th{color:#475569;background:#F8FAFC;font-size:9.5px;font-weight:950;letter-spacing:.15px}
  .school-overview-detail-teacher-table td{color:#334155;font-size:10px;font-weight:700;line-height:1.45}
  .school-overview-detail-teacher-table tr:last-child td{border-bottom:0}
  .school-overview-detail-teacher-table td::before{content:none}
  .school-overview-detail-teacher-table td:nth-child(2),.school-overview-detail-closure-table td:nth-child(2),.school-overview-detail-closure-table td:nth-child(3){text-align:center}
  .school-overview-detail-teacher-breakdown{justify-content:flex-start;max-width:none}
  .school-overview-detail-teacher-breakdown span{white-space:nowrap}
}
`;


export default function SchoolOverviewCardDetailPopup({
  card,
  value,
  detail,
  loading,
  error,
  onClose,
}: {
  card: SchoolOverviewCardKey;
  value: string | number;
  detail: SchoolOverviewCardDetailSnapshot | null;
  loading: boolean;
  error: string;
  onClose: () => void;
}) {
  const [selectedClassSection, setSelectedClassSection] = useState(SCHOOL_OVERVIEW_ALL_CLASS_SECTION);
  const classSectionOptions = useMemo(() => (detail ? collectSchoolOverviewClassSections(detail) : []), [detail]);
  const effectiveSelectedClassSection = useMemo(() => {
    if (selectedClassSection === SCHOOL_OVERVIEW_ALL_CLASS_SECTION) return SCHOOL_OVERVIEW_ALL_CLASS_SECTION;
    return classSectionOptions.some(
      option => schoolOverviewClassSectionKey(option.className, option.sectionName) === selectedClassSection,
    )
      ? selectedClassSection
      : SCHOOL_OVERVIEW_ALL_CLASS_SECTION;
  }, [classSectionOptions, selectedClassSection]);
  const filteredDetail = useMemo(
    () => (detail ? projectSchoolOverviewCardDetailByClassSection(detail, effectiveSelectedClassSection) : null),
    [detail, effectiveSelectedClassSection],
  );
  const filteredHeaderValue = useMemo(() => {
    if (!filteredDetail || effectiveSelectedClassSection === SCHOOL_OVERVIEW_ALL_CLASS_SECTION) return value;
    switch (card) {
      case "understanding": return `${filteredDetail.understanding.cardValue}%`;
      case "activeDoubts": return filteredDetail.doubtsLoadFailed ? value : filteredDetail.activeDoubts.length;
      case "doubtClosure": {
        if (filteredDetail.doubtsLoadFailed) return value;
        const total = filteredDetail.doubtClosure.length;
        const resolved = filteredDetail.doubtClosure.filter(row => row.resolved).length;
        return `${total ? Math.round((resolved / total) * 100) : 0}%`;
      }
      case "responses": return filteredDetail.responses.cardValue;
      case "topicsTaught": return filteredDetail.topicClassGroups.reduce((sum, group) => sum + group.logsCount, 0);
      case "activeTeachers": return filteredDetail.activeTeachers.length;
      case "classesReporting": return filteredDetail.classesReporting.length;
      case "students": return filteredDetail.students.reduce((sum, group) => sum + group.students.length, 0);
    }
  }, [card, filteredDetail, value]);

  useEffect(() => {
    setSelectedClassSection(SCHOOL_OVERVIEW_ALL_CLASS_SECTION);
  }, [card, detail?.period.startDate, detail?.period.endDate]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") onClose();
  }

  return (
    <>
      <style>{CSS}</style>
      <div
        className="school-overview-detail-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="school-overview-detail-title"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="school-overview-detail-modal">
          <header className="school-overview-detail-head">
            <div>
              <p className="school-overview-detail-kicker">VERIFY SCHOOL OVERVIEW</p>
              <h3 id="school-overview-detail-title">{TITLES[card]}</h3>
              <p>{filteredHeaderValue} · selected period {detail ? periodLabel(detail) : ""}</p>
            </div>
            <CloseButton onClose={onClose} />
          </header>
          <div className="school-overview-detail-body">
            <div className="school-overview-detail-explanation">
              <strong>How this number is calculated</strong>
              <p>{EXPLANATIONS[card]}</p>
            </div>
            {loading && <Empty text="Preparing the selected-period evidence…" />}
            {!loading && error && <Empty text={error} />}
            {!loading && !error && detail && (
              <>
                <ClassSectionFilter
                  options={classSectionOptions}
                  value={effectiveSelectedClassSection}
                  onChange={setSelectedClassSection}
                />
                {filteredDetail && (
                  <Content
                    card={card}
                    detail={filteredDetail}
                    classSectionFiltered={effectiveSelectedClassSection !== SCHOOL_OVERVIEW_ALL_CLASS_SECTION}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
