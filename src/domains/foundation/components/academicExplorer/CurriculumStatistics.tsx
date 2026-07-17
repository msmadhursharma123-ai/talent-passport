interface CurriculumStatisticsProps {
  totalBoards: number;
  totalSubjects: number;
  totalChapters: number;
  totalTopics: number;
  totalSubTopics: number;
}

export default function CurriculumStatistics({
  totalBoards,
  totalSubjects,
  totalChapters,
  totalTopics,
  totalSubTopics,
}: CurriculumStatisticsProps) {
  const cards = [
    {
      title: "Boards",
      value: totalBoards,
    },
    {
      title: "Subjects",
      value: totalSubjects,
    },
    {
      title: "Chapters",
      value: totalChapters,
    },
    {
      title: "Topics",
      value: totalTopics,
    },
    {
      title: "Sub Topics",
      value: totalSubTopics,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-2xl border bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-medium text-slate-500">
            {card.title}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {card.value}
          </h2>
        </div>
      ))}
    </section>
  );
}