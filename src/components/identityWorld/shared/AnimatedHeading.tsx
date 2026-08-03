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

                gap: 12,
                marginBottom: 34
            }}
        >

            {badge && (
                <div
                    style={{
                        ...GLASS.badge,

                        background: "#FFF8EA",
                        border: "1px solid rgba(198,140,31,.16)",

                        color: "#B68432",

                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 2,

                        textTransform: "uppercase",

                        padding: "7px 18px",
                        borderRadius: 999
                    }}
                >
                    {badge}
                </div>
            )}

            <h2
                style={{
                    margin: 0,

                    maxWidth,

                    color: "#173F7A",

                    fontSize: "clamp(2rem,4vw,3.5rem)",

                    lineHeight: 1.05,

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

                        color: "#667085",

                        fontSize: "clamp(.95rem,1.3vw,1.1rem)",

                        lineHeight: 1.75,

                        fontWeight: 400
                    }}
                >
                    {subtitle}
                </p>
            )}

        </div>
    );
}