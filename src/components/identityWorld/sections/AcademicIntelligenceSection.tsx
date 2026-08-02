import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import SectionTransition from "../shared/SectionTransition";
import GlassCard from "../shared/GlassCard";

export default function AcademicIntelligenceSection() {

    const section = CONTENT.academicIntelligence.section;

    return (

   <SectionContainer

    id="academic-intelligence"

    background="linear-gradient(180deg,#FCFBF8 0%,#F8F5EE 45%,#FBFAF7 100%)"

    style={{

        position: "relative",

        overflow: "hidden",

        paddingTop: 20,

        paddingBottom: 40

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
            maxWidth: 760,
            margin: "18px auto 0",
            color: "#667085",
            fontSize: 17,
            lineHeight: 1.9
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

    style={{

        display:"grid",

        gridTemplateColumns:"1.3fr .9fr",

        gap:24,

        alignItems:"stretch"

    }}

>

    {/* =====================================================

        LEFT ANALYTICS PANEL

    ===================================================== */}

    <div

        style={{

            display:"grid",

            gap:26

        }}

    >

        <GlassCard

         style={{

    padding:24,

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

                    marginBottom:18

                }}

            >

                LIVE ACADEMIC INTELLIGENCE

            </div>

            <div

                style={{

                    fontSize:30,

                    color:"#173F7A",

                    fontWeight:900,

                    lineHeight:1.15,

                    marginBottom:18

                }}

            >

                Every Classroom

                <br/>

                Creates Intelligence.

            </div>

            <p

                style={{

    color:"#667085",

    lineHeight:1.9,

    fontSize:15

}}

            >

                Every lecture transforms into structured learning
                intelligence. Teachers teach, students respond,
                parents stay informed and schools receive continuous
                academic visibility.

            </p>

        </GlassCard>

        <div

            style={{

                display:"grid",

                gridTemplateColumns:"repeat(2,1fr)",

                gap:22

            }}

        >

            {

                [

                    {

                        value:"98%",

                        title:"Topic Visibility"

                    },

                    {

                        value:"24×7",

                        title:"Learning Timeline"

                    },

                    {

                        value:"365",

                        title:"Daily Academic Records"

                    },

                    {

                        value:"AI",

                        title:"Academic Intelligence"

                    }

                ].map(

                    card=>(

                   <GlassCard

    key={card.title}

    style={{

        padding:20,

        textAlign:"center",

        background:"#FFFFFF",

        border:"1px solid rgba(23,63,122,.08)",

        boxShadow:"0 12px 28px rgba(17,24,39,.05)"

    }}

>

                            <div

                                style={{

                                    color:"#173F7A",

                                    fontSize:28,

                                    fontWeight:900

                                }}

                            >

                                {card.value}

                            </div>

                            <div

                                style={{

                                    marginTop:8,

                                    color:"#667085",

                                    fontSize:15,

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

    padding:24,

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

                fontSize:18,

                letterSpacing:.3,

            }}

        >

            Daily Intelligence Flow

        </div>

        {

            [

                "Teacher Records Today's Lecture",

                "Students Share Understanding",

                "Weak Topics Identified",

                "Parents Receive Updates",

                "Teacher Gets Insights",

                "School Intelligence Dashboard"

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

                                width:36,

                                height:36,

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

    width:120,

    height:120,

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

                fontSize:42

            }}

        >

            🧠

        </div>

    </div>

    <div

        style={{

            maxWidth:980,

            fontSize:"clamp(2.3rem,4vw,3.6rem)",

            fontWeight:900,

            color:"#173F7A",

            lineHeight:1.08,

            letterSpacing:"-0.04em"

        }}

    >

        Intelligence Doesn't

        <br/>

        Replace Teachers.

        <br/>

        It Empowers Them.

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

        Turning everyday classroom interactions into actionable academic insights.

    </div>

    <p

       style={{

    maxWidth:920,

    marginTop:36,

    color:"#667085",

    fontSize:16,

    lineHeight:1.9

}}

    >

        Teachers continue teaching the way they always have.
        Talent Passport quietly transforms classroom activity,
        student understanding and parent feedback into structured
        academic intelligence that helps schools improve learning outcomes,
        reduce learning gaps and make better academic decisions.

    </p>

    {/* =============================================== */}

    {/* EXECUTIVE METRICS */}

    {/* =============================================== */}

    <div

        style={{

            width:"100%",

            maxWidth:1280,

            display:"grid",

            gridTemplateColumns:

                "repeat(auto-fit,minmax(220px,1fr))",

            gap:24,

            marginTop:60

        }}

    >

        {

            [

                {

                    value:"100%",

                    label:"Topic Visibility"

                },

                {

                    value:"Daily",

                    label:"Understanding Tracking"

                },

                {

                    value:"AI",

                    label:"Learning Intelligence"

                },

                {

                    value:"24×7",

                    label:"Parent Visibility"

                }

            ].map(

                metric=>(

                   <GlassCard

    key={metric.label}

    hover={false}

    style={{

        padding:28,

        textAlign:"center",

        background:"#FFFFFF",

        border:"1px solid rgba(23,63,122,.08)",

        boxShadow:"0 12px 28px rgba(17,24,39,.05)"

    }}

>

                        <div

                            style={{

                                fontSize:36,

                                fontWeight:900,

                                color:"#173F7A"

                            }}

                        >

                            {metric.value}

                        </div>

                        <div

                            style={{

                                marginTop:12,

                                color:"#667085",

                                fontSize:14,

                                lineHeight:1.7

                            }}

                        >

                            {metric.label}

                        </div>

                    </GlassCard>

                )

            )

        }

    </div>

    {/* =============================================== */}

    {/* QUOTE */}

    {/* =============================================== */}

    <div

       style={{

    marginTop:70,

    maxWidth:1000,

    padding:"30px 42px",

    borderRadius:28,

    background:"#FFFFFF",

    border:"1px solid rgba(23,63,122,.08)",

    boxShadow:"0 18px 42px rgba(17,24,39,.06)"

}}

    >

        <div

            style={{

                fontSize:15,

                color:"#B68432",

                letterSpacing:2,

                fontWeight:800,

                textTransform:"uppercase",

                marginBottom:22

            }}

        >

            Our Vision

        </div>

        <div

            style={{

                fontSize:"clamp(1.8rem,3vw,2.7rem)",

                color:"#173F7A",

                fontWeight:900,

                lineHeight:1.3

            }}

        >

            Every classroom deserves the same level of intelligence

            that businesses use to make decisions.

        </div>

    </div>

</div>

<SectionTransition />

            </div>

        </SectionContainer>

    );

}