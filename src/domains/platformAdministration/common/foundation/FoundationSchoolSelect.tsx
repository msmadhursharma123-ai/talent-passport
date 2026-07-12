import FoundationSelect from "./FoundationSelect";

interface FoundationSchoolSelectProps {

  value: string;

  onChange: (value: string) => void;

  required?: boolean;
disabled?: boolean;

}

const schools = [

  {
    value: "abc-school",
    label: "ABC Public School",
  },

  {
    value: "delhi-school",
    label: "Delhi Public School",
  },

  {
    value: "modern-school",
    label: "Modern School",
  },

];

export default function FoundationSchoolSelect({

  value,

  onChange,

  required,

  disabled = false,

}: FoundationSchoolSelectProps) {

  return (

    <FoundationSelect

      label="School"

      value={value}

      options={schools}

      placeholder="Select School"

      required={required}

      disabled={disabled}

      onChange={onChange}

    />

  );

}