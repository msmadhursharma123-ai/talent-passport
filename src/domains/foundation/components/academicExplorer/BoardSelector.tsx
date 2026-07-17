interface BoardSelectorProps {
  boards: string[];
  selectedBoard: string | null;
  onSelect: (board: string) => void;
}

export default function BoardSelector({
  boards,
  selectedBoard,
  onSelect,
}: BoardSelectorProps) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">

      <div className="mb-6">

        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          STEP 1
        </p>

        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Select Board
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Choose the academic board.
        </p>

      </div>

      <div className="grid gap-5 md:grid-cols-2">

        {boards.map((board) => {

          const isSelected =
            selectedBoard === board;

          return (
            <button
              key={board}
              type="button"
              onClick={() => onSelect(board)}
              className={`
                rounded-2xl border p-6 text-left
                transition-all duration-200

                ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500 text-white shadow-xl scale-[1.02]"
                    : "hover:border-indigo-300 hover:shadow-md"
                }
              `}
            >

              <div className="flex items-center justify-between">

                <h3 className="text-xl font-bold">
                  {board}
                </h3>

                {isSelected && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-700">
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
                Master curriculum will be consumed
                across Teacher, School and Student
                Portals.
              </p>

            </button>
          );
        })}

      </div>

    </section>
  );
}