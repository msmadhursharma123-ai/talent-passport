export default function CurriculumCoverage() {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Curriculum Coverage
      </h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-5">
          <h3 className="font-semibold">
            CBSE
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Classes 4 to 10
          </p>

          <p className="mt-4 font-medium text-emerald-600">
            Pending Import
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <h3 className="font-semibold">
            ICSE
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Classes 4 to 10
          </p>

          <p className="mt-4 font-medium text-emerald-600">
            Pending Import
          </p>
        </div>
      </div>
    </section>
  );
}