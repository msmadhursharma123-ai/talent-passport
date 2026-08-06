import SectionHeader from "../common/SectionHeader";

const benefits = [
  "Schools use it for holistic student growth documentation.",
  "Parents understand the complete learning journey beyond marks.",
  "Students build one lifelong Talent Passport recognised everywhere.",
];



export default function ImagineSection() {

  return (

    <section
    id="hpc"
    className="imagine-section"
>

      <div className="imagine-container">

        <SectionHeader
          eyebrow=""
          title=""
          description=""
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

              Every student from a registered school receives one verified
              Talent Passport that grows with daily school learnings, projects,
              competitions, portfolios and achievements.

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

              

            </div>

        <div className="credential-header">

  <div className="credential-header-top">

    <div className="credential-chip">

      TALENT PASSPORT • HPC

    </div>

    <div className="credential-status">

      VERIFIED

    </div>

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

  <div className="credential-image-caption">

    Live Preview Of Student Talent Passport

  </div>

</div>

                 </div>

        </div>

       
      </div>

    </section>

  );

}

            

