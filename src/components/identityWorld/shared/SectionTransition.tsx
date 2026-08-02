export default function SectionTransition() {

    return (

        <div

            style={{

                position: "relative",

                height: 150,

                marginTop: -40,

                marginBottom: -40,

                overflow: "hidden",

                pointerEvents: "none",

                zIndex: 1

            }}

        >

            {/* ============================================== */}
            {/* SOFT GOLD GLOW */}
            {/* ============================================== */}

            <div

                style={{

                    position: "absolute",

                    left: "50%",

                    top: -120,

                    transform: "translateX(-50%)",

                    width: 760,

                    height: 340,

                    borderRadius: "50%",

                    background:

                        "radial-gradient(circle, rgba(197,137,26,.10) 0%, rgba(197,137,26,.05) 45%, transparent 100%)",

                    filter: "blur(60px)"

                }}

            />

            {/* ============================================== */}
            {/* SOFT NAVY GLOW */}
            {/* ============================================== */}

            <div

                style={{

                    position: "absolute",

                    left: "50%",

                    top: -40,

                    transform: "translateX(-50%)",

                    width: 520,

                    height: 220,

                    borderRadius: "50%",

                    background:

                        "radial-gradient(circle, rgba(23,63,122,.05) 0%, transparent 80%)",

                    filter: "blur(55px)"

                }}

            />

            {/* ============================================== */}
            {/* THIN GOLD DIVIDER */}
            {/* ============================================== */}

            <div

                style={{

                    position: "absolute",

                    left: "50%",

                    top: 10,

                    transform: "translateX(-50%)",

                    width: 2,

                    height: "70%",

                    borderRadius: 999,

                    background:

                        "linear-gradient(180deg, transparent, rgba(197,137,26,.35), transparent)"

                }}

            />

            {/* ============================================== */}
            {/* SUBTLE DIVIDER LINE */}
            {/* ============================================== */}

            <div

                style={{

                    position: "absolute",

                    bottom: 16,

                    left: "50%",

                    transform: "translateX(-50%)",

                    width: "72%",

                    height: 1,

                    background:

                        "linear-gradient(90deg, transparent, rgba(23,63,122,.08), transparent)"

                }}

            />

        </div>

    );

}