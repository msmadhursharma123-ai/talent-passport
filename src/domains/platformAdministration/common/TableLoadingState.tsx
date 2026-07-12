import React from "react";

export default function TableLoadingState() {

  return (

    <div style={containerStyle}>

      Loading data...

    </div>

  );

}

const containerStyle: React.CSSProperties = {

  padding: 40,

  textAlign: "center",

  color: "#64748B",

  fontWeight: 600,

};