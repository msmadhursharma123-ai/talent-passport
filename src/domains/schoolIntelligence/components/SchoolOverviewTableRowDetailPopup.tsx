import type { KeyboardEvent } from "react";
import type {
  SchoolOverviewTableRowDetailMetricSummary,
  SchoolOverviewTableRowDetailSnapshot,
} from "../types/SchoolOverviewTableRowDetailModels";

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      className="school-overview-table-detail-close"
      onClick={onClose}
      aria-label="Close classroom detail popup"
    >
      ×
    </button>
  );
}

function SectionHead({ title, count }: { title: string; count?: string }) {
  return (
    <div className="school-overview-table-detail-section-head">
      <h4>{title}</h4>
      {count ? <span>{count}</span> : null}
    </div>
  );
}

function ParameterCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="school-overview-table-detail-parameter">
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
      <p>{detail}</p>
    </article>
  );
}

function MetricBreakdown({ value }: { value: SchoolOverviewTableRowDetailMetricSummary }) {
  return (
    <div className="school-overview-table-detail-parameter-grid">
      <ParameterCard
        title="Response %"
        value={`${value.responseRate}%`}
        detail={`${value.studentsResponded} of ${value.totalStudents} unique students submitted at least one valid learning response. ${value.responseObservations} valid responses across ${value.eligibleObservations} eligible observations; the Response % above is the canonical classroom response metric.`}
      />
      <ParameterCard
        title="Understanding %"
        value={`${value.understandingRate}%`}
        detail={`${value.completeObservations} complete-understanding observations.`}
      />
      <ParameterCard
        title="Partial %"
        value={`${value.partialRate}%`}
        detail={`${value.partialObservations} partial-understanding observations.`}
      />
      <ParameterCard
        title="Doubt %"
        value={`${value.doubtRate}%`}
        detail={`${value.partialObservations + value.didntUnderstandObservations} partial / did-not-understand observations.`}
      />
      <ParameterCard
        title="Doubt Closure %"
        value={value.doubtsUnavailable ? "Unavailable" : `${value.doubtClosureRate}%`}
        detail={value.doubtsUnavailable
          ? "Doubt information is currently unavailable."
          : `${value.doubtsResolved} resolved of ${value.doubtsRaised} raised doubts.`}
      />
      <ParameterCard
        title="Class Health %"
        value={`${value.classHealthPercentage}%`}
        detail={`Average learning health across ${value.lectureCount} published lessons in this period.`}
      />
    </div>
  );
}

