import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import GlassCard from "../shared/GlassCard";
import SectionTransition from "../shared/SectionTransition";
import COLORS from "../styles/colors";
import GRADIENTS from "../styles/gradients";

export default function StudentJourneySection() {

    const section = CONTENT.studentJourney.section;
const journey = CONTENT.studentJourney.journey;

    return (

        <SectionContainer

            id="student-journey"

            background="linear-gradient(180deg,#071C3A 0%, #06294F 45%, #04182F 100%)"

            style={{

                position:"relative",

                overflow:"hidden",

                paddingTop:140,

                paddingBottom:150

            }}

        >

            <FloatingBackground />

            {/* =================================================== */}

            {/* TIMELINE GLOW */}

            {/* =================================================== */}

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 50% 30%, rgba(34,211,238,.14), transparent 70%)",

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

    badge={section.badge}

    title={section.title}

    subtitle={section.subtitle}

    align="center"

    maxWidth={880}

/>

                <div

                    style={{

                        height:90

                    }}

                />

                {/* =====================================================

                    PACKAGE 6 PART 2 STARTS HERE

                ===================================================== */}

              <div

    style={{

        position:"relative",

        minHeight:760,

        display:"flex",

        alignItems:"center",

        justifyContent:"center"

    }}

>

    {/* =====================================================

        MAIN TIMELINE

    ===================================================== */}

    <div

        style={{

            position:"absolute",

            left:100,

            right:100,

            top:"50%",

            height:4,

            borderRadius:999,

            background:

                "linear-gradient(90deg,#38BDF8,#60A5FA,#818CF8,#A855F7)",

            boxShadow:

                "0 0 25px rgba(96,165,250,.45)"

        }}

    />

    {

        [

            {

                year:"01",

                title:"School Entry",

                emoji:"🏫",

                color:"#38BDF8",

                left:"3%",

                top:"50%",

                text:"Student begins a verified lifelong learning identity."

            },

            {

                year:"02",

                title:"Daily Learning",

                emoji:"📘",

                color:"#60A5FA",

                left:"18%",

                top:"18%",

                text:"Daily classroom understanding and academic feedback."

            },

            {

                year:"03",

                title:"Portfolio",

                emoji:"💼",

                color:"#818CF8",

                left:"34%",

                top:"55%",

                text:"Projects, achievements and skills become one portfolio."

            },

            {

                year:"04",

                title:"Competitions",

                emoji:"🏆",

                color:"#A855F7",

                left:"50%",

                top:"18%",

                text:"Participate, compete and build verified achievements."

            },

            {

                year:"05",

                title:"Credits",

                emoji:"⭐",

                color:"#FBBF24",

                left:"66%",

                top:"55%",

                text:"Earn learning credits through participation and growth."

            },

            {

                year:"06",

                title:"Scholarships",

                emoji:"🎓",

                color:"#22C55E",

                left:"82%",

                top:"18%",

                text:"Discover institutes, workshops and scholarship opportunities."

            }

        ].map(

            step=>(

                <GlassCard

                    key={step.title}

                    style={{

                        position:"absolute",

                        width:220,

                        left:step.left,

                        top:step.top,

                        transform:"translate(-50%,-50%)",

                        padding:26,

                        textAlign:"center",

                        background:"rgba(255,255,255,.08)",

                        border:`1px solid ${step.color}55`

                    }}

                >

                    <div

                        style={{

                            width:52,

                            height:52,

                            margin:"0 auto 18px",

                            borderRadius:"50%",

                            background:step.color,

                            display:"flex",

                            alignItems:"center",

                            justifyContent:"center",

                            fontSize:24,

                            color:"#FFF",

                            fontWeight:700

                        }}

                    >

                        {step.year}

                    </div>

                    <div

                        style={{

                            fontSize:34,

                            marginBottom:12

                        }}

                    >

                        {step.emoji}

                    </div>

                    <div

                        style={{

                            color:step.color,

                            fontWeight:800,

                            fontSize:22,

                            marginBottom:14

                        }}

                    >

                        {step.title}

                    </div>

                    <div

                        style={{

                            color:COLORS.textSecondary,

                            lineHeight:1.8,

                            fontSize:15

                        }}

                    >

                        {step.text}

                    </div>

                </GlassCard>

            )

        )

    }

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

    {/* ================================================ */}

    {/* TIMELINE CONTINUES */}

    {/* ================================================ */}

    <div

        style={{

            display: "flex",

            alignItems: "center",

            gap: 18,

            marginBottom: 70,

            flexWrap: "wrap",

            justifyContent: "center"

        }}

    >

        {

            [

                "Career Opportunities",

                "Industry Exposure",

                "Higher Education",

                "Lifetime Identity"

            ].map(

                item => (

                    <div

                        key={item}

                        style={{

                            padding: "14px 22px",

                            borderRadius: 999,

                            background:

                                "rgba(255,255,255,.08)",

                            border:

                                "1px solid rgba(96,165,250,.20)",

                            color: "#FFFFFF",

                            fontWeight: 700,

                            backdropFilter: "blur(18px)",

                            WebkitBackdropFilter: "blur(18px)"

                        }}

                    >

                        {item}

                    </div>

                )

            )

        }

    </div>

    {/* ================================================ */}

    {/* BIG MESSAGE */}

    {/* ================================================ */}

    <div

        style={{

            maxWidth: 1040,

            fontSize: "clamp(3rem,5vw,5rem)",

            fontWeight: 900,

            lineHeight: 1.08,

            color: "#FFFFFF",

            letterSpacing: "-0.04em"

        }}

    >

        One Passport.

        <br />

        One Identity.

        <br />

        Endless Possibilities.

    </div>

    <div

        style={{

            marginTop: 34,

            fontSize: 22,

            fontWeight: 700,

            background:

                "linear-gradient(90deg,#38BDF8,#22D3EE,#A855F7)",

            WebkitBackgroundClip: "text",

            WebkitTextFillColor: "transparent"

        }}

    >

        Growing with every classroom, every achievement and every opportunity.

    </div>

    <p

        style={{

            maxWidth: 920,

            marginTop: 36,

            color: COLORS.textSecondary,

            fontSize: 19,

            lineHeight: 1.9

        }}

    >

        From the first day of school to competitions, portfolios, academic growth,
        verified achievements, scholarships, workshops and future opportunities,
        Talent Passport becomes the student's lifelong learning identity—connecting
        every milestone into one trusted journey.

    </p>

    {/* ================================================ */}

    {/* JOURNEY METRICS */}

    {/* ================================================ */}

    <div

        style={{

            width: "100%",

            maxWidth: 1280,

            display: "grid",

            gridTemplateColumns:

                "repeat(auto-fit,minmax(220px,1fr))",

            gap: 24,

            marginTop: 80

        }}

    >

        {

            [

                {

                    value:"365",

                    label:"Days of Continuous Learning"

                },

                {

                    value:"1",

                    label:"Verified Student Identity"

                },

                {

                    value:"∞",

                    label:"Future Opportunities"

                },

                {

                    value:"Life",

                    label:"Learning Journey"

                }

            ].map(

                metric => (

                    <GlassCard

                        key={metric.label}

                        hover={false}

                        style={{

                            padding: 34,

                            textAlign: "center",

                            background:

                                "rgba(255,255,255,.06)"

                        }}

                    >

                        <div

                            style={{

                                fontSize: 40,

                                fontWeight: 900,

                                color: "#60A5FA"

                            }}

                        >

                            {metric.value}

                        </div>

                        <div

                            style={{

                                marginTop: 12,

                                color: COLORS.textSecondary,

                                lineHeight: 1.7,

                                fontSize: 15

                            }}

                        >

                            {metric.label}

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