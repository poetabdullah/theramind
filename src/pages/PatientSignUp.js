// PatientSignUp.js (Updated to request OAuth scopes for patients)

import React, { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut
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

const steps = [
  "Sign Up",      // 1
  "Enter 2FA",    // 2
  "Enter CAPTCHA",// 3
  "Enter Details",// 4
  "Health History"// 5
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
    childhoodChallenges: []
  });
  const [captchaCode, setCaptchaCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [error, setError] = useState({});
  const navigate = useNavigate();

  // Ensure any existing Firebase auth session is signed out before starting signup
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

  // Generate a new CAPTCHA when we arrive at step 3
  useEffect(() => {
    if (step === 3) {
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
    setUserInput(""); // clear previous input
  };

  // Step 1: Handle Google Sign-Up (patient only needs email + profile)
  const handleGoogleSignUp = async () => {
    setError({});
    try {
      // Always sign out any cached user so "select_account" prompt appears
      await signOut(auth);

      const provider = new GoogleAuthProvider();

      // Force account selector & consent every time
      provider.setCustomParameters({ prompt: "select_account" });

      // 1) Ensure the consent prompt always appears when we sign in:
      provider.setCustomParameters({ prompt: "consent" });

      // 2) Add all non-sensitive scopes:
      provider.addScope("https://www.googleapis.com/auth/userinfo.email");
      provider.addScope("https://www.googleapis.com/auth/calendar.calendarlist.readonly");
      provider.addScope("https://www.googleapis.com/auth/calendar.events.freebusy");
      provider.addScope("https://www.googleapis.com/auth/calendar.app.created");
      provider.addScope("https://www.googleapis.com/auth/calendar.events.public.readonly");
      provider.addScope("https://www.googleapis.com/auth/calendar.settings.readonly");
      provider.addScope("https://www.googleapis.com/auth/calendar.freebusy");
      provider.addScope("https://www.googleapis.com/auth/meetings.space.settings");
      provider.addScope("https://www.googleapis.com/auth/userinfo.profile");

      // 3) Add all sensitive scopes:
      provider.addScope("https://www.googleapis.com/auth/calendar");
      provider.addScope("https://www.googleapis.com/auth/calendar.events");
      provider.addScope("https://www.googleapis.com/auth/calendar.acls");
      provider.addScope("https://www.googleapis.com/auth/calendar.acls.readonly");
      provider.addScope("https://www.googleapis.com/auth/calendar.calendars");
      provider.addScope("https://www.googleapis.com/auth/calendar.calendars.readonly");
      provider.addScope("https://www.googleapis.com/auth/calendar.readonly");
      provider.addScope("https://www.googleapis.com/auth/calendar.events.owned");
      provider.addScope("https://www.googleapis.com/auth/calendar.events.owned.readonly");
      provider.addScope("https://www.googleapis.com/auth/calendar.events.readonly");
      provider.addScope("https://www.googleapis.com/auth/meetings.space.created");
      provider.addScope("https://www.googleapis.com/auth/meetings.space.readonly");


      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if this email already exists under "patients" in Firestore
      const userDoc = await getDoc(doc(db, "patients", user.email));

      if (userDoc.exists()) {
        // If patient already exists, send them straight to dashboard
        navigate("/patient-dashboard");
      } else {
        // New patient → advance to 2FA (step 2), preserving name & email
        setUserData({
          name: user.displayName || "",
          email: user.email || ""
        });
        setStep(2);
      }
    } catch (authErr) {
      console.error("Google Sign-In Error:", authErr.message);
      setError({ general: "Google sign-in failed. Please try again." });
    }
  };

  // Step 2: 2FA Verification is handled by EnterTwoFactorForm
  // Step 3: CAPTCHA Verification
  const handleVerifyCaptcha = () => {
    if (userInput.trim().toUpperCase() === captchaCode.toUpperCase()) {
      setStep(4);
      setError({});
    } else {
      setError({ general: "Invalid CAPTCHA. Please try again." });
      generateCaptcha();
    }
  };

  // Step 4: Patient Details Form
  const handlePatientDetailsSubmit = (data) => {
    if (data.dob && data.location) {
      setUserData({ ...userData, ...data });
      setStep(5);
      setError({});
    } else {
      setError({ general: "Please fill in all required fields." });
    }
  };

  // Step 5: Health History Form → save to Firestore
  const handleHealthHistorySubmit = async (historyData) => {
    try {
      const finalData = {
        ...userData,
        ...historyData,
        createdAt: new Date(),
        userId: auth.currentUser ? auth.currentUser.uid : Date.now().toString()
      };

      await setDoc(doc(db, "patients", finalData.email), finalData);
      navigate("/patient-dashboard");
    } catch (err) {
      console.error("Error saving user data:", err);
      setError({ general: "Failed to save your health history. Please try again." });
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
            {step === 1 && (
              <OAuthSignUp onSuccess={handleGoogleSignUp} />
            )}

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
