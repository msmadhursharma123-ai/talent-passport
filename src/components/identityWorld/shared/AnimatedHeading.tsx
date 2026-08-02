import type { CSSProperties } from "react";

import COLORS from "../styles/colors";
import GLASS from "../styles/glass";

export interface AnimatedHeadingProps {

    badge?: string;

    title: string;

    subtitle?: string;

    align?: "left" | "center";

    maxWidth?: number;

}

export default function AnimatedHeading({

    badge,

    title,

    subtitle,

    align = "center",

    maxWidth = 760

}: AnimatedHeadingProps) {

    const textAlign = align;

    return (

        <div

            style={{

                width: "100%",

                textAlign,

                display: "flex",

                flexDirection: "column",

                alignItems:

                    align === "center"

                        ? "center"

                        : "flex-start",

                gap: 18,

                marginBottom: 56

            }}

        >

            {badge && (

                <div

                    style={{

                        ...GLASS.badge,

                        color: COLORS.accent,

                        fontSize: 13,

                        fontWeight: 700,

                        letterSpacing: 1,

                        textTransform: "uppercase"

                    }}

                >

                    {badge}

                </div>

            )}

            <h2

                style={{

                    margin: 0,

                    maxWidth,

                    color: COLORS.textPrimary,

                    fontSize: "clamp(2.5rem,5vw,4.6rem)",

                    lineHeight: 1.08,

                    fontWeight: 800,

                    letterSpacing: "-0.04em"

                }}

            >

                {title}

            </h2>

            {subtitle && (

                <p

                    style={{

                        margin: 0,

                        maxWidth,

                        color: COLORS.textSecondary,

                        fontSize: "clamp(1rem,2vw,1.3rem)",

                        lineHeight: 1.8,

                        fontWeight: 400

                    }}

                >

                    {subtitle}

                </p>

            )}

        </div>

    );

}