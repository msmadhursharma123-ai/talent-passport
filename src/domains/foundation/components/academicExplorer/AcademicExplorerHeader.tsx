interface AcademicExplorerHeaderProps {
  title?: string;
  description?: string;
}

export default function AcademicExplorerHeader({
  title = "Academic Explorer",
  description = "Browse and manage the Master Curriculum Layer of Talent Passport OS.",
}: AcademicExplorerHeaderProps) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="text-sm text-slate-500">
          {description}
        </p>
      </div>
    </section>
  );
}