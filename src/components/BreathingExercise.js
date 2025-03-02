import React from "react";
import { motion } from "framer-motion";

const BreathingExercise = () => {
  return (
    <motion.section
      className="breathing-exercise"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <h2 className="breathing-title">Breathing Exercise</h2>
      <motion.div
        className="breathing-circle"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      >
        <p>Breathe In...</p>
      </motion.div>
    </motion.section>
  );
};

export default BreathingExercise;