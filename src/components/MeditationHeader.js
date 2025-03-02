import React from "react";
import { motion } from "framer-motion";

const MeditationHeader = () => {
  return (
    <header className="meditation-header">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="title"
      >
        Welcome to TheraMind Meditation
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="subtitle"
      >
        Why Meditation is Important
      </motion.p>
    </header>
  );
};

export default MeditationHeader;
