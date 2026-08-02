import SectionHeader from "../common/SectionHeader";

const journeySteps = [
  {
    emoji: "🌱",
    title: "Discover your passion",
    description:
      "Find your passion across 20+ competition formats.",
  },
  {
    emoji: "🎯",
    title: "Participate your way",
    description: "Compete your way, from the comfort of your home.",
  },
  {
    emoji: "💡",
    title: "Create your best work",
    description: "Submit your best performance with confidence.",
  },
  {
    emoji: "🏆",
    title: "Achieve real opportunities",
    description:"Win scholarships and learn from leading academies.",
  },
  {
    emoji: "📈",
    title: "Grow to the national stage",
    description:
      "Progress from School → District → Cluster → National.",
  },
  {
    emoji: "✨",
    title: "Be Recognised for your skills",
    description:
      "Build a verified portfolio of your skills and achievements.",
  },
  {
    emoji: "🚀",
    title: "Unlock your future",
    description:
      "Get discovered by academies and unlock your future.",
  },
];

const roadmapStages = [
  {
    number: "1",
    status: "Coming Soon",
    title: "School Tryouts",
    description:
      "Students begin their Talent Passport journey inside their own school.",
  },
  {
    number: "2",
    status: "Upcoming",
    title: "City League",
    description:
      "Outstanding students represent their schools at the city level.",
  },
  {
    number: "3",
    status: "Future",
    title: "Cluster League",
    description:
      "City champions progress into regional cluster competitions.",
  },
  {
    number: "4",
    status: "Vision",
    title: "Nationals",
    description:
      "India's largest student talent celebration built on Talent Passport.",
  },
];

export default function JourneySection() {
  return (
    <section className="journey-section">

      <div className="journey-container">

        <SectionHeader
          eyebrow="YOUR JOURNEY"
          title="Every Journey Begins With Small Steps."
          description=""
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

        {/* ===========================================
            ROAD TO NATIONALS
        =========================================== */}

        <div className="journey-roadmap">

          <div className="roadmap-heading">

            <h3>

              The Road To Talent Passport Nationals

            </h3>

            <p>

              

            </p>

          </div>

          <div className="roadmap-timeline">

            {roadmapStages.map((stage, index) => (

              <div
                key={stage.number}
                className="roadmap-stage"
              >

                <div className="roadmap-top">

                  <div className="roadmap-circle">

                    {stage.number}

                  </div>

                  {index !== roadmapStages.length - 1 && (

                    <div className="roadmap-line" />

                  )}

                </div>

                <div className="roadmap-card">

                  <div className="roadmap-status">

                    {stage.status}

                  </div>

                  <h4>

                    {stage.title}

                  </h4>

                  <p>

                    {stage.description}

                  </p>

                </div>

              </div>

            ))}

          </div>

          

        </div>

        <div className="journey-bottom">

  <p>
Your journey grows with you and opens doors to future opportunities.

  </p>

</div>

      </div>

    </section>
  );
}

