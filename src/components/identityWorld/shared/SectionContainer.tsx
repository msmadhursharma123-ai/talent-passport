import type {
    CSSProperties,
    PropsWithChildren,
} from "react";

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

    paddingY = 120,

}: SectionContainerProps) {

    const isMobile =
        typeof window !== "undefined" &&
        window.innerWidth <= 768;

    const isTablet =
        typeof window !== "undefined" &&
        window.innerWidth > 768 &&
        window.innerWidth <= 1024;

    const horizontalPadding =
        isMobile
            ? 14
            : isTablet
            ? 20
            : 24;

    const verticalPadding =
        isMobile
            ? Math.max(56, paddingY * 0.55)
            : isTablet
            ? Math.max(80, paddingY * 0.72)
            : paddingY;

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

                padding: `${verticalPadding}px ${horizontalPadding}px`,

                boxSizing: "border-box",

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

                    zIndex: 2,

                    boxSizing: "border-box",

                    minWidth: 0,

                }}

            >

                {children}

            </div>

        </section>

    );

}