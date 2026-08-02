import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import GlassCard from "../shared/GlassCard";
import SectionTransition from "../shared/SectionTransition";

import COLORS from "../styles/colors";

export default function SchoolSection() {

    return (

        <SectionContainer

            id="schools"

            background="linear-gradient(180deg,#071326 0%,#0A2342 45%,#040B16 100%)"

            style={{

                position:"relative",

                overflow:"hidden",

                paddingTop:140,

                paddingBottom:180

            }}

        >

            <FloatingBackground />

            {/* ================================================= */}

            {/* EXECUTIVE INTELLIGENCE GLOW */}

            {/* ================================================= */}

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 28% 22%, rgba(59,130,246,.18), transparent 68%)",

                    pointerEvents:"none"

                }}

            />

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 82% 75%, rgba(16,185,129,.16), transparent 64%)",

                    pointerEvents:"none"

                }}

            />

            <div

                style={{

                    maxWidth:1400,

                    margin:"0 auto",

                    position:"relative",

                    zIndex:2

                }}

            >

                <AnimatedHeading

                    badge="Academic Intelligence Operating System"

                    title="See What Every Classroom Is Learning."

                    subtitle="Daily classroom intelligence, teacher visibility, student understanding, parent engagement and school-wide academic insights—brought together into one executive command center."

                    align="center"

                    maxWidth={960}

                />

                <div

                    style={{

                        height:90

                    }}

                />

                {/* =====================================================

                    PACKAGE 12 PART 2 STARTS HERE

                ===================================================== */}

           <div

    style={{

        position:"relative",

        minHeight:1100

    }}

>

    {/* ===================================================== */}

    {/* COMMAND CENTER */}

    {/* ===================================================== */}

    <GlassCard

        hover={false}

        style={{

            width:"100%",

            padding:42,

            background:

                "linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.05))",

            border:"1px solid rgba(59,130,246,.25)",

            overflow:"hidden"

        }}

    >

        {/* HEADER */}

        <div

            style={{

                display:"flex",

                justifyContent:"space-between",

                alignItems:"center",

                marginBottom:40,

                flexWrap:"wrap",

                gap:20

            }}

        >

            <div>

                <div

                    style={{

                        color:"#38BDF8",

                        fontWeight:800,

                        letterSpacing:2,

                        textTransform:"uppercase",

                        fontSize:13

                    }}

                >

                    LIVE ACADEMIC INTELLIGENCE

                </div>

                <div

                    style={{

                        color:"#FFFFFF",

                        fontSize:34,

                        fontWeight:900,

                        marginTop:8

                    }}

                >

                    School Intelligence Command Center

                </div>

            </div>

            <GlassCard

                hover={false}

                style={{

                    padding:"14px 22px",

                    borderRadius:999,

                    background:"rgba(16,185,129,.12)",

                    border:"1px solid rgba(16,185,129,.25)"

                }}

            >

                <div

                    style={{

                        color:"#34D399",

                        fontWeight:800

                    }}

                >

                    ● LIVE SCHOOL INSIGHTS

                </div>

            </GlassCard>

        </div>

        {/* ===================================================== */}

        {/* DASHBOARD GRID */}

        {/* ===================================================== */}

        <div

            style={{

                display:"grid",

                gridTemplateColumns:

                    "repeat(auto-fit,minmax(260px,1fr))",

                gap:24

            }}

        >

            {

                [

                    {

                        icon:"😊",

                        title:"Student Understanding",

                        color:"#38BDF8",

                        text:"Track classroom understanding levels across every subject and every class."

                    },

                    {

                        icon:"❓",

                        title:"Daily Doubt Resolution",

                        color:"#F97316",

                        text:"Identify concepts where students struggled and monitor daily resolution."

                    },

                    {

                        icon:"👨‍🏫",

                        title:"Teacher Visibility",

                        color:"#22C55E",

                        text:"Understand teaching effectiveness through topic-wise classroom feedback."

                    },

                    {

                        icon:"👨‍👩‍👧",

                        title:"Parent Engagement",

                        color:"#A855F7",

                        text:"Capture parent feedback and strengthen school-home communication."

                    },

                    {

                        icon:"📚",

                        title:"Subject Intelligence",

                        color:"#FBBF24",

                        text:"Monitor understanding trends chapter-by-chapter across every subject."

                    },

                    {

                        icon:"📈",

                        title:"School Growth",

                        color:"#06B6D4",

                        text:"Use academic intelligence to improve learning outcomes and admissions."

                    }

                ].map(

                    card=>(

                        <GlassCard

                            key={card.title}

                            style={{

                                padding:28,

                                background:"rgba(255,255,255,.05)",

                                border:`1px solid ${card.color}22`

                            }}

                        >

                            <div

                                style={{

                                    fontSize:40,

                                    marginBottom:18

                                }}

                            >

                                {card.icon}

                            </div>

                            <div

                                style={{

                                    color:card.color,

                                    fontWeight:800,

                                    fontSize:22,

                                    marginBottom:14

                                }}

                            >

                                {card.title}

                            </div>

                            <div

                                style={{

                                    color:COLORS.textSecondary,

                                    lineHeight:1.8,

                                    fontSize:15

                                }}

                            >

                                {card.text}

                            </div>

                        </GlassCard>

                    )

                )

            }

        </div>

    </GlassCard>

    {/* ===================================================== */}

    {/* AI ENGINE */}

    {/* ===================================================== */}

    <GlassCard

        hover={false}

        style={{

            marginTop:70,

            padding:"40px 48px",

            textAlign:"center",

            background:

                "linear-gradient(135deg,rgba(59,130,246,.10),rgba(16,185,129,.10))",

            border:"1px solid rgba(59,130,246,.20)"

        }}

    >

        <div

            style={{

                color:"#38BDF8",

                fontWeight:800,

                letterSpacing:2,

                textTransform:"uppercase",

                marginBottom:18

            }}

        >

            AI ACADEMIC INTELLIGENCE ENGINE

        </div>

        <div

            style={{

                fontSize:"clamp(2.2rem,4vw,3.6rem)",

                color:"#FFFFFF",

                fontWeight:900,

                lineHeight:1.2

            }}

        >

            Thousands of Daily Learning Signals.

            <br/>

            One Unified School Intelligence Layer.

        </div>

        <p

            style={{

                marginTop:30,

                color:COLORS.textSecondary,

                maxWidth:900,

                marginInline:"auto",

                lineHeight:1.9,

                fontSize:18

            }}

        >

            Every classroom interaction, daily log, student response,
            parent feedback and learning pattern contributes to a continuously
            evolving academic intelligence system that helps schools make
            better educational decisions.

        </p>

    </GlassCard>

