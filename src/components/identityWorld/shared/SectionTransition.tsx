export default function SectionTransition() {

    const isMobile =
        typeof window !== "undefined" &&
        window.innerWidth <= 768;

    const isTablet =
        typeof window !== "undefined" &&
        window.innerWidth > 768 &&
        window.innerWidth <= 1024;

    return (

        <div

            style={{

                position: "relative",

                height: isMobile
                    ? 80
                    : isTablet
                    ? 110
                    : 150,

                marginTop: isMobile
                    ? -18
                    : isTablet
                    ? -28
                    : -40,

                marginBottom: isMobile
                    ? -18
                    : isTablet
                    ? -28
                    : -40,

                overflow: "hidden",

                pointerEvents: "none",

                zIndex: 1

            }}

        >

            {/* GOLD GLOW */}

            <div

                style={{

                    position: "absolute",

                    left: "50%",

                    top: isMobile ? -60 : -120,

                    transform: "translateX(-50%)",

                    width: isMobile
                        ? 360
                        : isTablet
                        ? 540
                        : 760,

                    height: isMobile
                        ? 180
                        : isTablet
                        ? 250
                        : 340,

                    borderRadius: "50%",

                    background:
                        "radial-gradient(circle, rgba(197,137,26,.10) 0%, rgba(197,137,26,.05) 45%, transparent 100%)",

                    filter: `blur(${isMobile ? 35 : 60}px)`

                }}

            />

            {/* NAVY GLOW */}

            <div

                style={{

                    position: "absolute",

                    left: "50%",

                    top: isMobile ? -10 : -40,

                    transform: "translateX(-50%)",

                    width: isMobile
                        ? 250
                        : isTablet
                        ? 360
                        : 520,

                    height: isMobile
                        ? 110
                        : isTablet
                        ? 160
                        : 220,

                    borderRadius: "50%",

                    background:
                        "radial-gradient(circle, rgba(23,63,122,.05) 0%, transparent 80%)",

                    filter: `blur(${isMobile ? 30 : 55}px)`

                }}

            />

            {/* GOLD LINE */}

            <div

                style={{

                    position: "absolute",

                    left: "50%",

                    top: isMobile ? 6 : 10,

                    transform: "translateX(-50%)",

                    width: 2,

                    height: isMobile ? "55%" : "70%",

                    borderRadius: 999,

                    background:
                        "linear-gradient(180deg, transparent, rgba(197,137,26,.35), transparent)"

                }}

            />

            {/* HORIZONTAL DIVIDER */}

            <div

                style={{

                    position: "absolute",

                    bottom: isMobile ? 8 : 16,

                    left: "50%",

                    transform: "translateX(-50%)",

                    width: isMobile
                        ? "92%"
                        : isTablet
                        ? "84%"
                        : "72%",

                    height: 1,

                    background:
                        "linear-gradient(90deg, transparent, rgba(23,63,122,.08), transparent)"

                }}

            />

        </div>

    );

}