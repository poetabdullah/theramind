import React from "react";
import { motion } from "framer-motion";

const benefits = [
  { title: "Reduces Stress", description: "Meditation helps lower stress levels and promotes relaxation." },
  { title: "Improves Focus", description: "Enhance your concentration and cognitive abilities through mindfulness." },
  { title: "Emotional Well-being", description: "Helps in managing emotions and reducing anxiety." },
];

const MeditationBenefits = () => {
  return (
    <div className="benefits-section">
      {benefits.map((benefit, index) => (
        <motion.div
          key={index}
          className="benefit-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.2, duration: 0.5 }}
        >
          <h3>{benefit.title}</h3>
          <p>{benefit.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default MeditationBenefits;