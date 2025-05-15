import React, { useState, useEffect } from 'react';
import UploadInput from "./UploadInput";
import { uploadFile } from './fileUpload';

const ExperienceCard = ({ doctorData, setDoctorData, isEditing, setIsEditing, handleSave }) => {
    const [experiences, setExperiences] = useState(doctorData.experiences || []);
    const [resumeFile, setResumeFile] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setExperiences(doctorData.experiences || []);
        setResumeFile(null);
        setErrors({});
    }, [doctorData, isEditing]);

    const handleExperienceChange = (index, key, value) => {
        const updatedExperiences = [...experiences];
        if (!updatedExperiences[index]) {
            updatedExperiences[index] = {};
        }
        updatedExperiences[index] = { ...updatedExperiences[index], [key]: value };
        setExperiences(updatedExperiences);

        // Clear specific error when field is changed
        if (errors[`${index}-${key}`]) {
            const newErrors = { ...errors };
            delete newErrors[`${index}-${key}`];
            setErrors(newErrors);
        }
    };

    const validateExperiences = () => {
        const newErrors = {};

        // Validate each experience entry
        experiences.forEach((exp, index) => {
            // Skip empty experiences
            if (!exp.role && !exp.org && !exp.start && !exp.end) {
                return;
            }

            // Role validation (minimum 3 characters)
            if (!exp.role || exp.role.trim().length < 3) {
                newErrors[`${index}-role`] = "Role must be at least 3 characters";
            }

            // Organization validation (minimum 3 characters)
            if (!exp.org || exp.org.trim().length < 3) {
                newErrors[`${index}-org`] = "Organization must be at least 3 characters";
            }

            // Start date validation
            if (!exp.start) {
                newErrors[`${index}-start`] = "Start date is required";
            }

            // End date validation (must be after start date)
            if (exp.end && exp.start && exp.end < exp.start) {
                newErrors[`${index}-end`] = "End date must be after start date";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateExperiences()) return;

        let updatedExperiences = [...experiences];

        // Handle file upload if there's a new file
        if (resumeFile) {
            try {
                const resumeUrl = await uploadFile(`doctors/${doctorData.email}/resume`, resumeFile);
                // Attach resume URL to the first experience entry
                updatedExperiences[0] = { ...updatedExperiences[0], resume: resumeUrl };
            } catch (error) {
                console.error("Error uploading file:", error);
                setErrors({ ...errors, upload: "Failed to upload file. Please try again." });
                return;
            }
        }

        const updatedData = {
            ...doctorData,
            experiences: updatedExperiences
        };

        setDoctorData(updatedData);
        handleSave("experiences", updatedData);
        setIsEditing(false);
        setResumeFile(null);
    };

    // Ensure at least 2 experience slots exist
    const displayExperiences = [...experiences];
    while (displayExperiences.length < 2) {
        displayExperiences.push({});
    }

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Experience</h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all"
                    >
                        Edit
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>

            {displayExperiences.map((exp, index) => (
                <div
                    key={index}
                    className="mb-4 last:mb-0 p-4 border rounded-2xl bg-gray-50 shadow-sm"
                >
                    <h3 className="font-medium text-gray-800 mb-2">Experience {index + 1}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Role */}
                        <div>
                            <p className="text-gray-600 text-sm">Role/Title</p>
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        value={exp.role || ""}
                                        onChange={(e) => handleExperienceChange(index, "role", e.target.value)}
                                        className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-200 ${errors[`${index}-role`] ? "border-red-500" : ""
                                            }`}
                                        placeholder="e.g. Clinical Psychologist"
                                    />
                                    {errors[`${index}-role`] && (
                                        <p className="text-red-500 text-xs mt-1">{errors[`${index}-role`]}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-800">{exp.role || "-"}</p>
                            )}
                        </div>

                        {/* Organization */}
                        <div>
                            <p className="text-gray-600 text-sm">Organization/Hospital</p>
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        value={exp.org || ""}
                                        onChange={(e) => handleExperienceChange(index, "org", e.target.value)}
                                        className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-200 ${errors[`${index}-org`] ? "border-red-500" : ""
                                            }`}
                                        placeholder="e.g. General Hospital"
                                    />
                                    {errors[`${index}-org`] && (
                                        <p className="text-red-500 text-xs mt-1">{errors[`${index}-org`]}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-800">{exp.org || "-"}</p>
                            )}
                        </div>

                        {/* Start Date */}
                        <div>
                            <p className="text-gray-600 text-sm">Start Date</p>
                            {isEditing ? (
                                <>
                                    <input
                                        type="month"
                                        value={exp.start || ""}
                                        onChange={(e) => handleExperienceChange(index, "start", e.target.value)}
                                        className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-200 ${errors[`${index}-start`] ? "border-red-500" : ""
                                            }`}
                                    />
                                    {errors[`${index}-start`] && (
                                        <p className="text-red-500 text-xs mt-1">{errors[`${index}-start`]}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-800">{exp.start || "-"}</p>
                            )}
                        </div>

                        {/* End Date */}
                        <div>
                            <p className="text-gray-600 text-sm">End Date</p>
                            {isEditing ? (
                                <>
                                    <input
                                        type="month"
                                        value={exp.end || ""}
                                        onChange={(e) => handleExperienceChange(index, "end", e.target.value)}
                                        className={`w-full p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-indigo-200 ${errors[`${index}-end`] ? "border-red-500" : ""
                                            }`}
                                    />
                                    {errors[`${index}-end`] && (
                                        <p className="text-red-500 text-xs mt-1">{errors[`${index}-end`]}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-800">{exp.end || "Present"}</p>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Resume Upload */}
            {isEditing && (
                <div className="mt-6">
                    <UploadInput
                        label="Upload Resume/CV (PDF/DOC)"
                        file={resumeFile || (experiences[0]?.resume ? { name: "Current Resume" } : null)}
                        setFile={setResumeFile}
                        accept=".pdf,.doc,.docx"
                    />
                </div>
            )}

            {/* Upload Error */}
            {errors.upload && (
                <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md">
                    {errors.upload}
                </div>
            )}
        </div>
    );
};

export default ExperienceCard;
