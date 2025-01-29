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

        navigate("/"); // Redirect to home page after successful login
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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-orange-600">
          Login to TheraMind
        </h2>
        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 px-6 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 flex items-center justify-center text-lg font-medium"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login with Google"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
