import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import GlassCard from "../shared/GlassCard";

import COLORS from "../styles/colors";
import GRADIENTS from "../styles/gradients";

export default function EducationGapSection() {

    const data = CONTENT.educationGap;

    return (

        <SectionContainer

            id="education-gap"

            background={GRADIENTS.dark}

            style={{

                position: "relative",

                overflow: "hidden",

                paddingTop: 140,

                paddingBottom: 140

            }}

        >

            <FloatingBackground />

            {/* Decorative Glow */}

            <div

                style={{

                    position: "absolute",

                    inset: 0,

                    background:

                        "radial-gradient(circle at 50% 15%, rgba(59,130,246,.15), transparent 65%)",

                    pointerEvents: "none"

                }}

            />

            <div

                style={{

                    maxWidth: 1280,

                    margin: "0 auto",

                    position: "relative",

                    zIndex: 2

                }}

            >

                <AnimatedHeading

                    badge={data.badge}

                    title={data.title}

                    subtitle={data.subtitle}

                    align="center"

                    maxWidth={860}

                />

                <div

                    style={{

                        height: 80

                    }}

                />

                {/* ===================================================

                    PART 2 STARTS HERE

                =================================================== */}

                <div

                    style={{

                        display: "grid",

                        gridTemplateColumns:

                            "1fr auto 1fr",

                        gap: 50,

                        alignItems: "stretch"

                    }}

                >

                 {/* ===================================================

    TODAY'S EDUCATION

=================================================== */}

<GlassCard

    style={{

        padding: 40,

        background:

            "linear-gradient(180deg, rgba(220,38,38,.18), rgba(255,255,255,.05))",

        border:

            "1px solid rgba(239,68,68,.28)",

        display: "flex",

        flexDirection: "column",

        gap: 24

    }}

>

    <div>

        <div

            style={{

                color: "#F87171",

                fontWeight: 800,

                fontSize: 14,

                letterSpacing: 2,

                textTransform: "uppercase",

                marginBottom: 12

            }}

        >

            TODAY

        </div>

        <h3

            style={{

                margin: 0,

                color: "#FFFFFF",

                fontSize: 34,

                fontWeight: 800

            }}

        >

            Traditional Education

        </h3>

    </div>

    {

        [

            "Learning ends when the school day ends.",

            "Parents wait for report cards to understand progress.",

            "Teachers rarely know which concepts every student truly understood.",

            "Weak topics are discovered only during examinations.",

            "Achievements remain scattered across certificates and files.",

            "Learning visibility disappears after the classroom."

        ].map(

            item => (

                <div

                    key={item}

                    style={{

                        display: "flex",

                        gap: 16,

                        alignItems: "flex-start"

                    }}

                >

                    <div

                        style={{

                            color: "#F87171",

                            fontSize: 22,

                            marginTop: 2

                        }}

                    >

                        ✕


                    </div>

                    <div

                        style={{

                            color: COLORS.textSecondary,

                            lineHeight: 1.9,

                            fontSize: 16

                        }}

                    >

                        {item}

                    </div>

                </div>

            )

        )

    }

</GlassCard>

{/* ===================================================

    CENTER TIMELINE

=================================================== */}

<div

    style={{

        display: "flex",

        alignItems: "center",

        justifyContent: "center"

    }}

>

    <div

        style={{

            width: 4,

            height: "100%",

            minHeight: 520,

            borderRadius: 999,

            background:

                "linear-gradient(180deg,#38BDF8,#3B82F6,#A855F7)",

            boxShadow:

                "0 0 40px rgba(59,130,246,.55)",

            position: "relative"

        }}

    >

        <div

            style={{

                position: "absolute",

                left: "50%",

                top: "50%",

                transform: "translate(-50%,-50%)",

                width: 28,

                height: 28,

                borderRadius: "50%",

                background: "#FFFFFF",

                boxShadow:

                    "0 0 28px rgba(96,165,250,.8)"

            }}

        />

    </div>

</div>

{/* ===================================================

    TALENT PASSPORT

=================================================== */}

<GlassCard

    style={{

        padding: 40,

        background:

            "linear-gradient(180deg, rgba(37,99,235,.18), rgba(255,255,255,.05))",

        border:

            "1px solid rgba(96,165,250,.28)",

        display: "flex",

        flexDirection: "column",

        gap: 24

    }}

>

    <div>

        <div

            style={{

                color: "#7DD3FC",

                fontWeight: 800,

                fontSize: 14,

                letterSpacing: 2,

                textTransform: "uppercase",

                marginBottom: 12

            }}

        >

            TALENT PASSPORT

        </div>

        <h3

            style={{

                margin: 0,

                color: "#FFFFFF",

                fontSize: 34,

                fontWeight: 800

            }}

        >

            Continuous Learning Intelligence

        </h3>

    </div>

    {

        [

            "Learning continues beyond every classroom.",

            "Parents receive continuous visibility into daily learning.",

            "Teachers understand concept-level classroom comprehension.",

            "Weak concepts are identified before examinations.",

            "Projects, achievements and skills become one verified portfolio.",

            "Every learning experience contributes towards lifelong student growth."

        ].map(

            item => (

                <div

                    key={item}

                    style={{

                        display: "flex",

                        gap: 16,

                        alignItems: "flex-start"

                    }}

                >

                    <div

                        style={{

                            color: "#38BDF8",

                            fontSize: 22,

                            marginTop: 2

                        }}

                    >

                        ✓

                    </div>

                    <div

                        style={{

                            color: COLORS.textSecondary,

                            lineHeight: 1.9,

                            fontSize: 16

                        }}

                    >

                        {item}

                    </div>

                </div>

            )

        )

    }

</GlassCard>

                </div>

              <div

    style={{

        marginTop: 120,

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        textAlign: "center",

        position: "relative"

    }}

>

    {/* Decorative Divider */}

    <div

        style={{

            width: 140,

            height: 2,

            marginBottom: 42,

            background:

                "linear-gradient(90deg,transparent,#60A5FA,transparent)"

        }}

    />

    <div

        style={{

            maxWidth: 980,

            fontSize: "clamp(2.8rem,5vw,4.6rem)",

            lineHeight: 1.15,

            fontWeight: 900,

            color: "#FFFFFF",

            letterSpacing: "-0.04em"

        }}

    >

        Every Student Learns.

        <br />

        Very Few Students

        <br />

        Are Truly Understood.

    </div>

    <div

        style={{

            marginTop: 34,

            fontSize: "clamp(1.4rem,2vw,2rem)",

            fontWeight: 700,

            background:

                "linear-gradient(90deg,#60A5FA,#22D3EE,#A855F7)",

            WebkitBackgroundClip: "text",

            WebkitTextFillColor: "transparent"

        }}

    >

        Talent Passport changes that.

    </div>

    <p

        style={{

            maxWidth: 840,

            marginTop: 34,

            color: COLORS.textSecondary,

            fontSize: 19,

            lineHeight: 1.9

        }}

    >

        Instead of waiting for examinations to understand learning,
        Talent Passport transforms everyday classroom experiences into
        meaningful academic intelligence for students, parents, teachers,
        schools and learning partners.

    </p>

    <div

        style={{

            marginTop: 70,

            display: "flex",

            gap: 22,

            flexWrap: "wrap",

            justifyContent: "center"

        }}

    >

        {

            [

                "Daily Learning Visibility",

                "Continuous Academic Intelligence",

                "Verified Digital Portfolio",

                "One Connected Learning Ecosystem"

            ].map(

                item => (

                    <div

                        key={item}

                        style={{

                            padding: "14px 24px",

                            borderRadius: 999,

                            background:

                                "rgba(255,255,255,.08)",

                            border:

                                "1px solid rgba(255,255,255,.12)",

                            color: "#FFFFFF",

                            fontWeight: 700,

                            backdropFilter: "blur(20px)",

                            WebkitBackdropFilter: "blur(20px)"

                        }}

                    >

                        {item}

                    </div>

                )

            )

        }

    </div>

</div>

            </div>

        </SectionContainer>

    );

}