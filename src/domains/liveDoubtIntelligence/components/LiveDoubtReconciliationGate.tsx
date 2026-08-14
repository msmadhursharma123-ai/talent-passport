import React, { useEffect, useMemo, useState } from "react";
import {
  getStudentLiveDoubtPrompt,
  submitStudentLiveDoubtReconciliation,
  type LiveDoubtPrompt,
  type LiveDoubtSelection,
} from "../repository/LiveDoubtReconciliationRepository";
import { requireIdentity } from "../../../services/identityService";

function formatLiveDate(value: string | null | undefined) {
  if (!value) return "Not calculated yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Live calculation active";
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function LiveDoubtReconciliationGate({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState<LiveDoubtPrompt | null>(null);
  const [selections, setSelections] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const identity = requireIdentity();
      const next = await getStudentLiveDoubtPrompt(identity.studentUuid);
      setPrompt(next);
      const initial: Record<string, Set<string>> = {};
      next.subjects.forEach(subject => {
        initial[subject.subjectName] = new Set();
      });
      setSelections(initial);
    } catch (err: any) {
      console.error("LIVE DOUBT GATE LOAD FAILED", err);
      setError(err?.message ?? "Unable to load the live doubt check.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const complete = useMemo(() => {
    if (!prompt?.shouldShow) return true;
    return prompt.subjects.every(subject => selections[subject.subjectName] instanceof Set);
  }, [prompt, selections]);

  function toggle(subjectName: string, concept: string) {
    setSelections(previous => {
      const next = { ...previous };
      const set = new Set(next[subjectName] ?? []);
      if (set.has(concept)) set.delete(concept);
      else set.add(concept);
      next[subjectName] = set;
      return next;
    });
  }

  async function submit() {
    if (!prompt?.shouldShow || submitting || !complete) return;
    setSubmitting(true);
    setError("");
    try {
      const payload: LiveDoubtSelection[] = prompt.subjects.map(subject => ({
        subjectName: subject.subjectName,
        unresolvedConcepts: Array.from(selections[subject.subjectName] ?? []),
        presentedDoubtIds: subject.unresolvedDoubts.map(doubt => doubt.id),
      }));
      await submitStudentLiveDoubtReconciliation(payload, prompt.checkDate);
      await load();
    } catch (err: any) {
      console.error("LIVE DOUBT RECONCILIATION SUBMIT FAILED", err);
      setError(err?.message ?? "We could not save this live check. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const gateVisible = Boolean(prompt?.shouldShow);

  return (
    <div className="live-doubt-gate-root">
      <style>{`
        .live-doubt-gate-root{position:relative;min-height:100%;width:100%;}
        .live-doubt-gate-content{width:100%;transition:filter .25s ease;}
        .live-doubt-gate-content.is-blocked{filter:blur(5px);pointer-events:none;user-select:none;}
        .live-doubt-gate-backdrop{position:fixed;inset:0;z-index:9998;background:rgba(7,20,45,.28);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:8px;overflow:hidden;}
        .live-doubt-gate-modal{position:relative;width:min(520px,calc(100vw - 16px));max-height:min(92vh,760px);overflow:hidden;border:1px solid rgba(255,255,255,.85);border-radius:22px;background:linear-gradient(145deg,#fff 0%,#fffaf5 58%,#f4f7ff 100%);box-shadow:0 28px 80px rgba(7,20,45,.26);display:flex;flex-direction:column;}
        .live-doubt-gate-modal:before{content:"";position:absolute;width:210px;height:210px;right:-80px;top:-90px;border-radius:999px;background:radial-gradient(circle,#fed7aa 0%,rgba(254,215,170,.18) 55%,transparent 72%);pointer-events:none;}
        .live-doubt-gate-modal:after{content:"";position:absolute;width:180px;height:180px;left:-90px;bottom:-90px;border-radius:999px;background:radial-gradient(circle,#bfdbfe 0%,rgba(191,219,254,.16) 55%,transparent 72%);pointer-events:none;}
        .live-doubt-gate-head{position:relative;z-index:2;padding:13px 40px 9px 14px;border-bottom:1px solid #edf0f5;}
        .live-doubt-gate-kicker{font-size:7px;line-height:1;text-transform:uppercase;letter-spacing:1.25px;font-weight:900;color:#f97316;}
        .live-doubt-gate-title{margin:5px 0 0;font-size:15px;line-height:1.1;font-weight:950;color:#07142d;letter-spacing:-.25px;}
        .live-doubt-gate-copy{margin:4px 0 0;font-size:8.5px;line-height:1.35;font-weight:650;color:#64748b;max-width:430px;}
        .live-doubt-gate-close{position:absolute;right:9px;top:9px;width:24px;height:24px;border:1px solid #e2e8f0;border-radius:9px;background:#fff;color:#64748b;font-size:15px;font-weight:900;line-height:20px;cursor:not-allowed;}
        .live-doubt-gate-scroll{position:relative;z-index:2;overflow:auto;padding:8px 10px 9px;min-height:0;}
        .live-doubt-gate-subject{border:1px solid #e2e8f0;border-radius:13px;background:rgba(255,255,255,.9);padding:8px;margin-bottom:7px;}
        .live-doubt-gate-subject-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;}
        .live-doubt-gate-subject-name{font-size:9px;font-weight:950;color:#07142d;}
        .live-doubt-gate-count{font-size:7px;font-weight:900;color:#c2410c;background:#fff7ed;border:1px solid #fed7aa;border-radius:999px;padding:3px 6px;white-space:nowrap;}
        .live-doubt-gate-doubts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;}
        .live-doubt-gate-card{width:100%;min-height:35px;text-align:left;border:1px solid #e2e8f0;border-radius:9px;background:#f8fafc;padding:6px 7px;cursor:pointer;transition:.14s ease;display:flex;align-items:center;gap:6px;}
        .live-doubt-gate-card:hover{border-color:#cbd5e1;transform:translateY(-1px);}
        .live-doubt-gate-card.is-unresolved{background:#fff1f2;border-color:#fecdd3;box-shadow:inset 0 0 0 1px #ffe4e6;}
        .live-doubt-gate-dot{width:8px;height:8px;flex:0 0 8px;border-radius:3px;border:1px solid #cbd5e1;background:#fff;}
        .live-doubt-gate-card.is-unresolved .live-doubt-gate-dot{background:#fca5a5;border-color:#f87171;}
        .live-doubt-gate-text{font-size:7.5px;line-height:1.25;font-weight:800;color:#334155;overflow-wrap:anywhere;}
        .live-doubt-gate-help{margin:2px 0 7px;font-size:7px;line-height:1.3;color:#94a3b8;font-weight:700;}
        .live-doubt-gate-foot{position:relative;z-index:2;border-top:1px solid #edf0f5;padding:8px 10px;background:rgba(255,255,255,.9);}
        .live-doubt-gate-live{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;font-size:7px;font-weight:850;color:#64748b;}
        .live-doubt-gate-live strong{color:#15803d;}
        .live-doubt-gate-submit{width:100%;border:0;border-radius:10px;padding:8px 10px;background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;font-size:8px;font-weight:950;letter-spacing:.35px;text-transform:uppercase;box-shadow:0 7px 18px rgba(234,88,12,.22);cursor:pointer;}
        .live-doubt-gate-submit:disabled{opacity:.55;cursor:not-allowed;box-shadow:none;}
        .live-doubt-gate-error{margin-top:6px;padding:6px 7px;border:1px solid #fecdd3;background:#fff1f2;border-radius:8px;color:#be123c;font-size:7px;line-height:1.3;font-weight:800;}
        .live-doubt-gate-loading{min-height:92vh;display:flex;align-items:center;justify-content:center;padding:10px;background:#f7f9fc;}
        .live-doubt-gate-loading-card{width:min(330px,calc(100vw - 24px));padding:15px;border:1px solid #e2e8f0;border-radius:18px;background:#fff;text-align:center;box-shadow:0 15px 40px rgba(15,23,42,.08);}
        .live-doubt-gate-loading-title{font-size:11px;font-weight:950;color:#07142d;}
        .live-doubt-gate-loading-copy{margin-top:4px;font-size:8px;line-height:1.35;color:#64748b;font-weight:650;}
        @media(max-width:390px){.live-doubt-gate-modal{border-radius:18px}.live-doubt-gate-head{padding:11px 36px 8px 11px}.live-doubt-gate-title{font-size:13px}.live-doubt-gate-copy{font-size:7.5px}.live-doubt-gate-scroll{padding:7px 7px 8px}.live-doubt-gate-doubts{grid-template-columns:1fr;gap:4px}.live-doubt-gate-card{min-height:31px;padding:5px 6px}.live-doubt-gate-text{font-size:7px}.live-doubt-gate-foot{padding:7px}.live-doubt-gate-submit{padding:7px;font-size:7.5px}}
      `}</style>

      <div className={`live-doubt-gate-content ${gateVisible ? "is-blocked" : ""}`}>
        {children}
      </div>

      {loading && (
        <div className="live-doubt-gate-backdrop">
          <div className="live-doubt-gate-loading-card">
            <div className="live-doubt-gate-kicker">Live Academic Check</div>
            <div className="live-doubt-gate-loading-title">Checking your unresolved doubts…</div>
            <div className="live-doubt-gate-loading-copy">Your Talent Passport is being verified against your latest student-side learning evidence.</div>
          </div>
        </div>
      )}

      {!loading && gateVisible && prompt && (
        <div className="live-doubt-gate-backdrop" role="dialog" aria-modal="true" aria-label="Live unresolved doubt reconciliation">
          <div className="live-doubt-gate-modal">
            <div className="live-doubt-gate-head">
              <div className="live-doubt-gate-kicker">Mandatory · Live Learning Check</div>
              <div className="live-doubt-gate-title">Which doubts are still unresolved?</div>
              <div className="live-doubt-gate-copy">Select the subtopics for which your doubts are still unresolved in each subject. <strong>Do not select resolved subtopics.</strong></div>
              <button className="live-doubt-gate-close" type="button" aria-label="Mandatory check cannot be closed" title="This check is mandatory">×</button>
            </div>

            <div className="live-doubt-gate-scroll">
              {prompt.subjects.map(subject => (
                <section key={subject.subjectName} className="live-doubt-gate-subject">
                  <div className="live-doubt-gate-subject-head">
                    <div className="live-doubt-gate-subject-name">{subject.subjectName}</div>
                    <div className="live-doubt-gate-count">{subject.unresolvedCount} live doubts</div>
                  </div>
                  <div className="live-doubt-gate-help">Tap a card only if this doubt is still unresolved. Selected cards turn light red.</div>
                  <div className="live-doubt-gate-doubts">
                    {subject.unresolvedDoubts.map(doubt => {
                      const selected = selections[subject.subjectName]?.has(doubt.doubt_concept) ?? false;
                      return (
                        <button
                          key={doubt.id}
                          type="button"
                          className={`live-doubt-gate-card ${selected ? "is-unresolved" : ""}`}
                          onClick={() => toggle(subject.subjectName, doubt.doubt_concept)}
                        >
                          <span className="live-doubt-gate-dot" />
                          <span className="live-doubt-gate-text">{doubt.doubt_concept}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="live-doubt-gate-foot">
              <div className="live-doubt-gate-live">
                <span>Live calculation through</span>
                <strong>{formatLiveDate(prompt.liveCalculatedThrough)}</strong>
              </div>
              <button className="live-doubt-gate-submit" type="button" onClick={() => void submit()} disabled={submitting}>
                {submitting ? "Updating live intelligence…" : "Submit & Open Talent Passport"}
              </button>
              {error && <div className="live-doubt-gate-error">{error}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
