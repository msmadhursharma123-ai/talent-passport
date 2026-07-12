import React from "react";

import {
  badgeStyle,
  studentBadge,
  teacherBadge,
  partnerBadge,
  adminBadge,
} from "./styles/badgeStyles";

interface UserRoleBadgeProps {
  role: string;
}

export default function UserRoleBadge({
  role,
}: UserRoleBadgeProps) {

  const styles = {

    Student: studentBadge,

    Teacher: teacherBadge,

    Partner: partnerBadge,

    "School Admin": adminBadge,

    "Platform Admin": adminBadge,

    "Foundation Admin": adminBadge,

  };

  return (

    <span
      style={{
        ...badgeStyle,
        ...(styles[role as keyof typeof styles] ??
          adminBadge),
      }}
    >
      {role}
    </span>

  );

}