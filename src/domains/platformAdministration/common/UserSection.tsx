import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

export default function UserSection({
  title,
  children,
}: Props) {

  return (

    <section style={sectionStyle}>

      <h3 style={titleStyle}>
        {title}
      </h3>

      {children}

    </section>

  );

}

const sectionStyle: React.CSSProperties = {
  marginBottom: 36,
};

const titleStyle: React.CSSProperties = {
  marginBottom: 20,
  color: "#143B73",
  fontSize: 20,
};