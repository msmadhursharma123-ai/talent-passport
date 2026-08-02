import { useEffect, useMemo, useState } from "react";

export type StorySection = {

    id:string;

    label:string;

};

export const STORY_SECTIONS:StorySection[]=[

    { id:"hero", label:"Vision" },

    { id:"education", label:"Education" },

    { id:"ecosystem", label:"Ecosystem" },

    { id:"journey", label:"Journey" },

    { id:"academic", label:"Intelligence" },

    { id:"portfolio", label:"Identity" },

    { id:"competitions", label:"Competitions" },

    { id:"marketplace", label:"Marketplace" },

    { id:"partners", label:"Partners" },

    { id:"schools", label:"Schools" },

    { id:"final", label:"Future" }

];

export default function useActiveSection(){

    const [active,setActive]=useState("hero");

    const [progress,setProgress]=useState(0);

    useEffect(()=>{

        const update=()=>{

            let current="hero";

            STORY_SECTIONS.forEach(section=>{

                const element=document.getElementById(section.id);

                if(!element) return;

                const rect=element.getBoundingClientRect();

                if(rect.top<=window.innerHeight*0.35){

                    current=section.id;

                }

            });

            setActive(current);

            const scrollTop=window.scrollY;

            const max=document.body.scrollHeight-window.innerHeight;

            const value=max>0 ? scrollTop/max : 0;

            setProgress(value);

        };

        update();

        window.addEventListener(

            "scroll",

            update,

            { passive:true }

        );

        window.addEventListener(

            "resize",

            update

        );

        return()=>{

            window.removeEventListener(

                "scroll",

                update

            );

            window.removeEventListener(

                "resize",

                update

            );

        };

    },[]);

    const activeIndex=useMemo(

        ()=>STORY_SECTIONS.findIndex(

            s=>s.id===active

        ),

        [active]

    );

    return{

        sections:STORY_SECTIONS,

        active,

        activeIndex,

        progress

    };

}