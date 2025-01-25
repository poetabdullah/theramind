import React, { useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig"; // Firebase configuration
import { useNavigate } from "react-router-dom";
import StepProgress from "../components/StepProgress"; // Progress bar
import OAuthSignUp from "../components/OAuthSignUp"; // Google Sign-In
import PatientDetailForm from "../components/PatientDetailForm"; // Step 2 Form
import HealthHistoryForm from "../components/HealthHistoryForm"; // Step 3 Form

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
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Check if user already exists in Firestore
        const docRef = doc(db, "patients", user.email);
        getDoc(docRef).then((docSnap) => {
          if (docSnap.exists()) {
            setStep(4); // Already registered, show login option or message
          } else {
            setStep(2); // Proceed to Step 2
          }
        });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if the user is already signed up (based on their email)
      const docRef = doc(db, "patients", user.email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        // If the user already exists, show an error
        setError({ general: "You are already signed up." });
        setStep(4); // Show already signed-up message
      } else {
        // Set user data
        setUserData({
          ...userData,
          name: user.displayName || "",
          email: user.email || "",
        });

        // Proceed to Step 2 for entering patient details
        setStep(2);
      }
    } catch (err) {
      setError({ general: "Failed to sign up with Google. Please try again." });
      console.error(err);
    }
  };

  const handleStepTwoSubmit = (data) => {
    if (data.dob || data.location) {
      // Received valid data from Step 2
      setUserData({ ...userData, ...data });
      setStep(3);
      setError({});
    } else {
      // Received errors
      setError(data);
    }
  };

  const handleStepThreeSubmit = async (historyData) => {
    const finalData = { ...userData, ...historyData, createdAt: new Date() };

    try {
      // Save the user data to Firestore with the timestamp
      await setDoc(doc(db, "patients", finalData.email), finalData);
      navigate("/"); // Redirect to homepage after successful registration
    } catch (err) {
      setError({ general: "Failed to save user data. Please try again." });
      console.error(err);
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
        {step === 2 && (
          <PatientDetailForm
            onSubmit={handleStepTwoSubmit}
            error={error} // Pass error to PatientDetailForm
          />
        )}
        {step === 3 && (
          <HealthHistoryForm
            onSubmit={handleStepThreeSubmit}
            error={error} // Pass error to HealthHistoryForm
          />
        )}
        {step === 4 && (
          <div>
            <h3 className="text-xl text-center">You are already registered.</h3>
            <p className="text-center mt-2">
              Please{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600"
              >
                Log in here
              </button>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSignUp;
