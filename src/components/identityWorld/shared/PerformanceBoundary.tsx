import { memo } from "react";
import type { ReactNode } from "react";

type Props={

    children:ReactNode;

};

function PerformanceBoundary({

    children

}:Props){

    return<>{children}</>;

}

export default memo(PerformanceBoundary);