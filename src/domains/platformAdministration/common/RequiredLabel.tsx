import React from "react";

import {
  labelStyle,
} from "./styles/fieldStyles";

interface RequiredLabelProps {
  children: React.ReactNode;
}

export default function RequiredLabel({
  children,
}: RequiredLabelProps) {

  return (

    <label style={labelStyle}>

      {children}

      <span
        style={{
          color: "#DC2626",
          marginLeft: 4,
        }}
      >
        *
      </span>

    </label>

  );

}