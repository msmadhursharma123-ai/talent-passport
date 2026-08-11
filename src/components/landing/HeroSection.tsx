import React from "react";
import HeroSlider from "./HeroSlider";
interface Props { onContinue?:()=>void; }
export default function HeroSection({onContinue=()=>{}}:Props){ return <HeroSlider onContinue={onContinue}/>; }
