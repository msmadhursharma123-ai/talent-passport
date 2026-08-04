import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import SectionTransition from "../shared/SectionTransition";
import GlassCard from "../shared/GlassCard";

export default function AcademicIntelligenceSection() {

    const section = CONTENT.academicIntelligence.section;
const isMobile =
    typeof window !== "undefined" &&
    window.innerWidth <= 768;

const isTablet =
    typeof window !== "undefined" &&
    window.innerWidth > 768 &&
    window.innerWidth <= 1024;

    
    return (

   <SectionContainer

    id="academic-intelligence"

    background="linear-gradient(180deg,#FCFBF8 0%,#F8F5EE 45%,#FBFAF7 100%)"

    style={{

        position: "relative",

        overflow: "hidden",

        paddingTop: 18,

        paddingBottom: 38

    }}

>

            <FloatingBackground />

            {/* ================================================= */}

            {/* CYAN INTELLIGENCE GLOW */}

            {/* ================================================= */}

          <div

    style={{

        position: "absolute",

        inset: 0,

        pointerEvents: "none",

        background: `

            radial-gradient(circle at 14% 18%,

            rgba(244,168,37,.08),

            transparent 28%),

            radial-gradient(circle at 84% 82%,

            rgba(23,63,122,.05),

            transparent 34%)

        `

    }}

/>

<div

    style={{

        maxWidth:1680,
width:"96%",

        margin: "0 auto",

        position: "relative",

        zIndex: 2

    }}

>

              <div
    style={{
        maxWidth: 980,
        margin: "0 auto",
        textAlign: "center"
    }}
>
<div
    style={{

        display:"inline-flex",

        alignItems:"center",

        justifyContent:"center",

        padding:"8px 18px",

        borderRadius:999,

        background:"#FFF4E4",

        border:"1px solid rgba(197,137,26,.16)",

        color:"#B68432",

        fontSize:12,

        fontWeight:800,

        letterSpacing:2,

        textTransform:"uppercase",

        marginBottom:22

    }}
>

    {section.badge}

</div>

  <h2
    style={{
        margin: 0,
        fontSize:"clamp(1.9rem,3.3vw,3rem)",
        lineHeight: 1.02,
        fontWeight: 900,
        color: "#173F7A",
        letterSpacing: "-0.04em"
    }}
>
        {section.title}
    </h2>

<p
    style={{
        maxWidth: isMobile ? 340 : isTablet ? 560 : 760,

        margin: isMobile ? "14px auto 0" : "18px auto 0",

        color:
            isMobile || isTablet
                ? "#111111"
                : "#667085",

        fontSize:
            isMobile
                ? 15
                : isTablet
                ? 16
                : 17,

        lineHeight:
            isMobile
                ? 1.55
                : isTablet
                ? 1.7
                : 1.9,

        textAlign: "center"
    }}
>
    {section.subtitle}
</p>
</div>

                <div

                    style={{

                        height:20

                    }}

                />

                {/* =====================================================

                    PACKAGE 7 PART 2 STARTS HERE

                ===================================================== */}

<div
    className="academic-grid"
    style={{
        display: "grid",

        gridTemplateColumns: isMobile
            ? "1fr"
            : isTablet
            ? "1fr"
            : "1.3fr .9fr",

        gap: isMobile ? 14 : isTablet ? 18 : 24,

        alignItems: "stretch",
    }}
>

    {/* =====================================================

        LEFT ANALYTICS PANEL

    ===================================================== */}

    <div
style={{
    display: "grid",
    gap: isMobile ? 14 : isTablet ? 18 : 26,
}}
>


        <GlassCard

      style={{

    padding: isMobile ? 16 : isTablet ? 18 : 22,

    background:"#FFFFFF",

    border:"1px solid rgba(23,63,122,.08)",

    boxShadow:"0 18px 42px rgba(17,24,39,.06)"

}}

>
            <div

                style={{

                    color:"#B68432",

                    fontWeight:800,

                    letterSpacing:1,

                    fontSize:14,

                    textTransform:"uppercase",

                    marginBottom:16

                }}

            >

                LIVE ACADEMIC INTELLIGENCE

            </div>

            <div

                style={{

                    fontSize: isMobile ? 18 : isTablet ? 24 : 30,

                    color:"#173F7A",

                    fontWeight:900,

                    lineHeight: isMobile ? 1.25 : 1.18,

                    marginBottom:18

                }}

            >

                Help Every Student 

                <br/>

                Learn With Confidence.

            </div>

            <p

                style={{

    color:"#667085",

    lineHeight:1.9,

    fontSize: isMobile ? 13 : isTablet ? 14 : 15

}}

            >

                Academic excellence is built through thousands of classroom moments—not only final examinations. Understanding learning patterns across classrooms helps schools strengthen teaching support, student outcomes and long-term academic performance.

            </p>

        </GlassCard>

        <div

            style={{

                display:"grid",

               gridTemplateColumns: "repeat(2,1fr)",

gap: isMobile ? 10 : isTablet ? 14 : 22,

            }}

        >

            {

                [

                    {

                        value:"School–Parent Partnership",

                        title:"Keep teachers and parents connected through continuous visibility."

                    },

                    {

                        value:"Teacher Support",

                        title:"Help teachers understand classroom learning trends."

                    },

                    {

                        value:"Academic Continuity",

                        title:"Learning records grow every teaching day."

                    },

                    {

                        value:"School Improvement",

                        title:"Enable data-informed academic planning."

                    }

                ].map(

                    card=>(

                   <GlassCard

    key={card.title}

    style={{

        padding: isMobile ? 12 : isTablet ? 14 : 18,

        textAlign:"center",

        background:"#FFFFFF",

        border:"1px solid rgba(23,63,122,.08)",

        boxShadow:"0 12px 28px rgba(17,24,39,.05)"

    }}

>

                            <div

                                style={{

                                    color:"#173F7A",

                                    fontSize: isMobile ? 15 : isTablet ? 18 : 22,

                                    fontWeight:900

                                }}

                            >

                                {card.value}

                            </div>

                            <div

                                style={{

                                    marginTop:8,

                                    color:"#667085",
fontSize: isMobile ? 12 : isTablet ? 13 : 15,

                                    lineHeight:1.7

                                }}

                            >

                                {card.title}

                            </div>

                        </GlassCard>

                    )

                )

            }

        </div>

    </div>

    {/* =====================================================

        RIGHT INTELLIGENCE FLOW

    ===================================================== */}

    <GlassCard

     style={{

    padding: isMobile ? 16 : isTablet ? 18 : 22,

    background:"#FFFFFF",

    border:"1px solid rgba(23,63,122,.08)",

    boxShadow:"0 18px 42px rgba(17,24,39,.06)"

}}

    >

        <div

            style={{

                color:"#173F7A",

                fontWeight:800,

                marginBottom:28,

                fontSize: isMobile ? 15 : isTablet ? 16 : 18,

                letterSpacing:.3,

            }}

        >

            From Daily Learning to Better Marks ⭐

        </div>

        {

          [
    "Prepare Students Before Every Unit Test",

    "Resolve Learning Doubts Earlier",

    "Identify Hidden Academic Gaps",

    "Support Every Student With Confidence",

    "Keep Parents Connected to Progress",

    "Build Better Academic Outcomes"
].map(

                (step,index)=>(

                    <div

                        key={step}

                        style={{

                            display:"flex",

                            gap:18,

                            alignItems:"flex-start",

                            marginBottom:18

                        }}

                    >

                        <div

                            style={{

                                width: isMobile ? 28 : 36,

height: isMobile ? 28 : 36,

                                borderRadius:"50%",

                                background:

    "linear-gradient(135deg,#173F7A,#2E5F9E)",

                                display:"flex",

                                alignItems:"center",

                                justifyContent:"center",

                                color:"#FFFFFF",

                                fontWeight:800,

                                flexShrink:0

                            }}

                        >

                            {index+1}

                        </div>

                        <div>

                            <div

                                style={{

                                    color:"#173F7A",

                                    fontWeight:700,
fontSize: isMobile ? 13 : isTablet ? 14 : 16,
                                    marginBottom:8

                                }}

                            >

                                {step}

                            </div>

                            {

                                index!==5 && (

                                    <div

                                        style={{

                                            width:2,

                                            height:32,

                                            marginLeft:20,

                                            marginTop:8,

                                            background:

    "linear-gradient(#C5891A, rgba(197,137,26,0))"

                                        }}

                                    />

                                )

                            }

                        </div>

                    </div>

                )

            )

        }

    </GlassCard>

</div>

                <div

    style={{

        marginTop:70,

        display:"flex",

        flexDirection:"column",

        alignItems:"center",

        textAlign:"center"

    }}

>

    {/* =============================================== */}

    {/* AI ENGINE */}

    {/* =============================================== */}

    <div

      style={{

    width:60,

    height:60,

    borderRadius:"50%",

    background:

        "radial-gradient(circle,#F6D37A,#C5891A)",

    display:"flex",

    alignItems:"center",

    justifyContent:"center",

    boxShadow:

        "0 0 55px rgba(197,137,26,.22)",

    marginBottom:36

}}

    >

        <div

            style={{

                fontSize:44

            }}

        >

            🧠

        </div>

    </div>

    <div
    style={{
        maxWidth:1400,
        width:"100%",
        margin:"0 auto",
        fontSize:"clamp(1.9rem,3vw,3rem)",
        fontWeight:900,
        color:"#173F7A",
        lineHeight:1.08,
        letterSpacing:"-0.035em"
    }}
>

        Intelligence Doesn't Replace Teachers. It Empowers Them.

    </div>

    <div

        style={{

            marginTop:30,

            fontSize:18,

            fontWeight:700,

            background:

    "linear-gradient(90deg,#173F7A,#C5891A,#173F7A)",

            WebkitBackgroundClip:"text",

            WebkitTextFillColor:"transparent"

        }}

    >

        Every classroom deserves the same level of intelligence that businesses use to make decisions.

    </div>

    <p

       style={{

    maxWidth:960,

    marginTop:36,

    color:"#667085",

    fontSize:16,

    lineHeight:1.9

}}

    >



    </p>
{/* =============================================== */}
{/* EXECUTIVE METRICS */}
{/* =============================================== */}

<div
    style={{
        width: "100%",
        maxWidth: 1280,
        display: "grid",

        gridTemplateColumns:
            isMobile || isTablet
                ? "repeat(2, minmax(0, 1fr))"
                : "repeat(auto-fit,minmax(220px,1fr))",

        gap: isMobile ? 10 : isTablet ? 14 : 24,

        marginTop: isMobile ? 18 : 30,
    }}
>
    {[
        {
            value: "100%",
            label: "Topic Visibility",
        },
        {
            value: "Daily",
            label: "Understanding Tracking",
        },
        {
            value: "AI",
            label: "Learning Intelligence",
        },
        {
            value: "24×7",
            label: "Parent Visibility",
        },
    ].map((metric) => (
        <GlassCard
            key={metric.label}
            hover={false}
       style={{
    padding: isMobile ? 14 : isTablet ? 18 : 26,

    minHeight: isMobile ? 110 : isTablet ? 135 : 170,

    textAlign: "center",

    background: "#FFFFFF",

    border: "1px solid rgba(23,63,122,.08)",

    boxShadow: "0 12px 28px rgba(17,24,39,.05)",

    display: "flex",

    flexDirection: "column",

    justifyContent: "center",

    alignItems: "center",
}}
        >
            <div
                style={{
                    fontSize: isMobile ? 20 : isTablet ? 24 : 36,
                    fontWeight: 900,
                    color: "#173F7A",
                }}
            >
                {metric.value}
            </div>

            <div
                style={{
                    marginTop: 12,
                    color: "#667085",
                    fontSize: isMobile ? 11 : isTablet ? 12 : 14,
                    lineHeight: 1.7,
                }}
            >
                {metric.label}
            </div>
        </GlassCard>
    ))}
</div>

    {/* =============================================== */}

    {/* QUOTE */}

    {/* =============================================== */}



</div>



<SectionTransition />

            </div>

        </SectionContainer>

    );

}