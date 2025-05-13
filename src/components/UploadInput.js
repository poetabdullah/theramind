import React, { useRef } from "react";

export default function UploadInput({
    label,
    file,
    accept = "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    setFile,
}) {
    const inputId = `upload-input-${label.replace(/\s+/g, "-").toLowerCase()}`;
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
            // Reset the input value to allow the same file to be selected again
            e.target.value = '';
        }
    };

    const handleUploadClick = () => {
        // Simply trigger the click on the file input element
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="flex flex-col space-y-2 bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor={inputId} className="font-medium text-gray-700">
                {label}
            </label>
            <div
                className="relative flex items-center justify-center h-32 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                onClick={handleUploadClick}
            >
                <input
                    id={inputId}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                />
                <div className="text-center text-gray-500 w-full px-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mx-auto mb-1"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="text-sm text-gray-600">Click or drag file here</p>
                    <p className="text-xs text-gray-400 mt-1">Supported: images, PDF, DOC</p>
                </div>
            </div>
            {file && (
                <p className="mt-2 text-sm text-gray-800 truncate">
                    Selected: <span className="font-medium">{file.name}</span>
                </p>
            )}
        </div>
    );
}