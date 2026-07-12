import React from "react";

interface UserImageUploadProps {

  label: string;

  onChange?: (
    file: File | null,
  ) => void;

}

export default function UserImageUpload({

  label,

  onChange,

}: UserImageUploadProps) {

  return (

    <div style={containerStyle}>

      <label style={labelStyle}>
        {label}
      </label>

      <input

        type="file"

        accept="image/*"

        onChange={(event) =>
          onChange?.(
            event.target.files?.[0] ?? null,
          )
        }

      />

    </div>

  );

}

const containerStyle: React.CSSProperties = {

  display: "flex",

  flexDirection: "column",

  gap: 8,

};

const labelStyle: React.CSSProperties = {

  fontWeight: 600,

  color: "#143B73",

};