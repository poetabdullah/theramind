import React, { useState } from "react";
import UploadInput from "./UploadInput";

export default function DoctorEducationDetails({ education, onChange, onNext, onBack }) {
    const [errors, setErrors] = useState([]);

    const bachelorDegrees = [
        "BA in Psychology", "BS in Psychology", "BA in Clinical Psychology", "BS in Clinical Psychology",
        "BA in Counseling Psychology", "BS in Counseling Psychology", "BA in Forensic Psychology", "BS in Forensic Psychology",
        "BA in Developmental Psychology", "BS in Developmental Psychology", "BA in Child Psychology", "BS in Child Psychology",
        "BA in Applied Psychology", "BS in Applied Psychology", "BA in Behavioral Science", "BS in Behavioral Science",
        "BA in Social Psychology", "BS in Social Psychology",
    ];

    const postgraduateDegrees = [
        "MA in Psychology", "MS in Psychology", "MA in Clinical Psychology", "MS in Clinical Psychology",
        "MA in Counseling Psychology", "MS in Counseling Psychology", "MA in Forensic Psychology", "MS in Forensic Psychology",
        "MA in Developmental Psychology", "MS in Developmental Psychology", "MA in Child Psychology", "MS in Child Psychology",
        "MA in Applied Psychology", "MS in Applied Psychology", "MA in Behavioral Science", "MS in Behavioral Science",
        "MA in Social Psychology", "MS in Social Psychology", "MSW", "MMFT", "PhD in Psychology", "PsyD", "EdD in Psychology",
        "Other"
    ];

    const validate = () => {
        const errs = [];
        const [grad, post] = education;

        // Prevent future graduation dates
        const todayMonth = new Date().toISOString().slice(0, 7);
        if (grad.gradDate && grad.gradDate > todayMonth) {
            errs.push("Graduation date cannot be in the future.");
        }

        // Graduation validations (always required)
        if (!grad.degree) errs.push("Please select your Graduation degree.");
        if (!grad.institute || grad.institute.trim().length < 3)
            errs.push("Graduation Institute name must be at least 3 characters.");
        if (!grad.gradDate) errs.push("Please select your Graduation date.");
        if (!grad.proof) errs.push("Please upload proof for your Graduation degree.");

        // Determine if user has entered any Post Graduation info
        const postEntered =
            Boolean(post.degree) ||
            Boolean(post.institute && post.institute.trim()) ||
            Boolean(post.gradDate) ||
            Boolean(post.proof) ||
            Boolean(post.otherDegree && post.otherDegree.trim());

        if (postEntered) {
            // Post Graduation validations (required only if any field entered)
            if (!post.degree) errs.push("Please select your Post Graduation degree.");
            if (!post.institute || post.institute.trim().length < 3)
                errs.push("Post Graduation Institute name must be at least 3 characters.");
            if (!post.gradDate) errs.push("Please select your Post Graduation date.");
            if (!post.proof) errs.push("Please upload proof for your Post Graduation degree.");

            // If "Other" selected, custom name required
            if (post.degree === "Other") {
                if (!post.otherDegree || post.otherDegree.trim().length < 5) {
                    errs.push("Please specify your Post Graduation degree (minimum 5 characters).");
                }
            }

            // Check date gap after Graduation
            if (grad.gradDate && post.gradDate) {
                const g = new Date(grad.gradDate);
                const p = new Date(post.gradDate);
                const yearDiff = p.getFullYear() - g.getFullYear();
                const monthDiff = p.getMonth() - g.getMonth();
                if (yearDiff < 2 || (yearDiff === 2 && monthDiff < 0)) {
                    errs.push("Post Graduation must be at least 2 years after Graduation.");
                }
            }
        }

        setErrors(errs);
        return errs.length === 0;
    };

    const handleNext = () => {
        if (validate()) onNext();
    };

    // Compute max month value for graduation input
    const todayMonth = new Date().toISOString().slice(0, 7);

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-700">
                    <span className="font-bold">Why we collect this information:</span> TheraMind uses your educational details to verify credentials and ensure our doctors meet all licensing and training standards. All uploads are kept confidential and used solely for verification.
                </p>
            </div>

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
                Step 3: Enter your Education Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Graduation */}
                <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <label className="block font-medium">Graduation Degree</label>
                    <select
                        value={education[0].degree}
                        onChange={(e) => onChange(0, "degree", e.target.value)}
                        className="w-full p-2 border rounded shadow-sm"
                    >
                        <option value="">Select Graduation Degree</option>
                        {bachelorDegrees.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>

                    <label className="block font-medium">Graduation Date</label>
                    <input
                        type="month"
                        max={todayMonth}
                        value={education[0].gradDate}
                        onChange={(e) => onChange(0, "gradDate", e.target.value)}
                        className="w-full p-2 border rounded shadow-sm"
                    />

                    <label className="block font-medium">Graduation Institute</label>
                    <input
                        type="text"
                        value={education[0].institute}
                        onChange={(e) => onChange(0, "institute", e.target.value)}
                        className="w-full p-2 border rounded shadow-sm placeholder-gray-400"
                    />

                    <UploadInput
                        label="Graduation Degree Proof"
                        file={education[0].proof}
                        setFile={(file) => onChange(0, "proof", file)}
                    />
                </div>

                {/* Post Graduation */}
                <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <label className="block font-medium">Post Graduation Degree</label>
                    <select
                        value={education[1].degree}
                        onChange={(e) => onChange(1, "degree", e.target.value)}
                        className="w-full p-2 border rounded shadow-sm"
                    >
                        <option value="">Select Post Graduation Degree</option>
                        {postgraduateDegrees.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>

                    {education[1].degree === "Other" && (
                        <>
                            <label className="block font-medium">Other Post Graduation Degree</label>
                            <input
                                type="text"
                                value={education[1].otherDegree || ""}
                                onChange={(e) => onChange(1, "otherDegree", e.target.value)}
                                className="w-full p-2 border rounded shadow-sm"
                                placeholder="Enter custom degree name"
                            />
                        </>
                    )}

                    <label className="block font-medium">Post Graduation Date</label>
                    <input
                        type="month"
                        value={education[1].gradDate}
                        onChange={(e) => onChange(1, "gradDate", e.target.value)}
                        className="w-full p-2 border rounded shadow-sm"
                    />

                    <label className="block font-medium">Post Graduation Institute</label>
                    <input
                        type="text"
                        value={education[1].institute}
                        onChange={(e) => onChange(1, "institute", e.target.value)}
                        className="w-full p-2 border rounded shadow-sm placeholder-gray-400"
                    />

                    <UploadInput
                        label="Post Graduation Degree Proof"
                        file={education[1].proof}
                        setFile={(file) => onChange(1, "proof", file)}
                    />
                </div>
            </div>

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
