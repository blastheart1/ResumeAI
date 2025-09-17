import React from "react";
import { Textarea } from "../components/ui/textarea";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ value, onChange }) => {
  return (
    <div className="mb-4 w-full">
  <Textarea
    placeholder="Paste the job description here..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full border border-gray-300 dark:border-gray-600"
    rows={5}
  />
</div>

  );
};

export default JobDescriptionInput;
