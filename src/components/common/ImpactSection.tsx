import SectionHeader from "../common/SectionHeader";

const impactCards = [
  {
    emoji: "🌍",
    title: "A Future Where Every Student Is Seen",
    description:
      "Every learner deserves to be recognised not just for marks, but for curiosity, creativity, leadership and the journey they build over time.",
  },
  {
    emoji: "🏫",
    title: "Schools That Celebrate Every Talent",
    description:
      "Imagine learning environments where every student's unique strengths are encouraged, recognised and celebrated beyond academics.",
  },
  {
    emoji: "👨‍👩‍👧",
    title: "Families That See Growth Every Day",
    description:
      "Parents deserve a richer picture of learning—one that reflects confidence, participation, resilience and meaningful experiences.",
  },
  {
    emoji: "🤝",
    title: "Communities That Inspire Possibilities",
    description:
      "When education, mentors, organisations and communities come together, every learner gains access to new experiences and opportunities.",
  },
];

export default function ImpactSection() {
  return (
    <section className="impact-section">

      <div className="impact-container">

        <SectionHeader
          eyebrow="OUR VISION"
          title="Building A Future Where Every Journey Matters."
          description="We believe every learner deserves the opportunity to be recognised, encouraged and inspired to reach their full potential."
        />

        <div className="impact-grid">

          {impactCards.map((card) => (

            <div
              key={card.title}
              className="impact-card"
            >

              <div className="impact-icon">

                {card.emoji}

              </div>

              <h3>

                {card.title}

              </h3>

              <p>

                {card.description}

              </p>

            </div>

          ))}

        </div>

        <div className="vision-banner">

          <h2>

            We don't believe talent should be forgotten.

          </h2>

          <p>

            We imagine a future where every project,
            every idea,
            every challenge,
            every performance
            and every achievement becomes part of a lifelong story that students carry with pride wherever life takes them.

          </p>

        </div>

      </div>

    </section>
  );
}