import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import GlassCard from "../shared/GlassCard";
import SectionTransition from "../shared/SectionTransition";

import COLORS from "../styles/colors";

export default function CompetitionSection() {

    const section = CONTENT.competitions.section;

    return (

        <SectionContainer

            id="competitions"

            background="linear-gradient(180deg,#230A08 0%, #3B1A12 45%, #170707 100%)"

            style={{

                position:"relative",

                overflow:"hidden",

                paddingTop:140,

                paddingBottom:160

            }}

        >

            <FloatingBackground />

            {/* ================================================= */}

            {/* ORANGE + PURPLE ATMOSPHERE */}

            {/* ================================================= */}

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 30% 20%, rgba(249,115,22,.18), transparent 70%)",

                    pointerEvents:"none"

                }}

            />

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 80% 70%, rgba(168,85,247,.16), transparent 65%)",

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

                    badge="National Opportunity Network"

                    title="Where Participation Opens Doors"

                    subtitle="Competitions are more than rankings. They become verified achievements, unlock scholarships, connect students with partner institutes and strengthen lifelong student identities."

                    align="center"

                    maxWidth={920}

                />

                <div

                    style={{

                        height:90

                    }}

                />

                {/* =====================================================

                    PACKAGE 9 PART 2 STARTS HERE

                ===================================================== */}

             <div

    style={{

        position:"relative",

        minHeight:960

    }}

