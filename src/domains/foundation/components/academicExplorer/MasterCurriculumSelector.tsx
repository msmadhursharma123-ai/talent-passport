import { useState } from "react";

export default function MasterCurriculumSelector() {
  const boards = ["CBSE", "ICSE"];

  const classes = [
    "Class 4",
    "Class 5",
    "Class 6",
    "Class 7",
    "Class 8",
    "Class 9",
    "Class 10",
  ];

  const subjects = [
    "Science",
    "Mathematics",
    "English",
    "Hindi",
    "Social Science",
  ];

  const chapters = [
    "Heat",
    "Food",
    "Motion",
    "Light",
  ];

  const topics = [
    "Sources of Heat",
    "Transfer of Heat",
    "Conductors",
  ];

  const subTopics = [
    "Natural Sources",
    "Artificial Sources",
    "Examples",
  ];

  const [board, setBoard] =
    useState("");

  const [className, setClassName] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [chapter, setChapter] =
    useState("");

  const [topic, setTopic] =
    useState("");

  const [subTopic, setSubTopic] =
    useState("");

  return (
    <section className="rounded-3xl border bg-white p-8 shadow-sm">

      <div className="mb-8 text-center">

        <h2 className="text-3xl font-bold text-slate-900">
          Master Curriculum Selector
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Select the curriculum hierarchy to
          browse the Academic Master Layer.
        </p>

      </div>

      {/* ROW 1 */}

      <div className="grid gap-6 md:grid-cols-3">

        <Selector
          title="Board"
          value={board}
          onChange={setBoard}
          options={boards}
        />

        <Selector
          title="Class"
          value={className}
          onChange={setClassName}
          options={classes}
        />

        <Selector
          title="Subject"
          value={subject}
          onChange={setSubject}
          options={subjects}
        />

      </div>

      {/* ROW 2 */}

      <div className="mt-6 grid gap-6 md:grid-cols-3">

        <Selector
          title="Chapter"
          value={chapter}
          onChange={setChapter}
          options={chapters}
        />

        <Selector
          title="Topic"
          value={topic}
          onChange={setTopic}
          options={topics}
        />

        <Selector
          title="Sub Topic"
          value={subTopic}
          onChange={setSubTopic}
          options={subTopics}
        />

      </div>

      {/* CURRICULUM JOURNEY */}

      <div className="mt-10 rounded-3xl bg-indigo-50 p-8">

        <h3 className="text-xl font-bold text-indigo-700">
          Your Curriculum Journey
        </h3>

        <p className="mt-5 text-lg font-semibold text-slate-800 leading-8">

          {board || "Board"}

          {" > "}

          {className || "Class"}

          {" > "}

          {subject || "Subject"}

          {" > "}

          {chapter || "Chapter"}

          {" > "}

          {topic || "Topic"}

          {" > "}

          {subTopic || "Sub Topic"}

        </p>

      </div>

      {/* FUTURE CONSUMPTION */}

      <div className="mt-8 rounded-3xl border p-8">

        <h3 className="text-xl font-bold text-slate-900">
          Ready To Be Consumed By
        </h3>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <ConsumptionCard title="Teacher Daily Log" />

          <ConsumptionCard title="Lesson Planning" />

          <ConsumptionCard title="Homework Tracking" />

          <ConsumptionCard title="Student Learning" />

          <ConsumptionCard title="AI Assessments" />

          <ConsumptionCard title="Curriculum Analytics" />

        </div>

      </div>

    </section>
  );
}


/* ============================================================ */

interface SelectorProps {
  title: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

function Selector({
  title,
  value,
  options,
  onChange,
}: SelectorProps) {
  return (
    <div>

      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
        {title}
      </p>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="
        h-14
        w-full
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-4
        font-semibold
        text-indigo-700
        shadow-sm
        outline-none
        transition-all
        duration-200
        hover:border-indigo-300
        focus:border-indigo-500
        focus:ring-2
        focus:ring-indigo-200
        "
      >
        <option value="">
          Select {title}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}


/* ============================================================ */

function ConsumptionCard({
  title,
}: {
  title: string;
}) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-5">

      <p className="font-semibold text-slate-700">
        {title}
      </p>

    </div>
  );
}