import { motion } from "framer-motion";
import type { ReactNode } from "react";

type HoverTiltProps = {
    children: ReactNode;
};

export default function HoverTilt({

    children

}: HoverTiltProps) {

    return (

        <motion.div

            whileHover={{

                y:-10,

                rotateX:4,

                rotateY:-4,

                scale:1.02

            }}

            transition={{

                duration:.35,

                ease:[0.22,1,0.36,1]

            }}

            style={{

                position:"relative",

                transformStyle:"preserve-3d"

            }}

        >

            {/* ========================================= */}

            {/* GLASS REFLECTION */}

            {/* ========================================= */}

            <motion.div

                initial={{

                    opacity:0,

                    x:-250

                }}

                whileHover={{

                    opacity:.28,

                    x:350

                }}

                transition={{

                    duration:.8,

                    ease:"easeOut"

                }}

                style={{

                    position:"absolute",

                    inset:0,

                    background:

                        "linear-gradient(105deg, transparent 20%, rgba(255,255,255,.45) 50%, transparent 80%)",

                    pointerEvents:"none",

                    borderRadius:"inherit",

                    overflow:"hidden",

                    zIndex:5

                }}

            />

            {children}

        </motion.div>

    );

}