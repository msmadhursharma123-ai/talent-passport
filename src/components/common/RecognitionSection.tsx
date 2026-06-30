import SectionHeader from "../common/SectionHeader";

const highlights = [
  {
    icon: "🏆",
    title: "Achievements That Last",
    description:
      "Every meaningful accomplishment becomes part of your lifelong story.",
  },
  {
    icon: "📂",
    title: "A Journey Worth Sharing",
    description:
      "Bring together your experiences into one beautiful digital identity.",
  },
  {
    icon: "🌟",
    title: "Recognition Beyond The Classroom",
    description:
      "Growth deserves to be celebrated wherever your journey takes you.",
  },
];

export default function RecognitionSection() {
  return (
    <section className="recognition-section">

      <div className="recognition-container">

        <SectionHeader
          eyebrow="RECOGNITION"
          title="Every Achievement Deserves A Place To Belong."
          description="Learning is more than marks. It is built through moments, experiences, creativity, leadership and perseverance. Imagine having one place where your journey comes together."
        />

        <div className="recognition-layout">

          {/* LEFT */}

          <div className="recognition-left">

            {highlights.map((item) => (

              <div
                key={item.title}
                className="recognition-card"
              >

                <div className="recognition-icon">
                  {item.icon}
                </div>

                <div>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.description}
                  </p>

                </div>

              </div>

            ))}

          </div>

          {/* CENTER */}

          <div className="recognition-center">

            <div className="recognition-passport">

              <div className="passport-top-bar">

                <span>TALENT PASSPORT</span>

                <div className="verified-badge">
                  VERIFIED
                </div>

              </div>

              <div className="passport-avatar">

                👤

              </div>

              <h2>
                Your Story
              </h2>

              <p>
                Built through experiences,
                curiosity,
                leadership,
                creativity,
                confidence
                and continuous growth.
              </p>

              <div className="passport-tags">

                <span>Leadership</span>

                <span>Communication</span>

                <span>Creativity</span>

                <span>Confidence</span>

                <span>Collaboration</span>

                <span>Growth</span>

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="recognition-right">

            <div className="floating-recognition">

              🏆

              <strong>
                Achievement Added
              </strong>

              <small>
                Every milestone matters.
              </small>

            </div>

            <div className="floating-recognition">

              ⭐

              <strong>
                Story Growing
              </strong>

              <small>
                New experiences create new possibilities.
              </small>

            </div>

            <div className="floating-recognition">

              🚀

              <strong>
                Ready For Tomorrow
              </strong>

              <small>
                Keep growing. Keep discovering.
              </small>

            </div>

          </div>

        </div>

        <div className="recognition-bottom">

          <blockquote>

            "Recognition shouldn't end
            when the event ends."

          </blockquote>

        </div>

      </div>

    </section>
  );
}