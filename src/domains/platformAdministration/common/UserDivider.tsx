import React from "react";

export default function UserDivider() {

  return (
    <div style={dividerStyle} />
  );

}

const dividerStyle: React.CSSProperties = {

  width: "100%",

  height: 1,

  background: "#E2E8F0",

  margin: "8px 0",

};