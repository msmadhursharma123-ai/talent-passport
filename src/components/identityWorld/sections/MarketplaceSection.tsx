import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import GlassCard from "../shared/GlassCard";
import SectionTransition from "../shared/SectionTransition";

import COLORS from "../styles/colors";

export default function MarketplaceSection() {

    const section = CONTENT.marketplace.section;

    return (

        <SectionContainer

            id="marketplace"

            background="linear-gradient(180deg,#041F1A 0%,#06382E 45%,#031510 100%)"

            style={{

                position:"relative",

                overflow:"hidden",

                paddingTop:140,

                paddingBottom:160

            }}

        >

            <FloatingBackground />

            {/* ================================================= */}

            {/* EMERALD + CYAN ATMOSPHERE */}

            {/* ================================================= */}

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 28% 25%, rgba(16,185,129,.18), transparent 68%)",

                    pointerEvents:"none"

                }}

            />

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 78% 75%, rgba(34,211,238,.16), transparent 65%)",

                    pointerEvents:"none"

                }}

            />

            <div

                style={{

                    maxWidth:1380,

                    margin:"0 auto",

                    position:"relative",

                    zIndex:2

                }}

            >

                <AnimatedHeading

                    badge="Opportunity Exchange"

                    title="Where Talent Meets Opportunity"

                    subtitle="Students discover scholarships, workshops and mentorship. Partners discover verified talent. Schools unlock meaningful opportunities. One connected ecosystem. Two-way value."

                    align="center"

                    maxWidth={940}

                />

                <div

                    style={{

                        height:90

                    }}

                />

                {/* =====================================================

                    PACKAGE 10 PART 2 STARTS HERE

                ===================================================== */}

              <div

    style={{

        position:"relative",

        minHeight:920

    }}

