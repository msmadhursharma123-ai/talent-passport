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

        background="linear-gradient(180deg,#FCFBF8 0%,#F8F5EE 45%,#FBFAF7 100%)"

        style={{

            position:"relative",

            overflow:"hidden",

            paddingTop:70,

            paddingBottom:90

        }}

    >

        <FloatingBackground

            style={{

                opacity:.55

            }}

        />

        {/* ================================================= */}

        {/* PREMIUM WARM BACKGROUND */}

        {/* ================================================= */}

        <div

            style={{

                position:"absolute",

                inset:0,

                pointerEvents:"none",

                background:`

                    radial-gradient(

                        circle at 18% 20%,

                        rgba(198,140,31,.08),

                        transparent 42%

                    ),

                    radial-gradient(

                        circle at 82% 22%,

                        rgba(23,63,122,.05),

                        transparent 38%

                    ),

                    radial-gradient(

                        circle at 50% 100%,

                        rgba(198,140,31,.04),

                        transparent 45%

                    )

                `

            }}

        />

        <div

            style={{

                width:"100%",

                maxWidth:1480,

                margin:"0 auto",

                paddingInline:"clamp(24px,4vw,60px)",

                position:"relative",

                zIndex:2

            }}

        >

          <div
    style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: "scale(1.15)",
        transformOrigin: "top center",
        marginBottom: 40,
    }}
>
    <AnimatedHeading
        badge="BECOME A PARTNER"
        title="Bring Great Learning Opportunities To Every Student."
        subtitle="Talent Passport connects trusted academies, institutes and learning partners with schools and students to create meaningful opportunities beyond the classroom."
        align="center"
        maxWidth={820}
    />
</div>

            <div

                style={{

                    height:10

                }}

            />

            {/* =====================================================

                PACKAGE 11 PART 2 STARTS HERE

            ===================================================== */}

                {/* =====================================================

                    PACKAGE 11 PART 2 STARTS HERE

                ===================================================== */}

          <div

    style={{

        position: "relative",

        width: "100%",

        maxWidth: 1220,

        height: 620,

        margin: "0 auto"

    }}

>

    {/* ===================================================== */}

    {/* CENTRAL VERIFIED NETWORK */}

    {/* ===================================================== */}

    <GlassCard

        hover={false}

        style={{

            position: "absolute",

            left: "50%",

            top: 200,

            transform: "translateX(-50%)",

            width: 280,

            padding: 24,

            textAlign: "center",

            background:
                "linear-gradient(180deg,#FFFFFF 0%,#FCFBF8 100%)",

            border:
                "1px solid rgba(214,162,60,.14)",

            boxShadow:
                "0 16px 42px rgba(17,24,39,.08)",

            zIndex: 3

        }}

    >

        <div

            style={{

                color: "#B7791F",

                fontWeight: 800,

                letterSpacing: 2,

                textTransform: "uppercase",

                marginBottom: 18

            }}

        >

            VERIFIED NETWORK

        </div>

        <div

            style={{

                fontSize: 24,

                color: "#173F7A",

                fontWeight: 900,

                lineHeight: 1.15

            }}

        >

            Talent Passport

            <br />

            Partner Platform

        </div>

        <div

            style={{

                marginTop: 24,

                color: "#667085",

                lineHeight: 1.8,

                fontSize: 15

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
        height="620"
        style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
        }}
    >
        {/* Top Left */}
        <line
            x1="610"
            y1="300"
            x2="240"
            y2="110"
            stroke="rgba(214,162,60,.22)"
            strokeWidth="2"
        />

        {/* Top Right */}
        <line
            x1="610"
            y1="300"
            x2="980"
            y2="110"
            stroke="rgba(214,162,60,.22)"
            strokeWidth="2"
        />

        {/* Middle Left */}
        <line
            x1="610"
            y1="300"
            x2="200"
            y2="300"
            stroke="rgba(214,162,60,.22)"
            strokeWidth="2"
        />

        {/* Middle Right */}
        <line
            x1="610"
            y1="300"
            x2="1020"
            y2="300"
            stroke="rgba(214,162,60,.22)"
            strokeWidth="2"
        />

        {/* Bottom Left */}
        <line
            x1="610"
            y1="300"
            x2="250"
            y2="520"
            stroke="rgba(214,162,60,.22)"
            strokeWidth="2"
        />

        {/* Bottom Right */}
        <line
            x1="610"
            y1="300"
            x2="970"
            y2="520"
            stroke="rgba(214,162,60,.22)"
            strokeWidth="2"
        />
    </svg>

   {/* ===================================================== */}
{/* PARTNER TYPES */}
{/* ===================================================== */}

