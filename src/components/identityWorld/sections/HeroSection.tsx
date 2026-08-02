import CONTENT from "../data/identityWorldContent";

import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import FloatingParticles from "../shared/FloatingParticles";

import GlassBadge from "../shared/GlassBadge";
import GlassCard from "../shared/GlassCard";
import GradientButton from "../shared/GradientButton";

import COLORS from "../styles/colors";
import GRADIENTS from "../styles/gradients";

export default function HeroSection() {

    const hero = CONTENT.hero;

    return (

        <SectionContainer

            id="hero"

            fullWidth

            paddingY={0}

            background={GRADIENTS.hero}

            style={{

                minHeight: "100vh",

                display: "flex",

                alignItems: "center",

                position: "relative",

               overflow: "hidden",

backgroundAttachment: "fixed"

            }}

        >

            <FloatingBackground />

            <FloatingParticles />

            {/* Decorative Glow */}

            <div

                style={{

                    position: "absolute",

                    inset: 0,

                    background:

                        GRADIENTS.heroGlow,

                    opacity: .85,

                    pointerEvents: "none"

                }}

            />

            {/* Main Hero */}

            <div

                style={{

                    width: "100%",

                    maxWidth: 1380,

                    margin: "0 auto",

                    display: "grid",

                    rowGap: 80,

                    gridTemplateColumns:

                        "1.05fr .95fr",

                    gap: 70,

                    alignItems: "center",

                    padding:

    "120px clamp(24px,4vw,56px)",

                    position: "relative",

                    zIndex: 2

                }}

            >

                {/* =====================================================

                    LEFT SIDE

                ===================================================== */}

                <div

                    style={{

                        display: "flex",

                        flexDirection: "column",
justifyContent: "center",
                        alignItems: "flex-start"

                    }}

                >

                    <GlassBadge
    size="large"
    color="#7DD3FC"
>
    {hero.badge}
</GlassBadge>

<div
    style={{
        height: 24
    }}
/>

<h1
    style={{
        margin: 0,
        fontSize: "clamp(3.8rem,7vw,6.6rem)",
        lineHeight: 1.02,
        fontWeight: 900,
        color: COLORS.textPrimary,
        letterSpacing: "-0.05em"
    }}
>
    {hero.title}
</h1>

<div
    style={{
        fontSize: "clamp(3.9rem,7vw,6.8rem)",
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: "-0.05em",
        marginTop: 6,
        background:
            "linear-gradient(90deg,#60A5FA,#22D3EE,#A855F7)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
    }}
>
    {hero.highlight}
</div>

<p
    style={{
        marginTop: 34,
        marginBottom: 0,
        maxWidth: 720,
        fontSize: 21,
        lineHeight: 1.9,
        color: COLORS.textSecondary
    }}
>
    {hero.subtitle}
</p>

<div
    style={{
        marginTop: 34,
        fontSize: 28,
        fontWeight: 700,
        color: "#FFFFFF"
    }}
>
    {hero.tagline}
</div>

<div
    style={{
        display: "flex",
        gap: 18,
        marginTop: 42,
        flexWrap: "wrap"
    }}
>

    <GradientButton>

        {hero.primaryButton.label}

    </GradientButton>

    <GradientButton
        variant="secondary"
    >

        {hero.secondaryButton.label}

    </GradientButton>

</div>

<div
    style={{
        display: "grid",
        gridTemplateColumns:
            "repeat(4,minmax(110px,1fr))",
        gap: 26,
        marginTop: 70,
        width: "100%"
    }}
>

    {

        hero.statistics.map(

            stat => (

                <div
                    key={stat.label}
                >

                    <div
                        style={{
                            fontSize: 44,
                            fontWeight: 800,
                            color: "#7DD3FC"
                        }}
                    >
                        {stat.value}
                    </div>

                    <div
                        style={{
                            marginTop: 6,
                            color: COLORS.textSecondary,
                            fontSize: 15
                        }}
                    >
                        {stat.label}
                    </div>

                </div>

            )

        )

    }

</div>

                </div>

                {/* =====================================================

                    RIGHT SIDE

                ===================================================== */}

                <div

                    style={{

                        position: "relative",

                        minHeight: 760,

                        display: "flex",

                        justifyContent: "center",

                        alignItems: "center"

                    }}

                >

                    <div
    style={{
        position: "relative",
        width: "100%",
        height: 700
    }}
>

    {/* Central Identity Core */}

    <GlassCard

        hover={false}

        style={{

            position: "absolute",

            left: "50%",

            top: "50%",

            transform: "translate(-50%,-50%)",

            width: 290,

            padding: 34,

            background:
                "rgba(255,255,255,.12)",

            textAlign: "center",

            zIndex: 5

        }}

    >

        <div

            style={{

                fontSize: 18,

                color: "#93C5FD",

                fontWeight: 700,

                marginBottom: 18

            }}

        >

            TALENT PASSPORT

        </div>

        <div

            style={{

                fontSize: 34,

                fontWeight: 900,

                color: "#FFFFFF",

                lineHeight: 1.15

            }}

        >

            One Identity

        </div>

        <div

            style={{

                marginTop: 14,

                color: COLORS.textSecondary,

                lineHeight: 1.8

            }}

        >

            Student Growth Operating System

        </div>

    </GlassCard>

    {

        hero.floatingCards.map(

            (card,index)=>(

                <GlassCard

                    key={card.title}

                    style={{

                        position:"absolute",

                        width:220,

                        padding:24,

                        left:

                            [

                                20,

                                390,

                                40,

                                370

                            ][index],

                        top:

                            [

                                40,

                                90,

                                470,

                                500

                            ][index],

                        background:

                            "rgba(255,255,255,.08)"

                    }}

                >

                    <div

                        style={{

                            color:card.color,

                            fontWeight:700,

                            fontSize:14,

                            marginBottom:12

                        }}

                    >

                        {card.title}

                    </div>

                    <div

                        style={{

                            color:"#FFFFFF",

                            fontSize:30,

                            fontWeight:800

                        }}

                    >

                        {card.value}

                    </div>

                    <div

                        style={{

                            marginTop:10,

                            color:COLORS.textSecondary,

                            fontSize:14,

                            lineHeight:1.7

                        }}

                    >

                        {card.subtitle}

                    </div>

                </GlassCard>

            )

        )

    }

    {/* Connection Lines */}

    <svg

        width="100%"

        height="700"

        style={{

            position:"absolute",

            inset:0,

            pointerEvents:"none",

            zIndex:1

        }}

    >

        <line

            x1="50%"

            y1="50%"

            x2="110"

            y2="130"

            stroke="rgba(255,255,255,.18)"

            strokeWidth="2"

        />

        <line

            x1="50%"

            y1="50%"

            x2="500"

            y2="170"

            stroke="rgba(255,255,255,.18)"

            strokeWidth="2"

        />

        <line

            x1="50%"

            y1="50%"

            x2="120"

            y2="560"

            stroke="rgba(255,255,255,.18)"

            strokeWidth="2"

        />

        <line

            x1="50%"

            y1="50%"

            x2="500"

            y2="560"

            stroke="rgba(255,255,255,.18)"

            strokeWidth="2"

        />

    </svg>

    {/* Bottom Glass Strip */}

    <GlassCard

        hover={false}

        style={{

            position:"absolute",

            left:0,

            right:0,

            bottom:0,

            display:"grid",

            gridTemplateColumns:

                "repeat(4,1fr)",

            gap:20,

            padding:26,

            background:

                "rgba(255,255,255,.08)"

        }}

    >

        {

            [

                "Academic Intelligence",

                "Digital Portfolio",

                "Competitions",

                "Opportunity Marketplace"

            ].map(

                item=>(

                    <div

                        key={item}

                        style={{

                            textAlign:"center"

                        }}

                    >

                        <div

                            style={{

                                color:"#7DD3FC",

                                fontWeight:700,

                                fontSize:14,

                                marginBottom:8

                            }}

                        >

                            ACTIVE

                        </div>

                        <div

                            style={{

                                color:"#FFFFFF",

                                fontWeight:700,

                                lineHeight:1.6

                            }}

                        >

                            {item}

                        </div>

                    </div>

                )

            )

        }

    </GlassCard>

</div>

                </div>

            </div>

{/* =====================================================

    SCROLL INDICATOR

===================================================== */}

<div

    style={{

        position: "absolute",

        left: "50%",

        bottom: 34,

        transform: "translateX(-50%)",

        display: "flex",

        flexDirection: "column",

        alignItems: "center",

        gap: 14,

        zIndex: 5

    }}

>

    <div

        style={{

            color: "rgba(255,255,255,.72)",

            fontSize: 13,

            letterSpacing: 2,

            textTransform: "uppercase",

            fontWeight: 700

        }}

    >

        Scroll to Explore

    </div>

    <div

        style={{

            width: 32,

            height: 54,

            borderRadius: 999,

            border: "2px solid rgba(255,255,255,.35)",

            display: "flex",

            justifyContent: "center",

            paddingTop: 8

        }}

    >

        <div

            style={{

                width: 6,

                height: 10,

                borderRadius: 999,

                background: "#7DD3FC",

                animation:

                    "identityFloat 2.2s ease-in-out infinite"

            }}

        />

    </div>

</div>

        </SectionContainer>

    );

}

