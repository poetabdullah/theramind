import React, { useState, useEffect } from 'react';

const DoctorInfoCard = ({ doctorData, setDoctorData, isEditing, setIsEditing, handleSave }) => {
    const [location, setLocation] = useState(doctorData.location || "");
    const [contact, setContact] = useState(doctorData.contact || "");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setLocation(doctorData.location || "");
        setContact(doctorData.contact || "");
        setErrors({});
    }, [doctorData, isEditing]);

    const validateForm = () => {
        const newErrors = {};

        // Location validation (minimum 3 characters)
        if (location.trim().length < 3) {
            newErrors.location = "Location must be at least 3 characters";
        }

        // Contact validation (11 characters, numbers only)
        const contactRegex = /^\d{11}$/;
        if (!contactRegex.test(contact)) {
            newErrors.contact = "Contact must be exactly 11 digits";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const updatedData = {
            ...doctorData,
            location,
            contact
        };
        setDoctorData(updatedData);
        handleSave("personal", updatedData);
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-gray-600 font-medium">Email</p>
                    <p className="text-gray-800">{doctorData.email}</p>
                </div>
                <div>
                    <p className="text-gray-600 font-medium">Date of Birth</p>
                    <p className="text-gray-800">{doctorData.dob}</p>
                </div>
                <div className="relative">
                    <p className="text-gray-600 font-medium">Location</p>
                    {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-200 ${errors.location ? "border-red-500" : ""}`}
                                placeholder="City, Region"
                            />
                            {errors.location && (
                                <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-800">{doctorData.location}</p>
                    )}
                </div>
                <div className="relative">
                    <p className="text-gray-600 font-medium">Contact</p>
                    {isEditing ? (
                        <>
                            <input
                                type="tel"
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                                className={`w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-200 ${errors.contact ? "border-red-500" : ""}`}
                                placeholder="e.g. 03001234567"
                            />
                            {errors.contact && (
                                <p className="text-red-500 text-xs mt-1">{errors.contact}</p>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-800">{doctorData.contact}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorInfoCard;