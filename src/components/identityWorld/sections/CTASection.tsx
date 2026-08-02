import SectionContainer from "../shared/SectionContainer";
import FloatingBackground from "../shared/FloatingBackground";
import AnimatedHeading from "../shared/AnimatedHeading";
import GlassCard from "../shared/GlassCard";
import GradientButton from "../shared/GradientButton";

import COLORS from "../styles/colors";

interface Props {

    onContinue?: () => void;

}

export default function CTASection({

    onContinue

}: Props) {

    return (

        <SectionContainer

            id="final"

            background="linear-gradient(180deg,#030712 0%,#071326 40%,#000000 100%)"

            style={{

                position:"relative",

                overflow:"hidden",

                paddingTop:180,

                paddingBottom:220,

                minHeight:"100vh"

            }}

        >

            <FloatingBackground />

            {/* ============================================= */}

            {/* CINEMATIC GLOW */}

            {/* ============================================= */}

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 50% 20%, rgba(59,130,246,.18), transparent 60%)",

                    pointerEvents:"none"

                }}

            />

            <div

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "radial-gradient(circle at 50% 85%, rgba(251,191,36,.12), transparent 70%)",

                    pointerEvents:"none"

                }}

            />

            <div

                style={{

                    maxWidth:1200,

                    margin:"0 auto",

                    position:"relative",

                    zIndex:2,

                    textAlign:"center"

                }}

            >

                <AnimatedHeading

                    badge="The Future of Student Growth"

                    title="Education Should Understand Every Learner."

                    subtitle="Talent Passport is building an intelligence layer that connects students, parents, teachers, schools and partners into one trusted ecosystem."

                    align="center"

                    maxWidth={900}

                />

                <div

                    style={{

                        height:100

                    }}

                />

                {/* =====================================================

                    PACKAGE 13 PART 2 STARTS HERE

                ===================================================== */}

               <div

    style={{

        display:"flex",

        flexDirection:"column",

        alignItems:"center",

        gap:42

    }}

>

    {/* ============================================= */}

    {/* CINEMATIC MANIFESTO */}

    {/* ============================================= */}

    {

        [

            {

                title:"Every Student",

                text:"deserves to be understood."

            },

            {

                title:"Every Parent",

                text:"deserves visibility."

            },

            {

                title:"Every Teacher",

                text:"deserves meaningful insight."

            },

            {

                title:"Every School",

                text:"deserves academic intelligence."

            },

            {

                title:"Every Learning Partner",

                text:"deserves to be discovered."

            }

        ].map(

            line=>(

                <div

                    key={line.title}

                    style={{

                        maxWidth:900,

                        textAlign:"center"

                    }}

                >

                    <div

                        style={{

                            color:"#FFFFFF",

                            fontSize:"clamp(2.3rem,4vw,3.8rem)",

                            fontWeight:900,

                            lineHeight:1.1

                        }}

                    >

                        {line.title}

                    </div>

                    <div

                        style={{

                            marginTop:12,

                            color:COLORS.textSecondary,

                            fontSize:22,

                            lineHeight:1.7

                        }}

                    >

                        {line.text}

                    </div>

                </div>

            )

        )

    }

    <div

        style={{

            width:2,

            height:90,

            background:

                "linear-gradient(#60A5FA,transparent)",

            marginTop:10,

            marginBottom:10

        }}

    />

    {/* ============================================= */}

    {/* GRAND FINALE */}

    {/* ============================================= */}

    <div

        style={{

            textAlign:"center",

            maxWidth:1100

        }}

    >

        <div

            style={{

                fontSize:"clamp(4rem,7vw,7rem)",

                fontWeight:900,

                color:"#FFFFFF",

                lineHeight:1,

                letterSpacing:"-0.05em"

            }}

        >

            ONE PASSPORT

        </div>

        <div

            style={{

                marginTop:18,

                fontSize:"clamp(4rem,7vw,7rem)",

                fontWeight:900,

                background:

                    "linear-gradient(90deg,#38BDF8,#34D399,#FBBF24)",

                WebkitBackgroundClip:"text",

                WebkitTextFillColor:"transparent",

                lineHeight:1

            }}

        >

            ONE IDENTITY

        </div>

        <div

            style={{

                marginTop:18,

                fontSize:"clamp(4rem,7vw,7rem)",

                fontWeight:900,

                color:"#FFFFFF",

                lineHeight:1

            }}

        >

            ENDLESS POSSIBILITIES

        </div>

        <p

            style={{

                maxWidth:920,

                margin:"50px auto 0",

                color:COLORS.textSecondary,

                fontSize:20,

                lineHeight:2

            }}

        >

            Talent Passport brings together academics, co-curricular
            achievements, verified portfolios, competitions, classroom
            intelligence, parents, teachers, schools and learning partners
            into one continuously evolving student growth ecosystem.

        </p>

    </div>

    <div

        style={{

            height:60

        }}

    />

    {/* ============================================= */}

    {/* THREE ENTRY PATHS */}

    {/* ============================================= */}

    <div

        style={{

            width:"100%",

            display:"grid",

            gridTemplateColumns:

                "repeat(auto-fit,minmax(300px,1fr))",

            gap:28

        }}

    >

        {

            [

                {

                    icon:"🏫",

                    title:"Bring Talent Passport To Your School",

                    text:"Launch a dedicated intelligence platform for your administrators, teachers, parents and students.",

                    button:"Book School Demo"

                },

                {

                    icon:"🏢",

                    title:"Become A Verified Partner",

                    text:"Reach schools, conduct workshops, sponsor scholarships and connect with talented learners.",

                    button:"Become A Partner"

                },

                {

                    icon:"👨‍👩‍👧",

                    title:"Start Your Student Journey",

                    text:"Build your verified portfolio, participate in competitions and grow your lifelong identity.",

                    button:"Explore Talent Passport"

                }

            ].map(

                card=>(

                    <GlassCard

                        key={card.title}

                        style={{

                            padding:36,

                            textAlign:"center",

                            background:

                                "rgba(255,255,255,.06)"

                        }}

                    >

                        <div

                            style={{

                                fontSize:54,

                                marginBottom:22

                            }}

                        >

                            {card.icon}

                        </div>

                        <div

                            style={{

                                color:"#FFFFFF",

                                fontSize:24,

                                fontWeight:800,

                                lineHeight:1.3,

                                marginBottom:18

                            }}

                        >

                            {card.title}

                        </div>

                        <div

                            style={{

                                color:COLORS.textSecondary,

                                lineHeight:1.9,

                                marginBottom:30,

                                fontSize:16

                            }}

                        >

                            {card.text}

                        </div>

                       <GradientButton

    onClick={() => onContinue?.()}

>

    {card.button}

</GradientButton>

                    </GlassCard>

                )

            )

        }

    </div>

</div>

            </div>

        </SectionContainer>

    );

}