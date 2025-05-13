import React from "react";

export default function UploadInput({
    label,
    file,
    accept = "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    setFile,
}) {
    const inputId = `upload-input-${label.replace(/\s+/g, "-").toLowerCase()}`;

    const handleFileChange = (e) => {
        if (e.target.files?.[0]) setFile(e.target.files[0]);
    };

    return (
        <div className="flex flex-col space-y-2 bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor={inputId} className="font-medium text-gray-700">
                {label}
            </label>
            <div
                className="relative flex items-center justify-center h-32 border-2 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                onClick={() => document.getElementById(inputId).click()}
            >
                <input
                    id={inputId}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-center text-gray-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 mx-auto mb-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4 4m0 0l4-4m-4 4V4"
                        />
                    </svg>
                    <p className="text-sm">Click or drag file here</p>
                    <p className="text-xs text-gray-400">Supported: images, PDF, DOC</p>
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
