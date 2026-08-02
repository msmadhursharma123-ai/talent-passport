import { useEffect, useState } from "react";

export function useBreakpoint(){

    const getWidth=()=>

        typeof window==="undefined"

            ? 1440

            : window.innerWidth;

    const [width,setWidth]=useState(getWidth);

    useEffect(()=>{

        const resize=()=>setWidth(getWidth());

        window.addEventListener("resize",resize);

        return()=>window.removeEventListener("resize",resize);

    },[]);

    return{

        width,

        mobile:width<768,

        tablet:width>=768&&width<1024,

        laptop:width>=1024&&width<1440,

        desktop:width>=1440

    };

}