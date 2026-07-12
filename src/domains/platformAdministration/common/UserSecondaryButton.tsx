import React from "react";

import {
  secondaryButtonStyle,
} from "./styles/buttonStyles";

interface UserSecondaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export default function UserSecondaryButton({
  children,
  onClick,
  disabled = false,
}: UserSecondaryButtonProps) {

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...secondaryButtonStyle,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );

}