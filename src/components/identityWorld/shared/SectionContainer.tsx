import type {
    CSSProperties,
    PropsWithChildren
} from "react";

import COLORS from "../styles/colors";

export interface SectionContainerProps
    extends PropsWithChildren {

    id?: string;

    background?: string;

    style?: CSSProperties;

    fullWidth?: boolean;

    maxWidth?: number;

    paddingY?: number;

}

export default function SectionContainer({

    id,

    children,

    background,

    style,

    fullWidth = false,

    maxWidth = 1280,

    paddingY = 120

}: SectionContainerProps) {

    return (

        <section

            id={id}

            style={{

                width: "100%",

                position: "relative",

                overflow: "hidden",

                background:

                    background ??

                    "transparent",

                padding:

                    `${paddingY}px 24px`,

                ...style

            }}

        >

            <div

                style={{

                    width: "100%",

                    maxWidth:

                        fullWidth

                            ? undefined

                            : maxWidth,

                    margin: "0 auto",

                    position: "relative",

                    zIndex: 2

                }}

            >

                {children}

            </div>

        </section>

    );

}