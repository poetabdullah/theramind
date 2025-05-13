import React, { useState } from "react";
import UploadInput from "./UploadInput";

export default function DoctorExperience({ experiences, onChange, onNext, onBack }) {
    const [errors, setErrors] = useState([]);

    const validate = () => {
        const errs = [];
        const todayMonth = new Date().toISOString().slice(0, 7);

        // Check first experience always if present
        const exp1 = experiences[0] || {};
        // Mandatory first entry
        if (!exp1.org || exp1.org.trim().length < 3) {
            errs.push("Entry 1: Organization/Hospital name must be at least 3 characters.");
        }
        if (!exp1.role || exp1.role.trim().length < 3) {
            errs.push("Entry 1: Role/Title must be at least 3 characters.");
        }
        if (!exp1.start) errs.push("Entry 1: Please select a start date.");
        if (!exp1.end) errs.push("Entry 1: Please select an end date.");
        if (exp1.start && exp1.end) {
            if (exp1.start === exp1.end) errs.push("Entry 1: Start and end dates must be different.");
            if (exp1.start > exp1.end) errs.push("Entry 1: End date must be after start date.");
        }
        if (exp1.start && exp1.start > todayMonth) errs.push("Entry 1: Start date cannot be in the future.");
        if (exp1.end && exp1.end > todayMonth) errs.push("Entry 1: End date cannot be in the future.");

        // Check second experience only if any field entered
        const exp2 = experiences[1] || {};
        const secondEntered = Boolean(exp2.org || exp2.role || exp2.start || exp2.end);
        if (secondEntered) {
            if (!exp2.org || exp2.org.trim().length < 3) {
                errs.push("Entry 2: Organization/Hospital name must be at least 3 characters.");
            }
            if (!exp2.role || exp2.role.trim().length < 3) {
                errs.push("Entry 2: Role/Title must be at least 3 characters.");
            }
            if (!exp2.start) errs.push("Entry 2: Please select a start date.");
            if (!exp2.end) errs.push("Entry 2: Please select an end date.");
            if (exp2.start && exp2.end) {
                if (exp2.start === exp2.end) errs.push("Entry 2: Start and end dates must be different.");
                if (exp2.start > exp2.end) errs.push("Entry 2: End date must be after start date.");
            }
            if (exp2.start && exp2.start > todayMonth) errs.push("Entry 2: Start date cannot be in the future.");
            if (exp2.end && exp2.end > todayMonth) errs.push("Entry 2: End date cannot be in the future.");

            // Cross-entry checks
            if (exp1.start && exp2.start && exp1.start > exp2.start) {
                errs.push("Entry 1: Start date cannot be after Entry 2 start date.");
            }
            if (exp1.end && exp2.end) {
                const [y1, m1] = exp1.end.split('-').map(Number);
                const [y2, m2] = exp2.end.split('-').map(Number);
                const date1 = new Date(y1, m1 - 1);
                const date2 = new Date(y2, m2 - 1);
                const diffMonths = (y2 - y1) * 12 + (m2 - m1);
                if (diffMonths < 1) {
                    errs.push("Entry 2: End date must be at least 1 month after Entry 1 end date.");
                }
            }
        }

        setErrors(errs);
        return errs.length === 0;
    };

    const handleNext = () => {
        if (validate()) onNext();
    };

    const todayMonth = new Date().toISOString().slice(0, 7);

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            {/* Warning message */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-700">
                    <span className="font-bold">Why we collect this information:</span> TheraMind uses your past experiences to assess your practical background and ensure high-quality care. All details remain confidential and aid in matching patients with the right expertise.
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
                Step 4: Enter Your Recent Experiences
            </h2>

            <div className="space-y-4">
                {experiences.map((exp, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                        <label className="block font-medium">Organization/Hospital</label>
                        <input
                            type="text"
                            value={exp.org}
                            onChange={(e) => onChange(idx, "org", e.target.value)}
                            className="w-full p-2 border rounded shadow-sm placeholder-gray-400"
                        />

                        <label className="block font-medium">Role/Title</label>
                        <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => onChange(idx, "role", e.target.value)}
                            className="w-full p-2 border rounded shadow-sm placeholder-gray-400"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium">Start Date</label>
                                <input
                                    type="month"
                                    max={todayMonth}
                                    value={exp.start}
                                    onChange={(e) => onChange(idx, "start", e.target.value)}
                                    className="w-full p-2 border rounded shadow-sm appearance-none"
                                />
                            </div>
                            <div>
                                <label className="block font-medium">End Date</label>
                                <input
                                    type="month"
                                    max={todayMonth}
                                    value={exp.end}
                                    onChange={(e) => onChange(idx, "end", e.target.value)}
                                    className="w-full p-2 border rounded shadow-sm appearance-none"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Resume upload only once */}
            <UploadInput
                label="Upload Resume (PDF/DOC)"
                accept=".pdf,.doc,.docx"
                file={experiences[0]?.resume}
                setFile={(file) => onChange(0, "resume", file)}
            />

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