>

    {/* ===================================================== */}

    {/* CENTRAL OPPORTUNITY EXCHANGE */}

    {/* ===================================================== */}

    <GlassCard

        hover={false}

        style={{

            position:"absolute",

            left:"50%",

            top:"50%",

            transform:"translate(-50%,-50%)",

            width:380,

            padding:42,

            textAlign:"center",

            background:

                "linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.06))",

            border:"1px solid rgba(16,185,129,.35)",

            zIndex:10

        }}

    >

        <div

            style={{

                fontSize:18,

                color:"#34D399",

                fontWeight:800,

                letterSpacing:2,

                textTransform:"uppercase",

                marginBottom:18

            }}

        >

            OPPORTUNITY EXCHANGE

        </div>

        <div

            style={{

                fontSize:40,

                color:"#FFFFFF",

                fontWeight:900,

                lineHeight:1.1

            }}

        >

            Talent Passport

        </div>

        <div

            style={{

                marginTop:26,

                color:COLORS.textSecondary,

                lineHeight:1.9,

                fontSize:17

            }}

        >

            A trusted exchange where students,

            schools and partners create value

            for one another through verified

            identities and meaningful opportunities.

        </div>

    </GlassCard>

    {/* ===================================================== */}

    {/* CONNECTING LINES */}

    {/* ===================================================== */}

    <svg

        width="100%"

        height="920"

        style={{

            position:"absolute",

            inset:0,

            pointerEvents:"none",

            zIndex:1

        }}

    >

        <line x1="50%" y1="50%" x2="210" y2="170"

            stroke="rgba(52,211,153,.28)"

            strokeWidth="2"

        />

        <line x1="50%" y1="50%" x2="1180" y2="170"

            stroke="rgba(34,211,238,.28)"

            strokeWidth="2"

        />

        <line x1="50%" y1="50%" x2="210" y2="720"

            stroke="rgba(96,165,250,.28)"

            strokeWidth="2"

        />

        <line x1="50%" y1="50%" x2="1180" y2="720"

            stroke="rgba(251,191,36,.28)"

            strokeWidth="2"

        />

    </svg>

    {/* ===================================================== */}

    {/* ECOSYSTEM NODES */}

    {/* ===================================================== */}

    {

        [

            {

                title:"Students",

                emoji:"🎓",

                color:"#34D399",

                left:40,

                top:90,

                bullets:[

                    "Scholarships",

                    "Workshops",

                    "Mentorship"

                ]

            },

            {

                title:"Partners",

                emoji:"🏢",

                color:"#22D3EE",

                right:40,

                top:90,

                bullets:[

                    "Student Discovery",

                    "Admissions",

                    "Visibility"

                ]

            },

            {

                title:"Schools",

                emoji:"🏫",

                color:"#60A5FA",

                left:40,

                bottom:70,

                bullets:[

                    "Recognition",

                    "Opportunities",

                    "Academic Growth"

                ]

            },

            {

                title:"Parents",

                emoji:"👨‍👩‍👧",

                color:"#FBBF24",

                right:40,

                bottom:70,

                bullets:[

                    "Awareness",

                    "Career Guidance",

                    "Confidence"

                ]

            }

        ].map(

            node=>(

                <GlassCard

                    key={node.title}

                    style={{

                        position:"absolute",

                        width:260,

                        padding:28,

                        background:"rgba(255,255,255,.08)",

                        border:`1px solid ${node.color}55`,

                        left:node.left,

                        right:node.right,

                        top:node.top,

                        bottom:node.bottom

                    }}

                >

                    <div

                        style={{

                            fontSize:34,

                            marginBottom:16

                        }}

                    >

                        {node.emoji}

                    </div>

                    <div

                        style={{

                            color:node.color,

                            fontSize:24,

                            fontWeight:800,

                            marginBottom:20

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

</div>

                <div

    style={{

        marginTop:140,

        display:"flex",

        flexDirection:"column",

        alignItems:"center",

        textAlign:"center"

    }}

>

    {/* ================================================= */}

    {/* OPPORTUNITY STREAM */}

    {/* ================================================= */}

    <div

        style={{

            width:"100%",

            overflow:"hidden",

            marginBottom:90

        }}

    >

        <div

            style={{

                display:"flex",

                justifyContent:"center",

                flexWrap:"wrap",

                gap:18

            }}

        >

            {

                [

                    "🎓 Scholarships",

                    "🎭 Workshops",

                    "💼 Consultations",

                    "🌟 Mentorship",

                    "🚀 Masterclasses",

                    "🏕️ Summer Programs",

                    "🏢 Partner Institutes",

                    "🎯 Career Guidance",

                    "📚 Skill Development",

                    "🤝 Industry Exposure"

                ].map(

                    item=>(

                        <GlassCard

                            key={item}

                            hover={false}

                            style={{

                                padding:"16px 26px",

                                borderRadius:999,

                                background:

                                    "rgba(255,255,255,.06)",

                                border:

                                    "1px solid rgba(16,185,129,.18)"

                            }}

                        >

                            <div

                                style={{

                                    color:"#FFFFFF",

                                    fontWeight:700,

                                    whiteSpace:"nowrap"

                                }}

                            >

                                {item}

                            </div>

                        </GlassCard>

                    )

                )

            }

        </div>

    </div>

    {/* ================================================= */}

    {/* VALUE EXCHANGE */}

    {/* ================================================= */}

    <div

        style={{

            width:"100%",

            maxWidth:1280,

            display:"grid",

            gridTemplateColumns:

                "repeat(auto-fit,minmax(280px,1fr))",

            gap:28

        }}

    >

        {

            [

                {

                    title:"Students Receive",

                    color:"#34D399",

                    items:[

                        "Scholarships",

                        "Workshops",

                        "Mentorship",

                        "Career Opportunities"

                    ]

                },

                {

                    title:"Partners Receive",

                    color:"#22D3EE",

                    items:[

                        "Verified Talent",

                        "Student Visibility",

                        "Admissions",

                        "Brand Reach"

                    ]

                },

                {

                    title:"Schools Receive",

                    color:"#60A5FA",

                    items:[

                        "Partner Access",

                        "Recognition",

                        "Student Growth",

                        "Better Outcomes"

                    ]

                }

            ].map(

                block=>(

                    <GlassCard

                        key={block.title}

                        style={{

                            padding:34,

                            background:"rgba(255,255,255,.06)"

                        }}

                    >

                        <div

                            style={{

                                color:block.color,

                                fontWeight:800,

                                fontSize:24,

                                marginBottom:24

                            }}

                        >

                            {block.title}

                        </div>

                        {

                            block.items.map(

                                item=>(

                                    <div

                                        key={item}

                                        style={{

                                            display:"flex",

                                            gap:12,

                                            alignItems:"center",

                                            marginBottom:16,

                                            color:COLORS.textSecondary

                                        }}

                                    >

                                        <div

                                            style={{

                                                width:8,

                                                height:8,

                                                borderRadius:"50%",

                                                background:block.color,

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

    </div>

    {/* ================================================= */}

    {/* MAIN MESSAGE */}

    {/* ================================================= */}

    <div

        style={{

            maxWidth:980,

            marginTop:110

        }}

    >

        <div

            style={{

                fontSize:"clamp(3rem,5vw,5rem)",

                fontWeight:900,

                color:"#FFFFFF",

                lineHeight:1.08,

                letterSpacing:"-0.04em"

            }}

        >

            Opportunity

            <br/>

            Should Discover

            <br/>

            Talent.

        </div>

        <div

            style={{

                marginTop:30,

                fontSize:22,

                fontWeight:700,

                background:

                    "linear-gradient(90deg,#10B981,#22D3EE,#60A5FA)",

                WebkitBackgroundClip:"text",

                WebkitTextFillColor:"transparent"

            }}

        >

            Not the other way around.

        </div>

        <p

            style={{

                maxWidth:920,

                margin:"36px auto 0",

                color:COLORS.textSecondary,

                fontSize:18,

                lineHeight:1.9

            }}

        >

            Talent Passport connects verified students, progressive schools,
            trusted parents and learning partners into one opportunity exchange,
            where meaningful opportunities reach deserving learners based on
            their verified growth, achievements and aspirations.

        </p>

    </div>

    {/* ================================================= */}

    {/* FINAL VISION */}

    {/* ================================================= */}

    <GlassCard

        hover={false}

        style={{

            marginTop:90,

            maxWidth:980,

            width:"100%",

            padding:"46px 56px",

            textAlign:"center",

            background:

                "linear-gradient(135deg,rgba(16,185,129,.12),rgba(34,211,238,.08))",

            border:"1px solid rgba(16,185,129,.20)"

        }}

    >

        <div

            style={{

                color:"#34D399",

                fontWeight:800,

                letterSpacing:2,

                textTransform:"uppercase",

                marginBottom:20

            }}

        >

            Our Belief

        </div>

        <div

            style={{

                fontSize:"clamp(2rem,4vw,3.3rem)",

                color:"#FFFFFF",

                fontWeight:900,

                lineHeight:1.3

            }}

        >

            Every student deserves access to opportunities,

            not just those who already know where to find them.

        </div>

    </GlassCard>

</div>

<SectionTransition />

            </div>

        </SectionContainer>

    );

}