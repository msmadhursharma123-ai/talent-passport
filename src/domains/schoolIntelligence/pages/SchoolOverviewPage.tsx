import "./schoolIntelligence.css";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { loadSchoolIntelligence } from "../viewmodels/SchoolIntelligenceViewModel";
import {
  getSchoolClassroomSupplementalMetrics,
  type SchoolClassroomSupplementalMetric,
} from "../repository/SchoolIntelligenceRepository";
import type {
  SchoolClassroomHealthRow,
  SchoolIntelligenceSnapshot,
} from "../types/SchoolIntelligenceModels";
import SchoolPostManagerPage from "./SchoolPostManagerPage";
import SchoolTeacherAccessManager from "./SchoolTeacherAccessManager";

type RangeValue = "30" | "60" | "90" | "custom";
type SortKey =
  | "responseRate"
  | "understandingRate"
  | "partialUnderstandingRate"
  | "doubtRate"
  | "doubtClosureRate";
type SortDirection = "asc" | "desc";

const metricColors = {
  response: "#2563EB",
  understanding: "#16A34A",
  partial: "#D97706",
  doubt: "#DC2626",
  closure: "#7C3AED",
};

function classroomKey(row: SchoolClassroomHealthRow) {
  return `${row.className}|||${row.sectionName}`;
}

function classroomLabel(row: SchoolClassroomHealthRow) {
  return `Class ${row.className} · Section ${row.sectionName}`;
}

