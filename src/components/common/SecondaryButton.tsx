import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./buttons.css";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {

    children: ReactNode;

    fullWidth?: boolean;

    large?: boolean;

}

export default function SecondaryButton({

    children,

    fullWidth = false,

    large = false,

    className = "",

    ...props

}: Props) {

    return (

        <button

            {...props}

            className={`
                tp-button
                tp-button-secondary
                ${large ? "tp-button-large" : ""}
                ${fullWidth ? "tp-button-full" : ""}
                ${className}
            `}
        >

            {children}

        </button>

    );

}