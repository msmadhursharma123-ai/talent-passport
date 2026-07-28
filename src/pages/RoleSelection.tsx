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

            badge: "Recommended",

            tagline: "Your lifelong Talent Passport starts here.",

            description:
                "Build your verified identity, participate in competitions, showcase achievements, earn credits and unlock meaningful opportunities.",

            features: [
                "Talent Passport",
                "Competitions",
                "Portfolio",
                "Credits",
            ],
        },

        {
            title: "School Portal",

            role: "school",

            icon: "🏫",

            featured: false,

            available: true,

            badge: "Enterprise Edition",

            tagline: "Designed for institutions.",

            description:
                "Empower schools with holistic student analytics, institutional insights and one unified growth ecosystem.",

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

            available: true,

            badge: "Enterprise Edition",

            tagline: "Empower every educator.",

            description:
                "Guide, mentor and evaluate students while tracking meaningful progress beyond academics.",

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

            tagline: "Create meaningful opportunities.",

            description:
                "Discover emerging talent, launch scholarships, workshops and mentorship programs through the Talent Passport ecosystem.",

            features: [
                "Talent Discovery",
                "Scholarships",
                "Workshops",
                "Mentorship",
            ],
        },

        {
            title: "Platform Admin",

            role: "admin",

            icon: "⚙️",

            featured: false,

            available: true,

            tagline: "Manage the ecosystem.",

            description:
                "Operate competitions, analytics, institutions and platform-wide services from one unified administration dashboard.",

            features: [
                "Operations",
                "Analytics",
                "Management",
                "Reports",
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

    onSelect("school");

    return;

           case "teacher":

    onSelect("teacher");

    return;

            default:

                alert("Portal not available.");

        }

    }

        return (

        <div className="portal-page responsive-role-page">

            <div className="portal-background" />

            <div className="portal-container responsive-role-container">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <button
                    className="portal-back-button"
                    onClick={onBack}
                >
                    ← Login to Identity World
                </button>

                <div className="portal-header">

                    <div className="portal-eyebrow">

                        TALENT PASSPORT ECOSYSTEM

                    </div>

                    <h1 className="portal-title">

                        Choose Your Experience

                    </h1>

                    <p className="portal-subtitle">

                        One Identity. Five Experiences.
                        Select the portal designed for your journey
                        and continue building your Talent Passport.

                    </p>

                </div>

                {/* ==========================================
                    PORTALS
                ========================================== */}

                <div className="portal-grid">

                    {portals.map((portal) => (

                        <div
                            key={portal.role}
                            className={`portal-card ${
                                portal.featured ? "featured" : ""
                            }`}
                            onClick={() =>
                                handlePortalSelection(portal.role)
                            }
                        >

                            <div className="portal-card-top">

                                <div className="portal-icon">

                                    {portal.icon}

                                </div>

                                {portal.badge && (

                                    <div className="portal-badge">

                                        {portal.badge}

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

                            <button
                                className="portal-button"
                                onClick={(e) => {

                                    e.stopPropagation();

                                    handlePortalSelection(
                                        portal.role
                                    );

                                }}
                            >

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

                <div className="portal-help-content">

                    <div className="portal-help-eyebrow">

                        NEED HELP?

                    </div>

                    <h2>

                        Not sure which portal is right for you?

                    </h2>

                    <p>

                        Students should begin with the Student Portal.
                        Schools and Teachers receive Enterprise onboarding,
                        while Partners and Administrators can access their
                        dedicated ecosystem through their respective portals.

                    </p>

                </div>

                <div className="portal-help-actions">

                    <button
                        className="portal-secondary-btn"
                        onClick={onBack}
                    >

                        ← Login to Identity World

                    </button>

                    <button
                        className="portal-primary-btn"
                        onClick={() =>
                            handlePortalSelection("student")
                        }
                    >

                        Enter Student Portal →

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

                One Passport.
                <br />

                One Identity.
                <br />

                Endless Possibilities.

            </p>

        </footer>

    </div>


<style>{`
@media (max-width: 1024px) {
  .responsive-role-page { box-sizing: border-box; }
  .responsive-role-container { width: 100% !important; max-width: 100% !important; box-sizing: border-box; padding-left: 24px !important; padding-right: 24px !important; }
  .responsive-role-page .portal-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; gap: 18px !important; }
  .responsive-role-page .portal-card { min-width: 0 !important; padding: 24px !important; }
  .responsive-role-page .portal-help-card { gap: 22px !important; }
}
@media (max-width: 650px) {
  .responsive-role-container { padding-left: 14px !important; padding-right: 14px !important; }
  .responsive-role-page .portal-header { margin-bottom: 24px !important; }
  .responsive-role-page .portal-title { font-size: 34px !important; line-height: 1.08 !important; }
  .responsive-role-page .portal-subtitle { font-size: 14px !important; line-height: 1.5 !important; }
  .responsive-role-page .portal-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
  .responsive-role-page .portal-card { padding: 18px !important; border-radius: 18px !important; }
  .responsive-role-page .portal-card h2 { font-size: 22px !important; margin-bottom: 6px !important; }
  .responsive-role-page .portal-card h3 { font-size: 14px !important; margin-bottom: 8px !important; }
  .responsive-role-page .portal-card p { font-size: 13px !important; line-height: 1.45 !important; }
  .responsive-role-page .portal-features { gap: 6px !important; }
  .responsive-role-page .portal-features span { font-size: 11px !important; padding: 6px 8px !important; }
  .responsive-role-page .portal-button { width: 100% !important; min-height: 42px; }
  .responsive-role-page .portal-help-card { flex-direction: column !important; padding: 18px !important; }
  .responsive-role-page .portal-help-actions { width: 100% !important; }
  .responsive-role-page .portal-help-actions button { width: 100% !important; }
}
`}</style>
</div>

    );

}