import type {
    CSSProperties
} from "react";

import GlassCard from "./GlassCard";
import COLORS from "../styles/colors";

export interface StatCardProps {

    icon?: string;

    value: string;

    label: string;

    description?: string;

    color?: string;

    style?: CSSProperties;

}

export default function StatCard({

    icon,

    value,

    label,

    description,

    color = COLORS.primaryLight,

    style

}: StatCardProps) {

    return (

        <GlassCard

            style={{

                display: "flex",

                flexDirection: "column",

                gap: 14,

                minHeight: 210,

                ...style

            }}

        >

            {icon && (

                <div

                    style={{

                        width: 64,

                        height: 64,

                        borderRadius: 20,

                        background: `${color}22`,

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        fontSize: 30

                    }}

                >

                    {icon}

                </div>

            )}

            <div

                style={{

                    fontSize: 42,

                    fontWeight: 800,

                    color

                }}

            >

                {value}

            </div>

            <div

                style={{

                    fontSize: 22,

                    fontWeight: 700,

                    color: COLORS.textPrimary,

                    lineHeight: 1.3

                }}

            >

                {label}

            </div>

            {description && (

                <div

                    style={{

                        color: COLORS.textSecondary,

                        fontSize: 15,

                        lineHeight: 1.7,

                        marginTop: "auto"

                    }}

                >

                    {description}

                </div>

            )}

        </GlassCard>

    );

}