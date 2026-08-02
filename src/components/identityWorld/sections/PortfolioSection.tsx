import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import GlassCard from "../shared/GlassCard";
import SectionTransition from "../shared/SectionTransition";

import COLORS from "../styles/colors";

export default function PortfolioSection() {

    const section = CONTENT.portfolio.section;

    return (

        <SectionContainer

            id="portfolio"

            background="linear-gradient(180deg,#120720 0%,#1B0F3E 45%,#0D061A 100%)"

            style={{

                position:"relative",

                overflow:"hidden",

                paddingTop:140,

                paddingBottom:160

            }}

        >

            <FloatingBackground />

            {/* ===================================================== */}

            {/* GOLD + INDIGO ATMOSPHERE */}

            {/* ===================================================== */}

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 50% 25%, rgba(251,191,36,.18), transparent 68%)",

                    pointerEvents:"none"

                }}

            />

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 80% 80%, rgba(99,102,241,.18), transparent 62%)",

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

                    badge="Verified Digital Identity"

                    title="Your Living Identity"

                    subtitle="Every classroom. Every project. Every competition. Every certificate. Every achievement. One continuously growing verified identity."

                    align="center"

                    maxWidth={940}

                />

                <div

                    style={{

                        height:90

                    }}

                />

                {/* =====================================================

                    PACKAGE 8 PART 2 STARTS HERE

                ===================================================== */}

               <div

    style={{

        position:"relative",

        minHeight:980

    }}

>

    {/* ===================================================== */}

    {/* PASSPORT GLOW */}

    {/* ===================================================== */}

    <div

        style={{

            position:"absolute",

            left:"50%",

            top:"50%",

            transform:"translate(-50%,-50%)",

            width:560,

            height:560,

            borderRadius:"50%",

            background:

                "radial-gradient(circle, rgba(251,191,36,.22), transparent 70%)",

            filter:"blur(60px)"

        }}

    />

    {/* ===================================================== */}

    {/* VERIFIED DIGITAL PASSPORT */}

    {/* ===================================================== */}

    <GlassCard

        hover={false}

        style={{

            position:"absolute",

            left:"50%",

            top:"50%",

            transform:"translate(-50%,-50%)",

            width:430,

            padding:42,

            borderRadius:34,

            background:

                "linear-gradient(180deg,rgba(255,255,255,.14),rgba(255,255,255,.06))",

            border:"1px solid rgba(251,191,36,.35)",

            backdropFilter:"blur(30px)",

            WebkitBackdropFilter:"blur(30px)",

            overflow:"hidden"

        }}

    >

        {/* GOLD STRIP */}

        <div

            style={{

                position:"absolute",

                left:0,

                right:0,

                top:0,

                height:8,

                background:

                    "linear-gradient(90deg,#FBBF24,#FCD34D,#F59E0B)"

            }}

        />

        <div

            style={{

                display:"flex",

                justifyContent:"space-between",

                alignItems:"center",

                marginBottom:32

            }}

        >

            <div>

                <div

                    style={{

                        color:"#FBBF24",

                        fontSize:13,

                        fontWeight:800,

                        letterSpacing:2,

                        textTransform:"uppercase"

                    }}

                >

                    VERIFIED IDENTITY

                </div>

                <div

                    style={{

                        marginTop:8,

                        color:"#FFFFFF",

                        fontSize:34,

                        fontWeight:900

                    }}

                >

                    Talent Passport

                </div>

            </div>

            <div

                style={{

                    width:72,

                    height:72,

                    borderRadius:"50%",

                    background:

                        "linear-gradient(135deg,#FBBF24,#F59E0B)",

                    display:"flex",

                    alignItems:"center",

                    justifyContent:"center",

                    fontSize:34

                }}

            >

                🛡️

            </div>

        </div>

        <div

            style={{

                display:"grid",

                gap:18

            }}

        >

            {

                [

                    "Academic Journey",

                    "Verified Portfolio",

                    "Competitions",

                    "Projects",

                    "Skills",

                    "Achievements",

                    "Credits",

                    "Scholarships"

                ].map(

                    item=>(

                        <div

                            key={item}

                            style={{

                                display:"flex",

                                justifyContent:"space-between",

                                alignItems:"center",

                                borderBottom:

                                    "1px solid rgba(255,255,255,.08)",

                                paddingBottom:12

                            }}

                        >

                            <div

                                style={{

                                    color:"#E2E8F0",

                                    fontSize:16

                                }}

                            >

                                {item}

                            </div>

                            <div

                                style={{

                                    color:"#34D399",

                                    fontWeight:800

                                }}

                            >

                                VERIFIED

                            </div>

                        </div>

                    )

                )

            }

        </div>

    </GlassCard>

    {/* ===================================================== */}

    {/* ORBIT PLACEHOLDER */}

    {/* ===================================================== */}

    {/* Package 8 Part 3 */}

</div>

                <div

    style={{

        marginTop:140,

        display:"flex",

        flexDirection:"column",

        alignItems:"center"

    }}

