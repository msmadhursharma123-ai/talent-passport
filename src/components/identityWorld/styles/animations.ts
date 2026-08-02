/**
 * ============================================================
 * Identity World V2
 * Premium Animation Library
 * ============================================================
 */

import type { CSSProperties } from "react";

export const DURATIONS = {

    fast: ".25s",

    normal: ".40s",

    slow: ".75s",

    cinematic: "1.2s"

} as const;

export const EASING = {

    smooth:

        "cubic-bezier(.4,0,.2,1)",

    premium:

        "cubic-bezier(.22,1,.36,1)",

    bounce:

        "cubic-bezier(.34,1.56,.64,1)"

} as const;

export const TRANSITIONS = {

    default:

        `all ${DURATIONS.normal} ${EASING.smooth}`,

    hover:

        `all ${DURATIONS.fast} ${EASING.premium}`,

    cinematic:

        `all ${DURATIONS.cinematic} ${EASING.premium}`

} as const;

/* ============================================================
   PRESET STYLES
============================================================ */

export const ANIMATIONS = {

    fadeUp: {

        opacity: 0,

        transform: "translateY(40px)",

        transition: TRANSITIONS.cinematic

    } satisfies CSSProperties,

    fadeDown: {

        opacity: 0,

        transform: "translateY(-40px)",

        transition: TRANSITIONS.cinematic

    } satisfies CSSProperties,

    fadeLeft: {

        opacity: 0,

        transform: "translateX(-40px)",

        transition: TRANSITIONS.cinematic

    } satisfies CSSProperties,

    fadeRight: {

        opacity: 0,

        transform: "translateX(40px)",

        transition: TRANSITIONS.cinematic

    } satisfies CSSProperties,

    visible: {

        opacity: 1,

        transform: "translate(0,0)"

    } satisfies CSSProperties,

    hoverLift: {

        transition: TRANSITIONS.hover,

        cursor: "pointer"

    } satisfies CSSProperties,

    floating: {

        animation:

            "identityFloat 8s ease-in-out infinite"

    } satisfies CSSProperties,

    floatingSlow: {

        animation:

            "identityFloatSlow 14s ease-in-out infinite"

    } satisfies CSSProperties,

    pulse: {

        animation:

            "identityPulse 3.5s ease-in-out infinite"

    } satisfies CSSProperties,

    glow: {

        animation:

            "identityGlow 5s ease-in-out infinite"

    } satisfies CSSProperties,

    rotate: {

        animation:

            "identityRotate 30s linear infinite"

    } satisfies CSSProperties,

    shimmer: {

        animation:

            "identityShimmer 5s linear infinite"

    } satisfies CSSProperties

} as const;

/* ============================================================
   KEYFRAMES
============================================================ */

export const KEYFRAMES = `

@keyframes identityFloat {

0%{transform:translateY(0px)}

50%{transform:translateY(-18px)}

100%{transform:translateY(0px)}

}

@keyframes identityFloatSlow {

0%{transform:translateY(0px)}

50%{transform:translateY(-30px)}

100%{transform:translateY(0px)}

}

@keyframes identityGlow {

0%{filter:brightness(1)}

50%{filter:brightness(1.15)}

100%{filter:brightness(1)}

}

@keyframes identityPulse {

0%{transform:scale(1)}

50%{transform:scale(1.03)}

100%{transform:scale(1)}

}

@keyframes identityRotate {

from{

transform:rotate(0deg)

}

to{

transform:rotate(360deg)

}

}

@keyframes identityShimmer{

0%{

background-position:-400px 0;

}

100%{

background-position:400px 0;

}

}

`;

export default ANIMATIONS;