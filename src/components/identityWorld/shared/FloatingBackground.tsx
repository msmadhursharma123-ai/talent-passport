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
            {/* TOP LEFT BLUE */}
            {/* ===================================== */}

            <motion.div

                animate={{

                    x:[0,24,-18,0],

                    y:[0,-20,12,0],

                    scale:[1,1.05,.98,1]

                }}

                transition={{

                    duration:28,

                    repeat:Infinity,

                    ease:"easeInOut"

                }}

                style={{

                    position:"absolute",

                    width:560,

                    height:560,

                    top:-240,

                    left:-180,

                    borderRadius:"50%",

                    background:

                        "radial-gradient(circle, rgba(23,63,122,.10) 0%, rgba(23,63,122,0) 72%)"

                }}

            />

            {/* ===================================== */}
            {/* TOP RIGHT GOLD */}
            {/* ===================================== */}

            <motion.div

                animate={{

                    x:[0,-22,26,0],

                    y:[0,14,-14,0],

                    scale:[1,.98,1.04,1]

                }}

                transition={{

                    duration:32,

                    repeat:Infinity,

                    ease:"easeInOut"

                }}

                style={{

                    position:"absolute",

                    width:500,

                    height:500,

                    top:-180,

                    right:-170,

                    borderRadius:"50%",

                    background:

                        "radial-gradient(circle, rgba(214,162,60,.09) 0%, rgba(214,162,60,0) 72%)"

                }}

            />

            {/* ===================================== */}
            {/* CENTER WARM GLOW */}
            {/* ===================================== */}

            <motion.div

                animate={{

                    scale:[1,1.03,1],

                    opacity:[.55,.85,.55]

                }}

                transition={{

                    duration:18,

                    repeat:Infinity,

                    ease:"easeInOut"

                }}

                style={{

                    position:"absolute",

                    width:760,

                    height:760,

                    left:"50%",

                    top:"45%",

                    transform:"translate(-50%,-50%)",

                    borderRadius:"50%",

                    background:

                        "radial-gradient(circle, rgba(214,162,60,.045) 0%, rgba(214,162,60,0) 72%)"

                }}

            />

            {/* ===================================== */}
            {/* BOTTOM BLUE */}
            {/* ===================================== */}

            <motion.div

                animate={{

                    y:[0,-18,12,0],

                    x:[0,16,-12,0]

                }}

                transition={{

                    duration:30,

                    repeat:Infinity,

                    ease:"easeInOut"

                }}

                style={{

                    position:"absolute",

                    width:620,

                    height:620,

                    bottom:-280,

                    left:"50%",

                    transform:"translateX(-50%)",

                    borderRadius:"50%",

                    background:

                        "radial-gradient(circle, rgba(23,63,122,.05) 0%, rgba(23,63,122,0) 74%)"

                }}

            />

        </div>

    );

}