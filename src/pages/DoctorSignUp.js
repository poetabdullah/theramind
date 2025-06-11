// DoctorSignUp.js (Optimized OAuth/provider instantiation, same logic)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { GoogleAuthProvider, signOut, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL,
    getStorage,
} from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import StepProgress from "../components/StepProgress";
import OAuthSignUp from "../components/OAuthSignUp";
import DoctorDetails from "../components/DoctorDetails";
import DoctorEducationDetails from "../components/DoctorEducationDetails";
import DoctorExperience from "../components/DoctorExperience";
import DoctorBio from "../components/DoctorBio";
import Footer from "../components/Footer";

const steps = [
    "Sign Up",
    "Personal Details",
    "Education Details",
    "Experience",
    "Profile & Verify",
];

// initialize storage instance once
const storage = getStorage();

// Upload file and return URL (unchanged)
async function uploadFile(path, file) {
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
}

// Define OAuth scopes once
const DOCTOR_OAUTH_SCOPES = [
    // Basic profile
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    // Non-sensitive Calendar scopes
    "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
    "https://www.googleapis.com/auth/calendar.events.freebusy",
    "https://www.googleapis.com/auth/calendar.app.created",
    "https://www.googleapis.com/auth/calendar.events.public.readonly",
    "https://www.googleapis.com/auth/calendar.settings.readonly",
    "https://www.googleapis.com/auth/calendar.freebusy",
    // Sensitive Calendar scopes
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.acls",
    "https://www.googleapis.com/auth/calendar.acls.readonly",
    "https://www.googleapis.com/auth/calendar.calendars",
    "https://www.googleapis.com/auth/calendar.calendars.readonly",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events.owned",
    "https://www.googleapis.com/auth/calendar.events.owned.readonly",
    "https://www.googleapis.com/auth/calendar.events.readonly",
    // Meet scopes
    "https://www.googleapis.com/auth/meetings.space.settings",
    "https://www.googleapis.com/auth/meetings.space.created",
    "https://www.googleapis.com/auth/meetings.space.readonly",
];

