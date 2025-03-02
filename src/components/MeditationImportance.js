import React from "react";
import { motion } from "framer-motion";

const MeditationImportance = () => {
  return (
    <motion.div
      className="importance-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="importance-content">
        <h2>Why Meditation Matters</h2>
        <p>
          Meditation helps in reducing stress, improving focus, and promoting
          emotional well-being. Practicing daily can enhance mindfulness and
          create a sense of inner peace.
        </p>
      </div>
      <div className="importance-image">
      <img 
               src="/img/meditation.png">

               </img>
      </div>
    </motion.div>
  );
};

export default MeditationImportance;