import React, { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import StepProgress from "../components/StepProgress";
import OAuthSignUp from "../components/OAuthSignUp";
import PatientDetailForm from "../components/PatientDetailForm";
import HealthHistoryForm from "../components/HealthHistoryForm";

const steps = ["Sign Up with Google", "Enter Details", "Health History"];

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
  const [error, setError] = useState({});
  const [isUserRegistered, setIsUserRegistered] = useState(false); // Track registration status
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in and registered when the component loads
    const checkIfUserIsLoggedIn = async () => {
      const user = auth.currentUser;

      if (user) {
        // User is logged in, check if they are registered
        const docRef = doc(db, "patients", user.email);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // User is already registered
          setIsUserRegistered(true);
          setStep(4); // Show "Already Registered" page
        } else {
          // User is not registered, allow them to proceed with sign-up
          setUserData({
            ...userData,
            name: user.displayName,
            email: user.email,
          });
          setStep(2); // Go to details form
        }
      } else {
        // User is not logged in, show the sign-up option
        setStep(1);
      }
    };

    checkIfUserIsLoggedIn(); // Run on mount
  }, [userData.email]); // Re-run when the email changes (sign-up)

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user is already registered
      const docRef = doc(db, "patients", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setIsUserRegistered(true);
        setStep(4); // Show "Already Registered" page
        navigate("/"); // Redirect to home page after user is registered
      } else {
        // If not registered, proceed with the sign-up process
        setUserData({
          ...userData,
          name: user.displayName || "",
          email: user.email || "",
        });
        setStep(2); // Move to details form
      }
    } catch (err) {
      setError({ general: "Google sign-in failed. Please try again." });
      console.error(err);
    }
  };

  const handleStepTwoSubmit = (data) => {
    // Check if both fields are valid before proceeding
    if (data.dob && data.location) {
      setUserData({ ...userData, ...data });
      setStep(3); // Move to health history step
      setError({}); // Clear any previous errors
    } else {
      setError({ ...data, general: "Please fill in all required fields." });
    }
  };

  const handleStepThreeSubmit = async (historyData) => {
    const finalData = { ...userData, ...historyData, createdAt: new Date() };
    try {
      await setDoc(doc(db, "patients", finalData.email), finalData);
      navigate("/"); // Redirect after registration
    } catch (err) {
      setError({ general: "Failed to save user data. Please try again." });
      console.error(err);
    }
  };

  const handleLoginRedirect = () => {
    // Redirect to login if user is not logged in
    navigate("/login");
  };

  if (isUserRegistered) {
    return (
      <div>
        <h2>You are already registered.</h2>
        <p>
          Please{" "}
          <button onClick={handleLoginRedirect} className="text-blue-600">
            Log in here
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xl mb-6">
        <StepProgress steps={steps} currentStep={step} />
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        {error.general && (
          <div className="text-red-500 mb-4">{error.general}</div>
        )}

        {step === 1 && !isUserRegistered && (
          <OAuthSignUp onSuccess={handleGoogleSignUp} />
        )}
        {step === 2 && !isUserRegistered && (
          <PatientDetailForm onSubmit={handleStepTwoSubmit} error={error} />
        )}
        {step === 3 && !isUserRegistered && (
          <HealthHistoryForm onSubmit={handleStepThreeSubmit} error={error} />
        )}
      </div>
    </div>
  );
};

export default PatientSignUp;
