import { useEffect, useMemo, useState } from "react";
import {
  createSchoolPost,
  deleteSchoolPost,
  getSchoolPostAudienceOptions,
  getSchoolPostResults,
  listSchoolPosts,
  replaceSchoolPostTargets,
  updateSchoolPost,
} from "../repository/SchoolPostRepository";
import type {
  SchoolPost,
  SchoolPostAudienceOption,
  SchoolPostClassResult,
  SchoolPollType,
} from "../types/SchoolPostModels";
import { requireSchoolIdentity } from "../../../services/identityService";

interface Props {
  onBack: () => void;
}

type Mode = "announcement" | "poll";

const TEMPLATES = [
  {
    key: "clean",
    label: "Clean Notice",
    description: "Minimal and professional",
    icon: "▣",
  },
  {
    key: "spotlight",
    label: "Spotlight",
    description: "Strong headline for important updates",
    icon: "✦",
  },
  {
    key: "soft",
    label: "Soft Update",
    description: "Light, friendly classroom communication",
    icon: "◌",
  },
];

const POLL_TYPES: Array<{
  key: SchoolPollType;
  label: string;
  description: string;
}> = [
  {
    key: "scale_1_10",
    label: "1–10 Scale",
    description: "Students/teachers choose a number from 1 to 10.",
  },
  {
    key: "yes_no",
    label: "Yes / No",
    description: "Simple binary response.",
  },
  {
    key: "slider_1_10",
    label: "1–10 Slider",
    description: "A compact slider response from 1 to 10.",
  },
];

