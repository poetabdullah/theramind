import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [colors, setColors] = useState(["#4B0082", "#7B1FA2"]); // Indigo → Purple
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
    // Repeating gradient animation with darker orange
    const interval = setInterval(() => {
      setColors((prev) =>
        prev[0] === "#4B0082" ? ["#D35400", "#E67E22"] : ["#4B0082", "#7B1FA2"]
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null; // Prevents flickering while checking auth

  return (
    <div
      className="flex justify-center items-center min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
        transition: "background 1.5s ease-in-out",
      }}
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
          className="mt-8 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-orange-500 rounded-full shadow-lg hover:scale-105 hover:from-orange-500 hover:to-purple-500 transition-transform"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          onClick={() => navigate("/therachat")}
        >
          Start Chat
        </motion.button>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
