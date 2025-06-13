import React, { useState, useEffect, useRef } from "react";
import UploadInput from "./UploadInput";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export default function DoctorDetails({ data, onChange, onNext, onBack }) {
    const [errors, setErrors] = useState([]);
    const [minDob, setMinDob] = useState("");
    const [maxDob, setMaxDob] = useState("");
    const [expertiseOpen, setExpertiseOpen] = useState(false);
    const expertiseRef = useRef(null);

    // List of expertise options
    const expertiseOptions = [
        "Contamination OCD",
        "Symmetry OCD",
        "Checking OCD",
        "Acute Stress",
        "Chronic Stress",
        "Episodic Acute Stress",
        "Generalized Anxiety Disorder",
        "Panic Disorder",
        "Separation Anxiety Disorder",
        "Postpartum Depression",
        "Atypical Depression",
        "Major Depressive Disorder",
        "Single Event Trauma",
        "Complex Trauma",
        "Developmental Trauma",
    ];

    useEffect(() => {
        // DOB bounds between age 24 and 80
        const today = new Date();
        const max = new Date();
        max.setFullYear(today.getFullYear() - 24);
        const min = new Date();
        min.setFullYear(today.getFullYear() - 80);
        setMaxDob(max.toISOString().split("T")[0]);
        setMinDob(min.toISOString().split("T")[0]);
    }, []);

    // Close expertise dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                expertiseRef.current &&
                !expertiseRef.current.contains(e.target)
            ) {
                setExpertiseOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const validate = () => {
        const errs = [];

        // Date of Birth: presence and age between 24 and 80
        if (!data.dob) {
            errs.push("Please select your Date of Birth.");
        } else {
            const birth = new Date(data.dob);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birth.getDate())
            ) {
                age--;
            }
            if (age < 24 || age > 80) {
                errs.push("Age must be between 24 and 80 years.");
            }
        }

        // Location: at least 3 characters
        if (!data.location || data.location.trim().length < 3) {
            errs.push("Location must be at least 3 characters.");
        }

        // Contact: regex + min length 11 digits
        const phoneRegex = /^[0-9()+\-\s]*$/;
        if (!data.contact) {
            errs.push("Contact number is required.");
        } else if (
            !phoneRegex.test(data.contact) ||
            data.contact.replace(/\D/g, "").length < 11
        ) {
            errs.push("Contact number must be valid and at least 11 digits.");
        }

        // Expertise: at least 1, at most 10
        const sel = Array.isArray(data.expertise) ? data.expertise : [];
        if (sel.length < 1) {
            errs.push("Select at least 1 area of expertise.");
        } else if (sel.length > 10) {
            errs.push("You can select up to 10 areas of expertise.");
        }

        setErrors(errs);
        return errs.length === 0;
    };

    const handleNext = () => {
        if (validate()) onNext();
    };

    // Toggle selection in expertise
    const toggleExpertise = (option) => {
        const sel = Array.isArray(data.expertise) ? [...data.expertise] : [];
        const idx = sel.indexOf(option);
        if (idx >= 0) {
            // remove
            sel.splice(idx, 1);
        } else {
            // add if <=10
            if (sel.length < 10) {
                sel.push(option);
            } else {
                // optionally show a small message or ignore
                return;
            }
        }
        onChange("expertise", sel);
    };

    // Render selected labels or placeholder
    const renderSelectedText = () => {
        const sel = Array.isArray(data.expertise) ? data.expertise : [];
        if (!sel.length) return "Select 1–10 areas";
        if (sel.length <= 2) return sel.join(", ");
        return `${sel.length} selected`;
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            {/* Info box */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-700">
                    <span className="font-bold">
                        Why we collect this information:
                    </span>{" "}
                    TheraMind needs these details to verify your identity and
                    ensure you qualify for our services. All data is confidential
                    and used solely for treatment planning.
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

            <h2 className="text-2xl font-bold text-center text-orange-600">
                Step 2: Enter your Personal Details
            </h2>

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
                        value={data.location || ""}
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
                        value={data.contact || ""}
                        onChange={(e) => onChange("contact", e.target.value)}
                        className="w-full p-2 border rounded shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-200"
                    />
                </div>

                {/* Expertise dropdown */}
                <div className="flex flex-col relative" ref={expertiseRef}>
                    <label className="font-medium mb-2">Disease Expertise</label>
                    <button
                        type="button"
                        onClick={() => setExpertiseOpen((o) => !o)}
                        className="w-full flex justify-between items-center p-2 border rounded shadow-sm focus:ring-2 focus:ring-indigo-200 bg-white"
                    >
                        <span className="text-gray-700">
                            {renderSelectedText()}
                        </span>
                        {expertiseOpen ? (
                            <ChevronUp className="text-gray-500" />
                        ) : (
                            <ChevronDown className="text-gray-500" />
                        )}
                    </button>
                    {expertiseOpen && (
                        <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border rounded shadow-lg">
                            {expertiseOptions.map((opt) => {
                                const selectedArr = Array.isArray(data.expertise)
                                    ? data.expertise
                                    : [];
                                const isSelected = selectedArr.includes(opt);
                                return (
                                    <li
                                        key={opt}
                                        className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 ${isSelected
                                                ? "bg-indigo-50"
                                                : ""
                                            }`}
                                        onClick={() => toggleExpertise(opt)}
                                    >
                                        <span
                                            className={`text-gray-800 ${isSelected
                                                    ? "font-medium"
                                                    : ""
                                                }`}
                                        >
                                            {opt}
                                        </span>
                                        {isSelected && (
                                            <Check
                                                size={16}
                                                className="text-indigo-600"
                                            />
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-3 sm:space-y-0">
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 hover:from-purple-700 hover:via-indigo-700 hover:to-orange-600 text-white rounded-xl shadow-md transition-colors w-full sm:w-auto text-center"
                >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 hover:from-purple-700 hover:via-indigo-700 hover:to-orange-600 text-white rounded-xl shadow-md transition-colors w-full sm:w-auto text-center"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
