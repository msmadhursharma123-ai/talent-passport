import { useEffect, useMemo, useState } from "react";
import {
  getStudentLiveReconciliationState,
  submitStudentLiveReconciliation,
  type LiveReconciliationSubject,
} from "../repository/LiveDoubtReconciliationRepository";

interface Props {
  onSubmitted?: () => void;
}

function buildInitialSelection(subjects: LiveReconciliationSubject[]) {
  const state: Record<string, string[]> = {};
  subjects.forEach((subject) => {
    state[subject.subjectName] = [];
  });
  return state;
}

function buildInitialNothingResolved(subjects: LiveReconciliationSubject[]) {
  const state: Record<string, boolean> = {};
  subjects.forEach((subject) => {
    state[subject.subjectName] = false;
  });
  return state;
}

export default function LiveDoubtReconciliationGate({
  onSubmitted,
}: Props) {
  const [subjects, setSubjects] = useState<LiveReconciliationSubject[]>([]);
  const [checking, setChecking] = useState(true);
  const [available, setAvailable] = useState(true);
  const [resolvedSelections, setResolvedSelections] = useState<Record<string, string[]>>({});
  const [nothingResolved, setNothingResolved] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  async function load() {
    try {
      setChecking(true);
      setError("");
      setLoadFailed(false);

      const result = await getStudentLiveReconciliationState();

      setAvailable(result.available);
      setSubjects(result.eligibleSubjects);
      setResolvedSelections(buildInitialSelection(result.eligibleSubjects));
      setNothingResolved(buildInitialNothingResolved(result.eligibleSubjects));

      if (!result.available) {
        setLoadFailed(false);
      }
    } catch (loadError) {
      console.error(
        "LIVE DOUBT RECONCILIATION GATE LOAD FAILED",
        loadError
      );
      setAvailable(false);
      setSubjects([]);
      setLoadFailed(true);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "The live learning check could not be loaded."
      );
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const totalDoubts = useMemo(
    () =>
      subjects.reduce(
        (total, subject) => total + subject.doubts.length,
        0
      ),
    [subjects]
  );

  function toggle(
    subjectName: string,
    doubtId: string
  ) {
    if (submitting) return;

    setResolvedSelections((current) => {
      const selected = current[subjectName] ?? [];
      const nextSelected = selected.includes(doubtId)
        ? selected.filter((id) => id !== doubtId)
        : [...selected, doubtId];

      return {
        ...current,
        [subjectName]: nextSelected,
      };
    });

    // Selecting any doubt means at least one doubt has been resolved, so
    // the explicit "Nothing resolved" choice for that subject is cleared.
    setNothingResolved((current) => ({
      ...current,
      [subjectName]: false,
    }));
  }

  function toggleNothingResolved(subjectName: string) {
    if (submitting) return;

    const next = !Boolean(nothingResolved[subjectName]);

    setNothingResolved((current) => ({
      ...current,
      [subjectName]: next,
    }));

    if (next) {
      setResolvedSelections((selectionState) => ({
        ...selectionState,
        [subjectName]: [],
      }));
    }
  }

  const subjectsWithoutResponse = subjects.filter((subject) => {
    const selected = resolvedSelections[subject.subjectName] ?? [];
    return selected.length === 0 && !nothingResolved[subject.subjectName];
  });

  async function submit() {
    if (
      submitting ||
      subjects.length === 0 ||
      subjectsWithoutResponse.length > 0
    ) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitStudentLiveReconciliation(
        subjects.map((subject) => ({
          subjectName: subject.subjectName,
          presentedDoubtIds: subject.doubts.map(
            (doubt) => doubt.id
          ),
          resolvedConcepts: subject.doubts
            .filter((doubt) =>
              (resolvedSelections[subject.subjectName] ?? []).includes(
                doubt.id
              )
            )
            .map((doubt) => doubt.doubt_concept),
        }))
      );

      setSubjects([]);
      onSubmitted?.();
    } catch (submitError: any) {
      console.error(
        "LIVE DOUBT RECONCILIATION SUBMISSION FAILED",
        submitError
      );

      setError(
        submitError?.message ??
          "Unable to save your reconciliation. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (checking || (!loadFailed && (!available || subjects.length === 0))) {
    return null;
  }

  if (loadFailed) {
    return (
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4"
        style={{
          background: "rgba(7,20,45,.68)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-[390px] rounded-[22px] border border-white/70 bg-white p-5 shadow-[0_24px_80px_rgba(7,20,45,.28)]">
          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-orange-500">
            Live Learning Check
          </p>
          <h2 className="mt-1 text-[17px] font-black leading-5 text-[#07142D]">
            Verification could not be loaded
          </h2>
          <p className="mt-2 text-[10px] font-semibold leading-4 text-slate-500">
            Your existing learning data is safe. The live doubt verification needs to be checked before the Talent Passport can continue.
          </p>
          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[9px] font-bold leading-3.5 text-red-700">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={() => void load()}
            className="mt-4 w-full rounded-xl bg-[#0F2F63] px-4 py-2.5 text-[10px] font-black text-white"
          >
            Retry verification
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4"
      style={{
        background:
          "radial-gradient(circle at 15% 15%, rgba(249,115,22,.24), transparent 32%), radial-gradient(circle at 85% 20%, rgba(37,99,235,.22), transparent 34%), radial-gradient(circle at 50% 100%, rgba(124,58,237,.18), transparent 42%), rgba(7,20,45,.62)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-doubt-reconciliation-title"
    >
      <div
        className="relative flex w-full max-w-[430px] flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(7,20,45,.28)]"
        style={{
          maxHeight: "94vh",
        }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-90"
          style={{
            background:
              "linear-gradient(120deg, #FFF4E8 0%, #EEF5FF 52%, #F6F0FF 100%)",
          }}
        />

        <div className="relative z-10 flex items-start justify-between gap-3 px-4 pb-2 pt-4 sm:px-5 sm:pt-5">
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-[0.22em] text-orange-500">
              Live Learning Check
            </p>

            <h2
              id="live-doubt-reconciliation-title"
              className="mt-1 text-[17px] font-black leading-5 text-[#07142D] sm:text-[19px]"
            >
              Which Doubts Have Been Resolved?
            </h2>

            <p className="mt-1 max-w-[320px] text-[9px] font-semibold leading-3.5 text-slate-500 sm:text-[10px]">
              Select the subtopics where your doubt has now been resolved.
              Leave a topic unselected if the doubt is still unresolved.
            </p>
          </div>

          <button
            type="button"
            disabled
            aria-label="This required check cannot be closed"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-base font-black text-slate-300"
          >
            ×
          </button>
        </div>

        <div className="relative z-10 overflow-y-auto px-3 pb-3 sm:px-4">
          <div className="mb-2 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50/70 px-3 py-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-orange-700">
              Subjects requiring confirmation
            </span>
            <span className="text-[9px] font-black text-[#07142D]">
              {subjects.length} subjects · {totalDoubts} doubts
            </span>
          </div>

          <div className="space-y-2.5">
            {subjects.map((subject) => {
              const selected =
                resolvedSelections[subject.subjectName] ?? [];

              return (
                <section
                  key={subject.subjectName}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-[11px] font-black text-[#07142D]">
                        {subject.subjectName}
                      </h3>
                      <p className="text-[8px] font-semibold text-slate-400">
                        {subject.doubts.length} unresolved first-loop
                        {subject.doubts.length === 1 ? " doubt" : " doubts"}
                      </p>
                    </div>

                    <span
                      className="shrink-0 rounded-full border px-2 py-1 text-[8px] font-black"
                      style={{
                        borderColor: nothingResolved[subject.subjectName]
                          ? "#CBD5E1"
                          : "#BBF7D0",
                        background: nothingResolved[subject.subjectName]
                          ? "#F8FAFC"
                          : "#F0FDF4",
                        color: nothingResolved[subject.subjectName]
                          ? "#64748B"
                          : "#166534",
                      }}
                    >
                      {nothingResolved[subject.subjectName]
                        ? "Nothing resolved"
                        : `${selected.length} resolved`}
                    </span>
                  </div>

                  <div className="space-y-1 px-2.5 py-2">
                    <button
                      type="button"
                      onClick={() => toggleNothingResolved(subject.subjectName)}
                      disabled={submitting}
                      className="flex w-full items-start gap-2 rounded-xl border px-2.5 py-2 text-left transition"
                      style={{
                        borderColor: nothingResolved[subject.subjectName]
                          ? "#64748B"
                          : "#E2E8F0",
                        background: nothingResolved[subject.subjectName]
                          ? "#F1F5F9"
                          : "#FFFFFF",
                      }}
                    >
                      <span
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[8px] font-black"
                        style={{
                          borderColor: nothingResolved[subject.subjectName]
                            ? "#475569"
                            : "#CBD5E1",
                          background: nothingResolved[subject.subjectName]
                            ? "#475569"
                            : "#FFFFFF",
                          color: nothingResolved[subject.subjectName]
                            ? "#FFFFFF"
                            : "transparent",
                        }}
                      >
                        ✓
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[9px] font-black leading-3.5 text-[#334155]">
                          Nothing resolved
                        </span>
                        <span className="mt-0.5 block text-[8px] font-semibold leading-3 text-slate-400">
                          None of these doubts have been resolved yet.
                        </span>
                      </span>
                    </button>

                    {subject.doubts.map((doubt) => {
                      const checked = selected.includes(doubt.id);

                      return (
                        <button
                          key={doubt.id}
                          type="button"
                          onClick={() =>
                            toggle(
                              subject.subjectName,
                              doubt.id
                            )
                          }
                          className="flex w-full items-start gap-2 rounded-xl border px-2.5 py-2 text-left transition"
                          style={{
                            borderColor: checked
                              ? "#86EFAC"
                              : "#E2E8F0",
                            background: checked
                              ? "#F0FDF4"
                              : "#FFFFFF",
                          }}
                        >
                          <span
                            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border text-[9px] font-black"
                            style={{
                              borderColor: checked
                                ? "#16A34A"
                                : "#CBD5E1",
                              background: checked
                                ? "#16A34A"
                                : "#FFFFFF",
                              color: checked
                                ? "#FFFFFF"
                                : "transparent",
                            }}
                          >
                            ✓
                          </span>

                          <span
                            className="min-w-0 flex-1 text-[9px] font-bold leading-3.5"
                            style={{
                              color: checked
                                ? "#166534"
                                : "#475569",
                            }}
                          >
                            {doubt.doubt_concept}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          {error && (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[9px] font-bold leading-3.5 text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={submitting || subjectsWithoutResponse.length > 0}
            className="mt-3 w-full rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm transition disabled:opacity-60"
            style={{
              background:
                "linear-gradient(135deg,#FF6A00 0%,#F97316 52%,#E85D04 100%)",
            }}
          >
            {submitting
              ? "Saving Confirmation…"
              : "Confirm Resolved Doubts & Continue"}
          </button>

          {subjectsWithoutResponse.length > 0 && (
            <p className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-center text-[8px] font-black leading-3 text-amber-700">
              Please answer every subject before continuing. For a subject where
              nothing has been resolved, choose “Nothing resolved”.
            </p>
          )}

          <p className="mt-1.5 text-center text-[7px] font-bold leading-3 text-slate-400">
            Choose the doubts that are now resolved. If none are resolved, use
            “Nothing resolved”. Every subject requires one explicit response.
          </p>
        </div>
      </div>
    </div>
  );
}
