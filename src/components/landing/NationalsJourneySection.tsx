import "../../styles/nationalsJourney.css";

const stages = [
    {
        title: "Talent Passport School Tryouts",
        status: "Coming Soon",
        description:
            "Every student's journey begins within their own school through exciting talent-based challenges and activities.",
    },
    {
        title: "Talent Passport City League",
        status: "Upcoming",
        description:
            "Outstanding students from participating schools compete at the city level and continue building their Talent Passport.",
    },
    {
        title: "Talent Passport Cluster League",
        status: "Future",
        description:
            "City champions progress into regional cluster leagues where collaboration, innovation and excellence are celebrated.",
    },
    {
        title: "Talent Passport Nationals",
        status: "Vision",
        description:
            "India's biggest celebration of student talent where achievements, leadership and lifelong learning come together.",
    },
];

export default function NationalsJourneySection() {

    return (

        <section className="nationals-section">

            <div className="nationals-container">

                <div className="nationals-header">

                    <div className="nationals-tag">
                        THE ROAD AHEAD
                    </div>

                    <h2>

                        The Road to
                        <br />
                        Talent Passport Nationals

                    </h2>

                    <p>

                        Every journey starts locally and grows into
                        something much bigger. Talent Passport creates
                        one continuous pathway from school participation
                        to national recognition.

                    </p>

                </div>

                <div className="nationals-timeline">

                    {stages.map((stage, index) => (

                        <div
                            key={stage.title}
                            className="timeline-stage"
                        >

                            <div className="timeline-circle">

                                {index + 1}

                            </div>

                            <div className="timeline-card">

                                <div className="timeline-status">

                                    {stage.status}

                                </div>

                                <h3>

                                    {stage.title}

                                </h3>

                                <p>

                                    {stage.description}

                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </section>

    );

}