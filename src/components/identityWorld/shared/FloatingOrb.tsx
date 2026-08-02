import { motion } from "framer-motion";

type FloatingOrbProps = {
    size?: number;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    color?: string;
    duration?: number;
    blur?: number;
    opacity?: number;
};

export default function FloatingOrb({

    size = 320,

    top,

    left,

    right,

    bottom,

    color = "#3B82F6",

    duration = 18,

    blur = 80,

    opacity = 0.18

}: FloatingOrbProps) {

    return (

        <motion.div

            animate={{

                y:[0,-35,20,0],

                x:[0,18,-18,0],

                scale:[1,1.08,0.96,1]

            }}

            transition={{

                repeat:Infinity,

                duration,

                ease:"easeInOut"

            }}

            style={{

                position:"absolute",

                top,

                left,

                right,

                bottom,

                width:size,

                height:size,

                borderRadius:"50%",

                background:color,

                opacity,

                filter:`blur(${blur}px)`,

                pointerEvents:"none",

                zIndex:0

            }}

        />

    );

}