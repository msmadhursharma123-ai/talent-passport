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

                        y: -4,

                        scale: 1.015,

                        boxShadow:
                            "0 18px 42px rgba(15,39,71,.12)"

                    }

                    : {}

            }

            transition={{

                duration: 0.22,

                ease: [0.22, 1, 0.36, 1]

            }}

            style={{

                position: "relative",

                overflow: "hidden",

                borderRadius: 22,

                padding: 24,

                background:
                    "rgba(255,255,255,.72)",

                backdropFilter: "blur(18px)",

                WebkitBackdropFilter: "blur(18px)",

                border:
                    "1px solid rgba(23,50,77,.08)",

                boxShadow:
                    "0 10px 35px rgba(15,39,71,.08)",

                transition:
                    "all .25s ease",

                ...style

            }}

        >

            {/* Soft top highlight */}

            <div

                style={{

                    position: "absolute",

                    top: 0,

                    left: 0,

                    right: 0,

                    height: 1,

                    background:

                        "linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent)"

                }}

            />

            {/* Soft reflection */}

            <div

                style={{

                    position: "absolute",

                    inset: 0,

                    pointerEvents: "none",

                    background:

                        "linear-gradient(135deg,rgba(255,255,255,.14),transparent 45%)"

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