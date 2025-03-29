import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Footer from "../components/Footer";

const SplashScreen = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [gradientAngle, setGradientAngle] = useState(0);

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

  // Enhanced animation for gradient rotation
  useEffect(() => {
    const animateGradient = () => {
      setGradientAngle((prev) => (prev + 0.5) % 360);
    };

    const interval = setInterval(animateGradient, 30);
    return () => clearInterval(interval);
  }, []);

  // Dynamic background style with smoother animation
  const backgroundStyle = {
    background: `
      linear-gradient(
        ${gradientAngle}deg,
        #2b3582 0%,
        #5643cc 20%,
        #7765E3 40%,
        #9d4edd 60%,
        #e07a5f 80%,
        #3a86ff 100%
      )
    `,
    backgroundSize: "400% 400%",
    transition: "background 0.3s ease",
  };

  if (loading) return null; // Prevents flickering while checking auth

  return (
    <div>
      <div
        className="flex justify-center items-center min-h-screen w-full relative overflow-hidden"
        style={backgroundStyle}
      >
        {/* Professional night sky effect with shooting stars */}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)]">
          {/* Distant stars - subtle twinkling effect */}
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + 1 + "px",
                height: Math.random() * 2 + 1 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                opacity: Math.random() * 0.5 + 0.2,
              }}
              animate={{
                opacity: [
                  Math.random() * 0.3 + 0.2,
                  Math.random() * 0.5 + 0.5,
                  Math.random() * 0.3 + 0.2,
                ],
              }}
              transition={{
                duration: Math.random() * 4 + 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Shooting stars */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`shooting-${i}`}
              className="absolute h-px rounded-full bg-white origin-left"
              style={{
                width: Math.random() * 80 + 120 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 60 + "%",
                opacity: 0,
                rotate: Math.random() * 20 - 10 + "deg",
                background: "linear-gradient(90deg, transparent, white 50%, rgba(255,255,255,0.8))",
                boxShadow: "0 0 6px 2px rgba(255,255,255,0.4)",
              }}
              animate={{
                opacity: [0, 1, 0],
                x: ["-50%", "150%"],
              }}
              transition={{
                duration: Math.random() * 0.8 + 0.6,
                repeat: Infinity,
                repeatDelay: Math.random() * 8 + 4,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Nebula-like subtle glow spots */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`nebula-${i}`}
              className="absolute rounded-full blur-3xl"
              style={{
                width: Math.random() * 300 + 200 + "px",
                height: Math.random() * 300 + 200 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                background: i % 2 === 0 ? "rgba(157, 78, 221, 0.05)" : "rgba(58, 134, 255, 0.05)",
                opacity: 0.2,
              }}
              animate={{
                opacity: [0.1, 0.2, 0.1],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: Math.random() * 15 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center z-10"
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
            className="mt-8 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg hover:scale-105 hover:from-purple-500 hover:to-indigo-500 transition-transform"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            whileHover={{
              boxShadow: "0 0 20px rgba(157, 78, 221, 0.6)",
              scale: 1.05
            }}
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