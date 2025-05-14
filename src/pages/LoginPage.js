import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { setDoc, doc, getDoc } from "firebase/firestore";
import Footer from "../components/Footer";

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  // Optional: if you want to auto-redirect already-logged-in users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Don't auto-redirect here, let handleRouting take care of it
        // This prevents navigation while error messages might need to be shown
      }
    });
    return unsubscribe;
  }, [auth]);

  const handleRouting = async (email) => {
    try {
      // fetch all three docs in parallel
      const [patSnap, docSnap, adminSnap] = await Promise.all([
        getDoc(doc(db, "patients", email)),
        getDoc(doc(db, "doctors", email)),
        getDoc(doc(db, "admin", email)),
      ]);

      const isPatient = patSnap.exists();
      const isDoctor = docSnap.exists();
      const isAdmin = adminSnap.exists();

      // 1️⃣ Not in any → signup-landing
      if (!isPatient && !isDoctor && !isAdmin) {
        navigate("/signup-landing");
        return;
      }

      // 2️⃣ Patient (even if also doctor/admin) → patient-dashboard
      if (isPatient) {
        // update lastLogin
        await setDoc(
          doc(db, "patients", email),
          { lastLogin: new Date() },
          { merge: true }
        );
        navigate("/patient-dashboard");
        return;
      }

      // 3️⃣ Admin only → admin-dashboard
      if (isAdmin) {
        navigate("/admin-dashboard");
        return;
      }

      // 4️⃣ Doctor-only routing based on status
      if (isDoctor) {
        const { status } = docSnap.data(); // expecting "approved"|"pending"|"rejected"

        if (status === "approved") {
          await setDoc(
            doc(db, "doctors", email),
            { lastLogin: new Date() },
            { merge: true }
          );
          navigate("/doctor-dashboard");
          return;
        }

        // pending → display error & sign out
        if (status === "pending") {
          setError("Your doctor account is still pending approval. Please wait.");
          await signOut(auth);
          return;
        }

        // rejected → display error & sign out
        if (status === "rejected") {
          setError("Your doctor application was rejected. Please contact support.");
          await signOut(auth);
          return;
        }
      }
    } catch (error) {
      console.error("Error in routing:", error);
      setError("An error occurred during login. Please try again.");
      await signOut(auth);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // run our routing logic
      await handleRouting(user.email);
    } catch (error) {
      console.error("Google login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to dismiss error
  const dismissError = () => {
    setError(null);
  };

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-500 to-orange-600 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-purple-700 mb-2">
              Login to TheraMind
            </h1>
            <p className="text-gray-600">Welcome back</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <div className="flex items-start">
                <div className="flex-grow">
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
                <button
                  onClick={dismissError}
                  className="text-red-500 hover:text-red-700 ml-2"
                  aria-label="Dismiss"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500 hover:from-purple-700 hover:via-indigo-700 hover:to-orange-600 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Logging in...</span>
              </div>
            ) : (
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.0003 4.87566C13.7703 4.87566 15.3503 5.54566 16.5903 6.74566L20.0303 3.33566C17.9903 1.42566 15.2403 0.166656 12.0003 0.166656C7.31026 0.166656 3.25026 2.88666 1.28026 6.80666L5.28026 9.88666C6.24026 6.98666 8.89026 4.87566 12.0003 4.87566Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.08L19.945 21.095C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.28 14.1133C5.025 13.4433 4.875 12.7333 4.875 12.0033C4.875 11.2733 5.025 10.5633 5.28 9.89334L1.28 6.81334C0.47 8.39334 0 10.1433 0 12.0033C0 13.8633 0.47 15.6133 1.28 17.1933L5.28 14.1133Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24C15.2404 24 17.9904 22.935 19.9454 21.095L16.0804 18.08C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8904 19.245 6.24039 17.134 5.28039 14.234L1.28039 17.314C3.25039 21.234 7.31039 24 12.0004 24Z"
                    fill="#34A853"
                  />
                </svg>

                <span>Login with Google</span>
              </div>
            )}
          </button>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Don't have an account?{" "}
              <a
                href="/signup-landing"
                className="text-purple-600 font-medium hover:text-purple-800"
              >
                Start here
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;