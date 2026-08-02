import type {
    ButtonHTMLAttributes,
    CSSProperties,
    PropsWithChildren
} from "react";

import COLORS from "../styles/colors";
import GRADIENTS from "../styles/gradients";
import { TRANSITIONS } from "../styles/animations";

export interface GradientButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        PropsWithChildren {

    variant?:
        | "primary"
        | "secondary"
        | "success";

    fullWidth?: boolean;

}

export default function GradientButton({

    children,

    variant = "primary",

    fullWidth = false,

    style,

    ...props

}: GradientButtonProps) {

    const background =

        variant === "secondary"

            ? GRADIENTS.buttonSecondary

            : variant === "success"

            ? GRADIENTS.buttonSuccess

            : GRADIENTS.buttonPrimary;

    return (

        <button

            {...props}

            style={{

                background,

                color: COLORS.textPrimary,

                border: "none",

                outline: "none",

                borderRadius: 16,

                padding: "15px 28px",

                fontSize: 16,

                fontWeight: 700,

                letterSpacing: ".2px",

                cursor: "pointer",

                transition:
                    TRANSITIONS.hover,

                width:
                    fullWidth
                        ? "100%"
                        : undefined,

                boxShadow:

                    "0 14px 40px rgba(37,99,235,.35)",

                ...style

            }}

            onMouseEnter={(e) => {

                e.currentTarget.style.transform =
                    "translateY(-4px) scale(1.02)";

                e.currentTarget.style.boxShadow =
                    "0 25px 60px rgba(37,99,235,.45)";

            }}

            onMouseLeave={(e) => {

                e.currentTarget.style.transform =
                    "translateY(0px) scale(1)";

                e.currentTarget.style.boxShadow =
                    "0 14px 40px rgba(37,99,235,.35)";

            }}

        >

            {children}

        </button>

    );

}