>

    {/* ===================================================== */}

    {/* NATIONAL OPPORTUNITY PATH */}

    {/* ===================================================== */}

    <div

        style={{

            position:"absolute",

            left:"50%",

            top:40,

            bottom:40,

            width:6,

            transform:"translateX(-50%)",

            borderRadius:999,

            background:

                "linear-gradient(180deg,#F97316,#FBBF24,#A855F7)",

            boxShadow:

                "0 0 40px rgba(249,115,22,.45)"

        }}

    />

    {

        [

            {

                stage:"School",

                emoji:"🏫",

                color:"#60A5FA",

                top:"4%"

            },

            {

                stage:"District",

                emoji:"🏆",

                color:"#F97316",

                top:"18%"

            },

            {

                stage:"Cluster",

                emoji:"🌍",

                color:"#A855F7",

                top:"34%"

            },

            {

                stage:"State",

                emoji:"⭐",

                color:"#FBBF24",

                top:"50%"

            },

            {

                stage:"National",

                emoji:"🇮🇳",

                color:"#22C55E",

                top:"66%"

            },

            {

                stage:"Partner Institutes",

                emoji:"🎓",

                color:"#06B6D4",

                top:"82%"

            }

        ].map(

            (item,index)=>(

                <GlassCard

                    key={item.stage}

                    style={{

                        position:"absolute",

                        left:index%2===0 ? "24%" : "76%",

                        top:item.top,

                        transform:"translate(-50%,-50%)",

                        width:300,

                        padding:28,

                        border:`1px solid ${item.color}55`,

                        background:"rgba(255,255,255,.08)"

                    }}

                >

                    <div

                        style={{

                            display:"flex",

                            gap:16,

                            alignItems:"center"

                        }}

                    >

                        <div

                            style={{

                                width:54,

                                height:54,

                                borderRadius:"50%",

                                background:item.color,

                                display:"flex",

                                alignItems:"center",

                                justifyContent:"center",

                                fontSize:26

                            }}

                        >

                            {item.emoji}

                        </div>

                        <div>

                            <div

                                style={{

                                    color:"#FFFFFF",

                                    fontWeight:800,

                                    fontSize:22

                                }}

                            >

                                {item.stage}

                            </div>

                            <div

                                style={{

                                    color:COLORS.textSecondary,

                                    marginTop:6,

                                    lineHeight:1.6,

                                    fontSize:15

                                }}

                            >

                                Verified milestone in the
                                national competition pathway.

                            </div>

                        </div>

                    </div>

                </GlassCard>

            )

        )

    }

    {/* ===================================================== */}

    {/* FOUR COMPETITION PILLARS */}

    {/* ===================================================== */}

    {

        [

            {

                title:"🎤 Communication",

                left:"6%",

                top:"18%",

                color:"#38BDF8"

            },

            {

                title:"🎨 Creativity",

                left:"88%",

                top:"28%",

                color:"#EC4899"

            },

            {

                title:"🧠 Critical Thinking",

                left:"7%",

                top:"62%",

                color:"#8B5CF6"

            },

            {

                title:"🤝 Collaboration",

                left:"88%",

                top:"74%",

                color:"#10B981"

            }

        ].map(

            item=>(

                <GlassCard

                    key={item.title}

                    style={{

                        position:"absolute",

                        left:item.left,

                        top:item.top,

                        transform:"translate(-50%,-50%)",

                        padding:"18px 22px",

                        borderRadius:999,

                        border:`1px solid ${item.color}55`,

                        background:"rgba(255,255,255,.08)"

                    }}

                >

                    <div

                        style={{

                            color:item.color,

                            fontWeight:800,

                            whiteSpace:"nowrap"

                        }}

                    >

                        {item.title}

                    </div>

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

    {/* FINAL DESTINATION */}

    {/* ================================================= */}

    <GlassCard

        hover={false}

        style={{

            maxWidth:980,

            width:"100%",

            padding:"42px 48px",

            background:

                "linear-gradient(135deg, rgba(249,115,22,.12), rgba(168,85,247,.10))",

            border:"1px solid rgba(251,191,36,.20)"

        }}

    >

        <div

            style={{

                color:"#FBBF24",

                fontWeight:800,

                letterSpacing:2,

                textTransform:"uppercase",

                marginBottom:18

            }}

        >

            FINAL DESTINATION

        </div>

        <div

            style={{

                fontSize:"clamp(2.4rem,4vw,3.8rem)",

                fontWeight:900,

                color:"#FFFFFF",

                lineHeight:1.15

            }}

        >

            Scholarships.

            <br/>

            Workshops.

            <br/>

            Real Opportunities.

        </div>

        <p

            style={{

                marginTop:28,

                color:COLORS.textSecondary,

                fontSize:18,

                lineHeight:1.9

            }}

        >

            Every verified competition strengthens a student's identity,
            improves discoverability, and opens pathways to scholarships,
            workshops, mentorship and future learning opportunities offered
            through our trusted partner ecosystem.

        </p>

    </GlassCard>

    {/* ================================================= */}

    {/* OPPORTUNITY GRID */}

    {/* ================================================= */}

    <div

        style={{

            width:"100%",

            maxWidth:1280,

            display:"grid",

            gridTemplateColumns:

                "repeat(auto-fit,minmax(260px,1fr))",

            gap:26,

            marginTop:80

        }}

    >

        {

            [

                {

                    icon:"🎓",

                    title:"Scholarships",

                    text:"Partner institutes discover deserving students through verified participation."

                },

                {

                    icon:"🎭",

                    title:"Workshops",

                    text:"Students gain access to curated learning experiences from trusted partners."

                },

                {

                    icon:"🤝",

                    title:"Institute Discovery",

                    text:"Partners connect with talented students based on verified achievements and interests."

                },

                {

                    icon:"🌍",

                    title:"National Recognition",

                    text:"Build credibility beyond the classroom with a nationwide opportunity network."

                }

            ].map(

                item=>(

                    <GlassCard

                        key={item.title}

                        style={{

                            padding:32,

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

                                color:"#FFFFFF",

                                fontSize:22,

                                fontWeight:800,

                                marginBottom:14

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

    {/* CLOSING MESSAGE */}

    {/* ================================================= */}

    <div

        style={{

            maxWidth:980,

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

            Participation

            <br/>

            Creates Possibilities.

        </div>

        <div

            style={{

                marginTop:28,

                fontSize:22,

                fontWeight:700,

                background:

                    "linear-gradient(90deg,#F97316,#FBBF24,#A855F7)",

                WebkitBackgroundClip:"text",

                WebkitTextFillColor:"transparent"

            }}

        >

            Every competition becomes part of a student's verified lifelong identity.

        </div>

        <p

            style={{

                maxWidth:900,

                margin:"34px auto 0",

                color:COLORS.textSecondary,

                fontSize:18,

                lineHeight:1.9

            }}

        >

            Talent Passport transforms participation into recognition,
            recognition into opportunities, and opportunities into a
            stronger future for every learner.

        </p>

    </div>

</div>

<SectionTransition />

            </div>

        </SectionContainer>

    );

}