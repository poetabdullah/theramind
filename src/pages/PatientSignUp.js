import React, { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import StepProgress from "../components/StepProgress";
import OAuthSignUp from "../components/OAuthSignUp";
import PatientDetailForm from "../components/PatientDetailForm";
import HealthHistoryForm from "../components/HealthHistoryForm";

const steps = [
  "Sign Up with Google",
  "Verify Email",
  "Enter Details",
  "Health History",
];

const PatientSignUp = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    dob: "",
    location: "",
    mentalHealthConditions: [],
    familyHistory: "",
    significantTrauma: "",
    childhoodChallenges: [],
  });
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState({});
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    try {
      // Sign out any existing user (clear cached sessions)
      await signOut(auth);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user is already registered in Firebase Authentication
      const userExists = await getDoc(doc(db, "patients", user.email));

      if (userExists.exists()) {
        console.log("User already exists in Firestore, redirecting...");
        navigate("/");
      } else {
        // Store basic user data locally
        setUserData({ name: user.displayName, email: user.email });

        // Send email verification (simulating OTP for demo purposes)
        await sendSignInLinkToEmail(auth, user.email, {
          url: "https://your-app-domain/verify",
          handleCodeInApp: true,
        });

        setVerificationCodeSent(true); // Set this flag to show OTP step
        setStep(2); // Move to step 2 for verification
      }
    } catch (err) {
      console.error("Google Sign-In Error:", err.message);
      setError({ general: "Google sign-in failed. Please try again." });
    }
  };

  const handleVerificationSubmit = (code) => {
    if (code === verificationCode) {
      setStep(3); // Move to step 3 if verification succeeds
    } else {
      setError({ general: "Invalid verification code. Please try again." });
    }
  };

  const handleStepThreeSubmit = (data) => {
    // Validate the details form and move to step 4
    if (data.dob && data.location) {
      setUserData({ ...userData, ...data });
      setStep(4);
    } else {
      setError({ general: "Please fill in all required fields." });
    }
  };

  const handleStepFourSubmit = async (historyData) => {
    const finalData = { ...userData, ...historyData, createdAt: new Date() };
    try {
      await setDoc(doc(db, "patients", finalData.email), finalData);
      navigate("/"); // Redirect to home page after successful sign up
    } catch (err) {
      setError({ general: "Failed to save user data. Please try again." });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xl mb-6">
        <StepProgress steps={steps} currentStep={step} />
      </div>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        {error.general && (
          <div className="text-red-500 mb-4">{error.general}</div>
        )}

        {step === 1 && <OAuthSignUp onSuccess={handleGoogleSignUp} />}
        {step === 2 && verificationCodeSent && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Check your email for the verification code
            </h2>
            <input
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <button
              onClick={() => handleVerificationSubmit(verificationCode)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg mt-4"
            >
              Verify
            </button>
            {error.general && (
              <p className="text-red-500 mt-2">{error.general}</p>
            )}
          </div>
        )}
        {step === 3 && (
          <PatientDetailForm onSubmit={handleStepThreeSubmit} error={error} />
        )}
        {step === 4 && (
          <HealthHistoryForm onSubmit={handleStepFourSubmit} error={error} />
        )}
      </div>
    </div>
  );
};

export default PatientSignUp;
