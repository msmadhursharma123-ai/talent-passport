import React from "react";
import "../styles/roleSelection.css";

interface Props {
    onSelect: (role: string) => void;
    onBack: () => void;
}

export default function RoleSelection({
    onSelect,
    onBack,
}: Props) {

    const portals = [
        {
            title: "Student Portal",
            role: "student",
            icon: "🎓",
            featured: true,
            available: true,
            tagline: "Continue your learning journey.",
            description:
                "Build your achievements, showcase your journey, participate in competitions and continue growing every single day.",
            features: [
                "Talent Passport",
                "Achievements",
                "Portfolio",
                "Competitions",
            ],
        },
        {
            title: "School Admin",
            role: "school",
            icon: "🏫",
            featured: false,
            available: false,
            tagline: "Enterprise Edition",
            description:
                "Designed for schools to celebrate holistic student growth through one unified ecosystem.",
            features: [
                "School Dashboard",
                "Reports",
                "Analytics",
                "Leadership",
            ],
        },
        {
            title: "Teacher Portal",
            role: "teacher",
            icon: "👩‍🏫",
            featured: false,
            available: false,
            tagline: "Enterprise Edition",
            description:
                "Empower teachers to guide, mentor and encourage meaningful student growth.",
            features: [
                "Mentoring",
                "Evaluations",
                "Progress",
                "Insights",
            ],
        },
        {
            title: "Partner Portal",
            role: "partner",
            icon: "🤝",
            featured: false,
            available: true,
            tagline: "Discover Future Talent",
            description:
                "Create opportunities, engage with young talent and become part of the learning ecosystem.",
            features: [
                "Workshops",
                "Scholarships",
                "Mentorship",
                "Community",
            ],
        },
        {
            title: "Platform Admin",
            role: "admin",
            icon: "⚙️",
            featured: false,
            available: true,
            tagline: "Platform Operations",
            description:
                "Manage competitions, oversee the platform and keep the ecosystem running smoothly.",
            features: [
                "Operations",
                "Reports",
                "Analytics",
                "Management",
            ],
        },
    ];

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
                    "School Portal is coming soon.\n\nThis module will be available as part of our Enterprise White Label deployment."
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

        <div className="portal-page">

    <div className="portal-background" />

    <div className="portal-container">

        {/* ===========================
            HEADER
        =========================== */}

        <button
            className="portal-back-button"
            onClick={onBack}
        >
            ← Back to Identity World
        </button>

        <div className="portal-eyebrow">
            TALENT PASSPORT
        </div>

        <h1 className="portal-title">
            Choose Your Portal
        </h1>

        <p className="portal-subtitle">
            Continue your journey through the Talent Passport ecosystem.
            Select the experience designed for your role and begin exploring.
        </p>

        {/* ===========================
            FEATURED STUDENT PORTAL
        =========================== */}

        <div className="featured-portal">

            {portals
                .filter((portal) => portal.featured)
                .map((portal) => (

                    <div
                        key={portal.role}
                        className="portal-card featured"
                        onClick={() =>
                            handlePortalSelection(portal.role)
                        }
                    >

                        <div className="portal-card-top">

                            <div className="portal-icon">
                                {portal.icon}
                            </div>

                            <div className="portal-badge">
                                Most Popular
                            </div>

                        </div>

                        <h2>
                            {portal.title}
                        </h2>

                        <h3>
                            {portal.tagline}
                        </h3>

                        <p>
                            {portal.description}
                        </p>

                        <div className="portal-features">

                            {portal.features.map((feature) => (

                                <span key={feature}>
                                    {feature}
                                </span>

                            ))}

                        </div>

                        <button className="portal-button">
                            Enter Portal →
                        </button>

                    </div>

                ))}

        </div>

        {/* ===========================
            OTHER PORTALS
        =========================== */}

        <div className="portal-grid">

            {portals
                .filter((portal) => !portal.featured)
                .map((portal) => (

                    <div
                        key={portal.role}
                        className="portal-card"
                        onClick={() =>
                            handlePortalSelection(portal.role)
                        }
                    >

                        <div className="portal-card-top">

                            <div className="portal-icon">
                                {portal.icon}
                            </div>

                            {!portal.available && (

                                <div className="coming-soon">
                                    Enterprise Edition
                                </div>

                            )}

                        </div>

                        <h2>
                            {portal.title}
                        </h2>

                        <h3>
                            {portal.tagline}
                        </h3>

                        <p>
                            {portal.description}
                        </p>

                        <div className="portal-features">

                            {portal.features.map((feature) => (

                                <span key={feature}>
                                    {feature}
                                </span>

                            ))}

                        </div>

                        <button className="portal-button">

                            {portal.available
                                ? "Enter Portal →"
                                : "Learn More →"}

                        </button>

                    </div>

                ))}

        </div>

                {/* ==========================================
            HELP SECTION
        ========================================== */}

        <section className="portal-help">

            <div className="portal-help-card">

                <h2>
                    Not sure where to begin?
                </h2>

                <p>
                    Whether you're a student, teacher, school,
                    partner or administrator, every journey starts
                    with choosing the portal designed for you.
                </p>

                <div className="portal-help-actions">

                    <button
                        className="portal-secondary-btn"
                        onClick={onBack}
                    >
                        ← Back to Identity World
                    </button>

                    <button
                        className="portal-primary-btn"
                        onClick={() =>
                            handlePortalSelection("student")
                        }
                    >
                        Explore Student Portal →
                    </button>

                </div>

            </div>

        </section>

        {/* ==========================================
            FOOTER
        ========================================== */}

        <footer className="portal-footer">

            <div className="portal-footer-logo">
                TALENT PASSPORT
            </div>

            <p>
                One Identity.
                <br />
                One Journey.
                <br />
                Endless Possibilities.
            </p>

        </footer>

    </div>

</div>

    );
}