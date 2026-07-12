import React from "react";

import {
  badgeStyle,
  activeBadge,
  pendingBadge,
  suspendedBadge,
  archivedBadge,
} from "./styles/badgeStyles";

interface UserStatusBadgeProps {
  status: string;
}

export default function UserStatusBadge({
  status,
}: UserStatusBadgeProps) {

  const styles = {

    Active: activeBadge,

    Pending: pendingBadge,

    Suspended: suspendedBadge,

    Archived: archivedBadge,

  };

  return (

    <span
      style={{
        ...badgeStyle,
        ...(styles[status as keyof typeof styles] ??
          archivedBadge),
      }}
    >
      {status}
    </span>

  );

}