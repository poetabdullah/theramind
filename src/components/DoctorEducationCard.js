import React, { useState, useEffect } from 'react';
import UploadInput from "./UploadInput";
import { uploadFile } from './fileUpload';

const DoctorEducationCard = ({ doctorData, setDoctorData, isEditing, setIsEditing, handleSave }) => {
    const [education, setEducation] = useState(doctorData.education || []);
    const [proofFile, setProofFile] = useState(null);
    const [errors, setErrors] = useState({});

    const postgraduateDegrees = [
        "MA in Psychology", "MS in Psychology", "MA in Clinical Psychology", "MS in Clinical Psychology",
        "MA in Counseling Psychology", "MS in Counseling Psychology", "MA in Forensic Psychology", "MS in Forensic Psychology",
        "MA in Developmental Psychology", "MS in Developmental Psychology", "MA in Child Psychology", "MS in Child Psychology",
        "MA in Applied Psychology", "MS in Applied Psychology", "MA in Behavioral Science", "MS in Behavioral Science",
        "MA in Social Psychology", "MS in Social Psychology", "MSW", "MMFT", "PhD in Psychology", "PsyD", "EdD in Psychology",
        "Other"
    ];

    useEffect(() => {
        // Initialize education array if it doesn't exist or has insufficient items
        let eduData = doctorData.education || [];

        // Make sure we have at least two education entries (for undergrad and postgrad)
        while (eduData.length < 2) {
            eduData.push({});
        }

        setEducation(eduData);
        setProofFile(null);
        setErrors({});
    }, [doctorData, isEditing]);

    const handleEducationChange = (index, key, value) => {
        const updatedEducation = [...education];
        updatedEducation[index] = { ...updatedEducation[index], [key]: value };
        setEducation(updatedEducation);

        // Clear specific error when field is changed
        if (errors[`${index}-${key}`]) {
            const newErrors = { ...errors };
            delete newErrors[`${index}-${key}`];
            setErrors(newErrors);
        }
    };

    const validateEducation = () => {
        const newErrors = {};

        // Ensure we have the graduation info before validating post-graduation
        if (!education[0] || !education[0].gradDate) {
            return false;
        }

        // Institute validation
        if (!education[1].institute || education[1].institute.trim().length < 3) {
            newErrors["1-institute"] = "Institute name must be at least 3 characters";
        }

        // Degree validation
        if (!education[1].degree) {
            newErrors["1-degree"] = "Please select a degree";
        }

        // Date validation
        if (!education[1].gradDate) {
            newErrors["1-gradDate"] = "Please select a graduation date";
        } else {
            // Compare with undergrad date (must be at least 2 years later)
            const undergradDate = new Date(education[0].gradDate);
            const postgradDate = new Date(education[1].gradDate);

            // Add 2 years to undergrad date
            undergradDate.setFullYear(undergradDate.getFullYear() + 2);

            if (postgradDate < undergradDate) {
                newErrors["1-gradDate"] = "Post graduation date must be at least 2 years after graduation";
            }
        }

        // File validation
        if (!proofFile && !education[1].proof) {
            newErrors["1-proof"] = "Please upload your degree proof";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateEducation()) return;

        let updatedEducation = [...education];

        // Only handle file upload if there's a new file
        if (proofFile) {
            try {
                const proofUrl = await uploadFile(`doctors/${doctorData.email}/education1`, proofFile);
                updatedEducation[1] = { ...updatedEducation[1], proof: proofUrl };
            } catch (error) {
                console.error("Error uploading file:", error);
                setErrors({ ...errors, upload: "Failed to upload file. Please try again." });
                return;
            }
        }

        const updatedData = {
            ...doctorData,
            education: updatedEducation
        };

        setDoctorData(updatedData);
        handleSave("education", updatedData);
        setIsEditing(false);
        setProofFile(null);
    };

    // Check if post-graduation exists
    const hasPostGraduation = education.length > 1 && education[1] && (
        education[1].degree || education[1].institute || education[1].gradDate || education[1].proof
    );

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Education</h2>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 rounded-md bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 transition-all"
                    >
                        Edit Post-Graduation
                    </button>
                ) : (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 rounded-md bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 transition-all"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>

            {/* Graduation (index 0) - Display Only */}
            {education[0] && (
                <div className="mb-6 p-4 border rounded-2xl bg-gray-50">
                    <h3 className="font-medium text-gray-800 mb-2">Graduation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-gray-600 text-sm">Degree</p>
                            <p className="text-gray-800">{education[0].degree}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Graduation Date</p>
                            <p className="text-gray-800">{education[0].gradDate}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Institute</p>
                            <p className="text-gray-800">{education[0].institute}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Post-Graduation (index 1) */}
            <div className="p-4 border rounded-2xl bg-gray-50">
                <h3 className="font-medium text-gray-800 mb-2">Post-Graduation</h3>
                {!isEditing ? (
                    // Display mode
                    hasPostGraduation ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600 text-sm">Degree</p>
                                <p className="text-gray-800">{education[1]?.degree || "—"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Institute</p>
                                <p className="text-gray-800">{education[1]?.institute || "—"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Graduation Date</p>
                                <p className="text-gray-800">{education[1]?.gradDate || "—"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Proof</p>
                                <p className="text-gray-800">
                                    {education[1]?.proof ? "Uploaded" : "—"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600 italic">No post-graduation information available</p>
                    )
                ) : (
                    // Edit mode
                    <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Degree Dropdown */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-1">Degree</label>
                                <select
                                    value={education[1]?.degree || ""}
                                    onChange={(e) => handleEducationChange(1, "degree", e.target.value)}
                                    className={`w-full p-3 border rounded-lg shadow-sm ${errors["1-degree"] ? "border-red-500" : ""}`}
                                >
                                    <option value="">Select Degree</option>
                                    {postgraduateDegrees.map((degree, idx) => (
                                        <option key={idx} value={degree}>{degree}</option>
                                    ))}
                                </select>
                                {errors["1-degree"] && (
                                    <p className="text-red-500 text-xs mt-1">{errors["1-degree"]}</p>
                                )}
                            </div>

                            {/* Institute */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-1">Institute</label>
                                <input
                                    type="text"
                                    value={education[1]?.institute || ""}
                                    onChange={(e) => handleEducationChange(1, "institute", e.target.value)}
                                    className={`w-full p-3 border rounded-lg shadow-sm ${errors["1-institute"] ? "border-red-500" : ""}`}
                                    placeholder="Enter institute name"
                                />
                                {errors["1-institute"] && (
                                    <p className="text-red-500 text-xs mt-1">{errors["1-institute"]}</p>
                                )}
                            </div>

                            {/* Graduation Date */}
                            <div>
                                <label className="block text-gray-600 text-sm mb-1">Graduation Date</label>
                                <input
                                    type="month"
                                    value={education[1]?.gradDate || ""}
                                    onChange={(e) => handleEducationChange(1, "gradDate", e.target.value)}
                                    className={`w-full p-3 border rounded-lg shadow-sm ${errors["1-gradDate"] ? "border-red-500" : ""}`}
                                />
                                {errors["1-gradDate"] && (
                                    <p className="text-red-500 text-xs mt-1">{errors["1-gradDate"]}</p>
                                )}
                            </div>
                        </div>

                        {/* Proof Upload */}
                        <div className="mt-4">
                            <UploadInput
                                label="Upload Degree Proof (PDF)"
                                file={proofFile || (education[1]?.proof ? { name: "Current Proof Document" } : null)}
                                setFile={setProofFile}
                                accept=".pdf"
                            />
                            {errors["1-proof"] && (
                                <p className="text-red-500 text-xs mt-1">{errors["1-proof"]}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {errors.upload && (
                <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md">
                    {errors.upload}
                </div>
            )}
        </div>
    );
};

export default DoctorEducationCard;