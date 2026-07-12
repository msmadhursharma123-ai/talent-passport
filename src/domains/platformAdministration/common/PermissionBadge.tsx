import React from "react";

import {
  badgeStyle,
} from "./styles/badgeStyles";

interface PermissionBadgeProps {
  permission: string;
}

export default function PermissionBadge({
  permission,
}: PermissionBadgeProps) {

  return (

    <span
      style={{
        ...badgeStyle,
        background: "#EEF2FF",
        color: "#4338CA",
      }}
    >
      {permission}
    </span>

  );

}