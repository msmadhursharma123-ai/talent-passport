import type {
    CSSProperties,
    PropsWithChildren
} from "react";

import COLORS from "../styles/colors";
import GLASS from "../styles/glass";

export interface GlassBadgeProps
    extends PropsWithChildren {

    color?: string;

    background?: string;

    style?: CSSProperties;

    size?: "small" | "medium" | "large";

}

export default function GlassBadge({

    children,

    color = COLORS.textPrimary,

    background = "rgba(255,255,255,.12)",

    size = "medium",

    style

}: GlassBadgeProps) {

    const padding =

        size === "small"

            ? "6px 14px"

            : size === "large"

            ? "12px 24px"

            : "8px 18px";

    const fontSize =

        size === "small"

            ? 12

            : size === "large"

            ? 15

            : 13;

    return (

        <span

            style={{

                ...GLASS.badge,

                background,

                color,

                padding,

                fontSize,

                fontWeight: 700,

                letterSpacing: ".5px",

                display: "inline-flex",

                alignItems: "center",

                justifyContent: "center",

                whiteSpace: "nowrap",

                userSelect: "none",

                ...style

            }}

        >

            {children}

        </span>

    );

}