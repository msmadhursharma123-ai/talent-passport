import FoundationSelect from "./FoundationSelect";

interface FoundationRoleSelectProps {

  value: string;

  onChange: (value: string) => void;

  required?: boolean;

  disabled?: boolean;

}

const roles = [

  {
    value: "student",
    label: "Student",
  },

  {
    value: "teacher",
    label: "Teacher",
  },

  {
    value: "school-admin",
    label: "School Admin",
  },

  {
    value: "partner",
    label: "Partner",
  },

  {
    value: "parent",
    label: "Parent",
  },

  {
    value: "platform-admin",
    label: "Platform Administrator",
  },

];

export default function FoundationRoleSelect({

  value,

  onChange,

  required,

  disabled = false,

}: FoundationRoleSelectProps) {

  return (

    <FoundationSelect

      label="Role"

      value={value}

      options={roles}

      placeholder="Select Role"

      required={required}

      disabled={disabled}

      onChange={onChange}

    />

  );

}