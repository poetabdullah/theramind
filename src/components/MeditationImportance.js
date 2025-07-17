import React from "react";
import { motion } from "framer-motion";

const MeditationImportance = () => {
  return (
    <motion.div 
      className="flex items-center justify-center w-full py-12 bg-gradient-to-br from-purple-50 to-pink-50"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: "easeOut" 
      }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-12">
        {/* Content Section */}
        <motion.div 
          className="w-full md:w-1/2 p-6 bg-white rounded-xl shadow-lg"
          whileHover={{ 
            scale: 1.03,
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)"
          }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="text-3xl font-bold text-purple-800 mb-4">
            Why Meditation Matters
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Meditation helps in reducing stress, improving focus, and promoting 
            emotional well-being. Practicing daily can enhance mindfulness and 
            create a sense of inner peace. By dedicating just a few minutes each 
            day, you can transform your mental landscape and cultivate a more 
            balanced, centered approach to life's challenges.
          </p>
        </motion.div>

        {/* Image Section */}
        <motion.div 
          className="w-full md:w-1/2 flex justify-center"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.7, 
            delay: 0.3,
            type: "tween"
          }}
          whileHover={{ 
            rotate: 2,
            scale: 1.05 
          }}
        >
          <img 
            src="/img/meditation.jpg" 
            alt="Meditation Importance"
            className="max-w-full h-auto rounded-xl shadow-xl transform transition-transform duration-300"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MeditationImportance;