import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import GlassCard from "../shared/GlassCard";
import SectionTransition from "../shared/SectionTransition";

import COLORS from "../styles/colors";

export default function PartnerSection() {

    const section = CONTENT.partners.section;

    return (

        <SectionContainer

            id="partners"

            background="linear-gradient(180deg,#06231F 0%,#0A3A35 45%,#041715 100%)"

            style={{

                position:"relative",

                overflow:"hidden",

                paddingTop:140,

                paddingBottom:160

            }}

        >

            <FloatingBackground />

            {/* ================================================= */}

            {/* PARTNER NETWORK GLOW */}

            {/* ================================================= */}

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 30% 25%, rgba(16,185,129,.16), transparent 68%)",

                    pointerEvents:"none"

                }}

            />

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 82% 75%, rgba(59,130,246,.14), transparent 64%)",

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

                    badge="Verified Partner Network"

                    title="Grow Your Institute Beyond Your City"

                    subtitle="Connect with schools, discover talented students, conduct workshops, sponsor scholarships and become part of India's trusted learning ecosystem."

                    align="center"

                    maxWidth={920}

                />

                <div

                    style={{

                        height:90

                    }}

                />

                {/* =====================================================

                    PACKAGE 11 PART 2 STARTS HERE

                ===================================================== */}

               <div

    style={{

        position:"relative",

        minHeight:980

    }}

>

    {/* ===================================================== */}

    {/* CENTRAL VERIFIED NETWORK */}

    {/* ===================================================== */}

    <GlassCard

        hover={false}

        style={{

            position:"absolute",

            left:"50%",

            top:"50%",

            transform:"translate(-50%,-50%)",

            width:390,

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

                color:"#34D399",

                fontWeight:800,

                letterSpacing:2,

                textTransform:"uppercase",

                marginBottom:18

            }}

        >

            VERIFIED NETWORK

        </div>

        <div

            style={{

                fontSize:38,

                color:"#FFFFFF",

                fontWeight:900,

                lineHeight:1.15

            }}

        >

            Talent Passport

            <br/>

            Partner Platform

        </div>

        <div

            style={{

                marginTop:26,

                color:COLORS.textSecondary,

                lineHeight:1.9,

                fontSize:17

            }}

        >

            A trusted network where verified learning
            institutes connect with schools, students
            and parents through meaningful educational
            opportunities.

        </div>

    </GlassCard>

    {/* ===================================================== */}

    {/* CONNECTION LINES */}

    {/* ===================================================== */}

    <svg

        width="100%"

        height="980"

        style={{

            position:"absolute",

            inset:0,

            pointerEvents:"none",

            zIndex:1

        }}

    >

        <line x1="50%" y1="50%" x2="220" y2="140"

            stroke="rgba(16,185,129,.28)"

            strokeWidth="2"

        />

        <line x1="50%" y1="50%" x2="1160" y2="140"

            stroke="rgba(34,211,238,.28)"

            strokeWidth="2"

        />

        <line x1="50%" y1="50%" x2="180" y2="470"

            stroke="rgba(59,130,246,.28)"

            strokeWidth="2"

        />

        <line x1="50%" y1="50%" x2="1200" y2="470"

            stroke="rgba(251,191,36,.28)"

            strokeWidth="2"

        />

        <line x1="50%" y1="50%" x2="240" y2="820"

            stroke="rgba(236,72,153,.28)"

            strokeWidth="2"

        />

        <line x1="50%" y1="50%" x2="1140" y2="820"

            stroke="rgba(168,85,247,.28)"

            strokeWidth="2"

        />

    </svg>

    {/* ===================================================== */}

    {/* PARTNER TYPES */}

    {/* ===================================================== */}

    {

        [

            {

                title:"Dance Academy",

                emoji:"💃",

                color:"#34D399",

                left:40,

                top:60

            },

            {

                title:"Music School",

                emoji:"🎵",

                color:"#22D3EE",

                right:40,

                top:60

            },

            {

                title:"Sports Academy",

                emoji:"⚽",

                color:"#60A5FA",

                left:30,

                top:380

            },

            {

                title:"Robotics Lab",

                emoji:"🤖",

                color:"#FBBF24",

                right:30,

                top:380

            },

            {

                title:"Acting Studio",

                emoji:"🎬",

                color:"#EC4899",

                left:60,

                bottom:60

            },

            {

                title:"Coding Institute",

                emoji:"💻",

                color:"#A855F7",

                right:60,

                bottom:60

            }

        ].map(

            partner=>(

                <GlassCard

                    key={partner.title}

                    style={{

                        position:"absolute",

                        width:270,

                        padding:28,

                        background:"rgba(255,255,255,.08)",

                        border:`1px solid ${partner.color}55`,

                        left:partner.left,

                        right:partner.right,

                        top:partner.top,

                        bottom:partner.bottom

                    }}

                >

                    <div

                        style={{

                            fontSize:36,

                            marginBottom:18

                        }}

                    >

                        {partner.emoji}

                    </div>

                    <div

                        style={{

                            color:partner.color,

                            fontWeight:800,

                            fontSize:22,

                            marginBottom:14

                        }}

                    >

                        {partner.title}

                    </div>

                    <div

                        style={{

                            color:COLORS.textSecondary,

                            fontSize:15,

                            lineHeight:1.75

                        }}

                    >

                        Join the verified partner network,
                        reach more schools, conduct workshops,
                        support scholarships and connect with
                        talented learners.

                    </div>

                </GlassCard>

            )

        )

    }

