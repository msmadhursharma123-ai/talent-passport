import { motion } from "framer-motion";

type AnimatedLineProps = {

    x1:number;
    y1:number;

    x2:number;
    y2:number;

    color?:string;

    width?:number;

};

export default function AnimatedLine({

    x1,

    y1,

    x2,

    y2,

    color="#38BDF8",

    width=2

}:AnimatedLineProps){

    return(

        <svg

            style={{

                position:"absolute",

                inset:0,

                width:"100%",

                height:"100%",

                overflow:"visible",

                pointerEvents:"none"

            }}

        >

            {/* Background Line */}

            <line

                x1={x1}

                y1={y1}

                x2={x2}

                y2={y2}

                stroke={color}

                strokeOpacity={0.18}

                strokeWidth={width}

            />

            {/* Animated Glow */}

            <motion.line

                x1={x1}

                y1={y1}

                x2={x2}

                y2={y2}

                stroke={color}

                strokeWidth={width+1}

                strokeLinecap="round"

                strokeDasharray="14 18"

                animate={{

                    strokeDashoffset:[32,0]

                }}

                transition={{

                    duration:2.8,

                    ease:"linear",

                    repeat:Infinity

                }}

                style={{

                    filter:`drop-shadow(0 0 8px ${color})`

                }}

            />

        </svg>

    );

}