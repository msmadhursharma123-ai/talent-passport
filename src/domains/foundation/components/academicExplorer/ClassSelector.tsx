interface ClassSelectorProps {
  classes: string[];
  selectedClass: string | null;
  onSelect: (value: string) => void;
}

export default function ClassSelector({
  classes,
  selectedClass,
  onSelect,
}: ClassSelectorProps) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">

      <div className="mb-6">

        <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          STEP 2
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Select Class
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose the class for curriculum browsing.
        </p>

      </div>

      <div className="grid gap-4 md:grid-cols-4">

        {classes.map((item) => {
          const isSelected =
            selectedClass === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect(item)}
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
                  {item}
                </h3>

                {isSelected && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                    SELECTED
                  </span>
                )}

              </div>

              <p
                className={`mt-3 text-sm ${
                  isSelected
                    ? "text-emerald-100"
                    : "text-slate-500"
                }`}
              >
                Curriculum available for this class.
              </p>

            </button>
          );
        })}

      </div>

    </section>
  );
}