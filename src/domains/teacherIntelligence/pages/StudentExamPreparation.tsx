import {
  useEffect,
  useState,
} from "react";

import {
  getStudentExamPreparationIntelligenceWithLiveLayer,
} from "../../liveDoubtIntelligence/service/LiveStudentExamPreparation";

export default function StudentExamPreparation() {
  const [
    data,
    setData,
  ] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const response =
      await getStudentExamPreparationIntelligenceWithLiveLayer();

    setData(response);
  }

  const totalUnresolved =
    data?.totalUnresolvedDoubts ?? 0;

  const topics: string[] =
    Array.isArray(data?.topics)
      ? data.topics.filter(Boolean)
      : [];

  const highestRisk =
    data?.highestRiskTopic ?? "-";

  const attention =
    data?.attentionLevel ?? "-";

  const attentionClass =
    attention === "HIGH"
      ? "sep-attention-high"
      : attention === "MEDIUM"
      ? "sep-attention-medium"
      : "sep-attention-low";

  return (
    <>
      <style>{`
        .sep-root,
        .sep-root * {
          box-sizing: border-box;
        }

        .sep-root {
          width: 100%;
          min-width: 0;
        }

        .sep-topics-scroll {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E1 transparent;
        }

        .sep-topics-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .sep-topics-scroll::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 999px;
        }

        .sep-attention-low {
          color: #15803D;
          background: #F0FDF4;
          border-color: #BBF7D0;
        }

        .sep-attention-medium {
          color: #B45309;
          background: #FFFBEB;
          border-color: #FDE68A;
        }

        .sep-attention-high {
          color: #B91C1C;
          background: #FEF2F2;
          border-color: #FECACA;
        }

        @media (max-width: 1024px) {
          .sep-root {
            padding: 20px !important;
            border-radius: 20px !important;
          }

          .sep-header {
            gap: 16px !important;
          }

          .sep-header h2 {
            font-size: 22px !important;
            line-height: 1.15 !important;
          }

          .sep-header-description {
            max-width: 620px !important;
            font-size: 13px !important;
            line-height: 1.5 !important;
          }

          .sep-summary-grid {
            margin-top: 18px !important;
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }

          .sep-summary-card {
            min-height: 118px !important;
            padding: 14px !important;
            border-radius: 15px !important;
          }

          .sep-summary-card h3 {
            font-size: 14px !important;
            line-height: 1.2 !important;
          }

          .sep-summary-value {
            margin-top: 12px !important;
            font-size: 27px !important;
            line-height: 1 !important;
          }

          .sep-summary-note {
            margin-top: 7px !important;
            font-size: 10px !important;
            line-height: 1.35 !important;
          }

          .sep-ledger {
            margin-top: 18px !important;
            border-radius: 17px !important;
          }

          .sep-ledger-header {
            padding: 15px 16px !important;
          }

          .sep-ledger-title {
            font-size: 18px !important;
          }

          .sep-topic-strip {
            padding: 14px 16px !important;
          }

          .sep-topic-chip {
            padding: 8px 11px !important;
            font-size: 11px !important;
          }
        }

        @media (max-width: 767px) {
          .sep-root {
            padding: 13px !important;
            border-radius: 17px !important;
            overflow: hidden !important;
          }

          .sep-header {
            display: block !important;
          }

          .sep-eyebrow {
            font-size: 8px !important;
            letter-spacing: .16em !important;
          }

          .sep-header h2 {
            margin-top: 5px !important;
            font-size: 18px !important;
            line-height: 1.12 !important;
          }

          .sep-header-description {
            margin-top: 6px !important;
            font-size: 10.5px !important;
            line-height: 1.4 !important;
          }

          .sep-desktop-badge {
            display: none !important;
          }

          .sep-summary-grid {
            margin-top: 13px !important;
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 5px !important;
          }

          .sep-summary-card {
            min-width: 0 !important;
            min-height: 88px !important;
            padding: 8px 6px !important;
            border-radius: 11px !important;
          }

          .sep-summary-icon {
            width: 27px !important;
            height: 27px !important;
            border-radius: 8px !important;
            font-size: 13px !important;
          }

          .sep-summary-label {
            font-size: 5.8px !important;
            line-height: 1.15 !important;
            letter-spacing: .04em !important;
            overflow-wrap: anywhere !important;
          }

          .sep-summary-card h3 {
            margin-top: 5px !important;
            font-size: 8.5px !important;
            line-height: 1.12 !important;
          }

          .sep-summary-value {
            margin-top: 8px !important;
            font-size: 19px !important;
            line-height: 1 !important;
            overflow-wrap: anywhere !important;
          }

          .sep-summary-note {
            display: none !important;
          }

          .sep-ledger {
            margin-top: 13px !important;
            border-radius: 14px !important;
          }

          .sep-ledger-header {
            padding: 11px !important;
          }

          .sep-ledger-header-row {
            gap: 8px !important;
          }

          .sep-ledger-title {
            margin-top: 3px !important;
            font-size: 14px !important;
            line-height: 1.15 !important;
          }

          .sep-ledger-subtitle {
            margin-top: 4px !important;
            font-size: 9px !important;
            line-height: 1.35 !important;
          }

          .sep-count-pill {
            padding: 5px 8px !important;
            font-size: 8px !important;
          }

          .sep-topic-strip {
            padding: 10px !important;
          }

          .sep-topic-strip-heading {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 8px !important;
          }

          .sep-topic-strip-heading p {
            font-size: 8px !important;
          }

          .sep-swipe-hint {
            display: inline-flex !important;
          }

          .sep-topics-scroll {
            margin-top: 8px !important;
            display: flex !important;
            gap: 6px !important;
            overflow-x: auto !important;
            overscroll-behavior-x: contain;
            scroll-snap-type: x proximity;
            padding-bottom: 5px !important;
          }

          .sep-topic-chip {
            flex: 0 0 auto !important;
            max-width: 190px !important;
            padding: 7px 9px !important;
            border-radius: 9px !important;
            font-size: 9px !important;
            line-height: 1.2 !important;
            scroll-snap-align: start;
          }

          .sep-ledger-footer {
            padding: 9px 10px !important;
            gap: 6px !important;
          }

          .sep-ledger-footer p {
            font-size: 8.5px !important;
            line-height: 1.3 !important;
          }

          .sep-attention-pill {
            padding: 5px 8px !important;
            font-size: 8px !important;
          }
        }
      `}</style>

      <section
        className="sep-root relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
        style={{
          background:
            "linear-gradient(135deg,#FFFFFF 0%,#FFFFFF 72%,#FFF9F2 100%)",
        }}
      >
        <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-orange-50" />
        <div className="pointer-events-none absolute right-24 -top-20 h-32 w-32 rounded-full bg-orange-50/60" />

        <div className="sep-header relative z-10 flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="sep-eyebrow text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
              Academic Readiness Intelligence
            </p>

            <h2 className="mt-2 text-xl font-black text-slate-900">
              Exam Preparation Intelligence
            </h2>

            <p className="sep-header-description mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Track unresolved classroom doubts and prepare smarter for your
              upcoming exams by monitoring unresolved topics that still need
              classroom clarification.
            </p>
          </div>

          <div className="sep-desktop-badge hidden shrink-0 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-orange-600 md:block">
            Academic Risk Ledger
          </div>
        </div>

        <div className="sep-summary-grid relative z-10 mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article
            className="sep-summary-card relative overflow-hidden rounded-2xl border p-5"
            style={{
              background: "linear-gradient(135deg,#FFF7ED,#FFFFFF)",
              borderColor: "#FED7AA",
            }}
          >
            <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-orange-100/70" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-2">
                <p className="sep-summary-label text-[9px] font-black uppercase tracking-[0.14em] text-orange-600">
                  Doubt Ledger
                </p>

                <div className="sep-summary-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-white text-base">
                  ?
                </div>
              </div>

              <h3 className="mt-3 text-base font-black text-slate-700">
                Unresolved Doubts
              </h3>

              <p className="sep-summary-value mt-5 text-3xl font-black text-orange-500">
                {totalUnresolved}
              </p>

              <p className="sep-summary-note mt-2 text-xs font-bold leading-5 text-slate-500">
                Not yet discussed or resolved
              </p>
            </div>
          </article>

          <article
            className="sep-summary-card relative overflow-hidden rounded-2xl border p-5"
            style={{
              background: "linear-gradient(135deg,#EFF6FF,#FFFFFF)",
              borderColor: "#BFDBFE",
            }}
          >
            <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-blue-100/70" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-2">
                <p className="sep-summary-label text-[9px] font-black uppercase tracking-[0.14em] text-blue-600">
                  Topic Intelligence
                </p>

                <div className="sep-summary-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white text-base">
                  📚
                </div>
              </div>

              <h3 className="mt-3 text-base font-black text-slate-700">
                Topics With Doubts
              </h3>

              <p className="sep-summary-value mt-5 text-3xl font-black text-blue-600">
                {topics.length}
              </p>

              <p className="sep-summary-note mt-2 text-xs font-bold leading-5 text-slate-500">
                Topics requiring clarification
              </p>
            </div>
          </article>

          <article
            className="sep-summary-card relative overflow-hidden rounded-2xl border p-5"
            style={{
              background: "linear-gradient(135deg,#FEF2F2,#FFFFFF)",
              borderColor: "#FECACA",
            }}
          >
            <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-red-100/70" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-2">
                <p className="sep-summary-label text-[9px] font-black uppercase tracking-[0.14em] text-red-600">
                  Risk Intelligence
                </p>

                <div className="sep-summary-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-white text-base">
                  ⚠
                </div>
              </div>

              <h3 className="mt-3 text-base font-black text-slate-700">
                Highest Risk Topic
              </h3>

              <p className="sep-summary-value mt-5 line-clamp-2 text-xl font-black leading-6 text-red-600">
                {highestRisk}
              </p>

              <p className="sep-summary-note mt-2 text-xs font-bold leading-5 text-slate-500">
                Priority topic for revision
              </p>
            </div>
          </article>

          <article
            className="sep-summary-card relative overflow-hidden rounded-2xl border p-5"
            style={{
              background: "linear-gradient(135deg,#FAF5FF,#FFFFFF)",
              borderColor: "#E9D5FF",
            }}
          >
            <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-purple-100/70" />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-2">
                <p className="sep-summary-label text-[9px] font-black uppercase tracking-[0.14em] text-purple-600">
                  Attention Signal
                </p>

                <div className="sep-summary-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-200 bg-white text-base">
                  ◎
                </div>
              </div>

              <h3 className="mt-3 text-base font-black text-slate-700">
                Attention Level
              </h3>

              <p className="sep-summary-value mt-5 text-2xl font-black text-purple-600">
                {attention}
              </p>

              <p className="sep-summary-note mt-2 text-xs font-bold leading-5 text-slate-500">
                Current academic attention requirement
              </p>
            </div>
          </article>
        </div>

        <div className="sep-ledger relative z-10 mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="sep-ledger-header border-b border-slate-200 bg-[#FFFCF8] px-5 py-4">
            <div className="sep-ledger-header-row flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-orange-500">
                  Student Exam Readiness
                </p>

                <h3 className="sep-ledger-title mt-1 text-lg font-black text-slate-900">
                  Doubts Raised But Not Discussed by the Teacher
                </h3>

                <p className="sep-ledger-subtitle mt-1 text-xs font-medium text-slate-500">
                  Revision queue built from unresolved classroom feedback.
                </p>
              </div>

              <span className="sep-count-pill shrink-0 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-black text-orange-600">
                {topics.length} {topics.length === 1 ? "TOPIC" : "TOPICS"}
              </span>
            </div>
          </div>

          <div className="sep-topic-strip px-5 py-4">
            <div className="sep-topic-strip-heading">
              <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
                Revision Intelligence
              </p>

              <span className="sep-swipe-hint hidden items-center gap-1 text-[8px] font-black uppercase tracking-wider text-orange-500">
                Swipe topics ↔
              </span>
            </div>

            {topics.length > 0 ? (
              <div className="sep-topics-scroll mt-3 flex flex-wrap gap-2">
                {topics.map((topic: string, index: number) => (
                  <span
                    key={`${topic}-${index}`}
                    className="sep-topic-chip rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-xs font-bold text-slate-500">
                No unresolved topics currently recorded.
              </div>
            )}
          </div>

          <div className="sep-ledger-footer flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-3">
            <p className="text-xs font-bold text-slate-500">
              Highest priority:{" "}
              <span className="text-slate-800">{highestRisk}</span>
            </p>

            <span
              className={`sep-attention-pill rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${attentionClass}`}
            >
              {attention} attention
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
