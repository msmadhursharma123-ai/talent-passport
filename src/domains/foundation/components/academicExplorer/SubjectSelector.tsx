interface SubjectSelectorProps {
  subjects: string[];
  selectedSubject: string | null;
  onSelect: (value: string) => void;
}

export default function SubjectSelector({
  subjects,
  selectedSubject,
  onSelect,
}: SubjectSelectorProps) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">

      <div className="mb-6">

        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          STEP 3
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Select Subject
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose the subject to browse the curriculum.
        </p>

      </div>

      <div className="grid gap-4 md:grid-cols-3">

        {subjects.map((subject) => {

          const isSelected =
            selectedSubject === subject;

          return (
            <button
              key={subject}
              type="button"
              onClick={() => onSelect(subject)}
              className={`
                rounded-2xl border p-5 text-left
                transition-all duration-200

                ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500 text-white shadow-xl scale-[1.02]"
                    : "hover:border-indigo-300 hover:shadow-md"
                }
              `}
            >

              <div className="flex items-center justify-between">

                <h3 className="text-lg font-bold">
                  {subject}
                </h3>

                {isSelected && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-600">
                    SELECTED
                  </span>
                )}

              </div>

              <p
                className={`mt-3 text-sm ${
                  isSelected
                    ? "text-indigo-100"
                    : "text-slate-500"
                }`}
              >
                Browse the complete subject curriculum.
              </p>

            </button>
          );
        })}

      </div>

    </section>
  );
}