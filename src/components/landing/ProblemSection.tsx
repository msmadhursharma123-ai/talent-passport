import "../../styles/problemSection.css";
import SectionHeader from "../common/SectionHeader";

const traditionalJourney = [
  "Learning stops when the school day ends.",
  "Teachers lack real-time visibility into student understanding.",
  "Learning lack real-time visibilty into student understanding",
  "Parents wait for report cards to understand progress.",
  "Students have limited Opportunities to showcase diverse talents.",
  "Students Projects, Assignments and Performances become scattered and forgotten over time.",
  "Financial barriers prevent talented students from reaching their full potential.",
  "Students and academies struggle to discover each other.",
  "Finding the right class or scholarship is difficult and time consuming.",
  "Parents lack trusted guidance for their child's unique potential."
  
];

const passportJourney = [
  "Continuous learning beyond every classroom.",
  "Concept-level insights after every class.",
  "Weak concepts identified after every class.",
  "Parents recieve continuous visibility into daliy learning.",
  "20+ competition formats across four skill categories.",
  "One lifelong Talent Passport for every achievement.",
  "Achievements unlock scholarships and learning opportunities.",
  "A marketplace connecting talent with opportunity.",
  "Discover classes, workshops, auditions, and scholarships in one place.",
  "Expert mentoring powered by Talent Credits.",
];

const schoolBenefits = [
  "Improving their Acadmeic Results",
  "Helping them grow Admissions",
  "Giving them Continuous learning intelligence",
  "Teacher & classroom analytics",
  "NEP-ready student records",
  "Helping them Create Better Student Opportunities",
];

const studentBenefits = [
  "Helps in doubt tracking",
  "Improves learning Experience",
  "Earn Talent Credits",
  "Build One lifelong digital identity",
  "Excess to Scholarships & opportunities",
  "Continuous skill tracking",
];

const partnerBenefits = [
  "Discover verified talent",
  "Improves your institute footfall",
  "Promotes internships & outreach",
  "Meaningful student engagement",
  "Long-term talent pipeline",
  "Helps you grow admissions",
];

export default function ProblemSection() {
  return (
    <section className="problem-section">

      <div className="problem-container">

        <SectionHeader
          eyebrow="WHY TALENT PASSPORT"
          title="Every Student Has A Journey. Not Every Journey Has An Identity."
          description=""
        />

        <div className="journey-comparison">

          {/* =====================================================
              TRADITIONAL EDUCATION
          ====================================================== */}

          <div className="journey-column">

            <div className="journey-label today">
              TRADITIONAL EDUCATION
            </div>

            <h3>
              Learning Happens.
              <br />
              Identity Doesn't.
            </h3>

            <p className="journey-subtitle">
             
            </p>

            <div className="journey-notes">

              {traditionalJourney.map((item) => (

                <div
                  key={item}
                  className="journey-note"
                >

                  <span className="note-dot" />

                  <span className="note-text">

                    {item}

                  </span>

                </div>

              ))}

            </div>

          </div>

                    {/* =====================================================
              TALENT PASSPORT
          ====================================================== */}

          <div className="journey-column">

            <div className="journey-label passport">
              TALENT PASSPORT
            </div>

            <h3>
              Continuous Learning.
              <br />
              Lifelong Identity.
            </h3>

            <p className="journey-subtitle">
              
            </p>

            <div className="journey-notes">

              {passportJourney.map((item) => (

                <div
                  key={item}
                  className="journey-note success"
                >

                  <span className="note-dot" />

                  <span className="note-text">

                    {item}

                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* =====================================================
            VALUE SECTION
        ====================================================== */}

        <div className="value-system">

          <SectionHeader
            eyebrow="ONE PLATFORM"
            title="Built For Every Stakeholder"
            description=""
          />

          <div className="value-grid">

            {/* ==============================================
                SCHOOL
            ============================================== */}

            <div className="value-card">

              <div className="value-tag">
                FOR SCHOOLS
              </div>

              <h3>
                Better Learning.
                <br />
                Better Outcomes.
              </h3>

              <ul>

                {schoolBenefits.map((item) => (

                  <li key={item}>
                    {item}
                  </li>

                ))}

              </ul>

            </div>

                        {/* ==============================================
                STUDENTS
            ============================================== */}

            <div className="value-card">

              <div className="value-tag">
                FOR STUDENTS
              </div>

              <h3>
                Every Effort.
                <br />
                Forever Recognised.
              </h3>

              <ul>

                {studentBenefits.map((item) => (

                  <li key={item}>
                    {item}
                  </li>

                ))}

              </ul>

            </div>

            {/* ==============================================
                PARTNERS
            ============================================== */}

            <div className="value-card">

              <div className="value-tag">
                FOR PARTNERS
              </div>

              <h3>
                Connect With
                <br />
                Verified Talent.
              </h3>

              <ul>

                {partnerBenefits.map((item) => (

                  <li key={item}>
                    {item}
                  </li>

                ))}

              </ul>

            </div>

          </div>

        </div>

              </div>

    </section>

  );

}