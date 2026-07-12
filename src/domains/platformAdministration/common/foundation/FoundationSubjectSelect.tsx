import FoundationSelect from "./FoundationSelect";

interface FoundationSubjectSelectProps {

  value: string;

  onChange: (value: string) => void;

  required?: boolean;

  disabled?: boolean;

}

const subjects = [

  { value: "english", label: "English" },
  { value: "mathematics", label: "Mathematics" },
  { value: "science", label: "Science" },
  { value: "social-science", label: "Social Science" },
  { value: "computer-science", label: "Computer Science" },
  { value: "hindi", label: "Hindi" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "commerce", label: "Commerce" },

];

export default function FoundationSubjectSelect({

  value,

  onChange,

  required,

  disabled = false,

}: FoundationSubjectSelectProps) {

  return (

    <FoundationSelect

      label="Subject"

      value={value}

      options={subjects}

      placeholder="Select Subject"

      required={required}

      disabled={disabled}

      onChange={onChange}

    />

  );

}