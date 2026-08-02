import { motion } from "framer-motion";
import type { ReactNode } from "react";

type MotionRevealProps = {
    children: ReactNode;
    delay?: number;
    y?: number;
    disabled?: boolean;
};

export default function MotionReveal({

    children,

    delay = 0,

    y = 28,

    disabled = false

}: MotionRevealProps) {

    if (disabled) {
        return <>{children}</>;
    }

    return (

        <motion.div

            initial={{

                opacity: 0,

                y,

                filter: "blur(6px)"

            }}

            whileInView={{

                opacity: 1,

                y: 0,

                filter: "blur(0px)"

            }}

            viewport={{

                once: true,

                amount: 0.18

            }}

            transition={{

                duration: 0.85,

                ease: [0.22, 1, 0.36, 1],

                delay

            }}

            style={{

                willChange: "transform, opacity, filter"

            }}

        >

            {children}

        </motion.div>

    );

}