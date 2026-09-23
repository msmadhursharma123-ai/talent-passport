import {
  useEffect,
  useState,
} from "react";

import {
  getSubjectsByClass,
} from "../../../data/academicMasterRepository";

import {
  requireIdentity,
} from "../../../services/identityService";

import {
  getStudentExamPreparationIntelligenceWithLiveLayer,
} from "../../liveDoubtIntelligence/service/LiveStudentExamPreparation";
import {
  buildExamPreparationRange,
} from "../../examPreparationIntelligence/canonical/ExamPreparationDate";

interface SubjectBreakdown {
  subject: string;
  totalUnresolvedDoubts: number;
  concepts: Array<{
    concept: string;
    signals: number;
  }>;
  topics: Array<{
    topic: string;
    signals: number;
    subtopics: string[];
  }>;
  highestRiskTopic: string;
  attentionLevel: string;
}

interface ExamPreparationData {
  totalUnresolvedDoubts?: number;
  topics?: string[];
  highestRiskTopic?: string;
  attentionLevel?: string;
  subjectBreakdown?: SubjectBreakdown[];
}

type TimeFilter = "30" | "60" | "90" | "ALL" | "CUSTOM";

const ALL_SUBJECTS = "ALL_SUBJECTS";

const subjectPalette = [
  { bg: "linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 100%)", ink: "#C2410C" },
  { bg: "linear-gradient(135deg, #EFF6FF 0%, #F8FBFF 100%)", ink: "#1D4ED8" },
  { bg: "linear-gradient(135deg, #ECFDF5 0%, #F7FFFB 100%)", ink: "#15803D" },
  { bg: "linear-gradient(135deg, #F5F3FF 0%, #FBFAFF 100%)", ink: "#7C3AED" },
  { bg: "linear-gradient(135deg, #FFF1F2 0%, #FFF7F8 100%)", ink: "#BE123C" },
  { bg: "linear-gradient(135deg, #F0FDFA 0%, #F7FFFD 100%)", ink: "#0F766E" },
];

function buildDateRange(
  timeFilter: TimeFilter,
  customStart: string,
  customEnd: string
) {
  return buildExamPreparationRange(
    timeFilter,
    customStart,
    customEnd
  );
}

