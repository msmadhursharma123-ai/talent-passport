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

    background="linear-gradient(180deg,#FCFBF8 0%,#F8F5EE 45%,#FBFAF7 100%)"

    style={{

        position:"relative",

        overflow:"hidden",

        paddingTop:52,

        paddingBottom:70

    }}

>

    <FloatingBackground

        style={{

            opacity:.55

        }}

    />

    {/* ================================================= */}
    {/* PREMIUM BACKGROUND */}
    {/* ================================================= */}

    <div

        style={{

            position:"absolute",

            inset:0,

            pointerEvents:"none",

            background:`

                radial-gradient(
                    circle at 18% 18%,
                    rgba(198,140,31,.07),
                    transparent 38%
                ),

                radial-gradient(
                    circle at 82% 18%,
                    rgba(23,63,122,.05),
                    transparent 34%
                ),

                radial-gradient(
                    circle at 50% 100%,
                    rgba(198,140,31,.04),
                    transparent 42%
                )

            `

        }}

    />

    <div

        style={{

            width:"100%",

            maxWidth:1480,

            margin:"0 auto",

            paddingInline:"clamp(22px,4vw,60px)",

            position:"relative",

            zIndex:2

        }}

    >

        <AnimatedHeading

            badge="ACADEMIC INTELLIGENCE"

            title="See What Every Classroom Is Learning."

            subtitle="Daily classroom intelligence across students, teachers, parents and school leadership."

            align="center"

            maxWidth={760}

        />

        <div

            style={{

                height:10

            }}

        />

        {/* =====================================================

            PACKAGE 12 PART 2 STARTS HERE

        ===================================================== */}
                {/* =====================================================

                    PACKAGE 12 PART 2 STARTS HERE

                ===================================================== */}

           <div

    style={{

        position:"relative",

    }}

>

    {/* ===================================================== */}

    {/* COMMAND CENTER */}

    {/* ===================================================== */}

<div

    style={{

        width:"100%",

        position:"relative",

        padding:0,

        overflow:"visible"

    }}

>


<div

    style={{

        width:"100%"

    }}

>

     {/* ===================================================== */}
{/* PREMIUM HEADER */}
{/* ===================================================== */}

<div

    style={{

        display:"flex",

        justifyContent:"space-between",

        alignItems:"center",

        gap:18,

        flexWrap:"wrap",

        marginBottom:18

    }}

>

    <div>

        <div

            style={{

                display:"inline-flex",

                alignItems:"center",

                padding:"7px 16px",

                borderRadius:999,

                background:"#FFF5E7",

                border:"1px solid rgba(198,140,31,.14)",

                color:"#B68432",

                fontSize:11,

                fontWeight:800,

                letterSpacing:2,

                textTransform:"uppercase"

            }}

        >

            LIVE ACADEMIC INTELLIGENCE

        </div>

        <h3

            style={{

                margin:"12px 0 0",

                color:"#173F7A",

                fontSize:22,

                fontWeight:800,

                lineHeight:1.2

            }}

        >

            School Intelligence Command Center

        </h3>

        <p

            style={{

                margin:"6px 0 0",

                color:"#667085",

                fontSize:15,

                lineHeight:1.7,

                maxWidth:620

            }}

        >

            Real-time classroom intelligence helping school leaders understand learning trends, teacher effectiveness and academic growth.

        </p>

    </div>

    <div

        style={{

            display:"flex",

            alignItems:"center",

            gap:10,

            padding:"10px 18px",

            borderRadius:999,

            background:"#EEF8F2",

            border:"1px solid rgba(16,185,129,.10)",

            color:"#239B56",

            fontWeight:700,

            fontSize:14

        }}

    >

        <span

            style={{

                width:8,

                height:8,

                borderRadius:"50%",

                background:"#22C55E"

            }}

        />

        LIVE SCHOOL INSIGHTS

    </div>

</div>

      {/* ===================================================== */}
{/* DASHBOARD GRID */}
{/* ===================================================== */}

<div

    style={{

        display:"grid",

        gridTemplateColumns:

            "repeat(6,minmax(0,1fr))",

        gap:16,

        alignItems:"stretch"

    }}

>

    {[
        {
            icon:"😊",
            title:"Student Understanding",
            text:"Track classroom understanding across every class."
        },
        {
            icon:"❓",
            title:"Daily Doubts",
            text:"Identify concepts students struggle with."
        },
        {
            icon:"👨‍🏫",
            title:"Teacher Visibility",
            text:"Understand classroom effectiveness daily."
        },
        {
            icon:"👨‍👩‍👧",
            title:"Parent Engagement",
            text:"Strengthen school-home communication."
        },
        {
            icon:"📚",
            title:"Subject Intelligence",
            text:"Monitor chapter-wise understanding."
        },
        {
            icon:"📈",
            title:"School Growth",
            text:"Drive continuous academic improvement."
        }

    ].map(card=>(

        <GlassCard

            key={card.title}

            style={{

                padding:16,

                minHeight:180,

                display:"flex",

                flexDirection:"column",

                justifyContent:"flex-start",

                borderRadius:18,

                background:
                    "linear-gradient(180deg,#FFFFFF 0%,#FCFBF8 100%)",

                border:"1px solid rgba(190,145,42,.10)",

                boxShadow:
                    "0 10px 26px rgba(17,24,39,.05)"

            }}

        >

            <div

                style={{

                    fontSize:28,

                    marginBottom:10

                }}

            >

                {card.icon}

            </div>

            <div

                style={{

                    color:"#173F7A",

                    fontWeight:800,

                    fontSize:15,

                    marginBottom:8,

                    lineHeight:1.3

                }}

            >

                {card.title}

            </div>

            <div

                style={{

                    color:"#667085",

                    fontSize:13,

                    lineHeight:1.55

                }}

            >

                {card.text}

            </div>

        </GlassCard>

    ))}

</div>        </div>

    </div>

    


    {/* ================================================= */}

    {/* PRINCIPAL MESSAGE */}

    {/* ================================================= */}

    <GlassCard

        hover={false}

style={{

    marginTop:48,

    maxWidth:1400,

    width:"100%",

    padding:"26px 34px",

    textAlign:"center",

    borderRadius:28,

    background:
        "linear-gradient(180deg,#FFFFFF 0%,#FCFBF8 100%)",

    border:"1px solid rgba(190,145,42,.10)",

    boxShadow:
        "0 18px 46px rgba(17,24,39,.05)"

}}

    >

        <div

            style={{
color:"#B68432",

                fontWeight:800,

                letterSpacing:2,

                textTransform:"uppercase",

                marginBottom:10

            }}

        >

            FOR SCHOOL LEADERS

        </div>

        <div

            style={{

               fontSize:"clamp(1.55rem,2.4vw,2.2rem)",

                color:"#173F7A",

                fontWeight:900,

                lineHeight:1.18

            }}

        >

            Every Classroom. Every Teacher. Every Topic. Every Day.

        </div>

        <p

            style={{

                maxWidth:900,

                margin:"16px auto 0",

                color:"#667085",

                fontSize:13,

                lineHeight:1.65

            }}

        >

            The Schools That Understand
Learning Every Day
Improve Every Year.
Visibility creates better decisions. Better decisions create better learning.

        </p>

    </GlassCard>

   
</div>

{/* <SectionTransition /> */}

            </div>

        </SectionContainer>

    );

}