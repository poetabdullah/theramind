import React from "react";
import { motion } from "framer-motion";

const affirmations = [
  "I am calm, focused, and peaceful.",
  "I am in control of my thoughts and emotions.",
  "I am worthy of love and self-care.",
];

const DailyAffirmation = () => {
  const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

  return (
    <motion.section
      className="daily-affirmation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h2>Daily Affirmation</h2>
      <motion.p whileHover={{ scale: 1.05 }}>{randomAffirmation}</motion.p>
    </motion.section>
  );
};

export default DailyAffirmation;
