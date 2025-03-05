// PatientSignUp.js (Updated for CAPTCHA)

import React, { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import StepProgress from "../components/StepProgress";
import OAuthSignUp from "../components/OAuthSignUp";
import PatientDetailForm from "../components/PatientDetailForm";
import HealthHistoryForm from "../components/HealthHistoryForm";
import EnterCaptchaForm from "../components/EnterCaptchaForm";
import Footer from "../components/Footer";

const steps = [
  "Sign Up with Google",
  "Enter CAPTCHA",
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
  const [captchaCode, setCaptchaCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const cleanupAuth = async () => {
      try {
        await signOut(auth);
      } catch (err) {
        console.log("No active user to sign out");
      }
    };
    cleanupAuth();
  }, []);

  useEffect(() => {
    if (step === 2) {
      generateCaptcha();
    }
  }, [step]);

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(captcha);
  };

  const handleGoogleSignUp = async () => {
    setError({});
    try {
      await signOut(auth);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if patient already exists in Firestore
      const userDoc = await getDoc(doc(db, "patients", user.email));

      if (userDoc.exists()) {
        // If user exists, navigate directly to dashboard
        navigate("/patient-dashboard");
      } else {
        // If new user, proceed with signup steps
        setUserData({ name: user.displayName || "", email: user.email || "" });
        setStep(2);
      }
    } catch (authErr) {
      console.error("Google Sign-In Error:", authErr.message);
      setError({ general: "Google sign-in failed. Please try again." });
    }
  };

  const handleVerifyCaptcha = () => {
    if (userInput.trim().toUpperCase() === captchaCode.toUpperCase()) {
      setStep(3);
      setError({});
    } else {
      setError({ general: "Invalid CAPTCHA. Please try again." });
      generateCaptcha();
    }
  };

  const handleStepThreeSubmit = (data) => {
    if (data.dob && data.location) {
      setUserData({ ...userData, ...data });
      setStep(4);
      setError({});
    } else {
      setError({ general: "Please fill in all required fields." });
    }
  };

  const handleStepFourSubmit = async (historyData) => {
    const finalData = {
      ...userData,
      ...historyData,
      createdAt: new Date(),
      userId: auth.currentUser ? auth.currentUser.uid : Date.now().toString(),
    };

    try {
      const userDoc = await getDoc(doc(db, "patients", finalData.email));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "patients", finalData.email), finalData);
        navigate("/patient-dashboard");
      } else {
        navigate("/patient-dashboard");
      }
    } catch (err) {
      console.error("Error saving user data:", err);
      setError({ general: "Failed to save user data. Please try again." });
    }
  };

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
            <h1 className="text-2xl font-bold text-purple-700">
              Create Your TheraMind Account
            </h1>
            <p className="text-gray-600 mt-2">
              Step {step} of {steps.length}
            </p>
          </div>

          {error.general && (
            <div className="text-red-500 mb-6 bg-red-50 p-4 rounded-lg border border-red-200 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <p>{error.general}</p>
            </div>
          )}

          <div className="transition-all duration-300">
            {step === 1 && <OAuthSignUp onSuccess={handleGoogleSignUp} />}

            {step === 2 && (
              <EnterCaptchaForm
                captchaCode={captchaCode}
                setUserInput={setUserInput}
                onSubmit={handleVerifyCaptcha}
                error={error.general}
              />
            )}

            {step === 3 && (
              <PatientDetailForm
                onSubmit={handleStepThreeSubmit}
                error={error}
                initialData={userData}
              />
            )}

            {step === 4 && (
              <HealthHistoryForm
                onSubmit={handleStepFourSubmit}
                error={error}
              />
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-white">
          <p>
            Already have an account?{" "}
            <a href="/login" className="font-medium underline">
              Login
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PatientSignUp;
