import "../../styles/testimonials.css";

const testimonials = [
  {
    quote:
      "For years, every medal, certificate and achievement was stored in a cupboard. They only came out when relatives visited. Today my daughter has one place where every performance, achievement and milestone lives together. She proudly shares her Talent Passport because it tells the story of who she is—not just what marks she scored.",
    name: "Priya Mehta",
    role: "Parent, Indore",
  },

  {
    quote:
      "My son learns dance, music and public speaking. Photos were on one phone, videos on another, certificates in files and social media posts scattered everywhere. Talent Passport brought everything together into one beautiful profile that truly reflects his journey. We finally have one place that grows with him.",
    name: "Rohan Kapoor",
    role: "Parent, Bengaluru",
  },

  {
    quote:
      "School report cards never told me whether I was improving in confidence, communication or leadership. After participating through Talent Passport, I finally understood the skills that actually matter beyond the classroom. The feedback helped me improve in ways that marks alone never could.",
    name: "Aarav Singh",
    role: "Student, Grade 10",
  },

  {
    quote:
"My daughter rarely participated in activities because she lacked confidence. Talent Passport encouraged her to step forward, perform and gradually believe in herself. During one of her performances, her talent was recognised and she received an opportunity to continue learning with experienced professionals. More than certificates, this real exposure transformed her confidence.",
    name: "Neha Verma",
    role: "Parent, Indore",
  },
];

export default function TestimonialsSection() {

    return (

        <section className="testimonials-section">

            <div className="testimonials-container">

                <div className="section-header">

                    <div className="section-tag">
                        TRUSTED BY OUR COMMUNITY
                    </div>

                    <h2>
                        Every Journey Has
                        <br />
                        A Story.
                    </h2>

                    <p>

                        Talent Passport is built for students,
                        parents, teachers, schools and partners—
                        bringing every stakeholder together through
                        one lifelong learning identity.

                    </p>

                </div>

                <div className="testimonials-grid">

                    {testimonials.map((item) => (

                        <div
                            key={item.role}
                            className="testimonial-card"
                        >

                            <div className="testimonial-stars">

                                ★★★★★

                            </div>

                            <p className="testimonial-text">

                                "{item.quote}"

                            </p>

                            <div className="testimonial-user">

                                <div className="testimonial-avatar">

                                    {item.role.charAt(0)}

                                </div>

                                <div>

                                    <h4>

                                        {item.name}

                                    </h4>

                                    <span>

                                        {item.role}

                                    </span>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </section>

    );

}