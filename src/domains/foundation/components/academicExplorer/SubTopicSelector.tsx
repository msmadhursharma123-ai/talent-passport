interface SubTopicSelectorProps {
  subTopics: string[];
  selectedSubTopic: string | null;
  onSelect: (value: string) => void;
}

export default function SubTopicSelector({
  subTopics,
  selectedSubTopic,
  onSelect,
}: SubTopicSelectorProps) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          STEP 6
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Select Sub Topic
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Browse the curriculum at the most granular level before it is
          consumed across Teacher, School and Student Portals.
        </p>
      </div>

      <div className="space-y-4">
        {subTopics.map((subTopic) => {
          const isSelected =
            selectedSubTopic === subTopic;

          return (
            <button
              key={subTopic}
              type="button"
              onClick={() => onSelect(subTopic)}
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
                  {subTopic}
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
                This is the finest curriculum layer that will power lesson
                planning, homework, assessments and student learning.
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}