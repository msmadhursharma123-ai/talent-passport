import React from "react";
import { BookOpen } from "lucide-react";
import "./userManualBookmark.css";

interface Props { onClick: () => void; }

export default function UserManualBookmark({ onClick }: Props) {
  return (
    <button
      type="button"
      className="tp-user-manual-bookmark"
      onClick={onClick}
      aria-label="Open Talent Passport User Manual"
    >
      <span className="tp-user-manual-bookmark-icon" aria-hidden="true"><BookOpen size={14} /></span>
      <span>User Manual</span>
    </button>
  );
}
