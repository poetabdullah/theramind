import React from "react";
import { motion } from "framer-motion";

const MeditationHeader = () => {
  return (
    <header className="meditation-header relative bg-gradient-to-r from-purple-600 to-orange-500 py-20">
      {/* Animated Heading */}
      <motion.h1
        initial={{ opacity: 0, y: -30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
        className="text-6xl font-extrabold text-white text-center mb-4 tracking-wide"
      >
        Welcome to TheraMind Meditation
      </motion.h1>

      {/* Animated Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        className="mt-6 text-lg md:text-xl max-w-2xl mx-auto font-light text-white text-center"
      >
        Discover the transformative power of meditation for your mental health journey. 
        Our guided practices help reduce stress, improve focus, and enhance emotional 
        well-being in just minutes a day. Begin your path to inner peace and mindfulness.
      </motion.p>
    </header>
  );
};

export default MeditationHeader;