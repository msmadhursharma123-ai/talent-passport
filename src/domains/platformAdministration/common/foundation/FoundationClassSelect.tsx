import FoundationSelect from "./FoundationSelect";

interface FoundationClassSelectProps {

  value: string;

  onChange: (value: string) => void;

  required?: boolean;

}

const classes = [

  { value: "1", label: "Class 1" },
  { value: "2", label: "Class 2" },
  { value: "3", label: "Class 3" },
  { value: "4", label: "Class 4" },
  { value: "5", label: "Class 5" },
  { value: "6", label: "Class 6" },
  { value: "7", label: "Class 7" },
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10" },
  { value: "11", label: "Class 11" },
  { value: "12", label: "Class 12" },

];

export default function FoundationClassSelect({

  value,

  onChange,

  required,

}: FoundationClassSelectProps) {

  return (

    <FoundationSelect

      label="Class"

      value={value}

      options={classes}

      placeholder="Select Class"

      required={required}

      onChange={onChange}

    />

  );

}