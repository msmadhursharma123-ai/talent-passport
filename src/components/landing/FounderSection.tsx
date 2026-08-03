import "../../styles/founder.css";
import founderImage from "../../assets/founder.jpg";

export default function FounderSection() {
    return (
        <section className="founder-section">

            <div className="founder-container">

                {/* LEFT */}

                <div className="founder-image">

                    <img
                        src={founderImage}
                        alt="Madhur Sharma"
                        className="founder-photo"
                    />

                </div>

                {/* RIGHT */}



                <div className="founder-content">

                    <div className="founder-tag">

                        A MESSAGE FROM OUR FOUNDER

                    </div>

                    <h2>

                        Every Student Deserves
                        A Story Worth Remembering.

                    </h2>

                    <p>

                        Every year, millions of students participate in
                        competitions, projects, cultural events, sports and
                        countless learning experiences. They invest time,
                        effort and passion, yet most achievements end as
                        medals and certificates—celebrated for a while,
                        stored away, misplaced or eventually forgotten.

                    </p>

                    <p>

                        I believe every student's journey deserves more
                        than temporary recognition. It deserves a lasting
                        identity.

                    </p>

                    <p>

                        That's why we built <strong>Talent Passport</strong>.

                        Talent Passport is a talent and identity
                        infrastructure that enables students to build a
                        verified identity by documenting everything they
                        do—not just what they win, but what they learn,
                        create, contribute and achieve. As students grow
                        their profile, they earn credits that unlock
                        opportunities including competitions,
                        scholarships, expert masterclasses and access to
                        our growing partner ecosystem.

                    </p>

                    <p>

                        But we also wanted to solve another important gap.

                        Traditional competitions mostly provide rankings
                        and performance feedback. They rarely assess the
                        skills that truly shape a student's future—
                        communication, confidence, creativity,
                        collaboration, leadership, critical thinking and
                        credibility.

                    </p>

                    <p>

                        These are the qualities that matter in higher
                        education, entrepreneurship and the workplace, yet
                        they are rarely measured during a student's
                        formative years. That's why every Talent Passport
                        experience is intentionally designed to evaluate
                        real-world skills while providing every
                        participant with a comprehensive Talent Passport
                        Report that highlights strengths, growth areas and
                        future potential.

                    </p>

                    <p>

                        Our vision is not to build another platform.

                        It is to create the infrastructure that helps every
                        student transform their experiences into a
                        lifelong identity and meaningful opportunities.

                    </p>

                    <blockquote>

                        "One Passport. One Identity.
                        Endless Possibilities."

                    </blockquote>

                    <div className="founder-sign">

                        <strong>Madhur Sharma</strong>

                        <span>

                            Founder, Talent Passport

                        </span>

                    </div>

                </div>

            </div>

        </section>
    );
}