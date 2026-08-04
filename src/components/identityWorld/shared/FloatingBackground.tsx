import { motion } from "framer-motion";
import type { CSSProperties } from "react";

type FloatingBackgroundProps = {
    style?: CSSProperties;
};

export default function FloatingBackground({
    style,
}: FloatingBackgroundProps) {

    const isMobile =
        typeof window !== "undefined" &&
        window.innerWidth <= 768;

    const isTablet =
        typeof window !== "undefined" &&
        window.innerWidth > 768 &&
        window.innerWidth <= 1024;

    const scale = isMobile ? 0.45 : isTablet ? 0.72 : 1;

    return (

        <div
            style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                pointerEvents: "none",
                zIndex: 0,
                ...style,
            }}
        >

            {/* TOP LEFT BLUE */}

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
                    width:560 * scale,
                    height:560 * scale,
                    top:-240 * scale,
                    left:-180 * scale,
                    borderRadius:"50%",
                    background:
                        "radial-gradient(circle, rgba(23,63,122,.10) 0%, rgba(23,63,122,0) 72%)"
                }}
            />

            {/* TOP RIGHT GOLD */}

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
                    width:500 * scale,
                    height:500 * scale,
                    top:-180 * scale,
                    right:-170 * scale,
                    borderRadius:"50%",
                    background:
                        "radial-gradient(circle, rgba(214,162,60,.09) 0%, rgba(214,162,60,0) 72%)"
                }}
            />

            {/* CENTER GOLD */}

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
                    width:760 * scale,
                    height:760 * scale,
                    left:"50%",
                    top:"45%",
                    transform:"translate(-50%,-50%)",
                    borderRadius:"50%",
                    background:
                        "radial-gradient(circle, rgba(214,162,60,.045) 0%, rgba(214,162,60,0) 72%)"
                }}
            />

            {/* BOTTOM BLUE */}

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
                    width:620 * scale,
                    height:620 * scale,
                    bottom:-280 * scale,
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