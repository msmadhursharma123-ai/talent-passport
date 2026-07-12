import React from "react";

interface UserAvatarPickerProps {

  imageUrl?: string;

  disabled?: boolean;

  onSelect?: (
    file: File | null,
  ) => void;

}

export default function UserAvatarPicker({

  imageUrl,

  disabled = false,

  onSelect,

}: UserAvatarPickerProps) {

  return (

    <div style={containerStyle}>

      <div style={avatarStyle}>

        {imageUrl ? (

          <img
            src={imageUrl}
            alt="Avatar"
            style={imageStyle}
          />

        ) : (

          <span style={placeholderStyle}>
            👤
          </span>

        )}

      </div>

      <input

        type="file"

        accept="image/*"

        disabled={disabled}

        onChange={(event) =>
          onSelect?.(
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

  gap: 12,

  alignItems: "center",

};

const avatarStyle: React.CSSProperties = {

  width: 120,

  height: 120,

  borderRadius: "50%",

  overflow: "hidden",

  border: "2px solid #CBD5E1",

  display: "flex",

  justifyContent: "center",

  alignItems: "center",

  background: "#F8FAFC",

};

const imageStyle: React.CSSProperties = {

  width: "100%",

  height: "100%",

  objectFit: "cover",

};

const placeholderStyle: React.CSSProperties = {

  fontSize: 42,

};