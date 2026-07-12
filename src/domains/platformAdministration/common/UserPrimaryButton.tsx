import React from "react";

import {
  primaryButtonStyle,
} from "./styles/buttonStyles";

interface UserPrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}

export default function UserPrimaryButton({
  children,
  onClick,
  disabled = false,
  type = "button",
}: UserPrimaryButtonProps) {

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...primaryButtonStyle,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );

}