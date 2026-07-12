import React from "react";

import {
  dangerButtonStyle,
} from "./styles/buttonStyles";

interface UserDangerButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export default function UserDangerButton({
  children,
  onClick,
  disabled = false,
}: UserDangerButtonProps) {

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...dangerButtonStyle,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );

}