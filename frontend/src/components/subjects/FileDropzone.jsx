import React, { useState, useRef } from "react";

export function FileDropzone({ onFilesAdded }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesAdded(filesArray);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesAdded(filesArray);
      // Clear input value so same file can be uploaded again if needed
      e.target.value = null;
    }
  };

  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      style={{
        backgroundColor: isDragActive ? "rgba(201, 132, 42, 0.05)" : "transparent"
      }}
      className={`border-2 border-dashed p-8 rounded text-center cursor-pointer transition-all duration-200 select-none ${
        isDragActive
          ? "border-solid border-[var(--accent)]"
          : "border-[var(--border)] hover:border-[var(--accent)]"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.md,.csv,.json"
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center justify-center gap-1.5">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Accepted formats: .pdf, .txt, .md, .csv, .json
        </p>
      </div>
    </div>
  );
}

export default FileDropzone;
