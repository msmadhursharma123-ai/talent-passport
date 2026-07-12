import React from "react";

interface SearchInputProps {

  value: string;

  placeholder?: string;

  onChange: (
    value: string,
  ) => void;

}

export default function SearchInput({

  value,

  placeholder = "Search...",

  onChange,

}: SearchInputProps) {

  return (

    <input

      value={value}

      placeholder={placeholder}

      onChange={(event) =>
        onChange(event.target.value)
      }

      style={inputStyle}

    />

  );

}

const inputStyle: React.CSSProperties = {

  width: "100%",

  height: 44,

  border: "1px solid #CBD5E1",

  borderRadius: 10,

  padding: "0 14px",

  fontSize: 14,

};