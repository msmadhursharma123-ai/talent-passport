import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

type GlassCardProps = {
    children: ReactNode;
    style?: CSSProperties;
    hover?: boolean;
};

export default function GlassCard({
    children,
    style,
    hover = true
}: GlassCardProps) {

    return (

        <motion.div

            whileHover={
                hover
                    ? {
                        y: -6,
                        scale: 1.012,
                        transition: {
                            duration: 0.22
                        }
                    }
                    : {}
            }

            style={{

                position: "relative",

                overflow: "hidden",

                borderRadius: 24,

                padding: 20,

                background:
                    "linear-gradient(180deg,#FFFFFF 0%,#FCFBF8 100%)",

                backdropFilter: "blur(10px)",

                WebkitBackdropFilter: "blur(10px)",

                border:
                    "1px solid rgba(198,140,31,.10)",

                boxShadow:
                    `
                    0 8px 18px rgba(17,24,39,.04),
                    0 22px 54px rgba(17,24,39,.05)
                    `,

                transition:
                    "all .28s cubic-bezier(.22,1,.36,1)",

                ...style

            }}

        >

            {/* ===================================== */}
            {/* Warm Gold Highlight */}
            {/* ===================================== */}

            <div

                style={{

                    position: "absolute",

                    top: 0,

                    left: 0,

                    right: 0,

                    height: 2,

                    background:
                        "linear-gradient(90deg,transparent,#D6A23C,transparent)",

                    opacity: .35

                }}

            />

            {/* ===================================== */}
            {/* Premium Glow */}
            {/* ===================================== */}

            <div

                style={{

                    position: "absolute",

                    inset: 0,

                    pointerEvents: "none",

                    background: `
                        radial-gradient(
                            circle at top left,
                            rgba(198,140,31,.05),
                            transparent 38%
                        ),

                        radial-gradient(
                            circle at bottom right,
                            rgba(23,63,122,.03),
                            transparent 42%
                        )
                    `

                }}

            />

            {/* ===================================== */}
            {/* Soft Reflection */}
            {/* ===================================== */}

            <div

                style={{

                    position: "absolute",

                    inset: 0,

                    pointerEvents: "none",

                    background:
                        "linear-gradient(135deg,rgba(255,255,255,.20),transparent 45%)"

                }}

            />

            <div

                style={{

                    position: "relative",

                    zIndex: 2

                }}

            >

                {children}

            </div>

        </motion.div>

    );

}