export default function DoctorSignUp() {
    const [step, setStep] = useState(1);
    const [doctor, setDoctor] = useState({
        uid: "",
        email: "",
        fullName: "",
        dob: "",
        location: "",
        contact: "",
        profilePic: null,
        education: Array.from({ length: 2 }, () => ({
            degree: "",
            institute: "",
            gradDate: "",
            proof: null,
        })),
        experiences: Array.from({ length: 2 }, () => ({
            org: "",
            role: "",
            start: "",
            end: "",
            resume: null,
        })),
        bio: "",
        verified: false,
        status: "pending",
    });
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    // Memoize auth instance
    const authInstance = useMemo(() => auth, []);

    // Prepare a single GoogleAuthProvider with scopes & parameters
    const googleProvider = useMemo(() => {
        const provider = new GoogleAuthProvider();
        // Force fresh account prompt
        provider.setCustomParameters({ prompt: "select_account" });
        // Add scopes once
        DOCTOR_OAUTH_SCOPES.forEach((scope) => provider.addScope(scope));
        return provider;
    }, []);

    // Always sign out before starting signup flow
    useEffect(() => {
        (async () => {
            try {
                await signOut(authInstance);
            } catch { }
        })();
    }, [authInstance]);

    // Step 1: Google Sign-Up for doctors (same logic, but provider memoized)
    const handleGoogleSignUp = useCallback(async () => {
        setError("");
        try {
            await signOut(authInstance);
            const result = await signInWithPopup(authInstance, googleProvider);
            const user = result.user;
            const email = user.email;
            // References
            const doctorRef = doc(db, "doctors", email);
            const patientRef = doc(db, "patients", email);
            const [doctorSnap, patientSnap] = await Promise.all([
                getDoc(doctorRef),
                getDoc(patientRef),
            ]);
            if (doctorSnap.exists()) {
                const doctorData = doctorSnap.data();
                const status = doctorData.status;
                if (!status) {
                    setDoctor((d) => ({
                        ...d,
                        uid: user.uid,
                        email,
                        fullName: user.displayName || "",
                    }));
                    setStep(2);
                    return;
                }
                switch (status) {
                    case "approved":
                        navigate("/doctor-dashboard");
                        return;
                    case "pending":
                        setError("Your application is still pending approval.");
                        await signOut(authInstance);
                        return;
                    case "rejected":
                        setError(
                            "Your application has been rejected. Contact TheraMind for more information."
                        );
                        await signOut(authInstance);
                        navigate("/");
                        return;
                    default:
                        setError("Unknown application status. Please contact support.");
                        await signOut(authInstance);
                        return;
                }
            } else if (patientSnap.exists()) {
                navigate("/patient-dashboard");
                return;
            } else {
                setDoctor((d) => ({
                    ...d,
                    uid: user.uid,
                    email,
                    fullName: user.displayName || "",
                }));
                setStep(2);
            }
        } catch (err) {
            console.error("OAuth Error:", err);
            setError(err.message || "Google sign-in failed. Please try again.");
        }
    }, [authInstance, googleProvider, navigate]);

    // Utility to update simple fields
    const updateField = useCallback((field, value) => {
        setDoctor((d) => ({ ...d, [field]: value }));
    }, []);

    // Utility to update arrays (education/experiences)
    const updateArray = useCallback((arr, idx, key, value) => {
        setDoctor((d) => {
            const copy = [...d[arr]];
            copy[idx] = { ...copy[idx], [key]: value };
            return { ...d, [arr]: copy };
        });
    }, []);

    // Step 5: Submit final doctor data (upload files, same logic)
    const handleSubmit = useCallback(async () => {
        setError("");
        try {
            if (!doctor.email) throw new Error("Missing user credentials.");
            const user = authInstance.currentUser;
            if (!user)
                throw new Error("User is not authenticated. Please sign in first.");
            // Upload education proofs
            const education = await Promise.all(
                doctor.education.map(async (edu, i) => {
                    let proofUrl = null;
                    if (edu.proof) {
                        proofUrl = await uploadFile(
                            `doctors/${doctor.email}/education${i}`,
                            edu.proof
                        );
                    }
                    return { ...edu, proof: proofUrl };
                })
            );
            // Upload experience resumes
            const experiences = await Promise.all(
                doctor.experiences.map(async (exp, i) => {
                    let resumeUrl = null;
                    if (exp.resume) {
                        resumeUrl = await uploadFile(
                            `doctors/${doctor.email}/experience${i}`,
                            exp.resume
                        );
                    }
                    return { ...exp, resume: resumeUrl };
                })
            );
            const dataToSave = {
                ...doctor,
                profilePic: doctor.profilePic || null,
                education,
                experiences,
                createdAt: new Date(),
            };
            await setDoc(doc(db, "doctors", doctor.email), dataToSave);
            setSubmitted(true);
        } catch (err) {
            console.error("Submission Error:", err);
            setError(err.message || "Failed to submit application. Please try again.");
        }
    }, [doctor, authInstance]);

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-bold mb-4">Application Submitted</h2>
                    <p className="text-gray-700">
                        Your application has been submitted and is pending review. We will
                        contact you via email once a decision is made.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-indigo-500 to-orange-600 p-4">
                <div className="w-full max-w-xl mb-6">
                    <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-4">
                        <StepProgress steps={steps} currentStep={step} />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xl">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-orange-600">
                            Create Your TheraMind Doctor Account
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Step {step} of {steps.length}
                        </p>
                    </div>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    )}
                    <div className="transition-all duration-300">
                        {step === 1 && (
                            <OAuthSignUp
                                onSuccess={handleGoogleSignUp}
                                buttonText="Sign up with Google"
                            />
                        )}
                        {step === 2 && (
                            <DoctorDetails
                                data={doctor}
                                onChange={updateField}
                                onNext={() => setStep(3)}
                                onBack={() => setStep(1)}
                            />
                        )}
                        {step === 3 && (
                            <DoctorEducationDetails
                                education={doctor.education}
                                onChange={(i, k, v) => updateArray("education", i, k, v)}
                                onNext={() => setStep(4)}
                                onBack={() => setStep(2)}
                            />
                        )}
                        {step === 4 && (
                            <DoctorExperience
                                experiences={doctor.experiences}
                                onChange={(i, k, v) => updateArray("experiences", i, k, v)}
                                onNext={() => setStep(5)}
                                onBack={() => setStep(3)}
                            />
                        )}
                        {step === 5 && (
                            <DoctorBio
                                bio={doctor.bio}
                                verified={doctor.verified}
                                onChange={updateField}
                                onBack={() => setStep(4)}
                                onSubmit={handleSubmit}
                            />
                        )}
                    </div>
                </div>
                <div className="mt-6 text-center text-sm text-white">
                    Already have an account?{" "}
                    <a href="/login" className="underline font-medium hover:text-gray-200">
                        Log in
                    </a>
                </div>
            </div>
            <Footer />
        </div>
    );
}
