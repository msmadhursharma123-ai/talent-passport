import SectionHeader from "../common/SectionHeader";

const benefits = [
  "Schools use it for holistic student growth documentation.",
  "Parents understand the complete learning journey beyond marks.",
  "Students build one lifelong Talent Passport recognised everywhere.",
];

const credentialRows = [
  {
    label: "Journey",
    value: "Projects • Competitions • Portfolio",
  },
  {
    label: "Recognition",
    value: "Achievements & Milestones",
  },
  {
    label: "Growth",
    value: "Updated Throughout School Life",
  },
  {
    label: "Identity",
    value: "One Lifelong Student Passport",
  },
];

export default function ImagineSection() {

  return (

    <section className="imagine-section">

      <div className="imagine-container">

        <SectionHeader
          eyebrow="THE TALENT PASSPORT"
          title="One Identity. One Story. A Lifetime Of Growth."
          description="Talent Passport transforms everyday learning into one trusted digital identity that grows with every project, competition, achievement and experience."
        />

        <div className="credential-layout">

          {/* =====================================================
              LEFT COLUMN
          ===================================================== */}

          <div className="credential-left">

            <div className="credential-tag">

              THE HPC CREDENTIAL

            </div>

            <h2>

              Your Talent.
              <br />
              Verified.
              <br />
              Forever.

            </h2>

            <p>

              Every Talent Passport participant receives one verified
              lifelong student credential that grows with projects,
              competitions, portfolios and achievements instead of
              disconnected certificates.

            </p>

            <p>

              It becomes one trusted academic identity that students,
              parents and schools can continuously build throughout
              the entire learning journey.

            </p>

            <div className="credential-pill">

              ✦ NEP 2020 ALIGNED ✦ HOLISTIC STUDENT PROFILE

            </div>

            <ul className="credential-benefits">

                            {benefits.map((item) => (

                <li key={item}>

                  <span className="credential-arrow">

                    →

                  </span>

                  <span>

                    {item}

                  </span>

                </li>

              ))}

            </ul>

          </div>

          {/* =====================================================
              RIGHT COLUMN
          ===================================================== */}

          <div className="credential-card">

            <div className="credential-watermark">

              HPC

            </div>

            <div className="credential-header">

              <div className="credential-chip">

                TALENT PASSPORT • HPC

              </div>

              <h3>

                Student Growth Credential

              </h3>

              <p>

                Verified lifelong student identity

              </p>

            </div>

            <div className="credential-preview">

              <img
                src="/landing/talentpassport.webp"
                alt="Talent Passport Credential"
              />

            </div>

            <div className="credential-details">

              {credentialRows.map((row) => (

                <div
                  key={row.label}
                  className="credential-row"
                >

                  <span>

                    {row.label}

                  </span>

                  <strong>

                    {row.value}

                  </strong>

                </div>

              ))}

            </div>

            <div className="credential-verification">

              <div className="verification-icon">

                ✓

              </div>

              <div className="verification-text">

                <h4>

                  Verified Digital Credential

                </h4>

                <p>

                  Secure lifelong student identity with continuous
                  academic, co-curricular and achievement verification.

                </p>

              </div>

            </div>

          </div>

        </div>

        <div className="credential-bottom">

          <blockquote>

            "A student's journey should never be forgotten.
            Every experience deserves a permanent place."

          </blockquote>

        </div>

      </div>

    </section>

  );

}

            

