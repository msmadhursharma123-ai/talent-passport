import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import GlassCard from "../shared/GlassCard";
import SectionTransition from "../shared/SectionTransition";
import COLORS from "../styles/colors";
import GRADIENTS from "../styles/gradients";

export default function EcosystemSection() {

    const data = CONTENT.ecosystem;

    return (

        <SectionContainer

            id="ecosystem"

            background={GRADIENTS.dark}

            style={{

                position: "relative",

                overflow: "hidden",

                paddingTop: 140,

                paddingBottom: 140

            }}

        >

            <FloatingBackground />

            <div

                style={{

                    position: "absolute",

                    inset: 0,

                    background:

                        "radial-gradient(circle at 50% 35%, rgba(59,130,246,.12), transparent 70%)",

                    pointerEvents: "none"

                }}

            />

            <div

                style={{

                    maxWidth: 1380,

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

                    maxWidth={900}

                />

                <div

                    style={{

                        height: 90

                    }}

                />

               {/* =====================================================

    ECOSYSTEM NODES

===================================================== */}

<svg

    width="100%"

    height="760"

    style={{

        position: "absolute",

        inset: 0,

        pointerEvents: "none",

        zIndex: 1

    }}

>

    <line x1="50%" y1="50%" x2="220" y2="140" stroke="rgba(96,165,250,.25)" strokeWidth="2"/>

    <line x1="50%" y1="50%" x2="1110" y2="150" stroke="rgba(168,85,247,.25)" strokeWidth="2"/>

    <line x1="50%" y1="50%" x2="180" y2="610" stroke="rgba(236,72,153,.25)" strokeWidth="2"/>

    <line x1="50%" y1="50%" x2="1120" y2="610" stroke="rgba(34,197,94,.25)" strokeWidth="2"/>

    <line x1="50%" y1="50%" x2="650" y2="60" stroke="rgba(251,191,36,.25)" strokeWidth="2"/>

</svg>

{

[
    {

        title:"Students",

        emoji:"🎓",

        color:"#60A5FA",

        left:40,

        top:70,

        bullets:[

            "Daily Learning",

            "Portfolio",

            "Competitions"

        ]

    },

    {

        title:"Teachers",

        emoji:"👩‍🏫",

        color:"#A855F7",

        right:40,

        top:80,

        bullets:[

            "Classroom Intelligence",

            "Concept Understanding",

            "Teaching Insights"

        ]

    },

    {

        title:"Parents",

        emoji:"👨‍👩‍👧",

        color:"#EC4899",

        left:20,

        bottom:40,

        bullets:[

            "Daily Visibility",

            "Learning Progress",

            "Feedback"

        ]

    },

    {

        title:"Schools",

        emoji:"🏫",

        color:"#22C55E",

        right:20,

        bottom:40,

        bullets:[

            "Academic Analytics",

            "Teacher Performance",

            "Admissions Growth"

        ]

    },

    {

        title:"Partners",

        emoji:"🌟",

        color:"#FBBF24",

        left:"50%",

        top:0,

        transform:"translateX(-50%)",

        bullets:[

            "Scholarships",

            "Workshops",

            "Marketplace"

        ]

    }

].map(

node=>(

<GlassCard

    key={node.title}

    style={{

        position:"absolute",

        width:250,

        padding:28,

        background:"rgba(255,255,255,.08)",

        border:`1px solid ${node.color}33`,

        left:node.left,

        right:node.right,

        top:node.top,

        bottom:node.bottom,

        transform:node.transform

    }}

>

    <div

        style={{

            fontSize:34,

            marginBottom:14

        }}

    >

        {node.emoji}

    </div>

    <div

        style={{

            color:node.color,

            fontWeight:800,

            fontSize:22,

            marginBottom:18

        }}

    >

        {node.title}

    </div>

    {

        node.bullets.map(

            item=>(

                <div

                    key={item}

                    style={{

                        display:"flex",

                        gap:10,

                        alignItems:"center",

                        marginBottom:12,

                        color:COLORS.textSecondary,

                        fontSize:15

                    }}

                >

                    <div

                        style={{

                            width:8,

                            height:8,

                            borderRadius:"50%",

                            background:node.color,

                            flexShrink:0

                        }}

                    />

                    {item}

                </div>

            )

        )

    }

</GlassCard>

)

)
}

                <div

                    style={{

                        position: "relative",

                        minHeight: 760

                    }}

                >

                    {/* Center */}

                    <GlassCard

                        hover={false}

                        style={{

                            position: "absolute",

                            left: "50%",

                            top: "50%",

                            transform:

                                "translate(-50%,-50%)",

                            width: 320,

                            padding: 42,

                            textAlign: "center",

                            background:

                                "rgba(255,255,255,.10)",

                            border:

                                "1px solid rgba(255,255,255,.14)",

                            zIndex: 10

                        }}

                    >

                        <div

                            style={{

                                fontSize: 15,

                                letterSpacing: 2,

                                fontWeight: 700,

                                color: "#7DD3FC",

                                textTransform: "uppercase",

                                marginBottom: 18

                            }}

                        >

                            TALENT PASSPORT

                        </div>

                        <div

                            style={{

                                fontSize: 38,

                                color: "#FFFFFF",

                                fontWeight: 900,

                                lineHeight: 1.1

                            }}

                        >

                            Student Growth

                            <br />

                            Operating System

                        </div>

                        <div

                            style={{

                                marginTop: 22,

                                lineHeight: 1.8,

                                color:

                                    COLORS.textSecondary

                            }}

                        >

                            One connected identity

                            bringing every stakeholder

                            together around one

                            student journey.

                        </div>

                    </GlassCard>

                    {/* Package 5 Part 2 */}

                </div>

               <div

    style={{

        marginTop: 140,

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        textAlign: "center"

    }}

>

    {/* =====================================================

        SECTION DIVIDER

    ===================================================== */}

    <div

        style={{

            width: 180,

            height: 2,

            background:

                "linear-gradient(90deg,transparent,#60A5FA,#A855F7,transparent)",

            marginBottom: 48

        }}

    />

    {/* =====================================================

        MAIN STATEMENT

    ===================================================== */}

    <div

        style={{

            maxWidth: 980,

            fontSize: "clamp(2.8rem,5vw,4.8rem)",

            fontWeight: 900,

            lineHeight: 1.12,

            color: "#FFFFFF",

            letterSpacing: "-0.04em"

        }}

    >

        Every Stakeholder

        <br />

        Sees The Same Student,

        <br />

        Through A Different Lens.

    </div>

    <div

        style={{

            marginTop: 30,

            fontSize: 22,

            fontWeight: 700,

            background:

                "linear-gradient(90deg,#60A5FA,#22D3EE,#A855F7)",

            WebkitBackgroundClip: "text",

            WebkitTextFillColor: "transparent"

        }}

    >

        One Identity. Multiple Perspectives. One Connected Ecosystem.

    </div>

    <p

        style={{

            maxWidth: 900,

            marginTop: 34,

            color: COLORS.textSecondary,

            fontSize: 18,

            lineHeight: 1.9

        }}

    >

        Students learn, teachers guide, parents stay informed,
        schools gain academic intelligence and learning partners
        create meaningful opportunities—all connected through one
        trusted digital identity.

    </p>

    {/* =====================================================

        ECOSYSTEM PILLARS

    ===================================================== */}

    <div

        style={{

            display: "grid",

            gridTemplateColumns:

                "repeat(auto-fit,minmax(230px,1fr))",

            gap: 22,

            width: "100%",

            maxWidth: 1200,

            marginTop: 70

        }}

    >

        {

            [

                {

                    title:"Continuous Learning",

                    value:"365 Days"

                },

                {

                    title:"Connected Stakeholders",

                    value:"5 Ecosystems"

                },

                {

                    title:"Growth Identity",

                    value:"One Passport"

                },

                {

                    title:"Opportunities",

                    value:"Unlimited"

                }

            ].map(

                item=>(

                    <GlassCard

                        key={item.title}

                        hover={false}

                        style={{

                            padding:30,

                            textAlign:"center",

                            background:

                                "rgba(255,255,255,.06)"

                        }}

                    >

                        <div

                            style={{

                                fontSize:34,

                                fontWeight:900,

                                color:"#7DD3FC"

                            }}

                        >

                            {item.value}

                        </div>

                        <div

                            style={{

                                marginTop:12,

                                color:COLORS.textSecondary,

                                fontSize:15,

                                lineHeight:1.7

                            }}

                        >

                            {item.title}

                        </div>

                    </GlassCard>

                )

            )

        }

    </div>

</div>

<SectionTransition />

            </div>

        </SectionContainer>

    );

}