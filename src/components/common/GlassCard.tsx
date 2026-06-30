import type { CSSProperties, ReactNode } from "react";
import "./glassCard.css";

interface GlassCardProps {

    children: ReactNode;

    className?: string;

    padding?: "none" | "sm" | "md" | "lg";

    hover?: boolean;

    glow?: boolean;

    radius?: "sm" | "md" | "lg" | "xl";

    style?: CSSProperties;

}

export default function GlassCard({

    children,

    className = "",

    padding = "md",

    hover = true,

    glow = false,

    radius = "lg",

    style

}: GlassCardProps) {

    return (

        <div

            style={style}

            className={`
                glass-card
                glass-padding-${padding}
                glass-radius-${radius}
                ${hover ? "glass-hover" : ""}
                ${glow ? "glass-glow" : ""}
                ${className}
            `}
        >

            {children}

        </div>

    );

}