function TopicsSection({ detail }: { detail: SchoolOverviewTableRowDetailSnapshot }) {
  return (
    <section className="school-overview-table-detail-section">
      <SectionHead title="1. Total Topics Taught" count={`${detail.topics.length} lessons`} />
      <p className="school-overview-table-detail-help">
        Every published lesson is shown by date, with the teacher, topic and the subtopics or concepts recorded for that lesson.
      </p>
      {!detail.days.length ? (
        <div className="school-overview-table-detail-empty">No dates are available in the selected period.</div>
      ) : (
        <div className="school-overview-table-detail-day-list">
          {detail.days.map(day => (
            <article className="school-overview-table-detail-day" key={day.date}>
              <div className="school-overview-table-detail-day-head">
                <div><strong>{day.day}</strong><span>{day.date}</span></div>
                <b>{day.hasLessons ? `${day.topics.length} lesson${day.topics.length === 1 ? "" : "s"}` : "No lesson"}</b>
              </div>
              {day.topics.length ? (
                <div className="school-overview-table-detail-topic-list">
                  {day.topics.map(topic => (
                    <div className="school-overview-table-detail-topic" key={topic.logId}>
                      <div><strong>{topic.topic}</strong><span>{topic.teacherName}</span></div>
                      <p>{topic.subtopics.length ? `Subtopics / concepts: ${topic.subtopics.join(" · ")}` : "No subtopics or concepts were recorded."}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="school-overview-table-detail-help">No topic or lesson was recorded on this date.</p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StudentsSection({ detail }: { detail: SchoolOverviewTableRowDetailSnapshot }) {
  return (
    <section className="school-overview-table-detail-section">
      <SectionHead title="2. Total Students" count={`${detail.tableRowTotalStudents} students`} />
      <p className="school-overview-table-detail-help">
        The selected table row shows <strong>{detail.tableRowTotalStudents}</strong> roster records. This detail view also reports the canonical unique-student roster used by learning calculations, so duplicate student records are never counted twice in the canonical metrics.
      </p>
      <div className="school-overview-table-detail-daily-block">
        <div className="school-overview-table-detail-subhead">Daily student count</div>
        <div className="school-overview-table-detail-daily-list">
          {detail.days.map(day => (
            <article className="school-overview-table-detail-daily-row" key={`students-${day.date}`}>
              <div className="school-overview-table-detail-daily-date"><strong>{day.day}</strong><span>{day.date}</span></div>
              <div className="school-overview-table-detail-daily-value"><b>{detail.tableRowTotalStudents} students</b><span>{day.hasLessons ? "Classroom roster for this row" : "Classroom roster; no lesson recorded on this date"}</span></div>
            </article>
          ))}
        </div>
      </div>
      {!detail.students.length ? (
        <div className="school-overview-table-detail-empty">No students were found for this classroom.</div>
      ) : (
        <div className="school-overview-table-detail-student-list">
          {detail.students.map(student => (
            <article className="school-overview-table-detail-student" key={student.studentUuid}>
              <div className="school-overview-table-detail-student-head">
                <div><strong>{student.studentName}</strong><span>{student.eligibleObservations} eligible observations · {student.responseObservations} responses</span></div>
                <b>{student.learningHealthPercentage}%</b>
              </div>
              <div className="school-overview-table-detail-student-grid">
                <span>Response <b>{student.responseRate}%</b></span>
                <span>Understanding <b>{student.understandingRate}%</b></span>
                <span>Partial <b>{student.partialRate}%</b></span>
                <span>Doubt <b>{student.doubtRate}%</b></span>
                <span>Doubt closure <b>{student.doubtClosureRate}%</b></span>
                <span>Doubts <b>{student.doubtsResolved}/{student.doubtsRaised}</b></span>
              </div>
              <div className="school-overview-table-detail-student-note">
                Complete {student.completeObservations} · Partial {student.partialObservations} · Did not understand {student.didntUnderstandObservations} · Absent {student.absentObservations} · Not responded {student.notRespondedObservations}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function DailyMetricSection({ detail }: { detail: SchoolOverviewTableRowDetailSnapshot }) {
  return (
    <section className="school-overview-table-detail-section">
      <SectionHead title="3. Response %" />
      <MetricBreakdown value={detail.overall} />
      <DailyRows detail={detail} metric="response" />
    </section>
  );
}

function DailyRows({
  detail,
  metric,
}: {
  detail: SchoolOverviewTableRowDetailSnapshot;
  metric: "response" | "understanding" | "partial" | "doubt" | "closure" | "health";
}) {
  const title = metric === "response"
    ? "Daily response details"
    : metric === "understanding"
      ? "Daily understanding details"
      : metric === "partial"
        ? "Daily partial-understanding details"
        : metric === "doubt"
          ? "Daily doubt details"
          : metric === "closure"
            ? "Daily doubt-closure details"
            : "Daily class-health details";

  return (
    <div className="school-overview-table-detail-daily-block">
      <div className="school-overview-table-detail-subhead">{title}</div>
      {!detail.days.length ? (
        <div className="school-overview-table-detail-empty">No daily evidence was recorded in the selected period.</div>
      ) : (
        <div className="school-overview-table-detail-daily-list">
          {detail.days.map(day => {
            const value = day.metrics;
            const display = metric === "closure" && value.doubtsRaised > 0
              ? (detail.doubtsUnavailable ? "Unavailable" : `${value.doubtClosureRate}%`)
              : !day.hasLessons
                ? "No lesson"
                : metric === "response" ? `${value.responseRate}%`
                : metric === "understanding" ? `${value.understandingRate}%`
                : metric === "partial" ? `${value.partialRate}%`
                : metric === "doubt" ? `${value.doubtRate}%`
                : metric === "closure" ? (detail.doubtsUnavailable ? "Unavailable" : `${value.doubtClosureRate}%`)
                : `${value.classHealthPercentage}%`;
            const supporting = metric === "closure" && value.doubtsRaised > 0
              ? (detail.doubtsUnavailable ? "Doubt information unavailable" : `${value.doubtsResolved} resolved · ${value.doubtsUnresolved} unresolved · ${value.doubtsRaised} raised`)
              : !day.hasLessons
                ? "No lesson or classroom response activity was recorded on this date."
                : metric === "response"
              ? `${value.studentsResponded} of ${value.totalStudents} unique students responded at least once · ${value.responseObservations} valid responses · ${value.eligibleObservations} eligible observations · ${value.absentObservations} absent · ${value.notRespondedObservations} not responded`
              : metric === "understanding"
                ? `${value.completeObservations} complete of ${value.eligibleObservations} eligible observations`
                : metric === "partial"
                  ? `${value.partialObservations} partial of ${value.eligibleObservations} eligible observations`
                  : metric === "doubt"
                    ? `${value.partialObservations + value.didntUnderstandObservations} doubt signals of ${value.eligibleObservations} eligible observations`
                    : metric === "closure"
                      ? (detail.doubtsUnavailable ? "Doubt information unavailable" : `${value.doubtsResolved} resolved · ${value.doubtsUnresolved} unresolved · ${value.doubtsRaised} raised`)
                      : `${value.lectureCount} published lessons · average lesson health`;
            return (
              <article className="school-overview-table-detail-daily-row" key={`${metric}-${day.date}`}>
                <div className="school-overview-table-detail-daily-date"><strong>{day.day}</strong><span>{day.date}</span></div>
                <div className="school-overview-table-detail-daily-value"><b>{display}</b><span>{supporting}</span></div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MetricSection({
  number,
  title,
  detail,
  metric,
}: {
  number: string;
  title: string;
  detail: SchoolOverviewTableRowDetailSnapshot;
  metric: "understanding" | "partial" | "doubt" | "closure" | "health";
}) {
  const value = detail.overall;
  const overall = metric === "understanding" ? `${value.understandingRate}%` :
    metric === "partial" ? `${value.partialRate}%` :
      metric === "doubt" ? `${value.doubtRate}%` :
        metric === "closure" ? (detail.doubtsUnavailable ? "Unavailable" : `${value.doubtClosureRate}%`) :
          `${value.classHealthPercentage}%`;

  return (
    <section className="school-overview-table-detail-section">
      <SectionHead title={`${number}. ${title}`} />
      <div className="school-overview-table-detail-overall-banner">
        <div><span>Overall for {detail.period.startDate} → {detail.period.endDate}</span><strong>{overall}</strong></div>
        <p>{
          metric === "understanding" ? `${value.completeObservations} complete-understanding observations out of ${value.eligibleObservations} eligible observations.` :
          metric === "partial" ? `${value.partialObservations} partial-understanding observations out of ${value.eligibleObservations} eligible observations.` :
          metric === "doubt" ? `${value.partialObservations + value.didntUnderstandObservations} doubt signals out of ${value.eligibleObservations} eligible observations.` :
          metric === "closure" ? (detail.doubtsUnavailable ? "Doubt information is currently unavailable." : `${value.doubtsResolved} resolved doubts out of ${value.doubtsRaised} raised doubts.`) :
          `${value.classHealthPercentage}% is the average lesson health across ${value.lectureCount} published lessons.`
        }</p>
      </div>
      <DailyRows detail={detail} metric={metric} />
    </section>
  );
}

export default function SchoolOverviewTableRowDetailPopup({
  detail,
  loading,
  error,
  onClose,
}: {
  detail: SchoolOverviewTableRowDetailSnapshot | null;
  loading: boolean;
  error: string;
  onClose: () => void;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") onClose();
  }

  return (
    <div
      className="school-overview-table-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Classroom detail"
      onKeyDown={onKeyDown}
      tabIndex={-1}
    >
      <div className="school-overview-table-detail-modal">
        <header className="school-overview-table-detail-head">
          <div>
            <div className="school-overview-table-detail-kicker">CLASSROOM EVIDENCE</div>
            <h3>{detail ? `${detail.classroom} · ${detail.subjectName}` : "Classroom detail"}</h3>
            <p>{detail ? `${detail.teacherName} · ${detail.period.startDate} → ${detail.period.endDate}` : "Preparing the selected classroom evidence…"}</p>
          </div>
          <CloseButton onClose={onClose} />
        </header>

        <div className="school-overview-table-detail-body">
          {loading ? (
            <div className="school-overview-table-detail-loading">Preparing the classroom evidence for the selected period…</div>
          ) : error ? (
            <div className="school-overview-table-detail-error">{error}</div>
          ) : detail ? (
            <>
              <section className="school-overview-table-detail-intro">
                <strong>Selected classroom row</strong>
                <span>{detail.classroom} · {detail.subjectName} · Teacher: {detail.teacherName}</span>
                <p>This view explains every number shown in the selected row. The first figure is the overall result for the selected period, followed by the day-by-day evidence. No technical database or system terminology is used here.</p>
              </section>

              <TopicsSection detail={detail} />
              <StudentsSection detail={detail} />
              <DailyMetricSection detail={detail} />
              <MetricSection number="4" title="Understanding %" detail={detail} metric="understanding" />
              <MetricSection number="5" title="Partial %" detail={detail} metric="partial" />
              <MetricSection number="6" title="Doubt %" detail={detail} metric="doubt" />
              <MetricSection number="7" title="Doubt Closure %" detail={detail} metric="closure" />
              <MetricSection number="8" title="Class Health %" detail={detail} metric="health" />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
