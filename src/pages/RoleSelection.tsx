import React from "react";

interface Props {
    onSelect: (role: string) => void;
    onBack: () => void;
}

export default function RoleSelection({

    onSelect,
    onBack,

}: Props) {

    const cardStyle = {

        background: "white",

        borderRadius: "24px",

        padding: "35px",

        cursor: "pointer",

        minHeight: "320px",

        display: "flex",

        flexDirection: "column" as const,

        justifyContent: "space-between",

        boxShadow:
            "0 10px 25px rgba(0,0,0,0.06)",

        transition: "0.3s",

    };

    const titleStyle = {

        fontSize: "30px",

        color: "#143B73",

        marginBottom: "15px",

        fontWeight: 600,

    };

    const descriptionStyle = {

        fontSize: "17px",

        color: "#666",

        lineHeight: "1.7",

    };

    const buttonStyle = {

        marginTop: "30px",

        background: "#F4A623",

        color: "white",

        border: "none",

        borderRadius: "12px",

        padding: "14px 22px",

        fontSize: "16px",

        fontWeight: 600,

        cursor: "pointer",

        width: "fit-content",

    };

    function handlePortalSelection(
        role: string
    ) {

        switch (role) {

            case "student":

            case "partner":

            case "admin":

                onSelect(role);

                return;

            case "school":

                alert(

                    "School Admin Portal is coming soon.\n\nThis module will be available as part of our Enterprise White Label deployment."

                );

                return;

            case "teacher":

                alert(

                    "Teacher Portal is coming soon.\n\nThis module will be available as part of our Enterprise White Label deployment."

                );

                return;

            default:

                alert("Portal not available.");

        }

    }

    return (

        <div

            style={{

                minHeight: "100vh",

                background: "#F8F7F4",

                padding: "70px",

            }}

        >

            <div

                style={{

                    maxWidth: "1300px",

                    margin: "0 auto",

                }}

            >

                <button

                    onClick={onBack}

                    style={{

                        background: "transparent",

                        border: "none",

                        color: "#143B73",

                        fontSize: "18px",

                        fontWeight: 600,

                        cursor: "pointer",

                        marginBottom: "30px",

                    }}

                >

                    ← Back to Identity World

                </button>

                <div

                    style={{

                        color: "#F4A623",

                        letterSpacing: "3px",

                        fontWeight: 600,

                        marginBottom: "20px",

                    }}

                >

                    TALENT PASSPORT

                </div>

                <h1

                    style={{

                        fontSize: "72px",

                        color: "#143B73",

                        marginBottom: "15px",

                        lineHeight: "1.1",

                    }}

                >

                    Choose Your Portal

                </h1>

                <p

                    style={{

                        color: "#555",

                        fontSize: "24px",

                        marginBottom: "60px",

                    }}

                >

                    Access your dedicated Talent Passport ecosystem.

                </p>

                <div

                    style={{

                        display: "grid",

                        gridTemplateColumns:
                            "repeat(3, 1fr)",

                        gap: "30px",

                    }}

                >

                    {[
                        {
                            title: "Student / Parent",
                            role: "student",
                            description:
                                "Talent Passport, rankings, achievements, DNA profile, growth analytics and verified progress records.",
                            available: true,
                        },
                        {
                            title: "School Admin",
                            role: "school",
                            description:
                                "School leaderboard, participation tracking, rankings, reports, analytics and talent intelligence dashboard.",
                            available: false,
                        },
                        {
                            title: "Teacher Portal",
                            role: "teacher",
                            description:
                                "Student mentoring, evaluations, participation monitoring and performance insights.",
                            available: false,
                        },
                        {
                            title: "Partner Portal",
                            role: "partner",
                            description:
                                "Workshops, scholarships, masterclasses, talent discovery and ecosystem collaboration.",
                            available: true,
                        },
                        {
                            title: "Platform Admin",
                            role: "admin",
                            description:
                                "Competition operations, evaluations, platform analytics, reports, leaderboard management and ecosystem controls.",
                            available: true,
                        },
                    ].map((card) => (

                        <div

                            key={card.role}

                            style={{

                                ...cardStyle,

                                opacity:
                                    card.available
                                        ? 1
                                        : 0.9,

                            }}

                            onClick={() =>
                                handlePortalSelection(
                                    card.role
                                )
                            }

                        >

                            <div>

                                <h2 style={titleStyle}>

                                    {card.title}

                                </h2>

                                <p style={descriptionStyle}>

                                    {card.description}

                                </p>

                                {!card.available && (

                                    <div

                                        style={{

                                            marginTop: 18,

                                            display: "inline-block",

                                            background:
                                                "#FFF4E5",

                                            color:
                                                "#C67A00",

                                            padding:
                                                "6px 12px",

                                            borderRadius:
                                                "999px",

                                            fontWeight: 700,

                                            fontSize: 13,

                                        }}

                                    >

                                        Enterprise Edition • Coming Soon

                                    </div>

                                )}

                            </div>

                            <button

                                style={buttonStyle}

                            >

                                {

                                    card.available

                                        ? "Enter Portal →"

                                        : "Learn More →"

                                }

                            </button>

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );

}