</div>

                {/* =====================================================

                    PACKAGE 12 PART 3 STARTS HERE

                ===================================================== */}

<div

    style={{

        marginTop:120,

        display:"flex",

        flexDirection:"column",

        alignItems:"center",

        textAlign:"center"

    }}

>

    {/* ================================================= */}

    {/* EXECUTIVE DECISION GRID */}

    {/* ================================================= */}

    <div

        style={{

            width:"100%",

            maxWidth:1320,

            display:"grid",

            gridTemplateColumns:

                "repeat(auto-fit,minmax(260px,1fr))",

            gap:28

        }}

    >

        {

            [

                {

                    icon:"🎯",

                    title:"Identify Learning Gaps",

                    color:"#38BDF8",

                    text:"See exactly where students are struggling before small gaps become larger academic challenges."

                },

                {

                    icon:"📊",

                    title:"Support Every Teacher",

                    color:"#22C55E",

                    text:"Provide timely academic support using classroom understanding trends instead of assumptions."

                },

                {

                    icon:"📚",

                    title:"Improve Academic Outcomes",

                    color:"#FBBF24",

                    text:"Use daily learning intelligence to strengthen revision, interventions and examination readiness."

                },

                {

                    icon:"🏫",

                    title:"Strengthen School Reputation",

                    color:"#A855F7",

                    text:"Deliver stronger academic experiences that improve parent confidence and future admissions."

                }

            ].map(

                item=>(

                    <GlassCard

                        key={item.title}

                        style={{

                            padding:34,

                            background:"rgba(255,255,255,.06)",

                            border:`1px solid ${item.color}30`

                        }}

                    >

                        <div

                            style={{

                                fontSize:42,

                                marginBottom:18

                            }}

                        >

                            {item.icon}

                        </div>

                        <div

                            style={{

                                color:item.color,

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

                                lineHeight:1.8,

                                fontSize:15

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

    {/* PRINCIPAL MESSAGE */}

    {/* ================================================= */}

    <GlassCard

        hover={false}

        style={{

            marginTop:90,

            maxWidth:980,

            width:"100%",

            padding:"50px 60px",

            background:

                "linear-gradient(135deg,rgba(59,130,246,.12),rgba(16,185,129,.08))",

            border:"1px solid rgba(59,130,246,.22)",

            textAlign:"center"

        }}

    >

        <div

            style={{

                color:"#38BDF8",

                fontWeight:800,

                letterSpacing:2,

                textTransform:"uppercase",

                marginBottom:22

            }}

        >

            FOR SCHOOL LEADERS

        </div>

        <div

            style={{

                fontSize:"clamp(2.3rem,4vw,3.8rem)",

                color:"#FFFFFF",

                fontWeight:900,

                lineHeight:1.25

            }}

        >

            Every Classroom.

            <br/>

            Every Teacher.

            <br/>

            Every Topic.

            <br/>

            Every Day.

        </div>

        <p

            style={{

                maxWidth:860,

                margin:"34px auto 0",

                color:COLORS.textSecondary,

                fontSize:18,

                lineHeight:1.9

            }}

        >

            Talent Passport transforms daily classroom activity into actionable academic intelligence, helping school leaders understand learning trends, support teachers, strengthen student outcomes and build a culture of continuous improvement.

        </p>

    </GlassCard>

    {/* ================================================= */}

    {/* FINAL MESSAGE */}

    {/* ================================================= */}

    <div

        style={{

            maxWidth:960,

            marginTop:100

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

            The Schools

            <br/>

            That Understand

            <br/>

            Learning Every Day

            <br/>

            Improve Every Year.

        </div>

        <div

            style={{

                marginTop:30,

                fontSize:22,

                fontWeight:700,

                background:

                    "linear-gradient(90deg,#38BDF8,#22C55E,#60A5FA)",

                WebkitBackgroundClip:"text",

                WebkitTextFillColor:"transparent"

            }}

        >

            Visibility creates better decisions. Better decisions create better learning.

        </div>

    </div>

</div>

<SectionTransition />

            </div>

        </SectionContainer>

    );

}