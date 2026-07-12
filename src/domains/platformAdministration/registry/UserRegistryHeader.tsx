import React from "react";
import UserPrimaryButton
from "../common/UserPrimaryButton";

interface UserRegistryHeaderProps {

  title: string;

  subtitle: string;

  onCreateUser: () => void;

}

export default function UserRegistryHeader({

  title,

  subtitle,

  onCreateUser,

}: UserRegistryHeaderProps) {

  return (

    <div style={headerStyle}>

      <div style={leftSectionStyle}>

        <h1 style={titleStyle}>

          {title}

        </h1>

        <p style={subtitleStyle}>

          {subtitle}

        </p>

      </div>
      <div style={rightSectionStyle}>

        <UserPrimaryButton

          onClick={onCreateUser}

        >

          + Create User

        </UserPrimaryButton>

      </div>

    </div>

      );

}

const headerStyle: React.CSSProperties = {

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  marginBottom: 24,

  gap: 20,

};

const leftSectionStyle: React.CSSProperties = {

  display: "flex",

  flexDirection: "column",

  gap: 6,

};

const rightSectionStyle: React.CSSProperties = {

  display: "flex",

  alignItems: "center",

  gap: 12,

};

const titleStyle: React.CSSProperties = {

  margin: 0,

  fontSize: 28,

  fontWeight: 700,

  color: "#0F172A",

};

const subtitleStyle: React.CSSProperties = {

  margin: 0,

  fontSize: 14,

  color: "#64748B",

};