{[
    {
        title: "Dance Academy",
        emoji: "💃",
        left: 40,
        top: 0,
        offerings: [
            "Classical Dance",
            "Hip-Hop",
            "Stage Shows",
            "Competitions",
            "Workshops",
        ],
    },
    {
        title: "Music School",
        emoji: "🎵",
        right: 40,
        top: 0,
        offerings: [
            "Vocal Music",
            "Instruments",
            "Band Programs",
            "Performances",
            "Certifications",
        ],
    },
    {
        title: "Sports Academy",
        emoji: "⚽",
        left: 20,
        top: 230,
        offerings: [
            "Football",
            "Cricket",
            "Athletics",
            "Fitness Camps",
            "Championships",
        ],
    },
    {
        title: "Robotics Lab",
        emoji: "🤖",
        right: 20,
        top: 230,
        offerings: [
            "Robotics",
            "STEM Labs",
            "Coding",
            "Artificial Intelligence",
            "Innovation Projects",
        ],
    },
    {
        title: "Acting Studio",
        emoji: "🎬",
        left: 40,
        top: 480,
        offerings: [
            "Theatre",
            "Public Speaking",
            "Drama",
            "Expression",
            "Confidence Building",
        ],
    },
    {
        title: "Coding Institute",
        emoji: "💻",
        right: 40,
        top: 480,
        offerings: [
            "Programming",
            "Web Development",
            "App Development",
            "AI & ML",
            "Future Skills",
        ],
    },
].map((partner) => (
    <GlassCard
        key={partner.title}
        hover={false}
        style={{
            position: "absolute",
            zIndex: 2,
            width: 220,
            padding: 18,
            borderRadius: 24,
            background:
                "linear-gradient(180deg,#FFFFFF 0%,#FCFBF8 100%)",
            border:
                "1px solid rgba(214,162,60,.12)",
            boxShadow:
                "0 12px 30px rgba(17,24,39,.06)",
            left: partner.left,
            right: partner.right,
            top: partner.top,
        }}
    >
        <div
            style={{
                fontSize: 28,
                marginBottom: 14,
            }}
        >
            {partner.emoji}
        </div>

        <div
            style={{
                color: "#173F7A",
                fontWeight: 800,
                fontSize: 16,
                marginBottom: 14,
            }}
        >
            {partner.title}
        </div>

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
            }}
        >
            {partner.offerings.map((item) => (
                <div
                    key={item}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#667085",
                        fontSize: 13,
                        lineHeight: 1.4,
                    }}
                >
                    <span
                        style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#D6A23C",
                            flexShrink: 0,
                        }}
                    />

                    <span>{item}</span>
                </div>
            ))}
        </div>
    </GlassCard>
))}
</div>

                {/* =====================================================

                    PACKAGE 11 PART 3 STARTS HERE

                ===================================================== */}

<div

    style={{

        marginTop:180,

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

    "repeat(4,minmax(0,1fr))",

gap:20

        }}

    >

        {

            [

              {

    icon:"✅",

    title:"Verified Institute",

    text:"Build trust with schools through a verified institutional profile."

},
{

    icon:"🤝",

    title:"School Partnerships",

    text:"Connect with schools seeking workshops, enrichment and academic programs."

},
{

    icon:"🎯",

    title:"Student Discovery",

    text:"Help interested students discover your programs through Talent Passport."

},
{

    icon:"📈",

    title:"Sustainable Growth",

    text:"Expand your reach through long-term educational partnerships."

}

            ].map(

                item=>(

                    <GlassCard

                        key={item.title}

                        style={{

    padding:24,

    borderRadius:22,

    background:
        "linear-gradient(180deg,#FFFFFF 0%,#FCFBF8 100%)",

    border:"1px solid rgba(214,162,60,.10)",

    boxShadow:
        "0 12px 30px rgba(17,24,39,.05)",

    minHeight:180,

    display:"flex",

    flexDirection:"column",

    justifyContent:"flex-start",

    alignItems:"center",

    textAlign:"center"

}}

                    >

                        <div

                            style={{

                                fontSize:28,

                                marginBottom:14

                            }}

                        >

                            {item.icon}

                        </div>

                        <div

                            style={{

                                color:"#173F7A",

fontWeight:800,

fontSize:18,

marginBottom:12

                            }}

                        >

                            {item.title}

                        </div>

                        <div

                            style={{

                                color:"#667085",

fontSize:14,

lineHeight:1.7

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

        maxWidth:1320,

        display:"flex",

        justifyContent:"center",

        flexWrap:"wrap",

        gap:14,

        marginTop:40

    }}

>

    {[
        "🎭 Workshops",
        "🏫 School Partnerships",
        "🎓 Scholarships",
        "📚 Skill Programs",
        "🎤 Masterclasses",
        "🏆 Competitions",
        "🤝 Student Discovery",
        "⭐ Verified Institute"
    ].map((item)=>(

        <GlassCard

            key={item}

            hover={false}

            style={{

                padding:"10px 18px",

                borderRadius:999,

                background:
                    "linear-gradient(180deg,#FFFFFF 0%,#FCFBF8 100%)",

                border:"1px solid rgba(214,162,60,.12)",

                boxShadow:
                    "0 6px 18px rgba(17,24,39,.05)"

            }}

        >

            <div

                style={{

                    color:"#173F7A",

                    fontWeight:700,

                    fontSize:14,

                    whiteSpace:"nowrap"

                }}

            >

                {item}

            </div>

        </GlassCard>

    ))}

</div>

{/* ================================================= */}
{/* MAIN MESSAGE */}
{/* ================================================= */}


{/* ================================================= */}
{/* FINAL VISION CARD */}
{/* ================================================= */}



</div>

<SectionTransition />

            </div>

        </SectionContainer>

    );

}