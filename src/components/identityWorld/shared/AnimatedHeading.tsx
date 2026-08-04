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
    maxWidth = 760,
}: AnimatedHeadingProps) {

    const isMobile =
        typeof window !== "undefined" &&
        window.innerWidth <= 768;

    const isTablet =
        typeof window !== "undefined" &&
        window.innerWidth > 768 &&
        window.innerWidth <= 1024;

    const headingWidth = isMobile
        ? "100%"
        : isTablet
        ? "92%"
        : maxWidth;

    return (
        <div
            style={{
                width: "100%",
                textAlign: align,
                display: "flex",
                flexDirection: "column",
                alignItems:
                    align === "center"
                        ? "center"
                        : "flex-start",
                gap: isMobile ? 12 : 14,
                marginBottom: isMobile ? 18 : 34,
                paddingInline: isMobile ? 8 : 0,
                boxSizing: "border-box",
            }}
        >
            {badge && (
                <div
                    style={{
                        ...GLASS.badge,
                        background: "#FFF8EA",
                        border:
                            "1px solid rgba(198,140,31,.16)",
                        color: "#B68432",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: isMobile ? 1.2 : 2,
                        fontSize: isMobile
                            ? 10
                            : isTablet
                            ? 11
                            : 11,
                        padding: isMobile
                            ? "8px 18px"
                            : "8px 20px",
                        borderRadius: 999,
                        maxWidth: "100%",
                    }}
                >
                    {badge}
                </div>
            )}
<h2
    style={{
        margin:0,
        width:"100%",
        maxWidth:maxWidth,
        color:"#173F7A",
        fontWeight:900,
        textAlign:"center",
        letterSpacing:"-0.04em",
        fontSize:"clamp(2rem,4vw,3.5rem)",
        lineHeight:1.05,
        whiteSpace:"normal",
        wordBreak:"keep-all",
        overflowWrap:"normal",
        marginInline:"auto",
    }}
>
                {title}
            </h2>

            {subtitle && (
             <p
    style={{
        margin:0,
        width:headingWidth,
        maxWidth:headingWidth,
        color:"#667085",
        fontWeight:400,
        lineHeight:1.65,
        fontSize:"clamp(.95rem,1.3vw,1.1rem)",
    }}
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}