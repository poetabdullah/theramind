import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export default function DoctorDetails({ data, onChange, onNext, onBack }) {
    const [errors, setErrors] = useState([]);
    const [minDob, setMinDob] = useState("");
    const [maxDob, setMaxDob] = useState("");
    const [specialtiesOpen, setSpecialtiesOpen] = useState(false);
    const specialtiesRef = useRef(null);

    // Major disease options (mapped from recommendation logic)
    const specialtiesOptions = ["Stress", "Anxiety", "Depression", "Trauma", "OCD"];

    useEffect(() => {
        // DOB bounds between age 25 and 70
        const today = new Date();
        const max = new Date();
        max.setFullYear(today.getFullYear() - 25);
        const min = new Date();
        min.setFullYear(today.getFullYear() - 70);
        setMaxDob(max.toISOString().split("T")[0]);
        setMinDob(min.toISOString().split("T")[0]);
    }, []);

    // Close specialties dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (specialtiesRef.current && !specialtiesRef.current.contains(e.target)) {
                setSpecialtiesOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const validate = () => {
        const errs = [];
        // Date of Birth validation
        if (!data.dob) {
            errs.push("Please select your Date of Birth.");
        } else {
            const birth = new Date(data.dob);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            if (age < 24 || age > 80) errs.push("Age must be between 24 and 80 years.");
        }
        // Location validation
        if (!data.location || data.location.trim().length < 3) {
            errs.push("Location must be at least 3 characters.");
        }
        // Contact number validation
        if (!data.contact || data.contact.replace(/\D/g, "").length < 11) {
            errs.push("Contact number must be valid and at least 11 digits.");
        }
        // Specialties: must select 1 to 3 major diseases
        const sel = Array.isArray(data.specialties) ? data.specialties : [];
        if (sel.length < 1) errs.push("Select at least 1 specialty.");
        if (sel.length > 3) errs.push("You can select up to 3 specialties.");

        setErrors(errs);
        return errs.length === 0;
    };

    const handleNext = () => {
        if (validate()) onNext();
    };

    // Toggle specialty selection
    const toggleSpecialty = (option) => {
        const sel = Array.isArray(data.specialties) ? [...data.specialties] : [];
        const idx = sel.indexOf(option);
        if (idx >= 0) sel.splice(idx, 1);
        else if (sel.length < 3) sel.push(option);
        onChange("specialties", sel);
    };

    const renderSelectedText = () => {
        const sel = Array.isArray(data.specialties) ? data.specialties : [];
        if (!sel.length) return "Select 1–3 specialties";
        if (sel.length <= 2) return sel.join(", ");
        return `${sel.length} selected`;
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
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
                Step 2: Enter Your Personal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="flex flex-col relative" ref={specialtiesRef}>
                    <label className="font-medium mb-2">Specialties</label>
                    <button
                        type="button"
                        onClick={() => setSpecialtiesOpen((o) => !o)}
                        className="w-full flex justify-between items-center p-2 border rounded shadow-sm bg-white focus:ring-2 focus:ring-indigo-200"
                    >
                        <span className="text-gray-700">{renderSelectedText()}</span>
                        {specialtiesOpen ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {specialtiesOpen && (
                        <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border rounded shadow-lg">
                            {specialtiesOptions.map((opt) => {
                                const sel = Array.isArray(data.specialties) ? data.specialties : [];
                                const isSel = sel.includes(opt);
                                return (
                                    <li
                                        key={opt}
                                        className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-100 ${isSel ? "bg-indigo-50" : ""
                                            }`}
                                        onClick={() => toggleSpecialty(opt)}
                                    >
                                        <span className={isSel ? "font-medium text-gray-800" : "text-gray-800"}>
                                            {opt}
                                        </span>
                                        {isSel && <Check />}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            <div className="flex justify-between mt-6">
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white rounded-xl"
                >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 text-white rounded-xl"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
