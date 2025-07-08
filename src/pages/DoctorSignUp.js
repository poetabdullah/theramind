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
        education: Array.from({ length: 2 }, () => ({ degree: "", institute: "", gradDate: "", proof: null })),
        experiences: Array.from({ length: 2 }, () => ({ org: "", role: "", start: "", end: "", resume: null })),
        bio: "",
        verified: false,
        STATUS: "pending",
    });
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();
    const authInstance = useMemo(() => auth, []);

    // prepare provider once
    const googleProvider = useMemo(() => {
        const p = new GoogleAuthProvider();
        p.setCustomParameters({ prompt: "select_account consent" });
        DOCTOR_OAUTH_SCOPES.forEach((s) => p.addScope(s));
        return p;
    }, []);

    // ensure logged out
    useEffect(() => { signOut(authInstance).catch(() => { }); }, [authInstance]);

    // Step 1: OAuth + parallel role/status check
    const handleGoogleSignUp = useCallback(async () => {
        setError("");
        try {
            await signOut(authInstance);
            const { user } = await signInWithPopup(authInstance, googleProvider);
            const email = user.email;
            const [docSnap, patSnap, adminSnap] = await Promise.all([
                getDoc(doc(db, "doctors", email)),
                getDoc(doc(db, "patients", email)),
                getDoc(doc(db, "admin", email)),
            ]);

            // doctor check
            if (STATUS === "blocked") {
                setError("Your doctor account is blocked.");
                setTimeout(() => { signOut(authInstance); navigate("/"); }, 3000);
                return;
            }
            if (STATUS === "approved") {
                await setDoc(doc(db, "doctors", email), { lastLogin: new Date() }, { merge: true });
                return navigate("/doctor-dashboard");
            }
            const msg = STATUS === "pending"
                ? "Your doctor application is pending approval."
                : "Your doctor application was rejected.";
            setError(msg);
            setTimeout(() => { signOut(authInstance); navigate("/"); }, 3000);

            // admin override
            if (adminSnap.exists()) {
                await setDoc(doc(db, "admin", email), { lastLogin: new Date() }, { merge: true });
                return navigate("/admin-dashboard");
            }

            // patient override
            if (patSnap.exists()) {
                const { status } = patSnap.data();
                if (status === "active") {
                    await setDoc(doc(db, "patients", email), { lastLogin: new Date() }, { merge: true });
                    return navigate("/patient-dashboard");
                }
                setError("Your patient account is blocked.");
                setTimeout(() => { signOut(authInstance); navigate("/"); }, 3000);
                return;
            }

            // new doctor: proceed to step 2
            setDoctor((d) => ({ ...d, uid: user.uid, email, fullName: user.displayName || "" }));
            setStep(2);
        } catch (err) {
            console.error(err);
            setError(err.message || "Google sign-in failed.");
        }
    }, [authInstance, googleProvider, navigate]);

    // update helpers
    const updateField = useCallback((k, v) => setDoctor((d) => ({ ...d, [k]: v })), []);
    const updateArray = useCallback((arr, i, k, v) => {
        setDoctor((d) => {
            const copy = [...d[arr]];
            copy[i] = { ...copy[i], [k]: v };
            return { ...d, [arr]: copy };
        });
    }, []);

    // final submit (step 5)
    const handleSubmit = useCallback(async () => {
        setError("");
        try {
            const user = authInstance.currentUser;
            if (!user) throw new Error("Not authenticated.");
            const education = await Promise.all(doctor.education.map(async (e, idx) => ({
                ...e,
                proof: e.proof ? await uploadFile(`doctors/${doctor.email}/edu${idx}`, e.proof) : null
            })));
            const experiences = await Promise.all(doctor.experiences.map(async (ex, idx) => ({
                ...ex,
                resume: ex.resume ? await uploadFile(`doctors/${doctor.email}/exp${idx}`, ex.resume) : null
            })));
            const payload = { ...doctor, education, experiences, createdAt: new Date() };
            await setDoc(doc(db, "doctors", doctor.email), payload);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError(err.message || "Submission failed.");
        }
    }, [doctor, authInstance]);

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <h2 className="text-2xl font-bold mb-4">Application Submitted</h2>
                    <p>Your application is pending review. We’ll be in touch soon.</p>
                    <button onClick={() => navigate("/")} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg">Home</button>
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
