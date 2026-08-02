import useActiveSection from "./useActiveSection";

export default function MobileProgress() {

    const {

        sections,

        active,

        progress

    } = useActiveSection();

    const currentSection=

        sections.find(

            section=>section.id===active

        );

    return(

        <div

            style={{

                position:"fixed",

                top:0,

                left:0,

                right:0,

                zIndex:9999,

                padding:"14px 18px",

                background:"rgba(8,12,20,.78)",

                backdropFilter:"blur(20px)",

                WebkitBackdropFilter:"blur(20px)",

                borderBottom:"1px solid rgba(255,255,255,.08)"

            }}

        >

            {/* ============================================= */}

            {/* TOP ROW */}

            {/* ============================================= */}

            <div

                style={{

                    display:"flex",

                    justifyContent:"space-between",

                    alignItems:"center",

                    marginBottom:10

                }}

            >

                <div>

                    <div

                        style={{

                            color:"#38BDF8",

                            fontSize:11,

                            letterSpacing:2,

                            fontWeight:800,

                            textTransform:"uppercase"

                        }}

                    >

                        Talent Passport

                    </div>

                    <div

                        style={{

                            color:"#FFFFFF",

                            fontSize:18,

                            fontWeight:700,

                            marginTop:3

                        }}

                    >

                        {

                            currentSection?.label ??

                            "Vision"

                        }

                    </div>

                </div>

                <div

                    style={{

                        color:"#FFFFFF",

                        fontWeight:700,

                        fontSize:15

                    }}

                >

                    {

                        Math.round(

                            progress*100

                        )

                    }%

                </div>

            </div>

            {/* ============================================= */}

            {/* PROGRESS BAR */}

            {/* ============================================= */}

            <div

                style={{

                    width:"100%",

                    height:6,

                    borderRadius:999,

                    overflow:"hidden",

                    background:

                        "rgba(255,255,255,.10)"

                }}

            >

                <div

                    style={{

                        width:`${progress*100}%`,

                        height:"100%",

                        borderRadius:999,

                        background:

                            "linear-gradient(90deg,#38BDF8,#6366F1,#10B981,#FBBF24)",

                        transition:

                            "width .35s ease"

                    }}

                />

            </div>

        </div>

    );

}