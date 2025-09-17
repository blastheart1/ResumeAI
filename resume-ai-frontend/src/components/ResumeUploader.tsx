import React, { useRef } from "react";
import { Button } from "../components/ui/button";
import { useDropzone } from "react-dropzone";

interface ResumeUploaderProps {
  file: File | null;
  setFile: (file: File | null) => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ file, setFile }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`w-full border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer
        ${isDragActive ? "border-blue-500 bg-blue-50 dark:bg-gray-800" : "border-gray-300 dark:border-gray-600"}
      `}
    >
      <input {...getInputProps()} />
      <p className="text-center text-gray-700 dark:text-gray-300 mb-2">
        {file ? file.name : "Drag & drop your resume here or click to upload"}
      </p>
      <Button>{file ? "Change Resume" : "Upload Resume"}</Button>
    </div>
  );
};

export default ResumeUploader;
