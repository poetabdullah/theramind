import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const AIAnalysisAnimation = ({ isVisible, onComplete, isSuccess, message }) => {
  const [stage, setStage] = useState(0);
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setStage(0);
      const timers = [
        setTimeout(() => setStage(1), 500),
        setTimeout(() => setStage(2), 1500),
        setTimeout(() => setStage(3), 3000),
        setTimeout(() => {
          setStage(4);
          setTimeout(() => onComplete(), 1500);
        }, 4500),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isVisible, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => (prev + 0.3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const backgroundStyle = {
    background: `
      linear-gradient(
        ${angle}deg,
        #2b3582 0%,
        #5643cc 25%,
        #7765E3 50%,
        #9d4edd 75%,
        #e07a5f 100%
      )
    `,
    backgroundSize: "400% 400%",
    transition: "background 0.3s ease",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={backgroundStyle}>
      {/* 🌠 Background Stars + Nebula */}
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.1)] z-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1 + "px",
              height: Math.random() * 2 + 1 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              opacity: Math.random() * 0.4 + 0.3,
            }}
            animate={{
              opacity: [
                Math.random() * 0.2 + 0.2,
                Math.random() * 0.5 + 0.4,
                Math.random() * 0.2 + 0.2,
              ],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 🧠 AI Status + Result Cards - PARALLEL + CENTERED */}
      {stage >= 1 && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}  // Early fade in
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 px-4">
            {/* Card 1: Analysis Info */}
            <div className="w-[300px] max-w-xs px-6 py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg text-center">
              <div className="text-white text-xl font-semibold">
                {stage < 4 ? "Analyzing..." : "Review Complete"}
              </div>
              <div className="text-indigo-200 mt-1 text-sm font-mono">
                {stage < 4 ? "SBERT + CNN pipeline" : "Final model decision"}
              </div>
            </div>

            {/* Card 2: Final Result */}
            <div className="w-[300px] max-w-xs px-6 py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg text-center">
              <div className={`text-3xl font-bold mb-3 ${isSuccess ? "text-emerald-400" : "text-rose-400"}`}>
                {isSuccess ? "✓ Clean" : "⚠ Action Needed"}
              </div>
              <div className="text-white font-medium text-base leading-relaxed">
                {message}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIAnalysisAnimation;
