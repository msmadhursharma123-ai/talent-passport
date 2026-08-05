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
        position: "relative",
        overflow: "hidden",

        paddingTop: "clamp(40px,6vw,52px)",
        paddingBottom: "clamp(52px,7vw,70px)"
    }}
>

    <FloatingBackground
        style={{
            opacity: .55
        }}
    />

    {/* ================================================= */}
    {/* PREMIUM BACKGROUND */}
    {/* ================================================= */}

    <div
        style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",

            background: `
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
        width: "100%",

        maxWidth: 1480,

        margin: "0 auto",

        paddingInline: "clamp(14px,3vw,60px)",

        position: "relative",

        zIndex: 2,

        boxSizing: "border-box"
    }}
>

    <AnimatedHeading
    badge="CLASSROOM INTELLIGENCE"
    title="See What Every Classroom Is Learning."
    subtitle="Daily classroom intelligence across students, teachers, parents and school leadership."
    align="center"
    maxWidth={1280}
/>

        <div
            style={{
                height: "clamp(8px,1vw,10px)"
            }}
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
        position: "relative",

        width: "100%",

        display: "flex",

        flexDirection: "column",

        gap: "clamp(22px,2vw,30px)"
    }}
>

    {/* ===================================================== */}

    {/* COMMAND CENTER */}

    {/* ===================================================== */}

<div
    style={{
        width: "100%",
        position: "relative",
        padding: 0,
        overflow: "visible",

        display: "flex",
        flexDirection: "column",

        gap: "clamp(18px,2vw,26px)"
    }}
>

<div
    style={{
        width: "100%",
        maxWidth: "100%",
        margin: "0 auto"
    }}
>

     {/* ===================================================== */}
{/* PREMIUM HEADER */}
{/* ===================================================== */}

<div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",

        gap: "clamp(14px,2vw,18px)",

        flexWrap: "wrap",

        marginBottom: "clamp(18px,3vw,26px)"
    }}
>

    <div
        style={{
            flex: "1 1 520px",
            minWidth: 0
        }}
    >

        <div
            style={{
                display: "inline-flex",
                alignItems: "center",

                padding:
                    "clamp(6px,1vw,7px) clamp(14px,2vw,16px)",

                borderRadius: 999,

                background: "#FFF5E7",

                border: "1px solid rgba(198,140,31,.14)",

                color: "#B68432",

                fontSize: "clamp(10px,1vw,11px)",

                fontWeight: 800,

                letterSpacing: "clamp(1.2px,.18vw,2px)",

                textTransform: "uppercase"
            }}
        >

            LIVE ACADEMIC INTELLIGENCE

        </div>

        <h3
            style={{
                margin: "clamp(10px,2vw,12px) 0 0",

                color: "#173F7A",

                fontSize: "clamp(22px,3vw,32px)",

                fontWeight: 800,

                lineHeight: 1.18
            }}
        >

            School Intelligence Command Center

        </h3>

        <p
            style={{
                margin: "clamp(8px,1.5vw,10px) 0 0",

                color: "#667085",

                fontSize: "clamp(14px,1.4vw,15px)",

                lineHeight: 1.75,

                maxWidth: 620
            }}
        >

            Real-time classroom intelligence helping school leaders understand learning trends, teacher effectiveness and academic growth.

        </p>

    </div>

    <div
        style={{
            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            gap: 10,

            padding:
                "clamp(9px,1.5vw,10px) clamp(16px,2vw,18px)",

            borderRadius: 999,

            background: "#EEF8F2",

            border: "1px solid rgba(16,185,129,.10)",

            color: "#239B56",

            fontWeight: 700,

            fontSize: "clamp(12px,1.2vw,14px)",

            whiteSpace: "nowrap",

            flexShrink: 0
        }}
    >

        <span
            style={{
                width: 8,
                height: 8,

                borderRadius: "50%",

                background: "#22C55E",

                flexShrink: 0
            }}
        />

        LIVE SCHOOL INSIGHTS

    </div>

</div>

      {/* ===================================================== */}
{/* DASHBOARD GRID */}
{/* ===================================================== */}

<div
    className="school-grid"
    style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,minmax(0,1fr))",
        gap: "clamp(12px,1.5vw,18px)",
        alignItems: "stretch",
        width: "100%"
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

    ].map(card => (

        <GlassCard
            key={card.title}
            style={{
                padding:"clamp(14px,1.5vw,22px)",
                minHeight:"clamp(150px,18vw,190px)",
                display:"flex",
                flexDirection:"column",
                justifyContent:"flex-start",
                borderRadius:"clamp(16px,2vw,22px)",
                background:"linear-gradient(180deg,#FFFDFC 0%,#FFF6EC 100%)",
                border:"1px solid rgba(190,145,42,.10)",
                boxShadow:"0 10px 26px rgba(17,24,39,.05)"
            }}
        >

            <div
                style={{
                    fontSize:"clamp(22px,2.5vw,32px)",
                    marginBottom:"clamp(8px,1vw,12px)",
                    lineHeight:1
                }}
            >
                {card.icon}
            </div>

            <div
                style={{
                    color:"#173F7A",
                    fontWeight:800,
                    fontSize:"clamp(15px,1.5vw,18px)",
                    marginBottom:8,
                    lineHeight:1.3
                }}
            >
                {card.title}
            </div>

            <div
                style={{
                    color:"#667085",
                    fontSize:"clamp(12px,1vw,14px)",
                    lineHeight:1.6,
                    flex:1
                }}
            >
                {card.text}
            </div>

        </GlassCard>

    ))}

</div>


<style>{`
@media (max-width:1024px){
.school-grid{
grid-template-columns:repeat(2,minmax(0,1fr)) !important;
gap:12px !important;
}
}

@media (max-width:768px){

#schools{
overflow-x:hidden !important;
}

#schools h1,
#schools h2{
font-size:clamp(28px,7vw,42px) !important;
line-height:1.12 !important;
word-break:normal !important;
}

#schools h3{
font-size:clamp(18px,5vw,28px) !important;
line-height:1.18 !important;
word-break:normal !important;
}

#schools p{
font-size:14px !important;
line-height:1.55 !important;
max-width:100% !important;
}

.school-grid{
grid-template-columns:repeat(2,minmax(0,1fr)) !important;
gap:10px !important;
}

.school-grid > *{
min-height:130px !important;
padding:12px !important;
border-radius:16px !important;
}

}
`}</style>

       </div>

    </div>

    


    {/* ================================================= */}

    {/* PRINCIPAL MESSAGE */}

    {/* ================================================= */}



   
</div>

{/* <SectionTransition /> */}

            </div>

        </SectionContainer>

    );

}