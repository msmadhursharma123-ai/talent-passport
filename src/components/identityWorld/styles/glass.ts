/**
 * ============================================================
 * Identity World V2
 * Premium Glassmorphism Design Tokens
 * ============================================================
 */

import COLORS from "./colors";

export const GLASS = {

    /* --------------------------------------------------------
       Main Glass Card
    -------------------------------------------------------- */

    card: {

        background: "rgba(255,255,255,0.08)",

        backdropFilter: "blur(24px)",

        WebkitBackdropFilter: "blur(24px)",

        border: `1px solid ${COLORS.glassBorder}`,

        borderRadius: 28,

        boxShadow: COLORS.shadow

    },

    /* --------------------------------------------------------
       Strong Glass
    -------------------------------------------------------- */

    strong: {

        background: "rgba(255,255,255,0.14)",

        backdropFilter: "blur(32px)",

        WebkitBackdropFilter: "blur(32px)",

        border: `1px solid ${COLORS.glassBorder}`,

        borderRadius: 28,

        boxShadow: COLORS.glowBlue

    },

    /* --------------------------------------------------------
       Hero Glass
    -------------------------------------------------------- */

    hero: {

        background:

            "linear-gradient(135deg,rgba(255,255,255,.14),rgba(255,255,255,.04))",

        backdropFilter: "blur(32px)",

        WebkitBackdropFilter: "blur(32px)",

        border: "1px solid rgba(255,255,255,.18)",

        borderRadius: 36,

        boxShadow:

            "0 35px 80px rgba(0,0,0,.30)"

    },

    /* --------------------------------------------------------
       Floating Card
    -------------------------------------------------------- */

    floating: {

        background:

            "rgba(255,255,255,.10)",

        backdropFilter: "blur(20px)",

        WebkitBackdropFilter: "blur(20px)",

        border: "1px solid rgba(255,255,255,.15)",

        borderRadius: 22,

        boxShadow:

            "0 15px 40px rgba(0,0,0,.22)"

    },

    /* --------------------------------------------------------
       Badge
    -------------------------------------------------------- */

    badge: {

        background:

            "rgba(255,255,255,.14)",

        backdropFilter: "blur(16px)",

        WebkitBackdropFilter: "blur(16px)",

        border: "1px solid rgba(255,255,255,.18)",

        borderRadius: 999,

        padding: "8px 18px"

    },

    /* --------------------------------------------------------
       Input
    -------------------------------------------------------- */

    input: {

        background:

            "rgba(255,255,255,.08)",

        backdropFilter: "blur(16px)",

        WebkitBackdropFilter: "blur(16px)",

        border: "1px solid rgba(255,255,255,.14)",

        borderRadius: 16

    },

    /* --------------------------------------------------------
       Hover Effects
    -------------------------------------------------------- */

    hover: {

        transform: "translateY(-8px)",

        transition:

            "all .35s cubic-bezier(.4,0,.2,1)",

        boxShadow:

            "0 35px 80px rgba(0,0,0,.35)"

    },

    hoverSoft: {

        transform: "translateY(-4px)",

        transition:

            "all .30s ease"

    }

} as const;

export default GLASS;