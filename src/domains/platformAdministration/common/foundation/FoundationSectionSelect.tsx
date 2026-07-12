import FoundationSelect from "./FoundationSelect";

interface FoundationSectionSelectProps {

  value: string;

  onChange: (value: string) => void;

  required?: boolean;

  disabled?: boolean;

}

const sections = [

  { value: "A", label: "Section A" },
  { value: "B", label: "Section B" },
  { value: "C", label: "Section C" },
  { value: "D", label: "Section D" },

];

export default function FoundationSectionSelect({

  value,

  onChange,

  required,

  disabled = false,

}: FoundationSectionSelectProps) {

  return (

    <FoundationSelect

      label="Section"

      value={value}

      options={sections}

      placeholder="Select Section"

      required={required}

      disabled={disabled}

      onChange={onChange}

    />

  );

}