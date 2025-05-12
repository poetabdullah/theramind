import React, { useState, useEffect } from "react";
import UploadInput from "./UploadInput";

export default function DoctorDetails({ data, onChange, onNext, onBack }) {
    const [errors, setErrors] = useState([]);
    const [minDob, setMinDob] = useState("");
    const [maxDob, setMaxDob] = useState("");

    useEffect(() => {
        const today = new Date();
        const max = new Date();
        max.setFullYear(today.getFullYear() - 24);
        const min = new Date();
        min.setFullYear(today.getFullYear() - 80);
        setMaxDob(max.toISOString().split("T")[0]);
        setMinDob(min.toISOString().split("T")[0]);
    }, []);

    const validate = () => {
        const errs = [];

        // Date of Birth: presence and age between 24 and 80
        if (!data.dob) {
            errs.push("Please select your Date of Birth.");
        } else {
            const birth = new Date(data.dob);
            const today = new Date();
            const age = today.getFullYear() - birth.getFullYear() - (today < new Date(birth.setFullYear(birth.getFullYear() + (today.getFullYear() - birth.getFullYear()))) ? 1 : 0);
            if (age < 24 || age > 80) {
                errs.push("Age must be between 24 and 80 years.");
            }
        }

        // Location: at least 3 characters
        if (!data.location || data.location.trim().length < 3) {
            errs.push("Location must be at least 3 characters.");
        }

        // Contact: regex + min length 11
        const phoneRegex = /^[0-9()+\-\s]*$/;
        if (!data.contact) {
            errs.push("Contact number is required.");
        } else if (!phoneRegex.test(data.contact) || data.contact.replace(/\D/g, '').length < 11) {
            errs.push("Contact number must be valid and at least 11 digits.");
        }

        // Profile picture required
        if (!data.profilePic) {
            errs.push("Please upload a profile picture.");
        }

        setErrors(errs);
        return errs.length === 0;
    };

    const handleNext = () => {
        if (validate()) onNext();
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            {/* Info box */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-700">
                    <span className="font-bold">Why we collect this information:</span> TheraMind needs these details to verify your identity and ensure you qualify for our services. All data is confidential and used solely for treatment planning.
                </p>
            </div>

            {/* Error messages */}
            {errors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <ul className="text-red-700 list-disc list-inside">
                        {errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            <h2 className="text-2xl font-bold text-center text-orange-600">Step 2: Enter your Personal Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Birth */}
                <div className="flex flex-col">
                    <label className="font-medium mb-2">Date of Birth</label>
                    <input
                        type="date"
                        value={data.dob || ""}
                        onChange={(e) => onChange("dob", e.target.value)}
                        min={minDob}
                        max={maxDob}
                        className="w-full p-2 border rounded shadow-sm focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                {/* Location */}
                <div className="flex flex-col">
                    <label className="font-medium mb-2">Location</label>
                    <input
                        type="text"
                        placeholder="City, Region"
                        value={data.location}
                        onChange={(e) => onChange("location", e.target.value)}
                        className="w-full p-2 border rounded shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                {/* Contact Number */}
                <div className="flex flex-col">
                    <label className="font-medium mb-2">Contact Number</label>
                    <input
                        type="tel"
                        placeholder="e.g. +92 300 1234567"
                        value={data.contact}
                        onChange={(e) => onChange("contact", e.target.value)}
                        className="w-full p-2 border rounded shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                {/* Profile Picture */}
                <div>
                    <UploadInput
                        label="Profile Picture"
                        file={data.profilePic}
                        setFile={(file) => onChange("profilePic", file)}
                    />
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 hover:from-purple-700 hover:via-indigo-700 hover:to-orange-600 text-white rounded-xl shadow-md transition-colors"
                >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 hover:from-purple-700 hover:via-indigo-700 hover:to-orange-600 text-white rounded-xl shadow-md transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
