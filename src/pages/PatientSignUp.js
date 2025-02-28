import React, { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import StepProgress from "../components/StepProgress";
import OAuthSignUp from "../components/OAuthSignUp";
import PatientDetailForm from "../components/PatientDetailForm";
import HealthHistoryForm from "../components/HealthHistoryForm";
import EnterOTPForm from "../components/EnterOTPForm";

const steps = [
  "Sign Up with Google",
  "Enter OTP",
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
  const [otp, setOtp] = useState("");
  const [error, setError] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing auth state when component mounts
    const cleanupAuth = async () => {
      try {
        await signOut(auth);
      } catch (err) {
        console.log("No active user to sign out");
      }
    };

    cleanupAuth();
  }, []);

  const handleGoogleSignUp = async () => {
    setError({});
    try {
      await signOut(auth);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      setUserData({ name: user.displayName || "", email: user.email || "" });
      await sendEmailVerification(user);
      setStep(2);
    } catch (authErr) {
      console.error("Google Sign-In Error:", authErr.message);
      setError({ general: "Google sign-in failed. Please try again." });
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setStep(3);
        setError({});
      } else {
        setError({ general: "Invalid OTP. Please check and try again." });
      }
    } catch (err) {
      console.error("OTP verification failed:", err);
      setError({ general: "Error verifying OTP. Please try again." });
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
        console.log("User data saved successfully");
        navigate("/");
      } else {
        console.log("User already exists in database, redirecting...");
        navigate("/");
      }
    } catch (err) {
      console.error("Error saving user data:", err);
      setError({ general: "Failed to save user data. Please try again." });
    }
  };

  const handleRetry = async () => {
    setStep(1);
    setError({});

    try {
      await signOut(auth);
    } catch (err) {
      console.error("Error signing out:", err);
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
            {(step === 1 || step === 2) && (
              <button
                onClick={handleRetry}
                className="text-blue-500 underline text-sm mt-2"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {step === 1 && <OAuthSignUp onSuccess={handleGoogleSignUp} />}

        {step === 2 && (
          <EnterOTPForm
            otp={otp}
            setOtp={setOtp}
            onSubmit={handleVerifyOTP}
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
