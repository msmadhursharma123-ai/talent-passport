import { useMemo } from "react";
import { ANIMATIONS } from "../styles/animations";

export interface FloatingParticlesProps {

    count?: number;

}

export default function FloatingParticles({

    count = 24

}: FloatingParticlesProps) {

    const particles = useMemo(() => {

        return Array.from(

            { length: count },

            (_, index) => ({

                id: index,

                size:

                    6 +

                    Math.random() * 16,

                left:

                    Math.random() * 100,

                top:

                    Math.random() * 100,

                opacity:

                    0.08 +

                    Math.random() * 0.18,

                delay:

                    Math.random() * 8,

                duration:

                    8 +

                    Math.random() * 10

            })

        );

    }, [count]);

    return (

        <>

            {

                particles.map(

                    particle => (

                        <div

                            key={particle.id}

                            style={{

                                position: "absolute",

                                left: `${particle.left}%`,

                                top: `${particle.top}%`,

                                width: particle.size,

                                height: particle.size,

                                borderRadius: "50%",

                                background:

                                    "rgba(255,255,255,.85)",

                                opacity: particle.opacity,

                                filter:

                                    "blur(1px)",

                                pointerEvents:

                                    "none",

                                animation:

                                    `identityFloat ${particle.duration}s ease-in-out infinite`,

                                animationDelay:

                                    `${particle.delay}s`

                            }}

                        />

                    )

                )

            }

        </>

    );

}