>

    {/* ================================================= */}

    {/* ORBITING VERIFIED IDENTITY LAYERS */}

    {/* ================================================= */}

    <div

        style={{

            position:"relative",

            width:"100%",

            maxWidth:1200,

            height:420,

            marginBottom:120

        }}

    >

        {

            [

                {

                    title:"🏆 Competitions",

                    left:"10%",

                    top:"15%",

                    color:"#FBBF24"

                },

                {

                    title:"📂 Projects",

                    left:"28%",

                    top:"78%",

                    color:"#60A5FA"

                },

                {

                    title:"⭐ Credits",

                    left:"74%",

                    top:"20%",

                    color:"#34D399"

                },

                {

                    title:"📜 Certificates",

                    left:"86%",

                    top:"72%",

                    color:"#F472B6"

                },

                {

                    title:"🎭 Skills",

                    left:"8%",

                    top:"58%",

                    color:"#A855F7"

                },

                {

                    title:"🎓 Achievements",

                    left:"54%",

                    top:"92%",

                    color:"#F59E0B"

                },

                {

                    title:"🌟 Workshops",

                    left:"90%",

                    top:"42%",

                    color:"#22D3EE"

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

                            padding:"18px 26px",

                            borderRadius:999,

                            background:"rgba(255,255,255,.08)",

                            border:`1px solid ${item.color}55`

                        }}

                    >

                        <div

                            style={{

                                color:item.color,

                                fontWeight:800,

                                fontSize:15,

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

    {/* ================================================= */}

    {/* BIG STATEMENT */}

    {/* ================================================= */}

    <div

        style={{

            maxWidth:980,

            textAlign:"center"

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

            Your Identity

            <br/>

            Should Grow

            <br/>

            Every Single Day.

        </div>

        <div

            style={{

                marginTop:34,

                fontSize:22,

                fontWeight:700,

                background:

                    "linear-gradient(90deg,#FBBF24,#F59E0B,#6366F1)",

                WebkitBackgroundClip:"text",

                WebkitTextFillColor:"transparent"

            }}

        >

            Not just after winning a competition.

        </div>

        <p

            style={{

                maxWidth:920,

                margin:"40px auto 0",

                color:COLORS.textSecondary,

                fontSize:18,

                lineHeight:1.9

            }}

        >

            Every classroom discussion, every project, every skill,
            every verified competition, every achievement, every
            certificate and every learning milestone strengthens
            one trusted digital identity that continues growing
            throughout the student's educational journey.

        </p>

    </div>

    {/* ================================================= */}

    {/* PREMIUM METRICS */}

    {/* ================================================= */}

    <div

        style={{

            width:"100%",

            maxWidth:1280,

            display:"grid",

            gridTemplateColumns:

                "repeat(auto-fit,minmax(240px,1fr))",

            gap:26,

            marginTop:90

        }}

    >

        {

            [

                {

                    value:"∞",

                    label:"Lifetime Portfolio"

                },

                {

                    value:"100%",

                    label:"Verified Identity"

                },

                {

                    value:"AI",

                    label:"Growth Timeline"

                },

                {

                    value:"One",

                    label:"Living Passport"

                }

            ].map(

                item=>(

                    <GlassCard

                        hover={false}

                        key={item.label}

                        style={{

                            padding:34,

                            textAlign:"center",

                            background:"rgba(255,255,255,.06)"

                        }}

                    >

                        <div

                            style={{

                                fontSize:42,

                                fontWeight:900,

                                color:"#FBBF24"

                            }}

                        >

                            {item.value}

                        </div>

                        <div

                            style={{

                                marginTop:14,

                                color:COLORS.textSecondary,

                                lineHeight:1.7

                            }}

                        >

                            {item.label}

                        </div>

                    </GlassCard>

                )

            )

        }

    </div>

    {/* ================================================= */}

    {/* CLOSING QUOTE */}

    {/* ================================================= */}

    <div

        style={{

            marginTop:100,

            maxWidth:960,

            padding:"44px 56px",

            borderRadius:28,

            background:"rgba(255,255,255,.05)",

            border:"1px solid rgba(255,255,255,.08)",

            backdropFilter:"blur(18px)",

            WebkitBackdropFilter:"blur(18px)",

            textAlign:"center"

        }}

    >

        <div

            style={{

                color:"#FBBF24",

                fontWeight:800,

                letterSpacing:2,

                textTransform:"uppercase",

                marginBottom:24

            }}

        >

            Talent Passport Vision

        </div>

        <div

            style={{

                fontSize:"clamp(2rem,4vw,3.2rem)",

                color:"#FFFFFF",

                fontWeight:900,

                lineHeight:1.3

            }}

        >

            One Passport.

            <br/>

            One Identity.

            <br/>

            A Lifetime of Verified Growth.

        </div>

    </div>

</div>

<SectionTransition />

            </div>

        </SectionContainer>

    );

}