import React from "react";

import UserPrimaryButton
from "../common/UserPrimaryButton";

import UserTextField
from "../common/UserTextField";

interface UserRegistryToolbarProps {

  search: string;

  onSearchChange: (

    value: string,

  ) => void;

  onCreateUser: () => void;

}

export default function UserRegistryToolbar({

  search,

  onSearchChange,

  onCreateUser,

}: UserRegistryToolbarProps) {

  return (

    <div style={toolbarStyle}>

      <div style={leftSectionStyle}>

        <UserTextField

          label=""

          placeholder="Search users..."

          value={search}

          onChange={(e) =>

            onSearchChange(

              e.target.value,

            )

          }

        />

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

const toolbarStyle: React.CSSProperties = {

  display: "flex",

  justifyContent: "space-between",

  alignItems: "center",

  gap: 16,

  marginBottom: 20,

};

const leftSectionStyle: React.CSSProperties = {

  flex: 1,

};

const rightSectionStyle: React.CSSProperties = {

  display: "flex",

  alignItems: "center",

  gap: 12,

};