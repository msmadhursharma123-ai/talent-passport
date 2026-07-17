interface ChapterSelectorProps {
  chapters: string[];
  selectedChapter: string | null;
  onSelect: (value: string) => void;
}

export default function ChapterSelector({
  chapters,
  selectedChapter,
  onSelect,
}: ChapterSelectorProps) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          STEP 4
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Select Chapter
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose the chapter to continue your curriculum journey.
        </p>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter) => {
          const isSelected =
            selectedChapter === chapter;

          return (
            <button
              key={chapter}
              type="button"
              onClick={() => onSelect(chapter)}
              className={`
                w-full rounded-2xl border p-5 text-left
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
                  {chapter}
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
                View all topics available inside this chapter.
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}