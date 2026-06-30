import "../../styles/journey.css";

import SectionHeader from "../common/SectionHeader";

const journey = [

    {
        icon: "🌱",
        title: "Discover",
        description:
            "Every journey begins with curiosity, passion and the courage to explore new possibilities."
    },

    {
        icon: "🎯",
        title: "Participate",
        description:
            "Take part in competitions and real-world experiences that build confidence and character."
    },

    {
        icon: "💡",
        title: "Create",
        description:
            "Build projects, solve problems, express ideas and transform learning into meaningful outcomes."
    },

    {
        icon: "🏆",
        title: "Achieve",
        description:
            "Celebrate every milestone through verified achievements instead of temporary certificates."
    },

    {
        icon: "📈",
        title: "Grow",
        description:
            "Every experience contributes to your lifelong growth, profile and personal development."
    },

    {
        icon: "✨",
        title: "Be Recognised",
        description:
            "Your achievements become visible to schools, universities and future opportunities."
    },

    {
        icon: "🚀",
        title: "Unlock Opportunities",
        description:
            "Talent Passport transforms participation into scholarships, admissions, internships and careers."
    }

];

export default function JourneySection() {

    return (

        <section className="journey-section">

            <div className="journey-container">

                <SectionHeader

                    eyebrow="YOUR JOURNEY"

                    title="Every Great Journey Begins With One Small Step."

                    description="Growth isn't defined by one exam or one achievement. It is built through countless experiences that shape who you become."

                />

                <div className="journey-timeline">

                    {journey.map((step) => (

                        <div
                            key={step.title}
                            className="journey-item"
                        >

                            <div className="journey-circle">

                                <span>

                                    {step.icon}

                                </span>

                            </div>

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

                <div className="journey-bottom">

                    <h2>

                        Every Step Matters.

                    </h2>

                    <p>

                        Every competition, every project, every achievement and every milestone becomes
                        part of one lifelong identity. Your Talent Passport grows with you, preserving
                        your journey and opening doors to future opportunities.

                    </p>

                </div>

            </div>

        </section>

    );

}