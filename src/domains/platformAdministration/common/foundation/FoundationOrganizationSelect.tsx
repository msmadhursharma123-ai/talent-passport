import FoundationSelect from "./FoundationSelect";

interface FoundationOrganizationSelectProps {

  value: string;

  onChange: (value: string) => void;

  required?: boolean;
disabled?: boolean;

}

const organizations = [

  {
    value: "abc-public-school",
    label: "ABC Public School",
  },

  {
    value: "xyz-public-school",
    label: "XYZ Public School",
  },

  {
    value: "talent-foundation",
    label: "Talent Foundation",
  },

];

export default function FoundationOrganizationSelect({

  value,

  onChange,

  required,

  disabled = false,

}: FoundationOrganizationSelectProps) {

  return (

    <FoundationSelect

      label="Organization"

      value={value}

      options={organizations}

      placeholder="Select Organization"

      required={required}

      disabled={disabled}

      onChange={onChange}

    />

  );

}