import "../../styles/problemSection.css";
import SectionHeader from "../common/SectionHeader";

const todayJourney = [

  "Parents encourage participation.",

  "Students join competitions.",

  "Achievements are celebrated.",

  "Certificates are collected.",

  "Awards are stored away.",

  "Records become difficult to find.",

  "Years of effort lose visibility."

];

const passportJourney = [

  "Parents encourage participation.",

  "Every activity is securely recorded.",

  "Achievements stay connected.",

  "Growth is tracked continuously.",

  "Skills become permanently verified.",

  "Progress builds year after year.",

  "One lifelong Talent Passport."

];

export default function ProblemSection() {

  return (

    <section className="problem-section">

      <div className="problem-container">

        <SectionHeader

          eyebrow="WHY TALENT PASSPORT"

          title="Every Student Has A Journey. Not Every Journey Has An Identity."

          description="Years of effort deserve more than memories."

        />

        {/* ==========================================================
            COMPARISON
        ========================================================== */}

        <div className="journey-comparison">

          {/* ======================================================
              TODAY
          ====================================================== */}

          <div className="journey-column">

            <div className="journey-label today">

              TODAY

            </div>

            <h3>

              Today's Journey

            </h3>

            <p className="journey-subtitle">

              Success is celebrated, but rarely preserved for the future.

            </p>

            <div className="journey-notes">

              {todayJourney.map((item) => (

                <div
                  key={item}
                  className="journey-note"
                >

                  <span className="note-dot"></span>

                  <span className="note-text">

                    {item}

                  </span>

                </div>

              ))}

            </div>

          </div>

                    {/* ======================================================
              TALENT PASSPORT
          ====================================================== */}

          <div className="journey-column">

            <div className="journey-label passport">

              TALENT PASSPORT

            </div>

            <h3>

              Talent Passport Journey

            </h3>

            <p className="journey-subtitle">

              Every milestone becomes part of one lifelong student identity.

            </p>

            <div className="journey-notes">

              {passportJourney.map((item) => (

                <div
                  key={item}
                  className="journey-note success"
                >

                  <span className="note-dot"></span>

                  <span className="note-text">

                    {item}

                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* ==========================================================
            BUILT FOR EVERYONE
        ========================================================== */}

        <div className="value-system">

          <SectionHeader

            eyebrow="BUILT FOR EVERYONE"

            title="One Platform. Value For Everyone."

            description="Talent Passport creates measurable value for every stakeholder in the ecosystem."

          />

          <div className="value-grid">

            {/* Schools */}

            <div className="value-card">

              <div className="value-tag">

                FOR SCHOOLS

              </div>

              <h3>

                Win More Admissions

              </h3>

              <ul>

                <li>National talent rankings.</li>

                <li>NEP 2020 documentation.</li>

                <li>Talent analytics dashboard.</li>

                <li>Teacher development records.</li>

                <li>Admission-ready student profiles.</li>

              </ul>

            </div>

            {/* Students */}

            <div className="value-card">

              <div className="value-tag">

                FOR STUDENTS

              </div>

              <h3>

                Real Growth. Real Recognition.

              </h3>

              <ul>

                <li>Verified achievements.</li>

                <li>One lifelong Talent Passport.</li>

                <li>National visibility.</li>

                <li>Scholarships & opportunities.</li>

                <li>Skills that stay with you.</li>

              </ul>

            </div>

            {/* Partners */}

            <div className="value-card">

              <div className="value-tag">

                FOR PARTNERS

              </div>

              <h3>

                Reach The Right Talent

              </h3>

              <ul>

                <li>Discover verified students.</li>

                <li>Direct talent outreach.</li>

                <li>Scholarship campaigns.</li>

                <li>Meaningful engagement.</li>

                <li>Long-term brand visibility.</li>

              </ul>

            </div>

          </div>

        </div>

              </div>

    </section>

  );

}