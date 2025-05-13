import React, { useState, useEffect } from "react";
import { GoogleAuthProvider, signOut, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";  // removed storage import
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

// initialize storage instance
const storage = getStorage();

// Upload file and return URL
async function uploadFile(path, file) {
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
}

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
        status: "pending",
    });

    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        signOut(auth).catch(() => { });
    }, []);

    const handleGoogleSignUp = async () => {
        setError("");
        try {
            await signOut(auth);
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });
            const { user } = await signInWithPopup(auth, provider);
            const docRef = doc(db, "doctors", user.email);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                if (data.status === "approved") return navigate("/doctor-dashboard");
                setError(data.status === "pending"
                    ? "Your application is still pending approval."
                    : "Your application has been rejected. Contact TheraMind for more information.");
                return navigate("/");
            }
            setDoctor(d => ({ ...d, uid: user.uid, email: user.email, fullName: user.displayName || "" }));
            setStep(2);
        } catch (err) {
            console.error("OAuth Error:", err);
            setError(err.message || "Google sign-in failed. Please try again.");
        }
    };

    const updateField = (field, value) => setDoctor(d => ({ ...d, [field]: value }));

    const updateArray = (arr, idx, key, value) => {
        const copy = [...doctor[arr]];
        copy[idx] = { ...copy[idx], [key]: value };
        setDoctor(d => ({ ...d, [arr]: copy }));
    };

    const handleSubmit = async () => {
        setError("");
        try {
            if (!doctor.email) throw new Error("Missing user credentials.");

            // Ensure the user is signed in before uploading the files
            const user = auth.currentUser; // Ensure user is signed in

            if (!user) throw new Error("User is not authenticated. Please sign in first.");

            // Upload education files
            const education = await Promise.all(doctor.education.map(async (edu, i) => {
                let proofUrl = null;
                if (edu.proof) proofUrl = await uploadFile(`doctors/${doctor.email}/education${i}`, edu.proof);
                return { ...edu, proof: proofUrl };
            }));

            // Upload experience files
            const experiences = await Promise.all(doctor.experiences.map(async (exp, i) => {
                let resumeUrl = null;
                if (exp.resume) resumeUrl = await uploadFile(`doctors/${doctor.email}/experience${i}`, exp.resume);
                return { ...exp, resume: resumeUrl };
            }));

            // Prepare the data for Firestore
            const dataToSave = {
                ...doctor,
                profilePic: doctor.profilePic || null,  // Comes from Google photoURL
                education,
                experiences,
                createdAt: new Date(),
            };

            // Save data to Firestore
            await setDoc(doc(db, "doctors", doctor.email), dataToSave);

            setSubmitted(true);
        } catch (err) {
            console.error("Submission Error:", err);
            setError(err.message || "Failed to submit application. Please try again.");
        }
    };


    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-bold mb-4">Application Submitted</h2>
                    <p className="text-gray-700">
                        Your application has been submitted and is pending review. We will contact you via email once a decision is made.
                    </p>
                    <button onClick={() => navigate("/")} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
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
                        <h1 className="text-2xl font-bold text-orange-600">Create Your TheraMind Doctor Account</h1>
                        <p className="text-gray-600 mt-2">Step {step} of {steps.length}</p>
                    </div>
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    )}
                    <div className="transition-all duration-300">
                        {step === 1 && <OAuthSignUp onSuccess={handleGoogleSignUp} buttonText="Sign up with Google" />}
                        {step === 2 && <DoctorDetails data={doctor} onChange={updateField} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                        {step === 3 && <DoctorEducationDetails education={doctor.education} onChange={(i, k, v) => updateArray("education", i, k, v)} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
                        {step === 4 && <DoctorExperience experiences={doctor.experiences} onChange={(i, k, v) => updateArray("experiences", i, k, v)} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
                        {step === 5 && <DoctorBio bio={doctor.bio} verified={doctor.verified} onChange={updateField} onBack={() => setStep(4)} onSubmit={handleSubmit} />}
                    </div>
                </div>
                <div className="mt-6 text-center text-sm text-white">
                    Already have an account? <a href="/login" className="underline font-medium hover:text-gray-200">Log in</a>
                </div>
            </div>
            <Footer />
        </div>
    );
}