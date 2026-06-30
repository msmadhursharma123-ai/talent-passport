import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./buttons.css";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {

    children: ReactNode;

    fullWidth?: boolean;

    large?: boolean;

}

export default function PrimaryButton({

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
                tp-button-primary
                ${large ? "tp-button-large" : ""}
                ${fullWidth ? "tp-button-full" : ""}
                ${className}
            `}
        >

            {children}

        </button>

    );

}