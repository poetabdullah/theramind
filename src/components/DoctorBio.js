import React, { useState } from "react";

export default function DoctorBio({ bio, verified, onChange, onBack, onSubmit }) {
    const [errors, setErrors] = useState([]);

    const validate = () => {
        const errs = [];

        // Bio length check
        if (!bio || bio.trim().length < 1000) {
            errs.push("Profile description must be at least 1000 characters.");
        } else if (bio.length > 7000) {
            errs.push("Profile description cannot exceed 7000 characters.");
        }

        // Verification checkbox
        if (!verified) {
            errs.push("You must confirm that all details are true.");
        }

        setErrors(errs);
        return errs.length === 0;
    };

    const handleSubmit = () => {
        if (validate()) onSubmit();
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            {/* Warning message */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-700">
                    <span className="font-bold">Why we collect this information:</span> TheraMind uses your profile and verification to ensure transparency, trust, and the highest quality of care. Your details help patients make informed decisions and confirm credential authenticity.
                </p>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <ul className="text-red-700 list-disc list-inside">
                        {errors.map((err, i) => (
                            <li key={i}>{err}</li>
                        ))}
                    </ul>
                </div>
            )}

            <h2 className="text-2xl font-bold text-center text-orange-600">
                Step 5: Profile & Verification
            </h2>

            <label className="block font-medium">Profile Description</label>
            <textarea
                placeholder="Write a detailed profile about your qualifications, experience, and approach..."
                value={bio}
                onChange={(e) => onChange("bio", e.target.value)}
                className="w-full h-48 p-3 border rounded shadow-sm placeholder-gray-400 resize-none"
            />
            <p className="text-sm text-gray-500">Minimum: 1000 characters. Maximum: 7000 characters.</p>

            <label className="flex items-start space-x-3 mt-4">
                <input
                    type="checkbox"
                    checked={verified}
                    onChange={(e) => onChange("verified", e.target.checked)}
                    className="w-5 h-5 mt-1"
                />
                <span className="text-gray-700">
                    I hereby confirm that all details provided are accurate and complete to the best of my knowledge, and that I understand any misrepresentation may result in rejection of my application.
                </span>
            </label>

            <div className="flex justify-between mt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 hover:from-purple-700 hover:via-indigo-700 hover:to-orange-600 text-white rounded-xl shadow-md transition-colors"
                >
                    Previous
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 hover:from-purple-700 hover:via-indigo-700 hover:to-orange-600 text-white rounded-xl shadow-md transition-colors disabled:opacity-50"
                    disabled={!verified}
                >
                    Submit for Approval
                </button>
            </div>
        </div>
    );
}
