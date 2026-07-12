import React from "react";

import {
  errorStyle,
} from "./styles/fieldStyles";

interface ValidationMessageProps {
  message?: string;
}

export default function ValidationMessage({
  message,
}: ValidationMessageProps) {

  if (!message) {
    return null;
  }

  return (

    <div style={errorStyle}>
      {message}
    </div>

  );

}