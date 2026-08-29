import { useEffect, useMemo, useState } from "react";
import {
  getPTMDateRangeEvidence,
  getPTMPreparedDataset,
} from "../repository/PTMRepository";
import {
  buildPTMReport,
  getPTMPeriod,
  prepareStandardPTMReports,
} from "../services/PTMService";
import { blobToBase64, buildPTMPdf } from "../services/PTMPdfService";
import { sendPTMReportEmail } from "../services/PTMEmailService";
import type {
  PTMFeedback,
  PTMLog,
  PTMPreparedDataset,
  PTMReport,
  PTMStudent,
  PTMTimePreset,
} from "../types/PTMModels";

const PERIOD_OPTIONS: Array<{ value: PTMTimePreset; label: string }> = [
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
  { value: "7", label: "1 week" },
  { value: "14", label: "2 weeks" },
  { value: "21", label: "3 weeks" },
  { value: "CUSTOM", label: "Custom date" },
];

function IndiaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  return `${parts.find((p) => p.type === "year")?.value ?? ""}-${parts.find((p) => p.type === "month")?.value ?? ""}-${parts.find((p) => p.type === "day")?.value ?? ""}`;
}

function shiftDays(base: string, amount: number) {
  const date = new Date(`${base}T00:00:00+05:30`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

function same(a: unknown, b: unknown) {
  return String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();
}

function formatDate(value: string) {
  if (!value) return "—";
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function initials(name: string) {
  return String(name || "Student")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function reportFileName(report: PTMReport) {
  const safeStudent = report.student.studentName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  return `Talent-Passport-PTM-${safeStudent || "Student"}.pdf`;
}

export default function ParentsTeacherMeetingPage() {
  const [dataset, setDataset] = useState<PTMPreparedDataset | null>(null);
  const [standardReports, setStandardReports] = useState<Map<string, Map<PTMTimePreset, PTMReport>>>(new Map());
  const [search, setSearch] = useState("");
  const [className, setClassName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [periodPreset, setPeriodPreset] = useState<PTMTimePreset>("30");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [filtersTouched, setFiltersTouched] = useState(false);
  const [selectedStudentUuid, setSelectedStudentUuid] = useState("");
  const [customEvidence, setCustomEvidence] = useState<{ logs: PTMLog[]; feedback: PTMFeedback[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void loadPreparedData();
  }, []);

  async function loadPreparedData() {
    setLoading(true);
    setError("");
    try {
      const prepared = await getPTMPreparedDataset();
      setDataset(prepared);
      setStandardReports(prepareStandardPTMReports(prepared));
    } catch (loadError: any) {
      console.error("PTM PRELOAD FAILED", loadError);
      setError(loadError?.message ?? "Unable to prepare the Parents Teacher Meeting workspace.");
    } finally {
      setLoading(false);
    }
  }

  const classOptions = useMemo(() => {
    if (!dataset) return [];
    return Array.from(new Set(dataset.assignments.map((assignment) => assignment.className).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }, [dataset]);

  const sectionOptions = useMemo(() => {
    if (!dataset) return [];
    return Array.from(
      new Set(
        dataset.assignments
          .filter((assignment) => !className || same(assignment.className, className))
          .map((assignment) => assignment.sectionName)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [dataset, className]);

  const visibleStudents = useMemo(() => {
    if (!dataset) return [];
    const query = search.trim().toLowerCase();
    return dataset.students.filter((student) => {
      if (className && !same(student.className, className)) return false;
      if (sectionName && !same(student.sectionName, sectionName)) return false;
      if (!query) return true;
      return [student.studentName, student.studentId, student.studentEmail]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [dataset, search, className, sectionName]);

  useEffect(() => {
    if (!filtersTouched || visibleStudents.length === 0) {
      if (visibleStudents.length === 0) setSelectedStudentUuid("");
      return;
    }
    if (!selectedStudentUuid || !visibleStudents.some((student) => student.studentUuid === selectedStudentUuid)) {
      setSelectedStudentUuid(visibleStudents.length === 1 || search.trim() ? visibleStudents[0].studentUuid : "");
    }
  }, [filtersTouched, visibleStudents, selectedStudentUuid, search]);

  const selectedStudent = useMemo(
    () => visibleStudents.find((student) => student.studentUuid === selectedStudentUuid) ?? null,
    [visibleStudents, selectedStudentUuid]
  );

  const currentReport = useMemo(() => {
    if (!dataset || !selectedStudent) return null;
    if (periodPreset !== "CUSTOM") {
      return standardReports.get(selectedStudent.studentUuid)?.get(periodPreset) ?? null;
    }
    if (!customStart || !customEnd || customStart > customEnd) return null;
    const period = getPTMPeriod("CUSTOM", customStart, customEnd);
    return buildPTMReport(
      dataset,
      selectedStudent,
      period,
      customEvidence?.logs ?? dataset.logs,
      customEvidence?.feedback ?? dataset.feedback
    );
  }, [dataset, selectedStudent, periodPreset, standardReports, customStart, customEnd, customEvidence]);

  const preloadStart = useMemo(() => shiftDays(IndiaToday(), -89), []);

  async function prepareCustomEvidence(startDate: string, endDate: string) {
    if (!dataset || !startDate || !endDate || startDate > endDate) {
      setCustomEvidence(null);
      return;
    }

    const assignmentIds = dataset.assignments.map((assignment) => assignment.id);
    const alreadyLoaded = startDate >= preloadStart && endDate <= IndiaToday();
    if (alreadyLoaded) {
      setCustomEvidence(null);
      return;
    }

    setLoadingCustom(true);
    setError("");
    try {
      const evidence = await getPTMDateRangeEvidence(assignmentIds, startDate, endDate);
      setCustomEvidence(evidence);
    } catch (customError: any) {
      console.error("PTM CUSTOM RANGE LOAD FAILED", customError);
      setError(customError?.message ?? "Unable to load the selected custom date range.");
      setCustomEvidence(null);
    } finally {
      setLoadingCustom(false);
    }
  }

  function touch() {
    setFiltersTouched(true);
    setEmailMessage("");
  }

  function handleClassChange(value: string) {
    touch();
    setClassName(value);
    setSectionName("");
    setSelectedStudentUuid("");
  }

  function handleSectionChange(value: string) {
    touch();
    setSectionName(value);
    setSelectedStudentUuid("");
  }

  function handlePeriodChange(value: PTMTimePreset) {
    touch();
    setPeriodPreset(value);
    setCustomEvidence(null);
    setEmailMessage("");
    if (value === "CUSTOM") {
      const today = IndiaToday();
      setCustomStart(shiftDays(today, -29));
      setCustomEnd(today);
      void prepareCustomEvidence(shiftDays(today, -29), today);
    }
  }

  async function downloadReport(report: PTMReport) {
    const blob = buildPTMPdf(report);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = reportFileName(report);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function emailReport(report: PTMReport) {
    setEmailMessage("");
    setEmailSending(true);
    try {
      const pdfBlob = buildPTMPdf(report);
      const pdfBase64 = await blobToBase64(pdfBlob);
      const result = await sendPTMReportEmail(report, pdfBase64);
      if (!result.success) {
        setEmailMessage(result.error ?? "Unable to send the report.");
        return;
      }
      setEmailMessage(
        result.alreadySent
          ? "This exact report was already sent to the registered parent email."
          : "PTM report sent successfully to the registered parent email."
      );
    } catch (emailError: any) {
      console.error("PTM EMAIL FAILED", emailError);
      setEmailMessage(emailError?.message ?? "Unable to send the report.");
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <div className="ptm-page">
      <style>{`
        .ptm-page {
          min-height: 100%;
          padding: 20px;
          box-sizing: border-box;
          background: #F6F7F9;
          color: #0F172A;
          overflow-x: hidden;
        }
        .ptm-shell { max-width: 1240px; margin: 0 auto; }

        /* Shared Teacher Portal hero language — intentionally matches
           My Classroom / Daily Log / Teaching Journal. */
        .ptm-hero {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 18px;
          padding: 26px 28px;
          background: linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 72%, #FFF9F3 100%);
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.045);
        }
        .ptm-hero::before {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          right: -60px;
          top: -85px;
          border-radius: 50%;
          background: rgba(249, 115, 22, 0.06);
          pointer-events: none;
        }
        .ptm-hero::after {
          content: "";
          position: absolute;
          width: 150px;
          height: 150px;
          right: 180px;
          bottom: -105px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.04);
          pointer-events: none;
        }
        .ptm-hero-copy { position: relative; z-index: 1; min-width: 0; flex: 1 1 auto; }
        .ptm-hero-badge {
          position: relative;
          z-index: 1;
          width: 82px;
          height: 82px;
          min-width: 82px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #FFF8F1 0%, #FFFFFF 100%);
          border: 1px solid #FED7AA;
          border-radius: 22px;
          box-shadow: 0 10px 24px rgba(249, 115, 22, 0.08);
        }
        .ptm-hero-badge-icon { font-size: 24px; line-height: 1; margin-bottom: 6px; }
        .ptm-hero-badge-label { color: #F97316; font-size: 8px; font-weight: 800; letter-spacing: 1.1px; text-align: center; }
        .ptm-eyebrow { color: #F97316; font-size: 11px; font-weight: 800; letter-spacing: 2.2px; text-transform: uppercase; margin-bottom: 10px; }
        .ptm-title { margin: 0; font-size: 34px; line-height: 1.15; letter-spacing: -.7px; font-weight: 800; color: #0F172A; }
        .ptm-copy { margin: 13px 0 0; max-width: 760px; font-size: 16px; line-height: 1.65; color: #64748B; font-weight: 500; }
        .ptm-prepared { margin-top: 12px; display: inline-flex; padding: 6px 9px; border-radius: 8px; background: rgba(255,255,255,.72); border: 1px solid rgba(148,163,184,.18); color:#64748B; font-size: 8px; font-weight: 800; letter-spacing: .6px; }

        .ptm-filter-card, .ptm-result-card, .ptm-report-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 17px; box-shadow: 0 8px 24px rgba(15,23,42,.045); }
        .ptm-filter-card { margin-top: 10px; padding: 15px; }
        .ptm-filter-grid { display: grid; grid-template-columns: minmax(230px, 1.7fr) repeat(3, minmax(130px, 1fr)); gap: 9px; }
        .ptm-field label { display:block; margin-bottom: 5px; color:#64748B; font-size:8px; font-weight:800; letter-spacing:.8px; text-transform:uppercase; }
        .ptm-field input, .ptm-field select { width:100%; min-width:0; box-sizing:border-box; height:38px; border:1px solid #CBD5E1; border-radius:10px; background:#FFFFFF; color:#0F172A; padding:0 10px; font-size:11px; font-weight:700; outline:none; }
        .ptm-field input:focus, .ptm-field select:focus { border-color:#FDBA74; box-shadow:0 0 0 3px rgba(249,115,22,.08); }
        .ptm-custom-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-top:9px; }
        .ptm-status { margin-top:9px; display:flex; align-items:center; justify-content:space-between; gap:10px; color:#94A3B8; font-size:9px; font-weight:700; }
        .ptm-results { margin-top:10px; }
        .ptm-result-card { padding:13px; }
        .ptm-student-list { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:9px; }
        .ptm-student-item { border:1px solid #E2E8F0; border-radius:13px; padding:11px; background:#FFFFFF; cursor:pointer; text-align:left; transition:.16s ease; }
        .ptm-student-item:hover { border-color:#FDBA74; background:#FFF7ED; }
        .ptm-avatar { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; background:#FFF7ED; border:1px solid #FED7AA; color:#EA580C; font-size:11px; font-weight:800; flex:none; }
        .ptm-student-row { display:flex; gap:9px; align-items:center; }
        .ptm-student-name { font-size:12px; font-weight:800; color:#0F172A; line-height:1.25; }
        .ptm-student-meta { margin-top:3px; color:#64748B; font-size:8.5px; font-weight:700; line-height:1.4; }
        .ptm-report-card { margin-top:10px; padding:15px; }
        .ptm-report-head {
          position:relative;
          overflow:hidden;
          display:flex;
          align-items:flex-start;
          justify-content:space-between;
          gap:12px;
          margin:-15px -15px 0;
          padding:18px 15px 14px;
          background:linear-gradient(135deg,#FFFFFF 0%,#FFFFFF 72%,#FFF9F3 100%);
          color:#0F172A;
          border-radius:17px 17px 0 0;
          border-bottom:1px solid #E2E8F0;
        }
        .ptm-report-head::after { content:""; position:absolute; width:130px; height:130px; right:-45px; top:-72px; border-radius:50%; background:rgba(249,115,22,.045); pointer-events:none; }
        .ptm-report-head > div:first-child { position:relative; z-index:1; min-width:0; }
        .ptm-report-actions { position:relative; z-index:1; display:flex; gap:7px; flex-wrap:wrap; justify-content:flex-end; }
        .ptm-report-head .ptm-section-kicker { color:#F97316; }
        .ptm-report-head .ptm-btn { border-color:#CBD5E1; background:#FFFFFF; color:#334155; }
        .ptm-report-head .ptm-btn.primary { background:#FFF7ED; border-color:#FDBA74; color:#C2410C; }
        .ptm-btn { border:1px solid #CBD5E1; background:#FFFFFF; color:#334155; border-radius:9px; padding:8px 10px; font-size:9px; font-weight:800; cursor:pointer; }
        .ptm-btn.primary { background:#FFF7ED; border-color:#FDBA74; color:#C2410C; }
        .ptm-btn:disabled { opacity:.55; cursor:not-allowed; }
        .ptm-report-title { margin:4px 0 3px; font-size:20px; line-height:1.1; font-weight:800; color:#0F172A; }
        .ptm-report-subtitle { color:#64748B; font-size:9px; font-weight:700; line-height:1.45; }
        .ptm-metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; margin-top:12px; }
        .ptm-metric { border:1px solid #E2E8F0; border-radius:12px; background:#F8FAFC; padding:10px; }
        .ptm-metric-label { color:#64748B; font-size:7.5px; font-weight:800; letter-spacing:.7px; text-transform:uppercase; }
        .ptm-metric-value { margin-top:5px; color:#0F172A; font-size:18px; font-weight:800; line-height:1; }
        .ptm-section { margin-top:14px; }
        .ptm-section-head { margin-bottom:8px; }
        .ptm-section-kicker { color:#F97316; font-size:8px; font-weight:800; letter-spacing:1.1px; text-transform:uppercase; }
        .ptm-section-title { margin:4px 0 0; color:#0F172A; font-size:14px; font-weight:800; }
        .ptm-section-copy { margin:3px 0 0; color:#94A3B8; font-size:8.5px; font-weight:700; line-height:1.4; }
        .ptm-subject-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:9px; }
        .ptm-subject { border:1px solid #E2E8F0; border-radius:13px; padding:11px; background:#FFFFFF; }
        .ptm-subject-top { display:flex; align-items:center; justify-content:space-between; gap:8px; }
        .ptm-subject-name { font-size:12px; font-weight:800; color:#0F172A; }
        .ptm-subject-score { padding:5px 7px; border-radius:999px; background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE; font-size:8px; font-weight:800; white-space:nowrap; }
        .ptm-subject-stats { margin-top:8px; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:5px; }
        .ptm-mini { padding:7px; border-radius:9px; background:#F8FAFC; border:1px solid #EEF2F7; }
        .ptm-mini-label { color:#94A3B8; font-size:6.8px; font-weight:800; text-transform:uppercase; }
        .ptm-mini-value { margin-top:3px; color:#0F172A; font-size:10px; font-weight:800; }
        .ptm-topic-list { margin-top:8px; display:flex; flex-wrap:wrap; gap:5px; }
        .ptm-topic { padding:5px 7px; border-radius:7px; background:#FFF7ED; color:#9A3412; border:1px solid #FED7AA; font-size:7.5px; font-weight:700; }
        .ptm-doubt-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
        .ptm-doubt { border:1px solid #FECACA; background:#FEF2F2; border-radius:12px; padding:10px; }
        .ptm-doubt-head { display:flex; justify-content:space-between; gap:8px; color:#991B1B; font-size:9px; font-weight:800; }
        .ptm-doubt-item { margin-top:6px; padding-top:6px; border-top:1px solid #FEE2E2; color:#7F1D1D; font-size:8px; font-weight:700; line-height:1.45; }
        .ptm-discussion { display:grid; gap:6px; }
        .ptm-discussion-item { padding:9px 10px; border-left:3px solid #F97316; background:#FFF7ED; border-radius:8px; color:#7C2D12; font-size:8.5px; font-weight:700; line-height:1.45; }
        .ptm-empty { padding:24px 14px; text-align:center; border:1px dashed #CBD5E1; border-radius:13px; background:#FFFFFF; }
        .ptm-empty-title { color:#334155; font-size:12px; font-weight:800; }
        .ptm-empty-copy { margin-top:4px; color:#94A3B8; font-size:8.5px; font-weight:700; line-height:1.45; }
        .ptm-alert { margin-top:9px; padding:9px 10px; border-radius:9px; font-size:8.5px; font-weight:800; }
        .ptm-alert.error { background:#FEF2F2; border:1px solid #FECACA; color:#B91C1C; }
        .ptm-alert.success { background:#ECFDF5; border:1px solid #BBF7D0; color:#166534; }
        @media (max-width: 1024px) {
          .ptm-page { padding:12px; }
          .ptm-hero { padding:16px 18px; margin-bottom:12px; border-radius:18px; gap:12px; }
          .ptm-eyebrow { font-size:8px; letter-spacing:1.2px; margin-bottom:5px; }
          .ptm-title { font-size:23px; line-height:1.08; }
          .ptm-copy { margin-top:6px; font-size:11px; line-height:1.38; }
          .ptm-hero-badge { width:58px; height:58px; min-width:58px; border-radius:15px; }
          .ptm-hero-badge-icon { font-size:19px; margin-bottom:3px; }
          .ptm-hero-badge-label { font-size:5px; letter-spacing:.5px; }
          .ptm-prepared { margin-top:8px; padding:5px 7px; font-size:7px; }
          .ptm-filter-grid { grid-template-columns:1fr 1fr; }
          .ptm-filter-grid .ptm-field:first-child { grid-column:1 / -1; }
          .ptm-student-list { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .ptm-report-card { border-radius:15px; }
          .ptm-report-head { margin:-15px -15px 0; padding:16px 15px 13px; }
        }
        @media (max-width: 600px) {
          .ptm-page { padding:8px; }
          .ptm-hero { padding:15px 16px; margin-bottom:8px; border-radius:16px; gap:7px; }
          .ptm-eyebrow { font-size:6px; letter-spacing:.8px; margin-bottom:3px; }
          .ptm-title { font-size:18px; line-height:1.08; }
          .ptm-copy { margin-top:5px; font-size:9px; line-height:1.3; }
          .ptm-hero-badge { width:48px; height:48px; min-width:48px; border-radius:12px; }
          .ptm-hero-badge-icon { font-size:13px; margin-bottom:2px; }
          .ptm-hero-badge-label { font-size:3.7px; letter-spacing:.25px; }
          .ptm-prepared { margin-top:6px; padding:4px 6px; font-size:5.5px; }
          .ptm-filter-card, .ptm-report-card, .ptm-result-card { padding:10px; border-radius:13px; }
          .ptm-filter-grid, .ptm-custom-grid { grid-template-columns:1fr; }
          .ptm-filter-grid .ptm-field:first-child { grid-column:auto; }
          .ptm-status { align-items:flex-start; flex-direction:column; }
          .ptm-student-list, .ptm-subject-grid, .ptm-doubt-grid { grid-template-columns:1fr; }
          .ptm-report-head { flex-direction:column; margin:-10px -10px 0; padding:14px 10px 11px; border-radius:13px 13px 0 0; }
          .ptm-report-actions { width:100%; justify-content:flex-start; }
          .ptm-metrics { grid-template-columns:repeat(2,minmax(0,1fr)); }
          .ptm-metric-value { font-size:16px; }
        }
      `}</style>

      <div className="ptm-shell">
        <section className="ptm-hero">
          <div className="ptm-hero-copy">
          <div className="ptm-eyebrow">Teacher Portal · Parent Discussion Intelligence</div>
          <h1 className="ptm-title">Parents Teacher Meeting</h1>
          <p className="ptm-copy">
   Get detailed insights into each assigned student’s learning progress, subject performance, and pending doubts to facilitate a productive parent-teacher discussion.
          </p>
          <div className="ptm-prepared">BACKGROUND INTELLIGENCE · SUBJECTS · FEEDBACK · TOPICS · PENDING DOUBTS</div>
          </div>
          <div className="ptm-hero-badge" aria-hidden="true">
            <div className="ptm-hero-badge-icon">♡</div>
            <div className="ptm-hero-badge-label">PARENT<br />MEETING</div>
          </div>
        </section>

        <section className="ptm-filter-card">
          <div className="ptm-filter-grid">
            <div className="ptm-field">
              <label>Search student</label>
              <input
                value={search}
                onChange={(event) => {
                  touch();
                  setSearch(event.target.value);
                }}
                placeholder="Search by student name, ID or registered email"
              />
            </div>
            <div className="ptm-field">
              <label>Class</label>
              <select value={className} onChange={(event) => handleClassChange(event.target.value)}>
                <option value="">All classes</option>
                {classOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="ptm-field">
              <label>Section</label>
              <select value={sectionName} onChange={(event) => handleSectionChange(event.target.value)} disabled={!className}>
                <option value="">All sections</option>
                {sectionOptions.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="ptm-field">
              <label>Time period</label>
              <select value={periodPreset} onChange={(event) => handlePeriodChange(event.target.value as PTMTimePreset)}>
                {PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </div>

          {periodPreset === "CUSTOM" && (
            <div className="ptm-custom-grid">
              <div className="ptm-field">
                <label>From</label>
                <input type="date" value={customStart} max={customEnd || IndiaToday()} onChange={(event) => { touch(); setCustomStart(event.target.value); setCustomEvidence(null); void prepareCustomEvidence(event.target.value, customEnd); }} />
              </div>
              <div className="ptm-field">
                <label>To</label>
                <input type="date" value={customEnd} min={customStart || undefined} max={IndiaToday()} onChange={(event) => { touch(); setCustomEnd(event.target.value); setCustomEvidence(null); void prepareCustomEvidence(customStart, event.target.value); }} />
              </div>
            </div>
          )}

          <div className="ptm-status">
            <span>
              {loading
                ? "Preparing teacher-assigned student intelligence…"
                : loadingCustom
                  ? "Preparing the selected custom date range…"
                  : dataset
                    ? `${dataset.students.length} assigned students · ${dataset.assignments.length} active subject assignments prepared`
                    : "No prepared data"}
            </span>
            {filtersTouched && <span>{visibleStudents.length} matching student{visibleStudents.length === 1 ? "" : "s"}</span>}
          </div>
          {error && <div className="ptm-alert error">{error}</div>}
          {emailMessage && <div className={`ptm-alert ${emailMessage.toLowerCase().includes("successfully") || emailMessage.toLowerCase().includes("already sent") ? "success" : "error"}`}>{emailMessage}</div>}
        </section>

        {filtersTouched && !selectedStudent && (
          <section className="ptm-results">
            {visibleStudents.length > 0 ? (
              <div className="ptm-result-card">
                <div className="ptm-section-head">
                  <div className="ptm-section-kicker">Ready to Discuss</div>
                  <h2 className="ptm-section-title">Select the student report</h2>
                  <p className="ptm-section-copy">The calculation template is identical for every student; only the underlying student data changes.</p>
                </div>
                <div className="ptm-student-list">
                  {visibleStudents.map((student) => (
                    <button key={student.studentUuid} type="button" className="ptm-student-item" onClick={() => setSelectedStudentUuid(student.studentUuid)}>
                      <div className="ptm-student-row">
                        <div className="ptm-avatar">{initials(student.studentName)}</div>
                        <div>
                          <div className="ptm-student-name">{student.studentName}</div>
                          <div className="ptm-student-meta">Class {student.className} · Section {student.sectionName}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ptm-empty">
                <div className="ptm-empty-title">No assigned student matches this selection</div>
                <div className="ptm-empty-copy">Change the search, class or section. PTM only exposes students who belong to classrooms assigned to the authenticated teacher.</div>
              </div>
            )}
          </section>
        )}

        {filtersTouched && selectedStudent && currentReport && (
          <section className="ptm-report-card">
            <div className="ptm-report-head">
              <div>
                <div className="ptm-section-kicker">Ready to Discuss · Talent Passport</div>
                <h2 className="ptm-report-title">{currentReport.student.studentName}</h2>
                <div className="ptm-report-subtitle">
                  Class {currentReport.student.className} · Section {currentReport.student.sectionName} · {currentReport.schoolName} · {currentReport.period.label}
                </div>
              </div>
              <div className="ptm-report-actions">
                <button className="ptm-btn" type="button" onClick={() => void downloadReport(currentReport)}>Download PDF</button>
              </div>
            </div>

            <div className="ptm-metrics">
              <div className="ptm-metric"><div className="ptm-metric-label">Combined understanding</div><div className="ptm-metric-value">{currentReport.combinedUnderstandingPercentage}%</div></div>
              <div className="ptm-metric"><div className="ptm-metric-label">Feedback response</div><div className="ptm-metric-value">{currentReport.overallResponseRate}%</div></div>
              <div className="ptm-metric"><div className="ptm-metric-label">Feedback days</div><div className="ptm-metric-value">{currentReport.feedbackDays}</div></div>
              <div className="ptm-metric"><div className="ptm-metric-label">Current doubts</div><div className="ptm-metric-value">{currentReport.pendingDoubts.reduce((sum, group) => sum + group.count, 0)}</div></div>
            </div>

            <div className="ptm-section">
              <div className="ptm-section-head">
                <div className="ptm-section-kicker">01 · Coverage</div>
                <h3 className="ptm-section-title">Daily logs and feedback</h3>
                <p className="ptm-section-copy">{currentReport.totalFeedbackResponses} feedback response{currentReport.totalFeedbackResponses === 1 ? "" : "s"} submitted out of {currentReport.totalLogs} daily lecture log{currentReport.totalLogs === 1 ? "" : "s"} published to this student's assigned classrooms.</p>
              </div>
            </div>

            <div className="ptm-section">
              <div className="ptm-section-head">
                <div className="ptm-section-kicker">02 · Understanding</div>
                <h3 className="ptm-section-title">Subject-wise learning snapshot</h3>
              </div>
              <div className="ptm-subject-grid">
                {currentReport.subjects.map((subject) => (
                  <article key={subject.subject} className="ptm-subject">
                    <div className="ptm-subject-top">
                      <div className="ptm-subject-name">{subject.subject}</div>
                      <div className="ptm-subject-score">{subject.understandingPercentage}% understanding</div>
                    </div>
                    <div className="ptm-subject-stats">
                      <div className="ptm-mini"><div className="ptm-mini-label">Logs</div><div className="ptm-mini-value">{subject.logsCount}</div></div>
                      <div className="ptm-mini"><div className="ptm-mini-label">Responses</div><div className="ptm-mini-value">{subject.feedbackCount}</div></div>
                      <div className="ptm-mini"><div className="ptm-mini-label">Rate</div><div className="ptm-mini-value">{subject.responseRate}%</div></div>
                    </div>
                    <div className="ptm-topic-list">
                      {subject.topics.length > 0 ? subject.topics.map((topic) => <span className="ptm-topic" key={topic}>{topic}</span>) : <span className="ptm-section-copy">No topic recorded in this period.</span>}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="ptm-section">
              <div className="ptm-section-head">
                <div className="ptm-section-kicker">03 · Current intelligence</div>
                <h3 className="ptm-section-title">Pending doubts by subject</h3>
                <p className="ptm-section-copy">Current unresolved doubts are shown separately from the selected reporting window.</p>
              </div>
              {currentReport.pendingDoubts.length > 0 ? (
                <div className="ptm-doubt-grid">
                  {currentReport.pendingDoubts.map((group) => (
                    <article className="ptm-doubt" key={group.subject}>
                      <div className="ptm-doubt-head"><span>{group.subject}</span><span>{group.count}</span></div>
                      {group.items.map((item, index) => <div className="ptm-doubt-item" key={`${item.topic}-${item.concept}-${index}`}>{item.topic} · {item.concept}</div>)}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="ptm-empty"><div className="ptm-empty-title">No current pending doubts</div><div className="ptm-empty-copy">No unresolved doubt is currently recorded for this student in the teacher's assigned classrooms.</div></div>
              )}
            </div>

            <div className="ptm-section">
              <div className="ptm-section-head">
                <div className="ptm-section-kicker">04 · Parent discussion</div>
                <h3 className="ptm-section-title">Ready to discuss</h3>
              </div>
              <div className="ptm-discussion">
                {currentReport.discussionPoints.map((point, index) => <div className="ptm-discussion-item" key={`${index}-${point}`}>{point}</div>)}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
