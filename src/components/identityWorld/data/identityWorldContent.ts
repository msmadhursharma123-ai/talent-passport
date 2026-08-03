/**
 * ============================================================
 * Identity World V2
 * Central Content Management
 * ------------------------------------------------------------
 * Every section of Identity World reads content from here.
 * No UI strings should be hardcoded inside components.
 * ============================================================
 */

export interface HeroFloatingCard {

    title: string;

    value: string;

    subtitle: string;

    color: string;

}

export interface HeroButton {

    label: string;

    variant:
        | "primary"
        | "secondary"
        | "success";

}

export interface HeroContent {

    badge: string;

    title: string;

    highlight: string;

    subtitle: string;

    tagline: string;

    primaryButton: HeroButton;

    secondaryButton: HeroButton;

    statistics: {

        value: string;

        label: string;

    }[];

    floatingCards: HeroFloatingCard[];

}

export interface SectionContent {

    badge: string;

    title: string;

    subtitle: string;

}

export interface JourneyCard {

    title: string;

    description: string;

}

export interface FeatureCard {

    title: string;

    description: string;

}

export interface MarketplaceCard {

    title: string;

    description: string;

}

export interface PartnerCategory {

    name: string;

}

export interface IdentityWorldContent {

    hero: HeroContent;

    educationGap: SectionContent;

    ecosystem: SectionContent;

    studentJourney: {

        section: SectionContent;

        journey: JourneyCard[];

    };

    academicIntelligence: {

        section: SectionContent;

        cards: FeatureCard[];

    };

    portfolio: {

        section: SectionContent;

        cards: FeatureCard[];

    };

    competitions: {

        section: SectionContent;

        cards: FeatureCard[];

    };

    credits: {

        section: SectionContent;

        cards: FeatureCard[];

    };

    marketplace: {

        section: SectionContent;

        cards: MarketplaceCard[];

    };

    partners: {

        section: SectionContent;

        categories: PartnerCategory[];

    };

    schools: {

        section: SectionContent;

    };

    teachers: {

        section: SectionContent;

    };

    parents: {

        section: SectionContent;

    };

    founder: {

        section: SectionContent;

    };

    cta: {

        title: string;

        subtitle: string;

        button: string;

    };

}

