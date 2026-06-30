import SectionHeader from "../common/SectionHeader";

const communities = [
  {
    emoji: "🎓",
    title: "Students",
    subtitle: "Build a journey you'll always be proud of.",
    description:
      "Learn beyond classrooms, discover your strengths, celebrate achievements and create a story that grows with every experience.",
  },
  {
    emoji: "👨‍👩‍👧",
    title: "Parents",
    subtitle: "Watch growth beyond report cards.",
    description:
      "See your child's learning journey through meaningful experiences, participation, creativity, leadership and continuous development.",
  },
  {
    emoji: "🏫",
    title: "Schools",
    subtitle: "Celebrate every learner.",
    description:
      "Encourage holistic development by recognising every student's unique journey, participation and contribution.",
  },
  {
    emoji: "👩‍🏫",
    title: "Teachers",
    subtitle: "Inspire learning that lasts.",
    description:
      "Support students beyond academics and help create experiences that encourage curiosity, confidence and lifelong learning.",
  },
  {
    emoji: "🤝",
    title: "Partners",
    subtitle: "Support the next generation.",
    description:
      "Engage with young talent through meaningful initiatives, learning experiences and opportunities that create lasting impact.",
  },
];

export default function CommunitySection() {
  return (
    <section className="community-section">

      <div className="community-container">

        <SectionHeader
          eyebrow="BUILT FOR EVERYONE"
          title="One Platform. Many Journeys."
          description="Every learner is different. Every educator inspires differently. Every family dreams differently. Talent Passport is designed to support every journey."
        />

        <div className="community-grid">

          {communities.map((community) => (

            <div
              key={community.title}
              className="community-card"
            >

              <div className="community-icon">

                {community.emoji}

              </div>

              <span className="community-label">

                {community.title}

              </span>

              <h3>

                {community.subtitle}

              </h3>

              <p>

                {community.description}

              </p>

            </div>

          ))}

        </div>

        <div className="community-bottom">

          <h2>

            Different Dreams.
            <br />
            One Shared Future.

          </h2>

          <p>

            Whether you're learning,
            teaching,
            supporting,
            mentoring
            or creating opportunities,
            every contribution helps shape a brighter future.

          </p>

        </div>

      </div>

    </section>
  );
}