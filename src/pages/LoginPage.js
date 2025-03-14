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
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Check if the user is already logged in when component loads
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is authenticated, check if they are registered
        const docRef = doc(db, "patients", user.email); // Assuming email as document ID
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          navigate("/"); // Redirect to home if logged in and registered
        } else {
          navigate("/signup"); // Redirect to signup if not registered
        }
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user is already registered
      const docRef = doc(db, "patients", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // User is already registered
        await setDoc(
          docRef,
          {
            lastLogin: new Date(),
          },
          { merge: true }
        );

        navigate("/patient-dashboard"); // Redirect to dashboard after successful login
      } else {
        // If not registered, redirect to sign-up page
        navigate("/signup");
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
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
                href="/signup"
                className="text-purple-600 font-medium cursor-pointer hover:text-purple-800"
              >
                Sign up
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
