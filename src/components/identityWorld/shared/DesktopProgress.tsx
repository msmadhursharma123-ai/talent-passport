import { motion } from "framer-motion";
import useActiveSection from "./useActiveSection";

export default function DesktopProgress() {

    const {
        sections,
        active,
        progress
    } = useActiveSection();

    return (

        <div
            style={{
                position: "fixed",
                left: 28,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 9999,
                width: 230
            }}
        >

            <motion.div

                animate={{
                    boxShadow: [
                        "0 25px 60px rgba(0,0,0,.35)",
                        "0 25px 60px rgba(56,189,248,.18)",
                        "0 25px 60px rgba(16,185,129,.18)",
                        "0 25px 60px rgba(0,0,0,.35)"
                    ]
                }}

                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear"
                }}

                style={{
                    position: "relative",
                    borderRadius: 26,
                    padding: "26px 22px",
                    background: "rgba(9,16,32,.58)",
                    backdropFilter: "blur(22px)",
                    WebkitBackdropFilter: "blur(22px)",
                    border: "1px solid rgba(255,255,255,.08)"
                }}

            >

                {/* Header */}

                <div
                    style={{
                        marginBottom: 28
                    }}
                >

                    <div
                        style={{
                            color: "#38BDF8",
                            fontWeight: 800,
                            fontSize: 12,
                            letterSpacing: 2,
                            textTransform: "uppercase"
                        }}
                    >
                        Talent Passport
                    </div>

                    <div
                        style={{
                            marginTop: 8,
                            color: "#FFFFFF",
                            fontSize: 20,
                            fontWeight: 800,
                            lineHeight: 1.3
                        }}
                    >
                        Identity World
                    </div>

                </div>

                {/* Progress Track */}

                <div
                    style={{
                        position: "absolute",
                        left: 31,
                        top: 96,
                        bottom: 84,
                        width: 2,
                        borderRadius: 999,
                        background: "rgba(255,255,255,.10)"
                    }}
                >

                    <motion.div

                        animate={{
                            height: `${progress * 100}%`
                        }}

                        transition={{
                            duration: .35
                        }}

                        style={{
                            width: "100%",
                            borderRadius: 999,
                            background:
                                "linear-gradient(180deg,#38BDF8,#6366F1,#10B981,#FBBF24)"
                        }}

                    />

                </div>

                {/* Navigation */}

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 16
                    }}
                >

                    {

                        sections.map(section => {

                            const activeSection =
                                active === section.id;

                            return (

                                <motion.button

                                    key={section.id}

                                    whileHover={{
                                        x: 6
                                    }}

                                    transition={{
                                        duration: .25
                                    }}

                                    onClick={() => {

                                        document
                                            .getElementById(section.id)
                                            ?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start"
                                            });

                                    }}

                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 16,
                                        background: "transparent",
                                        border: "none",
                                        cursor: "pointer",
                                        padding: 0,
                                        textAlign: "left"
                                    }}

                                >

                                    <motion.div

                                        animate={
                                            activeSection
                                                ? {
                                                    scale: [1, 1.28, 1],
                                                    boxShadow: [
                                                        "0 0 12px rgba(56,189,248,.45)",
                                                        "0 0 26px rgba(56,189,248,.9)",
                                                        "0 0 12px rgba(56,189,248,.45)"
                                                    ]
                                                }
                                                : {
                                                    scale: 1
                                                }
                                        }

                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}

                                        style={{
                                            width: activeSection ? 14 : 9,
                                            height: activeSection ? 14 : 9,
                                            borderRadius: "50%",
                                            background:
                                                activeSection
                                                    ? "#38BDF8"
                                                    : "rgba(255,255,255,.25)"
                                        }}

                                    />

                                    <motion.div

                                        animate={{
                                            opacity: activeSection ? 1 : .65
                                        }}

                                        transition={{
                                            duration: .3
                                        }}

                                        style={{
                                            color:
                                                activeSection
                                                    ? "#FFFFFF"
                                                    : "rgba(255,255,255,.55)",

                                            fontWeight:
                                                activeSection
                                                    ? 700
                                                    : 500,

                                            fontSize: 14
                                        }}

                                    >

                                        {

                                            activeSection
                                                ? `▶ ${section.label}`
                                                : section.label

                                        }

                                    </motion.div>

                                </motion.button>

                            );

                        })

                    }

                </div>

                {/* Footer */}

                <div
                    style={{
                        marginTop: 28,
                        paddingTop: 20,
                        borderTop:
                            "1px solid rgba(255,255,255,.08)"
                    }}
                >

                    <div
                        style={{
                            color: "rgba(255,255,255,.55)",
                            fontSize: 12,
                            marginBottom: 8
                        }}
                    >
                        Experience Progress
                    </div>

                    <div
                        style={{
                            color: "#FFFFFF",
                            fontWeight: 800,
                            fontSize: 28
                        }}
                    >
                        {Math.round(progress * 100)}%
                    </div>

                </div>

            </motion.div>

        </div>

    );

}