export const CONTENT: IdentityWorldContent = {

    hero: {

        badge:
            "WELCOME TO TALENT PASSPORT",

        title:
            "India's Student Growth",

        highlight:
            "Operating System",

        subtitle:

            "Connecting Students, Parents, Teachers, Schools and Learning Partners through one intelligent growth ecosystem.",

        tagline:

            "One Passport. One Identity. Endless Possibilities.",

        primaryButton: {

            label:
                "Enter Identity World",

            variant:
                "primary"

        },

        secondaryButton: {

            label:
                "Explore Platform",

            variant:
                "secondary"

        },

        statistics: [

            {

                value:
                    "4",

                label:
                    "Integrated Portals"

            },

            {

                value:
                    "20",

                label:
                    "Competition Events"

            },

            {

                value:
                    "365",

                label:
                    "Days of Learning"

            },

            {

                value:
                    "1",

                label:
                    "Unified Identity"

            }

        ],

        floatingCards: [

            {

                title:
                    "Student",

                value:
                    "Growth",

                subtitle:
                    "Academic + Co-Curricular",

                color:
                    "#2563EB"

            },

            {

                title:
                    "Teacher",

                value:
                    "Insights",

                subtitle:
                    "Classroom Intelligence",

                color:
                    "#10B981"

            },

            {

                title:
                    "School",

                value:
                    "Analytics",

                subtitle:
                    "Daily Learning Visibility",

                color:
                    "#7C3AED"

            },

            {

                title:
                    "Marketplace",

                value:
                    "Partners",

                subtitle:
                    "Scholarships & Workshops",

                color:
                    "#F97316"

            }

        ]

    },

        educationGap: {

        badge:
            "THE EDUCATION GAP",

        title:
            "Learning Shouldn't Stop When The School Bell Rings.",

        subtitle:

            "Students, parents, teachers and schools deserve continuous visibility into learning—not just report cards at the end of the term."

    },

    ecosystem: {

        badge:
            "ONE CONNECTED ECOSYSTEM",

        title:
            "Every Stakeholder. One Connected Identity.",

        subtitle:

            "Talent Passport connects Students, Parents, Teachers, Schools and Learning Partners into one unified growth ecosystem where learning, opportunities and achievements remain connected."

    },

    studentJourney: {

        section: {

            badge:
                "THE STUDENT JOURNEY",

            title:
                "Every Learning Experience Builds Your Identity.",

            subtitle:

                "Academic learning, classroom understanding, projects, competitions and achievements together build one lifelong digital growth journey."

        },

        journey: [

            {

                title:
                    "Attend Classes",

                description:

                    "Every classroom becomes the beginning of your growth journey."

            },

            {

                title:
                    "Understand Daily Learning",

                description:

                    "Capture classroom understanding, identify difficult concepts and continuously improve."

            },

            {

                title:
                    "Resolve Doubts",

                description:

                    "Identify weak topics early and strengthen concepts before examinations."

            },

            {

                title:
                    "Build Your Portfolio",

                description:

                    "Projects, performances, skills and achievements become part of one verified digital portfolio."

            },

            {

                title:
                    "Participate In Competitions",

                description:

                    "Compete across academic and co-curricular categories while building credibility."

            },

            {

                title:
                    "Earn Credits",

                description:

                    "Receive recognition for participation, learning and contribution inside the ecosystem."

            },

            {

                title:
                    "Unlock Opportunities",

                description:

                    "Use your portfolio and credits to discover scholarships, workshops, mentors and partner institutes."

            }

        ]

    },

    academicIntelligence: {

        section: {

            badge:
                "ACADEMIC INTELLIGENCE",

            title:
                "Understand Learning. Every Single Day.",

            subtitle:

                "Talent Passport brings classroom intelligence to students, parents, teachers and schools."

        },

        cards: [

            {

                title:
                    "Daily Classroom Feedback",

                description:

                    "Know exactly what was taught and how well it was understood after every class."

            },

            {

                title:
                    "Concept Understanding",

                description:

                    "Identify topics that require more attention before they become learning gaps."

            },

            {

                title:
                    "Smart Revision",

                description:

                    "Automatically build revision around concepts that need improvement."

            },

            {

                title:
                    "Learning Timeline",

                description:

                    "Track academic understanding throughout the year instead of relying only on examination results."

            },

            {

                title:
                    "Parent Visibility",

                description:

                    "Parents stay informed about daily learning, difficult topics and academic progress."

            },

            {

                title:
                    "Continuous Improvement",

                description:

                    "Small daily improvements lead to stronger academic outcomes over time."

            }

        ]

    },

        portfolio: {

        section: {

            badge:
                "DIGITAL PORTFOLIO",

            title:
                "Build Your Story. Not Just Your Resume.",

            subtitle:

                "Every project, achievement, skill, participation and learning milestone contributes towards one verified lifelong digital portfolio."

        },

        cards: [

            {

                title:
                    "Projects",

                description:

                    "Showcase academic projects, innovations, research and practical learning experiences."

            },

            {

                title:
                    "Achievements",

                description:

                    "Store verified certificates, awards and recognitions in one secure digital identity."

            },

            {

                title:
                    "Skills",

                description:

                    "Document technical, creative, leadership and communication skills developed throughout your journey."

            },

            {

                title:
                    "Activities",

                description:

                    "Capture participation in clubs, events, volunteering, leadership roles and extracurricular initiatives."

            },

            {

                title:
                    "Verified Identity",

                description:

                    "Everything remains connected to one trusted student profile that grows throughout school."

            },

            {

                title:
                    "Future Ready",

                description:

                    "A portfolio built today becomes valuable for higher education, scholarships and future opportunities."

            }

        ]

    },

    competitions: {

        section: {

            badge:
                "COMPETITION ECOSYSTEM",

            title:
                "Compete. Learn. Grow. Get Recognised.",

            subtitle:

                "Participate in structured competitions that celebrate learning, creativity, leadership and real-world skills."

        },

        cards: [

            {

                title:
                    "20 Competition Events",

                description:

                    "Participate across multiple academic and co-curricular categories designed for holistic student development."

            },

            {

                title:
                    "District To National",

                description:

                    "Progress through district, cluster, state and national levels while building your verified achievement record."

            },

            {

                title:
                    "Skill Evaluation",

                description:

                    "Receive structured feedback beyond winning or losing to support continuous improvement."

            },

            {

                title:
                    "Build Recognition",

                description:

                    "Every participation contributes towards your digital portfolio and lifelong learning identity."

            },

            {

                title:
                    "Earn Credits",

                description:

                    "Competitions reward active participation and help unlock future opportunities across the ecosystem."

            },

            {

                title:
                    "Partner Opportunities",

                description:

                    "Outstanding performers may receive visibility for workshops, scholarships and partner institute opportunities."

            }

        ]

    },

    credits: {

        section: {

            badge:
                "CREDITS ECONOMY",

            title:
                "Learn. Participate. Earn Credits.",

            subtitle:

                "Every meaningful contribution inside Talent Passport helps students build credits that unlock future learning opportunities."

        },

        cards: [

            {

                title:
                    "Upload Projects",

                description:

                    "Academic work, innovations and practical learning contribute towards your digital identity."

            },

            {

                title:
                    "Showcase Performances",

                description:

                    "Present creative work, presentations and co-curricular achievements."

            },

            {

                title:
                    "Participate Regularly",

                description:

                    "Active participation across school activities and competitions helps build your learning profile."

            },

            {

                title:
                    "Earn Credits",

                description:

                    "Credits recognise consistency, contribution and engagement across the ecosystem."

            },

            {

                title:
                    "Unlock Experiences",

                description:

                    "Use credits to access consultations, workshops and premium opportunities offered by verified partners."

            },

            {

                title:
                    "Grow Continuously",

                description:

                    "The more you learn and contribute, the stronger your Talent Passport becomes."

            }

        ]

    },

    marketplace: {

        section: {

            badge:
                "MARKETPLACE",

            title:
                "Where Learning Meets Opportunity.",

            subtitle:

                "Talent Passport connects students with verified institutes, mentors, scholarships, workshops and learning experiences."

        },

        cards: [

            {

                title:
                    "Scholarships",

                description:

                    "Discover scholarship opportunities offered by verified learning partners."

            },

            {

                title:
                    "Workshops",

                description:

                    "Participate in expert-led workshops designed to strengthen real-world skills."

            },

            {

                title:
                    "Consultations",

                description:

                    "Book sessions with professionals, mentors and specialised learning institutes."

            },

            {

                title:
                    "Verified Partners",

                description:

                    "Explore trusted institutes across music, dance, coding, robotics, public speaking, sports and more."

            },

            {

                title:
                    "Student Opportunities",

                description:

                    "Students can discover meaningful opportunities based on their interests, achievements and participation."

            },

            {

                title:
                    "Growing Ecosystem",

                description:

                    "Schools, students and partners grow together through one connected marketplace."

            }

        ]

    },

        partners: {

        section: {

            badge:
                "BECOME A PARTNER",

            title:
                "Reach Students. Grow Your Institute.",

            subtitle:

                "Talent Passport helps verified learning partners connect with students, conduct workshops, offer scholarships and expand their impact."

        },

        categories: [

            { name: "Dance Academy" },

            { name: "Music Institute" },

            { name: "Drama & Theatre" },

            { name: "Public Speaking" },

            { name: "Debate Academy" },

            { name: "Coding Institute" },

            { name: "Robotics Lab" },

            { name: "STEM Academy" },

            { name: "Sports Academy" },

            { name: "Chess Academy" },

            { name: "Art & Craft" },

            { name: "Language Institute" }

        ]

    },

    schools: {

        section: {

            badge:
                "FOR SCHOOLS",

            title:
                "Bring Your Entire School Into One Growth Ecosystem.",

            subtitle:

                "Empower principals, teachers, students and parents through continuous academic intelligence, verified portfolios, competitions and learning analytics."

        }

    },

    teachers: {

        section: {

            badge:
                "TEACHER INTELLIGENCE",

            title:
                "Empowering Teachers Beyond The Classroom.",

            subtitle:

                "Daily classroom understanding, topic-wise feedback, learning behaviour and teaching insights help teachers continuously improve learning outcomes."

        }

    },

    parents: {

        section: {

            badge:
                "PARENT VISIBILITY",

            title:
                "Know What Your Child Learns Every Day.",

            subtitle:

                "Move beyond report cards with daily learning visibility, difficult concepts, revision needs and continuous academic progress."

        }

    },

    founder: {

        section: {

            badge:
                "OUR VISION",

            title:
                "Building The Learning Infrastructure For Every Student.",

            subtitle:

                "Talent Passport is creating a connected ecosystem where students, parents, teachers, schools and learning partners work together to make learning more visible, measurable and meaningful."

        }

    },

    cta: {

        title:

            "One Passport. One Identity. Endless Possibilities.",

        subtitle:

            "Join the Talent Passport ecosystem and become part of the future of student growth.",

        button:

            "Enter Identity World"

    }

};

export default CONTENT;