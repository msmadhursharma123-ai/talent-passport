import SectionHeader from "../common/SectionHeader";

const journeySteps = [
  {
    emoji: "🌱",
    title: "Discover",
    description:
      "Every journey begins with curiosity, passion and the courage to explore new possibilities.",
  },
  {
    emoji: "🎯",
    title: "Participate",
    description:
      "Take part in experiences that encourage collaboration, creativity and confidence.",
  },
  {
    emoji: "💡",
    title: "Create",
    description:
      "Build projects, express ideas, solve problems and transform learning into meaningful experiences.",
  },
  {
    emoji: "🏆",
    title: "Achieve",
    description:
      "Celebrate every milestone, accomplishment and personal breakthrough along the way.",
  },
  {
    emoji: "📈",
    title: "Grow",
    description:
      "Every experience contributes to continuous personal and academic development.",
  },
  {
    emoji: "✨",
    title: "Be Recognised",
    description:
      "Meaningful achievements deserve to be remembered and celebrated beyond the classroom.",
  },
  {
    emoji: "🚀",
    title: "Unlock Opportunities",
    description:
      "Growth creates new possibilities for learning, collaboration and future success.",
  },
];

export default function JourneySection() {
  return (
    <section className="journey-section">

      <div className="journey-container">

        <SectionHeader
          eyebrow="YOUR JOURNEY"
          title="Every Great Journey Begins With One Small Step."
          description="Growth isn't defined by one exam or one achievement. It is built through countless experiences that shape who you become."
        />

        <div className="journey-timeline">

          {journeySteps.map((step, index) => (

            <div
              key={step.title}
              className="journey-item"
            >

              <div className="journey-circle">

                <span>
                  {step.emoji}
                </span>

              </div>

              {index !== journeySteps.length - 1 && (
                <div className="journey-line" />
              )}

              <div className="journey-content">

                <h3>
                  {step.title}
                </h3>

                <p>
                  {step.description}
                </p>

              </div>

            </div>

          ))}

        </div>

        <div className="journey-bottom">

          <h2>
            Every Step Matters.
          </h2>

          <p>
            Progress isn't measured by a single moment.
            It is built through consistency,
            curiosity,
            resilience,
            creativity
            and the willingness to keep moving forward.
          </p>

        </div>

      </div>

    </section>
  );
}