import {
  useState,
  useEffect
} from "react";

import {
  getSupabaseClient
} from "../../supabaseClient";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

import {
  fetchTalentPassportScores
} from "../../supabaseClient";

import {
  requireIdentity
} from "../../services/identityService";

export default function Homeboard() {
  const [creditView, setCreditView] =
    useState<"guidelines" | "rewards">(
      "guidelines"
    );

    const [passportData, setPassportData] =
  useState<any[]>([]);


const [submissions, setSubmissions] =
  useState<any[]>([]);

const [selectedVideo, setSelectedVideo] =
  useState<any>(null);

useEffect(() => {
  loadPassport();
  loadSubmissions();
}, []);

async function loadPassport() {

  const scores =
    await fetchTalentPassportScores();

  console.log(
    "HOMEBOARD SCORES",
    scores
  );

  setPassportData(scores);
}

async function loadSubmissions() {

  const studentIdentity = requireIdentity();

const studentId = studentIdentity.studentCode;

if (!studentId) {
  return;
}

const supabase = getSupabaseClient();

if (!supabase) {
  return;
}

const { data, error } = await supabase
  .from("submissions")
  .select("*")
  .eq("student_id", studentId)
  .order("created_at", {
    ascending: false,
  });

  if (error) {

    console.error(error);

    return;

  }

  setSubmissions(data || []);

}


// ============================
// CURRENT LOGGED IN STUDENT
// ============================

const studentIdentity =
  requireIdentity();

const studentId =
  studentIdentity.parentEmail
    ?.toLowerCase()
    ?.replace("@", "_")
    ?.replace(/\./g, "_");
// ============================
// STUDENT SPECIFIC SCORES
// ============================

const studentScores =
  passportData.filter(
    (row) =>
      row.student_id ===
      studentId
  );

const hasCompetitionData =
  studentScores.length > 0;

const totalSubmissions =
  submissions.length;

const submissionCredits =
  totalSubmissions * 10;


  
// ============================
// GROWTH DATA
// ============================

const growthData =
  [...studentScores]
    .reverse()
    .map((item: any) => ({
      event: item.event_name,
      score: item.overall_score
    }));

const avgCommunication =
  hasCompetitionData
    ? Math.round(
        studentScores.reduce(
          (sum, row) =>
            sum +
            row.communication_score,
          0
        ) /
          studentScores.length
      )
    : "--";

const avgLeadership =
  hasCompetitionData
    ? Math.round(
        studentScores.reduce(
          (sum, row) =>
            sum +
            row.leadership_score,
          0
        ) /
          studentScores.length
      )
    : "--";

const avgThinking =
  hasCompetitionData
    ? Math.round(
        studentScores.reduce(
          (sum, row) =>
            sum +
            row.critical_thinking_score,
          0
        ) /
          studentScores.length
      )
    : "--";

const avgCollaboration =
  hasCompetitionData
    ? Math.round(
        studentScores.reduce(
          (sum, row) =>
            sum +
            row.collaboration_score,
          0
        ) /
          studentScores.length
      )
    : "--";

const avgConfidence =
  hasCompetitionData
    ? Math.round(
        studentScores.reduce(
          (sum, row) =>
            sum +
            row.confidence_score,
          0
        ) /
          studentScores.length
      )
    : "--";

const overallScore =
  hasCompetitionData
    ? Math.round(
        studentScores.reduce(
          (sum, row) =>
            sum +
            row.overall_score,
          0
        ) /
          studentScores.length
      )
    : "--";




    const dimensions = [
{
name: "Communication",
score: avgCommunication,
color: "#E85D04",
icon: "📢"
},
{
name: "Leadership",
score: avgLeadership,
color: "#2563EB",
icon: "👑"
},
{
name: "Critical Thinking",
score: avgThinking,
color: "#7C3AED",
icon: "🧠"
},
{
name: "Collaboration",
score: avgCollaboration,
color: "#2F9E44",
icon: "🤝"
},
{
name: "Confidence",
score: avgConfidence,
color: "#E11D48",
icon: "🎯"
}
];

const closeVideo = () =>
  setSelectedVideo(null);

 return (
    <div className="min-h-screen bg-[#F5F7FA] px-2.5 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      <div className="mx-auto max-w-[1680px] space-y-3 sm:space-y-4">

        {/* VIDEO MODAL */}
        {selectedVideo && (
          <div
            onClick={closeVideo}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#07142D]/90 p-3 sm:p-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[1080px]"
            >
              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                className="max-h-[78vh] w-full rounded-[18px] bg-black object-contain shadow-2xl"
              />
              <div className="mt-3 text-sm font-black text-white sm:text-base">
                {selectedVideo.event_name}
              </div>
            </div>
          </div>
        )}

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[18px] border border-[#DCE3EC] bg-gradient-to-r from-white via-white to-[#FFF9F4] shadow-[0_2px_8px_rgba(15,23,42,0.035)] sm:rounded-[22px]">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#FFF0E6] sm:h-56 sm:w-56" />
          <div className="pointer-events-none absolute right-[15%] -bottom-24 hidden h-44 w-44 rounded-full bg-[#EEF2FF] md:block" />
          <div className="pointer-events-none absolute right-[25%] -top-16 hidden h-28 w-28 rounded-full bg-[#FFF7F0] lg:block" />

          <div className="relative z-10 flex min-h-[150px] flex-col justify-center gap-4 px-5 py-5 sm:min-h-[165px] sm:px-7 sm:py-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div className="min-w-0 max-w-[760px]">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#F05A0A] sm:text-[10px]">
                Accredited Student Intelligence
              </p>
              <h1 className="mt-2 text-[25px] font-black leading-[1.08] tracking-[-0.04em] text-[#07142D] sm:text-[30px] lg:text-[34px]">
                Student Talent Homeboard
              </h1>
              <p className="mt-2 max-w-[680px] text-[11px] font-medium leading-[1.55] text-[#58708F] sm:text-[13px]">
                Your record across competitions.
              </p>
            </div>

            <div className="relative flex w-full items-center justify-between gap-3 rounded-[16px] border border-[#FFD2B5] bg-white/85 px-4 py-3 shadow-[0_4px_12px_rgba(249,115,22,0.05)] sm:w-[205px] sm:flex-col sm:justify-center sm:px-4 sm:py-4 sm:text-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border border-[#FFC897] bg-[#FFF8F1] text-xl">
                ◈
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.16em] text-[#F05A0A]">
                  Relative Talent Score
                </p>
                <p className="mt-1 text-[24px] font-black leading-none text-[#07142D] sm:text-[28px]">
                  {overallScore}
                  {overallScore !== "--" && (
                    <span className="ml-1 text-[10px] font-black text-[#71819A]">/100</span>
                  )}
                </p>
                <p className="mt-1 text-[9px] font-bold text-[#71819A]">
                  {studentScores.length} evaluated record{studentScores.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TALENT SCORE SUMMARY */}
        <section className="rounded-[18px] border border-[#DCE3EC] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)] sm:rounded-[22px] sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F05A0A]">
                Talent Passport Intelligence
              </p>
              <h2 className="mt-1 text-[19px] font-black tracking-[-0.025em] text-[#07142D] sm:text-[22px]">
                Talent Score Summary
              </h2>
              <p className="mt-1 text-[10px] font-medium text-[#58708F] sm:text-[12px]">
                Your current scores across the five talent dimensions.
              </p>
            </div>
            <span className="hidden text-[9px] font-black uppercase tracking-[0.14em] text-[#8A9BB3] sm:block">
              Talent Passport Ledger
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5">
            {dimensions.map((item, index) => {
              const styles = [
                { border: "#FFC58F", bg: "#FFF9F2", circle: "#FFF0E1" },
                { border: "#B9D2FF", bg: "#F4F8FF", circle: "#E8F0FF" },
                { border: "#D5C5FF", bg: "#F8F5FF", circle: "#EFE8FF" },
                { border: "#AEE8C0", bg: "#F2FCF5", circle: "#E4F8EA" },
                { border: "#F6C2D0", bg: "#FFF6F8", circle: "#FCE8EE" }
              ][index];

              return (
                <div
                  key={item.name}
                  className="relative min-w-0 overflow-hidden rounded-[14px] border p-3.5 sm:p-4"
                  style={{ borderColor: styles.border, background: styles.bg }}
                >
                  <div
                    className="pointer-events-none absolute -right-5 -top-7 h-16 w-16 rounded-full"
                    style={{ background: styles.circle }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[8px] font-black uppercase tracking-[0.1em]" style={{ color: item.color }}>
                        {item.name}
                      </p>
                      <span className="text-sm">{item.icon}</span>
                    </div>
                    <p className="mt-2.5 text-[24px] font-black leading-none sm:text-[28px]" style={{ color: item.color }}>
                      {item.score}
                    </p>
                    <p className="mt-2 text-[9px] font-bold leading-4 text-[#52637C]">
                      {item.score === "--" ? "Awaiting evaluated performance" : "Current calibrated score"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* COMPETITION HISTORY */}
        <section className="rounded-[18px] border border-[#DCE3EC] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)] sm:rounded-[22px] sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F05A0A]">
                Accredited Performance Ledger
              </p>
              <h2 className="mt-1 text-[19px] font-black tracking-[-0.025em] text-[#07142D] sm:text-[22px]">
                Competition History Ledger
              </h2>
              <p className="mt-1 text-[10px] font-medium text-[#58708F] sm:text-[12px]">
                Compare your evaluated competition performance across every active competency.
              </p>
            </div>

            <div className="w-fit rounded-[10px] border border-[#FFD1AE] bg-[#FFF9F3] px-3 py-2 text-center">
              <p className="text-[16px] font-black leading-none text-[#F05A0A]">{studentScores.length}</p>
              <p className="mt-1 text-[7px] font-black uppercase tracking-[0.12em] text-[#A64C19]">
                Evaluations
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-[12px] border border-[#DCE3EC] [-webkit-overflow-scrolling:touch]">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[2fr_1fr_repeat(5,1fr)_0.8fr] gap-2 bg-[#061632] px-4 py-3 text-[8px] font-black uppercase tracking-[0.04em] text-white">
                <div>Competition</div>
                <div>Pathway</div>
                <div>Communication</div>
                <div>Leadership</div>
                <div>Critical Thinking</div>
                <div>Collaboration</div>
                <div>Confidence</div>
                <div>Overall</div>
              </div>

              <div className="grid grid-cols-[2fr_1fr_repeat(5,1fr)_0.8fr] items-center gap-2 border-b border-[#F4D0B6] bg-[#FFF9F3] px-4 py-3">
                <div>
                  <p className="text-[11px] font-black text-[#F05A0A]">Talent Passport Average</p>
                  <p className="mt-0.5 text-[8px] font-semibold text-[#71819A]">Combined performance across all competitions</p>
                </div>
                <div className="text-[10px] font-bold text-[#8A9BB3]">—</div>
                <div className="text-[10px] font-black text-[#07142D]">{avgCommunication}</div>
                <div className="text-[10px] font-black text-[#07142D]">{avgLeadership}</div>
                <div className="text-[10px] font-black text-[#07142D]">{avgThinking}</div>
                <div className="text-[10px] font-black text-[#07142D]">{avgCollaboration}</div>
                <div className="text-[10px] font-black text-[#07142D]">{avgConfidence}</div>
                <div>
                  <span className="inline-flex rounded-[7px] bg-[#FF6B0A] px-2 py-1.5 text-[10px] font-black text-white">
                    {overallScore}
                  </span>
                </div>
              </div>

              {hasCompetitionData ? (
                studentScores.map((row) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[2fr_1fr_repeat(5,1fr)_0.8fr] items-center gap-2 border-b border-[#E8EDF3] px-4 py-3 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-black text-[#07142D]">{row.event_name}</p>
                      <p className="mt-0.5 text-[8px] font-semibold text-[#8A9BB3]">Competition Evaluation</p>
                    </div>
                    <div className="text-[9px] font-black text-[#F05A0A]">{row.pathway}</div>
                    <div className="text-[9px] font-bold text-[#52637C]">{row.communication_score}</div>
                    <div className="text-[9px] font-bold text-[#52637C]">{row.leadership_score}</div>
                    <div className="text-[9px] font-bold text-[#52637C]">{row.critical_thinking_score}</div>
                    <div className="text-[9px] font-bold text-[#52637C]">{row.collaboration_score}</div>
                    <div className="text-[9px] font-bold text-[#52637C]">{row.confidence_score}</div>
                    <div>
                      <span className="inline-flex rounded-[7px] bg-[#FF6B0A] px-2 py-1.5 text-[9px] font-black text-white">
                        {row.overall_score}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex min-h-[112px] items-center justify-center px-5 py-6 text-center">
                  <div>
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF4E8] text-base">🏆</div>
                    <p className="mt-2 text-[11px] font-black text-[#07142D]">Talent ranking will begin here</p>
                    <p className="mx-auto mt-1 max-w-[360px] text-[9px] font-medium leading-4 text-[#71819A]">
                      Competition history will populate after your first evaluated submission.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SUBMISSION EVIDENCE */}
        <section className="rounded-[18px] border border-[#DCE3EC] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)] sm:rounded-[22px] sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F05A0A]">
                Achievement Evidence
              </p>
              <h2 className="mt-1 text-[19px] font-black tracking-[-0.025em] text-[#07142D] sm:text-[22px]">
                Submission Evidence Vault
              </h2>
              <p className="mt-1 text-[10px] font-medium text-[#58708F] sm:text-[12px]">
                Verified performance records supporting your Talent Passport intelligence.
              </p>
            </div>
            <span className="hidden text-[9px] font-black uppercase tracking-[0.14em] text-[#8A9BB3] sm:block">
              {totalSubmissions} Records
            </span>
          </div>

          {submissions.length === 0 ? (
            <div className="mt-4 flex min-h-[150px] items-center justify-center rounded-[14px] border border-dashed border-[#BFCBDC] bg-[#FCFDFE] px-5 text-center sm:min-h-[170px]">
              <div>
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#FFD1AE] bg-[#FFF8F1] text-lg">◉</div>
                <p className="mt-3 text-[12px] font-black text-[#07142D]">Your performance showcase starts here</p>
                <p className="mx-auto mt-1 max-w-[420px] text-[9px] font-medium leading-4 text-[#71819A]">
                  Verified competition submissions will appear here as part of your accredited talent record.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
              <div className="flex gap-3">
                {submissions.map((item) => (
                  <article
                    key={item.id}
                    className="w-[225px] shrink-0 rounded-[14px] border border-[#FFC58F] bg-[#FFF9F3] p-3.5 sm:w-[245px]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#FFD1AE] bg-white text-base">🎭</div>
                      <span className="rounded-full border border-[#AEE8C0] bg-[#F2FCF5] px-2 py-1 text-[7px] font-black uppercase tracking-wide text-[#168A43]">
                        Verified
                      </span>
                    </div>
                    <h3 className="mt-3 line-clamp-2 text-[12px] font-black leading-4 text-[#07142D]">{item.event_name}</h3>
                    <p className="mt-2 text-[8px] font-semibold text-[#71819A]">
                      Submitted {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => setSelectedVideo(item)}
                      className="mt-3 w-full rounded-[9px] bg-[#FF6B0A] px-3 py-2.5 text-[9px] font-black uppercase tracking-wide text-white shadow-[0_3px_8px_rgba(255,107,10,0.18)] transition hover:bg-[#F05A0A]"
                    >
                      Watch Submission
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <div className="relative overflow-hidden rounded-[14px] border border-[#FFC58F] bg-[#FFF9F2] p-3 sm:p-4">
              <div className="pointer-events-none absolute -right-4 -top-6 h-14 w-14 rounded-full bg-[#FFF0E1]" />
              <p className="relative text-[7px] font-black uppercase tracking-wide text-[#B54512] sm:text-[8px]">Submissions</p>
              <p className="relative mt-2 text-[20px] font-black leading-none text-[#F05A0A] sm:text-[25px]">{totalSubmissions}</p>
              <p className="relative mt-2 hidden text-[8px] font-bold text-[#52637C] sm:block">Verified entries</p>
            </div>
            <div className="relative overflow-hidden rounded-[14px] border border-[#B9D2FF] bg-[#F4F8FF] p-3 sm:p-4">
              <div className="pointer-events-none absolute -right-4 -top-6 h-14 w-14 rounded-full bg-[#E8F0FF]" />
              <p className="relative text-[7px] font-black uppercase tracking-wide text-[#2455B5] sm:text-[8px]">Credits / Entry</p>
              <p className="relative mt-2 text-[20px] font-black leading-none text-[#2563EB] sm:text-[25px]">10</p>
              <p className="relative mt-2 hidden text-[8px] font-bold text-[#52637C] sm:block">Per submission</p>
            </div>
            <div className="relative overflow-hidden rounded-[14px] border border-[#AEE8C0] bg-[#F2FCF5] p-3 sm:p-4">
              <div className="pointer-events-none absolute -right-4 -top-6 h-14 w-14 rounded-full bg-[#E4F8EA]" />
              <p className="relative text-[7px] font-black uppercase tracking-wide text-[#19763B] sm:text-[8px]">Submission Credits</p>
              <p className="relative mt-2 text-[20px] font-black leading-none text-[#16A34A] sm:text-[25px]">{submissionCredits}</p>
              <p className="relative mt-2 hidden text-[8px] font-bold text-[#52637C] sm:block">Talent ledger credits</p>
            </div>
          </div>
        </section>

        {/* ANALYTICS */}
        <section className="rounded-[18px] border border-[#DCE3EC] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)] sm:rounded-[22px] sm:p-5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F05A0A]">
              Talent Insights
            </p>
            <h2 className="mt-1 text-[19px] font-black tracking-[-0.025em] text-[#07142D] sm:text-[22px]">
              Performance Growth Trajectory
            </h2>
            <p className="mt-1 text-[10px] font-medium text-[#58708F] sm:text-[12px]">
              Track competency development and overall competition performance over time.
            </p>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            <div className="min-w-0 rounded-[14px] border border-[#B9D2FF] bg-[#F8FBFF] p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[11px] font-black text-[#07142D] sm:text-[12px]">Competency Growth</h3>
                <span className="text-[7px] font-black uppercase tracking-wider text-[#8A9BB3]">Across Events</span>
              </div>
              <div className="mt-3 h-[210px] sm:h-[245px] lg:h-[265px]">
                {hasCompetitionData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={studentScores}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#DCE5F1" />
                      <XAxis dataKey="event_name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <YAxis domain={[50, 100]} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="communication_score" stroke="#F97316" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="leadership_score" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="critical_thinking_score" stroke="#7C3AED" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="confidence_score" stroke="#E11D48" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[12px] border border-dashed border-[#BFCBDC] bg-white px-5 text-center">
                    <div>
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF4FF] text-base">📈</div>
                      <p className="mt-2 text-[10px] font-black text-[#07142D]">Growth intelligence will appear here</p>
                      <p className="mt-1 text-[8px] font-medium text-[#71819A]">Analytics unlock after your first evaluation.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 rounded-[14px] border border-[#D5C5FF] bg-[#FBF9FF] p-3.5 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[11px] font-black text-[#07142D] sm:text-[12px]">Overall Event Comparison</h3>
                <span className="text-[7px] font-black uppercase tracking-wider text-[#8A9BB3]">Overall Score</span>
              </div>

              {hasCompetitionData ? (
                <div className="mt-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                  <div
                    className="flex h-[210px] min-w-full items-end justify-around gap-5 sm:h-[245px] lg:h-[265px]"
                    style={{ width: Math.max(420, studentScores.length * 105) }}
                  >
                    {studentScores.map((item) => (
                      <div key={item.id} className="flex h-full w-[72px] shrink-0 flex-col items-center justify-end text-center">
                        <p className="mb-2 text-[10px] font-black text-[#07142D]">{item.overall_score}</p>
                        <div
                          className="w-10 rounded-t-[9px] bg-[#7C3AED]"
                          style={{ height: `${Math.max(8, Math.min(100, item.overall_score))}%` }}
                        />
                        <p className="mt-2 line-clamp-2 w-full text-[8px] font-bold leading-3 text-[#71819A]">{item.event_name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex h-[210px] items-center justify-center rounded-[12px] border border-dashed border-[#BFCBDC] bg-white px-5 text-center sm:h-[245px] lg:h-[265px]">
                  <div>
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#F2ECFF] text-base">◎</div>
                    <p className="mt-2 text-[10px] font-black text-[#07142D]">Event comparison will appear here</p>
                    <p className="mt-1 text-[8px] font-medium text-[#71819A]">Your evaluated records will populate this comparison.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
