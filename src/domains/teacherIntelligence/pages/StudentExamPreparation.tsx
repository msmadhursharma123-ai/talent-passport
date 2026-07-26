import {
  useEffect,
  useState,
} from "react";

import {
  getStudentExamPreparationIntelligence,
} from "../repository/StudentExamPreparationRepository";


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
      await getStudentExamPreparationIntelligence();

    setData(
      response
    );

  }


  /*
  =========================================================
  EXISTING DATA — UI MAPPING ONLY
  =========================================================
  */

  const totalUnresolved =
    data?.totalUnresolvedDoubts ?? 0;

  const topics =
    data?.topics?.length
      ? data.topics.join(", ")
      : "-";

  const highestRisk =
    data?.highestRiskTopic ?? "-";

  const attention =
    data?.attentionLevel ?? "-";


  return (

    <div
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
      style={{
        background:
          "linear-gradient(135deg,#FFFFFF 0%,#FFFFFF 72%,#FFF9F2 100%)",
      }}
    >

      {/* DECORATIVE BACKGROUND */}

      <div className="pointer-events-none absolute -right-14 -top-16 h-48 w-48 rounded-full bg-orange-50" />

      <div className="pointer-events-none absolute right-24 -top-20 h-32 w-32 rounded-full bg-orange-50/60" />


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="relative z-10 flex items-start justify-between gap-5">

        <div>

          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
            Academic Readiness Intelligence
          </p>

          <h2 className="mt-2 text-xl font-black text-slate-900">
            Exam Preparation Intelligence
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Track unresolved classroom doubts and prepare smarter
            for your upcoming exams by monitoring your below mentioned unresolved doubts and topics.
          </p>

        </div>


        <div className="hidden rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-orange-600 md:block">
          Academic Risk Ledger
        </div>

      </div>


      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="relative z-10 mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">


        {/* UNRESOLVED DOUBTS */}

        <div
          className="relative overflow-hidden rounded-2xl border p-5"
          style={{
            background:
              "linear-gradient(135deg,#FFF7ED,#FFFFFF)",
            borderColor:
              "#FED7AA",
          }}
        >

          <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-orange-100/70" />

          <div className="relative z-10">

            <div className="flex items-start justify-between gap-3">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-orange-600">
                  Doubt Ledger
                </p>

                <p className="mt-2 text-sm font-bold text-slate-700">
                  Unresolved Doubts
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-200 bg-white text-base">
                ?
              </div>

            </div>


            <p className="mt-5 text-3xl font-black text-orange-500">
              {totalUnresolved}
            </p>

            <p className="mt-1 text-[10px] font-semibold text-slate-500">
              Not yet discussed or resolved
            </p>

          </div>

        </div>


        {/* TOPICS */}

        <div
          className="relative overflow-hidden rounded-2xl border p-5"
          style={{
            background:
              "linear-gradient(135deg,#EFF6FF,#FFFFFF)",
            borderColor:
              "#BFDBFE",
          }}
        >

          <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-blue-100/70" />

          <div className="relative z-10">

            <div className="flex items-start justify-between gap-3">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-blue-600">
                  Topic Intelligence
                </p>

                <p className="mt-2 text-sm font-bold text-slate-700">
                  Topics With Doubts
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-white text-base">
                📚
              </div>

            </div>


            <p className="mt-5 break-words text-lg font-black leading-6 text-blue-600">
              {topics}
            </p>

            <p className="mt-2 text-[10px] font-semibold text-slate-500">
              Topics requiring further clarification
            </p>

          </div>

        </div>


        {/* HIGHEST RISK */}

        <div
          className="relative overflow-hidden rounded-2xl border p-5"
          style={{
            background:
              "linear-gradient(135deg,#FEF2F2,#FFFFFF)",
            borderColor:
              "#FECACA",
          }}
        >

          <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-red-100/70" />

          <div className="relative z-10">

            <div className="flex items-start justify-between gap-3">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-red-600">
                  Risk Intelligence
                </p>

                <p className="mt-2 text-sm font-bold text-slate-700">
                  Highest Risk Topic
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-base">
                ⚠️
              </div>

            </div>


            <p className="mt-5 break-words text-lg font-black leading-6 text-red-600">
              {highestRisk}
            </p>

            <p className="mt-2 text-[10px] font-semibold text-slate-500">
              Priority topic for revision
            </p>

          </div>

        </div>


        {/* ATTENTION LEVEL */}

        <div
          className="relative overflow-hidden rounded-2xl border p-5"
          style={{
            background:
              "linear-gradient(135deg,#FAF5FF,#FFFFFF)",
            borderColor:
              "#E9D5FF",
          }}
        >

          <div className="pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full bg-purple-100/70" />

          <div className="relative z-10">

            <div className="flex items-start justify-between gap-3">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-purple-600">
                  Readiness Status
                </p>

                <p className="mt-2 text-sm font-bold text-slate-700">
                  Attention Level
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-200 bg-white text-base">
                🎯
              </div>

            </div>


            <p className="mt-5 text-2xl font-black uppercase text-purple-600">
              {attention}
            </p>

            <p className="mt-1 text-[10px] font-semibold text-slate-500">
              Current academic attention requirement
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          EXAM READINESS LEDGER
      ===================================================== */}

      <div className="relative z-10 mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">


        {/* LEDGER HEADER */}

        <div
          className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between"
          style={{
            background:
              "linear-gradient(90deg,#FFF9F2,#FFFFFF)",
          }}
        >

          <div>

            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-orange-500">
              Student Exam Readiness
            </p>

            <h3 className="mt-1 text-base font-black text-slate-900">
              Doubts Raised But Not Discussed by the Teacher 
            </h3>

          </div>


          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold text-slate-500">
             REVISION INTELLIGENCE
          </div>

        </div>


        {/* ROW 1 */}

        <div className="grid border-b border-slate-100 md:grid-cols-[300px_1fr]">

          <div className="bg-slate-50 px-5 py-4">

            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Total Unresolved Doubts
            </p>

          </div>

          <div className="flex items-center px-5 py-4">

            <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-black text-orange-600">
              {totalUnresolved}
            </span>

          </div>

        </div>


        {/* ROW 2 */}

        <div className="grid border-b border-slate-100 md:grid-cols-[300px_1fr]">

          <div className="bg-slate-50 px-5 py-4">

            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Topics With Unresolved Doubts
            </p>

          </div>

          <div className="flex items-center px-5 py-4 text-sm font-bold text-slate-700">
            {topics}
          </div>

        </div>


        {/* ROW 3 */}

        <div className="grid border-b border-slate-100 md:grid-cols-[300px_1fr]">

          <div className="bg-slate-50 px-5 py-4">

            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Highest Risk Topic
            </p>

          </div>

          <div className="flex items-center px-5 py-4 text-sm font-bold text-slate-700">
            {highestRisk}
          </div>

        </div>


        {/* ROW 4 */}

        <div className="grid md:grid-cols-[300px_1fr]">

          <div className="bg-slate-50 px-5 py-4">

            <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
              Attention Level
            </p>

          </div>

          <div className="flex items-center px-5 py-4">

            <span
              className={`rounded-lg px-3 py-1.5 text-xs font-black uppercase

                ${
                  String(attention).toLowerCase() === "high"
                    ? "bg-red-50 text-red-600"
                    : String(attention).toLowerCase() === "medium"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-green-50 text-green-600"
                }
              `}
            >
              {attention}
            </span>

          </div>

        </div>

      </div>

    </div>

  );

}