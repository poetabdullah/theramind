// PatientSignUp.js (Optimized OAuth, same logic)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import StepProgress from "../components/StepProgress";
import OAuthSignUp from "../components/OAuthSignUp";
import PatientDetailForm from "../components/PatientDetailForm";
import HealthHistoryForm from "../components/HealthHistoryForm";
import EnterCaptchaForm from "../components/EnterCaptchaForm";
import EnterTwoFactorForm from "../components/EnterTwoFactorForm";
import Footer from "../components/Footer";

// Define steps once
const steps = [
  "Sign Up",       // 1
  "Enter 2FA",     // 2
  "Enter CAPTCHA", // 3
  "Enter Details", // 4
  "Health History" // 5
];

// Define OAuth scopes once
const OAUTH_SCOPES = [
  // Non-sensitive
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  "https://www.googleapis.com/auth/calendar.events.freebusy",
  "https://www.googleapis.com/auth/calendar.app.created",
  "https://www.googleapis.com/auth/calendar.events.public.readonly",
  "https://www.googleapis.com/auth/calendar.settings.readonly",
  "https://www.googleapis.com/auth/calendar.freebusy",
  "https://www.googleapis.com/auth/meetings.space.settings",
  // Sensitive
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
  "https://www.googleapis.com/auth/meetings.space.created",
  "https://www.googleapis.com/auth/meetings.space.readonly",
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

  // Memoize auth instance
  const authInstance = useMemo(() => auth, []);
  // Prepare a single GoogleAuthProvider instance with scopes & parameters
  const googleProvider = useMemo(() => {
    const provider = new GoogleAuthProvider();
    // Force account selector & consent
    provider.setCustomParameters({ prompt: "select_account" });
    provider.setCustomParameters({ prompt: "consent" });
    // Add scopes once
    OAUTH_SCOPES.forEach((scope) => provider.addScope(scope));
    return provider;
  }, []);

  // Ensure any existing Firebase auth session is signed out before signup starts
  useEffect(() => {
    (async () => {
      try {
        await signOut(authInstance);
      } catch {
        // ignore if no active user
      }
    })();
  }, [authInstance]);

  // Generate a new CAPTCHA when step === 3
  const generateCaptcha = useCallback(() => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(captcha);
    setUserInput("");
  }, []);

  useEffect(() => {
    if (step === 3) {
      generateCaptcha();
    }
  }, [step, generateCaptcha]);

  // === Step 1: Google Sign-Up handler ===
  const handleGoogleSignUp = useCallback(async () => {
    setError({});
    try {
      // Always sign out cached user so prompt appears
      await signOut(authInstance);
      // Sign in with pre-configured provider
      const result = await signInWithPopup(authInstance, googleProvider);
      const user = result.user;
      // Check if patient exists
      const userDoc = await getDoc(doc(db, "patients", user.email));
      if (userDoc.exists()) {
        navigate("/patient-dashboard");
      } else {
        setUserData((prev) => ({
          ...prev,
          name: user.displayName || "",
          email: user.email || "",
        }));
        setStep(2);
      }
    } catch (authErr) {
      console.error("Google Sign-In Error:", authErr);
      setError({ general: "Google sign-in failed. Please try again." });
    }
  }, [authInstance, googleProvider, navigate]);

  // === Step 3: Verify CAPTCHA ===
  const handleVerifyCaptcha = useCallback(() => {
    if (userInput.trim().toUpperCase() === captchaCode.toUpperCase()) {
      setStep(4);
      setError({});
    } else {
      setError({ general: "Invalid CAPTCHA. Please try again." });
      generateCaptcha();
    }
  }, [userInput, captchaCode, generateCaptcha]);

  // === Step 4: Patient details submit ===
  const handlePatientDetailsSubmit = useCallback(
    (data) => {
      if (data.dob && data.location) {
        setUserData((prev) => ({ ...prev, ...data }));
        setStep(5);
        setError({});
      } else {
        setError({ general: "Please fill in all required fields." });
      }
    },
    []
  );

  // === Step 5: Health history submit ===
  const handleHealthHistorySubmit = useCallback(
    async (historyData) => {
      try {
        const finalData = {
          ...userData,
          ...historyData,
          createdAt: new Date(),
          userId: authInstance.currentUser
            ? authInstance.currentUser.uid
            : Date.now().toString(),
        };
        await setDoc(doc(db, "patients", finalData.email), finalData);
        navigate("/patient-dashboard");
      } catch (err) {
        console.error("Error saving user data:", err);
        setError({
          general: "Failed to save your health history. Please try again.",
        });
      }
    },
    [userData, authInstance, navigate]
  );

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
              Create Your Patient TheraMind Account
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
              <EnterTwoFactorForm
                email={userData.email}
                onSuccess={() => setStep(3)}
                error={error.general}
              />
            )}

            {step === 3 && (
              <EnterCaptchaForm
                captchaCode={captchaCode}
                setUserInput={setUserInput}
                onSubmit={handleVerifyCaptcha}
                error={error.general}
              />
            )}

            {step === 4 && (
              <PatientDetailForm
                onSubmit={handlePatientDetailsSubmit}
                error={error}
                initialData={userData}
              />
            )}

            {step === 5 && (
              <HealthHistoryForm
                onSubmit={handleHealthHistorySubmit}
                error={error}
              />
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-white">
          <p>
            Already have an account?{" "}
            <a
              href="/login"
              className="text-white font-medium underline hover:text-gray-500"
            >
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
