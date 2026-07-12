import React from "react";

import {
  counterStyle,
} from "./styles/fieldStyles";

interface CharacterCounterProps {

  current: number;

  maximum: number;

}

export default function CharacterCounter({
  current,
  maximum,
}: CharacterCounterProps) {

  return (

    <div style={counterStyle}>

      {current} / {maximum}

    </div>

  );

}