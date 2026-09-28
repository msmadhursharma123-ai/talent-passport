import { useEffect, useMemo, useState } from "react";
import { getStudentMonthlyLearningReviewState, openStudentMonthlyLearningReview, submitStudentMonthlyLearningReview } from "../repository/StudentMonthlyLearningReviewRepository";
import { currentReviewMonth } from "../utils/MonthlyReviewDate";
import type { MonthlyLearningReviewItem, MonthlyReviewResponseState } from "../types/MonthlyLearningReviewTypes";
import LiveDoubtReconciliationGate from "../../liveDoubtIntelligence/components/LiveDoubtReconciliationGate";

interface Props { onSubmitted?: () => void; strictMandatory?: boolean; }

export default function MonthlyLearningReviewGate({ onSubmitted, strictMandatory = false }: Props) {
  const [items, setItems] = useState<MonthlyLearningReviewItem[]>([]);
  const [cycleId, setCycleId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, MonthlyReviewResponseState>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fallback, setFallback] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      let state = await getStudentMonthlyLearningReviewState(currentReviewMonth());
      if (
        !state.cycle ||
        (state.cycle.status !== "COMPLETED" && state.items.length === 0)
      ) {
        await openStudentMonthlyLearningReview(currentReviewMonth());
        state = await getStudentMonthlyLearningReviewState(currentReviewMonth());
      }
      if (state.cycle?.status === "COMPLETED") { setItems([]); setCycleId(null); onSubmitted?.(); return; }
      setCycleId(state.cycle?.id ?? null);
      setItems(state.items);
      setAnswers(Object.fromEntries(state.items.filter((i) => i.responseState).map((i) => [i.id, i.responseState as MonthlyReviewResponseState])));
    } catch (e: any) {
      // The Monthly layer is additive. If its isolated infrastructure cannot
      // load, preserve the original Live gate instead of blocking the portal.
      console.error("MONTHLY REVIEW LOAD FAILED — PRESERVING EXISTING LIVE GATE", e);
      setError("");
      setFallback(true);
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  const subjects = useMemo(() => Array.from(new Set(items.map((i) => i.subjectName))), [items]);
  const unanswered: MonthlyLearningReviewItem[] = [];
  const unresolvedCount = items.filter((i) => answers[i.id] === "UNRESOLVED").length;

  function toggleUnresolved(id: string) {
    if (submitting) return;
    setAnswers((v) => ({ ...v, [id]: v[id] === "UNRESOLVED" ? "RESOLVED" : "UNRESOLVED" }));
  }

  async function submit() {
    if (!cycleId || unanswered.length || submitting) return;
    setSubmitting(true); setError("");
    try {
      await submitStudentMonthlyLearningReview(cycleId, items.map((i) => ({ itemId: i.id, responseState: answers[i.id] ?? "RESOLVED" as MonthlyReviewResponseState })));
      setItems([]); onSubmitted?.();
    } catch (e: any) {
      console.error("MONTHLY REVIEW SUBMISSION FAILED — MANDATORY REVIEW REMAINS PENDING", e);
      setError(e?.message ?? "Unable to save the monthly review. Please retry.");
    }
    finally { setSubmitting(false); }
  }

  if (loading) return null;
  if (fallback) return <LiveDoubtReconciliationGate onSubmitted={onSubmitted}/>;
  if (items.length === 0 && !error) return null;

  return <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4" style={{ background: "rgba(7,20,45,.70)", backdropFilter: "blur(12px)" }} role="dialog" aria-modal="true" aria-labelledby="monthly-review-title">
    <div className="relative flex h-[96vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_24px_90px_rgba(7,20,45,.30)]">
      <div className="shrink-0 border-b border-slate-200 bg-gradient-to-r from-orange-50 via-white to-blue-50 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div><p className="text-[8px] font-black uppercase tracking-[0.22em] text-orange-600">Mandatory Monthly Learning Review</p><h2 id="monthly-review-title" className="mt-1 text-[18px] font-black leading-5 text-[#07142D] sm:text-[22px]">Review last month before continuing</h2><p className="mt-1 max-w-[760px] text-[9px] font-semibold leading-4 text-slate-500 sm:text-[10px]">Review everything you were taught last month. Select every topic or concept that is still unresolved. Anything you do not select is treated as understood for this monthly review.</p></div>
          <div className="shrink-0 rounded-xl border border-orange-200 bg-white/80 px-3 py-2 text-right"><div className="text-[8px] font-black uppercase tracking-wider text-slate-400">Progress</div><div className="text-[13px] font-black text-[#07142D]">{unresolvedCount}/{items.length}</div><div className="text-[7px] font-bold text-slate-400">still unresolved · {subjects.length} subjects</div></div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const value = answers[item.id];
            return <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5"><span className="rounded-full bg-slate-100 px-2 py-1 text-[7px] font-black uppercase text-slate-500">{item.subjectName}</span><span className="rounded-full bg-blue-50 px-2 py-1 text-[7px] font-black text-blue-700">{item.logDate}</span></div><h3 className="mt-2 truncate text-[11px] font-black text-[#07142D]">{item.topicName || "Teaching topic"}</h3><p className="mt-0.5 line-clamp-2 text-[9px] font-bold leading-3.5 text-slate-500">{item.conceptName || "General topic"}</p></div><span className="max-w-[130px] truncate text-right text-[7px] font-black uppercase tracking-wider text-slate-400">{item.className}-{item.sectionName}</span></div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2"><span className="truncate pr-2 text-[8px] font-semibold text-slate-400">Teacher: {item.teacherName || "Assigned teacher"}</span><span className="text-[7px] font-black uppercase text-slate-300">Monthly occurrence</span></div>
              <button type="button" disabled={submitting} onClick={() => toggleUnresolved(item.id)} aria-pressed={value === "UNRESOLVED"} className={`mt-2 flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-[8px] font-black ${value === "UNRESOLVED" ? "border-orange-400 bg-orange-50 text-orange-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[9px] ${value === "UNRESOLVED" ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 bg-white text-transparent"}`}>✓</span><span>{value === "UNRESOLVED" ? "Still unresolved" : "Mark as still unresolved"}</span></button>
            </article>;
          })}
        </div>
        {error && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[9px] font-bold text-red-700">{error}</div>}
      </div>
      {error && <div className="shrink-0 border-t border-red-100 bg-red-50 px-3 py-2 sm:px-5"><button type="button" onClick={() => void load()} disabled={loading || submitting} className="w-full rounded-xl border border-red-200 bg-white px-4 py-2 text-[9px] font-black uppercase tracking-wider text-red-700 disabled:opacity-50">Retry monthly review</button></div>}
      <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 sm:px-5"><button type="button" disabled={!cycleId || submitting} onClick={() => void submit()} className="w-full rounded-xl bg-[#0F2F63] px-4 py-3 text-[9px] font-black uppercase tracking-wider text-white shadow-sm disabled:opacity-50">{submitting ? "Saving monthly review…" : "Complete monthly review & continue"}</button><p className="mt-1.5 text-center text-[8px] font-black text-slate-400">{items.length - (Object.keys(answers).filter((id) => answers[id] === "UNRESOLVED").length)} understood · {Object.keys(answers).filter((id) => answers[id] === "UNRESOLVED").length} still unresolved</p></div>
    </div>
  </div>;
}
