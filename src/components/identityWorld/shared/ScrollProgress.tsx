import DesktopProgress from "./DesktopProgress";
import MobileProgress from "./MobileProgress";

export default function ScrollProgress(){

    if(typeof window==="undefined"){

        return null;

    }

    const mobile=

        window.innerWidth<1024;

    return mobile

        ? <MobileProgress/>

        : <DesktopProgress/>;

}