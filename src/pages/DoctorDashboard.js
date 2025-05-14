import React, { useState, useEffect } from 'react';
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import UploadInput from "../components/UploadInput";

// Storage setup
const storage = getStorage();

// Upload file and return URL function
async function uploadFile(path, file) {
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
}

// Component for displaying and editing personal information
const PersonalInfoCard = ({ doctorData, setDoctorData, isEditing, setIsEditing, handleSave }) => {
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

// Component for displaying and editing education information
const EducationCard = ({ doctorData, setDoctorData, isEditing, setIsEditing, handleSave }) => {
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
        setEducation(doctorData.education || []);
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
            {hasPostGraduation ? (
                <div className="p-4 border rounded-2xl bg-gray-50">
                    <h3 className="font-medium text-gray-800 mb-2">Post-Graduation</h3>
                    {/* ... rest of the form stays unchanged ... */}
                </div>
            ) : (
                <div className="p-4 border rounded-2xl bg-gray-50">
                    <p className="text-gray-600 italic">No post-graduation information available</p>
                    {isEditing && (
                        <div className="mt-4 space-y-4">
                            {/* ... input fields and upload component ... */}
                        </div>
                    )}
                </div>
            )}

            {errors.upload && (
                <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-md">
                    {errors.upload}
                </div>
            )}
        </div>
    );

};

// Component for displaying and editing experience information
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


// Component for displaying and editing bio information
const BioCard = ({ doctorData, setDoctorData, isEditing, setIsEditing, handleSave }) => {
    const [bio, setBio] = useState(doctorData.bio || "");

    useEffect(() => {
        setBio(doctorData.bio || "");
    }, [doctorData, isEditing]);

    const handleSubmit = () => {
        const updatedData = {
            ...doctorData,
            bio
        };
        setDoctorData(updatedData);
        handleSave("bio", updatedData);
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Bio</h2>
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

            {isEditing ? (
                <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full border rounded-lg p-3 h-40 focus:ring-2 focus:ring-indigo-200 focus:outline-none shadow-sm"
                    placeholder="Write your professional bio here..."
                />
            ) : (
                <div className="prose">
                    <p className="text-gray-800 whitespace-pre-line">{doctorData.bio || "No bio information available."}</p>
                </div>
            )}
        </div>
    );

};

// Main Dashboard Component
const DoctorDashboard = () => {
    const [doctorData, setDoctorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const navigate = useNavigate();

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    // Fetch doctor data
    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const user = auth.currentUser;

                if (!user) {
                    setError("User not authenticated");
                    setLoading(false);
                    navigate("/login");
                    return;
                }

                const doctorRef = doc(db, "doctors", user.email);
                const docSnap = await getDoc(doctorRef);

                if (docSnap.exists()) {
                    setDoctorData(docSnap.data());
                } else {
                    setError("No doctor data found");
                }
            } catch (err) {
                console.error("Error fetching doctor data:", err);
                setError("Failed to load doctor data");
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorData();
    }, [navigate]);

    // Handle save for different sections
    const handleSave = async (section, updatedData) => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("User not authenticated");

            const doctorRef = doc(db, "doctors", user.email);

            // Update only the specific section in Firestore
            let updateObj = {};

            switch (section) {
                case "personal":
                    updateObj = {
                        location: updatedData.location,
                        contact: updatedData.contact
                    };
                    break;
                case "education":
                    updateObj = { education: updatedData.education };
                    break;
                case "experiences":
                    updateObj = { experiences: updatedData.experiences };
                    break;
                case "bio":
                    updateObj = { bio: updatedData.bio };
                    break;
                default:
                    break;
            }

            await updateDoc(doctorRef, updateObj);

        } catch (error) {
            console.error("Error saving data:", error);
            alert("Failed to save changes. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-orange-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-orange-800 font-medium">Loading doctor data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-orange-50">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-orange-100 to-orange-50">
            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Greeting Section - Now inside the main container */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-yellow-600 bg-clip-text text-transparent">
                        Hi, {doctorData?.fullName || "Doctor"}
                    </h1>
                </div>

                {doctorData && (
                    <>
                        <PersonalInfoCard
                            doctorData={doctorData}
                            setDoctorData={setDoctorData}
                            isEditing={editingSection === "personal"}
                            setIsEditing={(editing) => setEditingSection(editing ? "personal" : null)}
                            handleSave={handleSave}
                        />

                        <EducationCard
                            doctorData={doctorData}
                            setDoctorData={setDoctorData}
                            isEditing={editingSection === "education"}
                            setIsEditing={(editing) => setEditingSection(editing ? "education" : null)}
                            handleSave={handleSave}
                        />

                        <ExperienceCard
                            doctorData={doctorData}
                            setDoctorData={setDoctorData}
                            isEditing={editingSection === "experience"}
                            setIsEditing={(editing) => setEditingSection(editing ? "experience" : null)}
                            handleSave={handleSave}
                        />

                        <BioCard
                            doctorData={doctorData}
                            setDoctorData={setDoctorData}
                            isEditing={editingSection === "bio"}
                            setIsEditing={(editing) => setEditingSection(editing ? "bio" : null)}
                            handleSave={handleSave}
                        />
                    </>
                )}
            </main>
        </div>
    );
};

export default DoctorDashboard;