export default function SchoolOverviewPage() {
  const [showPostManager, setShowPostManager] = useState(false);
  const [showTeacherAccessManager, setShowTeacherAccessManager] = useState(false);
  const [data, setData] = useState<SchoolIntelligenceSnapshot | null>(null);
  const [classroomMetrics, setClassroomMetrics] = useState<
    SchoolClassroomSupplementalMetric[]
  >([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [range, setRange] = useState<RangeValue>("30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [subject, setSubject] = useState("ALL");
  const [teacher, setTeacher] = useState("ALL");

  const [sortKey, setSortKey] = useState<SortKey>("doubtClosureRate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [classMenuOpen, setClassMenuOpen] = useState(false);
  const classMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (
        classMenuRef.current &&
        !classMenuRef.current.contains(event.target as Node)
      ) {
        setClassMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, []);

  useEffect(() => {
    if (range === "custom" && (!customStart || !customEnd)) return;
    if (range === "custom" && customStart > customEnd) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        let snapshot: SchoolIntelligenceSnapshot;

        if (range === "custom") {
          snapshot = await loadSchoolIntelligence(
            undefined,
            customStart,
            customEnd
          );
        } else {
          snapshot = await loadSchoolIntelligence(
            Number(range) as 30 | 60 | 90
          );
        }

        if (!cancelled) {
          setData(snapshot);
        }

        try {
          let supplemental: SchoolClassroomSupplementalMetric[];

          if (range === "custom") {
            supplemental =
              await getSchoolClassroomSupplementalMetrics(
                customStart,
                customEnd
              );
          } else {
            const end = new Date();
            const start = new Date();
            start.setDate(
              end.getDate() - (Number(range) - 1)
            );

            supplemental =
              await getSchoolClassroomSupplementalMetrics(
                start.toISOString().slice(0, 10),
                end.toISOString().slice(0, 10)
              );
          }

          if (!cancelled) {
            setClassroomMetrics(supplemental);
          }
        } catch (supplementalError) {
          console.error(
            "SCHOOL CLASSROOM VERIFICATION METRICS LOAD FAILED",
            supplementalError
          );

          if (!cancelled) {
            setClassroomMetrics([]);
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(
            e?.message ??
              "Unable to load school intelligence."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [range, customStart, customEnd]);

  const classOptions = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, string>();

    data.classrooms.forEach(row => {
      map.set(classroomKey(row), classroomLabel(row));
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true })
      );
  }, [data]);

  const subjectOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (data?.classrooms ?? [])
            .map(row => row.subjectName)
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [data]
  );

  const teacherOptions = useMemo(
    () =>
      Array.from(
        new Map(
          (data?.classrooms ?? []).map(row => [
            row.teacherUuid,
            row.teacherName,
          ])
        ).entries()
      )
        .map(([uuid, name]) => ({ uuid, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  const classroomMetricsMap = useMemo(
    () =>
      new Map(
        classroomMetrics.map(metric => [
          `${metric.className}|||${metric.sectionName}`,
          metric,
        ])
      ),
    [classroomMetrics]
  );

  const visibleRows = useMemo(() => {
    const rows = (data?.classrooms ?? [])
      .filter(row => {
        const classMatch =
          selectedClasses.length === 0 ||
          selectedClasses.includes(classroomKey(row));
        const subjectMatch =
          subject === "ALL" || row.subjectName === subject;
        const teacherMatch =
          teacher === "ALL" || row.teacherUuid === teacher;

        return classMatch && subjectMatch && teacherMatch;
      })
      .map(row => {
        const metric = classroomMetricsMap.get(
          classroomKey(row)
        );

        return {
          ...row,
          totalStudents: metric?.totalStudents ?? 0,
          classHealthPercentage:
            metric?.classHealthPercentage ?? 0,
        };
      });

    return [...rows].sort((a, b) => {
      const difference = a[sortKey] - b[sortKey];
      return sortDirection === "asc" ? difference : -difference;
    });
  }, [
    data,
    classroomMetricsMap,
    selectedClasses,
    subject,
    teacher,
    sortKey,
    sortDirection,
  ]);

  const showClassAverages =
    selectedClasses.length > 0 &&
    subject === "ALL" &&
    teacher === "ALL";

  const groupedVisibleRows = useMemo(() => {
    if (!showClassAverages) return [];

    return selectedClasses.flatMap(classKey => {
      const rows = visibleRows.filter(row => classroomKey(row) === classKey);
      if (rows.length === 0) return [];

      const average = (key: SortKey) =>
        Math.round(rows.reduce((sum, row) => sum + row[key], 0) / rows.length);

      return [{
        key: classKey,
        label: classOptions.find(option => option.value === classKey)?.label ?? rows[0].classroom,
        rows,
        averageTopics: Math.round(
          rows.reduce((sum, row) => sum + row.topicsTaught, 0) / rows.length
        ),
        totalStudents: rows[0].totalStudents,
        averageClassHealthPercentage:
          rows[0].classHealthPercentage,
        averageResponseRate: average("responseRate"),
        averageUnderstandingRate: average("understandingRate"),
        averagePartialUnderstandingRate: average("partialUnderstandingRate"),
        averageDoubtRate: average("doubtRate"),
         averageDoubtClosureRate:
           (() => {
             const asked = rows.reduce(
               (sum, row) =>
                 sum + row.doubtsAsked,
               0
             );
             const resolved = rows.reduce(
               (sum, row) =>
                 sum + row.doubtsResolved,
               0
             );
             return asked === 0
               ? 0
               : Math.round(
                   (resolved / asked) * 100
                 );
           })(),
      }];
    });
  }, [showClassAverages, selectedClasses, visibleRows, classOptions]);

  function toggleClass(value: string) {
    setSelectedClasses(current =>
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value]
    );
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection(current => (current === "desc" ? "asc" : "desc"));
      return;
    }

    setSortKey(key);
    setSortDirection("desc");
  }

  function sortArrow(key: SortKey) {
    if (sortKey !== key) return "↕";
    return sortDirection === "desc" ? "↓" : "↑";
  }

  if (error) {
    return (
      <div className="school-page">
        <div className="school-section school-empty">{error}</div>
      </div>
    );
  }

  if (!data && loading) {
    return (
      <div className="school-page">
        <div className="school-section school-empty">
          Loading school intelligence…
        </div>
      </div>
    );
  }

  if (!data) return null;

  const cards = [
    [
      "Understanding",
      `${data.stats.understandingRate}%`,
      "Completely understood",
      "orange",
    ],
    ["Active Doubts", data.stats.activeDoubts, "Current learning gaps", "blue"],
    [
      "Doubt Closure Rate",
      `${data.stats.doubtResolutionRate}%`,
      `Resolved ${data.stats.resolvedDoubts} of ${data.stats.doubtsAsked} doubts`,

      "green",
    ],
    ["Responses", data.stats.responses, "Student feedback records", "purple"],
    ["Topics Taught", data.stats.topicsTaught, "Published lecture logs", "orange"],
    ["Active Teachers", data.stats.activeTeachers, "Teaching workforce", "blue"],
    [
      "Classes Reporting",
      data.stats.classesReporting,
      "Class / section coverage",
      "green",
    ],
    ["Students", data.stats.totalStudents, "Students in this school", "purple"],
  ];

  const selectedClassText =
    selectedClasses.length === 0
      ? "All Classes"
      : selectedClasses.length === 1
      ? classOptions.find(option => option.value === selectedClasses[0])?.label ??
        "1 Class"
      : `${selectedClasses.length} Classes Selected`;

  return (
    <main className="school-page">
      <style>{`
/* =========================================================
   CONTENT ABOVE DECORATIVE CARD BACKGROUNDS
   Keep headings/body text above decorative circles/gradients.
   ========================================================= */
.school-hero,
.school-section,
.school-card {
  isolation: isolate;
}
.school-hero > *,
.school-section-head > *,
.school-card > * {
  position: relative;
  z-index: 2;
}
.school-hero::before,
.school-hero::after,
.school-section::before,
.school-section::after,
.school-card::before,
.school-card::after {
  pointer-events: none;
  z-index: 0 !important;
}

        .so-filter-shell {
          margin: 18px 0 16px;
          padding: 16px;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
        }
        .so-filter-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .so-filter-field { min-width: 0; position: relative; }
        .so-filter-label {
          display: block;
          margin: 0 0 6px;
          color: #64748B;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .so-select, .so-multi-button, .so-date {
          width: 100%;
          min-height: 42px;
          box-sizing: border-box;
          border: 1px solid #D8E0EA;
          border-radius: 12px;
          background: #FFFFFF;
          color: #0F172A;
          padding: 0 12px;
          font-size: 12px;
          font-weight: 700;
          outline: none;
        }
        .so-multi-button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          text-align: left;
        }
        .so-multi-menu {
          position: absolute;
          z-index: 30;
          top: calc(100% + 7px);
          left: 0;
          width: min(330px, 90vw);
          max-height: 300px;
          overflow: auto;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          background: #FFFFFF;
          padding: 8px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, .16);
        }
        .so-multi-top {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          padding: 5px 6px 8px;
          border-bottom: 1px solid #EEF2F7;
          margin-bottom: 4px;
        }
        .so-link-button {
          border: 0;
          background: transparent;
          color: #2563EB;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }
        .so-check-row {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 8px 7px;
          border-radius: 9px;
          color: #334155;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
        }
        .so-check-row:hover { background: #F8FAFC; }
        .so-check-row input { accent-color: #2563EB; }
        .so-custom-dates {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 9px;
        }
        .so-filter-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 12px;
          color: #64748B;
          font-size: 11px;
          font-weight: 650;
        }
        .so-clear {
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          background: #FFFFFF;
          color: #334155;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }
        .so-sort-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 0;
          background: transparent;
          color: inherit;
          padding: 0;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }
        .so-sort-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 6px;
          background: rgba(255,255,255,.12);
          font-size: 12px;
        }
        .so-metric {
          font-weight: 850;
          font-variant-numeric: tabular-nums;
        }
        .so-response { color: ${metricColors.response}; }
        .so-understanding { color: ${metricColors.understanding}; }
        .so-partial { color: ${metricColors.partial}; }
        .so-doubt { color: ${metricColors.doubt}; }
         .so-closure { color: ${metricColors.closure}; }
        .so-class-average-row td {
          background: #F8FAFC;
          border-top: 2px solid #CBD5E1;
          border-bottom: 2px solid #E2E8F0;
          font-weight: 850;
        }
        .so-class-average-label {
          color: #0F172A;
          font-weight: 900;
        }
        .so-class-average-note {
          display: block;
          margin-top: 2px;
          color: #64748B;
          font-size: 10px;
          font-weight: 700;
        }
        .so-class-spacer-row td {
          height: 14px;
          padding: 0 !important;
          border: 0 !important;
          background: transparent !important;
        }
        .so-table-status {
          margin-top: 12px;
          color: #64748B;
          font-size: 11px;
          font-weight: 700;
        }

        /* =========================================================
           RESPONSIVE SAFETY LAYER
           Keep the page itself inside the viewport. The data table
           is the only intentional horizontal-scroll surface.
           ========================================================= */
        .school-page,
        .school-page * {
          box-sizing: border-box;
        }
        .school-page {
          width: 100% !important;
          max-width: 100vw !important;
          min-width: 0 !important;
          overflow-x: hidden !important;
        }
        .school-stack,
        .school-hero,
        .school-section,
        .school-section-head,
        .school-section-head > div,
        .school-metric-grid,
        .school-card,
        .so-filter-shell {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
        }
        .school-hero,
        .school-section {
          overflow: hidden !important;
        }
        .school-title,
        .school-copy,
        .school-section-title,
        .school-section-copy,
        .school-card-label,
        .school-card-value,
        .school-card-note {
          max-width: 100% !important;
          min-width: 0 !important;
          overflow-wrap: anywhere !important;
          word-break: normal !important;
        }
        .school-section-head {
          min-width: 0 !important;
        }
        .school-section-head > div {
          min-width: 0 !important;
        }
        .school-section-head .school-pill {
          flex-shrink: 1 !important;
          max-width: 100% !important;
          white-space: normal !important;
        }
        .school-table-scroll-hint {
          display: none;
          margin: 0 0 7px;
          color: #64748B;
          font-size: 9px;
          line-height: 1.35;
          font-weight: 750;
          letter-spacing: .01em;
        }
        .school-table-wrap {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior-x: contain;
          touch-action: pan-x pan-y;
          scrollbar-width: thin;
        }
        .school-table-wrap .school-table {
          margin: 0 !important;
        }

        @media (max-width: 1024px) {
          .school-page {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .school-stack {
            overflow-x: hidden !important;
          }
          .school-hero,
          .school-section {
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          .school-section-head {
            flex-wrap: wrap !important;
            gap: 10px !important;
          }
          .school-section-head > div {
            flex: 1 1 100% !important;
          }
          .school-section-head .school-pill {
            flex: 0 1 auto !important;
          }
          .school-table-scroll-hint {
            display: block !important;
          }
        }

        @media (max-width: 620px) {
          .school-page {
            padding: 0 !important;
          }
          .school-stack {
            gap: 0 !important;
          }
          .school-hero,
          .school-section {
            width: 100% !important;
            max-width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            overflow: hidden !important;
          }
          .school-title,
          .school-section-title {
            white-space: normal !important;
            line-height: 1.12 !important;
          }
          .school-copy,
          .school-section-copy {
            white-space: normal !important;
            line-height: 1.45 !important;
          }
          .school-card {
            min-width: 0 !important;
            width: 100% !important;
          }
          .so-filter-shell {
            overflow: visible !important;
          }
          .school-table-wrap {
            border-radius: 12px;
            max-width: 100% !important;
          }
          .school-table-wrap .school-table {
            width: max-content !important;
            min-width: 1120px !important;
            max-width: none !important;
          }
        }
        @media (max-width: 1050px) {
          .so-filter-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 620px) {
          .so-filter-grid { grid-template-columns: 1fr; }
          .so-custom-dates { grid-template-columns: 1fr; }
          .so-filter-summary { align-items: flex-start; flex-direction: column; }
        }
      `}</style>

      <div className="school-stack">
        <section className="school-hero">
          <p className="school-eyebrow">
            Accredited School Learning Intelligence
          </p>
          <h1 className="school-title">{data.schoolName}</h1>
          <p className="school-copy">
            Your institution-wide academic command centre across teachers,
            classrooms and student learning signals.
          </p>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setShowPostManager(true)}
                style={{
                  border: "1px solid #FDBA74",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#FFF7ED,#FFFFFF)",
                  color: "#EA580C",
                  padding: "10px 14px",
                  fontSize: 11,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(249,115,22,.08)",
                }}
              >
                + Add Post
              </button>
              <button
                type="button"
                onClick={() => setShowTeacherAccessManager(true)}
                style={{
                  border: "1px solid #BFDBFE",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#EFF6FF,#FFFFFF)",
                  color: "#1D4ED8",
                  padding: "10px 14px",
                  fontSize: 11,
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "0 6px 16px rgba(37,99,235,.08)",
                }}
              >
                + Manage Teachers
              </button>
            </div>
          </div>
        </section>

        <section className="school-section">
          <div className="school-section-head">
            <div>
              <p className="school-eyebrow">School Intelligence</p>
              <h2 className="school-section-title">
                Learning Intelligence Summary
              </h2>
              <p className="school-section-copy">
                Live aggregation from teacher daily logs and student feedback.
              </p>
            </div>
            <span className="school-pill">School Learning Ledger</span>
          </div>

          <div className="school-metric-grid">
            {cards.map(([label, value, note, tone]) => (
              <article
                key={String(label)}
                className={`school-card ${tone}`}
              >
                <div className="school-card-label">{label}</div>
                <div className="school-card-value">{value}</div>
                <div className="school-card-note">{note}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="school-section">
          <div className="school-section-head">
            <div>
              <p className="school-eyebrow">Classroom Evidence</p>
              <h2 className="school-section-title">
                Class & Section Diagnostic Health
              </h2>
              <p className="school-section-copy">
                Compare classroom response, understanding, partial
                understanding and unresolved doubt signals.
              </p>
            </div>
            <span className="school-pill">
              {visibleRows.length} of {data.classrooms.length} Classrooms
            </span>
          </div>

          <div className="so-filter-shell">
            <div className="so-filter-grid">
              <div className="so-filter-field" ref={classMenuRef}>
                <label className="so-filter-label">Class / Section</label>
                <button
                  type="button"
                  className="so-multi-button"
                  onClick={() => setClassMenuOpen(open => !open)}
                >
                  <span>{selectedClassText}</span>
                  <span>{classMenuOpen ? "▲" : "▼"}</span>
                </button>

                {classMenuOpen && (
                  <div className="so-multi-menu">
                    <div className="so-multi-top">
                      <button
                        type="button"
                        className="so-link-button"
                        onClick={() =>
                          setSelectedClasses(
                            classOptions.map(option => option.value)
                          )
                        }
                      >
                        Select all
                      </button>
                      <button
                        type="button"
                        className="so-link-button"
                        onClick={() => setSelectedClasses([])}
                      >
                        Clear
                      </button>
                    </div>

                    {classOptions.map(option => (
                      <label className="so-check-row" key={option.value}>
                        <input
                          type="checkbox"
                          checked={selectedClasses.includes(option.value)}
                          onChange={() => toggleClass(option.value)}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="so-filter-field">
                <label className="so-filter-label">Subject</label>
                <select
                  className="so-select"
                  value={subject}
                  onChange={event => setSubject(event.target.value)}
                >
                  <option value="ALL">All Subjects</option>
                  {subjectOptions.map(item => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="so-filter-field">
                <label className="so-filter-label">Teacher</label>
                <select
                  className="so-select"
                  value={teacher}
                  onChange={event => setTeacher(event.target.value)}
                >
                  <option value="ALL">All Teachers</option>
                  {teacherOptions.map(item => (
                    <option key={item.uuid} value={item.uuid}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="so-filter-field">
                <label className="so-filter-label">Timeline</label>
                <select
                  className="so-select"
                  value={range}
                  onChange={event =>
                    setRange(event.target.value as RangeValue)
                  }
                >
                  <option value="30">Last 30 Days</option>
                  <option value="60">Last 60 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="custom">Custom</option>
                </select>

                {range === "custom" && (
                  <div className="so-custom-dates">
                    <input
                      className="so-date"
                      type="date"
                      aria-label="Custom start date"
                      value={customStart}
                      onChange={event => setCustomStart(event.target.value)}
                    />
                    <input
                      className="so-date"
                      type="date"
                      aria-label="Custom end date"
                      value={customEnd}
                      onChange={event => setCustomEnd(event.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="so-filter-summary">
              <span>
                {loading
                  ? "Refreshing classroom evidence…"
                  : `${visibleRows.length} classroom rows match the current filters.`}
              </span>

              <button
                type="button"
                className="so-clear"
                onClick={() => {
                  setSelectedClasses([]);
                  setSubject("ALL");
                  setTeacher("ALL");
                }}
              >
                Clear classroom filters
              </button>
            </div>
          </div>

          <div className="school-table-scroll-hint" aria-hidden="true">
            Swipe left or right to see the data.
          </div>

          <div className="school-table-wrap">
            <table className="school-table">
              <thead>
                <tr>
                  <th>Classroom</th>
                  <th>Subject</th>
                  <th>Teacher</th>
                  <th>Total Topics Taught</th>
                  <th>Total Students</th>
                  <th>
                    <button
                      className="so-sort-button"
                      onClick={() => toggleSort("responseRate")}
                    >
                      Response %
                      <span className="so-sort-arrow">
                        {sortArrow("responseRate")}
                      </span>
                    </button>
                  </th>
                  <th>
                    <button
                      className="so-sort-button"
                      onClick={() => toggleSort("understandingRate")}
                    >
                      Understanding %
                      <span className="so-sort-arrow">
                        {sortArrow("understandingRate")}
                      </span>
                    </button>
                  </th>
                  <th>
                    <button
                      className="so-sort-button"
                      onClick={() => toggleSort("partialUnderstandingRate")}
                    >
                      Partial %
                      <span className="so-sort-arrow">
                        {sortArrow("partialUnderstandingRate")}
                      </span>
                    </button>
                  </th>
                  <th>
                    <button
                      className="so-sort-button"
                      onClick={() => toggleSort("doubtRate")}
                    >
                      Doubt %
                      <span className="so-sort-arrow">
                        {sortArrow("doubtRate")}
                      </span>
                    </button>
                  </th>
                  <th>
                     <button
                       className="so-sort-button"
                       onClick={() => toggleSort("doubtClosureRate")}
                     >
                       Doubt Closure %
                       <span className="so-sort-arrow">
                         {sortArrow("doubtClosureRate")}
                       </span>
                     </button>
                   </th>
                   <th>
                     <span className="so-sort-button">
                       Class Health %
                     </span>
                   </th>
                </tr>
              </thead>

              <tbody>
                {showClassAverages
                  ? groupedVisibleRows.map((group, groupIndex) => (
                      <Fragment key={group.key}>
                        {group.rows.map(row => (
                          <tr key={row.assignmentUuid}>
                            <td><b>{row.classroom}</b></td>
                            <td>{row.subjectName}</td>
                            <td>{row.teacherName}</td>
                            <td>{row.topicsTaught}</td>
                                                        <td>{row.totalStudents}</td>
                            <td><span className="so-metric so-response">{row.responseRate}%</span></td>
                                                        <td><span className="so-metric so-understanding">{row.understandingRate}%</span></td>
                                                        <td><span className="so-metric so-partial">{row.partialUnderstandingRate}%</span></td>
                                                        <td><span className="so-metric so-doubt">{row.doubtRate}%</span></td>
                            <td><span className="so-metric so-closure">{row.doubtClosureRate}%</span></td>
                            <td><span className="so-metric so-understanding">{row.classHealthPercentage}%</span></td>
                          </tr>
                        ))}

                        <tr className="so-class-average-row">
                          <td>
                            <span className="so-class-average-label">{group.label} Average</span>
                            <span className="so-class-average-note">
                              Overall average across {group.rows.length} subject{group.rows.length === 1 ? "" : "s"}
                            </span>
                          </td>
                          <td>All Subjects</td>
                          <td>—</td>
                          <td>{group.averageTopics}</td>
                          <td>{group.totalStudents}</td>
                          <td><span className="so-metric so-response">{group.averageResponseRate}%</span></td>
                          <td><span className="so-metric so-understanding">{group.averageUnderstandingRate}%</span></td>
                          <td><span className="so-metric so-partial">{group.averagePartialUnderstandingRate}%</span></td>
                          <td><span className="so-doubt">{group.averageDoubtRate}%</span></td>
                           <td><span className="so-metric so-closure">{group.averageDoubtClosureRate}%</span></td>
                           <td><span className="so-metric so-understanding">{group.averageClassHealthPercentage}%</span></td>
                        </tr>

                        {groupIndex < groupedVisibleRows.length - 1 && (
                          <tr className="so-class-spacer-row" aria-hidden="true">
                            <td colSpan={11} />
                          </tr>
                        )}
                      </Fragment>
                    ))
                  : visibleRows.map(row => (
                      <tr key={row.assignmentUuid}>
                        <td><b>{row.classroom}</b></td>
                        <td>{row.subjectName}</td>
                        <td>{row.teacherName}</td>
                        <td>{row.topicsTaught}</td>
                                                    <td>{row.totalStudents}</td>
                            <td><span className="so-metric so-response">{row.responseRate}%</span></td>
                                                    <td><span className="so-metric so-understanding">{row.understandingRate}%</span></td>
                                                    <td><span className="so-metric so-partial">{row.partialUnderstandingRate}%</span></td>
                                                    <td><span className="so-metric so-doubt">{row.doubtRate}%</span></td>
                            <td><span className="so-metric so-closure">{row.doubtClosureRate}%</span></td>
                            <td><span className="so-metric so-understanding">{row.classHealthPercentage}%</span></td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {!loading && visibleRows.length === 0 && (
            <div className="school-empty">
              No classroom reporting data matches these filters.
            </div>
          )}

          <div className="so-table-status">
            Response % is the average daily participation rate for the
            class/section in the selected period. Class Health % is the average
            classroom understanding score across feedback-bearing lectures in
            the selected period. A resolved pending doubt moves its earlier
            Partial / Didn't Understand signal into Understanding; an unresolved
            or Not Discussed signal keeps its original category.
          </div>
        </section>
      </div>

      {showPostManager && (
        <SchoolPostManagerPage onBack={() => setShowPostManager(false)} />
      )}

      {showTeacherAccessManager && (
        <SchoolTeacherAccessManager onClose={() => setShowTeacherAccessManager(false)} />
      )}
    </main>
  );
}