export default function StudentExamPreparation() {
  const [data, setData] = useState<ExamPreparationData | null>(null);
  const [subjectOptions, setSubjectOptions] = useState<string[]>(["All Subjects"]);
  const [selectedSubject, setSelectedSubject] = useState(ALL_SUBJECTS);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const identity = requireIdentity();
      const masterSubjects = identity.className
        ? getSubjectsByClass(identity.className)
        : [];

      const cleaned = masterSubjects
        .map((subject) => String(subject).trim())
        .filter((subject) => subject && subject.toLowerCase() !== "all subjects");

      setSubjectOptions(Array.from(new Set(["All Subjects", ...cleaned])));
    } catch (error) {
      console.error("STUDENT EXAM PREPARATION SUBJECT LIST LOAD FAILED", error);
      setSubjectOptions(["All Subjects"]);
    }
  }, []);

  useEffect(() => {
    const range = buildDateRange(timeFilter, customStart, customEnd);
    if (!range) {
      setData(null);
      setLoading(false);
      return;
    }

    void loadData(range.startDate, range.endDateExclusive);
  }, [selectedSubject, timeFilter, customStart, customEnd]);

  async function loadData(startDate: string, endDateExclusive: string) {
    try {
      setLoading(true);

      const response =
        await getStudentExamPreparationIntelligenceWithLiveLayer(
          selectedSubject,
          "",
          {
            startDate,
            endDateExclusive,
          }
        );

      setData(response ?? null);

      const actualSubjects = (response?.subjectBreakdown ?? [])
        .map((item) => String(item.subject ?? "").trim())
        .filter(Boolean);

      if (actualSubjects.length > 0) {
        setSubjectOptions((current) =>
          Array.from(new Set(["All Subjects", ...current.filter((item) => item !== "All Subjects"), ...actualSubjects]))
        );
      }
    } catch (error) {
      console.error(
        "STUDENT EXAM PREPARATION LOAD FAILED",
        error
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const subjects = [...(data?.subjectBreakdown ?? [])].sort(
    (a, b) =>
      b.totalUnresolvedDoubts - a.totalUnresolvedDoubts ||
      a.subject.localeCompare(b.subject)
  );

  const customRangeInvalid =
    timeFilter === "CUSTOM" &&
    Boolean(customStart && customEnd && customStart > customEnd);

  return (
    <div className="student-exam-preparation tp-exam-prep-root">
      <style>{styles}</style>

      <div className="tp-exam-heading-card">
        <div className="tp-exam-heading-copy">
          <p className="tp-exam-kicker">EXAM PREPARATION</p>
          <h2 className="tp-exam-title">
            EXAM PREPARATION INTELLIGENCE
          </h2>
          <p className="tp-exam-description">
            Current unresolved classroom doubts that need academic attention before exams.
          </p>
        </div>

        <span className="tp-exam-live-badge">LIVE</span>
      </div>

      <div className="tp-exam-live-note">
        LIVE STUDENT VERIFICATION ACTIVE — unresolved values use the latest live doubt reconciliation.
      </div>

      <div className="tp-exam-filter-bar">
        <div className="tp-exam-filter">
          <label htmlFor="student-exam-subject">Subject</label>
          <select
            id="student-exam-subject"
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
          >
            <option value={ALL_SUBJECTS}>All Subjects</option>
            {subjectOptions
              .filter((subject) => subject !== "All Subjects")
              .map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
          </select>
        </div>

        <div className="tp-exam-filter">
          <label htmlFor="student-exam-time">Time Period</label>
          <select
            id="student-exam-time"
            value={timeFilter}
            onChange={(event) => setTimeFilter(event.target.value as TimeFilter)}
          >
            <option value="ALL">All time</option><option value="30">Last 30 Days</option>
            <option value="60">Last 60 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="CUSTOM">Custom Date</option>
          </select>

          {timeFilter === "CUSTOM" && (
            <div className="tp-exam-custom-range">
              <input
                aria-label="Start date"
                type="date"
                value={customStart}
                onChange={(event) => setCustomStart(event.target.value)}
              />
              <input
                aria-label="End date"
                type="date"
                value={customEnd}
                onChange={(event) => setCustomEnd(event.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {customRangeInvalid && (
        <p className="tp-exam-filter-error">
          Please select a valid custom date range.
        </p>
      )}

      {loading && (
        <p className="tp-exam-filter-loading">
          Loading exam preparation intelligence…
        </p>
      )}

      <p className="tp-exam-swipe-hint">
        Scroll left & right →
      </p>

      <div className="tp-exam-table-wrap">
        <table className="tp-exam-table">
          <thead>
            <tr>
              <th className="tp-exam-metric-header">METRICS</th>

              {subjects.length > 0 ? (
                subjects.map((subject, index) => {
                  const palette = subjectPalette[index % subjectPalette.length];
                  return (
                    <th
                      key={subject.subject}
                      className="tp-exam-subject-header"
                      style={{
                        background: palette.bg,
                        color: palette.ink,
                      }}
                    >
                      {subject.subject}
                    </th>
                  );
                })
              ) : (
                <th
                  className="tp-exam-subject-header"
                  style={{
                    background: subjectPalette[0].bg,
                    color: subjectPalette[0].ink,
                  }}
                >
                  YOU
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            <ExamRow
              metric="Total Unresolved Doubts"
              subjects={subjects}
              getValue={(subject) => String(subject.totalUnresolvedDoubts)}
              emptyValue={String(data?.totalUnresolvedDoubts ?? 0)}
              kind="count"
            />

            <ExamRow
              metric="Topics With Unresolved Doubts"
              subjects={subjects}
              getValue={(subject) =>
                subject.topics.length > 0
                  ? subject.topics
                      .map((item) =>
                        item.signals > 1
                          ? `${item.topic} (${item.signals})`
                          : item.topic
                      )
                      .join(" • ")
                  : "-"
              }
              emptyValue={
                data?.topics?.length
                  ? data.topics.join(" • ")
                  : "-"
              }
              kind="doubt"
            />

            <ExamRow
              metric="Subtopics with Unresolved Doubts"
              subjects={subjects}
              getValue={(subject) =>
                subject.topics.length > 0
                  ? subject.topics
                      .map((item) => {
                        const subtopics = (item.subtopics ?? []).join(", ");
                        return `${item.topic} → ${subtopics || "-"}`;
                      })
                      .join(" • ")
                  : "-"
              }
              emptyValue="-"
              kind="subtopic"
            />

            <ExamRow
              metric="Highest Risk Topics"
              subjects={subjects}
              getValue={(subject) => subject.highestRiskTopic || "-"}
              emptyValue={data?.highestRiskTopic || "-"}
              kind="difficult"
            />

            <ExamRow
              metric="Attention Level"
              subjects={subjects}
              getValue={(subject) => subject.attentionLevel || "-"}
              emptyValue={data?.attentionLevel || "-"}
              kind="status"
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExamRow({
  metric,
  subjects,
  getValue,
  emptyValue,
  kind,
}: {
  metric: string;
  subjects: SubjectBreakdown[];
  getValue: (subject: SubjectBreakdown) => string;
  emptyValue: string;
  kind: "count" | "doubt" | "subtopic" | "difficult" | "status";
}) {
  const valueClass =
    kind === "count"
      ? "tp-exam-count"
      : kind === "subtopic"
        ? "tp-exam-subtopic"
        : kind === "difficult"
        ? "tp-exam-difficult"
        : kind === "status"
          ? "tp-exam-status"
          : "tp-exam-doubt";

  return (
    <tr>
      <td className="tp-exam-metric-cell">{metric}</td>

      {subjects.length > 0 ? (
        subjects.map((subject) => (
          <td
            key={subject.subject}
            className={`tp-exam-value-cell ${valueClass}`}
          >
            {getValue(subject)}
          </td>
        ))
      ) : (
        <td className={`tp-exam-value-cell ${valueClass}`}>
          {emptyValue}
        </td>
      )}
    </tr>
  );
}

const styles = `

.tp-exam-filter-bar {
  display: grid;
  grid-template-columns: minmax(150px, 1.2fr) minmax(150px, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.tp-exam-filter {
  min-width: 0;
}

.tp-exam-filter label {
  display: block;
  margin-bottom: 5px;
  color: #64748B;
  font-size: 9px;
  font-weight: 850;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.tp-exam-filter select,
.tp-exam-filter input {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  background: #FFFFFF;
  color: #0F172A;
  padding: 9px 10px;
  font-size: 11px;
  font-weight: 750;
  outline: none;
}

.tp-exam-filter select:focus,
.tp-exam-filter input:focus {
  border-color: #FDBA74;
}

.tp-exam-custom-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 5px;
}

.tp-exam-filter-error {
  margin: 0 0 8px;
  padding: 7px 9px;
  border: 1px solid #FECACA;
  border-radius: 9px;
  background: #FEF2F2;
  color: #B91C1C;
  font-size: 9px;
  font-weight: 700;
}

.tp-exam-filter-loading {
  margin: 0 0 8px;
  padding: 7px 9px;
  border: 1px solid #DBEAFE;
  border-radius: 9px;
  background: #EFF6FF;
  color: #1D4ED8;
  font-size: 9px;
  font-weight: 700;
}

.tp-exam-prep-root,
.tp-exam-prep-root * {
  box-sizing: border-box;
}

.tp-exam-prep-root {
  width: 100%;
  min-width: 0;
  padding: 24px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 26px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.tp-exam-heading-card {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  margin-bottom: 14px;
  background: linear-gradient(135deg, #FFF9F2 0%, #FFFFFF 72%, #FFF7ED 100%);
  border: 1px solid #FED7AA;
  border-radius: 20px;
}

.tp-exam-heading-copy {
  min-width: 0;
}

.tp-exam-kicker {
  margin: 0 0 7px;
  color: #F97316;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.8px;
}

.tp-exam-title {
  margin: 0;
  color: #0F172A;
  font-size: 22px;
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.tp-exam-description {
  margin: 7px 0 0;
  color: #64748B;
  font-size: 13px;
  line-height: 1.5;
}

.tp-exam-live-badge {
  flex: 0 0 auto;
  padding: 7px 10px;
  border: 1px solid #FED7AA;
  border-radius: 999px;
  background: #FFF7ED;
  color: #EA580C;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1.1px;
}

.tp-exam-live-note {
  margin-bottom: 10px;
  padding: 10px 12px;
  border: 1px solid #BFDBFE;
  border-radius: 14px;
  background: linear-gradient(135deg, #EFF6FF 0%, #F8FBFF 100%);
  color: #1D4ED8;
  font-size: 10px;
  line-height: 1.45;
  font-weight: 700;
}

.tp-exam-swipe-hint {
  margin: 0 0 6px;
  color: #94A3B8;
  font-size: 7px;
  font-weight: 800;
}

.tp-exam-table-wrap {
  width: 100%;
  max-width: 100%;
  overflow-x: auto !important;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-x: contain;
  touch-action: pan-x;
  border: 1px solid #E2E8F0;
  border-radius: 18px;
  background: #FFFFFF;
  scrollbar-width: thin;
}

.tp-exam-table {
  width: max-content;
  min-width: 950px;
  border-collapse: separate;
  border-spacing: 0;
}

.tp-exam-table th,
.tp-exam-table td {
  border-bottom: 1px solid #EEF2F7;
  border-right: 1px solid #EEF2F7;
  vertical-align: middle;
}

.tp-exam-metric-header {
  position: sticky;
  left: 0;
  z-index: 5;
  width: 320px;
  min-width: 320px;
  max-width: 320px;
  padding: 16px 18px;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 100%);
  color: #C2410C;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  text-align: left;
}

.tp-exam-subject-header {
  min-width: 210px;
  padding: 16px 18px;
  font-size: 17px;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
  border-bottom: 1px solid #E2E8F0 !important;
}

.tp-exam-metric-cell {
  position: sticky;
  left: 0;
  z-index: 3;
  width: 320px;
  min-width: 320px;
  max-width: 320px;
  padding: 14px 18px;
  background: #FFFFFF;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.45;
  text-align: left;
}

.tp-exam-value-cell {
  min-width: 210px;
  padding: 14px 18px;
  background: #FFFFFF;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
}

.tp-exam-count {
  color: #EF4444;
  font-weight: 800;
}

.tp-exam-doubt {
  color: #DC2626;
  font-weight: 700;
}

.tp-exam-subtopic {
  color: #B91C1C;
  font-weight: 700;
}

.tp-exam-difficult {
  color: #1E3A8A;
  font-weight: 700;
}

.tp-exam-status {
  color: #F59E0B;
  font-weight: 800;
}

@media (max-width: 1024px) {
  .tp-exam-filter-bar {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 7px;
  }

  .tp-exam-filter label {
    font-size: 8px;
  }

  .tp-exam-filter select,
  .tp-exam-filter input {
    padding: 8px 8px;
    font-size: 10px;
  }

  .tp-exam-prep-root {
    padding: 16px !important;
    border-radius: 20px !important;
  }

  .tp-exam-heading-card {
    padding: 13px 14px !important;
    margin-bottom: 10px !important;
    border-radius: 14px !important;
    gap: 10px !important;
  }

  .tp-exam-kicker {
    font-size: 8px !important;
    letter-spacing: 1.1px !important;
    margin-bottom: 3px !important;
  }

  .tp-exam-title {
    font-size: 18px !important;
    line-height: 1.12 !important;
  }

  .tp-exam-description {
    font-size: 10px !important;
    line-height: 1.3 !important;
    margin-top: 4px !important;
  }

  .tp-exam-live-badge {
    padding: 5px 8px !important;
    font-size: 7px !important;
  }

  .tp-exam-live-note {
    padding: 8px 10px !important;
    margin-bottom: 7px !important;
    border-radius: 11px !important;
    font-size: 8px !important;
  }

  .tp-exam-table-wrap {
    border-radius: 11px !important;
  }

  .tp-exam-table {
    min-width: 590px !important;
  }

  .tp-exam-metric-header,
  .tp-exam-metric-cell {
    width: 126px !important;
    min-width: 126px !important;
    max-width: 126px !important;
  }

  .tp-exam-metric-header {
    z-index: 5;
    padding: 5px 6px !important;
    font-size: 8.5px !important;
    line-height: 1.18 !important;
  }

  .tp-exam-metric-cell {
    z-index: 3;
    padding: 5px 6px !important;
    font-size: 8.5px !important;
    line-height: 1.18 !important;
  }

  .tp-exam-subject-header,
  .tp-exam-value-cell {
    min-width: 104px !important;
  }

  .tp-exam-subject-header {
    padding: 5px 6px !important;
    font-size: 9.5px !important;
    line-height: 1.18 !important;
  }

  .tp-exam-value-cell {
    padding: 5px 6px !important;
    font-size: 8.5px !important;
    line-height: 1.18 !important;
  }
}

@media (max-width: 600px) {
  .tp-exam-filter-bar {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 5px;
    margin-bottom: 7px;
  }

  .tp-exam-filter label {
    margin-bottom: 3px;
    font-size: 6.5px;
  }

  .tp-exam-filter select,
  .tp-exam-filter input {
    padding: 6px 5px;
    border-radius: 7px;
    font-size: 8px;
  }

  .tp-exam-custom-range {
    gap: 4px;
    margin-top: 4px;
  }

  .tp-exam-filter-error,
  .tp-exam-filter-loading {
    padding: 6px 7px;
    font-size: 7px;
  }

  .tp-exam-prep-root {
    padding: 12px !important;
    border-radius: 16px !important;
  }

  .tp-exam-heading-card {
    padding: 10px 11px !important;
    margin-bottom: 8px !important;
    border-radius: 12px !important;
  }

  .tp-exam-title {
    font-size: 15px !important;
  }

  .tp-exam-description {
    font-size: 8.5px !important;
  }

  .tp-exam-live-badge {
    padding: 4px 7px !important;
    font-size: 6px !important;
  }

  .tp-exam-live-note {
    padding: 7px 8px !important;
    font-size: 7px !important;
    line-height: 1.35 !important;
  }

  .tp-exam-table {
    min-width: 560px !important;
  }

  .tp-exam-metric-header,
  .tp-exam-metric-cell {
    width: 120px !important;
    min-width: 120px !important;
    max-width: 120px !important;
  }

  .tp-exam-metric-header,
  .tp-exam-metric-cell,
  .tp-exam-value-cell {
    padding: 5px !important;
    font-size: 8px !important;
  }

  .tp-exam-subject-header {
    min-width: 100px !important;
    padding: 5px !important;
    font-size: 9px !important;
  }
}
`;