function localDateTime(daysFromNow = 0, hour = 8) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toLocalInput(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SchoolPostManagerPage({ onBack }: Props) {
  const [schoolName, setSchoolName] = useState("School");
  const [mode, setMode] = useState<Mode>("announcement");
  const [posts, setPosts] = useState<SchoolPost[]>([]);
  const [classrooms, setClassrooms] = useState<SchoolPostAudienceOption[]>([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);
  const [showStudents, setShowStudents] = useState(true);
  const [showTeachers, setShowTeachers] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rulesText, setRulesText] = useState("");
  const [templateKey, setTemplateKey] = useState("clean");
  const [startsAt, setStartsAt] = useState(localDateTime(0, 8));
  const [endsAt, setEndsAt] = useState(localDateTime(7, 18));
  const [pollType, setPollType] = useState<SchoolPollType>("scale_1_10");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<"all" | "announcement" | "poll">("all");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, SchoolPostClassResult[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const identity = requireSchoolIdentity();
      setSchoolName(identity.schoolName || "School");

      const [postRows, classroomRows] = await Promise.all([
        listSchoolPosts(),
        getSchoolPostAudienceOptions(),
      ]);

      setPosts(postRows);
      setClassrooms(classroomRows);
    } catch (e: any) {
      setError(e?.message ?? "Unable to load school posts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const selectedTargetRows = useMemo(
    () =>
      selectedClassrooms.map(value => {
        const [className, sectionName] = value.split("|||");
        return { className, sectionName };
      }),
    [selectedClassrooms],
  );

  const filteredPosts = useMemo(
    () =>
      posts.filter(post =>
        historyFilter === "all" ? true : post.postType === historyFilter,
      ),
    [posts, historyFilter],
  );

  const resetComposer = () => {
    setEditingId(null);
    setMode("announcement");
    setTitle("");
    setBody("");
    setRulesText("");
    setTemplateKey("clean");
    setStartsAt(localDateTime(0, 8));
    setEndsAt(localDateTime(7, 18));
    setPollType("scale_1_10");
    setSelectedClassrooms([]);
    setShowStudents(true);
    setShowTeachers(false);
    setError("");
  };

  const toggleClassroom = (value: string) => {
    setSelectedClassrooms(current =>
      current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value],
    );
  };

  const selectAllClassrooms = () =>
    setSelectedClassrooms(
      classrooms.map(item => `${item.className}|||${item.sectionName}`),
    );

  const handleSave = async () => {
    setError("");
    setNotice("");

    if (!title.trim()) {
      setError(
        mode === "announcement"
          ? "Give the announcement a short title."
          : "Give the poll a short question/title.",
      );
      return;
    }

    if (!body.trim()) {
      setError(
        mode === "announcement"
          ? "Enter what you want to announce."
          : "Enter the poll question.",
      );
      return;
    }

    if (!showStudents && !showTeachers) {
      setError("Choose whether students, teachers, or both should see this.");
      return;
    }

    if (showStudents && selectedTargetRows.length === 0) {
      setError("Select at least one class and section for students.");
      return;
    }

    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      setError("The end time must be after the start time.");
      return;
    }

    const targets = [
      ...(showStudents
        ? selectedTargetRows.map(row => ({
            audience: "student" as const,
            className: row.className,
            sectionName: row.sectionName,
          }))
        : []),
      ...(showTeachers
        ? [
            {
              audience: "teacher" as const,
              className: null,
              sectionName: null,
            },
          ]
        : []),
    ];

    setSaving(true);

    try {
      if (editingId) {
        await updateSchoolPost(editingId, {
          title,
          body,
          templateKey,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
          rulesText,
          pollType: mode === "poll" ? pollType : null,
        });
        await replaceSchoolPostTargets(editingId, targets);
        setNotice("Post updated successfully.");
      } else {
        await createSchoolPost({
          postType: mode,
          title,
          body,
          templateKey,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
          rulesText,
          pollType: mode === "poll" ? pollType : null,
          targets,
        });
        setNotice(
          mode === "announcement"
            ? "Announcement published successfully."
            : "Poll published successfully.",
        );
      }

      await load();
      resetComposer();
    } catch (e: any) {
      setError(e?.message ?? "Unable to save this post.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (post: SchoolPost) => {
    setEditingId(post.id);
    setMode(post.postType);
    setTitle(post.title);
    setBody(post.body);
    setRulesText(post.rulesText ?? "");
    setTemplateKey(post.templateKey);
    setStartsAt(toLocalInput(post.startsAt));
    setEndsAt(toLocalInput(post.endsAt));
    setPollType(post.pollType ?? "scale_1_10");

    const studentTargets = post.targets.filter(target => target.audience === "student");
    setShowStudents(studentTargets.length > 0);
    setShowTeachers(post.targets.some(target => target.audience === "teacher"));
    setSelectedClassrooms(
      studentTargets
        .filter(target => target.className && target.sectionName)
        .map(target => `${target.className}|||${target.sectionName}`),
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (post: SchoolPost) => {
    const confirmed = window.confirm(
      `Delete this ${post.postType}? It will no longer appear in the school history or portals.`,
    );
    if (!confirmed) return;

    try {
      await deleteSchoolPost(post.id);
      setNotice("Post deleted.");
      if (editingId === post.id) resetComposer();
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Unable to delete the post.");
    }
  };

  const toggleResults = async (post: SchoolPost) => {
    if (expandedPostId === post.id) {
      setExpandedPostId(null);
      return;
    }

    setExpandedPostId(post.id);

    if (post.postType !== "poll" || results[post.id]) return;

    try {
      const rows = await getSchoolPostResults(post.id);
      setResults(current => ({ ...current, [post.id]: rows }));
    } catch (e: any) {
      setError(e?.message ?? "Unable to load poll results.");
    }
  };

  const totalResponses = (results[expandedPostId ?? ""] ?? []).reduce(
    (sum, row) => sum + row.responseCount,
    0,
  );

  const weightedValues = (results[expandedPostId ?? ""] ?? []).filter(
    row => row.average !== null,
  );

  const overallAverage =
    weightedValues.length > 0
      ? Math.round(
          (weightedValues.reduce(
            (sum, row) => sum + Number(row.average) * row.responseCount,
            0,
          ) /
            Math.max(totalResponses, 1)) *
            10,
        ) / 10
      : null;

  const overallYes = (results[expandedPostId ?? ""] ?? []).reduce(
    (sum, row) => sum + (row.yesCount ?? 0),
    0,
  );
  const overallNo = (results[expandedPostId ?? ""] ?? []).reduce(
    (sum, row) => sum + (row.noCount ?? 0),
    0,
  );

  return (
    <main className="school-post-page">
      <style>{`
        .school-post-page {
          width:100%;
          max-width:100%;
          min-width:0;
          padding:20px;
          background:#F5F6FA;
          color:#0F172A;
          overflow-x:hidden;
        }
        .school-post-shell { width:100%; max-width:1180px; margin:0 auto; }
        .school-post-hero {
          position:relative;
          overflow:hidden;
          padding:22px;
          border:1px solid #E2E8F0;
          border-radius:20px;
          background:linear-gradient(135deg,#FFFFFF 0%,#FFFCF8 70%,#FFF7ED 100%);
          box-shadow:0 8px 24px rgba(15,23,42,.04);
        }
        .school-post-hero::after {
          content:"";
          position:absolute;
          width:180px;height:180px;border-radius:50%;
          right:-95px;top:-110px;
          background:rgba(249,115,22,.06);
          pointer-events:none;
        }
        .school-post-eyebrow {
          margin:0 0 6px;
          color:#F97316;
          font-size:10px;
          font-weight:900;
          letter-spacing:.14em;
          text-transform:uppercase;
        }
        .school-post-title { margin:0; font-size:26px; line-height:1.1; font-weight:900; letter-spacing:-.04em; }
        .school-post-copy { margin:7px 0 0; color:#64748B; font-size:12px; line-height:1.55; max-width:700px; }
        .school-post-back {
          border:1px solid #E2E8F0;background:#fff;color:#334155;border-radius:11px;
          padding:9px 12px;font-size:11px;font-weight:850;cursor:pointer;
        }
        .school-post-grid { display:grid; grid-template-columns:minmax(0,1.05fr) minmax(300px,.95fr); gap:14px; margin-top:14px; }
        .school-post-card {
          border:1px solid #E2E8F0;border-radius:18px;background:#fff;
          box-shadow:0 7px 20px rgba(15,23,42,.035);padding:16px;min-width:0;
        }
        .school-post-card-head { display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:13px; }
        .school-post-card-label { margin:0;color:#F97316;font-size:9px;font-weight:900;letter-spacing:.13em;text-transform:uppercase; }
        .school-post-card-title { margin:4px 0 0;font-size:15px;font-weight:900;color:#0F172A; }
        .school-post-mode {
          display:grid;grid-template-columns:1fr 1fr;gap:7px;
          padding:4px;border:1px solid #E2E8F0;border-radius:13px;background:#F8FAFC;
        }
        .school-post-mode button {
          border:0;border-radius:9px;padding:8px 7px;background:transparent;color:#64748B;
          font-size:11px;font-weight:850;cursor:pointer;
        }
        .school-post-mode button.active { background:#FFF7ED;color:#EA580C;box-shadow:0 2px 7px rgba(249,115,22,.08); }
        .school-post-label { display:block;margin:11px 0 5px;color:#64748B;font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase; }
        .school-post-input,.school-post-textarea,.school-post-select {
          width:100%;box-sizing:border-box;border:1px solid #D8E0EA;border-radius:11px;background:#fff;
          color:#0F172A;padding:10px 11px;font-size:12px;font-weight:650;outline:none;
        }
        .school-post-textarea { min-height:100px;resize:vertical;line-height:1.5; }
        .school-post-input:focus,.school-post-textarea:focus,.school-post-select:focus { border-color:#FDBA74;box-shadow:0 0 0 3px rgba(249,115,22,.08); }
        .school-post-two { display:grid;grid-template-columns:1fr 1fr;gap:8px; }
        .school-post-checkbox {
          display:flex;align-items:flex-start;gap:8px;padding:9px;border:1px solid #E2E8F0;border-radius:11px;
          background:#F8FAFC;color:#334155;font-size:11px;font-weight:750;cursor:pointer;
        }
        .school-post-checkbox input { margin-top:2px;accent-color:#F97316; }
        .school-post-audience { display:grid;grid-template-columns:1fr 1fr;gap:8px; }
        .school-post-class-list {
          max-height:190px;overflow:auto;border:1px solid #E2E8F0;border-radius:12px;padding:6px;background:#FAFBFC;
        }
        .school-post-class-list .school-post-checkbox { border:0;background:transparent; }
        .school-post-small-action { border:0;background:transparent;color:#2563EB;font-size:10px;font-weight:850;cursor:pointer; }
        .school-post-template-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:7px; }
        .school-post-template {
          text-align:left;border:1px solid #E2E8F0;border-radius:12px;background:#fff;padding:10px;cursor:pointer;
        }
        .school-post-template.active { border-color:#FDBA74;background:#FFF7ED;box-shadow:0 4px 12px rgba(249,115,22,.06); }
        .school-post-template-icon { font-size:16px;color:#F97316;font-weight:900; }
        .school-post-template-name { margin-top:5px;font-size:10px;font-weight:900;color:#0F172A; }
        .school-post-template-copy { margin-top:2px;font-size:9px;line-height:1.35;color:#64748B; }
        .school-post-preview {
          min-height:150px;border-radius:15px;padding:16px;border:1px solid #E2E8F0;
          background:#F8FAFC;overflow:hidden;
        }
        .school-post-preview.spotlight { background:linear-gradient(135deg,#FFF7ED,#FFFFFF);border-color:#FED7AA; }
        .school-post-preview.soft { background:linear-gradient(135deg,#EFF6FF,#FFFFFF);border-color:#BFDBFE; }
        .school-post-preview-kicker { font-size:8px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;color:#F97316; }
        .school-post-preview-title { margin:5px 0 0;font-size:18px;font-weight:900;line-height:1.15; }
        .school-post-preview-body { margin:7px 0 0;color:#475569;font-size:11px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere; }
        .school-post-publish {
          margin-top:12px;width:100%;border:0;border-radius:12px;padding:11px;background:#143B73;color:#fff;
          font-size:11px;font-weight:900;cursor:pointer;box-shadow:0 7px 16px rgba(20,59,115,.12);
        }
        .school-post-publish:disabled { opacity:.55;cursor:not-allowed; }
        .school-post-notice,.school-post-error { margin-top:10px;padding:9px 11px;border-radius:10px;font-size:11px;font-weight:750;line-height:1.4; }
        .school-post-notice { color:#166534;background:#F0FDF4;border:1px solid #BBF7D0; }
        .school-post-error { color:#B91C1C;background:#FEF2F2;border:1px solid #FECACA; }
        .school-post-history { margin-top:14px; }
        .school-post-filter {
          display:flex;gap:6px;overflow-x:auto;padding-bottom:3px;
        }
        .school-post-filter button {
          flex:0 0 auto;border:1px solid #E2E8F0;background:#fff;color:#64748B;border-radius:9px;padding:7px 9px;
          font-size:10px;font-weight:850;cursor:pointer;
        }
        .school-post-filter button.active { background:#FFF7ED;border-color:#FDBA74;color:#EA580C; }
        .school-post-history-row {
          margin-top:7px;border:1px solid #E2E8F0;border-radius:13px;background:#fff;padding:11px;
        }
        .school-post-history-main { display:flex;align-items:flex-start;justify-content:space-between;gap:10px; }
        .school-post-badge { display:inline-flex;padding:4px 7px;border-radius:7px;font-size:8px;font-weight:900;letter-spacing:.06em;text-transform:uppercase; }
        .school-post-badge.announcement { background:#EFF6FF;color:#2563EB; }
        .school-post-badge.poll { background:#F5F3FF;color:#7C3AED; }
        .school-post-history-title { margin:5px 0 0;font-size:12px;font-weight:900;color:#0F172A;overflow-wrap:anywhere; }
        .school-post-history-meta { margin-top:3px;color:#64748B;font-size:9px;line-height:1.4; }
        .school-post-history-actions { display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end; }
        .school-post-mini {
          border:1px solid #E2E8F0;background:#fff;color:#334155;border-radius:8px;padding:6px 8px;font-size:9px;font-weight:850;cursor:pointer;
        }
        .school-post-mini.danger { color:#B91C1C;border-color:#FECACA;background:#FFF7F7; }
        .school-post-results { margin-top:9px;border-top:1px solid #EEF2F7;padding-top:9px; }
        .school-post-result-summary { display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:8px; }
        .school-post-result-card { padding:8px;border-radius:10px;background:#F8FAFC;border:1px solid #EEF2F7; }
        .school-post-result-value { font-size:16px;font-weight:900;color:#143B73; }
        .school-post-result-label { margin-top:2px;font-size:8px;color:#64748B;font-weight:800;text-transform:uppercase;letter-spacing:.05em; }
        .school-post-table-wrap { overflow:auto;border:1px solid #E2E8F0;border-radius:10px; }
        .school-post-table { width:100%;min-width:470px;border-collapse:collapse;font-size:9px; }
        .school-post-table th { padding:7px;background:#F8FAFC;color:#64748B;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em; }
        .school-post-table td { padding:7px;border-top:1px solid #EEF2F7;color:#334155;font-weight:700; }
        .school-post-loading { padding:24px;text-align:center;color:#64748B;font-size:11px;font-weight:750; }
        @media (max-width: 900px) {
          .school-post-page { padding:12px; }
          .school-post-grid { grid-template-columns:1fr; }
        }
        @media (max-width: 620px) {
          .school-post-page { padding:0; }
          .school-post-hero { border-radius:0;border-left:0;border-right:0;padding:14px; }
          .school-post-title { font-size:20px; }
          .school-post-copy { font-size:10px; }
          .school-post-card { border-radius:13px;padding:12px;box-shadow:none; }
          .school-post-grid { gap:8px;margin-top:8px; }
          .school-post-two,.school-post-audience { grid-template-columns:1fr; }
          .school-post-template-grid { grid-template-columns:1fr; }
          .school-post-template { display:grid;grid-template-columns:22px 1fr;column-gap:7px;align-items:center;padding:8px; }
          .school-post-template-icon { grid-row:span 2; }
          .school-post-template-copy { margin:0; }
          .school-post-input,.school-post-textarea,.school-post-select { font-size:11px;padding:9px 10px; }
          .school-post-textarea { min-height:86px; }
          .school-post-label { margin-top:9px;font-size:8px; }
          .school-post-checkbox { font-size:10px;padding:8px; }
          .school-post-preview { min-height:125px;padding:12px; }
          .school-post-preview-title { font-size:15px; }
          .school-post-preview-body { font-size:10px; }
          .school-post-card-head { margin-bottom:9px; }
          .school-post-card-title { font-size:13px; }
          .school-post-history-row { padding:9px; }
          .school-post-history-main { flex-direction:column; }
          .school-post-history-actions { justify-content:flex-start; }
          .school-post-result-summary { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      <div className="school-post-shell">
        <section className="school-post-hero">
          <div style={{ position: "relative", zIndex: 2 }}>
            <button className="school-post-back" type="button" onClick={onBack}>
              ← School Overview
            </button>
            <p className="school-post-eyebrow" style={{ marginTop: 16 }}>
              {schoolName} · School Communication
            </p>
            <h1 className="school-post-title">Posts & Pulse</h1>
            <p className="school-post-copy">
              Create announcements and quick polls for the selected school
              community. Everything published here stays controlled by the
              school and appears directly inside the student and teacher portals.
            </p>
          </div>
        </section>

        <div className="school-post-grid">
          <section className="school-post-card">
            <div className="school-post-card-head">
              <div>
                <p className="school-post-card-label">
                  {editingId ? "Edit Post" : "Create Post"}
                </p>
                <h2 className="school-post-card-title">
                  {mode === "announcement"
                    ? "Publish an announcement"
                    : "Create a school pulse poll"}
                </h2>
              </div>

              {editingId && (
                <button className="school-post-mini" type="button" onClick={resetComposer}>
                  New
                </button>
              )}
            </div>

            <div className="school-post-mode">
              <button
                type="button"
                className={mode === "announcement" ? "active" : ""}
                onClick={() => setMode("announcement")}
              >
                Announcement
              </button>
              <button
                type="button"
                className={mode === "poll" ? "active" : ""}
                onClick={() => setMode("poll")}
              >
                Poll
              </button>
            </div>

            <label className="school-post-label">
              {mode === "poll" ? "Poll question" : "Announcement title"}
            </label>
            <input
              className="school-post-input"
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder={
                mode === "poll"
                  ? "How confident are you about this unit test?"
                  : "Unit Test · Class 8 Mathematics"
              }
            />

            <label className="school-post-label">
              {mode === "poll" ? "Question details" : "What do you want to announce?"}
            </label>
            <textarea
              className="school-post-textarea"
              value={body}
              onChange={event => setBody(event.target.value)}
              placeholder={
                mode === "poll"
                  ? "Tell students and teachers what this poll is measuring."
                  : "Enter the announcement message, instructions or event details."
              }
            />

            <div className="school-post-two">
              <div>
                <label className="school-post-label">Visible from</label>
                <input
                  className="school-post-input"
                  type="datetime-local"
                  value={startsAt}
                  onChange={event => setStartsAt(event.target.value)}
                />
              </div>
              <div>
                <label className="school-post-label">Visible until</label>
                <input
                  className="school-post-input"
                  type="datetime-local"
                  value={endsAt}
                  onChange={event => setEndsAt(event.target.value)}
                />
              </div>
            </div>

            <label className="school-post-label">Specific rules / instructions</label>
            <textarea
              className="school-post-textarea"
              style={{ minHeight: 64 }}
              value={rulesText}
              onChange={event => setRulesText(event.target.value)}
              placeholder="Optional: response instructions, deadline note, dress code, event rule, etc."
            />

            {mode === "poll" && (
              <>
                <label className="school-post-label">Response format</label>
                <div style={{ display: "grid", gap: 6 }}>
                  {POLL_TYPES.map(item => (
                    <label
                      key={item.key}
                      className="school-post-checkbox"
                      style={
                        pollType === item.key
                          ? { borderColor: "#FDBA74", background: "#FFF7ED" }
                          : undefined
                      }
                    >
                      <input
                        type="radio"
                        name="school-poll-type"
                        checked={pollType === item.key}
                        onChange={() => setPollType(item.key)}
                      />
                      <span>
                        <strong style={{ display: "block", fontSize: 10 }}>
                          {item.label}
                        </strong>
                        <span
                          style={{
                            display: "block",
                            marginTop: 2,
                            color: "#64748B",
                            fontSize: 9,
                            lineHeight: 1.35,
                          }}
                        >
                          {item.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}

            <label className="school-post-label">Who should see it?</label>
            <div className="school-post-audience">
              <label className="school-post-checkbox">
                <input
                  type="checkbox"
                  checked={showStudents}
                  onChange={event => setShowStudents(event.target.checked)}
                />
                Students
              </label>
              <label className="school-post-checkbox">
                <input
                  type="checkbox"
                  checked={showTeachers}
                  onChange={event => setShowTeachers(event.target.checked)}
                />
                Teachers
              </label>
            </div>

            {showStudents && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <label className="school-post-label" style={{ margin: 0 }}>
                    Student classes & sections
                  </label>
                  <button
                    type="button"
                    className="school-post-small-action"
                    onClick={selectAllClassrooms}
                  >
                    Select all
                  </button>
                </div>

                <div className="school-post-class-list">
                  {classrooms.length === 0 ? (
                    <div className="school-post-loading">No class/section records found.</div>
                  ) : (
                    classrooms.map(classroom => {
                      const key = `${classroom.className}|||${classroom.sectionName}`;
                      return (
                        <label className="school-post-checkbox" key={key}>
                          <input
                            type="checkbox"
                            checked={selectedClassrooms.includes(key)}
                            onChange={() => toggleClassroom(key)}
                          />
                          {classroom.label}
                        </label>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {showTeachers && (
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  color: "#1E40AF",
                  fontSize: 10,
                  lineHeight: 1.4,
                  fontWeight: 700,
                }}
              >
                Teachers are targeted school-wide. If classes are selected
                above, the same class selection controls the student audience;
                teachers will see this post in their portal as well.
              </div>
            )}

            <label className="school-post-label">Choose a visual template</label>
            <div className="school-post-template-grid">
              {TEMPLATES.map(template => (
                <button
                  type="button"
                  key={template.key}
                  className={`school-post-template ${
                    templateKey === template.key ? "active" : ""
                  }`}
                  onClick={() => setTemplateKey(template.key)}
                >
                  <div className="school-post-template-icon">{template.icon}</div>
                  <div className="school-post-template-name">{template.label}</div>
                  <div className="school-post-template-copy">{template.description}</div>
                </button>
              ))}
            </div>

            {error && <div className="school-post-error">{error}</div>}
            {notice && <div className="school-post-notice">{notice}</div>}

            <button
              type="button"
              className="school-post-publish"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : editingId
                  ? "Save Changes"
                  : mode === "announcement"
                    ? "Publish Announcement"
                    : "Publish Poll"}
            </button>
          </section>

          <section className="school-post-card">
            <div className="school-post-card-head">
              <div>
                <p className="school-post-card-label">Live Preview</p>
                <h2 className="school-post-card-title">
                  This is how the post will feel inside the portals
                </h2>
              </div>
              <span className="school-post-badge announcement">
                {mode}
              </span>
            </div>

            <div className={`school-post-preview ${templateKey}`}>
              <div className="school-post-preview-kicker">
                {mode === "announcement" ? "School Announcement" : "School Pulse"}
              </div>
              <div className="school-post-preview-title">
                {title || (mode === "announcement" ? "Your announcement title" : "Your poll question")}
              </div>
              <div className="school-post-preview-body">
                {body ||
                  (mode === "announcement"
                    ? "Your message will appear here exactly as a compact portal card."
                    : "Your poll details will appear here before the response control.")}
              </div>

              {mode === "poll" && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 10,
                    borderRadius: 10,
                    background: "rgba(255,255,255,.75)",
                    border: "1px solid rgba(148,163,184,.22)",
                  }}
                >
                  <div
                    style={{
                      color: "#64748B",
                      fontSize: 8,
                      fontWeight: 900,
                      letterSpacing: ".08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Response
                  </div>
                  <div
                    style={{
                      marginTop: 5,
                      color: "#143B73",
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    {pollType === "yes_no"
                      ? "YES       NO"
                      : pollType === "slider_1_10"
                        ? "1 ─────────────── 10"
                        : "1   2   3   4   5   6   7   8   9   10"}
                  </div>
                </div>
              )}

              <div
                style={{
                  marginTop: 11,
                  color: "#94A3B8",
                  fontSize: 8,
                  fontWeight: 700,
                }}
              >
                Visible {startsAt ? new Date(startsAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—"}
                {" "}→{" "}
                {endsAt ? new Date(endsAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—"}
              </div>
            </div>

            <div
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 11,
                background: "#F8FAFC",
                border: "1px solid #EEF2F7",
                color: "#64748B",
                fontSize: 9,
                lineHeight: 1.45,
                fontWeight: 700,
              }}
            >
              The card will sit directly below the portal navigation and remain
              visible while users move between portal tabs. Polls disappear for
              a user immediately after that user submits a response.
            </div>
          </section>
        </div>

        <section className="school-post-card school-post-history">
          <div className="school-post-card-head">
            <div>
              <p className="school-post-card-label">Post History</p>
              <h2 className="school-post-card-title">
                Announcements & polls created by {schoolName}
              </h2>
            </div>
            <div className="school-post-filter">
              {(["all", "announcement", "poll"] as const).map(filter => (
                <button
                  key={filter}
                  type="button"
                  className={historyFilter === filter ? "active" : ""}
                  onClick={() => setHistoryFilter(filter)}
                >
                  {filter === "all" ? "All" : filter === "announcement" ? "Announcements" : "Polls"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="school-post-loading">Loading post history…</div>
          ) : filteredPosts.length === 0 ? (
            <div className="school-post-loading">
              No posts yet. Create your first announcement or poll above.
            </div>
          ) : (
            filteredPosts.map(post => {
              const postResults = results[post.id] ?? [];
              const expanded = expandedPostId === post.id;

              return (
                <div className="school-post-history-row" key={post.id}>
                  <div className="school-post-history-main">
                    <div style={{ minWidth: 0 }}>
                      <span className={`school-post-badge ${post.postType}`}>
                        {post.postType}
                      </span>
                      <div className="school-post-history-title">{post.title}</div>
                      <div className="school-post-history-meta">
                        Visible {formatDate(post.startsAt)} → {formatDate(post.endsAt)}
                        {" · "}
                        {post.targets.filter(t => t.audience === "student").length} student target
                        {" · "}
                        {post.targets.some(t => t.audience === "teacher") ? "Teachers" : "Students only"}
                      </div>
                    </div>

                    <div className="school-post-history-actions">
                      {post.postType === "poll" && (
                        <button
                          className="school-post-mini"
                          type="button"
                          onClick={() => void toggleResults(post)}
                        >
                          {expanded ? "Hide Results" : "Results"}
                        </button>
                      )}
                      <button className="school-post-mini" type="button" onClick={() => startEdit(post)}>
                        Edit
                      </button>
                      <button
                        className="school-post-mini danger"
                        type="button"
                        onClick={() => void handleDelete(post)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {expanded && post.postType === "poll" && (
                    <div className="school-post-results">
                      <div className="school-post-result-summary">
                        <div className="school-post-result-card">
                          <div className="school-post-result-value">{totalResponses}</div>
                          <div className="school-post-result-label">Responses</div>
                        </div>
                        <div className="school-post-result-card">
                          <div className="school-post-result-value">
                            {post.pollType === "yes_no"
                              ? `${overallYes} / ${overallNo}`
                              : overallAverage ?? "—"}
                          </div>
                          <div className="school-post-result-label">
                            {post.pollType === "yes_no" ? "Yes / No" : "Overall Avg."}
                          </div>
                        </div>
                        <div className="school-post-result-card">
                          <div className="school-post-result-value">
                            {post.targets.filter(t => t.audience === "student").length}
                          </div>
                          <div className="school-post-result-label">Targeted Classes</div>
                        </div>
                      </div>

                      <div className="school-post-table-wrap">
                        <table className="school-post-table">
                          <thead>
                            <tr>
                              <th>Class / Section</th>
                              <th>Responses</th>
                              <th>Average</th>
                              <th>Yes</th>
                              <th>No</th>
                            </tr>
                          </thead>
                          <tbody>
                            {postResults.map(row => (
                              <tr key={`${row.className}|||${row.sectionName}`}>
                                <td>{row.label}</td>
                                <td>{row.responseCount}</td>
                                <td>{row.average ?? "—"}</td>
                                <td>{row.yesCount ?? 0}</td>
                                <td>{row.noCount ?? 0}</td>
                              </tr>
                            ))}
                            {postResults.length === 0 && (
                              <tr>
                                <td colSpan={5}>No student responses yet.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
