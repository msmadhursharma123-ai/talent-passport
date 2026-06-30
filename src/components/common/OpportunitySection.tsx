import SectionHeader from "../common/SectionHeader";

const opportunities = [
  {
    emoji: "🎓",
    title: "Scholarships",
    description:
      "Unlock opportunities that celebrate talent, dedication and continuous learning.",
  },
  {
    emoji: "🏆",
    title: "Competitions",
    description:
      "Participate in meaningful experiences that inspire confidence and personal growth.",
  },
  {
    emoji: "🎤",
    title: "Workshops",
    description:
      "Learn from experts through immersive sessions that develop future-ready skills.",
  },
  {
    emoji: "🤝",
    title: "Mentorship",
    description:
      "Connect with inspiring mentors who encourage learning beyond the classroom.",
  },
  {
    emoji: "🌎",
    title: "Communities",
    description:
      "Become part of a growing network of learners, educators and changemakers.",
  },
  {
    emoji: "🚀",
    title: "Future Opportunities",
    description:
      "Every experience can become the beginning of something even greater.",
  },
];

export default function OpportunitySection() {
  return (
    <section className="opportunity-section">

      <div className="opportunity-container">

        <SectionHeader
          eyebrow="OPPORTUNITIES"
          title="Where Learning Opens New Doors."
          description="Growth should never end inside a classroom. Every meaningful experience has the potential to lead towards something bigger."
        />

        <div className="opportunity-grid">

          {opportunities.map((item) => (

            <div
              key={item.title}
              className="opportunity-card"
            >

              <div className="opportunity-icon">

                {item.emoji}

              </div>

              <h3>

                {item.title}

              </h3>

              <p>

                {item.description}

              </p>

            </div>

          ))}

        </div>

        <div className="opportunity-banner">

          <div>

            <h2>

              Your journey doesn't end with recognition.

            </h2>

            <p>

              Every achievement has the potential to become
              the beginning of a new experience,
              a meaningful connection,
              or an opportunity waiting to be discovered.

            </p>

          </div>

          <button className="opportunity-btn">

            Explore What's Possible →

          </button>

        </div>

      </div>

    </section>
  );
}