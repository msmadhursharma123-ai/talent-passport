import type { Transition } from "framer-motion";

export const DURATIONS = {

    instant:0.15,

    fast:0.25,

    normal:0.5,

    reveal:0.9,

    slow:1.4,

    ambient:12

};

export const EASING = [

    0.22,

    1,

    0.36,

    1

] as const;

export const REVEAL_TRANSITION:Transition={

    duration:DURATIONS.reveal,

    ease:EASING

};

export const FAST_TRANSITION:Transition={

    duration:DURATIONS.fast,

    ease:EASING

};

export const AMBIENT_TRANSITION:Transition={

    duration:DURATIONS.ambient,

    repeat:Infinity,

    ease:"linear"

};