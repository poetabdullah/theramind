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

      setUserData({ name: user.displayName || "", email: user.email || "" });
      setStep(2);
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
        navigate("/");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Error saving user data:", err);
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
          <div className="text-red-500 mb-4 bg-red-50 p-3 rounded border border-red-200">
            <p>{error.general}</p>
          </div>
        )}

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
          <HealthHistoryForm onSubmit={handleStepFourSubmit} error={error} />
        )}
      </div>
    </div>
  );
};

export default PatientSignUp;