</div>

                {/* =====================================================

                    PACKAGE 11 PART 3 STARTS HERE

                ===================================================== */}

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

    {/* PARTNER GROWTH JOURNEY */}

    {/* ================================================= */}

    <div

        style={{

            width:"100%",

            maxWidth:1280,

            display:"grid",

            gridTemplateColumns:

                "repeat(auto-fit,minmax(240px,1fr))",

            gap:26

        }}

    >

        {

            [

                {

                    icon:"⭐",

                    title:"Get Verified",

                    text:"Build trust through a verified institute profile that showcases your expertise and offerings."

                },

                {

                    icon:"🏫",

                    title:"Reach Schools",

                    text:"Connect with schools looking for workshops, competitions and enrichment programs."

                },

                {

                    icon:"🎓",

                    title:"Discover Students",

                    text:"Meet learners based on verified interests, achievements and learning journeys."

                },

                {

                    icon:"🚀",

                    title:"Grow Your Institute",

                    text:"Increase visibility, strengthen your brand and expand your learner community."

                }

            ].map(

                item=>(

                    <GlassCard

                        key={item.title}

                        style={{

                            padding:34,

                            background:"rgba(255,255,255,.06)"

                        }}

                    >

                        <div

                            style={{

                                fontSize:42,

                                marginBottom:20

                            }}

                        >

                            {item.icon}

                        </div>

                        <div

                            style={{

                                color:"#34D399",

                                fontWeight:800,

                                fontSize:22,

                                marginBottom:16

                            }}

                        >

                            {item.title}

                        </div>

                        <div

                            style={{

                                color:COLORS.textSecondary,

                                fontSize:15,

                                lineHeight:1.8

                            }}

                        >

                            {item.text}

                        </div>

                    </GlassCard>

                )

            )

        }

    </div>

    {/* ================================================= */}

    {/* OPPORTUNITY SERVICES */}

    {/* ================================================= */}

    <div

        style={{

            width:"100%",

            maxWidth:1280,

            display:"flex",

            justifyContent:"center",

            flexWrap:"wrap",

            gap:18,

            marginTop:90

        }}

    >

        {

            [

                "🎭 Workshops",

                "🎓 Scholarships",

                "🏆 Competitions",

                "📚 Skill Programs",

                "🎤 Masterclasses",

                "🤝 Collaborations",

                "🌍 Student Discovery",

                "🏫 School Partnerships",

                "💼 Brand Visibility",

                "⭐ Verified Institute"

            ].map(

                item=>(

                    <GlassCard

                        key={item}

                        hover={false}

                        style={{

                            padding:"16px 24px",

                            borderRadius:999,

                            background:"rgba(255,255,255,.06)",

                            border:"1px solid rgba(52,211,153,.18)"

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

            Great Institutes

            <br/>

            Deserve To Be

            <br/>

            Discovered.

        </div>

        <div

            style={{

                marginTop:30,

                fontSize:22,

                fontWeight:700,

                background:

                    "linear-gradient(90deg,#10B981,#22D3EE,#3B82F6)",

                WebkitBackgroundClip:"text",

                WebkitTextFillColor:"transparent"

            }}

        >

            Let your expertise reach students who are looking for it.

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

            Talent Passport helps trusted learning institutes build
            credibility, expand their reach, conduct impactful workshops,
            support scholarships and connect with students through one
            verified education ecosystem.

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

            padding:"48px 58px",

            textAlign:"center",

            background:

                "linear-gradient(135deg,rgba(16,185,129,.12),rgba(59,130,246,.08))",

            border:"1px solid rgba(16,185,129,.22)"

        }}

    >

        <div

            style={{

                color:"#34D399",

                fontWeight:800,

                letterSpacing:2,

                textTransform:"uppercase",

                marginBottom:22

            }}

        >

            Our Vision

        </div>

        <div

            style={{

                fontSize:"clamp(2rem,4vw,3.2rem)",

                color:"#FFFFFF",

                fontWeight:900,

                lineHeight:1.3

            }}

        >

            The world's best learning opportunities

            <br/>

            should be visible to every student.

        </div>

    </GlassCard>

</div>

<SectionTransition />

            </div>

        </SectionContainer>

    );

}