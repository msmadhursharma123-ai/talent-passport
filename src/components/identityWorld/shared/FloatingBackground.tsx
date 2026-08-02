import { motion } from "framer-motion";
import type { CSSProperties } from "react";

type FloatingBackgroundProps = {

    style?: CSSProperties;

};

export default function FloatingBackground({

    style

}: FloatingBackgroundProps) {

    return (

        <div

            style={{

                position: "absolute",

                inset: 0,

                overflow: "hidden",

                pointerEvents: "none",

                zIndex: 0,

                ...style

            }}

        >

            {/* ===================================== */}

            {/* TOP LEFT */}

            {/* ===================================== */}

            <motion.div

                animate={{

                    x: [0, 25, -20, 0],

                    y: [0, -20, 15, 0],

                    scale: [1, 1.05, 0.98, 1]

                }}

                transition={{

                    duration: 26,

                    repeat: Infinity,

                    ease: "easeInOut"

                }}

                style={{

                    position: "absolute",

                    width: 520,

                    height: 520,

                    top: -240,

                    left: -180,

                    borderRadius: "50%",

                    background:

                        "radial-gradient(circle, rgba(46,110,166,.12) 0%, rgba(46,110,166,0) 72%)"

                }}

            />

            {/* ===================================== */}

            {/* TOP RIGHT */}

            {/* ===================================== */}

            <motion.div

                animate={{

                    x: [0, -20, 25, 0],

                    y: [0, 15, -15, 0],

                    scale: [1, 0.98, 1.04, 1]

                }}

                transition={{

                    duration: 32,

                    repeat: Infinity,

                    ease: "easeInOut"

                }}

                style={{

                    position: "absolute",

                    width: 460,

                    height: 460,

                    top: -180,

                    right: -160,

                    borderRadius: "50%",

                    background:

                        "radial-gradient(circle, rgba(216,167,60,.08) 0%, rgba(216,167,60,0) 72%)"

                }}

            />


        </div>

    );

}