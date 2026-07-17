interface CurriculumPreviewProps {
  board?: string;
  className?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  subTopic?: string;
}

export default function CurriculumPreview({
  board,
  className,
  subject,
  chapter,
  topic,
  subTopic,
}: CurriculumPreviewProps) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">

      <h2 className="text-2xl font-bold">
        Curriculum Preview
      </h2>

      <div className="mt-6 space-y-5">

        <PreviewItem
          title="Board"
          value={board}
        />

        <PreviewItem
          title="Class"
          value={className}
        />

        <PreviewItem
          title="Subject"
          value={subject}
        />

        <PreviewItem
          title="Chapter"
          value={chapter}
        />

        <PreviewItem
          title="Topic"
          value={topic}
        />

        <PreviewItem
          title="Sub Topic"
          value={subTopic}
        />

      </div>

      <div className="mt-8 rounded-xl border bg-slate-50 p-5">

        <h3 className="font-semibold">
          Future Consumption Layer
        </h3>

        <div className="mt-4 space-y-2 text-sm text-slate-600">

          <p>Teacher Daily Log</p>

          <p>Lesson Planning</p>

          <p>Homework Tracking</p>

          <p>Student Daily Learning</p>

          <p>Curriculum Analytics</p>

          <p>AI Lesson Suggestions</p>

          <p>AI Assessments</p>

          <p>Talent Passport Analytics</p>

        </div>

      </div>

    </section>
  );
}

interface PreviewItemProps {
  title: string;
  value?: string;
}

function PreviewItem({
  title,
  value,
}: PreviewItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">

      <p className="font-medium">
        {title}
      </p>

      <p className="text-slate-600">
        {value || "Not Selected"}
      </p>

    </div>
  );
}