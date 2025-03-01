import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const guidedExercises = [
  {
    id: 1,
    title: "Mindfulness Breath Awareness",
    steps: [
      "Sit comfortably and close your eyes.",
      "Take a deep breath in through your nose and exhale slowly.",
      "Focus on the sensation of your breath.",
      "If thoughts arise, gently bring your attention back to your breath."
    ],
  },
  {
    id: 2,
    title: "Body Scan Meditation",
    steps: [
      "Lie down or sit comfortably.",
      "Close your eyes and take deep breaths.",
      "Bring awareness to your toes, then slowly move up through your body.",
      "Relax each part as you focus on it."
    ],
  },
  {
    id: 3,
    title: "Loving-Kindness Meditation",
    steps: [
      "Sit comfortably and close your eyes.",
      "Focus on sending love and kindness to yourself.",
      "Extend this kindness to friends, family, and even strangers.",
      "Feel the warmth of compassion within you."
    ],
  },
];

const GuidedMeditation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === guidedExercises.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? guidedExercises.length - 1 : prevIndex - 1
    );
  };

  return (
    <section className="guided-meditation">
      <h2 className="section-title">Guided Meditation</h2>
      <div className="slider-container">
        <button className="slider-arrow left" onClick={prevSlide}>
          <FaChevronLeft />
        </button>
        <motion.div 
          className="exercise-card"
          whileHover={{ scale: 1.05 }}
        >
          <h3 onClick={() => setExpandedIndex(currentIndex)}>
            {guidedExercises[currentIndex].title}
          </h3>
          {expandedIndex === currentIndex && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.5 }}
              className="exercise-steps"
            >
              {guidedExercises[currentIndex].steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </motion.ul>
          )}
        </motion.div>
        <button className="slider-arrow right" onClick={nextSlide}>
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
};

export default GuidedMeditation;
