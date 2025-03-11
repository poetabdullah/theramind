// TheraChat welcome/splash screen
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Footer from "../components/Footer";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [isOrangeTheme, setIsOrangeTheme] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (loggedInUser) => {
      if (!loggedInUser) {
        navigate("/login");
      } else {
        setUser(loggedInUser);
        try {
          const patientDoc = await getDoc(
            doc(db, "patients", loggedInUser.email)
          );
          const doctorDoc = await getDoc(
            doc(db, "doctors", loggedInUser.email)
          );

          if (!doctorDoc.exists() && !patientDoc.exists()) {
            navigate("/");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          navigate("/");
        } finally {
          setLoading(false);
        }
      }
    });
  }, [navigate]);

  useEffect(() => {
    // Toggle between orange and purple gradient
    const interval = setInterval(() => {
      setIsOrangeTheme((prev) => !prev);
    }, 3000); // Every 5 seconds for smoother transition
    return () => clearInterval(interval);
  }, []);
  const backgroundStyle = {
    background: isOrangeTheme
      ? "linear-gradient(to bottom right, #752400, #EA8B4E)" // More Contrast in Orange
      : "linear-gradient(to bottom right, #140024, #7765E3)", // Deep Purple → Softer Indigo
    backgroundSize: "200% 200%",
    animation: "gradientShift 8s ease infinite alternate",
    transition: "background 3.5s ease-in-out",
  };

  if (loading) return null; // Prevents flickering while checking auth

  return (
    <div>
      <div
        className="flex justify-center items-center min-h-screen w-full transition-all duration-1000 ease-in-out"
        style={backgroundStyle}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center"
        >
          <motion.h1
            className="text-6xl font-extrabold text-white drop-shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Welcome to <span className="text-white">TheraChat</span>
          </motion.h1>
          <motion.p
            className="text-lg text-gray-200 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Your AI-powered mental health companion
          </motion.p>
          <motion.button
            className="mt-8 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-orange-600 rounded-full shadow-lg hover:scale-105 hover:from-orange-600 hover:to-indigo-600 transition-transform"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            onClick={() => navigate("/therachat")}
          >
            Start Chat
          </motion.button>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default SplashScreen;
